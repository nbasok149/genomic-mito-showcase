/**
 * 3D Geo-Mitochondrial Migration Globe Viewer (D3.js Orthographic Projection)
 * Interactive 3D sphere with 360° mouse drag rotation, pulsing continental marker pins,
 * animated Out-of-Africa migration arcs, and bi-directional integration with TreeViewer.
 */

window.GlobeViewer = {
  geoData: null,
  migrationData: null,
  projection: null,
  pathGenerator: null,
  svgG: null,
  activeMarkerCode: null,
  isAutoRotating: true,
  lastInteractionTime: Date.now(),
  timer: null,

  init(geoData, migrationData) {
    this.geoData = geoData;
    this.migrationData = migrationData;
    this.render();
    this.bindEvents();
    this.startAutoRotation();
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      if (document.getElementById('globeContainer')) {
        this.render();
      }
    });
  },

  startAutoRotation() {
    if (this.timer) this.timer.stop();
    this.timer = d3.timer(() => {
      if (this.isAutoRotating && Date.now() - this.lastInteractionTime > 3000) {
        if (!this.projection) return;
        const rotate = this.projection.rotate();
        this.projection.rotate([rotate[0] + 0.28, rotate[1]]);
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
    
    // Specular Glow Gradient Definition
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

    // 2. Graticules (Latitude & Longitude Grid Lines)
    const graticule = d3.geoGraticule()();
    g.append('path')
      .attr('class', 'graticule-layer')
      .attr('d', this.pathGenerator(graticule))
      .attr('fill', 'none')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', '0.8px')
      .attr('stroke-opacity', '0.35')
      .attr('stroke-dasharray', '3 3');

    // 3. Landmass Features (GeoJSON Continents)
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

    // 4. Ancient Migration Arcs Layer
    g.append('g').attr('class', 'migration-arcs-layer');

    // 5. Continental Pins Layer
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

    // Initial render of arcs and markers
    this.updatePositions();
  },

  updatePositions() {
    if (!this.svgG || !this.projection) return;

    const path = this.pathGenerator;
    const rotate = this.projection.rotate();
    const centerLonLat = [-rotate[0], -rotate[1]];

    // Update Graticule & Land Paths
    this.svgG.select('.graticule-layer').attr('d', path(d3.geoGraticule()()));
    this.svgG.selectAll('.land-feature').attr('d', path);

    // Update Migration Arcs
    const arcsGroup = this.svgG.select('.migration-arcs-layer');
    arcsGroup.html('');

    if (this.migrationData && this.migrationData.routes && this.migrationData.markers) {
      const markersMap = new Map(this.migrationData.markers.map(m => [m.code, m]));

      this.migrationData.routes.forEach(route => {
        const mFrom = markersMap.get(route.from);
        const mTo = markersMap.get(route.to);

        if (mFrom && mTo) {
          const geoLine = {
            type: 'LineString',
            coordinates: [mFrom.coords, mTo.coords]
          };

          // Draw great-circle migration arc
          const arcPathStr = path(geoLine);
          if (arcPathStr) {
            arcsGroup.append('path')
              .attr('d', arcPathStr)
              .attr('fill', 'none')
              .attr('stroke', '#f97316')
              .attr('stroke-width', '2.2px')
              .attr('stroke-opacity', '0.7')
              .attr('stroke-dasharray', '5 3')
              .attr('class', 'migration-arc');
          }
        }
      });
    }

    // Update Continental Pins
    const markersGroup = this.svgG.select('.markers-layer');
    markersGroup.html('');

    if (this.migrationData && this.migrationData.markers) {
      this.migrationData.markers.forEach(m => {
        // Hemispheric Visibility Check (distance to visible center < 90°)
        const isVisible = d3.geoDistance(m.coords, centerLonLat) < (Math.PI / 2 - 0.1);
        if (!isVisible) return;

        const screenPos = this.projection(m.coords);
        if (!screenPos) return;

        const [x, y] = screenPos;
        const color = window.TreeViewer ? window.TreeViewer.ETHNICITY_COLORS[m.code] || '#ea580c' : '#ea580c';
        const isSelected = this.activeMarkerCode === m.code;

        const pinG = markersGroup.append('g')
          .attr('transform', `translate(${x},${y})`)
          .attr('class', `marker-pin marker-${m.code} cursor-pointer`)
          .on('click', (e) => {
            e.stopPropagation();
            this.onMarkerClick(m);
          });

        // Pulsing Outer Aura Ring
        pinG.append('circle')
          .attr('r', isSelected ? 16 : 11)
          .attr('fill', color)
          .attr('fill-opacity', isSelected ? 0.35 : 0.2)
          .attr('stroke', color)
          .attr('stroke-width', '1.2px')
          .attr('class', isSelected ? 'animate-ping' : '');

        // Core Pin Point
        pinG.append('circle')
          .attr('r', isSelected ? 8 : 6)
          .attr('fill', isSelected ? '#ffffff' : color)
          .attr('stroke', isSelected ? color : '#09090b')
          .attr('stroke-width', '2px')
          .attr('class', 'transition-all duration-200 hover:scale-125');

        // Label Pill Text
        const textG = pinG.append('g').attr('transform', 'translate(12, -2)');
        textG.append('rect')
          .attr('x', -4)
          .attr('y', -10)
          .attr('width', (m.name.length * 7.5) + 12)
          .attr('height', 18)
          .attr('rx', 6)
          .attr('fill', '#09090b')
          .attr('fill-opacity', '0.85')
          .attr('stroke', color)
          .attr('stroke-width', '1px');

        textG.append('text')
          .attr('x', 2)
          .attr('y', 2)
          .attr('fill', isSelected ? '#ffffff' : color)
          .style('font-size', '10.5px')
          .style('font-weight', 'bold')
          .style('font-family', 'JetBrains Mono, monospace')
          .text(m.name);
      });
    }
  },

  onMarkerClick(m) {
    this.activeMarkerCode = m.code;
    this.lastInteractionTime = Date.now();
    this.rotateTo(m.coords);

    // Synchronize with TreeViewer selection & Inspector
    if (window.TreeViewer) {
      window.TreeViewer.selectedEthnicities = [m.code];
      window.TreeViewer.renderFamilyGroupButtons();
      window.TreeViewer.highlightFamilyCluster();
    }

    // Launch Comparative Report Modal automatically
    if (window.FamilyReportGenerator) {
      let eth2 = 'AA';
      if (m.code === 'AA') eth2 = 'CL';
      window.FamilyReportGenerator.openReportModal(m.code, eth2, null);
    }
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
  }
};
