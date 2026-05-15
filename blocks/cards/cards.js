import { createOptimizedPicture } from '../../scripts/aem.js';

function parseCardMeta(body) {
  const paragraphs = [...body.querySelectorAll(':scope > p')];
  const links = [...body.querySelectorAll('a')];
  const title = body.querySelector('h1, h2, h3, h4, h5, h6');

  let description = paragraphs[0]?.textContent?.trim() || '';
  let metadata = [];
  let owner = '';
  let status = '';
  let ctaLink = null;

  paragraphs.forEach((p, index) => {
    const text = p.textContent.trim();
    const lower = text.toLowerCase();

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

    if (!metadata.length && index > 0 && /[|,]/.test(text) && text.length < 100) {
      metadata = text.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
      p.remove();
      return;
    }

    if (!owner && index > 0 && lower.startsWith('owner ')) {
      owner = text.replace(/^owner\s*/i, '').trim();
      p.remove();
    }
  });

  ctaLink = links.find((a) => /^(open|view|details|read)$/i.test(a.textContent.trim())) || links[0] || null;

  if (!description && paragraphs[0]) {
    description = paragraphs[0].textContent.trim();
  }

  if (title) title.classList.add('cards-card-title');

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
    metaWrap.append(chip);
  });

  const footer = document.createElement('div');
  footer.className = 'cards-card-footer';
  if (owner) {
    const ownerNode = document.createElement('p');
    ownerNode.className = 'cards-card-owner';
    ownerNode.textContent = `Owner · ${owner}`;
    footer.append(ownerNode);
  }

  if (ctaLink) {
    ctaLink.classList.add('cards-card-cta');
    ctaLink.textContent = `${ctaLink.textContent.trim() || 'Open'} ->`;
    footer.append(ctaLink);
  }

  const title = body.querySelector('.cards-card-title');
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
  body.append(header);
  if (title) body.append(title);
  if (description) body.append(desc);
  if (metadata.length) body.append(metaWrap);
  if (owner || ctaLink) body.append(footer);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Open all links in a new tab
  ul.querySelectorAll('a').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  // Wrap card image in the first link found in the card body
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

  block.replaceChildren(ul);
}
