// Keep custom accents readable on white surfaces and white button labels.
// Self-contained so the same function also runs before hydration.
export function readableLightAccent(value) {
  const palette = {
    '#59cf8d': '#247653', '#589eea': '#286bb6', '#ac7bea': '#7351b0',
    '#e77daa': '#a43769', '#ed9b61': '#a34c17', '#e57575': '#b13e45',
    '#50c6dd': '#13758a', '#e2c75b': '#886512',
    '#4169ff': '#3154d8', '#9747ff': '#7933d1', '#f238c8': '#b51c91',
    '#b4ef28': '#537b08', '#00ddb5': '#007c66', '#ff8126': '#a84c0b',
    '#ff5368': '#bd2944', '#ffd329': '#886500',
  };
  const color = palette[String(value).toLowerCase()] || value;
  if (!/^#[0-9a-f]{6}$/i.test(color || '')) return '#247653';
  let rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
  const luminance = channels => channels.map(v => {
    const n = v / 255;
    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
  }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  while (1.05 / (luminance(rgb) + .05) < 5.5) rgb = rgb.map(v => Math.floor(v * .95));
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}
