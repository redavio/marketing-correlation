import { useEffect, useState } from "react";
import { BRAND } from "./brand";
import type { Pair, Results } from "./types";

const TIPS = {
  data: "Paste from a spreadsheet or a CSV. A date or week column first is optional. Then two or more columns of numbers covering the same periods. Commas, $, and % are fine.",
  lag: "Shifts the second column later by this many rows. If an email drops Tuesday and conversions land Friday, the two may not line up until you shift one.",
  pearson: "Uses the actual values. Asks how close the points sit to a straight line.",
  spearman:
    "Ranks both columns first, then runs the same math on the ranks. Asks whether they put the periods in the same order. Handles relationships that consistently go one direction, even if not a straight line.",
  n: "How many paired rows went into the math, after any lag.",
};

const fmt = (v: number | null) => (v === null ? "n/a" : v.toFixed(2));
const num = (v: number) => v.toLocaleString();

const TABS = { results: "Results", data: "Your data", read: "How to read it" } as const;
type Tab = keyof typeof TABS;

export default function App() {
  const [res, setRes] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>(() => {
    const v = new URLSearchParams(location.search).get("view");
    return v && v in TABS ? (v as Tab) : "results";
  });

  useEffect(() => {
    const src = new URLSearchParams(location.search).get("src") || "results.json";
    fetch(src)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Couldn't load ${src}.`))))
      .then(setRes)
      .catch((e) => setError(e.message));
  }, []);

  const open = (file: File) =>
    file.text().then((t) => {
      try {
        setRes(JSON.parse(t));
        setError("");
      } catch {
        setError("That file isn't a Marketing Correlation results file.");
      }
    });

  return (
    <div className="page">
      <header>
        <div>
          <h1>{BRAND.logo && <img src={BRAND.logo} alt="" className="logo" />}{BRAND.name}</h1>
          {res && (
            <p className="muted">
              {res.source}: {res.rows} rows, {res.columns.length} columns of numbers.
              {res.lag > 0 && ` Lag ${res.lag} ${res.lag === 1 ? "row" : "rows"}.`}
              {res.dropped.length > 0 && ` Dropped rows: ${res.dropped.join(", ")}.`}
            </p>
          )}
        </div>
        <label className="file">
          Open results file
          <input type="file" accept=".json" onChange={(e) => e.target.files?.[0] && open(e.target.files[0])} />
        </label>
      </header>
      {error && <p className="note">{error} Run correlate.py with --json results.json, then open it here.</p>}
      {res && (
        <>
          <nav>
            {(Object.keys(TABS) as Tab[]).map((t) => (
              <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
                {TABS[t]}
              </button>
            ))}
          </nav>
          {tab === "results" && <ResultsView res={res} />}
          {tab === "data" && <DataView res={res} />}
          {tab === "read" && <ReadView res={res} />}
        </>
      )}
    </div>
  );
}

function ResultsView({ res }: { res: Results }) {
  return (
    <section className="panel" data-shot="1">
      <h2>Results</h2>
      <p className="help">
        1 means they move together. -1 means one goes up as the other goes down. 0 means no relationship.
        Correlation, not causation.
      </p>
      <ul className="pairs">
        {res.pairs.map((p) => (
          <PairCard key={`${p.a}|${p.b}`} p={p} res={res} />
        ))}
      </ul>
    </section>
  );
}

function PairCard({ p, res }: { p: Pair; res: Results }) {
  const lag = res.lag;
  return (
    <li className="pair">
      <p className="pair-title">
        {p.a} <span className="muted">vs</span> {p.b}
        {lag > 0 && (
          <span className="muted small"> ({p.b} shifted {lag} {lag === 1 ? "row" : "rows"} later)</span>
        )}
      </p>
      {p.n < 3 ? (
        <p className="error">Only {p.n} rows left after the lag. Lower the lag or add more rows.</p>
      ) : (
        <>
          <dl className="stats">
            <Stat label="Pearson" tip={TIPS.pearson} value={fmt(p.pearson)} />
            <Stat label="Spearman" tip={TIPS.spearman} value={fmt(p.spearman)} />
            <Stat label="n" tip={TIPS.n} value={String(p.n)} />
          </dl>
          {(p.pearson === null || p.spearman === null) && (
            <p className="help">One column never changes, so there is nothing to correlate.</p>
          )}
          {p.small_sample && (
            <p className="warn">
              Small sample ({p.n} rows). Treat this as a rough read, not a finding. Aim for at least {res.small_n}.
            </p>
          )}
          {p.diverge && p.difference !== null && (
            <p className="warn">
              Pearson and Spearman differ by {p.difference.toFixed(2)} (more than {res.divergence}). Usually one
              outlier period or a curved relationship. Look at the rows.
            </p>
          )}
        </>
      )}
    </li>
  );
}

function Stat({ label, tip, value }: { label: string; tip: string; value: string }) {
  return (
    <div className="stat" title={tip}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DataView({ res }: { res: Results }) {
  return (
    <section className="panel" data-shot="2">
      <h2>Your data</h2>
      <p className="help">
        {res.rows} rows, {res.columns.length} columns of numbers. {TIPS.data}
      </p>
      <table>
        <thead>
          <tr>
            <th>{res.period_name}</th>
            {res.columns.map((c) => <th key={c.name} className="right">{c.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {res.labels.map((label, i) => (
            <tr key={label}>
              <td>{label}</td>
              {res.columns.map((c) => <td key={c.name} className="right mono">{num(c.values[i])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {res.dropped.length > 0 && <p className="help">Dropped rows: {res.dropped.join(", ")}</p>}
    </section>
  );
}

function ReadView({ res }: { res: Results }) {
  const terms: [string, string][] = [
    ["Pearson", TIPS.pearson],
    ["Spearman", TIPS.spearman],
    ["n", TIPS.n],
    ["Lag (rows)", `${TIPS.lag} This run: ${res.lag}.`],
  ];
  return (
    <section className="panel" data-shot="3">
      <h2>How to read it</h2>
      <p className="help">
        1 means they move together. -1 means one goes up as the other goes down. 0 means no relationship.
        Correlation, not causation.
      </p>
      <dl className="terms">
        {terms.map(([t, d]) => (
          <div key={t}>
            <dt>{t}</dt>
            <dd>{d}</dd>
          </div>
        ))}
      </dl>
      <p className="warn">Under {res.small_n} rows, treat the result as a rough read, not a finding.</p>
      <p className="warn">
        When Pearson and Spearman differ by more than {res.divergence}, it is usually one outlier period or a curved
        relationship. Look at the rows.
      </p>
    </section>
  );
}
