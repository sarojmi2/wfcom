/* eslint-disable no-use-before-define */

/*
 * org-tree block — authored table structure
 *
 * ROW 0  (header):     col0 = top-leader name  |  col1 = top-leader role
 *
 * BRANCH rows:         col0 = "branch"          |  col1 = leader name
 *                      col2 = tag label          |  col3 = role/subtitle
 *                      col4 = count label        |  col5 = hex color
 *
 * GROUP-LABEL rows:    col0 = "group"            |  col1 = group label text
 *
 * TILE rows:           col0 = "tile"             |  col1 = person name
 *                      col2 = role               |  col3 = "me" (optional, marks highlight)
 *
 * FLAT-BRANCH rows:    col0 = "flat"             |  col1 = leader name
 *                      col2 = tag label          |  col3 = role/subtitle
 *                      col4 = hex color
 *
 * MODAL-DATA rows:     col0 = "data"             |  col1 = key (matches branch/tile key)
 *                      col2 = category label     |  col3 = title
 *                      col4 = role               |  col5 = description
 *                      col6 = strategic bet (optional)
 */

// ─── Modal ───────────────────────────────────────────────────────────────────
let modalRoot = null;
let lastFocused = null;
let modalData = {};

function buildInlineModal(container) {
  const overlay = document.createElement('div');
  overlay.className = 'org-tree-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'otm-title');
  overlay.innerHTML = `
    <div class="org-tree-modal">
      <div class="org-tree-modal-top">
        <button class="org-tree-modal-close" aria-label="Close">&#x2715;</button>
        <div class="org-tree-modal-cat" id="otm-cat"></div>
        <h2 class="org-tree-modal-title" id="otm-title"></h2>
        <div class="org-tree-modal-role" id="otm-role"></div>
      </div>
      <div class="org-tree-modal-body">
        <p id="otm-desc"></p>
        <div class="org-tree-modal-bet" id="otm-bet"></div>
      </div>
    </div>
  `;
  overlay.querySelector('.org-tree-modal-close').addEventListener('click', closeOrgModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOrgModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) closeOrgModal();
  });
  container.appendChild(overlay);
  return overlay;
}

function openOrgModal(key) {
  const d = modalData[key];
  if (!d || !modalRoot) return;
  lastFocused = document.activeElement;
  modalRoot.querySelector('#otm-cat').textContent = d.cat || '';
  modalRoot.querySelector('#otm-title').textContent = d.title || key;
  modalRoot.querySelector('#otm-role').textContent = d.role || '';
  modalRoot.querySelector('#otm-desc').textContent = d.desc || '';
  const bet = modalRoot.querySelector('#otm-bet');
  if (d.bet) {
    bet.style.display = 'block';
    bet.innerHTML = `<b>Strategic bet · </b>${d.bet}`;
  } else {
    bet.style.display = 'none';
  }
  modalRoot.classList.add('show');
  modalRoot.querySelector('.org-tree-modal-close').focus();
}

function closeOrgModal() {
  if (!modalRoot) return;
  modalRoot.classList.remove('show');
  if (lastFocused) lastFocused.focus();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cell(row, idx) {
  return row.children[idx]?.textContent.trim() || '';
}

// ─── Branch builders ─────────────────────────────────────────────────────────
function buildBranch(b, isFirst) {
  const el = document.createElement('div');
  el.className = 'org-branch';
  if (isFirst) el.classList.add('open');

  const head = document.createElement('div');
  head.className = 'org-branch-head';
  head.setAttribute('tabindex', '0');
  head.setAttribute('role', 'button');
  head.setAttribute('aria-expanded', isFirst ? 'true' : 'false');
  head.innerHTML = `
    <span class="org-branch-swatch" style="background:${b.color || '#888'}"></span>
    <span class="org-branch-who">
      <span class="org-branch-name">${b.name}${b.tag ? ` <span class="org-tag">${b.tag}</span>` : ''}</span>
      <span class="org-branch-role">${b.role}</span>
    </span>
    ${b.count ? `<span class="org-branch-count">${b.count}</span>` : ''}
    <span class="org-branch-caret">&#8250;</span>
  `;
  head.addEventListener('click', () => toggleBranch(el, head));
  head.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBranch(el, head); }
  });

  const body = document.createElement('div');
  body.className = 'org-branch-body';
  b.groups.forEach((g) => {
    if (g.label) {
      const lbl = document.createElement('div');
      lbl.className = 'org-grp-label';
      lbl.textContent = g.label;
      body.appendChild(lbl);
    }
    const tilesEl = document.createElement('div');
    tilesEl.className = 'org-tiles';
    g.tiles.forEach((t) => {
      const tile = document.createElement('div');
      tile.className = `org-tile${t.me ? ' me' : ''}`;
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.innerHTML = `<div class="org-tile-name">${t.name}</div><div class="org-tile-role">${t.role}</div>`;
      tile.addEventListener('click', () => openOrgModal(t.key));
      tile.addEventListener('keydown', (e2) => {
        if (e2.key === 'Enter' || e2.key === ' ') { e2.preventDefault(); openOrgModal(t.key); }
      });
      tilesEl.appendChild(tile);
    });
    body.appendChild(tilesEl);
  });

  el.appendChild(head);
  el.appendChild(body);
  return el;
}

function buildFlatBranch(b) {
  const el = document.createElement('div');
  el.className = 'org-branch org-branch-flat';
  const head = document.createElement('div');
  head.className = 'org-branch-head';
  head.setAttribute('tabindex', '0');
  head.setAttribute('role', 'button');
  head.innerHTML = `
    <span class="org-branch-swatch" style="background:${b.color || '#888'}"></span>
    <span class="org-branch-who">
      <span class="org-branch-name">${b.name}${b.tag ? ` <span class="org-tag">${b.tag}</span>` : ''}</span>
      <span class="org-branch-role">${b.role}</span>
    </span>
    <span class="org-branch-view">View remit &#8250;</span>
  `;
  head.addEventListener('click', () => openOrgModal(b.key));
  head.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrgModal(b.key); }
  });
  el.appendChild(head);
  return el;
}

function toggleBranch(el, head) {
  const open = el.classList.toggle('open');
  head.setAttribute('aria-expanded', String(open));
}

// ─── Main decorate ────────────────────────────────────────────────────────────
export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = '';

  // ── Parse authored rows ───────────────────────────────────────────────────
  const leaderName = cell(rows[0], 0) || 'Manoj Nagpal';
  const leaderRole = cell(rows[0], 1) || 'GDC Leadership';
  const leaderKey = slugify(leaderName);

  const branches = [];
  const flatBranches = [];
  let currentBranch = null;
  let currentGroup = null;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const type = cell(r, 0).toLowerCase();

    if (type === 'branch') {
      currentGroup = { label: '', tiles: [] };
      currentBranch = {
        key: slugify(cell(r, 1)),
        name: cell(r, 1),
        tag: cell(r, 2),
        role: cell(r, 3),
        count: cell(r, 4),
        color: cell(r, 5) || '#888780',
        groups: [currentGroup],
      };
      branches.push(currentBranch);
    } else if (type === 'group') {
      if (currentBranch) {
        currentGroup = { label: cell(r, 1), tiles: [] };
        currentBranch.groups.push(currentGroup);
      }
    } else if (type === 'tile') {
      if (currentBranch && currentGroup) {
        currentGroup.tiles.push({
          key: slugify(cell(r, 1)),
          name: cell(r, 1),
          role: cell(r, 2),
          me: cell(r, 3).toLowerCase() === 'me',
        });
      }
    } else if (type === 'flat') {
      currentBranch = null;
      currentGroup = null;
      flatBranches.push({
        key: slugify(cell(r, 1)),
        name: cell(r, 1),
        tag: cell(r, 2),
        role: cell(r, 3),
        color: cell(r, 4) || '#888780',
      });
    } else if (type === 'data') {
      const key = cell(r, 1);
      if (key) {
        modalData[key] = {
          cat: cell(r, 2),
          title: cell(r, 3),
          role: cell(r, 4),
          desc: cell(r, 5),
          bet: cell(r, 6),
        };
      }
    }
  }

  // ── Build wrapper ──────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'org-tree-wrapper';

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'org-tree-toolbar';
  const btnAll = document.createElement('button');
  btnAll.className = 'org-toolbar-btn';
  btnAll.textContent = 'Expand all';
  const btnNone = document.createElement('button');
  btnNone.className = 'org-toolbar-btn';
  btnNone.textContent = 'Collapse all';
  toolbar.appendChild(btnAll);
  toolbar.appendChild(btnNone);
  wrapper.appendChild(toolbar);

  // Frame
  const frame = document.createElement('section');
  frame.className = 'org-frame';
  frame.setAttribute('aria-label', 'GDC leadership');

  const frameTab = document.createElement('div');
  frameTab.className = 'org-frame-tab';
  frameTab.setAttribute('tabindex', '0');
  frameTab.setAttribute('role', 'button');
  frameTab.innerHTML = 'GDC · EMERGE <span class="org-frame-tab-q">?</span>';
  frameTab.addEventListener('click', () => openOrgModal('emerge'));
  frameTab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrgModal('emerge'); }
  });
  frame.appendChild(frameTab);

  const leaderCard = document.createElement('div');
  leaderCard.className = 'org-leader-card';
  leaderCard.setAttribute('tabindex', '0');
  leaderCard.setAttribute('role', 'button');
  leaderCard.innerHTML = `<div class="org-lc-name">${leaderName}</div><div class="org-lc-role">${leaderRole}</div>`;
  leaderCard.addEventListener('click', () => openOrgModal(leaderKey));
  leaderCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrgModal(leaderKey); }
  });
  frame.appendChild(leaderCard);

  const reportsLabel = document.createElement('div');
  reportsLabel.className = 'org-reports-label';
  reportsLabel.textContent = 'Direct reports · expand any branch';
  frame.appendChild(reportsLabel);

  const branchesEl = document.createElement('div');
  branchesEl.className = 'org-branches';
  branches.forEach((b, i) => branchesEl.appendChild(buildBranch(b, i === 0)));
  flatBranches.forEach((b) => branchesEl.appendChild(buildFlatBranch(b)));
  frame.appendChild(branchesEl);
  wrapper.appendChild(frame);
  block.appendChild(wrapper);

  modalRoot = buildInlineModal(block);

  btnAll.addEventListener('click', () => {
    branchesEl.querySelectorAll('.org-branch:not(.org-branch-flat)').forEach((b) => {
      b.classList.add('open');
      const h = b.querySelector('.org-branch-head');
      if (h) h.setAttribute('aria-expanded', 'true');
    });
  });
  btnNone.addEventListener('click', () => {
    branchesEl.querySelectorAll('.org-branch:not(.org-branch-flat)').forEach((b) => {
      b.classList.remove('open');
      const h = b.querySelector('.org-branch-head');
      if (h) h.setAttribute('aria-expanded', 'false');
    });
  });
}
