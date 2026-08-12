/**
 * 3D Geo-Mitochondrial Migration Globe Viewer (D3.js Orthographic Projection)
 * Apple Liquid Glass & Deep Space Obsidian Aesthetic
 */

window.GlobeViewer = {
  geoData: null,
  migrationData: null,
  projection: null,
  pathGenerator: null,
  svgG: null,
  activeSample: 'IN_F_DPL',
  activeStepIndex: 0,
  isAutoRotating: true,
  lastInteractionTime: Date.now(),
  timer: null,
  playInterval: null,

  MUTATION_MEANINGS: {
    263: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Universal human basal Out-of-Africa founder mutation; marks non-African divergence from ancestral African mitochondrial genome.' },
    750: { locus: 'MT-RNR1 (12S rRNA)', change: 'A>G', meaning: 'Basal Eurasian radiation marker; stabilizes ribosomal RNA secondary structure for early human expansions.' },
    1438: { locus: 'MT-RNR1 (12S rRNA)', change: 'A>G', meaning: 'Out-of-Africa Southern Coastal gateway marker; universal across all macro-haplogroups N, M, and R.' },
    2706: { locus: 'MT-RNR2 (16S rRNA)', change: 'A>G', meaning: 'Non-African ancestral radiation marker; defines the divergence of Eurasian founding lineages from African L clades.' },
    4769: { locus: 'MT-ND2', change: 'A>G', meaning: 'Synonymous mitochondrial codon optimization in complex I, present across early Eurasians.' },
    7028: { locus: 'MT-CO1', change: 'C>T', meaning: 'Macro-haplogroup H/V/U Eurasian branch founder; critical subunit I marker of cytochrome c oxidase.' },
    8860: { locus: 'MT-ATP6', change: 'A>G', meaning: 'ATP synthase F0 subunit 6 codon variation; basal Eurasian metabolic adaptation.' },
    15326: { locus: 'MT-CYB', change: 'A>G', meaning: 'Cytochrome b conserved core mutation marking the ancient trans-Eurasian expansion.' },
    16519: { locus: 'Control Region (D-loop)', change: 'T>C', meaning: 'Hypervariable control region transition common across global post-LGM populations.' },
    593: { locus: 'MT-TF (tRNA-Phe)', change: 'T>C', meaning: 'Diagnostic South Asian central founder; establishes early Indian subcontinent hunter-gatherer maternal lineage.' },
    5075: { locus: 'MT-ND2', change: 'A>G', meaning: 'Central & Northern Indian haplogroup M sub-clade defining marker.' },
    6020: { locus: 'MT-CO1', change: 'G>A', meaning: 'Diagnostic Indian mitochondrial lineage signature preserved through maternal generations.' },
    10400: { locus: 'MT-ND4L', change: 'C>T', meaning: 'Deep Indian indigenous clade marker; confirms continuous ancestral settlement in the subcontinent.' },
    12792: { locus: 'MT-ND5', change: 'A>G', meaning: 'Central Indian lineage marker in NADH dehydrogenase subunit 5.' },
    14783: { locus: 'MT-CYB', change: 'T>C', meaning: 'Central Indian maternal line diagnostic mutation in cytochrome b.' },
    15043: { locus: 'MT-CYB', change: 'G>A', meaning: 'High-confidence maternal variant confirming continuous generational inheritance in India.' },
    15692: { locus: 'MT-CYB', change: 'A>G', meaning: 'Diagnostic maternal cytochrome b mutation characteristic of North/Central Indian cohort.' },
    15859: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private maternal lineage anchor marker for Central/North Indian lines.' },
    5186: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic South Indian / Dravidian ancestral founder; proves prehistoric settlement of the Deccan Plateau.' },
    9094: { locus: 'MT-ATP6', change: 'G>A', meaning: 'South Indian regional haplogroup M/R lineage marker in ATP synthase.' },
    9614: { locus: 'MT-CO3', change: 'C>T', meaning: 'Southern South Asian diagnostic marker in cytochrome c oxidase subunit III.' },
    12793: { locus: 'MT-ND5', change: 'A>G', meaning: 'Conserved maternal variant in South Indian maternal lines.' },
    13194: { locus: 'MT-ND5', change: 'T>C', meaning: 'Diagnostic Southern Indian maternal line signature.' },
    13656: { locus: 'MT-ND5', change: 'C>T', meaning: 'High-presence maternal transmission anchor for South Indian cohort.' },
    15930: { locus: 'MT-TT (tRNA-Thr)', change: 'G>A', meaning: 'South Indian diagnostic tRNA mutation proving unmixed maternal continuity.' },
    5508: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic Western Indian / Gujarat coastal corridor marker; proves historical habitation in West India.' },
    8594: { locus: 'MT-ATP6', change: 'G>A', meaning: 'India West haplogroup J1/M founder mutation in ATP synthase.' },
    10084: { locus: 'MT-TG (tRNA-Gly)', change: 'T>C', meaning: 'Diagnostic maternal marker in tRNA-Gly for Western Indian lineage.' },
    10754: { locus: 'MT-ND4L', change: 'A>G', meaning: 'Western South Asian regional sub-clade diagnostic variant.' },
    11293: { locus: 'MT-ND4', change: 'C>T', meaning: 'Conserved complex I subunit variant in India West cohort.' },
    13635: { locus: 'MT-ND5', change: 'A>G', meaning: 'Diagnostic maternal anchor for West Indian family lines.' },
    13971: { locus: 'MT-ND5', change: 'T>C', meaning: 'High-confidence maternal variant confirming Western Indian lineage.' },
    14990: { locus: 'MT-CYB', change: 'A>G', meaning: 'Cytochrome b diagnostic marker for West Indian family clade.' },
    15385: { locus: 'MT-CYB', change: 'C>T', meaning: 'Private maternal signature for India West (IW) family line.' },
    511: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Diagnostic Indus Valley / Pakistan founder; proves ancient human occupation of the Indus basin.' },
    3594: { locus: 'MT-ND1', change: 'C>T', meaning: 'Haplogroup M/U Pakistani regional lineage marker in complex I.' },
    7269: { locus: 'MT-CO1', change: 'G>A', meaning: 'Diagnostic maternal variant for Pakistan Indus cohort.' },
    7805: { locus: 'MT-CO2', change: 'C>T', meaning: 'High-confidence diagnostic marker in cytochrome c oxidase subunit II for Pakistan cohort.' },
    13680: { locus: 'MT-ND5', change: 'C>T', meaning: 'Indus Valley maternal lineage anchor variant.' },
    15479: { locus: 'MT-CYB', change: 'T>C', meaning: 'Private maternal diagnostic marker for Pakistan family lines.' },
    650: { locus: 'MT-TF (tRNA-Phe)', change: 'C>T', meaning: 'Diagnostic Eastern European / Ukrainian Steppe founder; proves Mesolithic hunter-gatherer continuity.' },
    8395: { locus: 'MT-ATP8', change: 'A>G', meaning: 'Haplogroup U4/H founder marker in ATP synthase subunit 8.' },
    10885: { locus: 'MT-ND4', change: 'T>C', meaning: 'Ukrainian maternal lineage diagnostic variant in complex I.' },
    11566: { locus: 'MT-ND4', change: 'G>A', meaning: 'Conserved Eastern European regional lineage marker.' },
    14467: { locus: 'MT-ND6', change: 'A>G', meaning: 'Diagnostic maternal variant in NADH dehydrogenase subunit 6 for Ukraine cohort.' },
    16356: { locus: 'Control Region (D-loop)', change: 'T>C', meaning: 'Private maternal hypervariable signature for Ukraine family lines.' },
    63: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Northeast Asian / Korean Peninsula diagnostic founder; proves ancient habitation across Manchuria & Korea.' },
    1709: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Haplogroup D4 Korean founder marker in 16S ribosomal RNA.' },
    2882: { locus: 'MT-RNR2 (16S rRNA)', change: 'C>T', meaning: 'Diagnostic Korean Peninsula maternal lineage variant.' },
    3010: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Conserved East Asian ribosomal RNA transition.' },
    8414: { locus: 'MT-ATP8', change: 'C>T', meaning: 'Korean regional lineage diagnostic marker in ATP8.' },
    9817: { locus: 'MT-CO3', change: 'G>A', meaning: 'Diagnostic maternal marker in cytochrome c oxidase subunit III for Korea cohort.' },
    13544: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-confidence maternal variant for Korea cohort.' },
    15565: { locus: 'MT-CYB', change: 'C>T', meaning: 'Conserved Korean maternal cytochrome b signature.' },
    15669: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private diagnostic marker for Korea family line.' },
    499: { locus: 'Control Region (D-loop)', change: 'G>A', meaning: 'Ancient Beringian transit marker; carried by founding ancestors entering North & Central America.' },
    4823: { locus: 'MT-ND2', change: 'C>T', meaning: 'Pre-Clovis Mesoamerican founder variant in complex I.' },
    6297: { locus: 'MT-CO1', change: 'T>C', meaning: 'Diagnostic Mesoamerican / Mexican Haplogroup B2 founder; proves ancestral lineage in Central America.' },
    8047: { locus: 'MT-CO2', change: 'A>G', meaning: 'Conserved maternal variant in cytochrome c oxidase subunit II for Mexico cohort.' },
    9039: { locus: 'MT-ATP6', change: 'G>A', meaning: 'Diagnostic Mesoamerican maternal marker for Mexico family lines.' },
    13590: { locus: 'MT-ND5', change: 'T>C', meaning: 'Private maternal signature for Mexico cohort in NADH dehydrogenase subunit 5.' },
    5821: { locus: 'MT-CO1', change: 'G>A', meaning: 'Diagnostic Southern China / Hong Kong coastal founder; proves early Holocene settlement along Pearl River Delta.' },
    6338: { locus: 'MT-CO1', change: 'C>T', meaning: 'Haplogroup M7 coastal East Asian founder marker in cytochrome c oxidase.' },
    6455: { locus: 'MT-CO1', change: 'C>T', meaning: 'Diagnostic South China regional lineage variant.' },
    8602: { locus: 'MT-ATP6', change: 'T>C', meaning: 'Conserved maternal variant in ATP synthase subunit 6 for Hong Kong cohort.' },
    9540: { locus: 'MT-CO3', change: 'T>C', meaning: 'Hong Kong diagnostic maternal marker in cytochrome c oxidase subunit III.' },
    14821: { locus: 'MT-CYB', change: 'A>G', meaning: 'Private maternal lineage anchor for Hong Kong cohort.' },
    114: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Diagnostic South American / Andean Paleo-Indian founder; proves rapid Pacific coastal migration into South America.' },
    3552: { locus: 'MT-ND1', change: 'T>C', meaning: 'Haplogroup C1 founding lineage marker in complex I.' },
    8545: { locus: 'MT-ATP6', change: 'A>G', meaning: 'Diagnostic Colombian / Andean maternal variant in ATP synthase.' },
    9545: { locus: 'MT-CO3', change: 'A>G', meaning: 'Conserved South American indigenous lineage marker.' },
    11914: { locus: 'MT-ND4', change: 'G>A', meaning: 'High-confidence maternal variant for Colombia cohort.' },
    13263: { locus: 'MT-ND5', change: 'A>G', meaning: 'Diagnostic Andean maternal marker in complex I.' },
    15323: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private maternal lineage anchor for Colombia family line.' },
    183: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Ancestral Mitochondrial Eve root mutation; deep Sub-Saharan African maternal lineage marker.' },
    2758: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Haplogroup L2 deep African lineage anchor in 16S rRNA.' },
    5581: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic Sub-Saharan African maternal variant in complex I.' },
    7175: { locus: 'MT-CO1', change: 'T>C', meaning: 'Conserved African maternal lineage marker in cytochrome c oxidase.' },
    9128: { locus: 'MT-ATP6', change: 'G>A', meaning: 'Deep African ATP synthase subunit 6 lineage marker.' },
    11338: { locus: 'MT-ND4', change: 'A>G', meaning: 'Diagnostic Sub-Saharan African maternal anchor in complex I.' },
    13803: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-confidence African maternal variant in NADH dehydrogenase.' },
    14308: { locus: 'MT-ND6', change: 'T>C', meaning: 'Conserved Sub-Saharan maternal lineage marker.' },
    15784: { locus: 'MT-CYB', change: 'T>C', meaning: 'Private maternal diagnostic marker for African maternal lines.' },
    3394: { locus: 'MT-ND1', change: 'T>C', meaning: 'Iconic Tibetan high-altitude adaptation mutation; enhances mitochondrial oxygen affinity in extreme hypoxia ~30,000 YBP.' },
    4491: { locus: 'MT-ND2', change: 'G>A', meaning: 'Haplogroup M9 Tibetan Plateau founding lineage marker.' },
    8784: { locus: 'MT-ATP6', change: 'A>G', meaning: 'Diagnostic Himalayan plateau maternal variant in ATP synthase.' },
    12950: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-altitude adapted Tibetan maternal lineage anchor.' },
    14305: { locus: 'MT-ND6', change: 'C>T', meaning: 'Conserved Tibetan Plateau maternal marker in complex I.' },
    15535: { locus: 'MT-CYB', change: 'C>T', meaning: 'Diagnostic cytochrome b variant for Tibet cohort.' },
    16048: { locus: 'Control Region (D-loop)', change: 'G>A', meaning: 'Private maternal diagnostic marker for Tibetan family lines.' },
    73: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Diagnostic European / Caucasian founder; universal marker for Haplogroup H2.' },
    146: { locus: 'Control Region (D-loop)', change: 'T>C', meaning: 'Conserved European maternal lineage marker in the control region.' },
    64: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Diagnostic Native North American Haplogroup A2 founder; marks early pre-Clovis Beringian entry.' },
    152: { locus: 'Control Region (D-loop)', change: 'T>C', meaning: 'Conserved Indigenous North American maternal founder variant.' },
    235: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Native American founding radiation marker.' },
    663: { locus: 'MT-TF (tRNA-Phe)', change: 'A>G', meaning: 'Diagnostic maternal marker in tRNA-Phe for Indigenous North American lineages.' },
    1736: { locus: 'MT-RNR2 (16S rRNA)', change: 'A>G', meaning: 'Haplogroup A2 founder variant in 16S ribosomal RNA.' },
    4248: { locus: 'MT-ND1', change: 'T>C', meaning: 'Native North American diagnostic variant in complex I.' },
    4824: { locus: 'MT-ND2', change: 'A>G', meaning: 'Conserved maternal variant in NADH dehydrogenase subunit 2.' },
    8027: { locus: 'MT-CO2', change: 'G>A', meaning: 'Diagnostic Indigenous North American marker in cytochrome c oxidase.' },
    8794: { locus: 'MT-ATP6', change: 'C>T', meaning: 'Native North American maternal lineage anchor in ATP synthase.' },
    12007: { locus: 'MT-ND4', change: 'G>A', meaning: 'Private maternal diagnostic marker for Native North America line.' }
  },

  COHORT_TRAILS: {
    'IN': {
      name: 'India — Central/North (IN)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Homo sapiens mitochondrial cradle; basal human maternal genome baseline.' },
        { name: 'Southern Coastal Gateway', region: 'Red Sea / Arabian Crossing', coords: [45.0792, 14.5000], ybp: '60,000 YBP', mutations: [1438, 2706, 4769], desc: 'Early modern humans expand across the Bab-el-Mandeb coastal corridor into Southern Asia.' },
        { name: 'Indus-Gangetic Basin', region: 'North India', coords: [77.2090, 28.6139], ybp: '50,000 YBP', mutations: [593, 5075, 6020], desc: 'Establishment of early indigenous South Asian hunter-gatherer maternal lineages.' },
        { name: 'Central/North Indian Homeland', region: 'Central India', coords: [78.9629, 20.5937], ybp: '35,000 YBP to Present', mutations: [10400, 12792, 14783, 15043, 15692, 15859], desc: 'Cohort lineage established with private maternal diagnostic variants passed across generations.' }
      ]
    },
    'IS': {
      name: 'India South — Deccan (IS)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'African origin of human mitochondrial genome.' },
        { name: 'Southern Coastal Gateway', region: 'Arabian Sea Coastal Trail', coords: [55.0000, 22.0000], ybp: '60,000 YBP', mutations: [1438, 2706, 4769], desc: 'Coastal beachcomber migration along the Indian Ocean rim.' },
        { name: 'Deccan Plateau', region: 'Peninsular South India', coords: [77.5946, 12.9716], ybp: '45,000 YBP', mutations: [5186, 9094, 9614], desc: 'Establishment of deep Dravidian / South Indian ancestral macro-haplogroup M/R clades.' },
        { name: 'South Indian Ancestral Home', region: 'Tamil Nadu / Karnataka', coords: [80.2707, 13.0827], ybp: '30,000 YBP to Present', mutations: [12793, 13194, 13656, 15930], desc: 'Private maternal diagnostic markers proving uninterrupted matrilineal descent.' }
      ]
    },
    'IW': {
      name: 'India West — Gujarat (IW)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Mitochondrial Eve cradle in Sub-Saharan Africa.' },
        { name: 'Arabian Gulf Crossing', region: 'Gulf of Oman Corridor', coords: [58.5000, 23.6000], ybp: '55,000 YBP', mutations: [1438, 2706, 4769], desc: 'Out-of-Africa coastal transit into Western South Asia.' },
        { name: 'Kathiawar & Gujarat Corridor', region: 'Western India Coast', coords: [71.5000, 22.0000], ybp: '45,000 YBP', mutations: [5508, 8594, 10084, 10754], desc: 'Ancient habitation along the fertile estuaries of Western India.' },
        { name: 'Western Indian Lineage Home', region: 'Gujarat Homeland', coords: [72.5714, 23.0225], ybp: '30,000 YBP to Present', mutations: [11293, 13635, 13971, 14990, 15385], desc: 'Inheritance of distinct India West maternal diagnostic variants.' }
      ]
    },
    'PK': {
      name: 'Pakistan — Indus Valley (PK)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Deep ancestral root in East Africa.' },
        { name: 'Levant & Persian Gateway', region: 'Zagros / Makran Corridor', coords: [56.0000, 27.0000], ybp: '55,000 YBP', mutations: [1438, 2706, 4769], desc: 'Northern dispersal route into Central/South Asia.' },
        { name: 'Indus River Basin', region: 'Punjab / Sindh', coords: [68.0000, 28.0000], ybp: '40,000 YBP', mutations: [511, 3594, 7269], desc: 'Continuous settlement in the ancient Indus River valley.' },
        { name: 'Indus Valley Homeland', region: 'Pakistan Homeland', coords: [73.0479, 33.6844], ybp: '25,000 YBP to Present', mutations: [7805, 13680, 15479], desc: 'Private maternal lineage markers defining Pakistan cohort.' }
      ]
    },
    'UK': {
      name: 'Ukraine — Eastern Europe (UK)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Basal Out-of-Africa maternal lineage root.' },
        { name: 'Near Eastern Gateway', region: 'Anatolian Corridor', coords: [35.0000, 39.0000], ybp: '45,000 YBP', mutations: [1438, 2706, 4769, 7028], desc: 'Early modern human expansion into Western Eurasia.' },
        { name: 'Pontic-Caspian Steppe', region: 'Black Sea Basin', coords: [32.0000, 48.0000], ybp: '30,000 YBP', mutations: [650, 8395, 10885], desc: 'European Mesolithic hunter-gatherer maternal foundation.' },
        { name: 'Eastern European Homeland', region: 'Kyiv / Dnipro Corridor', coords: [30.5234, 50.4501], ybp: '15,000 YBP to Present', mutations: [11566, 14467, 16356], desc: 'Ukraine maternal lineage passed from grandmother to mother and children.' }
      ]
    },
    'KR': {
      name: 'Korea — Northeast Asia (KR)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Basal maternal origin in Africa.' },
        { name: 'Central Asian Steppe Trail', region: 'Altai / Silk Road Corridor', coords: [85.0000, 48.0000], ybp: '45,000 YBP', mutations: [1438, 2706, 4769], desc: 'Trans-Eurasian migration across Northern Asia.' },
        { name: 'Manchurian Basin', region: 'Northeast Asia', coords: [125.0000, 43.0000], ybp: '30,000 YBP', mutations: [63, 1709, 2882, 3010], desc: 'Haplogroup D4 founding radiation in Northeast Asia.' },
        { name: 'Korean Peninsula Homeland', region: 'Seoul / Han River Basin', coords: [126.9780, 37.5665], ybp: '20,000 YBP to Present', mutations: [8414, 9817, 13544, 15565, 15669], desc: 'Distinct Korean maternal line preserved through unbroken matriline.' }
      ]
    },
    'MX': {
      name: 'Mexico — Mesoamerica (MX)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'African foundation of human mitochondrial genome.' },
        { name: 'Beringia Land Bridge', region: 'Bering Strait', coords: [-168.0000, 65.0000], ybp: '25,000 YBP', mutations: [1438, 2706, 4769, 499], desc: 'Ancestral population crosses Beringian steppe during Last Glacial Maximum.' },
        { name: 'Pacific Coastal Corridor', region: 'Pacific Northwest / California', coords: [-120.0000, 36.0000], ybp: '18,000 YBP', mutations: [4823, 6297], desc: 'Rapid coastal and ice-free corridor transit into Central America.' },
        { name: 'Mesoamerican Valley', region: 'Central Mexico Plateau', coords: [-99.1332, 19.4326], ybp: '12,000 YBP to Present', mutations: [8047, 9039, 13590], desc: 'Primary Haplogroup B2 founder mutations established in Mesoamerica.' }
      ]
    },
    'HK': {
      name: 'Hong Kong — Pearl River (HK)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Basal Out-of-Africa maternal lineage root.' },
        { name: 'Indochina Coastal Corridor', region: 'Southeast Asian Coast', coords: [105.0000, 16.0000], ybp: '50,000 YBP', mutations: [1438, 2706, 4769], desc: 'Southern coastal dispersal along Sundaland.' },
        { name: 'Lingnan & South China', region: 'Pearl River Delta Basin', coords: [113.0000, 23.0000], ybp: '30,000 YBP', mutations: [5821, 6338, 6455], desc: 'Establishment of Haplogroup M7 coastal maritime lineages.' },
        { name: 'Hong Kong Ancestral Home', region: 'Pearl River Estuary', coords: [114.1694, 22.3193], ybp: '15,000 YBP to Present', mutations: [8602, 9540, 14821], desc: 'Private maternal diagnostic variants passed across generations in HK.' }
      ]
    },
    'CL': {
      name: 'Colombia — South America (CL)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Human maternal origin in Africa.' },
        { name: 'Beringian & North America Trail', region: 'North American Corridor', coords: [-105.0000, 45.0000], ybp: '20,000 YBP', mutations: [1438, 2706, 4769, 114], desc: 'Paleo-Indian founding groups advance southward.' },
        { name: 'Isthmus of Panama Crossing', region: 'Central America Gateway', coords: [-79.5000, 9.0000], ybp: '16,000 YBP', mutations: [3552, 8545], desc: 'Entry into the South American continent.' },
        { name: 'Colombian Andean Homeland', region: 'Northern Andes / Bogota', coords: [-74.0721, 4.7110], ybp: '13,000 YBP to Present', mutations: [9545, 11914, 13263, 15323], desc: 'Haplogroup C1 maternal lineage established in South America.' }
      ]
    },
    'AA': {
      name: 'African — Sub-Saharan Cradle (AA)',
      stops: [
        { name: 'Ancestral Eve Cradle', region: 'East Africa / Rift Valley', coords: [36.0000, -1.0000], ybp: '200,000 YBP', mutations: [183, 2758], desc: 'Mitochondrial Eve lineage foundation.' },
        { name: 'Congo-Nile Watershed', region: 'Central Africa', coords: [25.0000, 0.0000], ybp: '100,000 YBP', mutations: [5581, 7175], desc: 'Early diversification of Haplogroup L lineages.' },
        { name: 'West-Central African Belt', region: 'Sub-Saharan Belt', coords: [15.0000, 8.0000], ybp: '50,000 YBP', mutations: [9128, 11338], desc: 'Continuous deep African maternal lineage diversification.' },
        { name: 'African Ancestral Homeland', region: 'Sub-Saharan West Africa', coords: [5.0000, 7.5000], ybp: '25,000 YBP to Present', mutations: [13803, 14308, 15784], desc: 'Deep ancestral African root markers preserved.' }
      ]
    },
    'TB': {
      name: 'Tibet — Himalayan Plateau (TB)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Basal Out-of-Africa lineage root.' },
        { name: 'Central Asian Foothills', region: 'Pamir / Hindu Kush', coords: [72.0000, 37.0000], ybp: '50,000 YBP', mutations: [1438, 2706, 4769], desc: 'Trans-Himalayan dispersal corridors.' },
        { name: 'Tibetan Plateau Margin', region: 'Qinghai-Tibet', coords: [88.0000, 32.0000], ybp: '30,000 YBP', mutations: [3394, 4491], desc: 'Acquisition of iconic high-altitude hypoxia adaptation mutation m.3394 in complex I.' },
        { name: 'Himalayan High Plateau', region: 'Lhasa Plateau', coords: [91.1172, 29.6469], ybp: '20,000 YBP to Present', mutations: [8784, 12950, 14305, 15535, 16048], desc: 'Ancient Tibetan matrilineal continuity on the roof of the world.' }
      ]
    },
    'CA': {
      name: 'Canada — North America (CA)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'African foundation of human mitochondrial genome.' },
        { name: 'Western European Corridor', region: 'Atlantic Maritime Europe', coords: [0.0000, 50.0000], ybp: '35,000 YBP', mutations: [1438, 2706, 4769, 73], desc: 'Haplogroup H2 lineage foundation in Western Eurasia.' },
        { name: 'North Atlantic Crossing', region: 'Maritime Transit', coords: [-45.0000, 52.0000], ybp: '500 YBP', mutations: [146], desc: 'Historical trans-Atlantic migration to North America.' },
        { name: 'Canadian Homeland', region: 'Eastern Canada', coords: [-75.6972, 45.4215], ybp: 'Present', mutations: [263, 4769], desc: 'European-derived Canadian maternal lineage.' }
      ]
    },
    'NA': {
      name: 'Native North America (NA)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Mitochondrial Eve lineage foundation.' },
        { name: 'Beringian Steppe Refuge', region: 'Bering Strait Gateway', coords: [-168.0000, 65.0000], ybp: '25,000 YBP', mutations: [1438, 2706, 4769, 64, 152], desc: 'Beringian standstill and Haplogroup A2 founding radiation.' },
        { name: 'Ice-Free Interior Corridor', region: 'Subarctic Canada / Plains', coords: [-115.0000, 55.0000], ybp: '16,000 YBP', mutations: [235, 663, 1736, 4248], desc: 'Early post-glacial expansion across North America.' },
        { name: 'Indigenous North American Homeland', region: 'North American Basin', coords: [-100.0000, 42.0000], ybp: '12,000 YBP to Present', mutations: [4824, 8027, 8794, 12007, 16111, 16290, 16319], desc: 'Preserved Native North American maternal founder line.' }
      ]
    }
  },

  init(geoData, migrationData) {
    this.geoData = geoData;
    this.migrationData = migrationData;

    this.populateAllSamplesSelect();
    this.bindEvents();
    this.render();
    this.renderEvidencePanel();
    this.startAutoRotation();
  },

  getSampleTrail(sampleKey) {
    if (!sampleKey) sampleKey = 'IN_F_DPL';
    const code = sampleKey.split('_')[0];
    return this.COHORT_TRAILS[code] || this.COHORT_TRAILS['IN'];
  },

  populateAllSamplesSelect() {
    const select = document.getElementById('globeSampleSelect');
    if (!select || !window.App.distanceData) return;

    const samples = window.App.distanceData.samples || [];
    select.innerHTML = samples.map(s => {
      const code = s.split('_')[0];
      const role = window.TreeViewer ? window.TreeViewer.getSampleRole(s) : 'Lineage Member';
      return `<option value="${s}">[${code}] ${role} (${s})</option>`;
    }).join('');

    select.value = this.activeSample;
    select.onchange = (e) => {
      this.setSample(e.target.value);
    };
  },

  bindEvents() {
    const playBtn = document.getElementById('playMigrationTrailBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.playTrail();
      });
    }
  },

  setSample(sampleKey) {
    this.activeSample = sampleKey;
    this.activeStepIndex = 0;
    
    const trail = this.getSampleTrail(sampleKey);
    if (trail && trail.stops.length > 0) {
      this.rotateTo(trail.stops[0].coords);
    }
    this.renderEvidencePanel();
    this.updatePositions();
  },

  playTrail() {
    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops.length) return;

    if (this.playInterval) clearInterval(this.playInterval);
    
    let step = 0;
    this.activeStepIndex = step;
    this.rotateTo(trail.stops[0].coords);
    this.renderEvidencePanel();

    const playBtn = document.getElementById('playMigrationTrailBtn');
    if (playBtn) playBtn.innerHTML = '<span>⏸ Playing Trail...</span>';

    this.playInterval = setInterval(() => {
      step++;
      if (step >= trail.stops.length) {
        clearInterval(this.playInterval);
        this.playInterval = null;
        if (playBtn) playBtn.innerHTML = '<span>▶ Replay Migration Trail</span>';
        return;
      }
      this.activeStepIndex = step;
      this.rotateTo(trail.stops[step].coords);
      this.renderEvidencePanel();
    }, 2800);
  },

  goToStep(index) {
    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops[index]) return;

    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
      const playBtn = document.getElementById('playMigrationTrailBtn');
      if (playBtn) playBtn.innerHTML = '<span>▶ Play Migration Trail</span>';
    }

    this.activeStepIndex = index;
    this.rotateTo(trail.stops[index].coords);
    this.renderEvidencePanel();
  },

  startAutoRotation() {
    if (this.timer) this.timer.stop();
    this.timer = d3.timer(() => {
      if (this.isAutoRotating && Date.now() - this.lastInteractionTime > 3500 && !this.playInterval) {
        if (!this.projection) return;
        const rotate = this.projection.rotate();
        this.projection.rotate([rotate[0] + 0.22, rotate[1]]);
        this.updatePositions();
      }
    });
  },

  render() {
    const container = document.getElementById('globeContainer');
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = Math.max(520, container.clientHeight || 520);
    const radius = Math.min(width, height) / 2 - 35;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#080a0f')
      .style('border-radius', '1.5rem')
      .style('cursor', 'grab');

    const g = svg.append('g');
    this.svgG = g;

    this.projection = d3.geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .rotate([-25, -15]);

    this.pathGenerator = d3.geoPath().projection(this.projection);

    const defs = svg.append('defs');
    const oceanGrad = defs.append('radialGradient')
      .attr('id', 'globeOceanGlow')
      .attr('cx', '40%')
      .attr('cy', '35%')
      .attr('r', '70%');
    oceanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0369a1');
    oceanGrad.append('stop').attr('offset', '45%').attr('stop-color', '#075985');
    oceanGrad.append('stop').attr('offset', '80%').attr('stop-color', '#0c4a6e');
    oceanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#031726');

    const oceanG = g.append('g').attr('class', 'ocean-layer');
    oceanG.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', radius)
      .attr('fill', 'url(#globeOceanGlow)')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', '1.5px')
      .style('filter', 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.2))');

    const graticule = d3.geoGraticule()();
    g.append('path')
      .attr('class', 'graticule-layer')
      .attr('d', this.pathGenerator(graticule))
      .attr('fill', 'none')
      .attr('stroke', '#0284c7')
      .attr('stroke-width', '0.6px')
      .attr('stroke-opacity', '0.3')
      .attr('stroke-dasharray', '2 4');

    if (this.geoData && this.geoData.features) {
      g.append('g')
        .attr('class', 'land-layer')
        .selectAll('path')
        .data(this.geoData.features)
        .enter()
        .append('path')
        .attr('class', 'land-feature')
        .attr('d', this.pathGenerator)
        .attr('fill', '#1e293b')
        .attr('fill-opacity', '0.92')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', '1.2px')
        .attr('stroke-opacity', '0.7');
    }

    g.append('g').attr('class', 'arcs-layer');
    g.append('g').attr('class', 'markers-layer');

    const drag = d3.drag()
      .on('start', () => {
        this.isAutoRotating = false;
        this.lastInteractionTime = Date.now();
        svg.style('cursor', 'grabbing');
      })
      .on('drag', (event) => {
        this.lastInteractionTime = Date.now();
        const rotate = this.projection.rotate();
        const k = 75 / this.projection.scale();
        this.projection.rotate([
          rotate[0] + event.dx * k,
          Math.max(-80, Math.min(80, rotate[1] - event.dy * k))
        ]);
        this.updatePositions();
      })
      .on('end', () => {
        svg.style('cursor', 'grab');
        this.lastInteractionTime = Date.now();
        setTimeout(() => { this.isAutoRotating = true; }, 3000);
      });

    svg.call(drag);

    const zoom = d3.zoom()
      .scaleExtent([radius * 0.7, radius * 3.5])
      .on('zoom', (event) => {
        this.lastInteractionTime = Date.now();
        this.projection.scale(event.transform.k);
        oceanG.select('circle').attr('r', event.transform.k);
        this.updatePositions();
      });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(radius));

    this.updatePositions();
  },

  updatePositions() {
    if (!this.svgG || !this.projection || !this.pathGenerator) return;

    this.svgG.select('.graticule-layer').attr('d', this.pathGenerator(d3.geoGraticule()()));
    this.svgG.selectAll('.land-feature').attr('d', this.pathGenerator);

    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops.length) return;

    const stops = trail.stops;
    const center = [-this.projection.rotate()[0], -this.projection.rotate()[1]];
    const path = this.pathGenerator;

    const arcsLayer = this.svgG.select('.arcs-layer');
    arcsLayer.selectAll('*').remove();

    for (let i = 0; i < stops.length - 1; i++) {
      const p1 = stops[i].coords;
      const p2 = stops[i + 1].coords;

      const isVisible = d3.geoDistance(p1, center) < Math.PI / 2 || d3.geoDistance(p2, center) < Math.PI / 2;
      if (isVisible) {
        const geoArc = { type: 'LineString', coordinates: [p1, p2] };
        const isCompleted = i < this.activeStepIndex;

        arcsLayer.append('path')
          .attr('d', path(geoArc))
          .attr('fill', 'none')
          .attr('stroke', isCompleted ? '#34d399' : '#38bdf8')
          .attr('stroke-width', isCompleted ? '3.2px' : '2.2px')
          .attr('stroke-opacity', isCompleted ? 0.95 : 0.6)
          .attr('stroke-dasharray', isCompleted ? 'none' : '5 4');
      }
    }

    const markersLayer = this.svgG.select('.markers-layer');
    markersLayer.selectAll('*').remove();

    stops.forEach((stop, idx) => {
      const isVisible = d3.geoDistance(stop.coords, center) < Math.PI / 2;
      if (isVisible) {
        const xy = this.projection(stop.coords);
        if (xy) {
          const isCurrent = idx === this.activeStepIndex;
          const isPast = idx < this.activeStepIndex;
          const pinColor = isCurrent ? '#38bdf8' : (isPast ? '#34d399' : '#64748b');

          const pinG = markersLayer.append('g')
            .attr('transform', `translate(${xy[0]},${xy[1]})`)
            .style('cursor', 'pointer')
            .on('click', () => this.goToStep(idx));

          if (isCurrent) {
            pinG.append('circle')
              .attr('r', 16)
              .attr('fill', pinColor)
              .attr('fill-opacity', 0.25)
              .attr('class', 'animate-ping');
          }

          pinG.append('circle')
            .attr('r', isCurrent ? 8 : 6)
            .attr('fill', pinColor)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', isCurrent ? '2.5px' : '1.5px')
            .style('filter', 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))');

          pinG.append('text')
            .attr('dy', isCurrent ? -12 : -10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f8fafc')
            .style('font-size', isCurrent ? '11px' : '9.5px')
            .style('font-weight', '800')
            .style('font-family', 'JetBrains Mono, monospace')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.9)')
            .text(`Step ${idx + 1}: ${stop.name}`);
        }
      }
    });
  },

  rotateTo(coords) {
    if (!this.projection) return;
    this.isAutoRotating = false;
    this.lastInteractionTime = Date.now();

    d3.transition()
      .duration(1100)
      .tween('rotate', () => {
        const r = d3.interpolate(this.projection.rotate(), [-coords[0], -coords[1]]);
        return (t) => {
          this.projection.rotate(r(t));
          this.updatePositions();
        };
      });
  },

  renderEvidencePanel() {
    const panel = document.getElementById('globeEvidencePanel');
    if (!panel) return;

    const sampleKey = this.activeSample;
    const trail = this.getSampleTrail(sampleKey);
    if (!trail || !trail.stops.length) return;

    const currentStop = trail.stops[this.activeStepIndex] || trail.stops[0];
    const role = window.TreeViewer ? window.TreeViewer.getSampleRole(sampleKey) : 'Member';
    const code = sampleKey.split('_')[0];

    const timelineStepsHtml = trail.stops.map((stop, idx) => {
      const isCurrent = idx === this.activeStepIndex;
      const isPast = idx < this.activeStepIndex;
      return `
        <button onclick="window.GlobeViewer.goToStep(${idx})" class="p-3 rounded-2xl text-left font-mono text-xs transition-all border ${isCurrent ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-lg shadow-sky-500/25' : (isPast ? 'bg-slate-950 border-emerald-800/80 text-emerald-300' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20')}">
          <div class="text-[10px] uppercase font-bold flex items-center justify-between">
            <span>Step ${idx + 1}</span>
            <span>${stop.ybp}</span>
          </div>
          <div class="font-sans font-bold text-xs truncate mt-0.5">${stop.name}</div>
        </button>
      `;
    }).join('');

    const mutationCardsHtml = currentStop.mutations.map(pos => {
      const evidence = this.MUTATION_MEANINGS[pos] || {
        locus: 'Mitochondrial DNA',
        change: 'Polymorphism',
        meaning: `Ancestral mutation at position m.${pos} confirming historical migration route.`
      };
      return `
        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5 font-mono text-xs">
          <div class="flex items-center justify-between border-b border-white/10 pb-1">
            <span class="font-extrabold text-sky-400 text-sm">m.${pos} ${evidence.change}</span>
            <span class="px-2 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] text-slate-300">${evidence.locus}</span>
          </div>
          <p class="text-slate-300 font-sans text-xs leading-relaxed pt-0.5">
            <strong>Biological &amp; Historical Evidence:</strong> ${evidence.meaning}
          </p>
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="space-y-5 font-sans">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 font-mono">
          <div>
            <div class="text-xs text-sky-400 font-bold uppercase tracking-wider">Lineage Migration Evidence: ${role} (${code})</div>
            <h3 class="text-lg font-extrabold text-white">Step ${this.activeStepIndex + 1} of ${trail.stops.length}: ${currentStop.name}</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-sky-950 text-sky-300 border border-sky-800 text-xs font-bold font-mono">
              ${currentStop.ybp}
            </span>
          </div>
        </div>

        <!-- 4-Step Interactive Timeline Stepper -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          ${timelineStepsHtml}
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
          <div class="text-[11px] text-slate-400 font-mono uppercase font-bold">Geographic &amp; Anthropological Context:</div>
          <p class="text-slate-200 text-xs leading-relaxed">
            ${currentStop.desc}
          </p>
        </div>

        <!-- Mutations Evidence -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between font-mono text-xs">
            <span class="font-bold text-emerald-400 uppercase tracking-wider">
              🧬 Mutation Evidence Proving Ancestral Habitation (${currentStop.mutations.length} Markers):
            </span>
            <span class="text-slate-400 text-[11px]">Historical Lineage Markers</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${mutationCardsHtml}
          </div>
        </div>

      </div>
    `;
  }
};
