#!/usr/bin/env python3
"""
Sample Pairwise Comparator
==========================
Compares mutation calls (.mut or .csv) between two samples.
Identifies CONSERVED variants, MISSING in sample 2, and MISSING in sample 1,
along with VAF differences (delta VAF).
"""

import sys
import csv
import os


def parse_mut_file(filepath):
    """
    Parses a .mut or .csv file into a dictionary mapping (pos, ref, alt) -> VAF.
    """
    mutations = {}
    if not os.path.exists(filepath):
        return mutations

    with open(filepath, 'r') as f:
        # Check delimiter (.mut uses TSV, .csv uses CSV)
        line = f.readline()
        f.seek(0)
        delimiter = '\t' if '\t' in line else ','
        
        reader = csv.DictReader(f, delimiter=delimiter)
        if reader.fieldnames:
            reader.fieldnames = [name.strip() for name in reader.fieldnames]
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Support both Pos/pos, Ref/ref, Alt/alt, VAF%/vaf
                pos_val = row.get('Pos') or row.get('pos')
                ref_val = row.get('Ref') or row.get('ref')
                alt_val = row.get('Alt') or row.get('alt')
                vaf_val = row.get('VAF%') or row.get('vaf') or row.get('VAF')
                
                if pos_val is None or ref_val is None or alt_val is None or vaf_val is None:
                    continue

                pos = int(pos_val)
                ref = ref_val.strip()
                alt = alt_val.strip()
                vaf = float(vaf_val)
                
                key = (pos, ref, alt)
                mutations[key] = vaf
            except ValueError:
                continue
                
    return mutations


def compare_mutations(file1, file2, output_file=None):
    """
    Compares mutations between two sample files.
    
    Returns:
        dict: Summary of comparison results (conserved, missing_in_s2, missing_in_s1)
    """
    muts1 = parse_mut_file(file1)
    muts2 = parse_mut_file(file2)

    set1 = set(muts1.keys())
    set2 = set(muts2.keys())

    only_in_1 = set1 - set2
    only_in_2 = set2 - set1
    shared = set1 & set2

    results = {
        "conserved": [],
        "only_in_s1": [],
        "only_in_s2": []
    }

    for k in sorted(shared, key=lambda x: x[0]):
        vaf1 = muts1[k]
        vaf2 = muts2[k]
        diff = vaf1 - vaf2
        results["conserved"].append({
            "pos": k[0], "ref": k[1], "alt": k[2],
            "vaf1": vaf1, "vaf2": vaf2, "diff": diff
        })

    for k in sorted(only_in_1, key=lambda x: x[0]):
        results["only_in_s1"].append({
            "pos": k[0], "ref": k[1], "alt": k[2], "vaf1": muts1[k]
        })

    for k in sorted(only_in_2, key=lambda x: x[0]):
        results["only_in_s2"].append({
            "pos": k[0], "ref": k[1], "alt": k[2], "vaf2": muts2[k]
        })

    if output_file:
        with open(output_file, 'w') as out:
            out.write("Status\tPos\tRef\tAlt\tVAF_Sample1\tVAF_Sample2\tVAF_Diff(S1-S2)\n")

            for item in results["conserved"]:
                out.write(f"CONSERVED\t{item['pos']}\t{item['ref']}\t{item['alt']}\t{item['vaf1']:.2f}\t{item['vaf2']:.2f}\t{item['diff']:.2f}\n")

            for item in results["only_in_s1"]:
                out.write(f"MISSING_IN_S2\t{item['pos']}\t{item['ref']}\t{item['alt']}\t{item['vaf1']:.2f}\tNA\tNA\n")

            for item in results["only_in_s2"]:
                out.write(f"MISSING_IN_S1\t{item['pos']}\t{item['ref']}\t{item['alt']}\tNA\t{item['vaf2']:.2f}\tNA\n")
        print(f"Report successfully generated: {output_file}")

    return results
