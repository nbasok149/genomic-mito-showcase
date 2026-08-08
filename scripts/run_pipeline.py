#!/usr/bin/env python3
"""
Genomic Pipeline CLI Entrypoint
===============================
Runs variant calling on .bp or .blast sequencing alignment files,
computes ancestry-conditioned GRM-style weighted distance matrices,
and generates phylogenetic tree structures.
"""

import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.callers import process_single_file, load_config, load_fasta
from core.distance import (
    compute_weighted_distance_metric,
    compute_distance_matrix,
    save_distance_matrix,
    load_sample_variants_from_csv
)


def main():
    parser = argparse.ArgumentParser(description="Genomic Mito Variant Calling & Weighted Distance Pipeline")
    parser.add_argument("--input", "-i", type=str, help="Input .bp or .blast file, or directory of alignment files")
    parser.add_argument("--config", "-c", type=str, default="config/filter.yaml", help="Path to filter.yaml")
    parser.add_argument("--vaf", type=float, default=None, help="Override high VAF threshold")
    parser.add_argument("--lambda-param", "-l", type=float, default=0.5, dest="lambda_param",
                        help="Haplogroup conditioning parameter lambda (default: 0.5)")
    parser.add_argument("--summaries-dir", "-s", type=str, default="data/raw_summaries/*.csv",
                        help="Glob pattern for sample summary CSV files")
    parser.add_argument("--output-matrix", "-o", type=str, default="data/processed/distance_matrix.csv",
                        help="Output path for pairwise distance matrix CSV")
    args = parser.parse_args()

    config = load_config(args.config)
    ref_fasta_path = config.get('reference_fasta', 'data/reference/mtdna.fa')
    ref_genome = load_fasta(ref_fasta_path)

    if args.input and os.path.isfile(args.input):
        target_files = [args.input]
    elif args.input and os.path.isdir(args.input):
        target_files = [os.path.join(args.input, f) for f in os.listdir(args.input) if f.endswith('.bp') or f.endswith('.blast')]
    else:
        # Search current directory
        target_files = [f for f in os.listdir('.') if f.endswith('.bp') or f.endswith('.blast')]

    if not target_files:
        print("No .bp or .blast alignment files found to process.")
        print(f"Calculating ancestry-conditioned weighted distance matrix from '{args.summaries_dir}'...")
    else:
        print(f"Processing {len(target_files)} alignment file(s)...")
        for fpath in target_files:
            bname, f_all, f_filt, f_low = process_single_file(fpath, config, ref_genome, args.vaf)
            print(f"  Processed {bname} -> {f_filt}")

    # Compute weighted distance matrix using the GRM-style rare-variant weighting mechanism
    samples, sample_data, _ = load_sample_variants_from_csv(args.summaries_dir)
    if not samples:
        # Fallback to current directory
        samples, sample_data, _ = load_sample_variants_from_csv("*.csv")

    if samples:
        results = compute_weighted_distance_metric(
            samples, 
            sample_data, 
            lambda_param=args.lambda_param, 
            eps=1e-6
        )
        save_distance_matrix(samples, results['tree_distance_matrix'], args.output_matrix)
        print(f"Ancestry-conditioned weighted distance matrix computed successfully for {len(samples)} samples (V={results['polymorphic_sites_count']} polymorphic sites, lambda={args.lambda_param}).")
    else:
        print("No sample summary CSV files found to compute distance matrix.")


if __name__ == "__main__":
    main()
