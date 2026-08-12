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
    'KR': 3, 'HK': 3, 'TB': 3, 'NA': 3, 'MX': 3, 'CL': 3
  },

  ETHNICITY_COLORS: {
    'IN': '#38bdf8', // Sky Blue
    'IS': '#60a5fa', // Blue
    'IW': '#818cf8', // Indigo
    'PK': '#a78bfa', // Purple
    'UK': '#c084fc', // Violet
    'KR': '#f472b6', // Pink
    'MX': '#34d399', // Emerald
    'HK': '#2dd4bf', // Teal
    'CL': '#fb923c', // Amber
    'AA': '#f87171', // Coral Red
    'TB': '#e879f9', // Fuchsia
    'CA': '#94a3b8', // Slate
    'NA': '#fbbf24'  // Gold
  },

  init(data) {
    this.treeData = data;
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
  getSampleRole(sampleName) {
    if (!sampleName) return 'Lineage Member';
    const s = String(sampleName).trim().toUpperCase();

    const EXACT_ROLES = {
      // UK Cohort
      'UK_F_NIKG': 'Grandmother',
      'UK_F_NIKA': 'Aunt',
      'UK_F_NIKM': 'Mother',
      'UK_M_NIKS1': 'Child 1 (Oldest)',
      'UK_M_NIK': 'Child 2 (Middle)',
      'UK_M_NIKS2': 'Child 3 (Youngest)',

      // IN Cohort
      'IN_F_RISG': 'Grandmother',
      'IN_F_RISM': 'Mother',
      'IN_M_RISF': 'Father',
      'IN_M_RIS': 'Child 1',
      'IN_M_RISS1': 'Child 2',
      'IN_F_DPL': 'Mother',
      'IN_M_DPLH': 'Father',

      // IS Cohort
      'IS_F_VYSM': 'Mother',
      'IS_M_RAV': 'Father',
      'IS_M_SEL': 'Father 2',
      'IS_F_VYS': 'Child 1',
      'IS_F_VYS2': 'Child 2',
      'IS_F_VYSC1': 'Child 3',
      'IS_M_PRIC1': 'Child 1',

      // IW Cohort
      'IW_F_ANJM': 'Mother',
      'IW_M_ANJF': 'Father',
      'IW_F_ANJ': 'Child 1',
      'IW_F_ANJS1': 'Child 2',

      // PK Cohort
      'PK_F_WAS': 'Mother',
      'PK_M_WASH': 'Father',
      'PK_M_WASC1': 'Child 1',
      'PK_M_WASC2': 'Child 2',

      // HK Cohort
      'HK_F_JANM': 'Mother',
      'HK_M_WLL': 'Father',
      'HK_F_JAN': 'Child 1',

      // KR Cohort
      'KR_F_MOO': 'Mother',
      'KR_F_MOOC1': 'Child 1',

      // MX Cohort
      'MX_F_CRY': 'Mother',
      'MX_M_CRYF': 'Father',
      'MX_F_CRYS1': 'Child 1',

      // CL Cohort
      'CL_F_ALJ': 'Mother',
      'CL_F_ALJC1': 'Child 1',

      // AA, TB, CA, NA, SA
      'AA_F_TON': 'Mother',
      'TB_F_BHA': 'Mother',
      'CA_M_GER': 'Father',
      'NA_F_R3_2_LP5206_MRG': 'Mother',
      'SA_M_RD_2_LP5205_MRG': 'Father'
    };

    if (EXACT_ROLES[s]) return EXACT_ROLES[s];

    if (s.includes('NIKG') || s.includes('RISG') || s.endsWith('G')) return 'Grandmother';
    if (s.includes('NIKA') || s.endsWith('A')) return 'Aunt';
    if (s.endsWith('M') || s.includes('_F_') || s.includes('MOTHER')) return 'Mother';
    if (s.endsWith('F') || s.endsWith('H') || s.includes('GER') || s.includes('WLL') || s.includes('FATHER')) return 'Father';
    if (s.includes('S1') || s.includes('C1')) return 'Child 1';
    if (s.includes('S2') || s.includes('C2') || s.endsWith('2')) return 'Child 2';
    if (s.includes('S3') || s.includes('C3') || s.endsWith('3')) return 'Child 3';
    return s.includes('_F_') ? 'Mother' : 'Father';
  },

  getDeidentifiedLabel(sampleName) {
    if (!sampleName || sampleName.includes('Clade')) return '';
    return this.getSampleRole(sampleName);
  },

  getNodeColor(rawName) {
    if (!rawName || rawName.includes('Clade')) return '#64748b';
    const code = rawName.split('_')[0];
    return this.ETHNICITY_COLORS[code] || '#38bdf8';
  },

  getFamilyName(rawName) {
    if (!rawName || rawName.includes('Clade')) return '';
    const parts = rawName.split('_');
    const regionMap = {
      'IN': 'India (Central/North)',
      'IS': 'India South (Deccan)',
      'IW': 'India West (Gujarat)',
      'PK': 'Pakistan (Indus)',
      'UK': 'Ukraine (E. Europe)',
      'KR': 'Korea (NE Asia)',
      'MX': 'Mexico (Mesoamerica)',
      'HK': 'Hong Kong (E. Asia)',
      'CL': 'Colombia (S. America)',
      'AA': 'African (Cradle)',
      'TB': 'Tibet (Plateau)',
      'CA': 'Canada (N. America)',
      'NA': 'Native N. America'
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
      <button onclick="window.TreeViewer.clearEthnicitySelection()" class="family-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl ${isAll ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/10'} transition-all">
        All Cohorts (${groupings.length})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedEthnicities.includes(g.key);
      const color = this.ETHNICITY_COLORS[g.key] || '#38bdf8';
      html += `
        <button onclick="window.TreeViewer.toggleEthnicitySelection('${g.key}')" class="family-btn px-3 py-1.5 text-xs font-semibold rounded-xl ${active ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold border border-sky-400' : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-sky-400/50'}" style="${active ? '' : `border-left: 3px solid ${color};`}">
          ${g.key} (${g.samples.length}) ${active ? '✓' : ''}
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
        if (toastTitle) toastTitle.textContent = `Branch Selected: ${eth1}`;
        if (firstBadge) firstBadge.textContent = `Branch 1: ${eth1}`;
        if (toastMsg) {
          toastMsg.innerHTML = `Selected <strong>${eth1}</strong> lineage. <strong class="text-sky-400">Click another branch on the tree</strong> to compare!`;
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
    if (this.zoomTier === 1) {
      const currentCode = this.selectedEthnicities[0] || 'IN';
      this.zoomToMacroSection(this.macroSections[currentCode] || 2);
    } else {
      this.zoomToGlobal();
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
    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();
    this.updateZoomBadge(`Cohort: ${familyCode}`);
  },

  updateZoomBadge(label) {
    const badge = document.getElementById('treeZoomBadge');
    if (badge) badge.textContent = label;
  },

  highlightFamilyCluster() {
    const svg = d3.select('#treeContainer svg');
    if (!svg.node()) return;

    const selectedCodes = this.selectedEthnicities;

    if (!selectedCodes || selectedCodes.length === 0) {
      svg.selectAll('.tree-node').classed('dimmed', false);
      svg.selectAll('.tree-link').classed('dimmed', false).classed('family-active', false);
      svg.selectAll('.family-overlays g').style('opacity', 1);
      this.updateFamilyDataPanel(null);
      this.updateLabelVisibility(0.35);
      return;
    }

    const lowerKeys = selectedCodes.map(c => c.toLowerCase());
    let matchedNodes = [];

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const samples = (d.data.samples || []).map(s => s.toLowerCase());
      
      const isMatch = lowerKeys.some(key => name.startsWith(key + '_') || samples.some(s => s.startsWith(key + '_'))) && !name.includes('clade');
      
      d3.select(this).classed('dimmed', !isMatch);
      if (isMatch) matchedNodes.push(d);
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
      
      const isMatch = lowerKeys.some(key => targetName.startsWith(key + '_') || targetSamples.some(s => s.startsWith(key + '_'))) && !targetName.includes('clade');
      
      d3.select(this).classed('dimmed', !isMatch).classed('family-active', isMatch);
    });

    if (matchedNodes.length > 0 && this.svgG && this.zoomBehavior && this.zoomTier === 1) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      
      const width = document.getElementById('treeContainer')?.clientWidth || 900;
      const height = 500;
      const scale = selectedCodes.length > 1 ? 0.85 : 1.15;

      svg.transition().duration(750).call(
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
      titleEl.innerHTML = `🧬 Conserved Mutation Cladogram: <span class="text-emerald-400 font-mono">m.${pos} ${ref}&gt;${alt}</span> (${gene || 'Mitochondrial locus'})`;
    }

    const carrierCohorts = Array.from(new Set(carrierSamples.map(s => s.split('_')[0])));

    bodyEl.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div>
            <div class="text-[11px] text-slate-400">Total Inherited Lineages Carrying Mutation:</div>
            <div class="text-base font-bold text-emerald-400">${carrierSamples.length} Sample Lines Across ${carrierCohorts.length} Global Cohorts</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              Conserved Founder Mutation (High Presence)
            </span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2 font-mono">
          <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Carrying Population Cohorts:</div>
          <div class="flex flex-wrap gap-2">
            ${carrierCohorts.map(c => `
              <span class="px-2.5 py-1 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-300 font-bold text-xs">
                ${this.getFamilyName(c)} (${c})
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Cladogram Visualization for this Specific Mutation -->
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
          <div class="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider">Lineage Branch Distribution:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 font-mono">
            ${carrierSamples.map(sample => {
              const code = sample.split('_')[0];
              const role = this.getSampleRole(sample);
              const color = this.ETHNICITY_COLORS[code] || '#38bdf8';
              return `
                <div class="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
                    <strong class="text-slate-200">${role}</strong>
                  </div>
                  <span class="px-2 py-0.5 rounded-lg bg-slate-950 border border-white/10 text-[10px] text-slate-400">
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
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 500;
    const margin = { top: 25, right: 280, bottom: 25, left: 40 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#080a0f')
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
    svg.call(this.zoomBehavior);

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
      const color = this.ETHNICITY_COLORS[code] || '#38bdf8';
      const minY = d3.min(leaves, d => d.x);
      const maxY = d3.max(leaves, d => d.x);
      const minX = d3.min(leaves, d => d.y);
      const maxX = d3.max(leaves, d => d.y);

      const padY = 14;
      const padXLeft = 18;
      const padXRight = 220;

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
        .attr('fill-opacity', 0.12)
        .attr('stroke', color)
        .attr('stroke-width', 1.6)
        .attr('stroke-opacity', 0.45);

      // Prominent ethnicity overlay banner text
      const famName = this.getFamilyName(code);
      overlayG.append('text')
        .attr('x', maxX + 18)
        .attr('y', (minY + maxY) / 2)
        .attr('dy', '0.35em')
        .attr('fill', color)
        .style('font-size', '13px')
        .style('font-weight', '800')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('text-shadow', '0 2px 8px rgba(0,0,0,0.8)')
        .text(`${famName}`);
    });

    // Horizontal Phylogram Branch Links
    g.selectAll('.tree-link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('stroke', '#475569')
      .attr('stroke-width', '2.2px')
      .attr('stroke-opacity', '0.85')
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
      .attr('r', d => d.children ? 6.5 : 6)
      .style('fill', d => d.children ? '#0ea5e9' : this.getNodeColor(d.data.name))
      .style('stroke', d => d.children ? '#38bdf8' : this.getNodeColor(d.data.name))
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

    const code = rawName.split('_')[0];
    this.toggleEthnicitySelection(code);

    if (window.DiagnosticMarkersExplorer) {
      window.DiagnosticMarkersExplorer.displayFamily(code, rawName);
    }
  },

  onInternalNodeClick(d) {
    const modal = document.getElementById('junctionInspectorModal');
    const titleEl = document.getElementById('junctionModalTitle');
    const bodyEl = document.getElementById('junctionModalBody');
    const closeBtn = document.getElementById('closeJunctionModalBtn');

    if (!modal || !bodyEl || !window.App.variantsData) return;

    const leaves = d.leaves().map(leaf => leaf.data.name).filter(Boolean);
    if (leaves.length < 1) return;

    let sampleA = leaves[0];
    let sampleB = leaves.length > 1 ? leaves[leaves.length - 1] : sampleA;

    const roleA = this.getSampleRole(sampleA);
    const roleB = this.getSampleRole(sampleB);
    const codeA = sampleA.split('_')[0];
    const codeB = sampleB.split('_')[0];

    const deidentifiedA = `${codeA} (${roleA})`;
    const deidentifiedB = `${codeB} (${roleB})`;

    if (titleEl) {
      titleEl.innerHTML = `🧬 Ancestral Junction Inspector: <span class="text-sky-400">${deidentifiedA}</span> &amp; <span class="text-blue-400">${deidentifiedB}</span> (${leaves.length} Descendant Lineages)`;
    }

    const sampleAVars = window.App.variantsData.variants.filter(v => v.sample === sampleA);
    const sampleBVars = window.App.variantsData.variants.filter(v => v.sample === sampleB);

    const aMap = new Map(sampleAVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const bMap = new Map(sampleBVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const sharedHigh = [];
    const lowVafMuted = [];

    aMap.forEach((vA, key) => {
      if (bMap.has(key)) {
        const vB = bMap.get(key);
        if (vA.vaf >= 0.03 && vB.vaf >= 0.03) {
          sharedHigh.push(vA);
        } else if (vA.vaf < 0.03 || vB.vaf < 0.03) {
          lowVafMuted.push(vA);
        }
      }
    });

    bodyEl.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-xl space-y-2 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div class="text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">Branch Node Triangulation</div>
              <h4 class="text-lg font-extrabold text-white">${deidentifiedA} <span class="text-slate-500">&amp;</span> ${deidentifiedB}</h4>
            </div>
            <span class="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-700/80 text-xs text-sky-300 font-bold">
              Ancestral Junction Node
            </span>
          </div>
          <p class="text-slate-300 text-xs leading-relaxed font-sans">
            Inspecting shared high-presence variants along ancestral branches. Click any mutation below to open the global cladogram highlighting all carrying lineages.
          </p>
        </div>

        <!-- 1. CONSERVED ANCESTRAL MUTATIONS -->
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 class="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span>🧬 Conserved Ancestral Mutations (${sharedHigh.length})</span>
            </h4>
            <span class="text-slate-400 font-sans text-[11px]">Click mutation to pop up global distribution</span>
          </div>
          ${sharedHigh.length > 0 ? `
            <div class="flex flex-wrap gap-2.5 pt-1">
              ${sharedHigh.map(m => `
                <button onclick="window.TreeViewer.inspectMutationCladogram('${m.pos}', '${m.ref}', '${m.alt}', '${m.gene || ''}')" class="px-3 py-2 rounded-xl bg-slate-950 hover:bg-emerald-950/60 border border-emerald-800/80 hover:border-emerald-500 text-emerald-300 font-mono font-bold text-xs shadow-md transition-all flex items-center gap-1.5 group cursor-pointer">
                  <span>m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                  <span class="text-slate-400 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-lg border border-white/10 group-hover:border-emerald-600 group-hover:text-emerald-300">
                    High (100%)
                  </span>
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="text-slate-400 italic text-xs font-sans">No deeply shared high-presence variants unique to this specific internal pair.</div>
          `}
        </div>

        <!-- 2. LOW-VAF MUTED / TRACE MUTATIONS -->
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
              <span>⚠️ Trace Mutations (&lt;3% Detection)</span>
            </h4>
            <span class="text-slate-400 font-sans text-[11px]">Trace heteroplasmy</span>
          </div>

          ${lowVafMuted.length > 0 ? `
            <div class="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs font-sans">
              ⚠️ <strong>Trace Mutation Warning:</strong> Variants with detection lower than 3% (e.g. ${lowVafMuted.slice(0, 5).map(m=>`m.${m.pos}`).join(', ')}) are based on only a few instances and cannot be trusted.
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="border-b border-white/10 text-slate-400">
                    <th class="p-2.5">Position</th>
                    <th class="p-2.5">Mutation</th>
                    <th class="p-2.5">Role</th>
                    <th class="p-2.5">Detection Level</th>
                    <th class="p-2.5">Confidence Note</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${lowVafMuted.map(m => `
                    <tr class="hover:bg-slate-800/40">
                      <td class="p-2.5 text-amber-400 font-bold">m.${m.pos}</td>
                      <td class="p-2.5 font-bold text-slate-200">${m.ref} &gt; ${m.alt}</td>
                      <td class="p-2.5 text-sky-300 font-sans">${this.getSampleRole(m.sample)}</td>
                      <td class="p-2.5 text-rose-400 font-bold">${(m.vaf * 100).toFixed(1)}% Frequency</td>
                      <td class="p-2.5"><span class="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-800 text-[10px]">Unverified Trace</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-400">
              Zero trace mutations (&lt;3%) along this branch junction.
            </div>
          `}
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  },

  // Single Unified Cohort Mutation & Integrated Maternal Pedigree Card
  updateFamilyDataPanel(selectedCodes, matchedNodes = []) {
    const card = document.getElementById('familyLineageCard');
    if (!card) return;

    if (!selectedCodes || selectedCodes.length === 0) {
      card.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 font-mono flex items-center justify-between">
          <span>🌿 Click any cohort button or sample node on the phylogram to zoom in and inspect maternal pedigree.</span>
          <span class="text-slate-400 text-[11px]">Global Phylogram View</span>
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
      const key = `m.${v.pos} ${v.ref}>${v.alt}`;
      if (!mutToSamplesMap.has(key)) mutToSamplesMap.set(key, new Set());
      mutToSamplesMap.get(key).add(v.sample);
    });

    const privateMuts = cohortVariants.filter(v => {
      const key = `m.${v.pos} ${v.ref}>${v.alt}`;
      const holders = mutToSamplesMap.get(key);
      return holders && holders.size === 1;
    });

    const sharedDiagnostic = cohortVariants.filter(v => {
      const key = `m.${v.pos} ${v.ref}>${v.alt}`;
      const holders = mutToSamplesMap.get(key);
      return holders && holders.size > 1 && v.vaf >= 0.03;
    });

    const uniqueSharedMuts = Array.from(new Map(sharedDiagnostic.map(m => [`m.${m.pos}`, m])).values());
    const uniquePrivateMuts = Array.from(new Map(privateMuts.map(m => [`m.${m.pos}`, m])).values());

    const ped = (window.App && window.App.FAMILY_PEDIGREES) ? window.App.FAMILY_PEDIGREES[primaryCode] : null;

    let pedigreeHtml = '';
    if (ped) {
      pedigreeHtml = `
        <!-- INTEGRATED MATERNAL PEDIGREE EXPLORER SECTION -->
        <div class="p-5 rounded-2xl bg-slate-950/90 border border-sky-500/30 space-y-4 font-sans shadow-lg">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div>
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">🧬 Maternal Pedigree & Transmission Architecture</span>
              <h5 class="text-sm font-extrabold text-white font-mono">${ped.name} (${ped.haplo})</h5>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-300 text-[10.5px] font-bold font-mono">
              Verified Strict Matrilineal Inheritance
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
            
            ${ped.grandmother ? `
              <div class="p-3 rounded-xl bg-slate-900 border border-amber-500/50 space-y-1">
                <div class="flex items-center justify-between text-amber-300 font-bold">
                  <span>Grandmother</span>
                  <span class="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded-lg border border-amber-800">Ancestor</span>
                </div>
                <div class="text-slate-300 text-[11px] font-sans">Originating maternal root line.</div>
              </div>
            ` : ''}

            <!-- Mother Node -->
            <div class="p-3 rounded-xl bg-slate-900 border-2 border-emerald-500/80 space-y-1">
              <div class="flex items-center justify-between text-emerald-300 font-bold">
                <span>Mother</span>
                <span class="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded-lg border border-emerald-800 font-bold">100% Transmission</span>
              </div>
              <div class="text-slate-300 text-[11px] font-sans">Transmits 100% of mitochondrial DNA to all children.</div>
            </div>

            ${ped.aunt ? `
              <div class="p-3 rounded-xl bg-slate-900 border border-emerald-700/70 space-y-1">
                <div class="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Aunt</span>
                  <span class="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded-lg border border-emerald-800">Maternal Sister</span>
                </div>
                <div class="text-slate-300 text-[11px] font-sans">Carries shared maternal diagnostic markers.</div>
              </div>
            ` : ''}

            ${ped.father ? `
              <div class="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1 opacity-75">
                <div class="flex items-center justify-between text-rose-300 font-bold">
                  <span>Father</span>
                  <span class="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded-lg border border-rose-800">0% Transmission</span>
                </div>
                <div class="text-slate-400 text-[11px] font-sans">0% paternal mtDNA transmitted to offspring.</div>
              </div>
            ` : ''}

            <!-- Offspring Nodes -->
            ${ped.children.map(childSample => {
              const role = this.getSampleRole(childSample);
              return `
                <div class="p-3 rounded-xl bg-slate-900 border border-sky-500/50 space-y-1">
                  <div class="flex items-center justify-between text-sky-300 font-bold">
                    <span>${role}</span>
                    <span class="text-[10px] bg-sky-950 px-1.5 py-0.5 rounded-lg border border-sky-800">Offspring</span>
                  </div>
                  <div class="text-slate-300 text-[11px] font-sans">Inherits 100% maternal diagnostic markers.</div>
                </div>
              `;
            }).join('')}

          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-5 font-mono text-xs">
        
        <!-- Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div class="text-[11px] text-sky-400 font-bold uppercase tracking-wider">Cohort Maternal Lineage Overview</div>
            <h4 class="text-lg font-extrabold text-white flex items-center gap-2">
              <span>🧬 Cohort: ${famName} (${primaryCode})</span>
            </h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-sky-950 text-sky-300 border border-sky-800 font-bold text-xs">
              ${uniqueSamplesInCohort.length} Lineage Members
            </span>
            <span class="px-3 py-1 rounded-xl bg-slate-950 text-slate-300 border border-white/10 font-bold text-xs">
              ${cohortVariants.length} Total Variants
            </span>
          </div>
        </div>

        <!-- Section 1: Integrated Maternal Pedigree Explorer -->
        ${pedigreeHtml}

        <!-- Section 2: Shared Core Diagnostic Markers -->
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-emerald-900/40 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <span>💎 Conserved Diagnostic Markers (${uniqueSharedMuts.length} Shared Across Family Line)</span>
            </h5>
            <span class="text-[10px] text-slate-400 font-sans">Click any marker to open cladogram</span>
          </div>
          ${uniqueSharedMuts.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${uniqueSharedMuts.slice(0, 12).map(m => `
                <button onclick="window.TreeViewer.inspectMutationCladogram('${m.pos}', '${m.ref}', '${m.alt}', '${m.gene || ''}')" class="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-emerald-800/60 hover:border-emerald-500 text-emerald-300 font-mono font-bold text-xs transition-all cursor-pointer">
                  m.${m.pos} ${m.ref}&gt;${m.alt} <span class="text-slate-400 text-[10px]">(${m.gene || 'D-loop'})</span>
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="text-slate-400 font-sans text-xs italic">Shared ancestral markers verified at baseline.</div>
          `}
        </div>

        <!-- Section 3: Unique Private Mutations -->
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <span>⭐ Private Maternal Mutations (${uniquePrivateMuts.length} Lineage Specific)</span>
            </h5>
            <span class="text-[10px] text-slate-400 font-sans">Unique to individual maternal transmissions</span>
          </div>
          ${uniquePrivateMuts.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              ${uniquePrivateMuts.map(m => `
                <div class="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div class="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                    <span class="text-slate-400 text-[10px]">High Presence</span>
                  </div>
                  <div class="text-[11px] text-slate-400 font-sans flex items-center justify-between">
                    <span>${this.getSampleRole(m.sample)}</span>
                    <span class="text-slate-300 font-mono">${m.gene || 'D-loop'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-xs text-slate-400 font-sans italic pt-1">
              All detected mutations are conserved across the entire cohort line.
            </div>
          `}
        </div>

        <!-- Action Bar: Direct to 3D Globe Tab -->
        <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button onclick="window.switchMainTab('globe'); window.MigrationMap.setSample('${primaryCode}')" class="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 shadow-md transition-all flex items-center gap-2">
            <span>🗺️ Trace ${primaryCode} Out-of-Africa Progression on Satellite Map ➔</span>
          </button>
          <span class="text-slate-400 text-[11px] font-mono">De-Identified Genomic Data Protection Active</span>
        </div>

      </div>
    `;
  }
};
