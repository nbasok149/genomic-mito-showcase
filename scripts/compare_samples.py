#!/usr/bin/env python3
"""
Sample Comparison CLI Tool
==========================
CLI wrapper to compare two mutation call files (.mut or .csv).
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from core.comparator import compare_mutations

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/compare_samples.py <sample1.mut/csv> <sample2.mut/csv> [output.tsv]")
        sys.exit(1)

    s1 = sys.argv[1]
    s2 = sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else f"{os.path.splitext(os.path.basename(s1))[0]}_vs_{os.path.splitext(os.path.basename(s2))[0]}.tsv"

    compare_mutations(s1, s2, out)
