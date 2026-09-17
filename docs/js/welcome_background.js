/**
 * welcome_background.js
 * 
 * Mitochondria & mtDNA Specific 3D WebGL Background for Startup Modal.
 * Inspired by Codrops "Decorative WebGL Backgrounds" by Louis Hoebregts
 * (https://tympanus.net/Development/DecorativeBackgrounds/) and
 * "Gradient Topography Animation" by Diana Hlevnjak & Codrops
 * (https://github.com/codrops/GradientTopographyAnimation/).
 * 
 * Anatomical & Genomic Features:
 * - Unified Golden Amber Palette across both flanking illustrations.
 * - Left Flank: 3D Mitochondrion Organelle with elongated outer membrane capsule,
 *   transverse undulating inner cristae folds, longitudinal spines, and matrix granules.
 * - Right Flank: 3D Closed-Circular mtDNA Genome (16,569 bp) with toroidal chromosome
 *   rings, intertwining Heavy/Light helical strands, base-pair rungs, and diagnostic mutation loci.
 * - Ambient drifting genomic micro-particles.
 * - Smooth mouse parallax with spring damping.
 * - Zero CPU/GPU overhead when modal is dismissed (via MutationObserver).
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[WelcomeBg] Three.js not loaded. Skipping WebGL background.');
    return;
  }

  const WelcomeBackground = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    animationFrameId: null,
    isRunning: false,
    mitochondrion: null,
    circularGenome: null,
    ambientParticles: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    time: 0,
    dotTexture: null,

    // Unified Warm Amber & Gold Palette (Matching website theme)
    colorStops: [
      { h: 0.08, s: 0.95, l: 0.38 }, // Deep warm amber
      { h: 0.10, s: 0.96, l: 0.50 }, // Vibrant gold
      { h: 0.12, s: 0.92, l: 0.62 }, // Bright amber-gold
      { h: 0.14, s: 0.90, l: 0.74 }  // Luminous highlight
    ],

    config: {
      cameraZ: 800,
      mitoHeight: 270,
      mitoRadius: 65,
      genomeMajorR: 135,
      genomeMinorR: 28,
      ambientCount: 80
    },

    init() {
      this.canvas = document.getElementById('welcomeModalBgCanvas');
      const modal = document.getElementById('familyWelcomeModal');
      if (!this.canvas || !modal) return;

      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x000000, 0);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
        this.camera.position.set(0, 0, this.config.cameraZ);

        this.dotTexture = this.generateDotTexture();

        // 1. Build Left: 3D Mitochondrion Organelle with Cristae & Matrix Granules
        this.mitochondrion = this.createMitochondrionModel();
        this.scene.add(this.mitochondrion.group);

        // 2. Build Right: 3D Circular mtDNA Genome (16,569 bp) with Helical Strands
        this.circularGenome = this.createCircularGenomeModel();
        this.scene.add(this.circularGenome.group);

        // 3. Ambient Drifting Particles
        this.ambientParticles = this.createAmbientParticles();
        this.scene.add(this.ambientParticles);

        // Bind events
        this.bindEvents();
        this.onResize();

        // Check if modal is active
        if (!modal.classList.contains('hidden')) {
          this.start();
        }

        // Auto-pause / resume via MutationObserver
        const observer = new MutationObserver(() => {
          const isHidden = modal.classList.contains('hidden') || modal.style.display === 'none';
          if (isHidden) {
            this.stop();
          } else {
            this.onResize();
            this.start();
          }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });

      } catch (err) {
        console.warn('[WelcomeBg] WebGL initialization skipped:', err);
      }
    },

    generateDotTexture() {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.55, 'rgba(255,255,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    },

    interpolateColor(t) {
      const stops = this.colorStops;
      const idx = t * (stops.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(stops.length - 1, i0 + 1);
      const fract = idx - i0;

      const c0 = stops[i0];
      const c1 = stops[i1];

      const h = c0.h + (c1.h - c0.h) * fract;
      const s = c0.s + (c1.s - c0.s) * fract;
      const l = c0.l + (c1.l - c0.l) * fract;

      return new THREE.Color().setHSL(h, s, l);
    },

    // =========================================================================
    // LEFT: 3D MITOCHONDRION (Outer Membrane Capsule + Inner Folded Cristae)
    // =========================================================================
    createMitochondrionModel() {
      const group = new THREE.Group();
      const H = this.config.mitoHeight;
      const R = this.config.mitoRadius;
      const ringsCount = 20;
      const ringPts = 50;
      const rings = [];

      // 1. Outer Membrane Contour Rings (Capsule profile with organic bean curve)
      for (let j = 0; j < ringsCount; j++) {
        const t = j / (ringsCount - 1);
        const y = (t - 0.5) * H;
        const straightHalfH = H / 2 - R;
        let r = R;
        if (Math.abs(y) > straightHalfH) {
          const capDist = Math.abs(y) - straightHalfH;
          r = Math.sqrt(Math.max(0, R * R - capDist * capDist));
        }

        const positions = new Float32Array((ringPts + 1) * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const color = this.interpolateColor(t);
        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.35 + t * 0.45,
          blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(geom, mat);
        line.userData = {
          t,
          baseY: y,
          baseR: r,
          origAngles: Array.from({ length: ringPts + 1 }, (_, i) => (i / ringPts) * Math.PI * 2)
        };

        rings.push(line);
        group.add(line);
      }

      // 2. Longitudinal Spines (Outer membrane cage)
      const spineCount = 6;
      const spines = [];
      for (let s = 0; s < spineCount; s++) {
        const spineAngle = (s / spineCount) * Math.PI * 2;
        const spinePositions = new Float32Array((ringsCount + 1) * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(spinePositions, 3));

        const mat = new THREE.LineBasicMaterial({
          color: this.interpolateColor(0.5),
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending
        });

        const spineLine = new THREE.Line(geom, mat);
        spineLine.userData = { angle: spineAngle };
        spines.push(spineLine);
        group.add(spineLine);
      }

      // 3. Inner Folded Cristae (Transverse undulating shelf folds)
      const cristaeCount = 8;
      const cristaeLines = [];
      const cristaePts = 40;

      for (let c = 0; c < cristaeCount; c++) {
        const t = (c + 1) / (cristaeCount + 1);
        const y = (t - 0.5) * (H * 0.72);
        const positions = new Float32Array((cristaePts + 1) * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const color = this.interpolateColor(t);
        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          linewidth: 1.5
        });

        const line = new THREE.Line(geom, mat);
        line.userData = {
          cIndex: c,
          baseY: y,
          t
        };

        cristaeLines.push(line);
        group.add(line);
      }

      // 4. Matrix Granules (Glowing particle nodes in matrix cavity)
      const granuleCount = 55;
      const granulePositions = new Float32Array(granuleCount * 3);
      const granuleColors = new Float32Array(granuleCount * 3);
      const granuleData = [];

      for (let i = 0; i < granuleCount; i++) {
        const t = Math.random();
        const y = (t - 0.5) * (H * 0.7);
        const curveX = -20 * (1 - Math.pow(2 * y / H, 2));
        const theta = Math.random() * Math.PI * 2;
        const rad = Math.random() * (R * 0.65);

        const x = curveX + Math.cos(theta) * rad;
        const z = Math.sin(theta) * rad;

        granulePositions[i * 3] = x;
        granulePositions[i * 3 + 1] = y;
        granulePositions[i * 3 + 2] = z;

        const color = this.interpolateColor(Math.random());
        granuleColors[i * 3] = color.r;
        granuleColors[i * 3 + 1] = color.g;
        granuleColors[i * 3 + 2] = color.b;

        granuleData.push({
          baseX: x,
          baseY: y,
          baseZ: z,
          speed: (Math.random() - 0.5) * 0.003
        });
      }

      const granuleGeom = new THREE.BufferGeometry();
      granuleGeom.setAttribute('position', new THREE.BufferAttribute(granulePositions, 3));
      granuleGeom.setAttribute('color', new THREE.BufferAttribute(granuleColors, 3));

      const granuleMat = new THREE.PointsMaterial({
        size: 5.5,
        map: this.dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const granules = new THREE.Points(granuleGeom, granuleMat);
      group.add(granules);

      // Subtle initial tilt for dynamic anatomical posture
      group.rotation.z = -0.26;
      group.rotation.x = 0.18;

      return {
        group,
        rings,
        spines,
        cristaeLines,
        granules,
        granuleData,
        H,
        R
      };
    },

    // =========================================================================
    // RIGHT: 3D CIRCULAR mtDNA GENOME (16,569 bp Torus + Dual Helical Strands)
    // =========================================================================
    createCircularGenomeModel() {
      const group = new THREE.Group();
      const R_maj = this.config.genomeMajorR;
      const r_min = this.config.genomeMinorR;
      const torusRingsCount = 16;
      const ringPts = 60;
      const rings = [];

      // 1. Concentric Chromosome Torus Contour Loops
      for (let j = 0; j < torusRingsCount; j++) {
        const phi = (j / torusRingsCount) * Math.PI * 2;
        const positions = new Float32Array((ringPts + 1) * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const t = j / (torusRingsCount - 1);
        const color = this.interpolateColor(t);

        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.30 + t * 0.40,
          blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(geom, mat);
        line.userData = {
          phi,
          origThetas: Array.from({ length: ringPts + 1 }, (_, i) => (i / ringPts) * Math.PI * 2)
        };

        rings.push(line);
        group.add(line);
      }

      // 2. Dual Helical Strands (Heavy [H] and Light [L] Strands coiled around the circle)
      const helixPts = 180;
      const turns = 18; // 18 helical twists along the circular chromosome
      const strandHPositions = new Float32Array((helixPts + 1) * 3);
      const strandLPositions = new Float32Array((helixPts + 1) * 3);

      const geomH = new THREE.BufferGeometry();
      geomH.setAttribute('position', new THREE.BufferAttribute(strandHPositions, 3));
      const geomL = new THREE.BufferGeometry();
      geomL.setAttribute('position', new THREE.BufferAttribute(strandLPositions, 3));

      const matH = new THREE.LineBasicMaterial({
        color: this.interpolateColor(0.8),
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        linewidth: 1.8
      });
      const matL = new THREE.LineBasicMaterial({
        color: this.interpolateColor(0.4),
        transparent: true,
        opacity: 0.60,
        blending: THREE.AdditiveBlending,
        linewidth: 1.5
      });

      const strandH = new THREE.Line(geomH, matH);
      const strandL = new THREE.Line(geomL, matL);
      group.add(strandH);
      group.add(strandL);

      // 3. Base-Pair Rungs connecting the dual strands across the circle
      const rungsCount = 54;
      const rungPositions = new Float32Array(rungsCount * 2 * 3);
      const rungGeom = new THREE.BufferGeometry();
      rungGeom.setAttribute('position', new THREE.BufferAttribute(rungPositions, 3));

      const rungMat = new THREE.LineBasicMaterial({
        color: this.interpolateColor(0.65),
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      const rungs = new THREE.LineSegments(rungGeom, rungMat);
      group.add(rungs);

      // 4. Diagnostic Mutation Loci (Polymorphic variant beads along the circular loop)
      const lociCount = 65;
      const lociPositions = new Float32Array(lociCount * 3);
      const lociColors = new Float32Array(lociCount * 3);
      const lociData = [];

      for (let i = 0; i < lociCount; i++) {
        // D-Loop cluster (~origin of replication, 16,024 - 576 bp)
        const isDLoop = i < 18;
        const theta = isDLoop 
          ? (Math.random() * 0.45 - 0.22) * Math.PI 
          : Math.random() * Math.PI * 2;

        const phi = Math.random() * Math.PI * 2;
        const r = R_maj + (r_min * 1.05) * Math.cos(phi);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = (r_min * 1.05) * Math.sin(phi);

        lociPositions[i * 3] = x;
        lociPositions[i * 3 + 1] = y;
        lociPositions[i * 3 + 2] = z;

        // Brighter gold for D-loop hypervariable control loci
        const color = isDLoop ? this.interpolateColor(1.0) : this.interpolateColor(0.65);
        lociColors[i * 3] = color.r;
        lociColors[i * 3 + 1] = color.g;
        lociColors[i * 3 + 2] = color.b;

        lociData.push({
          theta,
          phi,
          isDLoop,
          speedTheta: (Math.random() - 0.5) * 0.002
        });
      }

      const lociGeom = new THREE.BufferGeometry();
      lociGeom.setAttribute('position', new THREE.BufferAttribute(lociPositions, 3));
      lociGeom.setAttribute('color', new THREE.BufferAttribute(lociColors, 3));

      const lociMat = new THREE.PointsMaterial({
        size: 5.5,
        map: this.dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const loci = new THREE.Points(lociGeom, lociMat);
      group.add(loci);

      // Elegant diagonal tilt
      group.rotation.x = 0.45;
      group.rotation.y = -0.32;

      return {
        group,
        rings,
        strandH,
        strandL,
        rungs,
        loci,
        lociData,
        R_maj,
        r_min,
        turns,
        helixPts,
        rungsCount
      };
    },

    createAmbientParticles() {
      const count = this.config.ambientCount;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const data = [];

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 120;

        const color = this.interpolateColor(Math.random());
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        data.push({
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          vz: (Math.random() - 0.5) * 0.15
        });
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 3.5,
        map: this.dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.40,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const p = new THREE.Points(geom, mat);
      p.userData = { data };
      return p;
    },

    // =========================================================================
    // UPDATE ANIMATION LOOPS
    // =========================================================================
    updateMitochondrion(mito, time) {
      const { rings, spines, cristaeLines, granules, granuleData, H, R } = mito;
      const hasNoise = typeof noise !== 'undefined' && typeof noise.simplex3 === 'function';

      // 1. Animate outer capsule membrane rings
      for (let j = 0; j < rings.length; j++) {
        const line = rings[j];
        const { baseY, baseR, origAngles } = line.userData;
        const pos = line.geometry.attributes.position.array;

        // Bean curvature
        const curveX = -20 * (1 - Math.pow(2 * baseY / H, 2));

        for (let i = 0; i < origAngles.length; i++) {
          const angle = origAngles[i];
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          let n = 0;
          if (hasNoise) {
            n = noise.simplex3(
              cosA * 0.015,
              sinA * 0.015 + time * 0.0005,
              baseY * 0.012
            ) * 12.0;
          }

          const r = Math.max(2, baseR + n);
          pos[i * 3] = curveX + cosA * r;
          pos[i * 3 + 1] = baseY;
          pos[i * 3 + 2] = sinA * r;
        }
        line.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Animate longitudinal spines
      for (let s = 0; s < spines.length; s++) {
        const spine = spines[s];
        const angle = spine.userData.angle;
        const pos = spine.geometry.attributes.position.array;

        for (let j = 0; j < rings.length; j++) {
          const ringPos = rings[j].geometry.attributes.position.array;
          const ringPtsCount = (ringPos.length / 3) - 1;
          const ptIdx = Math.round((angle / (Math.PI * 2)) * ringPtsCount);
          pos[j * 3] = ringPos[ptIdx * 3];
          pos[j * 3 + 1] = ringPos[ptIdx * 3 + 1];
          pos[j * 3 + 2] = ringPos[ptIdx * 3 + 2];
        }
        // close spine loop
        pos[rings.length * 3] = pos[0];
        pos[rings.length * 3 + 1] = pos[1];
        pos[rings.length * 3 + 2] = pos[2];
        spine.geometry.attributes.position.needsUpdate = true;
      }

      // 3. Animate inner folded cristae ribbons
      for (let c = 0; c < cristaeLines.length; c++) {
        const crista = cristaeLines[c];
        const { baseY } = crista.userData;
        const pos = crista.geometry.attributes.position.array;
        const pts = (pos.length / 3) - 1;
        const curveX = -20 * (1 - Math.pow(2 * baseY / H, 2));

        for (let i = 0; i <= pts; i++) {
          const s = (i / pts) * 2 - 1; // -1 to 1
          const x = curveX + s * (R * 0.72);

          // Transverse accordion wave
          let wave = Math.sin(s * Math.PI * 3 + time * 0.001 + c) * (R * 0.42);
          if (hasNoise) {
            wave += noise.simplex3(s * 0.05, c * 0.1, time * 0.0006) * 8.0;
          }

          pos[i * 3] = x;
          pos[i * 3 + 1] = baseY + Math.cos(s * Math.PI * 2) * 5;
          pos[i * 3 + 2] = wave;
        }
        crista.geometry.attributes.position.needsUpdate = true;
      }

      // 4. Drift matrix granules
      const granPos = granules.geometry.attributes.position.array;
      for (let i = 0; i < granuleData.length; i++) {
        const g = granuleData[i];
        let n = 0;
        if (hasNoise) {
          n = noise.simplex3(g.baseX * 0.02, g.baseY * 0.02 + time * 0.0004, i * 0.1) * 6.0;
        }
        granPos[i * 3] = g.baseX + n;
        granPos[i * 3 + 1] = g.baseY;
        granPos[i * 3 + 2] = g.baseZ + n * 0.5;
      }
      granules.geometry.attributes.position.needsUpdate = true;
    },

    updateCircularGenome(genome, time) {
      const { rings, strandH, strandL, rungs, loci, lociData, R_maj, r_min, turns, helixPts, rungsCount } = genome;
      const hasNoise = typeof noise !== 'undefined' && typeof noise.simplex3 === 'function';

      // 1. Animate chromosome torus rings
      for (let j = 0; j < rings.length; j++) {
        const line = rings[j];
        const { phi, origThetas } = line.userData;
        const pos = line.geometry.attributes.position.array;

        for (let i = 0; i < origThetas.length; i++) {
          const theta = origThetas[i];
          let n = 0;
          if (hasNoise) {
            n = noise.simplex3(
              Math.cos(theta) * 0.02,
              Math.sin(theta) * 0.02 + time * 0.0005,
              Math.sin(phi) * 0.02
            ) * 14.0;
          }

          const r = R_maj + (r_min + n) * Math.cos(phi);
          pos[i * 3] = r * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(theta);
          pos[i * 3 + 2] = (r_min + n) * Math.sin(phi);
        }
        line.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Animate dual helical strands (Heavy and Light strands)
      const posH = strandH.geometry.attributes.position.array;
      const posL = strandL.geometry.attributes.position.array;

      for (let i = 0; i <= helixPts; i++) {
        const theta = (i / helixPts) * Math.PI * 2;
        const phi = theta * turns + time * 0.002;

        const xH = (R_maj + r_min * Math.cos(phi)) * Math.cos(theta);
        const yH = (R_maj + r_min * Math.cos(phi)) * Math.sin(theta);
        const zH = r_min * Math.sin(phi);

        const xL = (R_maj + r_min * Math.cos(phi + Math.PI)) * Math.cos(theta);
        const yL = (R_maj + r_min * Math.cos(phi + Math.PI)) * Math.sin(theta);
        const zL = r_min * Math.sin(phi + Math.PI);

        posH[i * 3] = xH;
        posH[i * 3 + 1] = yH;
        posH[i * 3 + 2] = zH;

        posL[i * 3] = xL;
        posL[i * 3 + 1] = yL;
        posL[i * 3 + 2] = zL;
      }
      strandH.geometry.attributes.position.needsUpdate = true;
      strandL.geometry.attributes.position.needsUpdate = true;

      // 3. Update base-pair rungs connecting the strands
      const rungPos = rungs.geometry.attributes.position.array;
      for (let i = 0; i < rungsCount; i++) {
        const theta = (i / rungsCount) * Math.PI * 2;
        const phi = theta * turns + time * 0.002;

        const x1 = (R_maj + r_min * Math.cos(phi)) * Math.cos(theta);
        const y1 = (R_maj + r_min * Math.cos(phi)) * Math.sin(theta);
        const z1 = r_min * Math.sin(phi);

        const x2 = (R_maj + r_min * Math.cos(phi + Math.PI)) * Math.cos(theta);
        const y2 = (R_maj + r_min * Math.cos(phi + Math.PI)) * Math.sin(theta);
        const z2 = r_min * Math.sin(phi + Math.PI);

        rungPos[i * 6] = x1;
        rungPos[i * 6 + 1] = y1;
        rungPos[i * 6 + 2] = z1;
        rungPos[i * 6 + 3] = x2;
        rungPos[i * 6 + 4] = y2;
        rungPos[i * 6 + 5] = z2;
      }
      rungs.geometry.attributes.position.needsUpdate = true;

      // 4. Update mutation loci beads
      const lociPos = loci.geometry.attributes.position.array;
      for (let i = 0; i < lociData.length; i++) {
        const loc = lociData[i];
        loc.theta += loc.speedTheta;

        let n = 0;
        if (hasNoise) {
          n = noise.simplex3(Math.cos(loc.theta) * 0.02, Math.sin(loc.theta) * 0.02, time * 0.0004) * 8.0;
        }

        const r = R_maj + (r_min * 1.05 + n) * Math.cos(loc.phi);
        lociPos[i * 3] = r * Math.cos(loc.theta);
        lociPos[i * 3 + 1] = r * Math.sin(loc.theta);
        lociPos[i * 3 + 2] = (r_min * 1.05 + n) * Math.sin(loc.phi);
      }
      loci.geometry.attributes.position.needsUpdate = true;
    },

    updateAmbientParticles() {
      if (!this.ambientParticles) return;
      const pos = this.ambientParticles.geometry.attributes.position.array;
      const data = this.ambientParticles.userData.data;

      for (let i = 0; i < data.length; i++) {
        pos[i * 3] += data[i].vx;
        pos[i * 3 + 1] += data[i].vy;
        pos[i * 3 + 2] += data[i].vz;

        if (pos[i * 3] > 800) pos[i * 3] = -800;
        if (pos[i * 3] < -800) pos[i * 3] = 800;
        if (pos[i * 3 + 1] > 500) pos[i * 3 + 1] = -500;
        if (pos[i * 3 + 1] < -500) pos[i * 3 + 1] = 500;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    },

    render() {
      if (!this.isRunning) return;
      this.animationFrameId = requestAnimationFrame(() => this.render());

      this.time += 1;

      // Parallax mouse damping
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Animate Mitochondrion Organelle (Left)
      if (this.mitochondrion) {
        this.updateMitochondrion(this.mitochondrion, this.time);
        this.mitochondrion.group.rotation.y += 0.003;
        this.mitochondrion.group.rotation.x = -this.mouse.y * 0.30 + 0.18;
        this.mitochondrion.group.rotation.z = -0.26 + this.mouse.x * 0.15;
      }

      // Animate Circular mtDNA Genome Plasmid (Right)
      if (this.circularGenome) {
        this.updateCircularGenome(this.circularGenome, this.time);
        this.circularGenome.group.rotation.z += 0.0025;
        this.circularGenome.group.rotation.x = 0.45 - this.mouse.y * 0.30;
        this.circularGenome.group.rotation.y = -0.32 + this.mouse.x * 0.15;
      }

      // Animate ambient drift
      this.updateAmbientParticles();

      this.renderer.render(this.scene, this.camera);
    },

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.render();
    },

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    onResize() {
      if (!this.canvas || !this.renderer || !this.camera) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Calibrate perspective camera so 1 unit = 1 pixel at z = 0
      const z = this.config.cameraZ;
      const fov = 2 * Math.atan((h / 2) / z) * (180 / Math.PI);

      this.camera.fov = fov;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);

      // Flank the 768px modal card
      const cardWidth = Math.min(w * 0.92, 768);
      const cardHalfW = cardWidth / 2;
      const flankSpace = Math.max(0, (w - cardWidth) / 2);

      let posX = cardHalfW + flankSpace * 0.52;
      let scale = 1.0;

      if (flankSpace < 160) {
        scale = Math.max(0.55, flankSpace / 200);
        posX = cardHalfW + flankSpace * 0.4;
      } else if (flankSpace < 280) {
        scale = 0.85;
      }

      if (this.mitochondrion) {
        this.mitochondrion.group.position.x = -posX;
        this.mitochondrion.group.position.y = 0;
        this.mitochondrion.group.scale.set(scale, scale, scale);
      }

      if (this.circularGenome) {
        this.circularGenome.group.position.x = posX;
        this.circularGenome.group.position.y = 0;
        this.circularGenome.group.scale.set(scale, scale, scale);
      }
    },

    bindEvents() {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      }, { passive: true });

      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.onResize(), 100);
      }, { passive: true });
    }
  };

  window.WelcomeBackground = WelcomeBackground;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WelcomeBackground.init());
  } else {
    WelcomeBackground.init();
  }
})();
