/**
 * welcome_background.js
 * 
 * Decorative WebGL Background for mtDNA Variant Visualizer Startup Modal.
 * Inspired by Codrops "Decorative WebGL Backgrounds" by Louis Hoebregts
 * (https://tympanus.net/Development/DecorativeBackgrounds/) and
 * "Gradient Topography Animation" by Diana Hlevnjak & Codrops
 * (https://github.com/codrops/GradientTopographyAnimation/).
 * 
 * Features:
 * - Dual 3D organic topography formations flanking either side of the startup window
 *   (Amber/Gold warm ancestry on the left; Cyan/Emerald genomic mtDNA on the right).
 * - Multi-layered concentric contour elevation ribbons perturbed by 3D Simplex noise.
 * - Dynamic constellation point cloud with glowing particle nodes and subtle linkage segments.
 * - Ambient drifting genomic particle motes.
 * - Real-time mouse parallax tilt and smooth inertia.
 * - Auto-pauses animation loop when modal is closed to preserve 100% CPU/GPU performance.
 */

(function () {
  'use strict';

  // Fallback / safety check for THREE and noise
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
    leftFormation: null,
    rightFormation: null,
    ambientParticles: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    time: 0,
    dotTexture: null,

    // Configuration
    config: {
      linesAmount: 18,
      verticesPerLine: 54,
      baseRadius: 135,
      noiseAmplitude: 24,
      cameraZ: 800,
      constellationCount: 75,
      ambientCount: 90
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

        // Build Left (Amber/Gold) and Right (Cyan/Emerald) Topography Formations
        this.leftFormation = this.createTopographyFormation({
          isWarm: true,
          colorStops: [
            { h: 0.08, s: 0.95, l: 0.40 }, // Deep amber
            { h: 0.10, s: 0.95, l: 0.50 }, // Vivid gold
            { h: 0.12, s: 0.92, l: 0.60 }, // Bright amber-yellow
            { h: 0.14, s: 0.90, l: 0.72 }  // Pale sunlight
          ],
          noiseSeed: 0.0,
          tiltDirection: -1
        });
        this.scene.add(this.leftFormation.group);

        this.rightFormation = this.createTopographyFormation({
          isWarm: false,
          colorStops: [
            { h: 0.60, s: 0.85, l: 0.42 }, // Deep sky/indigo
            { h: 0.53, s: 0.95, l: 0.48 }, // Rich cyan
            { h: 0.47, s: 0.90, l: 0.52 }, // Emerald teal
            { h: 0.42, s: 0.92, l: 0.65 }  // Mint green
          ],
          noiseSeed: 42.5,
          tiltDirection: 1
        });
        this.scene.add(this.rightFormation.group);

        // Ambient background drifting particles
        this.ambientParticles = this.createAmbientParticles();
        this.scene.add(this.ambientParticles);

        // Bind events
        this.bindEvents();
        this.onResize();

        // Check if modal is initially active
        if (!modal.classList.contains('hidden')) {
          this.start();
        }

        // MutationObserver to start/stop loop reactively
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
      grad.addColorStop(0.2, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.55, 'rgba(255,255,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    },

    createTopographyFormation(opts) {
      const group = new THREE.Group();
      const lines = [];
      const { linesAmount, verticesPerLine, baseRadius } = this.config;

      // 1. Concentric 3D Elevation Ribbons
      for (let j = 0; j < linesAmount; j++) {
        const positions = new Float32Array((verticesPerLine + 1) * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const t = j / (linesAmount - 1);
        const color = this.interpolateColor(opts.colorStops, t);

        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.32 + t * 0.48,
          blending: THREE.AdditiveBlending,
          linewidth: 1.5
        });

        const line = new THREE.Line(geom, mat);
        line.userData = {
          baseY: (j / linesAmount) * baseRadius * 2,
          radius: baseRadius,
          origAngles: [],
          tierRatio: t
        };

        for (let i = 0; i <= verticesPerLine; i++) {
          const angle = (i / verticesPerLine) * Math.PI * 2;
          line.userData.origAngles.push(angle);
        }

        lines.push(line);
        group.add(line);
      }

      // 2. Constellation Point Cloud on the surface
      const pointCount = this.config.constellationCount;
      const pointPositions = new Float32Array(pointCount * 3);
      const pointColors = new Float32Array(pointCount * 3);
      const pointSizes = new Float32Array(pointCount);
      const pointData = [];

      for (let i = 0; i < pointCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1) - Math.PI / 2;
        const r = baseRadius * (0.88 + Math.random() * 0.28);

        pointData.push({
          theta,
          phi,
          r,
          speedTheta: (Math.random() - 0.5) * 0.003,
          speedPhi: (Math.random() - 0.5) * 0.002,
          baseSize: 3.5 + Math.random() * 4.0
        });

        const color = this.interpolateColor(opts.colorStops, Math.random());
        pointColors[i * 3] = color.r;
        pointColors[i * 3 + 1] = color.g;
        pointColors[i * 3 + 2] = color.b;
        pointSizes[i] = 4.0;
      }

      const pointGeom = new THREE.BufferGeometry();
      pointGeom.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
      pointGeom.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

      const pointMat = new THREE.PointsMaterial({
        size: 5,
        map: this.dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(pointGeom, pointMat);
      group.add(points);

      // 3. Delicate Constellation Linkages (LineSegments)
      const maxLinks = 160;
      const linkPositions = new Float32Array(maxLinks * 2 * 3);
      const linkGeom = new THREE.BufferGeometry();
      linkGeom.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3));

      const linkColor = this.interpolateColor(opts.colorStops, 0.6);
      const linkMat = new THREE.LineBasicMaterial({
        color: linkColor,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      });

      const links = new THREE.LineSegments(linkGeom, linkMat);
      group.add(links);

      return {
        group,
        lines,
        points,
        pointData,
        links,
        opts
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
        positions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 100;

        const isWarm = Math.random() > 0.5;
        const color = isWarm ? new THREE.Color(0xf59e0b) : new THREE.Color(0x38bdf8);
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
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const p = new THREE.Points(geom, mat);
      p.userData = { data };
      return p;
    },

    interpolateColor(stops, t) {
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

    updateFormation(formation, time, speed) {
      const { lines, points, pointData, links, opts } = formation;
      const { verticesPerLine, baseRadius, noiseAmplitude } = this.config;
      const hasNoise = typeof noise !== 'undefined' && typeof noise.simplex3 === 'function';

      // 1. Animate elevation contour lines
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        line.userData.baseY += speed;
        if (line.userData.baseY > baseRadius * 2) {
          line.userData.baseY = 0;
        }

        const currentY = line.userData.baseY;
        const radiusHeight = Math.sqrt(Math.max(0, currentY * (2 * baseRadius - currentY)));
        const pos = line.geometry.attributes.position.array;
        const angles = line.userData.origAngles;

        for (let i = 0; i <= verticesPerLine; i++) {
          const angle = angles[i];
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          let nR = 0;
          let nY = 0;

          if (hasNoise) {
            nR = noise.simplex3(
              cosA * 0.015 + opts.noiseSeed,
              sinA * 0.015 + time * 0.0006,
              currentY * 0.012
            ) * noiseAmplitude;

            nY = noise.simplex3(
              cosA * 0.018 + 12.0,
              sinA * 0.018 + time * 0.0004,
              currentY * 0.015
            ) * 12.0;
          }

          const r = Math.max(4, radiusHeight + nR);
          pos[i * 3] = cosA * r;
          pos[i * 3 + 1] = currentY - baseRadius + nY;
          pos[i * 3 + 2] = sinA * r;
        }

        line.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Animate constellation nodes
      const pointPos = points.geometry.attributes.position.array;
      const pointCount = pointData.length;

      for (let i = 0; i < pointCount; i++) {
        const p = pointData[i];
        p.theta += p.speedTheta;
        p.phi += p.speedPhi;

        let n = 0;
        if (hasNoise) {
          n = noise.simplex3(
            Math.cos(p.theta) * 0.02 + opts.noiseSeed,
            Math.sin(p.theta) * 0.02,
            time * 0.0005
          ) * 18.0;
        }

        const currentR = p.r + n;
        const x = currentR * Math.cos(p.phi) * Math.sin(p.theta);
        const y = currentR * Math.sin(p.phi);
        const z = currentR * Math.cos(p.phi) * Math.cos(p.theta);

        pointPos[i * 3] = x;
        pointPos[i * 3 + 1] = y;
        pointPos[i * 3 + 2] = z;
      }
      points.geometry.attributes.position.needsUpdate = true;

      // 3. Connect nearby constellation nodes
      const linkPos = links.geometry.attributes.position.array;
      const maxLinks = linkPos.length / 6;
      let linkIdx = 0;
      const linkThreshold = 38.0;

      for (let i = 0; i < pointCount && linkIdx < maxLinks; i++) {
        const x1 = pointPos[i * 3];
        const y1 = pointPos[i * 3 + 1];
        const z1 = pointPos[i * 3 + 2];

        for (let k = i + 1; k < pointCount && linkIdx < maxLinks; k++) {
          const dx = x1 - pointPos[k * 3];
          const dy = y1 - pointPos[k * 3 + 1];
          const dz = z1 - pointPos[k * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < linkThreshold * linkThreshold) {
            linkPos[linkIdx * 6] = x1;
            linkPos[linkIdx * 6 + 1] = y1;
            linkPos[linkIdx * 6 + 2] = z1;
            linkPos[linkIdx * 6 + 3] = pointPos[k * 3];
            linkPos[linkIdx * 6 + 4] = pointPos[k * 3 + 1];
            linkPos[linkIdx * 6 + 5] = pointPos[k * 3 + 2];
            linkIdx++;
          }
        }
      }

      // Zero out unused links
      for (let l = linkIdx; l < maxLinks; l++) {
        linkPos[l * 6] = 0;
        linkPos[l * 6 + 1] = 0;
        linkPos[l * 6 + 2] = 0;
        linkPos[l * 6 + 3] = 0;
        linkPos[l * 6 + 4] = 0;
        linkPos[l * 6 + 5] = 0;
      }
      links.geometry.attributes.position.needsUpdate = true;
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

      // Parallax smooth spring damping
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Update Left Formation (Warm Topography)
      if (this.leftFormation) {
        this.updateFormation(this.leftFormation, this.time, 0.42);
        this.leftFormation.group.rotation.y += 0.003;
        this.leftFormation.group.rotation.x = -this.mouse.y * 0.35 + 0.18;
        this.leftFormation.group.rotation.z = this.mouse.x * 0.15;
      }

      // Update Right Formation (Cool Topography)
      if (this.rightFormation) {
        this.updateFormation(this.rightFormation, this.time, 0.38);
        this.rightFormation.group.rotation.y -= 0.0035;
        this.rightFormation.group.rotation.x = -this.mouse.y * 0.35 - 0.18;
        this.rightFormation.group.rotation.z = -this.mouse.x * 0.15;
      }

      // Update ambient drift
      this.updateAmbientParticles();

      // Render Three.js scene
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

      // Calibrate perspective camera so 1 3D unit = 1 pixel at z = 0
      const z = this.config.cameraZ;
      const fov = 2 * Math.atan((h / 2) / z) * (180 / Math.PI);

      this.camera.fov = fov;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);

      // Dynamically flank the center modal card
      // Card width is max-w-3xl = 768px (or 92vw on smaller screens)
      const cardWidth = Math.min(w * 0.92, 768);
      const cardHalfW = cardWidth / 2;
      const flankSpace = Math.max(0, (w - cardWidth) / 2);

      // Positioning logic:
      // If wide screen (> 1024px), center the formations in the left and right gutters
      // If narrower, tuck them behind the flanks with slightly scaled down radius
      let posX = cardHalfW + flankSpace * 0.52;
      let scale = 1.0;
      let opacity = 1.0;

      if (flankSpace < 160) {
        // Small screen: scale down and pull slightly inward behind card edges
        scale = Math.max(0.55, flankSpace / 200);
        posX = cardHalfW + flankSpace * 0.4;
        opacity = 0.4;
      } else if (flankSpace < 280) {
        scale = 0.85;
        opacity = 0.8;
      }

      if (this.leftFormation) {
        this.leftFormation.group.position.x = -posX;
        this.leftFormation.group.position.y = 0;
        this.leftFormation.group.scale.set(scale, scale, scale);
      }

      if (this.rightFormation) {
        this.rightFormation.group.position.x = posX;
        this.rightFormation.group.position.y = 0;
        this.rightFormation.group.scale.set(scale, scale, scale);
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

  // Expose globally
  window.WelcomeBackground = WelcomeBackground;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WelcomeBackground.init());
  } else {
    WelcomeBackground.init();
  }
})();
