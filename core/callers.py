#!/usr/bin/env python3
"""
Variant Caller & Quality Control Filter
=======================================
Processes alignment files (.bp / .blast), extracts nucleotide variants,
applies strand bias, edge bias, homopolymer, and depth filters,
and outputs standardized mutation call tables (.mut / .csv).
"""

import os
import sys
import re
import yaml
from collections import Counter
import concurrent.futures
from .aligner import align_gaps_to_lower_coordinate, complement


def load_config(config_path="config/filter.yaml"):
    """Load QC filtering parameters from YAML configuration."""
    if not os.path.exists(config_path):
        return {
            'reference_fasta': 'data/reference/mtdna.fa',
            'min_alt_depth': 3,
            'min_indel_depth': 10,
            'high_vaf_threshold': 10,
            'strand_bias_ratio': 0.8,
            'edge_bias_pct': 0.05,
            'homopolymer_length': 5,
            'depth_threshold_denominator': 6,
            'min_depth_strand_bias': 3,
            'clonal_amp_denominator': 5
        }
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def load_fasta(fasta_path):
    """Load FASTA reference sequence with fallback location lookup."""
    paths_to_try = [
        fasta_path,
        os.path.join("data", "reference", "mtdna.fa"),
        "data/reference/mtdna.fa",
        "mtdna.fa"
    ]
    actual_path = None
    for p in paths_to_try:
        if p and os.path.exists(p):
            actual_path = p
            break

    if not actual_path:
        print(f"ERROR: Reference FASTA '{fasta_path}' not found.")
        sys.exit(1)

    seq = []
    with open(actual_path, 'r') as f:
        for line in f:
            if not line.startswith('>'):
                seq.append(line.strip().upper())
    return "".join(seq)


def check_homopolymer(ref_genome, pos, threshold=5):
    """Check if position lies within a homopolymer run."""
    idx = pos - 1
    start = max(0, idx - 15)
    end = min(len(ref_genome), idx + 15)
    window = ref_genome[start:end]
    match = re.search(r'(.)\1{' + str(threshold - 1) + r',}', window)
    return bool(match)


def process_alignment_block(block, pos_data, ref_genome):
    """Process a single alignment block and update nucleotide position records."""
    if not block['q_seq'] or not block['s_seq']:
        return

    q_seq, s_seq = align_gaps_to_lower_coordinate(block['q_seq'], block['s_seq'], block['strand'])

    start_num = block['start_pos']
    strand = block['strand']
    step = -1 if strand == '-' else 1
    
    ref_bases = s_seq.replace('-', '')
    ref_span = len(ref_bases) - 1 if ref_bases else 0
    end_num = start_num + (ref_span * step)
    bound_tuple = (min(start_num, end_num), max(start_num, end_num))

    seq_len = min(len(q_seq), len(s_seq))
    current_pos = start_num
    
    idx = 0
    while idx < seq_len:
        ref_nt = s_seq[idx]
        new_nt = q_seq[idx]
        relative_pos = idx / seq_len
        
        if ref_nt == '-' or new_nt == '-':
            indel_ref = ref_nt
            indel_new = new_nt
            temp_idx = idx + 1
            
            while temp_idx < seq_len and (s_seq[temp_idx] == '-' or q_seq[temp_idx] == '-'):
                indel_ref += s_seq[temp_idx]
                indel_new += q_seq[temp_idx]
                temp_idx += 1
            
            mapped_new = indel_new.replace('-', '') if strand == '+' else complement(indel_new.replace('-', ''))
            mapped_new = mapped_new if mapped_new else "<DEL>"
            idx = temp_idx - 1 
        else:
            mapped_new = new_nt if strand == '+' else complement(new_nt)

        if 1 <= current_pos <= len(ref_genome):
            true_ref = ref_genome[current_pos - 1]

            if current_pos not in pos_data:
                pos_data[current_pos] = {
                    'ref': true_ref,
                    'total_depth': 0,
                    'alts': {} 
                }

            if ref_nt != '-':
                pos_data[current_pos]['total_depth'] += 1

            if mapped_new not in pos_data[current_pos]['alts']:
                pos_data[current_pos]['alts'][mapped_new] = []
                
            pos_data[current_pos]['alts'][mapped_new].append({
                'strand': strand,
                'rel_pos': relative_pos,
                'bounds': bound_tuple,
                'q_seq': q_seq
            })

        if ref_nt != '-':
            current_pos += step
        idx += 1


def process_single_file(input_filepath, config, ref_genome, cli_vaf=None):
    """Process alignment file (.bp or .blast) and output variant files."""
    pos_data = {}
    current_block = None
    ext = os.path.splitext(input_filepath)[1].lower()

    with open(input_filepath, 'r') as f:
        lines = f.readlines()

    if ext == '.blast':
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('Score ='):
                if current_block is not None:
                    process_alignment_block(current_block, pos_data, ref_genome)
                current_block = {'q_seq': '', 's_seq': '', 'start_pos': None, 'strand': '+'}
            elif stripped.startswith('Strand='):
                if current_block is not None:
                    current_block['strand'] = '-' if 'Minus' in line else '+'
            elif stripped.startswith('Query'):
                parts = stripped.split()
                if len(parts) >= 4 and current_block is not None:
                    current_block['q_seq'] += parts[2].upper()
            elif stripped.startswith('Sbjct'):
                parts = stripped.split()
                if len(parts) >= 4 and current_block is not None:
                    if current_block['start_pos'] is None:
                        current_block['start_pos'] = int(parts[1])
                    current_block['s_seq'] += parts[2].upper()
        if current_block is not None:
            process_alignment_block(current_block, pos_data, ref_genome)

    elif ext == '.bp':
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('qb:'):
                parts = stripped.split()
                sb, se = None, None
                for p in parts:
                    if p.startswith('sb:'): sb = int(p.split(':')[1])
                    elif p.startswith('se:'): se = int(p.split(':')[1])
                if sb is not None and se is not None:
                    current_block = {'q_seq': '', 's_seq': '', 'start_pos': sb, 'strand': '-' if sb > se else '+'}
            elif stripped.startswith('Q:') and current_block is not None:
                current_block['q_seq'] = stripped[2:].upper()
            elif stripped.startswith('S:') and current_block is not None:
                current_block['s_seq'] = stripped[2:].upper()
                process_alignment_block(current_block, pos_data, ref_genome)
                current_block = None

    directory = os.path.dirname(input_filepath) or '.'
    base_name = os.path.basename(input_filepath)
    name_no_ext = os.path.splitext(base_name)[0]
    
    output_filepath = os.path.join(directory, f"{name_no_ext}_all.mut")
    filtered_filepath = os.path.join(directory, f"{name_no_ext}_filtered.mut")
    low_vf_filepath = os.path.join(directory, f"{name_no_ext}_low_VF.mut")

    header = "Pos\tRef\tAlt\tDepth\tAltCount\tVAF%\tFilter\t+\t-\n"
    
    if not pos_data:
        with open(output_filepath, 'w') as f_out, open(filtered_filepath, 'w') as f_filt, open(low_vf_filepath, 'w') as f_low:
            f_out.write(header); f_filt.write(header); f_low.write(header)
        return base_name, output_filepath, filtered_filepath, low_vf_filepath

    min_depth_bias = config['min_depth_strand_bias']
    bias_ratio = config['strand_bias_ratio']
    max_depth = max(data['total_depth'] for data in pos_data.values())
    depth_threshold = max_depth / config['depth_threshold_denominator']
    high_vaf = cli_vaf if cli_vaf is not None else config['high_vaf_threshold']
    edge_pct = config['edge_bias_pct']
    clonal_amp_denom = config.get('clonal_amp_denominator', 5)

    all_rows, filtered_data, low_vf_data = [], [], []

    for pos in sorted(pos_data.keys()):
        data = pos_data[pos]
        depth = data['total_depth']
        if depth < depth_threshold: continue
            
        for alt_allele, reads_list in data['alts'].items():
            if alt_allele == data['ref']: continue 
                
            unique_bounds, p_count, m_count, rel_positions, q_seqs = set(), 0, 0, [], []
            
            for read in reads_list:
                b = read['bounds']
                if b not in unique_bounds:
                    unique_bounds.add(b)
                    if read['strand'] == '+': p_count += 1
                    else: m_count += 1
                    rel_positions.append(read['rel_pos'])
                    q_seqs.append(read['q_seq'])
            
            alt_total = p_count + m_count
            if alt_total == 0: continue
                
            vaf = (alt_total / depth) * 100
            is_indel = len(alt_allele) != 1 or len(data['ref']) != 1 or alt_allele == "<DEL>"
            req_depth = config['min_indel_depth'] if is_indel else config['min_alt_depth']
            
            tags = []
            if alt_allele == "<DEL>": tags.append("FAIL_INDEL")
            if alt_total >= min_depth_bias and (p_count/alt_total > bias_ratio or m_count/alt_total > bias_ratio): tags.append("FAIL_BIAS")
            avg_rel_pos = sum(rel_positions) / alt_total
            if avg_rel_pos < edge_pct or avg_rel_pos > (1.0 - edge_pct): tags.append("FAIL_EDGE_BIAS")
            if q_seqs and max(Counter(q_seqs).values()) > (depth / clonal_amp_denom): tags.append("FAIL_CLONAL_AMP")
            
            filter_tag = ";".join(tags) if tags else "PASS"
            row_str = f"{pos}\t{data['ref']}\t{alt_allele}\t{depth}\t{alt_total}\t{vaf:.2f}\t{filter_tag}\t{p_count}\t{m_count}\n"
            all_rows.append(row_str)
            
            if filter_tag == "PASS":
                if vaf > high_vaf and alt_total >= req_depth:
                    filtered_data.append(row_str)
                elif vaf < 10.0 and alt_allele != "<DEL>" and ((p_count >= 2 and m_count >= 1) or (p_count >= 1 and m_count >= 2)):
                    low_vf_data.append(row_str)

    with open(output_filepath, 'w', newline='\n') as f_all:
        f_all.write(header); f_all.writelines(all_rows)
    with open(filtered_filepath, 'w', newline='\n') as f_filt:
        f_filt.write(header); f_filt.writelines(filtered_data)
    with open(low_vf_filepath, 'w', newline='\n') as f_low:
        f_low.write(header); f_low.writelines(low_vf_data)

    return base_name, output_filepath, filtered_filepath, low_vf_filepath
