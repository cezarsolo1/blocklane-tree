// tree.unplanned.v1.ts
// PURPOSE: Pure wizard structure (navigation + labels) without business logic.
// IMPORTANT:
// - This file contains only "where the user can click" (menus + leaf references).
// - DO NOT put ticketing, SLAs, media links, or forms here. That lives in outcomes.unplanned.v1.ts.
// - Keep this file small & cacheable. It changes when UX structure/labels change.
//
// INTEGRATION NOTES:
// - The renderer takes `entry` and resolves through `nodes` by matching `id`
// - For a `menu` node: render tiles from `children: [{ref: "..."}]`
// - For a `leaf` node: STOP rendering tree and look up its outcome by `leaf.id` in outcomes.unplanned.v1.ts
// - `id` and `code` must be stable. `id` is used for internal refs; `code` is nice for analytics and i18n mapping.
// - `aliases` are optional search synonyms; they do not appear in tile UI but should boost search.

export type MenuNode = {
  id: string;               // unique node identifier; referenced by `children.ref`
  code: string;             // human-readable stable code (for analytics, i18n keys, etc.)
  type: "menu";             // strictly "menu" here
  title: string;            // tile title to display
  aliases?: string[];       // hidden synonyms for search (e.g., "wc" → "toilet")
  children: Array<{ ref: string }>; // refs to other nodes by `id`
};

export type LeafRefNode = {
  // This is a LEAF as seen by the tree: it’s just a clickable tile that ends the wizard.
  // The behavior (ticketing, forms, video, schedules) is in outcomes.unplanned.v1.ts.
  id: string;               // must match Outcome.leafId
  code: string;             // must match Outcome.code (stays stable across versions)
  type: "leaf";             // strictly "leaf" here
  title: string;            // tile title to display
  aliases?: string[];       // search synonyms for this leaf
};

export type Tree = {
  version: string;          // bump when you change structure
  locale: string;           // default display locale of titles in this file
  entry: string;            // id of the first node to render
  meta: {
    treeId: string;         // stable identifier of this tree
    i18nNamespace: string;  // where your UI pulls translations for these titles (optional)
    validFrom: string;      // YYYY-MM-DD; handy for rollbacks / AB tests
  };
  nodes: Array<MenuNode | LeafRefNode>;
};

export const tree: Tree = {
  version: "1.0.0",
  locale: "en-US",
  entry: "node.start", // renderer begins here
  meta: {
    treeId: "unplanned_maintenance_sample",
    i18nNamespace: "tree.unplanned.sample",
    validFrom: "2025-09-01",
  },
  nodes: [
    {
      // --- START (level 0) ---
      // UI: show two tiles → Inside / Outside
      id: "node.start",
      code: "START",
      type: "menu",
      title: "Where is the issue?",
      aliases: ["start", "begin", "entry"], // search-only
      children: [{ ref: "node.inside_house" }, { ref: "node.outside_house" }],
    },

    {
      // --- LEVEL 1: Inside the house ---
      // UI: show Bathroom & Toilet + Kitchen
      id: "node.inside_house",
      code: "AREA_INSIDE",
      type: "menu",
      title: "Inside the house",
      aliases: ["indoors", "in home", "apartment interior"],
      children: [{ ref: "node.bathroom_toilet" }, { ref: "node.kitchen" }],
    },

    {
      // --- LEVEL 1: Outside the house ---
      // Minimal placeholder for testing; safe to add later without touching outcomes.
      id: "node.outside_house",
      code: "AREA_OUTSIDE",
      type: "menu",
      title: "Outside the house",
      aliases: ["outdoors", "building exterior"],
      children: [],
    },

    {
      // --- LEVEL 2: Bathroom & Toilet ---
      // IMPORTANT: This menu has at least one leaf under it → add an "option_missing" leaf here.
      id: "node.bathroom_toilet",
      code: "AREA_BATHROOM_TOILET",
      type: "menu",
      title: "Bathroom & Toilet",
      aliases: ["bathroom", "toilet", "wc", "restroom"],
      children: [
        { ref: "node.toilet" },                  // deeper menu
        { ref: "leaf.shower_leak_small" },       // direct leaf (end of wizard in this branch)
        { ref: "leaf.option_missing.bathroom" }, // "Mijn optie ontbreekt" for any menu with leaves
      ],
    },

    {
      // --- LEVEL 3: Toilet ---
      // IMPORTANT: Contains leaves → include "option_missing".
      id: "node.toilet",
      code: "CAT_TOILET",
      type: "menu",
      title: "Toilet",
      aliases: ["wc", "lavatory", "loo"],
      children: [
        { ref: "leaf.toilet_seat_broken" },     // end leaf (tenant responsibility)
        { ref: "leaf.toilet_water_on_floor" },  // end leaf (emergency)
        { ref: "leaf.option_missing.toilet" },  // catch-all for missing options
      ],
    },

    {
      // --- LEVEL 2: Kitchen ---
      // IMPORTANT: Contains leaves → include "option_missing".
      id: "node.kitchen",
      code: "AREA_KITCHEN",
      type: "menu",
      title: "Kitchen",
      aliases: ["cooking area", "kitchenette"],
      children: [
        { ref: "leaf.kitchen_tap_dripping_video" }, // video flow (yes/no)
        { ref: "leaf.furnace_service" },            // self-scheduling example
        { ref: "leaf.option_missing.kitchen" },     // catch-all for kitchen
      ],
    },

    // ===== Leaf references (end nodes) =====
    // NOTE: These are just *references*. All behavior is defined in outcomes file.
    { id: "leaf.toilet_seat_broken", code: "TENRESP_TOILET_SEAT_BROKEN", type: "leaf", title: "Toilet seat broken", aliases: ["wc seat broken", "toilet lid broken", "wc-bril kapot"] },
    { id: "leaf.toilet_water_on_floor", code: "EMERG_TOILET_WATER_ON_FLOOR", type: "leaf", title: "Water flooding from toilet", aliases: ["water on floor", "toilet overflow", "wc overstroming"] },
    { id: "leaf.kitchen_tap_dripping_video", code: "VIDEO_KITCHEN_TAP_DRIPPING", type: "leaf", title: "Dripping tap (kitchen)", aliases: ["dripping faucet", "leaking tap", "tap drips"] },
    { id: "leaf.shower_leak_small", code: "LEAK_SHOWER_SMALL", type: "leaf", title: "Small leak near the shower", aliases: ["shower drip", "leak bathroom", "tiny leak"] },
    { id: "leaf.furnace_service", code: "FURNACE_SERVICE_SELF_SCHEDULE", type: "leaf", title: "Furnace service needed", aliases: ["boiler service", "heater maintenance"] },

    // ===== Option-missing leaves =====
    // MUST be added to any menu that contains at least one leaf in `children`.
    { id: "leaf.option_missing.bathroom", code: "OPTION_MISSING_BATHROOM", type: "leaf", title: "My option is missing (Bathroom & Toilet)", aliases: ["option missing", "can't find my issue", "mijn optie ontbreekt"] },
    { id: "leaf.option_missing.toilet", code: "OPTION_MISSING_TOILET", type: "leaf", title: "My option is missing (Toilet)", aliases: ["option missing", "can't find", "mijn optie ontbreekt"] },
    { id: "leaf.option_missing.kitchen", code: "OPTION_MISSING_KITCHEN", type: "leaf", title: "My option is missing (Kitchen)", aliases: ["option missing", "can't find", "mijn optie ontbreekt"] },
  ],
} as const;
