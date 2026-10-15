
/**
 * Martin 2 Building — Navigation Graph
 *
 * Source SVG: 800 × 800 pixels
 *
 * Evacuation destination:
 * Evacuation Area 3 (new polygon)
 *
 * Original coordinates and edges preserved.
 * Routes require on-site verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const MARTIN2_BUILDING = {
  id: 'MARTIN2',
  name: 'Martin 2 Building',
  exitNodeIds: [
    'MAR2_N1',
    'MAR2_N2',
    'MAR2_N3',
    'MAR2_N4',
    'MAR2_N5',
    'MAR2_N6',
    'MAR2_N7',
    'MAR2_N8',
  ],
} as const;

// =====================================
// NAVIGATION NODES
// =====================================

export const MARTIN2_NODES = {
  // Building exits

  MAR2_N1: {
    x: 532.61,
    y: 203.25,
    name: 'MAR2_N1',
    type: 'exit',
    isExit: true,
  },

  MAR2_N2: {
    x: 513.11,
    y: 202.75,
    name: 'MAR2_N2',
    type: 'exit',
    isExit: true,
  },

  MAR2_N3: {
    x: 491.61,
    y: 201.75,
    name: 'MAR2_N3',
    type: 'exit',
    isExit: true,
  },

  MAR2_N4: {
    x: 468.11,
    y: 201.5,
    name: 'MAR2_N4',
    type: 'exit',
    isExit: true,
  },

  MAR2_N5: {
    x: 450.11,
    y: 200.25,
    name: 'MAR2_N5',
    type: 'exit',
    isExit: true,
  },

  MAR2_N6: {
    x: 429.86,
    y: 199.5,
    name: 'MAR2_N6',
    type: 'exit',
    isExit: true,
  },

  MAR2_N7: {
    x: 409.53,
    y: 199,
    name: 'MAR2_N7',
    type: 'exit',
    isExit: true,
  },

  MAR2_N8: {
    x: 390.78,
    y: 198.25,
    name: 'MAR2_N8',
    type: 'exit',
    isExit: true,
  },

  // Outdoor walkway nodes

  MAR2_N9: {
    x: 531.89,
    y: 214,
    name: 'MAR2_N9',
    type: 'hallway',
  },

  MAR2_N10: {
    x: 508.04,
    y: 213.94,
    name: 'MAR2_N10',
    type: 'hallway',
  },

  // Access points inside the new evacuation area

  MAR2_N11: {
    x: 482.59,
    y: 229.58,
    name: 'MAR2_N11',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },

  MAR2_N12: {
    x: 465.86,
    y: 228.3,
    name: 'MAR2_N12',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },

  MAR2_N13: {
    x: 448.16,
    y: 228.67,
    name: 'MAR2_N13',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },

  MAR2_N14: {
    x: 427.8,
    y: 228.85,
    name: 'MAR2_N14',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },

  MAR2_N15: {
    x: 408.34,
    y: 227.76,
    name: 'MAR2_N15',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },

  MAR2_N16: {
    x: 387.98,
    y: 227.21,
    name: 'MAR2_N16',
    type: 'evac-access',
    areaId: 'EVAC_AREA_3',
  },
} as const;

// =====================================
// WALKABLE EDGES
// =====================================

export const MARTIN2_EDGES = [
  { from: 'MAR2_N1', to: 'MAR2_N9' },
  { from: 'MAR2_N9', to: 'MAR2_N10' },
  { from: 'MAR2_N10', to: 'MAR2_N11' },

  { from: 'MAR2_N2', to: 'MAR2_N10' },
  { from: 'MAR2_N3', to: 'MAR2_N11' },

  { from: 'MAR2_N4', to: 'MAR2_N12' },
  { from: 'MAR2_N5', to: 'MAR2_N13' },
  { from: 'MAR2_N6', to: 'MAR2_N14' },
  { from: 'MAR2_N7', to: 'MAR2_N15' },
  { from: 'MAR2_N8', to: 'MAR2_N16' },
] as const;
