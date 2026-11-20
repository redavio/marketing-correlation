import type { Results } from "../types";
import { SCALE, TIPS, ui } from "./tips";

/** What Pearson, Spearman, n and lag mean, with this run's settings. */
export default function ReadView({ res }: { res: Results }) {
  const terms: [string, string][] = [
    ["Pearson", TIPS.pearson],
    ["Spearman", TIPS.spearman],
    ["n", TIPS.n],
    ["Lag (rows)", `${TIPS.lag} This run: ${res.lag}.`],
  ];
  return (
    <section className={ui.panel} data-shot="3">
      <h2 className={ui.h2}>How to read it</h2>
      <p className={ui.help}>{SCALE}</p>
      <dl className="mt-4 grid gap-3">
        {terms.map(([t, d]) => (
          <div key={t} className={`${ui.soft} px-3 py-2.5`}>
            <dt className="text-sm font-semibold">{t}</dt>
            <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{d}</dd>
          </div>
        ))}
      </dl>
      <p className={ui.warn}>Under {res.small_n} rows, treat the result as a rough read, not a finding.</p>
      <p className={ui.warn}>
        When Pearson and Spearman differ by more than {res.divergence}, it is usually one outlier period or a curved
        relationship. Look at the rows.
      </p>
    </section>
  );
}
