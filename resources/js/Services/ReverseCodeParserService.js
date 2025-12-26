// @/Services/ReverseCodeParserService.js - Code to Visual Parser with Real-time Sync
import componentLibraryService from './ComponentLibraryService.js';

class ReverseCodeParserService {
  constructor() {
    this.cursorPosition = { line: 1, column: 1 };
    this.currentCode = '';
    this.parsedComponents = [];
    this.elementMap = new Map(); // Maps line numbers to component IDs
    this.isIncomplete = false;
    this.syntaxErrors = [];
  }

  /**
   * 🔥 MAIN METHOD: Parse code to visual components (even incomplete)
   */
  parseCodeToComponents(code, language = 'html', codeStyle = null, cssText = null) {
    this.currentCode = code;
    this.elementMap.clear();
    
    try {
      if (language === 'html' || language === 'jsx') {
        const tree = this.parseHTML(code);
        return cssText ? this.applyCssTextToTree(tree, cssText) : tree;
      } else if (language === 'react' || language === 'javascript') {
        const tree = this.parseReactJSX(code);
        return cssText ? this.applyCssTextToTree(tree, cssText) : tree;
      } else if (language === 'css') {
        // CSS-only apply: no structure change, caller should use applyCssTextToExistingComponents
        return [];
      }
    } catch (error) {
      console.warn('🔍 Parsing incomplete/invalid code:', error.message);
      // Fallback to tolerant parsing if strict parsing fails
      return this.parseHTMLWithTolerance(this.extractParsableContent(code));
    }
    
    return [];
  }

  /**
   * 🔥 Parse HTML/JSX even if incomplete
   */
  parseHTML(htmlString) {
    // Extract content from body or return statement
    const content = this.extractParsableContent(htmlString);
    
    // Parse with fault tolerance
    return this.parseHTMLWithTolerance(content);
  }

  /**
   * 🔥 Extract only parseable content (body or JSX return)
   */
  extractParsableContent(codeString) {
    // For HTML: Extract body content
    const bodyMatch = codeString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // For React: Extract JSX from return statement
    const returnMatch = codeString.match(/return\s*\(?([\s\S]*?)\)?[;}]/);
    if (returnMatch) {
      return returnMatch[1];
    }
    
    // If no wrapper found, assume it's already clean content
    return codeString;
  }

  /**
   * 🔥 Fault-tolerant HTML parser for incomplete code
   */
  parseHTMLWithTolerance(htmlContent) {
    // New nested tolerant parser
    const tokens = this.tokenizeHTML(htmlContent);
    const { tree, flat, lineMap } = this.buildTreeFromTokens(tokens);
    this.elementMap = lineMap; // Map of startLine -> componentId (approx)
    return tree;
  }

  // Tokenize HTML/JSX into tolerant tokens with line/col info
  // Includes BOTH tag tokens and text tokens so that Apply preserves inner content.
  tokenizeHTML(content) {
    const tokens = [];

    // Precompute line starts so we can convert index -> (line, col)
    const lineStarts = [0];
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '\n') lineStarts.push(i + 1);
    }

    const indexToLineCol = (idx) => {
      // Binary search for last lineStart <= idx
      let lo = 0;
      let hi = lineStarts.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lineStarts[mid] <= idx) lo = mid + 1;
        else hi = mid - 1;
      }
      const lineIndex = Math.max(0, hi);
      const line = lineIndex + 1;
      const col = idx - lineStarts[lineIndex] + 1;
      return { line, col };
    };

    // Walk the string and emit tokens.
    // We intentionally do NOT use a strict regex, so we can tolerate missing '>'
    // and still capture text between tags.
    let i = 0;
    let lastTextStart = 0;

    const flushText = (start, end) => {
      if (end <= start) return;
      const raw = content.slice(start, end);
      // Preserve whitespace-only text? Generally no; it just creates noisy nodes.
      // But we DO preserve significant whitespace between inline elements.
      // We'll trim only if it's entirely whitespace.
      if (/^\s+$/.test(raw)) return;
      const { line, col } = indexToLineCol(start);
      tokens.push({ type: 'text', raw, line, col });
    };

    while (i < content.length) {
      const ch = content[i];
      if (ch !== '<') {
        i++;
        continue;
      }

      // Text up to this tag
      flushText(lastTextStart, i);

      // Find end of tag
      let j = i + 1;
      while (j < content.length && content[j] !== '>') {
        j++;
      }

      const hasClosingAngle = j < content.length && content[j] === '>';
      const rawTag = content.slice(i, hasClosingAngle ? j + 1 : content.length);

      // Basic tag parsing
      const tagMatch = rawTag.match(/^<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9:-]*)([\s\S]*?)>?$/);
      if (tagMatch) {
        const isClose = !!tagMatch[1];
        const name = tagMatch[2];
        const rest = (tagMatch[3] || '').trim();

        // Detect self closing: ends with '/>' or has trailing '/' before missing '>'
        const isSelf = /\/\s*>$/.test(rawTag) || /\s\/\s*$/.test(rest);
        const attrs = rest.replace(/\/?\s*>?$/, '').trim();
        const { line, col } = indexToLineCol(i);

        tokens.push({
          type: isClose ? 'close' : (isSelf ? 'self' : 'open'),
          tag: name,
          attrs,
          raw: rawTag,
          line,
          col,
          closed: hasClosingAngle || isSelf
        });

        i = hasClosingAngle ? j + 1 : content.length;
        lastTextStart = i;
        continue;
      }

      // Not a valid tag; treat '<' as text and continue
      i++;
    }

    // Trailing text
    flushText(lastTextStart, content.length);

    return tokens;
  }

  // Build nested tree from tokens (tolerant)
  // IMPORTANT: we create explicit `text-node` children so inner text is preserved.
  buildTreeFromTokens(tokens) {
    const roots = [];
    const stack = [];
    const flat = [];
    const lineMap = new Map();
    let idCounter = 1;

    const attachNode = (node) => {
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node);
      } else {
        roots.push(node);
      }
    };

    const newElementNode = (tag, attrs, line, closed, self) => {
      const props = this.parseAttributes(attrs);
      const type = this.mapHTMLToComponentType(tag);
      const style = this.extractStyleFromProps(props);
      const node = {
        id: `parsed_${idCounter++}`,
        type,
        props,
        style,
        children: [],
        metadata: {
          originalTag: tag,
          sourceLineNumber: line,
          startLine: line,
          endLine: line,
          isComplete: !!closed || !!self,
          isSelfClosing: !!self,
        }
      };
      flat.push(node);
      lineMap.set(line, node.id);
      return node;
    };

    const newTextNode = (rawText, line) => {
      const text = (rawText ?? '').toString();
      const node = {
        id: `parsed_${idCounter++}`,
        type: 'text-node',
        props: {
          content: text,
          text
        },
        style: {},
        children: [],
        metadata: {
          originalTag: 'text-node',
          sourceLineNumber: line,
          startLine: line,
          endLine: line,
          isComplete: true,
          isSelfClosing: true,
        }
      };
      flat.push(node);
      // don't lineMap text by default; it makes cursor mapping weird
      return node;
    };

    for (const tok of tokens) {
      if (tok.type === 'text') {
        const node = newTextNode(tok.raw, tok.line);
        attachNode(node);
        continue;
      }

      if (tok.type === 'open') {
        const node = newElementNode(tok.tag, tok.attrs, tok.line, tok.closed, false);
        attachNode(node);
        // Push even if not closed angle; tolerate incomplete open
        stack.push(node);
        if (!tok.closed) {
          node.metadata.isComplete = false;
        }
      } else if (tok.type === 'self') {
        const node = newElementNode(tok.tag, tok.attrs, tok.line, true, true);
        attachNode(node);
        node.metadata.endLine = tok.line;
      } else if (tok.type === 'close') {
        // Pop until matching tag or stack empty
        let found = -1;
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].metadata.originalTag?.toLowerCase() === tok.tag.toLowerCase()) {
            found = i; break;
          }
        }
        if (found >= 0) {
          const node = stack[found];
          node.metadata.endLine = tok.line;
          node.metadata.isComplete = node.metadata.isComplete && tok.closed !== false;
          // pop all above if mis-nesting occurred
          stack.splice(found);
        } else {
          // Closing tag without opener: ignore
        }
      }
    }

    // Unclosed tags remain incomplete; set endLine to last seen line of subtree if possible
    const lastLine = tokens.length ? Math.max(...tokens.map(t => t.line)) : 1;
    for (const node of flat) {
      if (!node.metadata.endLine) node.metadata.endLine = lastLine;
      if (stack.includes(node)) {
        node.metadata.isComplete = false;
      }
    }

    return { tree: roots, flat, lineMap };
  }

  /**
   * 🔥 Find HTML elements in a line (even incomplete)
   */
  findElementsInLine(line, lineNumber) {
    const elements = [];
    
    // Regex to match opening tags (even incomplete)
    // Matches: <div>, <button class="btn", <input type="text, etc.
    const openTagRegex = /<(\w+)([^>]*?)(\/>|>|$)/g;
    
    let match;
    while ((match = openTagRegex.exec(line)) !== null) {
      const [fullMatch, tagName, attributes, closing] = match;
      
      elements.push({
        tagName,
        attributes: attributes.trim(),
        isComplete: closing === '/>' || closing === '>',
        isSelfClosing: closing === '/>',
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        lineNumber,
        fullMatch
      });
    }
    
    return elements;
  }

  /**
   * 🔥 Convert HTML element to component format
   */
  htmlElementToComponent(elementMatch, id) {
    const { tagName, attributes, isComplete, isSelfClosing, lineNumber } = elementMatch;
    
    // Parse attributes
    const props = this.parseAttributes(attributes);
    
    // Map HTML tag to component type
    const componentType = this.mapHTMLToComponentType(tagName);
    
    // Extract text content if it's a text element
    const textContent = this.extractTextContent(elementMatch);
    
    const component = {
      id: `parsed_${id}`,
      type: componentType,
      props: {
        ...props,
        ...(textContent && { text: textContent })
      },
      style: this.extractStyleFromProps(props),
      children: [], // TODO: Handle nested elements
      metadata: {
        sourceLineNumber: lineNumber,
        isComplete,
        isSelfClosing,
        originalTag: tagName
      }
    };
    
    return component;
  }

  /**
   * 🔥 Parse HTML attributes into props
   */
  parseAttributes(attributeString) {
    const props = {};
    
    if (!attributeString) return props;
    
    // Handle both complete and incomplete attributes
    // Matches: id="test", class="btn", onclick="func()", data-id="123", disabled, etc.
    const attrRegex = /(\w+(?:-\w+)*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
    
    let match;
    while ((match = attrRegex.exec(attributeString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = match;
      const value = doubleQuoted || singleQuoted || unquoted || true;
      
      // Convert HTML attributes to React props
      const propName = this.htmlAttrToReactProp(name);
      props[propName] = value;
    }
    
    return props;
  }

  /**
   * 🔥 Convert HTML attributes to React props
   */
  htmlAttrToReactProp(htmlAttr) {
    const conversionMap = {
      'class': 'className',
      'for': 'htmlFor',
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'maxlength': 'maxLength',
      'cellpadding': 'cellPadding',
      'cellspacing': 'cellSpacing',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder'
    };
    
    return conversionMap[htmlAttr.toLowerCase()] || htmlAttr;
  }

  /**
   * 🔥 Map HTML tags to component types
   */
  mapHTMLToComponentType(htmlTag) {
    // The canvas renderer (CanvasComponent + ComponentLibraryService.getHTMLTag)
    // expects `component.type` to usually be a real HTML tag name (lowercase),
    // plus a few special aliases like `text-node` and `link`.
    const tag = (htmlTag || 'div').toLowerCase();

    const aliasMap = {
      // Keep common semantic mapping consistent with renderer conventions
      'a': 'link'
    };

    return aliasMap[tag] || tag;
  }

  /**
   * 🔥 Extract CSS styles from props
   */
  extractStyleFromProps(props) {
    const style = {};
    
    // Handle inline styles
    if (props.style) {
      const inlineStyles = this.parseInlineStyles(props.style);
      Object.assign(style, inlineStyles);
    }
    
    // Handle className (convert to Tailwind if possible)
    if (props.className) {
      const tailwindStyles = this.tailwindToCSS(props.className);
      Object.assign(style, tailwindStyles);
    }
    
    return style;
  }

  /**
   * 🔥 Parse inline CSS styles
   */
  parseInlineStyles(styleString) {
    const styles = {};

    if (!styleString) return styles;

    // Supports:
    // 1) HTML: style="color: red; font-size: 12px"
    // 2) React inline object emitted by generator: style={{ width: '24px', height: '24px', color: 'red' }}
    // 3) React JSON-string style in HTML-css generator path: style={{"color":"red"}} or style={"{...}"}

    // If we get a real object (rare via code edits), accept it.
    if (typeof styleString === 'object') {
      return { ...styleString };
    }

    if (typeof styleString !== 'string') return styles;

    const raw = styleString.trim();

    // React: style={{ ... }}
    const reactObjMatch = raw.match(/^\{\{([\s\S]*)\}\}$/);
    if (reactObjMatch) {
      const inner = reactObjMatch[1];
      // Parse `key: value` pairs. Values may be quoted or numbers.
      // This is intentionally tolerant; we avoid eval.
      const pairRegex = /([a-zA-Z_$][\w$]*)\s*:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|(\-?\d+(?:\.\d+)?))(?:\s*,|\s*$)/g;
      let m;
      while ((m = pairRegex.exec(inner)) !== null) {
        const key = m[1];
        const value = m[2] ?? m[3] ?? m[4] ?? m[5];
        if (key) styles[key] = value;
      }
      return styles;
    }

    // HTML: property: value; property2: value2
    const declarations = raw.split(';');
    for (const decl of declarations) {
      const [property, value] = decl.split(':').map(s => s.trim());
      if (property && value) {
        const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelProperty] = value;
      }
    }

    return styles;
  }

  /**
   * 🔥 Convert Tailwind classes to CSS (basic conversion)
   */
  /**
   * Apply CSS text (from the CSS tab in html-css/react-css mode) to a freshly-parsed tree.
   */
  applyCssTextToTree(tree, cssText) {
    const classMap = this.parseCssTextToClassStyleMap(cssText);
    if (!classMap.size) return tree;

    const applyNode = (node) => {
      if (!node || typeof node !== 'object') return;

      const className = node.props?.className;
      if (className && typeof className === 'string') {
        const classes = className.split(/\s+/).map(s => s.trim()).filter(Boolean);
        for (const cn of classes) {
          const cssStyle = classMap.get(cn);
          if (cssStyle) node.style = { ...(node.style || {}), ...cssStyle };
        }
      }

      if (Array.isArray(node.children)) node.children.forEach(applyNode);
    };

    if (Array.isArray(tree)) tree.forEach(applyNode);
    return tree;
  }

  /**
   * Apply CSS text to an existing component tree without changing structure.
   */
  async applyCssTextToExistingComponents(components, cssText) {
    const classMap = this.parseCssTextToClassStyleMap(cssText);
    if (!classMap.size) return components;

    const walk = (node) => {
      if (!node) return node;
      const next = {
        ...node,
        props: { ...(node.props || {}) },
        style: { ...(node.style || {}) },
      };

      const className = next.props.className;
      if (className && typeof className === 'string') {
        const classes = className.split(/\s+/).map(s => s.trim()).filter(Boolean);
        for (const cn of classes) {
          const cssStyle = classMap.get(cn);
          if (cssStyle) next.style = { ...next.style, ...cssStyle };
        }
      }

      if (Array.isArray(node.children) && node.children.length) {
        next.children = node.children.map(walk);
      }

      return next;
    };

    return Array.isArray(components) ? components.map(walk) : components;
  }

  /**
   * Parse CSS rules into a className -> style map (limited but sufficient for our generator output).
   */
  parseCssTextToClassStyleMap(cssText) {
    const map = new Map();
    if (!cssText || typeof cssText !== 'string') return map;

    const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g;

    let m;
    while ((m = ruleRegex.exec(css)) !== null) {
      const selectorText = (m[1] || '').trim();
      const body = (m[2] || '').trim();
      if (!selectorText || !body) continue;

      const declarations = {};
      for (const decl of body.split(';')) {
        const [prop, val] = decl.split(':').map(s => s.trim());
        if (!prop || !val) continue;
        const camel = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        declarations[camel] = val;
      }
      if (!Object.keys(declarations).length) continue;

      const selectors = selectorText.split(',').map(s => s.trim()).filter(Boolean);
      for (const sel of selectors) {
        // ignore pseudos for now
        const base = sel.split(':')[0].trim();
        if (!base.startsWith('.')) continue;

        const classNames = base.split('.').map(s => s.trim()).filter(Boolean);
        for (const cn of classNames) {
          const prev = map.get(cn) || {};
          map.set(cn, { ...prev, ...declarations });
        }
      }
    }

    return map;
  }

  tailwindToCSS(className) {
    const styles = {};
    const classes = className.split(' ');
    
    const responsiveBucket = {};
    classes.forEach(cls => {
      const cssProperty = this.tailwindClassToCSS(cls);
      if (cssProperty) {
        if (cssProperty.__responsive__) {
          Object.entries(cssProperty.__responsive__).forEach(([bp, st]) => {
            responsiveBucket[bp] = { ...(responsiveBucket[bp] || {}), ...st };
          });
        } else {
          Object.assign(styles, cssProperty);
        }
      }
    });
    
    return styles;
  }

  /**
   * 🔥 Convert individual Tailwind class to CSS
   */
  tailwindClassToCSS(twClass) {
    // Basic Tailwind to CSS mapping (expand as needed)
    // Responsive prefix handling (sm:, md:, lg:, xl:)
    const prefixMatch = twClass.match(/^(sm:|md:|lg:|xl:)(.+)$/);
    let target = { styles: {}, responsive: null };
    let baseClass = twClass;
    if (prefixMatch) {
      const bp = prefixMatch[1].replace(':','');
      baseClass = prefixMatch[2];
      target.responsive = bp; // store breakpoint key
    }

    const mappings = {
      // Layout
      'block': { display: 'block' },
      'inline-block': { display: 'inline-block' },
      'inline': { display: 'inline' },
      'flex': { display: 'flex' },
      'grid': { display: 'grid' },
      'hidden': { display: 'none' },
      
      // Flexbox
      'justify-center': { justifyContent: 'center' },
      'justify-between': { justifyContent: 'space-between' },
      'items-center': { alignItems: 'center' },
      'items-start': { alignItems: 'flex-start' },
      
      // Spacing (basic patterns)
      'p-4': { padding: '1rem' },
      'px-4': { paddingLeft: '1rem', paddingRight: '1rem' },
      'py-2': { paddingTop: '0.5rem', paddingBottom: '0.5rem' },
      'm-4': { margin: '1rem' },
      'mx-auto': { marginLeft: 'auto', marginRight: 'auto' },
      
      // Colors (basic)
      'text-white': { color: '#ffffff' },
      'text-black': { color: '#000000' },
      'bg-blue-500': { backgroundColor: '#3b82f6' },
      'bg-red-500': { backgroundColor: '#ef4444' },
      
      // Sizing
      'w-full': { width: '100%' },
      'h-full': { height: '100%' },
      'w-screen': { width: '100vw' },
      'h-screen': { height: '100vh' },
      // Fractions
      'w-1/2': { width: '50%' },
      'w-1/3': { width: '33.3333%' },
      'w-2/3': { width: '66.6667%' },
      'w-1/4': { width: '25%' },
      'w-3/4': { width: '75%' },
      'w-1/5': { width: '20%' },
      'w-2/5': { width: '40%' },
      'w-3/5': { width: '60%' },
      'w-4/5': { width: '80%' },
      'max-w-full': { maxWidth: '100%' },
      
      // Typography
      'text-sm': { fontSize: '0.875rem' },
      'text-lg': { fontSize: '1.125rem' },
      'font-bold': { fontWeight: 'bold' },
      'text-center': { textAlign: 'center' }
    };
    
    const style = mappings[baseClass] || null;
    if (!style) return null;
    if (target.responsive) {
      return { __responsive__: { [target.responsive]: style } };
    }
    return style;
  }

  /**
   * 🔥 Extract text content from element
   */
  extractTextContent(elementMatch) {
    // This is a simplified version - you'd need more sophisticated parsing for nested content
    const { fullMatch } = elementMatch;
    
    // Look for text between tags on the same line
    const textMatch = fullMatch.match(/>([^<]+)</);
    return textMatch ? textMatch[1].trim() : null;
  }

  /**
   * 🔥 Get component ID at cursor position
   */
  getComponentAtCursor(line, column) {
    // Find component whose start<=line<=end
    let found = null;
    for (const [ln, id] of this.elementMap.entries()) {
      if (ln === line) return id;
    }
    // Fallback: nearest lower line
    let nearestLine = -1; let nearestId = null;
    for (const [ln, id] of this.elementMap.entries()) {
      if (ln <= line && ln > nearestLine) {
        nearestLine = ln; nearestId = id;
      }
    }
    return nearestId;
  }

  /**
   * 🔥 Update cursor position and return affected component
   */
  updateCursorPosition(line, column) {
    this.cursorPosition = { line, column };
    return this.getComponentAtCursor(line, column);
  }

  /**
   * 🔥 Detect if element is being deleted
   */
  detectDeletion(oldCode, newCode, cursorLine) {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    
    if (oldLines.length > newLines.length) {
      // Line was deleted
      return {
        type: 'line_deleted',
        lineNumber: cursorLine,
        componentId: this.elementMap.get(cursorLine)
      };
    }
    
    if (oldLines[cursorLine - 1] !== newLines[cursorLine - 1]) {
      // Line was modified - check if it contained an element
      const hadElement = this.findElementsInLine(oldLines[cursorLine - 1] || '', cursorLine).length > 0;
      const hasElement = this.findElementsInLine(newLines[cursorLine - 1] || '', cursorLine).length > 0;
      
      if (hadElement && !hasElement) {
        return {
          type: 'element_deleted',
          lineNumber: cursorLine,
          componentId: this.elementMap.get(cursorLine)
        };
      }
    }
    
    return null;
  }

  /**
   * 🔥 Parse React JSX (similar to HTML but with JSX syntax)
   */
  parseReactJSX(jsxString) {
    // Extract JSX from return statement
    const jsxContent = this.extractParsableContent(jsxString);
    
    // Parse JSX similar to HTML (JSX is very similar to HTML)
    return this.parseHTMLWithTolerance(jsxContent);
  }
}

// Export singleton instance
const reverseCodeParserService = new ReverseCodeParserService();
export default reverseCodeParserService;