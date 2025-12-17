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
  parseCodeToComponents(code, language = 'html') {
    this.currentCode = code;
    this.elementMap.clear();
    
    try {
      if (language === 'html' || language === 'jsx') {
        return this.parseHTML(code);
      } else if (language === 'react' || language === 'javascript') {
        return this.parseReactJSX(code);
      }
    } catch (error) {
      console.warn('🔍 Parsing incomplete/invalid code:', error.message);
      return this.parseIncompleteHTML(code);
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
  tokenizeHTML(content) {
    const tokens = [];
    const lines = content.split('\n');
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>?/g; // tolerate missing '>'

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      let match;
      while ((match = tagRegex.exec(line)) !== null) {
        const full = match[0];
        const name = match[1];
        const attrs = (match[2] || '').trim();
        const isClose = full.startsWith('</');
        const isSelf = /\/>\s*$/.test(full) || /\s\/\s*$/.test(full);
        const closed = />\s*$/.test(full) || isSelf; // has closing angle bracket
        tokens.push({
          type: isClose ? 'close' : (isSelf ? 'self' : 'open'),
          tag: name,
          attrs,
          raw: full,
          line: li + 1,
          col: match.index + 1,
          closed
        });
      }
    }
    return tokens;
  }

  // Build nested tree from tokens (tolerant)
  buildTreeFromTokens(tokens) {
    const roots = [];
    const stack = [];
    const flat = [];
    const lineMap = new Map();
    let idCounter = 1;

    const newNode = (tag, attrs, line, closed, self) => {
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

    for (const tok of tokens) {
      if (tok.type === 'open') {
        const node = newNode(tok.tag, tok.attrs, tok.line, tok.closed, false);
        // Attach to parent if any, else root
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          roots.push(node);
        }
        // Push even if not closed angle; tolerate incomplete open
        stack.push(node);
        if (!tok.closed) {
          node.metadata.isComplete = false;
        }
      } else if (tok.type === 'self') {
        const node = newNode(tok.tag, tok.attrs, tok.line, true, true);
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          roots.push(node);
        }
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
    const tagMap = {
      'div': 'Container',
      'span': 'Container', 
      'section': 'Container',
      'article': 'Container',
      'header': 'Container',
      'footer': 'Container',
      'main': 'Container',
      'aside': 'Container',
      'nav': 'Container',
      'button': 'Button',
      'a': 'Link',
      'p': 'Text',
      'h1': 'Heading',
      'h2': 'Heading', 
      'h3': 'Heading',
      'h4': 'Heading',
      'h5': 'Heading',
      'h6': 'Heading',
      'input': 'Input',
      'textarea': 'TextArea',
      'select': 'Select',
      'img': 'Image',
      'video': 'Video',
      'audio': 'Audio',
      'canvas': 'Canvas',
      'svg': 'SVG',
      'ul': 'List',
      'ol': 'List',
      'li': 'ListItem',
      'table': 'Table',
      'tr': 'TableRow',
      'td': 'TableCell',
      'th': 'TableHeader',
      'form': 'Form',
      'label': 'Label'
    };
    
    return tagMap[htmlTag.toLowerCase()] || 'Container';
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
    
    if (typeof styleString !== 'string') return styles;
    
    const declarations = styleString.split(';');
    declarations.forEach(decl => {
      const [property, value] = decl.split(':').map(s => s.trim());
      if (property && value) {
        // Convert CSS property to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelProperty] = value;
      }
    });
    
    return styles;
  }

  /**
   * 🔥 Convert Tailwind classes to CSS (basic conversion)
   */
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
      'max-w-full': { maxWidth: '100%' }
      
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