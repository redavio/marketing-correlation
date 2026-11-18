// Shape of results.json, written by correlate.py --json.

export interface Pair {
  a: string;
  b: string;
  n: number;
  pearson: number | null;
  spearman: number | null;
  small_sample: boolean;
  diverge: boolean;
  difference: number | null;
}

export interface Results {
  tool: string;
  version: number;
  source: string;
  period_name: string;
  lag: number;
  dropped: string[];
  small_n: number;
  divergence: number;
  rows: number;
  labels: string[];
  columns: { name: string; values: number[] }[];
  pairs: Pair[];
}
