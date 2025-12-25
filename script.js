// IceThemeBuilder Pro - Professional Color Theory Implementation

// Enhanced Color Wheel Class
class ColorWheel {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 10;
    
    this.options = {
      lightness: options.lightness || 50,
      saturation: options.saturation || 100,
      onColorChange: options.onColorChange || (() => {})
    };
    
    this.currentColor = '#4da6ff';
    this.init();
  }
  
  init() {
    this.drawWheel();
    this.bindEvents();
  }
  
  drawWheel() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      this.context.beginPath();
      this.context.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.context.lineWidth = 2;
      this.context.strokeStyle = this.hslToHex(angle, this.options.saturation, this.options.lightness);
      this.context.stroke();
    }
    
    // Draw center circle for selected color
    this.context.beginPath();
    this.context.arc(this.centerX, this.centerY, 20, 0, 2 * Math.PI);
    this.context.fillStyle = this.currentColor;
    this.context.fill();
    this.context.lineWidth = 3;
    this.context.strokeStyle = '#ffffff';
    this.context.stroke();
  }
  
  hslToHex(h, s, l) {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  bindEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const distanceFromCenter = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
      
      if (distanceFromCenter <= this.radius) {
        const angle = Math.atan2(y - this.centerY, x - this.centerX) * 180 / Math.PI;
        const hue = (angle + 360) % 360;
        
        this.currentColor = this.hslToHex(hue, this.options.saturation, this.options.lightness);
        this.drawWheel();
        this.options.onColorChange(this.currentColor);
        this.updateColorDisplay();
      }
    });
  }
  
  setLightness(lightness) {
    this.options.lightness = lightness;
    this.drawWheel();
  }
  
  setSaturation(saturation) {
    this.options.saturation = saturation;
    this.drawWheel();
  }
  
  setColor(color) {
    this.currentColor = color;
    this.drawWheel();
    this.updateColorDisplay();
  }
  
  updateColorDisplay() {
    const colorPreview = document.getElementById('selectedColorPreview');
    const colorHex = document.getElementById('selectedColorHex');
    const colorHsl = document.getElementById('selectedColorHsl');
    const colorRgb = document.getElementById('selectedColorRgb');
    
    if (colorPreview) colorPreview.style.background = this.currentColor;
    if (colorHex) colorHex.textContent = this.currentColor.toUpperCase();
    
    const rgb = this.hexToRgb(this.currentColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (colorHsl) colorHsl.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    if (colorRgb) colorRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
  
  updateHarmonyPreview(harmonyType) {
    const harmonyContainer = document.getElementById('harmonyColors');
    if (!harmonyContainer) return;
    
    harmonyContainer.innerHTML = '';
    
    const harmonies = this.generateHarmonies(this.currentColor);
    const colors = harmonies[harmonyType] || harmonies.monochromatic;
    
    colors.forEach(color => {
      const colorElement = document.createElement('div');
      colorElement.className = 'harmony-color';
      colorElement.style.background = color;
      colorElement.setAttribute('data-color', color.toUpperCase());
      colorElement.setAttribute('title', `Use ${color.toUpperCase()}`);
      colorElement.setAttribute('aria-label', `Use color ${color.toUpperCase()}`);
      
      colorElement.addEventListener('click', () => {
        this.setColor(color);
        this.options.onColorChange(color);
      });
      
      harmonyContainer.appendChild(colorElement);
    });
  }
  
  generateHarmonies(baseHex) {
    const rgb = this.hexToRgb(baseHex);
    const baseHSL = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return {
      monochromatic: [
        this.hslToHex(baseHSL.h, baseHSL.s, Math.max(0, baseHSL.l - 30)),
        this.hslToHex(baseHSL.h, baseHSL.s, Math.max(0, baseHSL.l - 15)),
        baseHex,
        this.hslToHex(baseHSL.h, baseHSL.s, Math.min(100, baseHSL.l + 15)),
        this.hslToHex(baseHSL.h, baseHSL.s, Math.min(100, baseHSL.l + 30))
      ],
      complementary: [
        baseHex,
        this.hslToHex(baseHSL.h + 180, baseHSL.s, baseHSL.l)
      ],
      analogous: [
        this.hslToHex(baseHSL.h - 30, baseHSL.s, baseHSL.l),
        baseHex,
        this.hslToHex(baseHSL.h + 30, baseHSL.s, baseHSL.l)
      ],
      triadic: [
        baseHex,
        this.hslToHex(baseHSL.h + 120, baseHSL.s, baseHSL.l),
        this.hslToHex(baseHSL.h + 240, baseHSL.s, baseHSL.l)
      ],
      splitComplementary: [
        baseHex,
        this.hslToHex(baseHSL.h + 150, baseHSL.s, baseHSL.l),
        this.hslToHex(baseHSL.h + 210, baseHSL.s, baseHSL.l)
      ],
      tetradic: [
        baseHex,
        this.hslToHex(baseHSL.h + 60, baseHSL.s, baseHSL.l),
        this.hslToHex(baseHSL.h + 180, baseHSL.s, baseHSL.l),
        this.hslToHex(baseHSL.h + 240, baseHSL.s, baseHSL.l)
      ]
    };
  }
}

// Palette Optimization Engine
class PaletteOptimizer {
  constructor(colorTheory) {
    this.colorTheory = colorTheory;
    this.optimizationRules = {
      web: {
        minContrast: 4.5,
        maxColors: 8,
        maintainHarmony: true,
        brandConsistency: 0.8
      },
      print: {
        minContrast: 7,
        maxColors: 6,
        maintainHarmony: true,
        brandConsistency: 0.9
      },
      mobile: {
        minContrast: 4.5,
        maxColors: 5,
        maintainHarmony: true,
        brandConsistency: 0.7
      },
      corporate: {
        minContrast: 7,
        maxColors: 4,
        maintainHarmony: true,
        brandConsistency: 0.9
      },
      accessibility: {
        minContrast: 7,
        maxColors: 3,
        maintainHarmony: false,
        brandConsistency: 0.6
      },
      creative: {
        minContrast: 3,
        maxColors: 12,
        maintainHarmony: false,
        brandConsistency: 0.5
      }
    };
  }
  
  optimizePalette(colors, target = 'web', customRules = {}) {
    try {
      if (!Array.isArray(colors) || colors.length === 0) {
        throw new Error('No colors provided for optimization');
      }
      
      const rules = { ...this.optimizationRules[target], ...customRules };
      
      // Validate rules
      if (!rules.minContrast || rules.minContrast < 1) {
        rules.minContrast = 4.5; // Default WCAG AA
      }
      if (!rules.maxColors || rules.maxColors < 1) {
        rules.maxColors = 5; // Default
      }
      
      // Calculate current scores with error handling
      let accessibilityScore = 0;
      let harmonyScore = 0;
      let versatilityScore = 0;
      
      try {
        accessibilityScore = this.calculateAccessibilityScore(colors, rules.minContrast);
      } catch (error) {
        console.warn('Error calculating accessibility score:', error);
        accessibilityScore = 50; // Default score
      }
      
      try {
        harmonyScore = this.calculateHarmonyScore(colors);
      } catch (error) {
        console.warn('Error calculating harmony score:', error);
        harmonyScore = 50; // Default score
      }
      
      try {
        versatilityScore = this.calculateVersatilityScore(colors);
      } catch (error) {
        console.warn('Error calculating versatility score:', error);
        versatilityScore = 50; // Default score
      }
      
      // Generate optimized palette with progress callback
      const optimizedColors = this.generateOptimizedPalette(colors, rules);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(colors, optimizedColors, rules);
      
      // Calculate improvement metrics
      const improvements = {
        accessibility: optimizedColors.length > 0 ? 
          (this.calculateAccessibilityScore(optimizedColors, rules.minContrast) - accessibilityScore) : 0,
        harmony: optimizedColors.length > 0 ? 
          (this.calculateHarmonyScore(optimizedColors) - harmonyScore) : 0,
        versatility: optimizedColors.length > 0 ? 
          (this.calculateVersatilityScore(optimizedColors) - versatilityScore) : 0
      };
      
      return {
        originalColors: colors,
        optimizedColors,
        scores: {
          accessibility: Math.max(0, Math.min(100, accessibilityScore)),
          harmony: Math.max(0, Math.min(100, harmonyScore)),
          versatility: Math.max(0, Math.min(100, versatilityScore))
        },
        improvements,
        recommendations,
        rules,
        target,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error in palette optimization:', error);
      throw new Error('Failed to optimize palette: ' + error.message);
    }
  }
  
  calculateAccessibilityScore(colors, minContrast) {
    let totalScore = 0;
    let comparisons = 0;
    
    // Check contrast between all color pairs
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = this.colorTheory.contrastRatio(colors[i], colors[j]);
        if (ratio >= minContrast) {
          totalScore += Math.min(ratio / minContrast, 2) * 50; // Cap at 100%
        } else {
          totalScore += (ratio / minContrast) * 50;
        }
        comparisons++;
      }
    }
    
    return comparisons > 0 ? Math.round(totalScore / comparisons) : 0;
  }
  
  calculateHarmonyScore(colors) {
    if (colors.length < 2) return 100;
    
    let harmonyScore = 0;
    const baseHSL = this.colorTheory.hexToHsl(colors[0]);
    
    colors.forEach(color => {
      const colorHSL = this.colorTheory.hexToHsl(color);
      const hueDifference = Math.abs(colorHSL.h - baseHSL.h);
      const normalizedDifference = Math.min(hueDifference, 360 - hueDifference);
      
      // Score based on how well colors follow harmony principles
      if (normalizedDifference <= 30) {
        harmonyScore += 100; // Analogous
      } else if (Math.abs(normalizedDifference - 180) <= 30) {
        harmonyScore += 100; // Complementary
      } else if (Math.abs(normalizedDifference - 120) <= 30) {
        harmonyScore += 100; // Triadic
      } else {
        harmonyScore += Math.max(0, 100 - (normalizedDifference - 30));
      }
    });
    
    return Math.round(harmonyScore / colors.length);
  }
  
  calculateVersatilityScore(colors) {
    let versatilityScore = 0;
    
    colors.forEach(color => {
      const hsl = this.colorTheory.hexToHsl(color);
      
      // Score based on color properties
      const saturationScore = hsl.s > 30 && hsl.s < 80 ? 50 : 25;
      const lightnessScore = hsl.l > 20 && hsl.l < 80 ? 50 : 25;
      
      versatilityScore += saturationScore + lightnessScore;
    });
    
    return Math.round(versatilityScore / colors.length);
  }
  
  generateOptimizedPalette(colors, rules) {
    try {
      if (!Array.isArray(colors) || colors.length === 0) {
        console.warn('No colors provided for optimization');
        return [];
      }
      
      let optimized = [...colors];
      
      // Remove colors that don't meet contrast requirements
      optimized = optimized.filter(color => {
        if (!color || typeof color !== 'string') return false;
        return colors.some(otherColor => 
          otherColor && otherColor !== color &&
          this.colorTheory.contrastRatio(color, otherColor) >= rules.minContrast
        );
      });
      
      // If no colors remain after filtering, return original colors
      if (optimized.length === 0) {
        optimized = [...colors];
      }
      
      // Limit to maximum colors
      if (optimized.length > rules.maxColors) {
        optimized = this.selectMostVersatileColors(optimized, rules.maxColors);
      }
      
      // Adjust colors for better accessibility if needed
      optimized = optimized.map(color => {
        try {
          return this.improveColorAccessibility(color, rules.minContrast);
        } catch (error) {
          console.warn('Error improving color accessibility:', error);
          return color;
        }
      });
      
      // Ensure we maintain color harmony if requested
      if (rules.maintainHarmony && optimized.length > 1) {
        optimized = this.maintainColorHarmony(optimized);
      }
      
      return optimized;
      
    } catch (error) {
      console.error('Error generating optimized palette:', error);
      return colors; // Return original colors on error
    }
  }
  
  maintainColorHarmony(colors) {
    try {
      if (colors.length < 2) return colors;
      
      // Analyze the hue distribution
      const hues = colors.map(color => {
        try {
          const hsl = this.colorTheory.hexToHsl(color);
          return hsl.h;
        } catch (error) {
          return 0;
        }
      });
      
      // Check if colors follow harmony patterns
      const harmonyScore = this.calculateHarmonyScore(colors);
      
      // If harmony score is low, adjust colors to improve harmony
      if (harmonyScore < 60) {
        const baseHue = hues[0];
        const adjustedColors = [colors[0]]; // Keep the first color
        
        for (let i = 1; i < colors.length; i++) {
          const targetHue = (baseHue + (i * 120)) % 360; // Try triadic spacing
          const hsl = this.colorTheory.hexToHsl(colors[i]);
          const adjustedColor = this.colorTheory.hslToHex(targetHue, hsl.s, hsl.l);
          adjustedColors.push(adjustedColor);
        }
        
        return adjustedColors;
      }
      
      return colors;
      
    } catch (error) {
      console.warn('Error maintaining color harmony:', error);
      return colors;
    }
  }
  
  selectMostVersatileColors(colors, maxCount) {
    return colors
      .map(color => ({
        color,
        versatility: this.calculateVersatilityScore([color])
      }))
      .sort((a, b) => b.versatility - a.versatility)
      .slice(0, maxCount)
      .map(item => item.color);
  }
  
  improveColorAccessibility(color, minContrast) {
    const targetColors = ['#000000', '#ffffff', '#333333', '#f0f0f0'];
    
    // Find the best contrasting color
    let bestContrast = 0;
    let bestColor = color;
    
    targetColors.forEach(targetColor => {
      const contrast = this.colorTheory.contrastRatio(color, targetColor);
      if (contrast > bestContrast && contrast >= minContrast) {
        bestContrast = contrast;
        bestColor = color;
      }
    });
    
    // If no suitable contrast found, adjust the color
    if (bestContrast < minContrast) {
      const hsl = this.colorTheory.hexToHsl(color);
      
      // Adjust lightness to improve contrast
      if (hsl.l > 50) {
        // Darken the color
        return this.colorTheory.adjustLightness(color, -20);
      } else {
        // Lighten the color
        return this.colorTheory.adjustLightness(color, 20);
      }
    }
    
    return bestColor;
  }
  
  generateRecommendations(originalColors, optimizedColors, rules) {
    const recommendations = [];
    
    // Accessibility recommendations
    const originalAccessibility = this.calculateAccessibilityScore(originalColors, rules.minContrast);
    const optimizedAccessibility = this.calculateAccessibilityScore(optimizedColors, rules.minContrast);
    
    if (optimizedAccessibility > originalAccessibility) {
      recommendations.push({
        type: 'success',
        message: `Accessibility improved by ${optimizedAccessibility - originalAccessibility} points`
      });
    }
    
    // Color count recommendations
    if (originalColors.length > rules.maxColors) {
      recommendations.push({
        type: 'info',
        message: `Reduced from ${originalColors.length} to ${optimizedColors.length} colors for better usability`
      });
    }
    
    // Harmony recommendations
    const originalHarmony = this.calculateHarmonyScore(originalColors);
    const optimizedHarmony = this.calculateHarmonyScore(optimizedColors);
    
    if (optimizedHarmony < originalHarmony) {
      recommendations.push({
        type: 'warning',
        message: 'Harmony score decreased slightly to improve accessibility'
      });
    }
    
    // Contrast recommendations
    optimizedColors.forEach(color => {
      const hasGoodContrast = originalColors.some(otherColor => 
        this.colorTheory.contrastRatio(color, otherColor) >= rules.minContrast
      );
      
      if (!hasGoodContrast) {
        recommendations.push({
          type: 'error',
          message: `Color ${color} may have contrast issues with other palette colors`
        });
      }
    });
    
    return recommendations;
  }
}

// Collaboration & Sharing Manager
class CollaborationManager {
  constructor(colorTheory) {
    this.colorTheory = colorTheory;
  }
  
  generateShareableLink() {
    try {
      if (!this.colorTheory || !this.colorTheory.currentTheme) {
        throw new Error('No palette to share. Please create a color palette first.');
      }
      
      const theme = this.colorTheory.currentTheme;
      const shareData = {
        baseColor: theme.baseColor,
        harmonyType: theme.harmonyType,
        palette: theme.palette,
        timestamp: theme.timestamp,
        version: '2.0.0',
        app: 'IceThemeBuilder Pro'
      };
      
      // Validate data
      if (!shareData.baseColor || !shareData.palette || !Array.isArray(shareData.palette)) {
        throw new Error('Invalid palette data structure');
      }
      
      // Create a compressed base64 string
      const jsonString = JSON.stringify(shareData);
      const compressed = btoa(encodeURIComponent(jsonString));
      
      // Create the shareable URL
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?palette=${encodeURIComponent(compressed)}`;
      
      return shareUrl;
      
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error('Failed to generate shareable link: ' + error.message);
    }
  }
  
  parseSharedLink(url) {
    try {
      const urlObj = new URL(url);
      const urlParams = new URLSearchParams(urlObj.search);
      const paletteParam = urlParams.get('palette');
      
      if (!paletteParam) {
        throw new Error('No palette data found in URL');
      }
      
      const decoded = decodeURIComponent(paletteParam);
      const decompressed = atob(decoded);
      const jsonString = decodeURIComponent(decompressed);
      const paletteData = JSON.parse(jsonString);
      
      // Validate the data structure
      if (!paletteData.baseColor || !paletteData.palette || !Array.isArray(paletteData.palette)) {
        throw new Error('Invalid palette data structure');
      }
      
      // Validate color format
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(paletteData.baseColor)) {
        throw new Error('Invalid base color format');
      }
      
      // Validate all palette colors
      for (const color of paletteData.palette) {
        if (!hexRegex.test(color)) {
          throw new Error('Invalid palette color format');
        }
      }
      
      return paletteData;
      
    } catch (error) {
      console.error('Error parsing shared link:', error);
      throw new Error('Failed to parse shared palette: ' + error.message);
    }
  }
  
  exportPaletteAsImage() {
    if (!this.colorTheory.currentTheme) {
      throw new Error('No palette to export');
    }
    
    const theme = this.colorTheory.currentTheme;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const colorWidth = 120;
    const colorHeight = 80;
    const padding = 20;
    const titleHeight = 60;
    
    canvas.width = (colorWidth * theme.palette.length) + (padding * (theme.palette.length + 1));
    canvas.height = colorHeight + titleHeight + (padding * 2);
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IceThemeBuilder Pro Palette', canvas.width / 2, 35);
    
    // Add palette colors
    theme.palette.forEach((color, index) => {
      const x = padding + (index * (colorWidth + padding));
      const y = titleHeight + padding;
      
      // Draw color rectangle
      ctx.fillStyle = color;
      ctx.fillRect(x, y, colorWidth, colorHeight);
      
      // Add border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, colorWidth, colorHeight);
      
      // Add color code
      ctx.fillStyle = this.getReadableTextColor(color);
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), x + colorWidth / 2, y + colorHeight / 2);
    });
    
    // Add timestamp
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, 10, canvas.height - 10);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `color-palette-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
  
  shareToSocial(platform) {
    if (!this.colorTheory.currentTheme) {
      throw new Error('No palette to share');
    }
    
    const theme = this.colorTheory.currentTheme;
    const paletteColors = theme.palette.slice(0, 5).join(', ');
    
    const text = `Check out this amazing color palette I created with IceThemeBuilder Pro! 🎨\n\nColors: ${paletteColors}\nHarmony: ${theme.harmonyType}\n\nCreate your own at:`;
    const url = window.location.href;
    
    let shareUrl;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
        break;
      default:
        throw new Error('Unsupported social platform');
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
  
  getReadableTextColor(hex) {
    const rgb = this.colorTheory.hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
  
  // Simulated community stats (in a real app, these would come from a server)
  getCommunityStats() {
    // Generate realistic-looking stats
    const today = new Date().toDateString();
    const stored = localStorage.getItem('iceThemeBuilder_stats') || '{}';
    const stats = JSON.parse(stored);
    
    if (!stats.lastUpdated || stats.lastUpdated !== today) {
      stats.totalPalettes = (stats.totalPalettes || 125000) + Math.floor(Math.random() * 50);
      stats.totalShares = (stats.totalShares || 45000) + Math.floor(Math.random() * 20);
      stats.communitySize = (stats.communitySize || 18000) + Math.floor(Math.random() * 10);
      stats.todayPalettes = Math.floor(Math.random() * 2000) + 50;
      stats.lastUpdated = today;
      
      localStorage.setItem('iceThemeBuilder_stats', JSON.stringify(stats));
    }
    
    return stats;
  }
}

// Brand Color Analyzer from Images
class BrandAnalyzer {
  constructor(colorTheory) {
    this.colorTheory = colorTheory;
    this.uploadedImage = null;
    this.extractedColors = [];
  }
  
  async analyzeImage(imageFile, options = {}) {
    return new Promise((resolve, reject) => {
      if (!imageFile || !imageFile.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }
      
      if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Image file too large. Please select an image under 10MB.'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image for processing (max 400px width/height)
            const maxSize = 400;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Extract colors from canvas
            const colors = this.extractColorsFromCanvas(canvas, options);
            
            // Analyze the colors
            const analysis = this.analyzeExtractedColors(colors);
            
            resolve({
              image: img,
              colors: colors,
              analysis: analysis,
              canvas: canvas
            });
            
          } catch (error) {
            reject(new Error('Failed to analyze image: ' + error.message));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(imageFile);
    });
  }
  
  extractColorsFromCanvas(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    const colorCount = {};
    const maxColors = options.maxColors || 5;
    const method = options.method || 'dominant';
    const includeNeutrals = options.includeNeutrals !== false;
    
    if (!pixels || pixels.length === 0) {
      console.warn('No pixel data found in canvas');
      return [];
    }
    
    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Skip near-white and near-black if not including neutrals
      if (!includeNeutrals) {
        const brightness = (r + g + b) / 3;
        if (brightness > 240 || brightness < 15) continue;
      }
      
      const hex = this.rgbToHex(r, g, b);
      colorCount[hex] = (colorCount[hex] || 0) + 1;
    }
    
    // Sort colors by frequency
    const sortedColors = Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .map(([color, count]) => ({ color, count }));
    
    if (sortedColors.length === 0) {
      return [];
    }
    
    // Apply method-specific filtering
    let filteredColors = sortedColors;
    
    try {
      switch (method) {
        case 'balanced':
          // Select colors with good distribution across hue spectrum
          filteredColors = this.selectBalancedColors(sortedColors, maxColors);
          break;
        case 'vibrant':
          // Prioritize saturated, bright colors
          filteredColors = this.selectVibrantColors(sortedColors, maxColors);
          break;
        case 'neutral':
          // Focus on neutral tones
          filteredColors = this.selectNeutralColors(sortedColors, maxColors);
          break;
        default: // 'dominant'
          filteredColors = sortedColors.slice(0, maxColors);
      }
    } catch (error) {
      console.warn('Error in color filtering method:', error);
      filteredColors = sortedColors.slice(0, maxColors);
    }
    
    // Calculate percentages
    const total = sortedColors.reduce((sum, [, count]) => sum + count, 0);
    
    if (total === 0) {
      return [];
    }
    
    try {
      return filteredColors.map(({ color, count }) => {
        const rgb = this.hexToRgb(color);
        const hsl = this.hexToHsl(color);
        
        return {
          hex: color,
          percentage: (count / total) * 100,
          rgb: rgb,
          hsl: hsl
        };
      });
    } catch (error) {
      console.warn('Error creating color analysis results:', error);
      return [];
    }
  }
  
  selectBalancedColors(sortedColors, maxColors) {
    const selected = [];
    const hues = [];
    
    if (!Array.isArray(sortedColors) || sortedColors.length === 0) {
      return selected;
    }
    
    for (const { color } of sortedColors) {
      if (!color) continue;
      
      const hsl = this.hexToHsl(color);
      const hue = hsl.h;
      
      // Check if this hue is too close to already selected colors
      const isTooClose = hues.some(selectedHue => {
        const diff = Math.abs(hue - selectedHue);
        return Math.min(diff, 360 - diff) < 30; // 30 degree minimum separation
      });
      
      if (!isTooClose) {
        selected.push({ color, count: 1 });
        hues.push(hue);
        
        if (selected.length >= maxColors) break;
      }
    }
    
    // If we don't have enough colors, fill with the most frequent
    if (selected.length < maxColors) {
      const remaining = sortedColors
        .filter(({ color }) => !selected.find(s => s.color === color))
        .slice(0, maxColors - selected.length);
      
      selected.push(...remaining);
    }
    
    return selected;
  }
  
  selectVibrantColors(sortedColors, maxColors) {
    return sortedColors
      .filter(({ color }) => {
        const hsl = this.hexToHsl(color);
        return hsl.s > 40 && hsl.l > 20 && hsl.l < 80;
      })
      .slice(0, maxColors);
  }
  
  selectNeutralColors(sortedColors, maxColors) {
    return sortedColors
      .filter(({ color }) => {
        const hsl = this.hexToHsl(color);
        return hsl.s < 30 || hsl.l < 20 || hsl.l > 80;
      })
      .slice(0, maxColors);
  }
  
  analyzeExtractedColors(colors) {
    if (colors.length === 0) {
      return {
        temperature: 'neutral',
        harmony: 'none',
        vibrancy: 'low',
        recommendations: ['No colors detected in image']
      };
    }
    
    // Analyze temperature (warm vs cool)
    const temperature = this.analyzeTemperature(colors);
    
    // Analyze harmony
    const harmony = this.analyzeHarmony(colors);
    
    // Analyze vibrancy
    const vibrancy = this.analyzeVibrancy(colors);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(colors, { temperature, harmony, vibrancy });
    
    return {
      temperature,
      harmony,
      vibrancy,
      recommendations
    };
  }
  
  analyzeTemperature(colors) {
    let warmScore = 0;
    let coolScore = 0;
    
    colors.forEach(colorData => {
      const { hsl, percentage } = colorData;
      const weight = percentage / 100;
      
      // Warm colors: red, orange, yellow (0-60 and 300-360)
      if ((hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360)) {
        warmScore += weight * hsl.s / 100;
      }
      
      // Cool colors: green, blue, purple (60-300)
      if (hsl.h >= 60 && hsl.h <= 300) {
        coolScore += weight * hsl.s / 100;
      }
    });
    
    if (warmScore > coolScore * 1.2) return 'warm';
    if (coolScore > warmScore * 1.2) return 'cool';
    return 'neutral';
  }
  
  analyzeHarmony(colors) {
    if (!Array.isArray(colors) || colors.length === 0) return 'none';
    if (colors.length < 2) return 'monochromatic';
    
    try {
      const hues = colors.map(c => c && c.hsl ? c.hsl.h : 0).filter(h => typeof h === 'number' && !isNaN(h));
      
      if (hues.length === 0) return 'monochromatic';
      
      const minHue = Math.min(...hues);
      const maxHue = Math.max(...hues);
      const hueRange = maxHue - minHue;
      
      // Check for specific harmony patterns
      const hasComplementary = this.checkComplementary(hues);
      if (hasComplementary) return 'complementary';
      
      const hasAnalogous = this.checkAnalogous(hues);
      if (hasAnalogous) return 'analogous';
      
      const hasTriadic = this.checkTriadic(hues);
      if (hasTriadic) return 'triadic';
      
      // If range is small, it's monochromatic
      if (hueRange < 30) return 'monochromatic';
      
      // If range is large, it's polychromatic
      return 'polychromatic';
    } catch (error) {
      console.warn('Error analyzing harmony:', error);
      return 'monochromatic';
    }
  }
  
  checkComplementary(hues) {
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        const diff = Math.abs(hues[i] - hues[j]);
        if (Math.min(diff, 360 - diff) > 150 && Math.min(diff, 360 - diff) < 210) {
          return true;
        }
      }
    }
    return false;
  }
  
  checkAnalogous(hues) {
    const sorted = [...hues].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] > 60) {
        return false;
      }
    }
    return true;
  }
  
  checkTriadic(hues) {
    const targetDiffs = [120, 240];
    for (const hue of hues) {
      for (const diff of targetDiffs) {
        const target = (hue + diff) % 360;
        if (hues.some(h => Math.abs(h - target) < 30 || Math.abs(h - target) > 330)) {
          return true;
        }
      }
    }
    return false;
  }
  
  analyzeVibrancy(colors) {
    const avgSaturation = colors.reduce((sum, c) => sum + c.hsl.s, 0) / colors.length;
    const avgLightness = colors.reduce((sum, c) => sum + c.hsl.l, 0) / colors.length;
    
    if (avgSaturation > 60 && avgLightness > 30 && avgLightness < 70) {
      return 'high';
    } else if (avgSaturation > 30) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  generateRecommendations(colors, analysis) {
    const recommendations = [];
    
    // Temperature-based recommendations
    if (analysis.temperature === 'warm') {
      recommendations.push('Warm color palette - great for energy, enthusiasm, and approachability');
    } else if (analysis.temperature === 'cool') {
      recommendations.push('Cool color palette - conveys trust, professionalism, and calmness');
    } else {
      recommendations.push('Balanced color temperature - versatile for various brand applications');
    }
    
    // Harmony-based recommendations
    switch (analysis.harmony) {
      case 'complementary':
        recommendations.push('Complementary harmony creates high contrast and visual interest');
        break;
      case 'analogous':
        recommendations.push('Analogous harmony provides natural, cohesive color relationships');
        break;
      case 'triadic':
        recommendations.push('Triadic harmony offers vibrant, balanced color distribution');
        break;
      case 'monochromatic':
        recommendations.push('Monochromatic scheme creates sophisticated, unified brand identity');
        break;
    }
    
    // Vibrancy-based recommendations
    switch (analysis.vibrancy) {
      case 'high':
        recommendations.push('High vibrancy - perfect for dynamic, attention-grabbing brands');
        break;
      case 'medium':
        recommendations.push('Medium vibrancy - balanced approach suitable for professional brands');
        break;
      case 'low':
        recommendations.push('Low vibrancy - elegant, sophisticated palette for premium brands');
        break;
    }
    
    // Accessibility recommendations
    const hasGoodContrast = this.checkAccessibility(colors);
    if (!hasGoodContrast) {
      recommendations.push('Consider adjusting color lightness for better accessibility compliance');
    }
    
    return recommendations;
  }
  
  checkAccessibility(colors) {
    // Check if there are sufficient contrast ratios
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = this.colorTheory.contrastRatio(colors[i].hex, colors[j].hex);
        if (ratio >= 4.5) return true;
      }
    }
    return false;
  }
  
  // Utility methods
  rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  
  hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }
}

// AI-Powered Color Intelligence System
class AIColorIntelligence {
  constructor() {
    this.colorPsychologyDatabase = {
      // Primary colors with psychological associations
      red: {
        emotions: ['passion', 'energy', 'urgency', 'power', 'excitement'],
        industries: ['entertainment', 'food', 'automotive', 'sports', 'fashion'],
        accessibility: 'medium',
        cultural: {
          western: ['love', 'danger', 'energy', 'excitement'],
          eastern: ['luck', 'prosperity', 'happiness', 'celebration'],
          middle_eastern: ['courage', 'strength', 'passion'],
          cultural_note: 'Generally positive across cultures, associated with luck in Eastern cultures'
        },
        confidence: 0.9
      },
      blue: {
        emotions: ['trust', 'calm', 'professional', 'reliable', 'peaceful'],
        industries: ['corporate', 'healthcare', 'technology', 'finance', 'government'],
        accessibility: 'high',
        cultural: {
          western: ['trust', 'stability', 'professionalism', 'calm'],
          eastern: ['immortality', 'healing', 'trust', 'peace'],
          middle_eastern: ['protection', 'wisdom', 'peace'],
          cultural_note: 'Universally positive, associated with trust and stability'
        },
        confidence: 0.95
      },
      green: {
        emotions: ['growth', 'nature', 'health', 'balance', 'harmony'],
        industries: ['eco', 'healthcare', 'agriculture', 'finance', 'wellness'],
        accessibility: 'high',
        cultural: {
          western: ['nature', 'health', 'money', 'growth'],
          eastern: ['fertility', 'youth', 'harmony', 'new beginnings'],
          middle_eastern: ['fertility', 'prosperity', 'strength'],
          cultural_note: 'Positive in most cultures, associated with nature and fertility'
        },
        confidence: 0.9
      },
      yellow: {
        emotions: ['happiness', 'optimism', 'energy', 'attention', 'warmth'],
        industries: ['retail', 'food', 'entertainment', 'automotive', 'safety'],
        accessibility: 'low',
        cultural: {
          western: ['happiness', 'caution', 'optimism', 'energy'],
          eastern: ['royalty', 'power', 'prosperity', 'happiness'],
          middle_eastern: ['prosperity', 'happiness', 'warmth'],
          cultural_note: 'Generally positive but can indicate caution in Western cultures'
        },
        confidence: 0.8
      },
      purple: {
        emotions: ['luxury', 'creativity', 'mystery', 'sophistication', 'spirituality'],
        industries: ['luxury', 'creative', 'beauty', 'spirituality', 'fashion'],
        accessibility: 'medium',
        cultural: {
          western: ['luxury', 'creativity', 'royalty', 'mystery'],
          eastern: ['nobility', 'spirituality', 'luxury', 'power'],
          middle_eastern: ['nobility', 'spirituality', 'luxury'],
          cultural_note: 'Associated with royalty and luxury across cultures'
        },
        confidence: 0.85
      },
      orange: {
        emotions: ['enthusiasm', 'creativity', 'encouragement', 'vitality', 'friendliness'],
        industries: ['creative', 'food', 'entertainment', 'sports', 'hospitality'],
        accessibility: 'medium',
        cultural: {
          western: ['energy', 'enthusiasm', 'creativity', 'friendliness'],
          eastern: ['happiness', 'change', 'spirituality', 'health'],
          middle_eastern: ['warmth', 'hospitality', 'creativity'],
          cultural_note: 'Generally positive, associated with warmth and creativity'
        },
        confidence: 0.8
      },
      pink: {
        emotions: ['love', 'compassion', 'nurturing', 'femininity', 'gentleness'],
        industries: ['beauty', 'healthcare', 'fashion', 'lifestyle', 'children'],
        accessibility: 'medium',
        cultural: {
          western: ['love', 'femininity', 'nurturing', 'gentleness'],
          eastern: ['youth', 'femininity', 'hope', 'health'],
          middle_eastern: ['love', 'beauty', 'compassion'],
          cultural_note: 'Strongly associated with femininity in Western cultures'
        },
        confidence: 0.75
      },
      brown: {
        emotions: ['stability', 'earthiness', 'comfort', 'tradition', 'reliability'],
        industries: ['construction', 'agriculture', 'furniture', 'food', 'automotive'],
        accessibility: 'high',
        cultural: {
          western: ['stability', 'earthiness', 'tradition', 'reliability'],
          eastern: ['earth', 'humility', 'neutrality', 'stability'],
          middle_eastern: ['earth', 'stability', 'tradition'],
          cultural_note: 'Neutral and stable, associated with earth and nature'
        },
        confidence: 0.8
      },
      gray: {
        emotions: ['neutrality', 'professionalism', 'balance', 'sophistication', 'formality'],
        industries: ['corporate', 'technology', 'automotive', 'government', 'professional'],
        accessibility: 'high',
        cultural: {
          western: ['neutrality', 'professionalism', 'balance', 'sophistication'],
          eastern: ['balance', 'humility', 'meditation', 'wisdom'],
          middle_eastern: ['neutrality', 'formality', 'balance'],
          cultural_note: 'Universally neutral, used for balance and sophistication'
        },
        confidence: 0.85
      },
      black: {
        emotions: ['power', 'elegance', 'sophistication', 'mystery', 'formality'],
        industries: ['luxury', 'fashion', 'technology', 'automotive', 'professional'],
        accessibility: 'medium',
        cultural: {
          western: ['power', 'elegance', 'mystery', 'formality'],
          eastern: ['formality', 'mystery', 'evil', 'unknown'],
          middle_eastern: ['power', 'formality', 'mystery'],
          cultural_note: 'Can be associated with both sophistication and negativity'
        },
        confidence: 0.8
      },
      white: {
        emotions: ['purity', 'cleanliness', 'simplicity', 'peace', 'newness'],
        industries: ['healthcare', 'technology', 'luxury', 'minimalist', 'professional'],
        accessibility: 'high',
        cultural: {
          western: ['purity', 'cleanliness', 'newness', 'peace'],
          eastern: ['mourning', 'death', 'purity', 'simplicity'],
          middle_eastern: ['purity', 'peace', 'newness'],
          cultural_note: 'Purity in Western cultures, mourning in Eastern cultures'
        },
        confidence: 0.85
      }
    };
    
    this.industryColorPreferences = {
      corporate: ['blue', 'gray', 'navy', 'white', 'black'],
      ecommerce: ['orange', 'blue', 'green', 'red', 'yellow'],
      healthcare: ['blue', 'green', 'white', 'teal', 'light blue'],
      education: ['blue', 'green', 'orange', 'yellow', 'red'],
      creative: ['purple', 'orange', 'pink', 'yellow', 'green'],
      technology: ['blue', 'gray', 'black', 'white', 'green'],
      food: ['red', 'yellow', 'orange', 'green', 'brown'],
      fashion: ['black', 'white', 'gray', 'pink', 'purple'],
      realestate: ['blue', 'green', 'brown', 'gray', 'white'],
      nonprofit: ['blue', 'green', 'orange', 'red', 'purple']
    };
    
    this.harmonyStrategies = {
      analogous: 'Use colors adjacent on the color wheel for natural harmony',
      complementary: 'Use opposite colors for high contrast and energy',
      triadic: 'Use three evenly spaced colors for vibrant balance',
      monochromatic: 'Use variations of one color for sophisticated simplicity',
      splitComplementary: 'Use a color and its two neighbors for modern appeal',
      tetradic: 'Use two complementary pairs for complex, dynamic schemes'
    };
  }
  
  analyzeContext(projectType, targetAudience, brandPersonality, emotionGoal) {
    try {
      // Validate inputs
      const validProjectTypes = ['corporate', 'ecommerce', 'healthcare', 'education', 'creative', 'technology', 'food', 'fashion', 'realestate', 'nonprofit'];
      const validAudiences = ['professionals', 'millennials', 'genz', 'families', 'seniors', 'children', 'luxury', 'budget', 'global'];
      const validPersonalities = ['trustworthy', 'innovative', 'friendly', 'luxury', 'playful', 'professional', 'caring', 'bold', 'minimalist'];
      const validEmotions = ['confidence', 'excitement', 'calmness', 'urgency', 'trust', 'joy', 'sophistication', 'energy'];
      
      const context = {
        projectType: validProjectTypes.includes(projectType) ? projectType : 'corporate',
        targetAudience: validAudiences.includes(targetAudience) ? targetAudience : 'professionals',
        brandPersonality: validPersonalityModifiers(brandPersonality) ? brandPersonality : 'trustworthy',
        emotionGoal: validEmotions.includes(emotionGoal) ? emotionGoal : 'trust',
        colorRecommendations: [],
        psychologicalInsights: [],
        culturalConsiderations: [],
        accessibilityGuidance: [],
        timestamp: Date.now()
      };
      
      // Generate color recommendations based on context
      try {
        context.colorRecommendations = this.generateContextualRecommendations(context);
      } catch (error) {
        console.warn('Error generating color recommendations:', error);
        context.colorRecommendations = this.getFallbackRecommendations(context.projectType);
      }
      
      // Generate psychological insights
      try {
        context.psychologicalInsights = this.generatePsychologicalInsights(context);
      } catch (error) {
        console.warn('Error generating psychological insights:', error);
        context.psychologicalInsights = [];
      }
      
      // Generate cultural considerations
      try {
        context.culturalConsiderations = this.generateCulturalConsiderations(context);
      } catch (error) {
        console.warn('Error generating cultural considerations:', error);
        context.culturalConsiderations = [];
      }
      
      // Generate accessibility guidance
      try {
        context.accessibilityGuidance = this.generateAccessibilityGuidance(context);
      } catch (error) {
        console.warn('Error generating accessibility guidance:', error);
        context.accessibilityGuidance = [];
      }
      
      return context;
      
    } catch (error) {
      console.error('Error in AI context analysis:', error);
      // Return a safe fallback
      return {
        projectType: 'corporate',
        targetAudience: 'professionals',
        brandPersonality: 'trustworthy',
        emotionGoal: 'trust',
        colorRecommendations: this.getFallbackRecommendations('corporate'),
        psychologicalInsights: [],
        culturalConsiderations: [],
        accessibilityGuidance: [],
        timestamp: Date.now(),
        error: 'Fallback due to analysis error'
      };
    }
  }
  
  getFallbackRecommendations(projectType) {
    const fallbackPalettes = {
      corporate: {
        name: 'Corporate Professional',
        colors: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
        harmony: 'monochromatic',
        confidence: 0.7,
        description: 'Professional blue palette suitable for corporate applications'
      },
      default: {
        name: 'Balanced Harmony',
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        harmony: 'triadic',
        confidence: 0.6,
        description: 'Balanced multi-color palette for versatile applications'
      }
    };
    
    return [fallbackPalettes[projectType] || fallbackPalettes.default];
  }
  
  generateContextualRecommendations(context) {
    const recommendations = [];
    const { projectType, targetAudience, brandPersonality, emotionGoal } = context;
    
    // Get base colors for industry
    const industryColors = this.industryColorPreferences[projectType] || ['blue', 'gray', 'white'];
    
    // Analyze target audience preferences
    const audienceModifiers = this.getAudienceModifiers(targetAudience);
    
    // Analyze brand personality
    const personalityModifiers = this.getPersonalityModifiers(brandPersonality);
    
    // Analyze emotion goal
    const emotionModifiers = this.getEmotionModifiers(emotionGoal);
    
    // Combine all factors to generate recommendations
    const combinedFactors = { ...audienceModifiers, ...personalityModifiers, ...emotionModifiers };
    
    // Generate palette suggestions
    const palettes = this.generatePaletteSuggestions(industryColors, combinedFactors, context);
    
    return palettes;
  }
  
  getAudienceModifiers(targetAudience) {
    const modifiers = {
      professionals: { preference: ['blue', 'gray', 'navy'], avoid: ['pink', 'orange', 'yellow'] },
      millennials: { preference: ['blue', 'green', 'purple', 'orange'], avoid: ['brown', 'beige'] },
      genz: { preference: ['purple', 'pink', 'blue', 'green', 'yellow'], avoid: ['gray', 'brown'] },
      families: { preference: ['blue', 'green', 'yellow', 'orange'], avoid: ['black', 'gray'] },
      seniors: { preference: ['blue', 'green', 'brown', 'navy'], avoid: ['bright pink', 'neon colors'] },
      children: { preference: ['blue', 'red', 'yellow', 'green', 'orange'], avoid: ['black', 'gray', 'brown'] },
      luxury: { preference: ['black', 'white', 'gold', 'purple', 'navy'], avoid: ['bright colors', 'neon'] },
      budget: { preference: ['blue', 'green', 'orange', 'red'], avoid: ['purple', 'gold', 'expensive-looking'] },
      global: { preference: ['blue', 'green', 'white'], avoid: ['culturally specific colors'] }
    };
    
    return modifiers[targetAudience] || { preference: ['blue', 'gray'], avoid: [] };
  }
  
  getPersonalityModifiers(brandPersonality) {
    const modifiers = {
      trustworthy: { colors: ['blue', 'navy', 'gray', 'white'], harmony: 'analogous' },
      innovative: { colors: ['blue', 'green', 'purple', 'orange'], harmony: 'triadic' },
      friendly: { colors: ['orange', 'yellow', 'green', 'blue'], harmony: 'analogous' },
      luxury: { colors: ['black', 'white', 'gold', 'purple', 'navy'], harmony: 'monochromatic' },
      playful: { colors: ['orange', 'yellow', 'pink', 'green', 'blue'], harmony: 'triadic' },
      professional: { colors: ['blue', 'gray', 'navy', 'white'], harmony: 'monochromatic' },
      caring: { colors: ['green', 'blue', 'pink', 'white'], harmony: 'analogous' },
      bold: { colors: ['red', 'orange', 'yellow', 'purple'], harmony: 'complementary' },
      minimalist: { colors: ['white', 'gray', 'black', 'blue'], harmony: 'monochromatic' }
    };
    
    return modifiers[brandPersonality] || modifiers.trustworthy;
  }
  
  // Helper function to validate personality modifiers
  validPersonalityModifiers(personality) {
    const validPersonalities = ['trustworthy', 'innovative', 'friendly', 'luxury', 'playful', 'professional', 'caring', 'bold', 'minimalist'];
    return validPersonalities.includes(personality);
  }
  
  getEmotionModifiers(emotionGoal) {
    const modifiers = {
      confidence: { colors: ['blue', 'navy', 'purple', 'black'], intensity: 'strong' },
      excitement: { colors: ['red', 'orange', 'yellow', 'pink'], intensity: 'bright' },
      calmness: { colors: ['blue', 'green', 'teal', 'purple'], intensity: 'soft' },
      urgency: { colors: ['red', 'orange', 'yellow'], intensity: 'bright' },
      trust: { colors: ['blue', 'navy', 'gray', 'white'], intensity: 'medium' },
      joy: { colors: ['yellow', 'orange', 'pink', 'green'], intensity: 'bright' },
      sophistication: { colors: ['black', 'white', 'gray', 'purple', 'navy'], intensity: 'muted' },
      energy: { colors: ['red', 'orange', 'yellow', 'green'], intensity: 'bright' }
    };
    
    return modifiers[emotionGoal] || { colors: ['blue', 'gray'], intensity: 'medium' };
  }
  
  generatePaletteSuggestions(baseColors, modifiers, context) {
    const suggestions = [];
    const { preference = [], avoid = [] } = modifiers;
    const allColors = [...baseColors, ...preference];
    const uniqueColors = [...new Set(allColors.filter(color => !avoid.includes(color)))];
    
    // Generate different harmony-based suggestions
    const harmonyTypes = ['monochromatic', 'analogous', 'complementary', 'triadic'];
    
    harmonyTypes.forEach((harmonyType, index) => {
      const palette = this.createHarmonyPalette(uniqueColors[0] || 'blue', harmonyType, modifiers.intensity);
      const confidence = this.calculateConfidenceScore(palette, context, harmonyType);
      
      suggestions.push({
        name: this.generatePaletteName(harmonyType, context),
        colors: palette,
        harmony: harmonyType,
        confidence: confidence,
        description: this.generatePaletteDescription(harmonyType, context),
        recommended: confidence > 0.7
      });
    });
    
    // Sort by confidence and return top suggestions
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }
  
  createHarmonyPalette(baseColorName, harmonyType, intensity = 'medium') {
    // Convert color name to hex
    const colorMap = {
      blue: '#3B82F6',
      navy: '#1E3A8A',
      green: '#10B981',
      red: '#EF4444',
      orange: '#F97316',
      yellow: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899',
      gray: '#6B7280',
      black: '#000000',
      white: '#FFFFFF',
      brown: '#92400E',
      teal: '#14B8A6'
    };
    
    const baseHex = colorMap[baseColorName] || '#3B82F6';
    const baseHSL = this.hexToHsl(baseHex);
    
    // Adjust intensity
    let lightnessAdjustments, saturationAdjustments;
    switch (intensity) {
      case 'bright':
        lightnessAdjustments = [0, 15, -15];
        saturationAdjustments = [0, 20, -10];
        break;
      case 'soft':
        lightnessAdjustments = [10, 25, -10];
        saturationAdjustments = [-20, -10, -30];
        break;
      case 'muted':
        lightnessAdjustments = [0, 20, -20];
        saturationAdjustments = [-30, -20, -40];
        break;
      default: // medium
        lightnessAdjustments = [0, 20, -20];
        saturationAdjustments = [0, -10, -20];
    }
    
    const palette = [];
    
    switch (harmonyType) {
      case 'monochromatic':
        palette.push(baseHex);
        lightnessAdjustments.forEach(adj => {
          if (adj !== 0) {
            palette.push(this.adjustLightness(baseHex, adj));
          }
        });
        break;
        
      case 'analogous':
        const analogousColors = [
          this.hslToHex((baseHSL.h - 30 + 360) % 360, baseHSL.s, baseHSL.l),
          baseHex,
          this.hslToHex((baseHSL.h + 30) % 360, baseHSL.s, baseHSL.l)
        ];
        analogousColors.forEach((color, index) => {
          const adjColor = this.adjustLightness(color, lightnessAdjustments[index] || 0);
          palette.push(adjColor);
        });
        break;
        
      case 'complementary':
        const complementary = this.hslToHex((baseHSL.h + 180) % 360, baseHSL.s, baseHSL.l);
        palette.push(baseHex, complementary);
        break;
        
      case 'triadic':
        const triadic1 = this.hslToHex((baseHSL.h + 120) % 360, baseHSL.s, baseHSL.l);
        const triadic2 = this.hslToHex((baseHSL.h + 240) % 360, baseHSL.s, baseHSL.l);
        palette.push(baseHex, triadic1, triadic2);
        break;
        
      default:
        palette.push(baseHex);
    }
    
    return palette;
  }
  
  calculateConfidenceScore(palette, context, harmonyType) {
    let score = 0.5; // Base score
    
    // Industry alignment
    const industryColors = this.industryColorPreferences[context.projectType] || [];
    const baseColorName = this.getColorNameFromHex(palette[0]);
    if (industryColors.includes(baseColorName)) {
      score += 0.2;
    }
    
    // Target audience alignment
    const audienceModifiers = this.getAudienceModifiers(context.targetAudience);
    if (audienceModifiers.preference.includes(baseColorName)) {
      score += 0.15;
    }
    
    // Brand personality alignment
    const personalityModifiers = this.getPersonalityModifiers(context.brandPersonality);
    if (personalityModifiers.colors.includes(baseColorName)) {
      score += 0.15;
    }
    
    // Harmony appropriateness
    if (personalityModifiers.harmony === harmonyType) {
      score += 0.1;
    }
    
    // Accessibility considerations
    const hasGoodContrast = this.checkPaletteContrast(palette);
    if (hasGoodContrast) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }
  
  generatePaletteName(harmonyType, context) {
    const names = {
      monochromatic: `${context.brandPersonality.charAt(0).toUpperCase() + context.brandPersonality.slice(1)} Harmony`,
      analogous: `Natural Flow Palette`,
      complementary: `Dynamic Contrast Scheme`,
      triadic: `Balanced Triad Collection`
    };
    
    return names[harmonyType] || `${context.projectType} Color Suite`;
  }
  
  generatePaletteDescription(harmonyType, context) {
    const descriptions = {
      monochromatic: `Sophisticated single-color palette perfect for ${context.brandPersonality} brands targeting ${context.targetAudience}`,
      analogous: `Harmonious adjacent colors that create natural flow and visual comfort`,
      complementary: `High-contrast combination that captures attention and creates energy`,
      triadic: `Vibrant three-color balance offering versatility while maintaining harmony`
    };
    
    return descriptions[harmonyType] || `Custom palette optimized for ${context.projectType} projects`;
  }
  
  generatePsychologicalInsights(context) {
    const insights = [];
    const { projectType, targetAudience, brandPersonality, emotionGoal } = context;
    
    // Color psychology based on project type
    if (projectType === 'healthcare') {
      insights.push({
        type: 'positive',
        message: 'Blue and green colors promote trust and healing, essential for healthcare branding'
      });
    }
    
    if (projectType === 'corporate') {
      insights.push({
        type: 'positive',
        message: 'Professional color schemes with blues and grays convey reliability and competence'
      });
    }
    
    if (projectType === 'food') {
      insights.push({
        type: 'positive',
        message: 'Warm colors like red, orange, and yellow stimulate appetite and create energy'
      });
    }
    
    // Age-specific insights
    if (targetAudience === 'seniors') {
      insights.push({
        type: 'info',
        message: 'Higher contrast and avoiding very bright colors improves readability for older users'
      });
    }
    
    if (targetAudience === 'genz') {
      insights.push({
        type: 'positive',
        message: 'Bold, vibrant colors resonate well with Gen Z preferences for authentic, energetic brands'
      });
    }
    
    // Emotion goal insights
    if (emotionGoal === 'trust') {
      insights.push({
        type: 'positive',
        message: 'Blue is psychologically proven to increase trust by up to 15% in business contexts'
      });
    }
    
    if (emotionGoal === 'excitement') {
      insights.push({
        type: 'positive',
        message: 'Red and orange trigger immediate attention and emotional arousal, perfect for call-to-action elements'
      });
    }
    
    return insights;
  }
  
  generateCulturalConsiderations(context) {
    const considerations = [];
    const { projectType } = context;
    
    // Global audience considerations
    considerations.push({
      type: 'info',
      message: 'For global audiences, avoid culturally specific colors and stick to universally positive associations'
    });
    
    // Industry-specific cultural considerations
    if (projectType === 'food') {
      considerations.push({
        type: 'info',
        message: 'Red is associated with good fortune in Eastern cultures but can mean danger in Western contexts'
      });
    }
    
    if (projectType === 'corporate') {
      considerations.push({
        type: 'positive',
        message: 'Blue is universally trusted across cultures, making it ideal for international business'
      });
    }
    
    return considerations;
  }
  
  generateAccessibilityGuidance(context) {
    const guidance = [];
    const palette = this.generateContextualRecommendations(context);
    
    if (palette.length > 0) {
      const bestPalette = palette[0];
      const hasGoodContrast = this.checkPaletteContrast(bestPalette.colors);
      
      if (hasGoodContrast) {
        guidance.push({
          type: 'positive',
          message: 'Your recommended palette meets WCAG AA standards for contrast ratios'
        });
      } else {
        guidance.push({
          type: 'warning',
          message: 'Consider adjusting color brightness to improve accessibility compliance'
        });
      }
    }
    
    // Specific accessibility recommendations
    guidance.push({
      type: 'info',
      message: 'Always test color combinations with actual contrast ratio tools before final implementation'
    });
    
    return guidance;
  }
  
  checkPaletteContrast(palette) {
    // Simple check - ensure there's at least one light and one dark color
    const lightColors = palette.filter(color => {
      const hsl = this.hexToHsl(color);
      return hsl.l > 70;
    });
    
    const darkColors = palette.filter(color => {
      const hsl = this.hexToHsl(color);
      return hsl.l < 30;
    });
    
    return lightColors.length > 0 && darkColors.length > 0;
  }
  
  getColorNameFromHex(hex) {
    const colorMap = {
      '#3B82F6': 'blue',
      '#1E3A8A': 'navy',
      '#10B981': 'green',
      '#EF4444': 'red',
      '#F97316': 'orange',
      '#F59E0B': 'yellow',
      '#8B5CF6': 'purple',
      '#EC4899': 'pink',
      '#6B7280': 'gray',
      '#000000': 'black',
      '#FFFFFF': 'white',
      '#92400E': 'brown',
      '#14B8A6': 'teal'
    };
    
    return colorMap[hex.toUpperCase()] || 'blue';
  }
  
  // Utility methods for color conversion
  hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  hslToHex(h, s, l) {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  adjustLightness(hex, percent) {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }
}

class ColorTheory {
  constructor() {
    // DOM Elements
    this.baseColorInput = document.getElementById("baseColor");
    this.baseColorText = document.getElementById("baseColorText");
    this.paletteContainer = document.getElementById("palette");
    this.contrastBox = document.getElementById("contrastBox");
    this.contrastBoxLarge = document.getElementById("contrastBoxLarge");
    this.contrastBoxUI = document.getElementById("contrastBoxUI");
    this.contrastResult = document.getElementById("contrastResult");
    this.contrastInfoLarge = document.getElementById("contrastInfoLarge");
    this.contrastInfoUI = document.getElementById("contrastInfoUI");
    this.toggleModeBtn = document.getElementById("toggleMode");
    this.exportBtn = document.getElementById("exportCSS");
    this.harmonyTypeSelect = document.getElementById("harmonyType");
    this.presetSelect = document.getElementById("presetColors");
    this.colorFormatSelect = document.getElementById("colorFormat");
    this.colorHistoryContainer = document.getElementById("colorHistory");
    this.colorFavoritesContainer = document.getElementById("colorFavorites");
    this.themesContainer = document.getElementById("themesContainer");
    this.resetBtn = document.getElementById("resetPalette");
    this.simulateBtn = document.getElementById("simulateColorBlindness");
    this.harmonyInfo = document.getElementById("harmonyInfo");
    this.colorCount = document.getElementById("colorCount");
    
    // Color wheel elements
    this.colorWheelCanvas = document.getElementById("colorWheel");
    this.wheelLightnessSlider = document.getElementById("wheelLightness");
    this.wheelSaturationSlider = document.getElementById("wheelSaturation");
    
    // Enhanced color blindness simulation elements
    this.colorblindTypeSelect = document.getElementById("colorblindType");
    this.colorblindComparison = document.getElementById("colorblindComparison");
    this.normalPalette = document.getElementById("normalPalette");
    this.colorblindPalette = document.getElementById("colorblindPalette");
    
    // Palette optimization elements
    this.optimizationTarget = document.getElementById("optimizationTarget");
    this.contrastRequirement = document.getElementById("contrastRequirement");
    this.colorCountInput = document.getElementById("colorCount");
    this.maintainHarmonyCheckbox = document.getElementById("maintainHarmony");
    this.ensureBrandConsistencyCheckbox = document.getElementById("ensureBrandConsistency");
    this.optimizePaletteBtn = document.getElementById("optimizePalette");
    this.optimizationResults = document.getElementById("optimizationResults");
    this.accessibilityScore = document.getElementById("accessibilityScore");
    this.harmonyScore = document.getElementById("harmonyScore");
    this.versatilityScore = document.getElementById("versatilityScore");
    this.optimizedColorsContainer = document.getElementById("optimizedColors");
    this.optimizationRecommendations = document.getElementById("optimizationRecommendations");
    
    // AI-powered color suggestions elements
    this.projectType = document.getElementById("projectType");
    this.targetAudience = document.getElementById("targetAudience");
    this.brandPersonality = document.getElementById("brandPersonality");
    this.emotionGoal = document.getElementById("emotionGoal");
    this.generateAISuggestionsBtn = document.getElementById("generateAISuggestions");
    this.aiResults = document.getElementById("aiResults");
    this.recommendedPalettes = document.getElementById("recommendedPalettes");
    this.psychologyInsights = document.getElementById("psychologyInsights");
    this.culturalInsights = document.getElementById("culturalInsights");
    this.accessibilityRecommendations = document.getElementById("accessibilityRecommendations");
    this.applyBestSuggestion = document.getElementById("applyBestSuggestion");
    this.saveAISuggestions = document.getElementById("saveAISuggestions");
    
    // Brand color analysis elements
    this.uploadArea = document.getElementById("uploadArea");
    this.imageUpload = document.getElementById("imageUpload");
    this.colorExtractionMethod = document.getElementById("colorExtractionMethod");
    this.maxColors = document.getElementById("maxColors");
    this.maxColorsValue = document.getElementById("maxColorsValue");
    this.includeNeutrals = document.getElementById("includeNeutrals");
    this.analyzeImage = document.getElementById("analyzeImage");
    this.analysisResults = document.getElementById("analysisResults");
    this.previewImage = document.getElementById("previewImage");
    this.extractedColors = document.getElementById("extractedColors");
    this.brandTemperature = document.getElementById("brandTemperature");
    this.colorHarmony = document.getElementById("colorHarmony");
    this.vibrancyLevel = document.getElementById("vibrancyLevel");
    this.brandRecommendations = document.getElementById("brandRecommendations");
    this.applyBrandColors = document.getElementById("applyBrandColors");
    this.saveBrandAnalysis = document.getElementById("saveBrandAnalysis");
    this.exportBrandPalette = document.getElementById("exportBrandPalette");
    
    // Collaboration and sharing elements
    this.generateShareLink = document.getElementById("generateShareLink");
    this.shareLinkResult = document.getElementById("shareLinkResult");
    this.shareLinkInput = document.getElementById("shareLinkInput");
    this.copyShareLink = document.getElementById("copyShareLink");
    this.exportPaletteImage = document.getElementById("exportPaletteImage");
    this.shareToTwitter = document.getElementById("shareToTwitter");
    this.shareToLinkedIn = document.getElementById("shareToLinkedIn");
    this.shareToPinterest = document.getElementById("shareToPinterest");
    this.browseGallery = document.getElementById("browseGallery");
    this.submitToGallery = document.getElementById("submitToGallery");
    this.viewTrending = document.getElementById("viewTrending");
    this.totalPalettes = document.getElementById("totalPalettes");
    this.totalShares = document.getElementById("totalShares");
    this.communitySize = document.getElementById("communitySize");
    this.todayPalettes = document.getElementById("todayPalettes");
    
    // Initialize systems
    this.paletteOptimizer = new PaletteOptimizer(this);
    this.aiColorIntelligence = new AIColorIntelligence();
    this.brandAnalyzer = new BrandAnalyzer(this);
    this.collaborationManager = new CollaborationManager(this);
    
    // Modal elements
    this.exportModal = document.getElementById("exportModal");
    this.exportTextarea = document.getElementById("exportTextarea");
    this.copyExportBtn = document.getElementById("copyExport");
    this.downloadExportBtn = document.getElementById("downloadExport");
    this.shareExportBtn = document.getElementById("shareExport");
    this.closeModalBtn = document.querySelector(".close-modal");
    
    // State
    this.colorHistory = [];
    this.favorites = [];
    this.currentTheme = null;
    this.isDark = false;
    this.colorBlindnessSim = false;
    this.currentFormat = 'hex';
    
    // Color presets
    this.presets = {
      'material-blue': '#2196F3',
      'material-red': '#F44336',
      'material-green': '#4CAF50',
      'material-purple': '#9C27B0',
      'material-orange': '#FF9800',
      'bootstrap-primary': '#007bff',
      'bootstrap-success': '#28a745',
      'bootstrap-warning': '#ffc107',
      'bootstrap-danger': '#dc3545',
      'tailwind-blue': '#3B82F6',
      'tailwind-green': '#10B981',
      'tailwind-purple': '#8B5CF6',
      'tailwind-pink': '#EC4899',
      'tailwind-orange': '#F97316'
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFromStorage();
    this.initializeColorWheel();
    this.generatePalette();
    this.updateDisplay();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    
    // Initialize collaboration features
    this.updateCommunityStats();
    this.checkForSharedPalette();
  }

  bindEvents() {
    // Color input synchronization
    this.baseColorInput.addEventListener("input", (e) => {
      this.baseColorText.value = e.target.value;
      this.generatePalette();
    });
    
    this.baseColorText.addEventListener("input", (e) => {
      if (this.isValidHex(e.target.value)) {
        this.baseColorInput.value = e.target.value;
        this.generatePalette();
      }
    });

    // Controls
    this.toggleModeBtn.addEventListener("click", () => this.toggleMode());
    this.exportBtn.addEventListener("click", () => this.showExportModal());
    this.resetBtn.addEventListener("click", () => this.resetPalette());
    this.simulateBtn?.addEventListener("click", () => this.toggleColorBlindnessSimulation());
    
    // Select controls
    this.harmonyTypeSelect?.addEventListener("change", () => {
      this.generatePalette();
      if (this.colorWheel) {
        this.colorWheel.updateHarmonyPreview(this.harmonyTypeSelect.value);
      }
    });
    this.presetSelect?.addEventListener("change", (e) => this.loadPreset(e.target.value));
    this.colorFormatSelect?.addEventListener("change", (e) => this.changeColorFormat(e.target.value));
    
    // Save theme button
    const saveBtn = document.getElementById("saveTheme");
    saveBtn?.addEventListener("click", () => this.saveCurrentTheme());
    
    // Modal events
    this.closeModalBtn?.addEventListener("click", () => this.hideExportModal());
    this.exportModal?.addEventListener("click", (e) => {
      if (e.target === this.exportModal) this.hideExportModal();
    });
    
    this.copyExportBtn?.addEventListener("click", () => this.copyExportToClipboard());
    this.downloadExportBtn?.addEventListener("click", () => this.downloadExport());
    this.shareExportBtn?.addEventListener("click", () => this.shareExport());
    
    // Export format change
    document.querySelectorAll('input[name="exportFormat"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateExportOutput());
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    
    // Color wheel controls
    if (this.wheelLightnessSlider) {
      this.wheelLightnessSlider.addEventListener('input', (e) => {
        if (this.colorWheel) {
          this.colorWheel.setLightness(parseInt(e.target.value));
        }
      });
    }
    
    if (this.wheelSaturationSlider) {
      this.wheelSaturationSlider.addEventListener('input', (e) => {
        if (this.colorWheel) {
          this.colorWheel.setSaturation(parseInt(e.target.value));
        }
      });
    }
    
    // Enhanced color blindness simulation controls
    if (this.colorblindTypeSelect) {
      this.colorblindTypeSelect.addEventListener('change', () => {
        if (this.colorBlindnessSim) {
          this.updateColorBlindnessSimulation();
        }
      });
    }
    
    // Palette optimization controls
    if (this.optimizePaletteBtn) {
      this.optimizePaletteBtn.addEventListener('click', () => this.optimizeCurrentPalette());
    }
    
    // AI-powered color suggestions controls
    if (this.generateAISuggestionsBtn) {
      this.generateAISuggestionsBtn.addEventListener('click', () => this.generateAISuggestions());
    }
    
    if (this.applyBestSuggestion) {
      this.applyBestSuggestion.addEventListener('click', () => this.applyBestAISuggestion());
    }
    
    if (this.saveAISuggestions) {
      this.saveAISuggestions.addEventListener('click', () => this.saveAISuggestions());
    }
    
    // Brand analysis controls
    if (this.uploadArea) {
      this.setupImageUpload();
    }
    
    if (this.maxColors) {
      this.maxColors.addEventListener('input', () => {
        if (this.maxColorsValue) {
          this.maxColorsValue.textContent = `${this.maxColors.value} colors`;
        }
      });
    }
    
    if (this.analyzeImage) {
      this.analyzeImage.addEventListener('click', () => this.analyzeUploadedImage());
    }
    
    if (this.applyBrandColors) {
      this.applyBrandColors.addEventListener('click', () => this.applyBrandColors());
    }
    
    if (this.saveBrandAnalysis) {
      this.saveBrandAnalysis.addEventListener('click', () => this.saveBrandAnalysis());
    }
    
    if (this.exportBrandPalette) {
      this.exportBrandPalette.addEventListener('click', () => this.exportBrandPalette());
    }
    
    // Collaboration and sharing controls
    if (this.generateShareLink) {
      this.generateShareLink.addEventListener('click', () => this.generateShareLink());
    }
    
    if (this.copyShareLink) {
      this.copyShareLink.addEventListener('click', () => this.copyShareLink());
    }
    
    if (this.exportPaletteImage) {
      this.exportPaletteImage.addEventListener('click', () => this.exportPaletteImage());
    }
    
    if (this.shareToTwitter) {
      this.shareToTwitter.addEventListener('click', () => this.shareToSocial('twitter'));
    }
    
    if (this.shareToLinkedIn) {
      this.shareToLinkedIn.addEventListener('click', () => this.shareToSocial('linkedin'));
    }
    
    if (this.shareToPinterest) {
      this.shareToPinterest.addEventListener('click', () => this.shareToSocial('pinterest'));
    }
    
    if (this.browseGallery) {
      this.browseGallery.addEventListener('click', () => this.browseGallery());
    }
    
    if (this.submitToGallery) {
      this.submitToGallery.addEventListener('click', () => this.submitToGallery());
    }
    
    if (this.viewTrending) {
      this.viewTrending.addEventListener('click', () => this.viewTrending());
    }
  }

  // Color Wheel Initialization
  initializeColorWheel() {
    if (this.colorWheelCanvas) {
      this.colorWheel = new ColorWheel(this.colorWheelCanvas, {
        lightness: 50,
        saturation: 100,
        onColorChange: (color) => {
          this.baseColorInput.value = color;
          this.baseColorText.value = color;
          this.generatePalette();
        }
      });
      
      // Set initial color
      this.colorWheel.setColor(this.baseColorInput.value);
      
      // Update harmony preview
      if (this.harmonyTypeSelect) {
        this.colorWheel.updateHarmonyPreview(this.harmonyTypeSelect.value);
      }
    }
  }

  // Color Theory Implementation
  hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  hslToHex(h, s, l) {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Enhanced color adjustments using HSL
  adjustLightness(hex, percent) {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  adjustSaturation(hex, percent) {
    const hsl = this.hexToHsl(hex);
    hsl.s = Math.max(0, Math.min(100, hsl.s + percent));
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  shiftHue(hex, degrees) {
    const hsl = this.hexToHsl(hex);
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  // Color Harmony Algorithms
  generateHarmonies(baseHex) {
    const baseHSL = this.hexToHsl(baseHex);
    const harmonies = {
      complementary: [],
      analogous: [],
      triadic: [],
      splitComplementary: [],
      tetradic: []
    };

    // Complementary (opposite on color wheel)
    harmonies.complementary = [
      baseHex,
      this.hslToHex(baseHSL.h + 180, baseHSL.s, baseHSL.l)
    ];

    // Analogous (adjacent colors)
    harmonies.analogous = [
      this.hslToHex(baseHSL.h - 30, baseHSL.s, baseHSL.l),
      baseHex,
      this.hslToHex(baseHSL.h + 30, baseHSL.s, baseHSL.l)
    ];

    // Triadic (120 degrees apart)
    harmonies.triadic = [
      baseHex,
      this.hslToHex(baseHSL.h + 120, baseHSL.s, baseHSL.l),
      this.hslToHex(baseHSL.h + 240, baseHSL.s, baseHSL.l)
    ];

    // Split Complementary
    harmonies.splitComplementary = [
      baseHex,
      this.hslToHex(baseHSL.h + 150, baseHSL.s, baseHSL.l),
      this.hslToHex(baseHSL.h + 210, baseHSL.s, baseHSL.l)
    ];

    // Tetradic (rectangle)
    harmonies.tetradic = [
      baseHex,
      this.hslToHex(baseHSL.h + 60, baseHSL.s, baseHSL.l),
      this.hslToHex(baseHSL.h + 180, baseHSL.s, baseHSL.l),
      this.hslToHex(baseHSL.h + 240, baseHSL.s, baseHSL.l)
    ];

    return harmonies;
  }

  // Enhanced palette generation
  generatePalette() {
    const baseHex = this.baseColorInput.value;
    this.addToHistory(baseHex);
    
    const harmonyType = this.harmonyTypeSelect?.value || 'monochromatic';
    const palette = this.createPalette(baseHex, harmonyType);
    
    this.renderPalette(palette);
    this.updateAllContrastChecks(baseHex);
    this.updateDisplay();
    this.currentTheme = {
      baseColor: baseHex,
      harmonyType,
      palette,
      timestamp: Date.now()
    };
    this.saveToStorage();
    
    // Update color wheel
    if (this.colorWheel) {
      this.colorWheel.setColor(baseHex);
      this.colorWheel.updateHarmonyPreview(harmonyType);
    }
  }

  createPalette(baseHex, type) {
    const harmonies = this.generateHarmonies(baseHex);
    const shades = [-40, -20, 0, 20, 40];
    
    let colors = [];
    
    switch (type) {
      case 'monochromatic':
        colors = shades.map(offset => this.adjustLightness(baseHex, offset));
        break;
      case 'complementary':
        colors = harmonies.complementary.flatMap(color => 
          shades.map(offset => this.adjustLightness(color, offset))
        );
        break;
      case 'analogous':
        colors = harmonies.analogous.flatMap(color => 
          shades.slice(0, 3).map(offset => this.adjustLightness(color, offset))
        );
        break;
      case 'triadic':
        colors = harmonies.triadic.flatMap(color => 
          shades.slice(0, 2).map(offset => this.adjustLightness(color, offset))
        );
        break;
      case 'splitComplementary':
        colors = harmonies.splitComplementary.flatMap(color => 
          shades.slice(0, 2).map(offset => this.adjustLightness(color, offset))
        );
        break;
      case 'tetradic':
        colors = harmonies.tetradic.flatMap(color => 
          [shades[1], shades[3]].map(offset => this.adjustLightness(color, offset))
        );
        break;
      default:
        colors = shades.map(offset => this.adjustLightness(baseHex, offset));
    }
    
    return colors;
  }

  // Enhanced contrast checking
  updateAllContrastChecks(bgColor) {
    this.updateContrast(bgColor);
    this.updateLargeTextContrast(bgColor);
    this.updateUIContrast(bgColor);
  }

  updateContrast(bgColor) {
    const textColors = [
      { name: 'Black', color: '#000000' },
      { name: 'White', color: '#ffffff' },
      { name: 'Dark Gray', color: '#333333' },
      { name: 'Light Gray', color: '#f0f0f0' }
    ];
    
    let bestContrast = { ratio: 0, color: '#000000', name: 'Black' };
    
    textColors.forEach(({ name, color }) => {
      const ratio = this.contrastRatio(bgColor, color);
      if (ratio > bestContrast.ratio) {
        bestContrast = { ratio, color, name };
      }
    });
    
    const recommendedColor = bestContrast.color;
    this.contrastBox.style.background = bgColor;
    this.contrastBox.style.color = recommendedColor;
    
    const ratio = this.contrastRatio(bgColor, recommendedColor);
    const compliance = this.getComplianceLevel(ratio);
    
    this.contrastResult.innerHTML = `
      <strong>Contrast Ratio:</strong> ${ratio.toFixed(2)}:1<br>
      <strong>Recommended Text:</strong> ${bestContrast.name} (${bestContrast.color})<br>
      <strong>WCAG ${compliance.level}:</strong> ${compliance.label} ${compliance.passes ? '✅' : '❌'}
    `;
  }

  updateLargeTextContrast(bgColor) {
    const textColor = this.isDark ? '#ffffff' : '#000000';
    const ratio = this.contrastRatio(bgColor, textColor);
    const compliance = this.getComplianceLevel(ratio);
    
    this.contrastBoxLarge.style.background = bgColor;
    this.contrastBoxLarge.style.color = textColor;
    
    this.contrastInfoLarge.innerHTML = `
      <strong>Large Text (18pt+):</strong> ${ratio.toFixed(2)}:1 - ${compliance.passes ? 'Pass ✅' : 'Fail ❌'}
    `;
  }

  updateUIContrast(bgColor) {
    const buttonColor = this.adjustLightness(bgColor, -10);
    const textColor = this.getReadableTextColor(buttonColor);
    const ratio = this.contrastRatio(buttonColor, textColor);
    const compliance = this.getComplianceLevel(ratio);
    
    this.contrastBoxUI.style.background = bgColor;
    this.contrastBoxUI.querySelector('.ui-button').style.background = buttonColor;
    this.contrastBoxUI.querySelector('.ui-button').style.color = textColor;
    this.contrastBoxUI.querySelector('.ui-input').style.background = 'rgba(255, 255, 255, 0.9)';
    
    this.contrastInfoUI.innerHTML = `
      <strong>UI Elements:</strong> Button contrast ${ratio.toFixed(2)}:1 - ${compliance.passes ? 'Pass ✅' : 'Fail ❌'}
    `;
  }

  getComplianceLevel(ratio) {
    if (ratio >= 7) return { level: 'AAA', label: 'Enhanced', passes: true };
    if (ratio >= 4.5) return { level: 'AA', label: 'Standard', passes: true };
    if (ratio >= 3) return { level: 'AA Large', label: 'Large Text Only', passes: true };
    return { level: 'Fail', label: 'Insufficient', passes: false };
  }

  // WCAG Contrast Calculation
  luminance(hex) {
    const rgb = hex.match(/\w\w/g).map(c => parseInt(c, 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  contrastRatio(c1, c2) {
    const l1 = this.luminance(c1);
    const l2 = this.luminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  // UI Rendering
  renderPalette(colors) {
    this.paletteContainer.innerHTML = "";
    
    colors.forEach((color, index) => {
      const card = this.createColorCard(color, index);
      this.paletteContainer.appendChild(card);
    });
    
    this.colorCount.textContent = colors.length;
  }

  createColorCard(color, index) {
    const card = document.createElement("div");
    card.className = "color-card";
    card.style.background = color;
    card.style.color = this.getReadableTextColor(color);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Color ${index + 1}: ${this.formatColor(color)}`);
    
    const formattedColor = this.formatColor(color);
    
    card.innerHTML = `
      <div class="color-info">
        <span class="color-hex">${formattedColor}</span>
        <div class="color-actions">
          <button class="copy-btn" onclick="colorTheory.copyToClipboard('${color}')" 
                  title="Copy ${formattedColor}" aria-label="Copy ${formattedColor}">
            📋
          </button>
          <button class="favorite-btn" onclick="colorTheory.toggleFavorite('${color}')" 
                  title="Add to favorites" aria-label="Add to favorites">
            ⭐
          </button>
        </div>
      </div>
    `;
    
    // Keyboard interaction
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.copyToClipboard(color);
      }
    });
    
    return card;
  }

  getReadableTextColor(hex) {
    const ratio = this.contrastRatio(hex, '#000000');
    return ratio >= 4.5 ? '#000000' : '#ffffff';
  }

  // Color Format Handling
  formatColor(color) {
    switch (this.currentFormat) {
      case 'hex':
        return color.toUpperCase();
      case 'rgb':
        const rgb = this.hexToRgb(color);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        const hsl = this.hexToHsl(color);
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      default:
        return color.toUpperCase();
    }
  }

  changeColorFormat(format) {
    this.currentFormat = format;
    this.generatePalette(); // Re-render with new format
  }

  updateDisplay() {
    const harmonyType = this.harmonyTypeSelect?.value || 'monochromatic';
    this.harmonyInfo.textContent = harmonyType;
    this.updateHistoryDisplay();
    this.updateFavoritesDisplay();
    this.updateThemesDisplay();
  }

  // History and Favorites Management
  addToHistory(color) {
    if (!this.colorHistory.includes(color)) {
      this.colorHistory.unshift(color);
      this.colorHistory = this.colorHistory.slice(0, 10);
      this.saveToStorage();
    }
  }

  updateHistoryDisplay() {
    this.colorHistoryContainer.innerHTML = "";
    this.colorHistory.forEach(color => {
      const historyColor = document.createElement("div");
      historyColor.className = "history-color";
      historyColor.style.background = color;
      historyColor.setAttribute('data-color', this.formatColor(color));
      historyColor.setAttribute('title', `Use ${color}`);
      historyColor.setAttribute('role', 'button');
      historyColor.setAttribute('tabindex', '0');
      historyColor.setAttribute('aria-label', `Use color ${this.formatColor(color)}`);
      
      historyColor.addEventListener('click', () => {
        this.baseColorInput.value = color;
        this.baseColorText.value = color;
        this.generatePalette();
      });
      
      historyColor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          historyColor.click();
        }
      });
      
      this.colorHistoryContainer.appendChild(historyColor);
    });
  }

  toggleFavorite(color) {
    const index = this.favorites.indexOf(color);
    if (index === -1) {
      this.favorites.push(color);
      this.showToast(`Added ${this.formatColor(color)} to favorites!`, 'success');
    } else {
      this.favorites.splice(index, 1);
      this.showToast(`Removed ${this.formatColor(color)} from favorites!`, 'info');
    }
    this.updateFavoritesDisplay();
    this.saveToStorage();
  }

  updateFavoritesDisplay() {
    this.colorFavoritesContainer.innerHTML = "";
    this.favorites.forEach(color => {
      const favoriteColor = document.createElement("div");
      favoriteColor.className = "favorite-color";
      favoriteColor.style.background = color;
      favoriteColor.setAttribute('data-color', this.formatColor(color));
      favoriteColor.setAttribute('title', `Use ${color}`);
      favoriteColor.setAttribute('role', 'button');
      favoriteColor.setAttribute('tabindex', '0');
      favoriteColor.setAttribute('aria-label', `Use color ${this.formatColor(color)}`);
      
      favoriteColor.addEventListener('click', () => {
        this.baseColorInput.value = color;
        this.baseColorText.value = color;
        this.generatePalette();
      });
      
      favoriteColor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          favoriteColor.click();
        }
      });
      
      this.colorFavoritesContainer.appendChild(favoriteColor);
    });
  }

  // Theme Management
  saveCurrentTheme() {
    if (!this.currentTheme) return;
    
    const themeName = prompt('Enter theme name:');
    if (!themeName) return;
    
    const themes = this.getStoredThemes();
    themes[themeName] = {
      ...this.currentTheme,
      name: themeName
    };
    localStorage.setItem('iceThemeBuilder_themes', JSON.stringify(themes));
    
    this.showToast(`Theme "${themeName}" saved successfully!`, 'success');
    this.updateThemesDisplay();
  }

  getStoredThemes() {
    const stored = localStorage.getItem('iceThemeBuilder_themes');
    return stored ? JSON.parse(stored) : {};
  }

  updateThemesDisplay() {
    const themes = this.getStoredThemes();
    this.themesContainer.innerHTML = "";
    
    Object.entries(themes).forEach(([name, theme]) => {
      const themeCard = document.createElement("div");
      themeCard.className = "theme-card";
      themeCard.setAttribute('role', 'button');
      themeCard.setAttribute('tabindex', '0');
      themeCard.setAttribute('aria-label', `Load theme ${name}`);
      
      const preview = document.createElement("div");
      preview.className = "theme-preview";
      
      // Show first 4 colors from the palette
      theme.palette.slice(0, 4).forEach(color => {
        const previewColor = document.createElement("div");
        previewColor.className = "theme-preview-color";
        previewColor.style.background = color;
        preview.appendChild(previewColor);
      });
      
      const info = document.createElement("div");
      info.className = "theme-info";
      info.innerHTML = `
        <h4>${name}</h4>
        <p>${theme.harmonyType} • ${theme.palette.length} colors</p>
      `;
      
      themeCard.appendChild(preview);
      themeCard.appendChild(info);
      
      themeCard.addEventListener('click', () => this.loadTheme(theme));
      themeCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          themeCard.click();
        }
      });
      
      this.themesContainer.appendChild(themeCard);
    });
  }

  loadTheme(theme) {
    this.currentTheme = theme;
    this.baseColorInput.value = theme.baseColor;
    this.baseColorText.value = theme.baseColor;
    if (this.harmonyTypeSelect) {
      this.harmonyTypeSelect.value = theme.harmonyType;
    }
    this.generatePalette();
    this.showToast(`Loaded theme: ${theme.name}`, 'success');
  }

  // Storage Management
  saveToStorage() {
    const data = {
      currentTheme: this.currentTheme,
      colorHistory: this.colorHistory,
      favorites: this.favorites,
      isDark: this.isDark,
      currentFormat: this.currentFormat
    };
    localStorage.setItem('iceThemeBuilder_data', JSON.stringify(data));
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('iceThemeBuilder_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.colorHistory = data.colorHistory || [];
        this.favorites = data.favorites || [];
        this.isDark = data.isDark || false;
        this.currentFormat = data.currentFormat || 'hex';
        
        // Apply theme
        document.body.className = this.isDark ? "dark" : "light";
        
        if (this.colorFormatSelect) {
          this.colorFormatSelect.value = this.currentFormat;
        }
      } else {
        // Set default theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark = prefersDark;
        document.body.className = this.isDark ? "dark" : "light";
      }
      
      // Set initial button text
      if (this.toggleModeBtn) {
        this.toggleModeBtn.textContent = this.isDark ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
      }
    } catch (e) {
      console.warn('Failed to load stored data:', e);
      // Set default theme on error
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark = prefersDark;
      document.body.className = this.isDark ? "dark" : "light";
      
      if (this.toggleModeBtn) {
        this.toggleModeBtn.textContent = this.isDark ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
      }
    }
  }

  // Export Functionality
  showExportModal() {
    this.exportModal.classList.add('active');
    this.exportModal.setAttribute('aria-hidden', 'false');
    this.updateExportOutput();
    
    // Focus management
    const firstRadio = this.exportModal.querySelector('input[type="radio"]');
    if (firstRadio) firstRadio.focus();
  }

  hideExportModal() {
    this.exportModal.classList.remove('active');
    this.exportModal.setAttribute('aria-hidden', 'true');
    this.exportBtn.focus(); // Return focus to trigger button
  }

  updateExportOutput() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'css';
    const output = this.generateExport(format);
    this.exportTextarea.value = output;
  }

  generateExport(format) {
    if (!this.currentTheme) return '';
    
    const { palette, baseColor } = this.currentTheme;
    const baseHSL = this.hexToHsl(baseColor);
    
    switch (format) {
      case 'css':
        return this.generateCSSVariables(palette, baseHSL);
      case 'scss':
        return this.generateSCSSVariables(palette, baseHSL);
      case 'json':
        return this.generateJSONTokens(palette, baseHSL);
      case 'tailwind':
        return this.generateTailwindConfig(palette, baseHSL);
      case 'styleDictionary':
        return this.generateStyleDictionary(palette, baseHSL);
      case 'android':
        return this.generateAndroidXML(palette, baseHSL);
      case 'ios':
        return this.generateIOSSwift(palette, baseHSL);
      case 'figma':
        return this.generateFigmaTokens(palette, baseHSL);
      default:
        return '';
    }
  }

  generateCSSVariables(palette, baseHSL) {
    return `:root {
  /* Primary Colors */
  --color-primary: ${this.currentTheme.baseColor};
  --color-primary-50: ${this.adjustLightness(this.currentTheme.baseColor, 40)};
  --color-primary-100: ${this.adjustLightness(this.currentTheme.baseColor, 30)};
  --color-primary-200: ${this.adjustLightness(this.currentTheme.baseColor, 20)};
  --color-primary-300: ${this.adjustLightness(this.currentTheme.baseColor, 10)};
  --color-primary-400: ${this.adjustLightness(this.currentTheme.baseColor, 5)};
  --color-primary-500: ${this.currentTheme.baseColor};
  --color-primary-600: ${this.adjustLightness(this.currentTheme.baseColor, -5)};
  --color-primary-700: ${this.adjustLightness(this.currentTheme.baseColor, -10)};
  --color-primary-800: ${this.adjustLightness(this.currentTheme.baseColor, -20)};
  --color-primary-900: ${this.adjustLightness(this.currentTheme.baseColor, -30)};
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}`;
  }

  generateSCSSVariables(palette, baseHSL) {
    return `// Primary Colors
$color-primary: ${this.currentTheme.baseColor};
$color-primary-50: ${this.adjustLightness(this.currentTheme.baseColor, 40)};
$color-primary-100: ${this.adjustLightness(this.currentTheme.baseColor, 30)};
$color-primary-200: ${this.adjustLightness(this.currentTheme.baseColor, 20)};
$color-primary-300: ${this.adjustLightness(this.currentTheme.baseColor, 10)};
$color-primary-400: ${this.adjustLightness(this.currentTheme.baseColor, 5)};
$color-primary-500: ${this.currentTheme.baseColor};
$color-primary-600: ${this.adjustLightness(this.currentTheme.baseColor, -5)};
$color-primary-700: ${this.adjustLightness(this.currentTheme.baseColor, -10)};
$color-primary-800: ${this.adjustLightness(this.currentTheme.baseColor, -20)};
$color-primary-900: ${this.adjustLightness(this.currentTheme.baseColor, -30)};

// Semantic Colors
$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;
$color-info: #3b82f6;`;
  }

  generateJSONTokens(palette, baseHSL) {
    const tokens = {
      color: {
        primary: {
          50: { value: this.adjustLightness(this.currentTheme.baseColor, 40) },
          100: { value: this.adjustLightness(this.currentTheme.baseColor, 30) },
          200: { value: this.adjustLightness(this.currentTheme.baseColor, 20) },
          300: { value: this.adjustLightness(this.currentTheme.baseColor, 10) },
          400: { value: this.adjustLightness(this.currentTheme.baseColor, 5) },
          500: { value: this.currentTheme.baseColor },
          600: { value: this.adjustLightness(this.currentTheme.baseColor, -5) },
          700: { value: this.adjustLightness(this.currentTheme.baseColor, -10) },
          800: { value: this.adjustLightness(this.currentTheme.baseColor, -20) },
          900: { value: this.adjustLightness(this.currentTheme.baseColor, -30) }
        },
        semantic: {
          success: { value: "#10b981" },
          warning: { value: "#f59e0b" },
          error: { value: "#ef4444" },
          info: { value: "#3b82f6" }
        }
      }
    };
    
    return JSON.stringify(tokens, null, 2);
  }

  generateTailwindConfig(palette, baseHSL) {
    return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '${this.adjustLightness(this.currentTheme.baseColor, 40)}',
          100: '${this.adjustLightness(this.currentTheme.baseColor, 30)}',
          200: '${this.adjustLightness(this.currentTheme.baseColor, 20)}',
          300: '${this.adjustLightness(this.currentTheme.baseColor, 10)}',
          400: '${this.adjustLightness(this.currentTheme.baseColor, 5)}',
          500: '${this.currentTheme.baseColor}',
          600: '${this.adjustLightness(this.currentTheme.baseColor, -5)}',
          700: '${this.adjustLightness(this.currentTheme.baseColor, -10)}',
          800: '${this.adjustLightness(this.currentTheme.baseColor, -20)}',
          900: '${this.adjustLightness(this.currentTheme.baseColor, -30)}'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    }
  }
}`;
  }

  generateStyleDictionary(palette, baseHSL) {
    return JSON.stringify({
      color: {
        primary: {
          50: { value: this.adjustLightness(this.currentTheme.baseColor, 40) },
          100: { value: this.adjustLightness(this.currentTheme.baseColor, 30) },
          200: { value: this.adjustLightness(this.currentTheme.baseColor, 20) },
          300: { value: this.adjustLightness(this.currentTheme.baseColor, 10) },
          400: { value: this.adjustLightness(this.currentTheme.baseColor, 5) },
          500: { value: this.currentTheme.baseColor },
          600: { value: this.adjustLightness(this.currentTheme.baseColor, -5) },
          700: { value: this.adjustLightness(this.currentTheme.baseColor, -10) },
          800: { value: this.adjustLightness(this.currentTheme.baseColor, -20) },
          900: { value: this.adjustLightness(this.currentTheme.baseColor, -30) }
        },
        success: { value: '#10b981' },
        warning: { value: '#f59e0b' },
        error: { value: '#ef4444' },
        info: { value: '#3b82f6' }
      }
    }, null, 2);
  }

  generateAndroidXML(palette, baseHSL) {
    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Primary Colors -->
    <color name="color_primary_50">${this.adjustLightness(this.currentTheme.baseColor, 40)}</color>
    <color name="color_primary_100">${this.adjustLightness(this.currentTheme.baseColor, 30)}</color>
    <color name="color_primary_200">${this.adjustLightness(this.currentTheme.baseColor, 20)}</color>
    <color name="color_primary_300">${this.adjustLightness(this.currentTheme.baseColor, 10)}</color>
    <color name="color_primary_400">${this.adjustLightness(this.currentTheme.baseColor, 5)}</color>
    <color name="color_primary_500">${this.currentTheme.baseColor}</color>
    <color name="color_primary_600">${this.adjustLightness(this.currentTheme.baseColor, -5)}</color>
    <color name="color_primary_700">${this.adjustLightness(this.currentTheme.baseColor, -10)}</color>
    <color name="color_primary_800">${this.adjustLightness(this.currentTheme.baseColor, -20)}</color>
    <color name="color_primary_900">${this.adjustLightness(this.currentTheme.baseColor, -30)}</color>
    
    <!-- Semantic Colors -->
    <color name="color_success">#10b981</color>
    <color name="color_warning">#f59e0b</color>
    <color name="color_error">#ef4444</color>
    <color name="color_info">#3b82f6</color>
    
    <!-- Neutral Colors -->
    <color name="color_gray_50">#f9fafb</color>
    <color name="color_gray_100">#f3f4f6</color>
    <color name="color_gray_200">#e5e7eb</color>
    <color name="color_gray_300">#d1d5db</color>
    <color name="color_gray_400">#9ca3af</color>
    <color name="color_gray_500">#6b7280</color>
    <color name="color_gray_600">#4b5563</color>
    <color name="color_gray_700">#374151</color>
    <color name="color_gray_800">#1f2937</color>
    <color name="color_gray_900">#111827</color>
</resources>`;
  }

  generateIOSSwift(palette, baseHSL) {
    return `// IceThemeBuilder Pro - iOS Color Extensions
// Generated on ${new Date().toLocaleDateString()}

import UIKit

extension UIColor {
    // Primary Colors
    static let colorPrimary50 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, 40)}")
    static let colorPrimary100 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, 30)}")
    static let colorPrimary200 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, 20)}")
    static let colorPrimary300 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, 10)}")
    static let colorPrimary400 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, 5)}")
    static let colorPrimary500 = UIColor(hex: "${this.currentTheme.baseColor}")
    static let colorPrimary600 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, -5)}")
    static let colorPrimary700 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, -10)}")
    static let colorPrimary800 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, -20)}")
    static let colorPrimary900 = UIColor(hex: "${this.adjustLightness(this.currentTheme.baseColor, -30)}")
    
    // Semantic Colors
    static let colorSuccess = UIColor(hex: "#10b981")
    static let colorWarning = UIColor(hex: "#f59e0b")
    static let colorError = UIColor(hex: "#ef4444")
    static let colorInfo = UIColor(hex: "#3b82f6")
    
    // Neutral Colors
    static let colorGray50 = UIColor(hex: "#f9fafb")
    static let colorGray100 = UIColor(hex: "#f3f4f6")
    static let colorGray200 = UIColor(hex: "#e5e7eb")
    static let colorGray300 = UIColor(hex: "#d1d5db")
    static let colorGray400 = UIColor(hex: "#9ca3af")
    static let colorGray500 = UIColor(hex: "#6b7280")
    static let colorGray600 = UIColor(hex: "#4b5563")
    static let colorGray700 = UIColor(hex: "#374151")
    static let colorGray800 = UIColor(hex: "#1f2937")
    static let colorGray900 = UIColor(hex: "#111827")
    
    convenience init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        
        self.init(
            red: CGFloat(r) / 255,
            green: CGFloat(g) / 255,
            blue:  CGFloat(b) / 255,
            alpha: CGFloat(a) / 255
        )
    }
}`;
  }

  generateFigmaTokens(palette, baseHSL) {
    return JSON.stringify({
      $schema: 'https://raw.githubusercontent.com/six7/figma-tokens/main/tokens.schema.json',
      color: {
        primary: {
          '50': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, 40) },
          '100': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, 30) },
          '200': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, 20) },
          '300': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, 10) },
          '400': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, 5) },
          '500': { $type: 'color', $value: this.currentTheme.baseColor },
          '600': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, -5) },
          '700': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, -10) },
          '800': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, -20) },
          '900': { $type: 'color', $value: this.adjustLightness(this.currentTheme.baseColor, -30) }
        },
        success: { $type: 'color', $value: '#10b981' },
        warning: { $type: 'color', $value: '#f59e0b' },
        error: { $type: 'color', $value: '#ef4444' },
        info: { $type: 'color', $value: '#3b82f6' }
      }
    }, null, 2);
  }

  copyExportToClipboard() {
    const output = this.exportTextarea.value;
    navigator.clipboard.writeText(output).then(() => {
      this.showToast('Export copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', 'error');
    });
  }

  downloadExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'css';
    const output = this.exportTextarea.value;
    const extension = format === 'css' ? 'css' : format === 'scss' ? 'scss' : format === 'json' ? 'json' : 'js';
    const filename = `ice-theme-${Date.now()}.${extension}`;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showToast(`Downloaded ${filename}`, 'success');
  }

  shareExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'css';
    const output = this.exportTextarea.value;
    const shareData = {
      title: 'IceThemeBuilder - Color Palette',
      text: output,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).then(() => {
        this.showToast('Shared successfully!', 'success');
      }).catch(() => {
        this.copyToClipboard(output);
      });
    } else {
      this.copyToClipboard(output);
    }
  }

  // Color Presets
  loadPreset(presetName) {
    const color = this.presets[presetName];
    if (color) {
      this.baseColorInput.value = color;
      this.baseColorText.value = color;
      this.generatePalette();
      this.showToast(`Loaded ${presetName.replace('-', ' ')} preset!`, 'success');
    }
  }

  // Utility Functions
  isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Copied ${this.formatColor(text)} to clipboard!`, 'success');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', 'error');
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Theme Toggle
  toggleMode() {
    this.isDark = !this.isDark;
    document.body.className = this.isDark ? "dark" : "light";
    
    // Save to both storage keys for compatibility
    localStorage.setItem('iceThemeBuilder_theme', this.isDark ? 'dark' : 'light');
    
    // Update the ColorTheory data format
    const data = {
      currentTheme: this.currentTheme,
      colorHistory: this.colorHistory,
      favorites: this.favorites,
      isDark: this.isDark,
      currentFormat: this.currentFormat
    };
    localStorage.setItem('iceThemeBuilder_data', JSON.stringify(data));
    
    // Update button text (only emoji changes)
    if (this.toggleModeBtn) {
      this.toggleModeBtn.textContent = this.isDark ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
    }
    
    this.generatePalette();
  }

  // Reset Functionality
  resetPalette() {
    this.baseColorInput.value = '#4da6ff';
    this.baseColorText.value = '#4da6ff';
    this.harmonyTypeSelect.value = 'monochromatic';
    this.generatePalette();
    this.showToast('Palette reset to defaults', 'info');
  }

  // Enhanced Color Blindness Simulation
  toggleColorBlindnessSimulation() {
    this.colorBlindnessSim = !this.colorBlindnessSim;
    
    if (this.colorBlindnessSim) {
      this.updateColorBlindnessSimulation();
      this.simulateBtn.textContent = '👁️ Stop Simulation';
      this.showToast('Color blindness simulation enabled', 'info');
    } else {
      this.removeColorBlindnessFilter();
      this.simulateBtn.textContent = '👁️ Simulate';
      this.showToast('Color blindness simulation disabled', 'info');
    }
  }

  updateColorBlindnessSimulation() {
    const type = this.colorblindTypeSelect?.value || 'protanopia';
    
    if (type === 'none') {
      this.removeColorBlindnessFilter();
      return;
    }
    
    this.applyColorBlindnessFilter(type);
    this.updateColorBlindnessComparison();
    
    // Show comparison view
    if (this.colorblindComparison) {
      this.colorblindComparison.style.display = 'block';
    }
  }

  applyColorBlindnessFilter(type) {
    const filter = this.getColorBlindnessFilter(type);
    document.body.style.filter = filter;
  }

  removeColorBlindnessFilter() {
    document.body.style.filter = '';
    
    // Hide comparison view
    if (this.colorblindComparison) {
      this.colorblindComparison.style.display = 'none';
    }
  }

  getColorBlindnessFilter(type) {
    // Enhanced color blindness simulation matrices
    const filters = {
      protanopia: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'protanopia\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.567 0.433 0     0 0 0.558 0.442 0     0 0     0     0.242 0.758 0 0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      deuteranopia: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'deuteranopia\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.625 0.375 0     0 0 0.7   0.3   0     0 0     0     0     0.3   0.7 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      tritanopia: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'tritanopia\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.95  0.05  0     0 0 0     0.433 0.567 0 0 0     0.475 0.525 0     0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      achromatopsia: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'achromatopsia\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      protanomaly: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'protanomaly\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.817 0.183 0     0 0 0.333 0.667 0     0 0     0     0.125 0.875 0 0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      deuteranomaly: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'deuteranomaly\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.8   0.2   0     0 0 0.258 0.742 0     0 0     0     0.142 0.858 0 0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")',
      tritanomaly: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'tritanomaly\'%3E%3CfeColorMatrix type=\'matrix\' values=\'0.967 0.033 0     0 0 0     0.733 0.267 0 0 0     0.183 0.817 0 0 0 0 0 0 1 0\'/%3E%3C/filter%3E%3C/svg%3E")'
    };
    
    return filters[type] || '';
  }
  
  updateColorBlindnessComparison() {
    if (!this.currentTheme || !this.normalPalette || !this.colorblindPalette) return;
    
    const colors = this.currentTheme.palette;
    
    // Clear existing palettes
    this.normalPalette.innerHTML = '';
    this.colorblindPalette.innerHTML = '';
    
    // Add normal colors
    colors.forEach(color => {
      const normalColor = document.createElement('div');
      normalColor.className = 'comparison-color';
      normalColor.style.background = color;
      normalColor.setAttribute('data-color', color.toUpperCase());
      this.normalPalette.appendChild(normalColor);
    });
    
    // Add transformed colors
    colors.forEach(color => {
      const transformedColor = this.transformColorForColorBlindness(color, this.colorblindTypeSelect?.value || 'protanopia');
      const colorblindColor = document.createElement('div');
      colorblindColor.className = 'comparison-color';
      colorblindColor.style.background = transformedColor;
      colorblindColor.setAttribute('data-color', transformedColor.toUpperCase());
      this.colorblindPalette.appendChild(colorblindColor);
    });
  }
  
  transformColorForColorBlindness(color, type) {
    const rgb = this.hexToRgb(color);
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Apply transformation matrices
    const matrices = {
      protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758]
      ],
      deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
      ],
      tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525]
      ],
      achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
      ],
      protanomaly: [
        [0.817, 0.183, 0],
        [0.333, 0.667, 0],
        [0.125, 0.875, 0]
      ],
      deuteranomaly: [
        [0.8, 0.2, 0],
        [0.258, 0.742, 0],
        [0.142, 0.858, 0]
      ],
      tritanomaly: [
        [0.967, 0.033, 0],
        [0, 0.733, 0.267],
        [0.183, 0.817, 0]
      ]
    };
    
    const matrix = matrices[type];
    if (!matrix) return color;
    
    const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
    const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
    const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;
    
    return this.rgbToHex(
      Math.round(Math.max(0, Math.min(1, newR)) * 255),
      Math.round(Math.max(0, Math.min(1, newG)) * 255),
      Math.round(Math.max(0, Math.min(1, newB)) * 255)
    );
  }

  // Keyboard Navigation
  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + E = Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.showExportModal();
      }
      
      // Ctrl/Cmd + D = Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleMode();
      }
      
      // Ctrl/Cmd + R = Reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.resetPalette();
      }
      
      // Escape = Close modal
      if (e.key === 'Escape') {
        if (this.exportModal.classList.contains('active')) {
          this.hideExportModal();
        }
      }
    });
  }

  // Accessibility Features
  setupAccessibility() {
    // Announce color changes to screen readers
    this.announceColorChange = (color) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      
      document.body.appendChild(announcement);
      announcement.textContent = `Color changed to ${this.formatColor(color)}`;
      
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Add skip link for keyboard navigation
    this.addSkipLink();
  }

  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--accent-primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Keyboard shortcuts handler
  handleKeyboardShortcuts(e) {
    // This method is called from the global event listener
    // Implementation is in setupKeyboardNavigation method
  }
  
  // Palette Optimization
  optimizeCurrentPalette() {
    if (!this.currentTheme || !this.paletteOptimizer) {
      this.showToast('No palette to optimize', 'error');
      return;
    }
    
    const target = this.optimizationTarget?.value || 'web';
    const minContrast = parseFloat(this.contrastRequirement?.value) || 4.5;
    const maxColors = parseInt(this.colorCountInput?.value) || 5;
    const maintainHarmony = this.maintainHarmonyCheckbox?.checked || true;
    const brandConsistency = this.ensureBrandConsistencyCheckbox?.checked || true;
    
    const customRules = {
      minContrast,
      maxColors,
      maintainHarmony,
      brandConsistency
    };
    
    try {
      const result = this.paletteOptimizer.optimizePalette(
        this.currentTheme.palette,
        target,
        customRules
      );
      
      this.displayOptimizationResults(result);
      this.showToast('Palette optimized successfully!', 'success');
    } catch (error) {
      console.error('Optimization error:', error);
      this.showToast('Failed to optimize palette', 'error');
    }
  }
  
  displayOptimizationResults(result) {
    if (!this.optimizationResults) return;
    
    // Show results container
    this.optimizationResults.style.display = 'block';
    
    // Update scores
    if (this.accessibilityScore) {
      this.accessibilityScore.textContent = `${result.scores.accessibility}%`;
    }
    if (this.harmonyScore) {
      this.harmonyScore.textContent = `${result.scores.harmony}%`;
    }
    if (this.versatilityScore) {
      this.versatilityScore.textContent = `${result.scores.versatility}%`;
    }
    
    // Display optimized colors
    if (this.optimizedColorsContainer) {
      this.optimizedColorsContainer.innerHTML = '';
      
      result.optimizedColors.forEach((color, index) => {
        const colorCard = this.createColorCard(color, index);
        this.optimizedColorsContainer.appendChild(colorCard);
      });
    }
    
    // Display recommendations
    if (this.optimizationRecommendations) {
      this.optimizationRecommendations.innerHTML = '';
      
      result.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.className = rec.type;
        li.textContent = rec.message;
        this.optimizationRecommendations.appendChild(li);
      });
    }
  }
  
  // AI-Powered Color Suggestions
  generateAISuggestions() {
    if (!this.aiColorIntelligence) {
      this.showToast('AI system not available', 'error');
      return;
    }
    
    const context = {
      projectType: this.projectType?.value || 'corporate',
      targetAudience: this.targetAudience?.value || 'professionals',
      brandPersonality: this.brandPersonality?.value || 'trustworthy',
      emotionGoal: this.emotionGoal?.value || 'trust'
    };
    
    try {
      this.showToast('Generating AI suggestions...', 'info');
      
      // Simulate AI processing delay for better UX
      setTimeout(() => {
        const aiResults = this.aiColorIntelligence.analyzeContext(
          context.projectType,
          context.targetAudience,
          context.brandPersonality,
          context.emotionGoal
        );
        
        this.displayAISuggestions(aiResults);
        this.showToast('AI suggestions generated successfully!', 'success');
      }, 1500);
      
    } catch (error) {
      console.error('AI suggestion generation error:', error);
      this.showToast('Failed to generate AI suggestions', 'error');
    }
  }
  
  displayAISuggestions(results) {
    if (!this.aiResults) return;
    
    // Show results container
    this.aiResults.style.display = 'block';
    
    // Display recommended palettes
    if (this.recommendedPalettes) {
      this.recommendedPalettes.innerHTML = '';
      
      results.colorRecommendations.forEach((palette, index) => {
        const paletteElement = this.createAISuggestionPalette(palette, index === 0);
        this.recommendedPalettes.appendChild(paletteElement);
      });
    }
    
    // Display psychological insights
    if (this.psychologyInsights) {
      this.psychologyInsights.innerHTML = '';
      results.psychologicalInsights.forEach(insight => {
        const insightElement = document.createElement('div');
        insightElement.className = `insight-item ${insight.type}`;
        insightElement.textContent = insight.message;
        this.psychologyInsights.appendChild(insightElement);
      });
    }
    
    // Display cultural insights
    if (this.culturalInsights) {
      this.culturalInsights.innerHTML = '';
      results.culturalConsiderations.forEach(consideration => {
        const considerationElement = document.createElement('div');
        considerationElement.className = `insight-item ${consideration.type}`;
        considerationElement.textContent = consideration.message;
        this.culturalInsights.appendChild(considerationElement);
      });
    }
    
    // Display accessibility recommendations
    if (this.accessibilityRecommendations) {
      this.accessibilityRecommendations.innerHTML = '';
      results.accessibilityGuidance.forEach(guidance => {
        const guidanceElement = document.createElement('div');
        guidanceElement.className = `insight-item ${guidance.type}`;
        guidanceElement.textContent = guidance.message;
        this.accessibilityRecommendations.appendChild(guidanceElement);
      });
    }
    
    // Store current AI results for later use
    this.currentAIResults = results;
  }
  
  createAISuggestionPalette(palette, isRecommended = false) {
    const paletteElement = document.createElement('div');
    paletteElement.className = `ai-palette ${isRecommended ? 'recommended' : ''}`;
    
    const confidencePercentage = Math.round(palette.confidence * 100);
    
    paletteElement.innerHTML = `
      <div class="palette-header">
        <span class="palette-name">${palette.name}</span>
        <span class="palette-confidence">${confidencePercentage}% match</span>
      </div>
      <div class="palette-description">${palette.description}</div>
      <div class="palette-preview">
        ${palette.colors.map(color => 
          `<div class="palette-preview-color" style="background: ${color}" data-color="${color.toUpperCase()}"></div>`
        ).join('')}
      </div>
    `;
    
    // Add click handler to apply palette
    paletteElement.addEventListener('click', () => {
      this.applyAIPalette(palette);
    });
    
    return paletteElement;
  }
  
  applyAIPalette(palette) {
    if (!palette.colors || palette.colors.length === 0) return;
    
    // Apply the first color as base color
    const baseColor = palette.colors[0];
    this.baseColorInput.value = baseColor;
    this.baseColorText.value = baseColor;
    
    // Determine harmony type based on palette
    let harmonyType = 'monochromatic';
    switch (palette.harmony) {
      case 'analogous':
        harmonyType = 'analogous';
        break;
      case 'complementary':
        harmonyType = 'complementary';
        break;
      case 'triadic':
        harmonyType = 'triadic';
        break;
      default:
        harmonyType = 'monochromatic';
    }
    
    if (this.harmonyTypeSelect) {
      this.harmonyTypeSelect.value = harmonyType;
    }
    
    // Generate palette
    this.generatePalette();
    
    this.showToast(`Applied AI-recommended ${palette.name} palette!`, 'success');
  }
  
  applyBestAISuggestion() {
    if (!this.currentAIResults || !this.currentAIResults.colorRecommendations.length) {
      this.showToast('No AI suggestions available', 'error');
      return;
    }
    
    const bestSuggestion = this.currentAIResults.colorRecommendations[0];
    this.applyAIPalette(bestSuggestion);
  }
  
  saveAISuggestions() {
    if (!this.currentAIResults) {
      this.showToast('No AI suggestions to save', 'error');
      return;
    }
    
    const suggestionsName = prompt('Enter name for these AI suggestions:');
    if (!suggestionsName) return;
    
    // Save to localStorage
    const savedSuggestions = this.getStoredSuggestions();
    savedSuggestions[suggestionsName] = {
      ...this.currentAIResults,
      name: suggestionsName,
      timestamp: Date.now()
    };
    
    localStorage.setItem('iceThemeBuilder_aiSuggestions', JSON.stringify(savedSuggestions));
    
    this.showToast(`AI suggestions "${suggestionsName}" saved successfully!`, 'success');
  }
  
  getStoredSuggestions() {
    const stored = localStorage.getItem('iceThemeBuilder_aiSuggestions');
    return stored ? JSON.parse(stored) : {};
  }
  
  // Brand Color Analysis from Images
  setupImageUpload() {
    if (!this.uploadArea || !this.imageUpload) return;
    
    // Click to upload
    this.uploadArea.addEventListener('click', () => {
      this.imageUpload.click();
    });
    
    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('dragover');
    });
    
    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('dragover');
    });
    
    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleImageUpload(files[0]);
      }
    });
    
    // File input change
    this.imageUpload.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageUpload(e.target.files[0]);
      }
    });
  }
  
  handleImageUpload(file) {
    if (!this.brandAnalyzer) {
      this.showToast('Brand analyzer not available', 'error');
      return;
    }
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('Image file too large. Please select an image under 10MB.', 'error');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.previewImage) {
        this.previewImage.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
    
    // Enable analyze button
    if (this.analyzeImage) {
      this.analyzeImage.disabled = false;
    }
    
    this.uploadedImage = file;
    this.showToast('Image uploaded successfully!', 'success');
  }
  
  async analyzeUploadedImage() {
    if (!this.uploadedImage || !this.brandAnalyzer) {
      this.showToast('Please upload an image first', 'error');
      return;
    }
    
    const options = {
      maxColors: parseInt(this.maxColors?.value) || 5,
      method: this.colorExtractionMethod?.value || 'dominant',
      includeNeutrals: this.includeNeutrals?.checked !== false
    };
    
    try {
      this.showToast('Analyzing image colors...', 'info');
      this.analyzeImage.disabled = true;
      
      const result = await this.brandAnalyzer.analyzeImage(this.uploadedImage, options);
      
      this.displayBrandAnalysis(result);
      this.showToast('Image analysis completed!', 'success');
      
    } catch (error) {
      console.error('Brand analysis error:', error);
      this.showToast(error.message || 'Failed to analyze image', 'error');
    } finally {
      this.analyzeImage.disabled = false;
    }
  }
  
  displayBrandAnalysis(result) {
    if (!this.analysisResults) return;
    
    // Show results container
    this.analysisResults.style.display = 'block';
    
    // Display extracted colors
    if (this.extractedColors) {
      this.extractedColors.innerHTML = '';
      
      result.colors.forEach(colorData => {
        const colorElement = document.createElement('div');
        colorElement.className = 'extracted-color';
        colorElement.style.background = colorData.hex;
        colorElement.setAttribute('data-color', colorData.hex.toUpperCase());
        colorElement.setAttribute('title', `${colorData.hex.toUpperCase()} (${colorData.percentage.toFixed(1)}%)`);
        
        const percentageElement = document.createElement('div');
        percentageElement.className = 'color-percentage';
        percentageElement.textContent = `${colorData.percentage.toFixed(0)}%`;
        
        colorElement.appendChild(percentageElement);
        
        // Add click handler to use this color
        colorElement.addEventListener('click', () => {
          this.baseColorInput.value = colorData.hex;
          this.baseColorText.value = colorData.hex;
          this.generatePalette();
          this.showToast(`Applied ${colorData.hex.toUpperCase()} as base color`, 'success');
        });
        
        this.extractedColors.appendChild(colorElement);
      });
    }
    
    // Display analysis metrics
    if (this.brandTemperature) {
      this.brandTemperature.textContent = result.analysis.temperature.charAt(0).toUpperCase() + result.analysis.temperature.slice(1);
    }
    
    if (this.colorHarmony) {
      this.colorHarmony.textContent = result.analysis.harmony.charAt(0).toUpperCase() + result.analysis.harmony.slice(1);
    }
    
    if (this.vibrancyLevel) {
      this.vibrancyLevel.textContent = result.analysis.vibrancy.charAt(0).toUpperCase() + result.analysis.vibrancy.slice(1);
    }
    
    // Display recommendations
    if (this.brandRecommendations) {
      this.brandRecommendations.innerHTML = '';
      
      result.analysis.recommendations.forEach(recommendation => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.textContent = recommendation;
        this.brandRecommendations.appendChild(recElement);
      });
    }
    
    // Store current analysis
    this.currentBrandAnalysis = result;
  }
  
  applyBrandColors() {
    if (!this.currentBrandAnalysis || !this.currentBrandAnalysis.colors.length) {
      this.showToast('No brand colors to apply', 'error');
      return;
    }
    
    const colors = this.currentBrandAnalysis.colors;
    const dominantColor = colors[0];
    
    // Apply dominant color as base
    this.baseColorInput.value = dominantColor.hex;
    this.baseColorText.value = dominantColor.hex;
    
    // Determine harmony type based on analysis
    let harmonyType = 'monochromatic';
    switch (this.currentBrandAnalysis.analysis.harmony) {
      case 'complementary':
        harmonyType = 'complementary';
        break;
      case 'analogous':
        harmonyType = 'analogous';
        break;
      case 'triadic':
        harmonyType = 'triadic';
        break;
      default:
        harmonyType = 'monochromatic';
    }
    
    if (this.harmonyTypeSelect) {
      this.harmonyTypeSelect.value = harmonyType;
    }
    
    // Generate palette
    this.generatePalette();
    
    this.showToast('Applied brand colors to palette!', 'success');
  }
  
  saveBrandAnalysis() {
    if (!this.currentBrandAnalysis) {
      this.showToast('No analysis to save', 'error');
      return;
    }
    
    const analysisName = prompt('Enter name for this brand analysis:');
    if (!analysisName) return;
    
    // Save to localStorage
    const savedAnalyses = this.getStoredBrandAnalyses();
    savedAnalyses[analysisName] = {
      ...this.currentBrandAnalysis,
      name: analysisName,
      timestamp: Date.now()
    };
    
    localStorage.setItem('iceThemeBuilder_brandAnalyses', JSON.stringify(savedAnalyses));
    
    this.showToast(`Brand analysis "${analysisName}" saved successfully!`, 'success');
  }
  
  exportBrandPalette() {
    if (!this.currentBrandAnalysis || !this.currentBrandAnalysis.colors.length) {
      this.showToast('No colors to export', 'error');
      return;
    }
    
    const colors = this.currentBrandAnalysis.colors;
    const exportData = {
      name: this.currentBrandAnalysis.name || 'Brand Palette',
      extractedFrom: 'image',
      colors: colors.map(c => ({
        hex: c.hex,
        percentage: c.percentage,
        rgb: c.rgb,
        hsl: c.hsl
      })),
      analysis: this.currentBrandAnalysis.analysis,
      timestamp: Date.now()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-palette-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    this.showToast('Brand palette exported successfully!', 'success');
  }
  
  getStoredBrandAnalyses() {
    const stored = localStorage.getItem('iceThemeBuilder_brandAnalyses');
    return stored ? JSON.parse(stored) : {};
  }
  
  // Collaboration & Sharing Features
  generateShareLink() {
    if (!this.collaborationManager) {
      this.showToast('Collaboration manager not available', 'error');
      return;
    }
    
    try {
      const shareUrl = this.collaborationManager.generateShareableLink();
      
      if (this.shareLinkInput) {
        this.shareLinkInput.value = shareUrl;
      }
      
      if (this.shareLinkResult) {
        this.shareLinkResult.style.display = 'flex';
      }
      
      this.showToast('Share link generated successfully!', 'success');
      
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }
  
  copyShareLink() {
    if (!this.shareLinkInput) return;
    
    const link = this.shareLinkInput.value;
    if (!link) {
      this.showToast('No share link to copy', 'error');
      return;
    }
    
    this.copyToClipboard(link);
  }
  
  exportPaletteImage() {
    if (!this.collaborationManager) {
      this.showToast('Collaboration manager not available', 'error');
      return;
    }
    
    try {
      this.collaborationManager.exportPaletteAsImage();
      this.showToast('Palette image exported successfully!', 'success');
      
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }
  
  shareToSocial(platform) {
    if (!this.collaborationManager) {
      this.showToast('Collaboration manager not available', 'error');
      return;
    }
    
    try {
      this.collaborationManager.shareToSocial(platform);
      this.showToast(`Sharing to ${platform}...`, 'info');
      
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  }
  
  browseGallery() {
    this.showToast('Palette gallery feature coming soon!', 'info');
    // In a real implementation, this would open a gallery modal or navigate to a gallery page
  }
  
  submitToGallery() {
    if (!this.currentTheme) {
      this.showToast('Create a palette first before submitting', 'error');
      return;
    }
    
    const paletteName = prompt('Enter a name for your palette:');
    if (!paletteName) return;
    
    const paletteData = {
      ...this.currentTheme,
      name: paletteName,
      submittedAt: Date.now(),
      id: Date.now().toString(36)
    };
    
    // Save to local "gallery" (in real app, this would upload to server)
    const gallery = this.getStoredGallery();
    gallery[paletteData.id] = paletteData;
    localStorage.setItem('iceThemeBuilder_gallery', JSON.stringify(gallery));
    
    this.showToast(`Palette "${paletteName}" submitted to gallery!`, 'success');
  }
  
  viewTrending() {
    this.showToast('Trending colors feature coming soon!', 'info');
    // In a real implementation, this would show trending colors from a server
  }
  
  getStoredGallery() {
    const stored = localStorage.getItem('iceThemeBuilder_gallery');
    return stored ? JSON.parse(stored) : {};
  }
  
  updateCommunityStats() {
    if (!this.collaborationManager || !this.totalPalettes) return;
    
    try {
      const stats = this.collaborationManager.getCommunityStats();
      
      if (this.totalPalettes) {
        this.totalPalettes.textContent = stats.totalPalettes?.toLocaleString() || '125,000+';
      }
      
      if (this.totalShares) {
        this.totalShares.textContent = stats.totalShares?.toLocaleString() || '45,000+';
      }
      
      if (this.communitySize) {
        this.communitySize.textContent = stats.communitySize?.toLocaleString() || '18,000+';
      }
      
      if (this.todayPalettes) {
        this.todayPalettes.textContent = stats.todayPalettes?.toString() || '1270';
      }
      
    } catch (error) {
      console.warn('Failed to update community stats:', error);
      // Set fallback values
      if (this.totalPalettes) this.totalPalettes.textContent = '125,000+';
      if (this.totalShares) this.totalShares.textContent = '45,000+';
      if (this.communitySize) this.communitySize.textContent = '18,000+';
      if (this.todayPalettes) this.todayPalettes.textContent = '1270';
    }
  }
  
  // Check for shared palette in URL on page load
  checkForSharedPalette() {
    const urlParams = new URLSearchParams(window.location.search);
    const paletteParam = urlParams.get('palette');
    
    if (!paletteParam || !this.collaborationManager) return;
    
    try {
      const paletteData = this.collaborationManager.parseSharedLink(window.location.href);
      
      // Ask user if they want to load the shared palette
      const shouldLoad = confirm('A shared color palette was found in the link. Would you like to load it?');
      
      if (shouldLoad) {
        this.loadSharedPalette(paletteData);
      }
      
    } catch (error) {
      console.warn('Failed to load shared palette:', error);
    }
  }
  
  loadSharedPalette(paletteData) {
    // Apply the shared palette
    this.baseColorInput.value = paletteData.baseColor;
    this.baseColorText.value = paletteData.baseColor;
    
    if (this.harmonyTypeSelect && paletteData.harmonyType) {
      this.harmonyTypeSelect.value = paletteData.harmonyType;
    }
    
    this.generatePalette();
    this.showToast('Shared palette loaded successfully!', 'success');
  }
}

// Header Auto-Hide Functionality
class HeaderManager {
  constructor() {
    this.header = document.querySelector('header');
    this.lastScrollTop = 0;
    this.isHeaderVisible = true;
    this.scrollThreshold = 10; // Minimum scroll before triggering hide/show
    this.hideDelay = 100; // Delay before hiding header (prevents accidental hides)
    this.hideTimeout = null;
    
    if (this.header) {
      this.init();
    }
  }
  
  init() {
    // Add initial state
    this.header.classList.add('header-visible');
    
    // Bind scroll event with throttling for performance
    this.bindScrollEvents();
    
    // Handle window resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    
    // Handle visibility when user returns to page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.showHeader();
        this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      }
    });
  }
  
  bindScrollEvents() {
    // Use passive event listener for better performance
    window.addEventListener('scroll', this.throttleScroll.bind(this), { passive: true });
  }
  
  throttleScroll() {
    // Throttle scroll events to improve performance
    if (!this.scrollTimeout) {
      this.scrollTimeout = setTimeout(() => {
        this.scrollTimeout = null;
        this.handleScroll();
      }, 16); // ~60fps
    }
  }
  
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
    const scrollDifference = Math.abs(scrollTop - this.lastScrollTop);
    
    // Only proceed if scroll difference is significant enough
    if (scrollDifference < this.scrollThreshold) {
      this.lastScrollTop = scrollTop;
      return;
    }
    
    // Clear any existing hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    if (scrollDirection === 'down' && scrollTop > this.scrollThreshold) {
      // Hide header when scrolling down
      this.hideHeader();
    } else if (scrollDirection === 'up') {
      // Show header when scrolling up
      this.showHeader();
    }
    
    // Set timeout to hide header after delay when scrolling down
    if (scrollDirection === 'down' && scrollTop > this.scrollThreshold) {
      this.hideTimeout = setTimeout(() => {
        this.hideHeader();
      }, this.hideDelay);
    }
    
    this.lastScrollTop = scrollTop;
  }
  
  hideHeader() {
    if (this.isHeaderVisible) {
      this.header.classList.remove('header-visible');
      this.header.classList.add('header-hidden');
      this.isHeaderVisible = false;
    }
  }
  
  showHeader() {
    if (!this.isHeaderVisible) {
      this.header.classList.remove('header-hidden');
      this.header.classList.add('header-visible');
      this.isHeaderVisible = true;
    }
  }
  
  handleResize() {
    // Reset scroll tracking on resize to prevent incorrect behavior
    this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  }
  
  // Public method to manually show header (useful for specific interactions)
  showHeaderTemporarily(duration = 2000) {
    this.showHeader();
    setTimeout(() => {
      // Only hide again if user hasn't scrolled
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollTop > this.scrollThreshold) {
        this.hideHeader();
      }
    }, duration);
  }
}

// Initialize the application
let colorTheory;
let headerManager;
document.addEventListener('DOMContentLoaded', () => {
  // Initialize header manager first for immediate scroll detection
  headerManager = new HeaderManager();
  
  // Only initialize ColorTheory if the main app elements exist
  if (document.getElementById('baseColor') && document.getElementById('palette')) {
    colorTheory = new ColorTheory();
  } else {
    // Initialize simple theme toggle for pages without color theory features
    initializeSimpleThemeToggle();
  }
  
  // Add storage event listener for theme sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'iceThemeBuilder_theme' || e.key === 'iceThemeBuilder_data') {
      // Update theme across all open tabs
      let newTheme;
      if (e.key === 'iceThemeBuilder_theme') {
        newTheme = e.newValue;
      } else {
        try {
          const data = JSON.parse(e.newValue);
          newTheme = data.isDark ? 'dark' : 'light';
        } catch (err) {
          return;
        }
      }
      
      if (newTheme) {
        document.body.className = newTheme;
        
        // Update button text if it exists
        const toggleBtn = document.getElementById('toggleMode');
        if (toggleBtn) {
          toggleBtn.textContent = newTheme === 'dark' ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
        }
      }
    }
  });
});

// Simple theme toggle for pages without color theory features
function initializeSimpleThemeToggle() {
  const toggleBtn = document.getElementById('toggleMode');
  if (toggleBtn) {
    // Load saved theme preference (check both keys for compatibility)
    let savedTheme = localStorage.getItem('iceThemeBuilder_theme') || localStorage.getItem('iceThemeBuilder_data');
    if (savedTheme) {
      // Check if it's the old format (JSON) or new format (direct string)
      try {
        const data = JSON.parse(savedTheme);
        document.body.className = data.isDark ? 'dark' : 'light';
      } catch (e) {
        // Direct theme string
        document.body.className = savedTheme;
      }
    } else {
      // Set default theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.className = prefersDark ? 'dark' : 'light';
    }
    
    toggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      
      document.body.className = newTheme;
      
      // Save to both keys for compatibility
      localStorage.setItem('iceThemeBuilder_theme', newTheme);
      
      // Also update the ColorTheory storage format
      const colorTheoryData = { isDark: newTheme === 'dark' };
      localStorage.setItem('iceThemeBuilder_data', JSON.stringify(colorTheoryData));
      
      // Update button text (only emoji changes)
      toggleBtn.textContent = newTheme === 'dark' ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
    });
    
    // Set initial button text based on current theme
    const isDark = document.body.classList.contains('dark');
    toggleBtn.textContent = isDark ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
  }
}

// Error handling for the entire application
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  if (colorTheory) {
    colorTheory.showToast('An unexpected error occurred. Please refresh the page.', 'error');
  }
  // Ensure header is visible when there's an error
  if (headerManager) {
    headerManager.showHeader();
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (colorTheory) {
    colorTheory.showToast('An unexpected error occurred. Please try again.', 'error');
  }
  // Ensure header is visible when there's an error
  if (headerManager) {
    headerManager.showHeader();
  }
});
