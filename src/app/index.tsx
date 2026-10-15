
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  interpolate,
  Extrapolation,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';
import UstMapSvg from '../../assets/images/ust.svg';
import BuildingLabels from '../components/BuildingLabels';
import CampusContext from '../components/CampusContext';
import CampusFadeOverlay from '../components/CampusFadeOverlay';
import BuildingDepthLayer from '../components/BuildingDepthLayer';
import EvacuationAreas from '../components/evacuationAreas';
import {
  calculateOutdoorRoute,
  calculateRouteFromConfirmedBuilding,
  NODES,
  gpsToMapPosition,
  type RouteResult,
} from '../components/navigationUtils';
import {
  detectBuilding,
} from '../components/buildingBoundaries';
import { styles } from '../components/home.styles';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

// =========================================================
// CONSTANTS
// =========================================================

const {
  height: SCREEN_HEIGHT,
  width: SCREEN_WIDTH,
} = Dimensions.get('window');

const MAP_SIZE = 1200;
// GPS SIMULATION — DEVELOPMENT ONLY
const GPS_SIMULATION_MODE = true;

const TEST_USER_POSITION = {
  x: 70,
  y:70.50,
};

// Temporary node-mapping mode.
// Set false when testing real campus GPS.
const BUILDING_MAPPING_PREVIEW = false; // Set true to restore node-mapping previews.

type PreviewBuilding =
  | 'AQ_DOME'
  | 'FRA_ANGELICO'
  | 'AQUINAS'
  | 'AQUINAS_2'
  | 'AQUINAS5'
  | 'DOMINIC'
  | 'MARTIN'
  | 'MARTIN2'
  | 'MARTIN3'
  | 'AQUINAS4';

const PREVIEW_BUILDINGS = {
  AQ_DOME: {
    name: 'AQ Dome',
    exitNodeId: 'AQD_N1',
    evacuationAreaId: 'EVAC_AREA_7',
  },
  FRA_ANGELICO: {
    name: 'Fra. Angelico',
    exitNodeId: 'AGL_N1',
    evacuationAreaId: 'EVAC_AREA_7',
  },
  AQUINAS: {
    name: 'Aquinas',
    exitNodeId: 'AQU_N5',
    evacuationAreaId: 'EVAC_AREA_7',
  },
  AQUINAS_2: {
    name: 'Aquinas 2',
    exitNodeId: 'AQU2_N2',
    evacuationAreaId: 'EVAC_AREA_7',
  },
  AQUINAS5: {
    name: 'Aquinas 5',
    exitNodeId: 'AQU5_N1',
    evacuationAreaId: 'EVAC_AREA_2',
  },
  DOMINIC: {
    name: 'Dominic',
    exitNodeId: 'DOM_N2',
    evacuationAreaId: 'EVAC_AREA_2',
  },
  MARTIN: {
    name: 'Martin',
    exitNodeId: 'MAR_N1',
    evacuationAreaId: 'EVAC_AREA_2',
  },
  MARTIN2: {
    name: 'Martin 2',
    exitNodeId: 'MAR2_N1',
    evacuationAreaId: 'EVAC_AREA_3',
  },
  MARTIN3: {
    name: 'Martin 3',
    exitNodeId: 'MAR3_N1',
    evacuationAreaId: 'EVAC_AREA_4',
  },
  AQUINAS4: {
    name: 'Aquinas 4',
    exitNodeId: 'AQU4_N1',
    evacuationAreaId: 'EVAC_AREA_5',
  },
} as const;

const PREVIEW_BUILDING_IDS = Object.keys(
  PREVIEW_BUILDINGS
) as PreviewBuilding[];

// Physical buildings shown to users. Existing section IDs remain unchanged
// in buildingBoundaries.ts and in all navigation/evacuation data files.
const PHYSICAL_BUILDINGS = [
  { id: 'AQ_DOME', name: 'AQ Dome', sections: ['AQ_DOME'] },
  { id: 'FRA_ANGELICO', name: 'Fra. Angelico Building', sections: ['FRA_ANGELICO'] },
  { id: 'AQUINAS', name: 'Aquinas Building', sections: ['AQUINAS', 'AQUINAS_2', 'AQUINAS4', 'AQUINAS5'] },
  { id: 'DOMINIC', name: 'Dominic Building', sections: ['DOMINIC'] },
  { id: 'MARTIN', name: 'Martin Building', sections: ['MARTIN', 'MARTIN2', 'MARTIN3'] },
] as const;

function getPhysicalBuilding(sectionId: string | null | undefined) {
  if (!sectionId) return null;
  return PHYSICAL_BUILDINGS.find(building =>
    (building.sections as readonly string[]).includes(sectionId)
  ) ?? null;
}


// The outside context is 1200x1200 while
// the source UST map is 800x800.
const CONTEXT_SCALE = 1200 / 800;
const CONTEXT_SIZE = MAP_SIZE * CONTEXT_SCALE;

const MIN_ZOOM = 0.22;
const MAX_ZOOM = 4;

const DEFAULT_VIEWPORT_WIDTH = SCREEN_WIDTH;
const DEFAULT_VIEWPORT_HEIGHT = SCREEN_HEIGHT;

const SPRING_CONFIG = {
  damping: 26,
  stiffness: 190,
  mass: 0.85,
  overshootClamping: true,
};

const MAX_TILT = 28;
const PERSPECTIVE = 2000;

const TILT_SPRING = {
  damping: 21,
  stiffness: 78,
  mass: 1.15,
  overshootClamping: true,
};

// =========================================================
// 2.5D PROJECTION HELPERS
// =========================================================

const screenToMapOffset = (
  x: number,
  y: number,
  zoom: number,
  degrees: number
) => {
  'worklet';

  const angle = (degrees * Math.PI) / 180;
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);

  const worldY =
    y /
    (zoom * (cosine + (y * sine) / PERSPECTIVE));

  const depth =
    1 - (zoom * worldY * sine) / PERSPECTIVE;

  return {
    x: (x * depth) / zoom,
    y: worldY,
  };
};

const mapToScreenOffset = (
  x: number,
  y: number,
  zoom: number,
  degrees: number
) => {
  'worklet';

  const angle = (degrees * Math.PI) / 180;
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);

  const depth = Math.max(
    0.15,
    1 - (zoom * y * sine) / PERSPECTIVE
  );

  return {
    x: (x * zoom) / depth,
    y: (y * zoom * cosine) / depth,
  };
};

// =========================================================
// HOME SCREEN
// =========================================================

export default function HomeScreen() {
  // =======================================================
  // VIEWPORT
  // =======================================================

  const [viewportSize, setViewportSize] = useState({
    width: DEFAULT_VIEWPORT_WIDTH,
    height: DEFAULT_VIEWPORT_HEIGHT,
  });

  // =======================================================
  // GPS POSITION
  // =======================================================

  const [userPos, setUserPos] = useState({
    x: 50,
    y: 50,
  });

  const [locationGranted, setLocationGranted] =
    useState(false);

  const [isInsideCampus, setIsInsideCampus] =
    useState(false);

  const [locationAccuracy, setLocationAccuracy] =
    useState<number | null>(null);

  const [isWaitingForLocation, setIsWaitingForLocation] =
    useState(true);

  // Building identification uses the latest GPS fix, not the initial (50, 50).
  const [hasValidGpsFix, setHasValidGpsFix] = useState(false);
  const [showBuildingConfirmation, setShowBuildingConfirmation] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [confirmedBuildingId, setConfirmedBuildingId] = useState<string | null>(null);

  const detectedBuilding =
    hasValidGpsFix && isInsideCampus ? detectBuilding(userPos) : null;
  const detectedPhysicalBuilding = getPhysicalBuilding(detectedBuilding?.id);

  // =======================================================
  // NAVIGATION
  // =======================================================

  const [activeRoute, setActiveRoute] =
    useState<RouteResult | null>(null);

  const [
    selectedEvacuationAreaId,
    setSelectedEvacuationAreaId,
  ] = useState<string | null>(null);

  const [bottomPanelHeight, setBottomPanelHeight] =
    useState(112);

  const [overviewMode, setOverviewMode] =
    useState(false);

  const [isMappingPreviewRoute, setIsMappingPreviewRoute] =
    useState(false);

  const [selectedPreviewBuilding, setSelectedPreviewBuilding] =
    useState<PreviewBuilding>('AQ_DOME');

  const [gpsHeading, setGpsHeading] =
    useState<number | null>(null);

  const mapTilt = useSharedValue(0);
  const [isTilted, setIsTilted] = useState(false);

  const hasUserMovedMap = useSharedValue(false);
  const initiallyCenteredOnGPS = useRef(false);

  // =======================================================
  // MAP PAN
  // =======================================================

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // =======================================================
  // MAP ZOOM
  // =======================================================

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchStartX = useSharedValue(0);
  const pinchStartY = useSharedValue(0);

  const pinchFocalX = useSharedValue(0);
  const pinchFocalY = useSharedValue(0);

  const pinchAnchorReady = useSharedValue(false);
  const pinchActive = useSharedValue(false);

  const buttonZoomActive = useSharedValue(false);
  const buttonZoomAnchorX = useSharedValue(0);
  const buttonZoomAnchorY = useSharedValue(0);

  const [zoomDisplay, setZoomDisplay] = useState(1);

  // =======================================================
  // ANIMATED ROUTE
  // =======================================================

  const routeDashOffset = useSharedValue(0);

  const animatedRouteProps = useAnimatedProps(() => ({
    strokeDashoffset: routeDashOffset.value,
  }));

  useEffect(() => {
    if (activeRoute?.success) {
      routeDashOffset.value = 0;

      routeDashOffset.value = withRepeat(
        withTiming(-4.4, {
          duration: 1800,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(routeDashOffset);
      routeDashOffset.value = 0;
    }

    return () => cancelAnimation(routeDashOffset);
  }, [activeRoute]);

  // =======================================================
  // SMOOTH USER MARKER
  // =======================================================

  const markerX = useSharedValue(50);
  const markerY = useSharedValue(50);

  // =======================================================
  // GPS TRACKING
  // =======================================================

  useEffect(() => {
    let subscription: Location.LocationSubscription | null =
      null;

    // Use simulated GPS during development
if (__DEV__ && GPS_SIMULATION_MODE) {
  setUserPos(TEST_USER_POSITION);
  setIsInsideCampus(true);
  setLocationGranted(true);
  setIsWaitingForLocation(false);
  setLocationAccuracy(null); // Simulated position: not a measured GPS accuracy.
  setHasValidGpsFix(true);

  markerX.value = TEST_USER_POSITION.x;
  markerY.value = TEST_USER_POSITION.y;

  return;
}  

      

    const startLocation = async () => {
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status !== 'granted') {
          setLocationGranted(false);
          setIsWaitingForLocation(false);
          return;
        }

        setLocationGranted(true);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          (location) => {
            const {
              latitude,
              longitude,
              accuracy,
              heading,
            } = location.coords;

            if (
              typeof heading === 'number' &&
              heading >= 0
            ) {
              setGpsHeading(heading);
            }

            setLocationAccuracy(accuracy ?? null);
            setIsWaitingForLocation(false);

            // GPS -> normalized SVG coordinates.
            const position = gpsToMapPosition(
              latitude,
              longitude
            );

            setIsInsideCampus(position.isInsideCampus);

            if (!position.isInsideCampus) {
              return;
            }

            const newPosition = {
              x: position.x,
              y: position.y,
            };

            setUserPos(newPosition);
            setHasValidGpsFix(true);

            // Center on valid campus GPS only once.
            // Future updates move the marker, not the map.
            if (!initiallyCenteredOnGPS.current) {
              initiallyCenteredOnGPS.current = true;

              if (!hasUserMovedMap.value) {
                const centerX =
                  (newPosition.x / 100) * MAP_SIZE -
                  MAP_SIZE / 2;

                const centerY =
                  (newPosition.y / 100) * MAP_SIZE -
                  MAP_SIZE / 2;

                const nextX = -centerX * scale.value;
                const nextY = -centerY * scale.value;

                translateX.value = withTiming(
                  nextX,
                  { duration: 420 }
                );

                translateY.value = withTiming(
                  nextY,
                  { duration: 420 }
                );

                savedTranslateX.value = nextX;
                savedTranslateY.value = nextY;
              }
            }

            markerX.value = withTiming(
              newPosition.x,
              { duration: 600 }
            );

            markerY.value = withTiming(
              newPosition.y,
              { duration: 600 }
            );
          }
        );
      } catch (error) {
        console.log('Location error:', error);

        setLocationGranted(false);
        setIsWaitingForLocation(false);
      }
    };

    startLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  // =======================================================
  // MAP BOUNDS
  // =======================================================

  const getPanBounds = (currentScale: number) => {
    'worklet';

    const scaledContextSize =
      CONTEXT_SIZE * currentScale;

    return {
      x: Math.max(
        0,
        (scaledContextSize - viewportSize.width) / 2
      ),
      y: Math.max(
        0,
        (scaledContextSize - viewportSize.height) / 2
      ),
    };
  };

  const clampMapTranslation = (
    proposedX: number,
    proposedY: number,
    currentScale: number
  ) => {
    'worklet';

    const limits = getPanBounds(currentScale);

    return {
      x: Math.max(
        -limits.x,
        Math.min(limits.x, proposedX)
      ),
      y: Math.max(
        -limits.y,
        Math.min(limits.y, proposedY)
      ),
    };
  };

  // =======================================================
  // FOCUS CAMERA ON MAP POINT
  // =======================================================

  const focusMapPoint = (
    point: { x: number; y: number }
  ) => {
    buttonZoomActive.value = false;

    cancelAnimation(scale);

    const targetScale = 1.45;

    const worldX =
      (point.x / 100) * MAP_SIZE - MAP_SIZE / 2;

    const worldY =
      (point.y / 100) * MAP_SIZE - MAP_SIZE / 2;

    const projected = mapToScreenOffset(
      worldX,
      worldY,
      targetScale,
      24
    );

    const next = clampMapTranslation(
      -projected.x,
      -projected.y,
      targetScale
    );

    translateX.value = withSpring(
      next.x,
      SPRING_CONFIG
    );

    translateY.value = withSpring(
      next.y,
      SPRING_CONFIG
    );

    scale.value = withSpring(
      targetScale,
      SPRING_CONFIG
    );

    savedTranslateX.value = next.x;
    savedTranslateY.value = next.y;
    savedScale.value = targetScale;

    setZoomDisplay(targetScale);
  };

  // =======================================================
  // CALCULATE EVACUATION ROUTE
  // =======================================================

  const handleCalculateRoute = () => {
    // Preview uses a selected mapped building exit.
    // This is not verified live emergency guidance.
    if (BUILDING_MAPPING_PREVIEW) {
      const building =
        PREVIEW_BUILDINGS[selectedPreviewBuilding];

      const result = calculateOutdoorRoute(
        building.exitNodeId,
        building.evacuationAreaId
      );

      if (!result.success) {
        setActiveRoute(null);
        setSelectedEvacuationAreaId(null);

        Alert.alert(
          'Mapping Preview Unavailable',
          result.message
        );

        return;
      }

      setActiveRoute(result);
      setIsMappingPreviewRoute(true);
      setOverviewMode(false);

      mapTilt.value = withSpring(24, TILT_SPRING);
      setIsTilted(true);

      setSelectedEvacuationAreaId(
        result.evacuationAreaId
      );

      const exit = NODES[building.exitNodeId];

      if (exit) {
        focusMapPoint(exit);
      }

      return;
    }

    if (isWaitingForLocation) {
      Alert.alert(
        'Locating Device',
        'Please wait while the GPS location is being determined.'
      );
      return;
    }

    if (!locationGranted) {
      Alert.alert(
        'Location Required',
        'Please allow location access first.'
      );
      return;
    }

    if (!isInsideCampus) {
      Alert.alert(
        'Outside Campus',
        'You must be inside the mapped campus area to calculate an evacuation route.'
      );
      return;
    }

    // Step 1: confirm the current building before choosing an exit.
    // Do not run the old campus-wide nearest-exit selection here: it may
    // choose an exit belonging to a different building.
    const probableBuilding = getPhysicalBuilding(detectBuilding(userPos)?.id);
    setSelectedBuildingId(probableBuilding?.id ?? confirmedBuildingId);
    setShowBuildingConfirmation(true);
  };

  // =======================================================
  // CONFIRM BUILDING (GPS DETECTION + MANUAL CORRECTION)
  // =======================================================

  const handleConfirmBuilding = () => {
    if (!selectedBuildingId) {
      Alert.alert('Select a building', 'Please select your current building.');
      return;
    }

    const chosen = PHYSICAL_BUILDINGS.find(
      building => building.id === selectedBuildingId
    );
    if (!chosen) return;

    // The confirmed physical building limits exit selection to its mapped exits.
    // The navigation helper selects the nearest exit and runs outdoor Dijkstra.
    const result = calculateRouteFromConfirmedBuilding(userPos, chosen.id);

    if (!result.success) {
      setActiveRoute(null);
      setSelectedEvacuationAreaId(null);
      Alert.alert('Route unavailable', result.message);
      return;
    }

    setConfirmedBuildingId(chosen.id);
    setShowBuildingConfirmation(false);
    setActiveRoute(result);
    setIsMappingPreviewRoute(false);
    setOverviewMode(false);
    setSelectedEvacuationAreaId(result.evacuationAreaId);

    mapTilt.value = withSpring(24, TILT_SPRING);
    setIsTilted(true);

    // Keep the user's estimated position in view; the outdoor polyline begins
    // at the selected building exit, not at an unverified indoor connection.
    focusMapPoint(userPos);
  };

  // =======================================================
  // STOP NAVIGATION
  // =======================================================

  const handleStopRoute = () => {
    setActiveRoute(null);
    setIsMappingPreviewRoute(false);
    setOverviewMode(false);

    mapTilt.value = withSpring(0, TILT_SPRING);
    setIsTilted(false);

    setSelectedEvacuationAreaId(null);
  };

  // =======================================================
  // ONE-FINGER PAN
  // =======================================================

  const panGesture = Gesture.Pan()
    .minDistance(5)
    .maxPointers(1)
    .onStart(() => {
      if (pinchActive.value) return;

      hasUserMovedMap.value = true;
      buttonZoomActive.value = false;

      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);

      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (
        pinchActive.value ||
        event.numberOfPointers !== 1
      ) {
        return;
      }

      const next = clampMapTranslation(
        savedTranslateX.value + event.translationX,
        savedTranslateY.value + event.translationY,
        scale.value
      );

      translateX.value = next.x;
      translateY.value = next.y;
    })
    .onEnd((event) => {
      if (
        pinchActive.value ||
        event.numberOfPointers > 1
      ) {
        return;
      }

      const limits = getPanBounds(scale.value);

      if (limits.x > 0) {
        translateX.value = withDecay({
          velocity: event.velocityX * 0.55,
          deceleration: 0.993,
          clamp: [-limits.x, limits.x],
        });
      }

      if (limits.y > 0) {
        translateY.value = withDecay({
          velocity: event.velocityY * 0.55,
          deceleration: 0.993,
          clamp: [-limits.y, limits.y],
        });
      }
    });

  // =======================================================
  // TWO-FINGER PINCH ZOOM
  // =======================================================

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      hasUserMovedMap.value = true;
      pinchActive.value = true;
      buttonZoomActive.value = false;

      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(mapTilt);

      savedScale.value = scale.value;
      pinchAnchorReady.value = false;

      const fx = event.focalX;
      const fy = event.focalY;

      if (
        Number.isFinite(fx) &&
        Number.isFinite(fy) &&
        !(fx === 0 && fy === 0)
      ) {
        pinchFocalX.value =
          fx - viewportSize.width / 2;

        pinchFocalY.value =
          fy - viewportSize.height / 2;

        const anchor = screenToMapOffset(
          pinchFocalX.value - translateX.value,
          pinchFocalY.value - translateY.value,
          scale.value,
          mapTilt.value
        );

        pinchStartX.value = anchor.x;
        pinchStartY.value = anchor.y;
        pinchAnchorReady.value = true;
      }
    })
    .onUpdate((event) => {
      if (!pinchAnchorReady.value) {
        if (
          !Number.isFinite(event.focalX) ||
          !Number.isFinite(event.focalY) ||
          (
            event.focalX === 0 &&
            event.focalY === 0
          )
        ) {
          return;
        }

        pinchFocalX.value =
          event.focalX - viewportSize.width / 2;

        pinchFocalY.value =
          event.focalY - viewportSize.height / 2;

        const anchor = screenToMapOffset(
          pinchFocalX.value - translateX.value,
          pinchFocalY.value - translateY.value,
          scale.value,
          mapTilt.value
        );

        pinchStartX.value = anchor.x;
        pinchStartY.value = anchor.y;

        savedScale.value =
          scale.value /
          Math.pow(Math.max(event.scale, 0.01), 0.93);

        pinchAnchorReady.value = true;
      }

      const nextScale = Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          savedScale.value *
            Math.pow(
              Math.max(event.scale, 0.01),
              0.93
            )
        )
      );

      const anchorScreen = mapToScreenOffset(
        pinchStartX.value,
        pinchStartY.value,
        nextScale,
        mapTilt.value
      );

      const next = clampMapTranslation(
        pinchFocalX.value - anchorScreen.x,
        pinchFocalY.value - anchorScreen.y,
        nextScale
      );

      translateX.value = next.x;
      translateY.value = next.y;
      scale.value = nextScale;
    })
    .onFinalize(() => {
      pinchActive.value = false;
      pinchAnchorReady.value = false;

      savedScale.value = scale.value;

      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      runOnJS(setZoomDisplay)(
        Math.round(scale.value * 100) / 100
      );
    });

  const mapGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture
  );

  // =======================================================
  // RECENTER MAP
  // =======================================================

  const handleRecenter = () => {
    buttonZoomActive.value = false;
    cancelAnimation(scale);

    const targetScale = 1;

    const worldX = isInsideCampus
      ? (userPos.x / 100) * MAP_SIZE - MAP_SIZE / 2
      : 0;

    const worldY = isInsideCampus
      ? (userPos.y / 100) * MAP_SIZE - MAP_SIZE / 2
      : 0;

    const projected = mapToScreenOffset(
      worldX,
      worldY,
      targetScale,
      mapTilt.value
    );

    const next = clampMapTranslation(
      -projected.x,
      -projected.y,
      targetScale
    );

    translateX.value = withSpring(
      next.x,
      SPRING_CONFIG
    );

    translateY.value = withSpring(
      next.y,
      SPRING_CONFIG
    );

    scale.value = withSpring(
      targetScale,
      SPRING_CONFIG
    );

    savedTranslateX.value = next.x;
    savedTranslateY.value = next.y;
    savedScale.value = targetScale;

    setZoomDisplay(targetScale);
  };

  // =======================================================
  // FIT CAMPUS
  // =======================================================

  const handleFitCampus = () => {
    buttonZoomActive.value = false;
    cancelAnimation(scale);

    const horizontalScale =
      viewportSize.width / MAP_SIZE;

    const verticalScale =
      viewportSize.height / MAP_SIZE;

    const targetScale = Math.max(
      MIN_ZOOM,
      Math.min(
        MAX_ZOOM,
        Math.min(
          horizontalScale,
          verticalScale
        ) * 0.9
      )
    );

    translateX.value = withSpring(
      0,
      SPRING_CONFIG
    );

    translateY.value = withSpring(
      0,
      SPRING_CONFIG
    );

    scale.value = withSpring(
      targetScale,
      SPRING_CONFIG
    );

    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    savedScale.value = targetScale;

    setZoomDisplay(
      Math.round(targetScale * 100) / 100
    );
  };

  // =======================================================
  // SMOOTH BUTTON ZOOM
  // =======================================================

  useAnimatedReaction(
    () => scale.value,
    (currentScale) => {
      if (!buttonZoomActive.value) {
        return;
      }

      const projected = mapToScreenOffset(
        buttonZoomAnchorX.value,
        buttonZoomAnchorY.value,
        currentScale,
        mapTilt.value
      );

      const next = clampMapTranslation(
        -projected.x,
        -projected.y,
        currentScale
      );

      translateX.value = next.x;
      translateY.value = next.y;
    }
  );

  const zoomAroundViewportCenter = (
    requestedScale: number
  ) => {
    const nextScale = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, requestedScale)
    );

    if (
      Math.abs(nextScale - scale.value) < 0.001
    ) {
      return;
    }

    hasUserMovedMap.value = true;

    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);

    buttonZoomActive.value = false;

    const anchor = screenToMapOffset(
      -translateX.value,
      -translateY.value,
      scale.value,
      mapTilt.value
    );

    buttonZoomAnchorX.value = anchor.x;
    buttonZoomAnchorY.value = anchor.y;

    buttonZoomActive.value = true;

    scale.value = withTiming(
      nextScale,
      {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (!finished) return;

        const projected = mapToScreenOffset(
          buttonZoomAnchorX.value,
          buttonZoomAnchorY.value,
          scale.value,
          mapTilt.value
        );

        const next = clampMapTranslation(
          -projected.x,
          -projected.y,
          scale.value
        );

        translateX.value = next.x;
        translateY.value = next.y;

        savedTranslateX.value = next.x;
        savedTranslateY.value = next.y;
        savedScale.value = scale.value;

        buttonZoomActive.value = false;

        runOnJS(setZoomDisplay)(
          Math.round(scale.value * 100) / 100
        );
      }
    );
  };

  const handleZoomIn = () =>
    zoomAroundViewportCenter(
      scale.value * 1.28
    );

  const handleZoomOut = () =>
    zoomAroundViewportCenter(
      scale.value / 1.28
    );

  // =======================================================
  // TOGGLE 2D / 3D
  // =======================================================

  const handleToggleTilt = () => {
    buttonZoomActive.value = false;
    cancelAnimation(scale);

    const nextTilted = !isTilted;
    const nextTilt = nextTilted ? 24 : 0;

    const anchor = screenToMapOffset(
      -translateX.value,
      -translateY.value,
      scale.value,
      mapTilt.value
    );

    const projected = mapToScreenOffset(
      anchor.x,
      anchor.y,
      scale.value,
      nextTilt
    );

    const next = clampMapTranslation(
      -projected.x,
      -projected.y,
      scale.value
    );

    cancelAnimation(mapTilt);
    cancelAnimation(translateX);
    cancelAnimation(translateY);

    mapTilt.value = withSpring(
      nextTilt,
      TILT_SPRING
    );

    translateX.value = withSpring(
      next.x,
      TILT_SPRING
    );

    translateY.value = withSpring(
      next.y,
      TILT_SPRING
    );

    savedTranslateX.value = next.x;
    savedTranslateY.value = next.y;

    setIsTilted(nextTilted);
  };

  // =======================================================
  // ANIMATED MAP STYLES
  // =======================================================

  const animatedPanStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX:
            viewportSize.width / 2 -
            MAP_SIZE / 2 +
            translateX.value,
        },
        {
          translateY:
            viewportSize.height / 2 -
            MAP_SIZE / 2 +
            translateY.value,
        },
      ],
    }),
    [viewportSize]
  );

  const animatedZoomStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: PERSPECTIVE },
        { scale: scale.value },
        { rotateX: `${mapTilt.value}deg` },
      ],
    })
  );

  const animatedDepthStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        mapTilt.value,
        [0, 16, MAX_TILT],
        [0, 0.8, 1],
        Extrapolation.CLAMP
      ),
    })
  );

  const animatedMarkerStyle = useAnimatedStyle(
    () => ({
      left: (markerX.value / 100) * MAP_SIZE,
      top: (markerY.value / 100) * MAP_SIZE,
    })
  );

  // =======================================================
  // ROUTE OVERVIEW
  // =======================================================

  const showRouteOverview = () => {
    setOverviewMode((current) => {
      if (!current) {
        mapTilt.value = withSpring(
          0,
          TILT_SPRING
        );

        setIsTilted(false);
        handleFitCampus();
      } else {
        mapTilt.value = withSpring(
          24,
          TILT_SPRING
        );

        setIsTilted(true);

        const startPoint =
          isMappingPreviewRoute &&
          activeRoute?.success
            ? NODES[activeRoute.startNodeId]
            : userPos;

        if (startPoint) {
          focusMapPoint(startPoint);
        }
      }

      return !current;
    });
  };

  // =======================================================
  // GPS STATUS
  // =======================================================

  const getStatus = () => {
    if (isWaitingForLocation) {
      return {
        text: 'Getting location...',
        color: '#F59E0B',
      };
    }

    if (!locationGranted) {
      return {
        text: 'Location required',
        color: '#EF4444',
      };
    }

    if (!isInsideCampus) {
      return {
        text: 'Outside campus',
        color: '#F59E0B',
      };
    }

    return {
      text: __DEV__ && GPS_SIMULATION_MODE ? 'Simulated location' : 'Live location',
      color: '#22C55E',
    };
  };

  const status = getStatus();

  // =======================================================
  // UI
  // =======================================================

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        {/* =============================================
            MAP VIEWPORT
        ============================================= */}

        <View
          style={styles.mapViewport}
          onLayout={(event) => {
            const { width, height } =
              event.nativeEvent.layout;

            setViewportSize((previous) =>
              Math.abs(previous.width - width) > 1 ||
              Math.abs(previous.height - height) > 1
                ? { width, height }
                : previous
            );
          }}
        >
          <GestureDetector gesture={mapGesture}>
            <View style={styles.gestureArea}>
              <Animated.View
                style={[
                  styles.mapPanLayer,
                  animatedPanStyle,
                ]}
              >
                <Animated.View
                  style={[
                    styles.mapZoomLayer,
                    animatedZoomStyle,
                  ]}
                >
                  {/* OUTSIDE CAMPUS CONTEXT */}
                  <CampusContext mapSize={MAP_SIZE} />

                  {/* BASE CAMPUS SVG */}
                  <UstMapSvg
                    width={MAP_SIZE}
                    height={MAP_SIZE}
                  />

                  {/* 2.5D BUILDING DEPTH */}
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: MAP_SIZE,
                        height: MAP_SIZE,
                      },
                      animatedDepthStyle,
                    ]}
                  >
                    <BuildingDepthLayer
                      mapSize={MAP_SIZE}
                    />
                  </Animated.View>

                  {/* CAMPUS FADE */}
                  <CampusFadeOverlay
                    mapSize={MAP_SIZE}
                  />

                  {/* EVACUATION AREAS */}
                  <EvacuationAreas
                    mapSize={MAP_SIZE}
                    activeAreaId={
                      selectedEvacuationAreaId
                    }
                  />

                  {/* BUILDING LABELS */}
                  <BuildingLabels
                    mapSize={MAP_SIZE}
                    zoomLevel={zoomDisplay}
                  />

                  {/* =====================================
                      CALCULATED ROUTE
                  ===================================== */}

                  {activeRoute &&
                    activeRoute.success && (
                      <Svg
                        width={MAP_SIZE}
                        height={MAP_SIZE}
                        viewBox="0 0 100 100"
                        style={styles.routeOverlay}
                        pointerEvents="none"
                      >
                        {/* WHITE OUTLINE */}
                        <Polyline
                          points={
                            activeRoute.pathString
                          }
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="0.82"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* BLUE ROUTE */}
                        <Polyline
                          points={
                            activeRoute.pathString
                          }
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="0.44"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* MOVING HIGHLIGHT */}
                        <AnimatedPolyline
                          points={
                            activeRoute.pathString
                          }
                          fill="none"
                          stroke="#93C5FD"
                          strokeWidth="0.23"
                          strokeDasharray="1.1 1.1"
                          animatedProps={
                            animatedRouteProps
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}

                  {/* =====================================
                      USER GPS MARKER
                  ===================================== */}

                  {isInsideCampus && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.userMarker,
                        animatedMarkerStyle,
                      ]}
                    >
                      <View
                        style={styles.accuracyGlow}
                      />

                      <View
                        style={styles.userArrowBadge}
                      >
                        <MaterialCommunityIcons
                          name="navigation"
                          size={22}
                          color="#FFFFFF"
                          style={{
                            transform: [
                              {
                                rotate:
                                  `${gpsHeading ?? 0}deg`,
                              },
                            ],
                          }}
                        />
                      </View>
                    </Animated.View>
                  )}
                </Animated.View>
              </Animated.View>
            </View>
          </GestureDetector>
        </View>

        {/* =============================================
            ROUTE INSTRUCTION BANNER
        ============================================= */}

        {activeRoute?.success && (
          <View
            style={styles.navInstruction}
            pointerEvents="box-none"
          >
            <View
              style={styles.navInstructionLeft}
            >
              <View
                style={styles.navDirectionIcon}
              >
                <MaterialCommunityIcons
                  name="routes"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  style={styles.navInstructionTitle}
                  numberOfLines={1}
                >
                  {isMappingPreviewRoute
                    ? `${PREVIEW_BUILDINGS[selectedPreviewBuilding].name} mapping preview`
                    : 'Follow the blue route'}
                </Text>

                <Text
                  style={styles.navInstructionSub}
                  numberOfLines={1}
                >
                  {isMappingPreviewRoute
                    ? 'NOT LIVE · '
                    : 'To '}
                  {activeRoute.evacuationAreaName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                overviewMode
                  ? 'Return to navigation view'
                  : 'Show route overview'
              }
              onPress={showRouteOverview}
              style={styles.navOverviewButton}
              hitSlop={8}
            >
              <Text
                style={styles.navInstructionDistance}
              >
                {Math.round(activeRoute.distance)} m
              </Text>

              <MaterialCommunityIcons
                name={
                  overviewMode
                    ? 'crosshairs-gps'
                    : 'fit-to-screen-outline'
                }
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* =============================================
            MAP CONTROLS
        ============================================= */}

        <View
          style={[
            styles.mapControls,
            {
              bottom: bottomPanelHeight + 24,
            },
          ]}
        >
          {/* ZOOM IN */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomIn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
          >
            <MaterialCommunityIcons
              name="plus"
              size={21}
              color="#334155"
            />
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          {/* ZOOM INDICATOR */}
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomIndicatorText}>
              {zoomDisplay.toFixed(1)}×
            </Text>
          </View>

          <View style={styles.controlDivider} />

          {/* ZOOM OUT */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomOut}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
          >
            <MaterialCommunityIcons
              name="minus"
              size={21}
              color="#334155"
            />
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          {/* RECENTER */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRecenter}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Recenter map"
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color="#2563EB"
            />
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          {/* 2D / 3D */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleTilt}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={
              isTilted
                ? 'Switch to flat 2D map'
                : 'Switch to tilted 3D map'
            }
          >
            <Text
              style={{
                color: isTilted
                  ? '#2563EB'
                  : '#334155',
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {isTilted ? '2D' : '3D'}
            </Text>
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          {/* FIT CAMPUS */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFitCampus}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Fit campus to screen"
          >
            <MaterialCommunityIcons
              name="fit-to-screen-outline"
              size={20}
              color="#334155"
            />
          </TouchableOpacity>
        </View>

        {/* =============================================
            BOTTOM NAVIGATION PANEL
        ============================================= */}

        <View
          style={styles.bottomPanel}
          onLayout={(event) => {
            const height =
              event.nativeEvent.layout.height;

            setBottomPanelHeight((previous) =>
              Math.abs(previous - height) > 1
                ? height
                : previous
            );
          }}
        >
          {activeRoute?.success ? (
            /* =====================================
               ACTIVE ROUTE INFORMATION
            ===================================== */

            <View style={styles.routeInfoRow}>
              <View style={styles.routeIcon}>
                <MaterialCommunityIcons
                  name="flag-checkered"
                  size={19}
                  color="#16834A"
                />
              </View>

              <View
                style={styles.routeTextContainer}
              >
                <Text style={styles.routeLabel}>
                  EVACUATION DESTINATION
                </Text>

                <Text
                  style={styles.routeTitle}
                  numberOfLines={1}
                >
                  {activeRoute.evacuationAreaName}
                </Text>

                <Text
                  style={styles.routeDistance}
                >
                  {isMappingPreviewRoute
                    ? 'MAPPING PREVIEW · NOT LIVE'
                    : __DEV__ && GPS_SIMULATION_MODE
                    ? 'SIMULATED POSITION · NOT LIVE'
                    : 'Mapped route'}
                  {' · Approx. '}
                  {Math.round(activeRoute.distance)}
                  {' m'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopRoute}
                accessibilityRole="button"
                accessibilityLabel="Stop navigation"
                hitSlop={5}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={19}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* =================================
                  LOCATION STATUS
              ================================= */}

              <View
                style={styles.compactLocationRow}
              >
                <View
                  style={styles.compactLocationIcon}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={18}
                    color="#2563EB"
                  />
                </View>

                <View
                  style={styles.compactLocationInfo}
                >
                  <Text
                    style={
                      styles.compactLocationTitle
                    }
                  >
                    {isInsideCampus
                      ? 'Live Location'
                      : 'Location unavailable'}
                  </Text>

                  <Text
                    style={
                      styles.compactLocationSubtext
                    }
                  >
                    {confirmedBuildingId
                        ? `Confirmed: ${getPhysicalBuilding(confirmedBuildingId)?.name ?? confirmedBuildingId}`
                        : detectedPhysicalBuilding
                        ? `Likely: ${detectedPhysicalBuilding.name}`
                        : locationAccuracy !== null
                        ? `GPS accuracy ±${Math.round(locationAccuracy)} m`
                        : 'Waiting for GPS...'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.liveIndicator,
                    {
                      backgroundColor: status.color,
                    },
                  ]}
                />
              </View>

              {/* =================================
                  BUILDING PREVIEW SELECTOR
              ================================= */}

              {BUILDING_MAPPING_PREVIEW && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {PREVIEW_BUILDING_IDS.map(
                    (buildingId) => {
                      const selected =
                        selectedPreviewBuilding ===
                        buildingId;

                      return (
                        <TouchableOpacity
                          key={buildingId}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected,
                          }}
                          accessibilityLabel={
                            `Select ${PREVIEW_BUILDINGS[buildingId].name} for mapping preview`
                          }
                          onPress={() =>
                            setSelectedPreviewBuilding(
                              buildingId
                            )
                          }
                          style={{
                            flexGrow: 1,
                            flexBasis: '46%',
                            paddingVertical: 10,
                            paddingHorizontal: 6,
                            borderRadius: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: selected
                              ? '#2563EB'
                              : '#CBD5E1',
                            backgroundColor: selected
                              ? '#DBEAFE'
                              : '#F8FAFC',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '700',
                              color: selected
                                ? '#1D4ED8'
                                : '#475569',
                            }}
                          >
                            {
                              PREVIEW_BUILDINGS[
                                buildingId
                              ].name
                            }
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              )}

              {/* =================================
                  CALCULATE ROUTE BUTTON
              ================================= */}

              <TouchableOpacity
                style={styles.routeButton}
                activeOpacity={0.85}
                onPress={handleCalculateRoute}
                accessibilityRole="button"
                accessibilityLabel="Find evacuation destination"
              >
                <MaterialCommunityIcons
                  name="directions-fork"
                  size={17}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.routeButtonText}
                >
                  {BUILDING_MAPPING_PREVIEW
                    ? `PREVIEW ROUTE → AREA ${PREVIEW_BUILDINGS[selectedPreviewBuilding].evacuationAreaId.split('_').pop()}`
                    : 'FIND EVACUATION DESTINATION'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* BUILDING CONFIRMATION — LIVE GPS MODE ONLY */}
        <Modal
          visible={showBuildingConfirmation}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBuildingConfirmation(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,23,42,0.55)',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 20,
                maxHeight: '80%',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                Confirm your building
              </Text>
              <Text style={{ color: '#64748B', marginTop: 8, marginBottom: 12 }}>
                {detectedPhysicalBuilding
                  ? `GPS suggests ${detectedPhysicalBuilding.name}. Confirm or choose the correct building.`
                  : 'GPS could not identify a building. Please choose your current building.'}
              </Text>
              <ScrollView style={{ flexGrow: 0 }} nestedScrollEnabled>
                {PHYSICAL_BUILDINGS.map(building => {
                  const selected = selectedBuildingId === building.id;
                  return (
                    <TouchableOpacity
                      key={building.id}
                      onPress={() => setSelectedBuildingId(building.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: selected ? '#2563EB' : '#E2E8F0',
                        backgroundColor: selected ? '#EFF6FF' : '#FFFFFF',
                        marginBottom: 7,
                      }}
                    >
                      <Text style={{ color: selected ? '#1D4ED8' : '#334155', fontWeight: selected ? '700' : '500' }}>
                        {building.name}{selected ? '  ✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={handleConfirmBuilding}
                style={{ backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm building</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowBuildingConfirmation(false)}
                style={{ alignItems: 'center', padding: 12 }}
              >
                <Text style={{ color: '#64748B' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}
