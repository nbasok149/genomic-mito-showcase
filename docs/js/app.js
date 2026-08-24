/**
 * Main Web Showcase Application Controller - Apple Liquid Glass & 2D Satellite Migration Map Edition
 */

window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

window.getCohortFlagSvg = function(code) {
  if (!code) return '';
  const flags = {
    'IN': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="13.33" fill="#FF9933"/><rect y="13.33" width="60" height="13.33" fill="#FFFFFF"/><rect y="26.66" width="60" height="13.33" fill="#138808"/><circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" stroke-width="0.9"/><circle cx="30" cy="20" r="1" fill="#000080"/></svg>`,
    'IS': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="13.33" fill="#FF9933"/><rect y="13.33" width="60" height="13.33" fill="#FFFFFF"/><rect y="26.66" width="60" height="13.33" fill="#138808"/><circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" stroke-width="0.9"/><circle cx="30" cy="20" r="1" fill="#000080"/></svg>`,
    'IW': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="13.33" fill="#FF9933"/><rect y="13.33" width="60" height="13.33" fill="#FFFFFF"/><rect y="26.66" width="60" height="13.33" fill="#138808"/><circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" stroke-width="0.9"/><circle cx="30" cy="20" r="1" fill="#000080"/></svg>`,
    'PK': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="15" height="40" fill="#FFFFFF"/><rect x="15" width="45" height="40" fill="#01411C"/><circle cx="38" cy="20" r="10" fill="#FFFFFF"/><circle cx="41" cy="18" r="8.5" fill="#01411C"/><polygon points="41,13 42.5,17.5 47,17.5 43.5,20 45,24.5 41,22 37,24.5 38.5,20 35,17.5 39.5,17.5" fill="#FFFFFF"/></svg>`,
    'UK': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="20" fill="#0057B7"/><rect y="20" width="60" height="20" fill="#FFD700"/></svg>`,
    'KR': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="40" fill="#FFFFFF"/><circle cx="30" cy="20" r="8" fill="#C60C30"/><path d="M 30,12 A 4,4 0 0 0 30,20 A 4,4 0 0 1 30,28 A 8,8 0 0 1 30,12" fill="#003478"/></svg>`,
    'MX': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="20" height="40" fill="#006847"/><rect x="20" width="20" height="40" fill="#FFFFFF"/><rect x="40" width="20" height="40" fill="#CE1126"/><circle cx="30" cy="20" r="3.5" fill="#8B5A2B"/></svg>`,
    'HK': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="40" fill="#DE2910"/><circle cx="30" cy="20" r="4.5" fill="#FFFFFF"/></svg>`,
    'CL': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="20" fill="#FCD116"/><rect y="20" width="60" height="10" fill="#003893"/><rect y="30" width="60" height="10" fill="#CE1126"/></svg>`,
    'AA': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="13.33" fill="#E31B23"/><rect y="13.33" width="60" height="13.33" fill="#000000"/><rect y="26.66" width="60" height="13.33" fill="#00853F"/></svg>`,
    'TB': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="40" fill="#003893"/><polygon points="0,0 60,0 30,22" fill="#E31B23"/><polygon points="15,40 45,40 30,22" fill="#FFFFFF"/><circle cx="30" cy="18" r="3.5" fill="#FCD116"/></svg>`,
    'CA': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="15" height="40" fill="#FF0000"/><rect x="15" width="30" height="40" fill="#FFFFFF"/><rect x="45" width="15" height="40" fill="#FF0000"/><path d="M 30,12 L 32,16 L 35,15 L 33,19 L 37,21 L 33,23 L 34,27 L 31,25 L 30.5,29 L 29.5,29 L 29,25 L 26,27 L 27,23 L 23,21 L 27,19 L 25,15 L 28,16 Z" fill="#FF0000"/></svg>`,
    'NA': `<svg viewBox="0 0 60 40" class="w-full h-full"><rect width="60" height="40" fill="#8B4513"/><circle cx="30" cy="20" r="10" fill="#DAA520"/><polygon points="30,12 33,18 39,19 35,23 36,29 30,26 24,29 25,23 21,19 27,18" fill="#FFFFFF"/></svg>`
  };

  return flags[code] || '';
};

window.updateHeroCohortFlags = function(code) {
  const flagLeft = document.getElementById('heroCohortFlagLeft');
  const flagRight = document.getElementById('heroCohortFlagRight');

  if (!code) {
    if (flagLeft) {
      flagLeft.innerHTML = '';
      flagLeft.classList.add('opacity-0');
      flagLeft.classList.remove('opacity-100');
    }
    if (flagRight) {
      flagRight.innerHTML = '';
      flagRight.classList.add('opacity-0');
      flagRight.classList.remove('opacity-100');
    }
    return;
  }

  const svg = window.getCohortFlagSvg(code);
  if (flagLeft) {
    flagLeft.innerHTML = svg;
    flagLeft.classList.remove('opacity-0');
    flagLeft.classList.add('opacity-100');
    flagLeft.classList.add('scale-110');
    setTimeout(() => flagLeft.classList.remove('scale-110'), 250);
  }
  if (flagRight) {
    flagRight.innerHTML = svg;
    flagRight.classList.remove('opacity-0');
    flagRight.classList.add('opacity-100');
    flagRight.classList.add('scale-110');
    setTimeout(() => flagRight.classList.remove('scale-110'), 250);
  }
};

window.FamilyAccessGate = {
  STORAGE_KEY: 'mito_selected_family_v7',

  init() {
    this.bindEvents();
    const stored = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
    const modal = document.getElementById('familyWelcomeModal');

    if (stored) {
      window.updateHeroCohortFlags(stored);
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      this.applyFamilySelection(stored, false);
    } else {
      // Don't show any country flags until a country has been chosen!
      window.updateHeroCohortFlags('');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }
  },

  bindEvents() {
    const openBtn = document.getElementById('openWelcomeModalBtn');
    const closeBtn = document.getElementById('closeWelcomeModalBtn');
    const modal = document.getElementById('familyWelcomeModal');

    openBtn?.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });

    closeBtn?.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }
  },

  applyFamilySelection(code, shouldSave = true) {
    if (shouldSave) {
      const rememberChk = document.getElementById('rememberWelcomeChk');
      if (rememberChk && rememberChk.checked) {
        localStorage.setItem(this.STORAGE_KEY, code);
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, code);
      }
    }

    const modal = document.getElementById('familyWelcomeModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // Update flanking hero flags
    window.updateHeroCohortFlags(code);

    // 1. Zoom into their family on the TreeViewer & highlight that family
    if (window.TreeViewer) {
      window.TreeViewer.zoomToFamily(code);
    }

    // 2. Configure 2D Satellite Migration Map with this sample's individualized migration trail
    if (window.MigrationMap) {
      window.MigrationMap.setSample(code);
    }

    // 3. Configure Diagnostic Markers explorer
    if (window.DiagnosticMarkersExplorer) {
      window.DiagnosticMarkersExplorer.displayFamily(code, null);
      const diagSelect = document.getElementById('diagnosticFamilySelect');
      if (diagSelect) diagSelect.value = code;
    }

    // 4. Update Quick Select in header/finder
    const quickSelect = document.getElementById('quickFamilyEntrySelect');
    if (quickSelect) quickSelect.value = code;

    // 5. Update header current family badge
    const headerBadge = document.getElementById('currentFamilyHeaderBadge');
    if (headerBadge) {
      headerBadge.textContent = `Cohort: ${code}`;
      headerBadge.classList.remove('hidden');
    }
  }
};

window.DiagnosticMarkersExplorer = {
  FAMILY_MARKERS: {
    'IN': { name: 'India', markers: [593, 5075, 6020, 10400, 12792, 14783, 15043, 15692, 15859], mother: 'Rishi Mother & Deepali Mother', dadNote: 'Fathers do not transmit mtDNA markers to offspring; passed 100% maternally.' },
    'IS': { name: 'India South', markers: [5186, 9094, 9614, 12793, 13194, 13656, 15930], mother: 'Vys Mother', dadNote: 'Fathers carry independent non-transmitted paternal lines; children inherit 100% maternal mtDNA.' },
    'IW': { name: 'India West', markers: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385], mother: 'Anjali Mother', dadNote: '100% maternal transmission passed to offspring.' },
    'PK': { name: 'Pakistan', markers: [511, 3594, 7269, 7805, 13680, 15479], mother: 'Wasim Mother', dadNote: 'Offspring inherit strictly from maternal line.' },
    'MX': { name: 'Mexico', markers: [499, 4823, 6297, 8047, 9039, 13590], mother: 'Crystal Mother', dadNote: 'Children inherit 100% of maternal mtDNA.' },
    'HK': { name: 'Hong Kong', markers: [5821, 6338, 6455, 8602, 9540, 14821], mother: 'Jan Mother', dadNote: 'Children inherit 100% of maternal markers.' },
    'UK': { name: 'Ukraine', markers: [650, 8395, 10885, 11566, 14467, 16356], mother: 'Nik Mother', aunt: 'Nik Aunt', grandmother: 'Nik Grandmother', dadNote: 'Maternal inheritance verified across three generations.' },
    'KR': { name: 'Korea', markers: [63, 1709, 2882, 3010, 8414, 9817, 13544, 15565, 15669], mother: 'Cohort Mother', dadNote: 'Maternal lineage strictly passed to offspring.' },
    'CL': { name: 'Colombia', markers: [114, 3552, 8545, 9545, 11914, 13263, 15323], mother: 'Alejandra', dadNote: 'Passed 100% maternally to offspring.' },
    'AA': { name: 'Africa', markers: [183, 2758, 5581, 7175, 9128, 11338, 13803, 14308, 15784], individual: 'Toniann', dadNote: 'Ancestral root of all modern human maternal lineages.' },
    'TB': { name: 'Tibet', markers: [3394, 4491, 8784, 12950, 14305, 15535, 16048], individual: 'Bharti', dadNote: 'High-altitude adapted lineage carrying 3394 T>C complex I mutation.' },
    'CA': { name: 'Canada', markers: [73, 146, 263, 4769], individual: 'German', dadNote: 'Macro-haplogroup H2 lineage.' },
    'NA': { name: 'Native America', markers: [64, 152, 235, 663, 1736, 4248, 4824, 8027, 8794, 12007, 16111, 16290, 16319], individual: 'Native America Woman', dadNote: 'Indigenous founding lineage derived from prehistoric Beringian migrations.' }
  },

  init() {
    this.render();
  },

  render() {
    const select = document.getElementById('diagnosticFamilySelect');
    const container = document.getElementById('diagnosticMarkersCardContainer');
    if (!select || !container) return;

    const keys = Object.keys(this.FAMILY_MARKERS);
    select.innerHTML = keys.map(k => `<option value="${k}">${this.FAMILY_MARKERS[k].name}</option>`).join('');

    select.onchange = () => {
      this.displayFamily(select.value);
      if (window.FamilyAccessGate) {
        window.FamilyAccessGate.applyFamilySelection(select.value, true);
      }
    };
    this.displayFamily('IN');
  },

  displayFamily(key, clickedSampleName = null) {
    const data = this.FAMILY_MARKERS[key] || this.FAMILY_MARKERS['IN'];
    const container = document.getElementById('diagnosticMarkersCardContainer');
    if (!container) return;

    let dadHtml = '';
    if (data.dadNote) {
      dadHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5 font-sans">
          <div class="text-sky-400 font-bold text-xs font-mono">Transmission note:</div>
          <p class="text-slate-300 leading-relaxed text-[11.5px]">
            ${data.dadNote}
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-4 font-mono text-xs">
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <div class="text-sky-300 font-bold flex items-center justify-between">
            <span class="text-sm">Diagnostic markers: ${data.name}</span>
            <span class="text-[10px] text-slate-400 font-sans font-normal">Maternally transmitted polymorphisms</span>
          </div>
          <div class="text-white font-extrabold text-sm tracking-wide pt-1">
            ${data.markers.map(m => `<span class="bg-slate-900 text-sky-300 px-3 py-1 rounded-xl border border-sky-500/30 mr-2 inline-block mb-2 shadow-sm font-mono">${m}</span>`).join('')}
          </div>
        </div>
        ${dadHtml}
      </div>
    `;
  }
};

window.FamilyReportGenerator = {
  REGION_MAP: {
    'IN': { code: 'IN', name: 'India', region: 'South Asia', haplo: 'Haplogroup M / R', history: 'Ancient South Asian maternal lineage derived from the early Southern Coastal out-of-Africa migration wave ~60,000 YBP.' },
    'IS': { code: 'IS', name: 'India South', region: 'Southern India', haplo: 'Haplogroup M / R', history: 'Southern Indian maternal lineage derived from ancient South Asian indigenous coastal settlement.' },
    'IW': { code: 'IW', name: 'India West', region: 'Western India', haplo: 'Haplogroup M / R', history: 'Western South Asian regional sub-clade sharing ancient Southern Coastal out-of-Africa founding roots.' },
    'PK': { code: 'PK', name: 'Pakistan', region: 'Indus Valley', haplo: 'Haplogroup M / U', history: 'Indus Valley regional maternal lineage sharing deep historical trade and migration connections across Central and South Asia.' },
    'UK': { code: 'UK', name: 'Ukraine', region: 'Eastern Europe', haplo: 'Haplogroup U4 / H', history: 'Eastern European maternal lineage (Haplogroup U4/H) rooted in ancient Mesolithic hunter-gatherers and Neolithic European expansion.' },
    'MX': { code: 'MX', name: 'Mexico', region: 'Mesoamerica', haplo: 'Haplogroup B2', history: 'Primary founding Native American lineage (Haplogroup B2) originating from ancient ancestors crossing Beringia ~15,000–25,000 YBP during the LGM.' },
    'HK': { code: 'HK', name: 'Hong Kong', region: 'East Asia', haplo: 'Haplogroup M7', history: 'Ancient East Asian coastal lineage (Haplogroup M7) prevalent across Southern China and Hong Kong.' },
    'KR': { code: 'KR', name: 'Korea', region: 'Northeast Asia', haplo: 'Haplogroup D4', history: 'Northeastern East Asian maternal lineage (Haplogroup D4) common across Korea, Manchuria, and Siberia.' },
    'CL': { code: 'CL', name: 'Colombia', region: 'South America', haplo: 'Haplogroup C1', history: 'Colombian Native American maternal lineage (Haplogroup C1) stemming from early Paleo-Indian expansion in South America.' },
    'AA': { code: 'AA', name: 'Africa', region: 'Sub-Saharan Africa', haplo: 'Haplogroup L2', history: 'Deep African maternal lineage (Haplogroup L2), representing the ancestral root of all modern human mtDNA.' },
    'TB': { code: 'TB', name: 'Tibet', region: 'Himalayan Plateau', haplo: 'Haplogroup M9', history: 'High-altitude adapted Central Asian Tibetan lineage (Haplogroup M9) with deep Himalayan ancestral continuity.' },
    'CA': { code: 'CA', name: 'Canada', region: 'North America', haplo: 'Haplogroup H2', history: 'North American / European lineage (Haplogroup H2).' },
    'NA': { code: 'NA', name: 'Native America', region: 'North America', haplo: 'Haplogroup A2', history: 'Indigenous North American maternal lineage (Haplogroup A2) sharing ancient Beringian founder roots.' }
  },

  getAllFamilies() {
    return Object.keys(this.REGION_MAP).map(key => this.REGION_MAP[key]);
  },

  getFamilyData(familyCode) {
    if (!familyCode) return null;
    const cleanCode = familyCode.replace('Ethnicity ', '').replace('Family ', '').trim();
    return this.REGION_MAP[cleanCode] || {
      code: cleanCode,
      name: cleanCode,
      region: cleanCode,
      haplo: 'Unassigned',
      history: 'Mitochondrial lineage dataset.'
    };
  },

  computePairwiseDistance(samplesA, samplesB) {
    if (!window.App.distanceData || !samplesA.length || !samplesB.length) return '18.50';
    const allSamples = window.App.distanceData.samples;
    const matrix = window.App.distanceData.matrix;
    let total = 0, count = 0;

    samplesA.forEach(s1 => {
      const i = allSamples.indexOf(s1);
      if (i < 0) return;
      samplesB.forEach(s2 => {
        const j = allSamples.indexOf(s2);
        if (j >= 0 && matrix[i] && matrix[i][j] !== undefined) {
          total += matrix[i][j];
          count++;
        }
      });
    });

    return count > 0 ? (total / count).toFixed(2) : '18.50';
  },

  showVariantModal(v, eths) {
    const modalId = 'vennVariantModal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[1100] p-4';
      document.body.appendChild(modal);
    }

    const ethBadges = (eths || []).map(e => `
      <span class="px-2.5 py-1 rounded-xl bg-slate-900 text-sky-300 border border-sky-500/30 font-mono font-bold text-xs">
        ${e}
      </span>
    `).join(' ');

    const baseMap = { 'A': 'adenine', 'C': 'cytosine', 'G': 'guanine', 'T': 'thymine' };
    const refBase = baseMap[(v.ref || '').toUpperCase()] || v.ref;
    const altBase = baseMap[(v.alt || '').toUpperCase()] || v.alt;

    modal.innerHTML = `
      <div class="earth-panel max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-white/15 bg-slate-900 font-mono text-xs rounded-3xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span class="text-[10px] text-sky-400 uppercase font-bold tracking-wider">Mutation inspector</span>
            <h3 class="text-base font-extrabold text-white">${v.pos} ${v.ref}&gt;${v.alt}</h3>
          </div>
          <button onclick="document.getElementById('${modalId}').remove()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/10">
            ✕ Close
          </button>
        </div>

        <div class="space-y-3 font-sans">
          <!-- Basepair Substitution Explanation (Early Clarification) -->
          <div class="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 leading-relaxed font-sans space-y-1">
            <div class="font-bold text-sky-300 font-mono text-[10.5px] uppercase tracking-wider">Basepair transition:</div>
            <p class="text-slate-200 text-xs leading-relaxed">
              <strong>${v.ref}&gt;${v.alt}</strong> means an ancestral <strong>${refBase}</strong> basepair became a <strong>${altBase}</strong> basepair at position <strong>${v.pos}</strong>.
            </p>
          </div>

          <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
            <div class="text-slate-400 text-[11px]">Seen in population cohorts:</div>
            <div class="flex flex-wrap gap-1.5 pt-1">${ethBadges}</div>
          </div>

          <div class="grid grid-cols-2 gap-2 font-mono text-xs">
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-slate-400 text-[10px] block">Gene / region</span>
              <strong class="text-emerald-400">${v.gene || 'Control region (D-loop)'}</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-slate-400 text-[10px] block">Variant frequency (VAF)</span>
              <strong class="text-sky-400">${(v.vaf ? (v.vaf * 100).toFixed(1) : 100)}% VAF</strong>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-[11.5px] text-slate-300 leading-relaxed">
            <strong>Biological context:</strong> Polymorphic mitochondrial DNA mutation at position ${v.pos}. Shared presence across populations highlights either deep ancestral lineage motifs or hyper-mutable regional hotspots.
          </div>
        </div>
      </div>
    `;

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },

  openReportModal(fam1Code = 'MX', fam2Code = 'AA', fam3Code = null) {
    const modal = document.getElementById('familyReportModal');
    const cohortControls = document.getElementById('cohortReportSelectControls');
    const sampleControls = document.getElementById('sampleReportSelectControls');
    if (sampleControls) {
      sampleControls.classList.add('hidden');
      sampleControls.classList.remove('flex');
    }
    if (cohortControls) cohortControls.classList.remove('hidden');
    if (!modal) return;

    this.populateDropdowns(fam1Code, fam2Code, fam3Code);
    this.renderReport(fam1Code, fam2Code, fam3Code);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  populateDropdowns(fam1Code, fam2Code, fam3Code = null) {
    const select1 = document.getElementById('reportFamily1Select');
    const select2 = document.getElementById('reportFamily2Select');
    const select3 = document.getElementById('reportFamily3Select');
    const controls = document.getElementById('cohortReportSelectControls');
    if (controls) controls.classList.remove('hidden');
    if (!select1 || !select2) return;

    const families = this.getAllFamilies();
    const optionsHtml = families.map(f => `<option value="${f.code}">${f.name}</option>`).join('');
    const optionalOptionsHtml = `<option value="">-- 3rd Cohort (Optional) --</option>` + optionsHtml;

    select1.innerHTML = optionsHtml;
    select2.innerHTML = optionsHtml;
    if (select3) select3.innerHTML = optionalOptionsHtml;

    select1.value = (fam1Code || 'MX').replace('Ethnicity ', '').replace('Family ', '').trim();
    select2.value = (fam2Code || 'AA').replace('Ethnicity ', '').replace('Family ', '').trim();
    if (select3) select3.value = fam3Code ? fam3Code.replace('Ethnicity ', '').replace('Family ', '').trim() : '';

    const onChangeHandler = () => {
      this.renderReport(select1.value, select2.value, select3?.value || null);
    };

    select1.onchange = onChangeHandler;
    select2.onchange = onChangeHandler;
    if (select3) select3.onchange = onChangeHandler;
  },

  renderReport(f1Key, f2Key, f3Key = null) {
    const reportContainer = document.getElementById('familyReportModalBody') || document.getElementById('familyReportBody');
    if (!reportContainer || !window.App.variantsData) return;

    const info1 = this.getFamilyData(f1Key);
    const info2 = f2Key ? this.getFamilyData(f2Key) : null;
    const info3 = f3Key ? this.getFamilyData(f3Key) : null;

    if (!info1) return;

    const samples1 = (window.App.distanceData?.samples || []).filter(s => s.startsWith(info1.code + '_'));
    const samples2 = info2 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info2.code + '_')) : [];
    const samples3 = info3 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info3.code + '_')) : [];

    const color1 = window.TreeViewer ? window.TreeViewer.ETHNICITY_COLORS[info1.code] || '#38bdf8' : '#38bdf8';
    const color2 = info2 && window.TreeViewer ? window.TreeViewer.ETHNICITY_COLORS[info2.code] || '#60a5fa' : '#60a5fa';
    const color3 = info3 && window.TreeViewer ? window.TreeViewer.ETHNICITY_COLORS[info3.code] || '#34d399' : '#34d399';

    function placeDots(variantList, centerCX, centerCY, dotColor) {
      let dotsSvg = '';
      const cols = Math.ceil(Math.sqrt(variantList.length || 1));
      variantList.forEach((v, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = centerCX + (col - (cols - 1) / 2) * 15;
        const y = centerCY + (row - (Math.ceil(variantList.length / cols) - 1) / 2) * 15;

        const vJson = JSON.stringify(v).replace(/"/g, '&quot;');
        const ethsJson = JSON.stringify(v.eths || []).replace(/"/g, '&quot;');

        dotsSvg += `
          <circle cx="${x}" cy="${y}" r="5.5" fill="${dotColor}" stroke="#090a0f" stroke-width="1.2"
            class="venn-variant-dot cursor-pointer transition-all duration-200 hover:r-9 hover:fill-white hover:stroke-sky-400 shadow-md"
            data-variant="${vJson}"
            data-eths="${ethsJson}">
            <title>${v.pos} ${v.ref}>${v.alt} (${v.gene || 'D-loop'}) — Click for details</title>
          </circle>
        `;
      });
      return dotsSvg;
    }

    if (info1 && info2 && info3) {
      const dist12 = this.computePairwiseDistance(samples1, samples2);
      const dist13 = this.computePairwiseDistance(samples1, samples3);
      const dist23 = this.computePairwiseDistance(samples2, samples3);

      const vars1 = window.App.variantsData.variants.filter(v => samples1.includes(v.sample));
      const vars2 = window.App.variantsData.variants.filter(v => samples2.includes(v.sample));
      const vars3 = window.App.variantsData.variants.filter(v => samples3.includes(v.sample));

      const muts1 = new Map(vars1.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
      const muts2 = new Map(vars2.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
      const muts3 = new Map(vars3.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

      const allKeysMap = new Map();
      [...muts1.entries(), ...muts2.entries(), ...muts3.entries()].forEach(([k, v]) => {
        if (!allKeysMap.has(k)) allKeysMap.set(k, v);
      });

      const unique1 = [];
      const unique2 = [];
      const unique3 = [];
      const shared12 = [];
      const shared13 = [];
      const shared23 = [];
      const sharedAll = [];

      allKeysMap.forEach((v, k) => {
        const in1 = muts1.has(k);
        const in2 = muts2.has(k);
        const in3 = muts3.has(k);

        if (in1 && in2 && in3) sharedAll.push({ ...v, eths: [info1.name, info2.name, info3.name] });
        else if (in1 && in2 && !in3) shared12.push({ ...v, eths: [info1.name, info2.name] });
        else if (in1 && in3 && !in2) shared13.push({ ...v, eths: [info1.name, info3.name] });
        else if (in2 && in3 && !in1) shared23.push({ ...v, eths: [info2.name, info3.name] });
        else if (in1 && !in2 && !in3) unique1.push({ ...v, eths: [info1.name] });
        else if (in2 && !in1 && !in3) unique2.push({ ...v, eths: [info2.name] });
        else if (in3 && !in1 && !in2) unique3.push({ ...v, eths: [info3.name] });
      });

      const vennSvgHtml = `
        <div class="p-6 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4 shadow-2xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Interactive mutational Venn diagram</span>
              <h3 class="text-base font-extrabold text-white font-sans">3-Way population variant distribution</h3>
            </div>
            <span class="text-slate-400 text-xs font-mono">Hover over dots to view positions; click dot for full detail</span>
          </div>

          <div class="flex justify-center overflow-x-auto py-2">
            <svg width="680" height="420" viewBox="0 0 680 420" class="select-none">
              <circle cx="260" cy="170" r="135" fill="${color1}" fill-opacity="0.18" stroke="${color1}" stroke-width="2.2"/>
              <circle cx="420" cy="170" r="135" fill="${color2}" fill-opacity="0.18" stroke="${color2}" stroke-width="2.2"/>
              <circle cx="340" cy="270" r="135" fill="${color3}" fill-opacity="0.18" stroke="${color3}" stroke-width="2.2"/>

              <text x="175" y="105" fill="${color1}" font-weight="800" font-size="12" font-family="monospace">${info1.code} only (${unique1.length})</text>
              <text x="505" y="105" fill="${color2}" font-weight="800" font-size="12" font-family="monospace">${info2.code} only (${unique2.length})</text>
              <text x="340" y="380" fill="${color3}" font-weight="800" font-size="12" font-family="monospace" text-anchor="middle">${info3.code} only (${unique3.length})</text>

              <text x="340" y="100" fill="#38bdf8" font-weight="800" font-size="11" font-family="monospace" text-anchor="middle">${info1.code}+${info2.code} (${shared12.length})</text>
              <text x="230" y="270" fill="#a78bfa" font-weight="800" font-size="11" font-family="monospace" text-anchor="middle">${info1.code}+${info3.code} (${shared13.length})</text>
              <text x="450" y="270" fill="#2dd4bf" font-weight="800" font-size="11" font-family="monospace" text-anchor="middle">${info2.code}+${info3.code} (${shared23.length})</text>
              <text x="340" y="225" fill="#34d399" font-weight="800" font-size="11" font-family="monospace" text-anchor="middle">All 3 (${sharedAll.length})</text>

              ${placeDots(unique1, 185, 150, color1)}
              ${placeDots(unique2, 495, 150, color2)}
              ${placeDots(unique3, 340, 335, color3)}
              ${placeDots(shared12, 340, 130, '#38bdf8')}
              ${placeDots(shared13, 255, 240, '#a78bfa')}
              ${placeDots(shared23, 425, 240, '#2dd4bf')}
              ${placeDots(sharedAll, 340, 195, '#34d399')}
            </svg>
          </div>
        </div>
      `;

      reportContainer.innerHTML = `
        <div class="space-y-6 font-sans">
          
          <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4 font-mono">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div class="text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">3-Way multi-population comparative report</div>
                <h2 class="text-xl font-extrabold text-white">${info1.name} <span class="text-slate-500">vs</span> ${info2.name} <span class="text-slate-500">vs</span> ${info3.name}</h2>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800 text-xs text-sky-300 font-bold">
                3-Way triangulation mode
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-sans">${info1.code} vs ${info2.code}:</span>
                  <span class="text-base font-bold text-sky-300">${dist12}</span>
                </div>
                <div class="text-[10.5px] text-slate-500 font-sans">Mutational distance rating</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-sans">${info1.code} vs ${info3.code}:</span>
                  <span class="text-base font-bold text-sky-300">${dist13}</span>
                </div>
                <div class="text-[10.5px] text-slate-500 font-sans">Mutational distance rating</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 font-sans">${info2.code} vs ${info3.code}:</span>
                  <span class="text-base font-bold text-sky-300">${dist23}</span>
                </div>
                <div class="text-[10.5px] text-slate-500 font-sans">Mutational distance rating</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5 font-sans">
              <div class="text-sky-300 font-bold font-mono">What do these numbers mean?</div>
              <p class="text-slate-300 leading-relaxed text-[11.5px]">
                <strong>Pairwise genetic distance</strong> is computed using an ancestry-conditioned GRM distance metric across 280 polymorphic sites. Baseline family and intra-cohort transmissions score ~<strong>0.86</strong>, while deep cross-continental population divergence scores ~<strong>0.94 &ndash; 0.98</strong>.
              </p>
            </div>
          </div>

          ${vennSvgHtml}

          <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 text-xs text-slate-300 leading-relaxed shadow-2xl">
            <div class="border-b border-white/10 pb-3">
              <h4 class="font-bold text-sky-400 font-mono text-base flex items-center gap-2">
                <span>Population breakdown</span>
              </h4>
              <p class="text-slate-400 text-[11px] mt-0.5">Triangulated evolutionary and geographic lineage analysis across ${info1.code}, ${info2.code}, and ${info3.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11.5px]">
              <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-sky-300 text-sm">${info1.name}</div>
                <div class="text-slate-400 text-[11px]"><strong class="text-slate-200">Haplogroup:</strong> ${info1.haplo}</div>
                <p class="text-slate-300 leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-blue-300 text-sm">${info2.name}</div>
                <div class="text-slate-400 text-[11px]"><strong class="text-slate-200">Haplogroup:</strong> ${info2.haplo}</div>
                <p class="text-slate-300 leading-relaxed">${info2.history}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-emerald-300 text-sm">${info3.name}</div>
                <div class="text-slate-400 text-[11px]"><strong class="text-slate-200">Haplogroup:</strong> ${info3.haplo}</div>
                <p class="text-slate-300 leading-relaxed">${info3.history}</p>
              </div>
            </div>
          </div>

        </div>
      `;

      reportContainer.querySelectorAll('.venn-variant-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const v = JSON.parse(dot.getAttribute('data-variant'));
            const eths = JSON.parse(dot.getAttribute('data-eths'));
            this.showVariantModal(v, eths);
          } catch(err) {}
        });
      });
      return;
    }

    // 2-Way Pairwise Comparison Mode
    if (info1 && info2) {
      const avgDist = this.computePairwiseDistance(samples1, samples2);

      const vars1 = window.App.variantsData.variants.filter(v => samples1.includes(v.sample));
      const vars2 = window.App.variantsData.variants.filter(v => samples2.includes(v.sample));

      const muts1 = new Map(vars1.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
      const muts2 = new Map(vars2.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

      const allKeysMap = new Map();
      [...muts1.entries(), ...muts2.entries()].forEach(([k, v]) => {
        if (!allKeysMap.has(k)) allKeysMap.set(k, v);
      });

      const shared = [];
      const unique1 = [];
      const unique2 = [];

      allKeysMap.forEach((v, k) => {
        const in1 = muts1.has(k);
        const in2 = muts2.has(k);
        if (in1 && in2) shared.push({ ...v, eths: [info1.name, info2.name] });
        else if (in1 && !in2) unique1.push({ ...v, eths: [info1.name] });
        else if (in2 && !in1) unique2.push({ ...v, eths: [info2.name] });
      });

      const vennSvgHtml2Way = `
        <div class="p-6 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4 shadow-2xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Interactive mutational Venn diagram</span>
              <h3 class="text-base font-extrabold text-white font-sans">2-Way pairwise variant distribution</h3>
            </div>
            <span class="text-slate-400 text-xs font-mono">Hover over dots to view positions; click dot for full detail</span>
          </div>

          <div class="flex justify-center overflow-x-auto py-2">
            <svg width="600" height="320" viewBox="0 0 600 320" class="select-none">
              <circle cx="230" cy="160" r="125" fill="${color1}" fill-opacity="0.18" stroke="${color1}" stroke-width="2.2"/>
              <circle cx="370" cy="160" r="125" fill="${color2}" fill-opacity="0.18" stroke="${color2}" stroke-width="2.2"/>

              <text x="150" y="90" fill="${color1}" font-weight="800" font-size="12" font-family="monospace">${info1.code} only (${unique1.length})</text>
              <text x="450" y="90" fill="${color2}" font-weight="800" font-size="12" font-family="monospace">${info2.code} only (${unique2.length})</text>
              <text x="300" y="90" fill="#34d399" font-weight="800" font-size="12" font-family="monospace" text-anchor="middle">Shared (${shared.length})</text>

              ${placeDots(unique1, 160, 160, color1)}
              ${placeDots(unique2, 440, 160, color2)}
              ${placeDots(shared, 300, 160, '#34d399')}
            </svg>
          </div>
        </div>
      `;

      reportContainer.innerHTML = `
        <div class="space-y-6 font-sans">
          
          <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4 font-mono">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div class="text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">Pairwise cohort comparative report</div>
                <h2 class="text-xl font-extrabold text-white">${info1.name} <span class="text-slate-500">vs</span> ${info2.name}</h2>
              </div>
              <div class="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/10">
                <span class="text-xs text-slate-400">Pairwise genetic distance:</span>
                <span class="text-lg font-bold text-sky-300">${avgDist}</span>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5 font-sans">
              <div class="text-sky-300 font-bold font-mono">What does pairwise genetic distance mean?</div>
              <p class="text-slate-300 leading-relaxed text-[11.5px]">
                <strong>Genetic distance (${avgDist})</strong> measures the standardized genomic divergence across 280 polymorphic sites between ${info1.name} and ${info2.name}.
                Baseline intra-cohort maternal transmissions score ~<strong>0.86</strong>, while deep cross-continental population divergence scores ~<strong>0.94 &ndash; 0.98</strong>.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1">
                <div class="font-bold text-sky-300 font-mono">${info1.name} (${info1.region})</div>
                <div class="text-slate-400"><strong class="text-slate-300">Lineage:</strong> ${info1.haplo}</div>
                <p class="text-[11px] text-slate-400 leading-relaxed pt-1">${info1.history}</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1">
                <div class="font-bold text-blue-300 font-mono">${info2.name} (${info2.region})</div>
                <div class="text-slate-400"><strong class="text-slate-300">Lineage:</strong> ${info2.haplo}</div>
                <p class="text-[11px] text-slate-400 leading-relaxed pt-1">${info2.history}</p>
              </div>
            </div>
          </div>

          ${vennSvgHtml2Way}

          <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 text-xs text-slate-300 shadow-2xl">
            <div class="border-b border-white/10 pb-3">
              <h4 class="font-bold text-sky-400 font-mono text-base flex items-center gap-2">
                <span>Population breakdown</span>
              </h4>
              <p class="text-slate-400 text-[11px] mt-0.5">Evolutionary lineage and migration analysis between ${info1.code} and ${info2.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-sky-300 text-sm">${info1.name} breakdown</div>
                <p class="text-slate-300 text-[11.5px] leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-blue-300 text-sm">${info2.name} breakdown</div>
                <p class="text-slate-300 text-[11.5px] leading-relaxed">${info2.history}</p>
              </div>
            </div>
          </div>

        </div>
      `;

      reportContainer.querySelectorAll('.venn-variant-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const v = JSON.parse(dot.getAttribute('data-variant'));
            const eths = JSON.parse(dot.getAttribute('data-eths'));
            this.showVariantModal(v, eths);
          } catch(err) {}
        });
      });
    }
  },

  populateSampleDropdowns(sample1, sample2) {
    const s1Select = document.getElementById('reportSample1Select');
    const s2Select = document.getElementById('reportSample2Select');
    if (!s1Select || !s2Select || !window.App.distanceData) return;

    const allSamples = window.App.distanceData.samples || [];

    // Group samples by cohort
    const cohortGroups = {};
    allSamples.forEach(s => {
      const code = s.split('_')[0];
      if (!cohortGroups[code]) cohortGroups[code] = [];
      cohortGroups[code].push(s);
    });

    const createOptionsHtml = () => {
      return Object.keys(cohortGroups).map(code => {
        const info = this.getFamilyData(code);
        const cohortName = info ? info.name : code;
        const options = cohortGroups[code].map(s => {
          const name = window.TreeViewer ? window.TreeViewer.getSampleDisplayName(s) : s;
          const role = window.TreeViewer ? window.TreeViewer.getSampleRole(s) : '';
          return `<option value="${s}">${name} (${role})</option>`;
        }).join('');
        return `<optgroup label="${cohortName} (${code})">${options}</optgroup>`;
      }).join('');
    };

    const optionsHtml = createOptionsHtml();
    s1Select.innerHTML = optionsHtml;
    s2Select.innerHTML = optionsHtml;

    s1Select.value = sample1;
    s2Select.value = sample2;

    s1Select.onchange = () => {
      this.renderSampleReport(s1Select.value, s2Select.value);
    };
    s2Select.onchange = () => {
      this.renderSampleReport(s1Select.value, s2Select.value);
    };
  },

  openSampleReportModal(sample1, sample2) {
    const modal = document.getElementById('familyReportModal');
    const cohortControls = document.getElementById('cohortReportSelectControls');
    const sampleControls = document.getElementById('sampleReportSelectControls');
    if (cohortControls) cohortControls.classList.add('hidden');
    if (sampleControls) {
      sampleControls.classList.remove('hidden');
      sampleControls.classList.add('flex');
    }
    if (!modal) return;

    this.populateSampleDropdowns(sample1, sample2);
    this.renderSampleReport(sample1, sample2);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  renderSampleReport(sample1, sample2) {
    const reportContainer = document.getElementById('familyReportModalBody') || document.getElementById('familyReportBody');
    const titleEl = document.getElementById('reportModalTitle');
    const cohortControls = document.getElementById('cohortReportSelectControls');
    const sampleControls = document.getElementById('sampleReportSelectControls');
    if (cohortControls) cohortControls.classList.add('hidden');
    if (sampleControls) {
      sampleControls.classList.remove('hidden');
      sampleControls.classList.add('flex');
    }
    if (!reportContainer || !window.App.variantsData || !window.App.distanceData) return;

    const s1Select = document.getElementById('reportSample1Select');
    const s2Select = document.getElementById('reportSample2Select');
    if (s1Select && s1Select.value !== sample1) s1Select.value = sample1;
    if (s2Select && s2Select.value !== sample2) s2Select.value = sample2;

    const allSamples = window.App.distanceData.samples || [];
    const matrix = window.App.distanceData.matrix || [];

    const idx1 = allSamples.indexOf(sample1);
    const idx2 = allSamples.indexOf(sample2);

    const dist = (idx1 >= 0 && idx2 >= 0 && matrix[idx1] && matrix[idx1][idx2] !== undefined)
      ? matrix[idx1][idx2].toFixed(2)
      : '0.00';

    const name1 = window.TreeViewer ? window.TreeViewer.getSampleDisplayName(sample1) : sample1;
    const name2 = window.TreeViewer ? window.TreeViewer.getSampleDisplayName(sample2) : sample2;
    const role1 = window.TreeViewer ? window.TreeViewer.getSampleRole(sample1) : 'Individual';
    const role2 = window.TreeViewer ? window.TreeViewer.getSampleRole(sample2) : 'Individual';

    const code1 = sample1.split('_')[0];
    const code2 = sample2.split('_')[0];

    const info1 = this.getFamilyData(code1);
    const info2 = this.getFamilyData(code2);

    if (titleEl) {
      titleEl.innerHTML = `<span class="text-emerald-400">${name1}</span> vs <span class="text-sky-400">${name2}</span>`;
    }

    // Filter variants for each sample
    const vars1 = window.App.variantsData.variants.filter(v => v.sample === sample1);
    const vars2 = window.App.variantsData.variants.filter(v => v.sample === sample2);

    const muts1 = new Map(vars1.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const muts2 = new Map(vars2.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const allKeysMap = new Map();
    [...muts1.entries(), ...muts2.entries()].forEach(([k, v]) => {
      if (!allKeysMap.has(k)) allKeysMap.set(k, v);
    });

    const shared = [];
    const unique1 = [];
    const unique2 = [];

    allKeysMap.forEach((v, k) => {
      const in1 = muts1.has(k);
      const in2 = muts2.has(k);
      if (in1 && in2) shared.push({ ...v, eths: [name1, name2] });
      else if (in1 && !in2) unique1.push({ ...v, eths: [name1] });
      else if (in2 && !in1) unique2.push({ ...v, eths: [name2] });
    });

    const diffCount = unique1.length + unique2.length;
    const isSameCohort = code1 === code2;
    let inheritanceNote = '';
    let inheritanceBadge = '';
    let categoryLabel = '';

    if (diffCount === 0) {
      categoryLabel = 'Identical Maternal Lineage';
      inheritanceBadge = `<span class="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs">100% Maternal Sequence Identity (0 Differences)</span>`;
      inheritanceNote = `Direct mother-to-child sequence transmission across all 16,569 base pairs with zero mutational differences.`;
    } else if (isSameCohort && (role1.includes('Father') || role2.includes('Father'))) {
      categoryLabel = 'Independent Paternal Lineage';
      inheritanceBadge = `<span class="px-3 py-1 rounded-xl bg-amber-950 border border-amber-500 text-amber-300 font-bold text-xs">Independent Paternal Lineage (${diffCount} Differences)</span>`;
      inheritanceNote = `Mitochondrial DNA is inherited strictly through the maternal line. Fathers carry independent paternal lineages and do not transmit mtDNA to offspring (${diffCount} mutation differences).`;
    } else if (diffCount <= 5) {
      categoryLabel = 'Close Generational Kinship';
      inheritanceBadge = `<span class="px-3 py-1 rounded-xl bg-teal-950 border border-teal-500 text-teal-300 font-bold text-xs">Close Kinship (${diffCount} Differences)</span>`;
      inheritanceNote = `Close maternal pedigree relation separated by only ${diffCount} mutation differences across the complete mitochondrial genome.`;
    } else if (isSameCohort || diffCount <= 14) {
      categoryLabel = 'Regional Population Cohort';
      inheritanceBadge = `<span class="px-3 py-1 rounded-xl bg-sky-950 border border-sky-500 text-sky-300 font-bold text-xs">Same Cohort (${diffCount} Differences)</span>`;
      inheritanceNote = `Both samples originate from the ${info1.name} cohort, separated by ${diffCount} mutational differences along regional sub-branches.`;
    } else {
      categoryLabel = 'Continental Divergence';
      inheritanceBadge = `<span class="px-3 py-1 rounded-xl bg-violet-950 border border-violet-500 text-violet-300 font-bold text-xs">Continental Divergence (${diffCount} Differences)</span>`;
      inheritanceNote = `Comparing individuals across two distinct global populations (${info1.name} vs ${info2.name}), separated by ${diffCount} mutational differences over tens of thousands of years of prehistoric dispersal.`;
    }

    const color1 = '#10b981';
    const color2 = '#38bdf8';

    function placeDots(variantList, centerCX, centerCY, dotColor) {
      let dotsSvg = '';
      const cols = Math.ceil(Math.sqrt(variantList.length || 1));
      variantList.forEach((v, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = centerCX + (col - (cols - 1) / 2) * 15;
        const y = centerCY + (row - (Math.ceil(variantList.length / cols) - 1) / 2) * 15;

        const vJson = JSON.stringify(v).replace(/"/g, '&quot;');
        const ethsJson = JSON.stringify(v.eths || []).replace(/"/g, '&quot;');

        dotsSvg += `
          <circle cx="${x}" cy="${y}" r="5.5" fill="${dotColor}" stroke="#090a0f" stroke-width="1.2"
            class="venn-variant-dot cursor-pointer transition-all duration-200 hover:r-9 hover:fill-white hover:stroke-emerald-400 shadow-md"
            data-variant="${vJson}"
            data-eths="${ethsJson}">
            <title>${v.pos} ${v.ref}>${v.alt} (${v.gene || 'D-loop'})</title>
          </circle>
        `;
      });
      return dotsSvg;
    }

    const vennSvgHtml = `
      <div class="p-6 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4 shadow-2xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span class="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">Variant distribution</span>
            <h3 class="text-base font-extrabold text-white font-sans">${name1} vs ${name2}</h3>
          </div>
          <span class="text-slate-400 text-xs font-mono">Hover over dots to view positions; click dot for detail</span>
        </div>

        <div class="flex justify-center overflow-x-auto py-2">
          <svg width="600" height="320" viewBox="0 0 600 320" class="select-none">
            <circle cx="230" cy="160" r="125" fill="${color1}" fill-opacity="0.22" stroke="${color1}" stroke-width="2.5"/>
            <circle cx="370" cy="160" r="125" fill="${color2}" fill-opacity="0.22" stroke="${color2}" stroke-width="2.5"/>

            <text x="150" y="90" fill="${color1}" font-weight="800" font-size="12" font-family="monospace">${name1} (${unique1.length})</text>
            <text x="450" y="90" fill="${color2}" font-weight="800" font-size="12" font-family="monospace">${name2} (${unique2.length})</text>
            <text x="300" y="90" fill="#34d399" font-weight="800" font-size="12" font-family="monospace" text-anchor="middle">Shared (${shared.length})</text>

            ${placeDots(unique1, 160, 160, color1)}
            ${placeDots(unique2, 440, 160, color2)}
            ${placeDots(shared, 300, 160, '#34d399')}
          </svg>
        </div>
      </div>
    `;

    // ----------------------------------------------------
    // COMPREHENSIVE FAMILIAL MARKER MATCHING LIST DIAGRAM
    // ----------------------------------------------------
    const allPosMap = new Map();
    vars1.forEach(v => {
      allPosMap.set(v.pos, {
        pos: v.pos,
        gene: v.gene || 'D-loop',
        ref: v.ref,
        alt1: v.alt,
        alt2: null
      });
    });
    vars2.forEach(v => {
      if (allPosMap.has(v.pos)) {
        const item = allPosMap.get(v.pos);
        item.alt2 = v.alt;
        if (!item.gene && v.gene) item.gene = v.gene;
      } else {
        allPosMap.set(v.pos, {
          pos: v.pos,
          gene: v.gene || 'D-loop',
          ref: v.ref,
          alt1: null,
          alt2: v.alt
        });
      }
    });

    const sortedPositions = Array.from(allPosMap.values()).sort((a, b) => a.pos - b.pos);
    const HK_SPECIFIC_POSITIONS = [5821, 6338, 6455, 8602, 9540, 14821];
    const fam1Markers = (window.DiagnosticMarkersExplorer && window.DiagnosticMarkersExplorer.FAMILY_MARKERS[code1])
      ? window.DiagnosticMarkersExplorer.FAMILY_MARKERS[code1].markers
      : [];
    const fam2Markers = (window.DiagnosticMarkersExplorer && window.DiagnosticMarkersExplorer.FAMILY_MARKERS[code2])
      ? window.DiagnosticMarkersExplorer.FAMILY_MARKERS[code2].markers
      : [];
    const SPECIFIC_POSITIONS = Array.from(new Set([...HK_SPECIFIC_POSITIONS, ...fam1Markers, ...fam2Markers]));

    const markerRowsHtml = sortedPositions.map((item, idx) => {
      const isShared = item.alt1 !== null && item.alt2 !== null && item.alt1 === item.alt2;
      const isSpecific = SPECIFIC_POSITIONS.includes(item.pos);
      const isHkSpecific = HK_SPECIFIC_POSITIONS.includes(item.pos);

      // Left Box: Sample 1 number/allele
      let s1BoxClass = '';
      let s1Text = '';
      if (item.alt1 !== null) {
        if (isSpecific) {
          s1BoxClass = 'bg-yellow-950/80 border border-yellow-400 text-yellow-300 shadow-sm shadow-yellow-500/20';
        } else if (isShared) {
          s1BoxClass = 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20';
        } else {
          s1BoxClass = 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-sm shadow-rose-500/20';
        }
        s1Text = `<span class="font-mono font-bold text-xs">${item.pos} ${item.ref}&gt;${item.alt1}</span>`;
      } else {
        s1BoxClass = 'bg-slate-900/60 border border-white/5 text-slate-500';
        s1Text = `<span class="font-mono text-slate-500 text-[11px]">Ref (${item.ref})</span>`;
      }

      // Right Box: Sample 2 number/allele
      let s2BoxClass = '';
      let s2Text = '';
      if (item.alt2 !== null) {
        if (isSpecific) {
          s2BoxClass = 'bg-yellow-950/80 border border-yellow-400 text-yellow-300 shadow-sm shadow-yellow-500/20';
        } else if (isShared) {
          s2BoxClass = 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20';
        } else {
          s2BoxClass = 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-sm shadow-rose-500/20';
        }
        s2Text = `<span class="font-mono font-bold text-xs">${item.pos} ${item.ref}&gt;${item.alt2}</span>`;
      } else {
        s2BoxClass = 'bg-slate-900/60 border border-white/5 text-slate-500';
        s2Text = `<span class="font-mono text-slate-500 text-[11px]">Ref (${item.ref})</span>`;
      }

      // Status Badge
      let badgeHtml = '';
      if (isSpecific) {
        badgeHtml = `<span class="px-2.5 py-0.5 rounded-lg bg-yellow-950/90 border border-yellow-400 text-yellow-300 font-bold text-[10px] shadow-sm shadow-yellow-500/20">${isHkSpecific ? 'Hong Kong specific' : 'Ethnic specific'}</span>`;
      } else if (isShared) {
        badgeHtml = `<span class="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold text-[10px]">Shared conserved</span>`;
      } else {
        badgeHtml = `<span class="px-2.5 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold text-[10px]">Private mutation</span>`;
      }

      return `
        <div class="p-3 rounded-2xl border border-white/10 bg-slate-950/70 grid grid-cols-1 md:grid-cols-12 items-center gap-2.5 text-xs font-mono transition-all hover:bg-slate-950/90">
          
          <!-- Sample 1 Side (Left) -->
          <div class="md:col-span-4 p-2.5 rounded-xl border ${s1BoxClass} flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-sans truncate mr-2">${name1}:</span>
            <div>${s1Text}</div>
          </div>

          <!-- Middle Section: Position info & Green bar in the middle -->
          <div class="md:col-span-4 flex flex-col items-center justify-center space-y-1.5 px-2">
            <div class="flex items-center space-x-2">
              <span class="text-slate-400 font-bold text-[11px]">#${idx + 1}</span>
              <span class="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-white font-bold text-xs">${item.pos}</span>
              <span class="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-white/5 text-[10px] text-slate-300">${item.gene}</span>
            </div>
            <!-- Green Bar in the Middle -->
            <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
              <div class="bg-emerald-400 h-2 rounded-full w-full shadow-sm shadow-emerald-400/60"></div>
            </div>
            <div class="shrink-0">${badgeHtml}</div>
          </div>

          <!-- Sample 2 Side (Right) -->
          <div class="md:col-span-4 p-2.5 rounded-xl border ${s2BoxClass} flex items-center justify-between">
            <div>${s2Text}</div>
            <span class="text-[10px] text-slate-400 font-sans truncate ml-2 text-right">:${name2}</span>
          </div>

        </div>
      `;
    }).join('');

    reportContainer.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <!-- Summary Header Card -->
        <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4 font-mono">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Pairwise sample report</div>
              <h2 class="text-xl font-extrabold text-white">${name1} <span class="text-slate-500">vs</span> ${name2}</h2>
            </div>
            ${inheritanceBadge}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
              <div class="text-slate-400 font-sans">Mutation differences:</div>
              <div class="text-xl font-bold text-emerald-300 font-mono">${diffCount === 0 ? '0 Sites' : diffCount + ' Sites'}</div>
              <div class="text-[10px] text-slate-500 font-sans">${diffCount === 0 ? '100% Sequence Identity' : (diffCount <= 5 ? 'Close Kinship' : 'Polymorphic Differences')}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
              <div class="text-slate-400 font-sans">Shared mutations:</div>
              <div class="text-xl font-bold text-sky-300 font-mono">${shared.length} Sites</div>
              <div class="text-[10px] text-slate-500 font-sans">Identical in both genomes</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
              <div class="text-slate-400 font-sans">Lineage relationship:</div>
              <div class="text-sm font-bold text-slate-200 font-mono">${diffCount === 0 ? 'Strict Maternal' : (isSameCohort && (role1.includes('Father') || role2.includes('Father')) ? 'Paternal Line' : (isSameCohort ? 'Intra-Cohort' : 'Cross-Cohort'))}</div>
              <div class="text-[10px] text-slate-500 font-sans">Inheritance mode</div>
            </div>
          </div>

          <!-- Relationship Spectrum Reference Scale Bar -->
          <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 font-mono text-xs">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-sans">Kinship &amp; divergence scale:</span>
              <span class="text-sky-300 font-bold">${categoryLabel}</span>
            </div>
            
            <div class="w-full bg-slate-900 rounded-full h-3 relative overflow-hidden border border-white/10 flex shadow-inner">
              <div class="w-1/4 h-full border-r border-slate-950 transition-all ${diffCount === 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-emerald-950/40'}"></div>
              <div class="w-1/4 h-full border-r border-slate-950 transition-all ${diffCount > 0 && diffCount <= 5 ? 'bg-teal-400 shadow-sm shadow-teal-400' : 'bg-teal-950/40'}"></div>
              <div class="w-1/4 h-full border-r border-slate-950 transition-all ${diffCount > 5 && diffCount <= 14 ? 'bg-sky-400 shadow-sm shadow-sky-400' : 'bg-sky-950/40'}"></div>
              <div class="w-1/4 h-full transition-all ${diffCount >= 15 ? 'bg-violet-400 shadow-sm shadow-violet-400' : 'bg-violet-950/40'}"></div>
            </div>

            <div class="grid grid-cols-4 text-[10px] text-slate-400 text-center font-sans">
              <div class="${diffCount === 0 ? 'text-emerald-300 font-bold' : ''}">0: Identical Maternal</div>
              <div class="${diffCount > 0 && diffCount <= 5 ? 'text-teal-300 font-bold' : ''}">1&ndash;5: Close Kin</div>
              <div class="${diffCount > 5 && diffCount <= 14 ? 'text-sky-300 font-bold' : ''}">6&ndash;14: Regional Cohort</div>
              <div class="${diffCount >= 15 ? 'text-violet-300 font-bold' : ''}">15+: Continental Split</div>
            </div>

            <div class="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10.5px] text-slate-500 font-sans">
              <span>Underlying GRM statistical matrix distance: <strong class="text-slate-300 font-mono">${dist}</strong> (Covariance across 280 polymorphic loci; ~0.86 family baseline, ~0.94 continental baseline)</span>
              <span class="text-slate-500 font-mono">rCRS (16,569 bp)</span>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5 font-sans">
            <div class="text-emerald-300 font-bold font-mono">Biological context:</div>
            <p class="text-slate-300 leading-relaxed text-[11.5px]">
              ${inheritanceNote}
            </p>
          </div>
        </div>

        ${vennSvgHtml}

        <!-- Sample Details Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div class="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5 font-mono">
              <span class="font-bold text-emerald-400 text-sm">${name1}</span>
              <span class="text-slate-400 text-xs">${info1.name}</span>
            </div>
            <p class="text-slate-300 text-xs leading-relaxed">
              <strong>Haplogroup:</strong> ${info1.haplo} &bull; <strong>Variants:</strong> ${vars1.length} mutations across 16,569 bp.
            </p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5 font-mono">
              <span class="font-bold text-sky-400 text-sm">${name2}</span>
              <span class="text-slate-400 text-xs">${info2.name}</span>
            </div>
            <p class="text-slate-300 text-xs leading-relaxed">
              <strong>Haplogroup:</strong> ${info2.haplo} &bull; <strong>Variants:</strong> ${vars2.length} mutations across 16,569 bp.
            </p>
          </div>
        </div>

        <!-- Section 3: Comprehensive Familial Marker Analysis -->
        <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Comprehensive familial marker analysis</span>
              <h3 class="text-base font-extrabold text-white font-sans">Full variant position matching diagram (${sortedPositions.length} total loci)</h3>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span> Shared (${shared.length})</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span> Private (${unique1.length + unique2.length})</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400"></span> Ethnic specific</span>
            </div>
          </div>

          <!-- Matching List Diagram -->
          <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
            ${markerRowsHtml}
          </div>

          <!-- Hong Kong Specific Verification Box -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 font-sans shadow-xl">
            <div class="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
              <span>Hong Kong specific mutations (cross-validated dataset verification):</span>
            </div>
            <p class="text-slate-200 text-xs leading-relaxed">
              Positions <strong>m.5821</strong>, <strong>m.6338</strong>, <strong>m.6455</strong> (MT-CO1), <strong>m.8602</strong> (MT-ATP6), <strong>m.9540</strong> (MT-CO3), and <strong>m.14821</strong> (MT-CYB) are highlighted as private diagnostic signatures. These variants were cross-referenced against multiple reference datasets including <strong>OGC (1000 Genomes)</strong>, <strong>Norwegian</strong>, and <strong>Swedish</strong> cohorts; across all comparative datasets, only this Hong Kong sample possessed these mutations, establishing them as private lineage-defining markers.
            </p>
          </div>
        </div>

      </div>
    `;

    reportContainer.querySelectorAll('.venn-variant-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          const v = JSON.parse(dot.getAttribute('data-variant'));
          const eths = JSON.parse(dot.getAttribute('data-eths'));
          this.showVariantModal(v, eths);
        } catch(err) {}
      });
    });
  }
};

window.App = {
  variantsData: null,
  distanceData: null,
  treeData: null,

  FAMILY_PEDIGREES: {
    'UK': { name: 'Ukraine', haplo: 'Haplogroup U4 / H', grandmother: 'UK_F_NIKG', mother: 'UK_F_NIKM', aunt: 'UK_F_NIKA', children: ['UK_M_NIKS1', 'UK_M_NIK', 'UK_M_NIKS2'] },
    'IN': { name: 'India', haplo: 'Haplogroup M / R', grandmother: 'IN_F_RISG', mother: 'IN_F_RISM', father: 'IN_M_RISF', children: ['IN_M_RIS', 'IN_M_RISS1'] },
    'IS': { name: 'India South', haplo: 'Haplogroup M / R', mother: 'IS_F_VYSM', father: 'IS_M_RAV', children: ['IS_F_VYSC1', 'IS_M_PRIC1'] },
    'IW': { name: 'India West', haplo: 'Haplogroup M / R', mother: 'IW_F_ANJM', father: 'IW_M_ANJF', children: ['IW_F_ANJS1'] },
    'PK': { name: 'Pakistan', haplo: 'Haplogroup M / U', mother: 'PK_F_WAS', father: 'PK_M_WASH', children: ['PK_M_WASC1', 'PK_M_WASC2'] },
    'HK': { name: 'Hong Kong', haplo: 'Haplogroup M7', mother: 'HK_F_JANM', father: 'HK_M_WLL', children: ['HK_F_JAN'] },
    'MX': { name: 'Mexico', haplo: 'Haplogroup B2', mother: 'MX_F_CRY', father: 'MX_M_CRYF', children: ['MX_F_CRYS1'] },
    'KR': { name: 'Korea', haplo: 'Haplogroup D4', mother: 'KR_F_MOO', children: ['KR_F_MOOC1'] },
    'CL': { name: 'Colombia', haplo: 'Haplogroup C1', mother: 'CL_F_ALJ', children: ['CL_F_ALJC1'] },
    'AA': { name: 'Africa', haplo: 'Haplogroup L2', individual: 'AA_F_TON', desc: 'Ancestral root of all modern human maternal lineages.' },
    'TB': { name: 'Tibet', haplo: 'Haplogroup M9', individual: 'TB_F_BHA', desc: 'High-altitude adapted lineage carrying 3394 T>C complex I mutation.' },
    'CA': { name: 'Canada', haplo: 'Haplogroup H2', individual: 'CA_M_GER', desc: 'Macro-haplogroup H2 lineage.' },
    'NA': { name: 'Native America', haplo: 'Haplogroup A2', individual: 'NA_F_R3_2_LP5206_mrg', desc: 'Indigenous founding lineage derived from prehistoric Beringian migrations.' }
  },

  async init() {
    console.log("Initializing Genomic Mito Showcase Controller (Satellite Migration Map Edition)...");
    
    await this.loadAllData();

    if (this.treeData && window.TreeViewer) {
      window.TreeViewer.init(this.treeData);
    }

    window.FamilyAccessGate.init();

    if (window.DiagnosticMarkersExplorer) window.DiagnosticMarkersExplorer.init();

    if (window.MigrationMap) {
      window.MigrationMap.init();
    }

    this.bindEvents();
  },

  bindEvents() {
    const openCompBtn = document.getElementById('openComparatorBtn');
    const closeReportBtn = document.getElementById('closeReportBtn');
    const reportModal = document.getElementById('familyReportModal');
    const quickSelect = document.getElementById('quickFamilyEntrySelect');

    const mainTabTree = document.getElementById('mainTabTree');
    const mainTabGlobe = document.getElementById('mainTabGlobe');
    const tabContentTree = document.getElementById('tabContentTree');
    const tabContentGlobe = document.getElementById('tabContentGlobe');

    const switchMainTab = (tab) => {
      const activeClass = 'bg-sky-500 text-slate-950 shadow-md font-bold';
      const inactiveClass = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-bold';

      if (tab === 'tree') {
        if (mainTabTree) mainTabTree.className = `px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeClass}`;
        if (mainTabGlobe) mainTabGlobe.className = `px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${inactiveClass}`;
        tabContentTree?.classList.remove('hidden');
        tabContentGlobe?.classList.add('hidden');
        if (window.TreeViewer) window.TreeViewer.render();
      } else if (tab === 'globe') {
        if (mainTabGlobe) mainTabGlobe.className = `px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeClass}`;
        if (mainTabTree) mainTabTree.className = `px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${inactiveClass}`;
        tabContentTree?.classList.add('hidden');
        tabContentGlobe?.classList.remove('hidden');
        if (window.MigrationMap) {
          window.MigrationMap.populateAllSamplesSelect();
          window.MigrationMap.initLeafletMap();
          setTimeout(() => {
            if (window.MigrationMap && window.MigrationMap.map) {
              window.MigrationMap.map.invalidateSize();
              window.MigrationMap.renderRoute();
              window.MigrationMap.renderDossier();
            }
          }, 100);
          setTimeout(() => {
            if (window.MigrationMap && window.MigrationMap.map) {
              window.MigrationMap.map.invalidateSize();
            }
          }, 300);
        }
      }
    };

    mainTabTree?.addEventListener('click', (e) => {
      e.preventDefault();
      switchMainTab('tree');
    });
    mainTabGlobe?.addEventListener('click', (e) => {
      e.preventDefault();
      switchMainTab('globe');
    });
    window.switchMainTab = switchMainTab;

    openCompBtn?.addEventListener('click', () => {
      if (window.FamilyReportGenerator) {
        window.FamilyReportGenerator.openReportModal('UK', 'MX', 'IN');
      }
    });

    closeReportBtn?.addEventListener('click', () => {
      if (reportModal) {
        reportModal.classList.add('hidden');
        reportModal.classList.remove('flex');
      }
    });

    quickSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;

      const eth1 = val;

      // 1. Switch to Tree View if on another tab
      switchMainTab('tree');

      // 2. Select this family across the application (Tree, Pedigree, Diagnostic, Map, Flags)
      if (window.FamilyAccessGate) {
        window.FamilyAccessGate.applyFamilySelection(eth1, true);
      }

      // 3. Smooth scroll directly to the maternal lineage tree
      const treeSection = document.getElementById('treeWrapper') || document.getElementById('treeContainer');
      if (treeSection) {
        treeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 4. Hide compare toast so user stays focused on their selected family
      const toast = document.getElementById('compareBranchToast');
      if (toast) toast.classList.add('hidden');
    });

    // Wire up Compare Toast Buttons
    const closeToastBtn = document.getElementById('closeCompareToastBtn');
    const toastCompareBtn = document.getElementById('toastOpenCompareBtn');
    const toast = document.getElementById('compareBranchToast');

    closeToastBtn?.addEventListener('click', () => {
      if (toast) toast.classList.add('hidden');
    });

    toastCompareBtn?.addEventListener('click', () => {
      const eth1 = window.TreeViewer?.selectedEthnicities?.[0] || 'UK';
      const eth2 = eth1 === 'AA' ? 'CL' : (eth1 === 'MX' ? 'KR' : 'AA');
      if (window.FamilyReportGenerator) {
        window.FamilyReportGenerator.openReportModal(eth1, eth2, null);
      }
      if (toast) toast.classList.add('hidden');
    });
  },

  async loadAllData() {
    const fetchJson = async (filename) => {
      const paths = [
        `data/${filename}`,
        `/data/${filename}`,
        `./data/${filename}`,
        `docs/data/${filename}`
      ];
      for (const p of paths) {
        try {
          const res = await fetch(p);
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return null;
    };

    try {
      const [varsRes, distRes, treeRes] = await Promise.all([
        fetchJson('variants_dataset.json'),
        fetchJson('distance_matrix.json'),
        fetchJson('phylo_tree.json')
      ]);

      this.variantsData = varsRes;
      this.distanceData = distRes;
      this.treeData = treeRes;

      console.log("✓ Loaded all dataset JSONs successfully.");
    } catch (e) {
      console.error("Error loading application JSON datasets:", e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
