
/**
 * TomaSafe — Combined Campus Navigation Graph
 *
 * Source map: 800 × 800 SVG
 * App coordinates: normalized 0–100
 *
 * Building graphs:
 * - AQ Dome
 * - Fra. Angelico Building
 * - Aquinas Building
 * - Aquinas 2 Building
 * - Aquinas 5 Building
 * - Dominic Building
 * - Martin Building
 * - Martin 2 Building
 * - Martin 3 Building
 * - Aquinas 4 Building
 *
 * Evacuation destinations:
 *
 * EVAC_AREA_7:
 * - AQ Dome
 * - Fra. Angelico
 * - Aquinas
 * - Aquinas 2
 *
 * EVAC_AREA_2:
 * - Aquinas 5
 * - Dominic
 * - Martin
 *
 * EVAC_AREA_3:
 * - Martin 2
 *
 * EVAC_AREA_4:
 * - Martin 3
 *
 * EVAC_AREA_5:
 * - Aquinas 4
 *
 * Routes are mapping drafts and require
 * on-site safety verification.
 */

// =====================================
// BUILDING GRAPH IMPORTS
// =====================================

import {
  ANGELICO_NODES,
  ANGELICO_EDGES,
} from './evacuationZones/angelico';

import {
  AQUINAS_NODES,
  AQUINAS_EDGES,
} from './evacuationZones/aquinas';

import {
  AQUINAS2_NODES,
  AQUINAS2_EDGES,
} from './evacuationZones/aquinas2';

import {
  AQUINAS4_NODES,
  AQUINAS4_EDGES,
} from './evacuationZones/aquinas4';

import {
  AQUINAS5_NODES,
  AQUINAS5_EDGES,
} from './evacuationZones/aquinas5';

import {
  DOMINIC_NODES,
  DOMINIC_EDGES,
} from './evacuationZones/dominic';

import {
  MARTIN_NODES,
  MARTIN_EDGES,
} from './evacuationZones/martin';

import {
  MARTIN2_NODES,
  MARTIN2_EDGES,
} from './evacuationZones/martin2';

import {
  MARTIN3_NODES,
  MARTIN3_EDGES,
} from './evacuationZones/martin3';

// =====================================
// MAP CONFIGURATION
// =====================================

export const SOURCE_MAP_SIZE = 800;

export type CampusNodeType =
  | 'exit'
  | 'hallway'
  | 'turn'
  | 'intersection'
  | 'junction'
  | 'evac-access';

export type CampusNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  type: CampusNodeType;
  isExit?: boolean;
  areaId?: string;
};

export type CampusEdge = {
  from: string;
  to: string;
};

// =====================================
// AQ DOME — SVG PIXEL COORDINATES
// =====================================

export const AQ_DOME_NODES = {
  AQD_N1: {
    x: 363.62,
    y: 628.54,
    name: 'AQD_N1',
    type: 'exit',
    isExit: true,
  },

  AQD_N2: {
    x: 303.31,
    y: 575.92,
    name: 'AQD_N2',
    type: 'evac-access',
    areaId: 'EVAC_AREA_7',
  },
} as const;

export const AQ_DOME_EDGES: CampusEdge[] = [
  { from: 'AQD_N1', to: 'AQD_N2' },
];

// =====================================
// COMBINE BUILDING NODES
// =====================================

export const SUBMITTED_NODES_PIXELS = {
  ...AQ_DOME_NODES,
  ...ANGELICO_NODES,
  ...AQUINAS_NODES,
  ...AQUINAS2_NODES,
  ...AQUINAS4_NODES,
  ...AQUINAS5_NODES,
  ...DOMINIC_NODES,
  ...MARTIN_NODES,
  ...MARTIN2_NODES,
  ...MARTIN3_NODES,
};

// Convert 800×800 SVG pixel coordinates
// to normalized 0–100 map coordinates.

export const CAMPUS_NODES: Record<string, CampusNode> =
  Object.fromEntries(
    Object.entries(SUBMITTED_NODES_PIXELS).map(
      ([id, node]) => [
        id,
        {
          ...node,
          id,
          x: (node.x / SOURCE_MAP_SIZE) * 100,
          y: (node.y / SOURCE_MAP_SIZE) * 100,
        },
      ]
    )
  );

// =====================================
// COMBINE BUILDING EDGES
// =====================================

export const SUBMITTED_EDGES: CampusEdge[] = [
  ...AQ_DOME_EDGES,
  ...ANGELICO_EDGES,
  ...AQUINAS_EDGES,
  ...AQUINAS2_EDGES,
  ...AQUINAS4_EDGES,
  ...AQUINAS5_EDGES,
  ...DOMINIC_EDGES,
  ...MARTIN_EDGES,
  ...MARTIN2_EDGES,
  ...MARTIN3_EDGES,
];

// Keep only edges whose endpoints exist
// in the combined campus navigation graph.

export const PATHWAY_EDGES: CampusEdge[] =
  SUBMITTED_EDGES.filter(
    edge =>
      CAMPUS_NODES[edge.from] &&
      CAMPUS_NODES[edge.to]
  );

// =====================================
// COMPATIBILITY EXPORTS
// =====================================

// Used by navigationUtils.ts and other
// existing map components.

export const NODES = CAMPUS_NODES;
export const EDGES = PATHWAY_EDGES;
