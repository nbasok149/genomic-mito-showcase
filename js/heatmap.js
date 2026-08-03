/**
 * Distance Matrix Interactive Heatmap Visualizer (D3.js / SVG)
 */

window.DistanceHeatmap = {
  data: null,
  activeSort: 'hierarchical',
  selectedSample: null,

  init(distData) {
    this.data = distData;
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.getElementById('heatmapSortSelect')?.addEventListener('change', (e) => {
      this.activeSort = e.target.value;
      this.render();
    });
  },

  getSortedIndices() {
    const n = this.data.samples.length;
    let indices = Array.from({ length: n }, (_, i) => i);

    if (this.activeSort === 'alphabetical') {
      indices.sort((a, b) => this.data.samples[a].localeCompare(this.data.samples[b]));
    } else if (this.activeSort === 'meandist') {
      const means = indices.map(i => {
        const row = this.data.matrix[i];
        return row.reduce((sum, v) => sum + v, 0) / n;
      });
      indices.sort((a, b) => means[a] - means[b]);
    } else {
      // Default: Hierarchical / Cluster order based on tree or prefix
      indices.sort((a, b) => {
        const pA = this.data.samples[a].substring(0, 2);
        const pB = this.data.samples[b].substring(0, 2);
        if (pA !== pB) return pA.localeCompare(pB);
        return this.data.samples[a].localeCompare(this.data.samples[b]);
      });
    }
    return indices;
  },

  render() {
    const container = document.getElementById('heatmapContainer');
    if (!container || !this.data) return;
    container.innerHTML = '';

    const sortedIndices = this.getSortedIndices();
    const sortedSamples = sortedIndices.map(i => this.data.samples[i]);
    const n = sortedSamples.length;

    const margin = { top: 110, right: 30, bottom: 40, left: 110 };
    const cellSize = Math.min(18, Math.floor((container.clientWidth - margin.left - margin.right) / n));
    const width = cellSize * n;
    const height = cellSize * n;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxDist = this.data.stats.max || 50;
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([maxDist, 0]); // Darker/Blue for low distance, Bright/Yellow for high

    // Tooltip div
    let tooltip = d3.select('#heatmapTooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('id', 'heatmapTooltip')
        .attr('class', 'heatmap-tooltip hidden');
    }

    // Render cells
    for (let rowIdx = 0; rowIdx < n; rowIdx++) {
      const origRow = sortedIndices[rowIdx];
      for (let colIdx = 0; colIdx < n; colIdx++) {
        const origCol = sortedIndices[colIdx];
        const distValue = this.data.matrix[origRow][origCol];

        svg.append('rect')
          .attr('x', colIdx * cellSize)
          .attr('y', rowIdx * cellSize)
          .attr('width', cellSize - 1)
          .attr('height', cellSize - 1)
          .attr('rx', 2)
          .attr('ry', 2)
          .style('fill', colorScale(distValue))
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            tooltip.classed('hidden', false)
              .html(`
                <div class="font-bold text-cyan-300 text-sm mb-1">${sortedSamples[rowIdx]} ↔ ${sortedSamples[colIdx]}</div>
                <div>Manhattan Distance: <span class="font-mono text-emerald-400 font-bold">${distValue.toFixed(4)}</span></div>
                <div class="text-xs text-slate-400 mt-1">Click cell to filter variants for ${sortedSamples[rowIdx]}</div>
              `)
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', () => {
            tooltip.classed('hidden', true);
          })
          .on('click', () => {
            if (window.VariantsTable) {
              window.VariantsTable.setSampleFilter(sortedSamples[rowIdx]);
              document.getElementById('tab-variants')?.click();
            }
          });
      }
    }

    // X Axis Labels (rotated)
    svg.selectAll('.xLabel')
      .data(sortedSamples)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => i * cellSize + cellSize / 2)
      .attr('y', -8)
      .style('text-anchor', 'start')
      .attr('transform', (d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -8)`)
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (window.VariantsTable) {
          window.VariantsTable.setSampleFilter(d);
          document.getElementById('tab-variants')?.click();
        }
      });

    // Y Axis Labels
    svg.selectAll('.yLabel')
      .data(sortedSamples)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', -8)
      .attr('y', (d, i) => i * cellSize + cellSize / 2 + 3)
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (window.VariantsTable) {
          window.VariantsTable.setSampleFilter(d);
          document.getElementById('tab-variants')?.click();
        }
      });
  }
};
