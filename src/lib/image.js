/**
 * @param {string} url
 * @param {string} name
 */
export function fallbackGradient(name = 'Y') {
  const initial = (name[0] || 'Y').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#151B3B"/><stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <text x="50%" y="54%" text-anchor="middle" fill="#FFB02E" font-size="180" font-family="Georgia">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** @param {React.SyntheticEvent<HTMLImageElement>} e @param {string} name */
export function onImgError(e, name) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallbackGradient(name);
}
