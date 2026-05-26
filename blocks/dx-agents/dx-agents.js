import { openModal } from '../dx-modal/dx-modal.js';

export default function decorate(block) {
  const rows = [...block.children];
  const hdrCells = [...(rows[0]?.children || [])];

  const title = hdrCells[0]?.textContent.trim() || '';
  const sub = hdrCells[1]?.textContent.trim() || '';

  const container = document.createElement('div');
  container.className = 'dx-agents-block';

  const hdr = document.createElement('div');
  hdr.className = 'dx-agents-hdr';
  hdr.innerHTML = `
    <div class="dx-agents-title">${title}</div>
    ${sub ? `<div class="dx-agents-sub">${sub}</div>` : ''}
  `;
  container.appendChild(hdr);

  const grid = document.createElement('div');
  grid.className = 'dx-agents-grid';

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].children];
    const name = cells[0]?.textContent.trim() || '';
    const desc = cells[1]?.textContent.trim() || '';
    const docLink = cells[2]?.querySelector('a');
    if (!name) continue;

    const btn = document.createElement('button');
    btn.className = 'dx-agent';
    btn.textContent = name;
    btn.addEventListener('click', () => openModal({
      title: name,
      cat: 'AEP Agent',
      desc,
      doc: docLink?.href || '',
      docLabel: docLink?.textContent.trim() || 'Official docs',
    }));
    grid.appendChild(btn);
  }

  container.appendChild(grid);
  block.innerHTML = '';
  block.appendChild(container);
}
