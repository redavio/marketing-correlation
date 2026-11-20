// Plain-words explanations, shown as hovers and on the "How to read it" view.
export const TIPS = {
  data: "Paste from a spreadsheet or a CSV. A date or week column first is optional. Then two or more columns of numbers covering the same periods. Commas, $, and % are fine.",
  lag: "Shifts the second column later by this many rows. If an email drops Tuesday and conversions land Friday, the two may not line up until you shift one.",
  pearson: "Uses the actual values. Asks how close the points sit to a straight line.",
  spearman:
    "Ranks both columns first, then runs the same math on the ranks. Asks whether they put the periods in the same order. Handles relationships that consistently go one direction, even if not a straight line.",
  n: "How many paired rows went into the math, after any lag.",
};

export const SCALE =
  "1 means they move together. -1 means one goes up as the other goes down. 0 means no relationship. Correlation, not causation.";

// Shared Tailwind classes, so every view looks the same.
export const ui = {
  panel: "overflow-x-auto rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700",
  h2: "text-lg font-semibold",
  help: "mb-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400",
  warn: "mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  soft: "rounded-lg bg-zinc-100 dark:bg-zinc-800",
};
