export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: section title
  // Row 1+: each cell is a pill label
  const titleText = rows[0]?.children[0]?.textContent.trim() || 'Operating principles';

  const pills = [];
  for (let i = 1; i < rows.length; i++) {
    [...rows[i].children].forEach((cell) => {
      const text = cell.textContent.trim();
      if (text) pills.push(text);
    });
  }

  const el = document.createElement('div');
  el.className = 'org-principles';

  const titleEl = document.createElement('div');
  titleEl.className = 'org-principles-title';
  titleEl.textContent = titleText;
  el.appendChild(titleEl);

  const pillsEl = document.createElement('div');
  pillsEl.className = 'org-principles-pills';
  pills.forEach((p) => {
    const span = document.createElement('span');
    span.className = 'org-pill';
    span.textContent = p;
    pillsEl.appendChild(span);
  });
  el.appendChild(pillsEl);

  block.innerHTML = '';
  block.appendChild(el);
}
