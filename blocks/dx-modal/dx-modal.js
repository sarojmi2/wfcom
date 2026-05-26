const CAT_COLORS = {
  Platform: { bg: '#FFF1F0', color: '#C00000' },
  Content: { bg: '#FFF0D4', color: '#8A4800' },
  Data: { bg: '#E0EDFF', color: '#0A4A90' },
  Journeys: { bg: '#ECE5FF', color: '#4A2A9A' },
  'Cross-cutting': { bg: '#FFE8F4', color: '#900060' },
  'Cross-cutting AI': { bg: '#E8FAF0', color: '#155A28' },
  Foundation: { bg: '#FFF1F0', color: '#C00000' },
  'AEP Agent': { bg: '#F0F0EC', color: '#333' },
};

const LINK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" width="13" height="13"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`;

let modalRoot = null;
let badge, titleEl, versionsEl, descEl, actionsEl;

function buildModal() {
  const cssUrl = new URL('./dx-modal.css', import.meta.url).href;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  document.head.appendChild(link);

  modalRoot = document.createElement('div');
  modalRoot.id = 'dx-modal-root';
  modalRoot.className = 'dx-modal-overlay';
  modalRoot.setAttribute('role', 'dialog');
  modalRoot.setAttribute('aria-modal', 'true');

  modalRoot.innerHTML = `
    <div class="dx-modal">
      <div class="dx-modal-hdr">
        <div>
          <span id="dx-mbadge" class="dx-modal-badge"></span>
          <h2 id="dx-mtitle" class="dx-modal-title"></h2>
        </div>
        <button class="dx-modal-close" aria-label="Close dialog">&#x2715;</button>
      </div>
      <div class="dx-modal-body">
        <div id="dx-mversions" class="dx-modal-versions"></div>
        <p id="dx-mdesc" class="dx-modal-desc"></p>
        <div id="dx-mactions" class="dx-modal-actions"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  badge = document.getElementById('dx-mbadge');
  titleEl = document.getElementById('dx-mtitle');
  versionsEl = document.getElementById('dx-mversions');
  descEl = document.getElementById('dx-mdesc');
  actionsEl = document.getElementById('dx-mactions');

  modalRoot.querySelector('.dx-modal-close').addEventListener('click', closeModal);
  modalRoot.addEventListener('click', (e) => {
    if (e.target === modalRoot) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalRoot.classList.contains('open')) closeModal();
  });
}

export function openModal({ title, cat, versions = [], desc, doc, docLabel, doc2, docLabel2 }) {
  if (!modalRoot) buildModal();

  const colors = CAT_COLORS[cat] || CAT_COLORS['AEP Agent'];
  badge.textContent = cat;
  badge.style.background = colors.bg;
  badge.style.color = colors.color;

  titleEl.textContent = title;

  versionsEl.innerHTML = '';
  if (versions.length) {
    versions.forEach((v) => {
      const span = document.createElement('span');
      span.className = 'dx-modal-ver';
      span.textContent = v;
      versionsEl.appendChild(span);
    });
  }

  descEl.textContent = desc || '';
  descEl.style.display = desc ? '' : 'none';

  actionsEl.innerHTML = '';
  if (doc) {
    const a = document.createElement('a');
    a.href = doc;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'dx-btn-primary';
    a.innerHTML = `${LINK_ICON} ${docLabel || 'Official docs'}`;
    actionsEl.appendChild(a);
  }
  if (doc2) {
    const a = document.createElement('a');
    a.href = doc2;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'dx-btn-secondary';
    a.innerHTML = `${LINK_ICON} ${docLabel2 || 'More docs'}`;
    actionsEl.appendChild(a);
  }

  modalRoot.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  if (!modalRoot) return;
  modalRoot.classList.remove('open');
  document.body.style.overflow = '';
}
