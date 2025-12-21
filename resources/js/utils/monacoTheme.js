// @/utils/monacoTheme.js - Beautiful Minimalist Monaco Theme
// Aesthetic color palette: Cyan, Yellow, Green, Orange, Sky Blue, Pink, Purple

export const defineMinimalistTheme = (monaco) => {
  if (!monaco) return;

  // Beautiful color palette
  const colors = {
    cyan: '#06b6d4',        // Tailwind cyan-500
    skyBlue: '#38bdf8',     // Tailwind sky-400
    yellow: '#fbbf24',      // Tailwind amber-400
    green: '#10b981',       // Tailwind emerald-500
    orange: '#fb923c',      // Tailwind orange-400
    pink: '#f472b6',        // Tailwind pink-400
    purple: '#a855f7',      // Tailwind purple-500
    lightPurple: '#c084fc', // Tailwind purple-400
    // Neutrals
    white: '#f9fafb',
    gray: '#9ca3af',
    darkGray: '#6b7280',
    darkerGray: '#4b5563',
    background: '#0f172a',  // Slate-900
    surface: '#1e293b',     // Slate-800
    border: '#334155'       // Slate-700
  };

  monaco.editor.defineTheme('minimalist-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Comments - Gray with italic
      { token: 'comment', foreground: colors.gray.substring(1), fontStyle: 'italic' },
      { token: 'comment.block', foreground: colors.gray.substring(1), fontStyle: 'italic' },
      { token: 'comment.line', foreground: colors.gray.substring(1), fontStyle: 'italic' },
      
      // Strings - Cyan (beautiful aqua color)
      { token: 'string', foreground: colors.cyan.substring(1) },
      { token: 'string.quoted', foreground: colors.cyan.substring(1) },
      { token: 'string.template', foreground: colors.cyan.substring(1) },
      
      // Numbers - Orange
      { token: 'number', foreground: colors.orange.substring(1) },
      { token: 'number.float', foreground: colors.orange.substring(1) },
      { token: 'number.hex', foreground: colors.orange.substring(1) },
      
      // Keywords - Pink (eye-catching)
      { token: 'keyword', foreground: colors.pink.substring(1), fontStyle: 'bold' },
      { token: 'keyword.control', foreground: colors.pink.substring(1), fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: colors.pink.substring(1) },
      
      // Operators - Purple
      { token: 'operator', foreground: colors.purple.substring(1) },
      { token: 'delimiter', foreground: colors.purple.substring(1) },
      
      // Functions - Yellow (bright and noticeable)
      { token: 'function', foreground: colors.yellow.substring(1), fontStyle: 'bold' },
      { token: 'function.call', foreground: colors.yellow.substring(1) },
      { token: 'support.function', foreground: colors.yellow.substring(1) },
      { token: 'entity.name.function', foreground: colors.yellow.substring(1) },
      
      // Variables - Sky Blue
      { token: 'variable', foreground: colors.skyBlue.substring(1) },
      { token: 'variable.parameter', foreground: colors.skyBlue.substring(1) },
      { token: 'variable.other', foreground: colors.skyBlue.substring(1) },
      
      // Types & Classes - Green
      { token: 'type', foreground: colors.green.substring(1), fontStyle: 'bold' },
      { token: 'type.identifier', foreground: colors.green.substring(1) },
      { token: 'class', foreground: colors.green.substring(1), fontStyle: 'bold' },
      { token: 'entity.name.class', foreground: colors.green.substring(1), fontStyle: 'bold' },
      { token: 'entity.name.type', foreground: colors.green.substring(1) },
      
      // Constants - Orange (bright)
      { token: 'constant', foreground: colors.orange.substring(1) },
      { token: 'constant.language', foreground: colors.orange.substring(1), fontStyle: 'bold' },
      { token: 'constant.numeric', foreground: colors.orange.substring(1) },
      { token: 'variable.language', foreground: colors.orange.substring(1), fontStyle: 'bold' },
      
      // Tags (HTML/JSX) - Light Purple
      { token: 'tag', foreground: colors.lightPurple.substring(1) },
      { token: 'entity.name.tag', foreground: colors.lightPurple.substring(1) },
      { token: 'meta.tag', foreground: colors.lightPurple.substring(1) },
      
      // Attributes - Sky Blue
      { token: 'attribute.name', foreground: colors.skyBlue.substring(1) },
      { token: 'entity.other.attribute-name', foreground: colors.skyBlue.substring(1) },
      
      // Punctuation - Purple (subtle)
      { token: 'punctuation', foreground: colors.purple.substring(1) },
      { token: 'meta.brace', foreground: colors.purple.substring(1) },
      
      // Properties - Green
      { token: 'property', foreground: colors.green.substring(1) },
      { token: 'support.type.property-name', foreground: colors.green.substring(1) },
      
      // Special (this, super, etc) - Pink
      { token: 'variable.language.this', foreground: colors.pink.substring(1), fontStyle: 'italic' },
      { token: 'variable.language.super', foreground: colors.pink.substring(1), fontStyle: 'italic' },
      
      // RegExp - Cyan
      { token: 'regexp', foreground: colors.cyan.substring(1) },
      
      // Default text - White
      { token: '', foreground: colors.white.substring(1) }
    ],
    colors: {
      // Editor colors
      'editor.background': colors.background,
      'editor.foreground': colors.white,
      'editorLineNumber.foreground': colors.darkerGray,
      'editorLineNumber.activeForeground': colors.purple,
      'editor.lineHighlightBackground': colors.surface + '40',
      'editor.selectionBackground': colors.purple + '30',
      'editor.inactiveSelectionBackground': colors.purple + '20',
      'editor.selectionHighlightBackground': colors.purple + '20',
      'editorCursor.foreground': colors.pink,
      'editorWhitespace.foreground': colors.darkerGray + '50',
      'editorIndentGuide.background': colors.border + '40',
      'editorIndentGuide.activeBackground': colors.purple + '60',
      'editor.findMatchBackground': colors.yellow + '40',
      'editor.findMatchHighlightBackground': colors.yellow + '20',
      'editor.wordHighlightBackground': colors.skyBlue + '20',
      'editor.wordHighlightStrongBackground': colors.skyBlue + '30',
      
      // Brackets
      'editorBracketMatch.background': colors.purple + '30',
      'editorBracketMatch.border': colors.purple,
      
      // Gutter
      'editorGutter.background': colors.background,
      'editorGutter.modifiedBackground': colors.yellow,
      'editorGutter.addedBackground': colors.green,
      'editorGutter.deletedBackground': colors.pink,
      
      // Widget colors
      'editorWidget.background': colors.surface,
      'editorWidget.border': colors.border,
      'editorSuggestWidget.background': colors.surface,
      'editorSuggestWidget.border': colors.border,
      'editorSuggestWidget.selectedBackground': colors.purple + '40',
      'editorHoverWidget.background': colors.surface,
      'editorHoverWidget.border': colors.border,
      
      // Scrollbar
      'scrollbar.shadow': colors.background + '80',
      'scrollbarSlider.background': colors.border + '60',
      'scrollbarSlider.hoverBackground': colors.border + '80',
      'scrollbarSlider.activeBackground': colors.border,
      
      // Panel
      'panel.background': colors.background,
      'panel.border': colors.border,
      'panelTitle.activeBorder': colors.purple,
      'panelTitle.activeForeground': colors.white,
      'panelTitle.inactiveForeground': colors.gray,
      
      // Minimap
      'minimap.background': colors.background,
      'minimapSlider.background': colors.border + '40',
      'minimapSlider.hoverBackground': colors.border + '60',
      'minimapSlider.activeBackground': colors.border + '80'
    }
  });

  // Light theme variant
  monaco.editor.defineTheme('minimalist-light', {
    base: 'vs',
    inherit: true,
    rules: [
      // Comments - Dark Gray with italic
      { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
      
      // Strings - Cyan (darker for light background)
      { token: 'string', foreground: '0891b2' }, // cyan-600
      
      // Numbers - Orange
      { token: 'number', foreground: 'ea580c' }, // orange-600
      
      // Keywords - Pink
      { token: 'keyword', foreground: 'db2777', fontStyle: 'bold' }, // pink-600
      
      // Operators - Purple
      { token: 'operator', foreground: '9333ea' }, // purple-600
      { token: 'delimiter', foreground: '9333ea' },
      
      // Functions - Amber (darker yellow)
      { token: 'function', foreground: 'd97706', fontStyle: 'bold' }, // amber-600
      { token: 'entity.name.function', foreground: 'd97706' },
      
      // Variables - Sky Blue
      { token: 'variable', foreground: '0284c7' }, // sky-600
      
      // Types & Classes - Green
      { token: 'type', foreground: '059669', fontStyle: 'bold' }, // emerald-600
      { token: 'class', foreground: '059669', fontStyle: 'bold' },
      { token: 'entity.name.class', foreground: '059669' },
      
      // Constants - Orange
      { token: 'constant', foreground: 'ea580c' },
      
      // Tags - Purple
      { token: 'tag', foreground: 'a855f7' },
      { token: 'entity.name.tag', foreground: 'a855f7' },
      
      // Attributes - Sky Blue
      { token: 'attribute.name', foreground: '0284c7' },
      
      // Properties - Green
      { token: 'property', foreground: '059669' },
      
      // Default - Dark text
      { token: '', foreground: '111827' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#111827',
      'editorLineNumber.foreground': '#9ca3af',
      'editorLineNumber.activeForeground': '#a855f7',
      'editor.lineHighlightBackground': '#f3f4f6',
      'editor.selectionBackground': '#a855f7' + '30',
      'editorCursor.foreground': '#db2777'
    }
  });
};

// Export theme setter
export const setMinimalistTheme = (monaco, isDark = true) => {
  if (!monaco) return;
  defineMinimalistTheme(monaco);
  monaco.editor.setTheme(isDark ? 'minimalist-dark' : 'minimalist-light');
};
