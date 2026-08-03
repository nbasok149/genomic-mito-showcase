/**
 * Variant Search & Filtering Engine
 */

window.VariantsTable = {
  data: [],
  filtered: [],
  currentPage: 1,
  pageSize: 15,
  selectedSampleFilter: '',

  init(variants) {
    this.data = variants;
    this.filtered = [...this.data];
    this.populateSampleFilter();
    this.bindEvents();
    this.render();
  },

  populateSampleFilter() {
    const samples = [...new Set(this.data.map(v => v.sample))].sort();
    const select = document.getElementById('tableSampleFilter');
    if (!select) return;
    select.innerHTML = '<option value="">All 43 Samples</option>';
    samples.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });
  },

  bindEvents() {
    document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
    document.getElementById('tableSampleFilter')?.addEventListener('change', (e) => {
      this.selectedSampleFilter = e.target.value;
      this.applyFilters();
    });
    
    const vafSlider = document.getElementById('vafSlider');
    const vafValDisplay = document.getElementById('vafValDisplay');
    vafSlider?.addEventListener('input', (e) => {
      if (vafValDisplay) vafValDisplay.textContent = `${Math.round(e.target.value * 100)}%`;
      this.applyFilters();
    });

    document.getElementById('depthFilter')?.addEventListener('input', () => this.applyFilters());
    document.getElementById('passOnlyCheck')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('homopolymerCheck')?.addEventListener('change', () => this.applyFilters());

    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
      }
    });

    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
      const maxPages = Math.ceil(this.filtered.length / this.pageSize);
      if (this.currentPage < maxPages) {
        this.currentPage++;
        this.render();
      }
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCsv());
  },

  setSampleFilter(sampleName) {
    this.selectedSampleFilter = sampleName;
    const select = document.getElementById('tableSampleFilter');
    if (select) select.value = sampleName;
    this.applyFilters();
  },

  applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const minVaf = parseFloat(document.getElementById('vafSlider')?.value || 0.1);
    const minDepth = parseInt(document.getElementById('depthFilter')?.value || 0, 10);
    const passOnly = document.getElementById('passOnlyCheck')?.checked || false;
    const homopolymerOnly = document.getElementById('homopolymerCheck')?.checked || false;

    this.filtered = this.data.filter(v => {
      if (this.selectedSampleFilter && v.sample !== this.selectedSampleFilter) return false;
      if (v.vaf < minVaf) return false;
      if (v.depth < minDepth) return false;
      if (passOnly && v.status !== 'PASS') return false;
      if (homopolymerOnly && !v.homopolymer) return false;

      if (search) {
        const matchesPos = v.pos.toString().includes(search);
        const matchesSample = v.sample.toLowerCase().includes(search);
        const matchesGene = v.gene.toLowerCase().includes(search);
        const matchesRefAlt = `${v.ref}>${v.alt}`.toLowerCase().includes(search);
        if (!matchesPos && !matchesSample && !matchesGene && !matchesRefAlt) return false;
      }
      return true;
    });

    this.currentPage = 1;
    this.render();
  },

  render() {
    const tbody = document.getElementById('variantsTableBody');
    const countDisplay = document.getElementById('filteredCountDisplay');
    if (!tbody) return;

    if (countDisplay) {
      countDisplay.textContent = `Showing ${this.filtered.length} of ${this.data.length} variants`;
    }

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.filtered.slice(startIdx, startIdx + this.pageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-400">No variants match the selected filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = pageItems.map(v => `
      <tr class="border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors text-sm">
        <td class="py-3 px-4 font-semibold text-cyan-400">${v.sample}</td>
        <td class="py-3 px-4 font-mono font-bold text-slate-200">${v.pos.toLocaleString()}</td>
        <td class="py-3 px-4"><span class="base-pill base-${v.ref}">${v.ref}</span></td>
        <td class="py-3 px-4"><span class="base-pill base-${v.alt.replace('<DEL>', 'DEL')}">${v.alt}</span></td>
        <td class="py-3 px-4 font-semibold text-emerald-400">${(v.vaf * 100).toFixed(1)}%</td>
        <td class="py-3 px-4 text-slate-300">${v.depth}x</td>
        <td class="py-3 px-4 text-xs text-slate-400">${v.gene}</td>
        <td class="py-3 px-4">
          ${v.homopolymer ? '<span class="px-2 py-0.5 text-xs rounded bg-purple-900/50 text-purple-300 border border-purple-700">Poly-N</span>' : '<span class="text-slate-500">-</span>'}
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 text-xs rounded font-medium ${v.status === 'PASS' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'}">
            ${v.status}
          </span>
        </td>
      </tr>
    `).join('');

    const pageInfo = document.getElementById('pageInfo');
    const maxPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${maxPages}`;
  },

  exportCsv() {
    if (this.filtered.length === 0) return;
    const headers = ['Sample', 'Position', 'Ref', 'Alt', 'VAF', 'Depth', 'StrandBias', 'Homopolymer', 'Gene', 'Status'];
    const rows = this.filtered.map(v => [
      v.sample, v.pos, v.ref, v.alt, v.vaf, v.depth, v.strand_bias, v.homopolymer, `"${v.gene}"`, v.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mitochondrial_variants_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
