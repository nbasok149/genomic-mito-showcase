#!/usr/bin/env python3
"""
Unit Tests for Ancestry-Conditioned & GRM-Weighted Distance Metric Engine
=========================================================================
Tests:
1. Population averaging (families counted once in global frequency p_v).
2. Haplogroup conditioning hat{p}_v^{(g)} = lambda * p_v^{(g)} + (1 - lambda) * global_p_v.
3. Monomorphic site detection and removal (p_v <= eps or p_v >= 1 - eps).
4. GRM-style similarity matrix K(i,j) = (1/V) * sum_v [ (VAF_{i,v} - p_v)(VAF_{j,v} - p_v) / (p_v(1 - p_v)) ].
5. Rare mutations receive higher weight than common mutations.
6. Distance matrix conversion D(i,j) = max(K) - K(i,j) produces non-negative, symmetric distances.
7. UPGMA hierarchical tree generation and JSON structure validation.
"""

import unittest
import os
import sys
import math

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.distance import (
    compute_weighted_distance_metric,
    build_weighted_upgma_tree,
    infer_family_and_group
)


class TestWeightedDistanceMetric(unittest.TestCase):

    def setUp(self):
        # 4 samples across 2 families in 2 groups
        # Family 1 (Group A): A_F_1, A_F_2
        # Family 2 (Group B): B_F_1
        # Family 3 (Group B): B_F_2
        self.samples = ["A_F_1", "A_F_2", "B_F_1", "B_F_2"]
        
        # Pos 100: Rare mutation shared ONLY by Family 1 (A_F_1, A_F_2)
        # Pos 200: Common mutation shared across all groups
        # Pos 300: Monomorphic fixed mutation (VAF=1.0 for all) -> should be dropped
        # Pos 400: Monomorphic zero mutation (VAF=0.0 for all) -> should be dropped
        self.vaf_data = {
            "A_F_1": {100: 0.90, 200: 0.80, 300: 1.0, 400: 0.0},
            "A_F_2": {100: 0.90, 200: 0.80, 300: 1.0, 400: 0.0},
            "B_F_1": {100: 0.00, 200: 0.80, 300: 1.0, 400: 0.0},
            "B_F_2": {100: 0.00, 200: 0.80, 300: 1.0, 400: 0.0}
        }
        self.family_map = {
            "A_F_1": "FamA",
            "A_F_2": "FamA",
            "B_F_1": "FamB1",
            "B_F_2": "FamB2"
        }
        self.group_map = {
            "A_F_1": "GrpA",
            "A_F_2": "GrpA",
            "B_F_1": "GrpB",
            "B_F_2": "GrpB"
        }

    def test_infer_family_and_group(self):
        grp, fam = infer_family_and_group("UK_F_NIKM")
        self.assertEqual(grp, "UK")
        self.assertEqual(fam, "UK_NIK")

        grp, fam = infer_family_and_group("IN_F_RISG")
        self.assertEqual(grp, "IN")
        self.assertEqual(fam, "IN_RIS")

        grp, fam = infer_family_and_group("IS_F_VYSM")
        self.assertEqual(grp, "IS")
        self.assertEqual(fam, "IS_VYS")

    def test_population_averaging_families_counted_once(self):
        """Verify that Family A (2 members) is counted once alongside FamB1 and FamB2 (total 3 families)."""
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=0.0,
            family_map=self.family_map, group_map=self.group_map
        )
        global_pv = res['global_freq_pv']
        
        # Pos 100: FamA mean = 0.90, FamB1 mean = 0.0, FamB2 mean = 0.0
        # Global frequency across 3 families = (0.90 + 0.0 + 0.0) / 3 = 0.30
        self.assertAlmostEqual(global_pv[100], 0.30, places=4)
        
        # Pos 200: FamA = 0.80, FamB1 = 0.80, FamB2 = 0.80 -> Global = 0.80
        self.assertAlmostEqual(global_pv[200], 0.80, places=4)

    def test_haplogroup_conditioning(self):
        """Verify hat{p}_v^{(g)} = lambda * p_v^{(g)} + (1 - lambda) * global_p_v."""
        lambda_val = 0.5
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=lambda_val,
            family_map=self.family_map, group_map=self.group_map
        )
        group_pvg = res['group_freq_pvg']
        
        # Pos 100:
        # GrpA frequency = 0.90
        # Global frequency = 0.30
        # Conditioned hat{p}_v^{(GrpA)} = 0.5 * 0.90 + 0.5 * 0.30 = 0.60
        self.assertAlmostEqual(group_pvg['GrpA'][100], 0.60, places=4)

        # GrpB frequency = 0.0
        # Conditioned hat{p}_v^{(GrpB)} = 0.5 * 0.0 + 0.5 * 0.30 = 0.15
        self.assertAlmostEqual(group_pvg['GrpB'][100], 0.15, places=4)

    def test_monomorphic_site_dropping(self):
        """Verify sites 300 (fixed 1.0) and 400 (fixed 0.0) are dropped."""
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=0.5,
            family_map=self.family_map, group_map=self.group_map
        )
        # Only positions 100 and 200 are polymorphic
        self.assertEqual(res['polymorphic_sites_count'], 2)

    def test_similarity_score_and_rare_variant_weighting(self):
        """Verify that K(A_F_1, A_F_2) > K(A_F_1, B_F_1) and rare mutations have high positive impact."""
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=0.5,
            family_map=self.family_map, group_map=self.group_map
        )
        K = res['similarity_matrix_K']
        
        # Similarity within Family A (idx 0 and 1) should be high
        k_famA = K[0][1]
        # Similarity between Family A and Family B should be lower/negative
        k_between = K[0][2]
        
        self.assertGreater(k_famA, k_between)
        self.assertAlmostEqual(K[0][1], K[1][0], places=5) # Symmetric

    def test_distance_conversion_and_symmetry(self):
        """Verify D(i,j) = max(K) - K(i,j) >= 0 and is symmetric with D(i,i) = 0 for tree."""
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=0.5,
            family_map=self.family_map, group_map=self.group_map
        )
        D = res['distance_matrix']
        D_tree = res['tree_distance_matrix']
        n = len(self.samples)

        for i in range(n):
            self.assertEqual(D_tree[i][i], 0.0)
            for j in range(n):
                self.assertGreaterEqual(D[i][j], 0.0)
                self.assertAlmostEqual(D[i][j], D[j][i], places=5)
                self.assertAlmostEqual(D_tree[i][j], D_tree[j][i], places=5)

        # Family A members (0 and 1) must have much smaller distance than cross-group (0 and 2)
        self.assertLess(D_tree[0][1], D_tree[0][2])

    def test_upgma_tree_construction(self):
        """Verify hierarchical UPGMA tree is constructed with valid nodes and haplogroups."""
        res = compute_weighted_distance_metric(
            self.samples, self.vaf_data, lambda_param=0.5,
            family_map=self.family_map, group_map=self.group_map
        )
        tree = build_weighted_upgma_tree(self.samples, res['tree_distance_matrix'])
        
        self.assertIn("name", tree)
        self.assertIn("children", tree)
        self.assertEqual(len(tree["samples"]), 4)


if __name__ == "__main__":
    unittest.main()
