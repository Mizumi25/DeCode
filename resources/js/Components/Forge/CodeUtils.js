// @/Components/Forge/CodeUtils.js
import { tooltipDatabase } from './TooltipDatabase';

// Format code with proper indentation
export const formatCode = (code, language) => {
  if (!code) return ''
  
  // Simple code formatter
  let formatted = code
  let indentLevel = 0
  const lines = formatted.split('\n')
  const formattedLines = []
  
  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      formattedLines.push('')
      continue
    }
    
    // Decrease indent for closing tags/brackets
    if (trimmed.startsWith('</') || trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    // Add indentation
    const indent = '  '.repeat(indentLevel)
    formattedLines.push(indent + trimmed)
    
    // Increase indent for opening tags/brackets
    if (trimmed.includes('<') && !trimmed.includes('</') && !trimmed.endsWith('/>') ||
        trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indentLevel++
    }
  }
  
  return formattedLines.join('\n')
}

// Syntax highlighting function - Enhanced
export const highlightCode = (code, language) => {
  if (!code) return ''
  
  let highlighted = formatCode(code, language)
  
  if (language === 'react' || language === 'jsx') {
    // Keywords
    highlighted = highlighted.replace(
      /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|useState|useEffect|useCallback|React)\b/g,
      '<span class="code-keyword" data-token="$1">$1</span>'
    )
    
    // Strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="code-string" data-token="string">$1$2$1</span>'
    )
    
    // Comments
    highlighted = highlighted.replace(
      /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
      '<span class="code-comment">$&</span>'
    )
    
    // JSX tags
    highlighted = highlighted.replace(
      /(<\/?)([\w.-]+)/g,
      '$1<span class="code-tag" data-token="$2">$2</span>'
    )
    
    // JSX attributes
    highlighted = highlighted.replace(
      /\s([\w-]+)(=)/g,
      ' <span class="code-attr" data-token="$1">$1</span>$2'
    )
    
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="code-number">$1</span>'
    )
    
    // Functions
    highlighted = highlighted.replace(
      /\b(\w+)(?=\s*\()/g,
      '<span class="code-function" data-token="$1">$1</span>'
    )
  } else if (language === 'css') {
    // Properties
    highlighted = highlighted.replace(
      /([a-zA-Z-]+)(\s*:)/g,
      '<span class="code-property" data-token="$1">$1</span>$2'
    )
    
    // Values
    highlighted = highlighted.replace(
      /(:\s*)([^;]+)(;?)/g,
      '$1<span class="code-value">$2</span>$3'
    )
    
    // Selectors
    highlighted = highlighted.replace(
      /^([.#]?[\w-]+)(?=\s*{)/gm,
      '<span class="code-selector">$1</span>'
    )
    
    // Comments
    highlighted = highlighted.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="code-comment">$&</span>'
    )
  } else if (language === 'html') {
    // Tags
    highlighted = highlighted.replace(
      /(<\/?)([\w.-]+)/g,
      '$1<span class="code-tag" data-token="$2">$2</span>'
    )
    
    // Attributes
    highlighted = highlighted.replace(
      /\s([\w-]+)(=)/g,
      ' <span class="code-attr" data-token="$1">$1</span>$2'
    )
    
    // Attribute values
    highlighted = highlighted.replace(
      /(=)(["'])((?:\\.|(?!\2)[^\\])*?)\2/g,
      '$1$2<span class="code-string">$3</span>$2'
    )
  } else if (language === 'tailwind') {
    // Highlight Tailwind classes
    highlighted = highlighted.replace(
      /\b([\w-]+)(?=\s|$)/g,
      (match) => {
        const tooltip = tooltipDatabase[match]
        if (tooltip) {
          return `<span class="code-tailwind ${tooltip.type}" data-token="${match}">${match}</span>`
        }
        return match
      }
    )
  }
  
  return highlighted
}

// Parse code to update components (bidirectional editing)
export const parseCodeAndUpdateComponents = (code, type, setCanvasComponents) => {
  if (type === 'react') {
    try {
      // Simple regex to extract button components and their positions
      const buttonRegex = /<div[^>]*style={{[^}]*left:\s*'(\d+)px'[^}]*top:\s*'(\d+)px'[^}]*}}>\s*<button[^>]*>\s*([^<]+)\s*<\/button>/g
      const matches = []
      let match
      
      while ((match = buttonRegex.exec(code)) !== null) {
        matches.push({
          x: parseInt(match[1]),
          y: parseInt(match[2]),
          text: match[3].trim()
        })
      }
      
      // Update components based on parsed data
      const newComponents = matches.map((match, index) => ({
        id: `button_${Date.now()}_${index}`,
        type: 'button',
        props: {
          text: match.text,
          variant: 'primary',
          size: 'md',
          className: ''
        },
        position: { x: match.x, y: match.y },
        name: 'Button'
      }))
      
      setCanvasComponents(newComponents)
    } catch (error) {
      console.error('Error parsing React code:', error)
    }
  }
}