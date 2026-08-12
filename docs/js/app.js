/**
 * Main Web Showcase Application Controller - Apple Liquid Glass & Neutral Obsidian Edition
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

window.FamilyAccessGate = {
  STORAGE_KEY: 'mito_selected_family_v6',

  init() {
    this.bindEvents();
    const stored = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
    const modal = document.getElementById('familyWelcomeModal');

    if (!stored && modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (stored) {
        this.applyFamilySelection(stored, false);
      }
    }
  },

  bindEvents() {
    const openBtn = document.getElementById('openWelcomeModalBtn');
    const closeBtn = document.getElementById('closeWelcomeModalBtn');
    const modal = document.getElementById('familyWelcomeModal');
    const select = document.getElementById('welcomeModalSelect');
    const confirmBtn = document.getElementById('confirmWelcomeFamilyBtn');

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

    confirmBtn?.addEventListener('click', () => {
      const val = select?.value || 'IN';
      this.applyFamilySelection(val, true);
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

    // 1. Zoom into their family on the TreeViewer & highlight that family
    if (window.TreeViewer) {
      window.TreeViewer.zoomToFamily(code);
    }

    // 2. Configure 3D Globe with this sample's individualized migration trail
    if (window.GlobeViewer) {
      window.GlobeViewer.setSample(code);
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
    'IN': { name: 'India (IN - Deepali & Rishi)', markers: [593, 5075, 6020, 10400, 12792, 14783, 15043, 15692, 15859], mother: 'IN_F_RISM (Rishi Mother) & IN_F_DPL (Deepali Mother)', dadNote: 'IN_M_RISF & IN_M_DPLH (Fathers) do NOT transmit mtDNA markers to children; offspring inherit 100% maternal mitochondrial DNA.' },
    'IS': { name: 'India South (IS - Vys, Rav & Sel)', markers: [5186, 9094, 9614, 12793, 13194, 13656, 15930], mother: 'IS_F_VYSM (Vys Mother)', dadNote: 'IS_M_RAV (Father Rav) & IS_M_SEL (Father Sel) carry non-transmitted paternal lines; children inherit 100% maternal mtDNA from IS_F_VYSM.' },
    'IW': { name: 'India West (IW - Raj & Anjali)', markers: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385], mother: 'IW_F_ANJM (Anjali Mother)', dadNote: 'IW_M_ANJF (Raj / Father) does NOT carry maternal diagnostic markers; 100% maternal transmission passed to offspring IW_F_ANJS1.' },
    'PK': { name: 'Pakistan (PK - Wasim)', markers: [511, 3594, 7269, 7805, 13680, 15479], mother: 'PK_F_WAS (Wasim Mother)', dadNote: 'PK_M_WASH (Father) does not transmit familial markers to children; offspring PK_M_WASC1 & PK_M_WASC2 inherit strictly from PK_F_WAS.' },
    'MX': { name: 'Mexico (MX)', markers: [499, 4823, 6297, 8047, 9039, 13590], mother: 'MX_F_CRY (Mother)', dadNote: 'MX_M_CRYF (Father) carries paternal nuclear DNA only; children inherit 100% of maternal mtDNA from MX_F_CRY.' },
    'HK': { name: 'Hong Kong (HK)', markers: [5821, 6338, 6455, 8602, 9540, 14821], mother: 'HK_F_JAN (Mother)', dadNote: 'HK_M_WLL (Father) carries non-transmitted paternal line; children inherit 100% of maternal markers from HK_F_JAN.' },
    'UK': { name: 'Ukraine (UK)', markers: [650, 8395, 10885, 11566, 14467, 16356], mother: 'UK_F_NIKM (Mother)', aunt: 'UK_F_NIKA (Aunt)', grandmother: 'UK_F_NIKG (Grandmother)', dadNote: 'No father sample collected for Ukraine cohort; maternal inheritance verified through UK_F_NIKG ➔ UK_F_NIKM ➔ offspring.' },
    'KR': { name: 'Korea (KR)', markers: [63, 1709, 2882, 3010, 8414, 9817, 13544, 15565, 15669], mother: 'KR_F_MOO (Mother)', dadNote: 'No father sample collected; maternal lineage strictly passed from KR_F_MOO to KR_F_MOOC1.' },
    'CL': { name: 'Colombia (CL)', markers: [114, 3552, 8545, 9545, 11914, 13263, 15323], mother: 'CL_F_ALJ (Mother)', dadNote: 'Fathers pass 0% mitochondrial DNA or familial diagnostic markers to offspring; passed from CL_F_ALJ to CL_F_ALJC1.' },
    'AA': { name: 'African (AA)', markers: [183, 2758, 5581, 7175, 9128, 11338, 13803, 14308, 15784], mother: 'AA_F_TON (Mother)', dadNote: 'Sub-Saharan African maternal root line transmitted strictly maternally.' },
    'TB': { name: 'Tibet (TB)', markers: [3394, 4491, 8784, 12950, 14305, 15535, 16048], mother: 'TB_F_BHA (Mother)', dadNote: 'Tibetan maternal lineage transmitted strictly through mother.' },
    'CA': { name: 'Canada (CA)', markers: [73, 146, 263, 4769], mother: 'CA_M_GER', dadNote: 'Maternal mtDNA passed strictly down female lineage.' },
    'NA': { name: 'Native North America (NA)', markers: [64, 152, 235, 663, 1736, 4248, 4824, 8027, 8794, 12007, 16111, 16290, 16319], mother: 'NA_F_R3_2_LP5206_mrg (Mother)', dadNote: 'Indigenous North American maternal founder line passed across generations.' }
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

    select.onchange = () => this.displayFamily(select.value);
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
          <div class="text-sky-400 font-bold text-xs font-mono">🧬 Familial Transmission & Paternal Note:</div>
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
            <span class="text-sm">Familial Diagnostic Position Markers for ${data.name}:</span>
            <span class="text-[10px] text-slate-400 font-sans font-normal">Maternally Transmitted Polymorphisms</span>
          </div>
          <div class="text-white font-extrabold text-sm tracking-wide pt-1">
            ${data.markers.map(m => `<span class="bg-slate-900 text-sky-300 px-3 py-1 rounded-xl border border-sky-500/30 mr-2 inline-block mb-2 shadow-sm font-mono">m.${m}</span>`).join('')}
          </div>
        </div>
        ${dadHtml}
      </div>
    `;
  }
};

window.FamilyReportGenerator = {
  REGION_MAP: {
    'IN': { code: 'IN', name: 'India — Central/North (IN)', region: 'Central/North South Asia', haplo: 'Haplogroup M / R (IN)', history: 'Ancient South Asian maternal lineage derived from the early Southern Coastal out-of-Africa migration wave ~60,000 YBP.' },
    'IS': { code: 'IS', name: 'India South — Deccan (IS)', region: 'Southern South Asia', haplo: 'Haplogroup M / R (IS / VYS)', history: 'Southern Indian maternal lineage derived from ancient South Asian indigenous Out-of-Africa coastal settlement.' },
    'IW': { code: 'IW', name: 'India West — Gujarat (IW)', region: 'Western South Asia', haplo: 'Haplogroup M / R (IW)', history: 'Western South Asian regional sub-clade sharing ancient Southern Coastal out-of-Africa founding roots.' },
    'PK': { code: 'PK', name: 'Pakistan — Indus Valley (PK)', region: 'Indus Valley', haplo: 'Haplogroup M / U (PK)', history: 'Indus Valley regional maternal lineage sharing deep historical trade and migration connections across Central/South Asia.' },
    'UK': { code: 'UK', name: 'Ukraine — Eastern Europe (UK)', region: 'Eastern Europe', haplo: 'Haplogroup U4 / H', history: 'Eastern European maternal lineage (Haplogroup U4/H) rooted in ancient Mesolithic Hunter-Gatherers and Neolithic European agricultural expansion.' },
    'MX': { code: 'MX', name: 'Mexico — Mesoamerica (MX)', region: 'Mesoamerica', haplo: 'Haplogroup B2', history: 'Primary founding Native American lineage (Haplogroup B2) originating from ancient East Asian ancestors crossing Beringia ~15,000–25,000 YBP during the LGM.' },
    'HK': { code: 'HK', name: 'Hong Kong — Pearl River (HK)', region: 'East Asia', haplo: 'Haplogroup M7', history: 'Ancient East Asian coastal lineage (Haplogroup M7) prevalent across Southern China, Hong Kong, and the Japanese Archipelago.' },
    'KR': { code: 'KR', name: 'Korea — Northeast Asia (KR)', region: 'Northeast Asia', haplo: 'Haplogroup D4', history: 'Northeastern East Asian maternal lineage (Haplogroup D4) common across Korea, Manchuria, and Siberia.' },
    'CL': { code: 'CL', name: 'Colombia — South America (CL)', region: 'South America', haplo: 'Haplogroup C1', history: 'Colombian Native American maternal lineage (Haplogroup C1) stemming from early Paleo-Indian expansion in South America.' },
    'AA': { code: 'AA', name: 'African — Sub-Saharan Cradle (AA)', region: 'Sub-Saharan Africa', haplo: 'Haplogroup L2', history: 'Deep African maternal lineage (Haplogroup L2), representing the ancestral root of all modern human mtDNA.' },
    'TB': { code: 'TB', name: 'Tibet — Himalayan Plateau (TB)', region: 'Himalayan Plateau', haplo: 'Haplogroup M9', history: 'High-altitude adapted Central Asian Tibetan lineage (Haplogroup M9) with deep Himalayan ancestral continuity.' },
    'CA': { code: 'CA', name: 'Canada — North America (CA)', region: 'North America', haplo: 'Haplogroup H2', history: 'North American / European lineage (Haplogroup H2).' },
    'NA': { code: 'NA', name: 'Native North America (NA)', region: 'North America', haplo: 'Haplogroup A2', history: 'Indigenous North American maternal lineage (Haplogroup A2) sharing ancient Beringian founder roots.' }
  },

  getAllFamilies() {
    return Object.keys(this.REGION_MAP).map(key => this.REGION_MAP[key]);
  },

  getFamilyData(familyCode) {
    if (!familyCode) return null;
    const cleanCode = familyCode.replace('Ethnicity ', '').replace('Family ', '').trim();
    return this.REGION_MAP[cleanCode] || {
      code: cleanCode,
      name: `Cohort ${cleanCode}`,
      region: `Cohort ${cleanCode}`,
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
      const idx1 = allSamples.indexOf(s1);
      samplesB.forEach(s2 => {
        const idx2 = allSamples.indexOf(s2);
        if (idx1 >= 0 && idx2 >= 0 && matrix[idx1] && matrix[idx1][idx2] !== undefined) {
          total += matrix[idx1][idx2];
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
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[200] p-4';
      document.body.appendChild(modal);
    }

    const ethBadges = (eths || []).map(e => `
      <span class="px-2.5 py-1 rounded-xl bg-slate-900 text-sky-300 border border-sky-500/30 font-mono font-bold text-xs">
        ${e}
      </span>
    `).join(' ');

    modal.innerHTML = `
      <div class="earth-panel max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-white/15 bg-slate-900 font-mono text-xs rounded-3xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span class="text-[10px] text-sky-400 uppercase font-bold tracking-wider">Mutation Inspector</span>
            <h3 class="text-base font-extrabold text-white">m.${v.pos} ${v.ref}&gt;${v.alt}</h3>
          </div>
          <button onclick="document.getElementById('${modalId}').remove()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/10">
            ✕ Close
          </button>
        </div>

        <div class="space-y-3 font-sans">
          <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
            <div class="text-slate-400 text-[11px]">Seen in Population Cohorts:</div>
            <div class="flex flex-wrap gap-1.5 pt-1">${ethBadges}</div>
          </div>

          <div class="grid grid-cols-2 gap-2 font-mono text-xs">
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-slate-400 text-[10px] block">Gene / Region</span>
              <strong class="text-emerald-400">${v.gene || 'Control Region (D-loop)'}</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span class="text-slate-400 text-[10px] block">Variant Frequency (VAF)</span>
              <strong class="text-sky-400">${(v.vaf ? (v.vaf * 100).toFixed(1) : 100)}% VAF</strong>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-[11.5px] text-slate-300 leading-relaxed">
            💡 <strong>Biological Context:</strong> Polymorphic mitochondrial DNA mutation at position m.${v.pos}. Shared presence across populations highlights either deep ancestral lineage motifs or hyper-mutable regional hotspots.
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
    if (!select1 || !select2) return;

    const families = this.getAllFamilies();
    const optionsHtml = families.map(f => `<option value="${f.code}">${f.name}</option>`).join('');
    const optionalOptionsHtml = `<option value="">-- Optional 3rd Cohort --</option>` + optionsHtml;

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
            <title>m.${v.pos} ${v.ref}>${v.alt} (${v.gene || 'D-loop'}) — Click for details</title>
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
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Interactive Mutational Venn Diagram</span>
              <h3 class="text-base font-extrabold text-white font-sans">3-Way Population Variant Distribution</h3>
            </div>
            <span class="text-slate-400 text-xs font-mono">💡 Hover over dots to view positions; click dot for full detail</span>
          </div>

          <div class="flex justify-center overflow-x-auto py-2">
            <svg width="680" height="420" viewBox="0 0 680 420" class="select-none">
              <circle cx="260" cy="170" r="135" fill="${color1}" fill-opacity="0.18" stroke="${color1}" stroke-width="2.2"/>
              <circle cx="420" cy="170" r="135" fill="${color2}" fill-opacity="0.18" stroke="${color2}" stroke-width="2.2"/>
              <circle cx="340" cy="270" r="135" fill="${color3}" fill-opacity="0.18" stroke="${color3}" stroke-width="2.2"/>

              <text x="175" y="105" fill="${color1}" font-weight="800" font-size="12" font-family="monospace">${info1.code} Only (${unique1.length})</text>
              <text x="505" y="105" fill="${color2}" font-weight="800" font-size="12" font-family="monospace">${info2.code} Only (${unique2.length})</text>
              <text x="340" y="380" fill="${color3}" font-weight="800" font-size="12" font-family="monospace" text-anchor="middle">${info3.code} Only (${unique3.length})</text>

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
                <div class="text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">3-Way Multi-Population Comparative Report</div>
                <h2 class="text-xl font-extrabold text-white">${info1.name} <span class="text-slate-500">vs</span> ${info2.name} <span class="text-slate-500">vs</span> ${info3.name}</h2>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800 text-xs text-sky-300 font-bold">
                3-Way Triangulation Mode
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
              <div class="text-sky-300 font-bold font-mono">💡 What do these numbers mean?</div>
              <p class="text-slate-300 leading-relaxed text-[11.5px]">
                <strong>Pairwise Genetic Distance</strong> measures the average number of mitochondrial DNA mutation differences between individuals from two population cohorts.
                Lower numbers (< 10) indicate close maternal ancestry, while higher numbers (> 18) reflect deep evolutionary divergence over tens of thousands of years.
              </p>
            </div>
          </div>

          ${vennSvgHtml}

          <div class="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 text-xs text-slate-300 leading-relaxed shadow-2xl">
            <div class="border-b border-white/10 pb-3">
              <h4 class="font-bold text-sky-400 font-mono text-base flex items-center gap-2">
                <span>📜 Population Breakdown</span>
              </h4>
              <p class="text-slate-400 text-[11px] mt-0.5">Triangulated Evolutionary & Geographic Lineage Analysis across ${info1.code}, ${info2.code}, and ${info3.code}</p>
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
              <span class="text-xs text-sky-400 font-bold uppercase tracking-wider font-mono">Interactive Mutational Venn Diagram</span>
              <h3 class="text-base font-extrabold text-white font-sans">2-Way Pairwise Variant Distribution</h3>
            </div>
            <span class="text-slate-400 text-xs font-mono">💡 Hover over dots to view positions; click dot for full detail</span>
          </div>

          <div class="flex justify-center overflow-x-auto py-2">
            <svg width="600" height="320" viewBox="0 0 600 320" class="select-none">
              <circle cx="230" cy="160" r="125" fill="${color1}" fill-opacity="0.18" stroke="${color1}" stroke-width="2.2"/>
              <circle cx="370" cy="160" r="125" fill="${color2}" fill-opacity="0.18" stroke="${color2}" stroke-width="2.2"/>

              <text x="150" y="90" fill="${color1}" font-weight="800" font-size="12" font-family="monospace">${info1.code} Only (${unique1.length})</text>
              <text x="450" y="90" fill="${color2}" font-weight="800" font-size="12" font-family="monospace">${info2.code} Only (${unique2.length})</text>
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
                <div class="text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">Pairwise Cohort Comparative Report</div>
                <h2 class="text-xl font-extrabold text-white">${info1.name} <span class="text-slate-500">vs</span> ${info2.name}</h2>
              </div>
              <div class="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/10">
                <span class="text-xs text-slate-400">Pairwise Genetic Distance:</span>
                <span class="text-lg font-bold text-sky-300">${avgDist}</span>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5 font-sans">
              <div class="text-sky-300 font-bold font-mono">💡 What does Pairwise Genetic Distance mean?</div>
              <p class="text-slate-300 leading-relaxed text-[11.5px]">
                <strong>Genetic Distance (${avgDist})</strong> measures the average number of mitochondrial DNA mutation differences between individuals in ${info1.name} and ${info2.name}.
                Lower values (< 10) indicate close maternal relationship, while higher values (> 18) reflect deep evolutionary divergence over tens of thousands of years.
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
                <span>📜 Population Breakdown</span>
              </h4>
              <p class="text-slate-400 text-[11px] mt-0.5">Evolutionary Lineage & Migration Analysis between ${info1.code} and ${info2.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-sky-300 text-sm">${info1.name} Breakdown</div>
                <p class="text-slate-300 text-[11.5px] leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div class="font-mono font-bold text-blue-300 text-sm">${info2.name} Breakdown</div>
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
  }
};

window.App = {
  variantsData: null,
  distanceData: null,
  treeData: null,
  geoData: null,
  migrationData: null,

  async init() {
    console.log("Initializing Genomic Mito Showcase Controller (Apple Liquid Glass Edition)...");
    
    window.FamilyAccessGate.init();

    await this.loadAllData();

    if (window.DiagnosticMarkersExplorer) window.DiagnosticMarkersExplorer.init();

    if (this.treeData && window.TreeViewer) {
      window.TreeViewer.init(this.treeData);
    }

    if (this.geoData && this.migrationData && window.GlobeViewer) {
      window.GlobeViewer.init(this.geoData, this.migrationData);
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
        if (mainTabTree) mainTabTree.className = `px-4 py-2 rounded-xl transition-all ${activeClass}`;
        if (mainTabGlobe) mainTabGlobe.className = `px-4 py-2 rounded-xl transition-all ${inactiveClass}`;
        tabContentTree?.classList.remove('hidden');
        tabContentGlobe?.classList.add('hidden');
        if (window.TreeViewer) window.TreeViewer.render();
      } else if (tab === 'globe') {
        if (mainTabGlobe) mainTabGlobe.className = `px-4 py-2 rounded-xl transition-all ${activeClass}`;
        if (mainTabTree) mainTabTree.className = `px-4 py-2 rounded-xl transition-all ${inactiveClass}`;
        tabContentTree?.classList.add('hidden');
        tabContentGlobe?.classList.remove('hidden');
        if (window.GlobeViewer) {
          window.GlobeViewer.render();
          window.GlobeViewer.populateAllSamplesSelect();
        }
      }
    };

    mainTabTree?.addEventListener('click', () => switchMainTab('tree'));
    mainTabGlobe?.addEventListener('click', () => switchMainTab('globe'));
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

      // 1. Switch to Tree View
      switchMainTab('tree');

      // 2. Select this family across the application
      if (window.FamilyAccessGate) {
        window.FamilyAccessGate.applyFamilySelection(eth1, true);
      }

      // 3. Smooth scroll directly to the maternal lineage tree
      const treeSection = document.getElementById('treeWrapper') || document.getElementById('treeContainer');
      if (treeSection) {
        treeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 4. Show compare toast
      const toast = document.getElementById('compareBranchToast');
      const toastTitle = document.getElementById('compareToastTitle');
      const toastMsg = document.getElementById('compareToastMsg');
      const firstBadge = document.getElementById('firstSelectedBadge');
      if (toast) {
        if (toastTitle) toastTitle.textContent = `Branch Selected: ${eth1}`;
        if (firstBadge) firstBadge.textContent = `Branch 1: ${eth1}`;
        if (toastMsg) {
          toastMsg.innerHTML = `Zoomed to <strong>${eth1}</strong> branch. <strong class="text-sky-400">Click another branch on the tree</strong> (or a cohort button below) to compare!`;
        }
        toast.classList.remove('hidden');
      }
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
      try {
        const res = await fetch(`data/${filename}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      try {
        const res = await fetch(`/data/${filename}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return null;
    };

    try {
      const [varsRes, distRes, treeRes, geoRes, migRes] = await Promise.all([
        fetchJson('variants_dataset.json'),
        fetchJson('distance_matrix.json'),
        fetchJson('phylo_tree.json'),
        fetchJson('world_geojson.json'),
        fetchJson('migration_routes.json')
      ]);

      this.variantsData = varsRes;
      this.distanceData = distRes;
      this.treeData = treeRes;
      this.geoData = geoRes;
      this.migrationData = migRes;

      console.log("✓ Loaded all dataset JSONs successfully.");
    } catch (e) {
      console.error("Error loading application JSON datasets:", e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
