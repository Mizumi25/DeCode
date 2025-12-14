// Modern CSS Color Level 4 & 5 Support
// Supports: oklch(), oklab(), color-mix(), and advanced color spaces
//
// ============================================================================
// TAILWIND CSS INTEGRATION
// ============================================================================
//
// The Tailwind config now includes OKLCH and OKLAB colors!
//
// Usage Examples:
// 
// 1. Named OKLCH Colors:
//    - text-oklch-primary
//    - bg-oklch-vibrant-blue
//    - border-oklch-pastel-pink
//
// 2. Arbitrary OKLCH Values:
//    - text-[oklch(65%_0.25_250)]
//    - bg-[oklch(70%_0.20_320)]
//
// 3. color-mix() with Tailwind (use underscores for spaces):
//    - bg-[color-mix(in_oklch,_theme(colors.blue.500),_white_50%)]
//    - text-[color-mix(in_oklab,_red,_blue_30%)]
//
// 4. Named OKLAB Colors:
//    - text-oklab-primary
//    - bg-oklab-secondary
//
// 5. Arbitrary OKLAB Values:
//    - text-[oklab(65%_0.15_-0.10)]
//    - bg-[oklab(70%_0.12_0.08)]
//
// Browser Support:
// - Chrome 111+
// - Firefox 113+
// - Safari 16.4+
// ============================================================================

/**
 * Convert hex color to OKLCH
 * @param {string} hex - Hex color code
 * @returns {string} OKLCH color string
 */
export function hexToOklch(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to linear RGB
  const toLinear = (c) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const rL = toLinear(r);
  const gL = toLinear(g);
  const bL = toLinear(b);
  
  // Convert linear RGB to XYZ (D65 illuminant)
  const x = 0.4124564 * rL + 0.3575761 * gL + 0.1804375 * bL;
  const y = 0.2126729 * rL + 0.7151522 * gL + 0.0721750 * bL;
  const z = 0.0193339 * rL + 0.1191920 * gL + 0.9503041 * bL;
  
  // Convert XYZ to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_lab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b_lab * b_lab);
  const H = Math.atan2(b_lab, a) * 180 / Math.PI;
  
  return `oklch(${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H >= 0 ? H.toFixed(2) : (H + 360).toFixed(2)})`;
}

/**
 * Convert hex color to OKLAB
 * @param {string} hex - Hex color code
 * @returns {string} OKLAB color string
 */
export function hexToOklab(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to linear RGB
  const toLinear = (c) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const rL = toLinear(r);
  const gL = toLinear(g);
  const bL = toLinear(b);
  
  // Convert linear RGB to XYZ (D65 illuminant)
  const x = 0.4124564 * rL + 0.3575761 * gL + 0.1804375 * bL;
  const y = 0.2126729 * rL + 0.7151522 * gL + 0.0721750 * bL;
  const z = 0.0193339 * rL + 0.1191920 * gL + 0.9503041 * bL;
  
  // Convert XYZ to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_lab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
  return `oklab(${(L * 100).toFixed(2)}% ${a.toFixed(4)} ${b_lab.toFixed(4)})`;
}

/**
 * Generate color-mix() function
 * @param {string} color1 - First color
 * @param {string} color2 - Second color
 * @param {number} percentage - Mix percentage (0-100)
 * @param {string} colorSpace - Color space to mix in (srgb, oklch, oklab, etc.)
 * @returns {string} color-mix() string
 */
export function createColorMix(color1, color2, percentage = 50, colorSpace = 'oklch') {
  return `color-mix(in ${colorSpace}, ${color1} ${percentage}%, ${color2})`;
}

/**
 * Detect if a string is a modern color format
 * @param {string} color - Color string
 * @returns {object} Detection result
 */
export function detectColorFormat(color) {
  if (!color || typeof color !== 'string') {
    return { format: 'unknown', isModern: false };
  }
  
  const formats = {
    oklch: /^oklch\(/i,
    oklab: /^oklab\(/i,
    colorMix: /^color-mix\(/i,
    lch: /^lch\(/i,
    lab: /^lab\(/i,
    hex: /^#[0-9a-f]{3,8}$/i,
    rgb: /^rgba?\(/i,
    hsl: /^hsla?\(/i,
  };
  
  for (const [format, regex] of Object.entries(formats)) {
    if (regex.test(color.trim())) {
      const isModern = ['oklch', 'oklab', 'colorMix', 'lch', 'lab'].includes(format);
      return { format, isModern };
    }
  }
  
  return { format: 'unknown', isModern: false };
}

/**
 * Convert any color format to hex for color picker
 * @param {string} color - Color string in any format
 * @returns {string} Hex color or default
 */
export function colorToHex(color) {
  if (!color) return '#000000';
  
  const { format } = detectColorFormat(color);
  
  // If already hex, return it
  if (format === 'hex') {
    return color.length === 4 ? 
      `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : 
      color;
  }
  
  // For modern formats, we can't easily convert without browser support
  // Return a default color but preserve the original value
  if (format === 'oklch' || format === 'oklab' || format === 'colorMix') {
    return '#000000';
  }
  
  // Try to use browser to convert other formats
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    return ctx.fillStyle;
  } catch (e) {
    return '#000000';
  }
}

/**
 * Predefined OKLCH color palettes
 */
export const oklchPalettes = {
  vibrant: {
    primary: 'oklch(65% 0.25 250)',
    secondary: 'oklch(70% 0.20 320)',
    accent: 'oklch(75% 0.22 150)',
  },
  pastel: {
    primary: 'oklch(85% 0.10 250)',
    secondary: 'oklch(85% 0.10 320)',
    accent: 'oklch(85% 0.10 150)',
  },
  neon: {
    primary: 'oklch(75% 0.30 280)',
    secondary: 'oklch(75% 0.30 340)',
    accent: 'oklch(75% 0.30 140)',
  },
  earth: {
    primary: 'oklch(55% 0.12 60)',
    secondary: 'oklch(50% 0.10 120)',
    accent: 'oklch(60% 0.08 30)',
  }
};

/**
 * Predefined color-mix() recipes
 */
export const colorMixPresets = {
  lighten: (color) => createColorMix(color, 'white', 70, 'oklch'),
  darken: (color) => createColorMix(color, 'black', 70, 'oklch'),
  saturate: (color) => createColorMix(color, 'oklch(50% 0.3 0)', 80, 'oklch'),
  desaturate: (color) => createColorMix(color, 'oklch(50% 0 0)', 80, 'oklch'),
  transparent: (color, amount = 50) => createColorMix(color, 'transparent', amount, 'oklch'),
};

/**
 * Generate harmonious color schemes using OKLCH
 */
export function generateColorScheme(baseColor, scheme = 'analogous') {
  const { format } = detectColorFormat(baseColor);
  
  // If not already OKLCH, convert from hex
  let oklchColor = baseColor;
  if (format === 'hex') {
    oklchColor = hexToOklch(baseColor);
  }
  
  // Parse OKLCH values
  const match = oklchColor.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return [baseColor];
  
  const [, l, c, h] = match.map(Number);
  
  const schemes = {
    analogous: [
      `oklch(${l}% ${c} ${h})`,
      `oklch(${l}% ${c} ${(h + 30) % 360})`,
      `oklch(${l}% ${c} ${(h - 30 + 360) % 360})`,
    ],
    complementary: [
      `oklch(${l}% ${c} ${h})`,
      `oklch(${l}% ${c} ${(h + 180) % 360})`,
    ],
    triadic: [
      `oklch(${l}% ${c} ${h})`,
      `oklch(${l}% ${c} ${(h + 120) % 360})`,
      `oklch(${l}% ${c} ${(h + 240) % 360})`,
    ],
    tetradic: [
      `oklch(${l}% ${c} ${h})`,
      `oklch(${l}% ${c} ${(h + 90) % 360})`,
      `oklch(${l}% ${c} ${(h + 180) % 360})`,
      `oklch(${l}% ${c} ${(h + 270) % 360})`,
    ],
    monochromatic: [
      `oklch(${Math.max(0, l - 20)}% ${c} ${h})`,
      `oklch(${Math.max(0, l - 10)}% ${c} ${h})`,
      `oklch(${l}% ${c} ${h})`,
      `oklch(${Math.min(100, l + 10)}% ${c} ${h})`,
      `oklch(${Math.min(100, l + 20)}% ${c} ${h})`,
    ],
  };
  
  return schemes[scheme] || [baseColor];
}

/**
 * Check browser support for modern color features
 */
export function checkColorSupport() {
  const testElement = document.createElement('div');
  
  const features = {
    oklch: false,
    oklab: false,
    colorMix: false,
    lch: false,
    lab: false,
  };
  
  // Test OKLCH
  testElement.style.color = 'oklch(50% 0.2 180)';
  features.oklch = testElement.style.color !== '';
  
  // Test OKLAB
  testElement.style.color = 'oklab(50% 0.1 0.1)';
  features.oklab = testElement.style.color !== '';
  
  // Test color-mix()
  testElement.style.color = 'color-mix(in oklch, red, blue)';
  features.colorMix = testElement.style.color !== '';
  
  // Test LCH
  testElement.style.color = 'lch(50% 50 180)';
  features.lch = testElement.style.color !== '';
  
  // Test LAB
  testElement.style.color = 'lab(50% 25 25)';
  features.lab = testElement.style.color !== '';
  
  return features;
}
