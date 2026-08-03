/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 * Clean diagram with ZERO 'Clade' text, ZERO '[U4]' haplogroup brackets, click-to-reveal sample labels,
 * click-to-deselect sample toggle, and internal branch node circle junction inspector for muted low-VAF mutations.
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
  },

  extractFamilyGroupings() {
    if (!this.treeData) return [];
    const groupingsMap = new Map();
    
    function traverse(node) {
      if (node.name && !node.name.includes('Clade')) {
        const parts = node.name.split('_');
        let key = parts[0];
        const ethName = `Ethnicity ${key}`;
        
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
      <button onclick="window.TreeViewer.clearEthnicitySelection()" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${isAll ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-600/30' : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'} transition-all">
        All Ethnicities (${groupings.length})
      </button>
    `;

    groupings.forEach(g => {
      const active = this.selectedEthnicities.includes(g.key);
      html += `
        <button onclick="window.TreeViewer.toggleEthnicitySelection('${g.key}')" class="family-btn px-3 py-1 text-xs font-semibold rounded-md ${active ? 'bg-orange-600 text-stone-950 shadow-md shadow-orange-600/30 font-bold border border-orange-400' : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500'} transition-all">
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
      // Toggle off / deselect on second click!
      this.selectedEthnicities = this.selectedEthnicities.filter(c => c !== cleanCode);
    } else {
      // Toggle on: max 3 selections
      if (this.selectedEthnicities.length >= 3) {
        this.selectedEthnicities = [cleanCode];
      } else {
        this.selectedEthnicities.push(cleanCode);
      }
    }

    this.renderFamilyGroupButtons();
    this.highlightFamilyCluster();

    // Automatically trigger comparative report popup if 2 or 3 ethnicities are selected!
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
        // Hide family label text so it never overlaps with sample label text
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

    // Zoom to encompass ALL matched nodes cleanly across selected 1-3 ethnicities
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
    return `Ethnicity ${parts[0]}`;
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
        .attr('r', d => d.children ? 6 : 5.5)
        .style('fill', d => d.children ? '#f59e0b' : '#34d399')
        .style('stroke', d => d.children ? '#d97706' : '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      // Family/Ethnicity Label
      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
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

      // Sample Label
      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
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
        .text(d => this.getSampleName(d.data.name));

    } else {
      // Rectangular Phylogram / Cladogram
      const leafCount = root.leaves().length;
      const layoutHeight = Math.max(height - margin.top - margin.bottom, leafCount * 20);
      const treeLayout = d3.tree()
        .size([layoutHeight, width - margin.left - margin.right - 160])
        .separation((a, b) => (a.parent === b.parent ? 1.3 : 2.0));
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
        .attr('r', d => d.children ? 6 : 5.5)
        .style('fill', d => d.children ? '#f59e0b' : '#34d399')
        .style('stroke', d => d.children ? '#d97706' : '#f97316')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.onNodeClick(d));

      // Ethnicity Label
      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
        .append('text')
        .attr('class', 'family-label-text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -8 : 8)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', '#e7e5e4')
        .style('font-size', '9px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(d => this.getFamilyName(d.data.name));

      // Sample Label
      node.filter(d => !d.children && d.data.name && !d.data.name.includes('Clade'))
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
        .text(d => this.getSampleName(d.data.name));
    }
  },

  onNodeClick(d) {
    // If it's an internal branch junction node (circle between samples with children)
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

    // Get all descendant leaf sample names
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

    const nodeName = d.data.name || 'Junction Node';

    // Get variants for sampleA and sampleB
    const varsA = window.App.variantsData.variants.filter(v => v.sample === sampleA);
    const varsB = window.App.variantsData.variants.filter(v => v.sample === sampleB);

    const mapA = new Map(varsA.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const mapB = new Map(varsB.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const sharedHigh = [];
    const lowVafMuted = [];

    // Find low VAF variants (< 15% VAF) indicative of muted mutations over time
    varsA.forEach(vA => {
      if (vA.vaf > 0 && vA.vaf < 0.15) {
        lowVafMuted.push(vA);
      }
    });

    varsB.forEach(vB => {
      if (vB.vaf > 0 && vB.vaf < 0.15) {
        if (!lowVafMuted.some(m => m.pos === vB.pos && m.ref === vB.ref && m.alt === vB.alt && m.sample === vB.sample)) {
          lowVafMuted.push(vB);
        }
      }
    });

    // Find conserved high VAF shared variants between sampleA and sampleB
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
        
        <!-- Header Banner -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-3 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <div class="text-xs text-orange-400 font-bold uppercase tracking-wider">Internal Branch Node: ${nodeName}</div>
              <div class="text-lg font-extrabold text-stone-100">${sampleA} <span class="text-stone-500">↔</span> ${sampleB}</div>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-amber-400 font-bold">
              ${leaves.length} Descendant Lineages
            </div>
          </div>
          <div class="text-xs text-stone-300 font-sans leading-relaxed">
            <strong class="text-stone-200">Descendant Lineages Under Junction:</strong>
            <span class="text-orange-400 font-mono text-[11px] block pt-1">${leaves.join(', ')}</span>
          </div>
        </div>

        <!-- Low VAF / Muted Mutations Highlight Section -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-amber-800/60 space-y-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h4 class="font-bold text-amber-400 font-mono text-sm flex items-center gap-2">
                <span>📉 Low VAF / Muted Mutations Analysis</span>
              </h4>
              <p class="text-stone-400 text-[11px] mt-0.5">Indicative of mutations muted or decaying over time via maternal bottleneck drift</p>
            </div>
            <span class="px-3 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/80 font-mono text-xs font-bold">
              ${lowVafMuted.length} Muted Heteroplasmies Detected
            </span>
          </div>

          <p class="text-stone-300 text-xs leading-relaxed">
            Variants present at low allele frequencies (<strong>VAF &lt; 15%</strong>) in these lineage branches represent <strong>muted or decaying mutations</strong>. Over generations, mitochondrial bottleneck drift and purifying selection reduce heteroplasmy, causing certain mutations to fade over time.
          </p>

          <!-- Low VAF Variants Table -->
          <div class="max-h-60 overflow-y-auto border border-stone-800 rounded-xl bg-stone-950 font-mono text-xs">
            <table class="w-full text-left">
              <thead class="bg-stone-900 text-stone-300 sticky top-0 border-b border-stone-800">
                <tr>
                  <th class="p-2.5">Position</th>
                  <th class="p-2.5">Mutation</th>
                  <th class="p-2.5">Sample</th>
                  <th class="p-2.5">Low VAF %</th>
                  <th class="p-2.5">Gene / Locus</th>
                  <th class="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60 text-[11px]">
                ${lowVafMuted.length > 0 ? lowVafMuted.map(m => `
                  <tr class="hover:bg-stone-900/40">
                    <td class="p-2.5 text-amber-400 font-bold">m.${m.pos}</td>
                    <td class="p-2.5 font-bold text-stone-200">${m.ref} &gt; ${m.alt}</td>
                    <td class="p-2.5 text-orange-300">${m.sample}</td>
                    <td class="p-2.5 text-rose-400 font-bold">${(m.vaf * 100).toFixed(1)}% VAF</td>
                    <td class="p-2.5 text-stone-300">${m.gene || 'Control Region (D-loop)'}</td>
                    <td class="p-2.5"><span class="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800 text-[10px]">Muted over time</span></td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" class="p-4 text-center text-stone-500">
                      No low VAF (&lt;15%) muted mutations detected between these representative samples.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shared High VAF Mutations Section -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <span>🧬 Conserved Ancestral Mutations (${sharedHigh.length})</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">High VAF conserved motifs along junction</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            ${sharedHigh.length > 0 ? sharedHigh.slice(0, 9).map(m => `
              <div class="p-2.5 rounded-xl bg-stone-950 border border-emerald-900/60 flex items-center justify-between">
                <span class="text-emerald-300 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                <span class="text-stone-400 text-[10px] truncate">${m.gene || 'D-loop'}</span>
              </div>
            `).join('') : '<div class="col-span-full p-3 text-stone-500 text-center">No high VAF shared mutations found along this branch.</div>'}
          </div>
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
        <div class="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex items-center justify-between font-mono">
          <span>🌿 Click 1 to 3 ethnicity buttons or sample lines on the diagram to highlight comparative lineages. Click an amber junction circle to inspect muted low-VAF variants.</span>
          <span class="text-[11px] text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">All Ethnicities View</span>
        </div>
      `;
      return;
    }

    const sampleNames = matchedNodes.map(n => n.data.name).filter(n => n && !n.includes('Clade')).join(', ');
    const code1 = selectedCodes[0] || 'MX';
    const code2 = selectedCodes[1] || (code1 === 'MX' ? 'HK' : 'MX');
    const code3 = selectedCodes[2] || '';

    const badges = selectedCodes.map(c => `<span class="bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800 font-bold">Ethnicity ${c}</span>`).join(' ');

    detailBox.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 text-xs space-y-3 shadow-xl font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span class="font-extrabold text-orange-300 text-sm">Selected (${selectedCodes.length}/3):</span>
            <div class="flex items-center space-x-1">${badges}</div>
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
        
        <div class="pt-1 border-t border-stone-800">
          <span class="text-stone-400">Highlighted Lineage Samples:</span>
          <span class="text-orange-400 font-bold ml-1">${sampleNames || 'Selected Samples'}</span>
        </div>
      </div>
    `;
  }
};
