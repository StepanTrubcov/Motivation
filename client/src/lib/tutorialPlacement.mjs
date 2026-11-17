export function tutorialPlacement(rect, height, viewportHeight, preferBelow, safeTop = 24, safeBottom = 76) {
  const gap = 14;
  const above = rect.top - gap - safeTop;
  const below = viewportHeight - safeBottom - rect.top - rect.height - gap;
  const placeBelow = preferBelow ? below >= height || below >= above : !(above >= height || above >= below);
  const maxTop = Math.max(safeTop, viewportHeight - safeBottom - height);
  const top = Math.max(safeTop, Math.min(maxTop, placeBelow ? rect.top + rect.height + gap : rect.top - gap - height));
  return { placeBelow, top, anchorTop: top + height };
}
