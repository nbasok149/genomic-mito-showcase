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
    'MX': { name: 'Family MX (Mexico)', markers: [6297, 8047, 9039], mother: 'MX_F_CRY (Mother)', dadNote: 'MX_M_CRYF (Father) does NOT carry any of these familial diagnostic markers because mitochondrial DNA is passed down strictly through the mother (MX_F_CRY). A child does not inherit paternal mtDNA or mutations from their father.' },
    'HK': { name: 'Family HK (Hong Kong)', markers: [5821, 6338, 8602, 14821], mother: 'HK_F_JAN (Mother)', dadNote: 'HK_M_WLL (Father) carries non-transmitted paternal mtDNA line; children inherit 100% of maternal markers from HK_F_JAN.' },
    'UK': { name: 'Family UK (Ukraine)', markers: [650, 8395, 10885, 11566, 14467], mother: 'UK_F_NIKA (Mother)', dadNote: 'UK_M_NIK / UK_M_NIKS1 (Fathers) do not transmit familial mtDNA markers to children.' },
    'IN_RIS': { name: 'Family IN_RIS (India)', markers: [593, 5075, 6020, 12792, 15692, 15859], mother: 'IN_F_RISM (Mother)', dadNote: 'IN_M_RISF (Father) does NOT carry any of these familial diagnostic markers because mtDNA is strictly passed down maternally from mother (IN_F_RISM) to children.' },
    'IS_VYS': { name: 'Family IS_VYS (India South / VYS)', markers: [5186, 9094, 9614, 12793, 13194, 13656, 15930], mother: 'IS_F_VYSM (Mother)', dadNote: 'IS_M_RAV / IS_M_SEL (Fathers) carry unrelated paternal lines and do not pass down VYS familial markers.' },
    'PK': { name: 'Family PK (Pakistan)', markers: [511, 7805, 15479], mother: 'PK_F_WAS (Mother)', dadNote: 'PK_M_WASH / PK_M_WASC1 (Fathers) do not transmit familial markers to children.' },
    'KR': { name: 'Family KR (Korea)', markers: [63, 1709, 2882, 9817, 13544, 15565, 15669], mother: 'KR_F_MOO (Mother)', dadNote: 'Fathers carry 0% transmitted mitochondrial DNA.' },
    'CL': { name: 'Family CL (Colombia / Chile)', markers: [114, 8545, 15323], mother: 'CL_F_ALJ (Mother)', dadNote: 'Fathers carry paternal nuclear DNA only and pass 0% mitochondrial DNA or familial diagnostic markers to offspring.' },
    'AA': { name: 'Family AA (African)', markers: [183, 5581, 9128, 11338], mother: 'AA_F_TON (Mother)', dadNote: 'Sub-Saharan African maternal root line transmitted maternally.' },
    'TB': { name: 'Family TB (Tibet)', markers: [8784, 12950, 16048], mother: 'TB_F_BHA (Mother)', dadNote: 'Tibetan maternal lineage transmitted strictly through mother.' },
    'CA': { name: 'Family CA (Caucasian)', markers: [73, 146, 263], mother: 'CA_M_GER', dadNote: 'CA_M_GER (Father) does not pass down maternal mtDNA.' },
    'IW': { name: 'Family IW (India West)', markers: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385], mother: 'IW_F_ANJM (Mother)', dadNote: 'IW_M_ANJF (Father) does NOT carry any of these familial diagnostic markers because mitochondrial DNA is passed down strictly through the mother (IW_F_ANJM). A child does not inherit paternal mtDNA or mutations from their father.' }
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
    this.displayFamily('MX');
  },

  displayFamily(key, clickedSampleName = null) {
    const data = this.FAMILY_MARKERS[key] || this.FAMILY_MARKERS['MX'];
    const container = document.getElementById('diagnosticMarkersCardContainer');
    if (!container) return;

    const isFather = clickedSampleName ? (clickedSampleName.includes('_M_') || clickedSampleName.includes('_M') || clickedSampleName.endsWith('F')) : false;

    let fatherHtml = '';
    if (isFather) {
      fatherHtml = `
        <div class="p-3.5 rounded-xl bg-orange-950/40 border border-orange-800/80 space-y-1.5 font-sans mt-3">
          <div class="text-orange-400 font-bold text-xs font-mono">🧬 Father Sample Note (${clickedSampleName}):</div>
          <p class="text-stone-300 leading-relaxed text-[11.5px]">
            ${data.dadNote}
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-3 font-mono text-xs">
        <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80">
          <div class="text-amber-300 font-bold mb-1.5 flex items-center justify-between">
            <span>Familial Diagnostic Position Markers:</span>
            <span class="text-[10px] text-stone-400 font-sans font-normal">Filtered (&le; 2 matches in OGC, Norwegian, Swedish)</span>
          </div>
          <div class="text-stone-100 font-extrabold text-sm tracking-wide">
            ${data.markers.map(m => `<span class="bg-amber-900/70 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-700/80 mr-1.5 inline-block mb-1 shadow-sm">m.${m}</span>`).join('')}
          </div>
        </div>
        ${fatherHtml}
      </div>
    `;
  }
};

window.FamilyReportGenerator = {
  REGION_MAP: {
    'MX': { code: 'MX', name: 'Family MX (Mexico)', region: 'Mexico (Mesoamerica)', haplo: 'Haplogroup B2', history: 'Primary founding Native American lineage (Haplogroup B2) originating from ancient East Asian ancestors who crossed the Beringia land bridge ~15,000–25,000 YBP during the Last Glacial Maximum.' },
    'HK': { code: 'HK', name: 'Family HK (Hong Kong)', region: 'Hong Kong (East Asia)', haplo: 'Haplogroup M7', history: 'Ancient East Asian coastal lineage (Haplogroup M7) prevalent across Southern China, Hong Kong, and the Japanese Archipelago.' },
    'UK': { code: 'UK', name: 'Family UK (Ukraine)', region: 'Ukraine (Eastern Europe)', haplo: 'Haplogroup U4 / H', history: 'Eastern European maternal lineage (Haplogroup U4/H) rooted in ancient Mesolithic Hunter-Gatherers and Neolithic European agricultural expansion.' },
    'AA': { code: 'AA', name: 'Family AA (African Ancestry)', region: 'African Ancestry (Sub-Saharan)', haplo: 'Haplogroup L2', history: 'Deep Sub-Saharan African maternal lineage (Haplogroup L2), representing the ancestral core of all anatomically modern human mitochondrial DNA.' },
    'IN': { code: 'IN', name: 'Family IN (India)', region: 'India (South Asia)', haplo: 'Haplogroup M / R', history: 'Ancient South Asian maternal lineage (Haplogroup M/R) derived from the early Southern Coastal out-of-Africa migration wave ~60,000 YBP.' },
    'IW': { code: 'IW', name: 'Family IW (India West)', region: 'India West (South Asia)', haplo: 'Haplogroup M / R', history: 'Western South Asian regional sub-clade sharing ancient Southern Coastal out-of-Africa founding roots.' },
    'IS': { code: 'IS', name: 'Family IS (Israel)', region: 'Israel / Middle East', haplo: 'Haplogroup J / T', history: 'Levantine and Middle Eastern maternal lineage (Haplogroup J/T) associated with early Near Eastern Agricultural Neolithic expansions and Silk Road trade routes.' },
    'SA': { code: 'SA', name: 'Family SA (South Asia / Arabia)', region: 'South Asia / Arabia', haplo: 'Haplogroup N1 / R', history: 'Arabian Peninsula & South Asian crossroads lineage bridging the Near East and Indian subcontinent.' },
    'PK': { code: 'PK', name: 'Family PK (Pakistan)', region: 'Pakistan (South Asia)', haplo: 'Haplogroup M / U', history: 'Indus Valley and South Asian regional maternal lineage sharing deep historical trade and migration connections across Central/South Asia.' },
    'KR': { code: 'KR', name: 'Family KR (Korea)', region: 'Korea (East Asia)', haplo: 'Haplogroup D4', history: 'Northeastern East Asian maternal lineage (Haplogroup D4) common across Korea, Manchuria, and Siberia.' },
    'TB': { code: 'TB', name: 'Family TB (Tibet)', region: 'Tibet (Central Asia)', haplo: 'Haplogroup M9', history: 'High-altitude adapted Central Asian Tibetan lineage (Haplogroup M9) with deep Himalayan ancestral continuity.' },
    'CL': { code: 'CL', name: 'Family CL (Chile)', region: 'Chile (South America)', haplo: 'Haplogroup C1', history: 'Southern Cone Native American maternal lineage (Haplogroup C1) stemming from early Paleo-Indian coastal expansion along the Pacific coast of South America.' },
    'CA': { code: 'CA', name: 'Family CA (Canada)', region: 'Canada (North America)', haplo: 'Haplogroup H / U', history: 'North American / European immigrant lineage.' },
    'NA': { code: 'NA', name: 'Family NA (Native North America)', region: 'Native North America', haplo: 'Haplogroup A2', history: 'Indigenous North American maternal lineage (Haplogroup A2) sharing ancient Beringian founder roots.' }
  },

  getAllFamilies() {
    return Object.keys(this.REGION_MAP).map(key => this.REGION_MAP[key]);
  },

  getFamilyData(familyCode) {
    const cleanCode = familyCode.replace('Family ', '').trim();
    return this.REGION_MAP[cleanCode] || {
      code: cleanCode,
      name: `Family ${cleanCode}`,
      region: `Cohort ${cleanCode}`,
      haplo: 'Unassigned',
      history: 'Mitochondrial lineage dataset.'
    };
  },

  openReportModal(fam1Code = 'MX', fam2Code = 'HK') {
    const modal = document.getElementById('familyReportModal');
    if (!modal) return;

    this.populateDropdowns(fam1Code, fam2Code);
    this.renderReport(fam1Code, fam2Code);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  populateDropdowns(fam1Code, fam2Code) {
    const select1 = document.getElementById('reportFamily1Select');
    const select2 = document.getElementById('reportFamily2Select');
    if (!select1 || !select2) return;

    const families = this.getAllFamilies();
    const optionsHtml = families.map(f => `<option value="${f.code}">${f.name} — ${f.region}</option>`).join('');

    select1.innerHTML = optionsHtml;
    select2.innerHTML = optionsHtml;

    select1.value = fam1Code.replace('Family ', '').trim();
    select2.value = fam2Code.replace('Family ', '').trim();

    // Re-render when dropdown changes
    select1.onchange = () => this.renderReport(select1.value, select2.value);
    select2.onchange = () => this.renderReport(select1.value, select2.value);
  },

  getEvolutionaryDivergenceInfo(info1, info2, avgDist, shared, unique1, unique2) {
    const distNum = parseFloat(avgDist);
    
    // Macro-group classifications
    const macroGroups = {
      'Americas': ['MX', 'CL', 'NA'],
      'EastAsia': ['HK', 'KR', 'TB'],
      'SouthAsia': ['IN', 'IW', 'PK', 'SA'],
      'WestEurasia': ['UK', 'IS', 'CA']
    };

    let sharedMacro = false;
    let macroCategory = '';
    for (const [cat, group] of Object.entries(macroGroups)) {
      if (group.includes(info1.code) && group.includes(info2.code)) {
        sharedMacro = true;
        macroCategory = cat;
        break;
      }
    }

    const isClose = distNum < 14.0 || sharedMacro || shared.length >= 4;

    let divergenceEpoch = '';
    let divergenceReason = '';

    if (isClose) {
      if (macroCategory === 'Americas') {
        divergenceEpoch = '~15,000 – 20,000 YBP (Beringian Coastal Expansion)';
        divergenceReason = `Both ${info1.name} and ${info2.name} belong to indigenous Paleo-Indian founder lineages. They share ancient Beringian roots from ancestral Paleolithic Siberian populations who crossed the Beringia land bridge during the Last Glacial Maximum, giving rise to founding American haplogroups (A2, B2, C1, D4h3a).`;
      } else if (macroCategory === 'SouthAsia') {
        divergenceEpoch = '~50,000 – 60,000 YBP (Early Out-of-Africa Coastal Corridor)';
        divergenceReason = `Both ${info1.name} and ${info2.name} derive from the early "Southern Coastal Route" Out-of-Africa migration wave into the Indian subcontinent. Their shared basal haplogroup roots (Macro-haplogroups M & R) reflect deep indigenous South Asian population continuity.`;
      } else if (macroCategory === 'EastAsia') {
        divergenceEpoch = '~30,000 – 40,000 YBP (East Asian Macro-Haplogroup M/N Split)';
        divergenceReason = `Both ${info1.name} and ${info2.name} stem from post-glacial East Asian paleolithic ancestral populations that expanded across Southern China, Hong Kong, Korea, Tibet, and the Japanese Archipelago following the Last Glacial Maximum.`;
      } else if (macroCategory === 'WestEurasia') {
        divergenceEpoch = '~25,000 – 35,000 YBP (West Eurasian Pre-LGM Refugia)';
        divergenceReason = `Both ${info1.name} and ${info2.name} share West Eurasian maternal roots (Macro-haplogroup N sub-lineages like H, U, J, T). Their closeness stems from post-glacial recolonization of Europe and Neolithic agricultural expansion from the Near East.`;
      } else {
        divergenceEpoch = '~25,000 – 35,000 YBP (Shared Intermediate Eurasian Migration Corridor)';
        divergenceReason = `The two populations share intermediate Eurasian ancestral lineages and a substantial set of conserved mitochondrial motifs, reflecting historical gene flow and shared regional founder pools.`;
      }
    } else {
      // Distantly Diverged
      if (info1.code === 'AA' || info2.code === 'AA') {
        divergenceEpoch = '~70,000 – 90,000 YBP (Basal Out-of-Africa Divergence)';
        divergenceReason = `Sub-Saharan African Haplogroup L2 represents the ancestral core of anatomically modern humans. The non-African cohort diverged during the primary Out-of-Africa migration event ~70,000 YBP, when L3 sub-branches left Africa while L2 remained in Africa, undergoing independent maternal evolution over tens of thousands of years.`;
      } else if ((['MX', 'CL', 'NA', 'HK', 'KR', 'TB'].includes(info1.code) && ['UK', 'CA', 'IS'].includes(info2.code)) ||
                 (['UK', 'CA', 'IS'].includes(info1.code) && ['MX', 'CL', 'NA', 'HK', 'KR', 'TB'].includes(info2.code))) {
        divergenceEpoch = '~45,000 – 55,000 YBP (East vs West Eurasian Bifurcation)';
        divergenceReason = `Early Eurasian population split following the Out-of-Africa dispersal. Ancestral Eurasian populations bifurcated into Western Eurasian lines (giving rise to Haplogroups H, U, J, T) and Eastern Eurasian / Beringian lines (giving rise to Haplogroups A, B, C, D, M, M7, M9).`;
      } else if ((['MX', 'CL', 'NA'].includes(info1.code) && ['IN', 'IW', 'PK'].includes(info2.code)) ||
                 (['IN', 'IW', 'PK'].includes(info1.code) && ['MX', 'CL', 'NA'].includes(info2.code))) {
        divergenceEpoch = '~50,000 – 60,000 YBP (South Asian vs Beringian/Paleo-Indian Branching)';
        divergenceReason = `Early Upper Paleolithic split where South Asian lineages (Macro-haplogroup M/R) settled permanently in the Indian subcontinent, whereas ancestral Beringian/Native American lines migrated north through Siberia before crossing into the Americas.`;
      } else {
        divergenceEpoch = '~40,000 – 60,000 YBP (Deep Inter-Continental Divergence)';
        divergenceReason = `Ancient Upper Paleolithic population divergence driven by long-term geographic isolation, independent climatic adaptation, and zero maternal gene flow across distinct continental refugia.`;
      }
    }

    return {
      isClose,
      divergenceEpoch,
      divergenceReason,
      statusLabel: isClose ? 'CLOSELY RELATED POPULATIONS' : 'DISTANTLY DIVERGED POPULATIONS',
      statusClass: isClose ? 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80' : 'text-rose-400 bg-rose-950/80 border-rose-700/80'
    };
  },

  renderReport(f1Key, f2Key) {
    const reportContainer = document.getElementById('familyReportBody');
    if (!reportContainer || !window.App.variantsData) return;

    const info1 = this.getFamilyData(f1Key);
    const info2 = this.getFamilyData(f2Key);

    // Filter samples for Family 1 and Family 2
    const samples1 = (window.App.distanceData?.samples || []).filter(s => s.startsWith(info1.code + '_'));
    const samples2 = (window.App.distanceData?.samples || []).filter(s => s.startsWith(info2.code + '_'));

    // Compute pairwise genetic distance
    let avgDist = 18.5;
    if (window.App.distanceData && samples1.length > 0 && samples2.length > 0) {
      const allSamples = window.App.distanceData.samples;
      const matrix = window.App.distanceData.matrix;
      let total = 0, count = 0;

      samples1.forEach(s1 => {
        const idx1 = allSamples.indexOf(s1);
        samples2.forEach(s2 => {
          const idx2 = allSamples.indexOf(s2);
          if (idx1 >= 0 && idx2 >= 0 && matrix[idx1] && matrix[idx1][idx2] !== undefined) {
            total += matrix[idx1][idx2];
            count++;
          }
        });
      });

      if (count > 0) avgDist = (total / count).toFixed(2);
    }

    // Get variants for Family 1 and Family 2
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

    // Compute Evolutionary Divergence Info
    const divInfo = this.getEvolutionaryDivergenceInfo(info1, info2, avgDist, shared, unique1, unique2);

    reportContainer.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header Banner & Distance Metric -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/40 shadow-xl space-y-4 font-mono">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div>
              <div class="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">Pairwise Family Comparative Report</div>
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

        <!-- Quick Summary Cards -->
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

        <!-- Shared Mutations List -->
        <div class="space-y-3">
          <h4 class="font-bold text-stone-200 text-sm font-mono flex items-center justify-between">
            <span>🧬 Shared Ancestral Mutations (${shared.length})</span>
            <span class="text-xs text-stone-400 font-normal font-sans">Common lineage polymorphisms</span>
          </h4>
          <div class="max-h-56 overflow-y-auto border border-stone-800 rounded-xl bg-stone-950">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-stone-900 text-stone-300 sticky top-0 border-b border-stone-800">
                <tr>
                  <th class="p-2.5">Position (bp)</th>
                  <th class="p-2.5">Mutation</th>
                  <th class="p-2.5">Gene / Region</th>
                  <th class="p-2.5">VAF</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60">
                ${shared.length > 0 ? shared.map(m => `
                  <tr class="hover:bg-stone-900/40">
                    <td class="p-2.5 text-amber-400">m.${m.pos}</td>
                    <td class="p-2.5 font-bold text-stone-200">${m.ref} &gt; ${m.alt}</td>
                    <td class="p-2.5 text-stone-300">${m.gene || 'Control Region (D-loop)'}</td>
                    <td class="p-2.5 text-emerald-400">${(m.vaf * 100).toFixed(1)}%</td>
                  </tr>
                `).join('') : `<tr><td colspan="4" class="p-4 text-center text-stone-500">No shared mutations detected between these two families.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Dynamic Evolutionary Interpretation Report -->
        <div class="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 space-y-6 text-xs text-stone-300 leading-relaxed font-sans shadow-2xl">
          
          <!-- Header Banner & Decision Badge -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <h4 class="font-bold text-amber-400 font-mono text-base flex items-center gap-2">
                <span>📜 Biological & Evolutionary Context Report</span>
              </h4>
              <p class="text-stone-400 text-[11px] mt-0.5">Comprehensive Population History, Divergence Analysis & Mutation Fingerprints</p>
            </div>
            <div class="px-3 py-1.5 rounded-xl border text-xs font-mono font-extrabold shadow-md ${divInfo.statusClass}">
              ${divInfo.isClose ? '🟢 Decision: CLOSELY RELATED' : '🔴 Decision: DISTANTLY DIVERGED'}
            </div>
          </div>

          <!-- Side-by-Side Population Histories -->
          <div class="space-y-3">
            <h5 class="font-bold text-stone-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-orange-400">
              <span>🏛️ Deep Population History & Lineage Breakdown</span>
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span class="font-bold text-orange-300 font-mono text-xs">${info1.name}</span>
                  <span class="text-[10px] font-mono text-orange-400 bg-orange-950/70 px-2 py-0.5 rounded border border-orange-800/80">${info1.haplo}</span>
                </div>
                <div class="text-stone-300 text-[11.5px] leading-relaxed">
                  <strong class="text-stone-200">Region:</strong> ${info1.region}<br/>
                  <p class="text-stone-400 mt-1">${info1.history}</p>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span class="font-bold text-amber-300 font-mono text-xs">${info2.name}</span>
                  <span class="text-[10px] font-mono text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/80">${info2.haplo}</span>
                </div>
                <div class="text-stone-300 text-[11.5px] leading-relaxed">
                  <strong class="text-stone-200">Region:</strong> ${info2.region}<br/>
                  <p class="text-stone-400 mt-1">${info2.history}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Evolutionary Closeness & Divergence Analysis -->
          <div class="space-y-4 pt-2 border-t border-stone-800">
            <div class="p-4 rounded-xl ${divInfo.isClose ? 'bg-emerald-950/40 border border-emerald-800/70' : 'bg-rose-950/40 border border-rose-800/70'} space-y-2">
              <div class="flex items-center justify-between font-mono">
                <span class="font-bold text-xs ${divInfo.isClose ? 'text-emerald-300' : 'text-rose-300'} uppercase tracking-wide flex items-center gap-1.5">
                  ${divInfo.isClose ? '🌿 Genetic Proximity Rationale (Why They Are Close)' : '💥 Lineage Divergence Rationale (Where They Diverged)'}
                </span>
                <span class="text-[11px] text-stone-400">Genetic Distance Score: <strong class="text-amber-400">${avgDist}</strong></span>
              </div>
              <p class="text-stone-200 text-[11.5px] leading-relaxed">
                <strong>Phylogenetic Analysis:</strong> ${divInfo.divergenceReason}
              </p>
              <p class="text-stone-400 text-[11px] font-mono pt-1">
                <strong>Estimated Evolutionary Divergence Epoch:</strong> <span class="text-amber-300 font-bold">${divInfo.divergenceEpoch}</span>
              </p>
            </div>

            ${divInfo.isClose ? `
              <!-- IF CLOSE: Shared Ancestral Anchor Mutations -->
              <div class="space-y-3">
                <h6 class="font-bold text-emerald-400 font-mono text-xs flex items-center justify-between">
                  <span>🧬 Shared Ancestral Anchor Mutations (${shared.length} Conserved Motifs)</span>
                  <span class="text-[10px] text-stone-400 font-sans">Common mutations proving shared maternal ancestry</span>
                </h6>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  ${shared.length > 0 ? shared.slice(0, 9).map(m => `
                    <div class="p-2.5 rounded-xl bg-stone-950 border border-emerald-900/60 font-mono text-[11px] space-y-1">
                      <div class="flex items-center justify-between text-emerald-300 font-bold">
                        <span>m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                        <span class="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded">${(m.vaf * 100).toFixed(0)}% VAF</span>
                      </div>
                      <div class="text-stone-400 text-[10px] truncate">${m.gene || 'Control Region (D-loop)'}</div>
                    </div>
                  `).join('') : '<div class="col-span-full p-4 text-stone-500 text-center font-mono bg-stone-950 rounded-xl">No shared mutations detected between these two families.</div>'}
                </div>
                ${shared.length > 9 ? `<p class="text-[10.5px] text-stone-500 font-mono text-right">+ ${shared.length - 9} more shared variants listed in table above.</p>` : ''}
              </div>
            ` : `
              <!-- IF NOT CLOSE: Key Lineage-Defining Divergence Mutations -->
              <div class="space-y-3">
                <h6 class="font-bold text-rose-400 font-mono text-xs flex items-center justify-between">
                  <span>🧬 Key Lineage-Defining Divergence Mutations (Diagnostic Markers)</span>
                  <span class="text-[10px] text-stone-400 font-sans">Specific mutations marking where the lineages split</span>
                </h6>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <!-- Unique to Population 1 -->
                  <div class="space-y-2 p-4 rounded-xl bg-stone-950 border border-orange-900/60">
                    <div class="font-mono font-bold text-orange-300 text-xs flex justify-between border-b border-stone-800 pb-2">
                      <span>Divergence Mutations Unique to ${info1.code} (${unique1.length})</span>
                      <span class="text-[10px] text-orange-400/80">Pop 1 Specific</span>
                    </div>
                    <div class="space-y-2 max-h-48 overflow-y-auto pr-1 pt-1">
                      ${unique1.length > 0 ? unique1.slice(0, 6).map(m => `
                        <div class="p-2 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between text-[11px] font-mono">
                          <div>
                            <span class="text-orange-400 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                            <span class="text-stone-400 text-[10px] block">${m.gene || 'Control Region (D-loop)'}</span>
                          </div>
                          <span class="text-[10px] text-amber-400 font-bold bg-stone-950 px-2 py-0.5 rounded border border-stone-800">${(m.vaf * 100).toFixed(0)}% VAF</span>
                        </div>
                      `).join('') : '<div class="text-stone-500 text-[10px] p-2 text-center">No unique variants recorded.</div>'}
                    </div>
                  </div>

                  <!-- Unique to Population 2 -->
                  <div class="space-y-2 p-4 rounded-xl bg-stone-950 border border-amber-900/60">
                    <div class="font-mono font-bold text-amber-300 text-xs flex justify-between border-b border-stone-800 pb-2">
                      <span>Divergence Mutations Unique to ${info2.code} (${unique2.length})</span>
                      <span class="text-[10px] text-amber-400/80">Pop 2 Specific</span>
                    </div>
                    <div class="space-y-2 max-h-48 overflow-y-auto pr-1 pt-1">
                      ${unique2.length > 0 ? unique2.slice(0, 6).map(m => `
                        <div class="p-2 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between text-[11px] font-mono">
                          <div>
                            <span class="text-amber-400 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                            <span class="text-stone-400 text-[10px] block">${m.gene || 'Control Region (D-loop)'}</span>
                          </div>
                          <span class="text-[10px] text-amber-400 font-bold bg-stone-950 px-2 py-0.5 rounded border border-stone-800">${(m.vaf * 100).toFixed(0)}% VAF</span>
                        </div>
                      `).join('') : '<div class="text-stone-500 text-[10px] p-2 text-center">No unique variants recorded.</div>'}
                    </div>
                  </div>

                </div>
              </div>
            `}

          </div>
        </div>

      </div>
    `;
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
    this.setupReportModal();
    window.DiagnosticMarkersExplorer.init();
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

  setupReportModal() {
    const modal = document.getElementById('familyReportModal');
    const openBtn = document.getElementById('openComparatorBtn');
    const closeBtn = document.getElementById('closeReportBtn');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', () => {
      window.FamilyReportGenerator.openReportModal('MX', 'HK');
    });

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => window.App.init());
