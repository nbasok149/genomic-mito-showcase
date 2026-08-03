#!/usr/bin/env python3
"""
Locus Validator & Reference Sequence Inspector
==============================================
Validates genomic loci against reference sequence (mtdna.fa),
inspects alignment gap shift behavior, and summarizes read depth / alt alleles.
"""

import os
import sys
from collections import defaultdict
from .aligner import align_gaps_to_lower_coordinate, reverse_complement


def search_position(filepath, target_pos, shift_gaps=False, fasta_path="data/reference/mtdna.fa"):
    """
    Inspect alignment file (.bp or .blast) for target genomic position.
    
    Parameters:
        filepath (str): Path to alignment file
        target_pos (int): 1-based genomic position
        shift_gaps (bool): Whether to shift gaps towards lower coordinates
        fasta_path (str): Path to reference FASTA file
        
    Returns:
        dict: Inspection summary with reference base, total depth, alt allele counts, and extracted sequences
    """
    target_pos = int(target_pos)
    hits = []
    current_hit = None

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Alignment file '{filepath}' not found.")

    ext = os.path.splitext(filepath)[1].lower()

    with open(filepath, 'r') as f:
        if ext == '.blast':
            for line in f:
                if line.startswith("Query="):
                    if current_hit:
                        hits.append(current_hit)
                    current_hit = {"strand": None, "sbjct_seq": "", "query_seq": "", "sbjct_start": None, "sbjct_end": None}
                elif line.startswith(" Strand="):
                    if current_hit:
                        current_hit["strand"] = line.split("=")[1].strip()
                elif line.startswith("Query ") and current_hit is not None:
                    parts = line.split()
                    current_hit["query_seq"] += parts[2].upper()
                elif line.startswith("Sbjct ") and current_hit is not None:
                    parts = line.split()
                    if current_hit["sbjct_start"] is None:
                        current_hit["sbjct_start"] = int(parts[1])
                    current_hit["sbjct_end"] = int(parts[3])
                    current_hit["sbjct_seq"] += parts[2].upper()
            if current_hit:
                hits.append(current_hit)

        elif ext == '.bp':
            for line in f:
                stripped = line.strip()
                if stripped.startswith('qb:'):
                    parts = stripped.split()
                    sb, se = None, None
                    for p in parts:
                        if p.startswith('sb:'): sb = int(p.split(':')[1])
                        elif p.startswith('se:'): se = int(p.split(':')[1])
                    if sb is not None and se is not None:
                        current_hit = {
                            "strand": "Plus/Minus" if sb > se else "Plus/Plus",
                            "sbjct_seq": "", 
                            "query_seq": "", 
                            "sbjct_start": sb, 
                            "sbjct_end": se
                        }
                elif stripped.startswith('Q:') and current_hit is not None:
                    current_hit["query_seq"] = stripped[2:].upper()
                elif stripped.startswith('S:') and current_hit is not None:
                    current_hit["sbjct_seq"] = stripped[2:].upper()
                    hits.append(current_hit)
                    current_hit = None

    seq_lines = []
    if os.path.exists(fasta_path):
        with open(fasta_path, 'r') as f:
            for line in f:
                if not line.startswith('>'):
                    seq_lines.append(line.strip().upper())
    ref_genome = "".join(seq_lines)

    results = []
    allele_counts = defaultdict(int)

    for hit in hits:
        if not hit["sbjct_seq"] or not hit["strand"] or not hit["query_seq"]: 
            continue
            
        s_seq = hit["sbjct_seq"]
        q_seq = hit["query_seq"]
        strand = hit["strand"]

        if shift_gaps:
            direction = '-' if strand == "Plus/Minus" else '+'
            q_seq, s_seq = align_gaps_to_lower_coordinate(q_seq, s_seq, direction)
        
        pure_sbjct = s_seq.replace('-', '')
        search_seq = reverse_complement(pure_sbjct) if strand == "Plus/Minus" else pure_sbjct
        found_idx = ref_genome.find(search_seq) if ref_genome else -1
        
        if found_idx == -1:
            continue 
            
        current_pos = (found_idx + len(pure_sbjct)) if strand == "Plus/Minus" else (found_idx + 1)
        target_idx = -1

        for idx, char in enumerate(s_seq):
            if current_pos == target_pos:
                target_idx = idx
                break
            if char != '-':
                current_pos += -1 if strand == "Plus/Minus" else 1

        if target_idx != -1:
            target_base = q_seq[target_idx]
            mapped_base = (reverse_complement(target_base).upper() if target_base != '-' else '-') if strand == "Plus/Minus" else target_base.upper()
            allele_counts[mapped_base] += 1

            preceding = q_seq[max(0, target_idx - 20):target_idx].rjust(20, '_')
            following = q_seq[target_idx + 1:min(len(q_seq), target_idx + 21)].ljust(20, '_')
            
            if strand == "Plus/Minus":
                rc_following = reverse_complement(following)
                rc_target = reverse_complement(target_base) if target_base != '-' else '-'
                rc_preceding = reverse_complement(preceding)
                formatted_seq = f"{rc_following.lower()}{rc_target.upper()}{rc_preceding.lower()}"
            else:
                formatted_seq = f"{preceding.lower()}{target_base.upper()}{following.lower()}"
            
            results.append(formatted_seq)

    ref_target = ref_genome[target_pos - 1] if ref_genome and 0 <= target_pos - 1 < len(ref_genome) else 'N'

    return {
        "pos": target_pos,
        "ref": ref_target,
        "depth": len(results),
        "allele_counts": dict(allele_counts),
        "sequences": results[:50]
    }
