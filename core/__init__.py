"""
Genomic Mito Showcase - Core Package
===================================
Modular Python engine for mitochondrial DNA variant calling, gap alignment,
ancestry-conditioned weighted distance matrix calculation, sequence validation,
and comparative genomics.
"""

from .aligner import align_gaps_to_lower_coordinate, complement, reverse_complement
from .callers import process_single_file, load_config, load_fasta, check_homopolymer
from .distance import (
    compute_weighted_distance_metric,
    compute_distance_matrix,
    save_distance_matrix,
    build_weighted_upgma_tree,
    load_sample_variants_from_csv,
    infer_family_and_group
)
from .validator import search_position
from .comparator import compare_mutations, parse_mut_file

__all__ = [
    'align_gaps_to_lower_coordinate',
    'complement',
    'reverse_complement',
    'process_single_file',
    'load_config',
    'load_fasta',
    'check_homopolymer',
    'compute_weighted_distance_metric',
    'compute_distance_matrix',
    'save_distance_matrix',
    'build_weighted_upgma_tree',
    'load_sample_variants_from_csv',
    'infer_family_and_group',
    'search_position',
    'compare_mutations',
    'parse_mut_file',
]
