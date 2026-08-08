/**
 * 3D Geo-Mitochondrial Migration Globe Viewer (D3.js Orthographic Projection)
 * Individualized per sample migration trail with progressive Out-of-Africa routes,
 * step-by-step interactive playback, and detailed mutation evidence mapping ("which mutations mean what").
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

  // Comprehensive Mutation Evidence Knowledge Base: "Which mutations mean what"
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
    14783: { locus: 'MT-CYB', change: 'T>C', meaning: 'Deepali maternal line diagnostic mutation in cytochrome b.' },
    15043: { locus: 'MT-CYB', change: 'G>A', meaning: 'High-confidence maternal variant confirming continuous generational inheritance in India.' },
    15692: { locus: 'MT-CYB', change: 'A>G', meaning: 'Diagnostic maternal cytochrome b mutation characteristic of North/Central Indian families.' },
    15859: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private maternal lineage anchor marker for Deepali and Rishi cohorts.' },
    5186: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic South Indian / Dravidian ancestral founder; proves prehistoric settlement of the Deccan Plateau.' },
    9094: { locus: 'MT-ATP6', change: 'G>A', meaning: 'South Indian regional haplogroup M/R (IS) lineage marker in ATP synthase.' },
    9614: { locus: 'MT-CO3', change: 'C>T', meaning: 'Southern South Asian diagnostic marker in cytochrome c oxidase subunit III.' },
    12793: { locus: 'MT-ND5', change: 'A>G', meaning: 'Conserved maternal variant in Vys and Rav maternal lines.' },
    13194: { locus: 'MT-ND5', change: 'T>C', meaning: 'Diagnostic Southern Indian maternal line signature.' },
    13656: { locus: 'MT-ND5', change: 'C>T', meaning: 'High-VAF maternal transmission anchor for South Indian cohort.' },
    15930: { locus: 'MT-TT (tRNA-Thr)', change: 'G>A', meaning: 'South Indian diagnostic tRNA mutation proving unmixed maternal continuity.' },
    5508: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic Western Indian / Gujarat coastal corridor marker; proves historical habitation in West India.' },
    8594: { locus: 'MT-ATP6', change: 'G>A', meaning: 'India West haplogroup J1/M founder mutation in ATP synthase.' },
    10084: { locus: 'MT-TG (tRNA-Gly)', change: 'T>C', meaning: 'Diagnostic maternal marker in tRNA-Gly for Raj & Anjali family line.' },
    10754: { locus: 'MT-ND4L', change: 'A>G', meaning: 'Western South Asian regional sub-clade diagnostic variant.' },
    11293: { locus: 'MT-ND4', change: 'C>T', meaning: 'Conserved complex I subunit variant in India West cohort.' },
    13635: { locus: 'MT-ND5', change: 'A>G', meaning: 'Diagnostic maternal anchor for Raj and Anjali family.' },
    13971: { locus: 'MT-ND5', change: 'T>C', meaning: 'High-confidence maternal variant confirming Western Indian lineage.' },
    14990: { locus: 'MT-CYB', change: 'A>G', meaning: 'Cytochrome b diagnostic marker for West Indian family clade.' },
    15385: { locus: 'MT-CYB', change: 'C>T', meaning: 'Private maternal signature for India West (IW) family line.' },
    511: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Diagnostic Indus Valley / Pakistan founder; proves ancient human occupation of the Indus basin.' },
    3594: { locus: 'MT-ND1', change: 'C>T', meaning: 'Haplogroup M/U Pakistani regional lineage marker in complex I.' },
    7269: { locus: 'MT-CO1', change: 'G>A', meaning: 'Diagnostic maternal variant for Wasim family line.' },
    7805: { locus: 'MT-CO2', change: 'C>T', meaning: 'High-confidence diagnostic marker in cytochrome c oxidase subunit II for Pakistan cohort.' },
    13680: { locus: 'MT-ND5', change: 'C>T', meaning: 'Indus Valley maternal lineage anchor variant.' },
    15479: { locus: 'MT-CYB', change: 'T>C', meaning: 'Private maternal diagnostic marker for Wasim family.' },
    650: { locus: 'MT-TF (tRNA-Phe)', change: 'C>T', meaning: 'Diagnostic Eastern European / Ukrainian Steppe founder; proves Mesolithic hunter-gatherer continuity.' },
    8395: { locus: 'MT-ATP8', change: 'A>G', meaning: 'Haplogroup U4/H founder marker in ATP synthase subunit 8.' },
    10885: { locus: 'MT-ND4', change: 'T>C', meaning: 'Ukrainian maternal lineage diagnostic variant in complex I.' },
    11566: { locus: 'MT-ND4', change: 'G>A', meaning: 'Conserved Eastern European regional lineage marker.' },
    14467: { locus: 'MT-ND6', change: 'A>G', meaning: 'Diagnostic maternal variant in NADH dehydrogenase subunit 6 for Ukraine cohort.' },
    16356: { locus: 'Control Region (D-loop)', change: 'T>C', meaning: 'Private maternal hypervariable signature for Nika family line.' },
    63: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Northeast Asian / Korean Peninsula diagnostic founder; proves ancient habitation across Manchuria & Korea.' },
    1709: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Haplogroup D4 Korean founder marker in 16S ribosomal RNA.' },
    2882: { locus: 'MT-RNR2 (16S rRNA)', change: 'C>T', meaning: 'Diagnostic Korean Peninsula maternal lineage variant.' },
    3010: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Conserved East Asian ribosomal RNA transition.' },
    8414: { locus: 'MT-ATP8', change: 'C>T', meaning: 'Korean regional lineage diagnostic marker in ATP8.' },
    9817: { locus: 'MT-CO3', change: 'G>A', meaning: 'Diagnostic maternal marker in cytochrome c oxidase subunit III for Korea cohort.' },
    13544: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-confidence maternal variant for Moo family line.' },
    15565: { locus: 'MT-CYB', change: 'C>T', meaning: 'Conserved Korean maternal cytochrome b signature.' },
    15669: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private diagnostic marker for Korea Moo family line.' },
    499: { locus: 'Control Region (D-loop)', change: 'G>A', meaning: 'Ancient Beringian transit marker; carried by founding ancestors entering North & Central America.' },
    4823: { locus: 'MT-ND2', change: 'C>T', meaning: 'Pre-Clovis Mesoamerican founder variant in complex I.' },
    6297: { locus: 'MT-CO1', change: 'T>C', meaning: 'Diagnostic Mesoamerican / Mexican Haplogroup B2 founder; proves ancestral lineage in Central America.' },
    8047: { locus: 'MT-CO2', change: 'A>G', meaning: 'Conserved maternal variant in cytochrome c oxidase subunit II for Mexico cohort.' },
    9039: { locus: 'MT-ATP6', change: 'G>A', meaning: 'Diagnostic Mesoamerican maternal marker for Cry family line.' },
    13590: { locus: 'MT-ND5', change: 'T>C', meaning: 'Private maternal signature for Mexico cohort in NADH dehydrogenase subunit 5.' },
    5821: { locus: 'MT-CO1', change: 'G>A', meaning: 'Diagnostic Southern China / Hong Kong coastal founder; proves early Holocene settlement along Pearl River Delta.' },
    6338: { locus: 'MT-CO1', change: 'C>T', meaning: 'Haplogroup M7 coastal East Asian founder marker in cytochrome c oxidase.' },
    6455: { locus: 'MT-CO1', change: 'C>T', meaning: 'Diagnostic South China regional lineage variant.' },
    8602: { locus: 'MT-ATP6', change: 'T>C', meaning: 'Conserved maternal variant in ATP synthase subunit 6 for Hong Kong cohort.' },
    9540: { locus: 'MT-CO3', change: 'T>C', meaning: 'Hong Kong diagnostic maternal marker in cytochrome c oxidase subunit III.' },
    14821: { locus: 'MT-CYB', change: 'A>G', meaning: 'Private maternal lineage anchor for Hong Kong Jan family.' },
    114: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Diagnostic South American / Andean Paleo-Indian founder; proves rapid Pacific coastal migration into South America.' },
    3552: { locus: 'MT-ND1', change: 'T>C', meaning: 'Haplogroup C1 founding lineage marker in complex I.' },
    8545: { locus: 'MT-ATP6', change: 'A>G', meaning: 'Diagnostic Colombian / Andean maternal variant in ATP synthase.' },
    9545: { locus: 'MT-CO3', change: 'A>G', meaning: 'Conserved South American indigenous lineage marker.' },
    11914: { locus: 'MT-ND4', change: 'G>A', meaning: 'High-confidence maternal variant for Colombia cohort.' },
    13263: { locus: 'MT-ND5', change: 'A>G', meaning: 'Diagnostic Andean maternal marker in complex I.' },
    15323: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private maternal lineage anchor for Colombia Alj family.' },
    183: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Ancestral Mitochondrial Eve root mutation; deep Sub-Saharan African maternal lineage marker.' },
    2758: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Haplogroup L2 deep African lineage anchor in 16S rRNA.' },
    5581: { locus: 'MT-ND2', change: 'A>G', meaning: 'Diagnostic Sub-Saharan African maternal variant in complex I.' },
    7175: { locus: 'MT-CO1', change: 'T>C', meaning: 'Conserved African maternal lineage marker in cytochrome c oxidase.' },
    9128: { locus: 'MT-ATP6', change: 'G>A', meaning: 'Deep African ATP synthase subunit 6 lineage marker for Ton family.' },
    11338: { locus: 'MT-ND4', change: 'A>G', meaning: 'Diagnostic Sub-Saharan African maternal anchor in complex I.' },
    13803: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-confidence African maternal variant in NADH dehydrogenase.' },
    14308: { locus: 'MT-ND6', change: 'T>C', meaning: 'Conserved Sub-Saharan maternal lineage marker.' },
    15784: { locus: 'MT-CYB', change: 'T>C', meaning: 'Private maternal diagnostic marker for African Ton family line.' },
    3394: { locus: 'MT-ND1', change: 'T>C', meaning: 'Iconic Tibetan high-altitude adaptation mutation; enhances mitochondrial oxygen affinity in extreme hypoxia ~30,000 YBP.' },
    4491: { locus: 'MT-ND2', change: 'G>A', meaning: 'Haplogroup M9 Tibetan Plateau founding lineage marker.' },
    8784: { locus: 'MT-ATP6', change: 'A>G', meaning: 'Diagnostic Himalayan plateau maternal variant in ATP synthase.' },
    12950: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-altitude adapted Tibetan maternal lineage anchor.' },
    14305: { locus: 'MT-ND6', change: 'C>T', meaning: 'Conserved Tibetan Plateau maternal marker in complex I.' },
    15535: { locus: 'MT-CYB', change: 'C>T', meaning: 'Diagnostic cytochrome b variant for Tibet cohort.' },
    16048: { locus: 'Control Region (D-loop)', change: 'G>A', meaning: 'Private maternal diagnostic marker for Tibetan Bha family.' },
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
    12007: { locus: 'MT-ND4', change: 'G>A', meaning: 'Private maternal diagnostic marker for Native North America R3 family line.' }
  },

  // Individualized Geographic Migration Trails per Sample (All Starting in Africa)
  SAMPLE_TRAILS: {
    'IN': {
      name: 'India — Central/North (Deepali & Rishi)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Homo sapiens mitochondrial cradle; basal human maternal genome baseline.' },
        { name: 'Southern Coastal Gateway', region: 'Red Sea / Arabian Crossing', coords: [45.0792, 14.5000], ybp: '60,000 YBP', mutations: [1438, 2706, 4769], desc: 'Early modern humans expand across the Bab-el-Mandeb coastal corridor into Southern Asia.' },
        { name: 'Indus-Gangetic Basin', region: 'North India', coords: [77.2090, 28.6139], ybp: '50,000 YBP', mutations: [593, 5075, 6020], desc: 'Establishment of early indigenous South Asian hunter-gatherer maternal lineages.' },
        { name: 'Central/North Indian Homeland', region: 'Central India (Deepali & Rishi)', coords: [78.9629, 20.5937], ybp: '35,000 YBP to Present', mutations: [10400, 12792, 14783, 15043, 15692, 15859], desc: 'Family lineage established with private maternal diagnostic variants passed across generations.' }
      ]
    },
    'IS': {
      name: 'India South (Vys, Rav & Sel)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'African origin of human mitochondrial genome.' },
        { name: 'Southern Coastal Gateway', region: 'Arabian Sea Coastal Trail', coords: [55.0000, 22.0000], ybp: '60,000 YBP', mutations: [1438, 2706, 4769], desc: 'Coastal beachcomber migration along the Indian Ocean rim.' },
        { name: 'Deccan Plateau', region: 'Peninsular South India', coords: [77.5946, 12.9716], ybp: '45,000 YBP', mutations: [5186, 9094, 9614], desc: 'Establishment of deep Dravidian / South Indian ancestral macro-haplogroup M/R clades.' },
        { name: 'South Indian Ancestral Home', region: 'Tamil Nadu / Karnataka (Vys/Rav)', coords: [80.2707, 13.0827], ybp: '30,000 YBP to Present', mutations: [12793, 13194, 13656, 15930], desc: 'Private maternal diagnostic markers proving uninterrupted matrilineal descent.' }
      ]
    },
    'IW': {
      name: 'India West (Raj & Anjali)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Mitochondrial Eve cradle in Sub-Saharan Africa.' },
        { name: 'Arabian Gulf Crossing', region: 'Gulf of Oman Corridor', coords: [58.5000, 23.6000], ybp: '55,000 YBP', mutations: [1438, 2706, 4769], desc: 'Out-of-Africa coastal transit into Western South Asia.' },
        { name: 'Kathiawar & Gujarat Corridor', region: 'Western India Coast', coords: [71.5000, 22.0000], ybp: '45,000 YBP', mutations: [5508, 8594, 10084, 10754], desc: 'Ancient habitation along the fertile estuaries of Western India.' },
        { name: 'West Indian Homeland', region: 'Gujarat / Maharashtra (Raj & Family)', coords: [73.1812, 22.3072], ybp: '35,000 YBP to Present', mutations: [11293, 13635, 13971, 14990, 15385], desc: 'Diagnostic maternal markers proving West Indian lineage continuity.' }
      ]
    },
    'PK': {
      name: 'Pakistan (Wasim Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Common human maternal origin in East Africa.' },
        { name: 'Makran Coast Route', region: 'Southern Coastal Corridor', coords: [63.0000, 25.5000], ybp: '55,000 YBP', mutations: [1438, 2706, 4769], desc: 'Migration route along the Makran coastline into the Indus Valley.' },
        { name: 'Lower Indus Gateway', region: 'Indus River Basin', coords: [68.3578, 25.3960], ybp: '40,000 YBP', mutations: [511, 3594], desc: 'Establishment of ancient Indus civilization ancestral maternal lineages.' },
        { name: 'Indus Valley Homeland', region: 'Punjab / Sindh, Pakistan (Wasim)', coords: [69.3451, 30.3753], ybp: '25,000 YBP to Present', mutations: [7269, 7805, 13680, 15479], desc: 'Wasim family diagnostic markers proving continuous regional matrilineal transmission.' }
      ]
    },
    'UK': {
      name: 'Ukraine (Nika Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Ancient African cradle of modern humans.' },
        { name: 'Levantine Corridor', region: 'Near East / Anatolia', coords: [35.5000, 33.5000], ybp: '50,000 YBP', mutations: [1438, 2706, 7028], desc: 'Out-of-Africa northern expansion through the Middle East into Europe.' },
        { name: 'Pontic-Caspian Steppe', region: 'Black Sea Basin', coords: [33.0000, 46.0000], ybp: '40,000 YBP', mutations: [650, 8395], desc: 'Haplogroup U4/H hunter-gatherer expansion across Eastern Europe.' },
        { name: 'Ukrainian Homeland', region: 'Dnipro / Kyiv Region (Nika)', coords: [31.1656, 48.3794], ybp: '25,000 YBP to Present', mutations: [10885, 11566, 14467, 16356], desc: 'Maternal pedigree lineage verified from UK_F_NIKG to UK_F_NIKM to offspring.' }
      ]
    },
    'KR': {
      name: 'Korea (Moo Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Mitochondrial origin in East Africa.' },
        { name: 'Central Asian Steppe Trail', region: 'Altai / Central Asia', coords: [85.0000, 48.0000], ybp: '50,000 YBP', mutations: [1438, 2706, 4769], desc: 'Northern Eurasian route establishing East Asian macro-haplogroups.' },
        { name: 'Manchurian Basin', region: 'Northeast Asia', coords: [123.0000, 42.0000], ybp: '35,000 YBP', mutations: [63, 1709, 2882, 3010], desc: 'Establishment of Haplogroup D4 founding maternal clades.' },
        { name: 'Korean Peninsula', region: 'Korea (Moo Family)', coords: [127.7669, 35.9078], ybp: '20,000 YBP to Present', mutations: [8414, 9817, 13544, 15565, 15669], desc: 'Diagnostic maternal markers proving Korean matrilineal continuity.' }
      ]
    },
    'MX': {
      name: 'Mexico (Cry Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Universal human mitochondrial Eve origin in Africa.' },
        { name: 'Siberian-Beringian Transit', region: 'Bering Strait Bridge', coords: [-168.0000, 65.5000], ybp: '25,000 YBP', mutations: [1438, 2706, 499, 4823], desc: 'Ancestors cross the Bering Land Bridge during the Last Glacial Maximum (LGM).' },
        { name: 'Pacific Coastal Corridor', region: 'Northwest America', coords: [-122.0000, 47.0000], ybp: '18,000 YBP', mutations: [6297, 8047], desc: 'Rapid southward migration along the deglaciated Pacific coast.' },
        { name: 'Mesoamerican Homeland', region: 'Central Mexico (Cry Family)', coords: [-102.5528, 23.6345], ybp: '15,000 YBP to Present', mutations: [9039, 13590], desc: 'Haplogroup B2 founder lineage establishing Mexican maternal roots.' }
      ]
    },
    'HK': {
      name: 'Hong Kong (Jan Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Ancestral African cradle.' },
        { name: 'Southeast Asian Coastal Route', region: 'Sunda Shelf', coords: [100.0000, 15.0000], ybp: '50,000 YBP', mutations: [1438, 2706, 4769], desc: 'Coastal migration into South and East Asia.' },
        { name: 'South China Coast', region: 'Guangdong Coastal Basin', coords: [113.0000, 23.0000], ybp: '35,000 YBP', mutations: [5821, 6338, 6455], desc: 'Haplogroup M7 expansion along the Pearl River estuary.' },
        { name: 'Hong Kong Homeland', region: 'Hong Kong (Jan Family)', coords: [114.1694, 22.3193], ybp: '25,000 YBP to Present', mutations: [8602, 9540, 14821], desc: 'Private maternal diagnostic variants passed from HK_F_JAN to offspring.' }
      ]
    },
    'CL': {
      name: 'Colombia (Alj Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Out-of-Africa origin in East Africa.' },
        { name: 'Beringian Crossing', region: 'Beringia to Alaska', coords: [-160.0000, 64.0000], ybp: '22,000 YBP', mutations: [1438, 2706, 3552], desc: 'Early Paleo-Indian founders enter the American continent.' },
        { name: 'Isthmus of Panama', region: 'Central to South America Gateway', coords: [-79.5000, 9.0000], ybp: '16,000 YBP', mutations: [114, 8545, 9545], desc: 'Pioneering expansion across the Panamanian land bridge into South America.' },
        { name: 'Andean South America', region: 'Colombia (Alj Family)', coords: [-74.2973, 4.5709], ybp: '14,000 YBP to Present', mutations: [11914, 13263, 15323], desc: 'Haplogroup C1 maternal lineage proving South American indigenous continuity.' }
      ]
    },
    'TB': {
      name: 'Tibet (Bha Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Mitochondrial Eve cradle.' },
        { name: 'Central Asian Gateway', region: 'Silk Road / Tarim Basin', coords: [75.0000, 38.0000], ybp: '50,000 YBP', mutations: [1438, 2706, 4769], desc: 'High-altitude migration corridor along ancient Central Asian trade routes.' },
        { name: 'Himalayan High-Altitude Plateau', region: 'Tibetan Plateau', coords: [88.0924, 31.6927], ybp: '30,000 YBP', mutations: [3394, 4491], desc: 'Acquisition of the famous m.3394 T>C ND1 oxygen-adaptation mutation for high-altitude hypoxia survival.' },
        { name: 'Tibetan Homeland', region: 'Lhasa / Qinghai-Tibet Plateau (Bha)', coords: [91.1000, 29.6500], ybp: '20,000 YBP to Present', mutations: [8784, 12950, 14305, 15535, 16048], desc: 'Haplogroup M9 maternal lineage preserved across generations in Tibet.' }
      ]
    },
    'AA': {
      name: 'African (Ton Family)',
      stops: [
        { name: 'Mitochondrial Eve Origin', region: 'East African Rift Valley', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [183, 2758], desc: 'Root of all human maternal lineages across the globe.' },
        { name: 'Sub-Saharan African Expansion', region: 'West-Central Africa', coords: [8.6753, 9.0820], ybp: '100,000 YBP to Present', mutations: [5581, 7175, 9128, 11338, 13803, 14308, 15784], desc: 'Haplogroup L2 deep ancestral continuity in Sub-Saharan Africa.' }
      ]
    },
    'CA': {
      name: 'Canada / Caucasian (Ger Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'African cradle of modern humans.' },
        { name: 'European Expansion', region: 'Central Europe', coords: [10.0000, 50.0000], ybp: '35,000 YBP', mutations: [73, 146, 4769], desc: 'Haplogroup H2 European agricultural expansion.' },
        { name: 'Trans-Atlantic Settlement', region: 'Canada (Ger Family)', coords: [-106.3468, 56.1304], ybp: 'Modern', mutations: [263, 750], desc: 'Trans-Atlantic migration establishing modern Canadian Caucasian family line.' }
      ]
    },
    'NA': {
      name: 'Native North America (R3 Family)',
      stops: [
        { name: 'East African Cradle', region: 'Rift Valley, Africa', coords: [38.7578, 8.9806], ybp: '150,000–200,000 YBP', mutations: [263, 750], desc: 'Universal human maternal root in Africa.' },
        { name: 'Beringian Pre-Clovis Founder', region: 'Beringia Refuge', coords: [-165.0000, 65.0000], ybp: '22,000 YBP', mutations: [64, 152, 235, 663, 1736], desc: 'Isolation in Beringia establishing Native American Haplogroup A2.' },
        { name: 'North American Indigenous Homeland', region: 'Sub-Arctic / North America (R3)', coords: [-149.4937, 64.2008], ybp: '15,000 YBP to Present', mutations: [4248, 4824, 8027, 8794, 12007], desc: 'Continuous indigenous maternal lineage in North America.' }
      ]
    }
  },

  init(geoData, migrationData) {
    this.geoData = geoData;
    this.migrationData = migrationData;
    this.render();
    this.bindEvents();
    this.startAutoRotation();
    this.renderEvidencePanel();
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      if (document.getElementById('globeContainer')) {
        this.render();
      }
    });

    const sampleSelect = document.getElementById('globeSampleSelect');
    if (sampleSelect) {
      sampleSelect.addEventListener('change', (e) => {
        this.setSample(e.target.value);
      });
    }

    const playBtn = document.getElementById('playMigrationTrailBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.playTrail();
      });
    }
  },

  setSample(sampleKey) {
    const code = sampleKey.split('_')[0];
    this.activeSample = code;
    this.activeStepIndex = 0;
    
    const trail = this.SAMPLE_TRAILS[code] || this.SAMPLE_TRAILS['IN'];
    if (trail && trail.stops.length > 0) {
      this.rotateTo(trail.stops[0].coords);
    }
    this.renderEvidencePanel();
    this.updatePositions();
  },

  playTrail() {
    const code = this.activeSample;
    const trail = this.SAMPLE_TRAILS[code] || this.SAMPLE_TRAILS['IN'];
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
    const code = this.activeSample;
    const trail = this.SAMPLE_TRAILS[code] || this.SAMPLE_TRAILS['IN'];
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
        this.projection.rotate([rotate[0] + 0.25, rotate[1]]);
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
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#0c0a09')
      .style('border-radius', '1rem')
      .style('cursor', 'grab');

    const g = svg.append('g');
    this.svgG = g;

    // Initial Projection Setup
    this.projection = d3.geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .rotate([-25, -15]);

    this.pathGenerator = d3.geoPath().projection(this.projection);

    // 1. Render Outer Atmosphere Glow & Ocean Sphere
    const oceanG = g.append('g').attr('class', 'ocean-layer');
    
    const defs = svg.append('defs');
    const grad = defs.append('radialGradient')
      .attr('id', 'globeGlow')
      .attr('cx', '35%')
      .attr('cy', '35%')
      .attr('r', '65%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#27272a');
    grad.append('stop').attr('offset', '70%').attr('stop-color', '#18181b');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#09090b');

    oceanG.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', radius)
      .attr('fill', 'url(#globeGlow)')
      .attr('stroke', '#f97316')
      .attr('stroke-width', '1.8px')
      .attr('stroke-opacity', '0.6')
      .style('filter', 'drop-shadow(0 0 25px rgba(249, 115, 22, 0.15))');

    // 2. Graticules
    const graticule = d3.geoGraticule()();
    g.append('path')
      .attr('class', 'graticule-layer')
      .attr('d', this.pathGenerator(graticule))
      .attr('fill', 'none')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', '0.8px')
      .attr('stroke-opacity', '0.35')
      .attr('stroke-dasharray', '3 3');

    // 3. Landmass Features
    if (this.geoData && this.geoData.features) {
      g.append('g')
        .attr('class', 'land-layer')
        .selectAll('path')
        .data(this.geoData.features)
        .enter()
        .append('path')
        .attr('class', 'land-feature')
        .attr('d', this.pathGenerator)
        .attr('fill', '#27272a')
        .attr('fill-opacity', '0.85')
        .attr('stroke', '#52525b')
        .attr('stroke-width', '1.2px')
        .attr('stroke-opacity', '0.6');
    }

    // 4. Individualized Migration Arcs Layer
    g.append('g').attr('class', 'migration-arcs-layer');

    // 5. Continental Stops & Pins Layer
    g.append('g').attr('class', 'markers-layer');

    // Drag-to-Rotate Handler
    const self = this;
    const drag = d3.drag()
      .on('start', function() {
        self.isAutoRotating = false;
        self.lastInteractionTime = Date.now();
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('drag', function(event) {
        self.lastInteractionTime = Date.now();
        const rotate = self.projection.rotate();
        const k = 75 / self.projection.scale();
        self.projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        self.updatePositions();
      })
      .on('end', function() {
        d3.select(this).style('cursor', 'grab');
        self.lastInteractionTime = Date.now();
      });

    svg.call(drag);

    // Initial render of trail positions
    this.updatePositions();
  },

  updatePositions() {
    if (!this.svgG || !this.projection) return;

    const path = this.pathGenerator;
    const rotate = this.projection.rotate();
    const centerLonLat = [-rotate[0], -rotate[1]];

    // Update Graticule & Land
    this.svgG.select('.graticule-layer').attr('d', path(d3.geoGraticule()()));
    this.svgG.selectAll('.land-feature').attr('d', path);

    const code = this.activeSample;
    const trail = this.SAMPLE_TRAILS[code] || this.SAMPLE_TRAILS['IN'];
    if (!trail || !trail.stops) return;

    // Draw Great-Circle Progressive Arcs for this Individualized Sample
    const arcsGroup = this.svgG.select('.migration-arcs-layer');
    arcsGroup.html('');

    for (let i = 0; i < trail.stops.length - 1; i++) {
      const fromStop = trail.stops[i];
      const toStop = trail.stops[i + 1];

      const isCurrentHop = i === (this.activeStepIndex - 1) || (i === 0 && this.activeStepIndex === 0);

      const geoLine = {
        type: 'LineString',
        coordinates: [fromStop.coords, toStop.coords]
      };

      const arcPathStr = path(geoLine);
      if (arcPathStr) {
        arcsGroup.append('path')
          .attr('d', arcPathStr)
          .attr('fill', 'none')
          .attr('stroke', isCurrentHop ? '#f59e0b' : '#ea580c')
          .attr('stroke-width', isCurrentHop ? '3.5px' : '2.2px')
          .attr('stroke-opacity', isCurrentHop ? '0.95' : '0.6')
          .attr('stroke-dasharray', isCurrentHop ? '6 3' : '4 2')
          .attr('class', 'migration-arc');
      }
    }

    // Draw Individualized Geographic Stop Pins
    const markersGroup = this.svgG.select('.markers-layer');
    markersGroup.html('');

    trail.stops.forEach((stop, idx) => {
      const isVisible = d3.geoDistance(stop.coords, centerLonLat) < (Math.PI / 2 - 0.08);
      if (!isVisible) return;

      const screenPos = this.projection(stop.coords);
      if (!screenPos) return;

      const [x, y] = screenPos;
      const isActive = idx === this.activeStepIndex;
      const color = isActive ? '#f59e0b' : (idx === 0 ? '#10b981' : '#f97316');

      const pinG = markersGroup.append('g')
        .attr('transform', `translate(${x},${y})`)
        .attr('class', `marker-pin cursor-pointer`)
        .on('click', (e) => {
          e.stopPropagation();
          this.goToStep(idx);
        });

      // Outer Ping / Halo
      pinG.append('circle')
        .attr('r', isActive ? 18 : 11)
        .attr('fill', color)
        .attr('fill-opacity', isActive ? 0.35 : 0.2)
        .attr('stroke', color)
        .attr('stroke-width', '1.5px')
        .attr('class', isActive ? 'animate-ping' : '');

      // Core Node
      pinG.append('circle')
        .attr('r', isActive ? 8 : 6)
        .attr('fill', isActive ? '#ffffff' : color)
        .attr('stroke', isActive ? color : '#09090b')
        .attr('stroke-width', '2px');

      // Label Badge
      const textG = pinG.append('g').attr('transform', 'translate(12, -2)');
      const labelText = `${idx + 1}. ${stop.name}`;
      
      textG.append('rect')
        .attr('x', -4)
        .attr('y', -10)
        .attr('width', (labelText.length * 7.2) + 12)
        .attr('height', 18)
        .attr('rx', 6)
        .attr('fill', '#09090b')
        .attr('fill-opacity', '0.9')
        .attr('stroke', color)
        .attr('stroke-width', isActive ? '1.5px' : '1px');

      textG.append('text')
        .attr('x', 2)
        .attr('y', 2)
        .attr('fill', isActive ? '#ffffff' : color)
        .style('font-size', '10.5px')
        .style('font-weight', 'bold')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(labelText);
    });
  },

  rotateTo(coords) {
    if (!this.projection) return;
    this.isAutoRotating = false;
    this.lastInteractionTime = Date.now();

    const targetRotate = [-coords[0], -coords[1]];
    const currentRotate = this.projection.rotate();

    d3.transition()
      .duration(900)
      .tween('rotate', () => {
        const rInterp = d3.interpolate(currentRotate, targetRotate);
        return (t) => {
          this.projection.rotate(rInterp(t));
          this.updatePositions();
        };
      });
  },

  renderEvidencePanel() {
    const container = document.getElementById('globeEvidencePanel');
    if (!container) return;

    const code = this.activeSample;
    const trail = this.SAMPLE_TRAILS[code] || this.SAMPLE_TRAILS['IN'];
    if (!trail) return;

    const currentStop = trail.stops[this.activeStepIndex] || trail.stops[0];

    // Build timeline stepper pills
    const stepperHtml = trail.stops.map((s, idx) => {
      const active = idx === this.activeStepIndex;
      return `
        <button onclick="window.GlobeViewer.goToStep(${idx})" class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${active ? 'bg-orange-600 text-stone-950 shadow-md shadow-orange-600/30' : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'}">
          ${idx + 1}. ${s.name}
        </button>
      `;
    }).join(' ➔ ');

    // Map out which mutations mean what for this stop
    const mutationsHtml = currentStop.mutations.map(mPos => {
      const info = this.MUTATION_MEANINGS[mPos] || {
        locus: 'Mitochondrial Genome',
        change: 'A>G',
        meaning: `Diagnostic lineage polymorphism at nucleotide position ${mPos}.`
      };

      return `
        <div class="p-3.5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-1.5 shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>m.${mPos} ${info.change}</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono font-bold">
              ${info.locus}
            </span>
          </div>
          <p class="text-[11.5px] text-stone-300 font-sans leading-relaxed">
            <strong class="text-orange-400">Historical & Biological Meaning:</strong> ${info.meaning}
          </p>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4 font-mono">
        
        <!-- Active Stop Header Card -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-orange-500/50 shadow-xl space-y-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
            <div>
              <span class="text-[10px] text-orange-400 uppercase font-bold tracking-wider">Historical Progression • Step ${this.activeStepIndex + 1} of ${trail.stops.length}</span>
              <h4 class="text-base font-extrabold text-stone-100 flex items-center gap-2">
                <span>📍 ${currentStop.name} (${currentStop.region})</span>
              </h4>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-orange-950 text-orange-300 border border-orange-800 text-xs font-bold font-mono">
              ⏳ ${currentStop.ybp}
            </span>
          </div>
          <p class="text-xs text-stone-300 font-sans leading-relaxed">
            ${currentStop.desc}
          </p>
        </div>

        <!-- Stepper Navigation -->
        <div class="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span class="text-xs font-bold text-stone-400 uppercase mr-1">Journey Trail:</span>
          ${stepperHtml}
        </div>

        <!-- Mutation Evidence Knowledge Cards -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧬 Genetic Evidence That Ancestors Lived Here (${currentStop.mutations.length} Markers)</span>
            </h5>
            <span class="text-[10px] text-stone-400 font-sans">Mutation mapping & meaning</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${mutationsHtml}
          </div>
        </div>

      </div>
    `;
  }
};
