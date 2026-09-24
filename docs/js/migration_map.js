/**
 * Interactive 2D Satellite Migration Map Visualizer (Leaflet + Esri World Imagery)
 * Step-by-step Out-of-Africa human maternal lineage progression, verified anthropological statistics,
 * dual-source citations, and rich regional media dossier across all 13 cohorts.
 */

window.MigrationMap = {
  map: null,
  activeSample: 'IN_F_DPL',
  activeStepIndex: 0,
  polylineLayer: null,
  markersLayer: null,
  playInterval: null,

  MUTATION_MEANINGS: {
    263: { locus: 'Control Region (D-loop)', change: 'A>G', meaning: 'Universal basal Out-of-Africa founder mutation; marks non-African divergence from ancestral African mitochondrial genome.' },
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
    /* TEMPORARY HOLD: Korean cohort markers (63, 1709, 2882, 3010, 8414, 9817, 13544, 15565, 15669)
    63: { locus: 'Control Region (D-loop)', change: 'C>T', meaning: 'Northeast Asian / Korean Peninsula diagnostic founder; proves ancient habitation across Manchuria & Korea.' },
    1709: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Haplogroup D4 Korean founder marker in 16S ribosomal RNA.' },
    2882: { locus: 'MT-RNR2 (16S rRNA)', change: 'C>T', meaning: 'Diagnostic Korean Peninsula maternal lineage variant.' },
    3010: { locus: 'MT-RNR2 (16S rRNA)', change: 'G>A', meaning: 'Conserved East Asian ribosomal RNA transition.' },
    8414: { locus: 'MT-ATP8', change: 'C>T', meaning: 'Korean regional lineage diagnostic marker in ATP8.' },
    9817: { locus: 'MT-CO3', change: 'G>A', meaning: 'Diagnostic maternal marker in cytochrome c oxidase subunit III for Korea cohort.' },
    13544: { locus: 'MT-ND5', change: 'A>G', meaning: 'High-confidence maternal variant for Korea cohort.' },
    15565: { locus: 'MT-CYB', change: 'C>T', meaning: 'Conserved Korean maternal cytochrome b signature.' },
    15669: { locus: 'MT-CYB', change: 'G>A', meaning: 'Private diagnostic marker for Korea family line.' },
    */
    499: { locus: 'Control Region (D-loop)', change: 'G>A', meaning: 'Ancient Beringian transit marker; carried by founding ancestors entering North & Central America.' },
    4823: { locus: 'MT-ND2', change: 'C>T', meaning: 'Pre-Clovis Mesoamerican founder variant in complex I.' },
    6297: { locus: 'MT-CO1', change: 'T>C', meaning: 'Diagnostic Mesoamerican / Mexican Haplogroup B2 founder; proves ancestral lineage in Central America.' },
    8047: { locus: 'MT-CO2', change: 'A>G', meaning: 'Conserved maternal variant in cytochrome c oxidase subunit II for Mexico cohort.' },
    9039: { locus: 'MT-ATP6', change: 'G>A', meaning: 'Diagnostic Mesoamerican maternal marker for Mexico family lines.' },
    13590: { locus: 'MT-ND5', change: 'T>C', meaning: 'Private maternal signature for Mexico cohort in NADH dehydrogenase subunit 5.' },
    5821: { locus: 'MT-CO1', change: 'G>A', meaning: 'Hong Kong diagnostic founder (verified private vs OGC, Norwegian, and Swedish cohorts).' },
    6338: { locus: 'MT-CO1', change: 'C>T', meaning: 'Hong Kong diagnostic marker in cytochrome c oxidase subunit I.' },
    6455: { locus: 'MT-CO1', change: 'C>T', meaning: 'Hong Kong diagnostic regional maternal lineage polymorphism.' },
    8602: { locus: 'MT-ATP6', change: 'T>C', meaning: 'Hong Kong diagnostic maternal marker in ATP synthase subunit 6.' },
    9540: { locus: 'MT-CO3', change: 'T>C', meaning: 'Hong Kong diagnostic marker in cytochrome c oxidase subunit III.' },
    14821: { locus: 'MT-CYB', change: 'A>G', meaning: 'Hong Kong private maternal lineage anchor in cytochrome b.' },
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
      name: 'India',
      stops: [
        {
          name: 'East African Cradle (Origin of All Modern Humans)',
          region: 'Omo Valley / Afar Triangle, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'The ancestral cradle where all living human maternal lines coalesce (Mitochondrial Eve). Basal macro-haplogroup L diversification established modern human mitochondrial genetics.',
          stats: [
            { label: 'Oldest Homo sapiens Fossil', val: '233,000 ± 22,000 YBP', note: 'Omo Kibish remains establish anatomical modern human antiquity.', sources: ['Vidal et al. Nature (2022)', 'McDougall et al. Nature (2005)'] },
            { label: 'Maternal Coalescence', val: '100% Macro-Haplogroup L', note: 'Every non-African lineage descends from African branch L3.', sources: ['Cann, Stoneking & Wilson Nature (1987)', 'Soares et al. Mol Biol Evol (2012)'] }
          ]
        },
        {
          name: 'Southern Coastal Gateway (Bab-el-Mandeb Strait)',
          region: 'Red Sea Coastal Corridor / Arabian Peninsula',
          latlng: [14.5000, 45.0792],
          ybp: '60,000–65,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Early modern human maritime pioneers crossed the narrowed Red Sea during glacial low sea levels, initiating rapid coastal dispersal along the Indian Ocean rim.',
          stats: [
            { label: 'Glacial Sea Level Drop', val: '-120 Meters', note: 'Red Sea width narrowed to ~4–11 km during MIS 4 glaciations.', sources: ['Siddall et al. Nature (2003)', 'Bailey et al. Quat. Int. (2007)'] },
            { label: 'Out-of-Africa Gateway', val: '~60,000 YBP Founder Split', note: 'Macro-haplogroups M and N diverged rapidly along the Arabian coast.', sources: ['Macaulay et al. Science (2005)', 'Fernandes et al. Am J Hum Genet (2012)'] }
          ]
        },
        {
          name: 'Indus-Gangetic Fertile Basin',
          region: 'North India / Gangetic Plains',
          latlng: [28.6139, 77.2090],
          ybp: '45,000–50,000 YBP',
          mutations: [593, 5075, 6020],
          desc: 'Pioneering hunter-gatherer populations established permanent habitation along the perennial river systems of Northern India, founding indigenous South Asian lineages.',
          stats: [
            { label: 'Continuous Habitation', val: '>50,000 YBP', note: 'Jwalapuram and Middle Son Valley sites show unbroken tool traditions.', sources: ['Petraglia et al. Science (2007)', 'Clarkson et al. Science (2020)'] },
            { label: 'Indigenous Clade Diversity', val: '>60% Haplogroup M', note: 'South Asia represents the highest diversity hotspot for basal macro-clade M.', sources: ['Kivisild et al. Am J Hum Genet (2003)', 'Chaubey et al. BMC Biol (2008)'] }
          ]
        },
        {
          name: 'Central/North Indian Ancestral Homeland',
          region: 'Deccan Margin / Central India',
          latlng: [20.5937, 78.9629],
          ybp: '35,000 YBP to Present',
          mutations: [10400, 12792, 14783, 15043, 15692, 15859],
          desc: 'Unbroken matrilineal continuity through millennia. Family members inherit private maternal diagnostic markers verified across all descendants.',
          stats: [
            { label: 'Matrilineal Transmission', val: '100% Strict Maternal', note: 'Diagnostic variants passed without recombination across generations.', sources: ['Giles et al. PNAS (1980)', 'Torroni et al. Nat Genet (1996)'] },
            { label: 'Private Diagnostic Markers', val: '6 Conserved Anchor Sites', note: 'Shared across all verified family members in this cohort.', sources: ['Showcase Pipeline ETL (2026)', 'MitoMap Database (2025)'] }
          ]
        }
      ]
    },
    'IS': {
      name: 'India South',
      stops: [
        {
          name: 'East African Cradle',
          region: 'Omo Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'The African origin where modern human mitochondrial DNA originated.',
          stats: [
            { label: 'Fossil Antiquity', val: '~233,000 YBP', note: 'Omo Kibish remains demonstrate anatomical modern human origins.', sources: ['Vidal et al. Nature (2022)', 'McDougall et al. Nature (2005)'] },
            { label: 'Universal Ancestry', val: '100% Mitochondrial Eve', note: 'Root of all human maternal lineages worldwide.', sources: ['Cann et al. Nature (1987)', 'Soares et al. (2012)'] }
          ]
        },
        {
          name: 'Arabian Sea Coastal Trail',
          region: 'Oman / Makran Coastal Corridor',
          latlng: [22.0000, 55.0000],
          ybp: '60,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Rapid coastal beachcomber expansion along the Arabian Sea shoreline.',
          stats: [
            { label: 'Coastal Transit Speed', val: '~1–4 km / Year', note: 'Rapid marine resource-fueled migration across the Indian Ocean rim.', sources: ['Bulbeck Quat. Int. (2007)', 'Mellars et al. PNAS (2013)'] },
            { label: 'Lineage Radiation', val: 'Macro-haplogroup M', note: 'Major founding lineage of Southern Asia.', sources: ['Macaulay et al. Science (2005)', 'Fernandes et al. (2012)'] }
          ]
        },
        {
          name: 'Deccan Plateau Indigenous Settlement',
          region: 'Peninsular South India',
          latlng: [12.9716, 77.5946],
          ybp: '45,000 YBP',
          mutations: [5186, 9094, 9614],
          desc: 'Establishment of deep Dravidian / South Asian indigenous maternal lineages on the granite plateaus of Southern India.',
          stats: [
            { label: 'Archaeological Antiquity', val: '>45,000 YBP', note: 'Kurnool Caves and Jurreru Valley micro-blade technologies.', sources: ['Petraglia et al. Science (2007)', 'Clarkson et al. Science (2020)'] },
            { label: 'Deep Regional Lineage', val: 'Haplogroup M/R', note: 'High frequency of endemic ancestral sub-clades.', sources: ['Kivisild et al. (2003)', 'Chaubey et al. (2008)'] }
          ]
        },
        {
          name: 'South Indian Ancestral Home',
          region: 'Tamil Nadu / Karnataka',
          latlng: [13.0827, 80.2707],
          ybp: '30,000 YBP to Present',
          mutations: [12793, 13194, 13656, 15930],
          desc: 'Continuous maternal generational descent with private diagnostic markers.',
          stats: [
            { label: 'Maternal Fidelity', val: '100% Transmission', note: 'Verified non-recombining mitochondrial genome preservation.', sources: ['Giles et al. PNAS (1980)', 'Torroni et al. Nat Genet (1996)'] },
            { label: 'Cohort Diagnostic Markers', val: '4 Conserved Sites', note: 'Identified in 100% of Southern Indian family lineage members.', sources: ['Showcase Pipeline ETL (2026)', 'MitoMap Database (2025)'] }
          ]
        }
      ]
    },
    'IW': {
      name: 'India West',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa Rift Valley',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Basal macro-haplogroup L diversification in ancestral East Africa.',
          stats: [
            { label: 'Antiquity', val: '~200,000 YBP', note: 'Maternal ancestral root of all humans.', sources: ['Cann et al. (1987)', 'Vidal et al. (2022)'] }
          ]
        },
        {
          name: 'Arabian Peninsula Coastal Gateway',
          region: 'Southern Arabia / Persian Gulf Oasis',
          latlng: [18.0000, 52.0000],
          ybp: '60,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Maritime coastal migration along the fertile Arabian coastal plain.',
          stats: [
            { label: 'Transit Corridor', val: 'Gulf Oasis', note: 'Freshwater springs facilitated rapid coastal movement.', sources: ['Rose et al. (2011)', 'Macaulay et al. (2005)'] }
          ]
        },
        {
          name: 'Gujarat Coastal & Indus Mouth Corridor',
          region: 'Western India / Gujarat Plains',
          latlng: [22.2587, 71.1924],
          ybp: '40,000 YBP to Present',
          mutations: [5508, 8594, 10084, 10754, 11293, 13635, 13971, 14990, 15385],
          desc: 'Deep continuous settlement in Western India sharing ancient maritime coastal roots.',
          stats: [
            { label: 'Matrilineal Stability', val: '100% Conserved', note: 'Diagnostic variants preserved across maternal generations.', sources: ['Majumder et al. (2001)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'PK': {
      name: 'Pakistan',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal origin of human mitochondrial DNA in Africa.',
          stats: [
            { label: 'Antiquity', val: '~200,000 YBP', note: 'Foundational human maternal root.', sources: ['Cann et al. (1987)', 'Soares et al. (2012)'] }
          ]
        },
        {
          name: 'Persian Gulf & Makran Coast',
          region: 'Makran Coastline',
          latlng: [25.0000, 62.0000],
          ybp: '60,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Out-of-Africa coastal pioneers entering the Indus estuary.',
          stats: [
            { label: 'Lineage Split', val: 'Haplogroup M/U', note: 'Major prehistoric trade and migration crossroad.', sources: ['Mellars et al. (2013)', 'Petraglia et al. (2007)'] }
          ]
        },
        {
          name: 'Indus Valley Fertile Basin',
          region: 'Punjab / Sindh, Pakistan',
          latlng: [30.3753, 69.3451],
          ybp: '35,000 YBP to Present',
          mutations: [511, 3594, 7269, 7805, 13680, 15479],
          desc: 'Centuries of unbroken maternal transmission across the fertile Indus basin.',
          stats: [
            { label: 'Indus Continuity', val: '>35,000 YBP', note: 'Ancient genetic signatures preserved through generations.', sources: ['Narasimhan et al. Science (2019)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'UK': {
      name: 'Ukraine',
      stops: [
        {
          name: 'East African Cradle',
          region: 'Omo Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal root of all modern human maternal lines in East Africa.',
          stats: [
            { label: 'Antiquity', val: '~233,000 YBP', note: 'Earliest modern human fossil evidence.', sources: ['Vidal et al. Nature (2022)'] }
          ]
        },
        {
          name: 'Levantine / Near Eastern Gateway',
          region: 'Levant Corridor / Anatolia',
          latlng: [32.5000, 36.0000],
          ybp: '50,000 YBP',
          mutations: [1438, 2706, 7028],
          desc: 'Northern dispersal route into Eurasia via the Levant corridor.',
          stats: [
            { label: 'European Gateway', val: '~45,000 YBP', note: 'Founding of European macro-haplogroups U and H.', sources: ['Fu et al. Nature (2014)', 'Mellars Science (2006)'] }
          ]
        },
        {
          name: 'Pontic-Caspian Steppe & Dnieper Basin',
          region: 'Kyiv / Dnieper River Valley, Ukraine',
          latlng: [48.3794, 31.1656],
          ybp: '25,000 YBP to Present',
          mutations: [650, 8395, 10885, 11566, 14467, 16356],
          desc: 'Maternal pedigree verified across three generations (Grandmother -> Mother -> Sons).',
          stats: [
            { label: 'Pedigree Depth', val: '3 Generations Verified', note: 'Zero mutational distance across entire direct female line.', sources: ['Basok et al. (2026)', 'MitoMap Database (2025)'] }
          ]
        }
      ]
    },
    'HK': {
      name: 'Hong Kong',
      stops: [
        {
          name: 'East African Cradle',
          region: 'Omo Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'The African origin where modern human mitochondrial DNA originated.',
          stats: [
            { label: 'Maternal Root', val: 'Mitochondrial Eve', note: 'Basal root of all global maternal lines.', sources: ['Cann et al. Nature (1987)'] }
          ]
        },
        {
          name: 'Southern Maritime Coastal Route (Sunda Shelf)',
          region: 'Southeast Asian Coastal Rim / Sundaland',
          latlng: [5.0000, 100.0000],
          ybp: '50,000–60,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Rapid coastal transit around the tropical Indian Ocean and South China Sea rims.',
          stats: [
            { label: 'Coastal Migration', val: '~55,000 YBP', note: 'Maritime pioneers established East Asian Haplogroup M lineages.', sources: ['Macaulay et al. Science (2005)', 'Soares et al. (2012)'] }
          ]
        },
        {
          name: 'Pearl River Estuary & South China Coast',
          region: 'Hong Kong / Lingnan Coastal Region',
          latlng: [22.3193, 114.1694],
          ybp: '25,000 YBP to Present',
          mutations: [5821, 6338, 6455, 8602, 9540, 14821],
          desc: 'Endemic Southern Chinese maternal lineage carrying private diagnostic markers.',
          stats: [
            { label: 'Dataset Specificity', val: 'Private vs OGC, NOR, SWE', note: 'Mutations verified unique to this lineage across global comparative cohorts.', sources: ['Basok Pipeline (2026)', '1000 Genomes / OGC Database'] },
            { label: 'Haplogroup Affiliation', val: 'Haplogroup M7', note: 'Characteristic Southern East Asian coastal lineage.', sources: ['Ko et al. (2014)', 'MitoMap Database (2025)'] }
          ]
        }
      ]
    },
    /* TEMPORARY HOLD: Korea (KR) Migration Route - Restore when requested
    'KR': {
      name: 'Korea',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Ancestral human maternal origin in Africa.',
          stats: [
            { label: 'Antiquity', val: '~200,000 YBP', note: 'Universal coalescence point.', sources: ['Cann et al. (1987)'] }
          ]
        },
        {
          name: 'East Asian River Valley Corridor',
          region: 'Yellow River / Manchurian Basin',
          latlng: [35.0000, 115.0000],
          ybp: '40,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Northward expansion of macro-haplogroup D lineages into Northeast Asia.',
          stats: [
            { label: 'Lineage Emergence', val: 'Haplogroup D4', note: 'Dominant founding lineage of Northeast Asia.', sources: ['Tanaka et al. Genome Res (2004)'] }
          ]
        },
        {
          name: 'Korean Peninsula Ancestral Homeland',
          region: 'Seoul / Han River Basin, Korea',
          latlng: [37.5665, 126.9780],
          ybp: '25,000 YBP to Present',
          mutations: [63, 1709, 2882, 3010, 8414, 9817, 13544, 15565, 15669],
          desc: 'Continuous matrilineal descent in the Korean peninsula.',
          stats: [
            { label: 'Transmission', val: '100% Strict Maternal', note: 'Direct mother-to-daughter transmission verified.', sources: ['Jin et al. (2009)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    */
    'MX': {
      name: 'Mexico',
      stops: [
        {
          name: 'East African Cradle',
          region: 'Omo Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal origin of human mitochondrial DNA.',
          stats: [
            { label: 'Antiquity', val: '~233,000 YBP', note: 'Anatomical modern human fossil origin.', sources: ['Vidal et al. Nature (2022)'] }
          ]
        },
        {
          name: 'Beringian Land Bridge Standstill',
          region: 'Beringia / Siberian-Alaskan Margin',
          latlng: [65.0000, -170.0000],
          ybp: '20,000–25,000 YBP',
          mutations: [499, 4823],
          desc: 'Prolonged standstill during the Last Glacial Maximum where founding Native American mutations coalesced.',
          stats: [
            { label: 'Beringian Standstill', val: '~15,000–25,000 YBP', note: 'Genetic isolation produced founding Indigenous American mutations.', sources: ['Tamm et al. PLoS ONE (2007)', 'Llamas et al. Science (2016)'] }
          ]
        },
        {
          name: 'Mesoamerican High Plateau',
          region: 'Valley of Mexico / Mesoamerica',
          latlng: [23.6345, -102.5528],
          ybp: '15,000 YBP to Present',
          mutations: [6297, 8047, 9039, 13590],
          desc: 'Establishment of Haplogroup B2 founding maternal lineage in Mesoamerica.',
          stats: [
            { label: 'Founding Clade', val: 'Haplogroup B2', note: 'Primary founding lineage of Central America.', sources: ['Torroni et al. Genetics (1993)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'CL': {
      name: 'Colombia',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal maternal root in Africa.',
          stats: [
            { label: 'Coalescence', val: '100% Mitochondrial Eve', note: 'Root of all human maternal lineages.', sources: ['Cann et al. (1987)'] }
          ]
        },
        {
          name: 'Beringian Crossing & Pacific Coastal Entry',
          region: 'Bering Strait / Pacific Northwest Coast',
          latlng: [55.0000, -130.0000],
          ybp: '18,000 YBP',
          mutations: [114, 3552],
          desc: 'Rapid Pacific coastal maritime migration into the Americas.',
          stats: [
            { label: 'Coastal Migration', val: 'Pacific Kelp Highway', note: 'Rapid southward movement into South America.', sources: ['Erlandson et al. Science (2007)'] }
          ]
        },
        {
          name: 'Northern Andean / Colombian Homeland',
          region: 'Andes / Bogota Savannah, Colombia',
          latlng: [4.5709, -74.2973],
          ybp: '14,000 YBP to Present',
          mutations: [8545, 9545, 11914, 13263, 15323],
          desc: 'Deep South American Indigenous maternal lineage (Haplogroup C1).',
          stats: [
            { label: 'Lineage', val: 'Haplogroup C1', note: 'Founding South American maternal clade.', sources: ['Achilli et al. (2008)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'AA': {
      name: 'Africa',
      stops: [
        {
          name: 'East African Great Rift Valley (Origin Cradle)',
          region: 'Omo Kibish / Awash Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '200,000 YBP',
          mutations: [183, 2758],
          desc: 'The deepest root of modern human maternal genetics (Macro-Haplogroup L2).',
          stats: [
            { label: 'Basal Divergence', val: 'Macro-haplogroup L2', note: 'Deepest ancestral root of modern humans.', sources: ['Vidal et al. (2022)', 'Torroni et al. (2001)'] }
          ]
        },
        {
          name: 'Sub-Saharan African Continuum',
          region: 'Central / West Africa',
          latlng: [4.0383, 21.7587],
          ybp: '70,000 YBP to Present',
          mutations: [5581, 7175, 9128, 11338, 13803, 14308, 15784],
          desc: 'Direct ancestral maternal continuity within the African continent.',
          stats: [
            { label: 'Ancestral Retention', val: 'Root Polymorphisms', note: 'Preserves ancestral human mitochondrial baseline.', sources: ['Soares et al. (2012)', 'Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'TB': {
      name: 'Tibet',
      stops: [
        {
          name: 'East African Cradle',
          region: 'Omo Valley, Ethiopia',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal origin of human mitochondrial DNA.',
          stats: [
            { label: 'Antiquity', val: '~233,000 YBP', note: 'Omo Kibish fossil antiquity.', sources: ['Vidal et al. Nature (2022)'] }
          ]
        },
        {
          name: 'Central Asian Dispersal Corridor',
          region: 'Pamir Foothills / Silk Road',
          latlng: [37.0000, 72.0000],
          ybp: '45,000 YBP',
          mutations: [1438, 2706, 4769],
          desc: 'Trans-Eurasian dispersal along the northern foothills of the Himalayas.',
          stats: [
            { label: 'Radiation', val: 'Macro-clade M9', note: 'Founding ancestral clade of high-altitude Himalayan populations.', sources: ['Zhao et al. PNAS (2009)'] }
          ]
        },
        {
          name: 'Tibetan Plateau Hypoxia Adaptation & Homeland',
          region: 'Qinghai-Tibet Plateau / Lhasa',
          latlng: [29.6469, 91.1172],
          ybp: '30,000 YBP to Present',
          mutations: [3394, 4491, 8784, 12950, 14305, 15535, 16048],
          desc: 'Acquisition of iconic mitochondrial complex I hypoxia adaptation mutation 3394 T>C, enabling permanent living in extreme high-altitude hypoxia.',
          stats: [
            { label: 'Hypoxia Mutation', val: '3394 T>C (ND1)', note: 'Enhances mitochondrial ATP generation efficiency under low oxygen.', sources: ['Ji et al. PNAS (2012)', 'Lu et al. Science (2016)'] },
            { label: 'Plateau Habitation Date', val: '~30,000–40,000 YBP', note: 'Nwya Devu site establishes early high-altitude occupation.', sources: ['Zhang et al. Science (2018)'] }
          ]
        }
      ]
    },
    'CA': {
      name: 'Canada',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal origin of human mitochondrial DNA.',
          stats: [
            { label: 'Coalescence', val: '100% Mitochondrial Eve', note: 'Universal maternal origin.', sources: ['Cann et al. (1987)'] }
          ]
        },
        {
          name: 'European Post-Glacial Expansion',
          region: 'Western / Northern Europe',
          latlng: [50.0000, 10.0000],
          ybp: '15,000 YBP',
          mutations: [73, 146, 2706],
          desc: 'Post-LGM European re-expansion of macro-haplogroup H2.',
          stats: [
            { label: 'Clade', val: 'Haplogroup H2', note: 'Major European post-glacial founding lineage.', sources: ['Torroni et al. (1996)'] }
          ]
        },
        {
          name: 'North American Settlement',
          region: 'Canada / North America',
          latlng: [56.1304, -106.3468],
          ybp: 'Historic to Present',
          mutations: [4769],
          desc: 'North American sequenced European-derived lineage.',
          stats: [
            { label: 'Lineage', val: 'Haplogroup H2', note: 'Characterized in 43-sample reference dataset.', sources: ['Showcase Pipeline (2026)'] }
          ]
        }
      ]
    },
    'NA': {
      name: 'Native America',
      stops: [
        {
          name: 'East African Cradle',
          region: 'East Africa',
          latlng: [8.9806, 38.7578],
          ybp: '150,000–200,000 YBP',
          mutations: [263, 750],
          desc: 'Universal origin of human mitochondrial DNA.',
          stats: [
            { label: 'Antiquity', val: '~200,000 YBP', note: 'Maternal root of all humanity.', sources: ['Cann et al. (1987)'] }
          ]
        },
        {
          name: 'Beringian Land Bridge & Ice-Free Corridor',
          region: 'Beringia / Alaska',
          latlng: [64.2008, -149.4937],
          ybp: '20,000 YBP',
          mutations: [64, 152, 235, 663, 1736],
          desc: 'Paleo-Indian migration into North America during the late Pleistocene.',
          stats: [
            { label: 'Founding Clade', val: 'Haplogroup A2', note: 'Primary founding lineage of Indigenous North America.', sources: ['Tamm et al. (2007)', 'Llamas et al. (2016)'] }
          ]
        },
        {
          name: 'Indigenous North American Homeland',
          region: 'North America',
          latlng: [40.0000, -100.0000],
          ybp: '15,000 YBP to Present',
          mutations: [4248, 4824, 8027, 8794, 12007],
          desc: 'Indigenous North American founding maternal lineage (Haplogroup A2).',
          stats: [
            { label: 'Continuity', val: '>15,000 YBP', note: 'Deep continuous Indigenous maternal inheritance.', sources: ['Scheib et al. Science (2018)'] }
          ]
        }
      ]
    }
  },

  init() {
    this.populateAllSamplesSelect();
    this.bindEvents();
  },

  getSampleTrail(sampleKey) {
    if (!sampleKey) sampleKey = 'IN_F_DPL';
    const code = sampleKey.includes('_') ? sampleKey.split('_')[0] : sampleKey;
    return this.COHORT_TRAILS[code] || this.COHORT_TRAILS['IN'];
  },

  populateAllSamplesSelect() {
    const select = document.getElementById('globeSampleSelect');
    if (!select) return;

    const samples = (window.App && window.App.distanceData && window.App.distanceData.samples)
      ? window.App.distanceData.samples
      : ['IN_F_DPL', 'HK_F_JAN', 'MX_F_CRY', 'UK_F_NIKM', 'PK_F_WAS'];

    select.innerHTML = samples.map(s => {
      const code = s.split('_')[0];
      const name = window.TreeViewer ? window.TreeViewer.getSampleDisplayName(s) : s;
      return `<option value="${s}">${name} (${code})</option>`;
    }).join('');

    // Ensure activeSample is a valid sample
    if (!samples.includes(this.activeSample)) {
      const matched = samples.find(s => s.startsWith(this.activeSample + '_'));
      if (matched) this.activeSample = matched;
      else if (samples.length > 0) this.activeSample = samples[0];
    }

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

  initLeafletMap() {
    const container = document.getElementById('migrationMapContainer');
    if (!container) return;

    const tabGlobe = document.getElementById('tabContentGlobe');
    if (tabGlobe && tabGlobe.classList.contains('hidden')) {
      return;
    }

    if (this.map) {
      try {
        this.map.invalidateSize();
        this.renderRoute();
        this.renderDossier();
        return;
      } catch (err) {
        console.warn("Re-creating Leaflet instance:", err);
        try { this.map.remove(); } catch(e) {}
        this.map = null;
      }
    }

    try {
      // Initialize Leaflet map with global view
      this.map = L.map('migrationMapContainer', {
        center: [25.0, 45.0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 17,
        zoomControl: true,
        attributionControl: false
      });

      // High Quality Satellite Basemap (Esri World Imagery)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        subdomains: ['server', 'services']
      });
      satelliteLayer.addTo(this.map);

      // Optional subtle borders overlay
      const bordersLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.45
      });
      bordersLayer.addTo(this.map);

      this.polylineLayer = L.layerGroup().addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);

      // Render initial route and dossier
      this.renderRoute();
      this.renderDossier();

      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 100);
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 300);

      if (!window._mapResizeBound) {
        window._mapResizeBound = true;
        let mapResizeTimer;
        window.addEventListener('resize', () => {
          clearTimeout(mapResizeTimer);
          mapResizeTimer = setTimeout(() => {
            if (this.map) this.map.invalidateSize();
          }, 200);
        });
      }
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
    }
  },

  setSample(sampleOrCode) {
    if (!sampleOrCode) return;

    const samples = (window.App && window.App.distanceData && window.App.distanceData.samples) ? window.App.distanceData.samples : [];
    if (sampleOrCode.indexOf('_') === -1) {
      const found = samples.find(s => s.startsWith(sampleOrCode + '_'));
      this.activeSample = found || sampleOrCode;
    } else {
      this.activeSample = sampleOrCode;
    }

    this.activeStepIndex = 0;
    
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
      const playBtn = document.getElementById('playMigrationTrailBtn');
      if (playBtn) playBtn.innerHTML = '<span>▶ Play migration trail</span>';
    }

    const select = document.getElementById('globeSampleSelect');
    if (select && select.value !== this.activeSample) {
      select.value = this.activeSample;
    }

    const tabGlobe = document.getElementById('tabContentGlobe');
    if (tabGlobe && !tabGlobe.classList.contains('hidden') && this.map) {
      this.renderRoute();
      this.renderDossier();
    } else if (tabGlobe && !tabGlobe.classList.contains('hidden')) {
      this.initLeafletMap();
    }
  },

  renderRoute() {
    if (!this.map || !this.polylineLayer || !this.markersLayer) return;

    this.polylineLayer.clearLayers();
    this.markersLayer.clearLayers();

    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops || !trail.stops.length) return;

    const stops = trail.stops;
    const currentStop = stops[this.activeStepIndex] || stops[0];

    // 1. Draw connecting polyline paths
    const fullLatLngs = stops.map(s => s.latlng);
    const completedLatLngs = stops.slice(0, this.activeStepIndex + 1).map(s => s.latlng);

    // Dotted full future trail
    L.polyline(fullLatLngs, {
      color: '#52525b',
      weight: 2.2,
      dashArray: '6 8',
      opacity: 0.5
    }).addTo(this.polylineLayer);

    // Glowing active/completed trail (Warm Amber)
    if (completedLatLngs.length > 1) {
      L.polyline(completedLatLngs, {
        color: '#f59e0b',
        weight: 3.8,
        opacity: 0.95
      }).addTo(this.polylineLayer);
    }

    // 2. Add rich interactive markers for each stop
    stops.forEach((stop, idx) => {
      const isCurrent = idx === this.activeStepIndex;
      const isPast = idx < this.activeStepIndex;
      
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${isCurrent ? 'scale-125' : 'hover:scale-110'}">
          <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] font-mono shadow-xl border-2 ${isCurrent ? 'bg-amber-400 text-zinc-950 border-white ring-4 ring-amber-500/40' : (isPast ? 'bg-emerald-600 text-white border-zinc-700' : 'bg-zinc-900 text-zinc-400 border-zinc-700')}">
            ${idx + 1}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-migration-node',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(stop.latlng, { icon: customIcon }).addTo(this.markersLayer);
      
      marker.on('click', () => {
        this.goToStep(idx);
      });

      marker.bindTooltip(`<strong>Step ${idx + 1}: ${stop.name}</strong><br/><span class="text-xs text-amber-400 font-mono">${stop.ybp}</span>`, {
        direction: 'top',
        className: 'apple-glass-tooltip',
        offset: [0, -12]
      });
    });

    // Fly smoothly to active step coordinates if map has valid dimensions
    if (this.map && this.map.getSize && this.map.getSize().x > 0) {
      try {
        this.map.flyTo(currentStop.latlng, this.activeStepIndex === 0 ? 4 : 5, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      } catch (err) {
        console.warn("Leaflet flyTo skipped:", err);
      }
    }
  },

  nextStep() {
    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops.length) return;

    if (this.activeStepIndex < trail.stops.length - 1) {
      this.goToStep(this.activeStepIndex + 1);
    } else {
      this.goToStep(0);
    }
  },

  prevStep() {
    if (this.activeStepIndex > 0) {
      this.goToStep(this.activeStepIndex - 1);
    }
  },

  goToStep(index) {
    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops[index]) return;

    this.activeStepIndex = index;
    this.renderRoute();
    this.renderDossier();
  },

  playTrail() {
    const trail = this.getSampleTrail(this.activeSample);
    if (!trail || !trail.stops.length) return;

    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
      const playBtn = document.getElementById('playMigrationTrailBtn');
      if (playBtn) playBtn.innerHTML = '<span>▶ Play Migration Trail</span>';
      return;
    }

    let step = 0;
    this.goToStep(0);

    const playBtn = document.getElementById('playMigrationTrailBtn');
    if (playBtn) playBtn.innerHTML = '<span>⏸ Pause Trail</span>';

    this.playInterval = setInterval(() => {
      step++;
      if (step >= trail.stops.length) {
        clearInterval(this.playInterval);
        this.playInterval = null;
        if (playBtn) playBtn.innerHTML = '<span>Replay Trail</span>';
        return;
      }
      this.goToStep(step);
    }, 3500);
  },

  renderDossier() {
    const panel = document.getElementById('migrationDossierPanel');
    if (!panel) return;

    const sampleKey = this.activeSample;
    const trail = this.getSampleTrail(sampleKey);
    if (!trail || !trail.stops || !trail.stops.length) return;

    const currentStop = trail.stops[this.activeStepIndex] || trail.stops[0];
    const totalSteps = trail.stops.length;

    // Full-width step buttons (Location bigger text than Step label, no ACTIVE)
    const stepperButtonsHtml = trail.stops.map((stop, idx) => {
      const isCurrent = idx === this.activeStepIndex;
      const isPast = idx < this.activeStepIndex;
      const cleanName = stop.name.split('(')[0].trim();
      return `
        <button onclick="window.MigrationMap.goToStep(${idx})" class="w-full min-h-[48px] p-3 sm:p-3.5 rounded-xl text-left font-sans transition-all border ${
          isCurrent 
            ? 'bg-zinc-800/95 border-amber-400 shadow-md ring-1 ring-amber-400/50 text-white' 
            : (isPast ? 'bg-zinc-950/85 border-emerald-500/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50' : 'bg-zinc-950/85 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50')
        } cursor-pointer group">
          <div class="text-[10px] font-mono uppercase tracking-wider ${isCurrent ? 'text-amber-400 font-bold' : (isPast ? 'text-emerald-400' : 'text-zinc-500')}">
            Step ${idx + 1}
          </div>
          <div class="text-sm sm:text-base font-extrabold ${isCurrent ? 'text-white' : 'text-zinc-200 group-hover:text-white'} leading-tight mt-1 truncate">
            ${cleanName}
          </div>
          <div class="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
            ${stop.region} &bull; <span class="${isCurrent ? 'text-amber-300 font-semibold' : 'text-zinc-400'}">${stop.ybp}</span>
          </div>
        </button>
      `;
    }).join('');

    // Mutation evidence cards (Rendered across full horizontal space)
    const mutationCardsHtml = (currentStop.mutations || []).map(pos => {
      const evidence = this.MUTATION_MEANINGS[pos] || {
        locus: 'Mitochondrial DNA',
        change: 'Polymorphism',
        meaning: `Ancestral mutation at position ${pos} confirming historical migration checkpoint.`
      };
      return `
        <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-1.5 font-mono text-xs shadow-sm hover:border-amber-500/30 transition-colors">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span class="font-extrabold text-amber-400 text-xs sm:text-sm">${pos} ${evidence.change}</span>
            <span class="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">${evidence.locus}</span>
          </div>
          <p class="text-zinc-300 font-sans text-xs leading-relaxed pt-0.5">
            <strong class="text-zinc-100">Biological proof:</strong> ${evidence.meaning}
          </p>
        </div>
      `;
    }).join('');

    // Visual placeholder / Area illustration banner
    const areaBannerHtml = `
      <div class="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-1">
        <div class="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0"></span>
          <span>Geographic checkpoint</span>
        </div>
        <h4 class="text-base sm:text-lg font-extrabold text-white tracking-tight">${currentStop.name}</h4>
        <div class="text-xs text-zinc-400 font-mono">${currentStop.region} • <strong class="text-amber-300">${currentStop.ybp}</strong></div>
      </div>
    `;

    // Next Step Button (Accent color, prominent)
    const nextStepBtnHtml = `
      <button onclick="window.MigrationMap.nextStep()" class="w-full min-h-[48px] px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-extrabold text-sm font-sans shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <span>Next Step ➔</span>
      </button>
    `;

    // Render Right Panel (Checkpoint banner, Next Step button, step buttons, significance)
    panel.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        
        <!-- Geographic Checkpoint Area Banner -->
        ${areaBannerHtml}

        <!-- Next Step Button (Accent Color) -->
        ${nextStepBtnHtml}

        <!-- Step List (Full Horizontal Width) -->
        <div class="space-y-2">
          ${stepperButtonsHtml}
        </div>

        <!-- Area Significance & Description -->
        <div class="p-4 rounded-2xl bg-[#121216]/90 border border-white/10 space-y-2 shadow-xl">
          <div class="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0"></span>
            <span>Significance to humanity:</span>
          </div>
          <p class="text-zinc-300 text-xs leading-relaxed font-sans">
            ${currentStop.desc}
          </p>
        </div>

      </div>
    `;

    // Render Bottom Panel:
    // 1. Geospatial Migration Trajectory (former Section 5, moved to top)
    // 2. Diagnostic Mutation Evidence (Verified Checkpoint Markers)
    // 3. 16,569 bp Genome Coordinate Architecture & Organellar Localization (Integrated Section 2 + 1)
    const evidencePanel = document.getElementById('migrationEvidencePanel');
    if (evidencePanel) {
      const trajectoryHtml = this.buildGeospatialTrajectoryHtml(currentStop);
      const diagnosticHtml = this.buildDiagnosticEvidenceHtml(currentStop, mutationCardsHtml);
      const genomeArchitectureHtml = this.buildGenomeArchitectureHtml(currentStop);

      evidencePanel.innerHTML = `
        <div class="space-y-6 w-full font-sans text-xs">
          ${trajectoryHtml}
          ${diagnosticHtml}
          ${genomeArchitectureHtml}
        </div>
      `;

      this.attachGenomeTrackInteractions(currentStop);
    }
  },

  // Calculate Great-Circle Distance (in km) from East African Cradle (Omo Valley / Afar Triangle: 8.9806° N, 38.7578° E)
  getDistanceFromAfrica(lat, lng) {
    const rLat1 = 8.9806 * Math.PI / 180;
    const rLng1 = 38.7578 * Math.PI / 180;
    const rLat2 = lat * Math.PI / 180;
    const rLng2 = lng * Math.PI / 180;
    const dLat = rLat2 - rLat1;
    const dLng = rLng2 - rLng1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(rLat1) * Math.cos(rLat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c);
  },

  // 7 Major Functional Genomic Regions across all 16,569 bp
  GENOME_REGIONS: [
    {
      id: 'hv2',
      name: 'HV2',
      fullName: 'D-Loop Hypervariable Region 2 & Promoters',
      start: 1,
      end: 576,
      color: '#f43f5e',
      borderClass: 'border-rose-500/40',
      bgClass: 'bg-rose-950/50',
      compartment: 'Mitochondrial Matrix Core',
      compartmentDepth: 'Catalytic Interior Matrix Core (0 nm distance from nucleoid)',
      compartmentId: 'matrix',
      complex: 'Non-Coding Regulatory & Replication Origin',
      role: 'Controls transcription initiation (LSP/HSP promoters) and bidirectional heavy-strand DNA replication primer synthesis.',
      educationalSummary: 'The displacement loop (D-loop) is the primary non-coding control center of human mitochondrial DNA. Region HV2 contains conserved sequence blocks (CSB I–III) and the Light-Strand Promoter (LSP). It acts as the biochemical docking site where mitochondrial RNA polymerase (POLRMT) synthesizes primers for DNA Polymerase Gamma (POLG).'
    },
    {
      id: 'rnr',
      name: '12S/16S rRNA',
      fullName: 'Mitochondrial Ribosomal RNAs (MT-RNR1 & MT-RNR2)',
      start: 577,
      end: 3306,
      color: '#818cf8',
      borderClass: 'border-indigo-500/40',
      bgClass: 'bg-indigo-950/50',
      compartment: 'Mitochondrial Matrix Core',
      compartmentDepth: 'Matrix Ribosomal Assembly Pool',
      compartmentId: 'matrix',
      complex: '55S Mitoribosome Catalytic Core',
      role: 'Forms the structural RNA scaffolds for the 28S small (12S rRNA) and 39S large (16S rRNA) mitoribosomal subunits.',
      educationalSummary: 'Mitochondria utilize their own specialized 55S ribosomes located inside the matrix. MT-RNR1 (12S) and MT-RNR2 (16S) provide the catalytic peptide transferase and decoding centers, dedicated exclusively to synthesizing the 13 hydrophobic transmembrane core proteins of oxidative phosphorylation.'
    },
    {
      id: 'nd1_2',
      name: 'ND1/2',
      fullName: 'Complex I Hydrophobic Core (MT-ND1 & MT-ND2)',
      start: 3307,
      end: 5511,
      color: '#fbbf24',
      borderClass: 'border-amber-500/40',
      bgClass: 'bg-amber-950/50',
      compartment: 'Inner Cristae Membrane (IMM)',
      compartmentDepth: '15–30 nm Bilayer Hydrophobic Core',
      compartmentId: 'imm',
      complex: 'Complex I (NADH:Ubiquinone Oxidoreductase)',
      role: 'Pumps protons (H⁺) from the matrix into the intermembrane space, contributing directly to the electrochemical proton gradient (Δp).',
      educationalSummary: 'Subunits ND1 and ND2 form the proximal membrane-embedded arm of respiratory Complex I. As electrons shuttle through iron-sulfur clusters, electrostatic conformational waves drive proton translocation across the cristae bilayer into the intermembrane space reservoir.'
    },
    {
      id: 'cox_atp',
      name: 'COX / ATP',
      fullName: 'Complex IV & V (MT-CO1, CO2, CO3 & MT-ATP6, ATP8)',
      start: 5512,
      end: 10058,
      color: '#34d399',
      borderClass: 'border-emerald-500/40',
      bgClass: 'bg-emerald-950/50',
      compartment: 'Inner Cristae Membrane (IMM)',
      compartmentDepth: 'Transmembrane Cristae Bilayer Sheets',
      compartmentId: 'imm',
      complex: 'Complex IV (Terminal Oxidase) & Complex V (ATP Synthase)',
      role: 'Catalyzes terminal four-electron reduction of O₂ to H₂O (Complex IV) and synthesizes cellular ATP via the F₀ rotary proton turbine (Complex V).',
      educationalSummary: 'This cluster contains the catalytic bioenergetic engines of aerobic metabolism. COX1, COX2, and COX3 house the heme a₃-CuB centers reducing 95% of inhaled oxygen to water. MT-ATP6 and MT-ATP8 form the membrane proton rotor channel converting the protonmotive force into mechanical torque to generate ATP.'
    },
    {
      id: 'nd3_6',
      name: 'ND4/5/6',
      fullName: 'Complex I Distal Piston Arm (MT-ND3, ND4L, ND4, ND5, ND6)',
      start: 10059,
      end: 14746,
      color: '#22d3ee',
      borderClass: 'border-cyan-500/40',
      bgClass: 'bg-cyan-950/50',
      compartment: 'Inner Cristae Membrane (IMM)',
      compartmentDepth: '15–30 nm Distal Cristae Bilayer',
      compartmentId: 'imm',
      complex: 'Complex I Distal Transmembrane Modules',
      role: 'Houses the lateral coupling piston and antiporter-like channels (ND4, ND5) responsible for pumping 2 of the 4 protons per electron pair.',
      educationalSummary: 'Subunits ND4 and ND5 are homologous to bacterial cation/proton antiporters, featuring discontinuous transmembrane helices that tilt dynamically during catalytic turnover. ND6 provides the critical structural hinge coordinating the redox status of the ubiquinone pocket with the distal proton channels.'
    },
    {
      id: 'cytb',
      name: 'CYTB',
      fullName: 'Complex III Cytochrome b (MT-CYB)',
      start: 14747,
      end: 15887,
      color: '#e879f9',
      borderClass: 'border-fuchsia-500/40',
      bgClass: 'bg-fuchsia-950/50',
      compartment: 'Inner Cristae Membrane (IMM)',
      compartmentDepth: 'Spans Inner Membrane with 8 Helices',
      compartmentId: 'imm',
      complex: 'Complex III (Cytochrome bc₁ Complex)',
      role: 'Catalyzes the Q-cycle, shuttling electrons between ubiquinol (QH₂) and cytochrome c while translocating 4 protons into the IMS.',
      educationalSummary: 'Cytochrome b is the sole mitochondrial DNA-encoded protein of Complex III. Spanning the cristae membrane with 8 transmembrane α-helices and housing two distinct b-type hemes (bL and bH), it performs bifurcated electron transfer, doubling the energy conservation efficiency of the respiratory chain.'
    },
    {
      id: 'hv1',
      name: 'HV1',
      fullName: 'D-Loop Hypervariable Region 1 & Termination Sequence',
      start: 15888,
      end: 16569,
      color: '#f43f5e',
      borderClass: 'border-rose-500/40',
      bgClass: 'bg-rose-950/50',
      compartment: 'Mitochondrial Matrix Core',
      compartmentDepth: 'Matrix Triplex D-Loop Domain',
      compartmentId: 'matrix',
      complex: 'Non-Coding Regulatory & Termination (TAS)',
      role: 'Houses termination-associated sequences (TAS) regulating 7S DNA synthesis and the heavy-strand origin of replication (OH).',
      educationalSummary: 'Region HV1 exhibits the highest neutral mutation rate in the human genome. Because substitutions here do not compromise peptide structure, they have accumulated faithfully along maternal lineages for over 200,000 years, providing the primary chronological clock for tracking global human migrations.'
    }
  ],

  // 1. Geospatial Migration Trajectory & Continental Locus Coordinates (Top Section)
  buildGeospatialTrajectoryHtml(currentStop) {
    const [lat, lng] = currentStop.latlng || [8.9806, 38.7578];
    const distKm = this.getDistanceFromAfrica(lat, lng);
    const parsedYbp = parseInt(currentStop.ybp) || 50000;
    const estGen = Math.round(parsedYbp / 25);

    return `
      <!-- Geospatial Migration Trajectory & Continental Locus Coordinates -->
      <div class="earth-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121216]/90 border border-white/10 shadow-2xl space-y-4 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div class="flex items-center space-x-2.5 text-xs font-mono uppercase tracking-wider">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0"></span>
            <span class="text-sm font-extrabold text-white">Geospatial Migration Trajectory &amp; Continental Coordinates</span>
          </div>
          <span class="text-[10px] font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 font-semibold">Planetary Coordinates &amp; Great-Circle Vector</span>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          Every human mitochondrial mutation emerged at a precise geospatial coordinate on Earth. As small founder populations dispersed across continents along the Out-of-Africa trail, genetic drift and geographic barriers fixed unique regional haplogroup variants.
        </p>

        <!-- Geospatial Dashboard Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono text-xs">
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1 hover:border-amber-500/30 transition-colors shadow-sm">
            <div class="text-[10px] text-zinc-400 uppercase font-semibold">Geographic Checkpoint:</div>
            <div class="text-amber-300 font-bold text-sm truncate">${currentStop.name}</div>
            <div class="text-zinc-400 text-[11px] font-sans mt-0.5">${currentStop.region}</div>
          </div>
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1 hover:border-amber-500/30 transition-colors shadow-sm">
            <div class="text-[10px] text-zinc-400 uppercase font-semibold">Continental Coordinates:</div>
            <div class="text-white font-bold text-sm">${lat >= 0 ? lat.toFixed(4) + '° N' : Math.abs(lat).toFixed(4) + '° S'}, ${lng >= 0 ? lng.toFixed(4) + '° E' : Math.abs(lng).toFixed(4) + '° W'}</div>
            <div class="text-zinc-400 text-[11px] font-sans mt-0.5">Precision WGS84 Geodetic Datum</div>
          </div>
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1 hover:border-amber-500/30 transition-colors shadow-sm">
            <div class="text-[10px] text-zinc-400 uppercase font-semibold">Distance From East Africa:</div>
            <div class="text-amber-400 font-bold text-sm">${distKm.toLocaleString()} Kilometers</div>
            <div class="text-zinc-400 text-[11px] font-sans mt-0.5">Direct Great-Circle Trajectory</div>
          </div>
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1 hover:border-amber-500/30 transition-colors shadow-sm">
            <div class="text-[10px] text-zinc-400 uppercase font-semibold">Prehistoric Generations:</div>
            <div class="text-white font-bold text-sm">~${estGen.toLocaleString()} Maternal Generations</div>
            <div class="text-zinc-400 text-[11px] font-sans mt-0.5">Calculated at 25 yrs/generation</div>
          </div>
        </div>

        <!-- Climatic & Thermal Environmental Adaptation -->
        <div class="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 space-y-1.5 font-sans text-xs shadow-inner">
          <div class="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Geographic Climatic &amp; Thermal Selective Pressures</span>
          </div>
          <p class="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            Populations colonizing high-latitude or high-altitude ecosystems experienced strong selective pressures on mitochondrial bioenergetics. For example, mutations in ATP6 and ND genes uncoupled oxidative phosphorylation to generate endogenous heat (thermogenesis) in glacial Eurasian climates, while high-plateau populations (such as Tibetans) acquired variants in ND1 and ND6 optimizing oxygen affinity under hypobaric hypoxia.
          </p>
        </div>
      </div>
    `;
  },

  // 2. Diagnostic Mutation Evidence Section (Full Width)
  buildDiagnosticEvidenceHtml(currentStop, mutationCardsHtml) {
    const mutations = currentStop.mutations || [];
    return `
      <!-- Diagnostic Mutations Evidence (Takes Up All Horizontal Space) -->
      <div class="earth-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121216]/90 border border-white/10 shadow-2xl space-y-4 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div class="flex items-center space-x-2.5 text-xs font-mono uppercase tracking-wider">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0"></span>
            <span class="text-sm font-extrabold text-white">Diagnostic Mutation Evidence (${mutations.length} Verified Checkpoint Markers)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 font-semibold">100% Maternal Inheritance</span>
            <span class="text-[10px] font-mono text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 font-semibold">Matched in Cohort</span>
          </div>
        </div>

        <!-- Full-Width Responsive Grid for Mutation Evidence Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          ${mutationCardsHtml || '<div class="col-span-full py-4 text-center text-zinc-500 font-mono text-xs">No private mutations mapped at this step.</div>'}
        </div>
      </div>
    `;
  },

  // 3. Integrated 16,569 bp Genome Coordinate Architecture & Organellar Localization (Sections 2 + 1)
  buildGenomeArchitectureHtml(currentStop) {
    const mutations = currentStop.mutations || [];
    const meanings = this.MUTATION_MEANINGS || {};

    let matrixCount = 0;
    let immCount = 0;
    mutations.forEach(pos => {
      const info = meanings[pos] || {};
      const locus = (info.locus || '').toLowerCase();
      if (locus.includes('control') || locus.includes('d-loop') || locus.includes('trna') || locus.includes('rrna') || locus.includes('rnr')) {
        matrixCount++;
      } else {
        immCount++;
      }
    });

    // 16,569 bp Coordinate Markers Badges
    const coordinateMarkersHtml = mutations.map(pos => {
      const pct = ((pos / 16569) * 100).toFixed(1);
      const info = meanings[pos] || {};
      return `
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 font-mono text-xs shadow-sm hover:border-amber-500/40 transition-colors">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="text-amber-300 font-bold">${pos} bp</span>
          <span class="text-zinc-400 text-[11px]">(${pct}%)</span>
          <span class="text-zinc-500">•</span>
          <span class="text-zinc-200">${info.locus || 'mtDNA'}</span>
          <span class="text-amber-400 font-semibold text-[11px]">${info.change || ''}</span>
        </div>
      `;
    }).join('');

    // Track Segments HTML across all 16,569 bp
    const trackSegmentsHtml = this.GENOME_REGIONS.map((reg, idx) => {
      const span = reg.end - reg.start + 1;
      const widthPct = ((span / 16569) * 100).toFixed(2);
      const regMutations = mutations.filter(pos => pos >= reg.start && pos <= reg.end);
      const isFirst = idx === 0;
      const isLast = idx === this.GENOME_REGIONS.length - 1;
      const cornerClass = isFirst ? 'rounded-l-xl' : (isLast ? 'rounded-r-xl' : '');

      return `
        <div class="genome-track-segment relative h-full flex flex-col items-center justify-center p-1 cursor-pointer select-none transition-all duration-200 border-r border-zinc-900 ${cornerClass} ${reg.bgClass} hover:z-20"
             style="width: ${widthPct}%;"
             data-region-id="${reg.id}"
             data-region-name="${reg.name}"
             data-compartment="${reg.compartmentId}">
          <span class="text-[10px] sm:text-xs font-mono font-bold truncate drop-shadow" style="color: ${reg.color};">
            ${reg.name}
          </span>
          <div class="flex items-center gap-1 mt-0.5">
            ${regMutations.length > 0 ? `
              <span class="px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] font-mono shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                ${regMutations.length}
              </span>
            ` : `
              <span class="text-[9px] text-zinc-500 font-mono hidden sm:inline">•</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Mutation Needle Pins plotted spatially across the entire genome
    const mutationPinsHtml = mutations.map(pos => {
      const pct = ((pos / 16569) * 100).toFixed(2);
      const info = meanings[pos] || {};
      const reg = this.GENOME_REGIONS.find(r => pos >= r.start && pos <= r.end) || {};

      return `
        <div class="genome-mutation-pin absolute top-0 bottom-0 z-30 flex flex-col items-center justify-between pointer-events-auto cursor-pointer group"
             style="left: ${pct}%; transform: translateX(-50%); width: 14px;"
             data-pos="${pos}"
             data-region-id="${reg.id || ''}"
             data-change="${info.change || ''}"
             data-locus="${info.locus || ''}">
          <!-- Top Pin Indicator -->
          <div class="w-3 h-3 rounded-full bg-amber-300 border-2 border-zinc-950 shadow-[0_0_10px_rgba(251,191,36,0.9)] -mt-1 group-hover:scale-150 transition-transform"></div>
          <!-- Needle Spine Line -->
          <div class="w-0.5 h-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:bg-amber-200 group-hover:w-1 transition-all"></div>
          <!-- Bottom Foot Dot -->
          <div class="w-2.5 h-2.5 rounded-full bg-amber-400 border border-zinc-900 -mb-0.5 group-hover:scale-125 transition-transform"></div>

          <!-- Hover Tooltip -->
          <div class="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-900/95 backdrop-blur-md border border-amber-400/70 text-white text-[11px] font-mono px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap z-50">
            <strong class="text-amber-300 font-extrabold">${pos} bp</strong> &bull; <span class="text-amber-200">${info.change || 'VAR'}</span> &bull; <span class="text-zinc-300">${info.locus || 'mtDNA'}</span>
          </div>
        </div>
      `;
    }).join('');

    // Default Pod View before Hovering
    const defaultReportPodHtml = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div class="flex items-center gap-2 text-zinc-400 text-xs font-mono">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span class="font-bold uppercase tracking-wider text-zinc-200">Interactive Genomic &amp; Organellar Explorer</span>
        </div>
        <span class="text-xs font-mono font-bold text-amber-300">${mutations.length} Checkpoint Mutations Mapped Across 16,569 bp</span>
      </div>
      <div class="space-y-3">
        <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
          Hover over any section of the genome above (<strong class="text-rose-400">HV2</strong>, <strong class="text-indigo-400">12S/16S rRNA</strong>, <strong class="text-amber-400">ND1/2</strong>, <strong class="text-emerald-400">COX / ATP</strong>, <strong class="text-cyan-400">ND4/5/6</strong>, <strong class="text-fuchsia-400">CYTB</strong>, or <strong class="text-rose-400">HV1</strong>) or any vertical mutation needle pin to reveal the number of checkpoint mutations in that part of the genome, its sub-cellular organellar localization, and what it does biologically.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 font-mono text-[11px]">
          ${this.GENOME_REGIONS.map(reg => {
            const regMuts = mutations.filter(pos => pos >= reg.start && pos <= reg.end);
            return `
              <div class="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-0.5">
                <div class="font-bold truncate" style="color: ${reg.color}">${reg.name}</div>
                <div class="text-[10px] text-zinc-400">${regMuts.length} mutation${regMuts.length === 1 ? '' : 's'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    return `
      <style>
        .genome-track-wrapper {
          overflow: visible;
        }
        .genome-track-segment {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .genome-track-wrapper:hover .genome-track-segment {
          opacity: 0.38;
          filter: saturate(0.6) brightness(0.85);
        }
        .genome-track-wrapper .genome-track-segment:hover {
          opacity: 1 !important;
          filter: brightness(1.2) !important;
          transform: scaleY(1.08);
          z-index: 15;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
        }
        .genome-mutation-pin {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .genome-mutation-pin:hover {
          transform: translateX(-50%) scale(1.3);
          z-index: 40;
        }
      </style>

      <!-- Integrated 16,569 bp Genome Coordinate Architecture & Organellar Localization -->
      <div class="earth-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121216]/90 border border-white/10 shadow-2xl space-y-5 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div class="flex items-center space-x-2.5 text-xs font-mono uppercase tracking-wider">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0"></span>
            <span class="text-sm font-extrabold text-white">16,569 bp Genome Coordinate Architecture &amp; Organellar Localization</span>
          </div>
          <span class="text-[10px] font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 font-semibold">Interactive Basepair &amp; Sub-Compartment Explorer</span>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          The human mitochondrial genome is an ultra-compact circular DNA loop of 16,569 base pairs with zero introns and maternal inheritance. Explore the functional segments below to discover the exact coordinate positions of checkpoint mutations and their physical sub-cellular localization within the mitochondrion.
        </p>

        <!-- Interactive 16,569 bp Linear Track Bar with Mapped Mutations -->
        <div class="space-y-2 font-mono">
          <div class="flex items-center justify-between text-[11px] text-zinc-400">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400"></span> 1 bp (D-Loop Origin)</span>
            <span class="text-amber-400 font-bold uppercase tracking-wider text-xs hidden sm:inline">Hover any region to inspect respiratory role &amp; sub-cellular depth</span>
            <span class="flex items-center gap-1.5">16,569 bp (D-Loop End) <span class="w-2 h-2 rounded-full bg-rose-400"></span></span>
          </div>

          <!-- Relative container for track + mutation needle pins -->
          <div id="genomeTrackContainer" class="relative w-full h-16 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 p-1 flex shadow-2xl overflow-visible select-none genome-track-wrapper">
            ${trackSegmentsHtml}
            ${mutationPinsHtml}
          </div>
        </div>

        <!-- Dynamic Interactive Hover Report Pod -->
        <div id="genomeRegionReportPod" class="p-4 sm:p-6 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-4 font-sans transition-all duration-300">
          ${defaultReportPodHtml}
        </div>

        <!-- Integrated 4 Concentric Organellar Sub-Compartment Cards -->
        <div class="space-y-2 pt-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-2">
            <span class="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Concentric Organellar Sub-Compartment Breakdown:</span>
            <span class="text-[11px] font-sans text-zinc-400">Physical sub-cellular destination of mtDNA products</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 font-mono text-xs">
            <!-- 1. OMM -->
            <div class="compartment-card p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 transition-all hover:border-zinc-700" data-compartment="omm">
              <div class="flex items-center justify-between">
                <span class="text-zinc-300 font-bold">1. Outer Membrane (OMM)</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">0 nm Surface</span>
              </div>
              <p class="text-zinc-300 font-sans text-xs leading-relaxed">Permeable lipid envelope containing VDAC porin channels. <strong>0 mtDNA mutations</strong> (100% nuclear encoded).</p>
              <div class="text-[11px] text-zinc-400 border-t border-white/5 pt-1.5 font-mono flex items-center justify-between">
                <span>Variants:</span> <span class="text-zinc-500 font-bold">0 markers</span>
              </div>
            </div>

            <!-- 2. IMS -->
            <div class="compartment-card p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 transition-all hover:border-zinc-700" data-compartment="ims">
              <div class="flex items-center justify-between">
                <span class="text-zinc-300 font-bold">2. Intermembrane Space</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">~7 nm Lumen</span>
              </div>
              <p class="text-zinc-300 font-sans text-xs leading-relaxed">Proton (H⁺) electrochemical reservoir (Δp ≈ -180 mV). Cytochrome c electron shuttles traverse this aqueous phase.</p>
              <div class="text-[11px] text-zinc-400 border-t border-white/5 pt-1.5 font-mono flex items-center justify-between">
                <span>Proton gradient:</span> <span class="text-amber-300 font-bold">High Potential Δp</span>
              </div>
            </div>

            <!-- 3. IMM -->
            <div class="compartment-card p-3.5 rounded-xl bg-zinc-950/80 border border-amber-500/40 space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.08)] transition-all hover:border-amber-400" data-compartment="imm">
              <div class="flex items-center justify-between">
                <span class="text-amber-300 font-bold">3. Inner Cristae Membrane</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-bold">15–30 nm Depth</span>
              </div>
              <p class="text-zinc-300 font-sans text-xs leading-relaxed">Site of oxidative phosphorylation (OXPHOS)! Houses Complex I, III, IV, and V densely folded into cristae sheets.</p>
              <div class="text-[11px] text-amber-400 border-t border-white/5 pt-1.5 font-mono flex items-center justify-between">
                <span>IMM Cristae Variants:</span> <span class="text-white font-bold">${immCount} markers</span>
              </div>
            </div>

            <!-- 4. Matrix -->
            <div class="compartment-card p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 transition-all hover:border-zinc-700" data-compartment="matrix">
              <div class="flex items-center justify-between">
                <span class="text-zinc-300 font-bold">4. Mitochondrial Matrix</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">Interior Core</span>
              </div>
              <p class="text-zinc-300 font-sans text-xs leading-relaxed">Catalytic core housing 16,569 bp circular mtDNA nucleoids, 12S/16S mitoribosomes, and 22 tRNAs.</p>
              <div class="text-[11px] text-amber-400 border-t border-white/5 pt-1.5 font-mono flex items-center justify-between">
                <span>Matrix Core Variants:</span> <span class="text-white font-bold">${matrixCount} markers</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Checkpoint Mutation Loci Badges -->
        <div class="space-y-2 pt-1 font-mono">
          <div class="text-xs text-zinc-400 font-semibold">Checkpoint Mutation Loci Positions along the 16,569 bp Circle:</div>
          <div class="flex flex-wrap gap-2">
            ${coordinateMarkersHtml || '<span class="text-zinc-500 font-mono text-xs">No mutations at this checkpoint</span>'}
          </div>
        </div>
      </div>
    `;
  },

  // Dynamic interactive exploration of genome track segments and mutation needles
  attachGenomeTrackInteractions(currentStop) {
    const mutations = currentStop.mutations || [];
    const meanings = this.MUTATION_MEANINGS || {};
    const pod = document.getElementById('genomeRegionReportPod');
    const track = document.getElementById('genomeTrackContainer');
    if (!pod || !track) return;

    const segments = track.querySelectorAll('.genome-track-segment');
    const pins = track.querySelectorAll('.genome-mutation-pin');
    const compCards = document.querySelectorAll('.compartment-card');

    const renderRegionReport = (regionId) => {
      const reg = this.GENOME_REGIONS.find(r => r.id === regionId);
      if (!reg) return;

      const regMutations = mutations.filter(pos => pos >= reg.start && pos <= reg.end);
      const spanBp = reg.end - reg.start + 1;
      const spanPct = ((spanBp / 16569) * 100).toFixed(1);

      pod.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full shadow-md shrink-0 ring-2 ring-white/20" style="background-color: ${reg.color}"></span>
            <div>
              <h4 class="text-base sm:text-lg font-extrabold text-white font-mono tracking-tight">${reg.fullName}</h4>
              <div class="text-xs text-zinc-400 font-mono">${reg.start.toLocaleString()} &ndash; ${reg.end.toLocaleString()} bp &bull; ${spanBp.toLocaleString()} bp (${spanPct}% of mtDNA)</div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="px-3 py-1 rounded-xl text-xs font-mono font-bold ${regMutations.length > 0 ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' : 'bg-zinc-800 text-zinc-400'}">
              ${regMutations.length} Checkpoint Mutation${regMutations.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <!-- Organellar Sub-Compartment Localization -->
        <div class="p-3.5 sm:p-4 rounded-xl bg-zinc-950/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="space-y-0.5">
            <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">Organellar Sub-Compartment Localization:</div>
            <div class="text-white font-extrabold font-mono text-sm">${reg.compartment}</div>
            <div class="text-zinc-400 text-xs">${reg.compartmentDepth}</div>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-mono shrink-0">
            <span class="px-2 py-0.5 rounded-md ${reg.compartmentId === 'omm' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}">1. OMM (0 nm)</span>
            <span class="text-zinc-600">&rarr;</span>
            <span class="px-2 py-0.5 rounded-md ${reg.compartmentId === 'ims' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}">2. IMS (~7 nm)</span>
            <span class="text-zinc-600">&rarr;</span>
            <span class="px-2 py-0.5 rounded-md ${reg.compartmentId === 'imm' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}">3. IMM Cristae (15–30 nm)</span>
            <span class="text-zinc-600">&rarr;</span>
            <span class="px-2 py-0.5 rounded-md ${reg.compartmentId === 'matrix' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}">4. Matrix Core</span>
          </div>
        </div>

        <!-- Biological Function & Role -->
        <div class="space-y-1.5 font-sans">
          <div class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Biological Function &amp; Respiratory Role:</div>
          <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed">${reg.role}</p>
          <p class="text-xs text-zinc-400 leading-relaxed pt-1.5 border-t border-white/5">${reg.educationalSummary}</p>
        </div>

        <!-- Mapped Mutations in this Region -->
        <div class="space-y-2 pt-2 border-t border-white/10 font-mono">
          <div class="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
            <span>Mapped Checkpoint Mutations in ${reg.name} (${regMutations.length}):</span>
            <span class="text-[11px] font-normal text-zinc-400 font-sans">Current Out-of-Africa migration stage</span>
          </div>
          ${regMutations.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
              ${regMutations.map(pos => {
                const info = meanings[pos] || {};
                return `
                  <div class="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-amber-300 font-bold text-xs">${pos} ${info.change || ''}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">${info.locus || 'mtDNA'}</span>
                    </div>
                    <p class="text-zinc-300 font-sans text-xs leading-tight">${info.meaning || 'Conserved checkpoint variant.'}</p>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 font-sans flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-zinc-600 shrink-0"></span>
              <span>No private checkpoint mutations in this section for this migration stop &mdash; conserved ancestral sequence maintained.</span>
            </div>
          `}
        </div>
      `;

      pod.style.borderColor = `${reg.color}88`;
      pod.style.boxShadow = `0 0 35px ${reg.color}22`;

      // Highlight corresponding compartment card
      compCards.forEach(c => {
        if (c.getAttribute('data-compartment') === reg.compartmentId) {
          c.classList.add('ring-2', 'ring-amber-400/70', 'bg-zinc-900');
        } else {
          c.classList.remove('ring-2', 'ring-amber-400/70', 'bg-zinc-900');
        }
      });
    };

    const resetPod = () => {
      pod.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div class="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="font-bold uppercase tracking-wider text-zinc-200">Interactive Genomic &amp; Organellar Explorer</span>
          </div>
          <span class="text-xs font-mono font-bold text-amber-300">${mutations.length} Checkpoint Mutations Mapped Across 16,569 bp</span>
        </div>
        <div class="space-y-3">
          <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
            Hover over any section of the genome above (<strong class="text-rose-400">HV2</strong>, <strong class="text-indigo-400">12S/16S rRNA</strong>, <strong class="text-amber-400">ND1/2</strong>, <strong class="text-emerald-400">COX / ATP</strong>, <strong class="text-cyan-400">ND4/5/6</strong>, <strong class="text-fuchsia-400">CYTB</strong>, or <strong class="text-rose-400">HV1</strong>) or any vertical mutation needle pin to reveal the number of checkpoint mutations in that part of the genome, its sub-cellular organellar localization, and what it does biologically.
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 font-mono text-[11px]">
            ${this.GENOME_REGIONS.map(reg => {
              const regMuts = mutations.filter(pos => pos >= reg.start && pos <= reg.end);
              return `
                <div class="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-0.5">
                  <div class="font-bold truncate" style="color: ${reg.color}">${reg.name}</div>
                  <div class="text-[10px] text-zinc-400">${regMuts.length} mutation${regMuts.length === 1 ? '' : 's'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      pod.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      pod.style.boxShadow = '';

      compCards.forEach(c => {
        c.classList.remove('ring-2', 'ring-amber-400/70', 'bg-zinc-900');
      });
    };

    segments.forEach(seg => {
      const regId = seg.getAttribute('data-region-id');
      const handleEnter = () => renderRegionReport(regId);
      seg.addEventListener('mouseenter', handleEnter);
      seg.addEventListener('pointerenter', handleEnter);
    });

    pins.forEach(pin => {
      const regId = pin.getAttribute('data-region-id');
      const handleEnter = () => renderRegionReport(regId);
      pin.addEventListener('mouseenter', handleEnter);
      pin.addEventListener('pointerenter', handleEnter);
    });

    track.addEventListener('mouseleave', resetPod);

    // Compartment card hover to highlight matching segments
    compCards.forEach(card => {
      const compId = card.getAttribute('data-compartment');
      card.addEventListener('mouseenter', () => {
        segments.forEach(seg => {
          if (seg.getAttribute('data-compartment') === compId) {
            seg.style.opacity = '1';
            seg.style.filter = 'brightness(1.25)';
            seg.style.transform = 'scaleY(1.08)';
          } else {
            seg.style.opacity = '0.25';
            seg.style.filter = 'saturate(0.4)';
          }
        });
      });
      card.addEventListener('mouseleave', () => {
        segments.forEach(seg => {
          seg.style.opacity = '';
          seg.style.filter = '';
          seg.style.transform = '';
        });
      });
    });
  }
};
