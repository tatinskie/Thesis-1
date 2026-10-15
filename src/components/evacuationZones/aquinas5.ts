
/**
 * Aquinas 5 Building — Navigation Graph
 *
 * SVG source coordinates: 800 × 800
 * Destination: EVAC_AREA_2
 *
 * All six exits connect to the main hallway,
 * leading to Evacuation Area 2.
 *
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const AQUINAS5_BUILDING = {
  id: 'AQUINAS5',
  name: 'Aquinas 5',
  exitNodeIds: [
    'AQU5_N1',
    'AQU5_N2',
    'AQU5_N3',
    'AQU5_N4',
    'AQU5_N5',
    'AQU5_N6',
  ],
} as const;

// =====================================
// NODES — 800 × 800 SVG COORDINATES
// =====================================

export const AQUINAS5_NODES = {
  // Building exits
  AQU5_N1: {
    x: 459.31,
    y: 437.03,
    name: 'AQU5_N1',
    type: 'exit',
    isExit: true,
  },

  AQU5_N2: {
    x: 477.6,
    y: 437.6,
    name: 'AQU5_N2',
    type: 'exit',
    isExit: true,
  },

  AQU5_N3: {
    x: 501.6,
    y: 438.17,
    name: 'AQU5_N3',
    type: 'exit',
    isExit: true,
  },

  AQU5_N4: {
    x: 520.46,
    y: 438.46,
    name: 'AQU5_N4',
    type: 'exit',
    isExit: true,
  },

  AQU5_N5: {
    x: 538.46,
    y: 439.31,
    name: 'AQU5_N5',
    type: 'exit',
    isExit: true,
  },

  AQU5_N6: {
    x: 555.03,
    y: 440.46,
    name: 'AQU5_N6',
    type: 'exit',
    isExit: true,
  },

  // Hallway nodes
  AQU5_N7: {
    x: 460.46,
    y: 424.74,
    name: 'AQU5_N7',
    type: 'hallway',
  },

  AQU5_N8: {
    x: 581.6,
    y: 426.93,
    name: 'AQU5_N8',
    type: 'hallway',
  },

  // Junction nodes
  AQU5_N10: {
    x: 478.13,
    y: 425.23,
    name: 'AQU5_N10',
    type: 'junction',
  },

  AQU5_N11: {
    x: 502,
    y: 426.04,
    name: 'AQU5_N11',
    type: 'junction',
  },

  AQU5_N12: {
    x: 521.11,
    y: 425.6,
    name: 'AQU5_N12',
    type: 'junction',
  },

  AQU5_N13: {
    x: 538.89,
    y: 426.27,
    name: 'AQU5_N13',
    type: 'junction',
  },

  AQU5_N15: {
    x: 556.08,
    y: 426.4,
    name: 'AQU5_N15',
    type: 'junction',
  },

  // Evacuation Area 2 access
  AQU5_N9: {
    x: 626.04,
    y: 390.93,
    name: 'AQU5_N9',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },
} as const;

// =====================================
// EDGES — CONNECTED WALKWAYS
// =====================================

export const AQUINAS5_EDGES = [
  // Each building exit to its junction
  { from: 'AQU5_N1', to: 'AQU5_N7' },
  { from: 'AQU5_N2', to: 'AQU5_N10' },
  { from: 'AQU5_N3', to: 'AQU5_N11' },
  { from: 'AQU5_N4', to: 'AQU5_N12' },
  { from: 'AQU5_N5', to: 'AQU5_N13' },
  { from: 'AQU5_N6', to: 'AQU5_N15' },

  // Confirmed continuous hallway
  { from: 'AQU5_N7', to: 'AQU5_N10' },
  { from: 'AQU5_N10', to: 'AQU5_N11' },
  { from: 'AQU5_N11', to: 'AQU5_N12' },
  { from: 'AQU5_N12', to: 'AQU5_N13' },
  { from: 'AQU5_N13', to: 'AQU5_N15' },
  { from: 'AQU5_N15', to: 'AQU5_N8' },

  // Final walkway to Evacuation Area 2
  { from: 'AQU5_N8', to: 'AQU5_N9' },
] as const;
