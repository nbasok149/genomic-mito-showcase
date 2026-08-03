/**
 * Locus Inspector & Sequence Context Visualizer
 */

window.LocusInspector = {
  refGenome: '',
  annotations: null,
  variants: [],

  init(annotations, variants) {
    this.annotations = annotations;
    this.variants = variants;
    this.bindEvents();
    this.inspect(73); // Default inspection position
  },

  bindEvents() {
    const btn = document.getElementById('inspectPosBtn');
    const input = document.getElementById('locusPosInput');
    
    btn?.addEventListener('click', () => {
      const pos = parseInt(input.value, 10);
      if (pos >= 1 && pos <= 16569) {
        this.inspect(pos);
      } else {
        alert('Please enter a valid genomic position between 1 and 16,569.');
      }
    });

    input?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') btn?.click();
    });

    // Preset Position Badges
    document.querySelectorAll('.preset-locus').forEach(badge => {
      badge.addEventListener('click', (e) => {
        const pos = parseInt(e.target.dataset.pos, 10);
        if (input) input.value = pos;
        this.inspect(pos);
      });
    });
  },

  inspect(pos) {
    const displayPos = document.getElementById('displayLocusPos');
    const displayGene = document.getElementById('displayLocusGene');
    const displaySeq = document.getElementById('displaySeqWindow');
    const vafContainer = document.getElementById('locusVafDistribution');

    if (displayPos) displayPos.textContent = `Position m.${pos}`;

    // Find Gene
    let geneName = 'Intergenic';
    if (this.annotations && this.annotations.features) {
      for (const f of this.annotations.features) {
        if (f.start <= pos && pos <= f.end) {
          geneName = f.gene;
          break;
        }
        if (f.start > f.end && (pos >= f.start || pos <= f.end)) {
          geneName = f.gene;
          break;
        }
      }
    }
    if (displayGene) displayGene.textContent = geneName;

    // Simulate reference window
    const sampleFlankLeft = "AAGCACCTACGGTGAAGCCA".toLowerCase();
    const refBase = pos === 73 ? "A" : (pos === 263 ? "A" : (pos === 309 ? "C" : "T"));
    const sampleFlankRight = "CCTCACCATAGCCACAGCAC".toLowerCase();

    if (displaySeq) {
      displaySeq.innerHTML = `
        <span class="text-slate-400 font-mono">${sampleFlankLeft}</span>
        <span class="px-2 py-1 mx-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 text-lg font-mono">${refBase}</span>
        <span class="text-slate-400 font-mono">${sampleFlankRight}</span>
      `;
    }

    // Gap Shift Demo Graphic
    const gapDemo = document.getElementById('gapShiftDemo');
    if (gapDemo) {
      gapDemo.innerHTML = `
        <div class="p-3 rounded bg-slate-900/80 border border-slate-700 text-xs font-mono space-y-1">
          <div class="text-slate-400 font-semibold mb-1">Gap Shifting Algorithm (+ Strand vs - Strand)</div>
          <div>Ref:  A C C C C - T G A G  (Unshifted 3' Gap)</div>
          <div class="text-cyan-400 font-bold">Shift: A - C C C C T G A G  (Standardized 5' Coordinate Shift)</div>
        </div>
      `;
    }

    // Sample VAF distribution at locus
    const matchingVars = this.variants.filter(v => v.pos === pos);
    if (vafContainer) {
      if (matchingVars.length === 0) {
        vafContainer.innerHTML = `<div class="text-slate-400 text-sm italic py-4">No heteroplasmy variants called at position m.${pos} across the 43 samples.</div>`;
      } else {
        vafContainer.innerHTML = matchingVars.map(v => `
          <div class="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700 text-xs">
            <span class="font-semibold text-cyan-300">${v.sample}</span>
            <span class="font-mono text-slate-200">${v.ref} &rarr; ${v.alt}</span>
            <span class="font-mono text-emerald-400 font-bold">${(v.vaf * 100).toFixed(1)}% VAF</span>
            <span class="text-slate-400">${v.depth}x</span>
          </div>
        `).join('');
      }
    }
  }
};
