export function formatGp(amount) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return Number.isInteger(millions) ? `${millions}m` : `${millions.toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return Number.isInteger(thousands) ? `${thousands}k` : `${thousands.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(amount);
}

export function wikiThumb(imageName) {
  // OSRS Wiki filenames use literal parentheses and apostrophes — do not encodeURIComponent.
  return `https://oldschool.runescape.wiki/images/${imageName.replace(/ /g, "_")}.png`;
}
