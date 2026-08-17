export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: eyebrow | brand name
  // Row 1: h1 title
  // Row 2: subtitle
  // Row 3: effective-date | source-text
  // Row 4: hint (optional)

  const r0 = [...(rows[0]?.children || [])];
  const r1 = [...(rows[1]?.children || [])];
  const r2 = [...(rows[2]?.children || [])];
  const r3 = [...(rows[3]?.children || [])];
  const r4 = [...(rows[4]?.children || [])];

  const eyebrow = r0[0]?.textContent.trim() || '';
  const h1Text = r1[0]?.textContent.trim() || '';
  const sub = r2[0]?.textContent.trim() || '';
  const effectiveDate = r3[0]?.textContent.trim() || '';
  const sourceText = r3[1]?.textContent.trim() || '';
  const hint = r4[0]?.textContent.trim() || '';

  const el = document.createElement('div');
  el.className = 'org-masthead';

  // Brand line with Adobe SVG mark
  const brandLine = document.createElement('div');
  brandLine.className = 'org-masthead-brandline';
  brandLine.innerHTML = `
    <svg class="org-masthead-brandmark" viewBox="0 0 30 27" aria-hidden="true">
      <path d="M19 0h11v27L19 0zM11 0H0v27L11 0zM15 10l7 17h-4.6l-2.1-5.3H10L15 10z"/>
    </svg>
    ${eyebrow ? `<p class="org-masthead-eyebrow">${eyebrow}</p>` : ''}
  `;
  el.appendChild(brandLine);

  if (h1Text) {
    const h1 = document.createElement('h1');
    h1.textContent = h1Text;
    el.appendChild(h1);
  }

  if (sub) {
    const subEl = document.createElement('p');
    subEl.className = 'org-masthead-sub';
    subEl.textContent = sub;
    el.appendChild(subEl);
  }

  if (effectiveDate || sourceText) {
    const valid = document.createElement('div');
    valid.className = 'org-masthead-valid';
    let validHTML = '';
    if (effectiveDate) validHTML += `<span><b>Effective</b> ${effectiveDate}</span>`;
    if (effectiveDate && sourceText) validHTML += `<span class="org-masthead-dot"></span>`;
    if (sourceText) validHTML += `<span>${sourceText}</span>`;
    valid.innerHTML = validHTML;
    el.appendChild(valid);
  }

  if (hint) {
    const hintEl = document.createElement('p');
    hintEl.className = 'org-masthead-hint';
    hintEl.textContent = hint;
    el.appendChild(hintEl);
  }

  block.innerHTML = '';
  block.appendChild(el);
}
