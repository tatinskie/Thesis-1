/**
 * Fra. Angelico Building — navigation graph.
 * SVG source coordinates: 800 × 800.
 *
 * AGL_N1 / AGL_N2 — exits
 * AGL_N4 — hallway
 * AGL_N5 — access to EVAC_AREA_7
 *
 * Imported by campusGraphData.ts.
 * Routes require on-site verification.
 */
export const ANGELICO_BUILDING = {
  id: 'FRA_ANGELICO',
  name: 'Fra. Angelico Building',
  exitNodeIds: ['AGL_N1', 'AGL_N2'],
} as const;

export const ANGELICO_NODES = {
  AGL_N1: { x: 244.71, y: 662.18, name: 'AGL_N1', type: 'exit', isExit: true },
  AGL_N2: { x: 270.49, y: 663.29, name: 'AGL_N2', type: 'exit', isExit: true },
  AGL_N4: { x: 260.6, y: 635, name: 'AGL_N4', type: 'hallway' },
  AGL_N5: {
  x: 261.6,
  y: 588.25,
  name: 'AGL_N5',
  type: 'evac-access',
  areaId: 'EVAC_AREA_7',
},
} as const;

export const ANGELICO_EDGES = [
  { from: 'AGL_N1', to: 'AGL_N4' },
  { from: 'AGL_N2', to: 'AGL_N4' },
  { from: 'AGL_N4', to: 'AGL_N5' },
] as const;
