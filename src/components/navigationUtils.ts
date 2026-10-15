
/**
 * TomaSafe navigation — one campus-wide Dijkstra graph.
 * All routing coordinates are normalized to 0–100.
 * Node Builder exports use 800×800 SVG pixels
 * and are normalized in campusGraphData.ts.
 *
 * This graph is a mapping prototype,
 * NOT verified emergency guidance.
 */

import {
  CAMPUS_NODES,
  PATHWAY_EDGES,
  SOURCE_MAP_SIZE,
} from './campusGraphData';

import {
  EVACUATION_AREAS,
  type EvacuationArea,
} from './evacuationData';

// =====================================
// TYPES
// =====================================

export type MapPoint = {
  x: number;
  y: number;
};

export type Node = MapPoint & {
  id: string;
  name: string;
  type:
    | 'exit'
    | 'hallway'
    | 'turn'
    | 'intersection'
    | 'junction'
    | 'evac-access';
  isExit?: boolean;
  areaId?: string;
};

export type Edge = {
  from: string;
  to: string;
};

export type RouteResult =
  | {
      success: true;
      startNodeId: string;
      exitNodeId: string;
      exitName: string;
      evacuationAreaId: string;
      evacuationAreaName: string;
      destinationNodeId: string;
      distance: number;
      path: string[];
      points: MapPoint[];
      pathString: string;
    }
  | {
      success: false;
      message: string;
    };

// =====================================
// CAMPUS GPS LIMITS
// =====================================

export const CAMPUS_LIMITS = {
  north: 13.165857,
  south: 13.162422,
  west: 123.747844,
  east: 123.751555,
};

// =====================================
// CAMPUS GRAPH
// =====================================

export const NODES: Record<string, Node> =
  CAMPUS_NODES;

export const EDGES: Edge[] =
  PATHWAY_EDGES;

export const EVACUATION_TARGETS: Record<
  string,
  {
    id: string;
    name: string;
    accessNodeIds: string[];
  }
> = Object.fromEntries(
  EVACUATION_AREAS.map(area => [
    area.id,
    {
      id: area.id,
      name: area.name,
      accessNodeIds: getAreaAccessNodeIds(area),
    },
  ])
);

// =====================================
// GPS TO MAP POSITION
// =====================================

export function gpsToMapPosition(
  latitude: number,
  longitude: number
) {
  const x =
    ((longitude - CAMPUS_LIMITS.west) /
      (CAMPUS_LIMITS.east - CAMPUS_LIMITS.west)) *
    100;

  const y =
    ((CAMPUS_LIMITS.north - latitude) /
      (CAMPUS_LIMITS.north - CAMPUS_LIMITS.south)) *
    100;

  return {
    x,
    y,
    isInsideCampus:
      x >= 0 &&
      x <= 100 &&
      y >= 0 &&
      y <= 100,
  };
}

// =====================================
// DISTANCE HELPERS
// =====================================

export function getMapDistance(
  a: MapPoint,
  b: MapPoint
) {
  return Math.hypot(
    b.x - a.x,
    b.y - a.y
  );
}

function mapPositionToGps(p: MapPoint) {
  return {
    latitude:
      CAMPUS_LIMITS.north -
      (p.y / 100) *
        (CAMPUS_LIMITS.north - CAMPUS_LIMITS.south),

    longitude:
      CAMPUS_LIMITS.west +
      (p.x / 100) *
        (CAMPUS_LIMITS.east - CAMPUS_LIMITS.west),
  };
}

export function getDistanceInMeters(
  a: MapPoint,
  b: MapPoint
) {
  const p = mapPositionToGps(a);
  const q = mapPositionToGps(b);

  const rad = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const dLat = rad(q.latitude - p.latitude);
  const dLon = rad(q.longitude - p.longitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(p.latitude)) *
      Math.cos(rad(q.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.atan2(
      Math.sqrt(h),
      Math.sqrt(Math.max(0, 1 - h))
    )
  );
}

// =====================================
// FIND NEAREST GRAPH NODE
// =====================================

export function findNearestNode(
  point: MapPoint
): string | null {
  let best: string | null = null;
  let distance = Infinity;

  for (const [id, node] of Object.entries(NODES)) {
    const d = getDistanceInMeters(
      point,
      node
    );

    if (d < distance) {
      distance = d;
      best = id;
    }
  }

  return best;
}

// =====================================
// FIND NEAREST EXIT
// =====================================

export function findNearestExitNode(
  point: MapPoint
): string | null {
  let best: string | null = null;
  let distance = Infinity;

  for (const [id, node] of Object.entries(NODES)) {
    if (!node.isExit) continue;

    const d = getDistanceInMeters(
      point,
      node
    );

    if (d < distance) {
      distance = d;
      best = id;
    }
  }

  return best;
}

// =====================================
// POINT INSIDE EVACUATION POLYGON
// =====================================

export function pointInsidePolygon(
  point: MapPoint,
  polygon: MapPoint[]
): boolean {
  let inside = false;

  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const a = polygon[i];
    const b = polygon[j];

    const cross =
      (point.x - a.x) * (b.y - a.y) -
      (point.y - a.y) * (b.x - a.x);

    if (
      Math.abs(cross) < 1e-7 &&
      point.x >= Math.min(a.x, b.x) - 1e-7 &&
      point.x <= Math.max(a.x, b.x) + 1e-7 &&
      point.y >= Math.min(a.y, b.y) - 1e-7 &&
      point.y <= Math.max(a.y, b.y) + 1e-7
    ) {
      return true;
    }

    if (
      (a.y > point.y) !==
      (b.y > point.y)
    ) {
      const x =
        ((b.x - a.x) * (point.y - a.y)) /
          (b.y - a.y) +
        a.x;

      if (point.x < x) {
        inside = !inside;
      }
    }
  }

  return inside;
}

// =====================================
// EVACUATION AREA ACCESS NODES
// =====================================

export function getAreaAccessNodeIds(
  area: EvacuationArea
): string[] {
  return Object.keys(NODES).filter(id => {
    const node = NODES[id];

    return (
      node.type === 'evac-access' &&
      (!node.areaId || node.areaId === area.id) &&
      pointInsidePolygon(
        node,
        area.polygon
      )
    );
  });
}

// =====================================
// POLYGON BOUNDARY INTERSECTION
// =====================================

function boundaryIntersection(
  a: MapPoint,
  b: MapPoint,
  polygon: MapPoint[]
): MapPoint | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  let closestT = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];

    const sx = q.x - p.x;
    const sy = q.y - p.y;

    const determinant = dx * sy - dy * sx;

    if (Math.abs(determinant) < 1e-10) {
      continue;
    }

    const t =
      ((p.x - a.x) * sy -
        (p.y - a.y) * sx) /
      determinant;

    const u =
      ((p.x - a.x) * dy -
        (p.y - a.y) * dx) /
      determinant;

    if (
      t >= -1e-8 &&
      t <= 1 + 1e-8 &&
      u >= -1e-8 &&
      u <= 1 + 1e-8 &&
      t < closestT
    ) {
      closestT = Math.max(0, t);
    }
  }

  return Number.isFinite(closestT)
    ? {
        x: a.x + dx * closestT,
        y: a.y + dy * closestT,
      }
    : null;
}

// =====================================
// TRIM ROUTE AT EVACUATION BOUNDARY
// =====================================

export function trimRouteAtAreaBoundary(
  points: MapPoint[],
  polygon: MapPoint[]
): MapPoint[] {
  if (!points.length) return [];

  if (pointInsidePolygon(points[0], polygon)) {
    return [points[0]];
  }

  const result: MapPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];

    const cross = boundaryIntersection(
      a,
      b,
      polygon
    );

    if (cross) {
      result.push(cross);
      return result;
    }

    if (pointInsidePolygon(b, polygon)) {
      return result;
    }

    result.push(b);
  }

  return result;
}

// =====================================
// DIJKSTRA ALGORITHM
// =====================================

type GraphPath = {
  path: string[];
  distance: number;
};

function dijkstra(
  startId: string,
  endId: string
): GraphPath | null {
  if (!NODES[startId] || !NODES[endId]) {
    return null;
  }

  const pending = new Set(
    Object.keys(NODES)
  );

  const distances: Record<string, number> = {};
  const previous: Record<
    string,
    string | null
  > = {};

  for (const id of pending) {
    distances[id] = Infinity;
    previous[id] = null;
  }

  distances[startId] = 0;

  while (pending.size) {
    let current: string | null = null;

    for (const id of pending) {
      if (
        current === null ||
        distances[id] < distances[current]
      ) {
        current = id;
      }
    }

    if (
      !current ||
      !Number.isFinite(distances[current])
    ) {
      break;
    }

    if (current === endId) {
      break;
    }

    pending.delete(current);

    for (const edge of EDGES) {
      const next =
        edge.from === current
          ? edge.to
          : edge.to === current
          ? edge.from
          : null;

      if (
        !next ||
        !pending.has(next) ||
        !NODES[next]
      ) {
        continue;
      }

      const candidate =
        distances[current] +
        getDistanceInMeters(
          NODES[current],
          NODES[next]
        );

      if (candidate < distances[next]) {
        distances[next] = candidate;
        previous[next] = current;
      }
    }
  }

  if (!Number.isFinite(distances[endId])) {
    return null;
  }

  const path: string[] = [];
  let cursor: string | null = endId;

  while (cursor !== null) {
    path.unshift(cursor);
    cursor = previous[cursor];
  }

  return {
    path,
    distance: distances[endId],
  };
}

// =====================================
// ROUTE TO EVACUATION AREA
// =====================================

function calculateToAreas(
  startNodeId: string,
  allowedAreas: EvacuationArea[]
): RouteResult {
  const start = NODES[startNodeId];

  if (!start?.isExit) {
    return {
      success: false,
      message:
        `Unknown building exit: ${startNodeId}.`,
    };
  }

  let best: {
    path: GraphPath;
    area: EvacuationArea;
    accessId: string;
  } | null = null;

  for (const area of allowedAreas) {
    for (
      const accessId of getAreaAccessNodeIds(area)
    ) {
      const route = dijkstra(
        startNodeId,
        accessId
      );

      if (
        route &&
        (
          !best ||
          route.distance < best.path.distance
        )
      ) {
        best = {
          path: route,
          area,
          accessId,
        };
      }
    }
  }

  if (!best) {
    return {
      success: false,
      message:
        'No connected evacuation access node is reachable. Check the mapped walkway edges.',
    };
  }

  const points = best.path.path.map(id => ({
    x: NODES[id].x,
    y: NODES[id].y,
  }));

  const shown = trimRouteAtAreaBoundary(
    points,
    best.area.polygon
  );

  return {
    success: true,
    startNodeId,
    exitNodeId: startNodeId,
    exitName: start.name,
    evacuationAreaId: best.area.id,
    evacuationAreaName: best.area.name,
    destinationNodeId: best.accessId,
    distance: best.path.distance,
    path: best.path.path,
    points,
    pathString: shown
      .map(p => `${p.x},${p.y}`)
      .join(' '),
  };
}

// =====================================
// CALCULATE OUTDOOR ROUTE
// =====================================

export function calculateOutdoorRoute(
  startNodeId: string,
  evacuationAreaId?: string
): RouteResult {
  const areas = evacuationAreaId
    ? EVACUATION_AREAS.filter(
        area => area.id === evacuationAreaId
      )
    : EVACUATION_AREAS;

  if (!areas.length) {
    return {
      success: false,
      message: 'Evacuation area does not exist.',
    };
  }

  return calculateToAreas(
    startNodeId,
    areas
  );
}

// =====================================
// CALCULATE SHORTEST PATH
// =====================================

/**
 * Prototype only:
 * GPS cannot independently determine
 * which building exit is accessible.
 */
export function calculateShortestPath(
  userPosition: MapPoint
): RouteResult {
  const exitId =
    findNearestExitNode(userPosition);

  return exitId
    ? calculateOutdoorRoute(exitId)
    : {
        success: false,
        message:
          'No mapped building exit is available.',
      };
}

// =====================================
// CALCULATE NEAREST EXIT
// =====================================

export function calculateNearestExit(
  userPosition: MapPoint
): RouteResult {
  return calculateShortestPath(
    userPosition
  );
}

// =====================================
// CAMPUS TEST ROUTES
// =====================================

export type CampusTestPath =
  | {
      success: true;
      startId: string;
      endId: string;
      path: string[];
      points: MapPoint[];
      pathString: string;
      distancePixels: number;
    }
  | {
      success: false;
      message: string;
    };

export const CAMPUS_TEST_NODE_IDS =
  Object.keys(NODES).sort();

export const CAMPUS_AREA_TEST_IDS =
  EVACUATION_AREAS.map(area => area.id);

export function calculateCampusTestPath(
  startId: string,
  endId: string
): CampusTestPath {
  const route = dijkstra(
    startId,
    endId
  );

  if (!route) {
    return {
      success: false,
      message:
        'No connected path between those nodes.',
    };
  }

  const points = route.path.map(id => ({
    x: NODES[id].x,
    y: NODES[id].y,
  }));

  return {
    success: true,
    startId,
    endId,
    path: route.path,
    points,
    pathString: points
      .map(p => `${p.x},${p.y}`)
      .join(' '),

    distancePixels: route.path.reduce(
      (sum, id, i) =>
        i === 0
          ? sum
          : sum +
            getMapDistance(
              NODES[route.path[i - 1]],
              NODES[id]
            ) *
              SOURCE_MAP_SIZE /
              100,
      0
    ),
  };
}

// =====================================
// CAMPUS AREA TEST ROUTES
// =====================================

export type CampusAreaTestPath =
  | (
      Extract<
        CampusTestPath,
        { success: true }
      > & {
        areaId: string;
        areaName: string;
      }
    )
  | Extract<
      CampusTestPath,
      { success: false }
    >;

export function calculateCampusAreaTestPath(
  startId: string,
  targetAreaId: string | 'NEAREST'
): CampusAreaTestPath {
  const areas =
    targetAreaId === 'NEAREST'
      ? EVACUATION_AREAS
      : EVACUATION_AREAS.filter(
          area =>
            area.id === targetAreaId
        );

  if (!areas.length) {
    return {
      success: false,
      message: 'Unknown evacuation area.',
    };
  }

  let best: Extract<
    CampusAreaTestPath,
    { success: true }
  > | null = null;

  for (const area of areas) {
    for (
      const access of getAreaAccessNodeIds(area)
    ) {
      const result = calculateCampusTestPath(
        startId,
        access
      );

      if (
        result.success &&
        (
          !best ||
          result.distancePixels <
            best.distancePixels
        )
      ) {
        best = {
          ...result,
          areaId: area.id,
          areaName: area.name,
          pathString:
            trimRouteAtAreaBoundary(
              result.points,
              area.polygon
            )
              .map(
                p => `${p.x},${p.y}`
              )
              .join(' '),
        };
      }
    }
  }

  return (
    best ?? {
      success: false,
      message:
        'No reachable mapped evacuation access point.',
    }
  );
}

// =====================================
// GRAPH STATISTICS
// =====================================

export function getSurveyGraphStats() {
  const connected = new Set(
    EDGES.flatMap(edge => [
      edge.from,
      edge.to,
    ])
  );

  return {
    walkableNodes:
      Object.keys(NODES).length,

    connectedNodes:
      connected.size,

    disconnectedNodes:
      Object.keys(NODES).filter(
        id => !connected.has(id)
      ).length,

    walkableEdges:
      EDGES.length,
  };
}

// =====================================
// BUILDING-BASED EVACUATION ROUTING
// =====================================

/**
 * Finds the shortest connected route
 * from any registered exit of a building
 * to that building's assigned area.
 *
 * This is a building-level mapping preview.
 * It does not determine which exit a
 * person can physically access.
 */
export function calculateNearestReachableAreaFromBuilding(
  buildingId: string
): CampusAreaTestPath {
  // ===================================
  // REGISTERED BUILDING EXITS
  // ===================================

  const buildingExits: Record<
    string,
    string[]
  > = {
    AQ_DOME: [
      'AQD_N1',
    ],

    FRA_ANGELICO: [
      'AGL_N1',
      'AGL_N2',
    ],

    AQUINAS: [
      'AQU_N1',
      'AQU_N2',
      'AQU_N3',
      'AQU_N4',
      'AQU_N5',
    ],

    AQUINAS_2: [
      'AQU2_N1',
      'AQU2_N2',
    ],

    AQUINAS5: [
      'AQU5_N1',
      'AQU5_N2',
      'AQU5_N3',
      'AQU5_N4',
      'AQU5_N5',
      'AQU5_N6',
    ],

    DOMINIC: [
      'DOM_N2',
      'DOM_N3',
    ],

    MARTIN: [
      'MAR_N1',
      'MAR_N2',
      'MAR_N3',
    ],

    // Martin 2 — Eight mapped exits
    MARTIN2: [
      'MAR2_N1',
      'MAR2_N2',
      'MAR2_N3',
      'MAR2_N4',
      'MAR2_N5',
      'MAR2_N6',
      'MAR2_N7',
      'MAR2_N8',
    ],

    // Martin 3 — Nine mapped exits
    MARTIN3: [
      'MAR3_N1',
      'MAR3_N2',
      'MAR3_N3',
      'MAR3_N4',
      'MAR3_N5',
      'MAR3_N6',
      'MAR3_N7',
      'MAR3_N8',
      'MAR3_N9',
    ],

    // Aquinas 4 — Six mapped exits
    AQUINAS4: [
      'AQU4_N1',
      'AQU4_N6',
      'AQU4_N7',
      'AQU4_N8',
      'AQU4_N9',
      'AQU4_N10',
    ],
  };

  // ===================================
  // ASSIGNED EVACUATION DESTINATIONS
  // ===================================

  const destinations: Record<
    string,
    string
  > = {
    AQ_DOME: 'EVAC_AREA_7',
    FRA_ANGELICO: 'EVAC_AREA_7',
    AQUINAS: 'EVAC_AREA_7',
    AQUINAS_2: 'EVAC_AREA_7',

    AQUINAS5: 'EVAC_AREA_2',
    DOMINIC: 'EVAC_AREA_2',
    MARTIN: 'EVAC_AREA_2',

    // New evacuation destination
    MARTIN2: 'EVAC_AREA_3',
    MARTIN3: 'EVAC_AREA_4',
    AQUINAS4: 'EVAC_AREA_5',
  };

  const exits =
    buildingExits[buildingId];

  const targetAreaId =
    destinations[buildingId];

  if (!exits || !targetAreaId) {
    return {
      success: false,
      message:
        'Building has not been mapped yet.',
    };
  }

  if (
    !EVACUATION_AREAS.some(
      area => area.id === targetAreaId
    )
  ) {
    return {
      success: false,
      message:
        `Evacuation destination ${targetAreaId} is not registered.`,
    };
  }

  let best: Extract<
    CampusAreaTestPath,
    { success: true }
  > | null = null;

  for (const exit of exits) {
    const result =
      calculateCampusAreaTestPath(
        exit,
        targetAreaId
      );

    if (
      result.success &&
      (
        !best ||
        result.distancePixels <
          best.distancePixels
      )
    ) {
      best = result;
    }
  }

  return (
    best ?? {
      success: false,
      message:
        `No reachable mapped access point to ${targetAreaId}.`,
    }
  );
}

// =====================================
// GPS -> PHYSICAL BUILDING EXIT -> DIJKSTRA
// =====================================

/**
 * Mapping sections remain separate in the node graph because their exits
 * lead to different officially assigned evacuation areas.
 *
 * In the confirmation UI, all Aquinas sections are ONE physical building;
 * likewise, all Martin sections are ONE physical building.
 * The keys below must match the confirmed physical-building IDs.
 */
const PHYSICAL_BUILDING_SECTIONS: Record<string, readonly string[]> = {
  AQ_DOME: ['AQ_DOME'],
  FRA_ANGELICO: ['FRA_ANGELICO'],
  AQUINAS: ['AQUINAS', 'AQUINAS_2', 'AQUINAS4', 'AQUINAS5'],
  DOMINIC: ['DOMINIC'],
  MARTIN: ['MARTIN', 'MARTIN2', 'MARTIN3'],
};

/** Registered exits per mapping section — do not infer exits by proximity. */
const SECTION_EXIT_NODE_IDS: Record<string, readonly string[]> = {
  AQ_DOME: ['AQD_N1'],
  FRA_ANGELICO: ['AGL_N1', 'AGL_N2'],
  AQUINAS: [
    'AQU_N1', 'AQU_N2', 'AQU_N3', 'AQU_N4', 'AQU_N5',
  ],
  AQUINAS_2: ['AQU2_N1', 'AQU2_N2'],
  AQUINAS4: [
    'AQU4_N1', 'AQU4_N6', 'AQU4_N7',
    'AQU4_N8', 'AQU4_N9', 'AQU4_N10',
  ],
  AQUINAS5: [
    'AQU5_N1', 'AQU5_N2', 'AQU5_N3',
    'AQU5_N4', 'AQU5_N5', 'AQU5_N6',
  ],
  DOMINIC: ['DOM_N2', 'DOM_N3'],
  MARTIN: ['MAR_N1', 'MAR_N2', 'MAR_N3'],
  MARTIN2: [
    'MAR2_N1', 'MAR2_N2', 'MAR2_N3', 'MAR2_N4',
    'MAR2_N5', 'MAR2_N6', 'MAR2_N7', 'MAR2_N8',
  ],
  MARTIN3: [
    'MAR3_N1', 'MAR3_N2', 'MAR3_N3', 'MAR3_N4', 'MAR3_N5',
    'MAR3_N6', 'MAR3_N7', 'MAR3_N8', 'MAR3_N9',
  ],
};

/** Preserve the evacuation area assignment of each mapped section. */
const SECTION_EVACUATION_AREA: Record<string, string> = {
  AQ_DOME: 'EVAC_AREA_7',
  FRA_ANGELICO: 'EVAC_AREA_7',
  AQUINAS: 'EVAC_AREA_7',
  AQUINAS_2: 'EVAC_AREA_7',
  AQUINAS4: 'EVAC_AREA_5',
  AQUINAS5: 'EVAC_AREA_2',
  DOMINIC: 'EVAC_AREA_2',
  MARTIN: 'EVAC_AREA_2',
  MARTIN2: 'EVAC_AREA_3',
  MARTIN3: 'EVAC_AREA_4',
};

export type NearestBuildingExit = {
  exitNodeId: string;
  sectionId: string;
  evacuationAreaId: string;
  distanceFromUserMeters: number;
};

/**
 * Choose the GEOGRAPHICALLY nearest mapped exit of the confirmed physical
 * building. This is not an indoor walking-distance or safety calculation.
 * No exit-blocking / inaccessible-exit system is included.
 */
export function findNearestBuildingExit(
  userPosition: MapPoint,
  confirmedBuildingId: string
): NearestBuildingExit | null {
  const sections = PHYSICAL_BUILDING_SECTIONS[confirmedBuildingId];
  if (!sections) return null;

  let nearest: NearestBuildingExit | null = null;

  for (const sectionId of sections) {
    const evacuationAreaId = SECTION_EVACUATION_AREA[sectionId];
    if (!evacuationAreaId) continue;

    for (const exitNodeId of SECTION_EXIT_NODE_IDS[sectionId] ?? []) {
      const exit = NODES[exitNodeId];
      if (!exit?.isExit) continue;

      const distanceFromUserMeters = getDistanceInMeters(userPosition, exit);
      if (
        !nearest ||
        distanceFromUserMeters < nearest.distanceFromUserMeters
      ) {
        nearest = {
          exitNodeId,
          sectionId,
          evacuationAreaId,
          distanceFromUserMeters,
        };
      }
    }
  }

  return nearest;
}

/**
 * Uses nearest-exit selection first, then the existing outdoor Dijkstra
 * implementation, restricted to that exit section's assigned area.
 * If the selected exit is disconnected, we report no route rather than
 * pretending a different (possibly less accessible) indoor exit is safe.
 */
export function calculateRouteFromConfirmedBuilding(
  userPosition: MapPoint,
  confirmedBuildingId: string
): RouteResult {
  const nearest = findNearestBuildingExit(userPosition, confirmedBuildingId);

  if (!nearest) {
    return {
      success: false,
      message: 'No mapped exit found for the confirmed building.',
    };
  }

  const result = calculateOutdoorRoute(
    nearest.exitNodeId,
    nearest.evacuationAreaId
  );

  // Development diagnostics only: never changes the mapped graph.
  if (__DEV__) {
    const report = diagnoseBuildingRoute(userPosition, confirmedBuildingId);
    console.log('[TomaSafe Route Diagnosis]', JSON.stringify(report, null, 2));
  }

  if (!result.success) {
    // Preserve the original routing failure while identifying the exact
    // selected exit and assigned destination in the on-screen error.
    return {
      success: false,
      message: `${result.message}\nExit: ${nearest.exitNodeId} (${nearest.sectionId})\nDestination: ${nearest.evacuationAreaId}`,
    };
  }

  return result;
}

// =====================================
// DEVELOPMENT ROUTE DIAGNOSTICS
// =====================================

/**
 * Reports why the geographically closest exit cannot reach its designated
 * evacuation area. Read-only: does not connect nodes or change routing.
 */
export function diagnoseBuildingRoute(
  userPosition: MapPoint,
  confirmedBuildingId: string
) {
  const nearest = findNearestBuildingExit(userPosition, confirmedBuildingId);
  if (!nearest) {
    return { buildingId: confirmedBuildingId, error: 'No registered exit for building' };
  }

  const exit = NODES[nearest.exitNodeId];
  const area = EVACUATION_AREAS.find(a => a.id === nearest.evacuationAreaId);
  const registeredAccessNodeIds = area ? getAreaAccessNodeIds(area) : [];

  // Reachability traverses only the explicit submitted edges.
  const visited = new Set<string>([nearest.exitNodeId]);
  const queue: string[] = [nearest.exitNodeId];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    for (const edge of EDGES) {
      const adjacent = edge.from === current
        ? edge.to
        : edge.to === current
          ? edge.from
          : null;
      if (adjacent && NODES[adjacent] && !visited.has(adjacent)) {
        visited.add(adjacent);
        queue.push(adjacent);
      }
    }
  }

  const nearbyEdges = EDGES.filter(
    edge => edge.from === nearest.exitNodeId || edge.to === nearest.exitNodeId
  );
  const possibleAreaAccessNodes = Object.values(NODES)
    .filter(node => node.type === 'evac-access' && (
      node.areaId === nearest.evacuationAreaId || !node.areaId
    ))
    .map(node => ({
      id: node.id,
      areaId: node.areaId ?? null,
      insideAreaPolygon: area ? pointInsidePolygon(node, area.polygon) : false,
      reachableFromSelectedExit: visited.has(node.id),
    }));

  return {
    buildingId: confirmedBuildingId,
    userPosition,
    selectedExit: nearest.exitNodeId,
    mappedSection: nearest.sectionId,
    userToExitMeters: Math.round(nearest.distanceFromUserMeters),
    selectedExitExists: !!exit,
    selectedExitIsExit: !!exit?.isExit,
    selectedExitEdges: nearbyEdges,
    assignedAreaId: nearest.evacuationAreaId,
    assignedAreaExists: !!area,
    registeredAccessNodeIds,
    reachableAccessNodeIds: registeredAccessNodeIds.filter(id => visited.has(id)),
    totalNodesConnectedToExit: visited.size,
    possibleAreaAccessNodes,
  };
}
