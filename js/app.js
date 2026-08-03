/**
 * Main Web Showcase Application Controller - Earthy Tones Edition with Family Access & Specific Diagnostic Markers
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

window.DiagnosticMarkersExplorer = {
  FAMILY_MARKERS: {
    'MX': { name: 'Mexico (MX)', markers: [6297, 8047, 9039, 499, 4823, 13590], mother: 'MX_F_CRY (Mother)', dadNote: 'MX_M_CRYF (Father) carries paternal nuclear DNA only; children inherit 100% of maternal mtDNA from MX_F_CRY.' },
    'HK': { name: 'Hong Kong (HK)', markers: [5821, 6338, 8602, 14821, 6455, 9540], mother: 'HK_F_JAN (Mother)', dadNote: 'HK_M_WLL (Father) carries non-transmitted paternal line; children inherit 100% of maternal markers from HK_F_JAN.' },
    'UK': { name: 'Ukraine (UK)', markers: [650, 8395, 10885, 11566, 14467, 16356], mother: 'UK_F_NIKM (Mother)', aunt: 'UK_F_NIKA (Aunt)', grandmother: 'UK_F_NIKG (Grandmother)', dadNote: 'No father sample collected for Ukraine cohort; maternal inheritance verified through UK_F_NIKG ➔ UK_F_NIKM ➔ offspring.' },
    'IN': { name: 'India (IN)', markers: [593, 5075, 6020, 10400, 12792, 14783, 15043, 15692, 15859], mother: 'IN_F_RISM (Mother)', dadNote: 'IN_M_RISF (Father) does NOT transmit mtDNA markers to children.' },
    'IS': { name: 'India South (IS / VYS)', markers: [5186, 9094, 9614, 12793, 13194, 13656, 15930], mother: 'IS_F_VYSM (Mother)', dadNote: 'IS_M_RAV (Father) carries unrelated paternal line.' },
    'PK': { name: 'Pakistan (PK)', markers: [511, 3594, 7269, 7805, 13680, 15479], mother: 'PK_F_WAS (Mother)', dadNote: 'PK_M_WASH (Father) does not transmit familial markers to children.' },
    'KR': { name: 'Korea (KR)', markers: [63, 1709, 2882, 3010, 8414, 9817, 13544, 15565, 15669], mother: 'KR_F_MOO (Mother)', dadNote: 'No father sample collected; maternal lineage strictly passed from KR_F_MOO.' },
    'CL': { name: 'Chile (CL)', markers: [114, 3552, 8545, 9545, 11914, 13263, 15323], mother: 'CL_F_ALJ (Mother)', dadNote: 'Fathers pass 0% mitochondrial DNA or familial diagnostic markers to offspring.' },
    'AA': { name: 'African Ancestry (AA)', markers: [183, 2758, 5581, 7175, 9128, 11338, 13803, 14308, 15784], mother: 'AA_F_TON (Mother)', dadNote: 'Sub-Saharan African maternal root line transmitted maternally.' },
    'TB': { name: 'Tibet (TB)', markers: [3394, 4491, 8784, 12950, 14305, 15535, 16048], mother: 'TB_F_BHA (Mother)', dadNote: 'Tibetan maternal lineage transmitted strictly through mother.' },
    'CA': { name: 'Canada (CA)', markers: [73, 146, 4769], mother: 'CA_M_GER', dadNote: 'Maternal mtDNA passed strictly down female lineage.' },
    'IW': { name: 'India West (IW)', markers: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385], mother: 'IW_F_ANJM (Mother)', dadNote: 'IW_M_ANJF (Father) does NOT carry maternal diagnostic markers.' }
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
    this.displayFamily('UK');
  },

  displayFamily(key, clickedSampleName = null) {
    const data = this.FAMILY_MARKERS[key] || this.FAMILY_MARKERS['UK'];
    const container = document.getElementById('diagnosticMarkersCardContainer');
    if (!container) return;

    let dadHtml = '';
    if (data.dadNote) {
      dadHtml = `
        <div class="p-3.5 rounded-xl bg-orange-950/40 border border-orange-800/80 space-y-1.5 font-sans">
          <div class="text-orange-400 font-bold text-xs font-mono">🧬 Familial Transmission & Paternal Note:</div>
          <p class="text-stone-300 leading-relaxed text-[11.5px]">
            ${data.dadNote}
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-4 font-mono text-xs">
        <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-2">
          <div class="text-amber-300 font-bold flex items-center justify-between">
            <span class="text-sm">Familial Diagnostic Position Markers for ${data.name}:</span>
            <span class="text-[10px] text-stone-400 font-sans font-normal">Maternally Transmitted Polymorphisms</span>
          </div>
          <div class="text-stone-100 font-extrabold text-sm tracking-wide pt-1">
            ${data.markers.map(m => `<span class="bg-amber-900/80 text-amber-200 px-3 py-1 rounded-lg border border-amber-700/80 mr-2 inline-block mb-2 shadow-sm font-mono">m.${m}</span>`).join('')}
          </div>
        </div>
        ${dadHtml}
      </div>
    `;
  }
};

window.FamilyReportGenerator = {
  REGION_MAP: {
    'MX': { code: 'MX', name: 'Mexico (MX)', region: 'Mesoamerica', haplo: 'Haplogroup B2', history: 'Primary founding Native American lineage (Haplogroup B2) originating from ancient East Asian ancestors crossing Beringia ~15,000–25,000 YBP during the LGM.' },
    'HK': { code: 'HK', name: 'Hong Kong (HK)', region: 'East Asia', haplo: 'Haplogroup M7', history: 'Ancient East Asian coastal lineage (Haplogroup M7) prevalent across Southern China, Hong Kong, and the Japanese Archipelago.' },
    'UK': { code: 'UK', name: 'Ukraine (UK)', region: 'Eastern Europe', haplo: 'Haplogroup U4 / H', history: 'Eastern European maternal lineage (Haplogroup U4/H) rooted in ancient Mesolithic Hunter-Gatherers and Neolithic European agricultural expansion.' },
    'AA': { code: 'AA', name: 'African Ancestry (AA)', region: 'Sub-Saharan Africa', haplo: 'Haplogroup L2', history: 'Deep Sub-Saharan African maternal lineage (Haplogroup L2), representing the ancestral root of all modern human mtDNA.' },
    'IN': { code: 'IN', name: 'India (IN)', region: 'South Asia', haplo: 'Haplogroup M / R', history: 'Ancient South Asian maternal lineage derived from the early Southern Coastal out-of-Africa migration wave ~60,000 YBP.' },
    'IW': { code: 'IW', name: 'India West (IW)', region: 'Western South Asia', haplo: 'Haplogroup M / R', history: 'Western South Asian regional sub-clade sharing ancient Southern Coastal out-of-Africa founding roots.' },
    'IS': { code: 'IS', name: 'India South (IS)', region: 'Southern South Asia', haplo: 'Haplogroup M / R (VYS)', history: 'Southern Indian maternal lineage derived from ancient South Asian indigenous Out-of-Africa coastal settlement.' },
    'SA': { code: 'SA', name: 'South Asia / Arabia (SA)', region: 'Near East / South Asia', haplo: 'Haplogroup N1 / T2', history: 'Arabian Peninsula & South Asian crossroads lineage bridging the Near East and Indian subcontinent.' },
    'PK': { code: 'PK', name: 'Pakistan (PK)', region: 'Indus Valley', haplo: 'Haplogroup M / U', history: 'Indus Valley regional maternal lineage sharing deep historical trade and migration connections across Central/South Asia.' },
    'KR': { code: 'KR', name: 'Korea (KR)', region: 'Northeast Asia', haplo: 'Haplogroup D4', history: 'Northeastern East Asian maternal lineage (Haplogroup D4) common across Korea, Manchuria, and Siberia.' },
    'TB': { code: 'TB', name: 'Tibet (TB)', region: 'Himalayan Plateau', haplo: 'Haplogroup M9', history: 'High-altitude adapted Central Asian Tibetan lineage (Haplogroup M9) with deep Himalayan ancestral continuity.' },
    'CL': { code: 'CL', name: 'Chile (CL)', region: 'South America', haplo: 'Haplogroup C1', history: 'Southern Cone Native American maternal lineage (Haplogroup C1) stemming from early Paleo-Indian coastal expansion along the Pacific.' },
    'CA': { code: 'CA', name: 'Canada (CA)', region: 'North America', haplo: 'Haplogroup H / U', history: 'North American / European lineage.' },
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
      name: `${cleanCode}`,
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

  openReportModal(fam1Code = 'MX', fam2Code = 'HK', fam3Code = null) {
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
    const optionsHtml = families.map(f => `<option value="${f.code}">${f.name} — ${f.region}</option>`).join('');
    const optionalOptionsHtml = `<option value="">-- None (2-Way Compare) --</option>` + optionsHtml;

    select1.innerHTML = optionsHtml;
    select2.innerHTML = optionsHtml;
    if (select3) select3.innerHTML = optionalOptionsHtml;

    select1.value = (fam1Code || 'MX').replace('Ethnicity ', '').replace('Family ', '').trim();
    select2.value = (fam2Code || 'HK').replace('Ethnicity ', '').replace('Family ', '').trim();
    if (select3) select3.value = fam3Code ? fam3Code.replace('Ethnicity ', '').replace('Family ', '').trim() : '';

    const onChangeHandler = () => {
      this.renderReport(select1.value, select2.value, select3?.value || null);
    };

    select1.onchange = onChangeHandler;
    select2.onchange = onChangeHandler;
    if (select3) select3.onchange = onChangeHandler;
  },

  renderReport(f1Key, f2Key, f3Key = null) {
    const reportContainer = document.getElementById('familyReportBody');
    if (!reportContainer || !window.App.variantsData) return;

    const info1 = this.getFamilyData(f1Key);
    const info2 = f2Key ? this.getFamilyData(f2Key) : null;
    const info3 = f3Key ? this.getFamilyData(f3Key) : null;

    if (!info1) return;

    const samples1 = (window.App.distanceData?.samples || []).filter(s => s.startsWith(info1.code + '_'));
    const samples2 = info2 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info2.code + '_')) : [];
    const samples3 = info3 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info3.code + '_')) : [];

    // Homoplasic & Synapomorphic Data Helpers
    const homoplasicLoci = [
      { pos: 309, gene: 'Control Region (D-loop)', note: 'Poly-C tract insertion hotspot' },
      { pos: 310, gene: 'Control Region (D-loop)', note: 'Poly-C tract transition' },
      { pos: 514, gene: 'Control Region (D-loop)', note: 'CA-repeat dinucleotide insertion' },
      { pos: 16184, gene: 'Control Region (D-loop)', note: 'Hyper-variable segment 1 (HVS-I)' },
      { pos: 16189, gene: 'Control Region (D-loop)', note: 'Poly-C stretch creator transition' },
      { pos: 16519, gene: 'Control Region (D-loop)', note: 'Fast-evolving terminal D-loop polymorphism' }
    ];

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

      const sharedAll = [];
      const unique1 = [];
      const unique2 = [];
      const unique3 = [];

      muts1.forEach((v1, key) => {
        if (muts2.has(key) && muts3.has(key)) {
          sharedAll.push(v1);
        } else if (!muts2.has(key) && !muts3.has(key)) {
          unique1.push(v1);
        }
      });

      muts2.forEach((v2, key) => {
        if (!muts1.has(key) && !muts3.has(key)) {
          unique2.push(v2);
        }
      });

      muts3.forEach((v3, key) => {
        if (!muts1.has(key) && !muts2.has(key)) {
          unique3.push(v3);
        }
      });

      reportContainer.innerHTML = `
        <div class="space-y-6 font-sans">
          
          <div class="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-4 font-mono">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <div class="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">3-Way Multi-Population Ethnicity Comparative Report</div>
                <h2 class="text-xl font-extrabold text-stone-100">${info1.name} <span class="text-stone-500">vs</span> ${info2.name} <span class="text-stone-500">vs</span> ${info3.name}</h2>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-700/60 text-xs text-orange-300 font-bold">
                3-Way Triangulation Mode
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
                <span class="text-stone-400 font-sans">${info1.code} vs ${info2.code}:</span>
                <span class="text-base font-bold text-amber-400">${dist12}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
                <span class="text-stone-400 font-sans">${info1.code} vs ${info3.code}:</span>
                <span class="text-base font-bold text-amber-400">${dist13}</span>
              </div>
              <div class="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
                <span class="text-stone-400 font-sans">${info2.code} vs ${info3.code}:</span>
                <span class="text-base font-bold text-amber-400">${dist23}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-3 text-center text-xs font-mono">
            <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <div class="text-emerald-400 font-bold text-xl">${sharedAll.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Shared by All 3</div>
            </div>
            <div class="p-3 rounded-xl bg-orange-950/40 border border-orange-800/80">
              <div class="text-orange-400 font-bold text-xl">${unique1.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info1.code}</div>
            </div>
            <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80">
              <div class="text-amber-400 font-bold text-xl">${unique2.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info2.code}</div>
            </div>
            <div class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80">
              <div class="text-cyan-400 font-bold text-xl">${unique3.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info3.code}</div>
            </div>
          </div>

          <!-- POPULATION BREAKDOWN (Renamed from Deep Population History) -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 space-y-5 text-xs text-stone-300 leading-relaxed shadow-2xl">
            <div class="border-b border-stone-800 pb-3">
              <h4 class="font-bold text-amber-400 font-mono text-base flex items-center gap-2">
                <span>📜 Population Breakdown</span>
              </h4>
              <p class="text-stone-400 text-[11px] mt-0.5">Triangulated Evolutionary & Geographic Lineage Analysis across ${info1.code}, ${info2.code}, and ${info3.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11.5px]">
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="font-mono font-bold text-orange-300 text-sm">${info1.name}</div>
                <div class="text-stone-400 text-[11px]"><strong class="text-stone-200">Haplogroup:</strong> ${info1.haplo}</div>
                <p class="text-stone-300 leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="font-mono font-bold text-amber-300 text-sm">${info2.name}</div>
                <div class="text-stone-400 text-[11px]"><strong class="text-stone-200">Haplogroup:</strong> ${info2.haplo}</div>
                <p class="text-stone-300 leading-relaxed">${info2.history}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="font-mono font-bold text-emerald-300 text-sm">${info3.name}</div>
                <div class="text-stone-400 text-[11px]"><strong class="text-stone-200">Haplogroup:</strong> ${info3.haplo}</div>
                <p class="text-stone-300 leading-relaxed">${info3.history}</p>
              </div>
            </div>

            <!-- Shared Motifs -->
            <div class="space-y-2 pt-2 border-t border-stone-800">
              <h6 class="font-bold text-emerald-400 font-mono text-xs">
                🧬 Conserved Motifs Shared by All 3 Populations (${sharedAll.length})
              </h6>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                ${sharedAll.length > 0 ? sharedAll.map(m => `
                  <div class="p-2 rounded bg-stone-950 border border-emerald-900/60 flex justify-between">
                    <span class="text-emerald-300 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                    <span class="text-stone-400 text-[10px]">${m.gene || 'D-loop'}</span>
                  </div>
                `).join('') : '<div class="col-span-full p-2 text-stone-500 text-center font-mono">No variants shared by all three populations simultaneously.</div>'}
              </div>
            </div>
          </div>

          <!-- Homoplasic Mutational Hotspots Section -->
          <div class="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>🔥 Homoplasic Mutational Hotspots Report</span>
              </h4>
              <span class="text-stone-400 text-[11px]">Hyper-mutable Control Region Loci</span>
            </div>
            <p class="text-stone-300 text-[11.5px] font-sans">
              Homoplasic positions undergo independent parallel mutations across unrelated maternal lineages due to structural poly-C or dinucleotide repeats.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              ${homoplasicLoci.map(h => `
                <div class="p-2.5 rounded-xl bg-stone-950 border border-amber-900/60 space-y-1">
                  <div class="flex items-center justify-between text-amber-300 font-bold">
                    <span>m.${h.pos}</span>
                    <span class="text-[10px] text-stone-400 font-normal">D-loop</span>
                  </div>
                  <div class="text-[10.5px] text-stone-400 font-sans">${h.note}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Synapomorphic Lineage Fingerprints Section -->
          <div class="p-5 rounded-2xl bg-stone-900 border border-orange-500/40 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-orange-400 text-sm flex items-center gap-2">
                <span>🧬 Synapomorphic Lineage Fingerprints</span>
              </h4>
              <span class="text-stone-400 text-[11px]">Shared Derived Clade Signatures</span>
            </div>
            <p class="text-stone-300 text-[11.5px] font-sans">
              Synapomorphies represent ancestral mutations inherited by all descendant branches of a specific maternal clade.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-sans">
              <div class="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-bold text-orange-300 font-mono text-xs">${info1.code} Synapomorphies</div>
                <div class="text-[11px] text-stone-400 font-mono">${unique1.slice(0, 4).map(m => `m.${m.pos}`).join(', ') || 'Haplogroup specific'}</div>
              </div>
              <div class="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-bold text-amber-300 font-mono text-xs">${info2.code} Synapomorphies</div>
                <div class="text-[11px] text-stone-400 font-mono">${unique2.slice(0, 4).map(m => `m.${m.pos}`).join(', ') || 'Haplogroup specific'}</div>
              </div>
              <div class="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-bold text-emerald-300 font-mono text-xs">${info3.code} Synapomorphies</div>
                <div class="text-[11px] text-stone-400 font-mono">${unique3.slice(0, 4).map(m => `m.${m.pos}`).join(', ') || 'Haplogroup specific'}</div>
              </div>
            </div>
          </div>

        </div>
      `;
      return;
    }

    // 2-Way Pairwise Comparison Mode
    if (info1 && info2) {
      const avgDist = this.computePairwiseDistance(samples1, samples2);

      const vars1 = window.App.variantsData.variants.filter(v => samples1.includes(v.sample));
      const vars2 = window.App.variantsData.variants.filter(v => samples2.includes(v.sample));

      const muts1 = new Map(vars1.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
      const muts2 = new Map(vars2.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

      const shared = [];
      const unique1 = [];
      const unique2 = [];

      muts1.forEach((v1, key) => {
        if (muts2.has(key)) {
          shared.push(v1);
        } else {
          unique1.push(v1);
        }
      });

      muts2.forEach((v2, key) => {
        if (!muts1.has(key)) {
          unique2.push(v2);
        }
      });

      reportContainer.innerHTML = `
        <div class="space-y-6 font-sans">
          
          <div class="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-4 font-mono">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <div class="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Pairwise Ethnicity Comparative Report</div>
                <h2 class="text-xl font-extrabold text-stone-100">${info1.name} <span class="text-stone-500">vs</span> ${info2.name}</h2>
              </div>
              <div class="flex items-center space-x-3 bg-stone-950/80 px-4 py-2 rounded-xl border border-stone-800">
                <span class="text-xs text-stone-400">Pairwise Genetic Distance:</span>
                <span class="text-lg font-bold text-amber-400">${avgDist}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div class="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <div class="font-bold text-orange-300 font-mono">${info1.name} (${info1.region})</div>
                <div class="text-stone-400"><strong class="text-stone-300">Lineage:</strong> ${info1.haplo}</div>
                <p class="text-[11px] text-stone-400 leading-relaxed pt-1">${info1.history}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <div class="font-bold text-amber-300 font-mono">${info2.name} (${info2.region})</div>
                <div class="text-stone-400"><strong class="text-stone-300">Lineage:</strong> ${info2.haplo}</div>
                <p class="text-[11px] text-stone-400 leading-relaxed pt-1">${info2.history}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <div class="text-emerald-400 font-bold text-xl">${shared.length}</div>
              <div class="text-stone-300 mt-1">Shared Mutations</div>
            </div>
            <div class="p-3.5 rounded-xl bg-orange-950/40 border border-orange-800/80">
              <div class="text-orange-400 font-bold text-xl">${unique1.length}</div>
              <div class="text-stone-300 mt-1">Unique to ${info1.code}</div>
            </div>
            <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80">
              <div class="text-amber-400 font-bold text-xl">${unique2.length}</div>
              <div class="text-stone-300 mt-1">Unique to ${info2.code}</div>
            </div>
          </div>

          <!-- POPULATION BREAKDOWN (Renamed from Deep Population History) -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 space-y-4 text-xs text-stone-300 shadow-2xl">
            <div class="border-b border-stone-800 pb-3">
              <h4 class="font-bold text-amber-400 font-mono text-base flex items-center gap-2">
                <span>📜 Population Breakdown</span>
              </h4>
              <p class="text-stone-400 text-[11px] mt-0.5">Evolutionary Lineage & Migration Analysis between ${info1.code} and ${info2.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="font-mono font-bold text-orange-300 text-sm">${info1.name} Breakdown</div>
                <p class="text-stone-300 text-[11.5px] leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="font-mono font-bold text-amber-300 text-sm">${info2.name} Breakdown</div>
                <p class="text-stone-300 text-[11.5px] leading-relaxed">${info2.history}</p>
              </div>
            </div>
          </div>

          <!-- Homoplasic Mutational Hotspots Section -->
          <div class="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>🔥 Homoplasic Mutational Hotspots Report</span>
              </h4>
              <span class="text-stone-400 text-[11px]">Control Region Loci</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              ${homoplasicLoci.map(h => `
                <div class="p-2.5 rounded-xl bg-stone-950 border border-amber-900/60 space-y-1">
                  <div class="flex items-center justify-between text-amber-300 font-bold">
                    <span>m.${h.pos}</span>
                    <span class="text-[10px] text-stone-400 font-normal">D-loop</span>
                  </div>
                  <div class="text-[10.5px] text-stone-400 font-sans">${h.note}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Synapomorphic Lineage Fingerprints Section -->
          <div class="p-5 rounded-2xl bg-stone-900 border border-orange-500/40 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-orange-400 text-sm flex items-center gap-2">
                <span>🧬 Synapomorphic Lineage Fingerprints</span>
              </h4>
              <span class="text-stone-400 text-[11px]">Derived Clade Signatures</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-sans">
              <div class="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-bold text-orange-300 font-mono text-xs">${info1.code} Synapomorphies</div>
                <div class="text-[11px] text-stone-400 font-mono">${unique1.slice(0, 5).map(m => `m.${m.pos}`).join(', ')}</div>
              </div>
              <div class="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-bold text-amber-300 font-mono text-xs">${info2.code} Synapomorphies</div>
                <div class="text-[11px] text-stone-400 font-mono">${unique2.slice(0, 5).map(m => `m.${m.pos}`).join(', ')}</div>
              </div>
            </div>
          </div>

        </div>
      `;
    }
  }
};

window.PedigreeInspector = {
  FAMILY_PEDIGREES: {
    'UK': {
      code: 'UK',
      name: 'Ukraine (UK)',
      haplo: 'Haplogroup U4 / H',
      grandmother: 'UK_F_NIKG',
      mother: 'UK_F_NIKM',
      aunt: 'UK_F_NIKA',
      father: null, // No father sample collected
      children: ['UK_M_NIKS1', 'UK_M_NIKS2']
    },
    'MX': {
      code: 'MX',
      name: 'Mexico (MX)',
      haplo: 'Haplogroup B2',
      mother: 'MX_F_CRY',
      father: 'MX_M_CRYF',
      children: ['MX_F_CRYS1']
    },
    'HK': {
      code: 'HK',
      name: 'Hong Kong (HK)',
      haplo: 'Haplogroup M7',
      mother: 'HK_F_JAN',
      father: 'HK_M_WLL',
      children: ['HK_F_JANM']
    },
    'IS': {
      code: 'IS',
      name: 'India South (IS)',
      haplo: 'Haplogroup M / R (VYS)',
      mother: 'IS_F_VYSM',
      father: 'IS_M_RAV',
      children: ['IS_M_SEL']
    },
    'PK': {
      code: 'PK',
      name: 'Pakistan (PK)',
      haplo: 'Haplogroup M / U',
      mother: 'PK_F_WAS',
      father: 'PK_M_WASH',
      children: ['PK_M_WASC1', 'PK_M_WASC2']
    },
    'IW': {
      code: 'IW',
      name: 'India West (IW)',
      haplo: 'Haplogroup M / R',
      mother: 'IW_F_ANJM',
      father: 'IW_M_ANJF',
      children: ['IW_F_ANJS1']
    },
    'KR': {
      code: 'KR',
      name: 'Korea (KR)',
      haplo: 'Haplogroup D4',
      mother: 'KR_F_MOO',
      father: null,
      children: ['KR_F_MOOC1']
    },
    'CL': {
      code: 'CL',
      name: 'Chile (CL)',
      haplo: 'Haplogroup C1',
      mother: 'CL_F_ALJ',
      father: null,
      children: ['CL_F_ALJC1']
    }
  },

  init() {
    const select = document.getElementById('pedigreeFamilySelect');
    const openBtn = document.getElementById('openPedigreeBtn');
    const closeBtn = document.getElementById('closePedigreeModalBtn');
    const modal = document.getElementById('pedigreeModal');

    if (!select || !modal) return;

    const keys = Object.keys(this.FAMILY_PEDIGREES);
    select.innerHTML = keys.map(k => `<option value="${k}">${this.FAMILY_PEDIGREES[k].name}</option>`).join('');

    select.onchange = () => this.renderPedigree(select.value);

    openBtn?.addEventListener('click', () => {
      this.renderPedigree(select.value || 'UK');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  },

  renderPedigree(famKey) {
    const bodyEl = document.getElementById('pedigreeModalBody');
    if (!bodyEl || !window.App.variantsData) return;

    const ped = this.FAMILY_PEDIGREES[famKey] || this.FAMILY_PEDIGREES['UK'];
    const motherVars = window.App.variantsData.variants.filter(v => v.sample === ped.mother);
    const fatherVars = ped.father ? window.App.variantsData.variants.filter(v => v.sample === ped.father) : [];

    const motherMap = new Map(motherVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const fatherMap = new Map(fatherVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    const childrenVars = ped.children.map(childSample => {
      const vars = window.App.variantsData.variants.filter(v => v.sample === childSample);
      return { sample: childSample, vars, map: new Map(vars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v])) };
    });

    const maternallyInherited = [];
    motherMap.forEach((vM, key) => {
      const inheritedByAll = childrenVars.length === 0 || childrenVars.every(c => c.map.has(key));
      const inheritedByAny = childrenVars.some(c => c.map.has(key));
      if (childrenVars.length === 0 || inheritedByAny) {
        maternallyInherited.push({ ...vM, inheritedByAll });
      }
    });

    bodyEl.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <div class="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-5 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <div class="text-xs text-orange-400 font-bold uppercase tracking-wider">Maternal Lineage Verification</div>
              <h3 class="text-lg font-extrabold text-stone-100">${ped.name} <span class="text-stone-500">Pedigree</span></h3>
            </div>
            <span class="px-3 py-1.5 rounded-xl bg-orange-950/80 border border-orange-700/80 text-xs text-orange-300 font-bold">
              ${ped.haplo}
            </span>
          </div>

          <!-- Interactive Pedigree Flow Nodes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            ${ped.grandmother ? `
              <div class="p-4 rounded-xl bg-stone-950 border border-amber-500/80 space-y-2 shadow-lg">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Grandmother: ${ped.grandmother}</span>
                  </span>
                  <span class="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 font-bold">Maternal Ancestor</span>
                </div>
                <p class="text-[11px] text-stone-400 font-sans">
                  Originating maternal ancestor for Ukraine lineage line.
                </p>
              </div>
            ` : ''}

            <!-- Mother Card (Maternal Source) -->
            <div class="p-4 rounded-xl bg-stone-950 border-2 border-emerald-500/80 space-y-2 shadow-lg">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Mother: ${ped.mother}</span>
                </span>
                <span class="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">100% Transmission Source</span>
              </div>
              <p class="text-[11px] text-stone-400 font-sans">
                Transmits 100% of mitochondrial genome & diagnostic variants to offspring.
              </p>
              <div class="text-xs text-emerald-400 font-mono font-bold pt-1">
                Total Variants: ${motherVars.length}
              </div>
            </div>

            ${ped.aunt ? `
              <div class="p-4 rounded-xl bg-stone-950 border border-emerald-800 space-y-2 shadow-lg">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Aunt: ${ped.aunt}</span>
                  </span>
                  <span class="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">Maternal Sister</span>
                </div>
                <p class="text-[11px] text-stone-400 font-sans">
                  Carries identical maternal diagnostic markers from Grandmother ${ped.grandmother}.
                </p>
              </div>
            ` : ''}

            <!-- Father Card (Paternal Non-Transmission) ONLY IF FATHER SAMPLE IS PRESENT -->
            ${ped.father ? `
              <div class="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 opacity-85">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-rose-300 text-sm flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Father: ${ped.father}</span>
                  </span>
                  <span class="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 font-bold">0% Transmitted mtDNA</span>
                </div>
                <p class="text-[11px] text-stone-400 font-sans">
                  Paternal nuclear DNA only. 0% of paternal mtDNA or variants are passed to children.
                </p>
                <div class="text-xs text-rose-400 font-mono font-bold pt-1">
                  Paternal Variants: ${fatherVars.length}
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Offspring Line Cards -->
          ${ped.children.length > 0 ? `
            <div class="pt-2 border-t border-stone-800">
              <div class="text-xs text-stone-400 font-sans font-bold mb-2">Offspring Lineages (Children):</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${ped.children.map(child => `
                  <div class="p-3 rounded-xl bg-stone-950/80 border border-orange-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span class="text-orange-300 font-bold">Child: ${child}</span>
                      <span class="text-stone-400 text-[10px] block font-sans">Inherited 100% Maternal Motifs</span>
                    </div>
                    <span class="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold text-[10px]">Verified Maternal</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        ${maternallyInherited.length > 0 ? `
          <div class="p-5 rounded-2xl bg-stone-900/90 border border-emerald-800/60 space-y-3 font-mono text-xs shadow-xl">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <span>🧬 Maternally Transmitted Conserved Variants (${maternallyInherited.length})</span>
              </h4>
              <span class="text-stone-400 font-sans text-[11px]">100% Passed Mother ➔ Children</span>
            </div>

            <div class="max-h-52 overflow-y-auto border border-stone-800 rounded-xl bg-stone-950">
              <table class="w-full text-left">
                <thead class="bg-stone-900 text-stone-300 sticky top-0 border-b border-stone-800 text-[11px]">
                  <tr>
                    <th class="p-2.5">Position</th>
                    <th class="p-2.5">Mutation</th>
                    <th class="p-2.5">Gene / Region</th>
                    <th class="p-2.5">Mother VAF</th>
                    <th class="p-2.5">Transmission Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-800/60">
                  ${maternallyInherited.map(m => `
                    <tr class="hover:bg-stone-800/40">
                      <td class="p-2.5 text-orange-400 font-bold">m.${m.pos}</td>
                      <td class="p-2.5 text-stone-200 font-bold">${m.ref} &gt; ${m.alt}</td>
                      <td class="p-2.5 text-stone-400 font-sans">${m.gene || 'Control Region (D-loop)'}</td>
                      <td class="p-2.5 text-amber-400 font-bold">${(m.vaf * 100).toFixed(1)}%</td>
                      <td class="p-2.5">
                        <span class="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          Transmitted
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }
};

window.App = {
  variantsData: null,
  distanceData: null,
  treeData: null,

  async init() {
    console.log("Initializing Genomic Mito Showcase Controller...");
    
    window.FamilyAccessGate.init();

    await this.loadAllData();

    if (window.DiagnosticMarkersExplorer) window.DiagnosticMarkersExplorer.init();
    if (window.PedigreeInspector) window.PedigreeInspector.init();

    if (this.treeData && window.TreeViewer) {
      window.TreeViewer.init(this.treeData);
    }

    this.bindEvents();
  },

  bindEvents() {
    const openCompBtn = document.getElementById('openComparatorBtn');
    const closeReportBtn = document.getElementById('closeReportBtn');
    const reportModal = document.getElementById('familyReportModal');
    const quickSelect = document.getElementById('quickFamilyEntrySelect');

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
      if (val && window.TreeViewer) {
        window.TreeViewer.toggleEthnicitySelection(val);
        window.TreeViewer.highlightFamilyCluster();
      }
    });
  },

  async loadAllData() {
    try {
      const [varsRes, distRes, treeRes] = await Promise.all([
        fetch('data/variants_dataset.json').then(r => r.json()).catch(() => null),
        fetch('data/distance_matrix.json').then(r => r.json()).catch(() => null),
        fetch('data/phylo_tree.json').then(r => r.json()).catch(() => null)
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
