import { openModal } from '../dx-modal/dx-modal.js';

export default function decorate(block) {
  const rows = [...block.children];
  const row0 = [...(rows[0]?.children || [])];
  const row1 = [...(rows[1]?.children || [])];

  const title = row0[0]?.textContent.trim() || '';
  const desc = row0[1]?.textContent.trim() || '';
  const doc1Link = row0[2]?.querySelector('a');
  const doc2Link = row0[3]?.querySelector('a');

  const capsRaw = row1[0]?.textContent.trim() || '';
  const caps = capsRaw ? capsRaw.split(',').map((c) => c.trim()).filter(Boolean) : [];

  const el = document.createElement('div');
  el.className = 'dx-platform-block';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');

  const titleEl = document.createElement('div');
  titleEl.className = 'dx-platform-title';
  titleEl.textContent = title;
  el.appendChild(titleEl);

  if (caps.length) {
    const capsEl = document.createElement('div');
    capsEl.className = 'dx-platform-caps';
    caps.forEach((c) => {
      const span = document.createElement('span');
      span.className = 'dx-cap';
      span.textContent = c;
      capsEl.appendChild(span);
    });
    el.appendChild(capsEl);
  }

  const openData = {
    title,
    cat: 'Foundation',
    desc,
    doc: doc1Link?.href || '',
    docLabel: doc1Link?.textContent.trim() || 'Official docs',
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
