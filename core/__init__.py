"""
Genomic Mito Showcase - Core Package
===================================
Modular Python engine for mitochondrial DNA variant calling, gap alignment,
pairwise Manhattan distance matrix calculation, sequence validation, and comparison.
"""

from .aligner import align_gaps_to_lower_coordinate
from .callers import process_single_file, load_config, load_fasta, check_homopolymer
from .distance import compute_distance_matrix, save_distance_matrix
from .validator import search_position
from .comparator import compare_mutations, parse_mut_file

__all__ = [
    'align_gaps_to_lower_coordinate',
    'process_single_file',
    'load_config',
    'load_fasta',
    'check_homopolymer',
    'compute_distance_matrix',
    'save_distance_matrix',
    'search_position',
    'compare_mutations',
    'parse_mut_file',
]
