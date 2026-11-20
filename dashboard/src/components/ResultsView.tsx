import type { Pair, Results } from "../types";
import { SCALE, TIPS, ui } from "./tips";

const fmt = (v: number | null) => (v === null ? "n/a" : v.toFixed(2));
const rows = (n: number) => `${n} ${n === 1 ? "row" : "rows"}`;

/** Pearson and Spearman for every pair of columns, with the warnings that go with them. */
export default function ResultsView({ res }: { res: Results }) {
  return (
    <section className={ui.panel} data-shot="1">
      <h2 className={ui.h2}>Results</h2>
      <p className={ui.help}>{SCALE}</p>
      <ul className="mt-5 grid gap-4">
        {res.pairs.map((p) => (
          <PairCard key={`${p.a}|${p.b}`} p={p} res={res} />
        ))}
      </ul>
    </section>
  );
}

function PairCard({ p, res }: { p: Pair; res: Results }) {
  return (
    <li className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
      <p className="break-words font-medium">
        {p.a} <span className="font-normal text-zinc-500 dark:text-zinc-400">vs</span> {p.b}
        {res.lag > 0 && (
          <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
            {" "}({p.b} shifted {rows(res.lag)} later)
          </span>
        )}
      </p>
      {p.n < 3 ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Only {p.n} rows left after the lag. Lower the lag or add more rows.
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Pearson" tip={TIPS.pearson} value={fmt(p.pearson)} />
            <Stat label="Spearman" tip={TIPS.spearman} value={fmt(p.spearman)} />
            <Stat label="n" tip={TIPS.n} value={String(p.n)} />
          </dl>
          {(p.pearson === null || p.spearman === null) && (
            <p className={ui.help}>One column never changes, so there is nothing to correlate.</p>
          )}
          {p.small_sample && (
            <p className={ui.warn}>
              Small sample ({p.n} rows). Treat this as a rough read, not a finding. Aim for at least {res.small_n}.
            </p>
          )}
          {p.diverge && p.difference !== null && (
            <p className={ui.warn}>
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
    <div className={`${ui.soft} cursor-help px-3 py-2`} title={tip}>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-semibold">{value}</dd>
    </div>
  );
}
