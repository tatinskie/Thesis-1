
/**
 * Aquinas 2 Building — Navigation Graph
 *
 * SVG source coordinates: 800 × 800
 * Destination: EVAC_AREA_7
 *
 * Both building exits are connected to the
 * evacuation access point through mapped walkways.
 *
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const AQUINAS2_BUILDING = {
  id: 'AQUINAS_2',
  name: 'Aquinas 2',
  exitNodeIds: ['AQU2_N1', 'AQU2_N2'],
} as const;

// =====================================
// NODES
// =====================================

export const AQUINAS2_NODES = {
  // Building exits
  AQU2_N1: {
    x: 387.04,
    y: 434.72,
    name: 'AQU2_N1',
    type: 'exit',
    isExit: true,
  },

  AQU2_N2: {
    x: 451.04,
    y: 437.12,
    name: 'AQU2_N2',
    type: 'exit',
    isExit: true,
  },

  // Hallway nodes
  AQU2_N4: {
    x: 313,
    y: 421.87,
    name: 'AQU2_N4',
    type: 'hallway',
  },

  AQU2_N7: {
    x: 450.87,
    y: 425.33,
    name: 'AQU2_N7',
    type: 'hallway',
  },

  // Evacuation Area 7 access point
  AQU2_N5: {
    x: 290,
    y: 461.53,
    name: 'AQU2_N5',
    type: 'evac-access',
    areaId: 'EVAC_AREA_7',
  },

  // Hallway junction
  AQU2_N6: {
    x: 386.87,
    y: 423.67,
    name: 'AQU2_N6',
    type: 'junction',
  },
} as const;

// =====================================
// EDGES
// =====================================

export const AQUINAS2_EDGES = [
  // Exits to their assigned walkway nodes
  { from: 'AQU2_N1', to: 'AQU2_N6' },
  { from: 'AQU2_N2', to: 'AQU2_N7' },

  // Connected hallway / junction
  { from: 'AQU2_N6', to: 'AQU2_N7' },
  { from: 'AQU2_N7', to: 'AQU2_N4' },

  // Hallway to Evacuation Area 7
  { from: 'AQU2_N4', to: 'AQU2_N5' },
] as const;
