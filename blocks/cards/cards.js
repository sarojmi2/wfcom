import { createOptimizedPicture } from '../../scripts/aem.js';

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
  });

  block.replaceChildren(ul);
}
