export interface HsvColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

export interface RgbColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export interface HslColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

/**
 * Converte código Hexadecimal (#RGB ou #RRGGBB) para valores RGB e Alpha.
 */
export function hexToRgb(hexInput: string): RgbColor {
  const cleanHex = hexInput.replace(/^#/, "").trim();

  if (cleanHex.length === 3) {
    const r = Number.parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = Number.parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = Number.parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b, a: 1 };
  }

  if (cleanHex.length === 6) {
    const r = Number.parseInt(cleanHex.slice(0, 2), 16);
    const g = Number.parseInt(cleanHex.slice(2, 4), 16);
    const b = Number.parseInt(cleanHex.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }

  return { r: 20, g: 71, b: 230, a: 1 };
}

/**
 * Converte RGB para representação Hexadecimal de 6 dígitos (#RRGGBB).
 */
export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const clampR = Math.min(255, Math.max(0, Math.round(r)));
  const clampG = Math.min(255, Math.max(0, Math.round(g)));
  const clampB = Math.min(255, Math.max(0, Math.round(b)));

  const hexR = clampR.toString(16).padStart(2, "0");
  const hexG = clampG.toString(16).padStart(2, "0");
  const hexB = clampB.toString(16).padStart(2, "0");

  return `#${hexR}${hexG}${hexB}`.toLowerCase();
}

/**
 * Converte RGB para HSV (Hue, Saturation, Value/Brightness).
 */
export function rgbToHsv({ r, g, b, a = 1 }: RgbColor): HsvColor {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === normalizedR)
      h = ((normalizedG - normalizedB) / delta) % 6;
    else if (max === normalizedG)
      h = (normalizedB - normalizedR) / delta + 2;
    else
      h = (normalizedR - normalizedG) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v, a };
}

/**
 * Converte HSV para RGB.
 */
export function hsvToRgb({ h, s, v, a = 1 }: HsvColor): RgbColor {
  const normalizedS = s / 100;
  const normalizedV = v / 100;

  const c = normalizedV * normalizedS;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = normalizedV - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h >= 120 && h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    bPrime = c;
  } else if (h >= 300 && h < 360) {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a,
  };
}

/**
 * Converte HSV para HSL para formatos de exibição.
 */
export function hsvToHsl({ h, s, v, a = 1 }: HsvColor): HslColor {
  const normalizedS = s / 100;
  const normalizedV = v / 100;

  const l = normalizedV * (1 - normalizedS / 2);
  let saturation = 0;

  if (l > 0 && l < 1)
    saturation = (normalizedV - l) / Math.min(l, 1 - l);

  return {
    h,
    s: Math.round(saturation * 100),
    l: Math.round(l * 100),
    a,
  };
}

/**
 * Normaliza qualquer cor Hexadecimal para HSV.
 */
export function hexToHsv(hex: string): HsvColor {
  return rgbToHsv(hexToRgb(hex));
}

/**
 * Converte valor HSV direto para código Hexadecimal.
 */
export function hsvToHex(hsv: HsvColor): string {
  return rgbToHex(hsvToRgb(hsv));
}
