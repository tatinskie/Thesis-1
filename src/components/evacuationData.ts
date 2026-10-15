
/**
 * TomaSafe — Evacuation Area Data
 *
 * University of Santo Tomas–Legazpi
 * Rawis Campus
 *
 * Coordinates: normalized 0–100
 * Source SVG: 800 × 800
 *
 * Currently mapped evacuation areas:
 * - EVAC_AREA_7
 * - EVAC_AREA_2
 * - EVAC_AREA_3
 * - EVAC_AREA_4
 * - EVAC_AREA_5
 *
 * Polygon boundaries represent evacuation
 * destinations, not walkable pathways.
 *
 * Routes require on-site safety verification.
 */

export type MapPoint = {
  x: number;
  y: number;
};

export type EvacuationArea = {
  id: string;
  name: string;
  polygon: MapPoint[];
  center: MapPoint;
};

// =====================================
// CURRENT EVACUATION AREAS
// =====================================

export const EVACUATION_AREAS: EvacuationArea[] = [
  // ===================================
  // EVACUATION AREA 7
  // ===================================
  {
    id: 'EVAC_AREA_7',
    name: 'Evacuation Area 7',

    polygon: [
      { x: 30.76, y: 54.54 },
      { x: 40.53, y: 54.54 },
      { x: 40.53, y: 74.54 },
      { x: 30.76, y: 74.54 },
    ],

    center: {
      x: 35.64,
      y: 64.54,
    },
  },

  // ===================================
  // EVACUATION AREA 2
  // ===================================
  {
    id: 'EVAC_AREA_2',
    name: 'Evacuation Area 2',

    polygon: [
      { x: 77.18, y: 27.82 },
      { x: 87.58, y: 27.82 },
      { x: 87.58, y: 52.54 },
      { x: 77.18, y: 52.54 },
    ],

    center: {
      x: 82.38,
      y: 40.18,
    },
  },

  // ===================================
  // EVACUATION AREA 3 — MARTIN 2
  // ===================================
  {
    id: 'EVAC_AREA_3',
    name: 'Evacuation Area 3',

    polygon: [
      { x: 45.58, y: 27.72 },
      { x: 61.42, y: 27.72 },
      { x: 61.42, y: 35.22 },
      { x: 45.58, y: 35.22 },
    ],

    center: {
      x: 53.5,
      y: 31.47,
    },
  },

  // ===================================
  // EVACUATION AREA 4 — MARTIN 3
  // ===================================
  {
    id: 'EVAC_AREA_4',
    name: 'Evacuation Area 4',

    polygon: [
      { x: 44.89, y: 10.02 },
      { x: 59.65, y: 10.02 },
      { x: 59.65, y: 17.00 },
      { x: 44.89, y: 17.00 },
    ],

    center: {
      x: 52.27,
      y: 13.51,
    },
  },

  // ===================================
  // EVACUATION AREA 5 — AQUINAS 4
  // ===================================
  {
    id: 'EVAC_AREA_5',
    name: 'Evacuation Area 5',

    // From the Aquinas 4 Node Builder export.
    // Original polygon coordinates preserved.
    polygon: [
      { x: 49.21, y: 60.23 },
      { x: 64.93, y: 60.23 },
      { x: 64.93, y: 67.27 },
      { x: 49.21, y: 67.27 },
    ],

    center: {
      x: 57.07,
      y: 63.75,
    },
  },
];
