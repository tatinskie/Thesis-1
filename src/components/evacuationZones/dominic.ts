
/**
 * Dominic Building — Navigation Graph
 *
 * Source SVG: 800 × 800 pixels
 * Destination: EVAC_AREA_2
 *
 * Two building exits, each connected to
 * a separate evacuation access point.
 *
 * Routes require on-site safety verification.
 */

// =====================================
// BUILDING INFORMATION
// =====================================

export const DOMINIC_BUILDING = {
  id: 'DOMINIC',
  name: 'Dominic Building',
  exitNodeIds: ['DOM_N2', 'DOM_N3'],
} as const;

// =====================================
// NODES
// =====================================

export const DOMINIC_NODES = {
  DOM_N2: {
    x: 576.19,
    y: 251.84,
    name: 'DOM_N2',
    type: 'exit',
    isExit: true,
  },

  DOM_N3: {
    x: 573.03,
    y: 376.56,
    name: 'DOM_N3',
    type: 'exit',
    isExit: true,
  },

  DOM_N4: {
    x: 638.73,
    y: 351.23,
    name: 'DOM_N4',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },

  DOM_N5: {
    x: 637.93,
    y: 284.47,
    name: 'DOM_N5',
    type: 'evac-access',
    areaId: 'EVAC_AREA_2',
  },
} as const;

// =====================================
// EDGES
// =====================================

export const DOMINIC_EDGES = [
  { from: 'DOM_N2', to: 'DOM_N5' },
  { from: 'DOM_N3', to: 'DOM_N4' },
] as const;
