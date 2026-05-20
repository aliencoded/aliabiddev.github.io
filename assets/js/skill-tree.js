// Radial skill tree — D3 v7 for layout/rendering, GSAP for camera transitions.
// Data comes from window.SKILL_DATA (injected by skills.html via Jekyll).

(function () {
  if (typeof d3 === 'undefined' || typeof gsap === 'undefined') return;
  if (!window.SKILL_DATA) return;

  // ─── Configuration ────────────────────────────────────────────────────────
  // Tree is intentionally bigger than the viewport — user zooms in to read pills,
  // out for the big picture. Wider radii + aggressive radius stagger = no overlap
  // even in categories with 8+ children.
  const RADII = { root: 0, cat: 260, skill: 520, sub: 740 };
  const PILL_PAD_X = 10;
  const PILL_PAD_Y = 5;
  const FONT_PX = 11;
  const CHAR_W = 6.2; // approximate per-char width for sans-serif at 11px

  // ─── Build hierarchy ──────────────────────────────────────────────────────
  const root = d3.hierarchy(window.SKILL_DATA);

  // Bubble up category colors to all descendants
  root.descendants().forEach(d => {
    if (d.depth === 1) d.color = d.data.color;
    else if (d.parent) d.color = d.parent.color;
  });

  // Custom radial layout: place each depth at its assigned radius, distribute
  // angularly so siblings spread evenly, leaf groups stay tight.
  // Use d3.tree() to get angles, then override radius per depth.
  const layout = d3.tree()
    .size([2 * Math.PI, 1]) // angles 0..2π
    .separation((a, b) => {
      // Larger gaps between different categories to keep wedges visually distinct
      return (a.parent === b.parent ? 1 : 3) / Math.max(1, a.depth);
    });

  layout(root);

  // Stagger siblings across multiple radii so adjacent pills can't overlap, even
  // in crowded categories. Six-position rotation at skill depth gives every pill
  // a distinct distance from center within any 6-sibling window.
  const STAGGER_SKILL = [0, 130, 50, 180, 90, 220]; // px offsets, mod 6
  const STAGGER_SUB   = [0, 90, 40, 130];           // px offsets, mod 4

  root.descendants().forEach(d => {
    if (d.depth === 0) { d.r = RADII.root; return; }
    if (d.depth === 1) { d.r = RADII.cat;  return; }

    const sibs = d.parent.children || [];
    const idx  = sibs.indexOf(d);
    if (d.depth === 2) {
      d.r = RADII.skill + STAGGER_SKILL[idx % STAGGER_SKILL.length];
    } else {
      d.r = RADII.sub + STAGGER_SUB[idx % STAGGER_SUB.length];
    }
  });

  // Helper: convert (angle, r) → (x, y) — angle 0 = up, increases clockwise
  function polar(d) {
    const a = d.x - Math.PI / 2; // rotate so 0 = top
    return [Math.cos(a) * d.r, Math.sin(a) * d.r];
  }
  root.descendants().forEach(d => {
    const [x, y] = polar(d);
    d.px = x;
    d.py = y;
  });

  // ─── SVG setup ────────────────────────────────────────────────────────────
  const svg = d3.select('#skill-tree-svg');
  const svgEl = svg.node();
  const wrap = svgEl.parentNode;

  // Size the viewBox to fit the staggered tree. Max radial extent is now
  // ~RADII.sub + max sub stagger + half pill width ≈ 740 + 130 + 80 ≈ 950 from center.
  const W = 2000, H = 2000;
  svg.attr('viewBox', `${-W/2} ${-H/2} ${W} ${H}`)
     .attr('preserveAspectRatio', 'xMidYMid meet');

  // Outer group for zoom transforms
  const gZoom = svg.append('g').attr('class', 'zoom-root');

  // ─── Links ────────────────────────────────────────────────────────────────
  // Use radial link generator with cartesian (px, py) coords
  function linkPath(d) {
    const sx = d.source.px, sy = d.source.py;
    const tx = d.target.px, ty = d.target.py;
    // Smooth curve via quadratic Bezier toward the midpoint
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    // Pull control point toward the center on parent radius
    const pr = d.source.r;
    const ar = Math.atan2((sy + ty)/2, (sx + tx)/2);
    const cx = Math.cos(ar) * pr;
    const cy = Math.sin(ar) * pr;
    return `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;
  }

  const links = gZoom.append('g').attr('class', 'links')
    .selectAll('path')
    .data(root.links())
    .join('path')
      .attr('class', 'tree-link')
      .attr('d', linkPath)
      .attr('stroke', d => d.target.color || 'rgba(255,255,255,0.22)');

  // ─── Nodes ────────────────────────────────────────────────────────────────
  function nodeClass(d) {
    if (d.depth === 0) return 'node node-root';
    if (d.depth === 1) return 'node node-cat';
    if (d.depth === 2) return 'node node-skill';
    return 'node node-sub';
  }

  const nodes = gZoom.append('g').attr('class', 'nodes')
    .selectAll('g.node')
    .data(root.descendants())
    .join('g')
      .attr('class', nodeClass)
      .attr('transform', d => `translate(${d.px}, ${d.py})`)
      .style('color', d => d.color || '#FFF')
      .attr('data-depth', d => d.depth);

  nodes.each(function (d) {
    const sel = d3.select(this);

    if (d.depth === 0) {
      // Root: Ali Abid orb
      sel.append('circle').attr('r', 46);
      sel.append('text').attr('y', -4).text('Ali');
      sel.append('text').attr('y', 16).text('Abid');
      return;
    }

    // Compute pill width: dots area + text width
    const name = d.data.name;
    const prof = d.data.proficiency || 0;
    const hasDots = d.depth >= 2; // only skills/sub-skills show prof dots
    const dotsW = hasDots ? 26 : 0; // 3 dots × 5px + paddings
    const textW = name.length * CHAR_W;
    const innerW = textW + dotsW + (hasDots ? 8 : 0);
    const w = innerW + 2 * PILL_PAD_X;
    let h;

    if (d.depth === 1) {
      // Category: bigger, thicker pill
      h = 32;
      sel.append('rect')
        .attr('x', -w / 2).attr('y', -h / 2)
        .attr('width', w).attr('height', h)
        .attr('rx', h / 2).attr('ry', h / 2);
      sel.append('text').text(name).attr('y', 1);
    } else {
      // Skill or sub-skill pill
      h = 22;
      sel.append('rect')
        .attr('x', -w / 2).attr('y', -h / 2)
        .attr('width', w).attr('height', h)
        .attr('rx', h / 2).attr('ry', h / 2);

      // Proficiency dots on the left
      const dotsStartX = -w / 2 + PILL_PAD_X;
      for (let i = 0; i < 3; i++) {
        sel.append('circle')
          .attr('class', 'pill-dot ' + (i < prof ? 'on' : 'off'))
          .attr('cx', dotsStartX + 3 + i * 6)
          .attr('cy', 0)
          .attr('r', 2);
      }
      sel.append('text')
        .attr('x', dotsStartX + dotsW + 4)
        .attr('y', 1)
        .text(name);
    }

    // Store rect dims for later (focus calculations etc.)
    d.rectW = w;
    d.rectH = h;
  });

  // ─── Pan / zoom ───────────────────────────────────────────────────────────
  const zoom = d3.zoom()
    .scaleExtent([0.4, 3.5])
    .on('zoom', (event) => {
      gZoom.attr('transform', event.transform);
    });

  svg.call(zoom);

  // ─── Click interactivity ──────────────────────────────────────────────────
  const popover    = document.getElementById('tree-popover');
  const pCat       = document.getElementById('tree-popover-cat');
  const pTitle     = document.getElementById('tree-popover-title');
  const pProf      = document.getElementById('tree-popover-prof');
  const pMeta      = document.getElementById('tree-popover-meta');
  const closeBtn   = document.getElementById('tree-popover-close');
  const resetBtn   = document.getElementById('tree-reset');
  const expandBtn  = document.getElementById('tree-expand');
  let focused = null;

  function clearFocus() {
    nodes.classed('focused', false).classed('dimmed', false);
    links.classed('highlighted', false).classed('dimmed', false);
    focused = null;
    hidePopover();
  }

  function focusOn(d) {
    focused = d;
    // Dim everything not in this subtree (ancestors + descendants stay lit)
    const keepers = new Set();
    d.ancestors().forEach(n => keepers.add(n));
    d.descendants().forEach(n => keepers.add(n));

    nodes
      .classed('focused', n => n === d)
      .classed('dimmed', n => !keepers.has(n));

    links
      .classed('highlighted', l => keepers.has(l.source) && keepers.has(l.target))
      .classed('dimmed', l => !(keepers.has(l.source) && keepers.has(l.target)));

    // Camera: GSAP-animated zoom to center on this node
    const targetScale = d.depth === 1 ? 1.5 : 2.1;
    const cx = -d.px * targetScale;
    const cy = -d.py * targetScale;

    const cur = d3.zoomTransform(svgEl);
    const startObj = { k: cur.k, x: cur.x, y: cur.y };
    const endObj   = { k: targetScale, x: cx, y: cy };

    gsap.to(startObj, {
      ...endObj,
      duration: 0.85,
      ease: 'power3.inOut',
      onUpdate: () => {
        const t = d3.zoomIdentity.translate(startObj.x, startObj.y).scale(startObj.k);
        svg.call(zoom.transform, t);
      }
    });

    showPopover(d);
  }

  function resetView() {
    clearFocus();
    const cur = d3.zoomTransform(svgEl);
    const startObj = { k: cur.k, x: cur.x, y: cur.y };
    gsap.to(startObj, {
      k: 1, x: 0, y: 0,
      duration: 0.85,
      ease: 'power3.inOut',
      onUpdate: () => {
        const t = d3.zoomIdentity.translate(startObj.x, startObj.y).scale(startObj.k);
        svg.call(zoom.transform, t);
      }
    });
  }

  function showPopover(d) {
    if (d.depth === 0) return hidePopover();
    const cat = d.depth === 1 ? d.data.name : (d.ancestors().find(a => a.depth === 1) || {}).data?.name || '';
    pCat.textContent = d.depth === 1 ? 'CATEGORY' : cat;
    pCat.style.color = d.color || 'rgba(255,255,255,0.6)';
    pTitle.textContent = d.data.name;

    pProf.innerHTML = '';
    pProf.style.color = d.color || '#FFF';
    if (d.data.proficiency) {
      for (let i = 1; i <= 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'pp-dot' + (i > d.data.proficiency ? ' off' : '');
        pProf.appendChild(dot);
      }
    }

    if (d.depth === 1) {
      pMeta.textContent = `Contains ${d.descendants().length - 1} skills. Click any child to drill in.`;
    } else if (d.children) {
      pMeta.textContent = `${d.children.length} related sub-skill${d.children.length === 1 ? '' : 's'}. Proficiency ${d.data.proficiency || 1}/3.`;
    } else {
      pMeta.textContent = `Proficiency ${d.data.proficiency || 1}/3.`;
    }

    popover.removeAttribute('hidden');
    requestAnimationFrame(() => popover.classList.add('visible'));
  }

  function hidePopover() {
    popover.classList.remove('visible');
    setTimeout(() => popover.setAttribute('hidden', ''), 200);
  }

  nodes.on('click', function (event, d) {
    event.stopPropagation();
    if (d === focused) {
      // Second click on same node: reset
      resetView();
      return;
    }
    if (d.depth === 0) {
      resetView();
      return;
    }
    focusOn(d);
  });

  // Background click clears
  svg.on('click', () => {
    if (focused) clearFocus();
  });

  closeBtn.addEventListener('click', clearFocus);
  resetBtn.addEventListener('click', resetView);

  // Expand-all = same as reset (everything visible at default zoom)
  expandBtn.addEventListener('click', resetView);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetView();
  });

  // ─── Entry animation ──────────────────────────────────────────────────────
  // Fade-grow nodes + draw links with stagger
  gsap.from(links.nodes(), {
    strokeDasharray: 600,
    strokeDashoffset: 600,
    duration: 0.8,
    ease: 'power2.out',
    stagger: { each: 0.015, from: 'start' }
  });

  gsap.from(nodes.nodes(), {
    opacity: 0,
    scale: 0.5,
    transformOrigin: 'center',
    duration: 0.45,
    ease: 'back.out(1.6)',
    stagger: { each: 0.018, from: 'start' },
    delay: 0.3
  });
})();
