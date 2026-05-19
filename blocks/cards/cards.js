import { createOptimizedPicture } from '../../scripts/aem.js';

// Deterministic color palette for meta chips — same tag always gets same color
const CHIP_PALETTE = [
  { bg: '#1a3a5c', color: '#7eb6ff', border: '#2a4a6c' }, // blue
  { bg: '#2d1b4e', color: '#c084fc', border: '#3d2b5e' }, // purple
  { bg: '#3d2800', color: '#f59e0b', border: '#4d3800' }, // amber
  { bg: '#0d3333', color: '#2dd4bf', border: '#1d4343' }, // teal
  { bg: '#3d1a2e', color: '#f472b6', border: '#4d2a3e' }, // pink
  { bg: '#1a3320', color: '#4ade80', border: '#2a4330' }, // green
  { bg: '#3d1f00', color: '#fb923c', border: '#4d2f00' }, // orange
  { bg: '#1e1b4b', color: '#818cf8', border: '#2e2b5b' }, // indigo
];

function chipColor(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
  }
  return CHIP_PALETTE[Math.abs(hash) % CHIP_PALETTE.length];
}

function parseCardMeta(body) {
  const paragraphs = [...body.querySelectorAll(':scope > p')];
  const links = [...body.querySelectorAll('a')];
  const title = body.querySelector('h1, h2, h3, h4, h5, h6');

  let description = '';
  let metadata = [];
  let owner = '';
  let status = '';
  let ctaLink = null;
  const contentCandidates = [];

  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    const lower = text.toLowerCase();
    const looksLikeCtaOnly = p.querySelector('a') && text.length <= 12;
    const looksLikeTags = /[|,]/.test(text) && text.length < 120;

    if (lower.startsWith('status:')) {
      status = text.replace(/^status:\s*/i, '').trim();
      p.remove();
      return;
    }

    if (lower.startsWith('owner:')) {
      owner = text.replace(/^owner:\s*/i, '').trim();
      p.remove();
      return;
    }

    if (lower.startsWith('metadata:') || lower.startsWith('meta:')) {
      const raw = text.replace(/^(metadata|meta):\s*/i, '');
      metadata = raw.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
      p.remove();
      return;
    }

    if (!metadata.length && looksLikeTags) {
      metadata = text.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
      p.remove();
      return;
    }

    if (!owner && lower.startsWith('owner ')) {
      owner = text.replace(/^owner\s*/i, '').trim();
      p.remove();
      return;
    }

    if (!looksLikeCtaOnly && text) {
      contentCandidates.push(text);
    }
  });

  ctaLink = links.find((a) => /^(open|view|details|read)$/i.test(a.textContent.trim())) || null;

  if (!title && contentCandidates.length) {
    const inferredTitle = document.createElement('h3');
    inferredTitle.className = 'cards-card-title';
    inferredTitle.textContent = contentCandidates.shift();
    body.prepend(inferredTitle);
  }

  if (contentCandidates.length) {
    description = contentCandidates.find((text) => text.length > 55) || contentCandidates[0];
  }

  const resolvedTitle = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (resolvedTitle) resolvedTitle.classList.add('cards-card-title');

  return {
    description,
    metadata,
    owner,
    status: status || 'Active',
    ctaLink,
  };
}

function decorateMetaUI(li, body) {
  const {
    description, metadata, owner, status, ctaLink,
  } = parseCardMeta(body);

  const header = document.createElement('div');
  header.className = 'cards-card-header';

  const iconSlot = document.createElement('div');
  iconSlot.className = 'cards-card-icon';
  const imageLink = li.querySelector('.cards-card-image a, .cards-card-image picture');
  if (imageLink) {
    iconSlot.append(imageLink);
  } else {
    const placeholder = document.createElement('span');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.textContent = '□';
    iconSlot.append(placeholder);
  }

  const badge = document.createElement('span');
  badge.className = `cards-card-status cards-card-status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  badge.textContent = status;

  header.append(iconSlot, badge);

  const desc = document.createElement('p');
  desc.className = 'cards-card-description';
  desc.textContent = description;

  const metaWrap = document.createElement('div');
  metaWrap.className = 'cards-card-meta';
  metadata.forEach((item) => {
    const chip = document.createElement('span');
    chip.className = 'cards-card-chip';
    chip.textContent = item;
    const { bg, color, border } = chipColor(item.toLowerCase().trim());
    chip.style.setProperty('--chip-bg', bg);
    chip.style.setProperty('--chip-color', color);
    chip.style.setProperty('--chip-border', border);
    metaWrap.append(chip);
  });

  const footer = document.createElement('div');
  footer.className = 'cards-card-footer';
  if (owner) {
    const ownerNode = document.createElement('p');
    ownerNode.className = 'cards-card-owner';
    ownerNode.textContent = `Owner · ${owner}`;
    footer.append(ownerNode);
  } else {
    const ownerPlaceholder = document.createElement('p');
    ownerPlaceholder.className = 'cards-card-owner cards-card-owner-placeholder';
    ownerPlaceholder.setAttribute('aria-hidden', 'true');
    ownerPlaceholder.textContent = 'Owner ·';
    footer.append(ownerPlaceholder);
  }

  if (ctaLink) {
    ctaLink.classList.add('cards-card-cta');
    ctaLink.textContent = `${ctaLink.textContent.trim() || 'Open'} ->`;
    footer.append(ctaLink);
  } else {
    const ctaPlaceholder = document.createElement('span');
    ctaPlaceholder.className = 'cards-card-cta-placeholder';
    ctaPlaceholder.setAttribute('aria-hidden', 'true');
    ctaPlaceholder.textContent = 'Open ->';
    footer.append(ctaPlaceholder);
  }

  const title = body.querySelector('.cards-card-title');
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
  body.append(header);
  if (title) body.append(title);
  if (!description) {
    desc.textContent = 'No description provided.';
    desc.classList.add('is-placeholder');
  }
  body.append(desc);
  if (metadata.length) body.append(metaWrap);
  body.append(footer);
}

function buildCardList(rows) {
  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  ul.querySelectorAll('a').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  ul.querySelectorAll('li').forEach((li) => {
    const imageDiv = li.querySelector('.cards-card-image');
    const firstLink = li.querySelector('.cards-card-body a');
    if (imageDiv && firstLink) {
      const picture = imageDiv.querySelector('picture');
      if (picture) {
        const imgLink = document.createElement('a');
        imgLink.href = firstLink.href;
        imgLink.target = '_blank';
        imgLink.rel = 'noopener noreferrer';
        imgLink.setAttribute('aria-label', firstLink.textContent.trim() || 'Card link');
        picture.replaceWith(imgLink);
        imgLink.append(picture);
      }
    }

    const body = li.querySelector('.cards-card-body');
    if (body) decorateMetaUI(li, body);
  });

  return ul;
}

function decorateGrouped(block) {
  const groups = [];
  let current = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // A single-cell row with no picture is a group heading
    const isHeading = cells.length === 1 && !cells[0].querySelector('picture');
    if (isHeading) {
      current = { heading: cells[0].textContent.trim(), rows: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { heading: null, rows: [] };
        groups.push(current);
      }
      current.rows.push(row);
    }
  });

  const fragment = document.createDocumentFragment();
  groups.forEach((group) => {
    const section = document.createElement('div');
    section.className = 'cards-group';
    if (group.heading) {
      section.classList.add('has-heading');
      const h3 = document.createElement('h3');
      h3.className = 'cards-group-heading';
      h3.textContent = group.heading;
      section.append(h3);
    }
    section.append(buildCardList(group.rows));
    fragment.append(section);
  });

  block.replaceChildren(fragment);
}

export default function decorate(block) {
  if (block.classList.contains('grouped')) {
    decorateGrouped(block);
  } else {
    block.replaceChildren(buildCardList([...block.children]));
  }
}
