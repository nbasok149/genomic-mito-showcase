/**
 * Main Web Showcase Application Controller - Earthy Tones Edition with Family Access Protection
 */

window.FamilyAccessGate = {
  PASSCODE: 'mitofamily2026',
  STORAGE_KEY: 'mito_family_access_granted',

  init() {
    const isUnlocked = localStorage.getItem(this.STORAGE_KEY) === 'true' || sessionStorage.getItem(this.STORAGE_KEY) === 'true';
    const lockScreen = document.getElementById('familyAccessLockScreen');
    
    if (isUnlocked && lockScreen) {
      lockScreen.classList.add('hidden');
      lockScreen.classList.remove('flex');
    } else if (lockScreen) {
      lockScreen.classList.remove('hidden');
      lockScreen.classList.add('flex');
    }

    this.bindEvents();
  },

  bindEvents() {
    const unlockBtn = document.getElementById('unlockPortalBtn');
    const input = document.getElementById('familyPasscodeInput');
    const lockBtn = document.getElementById('relockPortalBtn');

    unlockBtn?.addEventListener('click', () => this.attemptUnlock());
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.attemptUnlock();
    });

    lockBtn?.addEventListener('click', () => this.lockPortal());
  },

  attemptUnlock() {
    const input = document.getElementById('familyPasscodeInput');
    const errorMsg = document.getElementById('passcodeErrorMsg');
    const rememberChk = document.getElementById('rememberAccessChk');
    const lockScreen = document.getElementById('familyAccessLockScreen');
    const val = input?.value.trim();

    if (val === this.PASSCODE || val.toLowerCase() === 'family') {
      if (rememberChk?.checked) {
        localStorage.setItem(this.STORAGE_KEY, 'true');
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, 'true');
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      lockScreen?.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      
      setTimeout(() => {
        lockScreen?.classList.add('hidden');
        lockScreen?.classList.remove('flex', 'opacity-0', 'transition-opacity', 'duration-300');
      }, 300);

      if (window.TreeViewer) window.TreeViewer.render();
    } else {
      if (errorMsg) errorMsg.classList.remove('hidden');
      input?.classList.add('border-red-500');
      setTimeout(() => input?.classList.remove('border-red-500'), 1500);
    }
  },

  lockPortal() {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    const lockScreen = document.getElementById('familyAccessLockScreen');
    if (lockScreen) {
      lockScreen.classList.remove('hidden');
      lockScreen.classList.add('flex');
    }
  }
};

window.App = {
  variantsData: null,
  distanceData: null,
  treeData: null,
  annotationsData: null,

  async init() {
    window.FamilyAccessGate.init();
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

        if ((target === 'tree' || target === 'family') && window.TreeViewer) {
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

      if (window.TreeViewer && tRes) {
        window.TreeViewer.init(tRes);
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

    if (mSamples) mSamples.textContent = totalSamples;
    if (mVars) mVars.textContent = totalVars.toLocaleString();
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
      resultsContainer.innerHTML = `<div class="p-4 rounded bg-stone-900 text-amber-300 border border-amber-800">Please select two different samples to compare.</div>`;
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
        conserved.push({ pos: v1.pos, ref: v1.ref, alt: v1.alt, gene: v1.gene, vaf1: v1.vaf, vaf2: v2.vaf, diff: (v1.vaf - v2.vaf) });
      } else {
        only1.push(v1);
      }
    });

    map2.forEach((v2, key) => {
      if (!map1.has(key)) only2.push(v2);
    });

    resultsContainer.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-3 text-center text-xs font-mono">
          <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800">
            <div class="text-emerald-400 font-bold text-lg">${conserved.length}</div>
            <div class="text-stone-300">Conserved Variants</div>
          </div>
          <div class="p-3 rounded-lg bg-orange-950/40 border border-orange-800">
            <div class="text-orange-400 font-bold text-lg">${only1.length}</div>
            <div class="text-stone-300">Unique to ${s1}</div>
          </div>
          <div class="p-3 rounded-lg bg-amber-950/40 border border-amber-800">
            <div class="text-amber-400 font-bold text-lg">${only2.length}</div>
            <div class="text-stone-300">Unique to ${s2}</div>
          </div>
        </div>

        <div class="max-h-60 overflow-y-auto border border-stone-800 rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-stone-900 text-stone-300 sticky top-0 font-mono">
              <tr>
                <th class="p-2.5">Status</th>
                <th class="p-2.5">Pos</th>
                <th class="p-2.5">Ref>Alt</th>
                <th class="p-2.5">VAF (${s1})</th>
                <th class="p-2.5">VAF (${s2})</th>
                <th class="p-2.5">Δ VAF</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-800/60 font-mono">
              ${conserved.map(item => `
                <tr class="hover:bg-stone-900/40">
                  <td class="p-2.5 font-bold text-emerald-400">CONSERVED</td>
                  <td class="p-2.5">${item.pos}</td>
                  <td class="p-2.5">${item.ref}>${item.alt}</td>
                  <td class="p-2.5">${(item.vaf1 * 100).toFixed(1)}%</td>
                  <td class="p-2.5">${(item.vaf2 * 100).toFixed(1)}%</td>
                  <td class="p-2.5 text-amber-300">${(item.diff * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
              ${only1.map(v => `
                <tr class="hover:bg-stone-900/40">
                  <td class="p-2.5 font-bold text-orange-400">UNIQUE (${s1})</td>
                  <td class="p-2.5">${v.pos}</td>
                  <td class="p-2.5">${v.ref}>${v.alt}</td>
                  <td class="p-2.5">${(v.vaf * 100).toFixed(1)}%</td>
                  <td class="p-2.5 text-stone-500">N/A</td>
                  <td class="p-2.5 text-stone-500">N/A</td>
                </tr>
              `).join('')}
              ${only2.map(v => `
                <tr class="hover:bg-stone-900/40">
                  <td class="p-2.5 font-bold text-amber-400">UNIQUE (${s2})</td>
                  <td class="p-2.5">${v.pos}</td>
                  <td class="p-2.5">${v.ref}>${v.alt}</td>
                  <td class="p-2.5 text-stone-500">N/A</td>
                  <td class="p-2.5">${(v.vaf * 100).toFixed(1)}%</td>
                  <td class="p-2.5 text-stone-500">N/A</td>
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
