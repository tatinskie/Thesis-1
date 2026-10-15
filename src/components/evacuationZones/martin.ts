
/**
 * Martin Building — Navigation Graph
 *
 * Source SVG: 800 × 800 pixels
 *
 * Evacuation destination: EVAC_AREA_2
 *
 * All original node coordinates and edges
 * are preserved from the Node Builder.
 *
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const MARTIN_BUILDING = {
  id: 'MARTIN',
  name: 'Martin Building',
  exitNodeIds: [
    'MAR_N1',
    'MAR_N2',
    'MAR_N3',
  ],
} as const;

// =====================================
// NODES
// =====================================

export const MARTIN_NODES = {
  // =====================================
  // BUILDING EXITS
  // =====================================

  MAR_N1: {
    x: 575.37,
    y: 204.83,
    name: 'MAR_N1',
    type: 'exit',
    isExit: true,
  },

  MAR_N2: {
    x: 601.08,
    y: 181.97,
    name: 'MAR_N2',
    type: 'exit',
    isExit: true,
  },

  MAR_N3: {
    x: 655.94,
    y: 150.54,
    name: 'MAR_N3',
    type: 'exit',
    isExit: true,
  },

  // =====================================
  // EVACUATION AREA 2 ACCESS POINTS
  // =====================================

  MAR_N4: {
    x: 634.22,
    y: 263.11,
    name: 'MAR_N4',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },

  MAR_N5: {
    x: 641.65,
    y: 251.11,
    name: 'MAR_N5',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },

  MAR_N6: {
    x: 670.22,
    y: 249.4,
    name: 'MAR_N6',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },

  // =====================================
  // HALLWAY NODE
  // =====================================

  MAR_N7: {
    x: 669.67,
    y: 150.31,
    name: 'MAR_N7',
    type: 'hallway',
  },
} as const;

// =====================================
// EDGES
// =====================================

export const MARTIN_EDGES = [
  // Exit 3 to Evacuation Area 2
  { from: 'MAR_N3', to: 'MAR_N7' },
  { from: 'MAR_N7', to: 'MAR_N6' },

  // Exit 2 to Evacuation Area 2
  { from: 'MAR_N2', to: 'MAR_N5' },

  // Exit 1 to Evacuation Area 2
  { from: 'MAR_N1', to: 'MAR_N4' },
] as const;
