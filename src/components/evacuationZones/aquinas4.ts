
/**
 * TomaSafe — Aquinas 4 Building Navigation Graph
 *
 * Source SVG: 800 × 800 pixels
 * Evacuation destination: EVAC_AREA_5
 *
 * Original node coordinates and edges preserved.
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const AQUINAS4_BUILDING = {
  id: 'AQUINAS4',
  name: 'Aquinas 4 Building',
  exitNodeIds: [
    'AQU4_N1',
    'AQU4_N6',
    'AQU4_N7',
    'AQU4_N8',
    'AQU4_N9',
    'AQU4_N10',
  ],
} as const;

// =====================================
// NAVIGATION NODES
// =====================================

export const AQUINAS4_NODES = {
  // Building exits
  AQU4_N1: {
    x: 610.3,
    y: 529.21,
    name: 'AQU4_N1',
    type: 'exit',
    isExit: true,
  },
  AQU4_N6: {
    x: 596.96,
    y: 559.7,
    name: 'AQU4_N6',
    type: 'exit',
    isExit: true,
  },
  AQU4_N7: {
    x: 573.19,
    y: 558.81,
    name: 'AQU4_N7',
    type: 'exit',
    isExit: true,
  },
  AQU4_N8: {
    x: 549.63,
    y: 557.7,
    name: 'AQU4_N8',
    type: 'exit',
    isExit: true,
  },
  AQU4_N9: {
    x: 524.74,
    y: 557.04,
    name: 'AQU4_N9',
    type: 'exit',
    isExit: true,
  },
  AQU4_N10: {
    x: 498.47,
    y: 556.15,
    name: 'AQU4_N10',
    type: 'exit',
    isExit: true,
  },

  // Outdoor hallway nodes
  AQU4_N3: {
    x: 590.52,
    y: 528.77,
    name: 'AQU4_N3',
    type: 'hallway',
  },
  AQU4_N4: {
    x: 568.52,
    y: 506.99,
    name: 'AQU4_N4',
    type: 'hallway',
  },
  AQU4_N11: {
    x: 596.95,
    y: 549.12,
    name: 'AQU4_N11',
    type: 'hallway',
  },
  AQU4_N12: {
    x: 489.94,
    y: 545.71,
    name: 'AQU4_N12',
    type: 'hallway',
  },

  // Junction nodes
  AQU4_N14: {
    x: 573.4,
    y: 548.1,
    name: 'AQU4_N14',
    type: 'junction',
  },
  AQU4_N15: {
    x: 549.99,
    y: 547.06,
    name: 'AQU4_N15',
    type: 'junction',
  },
  AQU4_N16: {
    x: 524.73,
    y: 546.31,
    name: 'AQU4_N16',
    type: 'junction',
  },

  // Evacuation Area 5 access nodes
  AQU4_N5: {
    x: 507.19,
    y: 505.21,
    name: 'AQU4_N5',
    type: 'evac-access',
    areaId: 'EVAC_AREA_5',
  },
  AQU4_N13: {
    x: 480.16,
    y: 530.6,
    name: 'AQU4_N13',
    type: 'evac-access',
    areaId: 'EVAC_AREA_5',
  },
} as const;

// =====================================
// WALKABLE EDGES
// =====================================


export const AQUINAS4_EDGES = [
  // Exit 1 — separate upper route
  { from: 'AQU4_N1', to: 'AQU4_N3' },
  { from: 'AQU4_N3', to: 'AQU4_N4' },
  { from: 'AQU4_N4', to: 'AQU4_N5' },

  // Main walkway toward Area 5
  { from: 'AQU4_N6', to: 'AQU4_N11' },
  { from: 'AQU4_N11', to: 'AQU4_N14' },
  { from: 'AQU4_N14', to: 'AQU4_N15' },
  { from: 'AQU4_N15', to: 'AQU4_N16' },
  { from: 'AQU4_N16', to: 'AQU4_N12' },
  { from: 'AQU4_N12', to: 'AQU4_N13' },

  // Connect exits to their junctions
  { from: 'AQU4_N7', to: 'AQU4_N14' },
  { from: 'AQU4_N8', to: 'AQU4_N15' },
  { from: 'AQU4_N9', to: 'AQU4_N16' },
  { from: 'AQU4_N10', to: 'AQU4_N12' },
] as const;

