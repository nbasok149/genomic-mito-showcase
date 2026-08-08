#!/usr/bin/env python3
"""
Ancestry-Aware & Frequency-Weighted Distance Metric & Phylogenetic Tree Engine
==============================================================================
Implements the core GRM-style rare-variant weighting mechanism:

1. Similarity Matrix K(i, j):
       K(i, j) = (1 / V) * sum_{v in V} [ (VAF_{i,v} - p_v) * (VAF_{j,v} - p_v) ] / [ p_v * (1 - p_v) ]
   where monomorphic sites (p_v <= 0 or p_v >= 1) are dropped.

2. Population Averaging (Families Counted Once):
       VAF_{f, v} = (1 / |S_f|) * sum_{i in S_f} VAF_{i, v}
       p_v^{global} = (1 / |F|) * sum_{f in F} VAF_{f, v}

3. Haplogroup Conditioning:
       hat{p}_v^{(g)} = lambda * p_v^{(g)} + (1 - lambda) * p_v^{global}
   preventing lineage-specific variants from masquerading as close kinship.

4. Distance Conversion:
       D(i, j) = max_{a, b} K(a, b) - K(i, j)
   with self-distance normalized D_tree(i, i) = 0 for hierarchical UPGMA clustering.
"""

import os
import csv
import glob
import math
import json
from collections import defaultdict


def infer_family_and_group(sample_name):
    """
    Infers haplogroup/population group and family ID from sample name.
    Examples:
        'UK_F_NIKM'  -> group='UK', family='UK_NIK'
        'IN_F_RISG'  -> group='IN', family='IN_RIS'
        'IS_F_VYSM'  -> group='IS', family='IS_VYS'
        'NA_F_NGM'   -> group='NA', family='NA'
    """
    clean = os.path.basename(sample_name).replace('.csv', '').replace('.var', '').replace('.mut', '')
    parts = clean.split('_')
    
    if len(parts) >= 3:
        group = parts[0]
        sub_id = parts[2]
        # Strip trailing digits
        base_sub = sub_id.rstrip('0123456789')
        # Strip single relationship/generation letter if root is at least 3 letters
        if len(base_sub) >= 4 and base_sub[-1] in ('M', 'G', 'F', 'A', 'H', 'C', 'S'):
            base_sub = base_sub[:-1]
        family = f"{group}_{base_sub}" if base_sub else group
    elif len(parts) >= 1 and parts[0]:
        group = parts[0]
        family = parts[0]
    else:
        group = "UNKNOWN"
        family = "UNKNOWN"
        
    return group, family


def load_sample_variants_from_csv(summary_dir="data/raw_summaries/*.csv"):
    """
    Loads sample variant allele frequencies (VAFs) from CSV/TSV summary files.
    Returns:
        tuple: (samples_list, data_dict, all_positions_set)
               where data_dict[sample][pos] = float VAF in [0.0, 1.0]
    """
    file_paths = glob.glob(summary_dir)
    if not file_paths:
        return [], {}, set()

    data = {}
    all_pos = set()
    samples = []

    for f in sorted(file_paths):
        name = os.path.basename(f).replace(".csv", "").replace(".var", "").replace(".mut", "")
        if name == "distance_matrix":
            continue
        samples.append(name)
        data[name] = {}
        
        with open(f, 'r') as file:
            # Detect delimiter
            first_line = file.readline()
            file.seek(0)
            delimiter = '\t' if '\t' in first_line else ','
            
            reader = csv.reader(file, delimiter=delimiter)
            header = next(reader, None)
            for row in reader:
                if row and len(row) >= 2:
                    try:
                        pos = int(row[0])
                        # Handle either raw VAF (col 1 or 5)
                        vaf_raw = float(row[1]) if row[1].replace('.', '', 1).isdigit() else 0.0
                        if len(row) >= 6 and row[5].replace('.', '', 1).isdigit():
                            vaf_raw = float(row[5])
                        
                        # Normalize percentage (0-100) to fraction (0.0 - 1.0)
                        vaf = vaf_raw / 100.0 if vaf_raw > 1.0 else vaf_raw
                        vaf = max(0.0, min(1.0, vaf))
                        
                        data[name][pos] = vaf
                        all_pos.add(pos)
                    except (ValueError, IndexError):
                        continue

    return samples, data, all_pos


def compute_weighted_distance_metric(samples, sample_vaf_data, lambda_param=0.5, family_map=None, group_map=None, eps=1e-6):
    """
    Computes GRM similarity matrix K(i, j), ancestry-conditioned frequencies hat{p}_v,
    and the final pairwise distance matrix D(i, j) = max(K) - K(i, j).

    Parameters:
        samples (list): List of sample names
        sample_vaf_data (dict): sample -> {pos: vaf} (VAF in [0, 1])
        lambda_param (float): Haplogroup conditioning weight lambda in [0, 1]
        family_map (dict): Optional mapping sample -> family ID
        group_map (dict): Optional mapping sample -> haplogroup/group ID
        eps (float): Threshold for dropping monomorphic sites (p_v <= eps or p_v >= 1 - eps)

    Returns:
        dict: Detailed result containing:
            - 'samples': list of sample names
            - 'distance_matrix': 2D list D(i, j)
            - 'tree_distance_matrix': 2D list D_tree(i, j) with D(i, i) = 0
            - 'similarity_matrix_K': 2D list K(i, j)
            - 'global_freq_pv': dict of pos -> global frequency (family-averaged)
            - 'group_freq_pvg': dict of group -> {pos -> conditioned frequency}
            - 'polymorphic_sites_count': int V (number of retained informative sites)
            - 'max_similarity_K': float max(K)
            - 'lambda': float lambda_param
    """
    n = len(samples)
    if n == 0:
        return {
            'samples': [], 'distance_matrix': [], 'tree_distance_matrix': [],
            'similarity_matrix_K': [], 'global_freq_pv': {}, 'group_freq_pvg': {},
            'polymorphic_sites_count': 0, 'max_similarity_K': 0.0, 'lambda': lambda_param
        }

    # 1. Map samples to families and haplogroups
    if family_map is None:
        family_map = {}
    if group_map is None:
        group_map = {}

    sample_groups = {}
    sample_families = {}
    families_by_group = defaultdict(set)
    samples_by_family = defaultdict(list)

    for s in samples:
        inferred_grp, inferred_fam = infer_family_and_group(s)
        grp = group_map.get(s, inferred_grp)
        fam = family_map.get(s, inferred_fam)
        sample_groups[s] = grp
        sample_families[s] = fam
        families_by_group[grp].add(fam)
        samples_by_family[fam].append(s)

    unique_families = list(samples_by_family.keys())
    unique_groups = list(families_by_group.keys())

    # Collect all candidate variant sites
    all_positions = set()
    for s in samples:
        all_positions.update(sample_vaf_data.get(s, {}).keys())

    # 2. Population Averaging: Family-averaged frequency for each variant
    # VAF_{f, v} = (1 / |S_f|) * sum_{i in S_f} VAF_{i, v}
    family_vaf = defaultdict(dict)
    for fam, fam_samples in samples_by_family.items():
        fam_size = len(fam_samples)
        for pos in all_positions:
            fam_sum = sum(sample_vaf_data.get(s, {}).get(pos, 0.0) for s in fam_samples)
            family_vaf[fam][pos] = fam_sum / fam_size

    # Global frequency across all families (counting families only once):
    # p_v^{global} = (1 / |F|) * sum_{f in F} VAF_{f, v}
    num_families = len(unique_families)
    global_p_v = {}
    for pos in all_positions:
        sum_fam_vaf = sum(family_vaf[fam][pos] for fam in unique_families)
        global_p_v[pos] = sum_fam_vaf / num_families if num_families > 0 else 0.0

    # 3. Haplogroup Conditioning:
    # p_v^{(g)} = (1 / |F_g|) * sum_{f in F_g} VAF_{f, v}
    # hat{p}_v^{(g)} = lambda * p_v^{(g)} + (1 - lambda) * p_v^{global}
    hat_p_vg = defaultdict(dict)
    for grp in unique_groups:
        grp_fams = list(families_by_group[grp])
        grp_fam_count = len(grp_fams)
        for pos in all_positions:
            if grp_fam_count > 0:
                p_v_g = sum(family_vaf[fam][pos] for fam in grp_fams) / grp_fam_count
            else:
                p_v_g = global_p_v[pos]
            hat_p_vg[grp][pos] = lambda_param * p_v_g + (1.0 - lambda_param) * global_p_v[pos]

    # 4. Filter Monomorphic Sites across all pairs
    # Site is dropped if p_v <= eps or p_v >= 1 - eps in the global background,
    # or if all samples have identical zero or complete variant calling.
    polymorphic_sites = []
    for pos in sorted(all_positions):
        p_glob = global_p_v.get(pos, 0.0)
        # Check that site is not globally fixed/monomorphic
        if eps < p_glob < (1.0 - eps):
            # Check if at least one sample carries non-zero VAF
            has_alt = any(sample_vaf_data.get(s, {}).get(pos, 0.0) > 0.0 for s in samples)
            if has_alt:
                polymorphic_sites.append(pos)

    V = len(polymorphic_sites)
    if V == 0:
        # Fallback if no polymorphic sites passed strict bounds: retain all non-zero sites
        polymorphic_sites = [pos for pos in sorted(all_positions) if any(sample_vaf_data.get(s, {}).get(pos, 0.0) > 0.0 for s in samples)]
        V = max(1, len(polymorphic_sites))

    # 5. Compute GRM-Style Similarity Matrix K(i, j)
    # K(i, j) = (1 / V) * sum_{v} [ (VAF_{i,v} - p_v) * (VAF_{j,v} - p_v) / (p_v * (1 - p_v)) ]
    K = [[0.0] * n for _ in range(n)]

    for i in range(n):
        s_i = samples[i]
        grp_i = sample_groups[s_i]
        vaf_i_map = sample_vaf_data.get(s_i, {})

        for j in range(i, n):
            s_j = samples[j]
            grp_j = sample_groups[s_j]
            vaf_j_map = sample_vaf_data.get(s_j, {})

            sim_sum = 0.0
            retained_v = 0

            for pos in polymorphic_sites:
                vaf_i = vaf_i_map.get(pos, 0.0)
                vaf_j = vaf_j_map.get(pos, 0.0)

                # Reference frequency conditioned by ancestry
                if grp_i == grp_j:
                    p_v = hat_p_vg[grp_i].get(pos, global_p_v.get(pos, 0.5))
                else:
                    p_v_i = hat_p_vg[grp_i].get(pos, global_p_v.get(pos, 0.5))
                    p_v_j = hat_p_vg[grp_j].get(pos, global_p_v.get(pos, 0.5))
                    p_v = 0.5 * (p_v_i + p_v_j)

                # Safeguard bounds for denominator p_v * (1 - p_v)
                p_v = max(eps, min(1.0 - eps, p_v))
                denom = p_v * (1.0 - p_v)

                if denom > 0:
                    term = ((vaf_i - p_v) * (vaf_j - p_v)) / denom
                    sim_sum += term
                    retained_v += 1

            k_val = sim_sum / (retained_v if retained_v > 0 else 1)
            K[i][j] = K[j][i] = k_val

    # 6. Distance Conversion: D(i, j) = max(K) - K(i, j)
    flat_k = [K[i][j] for i in range(n) for j in range(n)]
    max_k = max(flat_k) if flat_k else 0.0

    D = [[0.0] * n for _ in range(n)]
    D_tree = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            dist_val = max_k - K[i][j]
            D[i][j] = round(max(0.0, dist_val), 6)
            # For phylogenetic clustering, self-distance is 0
            if i == j:
                D_tree[i][j] = 0.0
            else:
                D_tree[i][j] = round(max(0.0, dist_val), 6)

    return {
        'samples': samples,
        'distance_matrix': D,
        'tree_distance_matrix': D_tree,
        'similarity_matrix_K': K,
        'global_freq_pv': global_p_v,
        'group_freq_pvg': dict(hat_p_vg),
        'polymorphic_sites_count': V,
        'max_similarity_K': round(max_k, 6),
        'lambda': lambda_param
    }


def compute_distance_matrix(summary_dir="data/raw_summaries/*.csv", lambda_param=0.5):
    """
    Backward-compatible wrapper computing the weighted distance matrix from summary CSVs.
    Returns:
        tuple: (samples_list, 2D distance matrix list)
    """
    samples, data, _ = load_sample_variants_from_csv(summary_dir)
    if not samples:
        return [], []
    
    result = compute_weighted_distance_metric(samples, data, lambda_param=lambda_param)
    return result['samples'], result['tree_distance_matrix']


def save_distance_matrix(samples, matrix, output_path="data/processed/distance_matrix.csv"):
    """Saves calculated distance matrix to CSV format."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([""] + samples)
        for i in range(len(samples)):
            writer.writerow([samples[i]] + matrix[i])
    print(f"Distance matrix successfully saved to {output_path}")


def build_weighted_upgma_tree(samples, dist_matrix, haplogroup_map=None):
    """
    Constructs a hierarchical UPGMA phylogenetic tree from the weighted distance matrix.
    Returns root node dictionary ready for D3.js visualization.
    """
    n = len(samples)
    if n == 0:
        return {}

    default_haplogroups = {
        "IS": "H1", "CL": "HV0", "KR": "MOOC", "HK": "M7",
        "IN": "U5", "IW": "J1", "MX": "B2", "PK": "L3",
        "SA": "T2", "TB": "K1", "UK": "U4", "AA": "A2", "CA": "H2", "NA": "A2"
    }
    if haplogroup_map:
        default_haplogroups.update(haplogroup_map)

    clusters = [{"name": samples[i], "size": 1, "height": 0.0, "samples": [samples[i]]} for i in range(n)]
    
    dists = {}
    for i in range(n):
        for j in range(i + 1, n):
            dists[(i, j)] = dist_matrix[i][j]

    next_id = n
    active_ids = list(range(n))
    node_map = {i: clusters[i] for i in range(n)}

    while len(active_ids) > 1:
        min_d = float('inf')
        best_pair = (None, None)
        for i_idx, c1 in enumerate(active_ids):
            for c2 in active_ids[i_idx + 1:]:
                pair = (min(c1, c2), max(c1, c2))
                if dists[pair] < min_d:
                    min_d = dists[pair]
                    best_pair = pair

        c1, c2 = best_pair
        h1 = node_map[c1]["height"]
        h2 = node_map[c2]["height"]
        new_height = min_d / 2.0

        new_node = {
            "name": f"Clade_{next_id}",
            "height": round(new_height, 4),
            "children": [
                {**node_map[c1], "branch_length": round(max(0.001, new_height - h1), 4)},
                {**node_map[c2], "branch_length": round(max(0.001, new_height - h2), 4)}
            ],
            "samples": node_map[c1].get("samples", []) + node_map[c2].get("samples", [])
        }

        for o in active_ids:
            if o != c1 and o != c2:
                d1 = dists[(min(c1, o), max(c1, o))]
                d2 = dists[(min(c2, o), max(c2, o))]
                s1 = node_map[c1].get("size", 1)
                s2 = node_map[c2].get("size", 1)
                dists[(min(next_id, o), max(next_id, o))] = (d1 * s1 + d2 * s2) / (s1 + s2)

        new_node["size"] = node_map[c1].get("size", 1) + node_map[c2].get("size", 1)
        node_map[next_id] = new_node

        active_ids.remove(c1)
        active_ids.remove(c2)
        active_ids.append(next_id)
        next_id += 1

    root = node_map[active_ids[0]]
    
    def annotate_tree(node):
        if "children" in node:
            for child in node["children"]:
                annotate_tree(child)
        else:
            prefix = node["name"][:2]
            node["haplogroup"] = default_haplogroups.get(prefix, "H1a")
            
    annotate_tree(root)
    return root
