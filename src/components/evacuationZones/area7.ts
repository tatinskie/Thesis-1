/**
 * Zone 7: AQ Dome graph survey (SVG pixel coordinates, viewBox 0 0 800 800).
 * Names use a building prefix to avoid collision with other building graphs.
 * Route is a submitted survey edge, not yet verified for emergency use.
 */
export const NODES = {
  AQD_N1: {
    x: 363.62,
    y: 628.54,
    name: 'AQD_N1',
    type: 'exit',
    isExit: true,
  },
  AQD_N2: {
    x: 303.31,
    y: 575.92,
    name: 'AQD_N2',
    type: 'evac-access',
    areaId: 'EVAC_AREA_7',
  },
} as const;

export const EDGES = [
  { from: 'AQD_N1', to: 'AQD_N2' },
] as const;

export const ZONE_ID = 'EVAC_AREA_7';
export const BUILDING_ID = 'AQ_DOME';
