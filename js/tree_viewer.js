/**
 * Interactive SVG Phylogenetic Tree Visualizer (D3.js)
 */

window.TreeViewer = {
  treeData: null,
  activeLayout: 'phylogram', // phylogram, radial, cladogram

  init(data) {
    this.treeData = data;
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.getElementById('treeLayoutSelect')?.addEventListener('change', (e) => {
      this.activeLayout = e.target.value;
      this.render();
    });
  },

  render() {
    const container = document.getElementById('treeContainer');
    if (!container || !this.treeData) return;
    container.innerHTML = '';

    const width = container.clientWidth || 900;
    const height = 650;
    const margin = { top: 40, right: 120, bottom: 40, left: 60 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#0f172a');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Zoom & Pan Behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const root = d3.hierarchy(this.treeData);

    if (this.activeLayout === 'radial') {
      const radius = Math.min(width, height) / 2 - 80;
      const cluster = d3.cluster().size([360, radius]);
      cluster(root);

      const radialG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      // Radial Links
      radialG.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
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
        .attr('r', d => d.children ? 4 : 6)
        .style('fill', d => d.children ? '#64748b' : '#06b6d4')
        .on('click', (event, d) => {
          if (!d.children && window.VariantsTable) {
            window.VariantsTable.setSampleFilter(d.data.name);
            document.getElementById('tab-variants')?.click();
          }
        });

      node.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.x < 180 ? 8 : -8)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .attr('transform', d => d.x >= 180 ? 'rotate(180)' : null)
        .text(d => d.data.name + (d.data.haplogroup ? ` [${d.data.haplogroup}]` : ''));

    } else {
      // Rectangular Phylogram / Cladogram
      const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right - 120]);
      treeLayout(root);

      // Links
      g.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('d', d => {
          if (this.activeLayout === 'cladogram') {
            return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
          } else {
            return d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x)(d);
          }
        });

      // Nodes
      const node = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle')
        .attr('r', d => d.children ? 4 : 6)
        .style('fill', d => d.children ? '#64748b' : '#06b6d4')
        .on('click', (event, d) => {
          if (!d.children && window.VariantsTable) {
            window.VariantsTable.setSampleFilter(d.data.name);
            document.getElementById('tab-variants')?.click();
          }
        });

      node.append('text')
        .attr('dy', '0.32em')
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name + (d.data.haplogroup ? ` (${d.data.haplogroup})` : ''));
    }
  }
};
