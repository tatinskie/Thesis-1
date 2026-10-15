
/**
 * TomaSafe — Martin 3 Building Navigation Graph
 *
 * Source SVG: 800 × 800 pixels
 * Evacuation destination: EVAC_AREA_4
 *
 * All original node coordinates and edges preserved.
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const MARTIN3_BUILDING = {
  id: 'MARTIN3',
  name: 'Martin 3 Building',
  exitNodeIds: [
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
} as const;

// =====================================
// NAVIGATION NODES
// =====================================

export const MARTIN3_NODES = {
  // ===================================
  // BUILDING EXITS
  // ===================================

  MAR3_N1: {
    x: 521.31,
    y: 72.42,
    name: 'MAR3_N1',
    type: 'exit',
    isExit: true,
  },

  MAR3_N2: {
    x: 366.75,
    y: 67.47,
    name: 'MAR3_N2',
    type: 'exit',
    isExit: true,
  },

  MAR3_N3: {
    x: 381.42,
    y: 67.85,
    name: 'MAR3_N3',
    type: 'exit',
    isExit: true,
  },

  MAR3_N4: {
    x: 395.32,
    y: 68.04,
    name: 'MAR3_N4',
    type: 'exit',
    isExit: true,
  },

  MAR3_N5: {
    x: 408.08,
    y: 68.61,
    name: 'MAR3_N5',
    type: 'exit',
    isExit: true,
  },

  MAR3_N6: {
    x: 422.18,
    y: 69.19,
    name: 'MAR3_N6',
    type: 'exit',
    isExit: true,
  },

  MAR3_N7: {
    x: 436.08,
    y: 69.57,
    name: 'MAR3_N7',
    type: 'exit',
    isExit: true,
  },

  MAR3_N8: {
    x: 449.8,
    y: 69.95,
    name: 'MAR3_N8',
    type: 'exit',
    isExit: true,
  },

  MAR3_N9: {
    x: 465.42,
    y: 70.71,
    name: 'MAR3_N9',
    type: 'exit',
    isExit: true,
  },

  // ===================================
  // EVACUATION ACCESS NODES
  // ===================================

  MAR3_N11: {
    x: 474.77,
    y: 81,
    name: 'MAR3_N11',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N12: {
    x: 464.54,
    y: 86.04,
    name: 'MAR3_N12',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N13: {
    x: 448.49,
    y: 87.08,
    name: 'MAR3_N13',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N14: {
    x: 436.49,
    y: 88.12,
    name: 'MAR3_N14',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N15: {
    x: 420.49,
    y: 89.45,
    name: 'MAR3_N15',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N16: {
    x: 407.6,
    y: 89.6,
    name: 'MAR3_N16',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N17: {
    x: 395.13,
    y: 89.45,
    name: 'MAR3_N17',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N18: {
    x: 382.09,
    y: 88.71,
    name: 'MAR3_N18',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  MAR3_N19: {
    x: 366.83,
    y: 89.15,
    name: 'MAR3_N19',
    type: 'evac-access',
    areaId: 'EVAC_AREA_4',
  },

  // ===================================
  // OUTDOOR WALKWAY NODE
  // ===================================

  MAR3_N20: {
    x: 521.12,
    y: 81.15,
    name: 'MAR3_N20',
    type: 'hallway',
  },
} as const;

// =====================================
// WALKABLE EDGES
// =====================================

export const MARTIN3_EDGES = [
  { from: 'MAR3_N1', to: 'MAR3_N20' },
  { from: 'MAR3_N20', to: 'MAR3_N11' },
  { from: 'MAR3_N9', to: 'MAR3_N12' },
  { from: 'MAR3_N8', to: 'MAR3_N13' },
  { from: 'MAR3_N7', to: 'MAR3_N14' },
  { from: 'MAR3_N6', to: 'MAR3_N15' },
  { from: 'MAR3_N5', to: 'MAR3_N16' },
  { from: 'MAR3_N4', to: 'MAR3_N17' },
  { from: 'MAR3_N3', to: 'MAR3_N18' },
  { from: 'MAR3_N2', to: 'MAR3_N19' },
] as const;
