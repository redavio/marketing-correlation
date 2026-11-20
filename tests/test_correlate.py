import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import correlate  # noqa: E402


def run(*args):
    return subprocess.run([sys.executable, str(ROOT / "correlate.py"), *map(str, args)],
                          capture_output=True, text=True)


def write(tmp_path, text):
    p = tmp_path / "data.csv"
    p.write_text(text)
    return p


def test_math_known_values():
    assert correlate.pearson([1, 2, 3, 4], [2, 4, 6, 8]) == pytest.approx(1.0)
    assert correlate.pearson([1, 2, 3, 4], [8, 6, 4, 2]) == pytest.approx(-1.0)
    assert correlate.pearson([1, 2, 3], [5, 5, 5]) is None  # a flat column has no correlation
    assert correlate.ranks([10, 20, 20, 30]) == [1.0, 2.5, 2.5, 4.0]
    # Spearman sees a perfect curve that Pearson underrates
    x = list(range(1, 13))
    assert correlate.spearman(x, [v ** 3 for v in x]) == pytest.approx(1.0)


def test_lag_lines_up_periods():
    assert correlate.shift([1, 2, 3, 4], [5, 6, 7, 8], 1) == ([1, 2, 3], [6, 7, 8])
    assert correlate.shift([1, 2, 3, 4], [5, 6, 7, 8], -1) == ([2, 3, 4], [5, 6, 7])


def test_planted_signal_found_and_noise_not(tmp_path):
    # pipeline is spend x 3, one week later; noise is unrelated
    spend = [10, 40, 20, 50, 30, 60, 15, 45, 25, 55, 35, 65, 12, 48]
    noise = [6, 2, 8, 3, 3, 7, 1, 9, 5, 4, 8, 2, 6, 5]
    pipeline = [0] + [s * 3 for s in spend[:-1]]
    rows = ["week,spend,pipeline,noise"] + [f"{i+1},{a},{b},{c}" for i, (a, b, c) in enumerate(zip(spend, pipeline, noise))]
    f = write(tmp_path, "\n".join(rows))
    out = tmp_path / "r.json"
    assert run(f, "--lag", 1, "--json", out).returncode == 0
    pairs = {(p["a"], p["b"]): p for p in json.loads(out.read_text())["pairs"]}
    assert pairs[("spend", "pipeline")]["pearson"] == pytest.approx(1.0)
    assert abs(pairs[("spend", "noise")]["pearson"]) < 0.2


def test_example_files_run():
    for f in (ROOT / "examples").glob("*.csv"):
        r = run(f)
        assert r.returncode == 0, r.stderr
        assert "Pearson" in r.stdout


def test_small_sample_warned(tmp_path):
    f = write(tmp_path, "week,a,b\n1,1,2\n2,2,4\n3,3,5\n4,4,9\n")
    r = run(f)
    assert "Small sample" in r.stdout


def test_bad_input_clear_error(tmp_path):
    r = run(write(tmp_path, "week,a,b\n1,1,2\n2,oops,4\n"))
    assert r.returncode != 0 and 'Row 3, column "a": "oops" is not a number.' in r.stderr
    r = run(write(tmp_path, "week,a\n1,1\n2,2\n"))
    assert r.returncode != 0 and "at least two numeric columns" in r.stderr
    r = run(write(tmp_path, "week,a,b\n1,1,2\n2,2,3\n3,3,4\n"), "--drop", 99)
    assert r.returncode != 0 and "no row labeled 99" in r.stderr


def test_empty_file(tmp_path):
    r = run(write(tmp_path, ""))
    assert r.returncode != 0 and "Need a header row" in r.stderr


def test_money_and_percent_cleaned(tmp_path):
    f = write(tmp_path, 'week,spend,rate\n1,"$1,000",10%\n2,"$2,000",20%\n3,"$3,000",30%\n')
    r = run(f)
    assert r.returncode == 0 and "1.00" in r.stdout
