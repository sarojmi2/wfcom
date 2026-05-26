import { openModal } from '../dx-modal/dx-modal.js';

function buildHeader(cells, variant) {
  const title = cells[0]?.textContent.trim() || '';
  const sub = cells[1]?.textContent.trim() || '';
  const docLink = cells[2]?.querySelector('a');
  const orchestratedLink = cells[3]?.querySelector('a');

  const hdr = document.createElement('div');
  hdr.className = 'dx-band-header';

  const left = document.createElement('div');

  const titleRow = document.createElement('div');
  titleRow.className = 'dx-band-title-row';

  const titleEl = document.createElement('span');
  titleEl.className = `dx-band-title ${variant}`;
  titleEl.textContent = title;
  titleRow.appendChild(titleEl);

  if (orchestratedLink) {
    const sep = document.createElement('span');
    sep.className = 'dx-band-orchestrated-sep';
    sep.textContent = '— orchestrated by';
    titleRow.appendChild(sep);

    const orchLink = document.createElement('span');
    orchLink.className = `dx-band-title ${variant} dx-band-orchestrated`;
    orchLink.style.cursor = 'pointer';
    orchLink.textContent = orchestratedLink.textContent.trim();
    orchLink.addEventListener('click', () => {
      window.open(orchestratedLink.href, '_blank', 'noopener,noreferrer');
    });
    titleRow.appendChild(orchLink);

    const badge = document.createElement('span');
    badge.className = `dx-band-badge dx-band-badge-${variant}`;
    badge.textContent = 'Framework + Product';
    titleRow.appendChild(badge);
  }

  left.appendChild(titleRow);

  if (sub) {
    const subEl = document.createElement('div');
    subEl.className = 'dx-band-sub';
    subEl.textContent = sub;
    left.appendChild(subEl);
  }

  hdr.appendChild(left);

  if (docLink) {
    const a = document.createElement('a');
    a.href = docLink.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'dx-band-docs-link';
    a.textContent = docLink.textContent.trim() || 'Official docs →';
    hdr.appendChild(a);
  }

  return hdr;
}

function buildCSC(block, rows) {
  const container = document.createElement('div');
  container.className = 'dx-band-csc';
  container.appendChild(buildHeader([...rows[0].children], 'csc'));

  const stagesEl = document.createElement('div');
  stagesEl.className = 'dx-csc-stages';

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].children];
    const stageName = cells[0]?.textContent.trim() || '';
    const stageEl = document.createElement('div');
    stageEl.className = 'dx-csc-stage';

    const parts = stageName.match(/^(\d+)\.\s*(.+)$/);
    const num = parts ? parts[1] : '';
    const name = parts ? parts[2] : stageName;

    const titleEl = document.createElement('div');
    titleEl.className = 'dx-csc-stage-title';
    if (num) {
      const numEl = document.createElement('span');
      numEl.className = 'dx-csc-stage-num';
      numEl.textContent = num;
      titleEl.appendChild(numEl);
    }
    titleEl.appendChild(document.createTextNode(name));
    stageEl.appendChild(titleEl);

    const prodsEl = document.createElement('div');
    prodsEl.className = 'dx-csc-products';

    for (let j = 1; j < cells.length; j++) {
      const link = cells[j]?.querySelector('a');
      if (!link && !cells[j]?.textContent.trim()) continue;
      const productName = link?.textContent.trim() || cells[j].textContent.trim();
      if (!productName) continue;

      const btn = document.createElement('button');
      btn.className = 'dx-csc-product';
      btn.textContent = productName;
      btn.addEventListener('click', () => openModal({
        title: productName,
        cat: 'Cross-cutting',
        doc: link?.href || '',
        docLabel: link ? 'Official docs' : '',
      }));
      prodsEl.appendChild(btn);
    }

    stageEl.appendChild(prodsEl);
    stagesEl.appendChild(stageEl);
  }

  container.appendChild(stagesEl);
  return container;
}

function buildFirefly(block, rows) {
  const container = document.createElement('div');
  container.className = 'dx-band-firefly';
  container.appendChild(buildHeader([...rows[0].children], 'firefly'));

  const prodsEl = document.createElement('div');
  prodsEl.className = 'dx-ff-products';

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].children];
    const name = cells[0]?.textContent.trim() || '';
    const sub = cells[1]?.textContent.trim() || '';
    const desc = cells[2]?.textContent.trim() || '';
    const docLink = cells[3]?.querySelector('a');
    if (!name) continue;

    const btn = document.createElement('button');
    btn.className = 'dx-ff-tag';
    btn.innerHTML = `${name}${sub ? `<span class="dx-ff-tag-sub">${sub}</span>` : ''}`;
    btn.addEventListener('click', () => openModal({
      title: name,
      cat: 'Cross-cutting AI',
      desc,
      doc: docLink?.href || '',
      docLabel: docLink?.textContent.trim() || 'Official docs',
    }));
    prodsEl.appendChild(btn);
  }

  container.appendChild(prodsEl);
  return container;
}

export default function decorate(block) {
  const isFirefly = block.classList.contains('firefly');
  const rows = [...block.children];

  const inner = isFirefly ? buildFirefly(block, rows) : buildCSC(block, rows);
  block.innerHTML = '';
  block.appendChild(inner);
}
