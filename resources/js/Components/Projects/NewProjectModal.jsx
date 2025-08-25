import { useState, useCallback, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Layout, 
  Mail, 
  BarChart3, 
  Palette,
  Globe,
  FileText,
  Zap,
  Layers,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

const PROJECT_TYPES = [
  {
    id: 'website',
    name: 'Website',
    description: 'Full website with multiple pages',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'landing_page',
    name: 'Landing Page',
    description: 'Single page marketing site',
    icon: FileText,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'component_library',
    name: 'Component Library',
    description: 'Reusable UI components',
    icon: Layers,
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'prototype',
    name: 'Prototype',
    description: 'Interactive prototype',
    icon: Zap,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'email_template',
    name: 'Email Template',
    description: 'Responsive email design',
    icon: Mail,
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Data visualization interface',
    icon: BarChart3,
    color: 'from-indigo-500 to-blue-500'
  }
];

const VIEWPORT_PRESETS = [
  { name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { name: 'Mobile', width: 375, height: 667, icon: Smartphone },
];

const CSS_FRAMEWORKS = [
  { id: 'tailwind', name: 'Tailwind CSS', color: 'bg-cyan-500' },
  { id: 'bootstrap', name: 'Bootstrap', color: 'bg-purple-600' },
  { id: 'vanilla', name: 'Vanilla CSS', color: 'bg-yellow-500' },
  { id: 'styled_components', name: 'Styled Components', color: 'bg-pink-500' },
  { id: 'emotion', name: 'Emotion', color: 'bg-red-500' },
];

export default function NewProjectModal({ show, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    type: 'website',
    viewport_width: 1440,
    viewport_height: 900,
    css_framework: 'tailwind',
    is_public: false,
    template_id: null
  });

  const handleClose = useCallback(() => {
    setStep(1);
    setSelectedTemplate(null);
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const submitData = { ...data };
    if (selectedTemplate) {
      submitData.template_id = selectedTemplate.id;
    }

    post('/api/projects', {
      onSuccess: (response) => {
        const project = response.props.flash?.data || response.data;
        handleClose();
        
        // Redirect to editor
        if (project?.id) {
          window.location.href = `/void/editor/${project.id}`;
        }
      },
      onError: (errors) => {
        console.error('Project creation failed:', errors);
      }
    });
  }, [data, selectedTemplate, post, handleClose]);

  const loadTemplates = useCallback(async () => {
    if (templates.length > 0) return;
    
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/projects/templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [templates.length]);

  const nextStep = useCallback(() => {
    if (step === 2) {
      loadTemplates();
    }
    setStep(prev => Math.min(prev + 1, 3));
  }, [step, loadTemplates]);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const selectViewportPreset = useCallback((preset) => {
    setData(prev => ({
      ...prev,
      viewport_width: preset.width,
      viewport_height: preset.height
    }));
  }, [setData]);

  const getSelectedProjectType = useCallback(() => {
    return PROJECT_TYPES.find(type => type.id === data.type);
  }, [data.type]);

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="Create New Project"
      maxWidth="4xl"
      closeable={!processing}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                stepNumber <= step 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 mx-2 transition-colors ${
                  stepNumber < step 
                    ? 'bg-[var(--color-primary)]' 
                    : 'bg-[var(--color-border)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Project Details</h3>
              <p className="text-[var(--color-text-muted)] mt-2">Let's start with the basics</p>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Brief description of your project..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-colors"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Project Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Project Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROJECT_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setData('type', type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left group hover:shadow-lg ${
                        data.type === type.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {type.name}
                      </h4>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-red-500">{errors.type}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Project Configuration</h3>
              <p className="text-[var(--color-text-muted)] mt-2">Set up your project preferences</p>
            </div>

            {/* Viewport Settings */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Canvas Size
              </label>
              
              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {VIEWPORT_PRESETS.map((preset) => {
                  const IconComponent = preset.icon;
                  const isSelected = data.viewport_width === preset.width && data.viewport_height === preset.height;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => selectViewportPreset(preset)}
                      className={`p-4 rounded-lg border-2 transition-all text-center group ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <IconComponent 
                        size={24} 
                        className={`mx-auto mb-2 transition-colors ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                        }`} 
                      />
                      <div className="text-sm font-medium text-[var(--color-text)]">{preset.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={data.viewport_width}
                    onChange={(e) => setData('viewport_width', parseInt(e.target.value) || 1440)}
                    min="320"
                    max="3840"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={data.viewport_height}
                    onChange={(e) => setData('viewport_height', parseInt(e.target.value) || 900)}
                    min="240"
                    max="2160"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>
              {(errors.viewport_width || errors.viewport_height) && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.viewport_width || errors.viewport_height}
                </p>
              )}
            </div>

            {/* CSS Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                CSS Framework
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CSS_FRAMEWORKS.map((framework) => (
                  <button
                    key={framework.id}
                    type="button"
                    onClick={() => setData('css_framework', framework.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center group ${
                      data.css_framework === framework.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded mx-auto mb-2 ${framework.color}`}></div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {framework.name}
                    </div>
                  </button>
                ))}
              </div>
              {errors.css_framework && (
                <p className="mt-2 text-sm text-red-500">{errors.css_framework}</p>
              )}
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Privacy Settings
              </label>
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center space-x-3">
                  {data.is_public ? (
                    <Eye size={20} className="text-[var(--color-primary)]" />
                  ) : (
                    <EyeOff size={20} className="text-[var(--color-text-muted)]" />
                  )}
                  <div>
                    <div className="font-medium text-[var(--color-text)]">
                      {data.is_public ? 'Public Project' : 'Private Project'}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {data.is_public 
                        ? 'Anyone can view and use as template' 
                        : 'Only you can access this project'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setData('is_public', !data.is_public)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    data.is_public ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      data.is_public ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Templates */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Choose a Template</h3>
              <p className="text-[var(--color-text-muted)] mt-2">Start from scratch or use a template</p>
            </div>

            {/* Start from scratch option */}
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left group hover:shadow-lg ${
                selectedTemplate === null
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                  <Layout size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    Start from Scratch
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Begin with a blank canvas and build your {getSelectedProjectType()?.name.toLowerCase()}
                  </p>
                </div>
                {selectedTemplate === null && (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </button>

            {/* Templates */}
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                <span className="ml-3 text-[var(--color-text-muted)]">Loading templates...</span>
              </div>
            ) : (
              <>
                {templates.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
                      Public Templates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 rounded-lg border-2 transition-all text-left group hover:shadow-lg ${
                            selectedTemplate?.id === template.id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                          }`}
                        >
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            {template.thumbnail ? (
                              <img 
                                src={template.thumbnail} 
                                alt={template.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Palette size={24} className="text-gray-400" />
                            )}
                          </div>
                          <h5 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                            {template.name}
                          </h5>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            by {template.user.name}
                          </p>
                          {selectedTemplate?.id === template.id && (
                            <div className="mt-2 flex justify-end">
                              <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {templates.length === 0 && !loadingTemplates && (
                  <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No public templates available for this project type yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || processing}
            className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!data.name || processing}
                className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!data.name || processing}
                className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                <span>{processing ? 'Creating...' : 'Create Project'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary in final step */}
        {step === 3 && (
          <div className="bg-[var(--color-bg-muted)] rounded-lg p-4 mt-6">
            <h5 className="font-medium text-[var(--color-text)] mb-3">Project Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--color-text-muted)]">Name:</span>
                <span className="ml-2 text-[var(--color-text)]">{data.name}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Type:</span>
                <span className="ml-2 text-[var(--color-text)]">{getSelectedProjectType()?.name}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Canvas:</span>
                <span className="ml-2 text-[var(--color-text)]">{data.viewport_width} × {data.viewport_height}px</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Framework:</span>
                <span className="ml-2 text-[var(--color-text)]">
                  {CSS_FRAMEWORKS.find(f => f.id === data.css_framework)?.name}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Template:</span>
                <span className="ml-2 text-[var(--color-text)]">
                  {selectedTemplate ? selectedTemplate.name : 'Blank Canvas'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Privacy:</span>
                <span className="ml-2 text-[var(--color-text)]">
                  {data.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}