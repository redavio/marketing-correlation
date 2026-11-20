import type { Results } from "../types";
import { TIPS, ui } from "./tips";

const cell = "whitespace-nowrap border-b border-zinc-200 px-2 py-2 dark:border-zinc-700";

/** The rows behind the numbers, one per period. */
export default function DataView({ res }: { res: Results }) {
  return (
    <section className={ui.panel} data-shot="2">
      <h2 className={ui.h2}>Your data</h2>
      <p className={ui.help}>
        {res.rows} rows, {res.columns.length} columns of numbers. {TIPS.data}
      </p>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr className="text-zinc-500 dark:text-zinc-400">
            <th className={`${cell} text-left font-medium`}>{res.period_name}</th>
            {res.columns.map((c) => (
              <th key={c.name} className={`${cell} text-right font-medium`}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {res.labels.map((label, i) => (
            <tr key={label}>
              <td className={cell}>{label}</td>
              {res.columns.map((c) => (
                <td key={c.name} className={`${cell} text-right font-mono`}>{c.values[i].toLocaleString()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {res.dropped.length > 0 && <p className={ui.help}>Dropped rows: {res.dropped.join(", ")}</p>}
    </section>
  );
}
