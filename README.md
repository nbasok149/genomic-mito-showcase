# Genomic Mito Showcase

Production-grade mitochondrial DNA (mtDNA) variant calling, gap alignment standardization, ancestry-conditioned GRM weighted distance matrix calculation, and interactive web showcase deployed on **Vercel** and **GitHub Pages**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnbasok149%2Fgenomic-mito-showcase)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vercel Free Tier](https://img.shields.io/badge/Vercel-Hobby%20(Free)-black?logo=vercel)

---

## Executive Summary & System Architecture

This repository models human mitochondrial DNA (mtDNA) sequencing analysis against the revised Cambridge Reference Sequence (rCRS NC_012920.1, 16,569 bp).

It implements:
- **Gap Alignment Standardization**: Deterministic 3'/5' coordinate gap shifting (`align_gaps_to_lower_coordinate`) on forward (+) and reverse (-) strand sequencing reads.
- **Variant Quality Control**: High VAF thresholding (&ge; 10%), strand bias filtering (&lt; 0.80 ratio), homopolymer run identification (&ge; 5 bp), and clonal amplification detection.
- **Pairwise VAF Distance Matrix**: Manhattan distance matrix calculation \(d(S_i, S_j) = \sum |VAF_{i,p} - VAF_{j,p}|\) across a 43-sample cohort.
- **Zero-Dependency Web Showcase**: Modern, client-side web application built with HTML5, Tailwind CSS, Vanilla JS, and D3.js for instant interactive rendering on **GitHub Pages**.

```mermaid
flowchart TD
    FA[mtdna.fa (rCRS Reference)] --> Core[core/callers.py & aligner.py]
    RAW[Sequencing Alignments / Summaries] --> Core
    CFG[config/filter.yaml Rules] --> Core
    Core --> DM[core/distance.py]
    DM --> MAT[data/processed/distance_matrix.csv]
    
    MAT & RAW & FA --> ETL[scripts/export_web_data.py]
    ETL --> J1[docs/data/variants_dataset.json]
    ETL --> J2[docs/data/distance_matrix.json]
    ETL --> J3[docs/data/phylo_tree.json]
    ETL --> J4[docs/data/genome_annotations.json]
    
    J1 & J2 & J3 & J4 --> WEB[GitHub Pages Web Showcase: docs/index.html]
```

---

## Directory Structure

```
genomic-mito-showcase/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD deployment to GitHub Pages
├── core/                           # Modular Python genomic analysis engine
│   ├── __init__.py
│   ├── aligner.py                  # Gap coordinate standardization algorithm
│   ├── callers.py                  # Variant calling engine & filter enforcement
│   ├── distance.py                 # Multi-sample VAF Manhattan distance calculator
│   ├── validator.py                # Locus search & reference sequence validator
│   └── comparator.py               # Two-sample variant differential comparator
├── config/
│   └── filter.yaml                 # QC parameters and filtering rules
├── data/
│   ├── reference/
│   │   └── mtdna.fa                # Human Mitochondrial Reference Genome (rCRS, 16,569 bp)
│   ├── raw_summaries/              # Sample VAF summaries
│   └── processed/
│       ├── distance_matrix.csv     # 43x43 pairwise distance matrix
│       └── phylogenetic_tree.jpg   # Baseline tree rendering
├── scripts/
│   ├── export_web_data.py          # Data ETL script serializing CSVs to web JSON
│   ├── run_pipeline.py             # CLI entrypoint for variant calling pipeline
│   └── compare_samples.py          # CLI tool for sample pair comparison
├── docs/                           # GitHub Pages web showcase root
│   ├── index.html                  # Single-page application UI
│   ├── css/
│   │   └── styles.css              # Custom styling & glassmorphism theme
│   ├── js/
│   │   ├── app.js                  # Application controller & navigation
│   │   ├── variants_table.js       # Interactive variant search & filter engine
│   │   ├── heatmap.js              # D3.js 43x43 distance heatmap
│   │   ├── tree_viewer.js          # D3.js SVG phylogenetic tree renderer
│   │   └── locus_inspector.js      # Locus inspector (pos_check simulation)
│   └── data/                       # Pre-processed JSON datasets
│       ├── variants_dataset.json
│       ├── distance_matrix.json
│       ├── phylo_tree.json
│       └── genome_annotations.json
├── LICENSE
├── README.md
└── requirements.txt
```

---

## Quick Start & Execution Guide

### 1. Run Data Pre-processing ETL
To generate or refresh the web JSON datasets in `docs/data/`:
```bash
python3 scripts/export_web_data.py
```

### 2. Run Local Variant Calling Pipeline
```bash
python3 scripts/run_pipeline.py --config config/filter.yaml
```

### 3. Compare Two Sample Mutation Files
```bash
python3 scripts/compare_samples.py sample1.mut sample2.mut output_comparison.tsv
```

### 4. Serve Web Showcase Locally
To preview the web application locally:
```bash
python3 -m http.server 8000 --directory docs
```
Open `http://localhost:8000` in your web browser.

---

## GitHub Pages Deployment

The automated workflow in `.github/workflows/deploy.yml` triggers on pushes to `main`:
1. Executes `scripts/export_web_data.py` to regenerate JSON modules.
2. Bundles the static assets in `docs/`.
3. Deploys the application directly to GitHub Pages.

---

## License

Distributed under the MIT License.
