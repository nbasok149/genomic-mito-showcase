/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 * Implements Family Groupings, Interactive Zoom/Pan, High-Contrast Cyan Links, and Relationship Breakdown.
 */

window.TreeViewer = {
  treeData: null,
  activeLayout: 'phylogram', // phylogram, radial, cladogram
  selectedFamily: 'all',
  zoomBehavior: null,
  svgG: null,

  init(data) {
    this.treeData = data;
    this.bindEvents();
    this.renderFamilyGroupButtons();
    this.render();
  },

  bindEvents() {
    document.getElementById('treeLayoutSelect')?.addEventListener('change', (e) => {
      this.activeLayout = e.target.value;
      this.render();
    });

    document.getElementById('familyTreeSearchInput')?.addEventListener('input', (e) => {
      this.searchAndHighlight(e.target.value);
    });
  },

  extractFamilyGroupings() {
    if (!this.treeData) return [];
    const families = new Map();
    
    function traverse(node) {
      if (node.samples && node.samples.length > 0) {
        node.samples.forEach(s => {
          // Extract family prefix like UK_F_NIK -> Family NIK
          const parts = s.split('_');
          const familyKey = parts.length >= 3 ? parts[2].replace(/\d+$/, '') : parts[0];
          if (!families.has(familyKey)) {
            families.set(familyKey, { name: `Family ${familyKey}`, samples: [], haplogroup: node.haplogroup || 'N/A' });
          }
          families.get(familyKey).samples.push(s);
        });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(this.treeData);
    return Array.from(families.values());
  },

  renderFamilyGroupButtons() {
    const container = document.getElementById('familyGroupButtonsContainer');
    if (!container) return;

    const groupings = this.extractFamilyGroupings();
    let html = `
      <button onclick="window.TreeViewer.selectFamily('all')" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${this.selectedFamily === 'all' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} transition-all">
        All Families (${groupings.reduce((a,b)=>a+b.samples.length, 0)})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedFamily === g.name;
      html += `
        <button onclick="window.TreeViewer.selectFamily('${g.name}')" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${active ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-500'} transition-all">
          ${g.name} (${g.samples.length})
        </button>
      `;
    });

    html += `
      <span class="text-xs text-amber-400 font-mono bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/40">
        + Custom Groupings File Upload (1 Hour)
      </span>
    `;

    container.innerHTML = html;
  },

  selectFamily(familyName) {
    this.selectedFamily = familyName;
    this.renderFamilyGroupButtons();
    this.render();
    this.highlightFamilyCluster(familyName);
  },

  highlightFamilyCluster(familyName) {
    const svg = d3.select('#treeContainer svg');
    if (!svg.node()) return;

    if (familyName === 'all') {
      svg.selectAll('.tree-node').classed('dimmed', false);
      svg.selectAll('.tree-link').classed('dimmed', false).classed('family-active', false);
      this.updateFamilyDataPanel(null);
      return;
    }

    const key = familyName.replace('Family ', '').toLowerCase();
    let matchedNodes = [];

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const samples = (d.data.samples || []).map(s => s.toLowerCase());
      const isMatch = name.includes(key) || samples.some(s => s.includes(key));
      d3.select(this).classed('dimmed', !isMatch);
      if (isMatch) matchedNodes.push(d);
    });

    svg.selectAll('.tree-link').each(function(d) {
      const targetName = (d.target.data.name || '').toLowerCase();
      const targetSamples = (d.target.data.samples || []).map(s => s.toLowerCase());
      const isMatch = targetName.includes(key) || targetSamples.some(s => s.includes(key));
      d3.select(this).classed('dimmed', !isMatch).classed('family-active', isMatch);
    });

    // Zoom to matched family cluster
    if (matchedNodes.length > 0 && this.svgG && this.zoomBehavior) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      
      const width = document.getElementById('treeContainer')?.clientWidth || 900;
      const height = 650;

      svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(width / 2 - avgX * 1.5, height / 2 - avgY * 1.5).scale(1.8)
      );
    }

    this.updateFamilyDataPanel(familyName, matchedNodes);
  },

  searchAndHighlight(query) {
    const term = query.trim().toLowerCase();
    const svg = d3.select('#treeContainer svg');
    if (!svg.node() || !term) {
      svg.selectAll('.tree-node circle').style('r', d => d.children ? 4 : 6).style('stroke', '#38bdf8');
      return;
    }

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const haplo = (d.data.haplogroup || '').toLowerCase();
      const isMatch = name.includes(term) || haplo.includes(term);

      d3.select(this).select('circle')
        .style('r', isMatch ? 10 : (d.children ? 4 : 6))
        .style('stroke', isMatch ? '#ffffff' : '#38bdf8')
        .style('stroke-width', isMatch ? '3.5px' : '2px');
    });
  },

  render() {
    const container = document.getElementById('treeContainer');
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 650;
    const margin = { top: 40, right: 160, bottom: 40, left: 60 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#07090e')
      .style('border-radius', '0.75rem');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    this.svgG = g;

    // Zoom & Pan Behavior
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

      // Radial High-Visibility Links
      radialG.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', '2.2px')
        .attr('stroke-opacity', '0.85')
        .attr('fill', 'none')
        .attr('d', d3.linkRadial()
          .angle(d => (d.x * Math.PI) / 180)
          .radius(d => d.y)
        );

      // Radial Nodes
      const node = radialG.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `rotate(${d.x - 90}) translate(${d.y},0)`);

      node.append('circle')
        .attr('r', d => d.children ? 4.5 : 6.5)
        .style('fill', d => d.children ? '#06b6d4' : '#38bdf8')
        .style('stroke', '#38bdf8')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      node.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 10 : -10)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .style('fill', '#e2e8f0')
        .style('font-size', '11px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => d.data.name + (d.data.haplogroup ? ` [${d.data.haplogroup}]` : ''));

    } else {
      // Rectangular Phylogram / Cladogram High-Visibility Links
      const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right - 160]);
      treeLayout(root);

      g.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', '2.2px')
        .attr('stroke-opacity', '0.85')
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

      // Rectangular Nodes
      const node = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle')
        .attr('r', d => d.children ? 4.5 : 6.5)
        .style('fill', d => d.children ? '#06b6d4' : '#38bdf8')
        .style('stroke', '#38bdf8')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      node.append('text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#e2e8f0')
        .style('font-size', '11px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => d.data.name + (d.data.haplogroup ? ` (${d.data.haplogroup})` : ''));
    }
  },

  onNodeClick(d) {
    const name = d.data.name || 'Branch Clade Node';
    const haplo = d.data.haplogroup || 'N/A';
    const dist = d.data.branch_length || d.data.height || '0.00';
    const samples = d.data.samples || [name];

    this.updateFamilyDataPanel(`Selected: ${name}`, [d]);

    if (!d.children && window.App && window.App.variantsData) {
      // Trigger relationship modal comparison if sample clicked
      const sampleList = window.App.distanceData?.samples || [];
      if (sampleList.length >= 2) {
        const otherSample = sampleList.find(s => s !== name) || sampleList[0];
        document.getElementById('compareSample1Select').value = name;
        document.getElementById('compareSample2Select').value = otherSample;
        window.App.runSampleComparison();
        document.getElementById('comparatorModal')?.classList.remove('hidden');
        document.getElementById('comparatorModal')?.classList.add('flex');
      }
    }
  },

  updateFamilyDataPanel(familyName, matchedNodes = []) {
    const detailBox = document.getElementById('familyLineageCard');
    if (!detailBox) return;

    if (!familyName || familyName === 'all') {
      detailBox.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>💡 <strong>Interactive Family Explorer:</strong> Select a family button above or click any node/branch on the tree to inspect maternal lineage relationships and shared mutations.</span>
          <span class="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/50">Viewing All Cohorts</span>
        </div>
      `;
      return;
    }

    const nodeCount = matchedNodes.length || 1;
    const haplo = matchedNodes[0]?.data?.haplogroup || 'U4 / A2 / H1';

    detailBox.innerHTML = `
      <div class="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/40 text-xs space-y-3 shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
            <span class="font-extrabold text-cyan-300 text-sm font-mono">${familyName} Data Breakdown</span>
          </div>
          <span class="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">Haplogroup ${haplo}</span>
        </div>
        
        <p class="text-slate-300 leading-relaxed">
          Target family clade zoomed & isolated on the tree. Displays maternal lineage inheritance, clade position, and divergence metrics across cohort members.
        </p>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px] pt-2 border-t border-slate-800/80">
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div class="text-slate-400">Cohort Members</div>
            <div class="text-slate-100 font-bold text-sm">${nodeCount} Sequenced</div>
          </div>
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div class="text-slate-400">Maternal Clade</div>
            <div class="text-cyan-400 font-bold text-sm">${haplo}</div>
          </div>
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div class="text-slate-400">Tree Zoom Level</div>
            <div class="text-emerald-400 font-bold text-sm">Focused (1.8x)</div>
          </div>
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div class="text-slate-400">Pairwise Inspection</div>
            <div class="text-purple-400 font-bold text-sm">Click Node to Compare</div>
          </div>
        </div>
      </div>
    `;
  }
};
