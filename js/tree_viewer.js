/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 * High-visibility decluttered diagram with family-level labels and click-to-expand sample details.
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
  },

  extractFamilyGroupings() {
    if (!this.treeData) return [];
    const familiesMap = new Map();
    
    function traverse(node) {
      if (node.name && !node.name.startsWith('Clade_')) {
        const parts = node.name.split('_');
        let familyKey = parts.length >= 3 ? parts[2].replace(/\d+$/, '') : (parts.length === 2 ? parts[1] : parts[0]);
        const familyName = `Family ${familyKey}`;
        
        if (!familiesMap.has(familyName)) {
          familiesMap.set(familyName, { name: familyName, key: familyKey.toLowerCase(), samples: [] });
        }
        familiesMap.get(familyName).samples.push(node.name);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(this.treeData);
    return Array.from(familiesMap.values());
  },

  renderFamilyGroupButtons() {
    const container = document.getElementById('familyGroupButtonsContainer');
    if (!container) return;

    const groupings = this.extractFamilyGroupings();
    let html = `
      <button onclick="window.TreeViewer.selectFamily('all')" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${this.selectedFamily === 'all' ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-600/30' : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'} transition-all">
        All Families (${groupings.length})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedFamily === g.name;
      html += `
        <button onclick="window.TreeViewer.selectFamily('${g.name}')" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${active ? 'bg-orange-600 text-stone-950 shadow-md shadow-orange-600/30' : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500'} transition-all">
          ${g.name} (${g.samples.length})
        </button>
      `;
    });

    html += `
      <span class="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
        + Custom Grouping File Upload (1 Hour)
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
      svg.selectAll('.sample-label-text').style('display', 'none');
      svg.selectAll('.family-label-text').style('display', 'block');
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
      if (isMatch) {
        matchedNodes.push(d);
        d3.select(this).select('.sample-label-text').style('display', 'block');
      } else {
        d3.select(this).select('.sample-label-text').style('display', 'none');
      }
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
      svg.selectAll('.tree-node circle').style('r', d => d.children ? 3.5 : 5.5).style('stroke', '#f97316');
      return;
    }

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const isMatch = name.includes(term);

      d3.select(this).select('circle')
        .style('r', isMatch ? 9 : (d.children ? 3.5 : 5.5))
        .style('stroke', isMatch ? '#ffffff' : '#f97316')
        .style('stroke-width', isMatch ? '3px' : '2px');
        
      if (isMatch) {
        d3.select(this).select('.sample-label-text').style('display', 'block');
      }
    });
  },

  getFamilyName(rawName) {
    if (!rawName || rawName.startsWith('Clade_')) return '';
    const parts = rawName.split('_');
    const familyKey = parts.length >= 3 ? parts[2].replace(/\d+$/, '') : (parts.length === 2 ? parts[1] : parts[0]);
    return `Family ${familyKey}`;
  },

  render() {
    const container = document.getElementById('treeContainer');
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 650;
    const margin = { top: 30, right: 140, bottom: 30, left: 50 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#12100e')
      .style('border-radius', '1rem');

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
      const radius = Math.min(width, height) / 2 - 70;
      const cluster = d3.cluster().size([360, radius]);
      cluster(root);

      const radialG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      // Radial High-Visibility Warm Links
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

      // Radial Nodes
      const node = radialG.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `rotate(${d.x - 90}) translate(${d.y},0)`);

      node.append('circle')
        .attr('r', d => d.children ? 3.5 : 5.5)
        .style('fill', d => d.children ? '#10b981' : '#34d399')
        .style('stroke', '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      // Family Label (Small text, decluttered)
      node.filter(d => !d.children && d.data.name && !d.data.name.startsWith('Clade_'))
        .append('text')
        .attr('class', 'family-label-text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 8 : -8)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .style('fill', '#f5f5f4')
        .style('font-size', '9px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getFamilyName(d.data.name));

      // Sample Label (Revealed on click/selection)
      node.filter(d => !d.children)
        .append('text')
        .attr('class', 'sample-label-text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 8 : -8)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .style('fill', '#fb923c')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('display', 'none')
        .text(d => d.data.name);

    } else {
      // Rectangular Phylogram / Cladogram
      const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right - 140]);
      treeLayout(root);

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

      // Rectangular Nodes
      const node = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle')
        .attr('r', d => d.children ? 3.5 : 5.5)
        .style('fill', d => d.children ? '#10b981' : '#34d399')
        .style('stroke', '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      // Family Label (Small text, decluttered)
      node.filter(d => !d.children && d.data.name && !d.data.name.startsWith('Clade_'))
        .append('text')
        .attr('class', 'family-label-text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -8 : 8)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#e7e5e4')
        .style('font-size', '9px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getFamilyName(d.data.name));

      // Sample Label (Revealed on click/selection)
      node.filter(d => !d.children)
        .append('text')
        .attr('class', 'sample-label-text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -8 : 8)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#fb923c')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('display', 'none')
        .text(d => d.data.name);
    }
  },

  onNodeClick(d) {
    const rawName = d.data.name || '';
    if (!rawName || rawName.startsWith('Clade_')) return;

    const familyName = this.getFamilyName(rawName);
    this.selectFamily(familyName);

    if (!d.children && window.App && window.App.variantsData) {
      const sampleList = window.App.distanceData?.samples || [];
      if (sampleList.length >= 2) {
        const otherSample = sampleList.find(s => s !== rawName) || sampleList[0];
        document.getElementById('compareSample1Select').value = rawName;
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
        <div class="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex items-center justify-between font-mono">
          <span>🌿 Click any family button or node on the diagram to zoom in and reveal individual sample names.</span>
          <span class="text-[11px] text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">All Families View</span>
        </div>
      `;
      return;
    }

    const nodeCount = matchedNodes.length || 1;
    const sampleNames = matchedNodes.map(n => n.data.name).filter(n => n && !n.startsWith('Clade_')).join(', ');

    detailBox.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 text-xs space-y-2.5 shadow-xl font-mono">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span class="font-extrabold text-orange-300 text-sm">${familyName} Data Breakdown</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">${nodeCount} Members</span>
        </div>
        
        <div class="pt-1 border-t border-stone-800">
          <span class="text-stone-400">Revealed Samples:</span>
          <span class="text-orange-400 font-bold ml-1">${sampleNames || 'Family Samples'}</span>
        </div>
      </div>
    `;
  }
};
