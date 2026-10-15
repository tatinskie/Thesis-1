
/**
 * TomaSafe — Aquinas Building
 *
 * Original 800×800 SVG pixel coordinates.
 *
 * This mapping section handles exits AQU_N1–AQU_N5
 * and routes toward Evacuation Area 7.
 *
 * The other part of Aquinas is handled by
 * aquinas4.ts and its own evacuation assignment.
 *
 * Mapping prototype — verify pathways on-site.
 */

export const AQUINAS_BUILDING = {
  id: 'AQUINAS',
  name: 'Aquinas Building',
  exitNodeIds: [
    'AQU_N1',
    'AQU_N2',
    'AQU_N3',
    'AQU_N4',
    'AQU_N5',
  ],
} as const;

export const AQUINAS_NODES = {
  // Building exits
  AQU_N1: {
    x: 369.46,
    y: 549.46,
    name: 'AQU_N1',
    type: 'exit',
    isExit: true,
  },
  AQU_N2: {
    x: 397.15,
    y: 550.38,
    name: 'AQU_N2',
    type: 'exit',
    isExit: true,
  },
  AQU_N3: {
    x: 423,
    y: 551.31,
    name: 'AQU_N3',
    type: 'exit',
    isExit: true,
  },
  AQU_N4: {
    x: 450.38,
    y: 552.85,
    name: 'AQU_N4',
    type: 'exit',
    isExit: true,
  },
  AQU_N5: {
    x: 478.69,
    y: 553.77,
    name: 'AQU_N5',
    type: 'exit',
    isExit: true,
  },

  // Hallway and evacuation access
  AQU_N11: {
    x: 479.31,
    y: 540.23,
    name: 'AQU_N11',
    type: 'hallway',
  },
  AQU_N12: {
    x: 316.23,
    y: 534.38,
    name: 'AQU_N12',
    type: 'evac-access',
    areaId: 'EVAC_AREA_7',
  },

  // Hallway junctions
  AQU_N14: {
    x: 451.31,
    y: 538.69,
    name: 'AQU_N14',
    type: 'junction',
  },
  AQU_N15: {
    x: 423.62,
    y: 538.08,
    name: 'AQU_N15',
    type: 'junction',
  },
  AQU_N16: {
    x: 397.15,
    y: 537.77,
    name: 'AQU_N16',
    type: 'junction',
  },
  AQU_N17: {
    x: 370.08,
    y: 536.85,
    name: 'AQU_N17',
    type: 'junction',
  },
} as const;

export const AQUINAS_EDGES = [
  // Existing exit and evacuation access connections
  { from: 'AQU_N11', to: 'AQU_N12' },
  { from: 'AQU_N5', to: 'AQU_N11' },
  { from: 'AQU_N4', to: 'AQU_N14' },
  { from: 'AQU_N3', to: 'AQU_N15' },
  { from: 'AQU_N2', to: 'AQU_N16' },
  { from: 'AQU_N1', to: 'AQU_N17' },

  // Existing continuous hallway connections
  { from: 'AQU_N17', to: 'AQU_N16' },
  { from: 'AQU_N16', to: 'AQU_N15' },
  { from: 'AQU_N15', to: 'AQU_N14' },
  { from: 'AQU_N14', to: 'AQU_N11' },
] as const;
