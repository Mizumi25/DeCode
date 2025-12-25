import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Code2, Settings, X, File, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import componentLibraryService from '@/Services/ComponentLibraryService';
import reverseCodeParserService from '@/Services/ReverseCodeParserService';

/**
 * SourcePage: show ONLY the project-selected main snippet (HTML or React)
 * and allow reverse parsing back to canvas components.
 */
export default function FrameMainSnippetPanel({
  project,
  frame,
  frameComponents,
  onUpdateComponents,
  canEdit = true,
  // File editor mode
  openTabs = [],
  activeTab = '__main__',
  onTabChange,
  onTabClose,
  activeFile = null,
  onFileContentChange,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const framework = project?.output_format || 'html'; // 'html' | 'react'
  const styleFramework = project?.style_framework || 'css'; // 'css' | 'tailwind'
  const codeStyle = `${framework}-${styleFramework}`;

  const mainTab = framework === 'html' ? 'html' : 'react';
  const mainLanguage = mainTab === 'html' ? 'html' : 'javascript';

  const getFileIcon = useCallback((fileName, extension) => {
    const iconMap = {
      jsx: { icon: Code2, color: '#61dafb' },
      js: { icon: Code2, color: '#f7df1e' },
      html: { icon: Code2, color: '#e34c26' },
      css: { icon: FileText, color: '#264de4' },
      json: { icon: Settings, color: '#e8bf6a' },
    };

    if (fileName === 'package.json') return { icon: Settings, color: '#e8bf6a' };
    if (fileName?.includes('vite.config')) return { icon: Settings, color: '#646cff' };
    if (fileName?.includes('tailwind.config')) return { icon: FileText, color: '#38bdf8' };

    return iconMap[extension] || { icon: File, color: 'var(--color-text-muted)' };
  }, []);

  const getLanguageFromExtension = useCallback((ext) => {
    const langMap = {
      jsx: 'javascript',
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
    };
    return langMap[ext] || 'javascript';
  }, []);

  const isMainTabActive = activeTab === '__main__';
  const fileLanguage = activeFile?.extension ? getLanguageFromExtension(activeFile.extension) : 'javascript';
  const fileTitle = activeFile?.name || 'Select a file';
  const filePath = activeFile?.path || '';

  const editorRef = useRef(null);
  const [code, setCode] = useState('');
  const [dirty, setDirty] = useState(false);

  const frameName = frame?.name || 'Frame';

  const generateMainSnippet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure component definitions are loaded (required for codegen)
      if (componentLibraryService?.componentDefinitions?.size === 0) {
        await componentLibraryService.loadComponents();
      }

      const generated = await componentLibraryService.clientSideCodeGeneration(
        frameComponents || [],
        codeStyle,
        frameName
      );

      const next = generated?.[mainTab] || '';
      setCode(next);
      setDirty(false);

      // Keep editor in sync if mounted
      if (editorRef.current) {
        editorRef.current.setValue(next);
      }
    } catch (e) {
      console.error('FrameMainSnippetPanel: failed to generate code', e);
      setError(e?.message || 'Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  }, [codeStyle, frameComponents, frameName, mainTab]);

  // Generate snippet on mount and when components change (but don’t overwrite user edits)
  useEffect(() => {
    if (!dirty) {
      generateMainSnippet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameComponents]);

  const frameworkLabel = useMemo(() => {
    const fw = framework === 'html' ? 'HTML' : 'React';
    const sf = styleFramework === 'tailwind' ? 'Tailwind' : 'CSS';
    return `${fw} + ${sf}`;
  }, [framework, styleFramework]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code || '');
    } catch (e) {
      console.warn('Copy failed', e);
    }
  }, [code]);

  const handleCopyFile = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeFile?.content || '');
    } catch (e) {
      console.warn('Copy failed', e);
    }
  }, [activeFile?.content]);

  const handleApplyReverseParse = useCallback(async () => {
    if (!canEdit) return;

    setIsLoading(true);
    setError(null);

    try {
      const parsedComponents = await reverseCodeParserService.parseCodeToComponents(
        code || '',
        mainTab,
        codeStyle
      );

      if (!parsedComponents || parsedComponents.length === 0) {
        throw new Error('No valid components found in the code');
      }

      await onUpdateComponents(parsedComponents);
      setDirty(false);
    } catch (e) {
      console.error('FrameMainSnippetPanel: reverse parse failed', e);
      setError(e?.message || 'Failed to reverse parse');
    } finally {
      setIsLoading(false);
    }
  }, [canEdit, code, codeStyle, mainTab, onUpdateComponents]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Tabs strip: Main + opened files */}
      <div
        className="flex items-center gap-1 px-2 py-2 border-b overflow-x-auto"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)',
        }}
      >
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('__main__')}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors"
          style={{
            borderColor: isMainTabActive ? 'var(--color-primary)' : 'transparent',
            backgroundColor: isMainTabActive ? 'var(--color-surface)' : 'transparent',
          }}
          title="Main Snippet"
        >
          <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
          <span
            className="text-sm"
            style={{ color: isMainTabActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
          >
            Main
          </span>
        </button>

        {openTabs.length === 0 ? null :
          openTabs.map((tab) => {
            const isActive = tab.path === activeTab;
            const tabIcon = getFileIcon(tab.name, tab.extension);
            const TabIcon = tabIcon.icon;

            return (
              <button
                key={tab.path}
                onClick={() => onTabChange && onTabChange(tab.path)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors max-w-[260px]"
                style={{
                  borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                  backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                }}
                title={tab.path}
              >
                <TabIcon size={14} style={{ color: tabIcon.color }} />
                <span
                  className="truncate text-sm"
                  style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                >
                  {tab.name}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose && onTabClose(tab.path);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                </span>
              </button>
            );
          })
        }
      </div>

      {/* Header bar (contextual) */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div className="min-w-0">
          {isMainTabActive ? (
            <>
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                Main Snippet
              </div>
              <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                {frameworkLabel} • {frameName}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {fileTitle}
              </div>
              <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                {filePath}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {error && isMainTabActive && (
            <div className="text-[11px]" style={{ color: 'var(--color-danger, #ef4444)' }}>
              {error}
            </div>
          )}

          {isMainTabActive ? (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 text-xs rounded border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Copy
              </button>

              <button
                type="button"
                onClick={generateMainSnippet}
                disabled={isLoading}
                className="px-2 py-1 text-xs rounded border"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Regenerate
              </button>

              <button
                type="button"
                onClick={handleApplyReverseParse}
                disabled={isLoading || !canEdit}
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: canEdit ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: canEdit ? 'white' : 'var(--color-text-muted)',
                  opacity: isLoading ? 0.6 : 1,
                }}
                title={canEdit ? 'Parse code back into visual components' : 'Read-only'}
              >
                Apply (Reverse)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCopyFile}
                disabled={!activeFile}
                className="px-2 py-1 text-xs rounded border"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  opacity: activeFile ? 1 : 0.6,
                }}
              >
                Copy
              </button>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {activeFile ? fileLanguage : 'No file selected'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 min-h-0">
        {isMainTabActive ? (
          <Editor
            height="100%"
            width="100%"
            language={mainLanguage}
            value={code}
            theme="vs-dark"
            options={{
              fontSize: 12,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              readOnly: !canEdit,
            }}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            onChange={(val) => {
              setCode(val || '');
              setDirty(true);
            }}
          />
        ) : (
          <Editor
            height="100%"
            width="100%"
            language={fileLanguage}
            value={activeFile?.content || ''}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: true },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              readOnly: !canEdit,
              automaticLayout: true,
            }}
            onChange={(val) => {
              if (!activeFile?.path) return;
              onFileContentChange && onFileContentChange(activeFile.path, val || '');
            }}
          />
        )}
      </div>
    </div>
  );
}
