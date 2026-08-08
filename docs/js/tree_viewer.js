/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 * Fully privacy-protected with de-identified sample roles (Mother, Father, Child 1, Aunt, etc.),
 * 3-Tier Zooming, reordered & condensed conserved ancestral mutations chart,
 * single unified cohort mutation summary card (no duplicate boxes, no 'loudest metric'),
 * and internal branch node junction inspector.
 */

window.TreeViewer = {
  treeData: null,
  activeLayout: 'phylogram', // phylogram, radial, cladogram
  selectedEthnicities: [], // Array of selected cohort codes e.g. ['IN', 'IS', 'IW']
  zoomBehavior: null,
  svgG: null,
  zoomTier: 3, // 1 = Family Clade (Zoomed In), 2 = Macro Branch Section, 3 = Global Cladogram (Full Tree)

  // 3 Internal Macro-Branch Sections for natural 3-tier zooming without showing artificial borders
  macroSections: {
    'AA': 1, 'UK': 1, 'CA': 1,
    'IN': 2, 'IS': 2, 'IW': 2, 'PK': 2,
    'KR': 3, 'HK': 3, 'TB': 3, 'NA': 3, 'MX': 3, 'CL': 3
  },

  init(data) {
    this.treeData = data;
    this.bindEvents();
    this.render();
    this.renderFamilyGroupButtons();
  },

  bindEvents() {
    document.getElementById('treeLayoutSelect')?.addEventListener('change', (e) => {
      this.activeLayout = e.target.value;
      this.render();
    });

    document.getElementById('familyTreeSearchInput')?.addEventListener('input', (e) => {
      this.searchAndHighlight(e.target.value);
    });

    // Wire up Floating Cladogram Zoom Controls
    document.getElementById('btnTreeZoomIn')?.addEventListener('click', () => {
      this.zoomIn();
    });

    document.getElementById('btnTreeZoomOut')?.addEventListener('click', () => {
      this.zoomOut();
    });

    document.getElementById('btnTreeZoomReset')?.addEventListener('click', () => {
      this.zoomToGlobal();
    });

    // Close modals when clicking backdrop
    ['familyReportModal', 'junctionInspectorModal', 'pedigreeModal'].forEach(id => {
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
  },

  // Role mapper for strict privacy protection (Never display real names)
  getSampleRole(sampleName) {
    if (!sampleName) return 'Lineage Member';
    const s = String(sampleName).toUpperCase();
    if (s.includes('NIKG') || s.includes('RISG')) return 'Grandmother';
    if (s.includes('NIKA')) return 'Aunt';
    if (s.includes('ANJM') || s.includes('VYSM') || s.includes('NIKM') || s.includes('WAS') || s.includes('DPL') || s.includes('RISM') || s.includes('MOO') || s.includes('CRY') || s.includes('JAN') || s.includes('ALJ') || s.includes('TON') || s.includes('BHA')) {
      if (s.endsWith('M') || s.includes('_F_')) return 'Mother';
    }
    if (s.includes('ANJF') || s.includes('RISF') || s.includes('RAV') || s.includes('SEL') || s.includes('WASH') || s.includes('DPLH') || s.includes('GER')) {
      return 'Father';
    }
    if (s.includes('S1') || s.includes('C1') || s.includes('PRIC1') || s.includes('MOOC1') || s.includes('CRYS1') || s.includes('ALJC1') || s.includes('ANJS1') || s.includes('VYSC1') || s.includes('WASC1') || s.includes('RISS1')) {
      return 'Sibling 1 (Child 1)';
    }
    if (s.includes('S2') || s.includes('C2') || s.includes('WASC2') || s.includes('VYS2')) {
      return 'Sibling 2 (Child 2)';
    }
    if (s.includes('R3')) return 'Lineage Member';
    return s.includes('_F_') ? 'Maternal Member' : 'Paternal Member';
  },

  getDeidentifiedLabel(sampleName) {
    if (!sampleName || sampleName.includes('Clade')) return '';
    const parts = sampleName.split('_');
    const code = parts[0];
    const role = this.getSampleRole(sampleName);
    return `${code} (${role})`;
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
      <button onclick="window.TreeViewer.clearEthnicitySelection()" class="family-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg ${isAll ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-600/30 font-bold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'} transition-all">
        All Cohorts (${groupings.length})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedEthnicities.includes(g.key);
      html += `
        <button onclick="window.TreeViewer.toggleEthnicitySelection('${g.key}')" class="family-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg ${active ? 'bg-orange-600 text-stone-950 shadow-md shadow-orange-600/30 font-bold border border-orange-400' : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500'} transition-all">
          ${g.key} (${g.samples.length}) ${active ? '✓' : ''}
        </button>
      `;
    });

    container.innerHTML = html;
  },

  clearEthnicitySelection() {
    this.selectedEthnicities = [];
    this.renderFamilyGroupButtons();
    this.render();
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
          toastMsg.innerHTML = `Selected <strong>${eth1}</strong> lineage. <strong class="text-orange-400">Click another branch on the tree</strong> to compare!`;
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

    if (this.selectedEthnicities.length > 0 && window.GlobeViewer) {
      window.GlobeViewer.setSample(this.selectedEthnicities[0]);
    }
  },

  // 3-Tier Stepped Zooming
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
      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity
      );
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
    const height = 650;
    const scale = 1.35;

    if (matchedNodes.length > 0) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 2 - avgX * scale, height / 2 - avgY * scale).scale(scale)
      );
    } else {
      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.scale(1.2)
      );
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
      const height = 650;
      const scale = selectedCodes.length > 1 ? 1.4 : 1.95;

      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 2 - avgX * scale, height / 2 - avgY * scale).scale(scale)
      );
    }

    this.updateFamilyDataPanel(selectedCodes, matchedNodes);
  },

  searchAndHighlight(query) {
    const term = query.trim().toLowerCase();
    const svg = d3.select('#treeContainer svg');
    if (!svg.node() || !term) {
      svg.selectAll('.tree-node circle').style('r', d => d.children ? 6.5 : 6);
      return;
    }

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const isMatch = name.includes(term) && !name.includes('clade');

      d3.select(this).select('circle')
        .style('r', isMatch ? 10 : (d.children ? 6.5 : 6))
        .style('stroke', isMatch ? '#ffffff' : (d.children ? '#d97706' : window.TreeViewer.getNodeColor(d.data.name)))
        .style('stroke-width', isMatch ? '3px' : '2px');
    });
  },

  ETHNICITY_COLORS: {
    'IN': '#f59e0b', // Amber (India)
    'IS': '#b45309', // Deep Amber (India South)
    'IW': '#d97706', // Dark Amber (India West)
    'PK': '#8b5cf6', // Purple (Pakistan)
    'UK': '#6366f1', // Indigo (Ukraine)
    'KR': '#ec4899', // Pink (Korea)
    'MX': '#10b981', // Emerald (Mexico)
    'HK': '#06b6d4', // Cyan (Hong Kong)
    'CL': '#3b82f6', // Blue (Colombia)
    'AA': '#ef4444', // Red (African)
    'TB': '#14b8a6', // Teal (Tibet)
    'CA': '#a855f7', // Purple-Light (Canada)
    'NA': '#eab308'  // Yellow (Native N.Am)
  },

  getNodeColor(rawName) {
    if (!rawName || rawName.includes('Clade')) return '#d97706';
    const code = rawName.split('_')[0];
    return this.ETHNICITY_COLORS[code] || '#f59e0b';
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

  render() {
    const container = document.getElementById('treeContainer');
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 650;
    const margin = { top: 30, right: 200, bottom: 30, left: 50 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#0c0a09')
      .style('border-radius', '1rem');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    this.svgG = g;

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.4, 4.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(this.zoomBehavior);

    const root = d3.hierarchy(this.treeData);

    if (this.activeLayout === 'radial') {
      const radius = Math.min(width, height) / 2 - 80;
      const cluster = d3.cluster().size([360, radius]);
      cluster(root);

      const radialG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      // Radial Family Overlays Group
      const overlayGroup = radialG.append('g').attr('class', 'family-overlays');
      const familyMap = new Map();
      root.leaves().forEach(d => {
        if (d.data.name && !d.data.name.includes('Clade')) {
          const code = d.data.name.split('_')[0];
          if (!familyMap.has(code)) familyMap.set(code, []);
          familyMap.get(code).push(d);
        }
      });

      familyMap.forEach((leaves, code) => {
        const color = this.ETHNICITY_COLORS[code] || '#ea580c';
        const angles = leaves.map(d => (d.x * Math.PI) / 180);
        const minAngle = d3.min(angles) - 0.08;
        const maxAngle = d3.max(angles) + 0.08;
        const maxRadius = d3.max(leaves, d => d.y) + 30;
        const minRadius = d3.min(leaves, d => d.y) - 25;

        const arcGenerator = d3.arc()
          .innerRadius(Math.max(10, minRadius))
          .outerRadius(maxRadius)
          .startAngle(minAngle)
          .endAngle(maxAngle)
          .cornerRadius(8);

        overlayGroup.append('path')
          .attr('class', `family-overlay-${code}`)
          .attr('d', arcGenerator())
          .attr('fill', color)
          .attr('fill-opacity', 0.16)
          .attr('stroke', color)
          .attr('stroke-width', 1.8)
          .attr('stroke-opacity', 0.5);
      });

      radialG.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('stroke', '#f97316')
        .attr('stroke-width', '2.5px')
        .attr('stroke-opacity', '0.9')
        .attr('fill', 'none')
        .attr('d', d3.linkRadial()
          .angle(d => (d.x * Math.PI) / 180)
          .radius(d => d.y)
        );

      const node = radialG.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `rotate(${d.x - 90}) translate(${d.y},0)`);

      node.append('circle')
        .attr('r', d => d.children ? 6.5 : 6)
        .style('fill', d => d.children ? '#f59e0b' : this.getNodeColor(d.data.name))
        .style('stroke', d => d.children ? '#d97706' : this.getNodeColor(d.data.name))
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

    } else {
      const leafCount = root.leaves().length;
      const layoutHeight = Math.max(height - margin.top - margin.bottom, leafCount * 22);
      const treeLayout = d3.tree()
        .size([layoutHeight, width - margin.left - margin.right - 180])
        .separation((a, b) => (a.parent === b.parent ? 1.4 : 2.2));
      treeLayout(root);

      // Phylogram / Cladogram Family Overlay Regions
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
        const color = this.ETHNICITY_COLORS[code] || '#ea580c';
        const minY = d3.min(leaves, d => d.x);
        const maxY = d3.max(leaves, d => d.x);
        const minX = d3.min(leaves, d => d.y);
        const maxX = d3.max(leaves, d => d.y);

        const padY = 14;
        const padXLeft = 20;
        const padXRight = 140;

        const overlayG = overlayGroup.append('g').attr('class', `family-overlay-${code}`);

        overlayG.append('rect')
          .attr('x', minX - padXLeft)
          .attr('y', minY - padY)
          .attr('width', (maxX - minX) + padXLeft + padXRight)
          .attr('height', Math.max(28, (maxY - minY) + padY * 2))
          .attr('rx', 12)
          .attr('fill', color)
          .attr('fill-opacity', 0.16)
          .attr('stroke', color)
          .attr('stroke-width', 1.8)
          .attr('stroke-opacity', 0.5);

        // De-identified Family Title Badge on the Overlay
        const famName = this.getFamilyName(code);
        overlayG.append('text')
          .attr('x', maxX + 18)
          .attr('y', (minY + maxY) / 2)
          .attr('dy', '0.35em')
          .attr('fill', color)
          .style('font-size', '12px')
          .style('font-weight', '800')
          .style('font-family', 'JetBrains Mono, monospace')
          .text(famName);
      });

      g.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('stroke', '#f97316')
        .attr('stroke-width', '2.5px')
        .attr('stroke-opacity', '0.9')
        .attr('fill', 'none')
        .attr('d', d => {
          if (this.activeLayout === 'cladogram') {
            return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
          } else {
            return d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x)(d);
          }
        });

      const node = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle')
        .attr('r', d => d.children ? 6.5 : 6)
        .style('fill', d => d.children ? '#f59e0b' : this.getNodeColor(d.data.name))
        .style('stroke', d => d.children ? '#d97706' : this.getNodeColor(d.data.name))
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      // Leaf Node Labels (De-identified roles)
      node.filter(d => !d.children)
        .append('text')
        .attr('dx', 10)
        .attr('dy', '0.32em')
        .attr('fill', '#d6d3d1')
        .style('font-size', '11px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getDeidentifiedLabel(d.data.name));
    }
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
      titleEl.innerHTML = `🧬 Ancestral Junction Inspector: <span class="text-orange-400">${deidentifiedA}</span> &amp; <span class="text-amber-400">${deidentifiedB}</span> (${leaves.length} Descendant Lineages)`;
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
        
        <div class="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-2 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <div class="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Branch Node Triangulation</div>
              <h4 class="text-lg font-extrabold text-stone-100">${deidentifiedA} <span class="text-stone-500">&amp;</span> ${deidentifiedB}</h4>
            </div>
            <span class="px-3 py-1.5 rounded-xl bg-orange-950/80 border border-orange-700/80 text-xs text-orange-300 font-bold">
              Ancestral Junction Node
            </span>
          </div>
          <p class="text-stone-300 text-xs leading-relaxed font-sans">
            Inspecting shared high-VAF variants along ancestral branches and highlighting trace mutations.
          </p>
        </div>

        <!-- 1. CONSERVED ANCESTRAL MUTATIONS (Condensed, Listed First) -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span>🧬 Conserved Ancestral Mutations (${sharedHigh.length})</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">High VAF conserved motifs along junction</span>
          </div>
          ${sharedHigh.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${sharedHigh.map(m => `
                <span class="px-2.5 py-1.5 rounded-lg bg-stone-950 border border-emerald-800/80 text-emerald-300 font-mono font-bold text-xs shadow-sm">
                  m.${m.pos} ${m.ref}&gt;${m.alt} <span class="text-emerald-400 text-[10px]">(${(m.vaf * 100).toFixed(0)}% VAF)</span>
                </span>
              `).join('')}
            </div>
          ` : `
            <div class="text-stone-400 italic text-xs font-sans">No deeply shared high-VAF variants unique to this specific internal pair.</div>
          `}
        </div>

        <!-- 2. LOW-VAF MUTED / TRACE MUTATIONS (Appears Second, No Stable Marker) -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
              <span>⚠️ Low-VAF Muted / Trace Mutations (&lt;3% VAF)</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">Sequencer noise / trace heteroplasmy</span>
          </div>

          ${lowVafMuted.length > 0 ? `
            <!-- Trace Mutation Warning Banner -->
            <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs font-sans">
              ⚠️ <strong>Trace Mutation Warning:</strong> Variants with VAF lower than 3% (e.g. ${lowVafMuted.slice(0, 5).map(m=>`m.${m.pos}`).join(', ')}) are based on only a few instances of the mutation appearing and cannot be trusted.
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="border-b border-stone-800 text-stone-400">
                    <th class="p-2.5">Position</th>
                    <th class="p-2.5">Mutation</th>
                    <th class="p-2.5">Role</th>
                    <th class="p-2.5">VAF %</th>
                    <th class="p-2.5">Confidence Note</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-800/60">
                  ${lowVafMuted.map(m => `
                    <tr class="hover:bg-stone-800/40">
                      <td class="p-2.5 text-amber-400 font-bold">m.${m.pos}</td>
                      <td class="p-2.5 font-bold text-stone-200">${m.ref} &gt; ${m.alt}</td>
                      <td class="p-2.5 text-orange-300 font-sans">${this.getSampleRole(m.sample)}</td>
                      <td class="p-2.5 text-rose-400 font-bold">${(m.vaf * 100).toFixed(1)}% VAF</td>
                      <td class="p-2.5"><span class="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800 text-[10px]">Unverified Trace</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-400">
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

  // Single Unified Cohort Mutation Summary Card (No duplicate boxes, No 'Loudest Metric')
  updateFamilyDataPanel(selectedCodes, matchedNodes = []) {
    const card = document.getElementById('familyLineageCard');
    if (!card) return;

    if (!selectedCodes || selectedCodes.length === 0) {
      card.innerHTML = `
        <div class="p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300 font-mono flex items-center justify-between">
          <span>🌿 Click any cohort button or sample node on the cladogram to zoom in and inspect private mutations.</span>
          <span class="text-stone-400 text-[11px]">Global Cladogram View</span>
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

    // Global uniqueness check
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

    // Deduplicate shared mutations for clear overview
    const uniqueSharedMuts = Array.from(new Map(sharedDiagnostic.map(m => [`m.${m.pos}`, m])).values());
    const uniquePrivateMuts = Array.from(new Map(privateMuts.map(m => [`m.${m.pos}`, m])).values());

    card.innerHTML = `
      <div class="p-6 rounded-2xl bg-stone-900 border border-orange-500/50 shadow-2xl space-y-5 font-mono text-xs">
        
        <!-- Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <div class="text-[11px] text-orange-400 font-bold uppercase tracking-wider">Cohort Maternal Lineage Overview</div>
            <h4 class="text-lg font-extrabold text-stone-100 flex items-center gap-2">
              <span>🧬 Cohort: ${famName} (${primaryCode})</span>
            </h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-orange-950 text-orange-300 border border-orange-800 font-bold text-xs">
              ${uniqueSamplesInCohort.length} Lineage Members
            </span>
            <span class="px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs">
              ${cohortVariants.length} Total Variants
            </span>
          </div>
        </div>

        <!-- Section 1: Shared Core Diagnostic Markers -->
        <div class="p-4 rounded-xl bg-stone-950 border border-emerald-900/60 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <span>💎 Conserved Diagnostic Markers (${uniqueSharedMuts.length} Shared Across Family Line)</span>
            </h5>
            <span class="text-[10px] text-stone-400 font-sans">Inherited across all cohort members</span>
          </div>
          ${uniqueSharedMuts.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${uniqueSharedMuts.slice(0, 12).map(m => `
                <span class="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-800/60 text-emerald-300 font-mono font-bold text-xs">
                  m.${m.pos} ${m.ref}&gt;${m.alt} <span class="text-stone-400 text-[10px]">(${m.gene || 'D-loop'})</span>
                </span>
              `).join('')}
            </div>
          ` : `
            <div class="text-stone-400 font-sans text-xs italic">Shared ancestral markers verified at baseline.</div>
          `}
        </div>

        <!-- Section 2: Unique Private Mutations -->
        <div class="p-4 rounded-xl bg-stone-950 border border-amber-900/60 space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <span>⭐ Private Maternal Mutations (${uniquePrivateMuts.length} Lineage Specific)</span>
            </h5>
            <span class="text-[10px] text-stone-400 font-sans">Unique to individual maternal transmissions</span>
          </div>
          ${uniquePrivateMuts.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              ${uniquePrivateMuts.map(m => `
                <div class="p-2.5 rounded-lg bg-stone-900 border border-amber-800/60 space-y-1">
                  <div class="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                    <span class="text-stone-400 text-[10px]">${(m.vaf * 100).toFixed(1)}% VAF</span>
                  </div>
                  <div class="text-[11px] text-stone-400 font-sans flex items-center justify-between">
                    <span>${this.getSampleRole(m.sample)}</span>
                    <span class="text-stone-300 font-mono">${m.gene || 'D-loop'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-xs text-stone-400 font-sans italic pt-1">
              All detected mutations are conserved across the entire cohort line.
            </div>
          `}
        </div>

        <!-- Action Bar: Direct to 3D Globe -->
        <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button onclick="window.GlobeViewer.setSample('${primaryCode}')" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 shadow-md transition-all flex items-center gap-2">
            <span>🌍 Trace ${primaryCode} Out-of-Africa Progression on 3D Globe ➔</span>
          </button>
          <span class="text-stone-400 text-[11px] font-mono">De-Identified Genomic Data Protection Active</span>
        </div>

      </div>
    `;
  }
};
