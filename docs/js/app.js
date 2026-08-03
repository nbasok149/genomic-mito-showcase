/**
 * Main Web Showcase Application Controller
 */

window.App = {
  variantsData: null,
  distanceData: null,
  treeData: null,
  annotationsData: null,

  async init() {
    this.setupNavigation();
    await this.loadDatasets();
    this.renderMetrics();
    this.setupComparatorModal();
  },

  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.add('hidden'));

        tab.classList.add('active');
        document.getElementById(`content-${target}`)?.classList.remove('hidden');

        // Trigger re-render of dynamic visualizers if needed
        if (target === 'heatmap' && window.DistanceHeatmap) {
          window.DistanceHeatmap.render();
        } else if ((target === 'tree' || target === 'family') && window.TreeViewer) {
          window.TreeViewer.render();
        }
      });
    });
  },

  async loadDatasets() {
    try {
      const [vRes, dRes, tRes, aRes] = await Promise.all([
        fetch('data/variants_dataset.json').then(r => r.json()),
        fetch('data/distance_matrix.json').then(r => r.json()),
        fetch('data/phylo_tree.json').then(r => r.json()),
        fetch('data/genome_annotations.json').then(r => r.json())
      ]);

      this.variantsData = vRes;
      this.distanceData = dRes;
      this.treeData = tRes;
      this.annotationsData = aRes;

      // Initialize sub-modules
      if (window.VariantsTable && vRes.variants) {
        window.VariantsTable.init(vRes.variants);
      }
      if (window.DistanceHeatmap && dRes) {
        window.DistanceHeatmap.init(dRes);
      }
      if (window.TreeViewer && tRes) {
        window.TreeViewer.init(tRes);
      }
      if (window.LocusInspector && aRes) {
        window.LocusInspector.init(aRes, vRes.variants || []);
      }

    } catch (err) {
      console.error('Error loading genomic JSON datasets:', err);
    }
  },

  renderMetrics() {
    if (!this.variantsData || !this.distanceData) return;

    const totalSamples = this.distanceData.samples ? this.distanceData.samples.length : 43;
    const totalVars = this.variantsData.variants ? this.variantsData.variants.length : 1420;

    const mSamples = document.getElementById('metricSamples');
    const mVars = document.getElementById('metricVariants');
    const mGenome = document.getElementById('metricGenome');
    const mMaxDist = document.getElementById('metricMaxDist');

    if (mSamples) mSamples.textContent = totalSamples;
    if (mVars) mVars.textContent = totalVars.toLocaleString();
    if (mGenome) mGenome.textContent = '16,569 bp';
    if (mMaxDist) mMaxDist.textContent = (this.distanceData.stats.max || 50.51).toFixed(2);
  },

  setupComparatorModal() {
    const modal = document.getElementById('comparatorModal');
    const openBtn = document.getElementById('openComparatorBtn');
    const closeBtn = document.getElementById('closeComparatorBtn');
    const runBtn = document.getElementById('runCompareBtn');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', () => {
      this.populateComparatorDropdowns();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

    runBtn?.addEventListener('click', () => this.runSampleComparison());
  },

  populateComparatorDropdowns() {
    if (!this.distanceData || !this.distanceData.samples) return;
    const s1Select = document.getElementById('compareSample1Select');
    const s2Select = document.getElementById('compareSample2Select');
    if (!s1Select || !s2Select) return;

    const options = this.distanceData.samples.map(s => `<option value="${s}">${s}</option>`).join('');
    s1Select.innerHTML = options;
    s2Select.innerHTML = options;

    if (this.distanceData.samples.length >= 2) {
      s1Select.selectedIndex = 0;
      s2Select.selectedIndex = 1;
    }
  },

  runSampleComparison() {
    const s1 = document.getElementById('compareSample1Select')?.value;
    const s2 = document.getElementById('compareSample2Select')?.value;
    const resultsContainer = document.getElementById('comparatorResults');

    if (!s1 || !s2 || !resultsContainer || !this.variantsData) return;

    if (s1 === s2) {
      resultsContainer.innerHTML = `<div class="p-4 rounded bg-amber-900/40 text-amber-200 border border-amber-700">Please select two different samples to compare.</div>`;
      return;
    }

    const vars1 = this.variantsData.variants.filter(v => v.sample === s1);
    const vars2 = this.variantsData.variants.filter(v => v.sample === s2);

    const map1 = new Map(vars1.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const map2 = new Map(vars2.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const conserved = [];
    const only1 = [];
    const only2 = [];

    map1.forEach((v1, key) => {
      if (map2.has(key)) {
        const v2 = map2.get(key);
        conserved.push({
          pos: v1.pos, ref: v1.ref, alt: v1.alt, gene: v1.gene,
          vaf1: v1.vaf, vaf2: v2.vaf, diff: (v1.vaf - v2.vaf)
        });
      } else {
        only1.push(v1);
      }
    });

    map2.forEach((v2, key) => {
      if (!map1.has(key)) {
        only2.push(v2);
      }
    });

    resultsContainer.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-3 text-center text-xs">
          <div class="p-3 rounded bg-emerald-900/30 border border-emerald-700/50">
            <div class="text-emerald-400 font-bold text-lg">${conserved.length}</div>
            <div class="text-slate-300">Conserved Variants</div>
          </div>
          <div class="p-3 rounded bg-cyan-900/30 border border-cyan-700/50">
            <div class="text-cyan-400 font-bold text-lg">${only1.length}</div>
            <div class="text-slate-300">Unique to ${s1}</div>
          </div>
          <div class="p-3 rounded bg-purple-900/30 border border-purple-700/50">
            <div class="text-purple-400 font-bold text-lg">${only2.length}</div>
            <div class="text-slate-300">Unique to ${s2}</div>
          </div>
        </div>

        <div class="max-h-60 overflow-y-auto border border-slate-700 rounded">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800 text-slate-300 sticky top-0">
              <tr>
                <th class="p-2">Status</th>
                <th class="p-2">Pos</th>
                <th class="p-2">Ref>Alt</th>
                <th class="p-2">VAF (${s1})</th>
                <th class="p-2">VAF (${s2})</th>
                <th class="p-2">Δ VAF</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              ${conserved.map(item => `
                <tr class="hover:bg-slate-800/40">
                  <td class="p-2 font-bold text-emerald-400">CONSERVED</td>
                  <td class="p-2 font-mono">${item.pos}</td>
                  <td class="p-2 font-mono">${item.ref}>${item.alt}</td>
                  <td class="p-2 font-mono">${(item.vaf1 * 100).toFixed(1)}%</td>
                  <td class="p-2 font-mono">${(item.vaf2 * 100).toFixed(1)}%</td>
                  <td class="p-2 font-mono text-cyan-300">${(item.diff * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
              ${only1.map(v => `
                <tr class="hover:bg-slate-800/40">
                  <td class="p-2 font-bold text-cyan-400">UNIQUE (${s1})</td>
                  <td class="p-2 font-mono">${v.pos}</td>
                  <td class="p-2 font-mono">${v.ref}>${v.alt}</td>
                  <td class="p-2 font-mono">${(v.vaf * 100).toFixed(1)}%</td>
                  <td class="p-2 text-slate-500">N/A</td>
                  <td class="p-2 text-slate-500">N/A</td>
                </tr>
              `).join('')}
              ${only2.map(v => `
                <tr class="hover:bg-slate-800/40">
                  <td class="p-2 font-bold text-purple-400">UNIQUE (${s2})</td>
                  <td class="p-2 font-mono">${v.pos}</td>
                  <td class="p-2 font-mono">${v.ref}>${v.alt}</td>
                  <td class="p-2 text-slate-500">N/A</td>
                  <td class="p-2 font-mono">${(v.vaf * 100).toFixed(1)}%</td>
                  <td class="p-2 text-slate-500">N/A</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => window.App.init());
