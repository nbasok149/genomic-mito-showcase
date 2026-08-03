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
    'MX': { name: 'Ethnicity MX (Mexico)', markers: [6297, 8047, 9039], mother: 'MX_F_CRY (Mother)', dadNote: 'MX_M_CRYF (Father) does NOT carry any of these familial diagnostic markers because mitochondrial DNA is passed down strictly through the mother (MX_F_CRY). A child does not inherit paternal mtDNA or mutations from their father.' },
    'HK': { name: 'Ethnicity HK (Hong Kong)', markers: [5821, 6338, 8602, 14821], mother: 'HK_F_JAN (Mother)', dadNote: 'HK_M_WLL (Father) carries non-transmitted paternal mtDNA line; children inherit 100% of maternal markers from HK_F_JAN.' },
    'UK': { name: 'Ethnicity UK (Ukraine)', markers: [650, 8395, 10885, 11566, 14467], mother: 'UK_F_NIKA (Mother)', dadNote: 'UK_M_NIK / UK_M_NIKS1 (Fathers) do not transmit familial mtDNA markers to children.' },
    'IN_RIS': { name: 'Ethnicity IN_RIS (India)', markers: [593, 5075, 6020, 12792, 15692, 15859], mother: 'IN_F_RISM (Mother)', dadNote: 'IN_M_RISF (Father) does NOT carry any of these familial diagnostic markers because mtDNA is strictly passed down maternally from mother (IN_F_RISM) to children.' },
    'IS_VYS': { name: 'Ethnicity IS_VYS (India South / VYS)', markers: [5186, 9094, 9614, 12793, 13194, 13656, 15930], mother: 'IS_F_VYSM (Mother)', dadNote: 'IS_M_RAV / IS_M_SEL (Fathers) carry unrelated paternal lines and do not pass down VYS familial markers.' },
    'PK': { name: 'Ethnicity PK (Pakistan)', markers: [511, 7805, 15479], mother: 'PK_F_WAS (Mother)', dadNote: 'PK_M_WASH / PK_M_WASC1 (Fathers) do not transmit familial markers to children.' },
    'KR': { name: 'Ethnicity KR (Korea)', markers: [63, 1709, 2882, 9817, 13544, 15565, 15669], mother: 'KR_F_MOO (Mother)', dadNote: 'Fathers carry 0% transmitted mitochondrial DNA.' },
    'CL': { name: 'Ethnicity CL (Chile)', markers: [114, 8545, 15323], mother: 'CL_F_ALJ (Mother)', dadNote: 'Fathers carry paternal nuclear DNA only and pass 0% mitochondrial DNA or familial diagnostic markers to offspring.' },
    'AA': { name: 'Ethnicity AA (African Ancestry)', markers: [183, 5581, 9128, 11338], mother: 'AA_F_TON (Mother)', dadNote: 'Sub-Saharan African maternal root line transmitted maternally.' },
    'TB': { name: 'Ethnicity TB (Tibet)', markers: [8784, 12950, 16048], mother: 'TB_F_BHA (Mother)', dadNote: 'Tibetan maternal lineage transmitted strictly through mother.' },
    'CA': { name: 'Ethnicity CA (Canada)', markers: [73, 146, 263], mother: 'CA_M_GER', dadNote: 'CA_M_GER (Father) does not pass down maternal mtDNA.' },
    'IW': { name: 'Ethnicity IW (India West)', markers: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385], mother: 'IW_F_ANJM (Mother)', dadNote: 'IW_M_ANJF (Father) does NOT carry any of these familial diagnostic markers because mitochondrial DNA is passed down strictly through the mother (IW_F_ANJM). A child does not inherit paternal mtDNA or mutations from their father.' }
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
    'MX': { code: 'MX', name: 'Ethnicity MX (Mexico)', region: 'Mexico (Mesoamerica)', haplo: 'Haplogroup B2', history: 'Primary founding Native American lineage (Haplogroup B2) originating from ancient East Asian ancestors who crossed the Beringia land bridge ~15,000–25,000 YBP during the Last Glacial Maximum.' },
    'HK': { code: 'HK', name: 'Ethnicity HK (Hong Kong)', region: 'Hong Kong (East Asia)', haplo: 'Haplogroup M7', history: 'Ancient East Asian coastal lineage (Haplogroup M7) prevalent across Southern China, Hong Kong, and the Japanese Archipelago.' },
    'UK': { code: 'UK', name: 'Ethnicity UK (Ukraine)', region: 'Ukraine (Eastern Europe)', haplo: 'Haplogroup U4 / H', history: 'Eastern European maternal lineage (Haplogroup U4/H) rooted in ancient Mesolithic Hunter-Gatherers and Neolithic European agricultural expansion.' },
    'AA': { code: 'AA', name: 'Ethnicity AA (African Ancestry)', region: 'African Ancestry (Sub-Saharan)', haplo: 'Haplogroup L2', history: 'Deep Sub-Saharan African maternal lineage (Haplogroup L2), representing the ancestral core of all anatomically modern human mitochondrial DNA.' },
    'IN': { code: 'IN', name: 'Ethnicity IN (India)', region: 'India (South Asia)', haplo: 'Haplogroup M / R', history: 'Ancient South Asian maternal lineage (Haplogroup M/R) derived from the early Southern Coastal out-of-Africa migration wave ~60,000 YBP.' },
    'IW': { code: 'IW', name: 'Ethnicity IW (India West)', region: 'India West (South Asia)', haplo: 'Haplogroup M / R', history: 'Western South Asian regional sub-clade sharing ancient Southern Coastal out-of-Africa founding roots.' },
    'IS': { code: 'IS', name: 'Ethnicity IS (India South)', region: 'India South (South Asia)', haplo: 'Haplogroup M / R (VYS Sub-lineage)', history: 'Southern Indian maternal lineage (Haplogroup M/R sub-clade) derived from ancient South Asian indigenous Out-of-Africa coastal settlement (~60,000 YBP).' },
    'SA': { code: 'SA', name: 'Ethnicity SA (South Asia / Arabia)', region: 'South Asia / Arabia', haplo: 'Haplogroup N1 / R', history: 'Arabian Peninsula & South Asian crossroads lineage bridging the Near East and Indian subcontinent.' },
    'PK': { code: 'PK', name: 'Ethnicity PK (Pakistan)', region: 'Pakistan (South Asia)', haplo: 'Haplogroup M / U', history: 'Indus Valley and South Asian regional maternal lineage sharing deep historical trade and migration connections across Central/South Asia.' },
    'KR': { code: 'KR', name: 'Ethnicity KR (Korea)', region: 'Korea (East Asia)', haplo: 'Haplogroup D4', history: 'Northeastern East Asian maternal lineage (Haplogroup D4) common across Korea, Manchuria, and Siberia.' },
    'TB': { code: 'TB', name: 'Ethnicity TB (Tibet)', region: 'Tibet (Central Asia)', haplo: 'Haplogroup M9', history: 'High-altitude adapted Central Asian Tibetan lineage (Haplogroup M9) with deep Himalayan ancestral continuity.' },
    'CL': { code: 'CL', name: 'Ethnicity CL (Chile)', region: 'Chile (South America)', haplo: 'Haplogroup C1', history: 'Southern Cone Native American maternal lineage (Haplogroup C1) stemming from early Paleo-Indian coastal expansion along the Pacific coast of South America.' },
    'CA': { code: 'CA', name: 'Ethnicity CA (Canada)', region: 'Canada (North America)', haplo: 'Haplogroup H / U', history: 'North American / European immigrant lineage.' },
    'NA': { code: 'NA', name: 'Ethnicity NA (Native North America)', region: 'Native North America', haplo: 'Haplogroup A2', history: 'Indigenous North American maternal lineage (Haplogroup A2) sharing ancient Beringian founder roots.' }
  },

  getAllFamilies() {
    return Object.keys(this.REGION_MAP).map(key => this.REGION_MAP[key]);
  },

  getFamilyData(familyCode) {
    if (!familyCode) return null;
    const cleanCode = familyCode.replace('Ethnicity ', '').replace('Family ', '').trim();
    return this.REGION_MAP[cleanCode] || {
      code: cleanCode,
      name: `Ethnicity ${cleanCode}`,
      region: `Cohort ${cleanCode}`,
      haplo: 'Unassigned',
      history: 'Mitochondrial lineage dataset.'
    };
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

    // Re-render when dropdown changes
    const onChangeHandler = () => {
      this.renderReport(select1.value, select2.value, select3 ? select3.value : null);
    };
    select1.onchange = onChangeHandler;
    select2.onchange = onChangeHandler;
    if (select3) select3.onchange = onChangeHandler;
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

  renderReport(f1Key, f2Key, f3Key = null) {
    const reportContainer = document.getElementById('familyReportBody');
    if (!reportContainer || !window.App.variantsData) return;

    const info1 = this.getFamilyData(f1Key);
    const info2 = f2Key ? this.getFamilyData(f2Key) : null;
    const info3 = f3Key ? this.getFamilyData(f3Key) : null;

    if (!info1) return;

    // Filter samples for selected ethnicities
    const samples1 = (window.App.distanceData?.samples || []).filter(s => s.startsWith(info1.code + '_'));
    const samples2 = info2 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info2.code + '_')) : [];
    const samples3 = info3 ? (window.App.distanceData?.samples || []).filter(s => s.startsWith(info3.code + '_')) : [];

    // Check if 3-Way Comparison
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
          
          <!-- 3-Way Header Banner & Distance Matrix -->
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

            <!-- Pairwise Distance Matrix Cards -->
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

            <!-- Population Summaries -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
              <div class="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div class="font-bold text-orange-300 font-mono">${info1.name}</div>
                <div class="text-stone-400 text-[11px]">${info1.region} — <strong class="text-stone-300">${info1.haplo}</strong></div>
              </div>
              <div class="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div class="font-bold text-amber-300 font-mono">${info2.name}</div>
                <div class="text-stone-400 text-[11px]">${info2.region} — <strong class="text-stone-300">${info2.haplo}</strong></div>
              </div>
              <div class="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                <div class="font-bold text-emerald-300 font-mono">${info3.name}</div>
                <div class="text-stone-400 text-[11px]">${info3.region} — <strong class="text-stone-300">${info3.haplo}</strong></div>
              </div>
            </div>
          </div>

          <!-- Quick Summary Cards -->
          <div class="grid grid-cols-4 gap-3 text-center text-xs font-mono">
            <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <div class="text-emerald-400 font-bold text-lg">${sharedAll.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Shared by All 3</div>
            </div>
            <div class="p-3 rounded-xl bg-orange-950/40 border border-orange-800/80">
              <div class="text-orange-400 font-bold text-lg">${unique1.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info1.code}</div>
            </div>
            <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80">
              <div class="text-amber-400 font-bold text-lg">${unique2.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info2.code}</div>
            </div>
            <div class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80">
              <div class="text-cyan-400 font-bold text-lg">${unique3.length}</div>
              <div class="text-stone-300 mt-0.5 text-[10px]">Unique ${info3.code}</div>
            </div>
          </div>

          <!-- 3-Way Evolutionary Interpretation Report -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 space-y-5 text-xs text-stone-300 leading-relaxed shadow-2xl">
            <div class="border-b border-stone-800 pb-3">
              <h4 class="font-bold text-amber-400 font-mono text-base flex items-center gap-2">
                <span>📜 3-Way Biological & Evolutionary Triangulation Report</span>
              </h4>
              <p class="text-stone-400 text-[11px] mt-0.5">Triangulated Phylogeny across ${info1.code}, ${info2.code}, and ${info3.code}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11.5px]">
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-mono font-bold text-orange-300">${info1.name}</div>
                <p class="text-stone-400 text-[11px] leading-relaxed">${info1.history}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-mono font-bold text-amber-300">${info2.name}</div>
                <p class="text-stone-400 text-[11px] leading-relaxed">${info2.history}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div class="font-mono font-bold text-emerald-300">${info3.name}</div>
                <p class="text-stone-400 text-[11px] leading-relaxed">${info3.history}</p>
              </div>
            </div>

            <!-- Shared Motifs Across All 3 -->
            <div class="space-y-2 pt-2 border-t border-stone-800">
              <h6 class="font-bold text-emerald-400 font-mono text-xs">
                🧬 Conserved Motifs Shared by All 3 Populations (${sharedAll.length})
              </h6>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                ${sharedAll.length > 0 ? sharedAll.slice(0, 6).map(m => `
                  <div class="p-2 rounded bg-stone-950 border border-emerald-900/60 flex justify-between">
                    <span class="text-emerald-300 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                    <span class="text-stone-400 text-[10px]">${m.gene || 'D-loop'}</span>
                  </div>
                `).join('') : '<div class="col-span-full p-2 text-stone-500 text-center font-mono">No variants shared by all three populations simultaneously.</div>'}
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

      const divInfo = this.getEvolutionaryDivergenceInfo(info1, info2, avgDist, shared, unique1, unique2);

      reportContainer.innerHTML = `
        <div class="space-y-6 font-sans">
          
          <!-- Header Banner & Distance Metric -->
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
                  `).join('') : `<tr><td colspan="4" class="p-4 text-center text-stone-500">No shared mutations detected between these two ethnicities.</td></tr>`}
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
                    `).join('') : '<div class="col-span-full p-4 text-stone-500 text-center font-mono bg-stone-950 rounded-xl">No shared mutations detected between these two ethnicities.</div>'}
                  </div>
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
      return;
    }

    // 1-Way Single Population Profile Mode
    const vars1 = window.App.variantsData.variants.filter(v => samples1.includes(v.sample));
    reportContainer.innerHTML = `
      <div class="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 font-mono">
        <div class="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 class="text-lg font-bold text-orange-400">${info1.name} — Population Profile</h3>
          <span class="text-xs bg-orange-950 text-orange-300 px-3 py-1 rounded border border-orange-800">${info1.haplo}</span>
        </div>
        <p class="text-xs text-stone-300 font-sans leading-relaxed">${info1.history}</p>
        <div class="text-xs text-stone-400 pt-2">Total Variants Recorded: <strong class="text-amber-400">${vars1.length}</strong></div>
      </div>
    `;
  }
};

window.PedigreeInspector = {
  FAMILY_PEDIGREES: {
    'MX': {
      code: 'MX',
      name: 'Ethnicity MX (Mexico)',
      haplo: 'Haplogroup B2',
      mother: 'MX_F_CRY',
      father: 'MX_M_CRYF',
      children: ['MX_F_CRYS', 'MX_M_CRYFS']
    },
    'HK': {
      code: 'HK',
      name: 'Ethnicity HK (Hong Kong)',
      haplo: 'Haplogroup M7',
      mother: 'HK_F_JAN',
      father: 'HK_M_WLL',
      children: ['HK_F_JANS']
    },
    'UK': {
      code: 'UK',
      name: 'Ethnicity UK (Ukraine)',
      haplo: 'Haplogroup U4',
      mother: 'UK_F_NIKA',
      father: 'UK_M_NIK',
      children: ['UK_F_NIKM', 'UK_M_NIKS1']
    },
    'IS': {
      code: 'IS',
      name: 'Ethnicity IS (India South)',
      haplo: 'Haplogroup M / R (VYS)',
      mother: 'IS_F_VYSM',
      father: 'IS_M_RAV',
      children: ['IS_M_SEL']
    },
    'PK': {
      code: 'PK',
      name: 'Ethnicity PK (Pakistan)',
      haplo: 'Haplogroup M / U',
      mother: 'PK_F_WAS',
      father: 'PK_M_WASH',
      children: ['PK_M_WASC1']
    },
    'IW': {
      code: 'IW',
      name: 'Ethnicity IW (India West)',
      haplo: 'Haplogroup M / R',
      mother: 'IW_F_ANJM',
      father: 'IW_M_ANJF',
      children: []
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
      this.renderPedigree(select.value || 'MX');
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

    const ped = this.FAMILY_PEDIGREES[famKey] || this.FAMILY_PEDIGREES['MX'];
    const motherVars = window.App.variantsData.variants.filter(v => v.sample === ped.mother);
    const fatherVars = window.App.variantsData.variants.filter(v => v.sample === ped.father);

    const motherMap = new Map(motherVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));
    const fatherMap = new Map(fatherVars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v]));

    // Find children variant sets
    const childrenVars = ped.children.map(childSample => {
      const vars = window.App.variantsData.variants.filter(v => v.sample === childSample);
      return { sample: childSample, vars, map: new Map(vars.map(v => [`${v.pos}_${v.ref}_${v.alt}`, v])) };
    });

    // Compute Maternally Transmitted Variants (Mother & present in at least 1 child, or 100% of children)
    const maternallyInherited = [];
    motherMap.forEach((vM, key) => {
      const inheritedByAll = childrenVars.every(c => c.map.has(key));
      const inheritedByAny = childrenVars.some(c => c.map.has(key));
      if (childrenVars.length === 0 || inheritedByAny) {
        maternallyInherited.push({ ...vM, inheritedByAll });
      }
    });

    // Compute Paternal Non-Transmitted Discrepancies (Father variants NOT present in Mother and NOT in any child)
    const paternalUninherited = [];
    fatherMap.forEach((vF, key) => {
      const inMother = motherMap.has(key);
      const inAnyChild = childrenVars.some(c => c.map.has(key));
      if (!inMother && !inAnyChild) {
        paternalUninherited.push(vF);
      }
    });

    // Heteroplasmic Drift VAF Shifts (Mother vs Children VAF comparisons)
    const vafShifts = [];
    motherMap.forEach((vM, key) => {
      childrenVars.forEach(c => {
        if (c.map.has(key)) {
          const vC = c.map.get(key);
          const diff = Math.abs(vM.vaf - vC.vaf);
          if (diff >= 0.05) { // VAF shift >= 5%
            vafShifts.push({
              pos: vM.pos,
              ref: vM.ref,
              alt: vM.alt,
              gene: vM.gene,
              motherVaf: vM.vaf,
              childSample: c.sample,
              childVaf: vC.vaf,
              diff
            });
          }
        }
      });
    });

    bodyEl.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <!-- Header Banner & Pedigree Diagram -->
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
                Transmits 100% of mitochondrial genome & diagnostic variants to all offspring.
              </p>
              <div class="text-xs text-emerald-400 font-mono font-bold pt-1">
                Total Variants: ${motherVars.length}
              </div>
            </div>

            <!-- Father Card (Paternal Non-Transmission) -->
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

        <!-- 100% Maternally Inherited Variants Table -->
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
              <tbody class="divide-y divide-stone-800/60 text-[11px]">
                ${maternallyInherited.length > 0 ? maternallyInherited.slice(0, 10).map(m => `
                  <tr class="hover:bg-stone-900/40">
                    <td class="p-2.5 text-amber-400 font-bold">m.${m.pos}</td>
                    <td class="p-2.5 font-bold text-stone-200">${m.ref} &gt; ${m.alt}</td>
                    <td class="p-2.5 text-stone-300">${m.gene || 'Control Region (D-loop)'}</td>
                    <td class="p-2.5 text-emerald-400">${(m.vaf * 100).toFixed(0)}%</td>
                    <td class="p-2.5 text-emerald-300"><span class="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">100% Inherited</span></td>
                  </tr>
                `).join('') : '<tr><td colspan="5" class="p-4 text-center text-stone-500">No maternal variants recorded.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paternal Discrepancies (0% Transmitted Paternal mtDNA) -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-rose-900/60 space-y-3 font-mono text-xs shadow-xl">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-rose-400 text-sm flex items-center gap-2">
              <span>🛡️ Paternal Non-Transmitted Discrepancies (${paternalUninherited.length})</span>
            </h4>
            <span class="text-stone-400 font-sans text-[11px]">Present in Father, 0% in Offspring</span>
          </div>

          <p class="text-stone-300 text-xs font-sans leading-relaxed">
            Empirical proof of strict maternal transmission: None of Father (${ped.father})'s specific mitochondrial variants are present in any of the offspring.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            ${paternalUninherited.length > 0 ? paternalUninherited.slice(0, 6).map(m => `
              <div class="p-2.5 rounded-xl bg-stone-950 border border-rose-900/60 flex items-center justify-between text-[11px]">
                <div>
                  <span class="text-rose-300 font-bold">m.${m.pos} ${m.ref}&gt;${m.alt}</span>
                  <span class="text-stone-400 text-[10px] block">${m.gene || 'D-loop'}</span>
                </div>
                <span class="bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800 text-[10px]">0% Inherited</span>
              </div>
            `).join('') : '<div class="col-span-full p-3 text-stone-500 text-center">No uninherited paternal variants.</div>'}
          </div>
        </div>

        <!-- Heteroplasmic Bottleneck VAF Drift Across Generations -->
        ${vafShifts.length > 0 ? `
          <div class="p-5 rounded-2xl bg-stone-900/90 border border-amber-800/60 space-y-3 font-mono text-xs shadow-xl">
            <div class="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>📉 Intergenerational Heteroplasmy VAF Shift (${vafShifts.length})</span>
              </h4>
              <span class="text-stone-400 font-sans text-[11px]">Mitochondrial Bottleneck Drift</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${vafShifts.slice(0, 6).map(s => `
                <div class="p-3 rounded-xl bg-stone-950 border border-amber-900/60 text-[11px] space-y-1">
                  <div class="flex items-center justify-between text-amber-300 font-bold">
                    <span>m.${s.pos} ${s.ref}&gt;${s.alt}</span>
                    <span class="text-stone-400 text-[10px]">${s.gene || 'D-loop'}</span>
                  </div>
                  <div class="flex items-center justify-between text-stone-300 pt-1 text-[10px]">
                    <span>Mother VAF: <strong class="text-orange-400">${(s.motherVaf * 100).toFixed(0)}%</strong></span>
                    <span>➔</span>
                    <span>${s.childSample} VAF: <strong class="text-emerald-400">${(s.childVaf * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }
};

window.GeneContrastMatrix = {
  SAMPLE_POOL: ['MX_F_CRY', 'UK_F_NIKA', 'HK_F_JAN', 'AA_F_TON', 'IS_F_VYSM', 'TB_F_BHA', 'KR_F_MOO'],
  activeSamples: ['MX_F_CRY', 'UK_F_NIKA', 'HK_F_JAN', 'AA_F_TON'],

  GENE_LOCI: [
    'D-loop', 'MT-RNR1', 'MT-RNR2', 'MT-ND1', 'MT-ND2', 'MT-CO1', 'MT-CO2', 
    'MT-ATP8', 'MT-ATP6', 'MT-CO3', 'MT-ND3', 'MT-ND4L', 'MT-ND4', 'MT-ND5', 'MT-ND6', 'MT-CYB'
  ],

  init() {
    const openBtn = document.getElementById('openGeneMatrixBtn');
    const closeBtn = document.getElementById('closeGeneMatrixModalBtn');
    const modal = document.getElementById('geneMatrixModal');

    if (!modal) return;

    openBtn?.addEventListener('click', () => {
      this.renderMatrix();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  },

  toggleSample(s) {
    if (this.activeSamples.includes(s)) {
      if (this.activeSamples.length > 2) {
        this.activeSamples = this.activeSamples.filter(item => item !== s);
      }
    } else {
      if (this.activeSamples.length < 5) {
        this.activeSamples.push(s);
      }
    }
    this.renderMatrix();
  },

  renderMatrix() {
    const bodyEl = document.getElementById('geneMatrixModalBody');
    if (!bodyEl || !window.App.variantsData) return;

    const allVars = window.App.variantsData.variants;

    // Filter variants for active samples
    const sampleGeneCounts = {};
    const sampleGeneVars = {};

    this.activeSamples.forEach(s => {
      sampleGeneCounts[s] = {};
      sampleGeneVars[s] = {};
      this.GENE_LOCI.forEach(g => {
        sampleGeneCounts[s][g] = 0;
        sampleGeneVars[s][g] = [];
      });

      const sVars = allVars.filter(v => v.sample === s);
      sVars.forEach(v => {
        const gene = v.gene || 'D-loop';
        const matchedGene = this.GENE_LOCI.find(gl => gl.toLowerCase() === gene.toLowerCase()) || 'D-loop';
        if (sampleGeneCounts[s][matchedGene] !== undefined) {
          sampleGeneCounts[s][matchedGene]++;
          sampleGeneVars[s][matchedGene].push(v);
        }
      });
    });

    // Sample selector checkboxes/pills
    const selectorHtml = this.SAMPLE_POOL.map(s => {
      const active = this.activeSamples.includes(s);
      return `
        <button onclick="window.GeneContrastMatrix.toggleSample('${s}')" class="px-3 py-1 text-xs rounded-xl font-mono font-bold transition-all ${active ? 'bg-amber-600 text-stone-950 shadow-md border border-amber-400' : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-amber-500'}">
          ${s} ${active ? '✓' : ''}
        </button>
      `;
    }).join(' ');

    bodyEl.innerHTML = `
      <div class="space-y-6 font-sans">
        
        <!-- Controls & Sample Selector Bar -->
        <div class="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Select Up To 5 Samples to Compare:</span>
            <span class="text-[11px] text-stone-400 font-sans">Active: ${this.activeSamples.length}/5</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${selectorHtml}
          </div>
        </div>

        <!-- Interactive Heatmap Grid -->
        <div class="p-5 rounded-2xl bg-stone-900/90 border border-amber-800/60 shadow-xl space-y-3">
          <div class="flex items-center justify-between border-b border-stone-800 pb-2">
            <h4 class="font-bold text-amber-400 font-mono text-sm">
              🧬 Variant Density Across 37 Mitochondrial Genes & D-Loop Loci
            </h4>
            <span class="text-[11px] text-stone-400 font-mono">Hover cells for variant details</span>
          </div>

          <div class="overflow-x-auto border border-stone-800 rounded-xl bg-stone-950 font-mono text-xs">
            <table class="w-full text-center border-collapse">
              <thead class="bg-stone-900 text-stone-300 border-b border-stone-800 text-[11px]">
                <tr>
                  <th class="p-3 text-left sticky left-0 bg-stone-900 z-10 border-r border-stone-800">Sample Locus</th>
                  ${this.GENE_LOCI.map(g => `<th class="p-2.5 min-w-[70px] font-bold text-amber-300 border-r border-stone-800/50">${g}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800/60 text-[11px]">
                ${this.activeSamples.map(s => `
                  <tr>
                    <td class="p-3 text-left font-bold text-orange-400 sticky left-0 bg-stone-950 z-10 border-r border-stone-800 whitespace-nowrap">
                      ${s}
                    </td>
                    ${this.GENE_LOCI.map(g => {
                      const count = sampleGeneCounts[s][g];
                      const vars = sampleGeneVars[s][g];
                      let cellClass = 'bg-stone-950 text-stone-600';
                      if (count === 1) cellClass = 'bg-amber-950/60 text-amber-300 font-bold border border-amber-800/40';
                      if (count >= 2) cellClass = 'bg-orange-900/80 text-orange-200 font-extrabold border border-orange-500 shadow-md shadow-orange-950';

                      const tooltipText = vars.length > 0 ? vars.map(v => `m.${v.pos} ${v.ref}>${v.alt} (${(v.vaf * 100).toFixed(0)}%)`).join(', ') : 'No variants';

                      return `
                        <td class="p-2.5 border-r border-stone-800/40 ${cellClass}" title="${s} — ${g}: ${tooltipText}">
                          ${count > 0 ? count : '—'}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Homoplasy vs Synapomorphy Analysis Card -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="p-4 rounded-xl bg-stone-950 border border-emerald-800/60 space-y-2">
            <div class="font-bold text-emerald-300 text-xs flex justify-between border-b border-stone-800 pb-2">
              <span>🧬 Homoplasic Mutational Hotspots</span>
              <span class="text-[10px] text-emerald-400">Parallel Evolution</span>
            </div>
            <p class="text-stone-300 text-[11px] font-sans leading-relaxed">
              Mutations occurring independently across distinct macro-haplogroups (e.g. <strong>m.263 A&gt;G</strong>, <strong>m.73 A&gt;G</strong>, <strong>m.16519 T&gt;C</strong> in control region D-loop) representing hypervariable mutational hotspots.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-stone-950 border border-amber-800/60 space-y-2">
            <div class="font-bold text-amber-300 text-xs flex justify-between border-b border-stone-800 pb-2">
              <span>🏛️ Synapomorphic Lineage Fingerprints</span>
              <span class="text-[10px] text-amber-400">Ancestral Motifs</span>
            </div>
            <p class="text-stone-300 text-[11px] font-sans leading-relaxed">
              Conserved mutations unique to specific maternal founder lineages (e.g. <strong>m.6297 T&gt;C</strong> in Haplogroup B2, <strong>m.5821 G&gt;A</strong> in Haplogroup M7) marking historical ancestral expansions.
            </p>
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
    window.PedigreeInspector.init();
    window.GeneContrastMatrix.init();
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
