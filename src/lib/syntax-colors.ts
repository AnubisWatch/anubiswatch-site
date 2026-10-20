/** Shared surfaces keep generated syntax colors aligned with both CSS themes. */
export const codeThemeVariables = { "--code-surface-dark": "#090d0b", "--code-surface-light": "#f4f2ec" };
const surfaces = { dark: codeThemeVariables["--code-surface-dark"], light: codeThemeVariables["--code-surface-light"] };
const cache = new Map<string, string>();
const rgb = (hex: string) => hex.slice(1).match(/../g)!.map(value => parseInt(value, 16));
const luminance = (channels: number[]) => channels.map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
const ratio = (a: number[], b: number[]) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);

function readableColor(color: string, theme: "light" | "dark") {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const key = theme + color;
  const saved = cache.get(key); if (saved) return saved;
  const original = rgb(color), background = rgb(surfaces[theme]), target = theme === "dark" ? 255 : 0;
  let result = color;
  // Headroom protects the 4.5:1 minimum after sRGB rounding.
  if (ratio(original, background) < 4.75) {
    const mix = (amount: number) => original.map(channel => Math.round(channel + (target - channel) * amount));
    let low = 0, high = 1;
    for (let i = 0; i < 16; i++) { const mid = (low + high) / 2; if (ratio(mix(mid), background) >= 4.75) high = mid; else low = mid; }
    result = "#" + mix(high).map(channel => channel.toString(16).padStart(2, "0")).join("");
  }
  cache.set(key, result); return result;
}

export function readableSyntaxStyle(style: Record<string, string> | undefined) {
  if (!style) return style;
  const result = { ...style };
  for (const theme of ["dark", "light"] as const) {
    const key = "--shiki-" + theme;
    if (result[key]) result[key] = readableColor(result[key], theme);
  }
  return result;
}
