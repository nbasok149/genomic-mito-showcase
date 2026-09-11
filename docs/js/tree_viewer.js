/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js) - Apple Liquid Glass & High-Clarity Edition
 * Horizontally stretched phylogram layout, dynamic wide-view label hiding,
 * crisp ethnicity overlay banners, and integrated maternal pedigree explorer.
 */

window.TreeViewer = {
  treeData: null,
  activeLayout: 'phylogram',
  selectedEthnicities: [],
  zoomBehavior: null,
  svgG: null,
  zoomTier: 3, // 1 = Family Clade, 2 = Macro Branch Section, 3 = Global Tree

  macroSections: {
    'AA': 1, 'UK': 1, 'CA': 1,
    'IN': 2, 'IS': 2, 'IW': 2, 'PK': 2,
    /* TEMPORARY HOLD: 'KR': 3, */ 'HK': 3, 'TB': 3, 'NA': 3, 'MX': 3, 'CL': 3
  },

  ETHNICITY_COLORS: {
    'IN': '#d97706', // Warm Amber
    'IS': '#b45309', // Deep Amber
    'IW': '#f59e0b', // Golden Ochre
    'PK': '#8b5cf6', // Cobalt Violet
    'UK': '#6366f1', // Indigo Slate
    // TEMPORARY HOLD: 'KR': '#ec4899', // Rose Quartz
    'MX': '#059669', // Sage Emerald
    'HK': '#0d9488', // Deep Teal
    'CL': '#ea580c', // Terracotta
    'AA': '#e11d48', // Crimson Heritage
    'TB': '#a855f7', // Tibetan Purple
    'CA': '#71717a', // Titanium Zinc
    'NA': '#eab308'  // Antique Gold
  },

  init(data) {
    if (data) this.treeData = data;
    else if (window.App && window.App.treeData) this.treeData = window.App.treeData;
    this.bindEvents();
    this.render();
    this.renderFamilyGroupButtons();
  },

  bindEvents() {
    document.getElementById('btnTreeZoomIn')?.addEventListener('click', () => {
      this.zoomIn();
    });

    document.getElementById('btnTreeZoomOut')?.addEventListener('click', () => {
      this.zoomOut();
    });

    document.getElementById('btnTreeZoomReset')?.addEventListener('click', () => {
      this.zoomToGlobal();
    });

    // Close modals when clicking backdrop or close buttons
    ['familyReportModal', 'junctionInspectorModal', 'mutationCladogramModal'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
        });
      }
    });

    document.getElementById('closeMutationModalBtn')?.addEventListener('click', () => {
      const modal = document.getElementById('mutationCladogramModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  },

  // Kinship-aware role hierarchy across all 43 samples
  // Direct Human Display Names for all 43 samples
  getSampleDisplayName(sampleName) {
    if (!sampleName) return 'Sample';
    const s = String(sampleName).trim();
    const map = {
      'HK_F_JANM': 'Jan Mother',
      'HK_M_WLL': 'William',
      'HK_F_JAN': 'Jan',
      'MX_F_CRY': 'Crystal Mother',
      'MX_M_CRYF': 'Crystal Father',
      'MX_F_CRYS1': 'Crystal Daughter',
      'CL_F_ALJ': 'Alejandra',
      'CL_F_ALJC1': 'Alejandra Daughter',
      // TEMPORARY HOLD: 'KR_F_MOO': 'Cohort Mother',
      // TEMPORARY HOLD: 'KR_F_MOOC1': 'Cohort Daughter',
      'PK_F_WAS': 'Wasim Mother',
      'PK_M_WASH': 'Wasim Father',
      'PK_M_WASC1': 'Wasim Son 1',
      'PK_M_WASC2': 'Wasim Son 2',
      'UK_F_NIKG': 'Nik Grandmother',
      'UK_F_NIKM': 'Nik Mother',
      'UK_F_NIKA': 'Nik Aunt',
      'UK_M_NIKS1': 'Nik Son 1',
      'UK_M_NIK': 'Nik Son 2',
      'UK_M_NIKS2': 'Nik Son 3',
      'IN_F_RISG': 'Rishi Grandmother',
      'IN_F_RISM': 'Rishi Mother',
      'IN_M_RISF': 'Rishi Father',
      'IN_M_RIS': 'Rishi',
      'IN_M_RISS1': 'Rishi Son',
      'IN_F_DPL': 'Deepali',
      'IN_M_DPLH': 'Deepali Husband',
      'IS_F_VYSM': 'Vys Mother',
      'IS_M_RAV': 'Rav',
      'IS_M_SEL': 'Sel',
      'IS_F_VYS': 'Vys',
      'IS_F_VYS2': 'Vys 2',
      'IS_F_VYSC1': 'Vys Daughter',
      'IS_M_PRIC1': 'Priya Son',
      'IW_F_ANJM': 'Anjali Mother',
      'IW_M_ANJF': 'Raj',
      'IW_F_ANJS1': 'Anjali Daughter',
      'IW_F_ANJ': 'Anjali',
      'CA_M_GER': 'Gerald',
      'AA_F_TON': 'Tonya',
      'TB_F_BHA': 'Bharti',
      'NA_F_R3_2_LP5206_MRG': 'Native America Woman',
      'NA_F_R3_2_LP5206_mrg': 'Native America Woman',
      'SA_M_RD_2_LP5205_MRG': 'South America Man',
      'SA_M_RD_2_LP5205_mrg': 'South America Man'
    };
    if (map[s]) return map[s];
    const upper = s.toUpperCase();
    if (map[upper]) return map[upper];
    return s.replace(/_/g, ' ');
  },

  // Adaptable Kinship & Gender Role parser across all 43 samples and generic formats
  getSampleRole(sampleName) {
    if (!sampleName) return 'Lineage Member';
    const s = String(sampleName).trim().toUpperCase();

    // 1. Explicit verified multi-generational pedigree relationships
    const KNOWN_FAMILY_ROLES = {
      'UK_F_NIKG': 'Grandmother',
      'UK_F_NIKA': 'Aunt',
      'UK_F_NIKM': 'Mother',
      'UK_M_NIKS1': 'Son 1',
      'UK_M_NIK': 'Son 2',
      'UK_M_NIKS2': 'Son 3',
      'IN_F_RISG': 'Grandmother',
      'IN_F_RISM': 'Mother',
      'IN_M_RISF': 'Father',
      'IN_M_RIS': 'Son 1',
      'IN_M_RISS1': 'Son 2',
      'IN_F_DPL': 'Mother',
      'IN_M_DPLH': 'Father',
      'IS_F_VYSM': 'Mother',
      'IS_M_RAV': 'Father',
      'IS_M_SEL': 'Father',
      'IS_F_VYS': 'Woman',
      'IS_F_VYS2': 'Woman',
      'IS_F_VYSC1': 'Daughter',
      'IS_M_PRIC1': 'Son',
      'IW_F_ANJM': 'Mother',
      'IW_M_ANJF': 'Father',
      'IW_F_ANJS1': 'Daughter',
      'IW_F_ANJ': 'Woman',
      'PK_F_WAS': 'Mother',
      'PK_M_WASH': 'Father',
      'PK_M_WASC1': 'Son 1',
      'PK_M_WASC2': 'Son 2',
      'HK_F_JANM': 'Mother',
      'HK_M_WLL': 'Father',
      'HK_F_JAN': 'Daughter',
      // TEMPORARY HOLD: 'KR_F_MOO': 'Mother',
      // TEMPORARY HOLD: 'KR_F_MOOC1': 'Daughter',
      'MX_F_CRY': 'Mother',
      'MX_M_CRYF': 'Father',
      'MX_F_CRYS1': 'Daughter',
      'CL_F_ALJ': 'Mother',
      'CL_F_ALJC1': 'Daughter',
      'CA_M_GER': 'Man',
      'AA_F_TON': 'Woman',
      'TB_F_BHA': 'Woman',
      'NA_F_R3_2_LP5206_MRG': 'Woman',
      'SA_M_RD_2_LP5205_MRG': 'Man'
    };

    if (KNOWN_FAMILY_ROLES[s]) return KNOWN_FAMILY_ROLES[s];

    // 2. Structural kinship token matching
    if (s.endsWith('NIKG') || s.endsWith('RISG') || s.endsWith('_G') || s.includes('GRANDMOTHER')) return 'Grandmother';
    if (s.endsWith('NIKA') || s.endsWith('_A') || s.includes('AUNT')) return 'Aunt';
    if (s.includes('C1') || s.includes('S1') || s.includes('D1')) return s.includes('_F_') ? 'Daughter' : 'Son';
    if (s.includes('C2') || s.includes('S2') || s.includes('D2')) return s.includes('_F_') ? 'Daughter' : 'Son';
    if (s.includes('C3') || s.includes('S3') || s.includes('D3')) return s.includes('_F_') ? 'Daughter' : 'Son';

    // 3. Adaptable parsing for unspecifiedly related people: Man or Woman depending on F/M gender flag
    const tokens = s.split('_');
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === 'F') return 'Woman';
      if (tokens[i] === 'M') return 'Man';
    }

    if (s.includes('_F_') || s.startsWith('F_')) return 'Woman';
    if (s.includes('_M_') || s.startsWith('M_')) return 'Man';

    return 'Individual';
  },

  getDeidentifiedLabel(sampleName) {
    if (!sampleName || sampleName.includes('Clade')) return '';
    return this.getSampleDisplayName(sampleName);
  },

  getNodeColor(rawName) {
    if (!rawName || rawName.includes('Clade')) return '#52525b';
    const code = rawName.split('_')[0];
    return this.ETHNICITY_COLORS[code] || '#fafafa';
  },

  getFamilyName(rawName) {
    if (!rawName || rawName.includes('Clade')) return '';
    const parts = rawName.split('_');
    const regionMap = {
      'IN': 'India',
      'IS': 'India South',
      'IW': 'India West',
      'PK': 'Pakistan',
      'UK': 'Ukraine',
      // TEMPORARY HOLD: 'KR': 'Korea',
      'MX': 'Mexico',
      'HK': 'Hong Kong',
      'CL': 'Colombia',
      'AA': 'Africa',
      'TB': 'Tibet',
      'CA': 'Canada',
      'NA': 'Native America'
    };
    return regionMap[parts[0]] || parts[0];
  },

  extractFamilyGroupings() {
    if (!this.treeData) return [];
    const groupingsMap = new Map();
    
    function traverse(node) {
      if (node.name && !node.name.includes('Clade')) {
        const parts = node.name.split('_');
        let key = parts[0];
        const ethName = `${key}`;
        
        if (!groupingsMap.has(ethName)) {
          groupingsMap.set(ethName, { name: ethName, key: key, samples: [] });
        }
        groupingsMap.get(ethName).samples.push(node.name);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(this.treeData);
    return Array.from(groupingsMap.values());
  },

  renderFamilyGroupButtons() {
    const container = document.getElementById('familyGroupButtonsContainer');
    if (!container) return;

    const groupings = this.extractFamilyGroupings();
    const isAll = this.selectedEthnicities.length === 0;

    let html = `
      <button onclick="window.TreeViewer.clearEthnicitySelection()" class="family-btn px-3.5 py-1.5 text-xs rounded-xl ${isAll ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'} transition-all cursor-pointer">
        All cohorts (${groupings.length})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedEthnicities.includes(g.key);
      const color = this.ETHNICITY_COLORS[g.key] || '#fafafa';
      html += `
        <button onclick="window.TreeViewer.toggleEthnicitySelection('${g.key}')" class="family-btn px-3 py-1.5 text-xs rounded-xl ${active ? 'bg-zinc-100 text-zinc-950 font-bold border border-white shadow-md' : 'bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-zinc-600'} transition-all cursor-pointer" style="${active ? '' : `border-left: 3px solid ${color};`}">
          ${g.key} (${g.samples.length}) ${active ? '(Active)' : ''}
        </button>
      `;
    });

    container.innerHTML = html;
  },

  clearEthnicitySelection() {
    this.selectedEthnicities = [];
    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();
    this.zoomToGlobal();

    const modal = document.getElementById('familyReportModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  toggleEthnicitySelection(code) {
    const cleanCode = code.replace('Ethnicity ', '').replace('Family ', '').trim();
    
    if (this.selectedEthnicities.includes(cleanCode)) {
      this.selectedEthnicities = this.selectedEthnicities.filter(c => c !== cleanCode);
      if (this.selectedEthnicities.length === 0) {
        this.zoomToGlobal();
      }
    } else {
      if (this.selectedEthnicities.length >= 3) {
        this.selectedEthnicities = [cleanCode];
      } else {
        this.selectedEthnicities.push(cleanCode);
      }
      this.zoomToFamily(cleanCode);
    }

    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();

    const toast = document.getElementById('compareBranchToast');
    const toastTitle = document.getElementById('compareToastTitle');
    const toastMsg = document.getElementById('compareToastMsg');
    const firstBadge = document.getElementById('firstSelectedBadge');

    if (this.selectedEthnicities.length === 1) {
      const eth1 = this.selectedEthnicities[0];
      if (toast) {
        if (toastTitle) toastTitle.textContent = `Branch selected: ${eth1}`;
        if (firstBadge) firstBadge.textContent = `Branch 1: ${eth1}`;
        if (toastMsg) {
          toastMsg.innerHTML = `Selected <strong>${eth1}</strong> lineage. <strong class="text-amber-400">Click another branch on the tree</strong> to compare!`;
        }
        toast.classList.remove('hidden');
      }
    } else if (this.selectedEthnicities.length >= 2) {
      if (toast) toast.classList.add('hidden');
      if (window.FamilyReportGenerator) {
        window.FamilyReportGenerator.openReportModal(
          this.selectedEthnicities[0],
          this.selectedEthnicities[1],
          this.selectedEthnicities[2] || null
        );
      }
    } else if (this.selectedEthnicities.length === 0) {
      if (toast) toast.classList.add('hidden');
      const modal = document.getElementById('familyReportModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    if (this.selectedEthnicities.length > 0 && window.DiagnosticMarkersExplorer) {
      window.DiagnosticMarkersExplorer.displayFamily(this.selectedEthnicities[0], null);
    }

    if (this.selectedEthnicities.length > 0 && window.MigrationMap) {
      window.MigrationMap.setSample(this.selectedEthnicities[0]);
    }
  },

  updateLabelVisibility(scale) {
    // In the widest view (scale < 0.65 and zoomTier === 3), identifiers (Child, Father, etc.) are hidden.
    // Only ethnicity overlays identify samples at first.
    const showLabels = scale >= 0.65 || this.zoomTier <= 2;
    const svg = d3.select('#treeContainer svg');
    if (svg.node()) {
      svg.selectAll('.leaf-role-label')
        .style('opacity', showLabels ? 1 : 0)
        .style('pointer-events', showLabels ? 'auto' : 'none');
    }
  },

  zoomIn() {
    if (this.zoomTier === 3) {
      const currentCode = this.selectedEthnicities[0] || 'IN';
      this.zoomToMacroSection(this.macroSections[currentCode] || 2);
    } else if (this.zoomTier === 2) {
      const currentCode = this.selectedEthnicities[0] || 'IN';
      this.zoomToFamily(currentCode);
    } else {
      const svg = d3.select('#treeContainer svg');
      if (svg.node() && this.zoomBehavior) {
        svg.transition().duration(400).call(this.zoomBehavior.scaleBy, 1.3);
      }
    }
  },

  zoomOut() {
    const svg = d3.select('#treeContainer svg');
    if (this.zoomTier === 1) {
      const currentCode = this.selectedEthnicities[0] || 'IN';
      this.zoomToMacroSection(this.macroSections[currentCode] || 2);
    } else if (this.zoomTier === 2) {
      this.zoomToGlobal();
    } else if (this.zoomBehavior && svg.node()) {
      svg.transition().duration(500).call(this.zoomBehavior.scaleBy, 0.7);
    }
  },

  zoomToGlobal() {
    this.zoomTier = 3;
    this.updateZoomBadge('Global Tree');
    const svg = d3.select('#treeContainer svg');
    if (this.svgG && this.zoomBehavior && svg.node()) {
      const containerWidth = document.getElementById('treeContainer')?.clientWidth || 900;
      // Stretched layout spans 2200px horizontally; initial global zoom scales to fit gracefully
      const initialScale = Math.min(containerWidth / 2500, 0.38);
      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(35, 20).scale(initialScale)
      );
      this.updateLabelVisibility(initialScale);
    }
  },

  zoomToMacroSection(sectionNum) {
    this.zoomTier = 2;
    this.updateZoomBadge('Macro-Branch');
    const svg = d3.select('#treeContainer svg');
    if (!svg.node() || !this.svgG || !this.zoomBehavior) return;

    const targetCodes = Object.keys(this.macroSections).filter(k => this.macroSections[k] === sectionNum);
    const matchedNodes = [];
    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toUpperCase();
      if (targetCodes.some(c => name.startsWith(c + '_') || name === c)) {
        matchedNodes.push(d);
      }
    });

    const width = document.getElementById('treeContainer')?.clientWidth || 900;
    const height = 500;
    const scale = 0.7;

    if (matchedNodes.length > 0) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 2 - avgX * scale, height / 2 - avgY * scale).scale(scale)
      );
      this.updateLabelVisibility(scale);
    }
  },

  zoomToFamily(familyCode) {
    this.zoomTier = 1;
    this.selectedEthnicities = [familyCode];
    this.selectedSamples = [];
    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();
    this.updateZoomBadge(`Cohort: ${familyCode}`);
    if (window.updateHeroCohortFlags) {
      window.updateHeroCohortFlags(familyCode);
    }
    const quickSelect = document.getElementById('quickFamilyEntrySelect');
    if (quickSelect && quickSelect.value !== familyCode) {
      quickSelect.value = familyCode;
    }
    const headerBadge = document.getElementById('currentFamilyHeaderBadge');
    if (headerBadge) {
      headerBadge.textContent = `Cohort: ${familyCode}`;
      headerBadge.classList.remove('hidden');
    }
  },

  updateZoomBadge(label) {
    const badge = document.getElementById('treeZoomBadge');
    if (badge) badge.textContent = label;
  },

  selectedSamples: [],

  toggleSampleSelection(sampleName) {
    if (!sampleName) return;

    const code = sampleName.split('_')[0];

    // Keep branch/cohort selection active so we don't unselect the branch
    if (!this.selectedEthnicities.includes(code)) {
      this.selectedEthnicities = [code];
      this.renderFamilyGroupButtons();
      if (window.DiagnosticMarkersExplorer) {
        window.DiagnosticMarkersExplorer.displayFamily(code, sampleName);
      }
      if (window.MigrationMap) {
        window.MigrationMap.setSample(sampleName);
      }
    }

    // Toggle sample in selected list
    if (this.selectedSamples.includes(sampleName)) {
      this.selectedSamples = this.selectedSamples.filter(s => s !== sampleName);
      this.highlightFamilyCluster();
      const toast = document.getElementById('compareBranchToast');
      if (toast) toast.classList.add('hidden');
      return;
    }

    this.selectedSamples.push(sampleName);

    const toast = document.getElementById('compareBranchToast');
    const toastTitle = document.getElementById('compareToastTitle');
    const toastMsg = document.getElementById('compareToastMsg');
    const firstBadge = document.getElementById('firstSelectedBadge');

    if (this.selectedSamples.length === 1) {
      const s1 = this.selectedSamples[0];
      const name1 = this.getSampleDisplayName(s1);

      if (toast) {
        if (toastTitle) toastTitle.innerHTML = `<span class="text-emerald-400">Selected: ${name1}</span>`;
        if (firstBadge) firstBadge.innerHTML = `<span class="text-emerald-300 font-bold">${name1}</span>`;
        if (toastMsg) {
          toastMsg.innerHTML = `Click any second sample on the tree to compare.`;
        }
        toast.classList.remove('hidden');
      }

      this.highlightFamilyCluster();
    } else if (this.selectedSamples.length >= 2) {
      const s1 = this.selectedSamples[0];
      const s2 = this.selectedSamples[1];

      this.highlightFamilyCluster();

      if (toast) toast.classList.add('hidden');

      // Automatically open Sample Comparison Report Modal
      if (window.FamilyReportGenerator) {
        window.FamilyReportGenerator.openSampleReportModal(s1, s2);
      }

      // Reset selection state
      this.selectedSamples = [];
    }
  },

  highlightFamilyCluster() {
    const svg = d3.select('#treeContainer svg');
    if (!svg.node()) return;

    const selectedCodes = this.selectedEthnicities;
    const selectedSamples = this.selectedSamples || [];

    if ((!selectedCodes || selectedCodes.length === 0) && selectedSamples.length === 0) {
      svg.selectAll('.tree-node').classed('dimmed', false).classed('sample-selected', false);
      svg.selectAll('.tree-link').classed('dimmed', false).classed('family-active', false);
      svg.selectAll('.family-overlays g').style('opacity', 1);
      this.updateFamilyDataPanel(null);
      this.updateLabelVisibility(0.35);
      return;
    }

    const lowerKeys = (selectedCodes || []).map(c => c.toLowerCase());
    let matchedNodes = [];

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const rawName = d.data.name || '';
      const samples = (d.data.samples || []).map(s => s.toLowerCase());
      
      const isMatch = lowerKeys.length > 0 && lowerKeys.some(key => name.startsWith(key + '_') || samples.some(s => s.startsWith(key + '_')) || name === key) && !name.includes('clade');
      const isSampleSelected = selectedSamples.includes(rawName);

      d3.select(this)
        .classed('dimmed', !isMatch && !isSampleSelected && lowerKeys.length > 0)
        .classed('sample-selected', isSampleSelected);

      if (isMatch || isSampleSelected) matchedNodes.push(d);
    });

    svg.selectAll('.family-overlays g').each(function() {
      const classAttr = d3.select(this).attr('class') || '';
      const code = classAttr.replace('family-overlay-', '').toLowerCase();
      const isMatch = lowerKeys.includes(code);
      d3.select(this).style('opacity', isMatch ? 1 : 0.15);
    });

    svg.selectAll('.tree-link').each(function(d) {
      const targetName = (d.target.data.name || '').toLowerCase();
      const targetSamples = (d.target.data.samples || []).map(s => s.toLowerCase());
      
      const isMatch = lowerKeys.length > 0 && lowerKeys.some(key => targetName.startsWith(key + '_') || targetSamples.some(s => s.startsWith(key + '_')) || targetName === key) && !targetName.includes('clade');
      
      d3.select(this).classed('dimmed', !isMatch && lowerKeys.length > 0).classed('family-active', isMatch);
    });

    if (matchedNodes.length > 0 && this.svgG && this.zoomBehavior) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      const width = document.getElementById('treeContainer')?.clientWidth || 900;
      const height = document.getElementById('treeContainer')?.clientHeight || 500;
      const scale = selectedCodes.length > 1 ? 0.85 : (matchedNodes.length <= 2 ? 1.35 : 1.15);

      svg.transition().duration(700).ease(d3.easeCubicInOut).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 2 - avgX * scale, height / 2 - avgY * scale).scale(scale)
      );
      this.updateLabelVisibility(scale);
    }

    this.updateFamilyDataPanel(selectedCodes, matchedNodes);
  },

  // Interactive Conserved Mutation Cladogram Pop-Up
  inspectMutationCladogram(pos, ref, alt, gene = '') {
    const modal = document.getElementById('mutationCladogramModal');
    const titleEl = document.getElementById('mutationModalTitle');
    const bodyEl = document.getElementById('mutationModalBody');
    if (!modal || !bodyEl || !window.App.variantsData) return;

    const allVariants = window.App.variantsData.variants;
    const targetPos = parseInt(pos, 10);
    const carriers = allVariants.filter(v => v.pos === targetPos);
    const carrierSamples = Array.from(new Set(carriers.map(v => v.sample)));

    // Pulse and highlight on main tree
    const svg = d3.select('#treeContainer svg');
    if (svg.node()) {
      svg.selectAll('.tree-node circle')
        .style('stroke', d => {
          if (!d.children && carrierSamples.includes(d.data.name)) return '#34d399';
          return d.children ? '#64748b' : window.TreeViewer.getNodeColor(d.data.name);
        })
        .style('stroke-width', d => (!d.children && carrierSamples.includes(d.data.name)) ? '3.5px' : '2px')
        .style('r', d => (!d.children && carrierSamples.includes(d.data.name)) ? 9 : (d.children ? 6.5 : 6));
    }

    if (titleEl) {
      titleEl.innerHTML = `Conserved mutation cladogram: <span class="text-emerald-400 font-mono">${pos} ${ref}&gt;${alt}</span> (${gene || 'Mitochondrial locus'})`;
    }

    const carrierCohorts = Array.from(new Set(carrierSamples.map(s => s.split('_')[0])));
    const baseMap = { 'A': 'adenine', 'C': 'cytosine', 'G': 'guanine', 'T': 'thymine' };
    const refBase = baseMap[(ref || '').toUpperCase()] || ref;
    const altBase = baseMap[(alt || '').toUpperCase()] || alt;

    bodyEl.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        
        <!-- Basepair Substitution Explanation -->
        <div class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans space-y-1">
          <div class="font-bold text-amber-400 font-mono text-[10.5px] uppercase tracking-wider">Basepair transition:</div>
          <p class="text-zinc-300 text-xs leading-relaxed">
            <strong>${ref}&gt;${alt}</strong> indicates that an ancestral <strong>${refBase}</strong> basepair became a <strong>${altBase}</strong> basepair at position <strong>${pos}</strong>.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div>
            <div class="text-[11px] text-zinc-400">Total inherited lineages carrying mutation:</div>
            <div class="text-base font-bold text-emerald-400">${carrierSamples.length} sample lines across ${carrierCohorts.length} global cohorts</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
              Conserved founder mutation (high presence)
            </span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2 font-mono">
          <div class="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Carrying population cohorts:</div>
          <div class="flex flex-wrap gap-2">
            ${carrierCohorts.map(c => `
              <span class="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold text-xs">
                ${this.getFamilyName(c)} (${c})
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Cladogram Visualization for this Specific Mutation -->
        <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
          <div class="text-[11px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Lineage branch distribution:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 font-mono">
            ${carrierSamples.map(sample => {
              const code = sample.split('_')[0];
              const role = this.getSampleRole(sample);
              const color = this.ETHNICITY_COLORS[code] || '#fafafa';
              return `
                <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
                    <strong class="text-zinc-200">${role}</strong>
                  </div>
                  <span class="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                    Cohort ${code}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  render() {
    const container = document.getElementById('treeContainer');
    if (!container) return;

    if (!this.treeData && window.App && window.App.treeData) {
      this.treeData = window.App.treeData;
    }

    if (!this.treeData) {
      return;
    }

    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 500;
    const margin = { top: 25, right: 280, bottom: 25, left: 40 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#09090b')
      .style('border-radius', '1.5rem');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    this.svgG = g;

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.15, 4.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        this.updateLabelVisibility(event.transform.k);
      });
    
    // Disable D3 default double-click zoom-in behavior
    svg.call(this.zoomBehavior)
       .on('dblclick.zoom', null);

    // Double clicking the phylogenetic tree canvas (not on any button/node) zooms out
    svg.on('dblclick', (event) => {
      const tag = event.target.tagName ? event.target.tagName.toLowerCase() : '';
      if (tag === 'circle' || tag === 'button' || event.target.closest('button') || event.target.closest('select')) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.zoomOut();
    });

    const root = d3.hierarchy(this.treeData);
    const leafCount = root.leaves().length;
    
    // Generous layout height and STRETCHED 2200px horizontal width to eliminate horizontal compression
    const layoutHeight = Math.max(1280, leafCount * 30);
    const layoutWidth = 2200; // Stretched out extensively in the X direction!

    const treeLayout = d3.tree()
      .size([layoutHeight, layoutWidth])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 2.0));
    treeLayout(root);

    // Ethnicity Overlay Regions (Apple Liquid Glass Rounded Rectangles)
    const overlayGroup = g.append('g').attr('class', 'family-overlays');
    const familyMap = new Map();
    root.leaves().forEach(d => {
      if (d.data.name && !d.data.name.includes('Clade')) {
        const code = d.data.name.split('_')[0];
        if (!familyMap.has(code)) familyMap.set(code, []);
        familyMap.get(code).push(d);
      }
    });

    familyMap.forEach((leaves, code) => {
      const color = this.ETHNICITY_COLORS[code] || '#fafafa';
      const minY = d3.min(leaves, d => d.x);
      const maxY = d3.max(leaves, d => d.x);
      const minX = d3.min(leaves, d => d.y);
      const maxX = d3.max(leaves, d => d.y);

      const padY = 14;
      const padXLeft = 18;
      const padXRight = 300;

      const overlayG = overlayGroup.append('g')
        .attr('class', `family-overlay-${code}`)
        .style('cursor', 'pointer')
        .on('click', () => this.toggleEthnicitySelection(code));

      // Liquid glass rounded squircle bounding box
      overlayG.append('rect')
        .attr('x', minX - padXLeft)
        .attr('y', minY - padY)
        .attr('width', (maxX - minX) + padXLeft + padXRight)
        .attr('height', Math.max(28, (maxY - minY) + padY * 2))
        .attr('rx', 14)
        .attr('fill', color)
        .attr('fill-opacity', 0.08)
        .attr('stroke', color)
        .attr('stroke-width', 1.4)
        .attr('stroke-opacity', 0.35);

      // Prominent ethnicity overlay banner text with pill background to avoid label collisions
      const famName = this.getFamilyName(code);
      const badgeX = maxX + 145;
      const badgeY = (minY + maxY) / 2;
      const badgeWidth = Math.max(74, famName.length * 8.5 + 24);

      overlayG.append('rect')
        .attr('x', badgeX - 8)
        .attr('y', badgeY - 11)
        .attr('width', badgeWidth)
        .attr('height', 22)
        .attr('rx', 8)
        .attr('fill', '#09090b')
        .attr('fill-opacity', 0.95)
        .attr('stroke', color)
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.6);

      overlayG.append('text')
        .attr('x', badgeX - 8 + badgeWidth / 2)
        .attr('y', badgeY)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .style('font-size', '11.5px')
        .style('font-weight', '700')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('text-shadow', '0 2px 8px rgba(0,0,0,0.9)')
        .text(`${famName}`);
    });

    // Horizontal Phylogram Branch Links
    g.selectAll('.tree-link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', '2px')
      .attr('stroke-opacity', '0.8')
      .attr('fill', 'none')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Node Groups
    const node = g.selectAll('.tree-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', d => d.children ? 5.5 : 5.5)
      .style('fill', d => d.children ? '#27272a' : '#18181b')
      .style('stroke', d => d.children ? '#52525b' : this.getNodeColor(d.data.name))
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.onNodeClick(d));

    // Leaf Node Role Labels (Child, Father, Mother, etc.)
    // Note: Initially hidden in widest view; smoothly shown when zoomed in
    node.filter(d => !d.children)
      .append('text')
      .attr('class', 'leaf-role-label')
      .attr('dx', 12)
      .attr('dy', '0.32em')
      .attr('fill', '#e2e8f0')
      .style('font-size', '11.5px')
      .style('font-weight', '600')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('opacity', 0) // Hidden by default in widest view
      .text(d => this.getDeidentifiedLabel(d.data.name));

    // Initial Global Overview Transform
    this.zoomToGlobal();
  },

  onNodeClick(d) {
    if (d.children) {
      this.onInternalNodeClick(d);
      return;
    }

    const rawName = d.data.name || '';
    if (!rawName || rawName.includes('Clade')) return;

    // Toggle individual sample selection (shows green, prompts for second sample, opens sample report)
    this.toggleSampleSelection(rawName);

    const code = rawName.split('_')[0];
    if (window.DiagnosticMarkersExplorer) {
      window.DiagnosticMarkersExplorer.displayFamily(code, rawName);
    }
  },

  onInternalNodeClick(d) {
    if (!window.App.variantsData) return;

    const leaves = d.leaves().map(leaf => leaf.data.name).filter(Boolean);
    if (leaves.length < 1) return;

    let sampleA = leaves[0];
    let sampleB = leaves.length > 1 ? leaves[leaves.length - 1] : sampleA;

    if (window.FamilyReportGenerator) {
      window.FamilyReportGenerator.openSampleReportModal(sampleA, sampleB);
    }
  },

  // Single Unified Cohort Mutation & Integrated Maternal Pedigree Card
  updateFamilyDataPanel(selectedCodes, matchedNodes = []) {
    const card = document.getElementById('familyLineageCard');
    if (!card) return;

    if (!selectedCodes || selectedCodes.length === 0) {
      card.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 font-mono flex items-center justify-between">
          <span>Click any cohort button or sample node on the phylogram to zoom in and inspect maternal pedigree.</span>
          <span class="text-slate-400 text-[11px]">Global phylogram view</span>
        </div>
      `;
      return;
    }

    if (!window.App.variantsData) return;

    const allVariants = window.App.variantsData.variants;
    const primaryCode = selectedCodes[0];
    const famName = this.getFamilyName(primaryCode);

    const cohortVariants = allVariants.filter(v => v.sample.startsWith(primaryCode + '_') || v.sample === primaryCode);
    const uniqueSamplesInCohort = Array.from(new Set(cohortVariants.map(v => v.sample)));

    const mutToSamplesMap = new Map();
    allVariants.forEach(v => {
      const key = `${v.pos} ${v.ref}>${v.alt}`;
      if (!mutToSamplesMap.has(key)) mutToSamplesMap.set(key, new Set());
      mutToSamplesMap.get(key).add(v.sample);
    });

    const privateMuts = cohortVariants.filter(v => {
      const key = `${v.pos} ${v.ref}>${v.alt}`;
      const holders = mutToSamplesMap.get(key);
      return holders && holders.size === 1;
    });

    const sharedDiagnostic = cohortVariants.filter(v => {
      const key = `${v.pos} ${v.ref}>${v.alt}`;
      const holders = mutToSamplesMap.get(key);
      return holders && holders.size > 1 && v.vaf >= 0.03;
    });

    const uniqueSharedMuts = Array.from(new Map(sharedDiagnostic.map(m => [`${m.pos}`, m])).values());
    const uniquePrivateMuts = Array.from(new Map(privateMuts.map(m => [`${m.pos}`, m])).values());

    const ped = (window.App && window.App.FAMILY_PEDIGREES) ? window.App.FAMILY_PEDIGREES[primaryCode] : null;

    let pedigreeHtml = '';
    if (ped) {
      if (ped.individual) {
        const indName = this.getSampleDisplayName(ped.individual);
        const indRole = this.getSampleRole(ped.individual);
        pedigreeHtml = `
          <!-- INTEGRATED LINEAGE TRANSMISSION PROFILE -->
          <div class="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4 font-sans shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span class="text-xs text-amber-400 font-bold uppercase tracking-wider font-mono">Founding lineage & transmission architecture</span>
                <h5 class="text-sm font-extrabold text-white font-mono">${ped.name} (${ped.haplo})</h5>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10.5px] font-bold font-mono">
                Lineage founder checkpoint
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div class="p-3 rounded-xl bg-zinc-900 border border-emerald-500/60 space-y-1">
                <div class="flex items-center justify-between text-emerald-300 font-bold">
                  <span>${indName} (${indRole})</span>
                  <span class="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded-lg border border-emerald-800 font-bold">Carrier</span>
                </div>
                <div class="text-zinc-300 text-[11px] font-sans">${ped.desc || 'Founding maternal lineage profile.'}</div>
              </div>
              <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div class="flex items-center justify-between text-zinc-200 font-bold">
                  <span>Haplogroup clade</span>
                  <span class="text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-zinc-700 text-amber-300 font-bold">${ped.haplo}</span>
                </div>
                <div class="text-zinc-400 text-[11px] font-sans">Carries characteristic diagnostic polymorphisms defining this regional group.</div>
              </div>
            </div>
          </div>
        `;
      } else {
        const hasGrandmother = ped.grandmother && uniqueSamplesInCohort.includes(ped.grandmother);
        const hasAunt = ped.aunt && uniqueSamplesInCohort.includes(ped.aunt);
        const hasFather = ped.father && (uniqueSamplesInCohort.includes(ped.father) || (Array.isArray(ped.father) && ped.father.some(f => uniqueSamplesInCohort.includes(f))));
        const existingChildren = (ped.children || []).filter(c => uniqueSamplesInCohort.includes(c));
        const hasMother = ped.mother && (uniqueSamplesInCohort.includes(ped.mother) || (Array.isArray(ped.mother) && ped.mother.some(m => uniqueSamplesInCohort.includes(m))));

        pedigreeHtml = `
          <!-- INTEGRATED MATERNAL PEDIGREE EXPLORER SECTION -->
          <div class="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4 font-sans shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span class="text-xs text-amber-400 font-bold uppercase tracking-wider font-mono">Maternal pedigree and transmission architecture</span>
                <h5 class="text-sm font-extrabold text-white font-mono">${ped.name} (${ped.haplo})</h5>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10.5px] font-bold font-mono">
                Verified strict matrilineal inheritance
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              
              ${hasGrandmother ? `
                <div class="p-3 rounded-xl bg-zinc-900 border border-amber-500/50 space-y-1">
                  <div class="flex items-center justify-between text-amber-300 font-bold">
                    <span>Grandmother</span>
                    <span class="text-[10px] bg-amber-950/80 px-1.5 py-0.5 rounded-lg border border-amber-800">Ancestor</span>
                  </div>
                  <div class="text-zinc-300 text-[11px] font-sans">Originating maternal root line.</div>
                </div>
              ` : ''}

              ${hasMother ? `
                <!-- Mother Node -->
                <div class="p-3 rounded-xl bg-zinc-900 border border-emerald-500/80 space-y-1">
                  <div class="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Mother</span>
                    <span class="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded-lg border border-emerald-800 font-bold">100% transmission</span>
                  </div>
                  <div class="text-zinc-300 text-[11px] font-sans">Transmits 100% of mitochondrial DNA to all children.</div>
                </div>
              ` : ''}

              ${hasAunt ? `
                <div class="p-3 rounded-xl bg-zinc-900 border border-emerald-700/70 space-y-1">
                  <div class="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Aunt</span>
                    <span class="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded-lg border border-emerald-800">Maternal sister</span>
                  </div>
                  <div class="text-zinc-300 text-[11px] font-sans">Carries shared maternal diagnostic markers.</div>
                </div>
              ` : ''}

              ${hasFather ? `
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 opacity-75">
                  <div class="flex items-center justify-between text-rose-300 font-bold">
                    <span>Father</span>
                    <span class="text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded-lg border border-rose-800">0% transmission</span>
                  </div>
                  <div class="text-zinc-400 text-[11px] font-sans">0% paternal mtDNA transmitted to offspring.</div>
                </div>
              ` : ''}

              <!-- Offspring Nodes -->
              ${existingChildren.map(childSample => {
                const role = this.getSampleRole(childSample);
                const name = this.getSampleDisplayName(childSample);
                return `
                  <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-700 space-y-1">
                    <div class="flex items-center justify-between text-zinc-200 font-bold">
                      <span>${name} (${role})</span>
                      <span class="text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-zinc-700 text-amber-300 font-bold">Offspring</span>
                    </div>
                    <div class="text-zinc-300 text-[11px] font-sans">Inherits 100% maternal diagnostic markers.</div>
                  </div>
                `;
              }).join('')}

            </div>
          </div>
        `;
      }
    }

    card.innerHTML = `
      <div class="p-6 rounded-3xl bg-[#121216]/90 border border-white/10 shadow-2xl space-y-5 font-mono text-xs">
        
        <!-- Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div class="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Cohort maternal lineage overview</div>
            <h4 class="text-lg font-extrabold text-white flex items-center gap-2">
              <span>Cohort: ${famName} (${primaryCode})</span>
            </h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-700 font-bold text-xs">
              ${uniqueSamplesInCohort.length} lineage members
            </span>
            <span class="px-3 py-1 rounded-xl bg-zinc-950 text-zinc-300 border border-white/10 font-bold text-xs">
              ${cohortVariants.length} total variants
            </span>
          </div>
        </div>

        <!-- Section 1: Integrated Maternal Pedigree Explorer -->
        ${pedigreeHtml}

        <!-- Section 2: Shared Core Diagnostic Markers -->
        <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <span>Conserved diagnostic markers (${uniqueSharedMuts.length} shared across family line)</span>
            </h5>
            <span class="text-[10px] text-zinc-400 font-sans">Click any marker to open cladogram</span>
          </div>
          ${uniqueSharedMuts.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${uniqueSharedMuts.slice(0, 12).map(m => `
                <button onclick="window.TreeViewer.inspectMutationCladogram('${m.pos}', '${m.ref}', '${m.alt}', '${m.gene || ''}')" class="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500 text-emerald-300 font-mono font-bold text-xs transition-all cursor-pointer">
                  ${m.pos} ${m.ref}&gt;${m.alt} <span class="text-zinc-400 text-[10px]">(${m.gene || 'D-loop'})</span>
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="text-zinc-400 font-sans text-xs italic">Shared ancestral markers verified at baseline.</div>
          `}
        </div>

        <!-- Section 3: Unique Private Mutations -->
        <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <span>Private maternal mutations (${uniquePrivateMuts.length} lineage specific)</span>
            </h5>
            <span class="text-[10px] text-zinc-400 font-sans">Unique to individual maternal transmissions</span>
          </div>
          ${uniquePrivateMuts.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              ${uniquePrivateMuts.map(m => `
                <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <div class="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>${m.pos} ${m.ref}&gt;${m.alt}</span>
                    <span class="text-zinc-400 text-[10px]">High presence</span>
                  </div>
                  <div class="text-[11px] text-zinc-400 font-sans flex items-center justify-between">
                    <span>${this.getSampleRole(m.sample)}</span>
                    <span class="text-zinc-300 font-mono">${m.gene || 'D-loop'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-xs text-zinc-400 font-sans italic pt-1">
              All detected mutations are conserved across the entire cohort line.
            </div>
          `}
        </div>

        <!-- Action Bar: Direct to 2D Satellite Map Tab -->
        <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button onclick="window.switchMainTab('globe'); window.MigrationMap.setSample('${primaryCode}')" class="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <span>Trace ${primaryCode} Out-of-Africa progression on satellite map ➔</span>
          </button>
          <span class="text-zinc-400 text-[11px] font-mono">De-identified genomic data protection active</span>
        </div>

      </div>
    `;
  }
};
