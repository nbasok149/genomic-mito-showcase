#!/usr/bin/env python3
"""
Distance Matrix Calculator
==========================
Computes pairwise VAF Manhattan distances across samples:
    d(S_i, S_j) = sum_{p in P} |VAF_{i,p} - VAF_{j,p}|
"""

import os
import csv
import glob


def compute_distance_matrix(summary_dir="data/raw_summaries/*.csv"):
    """
    Computes pairwise Manhattan distance matrix from per-sample summary CSVs.
    
    Returns:
        tuple: (samples_list, 2D distance matrix list)
    """
    file_paths = glob.glob(summary_dir)
    if not file_paths:
        return [], []

    data = {}
    all_pos = set()
    samples = []

    for f in sorted(file_paths):
        name = os.path.basename(f).replace(".csv", "").replace(".var", "")
        samples.append(name)
        data[name] = {}
        with open(f, 'r') as file:
            reader = csv.reader(file)
            next(reader, None)
            for row in reader:
                if row and len(row) >= 2:
                    try:
                        pos, vaf = int(row[0]), float(row[1])
                        data[name][pos] = vaf
                        all_pos.add(pos)
                    except ValueError:
                        continue

    n = len(samples)
    dist = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(i + 1, n):
            d = sum(abs(data[samples[i]].get(p, 0.0) - data[samples[j]].get(p, 0.0)) for p in all_pos)
            dist[i][j] = dist[j][i] = d

    return samples, dist


def save_distance_matrix(samples, matrix, output_path="data/processed/distance_matrix.csv"):
    """Saves calculated distance matrix to CSV format."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([""] + samples)
        for i in range(len(samples)):
            writer.writerow([samples[i]] + matrix[i])
    print(f"Distance matrix successfully saved to {output_path}")
