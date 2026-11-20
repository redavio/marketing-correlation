import { useState } from "react";
import type { Results } from "../types";
import DataView from "./DataView";
import ReadView from "./ReadView";
import ResultsView from "./ResultsView";

export const VIEWS = { results: "Results", data: "Your data", read: "How to read it" } as const;
export type View = keyof typeof VIEWS;

/**
 * The whole Marketing Correlation screen for one results.json: a one-line summary, then
 * Results / Your data / How to read it. Takes the result as props and loads nothing itself,
 * so any app can render it (this repo's dashboard reads results.json; a hosted app can pass
 * the same object from its own API).
 */
export default function Correlation({ res, initialView = "results" }: { res: Results; initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {res.source}: {res.rows} rows, {res.columns.length} columns of numbers.
        {res.lag > 0 && ` Lag ${res.lag} ${res.lag === 1 ? "row" : "rows"}.`}
        {res.dropped.length > 0 && ` Dropped rows: ${res.dropped.join(", ")}.`}
      </p>
      <nav className="mb-3 mt-4 flex flex-wrap gap-1.5">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${
              view === v
                ? "border-brand bg-brand text-white"
                : "border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {VIEWS[v]}
          </button>
        ))}
      </nav>
      {view === "results" && <ResultsView res={res} />}
      {view === "data" && <DataView res={res} />}
      {view === "read" && <ReadView res={res} />}
    </div>
  );
}
