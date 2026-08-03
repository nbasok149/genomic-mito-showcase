#!/usr/bin/env python3
"""
Gap Alignment Engine
====================
Standardizes gap positions in pairwise sequence alignments.
Shifts gap characters towards lower coordinates (5' for +, 3' for -)
to ensure deterministic variant calling across sequencing reads.
"""

def align_gaps_to_lower_coordinate(q_seq, s_seq, strand='+'):
    """
    Standardize gap coordinates in pairwise alignment.
    
    Parameters:
        q_seq (str): Query sequence with gaps '-'
        s_seq (str): Subject (reference) sequence with gaps '-'
        strand (str): Strand orientation '+' or '-'
        
    Returns:
        tuple: (aligned_q_seq, aligned_s_seq)
    """
    q_list = list(q_seq)
    s_list = list(s_seq)
    seq_len = len(q_list)
    
    if strand == '+':
        for i in range(1, seq_len):
            j = i
            while j > 0 and q_list[j] == '-' and q_list[j-1] != '-':
                if q_list[j-1] == s_list[j] and q_list[j-1] == s_list[j-1]:
                    q_list[j], q_list[j-1] = q_list[j-1], q_list[j]
                    j -= 1
                else:
                    break
            j = i
            while j > 0 and s_list[j] == '-' and s_list[j-1] != '-':
                if s_list[j-1] == q_list[j] and s_list[j-1] == q_list[j-1]:
                    s_list[j], s_list[j-1] = s_list[j-1], s_list[j]
                    j -= 1
                else:
                    break
    else:
        for i in range(seq_len - 2, -1, -1):
            j = i
            while j < seq_len - 1 and q_list[j] == '-' and q_list[j+1] != '-':
                if q_list[j+1] == s_list[j] and q_list[j+1] == s_list[j+1]:
                    q_list[j], q_list[j+1] = q_list[j+1], q_list[j]
                    j += 1
                else:
                    break
            j = i
            while j < seq_len - 1 and s_list[j] == '-' and s_list[j+1] != '-':
                if s_list[j+1] == q_list[j] and s_list[j+1] == q_list[j+1]:
                    s_list[j], s_list[j+1] = s_list[j+1], s_list[j]
                    j += 1
                else:
                    break
                    
    return "".join(q_list), "".join(s_list)


def complement(nt_seq):
    """Return IUPAC complement sequence."""
    comp_table = str.maketrans("ATCGNatcgn-", "TAGCNtagcn-")
    return nt_seq.translate(comp_table)


def reverse_complement(nt_seq):
    """Return reverse complement sequence."""
    return complement(nt_seq)[::-1]
