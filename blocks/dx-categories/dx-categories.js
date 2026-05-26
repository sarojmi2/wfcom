import { openModal } from '../dx-modal/dx-modal.js';

const CAT_MAP = {
  content: { key: 'content', label: 'Content' },
  data: { key: 'data', label: 'Data' },
  journey: { key: 'journeys', label: 'Journeys' },
  journeys: { key: 'journeys', label: 'Journeys' },
};

function getCatInfo(raw) {
  const lower = raw.toLowerCase().trim();
  return CAT_MAP[lower] || CAT_MAP[lower.split(/\s/)[0]] || { key: 'content', label: raw };
}

export default function decorate(block) {
  const cols = {
    content: { label: 'Content', products: [] },
    data: { label: 'Data', products: [] },
    journeys: { label: 'Journeys', products: [] },
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const catRaw = cells[0]?.textContent.trim() || '';
    const { key, label } = getCatInfo(catRaw);
    if (!cols[key]) return;

    const name = cells[1]?.textContent.trim() || '';
    const versionsRaw = cells[2]?.textContent.trim() || '';
    const desc = cells[3]?.textContent.trim() || '';
    const docLink = cells[4]?.querySelector('a');
    const doc2Link = cells[5]?.querySelector('a');

    const versions = versionsRaw
      ? versionsRaw.split('|').map((v) => v.trim()).filter(Boolean)
      : [];

    cols[key].products.push({
      name,
      label,
      key,
      versions,
      desc,
      doc: docLink?.href || '',
      docLabel: docLink?.textContent.trim() || 'Official docs',
      doc2: doc2Link?.href || '',
      docLabel2: doc2Link?.textContent.trim() || '',
    });
  });

  const grid = document.createElement('div');
  grid.className = 'dx-categories-grid';

  Object.entries(cols).forEach(([key, col]) => {
    const colEl = document.createElement('div');
    colEl.className = `dx-cat-col dx-col-${key}`;

    const hdr = document.createElement('div');
    hdr.className = `dx-cat-header dx-cat-${key}`;
    hdr.textContent = col.label;
    colEl.appendChild(hdr);

    const list = document.createElement('div');
    list.className = 'dx-cat-products';

    col.products.forEach((p) => {
      const prod = document.createElement('div');
      prod.className = `dx-product dx-product-${key}`;
      prod.setAttribute('role', 'button');
      prod.setAttribute('tabindex', '0');

      const rowEl = document.createElement('div');
      rowEl.className = 'dx-prod-row';
      rowEl.innerHTML = `
        <span class="dx-prod-dot"></span>
        <span class="dx-prod-name">${p.name}</span>
        ${p.versions.length ? '<span class="dx-prod-arrow">&#8250;</span>' : ''}
      `;
      prod.appendChild(rowEl);

      if (p.versions.length) {
        const vers = document.createElement('div');
        vers.className = 'dx-prod-versions';
        p.versions.forEach((v) => {
          const tag = document.createElement('span');
          tag.className = 'dx-ver-tag';
          tag.textContent = v;
          vers.appendChild(tag);
        });
        prod.appendChild(vers);
      }

      const modalData = {
        title: p.name,
        cat: p.label,
        versions: p.versions,
        desc: p.desc,
        doc: p.doc,
        docLabel: p.docLabel,
        doc2: p.doc2,
        docLabel2: p.docLabel2,
      };

      prod.addEventListener('click', () => openModal(modalData));
      prod.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(modalData);
        }
      });

      list.appendChild(prod);
    });

    colEl.appendChild(list);
    grid.appendChild(colEl);
  });

  block.innerHTML = '';
  block.appendChild(grid);
}
