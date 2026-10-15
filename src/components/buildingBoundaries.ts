    /**
     * TomaSafe — Building Boundaries
     * Coordinates are normalized to 0–100 from the original 800×800 map.
     *
     * Ten navigation sections belong to five physical buildings.
     * We preserve each original section polygon and ID so the existing
     * navigation graph and section-specific evacuation assignments stay intact.
     */

    export type MapPoint = { x: number; y: number };

    export type BuildingBoundary = {
    id: string;
    name: string;
    polygon: MapPoint[];
    };

    export type PhysicalBuildingId =
    | 'AQ_DOME'
    | 'FRA_ANGELICO'
    | 'AQUINAS'
    | 'DOMINIC'
    | 'MARTIN';

    export type PhysicalBuilding = {
    id: PhysicalBuildingId;
    name: string;
    /** Original section IDs, each retaining its own polygon and evacuation assignment. */
    sectionIds: readonly string[];
    };

    export type DetectedPhysicalBuilding = PhysicalBuilding & {
    /** Original polygon ID that contains the GPS position. */
    detectedSectionId: string;
    };

    // These are the five names displayed to the user during confirmation.
    export const PHYSICAL_BUILDINGS: readonly PhysicalBuilding[] = [
    { id: 'AQ_DOME', name: 'AQ Dome', sectionIds: ['AQ_DOME'] },
    { id: 'FRA_ANGELICO', name: 'Fra. Angelico Building', sectionIds: ['FRA_ANGELICO'] },
    {
        id: 'AQUINAS', name: 'Aquinas Building',
        sectionIds: ['AQUINAS', 'AQUINAS_2', 'AQUINAS5', 'AQUINAS4'],
    },
    { id: 'DOMINIC', name: 'Dominic Building', sectionIds: ['DOMINIC'] },
    {
        id: 'MARTIN', name: 'Martin Building',
        sectionIds: ['MARTIN', 'MARTIN2', 'MARTIN3'],
    },
    ];

    // Original section polygons, unchanged.
    export const BUILDING_BOUNDARIES: BuildingBoundary[] = [
    {
        id: 'AQ_DOME', name: 'AQ Dome',
        polygon: [
        { x: 39.91, y: 79.46 }, { x: 37.82, y: 81.55 },
        { x: 37.5, y: 84.23 }, { x: 38.05, y: 86.86 },
        { x: 40.05, y: 89 }, { x: 42.55, y: 89.91 },
        { x: 45.32, y: 90.27 }, { x: 48.59, y: 90.23 },
        { x: 50.59, y: 89.73 }, { x: 52, y: 88.23 },
        { x: 53.55, y: 84.82 }, { x: 52.54, y: 81.91 },
        { x: 51.05, y: 80.23 }, { x: 48.05, y: 78.82 },
        { x: 45.5, y: 78.68 }, { x: 42.96, y: 78.64 },
        { x: 40, y: 79.46 },
        ],
    },
    {
        id: 'FRA_ANGELICO', name: 'Fra. Angelico Building',
        polygon: [
        { x: 23.59, y: 76.58 }, { x: 28.38, y: 76.79 },
        { x: 28.41, y: 82.90 }, { x: 35.56, y: 83.11 },
        { x: 35.70, y: 87.29 }, { x: 23.41, y: 86.97 },
        { x: 23.56, y: 76.54 },
        ],
    },
    {
        id: 'AQUINAS', name: 'Aquinas Building',
        polygon: [
        { x: 43.57, y: 68.76 }, { x: 43.38, y: 72.57 },
        { x: 60.49, y: 73.18 }, { x: 60.80, y: 69.49 },
        { x: 43.80, y: 68.68 },
        ],
    },
    {
        id: 'AQUINAS_2', name: 'Aquinas 2',
        polygon: [
        { x: 44.39, y: 54.22 }, { x: 44.23, y: 58.22 },
        { x: 56.81, y: 58.68 }, { x: 57.34, y: 54.62 },
        { x: 44.52, y: 54.16 },
        ],
    },
    {
        id: 'AQUINAS5', name: 'Aquinas 5',
        polygon: [
        { x: 56.66, y: 57.80 }, { x: 56.56, y: 55.10 },
        { x: 70.51, y: 55.40 }, { x: 70.49, y: 58.20 },
        { x: 56.86, y: 57.73 },
        ],
    },
    {
        id: 'DOMINIC', name: 'Dominic Building',
        polygon: [
        { x: 64.53, y: 27.93 }, { x: 64.30, y: 32.57 },
        { x: 69.21, y: 32.62 }, { x: 68.89, y: 46.25 },
        { x: 64.26, y: 45.98 }, { x: 63.94, y: 50.48 },
        { x: 71.62, y: 50.75 }, { x: 72.17, y: 41.80 },
        { x: 73.26, y: 41.66 }, { x: 73.49, y: 38.03 },
        { x: 72.35, y: 37.62 }, { x: 72.53, y: 32.62 },
        { x: 72.26, y: 28.25 }, { x: 64.71, y: 27.98 },
        ],
    },
    {
        id: 'MARTIN', name: 'Martin Building',
        polygon: [
        { x: 68.92, y: 22.28 }, { x: 68.92, y: 25.47 },
        { x: 72.98, y: 25.40 }, { x: 73.17, y: 23.09 },
        { x: 82.67, y: 23.28 }, { x: 82.85, y: 17.97 },
        { x: 73.67, y: 17.78 }, { x: 73.17, y: 22.03 },
        { x: 69.04, y: 22.15 },
        ],
    },
    {
        id: 'MARTIN2', name: 'Martin 2 Building',
        polygon: [
        { x: 47.9, y: 24.63 }, { x: 48.07, y: 21.92 },
        { x: 67.2, y: 22.61 }, { x: 67.51, y: 25.18 },
        { x: 47.79, y: 24.63 },
        ],
    },
    {
        id: 'MARTIN3', name: 'Martin 3 Building',
        polygon: [
        { x: 45.64, y: 5.98 }, { x: 45.52, y: 7.45 },
        { x: 65.33, y: 8.1 }, { x: 65.49, y: 6.95 },
        { x: 45.77, y: 6.14 },
        ],
    },
    {
        id: 'AQUINAS4', name: 'Aquinas 4 Building',
        polygon: [
        { x: 60.65, y: 69.39 }, { x: 60.53, y: 71.92 },
        { x: 78.59, y: 72.56 }, { x: 78.79, y: 64.06 },
        { x: 76.65, y: 63.85 }, { x: 76.15, y: 69.97 },
        { x: 60.77, y: 69.38 },
        ],
    },
    ];

    /** Checks whether a point is inside or on the boundary of a polygon. */
    export function isPointInsideBuilding(point: MapPoint, polygon: MapPoint[]): boolean {
    if (polygon.length < 3) return false;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[j];
        const b = polygon[i];
        const cross = (point.x - a.x) * (b.y - a.y) -
        (point.y - a.y) * (b.x - a.x);

        if (
        Math.abs(cross) < 1e-8 &&
        point.x >= Math.min(a.x, b.x) - 1e-8 &&
        point.x <= Math.max(a.x, b.x) + 1e-8 &&
        point.y >= Math.min(a.y, b.y) - 1e-8 &&
        point.y <= Math.max(a.y, b.y) + 1e-8
        ) return true;

        if ((a.y > point.y) !== (b.y > point.y)) {
        const hitX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
        if (point.x < hitX) inside = !inside;
        }
    }
    return inside;
    }

    /**
     * Backward-compatible section detector. Returns one of the original ten
     * section IDs so any existing use of detectBuilding does not break.
     */
    export function detectBuilding(point: MapPoint): BuildingBoundary | null {
    return BUILDING_BOUNDARIES.find(building =>
        isPointInsideBuilding(point, building.polygon)
    ) ?? null;
    }

    /** Obtain a physical building by its public ID (useful for manual confirmation). */
    export function getPhysicalBuilding(
    id: PhysicalBuildingId
    ): PhysicalBuilding | null {
    return PHYSICAL_BUILDINGS.find(building => building.id === id) ?? null;
    }

    /**
     * Detect the physical building while retaining the exact original section
     * containing userPos. Use this function for the building confirmation UI.
     */
    export function detectPhysicalBuilding(
    point: MapPoint
    ): DetectedPhysicalBuilding | null {
    const section = detectBuilding(point);
    if (!section) return null;

    const building = PHYSICAL_BUILDINGS.find(group =>
        group.sectionIds.includes(section.id)
    );
    if (!building) return null;

    return { ...building, detectedSectionId: section.id };
    }
