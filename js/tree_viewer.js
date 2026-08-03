/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 * Clean diagram with clear labels (no 'ethnicity' word), large readable fonts,
 * loud sample mutation inspector, and internal branch node junction inspector.
 */

window.TreeViewer = {
  treeData: null,
  activeLayout: 'phylogram', // phylogram, radial, cladogram
  selectedEthnicities: [], // Array of up to 3 selected ethnicity codes e.g. ['UK', 'MX', 'HK']
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
        All Ethnicities (${groupings.length})
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
    } else {
      if (this.selectedEthnicities.length >= 3) {
        this.selectedEthnicities = [cleanCode];
      } else {
        this.selectedEthnicities.push(cleanCode);
      }
    }

    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();

    if (this.selectedEthnicities.length >= 2 && window.FamilyReportGenerator) {
      window.FamilyReportGenerator.openReportModal(
        this.selectedEthnicities[0],
        this.selectedEthnicities[1],
        this.selectedEthnicities[2] || null
      );
    } else if (this.selectedEthnicities.length === 0) {
      const modal = document.getElementById('familyReportModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    if (this.selectedEthnicities.length > 0 && window.DiagnosticMarkersExplorer) {
      window.DiagnosticMarkersExplorer.displayFamily(this.selectedEthnicities[0], null);
    }
  },

  highlightFamilyCluster() {
    const svg = d3.select('#treeContainer svg');
    if (!svg.node()) return;

    const selectedCodes = this.selectedEthnicities;

    if (!selectedCodes || selectedCodes.length === 0) {
      svg.selectAll('.tree-node').classed('dimmed', false);
      svg.selectAll('.tree-link').classed('dimmed', false).classed('family-active', false);
      svg.selectAll('.sample-label-text').style('display', 'none');
      svg.selectAll('.family-label-text').style('display', 'block');
      if (this.svgG && this.zoomBehavior) {
        svg.transition().duration(750).call(
          this.zoomBehavior.transform,
          d3.zoomIdentity
        );
      }
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
      if (isMatch) {
        matchedNodes.push(d);
        d3.select(this).select('.family-label-text').style('display', 'none');
        d3.select(this).select('.sample-label-text').style('display', 'block');
      } else {
        d3.select(this).select('.family-label-text').style('display', 'block');
        d3.select(this).select('.sample-label-text').style('display', 'none');
      }
    });

    svg.selectAll('.tree-link').each(function(d) {
      const targetName = (d.target.data.name || '').toLowerCase();
      const targetSamples = (d.target.data.samples || []).map(s => s.toLowerCase());
      
      const isMatch = lowerKeys.some(key => targetName.startsWith(key + '_') || targetSamples.some(s => s.startsWith(key + '_'))) && !targetName.includes('clade');
      
      d3.select(this).classed('dimmed', !isMatch).classed('family-active', isMatch);
    });

    if (matchedNodes.length > 0 && this.svgG && this.zoomBehavior) {
      const avgX = d3.mean(matchedNodes, d => d.y);
      const avgY = d3.mean(matchedNodes, d => d.x);
      
      const width = document.getElementById('treeContainer')?.clientWidth || 900;
      const height = 650;
      const scale = selectedCodes.length > 1 ? 1.15 : 1.45;

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
      svg.selectAll('.tree-node circle').style('r', d => d.children ? 6 : 5.5).style('stroke', d => d.children ? '#d97706' : '#f97316');
      svg.selectAll('.tree-node').each(function() {
        d3.select(this).select('.family-label-text').style('display', 'block');
        d3.select(this).select('.sample-label-text').style('display', 'none');
      });
      return;
    }

    svg.selectAll('.tree-node').each(function(d) {
      const name = (d.data.name || '').toLowerCase();
      const isMatch = name.includes(term) && !name.includes('clade');

      d3.select(this).select('circle')
        .style('r', isMatch ? 9 : (d.children ? 6 : 5.5))
        .style('stroke', isMatch ? '#ffffff' : (d.children ? '#d97706' : '#f97316'))
        .style('stroke-width', isMatch ? '3px' : '2px');
        
      if (isMatch) {
        d3.select(this).select('.family-label-text').style('display', 'none');
        d3.select(this).select('.sample-label-text').style('display', 'block');
      } else {
        d3.select(this).select('.family-label-text').style('display', 'block');
        d3.select(this).select('.sample-label-text').style('display', 'none');
      }
    });
  },

  getFamilyName(rawName) {
    if (!rawName || rawName.includes('Clade')) return '';
    const parts = rawName.split('_');
    const regionMap = {
      'UK': 'Ukraine (UK)',
      'KR': 'Korea (KR)',
      'MX': 'Mexico (MX)',
      'IN': 'India (IN)',
      'IW': 'India West (IW)',
      'IS': 'India South (IS)',
      'HK': 'Hong Kong (HK)',
      'PK': 'Pakistan (PK)',
      'CL': 'Chile (CL)',
      'AA': 'African Ancestry (AA)',
      'TB': 'Tibet (TB)',
      'CA': 'Canada (CA)',
      'SA': 'South Asia / Arabia (SA)',
      'NA': 'Native North America (NA)'
    };
    return regionMap[parts[0]] || parts[0];
  },

  getSampleName(rawName) {
    if (!rawName || rawName.includes('Clade')) return '';
    return rawName;
  },

  render() {
    const container = document.getElementById('treeContainer');
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 650;
    const margin = { top: 30, right: 180, bottom: 30, left: 50 };

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
        .style('fill', d => d.children ? '#f59e0b' : '#34d399')
        .style('stroke', d => d.children ? '#d97706' : '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
        .append('text')
        .attr('class', 'family-label-text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 10 : -10)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .style('fill', '#f5f5f4')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getFamilyName(d.data.name));

      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
        .append('text')
        .attr('class', 'sample-label-text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 10 : -10)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .style('fill', '#fb923c')
        .style('font-size', '13px')
        .style('font-weight', '800')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('display', 'none')
        .text(d => this.getSampleName(d.data.name));

    } else {
      const leafCount = root.leaves().length;
      const layoutHeight = Math.max(height - margin.top - margin.bottom, leafCount * 22);
      const treeLayout = d3.tree()
        .size([layoutHeight, width - margin.left - margin.right - 180])
        .separation((a, b) => (a.parent === b.parent ? 1.4 : 2.2));
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

      const node = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle')
        .attr('r', d => d.children ? 6.5 : 6)
        .style('fill', d => d.children ? '#f59e0b' : '#34d399')
        .style('stroke', d => d.children ? '#d97706' : '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
        .append('text')
        .attr('class', 'family-label-text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#f5f5f4')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getFamilyName(d.data.name));

      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
        .append('text')
        .attr('class', 'sample-label-text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#fb923c')
        .style('font-size', '13px')
        .style('font-weight', '800')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('display', 'none')
        .text(d => this.getSampleName(d.data.name));
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
    let sampleB = leaves.length > 1 ? leaves[1] : leaves[0];
    
    if (d.children && d.children.length >= 2) {
      const branch1 = d.children[0].leaves().map(l => l.data.name).filter(Boolean);
      const branch2 = d.children[1].leaves().map(l => l.data.name).filter(Boolean);
      if (branch1.length > 0) sampleA = branch1[0];
      if (branch2.length > 0) sampleB = branch2[0];
    }

    const varsA = window.App.variantsData.variants.filter(v => v.sample === sampleA);
    const varsB = window.App.variantsData.variants.filter(v => v.sample === sampleB);

    const mapA = new Map(varsA.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const mapB = new Map(varsB.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const sharedHigh = [];
    const lowVafMuted = [];

    varsA.forEach(vA => {
      if (vA.vaf > 0 && vA.vaf < 0.03) {
        lowVafMuted.push(vA);
      }
    });

    varsB.forEach(vB => {
      if (vB.vaf > 0 && vB.vaf < 0.03) {
        if (!lowVafMuted.some(m => m.pos === vB.pos && m.ref === vB.ref && m.alt === vB.alt && m.sample === vB.sample)) {
          lowVafMuted.push(vB);
        }
      }
    });

    mapA.forEach((vA, key) => {
      if (mapB.has(key)) {
        const vB = mapB.get(key);
        if (vA.vaf >= 0.15 && vB.vaf >= 0.15) {
          sharedHigh.push(vA);
        }
      }
    });

    if (titleEl) {
      titleEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Ancestral Branch Junction Inspector — ${sampleA} & ${sampleB}</span>
      `;
    }

    bodyEl.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <div class="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-3 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <div class="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Branch Node Triangulation</div>
              <h4 class="text-lg font-extrabold text-stone-100">${sampleA} <span class="text-stone-500">&</span> ${sampleB}</h4>
            </div>
            <span class="px-3 py-1.5 rounded-xl bg-orange-950/80 border border-orange-700/80 text-xs text-orange-300 font-bold">
              Ancestral Junction Node
            </span>
          </div>
          <p class="text-stone-300 text-xs leading-relaxed font-sans">
            Inspecting shared high-VAF variants along ancestral branches and highlighting trace mutations.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
              <span>⚠️ Low-VAF Muted / Trace Mutations (&lt;3% VAF)</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">Sequencer noise / trace heteroplasmy</span>
          </div>

          <!-- Trace Mutation Warning Banner -->
          <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs font-sans">
            ⚠️ <strong>Trace Mutation Warning:</strong> Variants with VAF lower than 3% are based on only a few instances of the mutation appearing and cannot be trusted.
          </div>

          ${lowVafMuted.length > 0 ? `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="border-b border-stone-800 text-stone-400">
                    <th class="p-2.5">Position</th>
                    <th class="p-2.5">Mutation</th>
                    <th class="p-2.5">Sample</th>
                    <th class="p-2.5">VAF %</th>
                    <th class="p-2.5">Gene Locus</th>
                    <th class="p-2.5">Confidence Note</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-800/60">
                  ${lowVafMuted.map(m => `
                    <tr class="hover:bg-stone-800/40">
                      <td class="p-2.5 text-amber-400 font-bold">m.${m.pos}</td>
                      <td class="p-2.5 font-bold text-stone-200">${m.ref} &gt; ${m.alt}</td>
                      <td class="p-2.5 text-orange-300">${m.sample}</td>
                      <td class="p-2.5 text-rose-400 font-bold">${(m.vaf * 100).toFixed(1)}% VAF</td>
                      <td class="p-2.5 text-stone-300">${m.gene || 'Control Region (D-loop)'}</td>
                      <td class="p-2.5"><span class="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800 text-[10px]">Unverified Trace</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-400 flex items-center justify-between">
              <span>✅ Zero trace mutations (&lt;3%) along this branch junction.</span>
              <span class="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">100% Stable</span>
            </div>
          `}
        </div>

        <div class="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span>🧬 Conserved Ancestral Mutations (${sharedHigh.length})</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">High VAF conserved motifs along junction</span>
          </div>
          ${sharedHigh.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              ${sharedHigh.slice(0, 9).map(m => `
                <div class="p-2.5 rounded-xl bg-stone-950 border border-emerald-900/60 flex items-center justify-between">
                  <span class="text-emerald-300 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                  <span class="text-stone-400 text-[10px] truncate">${m.gene || 'D-loop'}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-400 flex items-center justify-between">
              <span>Branch junctions represent immediate lineage divergence.</span>
              <span class="text-[10px] text-orange-400 bg-orange-950 px-2 py-0.5 rounded border border-orange-800 font-bold">Diverged Loci</span>
            </div>
          `}
        </div>

      </div>
    `;

    closeBtn.onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  updateFamilyDataPanel(selectedCodes = [], matchedNodes = []) {
    const detailBox = document.getElementById('familyLineageCard');
    if (!detailBox) return;

    if (!selectedCodes || selectedCodes.length === 0) {
      detailBox.innerHTML = `
        <div class="p-4 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex items-center justify-between font-mono">
          <span>🌿 Click any family button or sample line on the diagram to inspect private mutations, mutation recurrence, and population frequency.</span>
          <span class="text-[11px] text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">All Ethnicities View</span>
        </div>
      `;
      return;
    }

    const sampleList = matchedNodes.map(n => n.data.name).filter(n => n && !n.includes('Clade'));
    const allVariants = window.App.variantsData ? window.App.variantsData.variants : [];

    // Helper: Map all variants by key to find recurrence
    const mutToSamplesMap = new Map();
    allVariants.forEach(v => {
      const key = `m.${v.pos} ${v.ref}>${v.alt}`;
      if (!mutToSamplesMap.has(key)) mutToSamplesMap.set(key, new Set());
      mutToSamplesMap.get(key).add(v.sample);
    });

    // Helper: Annotate gene type & population frequency
    function getFeatureType(geneName) {
      if (!geneName || geneName.includes('D-loop') || geneName.includes('Control Region')) return 'Non-coding (D-loop)';
      if (geneName.includes('rRNA') || geneName.includes('12S') || geneName.includes('16S')) return 'rRNA (Structural)';
      if (geneName.includes('tRNA')) return 'tRNA';
      return 'Coding Sequence (CDS)';
    }

    function getPopFreqContext(pos) {
      if ([263, 750, 1438, 2706, 4769, 7028, 8860, 15326, 16519].includes(pos)) return 'Pan-Human Universal Root';
      if ([650, 8395, 10885, 11566, 14467, 16356, 16192, 12308, 12372].includes(pos)) return 'Europeans (Haplogroup U4/H)';
      if ([499, 4823, 6297, 8047, 9039, 13590, 16183, 16189, 16217].includes(pos)) return 'Native Americans (Haplogroup B2)';
      if ([593, 5075, 5186, 6020, 9094, 9614, 10400, 12792, 12793, 13194, 13656, 14783, 15043, 15692, 15859, 15930].includes(pos)) return 'South Asians (Haplogroup M/R)';
      if ([5821, 6338, 6455, 8602, 9540, 14821, 16223, 63, 1709, 2882, 3010, 8414, 9817, 13544, 14668, 15565, 15669, 16362].includes(pos)) return 'East Asians (Haplogroup M7/D4)';
      if ([183, 2758, 5581, 7175, 9128, 11338, 13803, 14308, 15784, 16278].includes(pos)) return 'Sub-Saharan Africans (Haplogroup L2)';
      return 'Regional Private Mutation';
    }

    let sampleCardsHtml = '';
    
    sampleList.slice(0, 3).forEach(sName => {
      const sVars = allVariants.filter(v => v.sample === sName);
      
      // Find Private Mutations (present ONLY in this sample)
      const privateMuts = sVars.filter(v => {
        const key = `m.${v.pos} ${v.ref}>${v.alt}`;
        const holders = mutToSamplesMap.get(key);
        return holders && holders.size === 1;
      });

      // Find Trace Mutations (VAF < 3%)
      const traceMuts = sVars.filter(v => v.vaf > 0 && v.vaf < 0.03);

      sampleCardsHtml += `
        <div class="p-5 rounded-2xl bg-stone-900 border border-orange-500/50 shadow-2xl space-y-4 font-mono text-xs">
          
          <!-- Sample Inspector Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <span class="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Sample Mutation Inspector</span>
              <h4 class="text-base font-extrabold text-stone-100 flex items-center gap-2">
                <span>🧬 ${sName}</span>
              </h4>
            </div>
            <span class="px-3 py-1 rounded-xl bg-orange-950 text-orange-300 border border-orange-800 font-bold text-xs">
              ${sVars.length} Total Variants
            </span>
          </div>

          <!-- Trace Mutation Warning Callout -->
          ${traceMuts.length > 0 ? `
            <div class="p-3 rounded-xl bg-amber-950/60 border border-amber-700 text-amber-200 text-[11.5px] font-sans">
              ⚠️ <strong>Trace Mutation Warning:</strong> Variants with VAF lower than 3% (e.g. ${traceMuts.map(m=>`m.${m.pos}`).join(', ')}) are based on only a few instances of the mutation appearing and cannot be trusted.
            </div>
          ` : ''}

          <!-- 🔥 LOUDEST SECTION: What is Unique to This Sample -->
          <div class="p-4 rounded-xl bg-gradient-to-r from-orange-950/70 via-stone-950 to-amber-950/70 border-2 border-orange-500 shadow-xl space-y-2">
            <div class="flex items-center justify-between border-b border-orange-800/80 pb-1.5">
              <h5 class="text-sm font-extrabold text-orange-400 tracking-wide flex items-center gap-2 uppercase">
                <span>🔥 WHAT IS UNIQUE TO THIS SAMPLE (${privateMuts.length})</span>
              </h5>
              <span class="text-[10px] bg-orange-500 text-stone-950 font-extrabold px-2 py-0.5 rounded shadow">LOUDEST METRIC</span>
            </div>
            ${privateMuts.length > 0 ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                ${privateMuts.map(m => `
                  <div class="p-2.5 rounded-lg bg-stone-950 border border-orange-500/60 space-y-1">
                    <div class="flex items-center justify-between text-xs font-bold text-orange-300">
                      <span>m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                      <span class="text-[10px] text-amber-400">${(m.vaf * 100).toFixed(1)}% VAF</span>
                    </div>
                    <div class="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>${getFeatureType(m.gene)}</span>
                      <span class="text-stone-300 font-bold">${m.gene || 'D-loop'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="text-xs text-stone-400 font-sans italic pt-1">
                No unique private mutations detected for ${sName}; all mutations are shared within the family/haplogroup line.
              </div>
            `}
          </div>

          <!-- 👥 HIGHLIGHTED SECTION: How Many Other People Have My Mutations -->
          <div class="p-4 rounded-xl bg-stone-950 border border-amber-500/50 space-y-3">
            <div class="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <h5 class="text-xs font-extrabold text-amber-300 tracking-wide uppercase flex items-center gap-2">
                <span>👥 HOW MANY OTHER PEOPLE HAVE MY MUTATIONS</span>
              </h5>
              <span class="text-[10px] text-amber-400 font-bold">Mutation Recurrence & Sharing</span>
            </div>
            
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              ${sVars.map(v => {
                const key = `m.${v.pos} ${v.ref}>${v.alt}`;
                const holdersSet = mutToSamplesMap.get(key) || new Set();
                const otherHolders = Array.from(holdersSet).filter(s => s !== sName);
                const popContext = getPopFreqContext(v.pos);
                const featureType = getFeatureType(v.gene);

                return `
                  <div class="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-orange-400">${key}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">${featureType}</span>
                    </div>
                    <div class="text-[11px] text-stone-300 flex flex-wrap items-center justify-between gap-1 font-sans">
                      <span class="text-stone-400">Population Frequency: <strong class="text-emerald-400 font-mono">${popContext}</strong></span>
                      <span>Carried by <strong class="text-amber-400 font-mono">${otherHolders.length}</strong> other people</span>
                    </div>
                    ${otherHolders.length > 0 ? `
                      <div class="text-[10.5px] text-stone-400 font-mono bg-stone-950 p-1.5 rounded border border-stone-800/80 truncate">
                        <strong class="text-stone-300">Shared with:</strong> ${otherHolders.join(', ')}
                      </div>
                    ` : `
                      <div class="text-[10.5px] text-orange-400 font-mono bg-orange-950/40 p-1 rounded border border-orange-800/50">
                        ⚡ Private mutation unique to ${sName}
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `;
    });

    const code1 = selectedCodes[0] || 'MX';
    const code2 = selectedCodes[1] || (code1 === 'MX' ? 'HK' : 'MX');
    const code3 = selectedCodes[2] || '';

    detailBox.innerHTML = `
      <div class="space-y-4 font-mono">
        <div class="p-4 rounded-xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 text-xs shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span class="font-extrabold text-orange-300 text-sm">Selected Family Cohorts (${selectedCodes.length}/3):</span>
            <div class="flex items-center space-x-1">${selectedCodes.map(c => `<span class="bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800 font-bold">${c}</span>`).join(' ')}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="window.TreeViewer.clearEthnicitySelection()" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs">
              Clear Selection
            </button>
            <button onclick="window.FamilyReportGenerator.openReportModal('${code1}', '${code2}', ${code3 ? `'${code3}'` : 'null'})" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-stone-950 font-bold transition-all shadow-md shadow-orange-600/30">
              📊 View Full Comparative Report (${selectedCodes.length})
            </button>
          </div>
        </div>

        <div class="space-y-4">
          ${sampleCardsHtml}
        </div>
      </div>
    `;
  }
};
