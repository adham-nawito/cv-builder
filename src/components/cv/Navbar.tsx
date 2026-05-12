import { useCV } from '@/contexts/CVContext';
import { useI18n } from '../../lib/I18nContext';
import { generateHTML } from '@/utils/generateHTML';
import { parseHTMLToCV } from '@/utils/parseHTML';
import { exportPDF, exportHTML } from '@/utils/exportUtils';
import { exportDOCX } from '@/utils/exportDocx';
import { parseLinkedInPDF } from '@/utils/linkedinParser';
import { SaveLoadManager } from './SaveLoadManager';
import { ExportDialog } from './ExportDialog';
import { useState, useCallback, useRef } from 'react';
import type { CVData, TemplateType } from '@/types/cv';
import { v4 as uuid } from 'uuid';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import {
  FileText, Plus, Layout, Code, Download, Eye, EyeOff, Moon, Sun,
  Undo2, Redo2, Menu, X, ChevronDown, Save, FolderOpen, Upload, Globe, Linkedin
} from 'lucide-react';
import { LOCALES } from '../../lib/translations';

const TEMPLATES: { key: TemplateType; label: string; desc: string; accent: string }[] = [
  { key: 'classic', label: 'Classic', desc: 'Traditional blue headings', accent: '#2563eb' },
  { key: 'modern', label: 'Modern', desc: 'Dark header, clean lines', accent: '#111' },
  { key: 'minimal', label: 'Minimal', desc: 'Understated, elegant', accent: '#888' },
  { key: 'executive', label: 'Executive', desc: 'Gold accents, corporate', accent: '#8b6914' },
  { key: 'creative', label: 'Creative', desc: 'Bold gradients, expressive', accent: '#e11d48' },
];

export function Navbar() {
  const { state, dispatch } = useCV();
  const { t, locale, setLocale, locales } = useI18n();
  const [showExport, setShowExport] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [editableHTML, setEditableHTML] = useState('');
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [exportPending, setExportPending] = useState<'PDF' | 'DOCX' | 'HTML' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);

  const html = generateHTML(state.cv);
  const cvBaseName = state.cv.name || 'cv';

  const handleExportConfirm = async (filename: string) => {
    setExportPending(null);
    setShowExport(false);
    if (filename.endsWith('.pdf')) {
      const el = document.getElementById('cv-canvas-paper');
      if (el) await exportPDF(el, filename);
    } else if (filename.endsWith('.html') || filename.endsWith('.htm')) {
      exportHTML(html, filename);
    } else if (filename.endsWith('.docx')) {
      await exportDOCX(state.cv, filename);
    }
  };

  const handleExportPDF  = () => { setExportPending('PDF');  setShowExport(false); };
  const handleExportHTML = () => { setExportPending('HTML'); setShowExport(false); };
  const handleExportDOCX = () => { setExportPending('DOCX'); setShowExport(false); };

  const handleOpenCode = () => {
    setEditableHTML(html);
    setShowCode(true);
  };

  const handleApplyHTML = () => {
    const newCV = parseHTMLToCV(editableHTML, state.cv);
    dispatch({ type: 'LOAD_CV', payload: newCV });
    setShowCode(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableHTML);
  };

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text) as CVData;
          if (data.sections && data.id) {
            dispatch({ type: 'IMPORT_CV', payload: { ...data, updatedAt: new Date().toISOString() } });
          }
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          const newCV = parseHTMLToCV(text, {
            id: uuid(),
            name: file.name.replace(/\.(html|htm)$/, ''),
            sections: [],
            template: state.cv.template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          dispatch({ type: 'IMPORT_CV', payload: newCV });
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowImport(false);
  }, [dispatch, state.cv.template]);

  const handleLinkedInImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLinkedinLoading(true);
    try {
      const cvData = await parseLinkedInPDF(file);
      dispatch({ type: 'IMPORT_CV', payload: cvData });
    } catch (err) {
      console.error('LinkedIn import failed:', err);
    } finally {
      setLinkedinLoading(false);
      e.target.value = '';
      setShowImport(false);
    }
  }, [dispatch]);

  const saveCVList = () => {
    const list = JSON.parse(localStorage.getItem('cvforge_list') || '[]');
    const existing = list.findIndex((c: any) => c.id === state.cv.id);
    if (existing >= 0) list[existing] = state.cv;
    else list.push(state.cv);
    localStorage.setItem('cvforge_list', JSON.stringify(list));
  };

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".json,.html,.htm" className="hidden" onChange={handleImportFile} />
      <input ref={linkedinInputRef} type="file" accept=".pdf" className="hidden" onChange={handleLinkedInImport} />

      <nav className="h-14 border-b border-border bg-card flex items-center px-4 gap-2 relative z-50">
        <div className="flex items-center gap-2 mr-4">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">CVForge</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <button onClick={() => dispatch({ type: 'NEW_CV' })} className="toolbar-btn">
            <Plus className="w-4 h-4" /> {t('nav.new')}
          </button>

          {/* Templates dropdown */}
          <div className="relative">
            <button onClick={() => { setShowTemplates(!showTemplates); setShowExport(false); setShowLanguage(false); setShowImport(false); }} className="toolbar-btn">
              <Layout className="w-4 h-4" /> {t('nav.templates')} <ChevronDown className="w-3 h-3" />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[240px] animate-fade-in">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.key} onClick={() => { dispatch({ type: 'SET_TEMPLATE', payload: tpl.key }); setShowTemplates(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-3 ${state.cv.template === tpl.key ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'}`}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: tpl.accent }} />
                    <span>
                      <span className="font-medium block">{tpl.label}</span>
                      <span className="block text-xs text-muted-foreground">{tpl.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleOpenCode} className="toolbar-btn">
            <Code className="w-4 h-4" /> {t('nav.editHtml')}
          </button>

          {/* Import dropdown */}
          <div className="relative">
            <button onClick={() => { setShowImport(!showImport); setShowExport(false); setShowTemplates(false); setShowLanguage(false); }} className="toolbar-btn">
              <Upload className="w-4 h-4" /> {t('nav.import')} <ChevronDown className="w-3 h-3" />
            </button>
            {showImport && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px] animate-fade-in">
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" /> {t('nav.importFile')}
                </button>
                <button onClick={() => linkedinInputRef.current?.click()} disabled={linkedinLoading}
                  className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted flex items-center gap-2 disabled:opacity-50">
                  <Linkedin className="w-3.5 h-3.5" /> {linkedinLoading ? t('linkedin.parsing') : t('nav.importLinkedin')}
                </button>
              </div>
            )}
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button onClick={() => { setShowExport(!showExport); setShowTemplates(false); setShowLanguage(false); setShowImport(false); }} className="toolbar-btn">
              <Download className="w-4 h-4" /> {t('nav.export')} <ChevronDown className="w-3 h-3" />
            </button>
            {showExport && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] animate-fade-in">
                <button onClick={handleExportPDF} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">{t('nav.exportPdf')}</button>
                <button onClick={handleExportHTML} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">{t('nav.exportHtml')}</button>
                <button onClick={handleExportDOCX} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">{t('nav.exportDocx')}</button>
              </div>
            )}
          </div>

          <button onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })} className="toolbar-btn">
            {state.isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {state.isPreviewMode ? t('nav.edit') : t('nav.preview')}
          </button>

          <button onClick={saveCVList} className="toolbar-btn">
            <Save className="w-4 h-4" /> {t('nav.save')}
          </button>

          <button onClick={() => setShowManager(true)} className="toolbar-btn">
            <FolderOpen className="w-4 h-4" /> {t('nav.manage')}
          </button>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {/* Language picker */}
          <div className="relative">
            <button onClick={() => { setShowLanguage(!showLanguage); setShowExport(false); setShowTemplates(false); setShowImport(false); }} className="toolbar-btn">
              <Globe className="w-4 h-4" />
              <span className="text-xs">{currentLocale?.nativeLabel}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLanguage && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[180px] animate-fade-in">
                {LOCALES.map(l => (
                  <button key={l.code} onClick={() => { setLocale(l.code); setShowLanguage(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${locale === l.code ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'}`}>
                    <span>{l.nativeLabel}</span>
                    <span className="text-xs text-muted-foreground">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => dispatch({ type: 'UNDO' })} className="toolbar-btn" title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'REDO' })} className="toolbar-btn" title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} className="toolbar-btn">
            {state.isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden ml-auto toolbar-btn">
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-card border-b border-border shadow-lg z-40 p-3 flex flex-wrap gap-2 animate-fade-in">
          <button onClick={() => { dispatch({ type: 'NEW_CV' }); setMobileMenu(false); }} className="toolbar-btn"><Plus className="w-4 h-4" /> {t('nav.new')}</button>
          <button onClick={() => { handleOpenCode(); setMobileMenu(false); }} className="toolbar-btn"><Code className="w-4 h-4" /> HTML</button>
          <button onClick={() => { fileInputRef.current?.click(); setMobileMenu(false); }} className="toolbar-btn"><Upload className="w-4 h-4" /> {t('nav.import')}</button>
          <button onClick={() => { linkedinInputRef.current?.click(); setMobileMenu(false); }} className="toolbar-btn"><Linkedin className="w-4 h-4" /> LinkedIn</button>
          <button onClick={() => { handleExportPDF(); setMobileMenu(false); }} className="toolbar-btn"><Download className="w-4 h-4" /> PDF</button>
          <button onClick={() => { handleExportDOCX(); setMobileMenu(false); }} className="toolbar-btn"><Download className="w-4 h-4" /> DOCX</button>
          <button onClick={() => { setShowManager(true); setMobileMenu(false); }} className="toolbar-btn"><FolderOpen className="w-4 h-4" /> {t('nav.manage')}</button>
          <button onClick={() => { dispatch({ type: 'TOGGLE_PREVIEW' }); setMobileMenu(false); }} className="toolbar-btn">
            <Eye className="w-4 h-4" /> {state.isPreviewMode ? t('nav.edit') : t('nav.preview')}
          </button>
          <button onClick={() => dispatch({ type: 'UNDO' })} className="toolbar-btn"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => dispatch({ type: 'REDO' })} className="toolbar-btn"><Redo2 className="w-4 h-4" /></button>
          <button onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} className="toolbar-btn">
            {state.isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Language switcher in mobile */}
          <div className="w-full border-t border-border pt-2 mt-1 flex flex-wrap gap-1">
            {LOCALES.map(l => (
              <button key={l.code} onClick={() => { setLocale(l.code); setMobileMenu(false); }}
                className={`px-2 py-1 rounded text-xs ${locale === l.code ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}>
                {l.nativeLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HTML Editor Modal */}
      {showCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setShowCode(false)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-lg">{t('html.title')}</h2>
              <div className="flex gap-2">
                <button onClick={handleCopyCode} className="toolbar-btn text-sm">{t('html.copy')}</button>
                <button onClick={handleApplyHTML} className="toolbar-btn-primary text-sm">{t('html.apply')}</button>
                <button onClick={() => setShowCode(false)} className="toolbar-btn"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <CodeMirror
                value={editableHTML}
                onChange={setEditableHTML}
                extensions={[htmlLang()]}
                height="500px"
                theme="dark"
                className="rounded-lg overflow-hidden text-sm"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  autocompletion: true,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <SaveLoadManager open={showManager} onClose={() => setShowManager(false)} />

      {exportPending && (
        <ExportDialog
          format={exportPending}
          defaultName={cvBaseName}
          onConfirm={handleExportConfirm}
          onCancel={() => setExportPending(null)}
        />
      )}
    </>
  );
}
