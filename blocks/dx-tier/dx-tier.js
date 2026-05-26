import { openModal } from '../dx-modal/dx-modal.js';

export default function decorate(block) {
  const rows = [...block.children];
  const row0 = rows[0]?.children || [];
  const row1 = rows[1]?.children || [];

  const title = row0[0]?.textContent.trim() || '';
  const subtitle = row0[1]?.textContent.trim() || '';
  const desc = row1[0]?.textContent.trim() || '';
  const docLink = row1[1]?.querySelector('a');
  const doc2Link = row1[2]?.querySelector('a');

  const el = document.createElement('div');
  el.className = 'dx-tier';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.innerHTML = `
    <div class="dx-tier-label">${title}</div>
    <div class="dx-tier-sub">${subtitle}</div>
  `;

  const openData = {
    title,
    cat: 'Platform',
    desc,
    doc: docLink?.href || '',
    docLabel: docLink?.textContent.trim() || 'Official docs',
    doc2: doc2Link?.href || '',
    docLabel2: doc2Link?.textContent.trim() || '',
  };

  el.addEventListener('click', () => openModal(openData));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(openData);
    }
  });

  block.innerHTML = '';
  block.appendChild(el);
}
