#!/usr/bin/env python3
"""
Genomic Pipeline CLI Entrypoint
===============================
Runs variant calling on .bp or .blast sequencing alignment files
and calculates pairwise Manhattan distance matrices.
"""

import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.callers import process_single_file, load_config, load_fasta
from core.distance import compute_distance_matrix, save_distance_matrix


def main():
    parser = argparse.ArgumentParser(description="Genomic Mito Variant Calling Pipeline")
    parser.add_argument("--input", "-i", type=str, help="Input .bp or .blast file, or directory")
    parser.add_argument("--config", "-c", type=str, default="config/filter.yaml", help="Path to filter.yaml")
    parser.add_argument("--vaf", type=float, default=None, help="Override high VAF threshold")
    args = parser.parse_args()

    config = load_config(args.config)
    ref_fasta_path = config.get('reference_fasta', 'data/reference/mtdna.fa')
    ref_genome = load_fasta(ref_fasta_path)

    if args.input and os.path.isfile(args.input):
        target_files = [args.input]
    elif args.input and os.path.isdir(args.input):
        target_files = [os.path.join(args.input, f) for f in os.listdir(args.input) if f.endswith('.bp') or f.endswith('.blast')]
    else:
        # Search current or data directory
        target_files = [f for f in os.listdir('.') if f.endswith('.bp') or f.endswith('.blast')]

    if not target_files:
        print("No .bp or .blast alignment files found to process.")
        print("Calculating distance matrix from existing raw summaries...")
    else:
        print(f"Processing {len(target_files)} alignment file(s)...")
        for fpath in target_files:
            bname, f_all, f_filt, f_low = process_single_file(fpath, config, ref_genome, args.vaf)
            print(f"  Processed {bname} -> {f_filt}")

    # Re-compute distance matrix from raw summaries
    samples, matrix = compute_distance_matrix("data/raw_summaries/*.csv")
    if samples:
        save_distance_matrix(samples, matrix, "data/processed/distance_matrix.csv")


if __name__ == "__main__":
    main()
