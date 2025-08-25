import { useState, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import { 
  Globe,
  FileText,
  Layers,
  Zap,
  Mail,
  BarChart3,
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  EyeOff,
  Loader2,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Framework logos as SVG components
const TailwindLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C7.666,17.818,9.027,19.2,12.001,19.2c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C14.337,13.382,12.976,12,6.001,12z"/>
  </svg>
);

const CssLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M5.902 3.731L4.387 20.568L11.996 22.5L19.613 20.568L18.098 3.731H5.902ZM16.126 8.316H8.47L8.688 10.682H15.908L15.253 17.588L12 18.521L8.747 17.588L8.526 14.789H10.674L10.785 16.128L12 16.447L13.215 16.128L13.355 14.447H8.447L7.974 9.105H16.02L16.126 8.316Z"/>
  </svg>
);

const PROJECT_TYPES = [
  {
    id: 'website',
    name: 'Website',
    description: 'Multi-page website with navigation',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'landing_page',
    name: 'Landing Page',
    description: 'Single page marketing experience',
    icon: FileText,
    gradient: 'from-emerald-500 to-green-400'
  },
  {
    id: 'component_library',
    name: 'Design System',
    description: 'Reusable component collection',
    icon: Layers,
    gradient: 'from-purple-500 to-violet-400'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Data-driven interface',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-blue-400'
  },
  {
    id: 'email_template',
    name: 'Email',
    description: 'Responsive email template',
    icon: Mail,
    gradient: 'from-rose-500 to-pink-400'
  }
];

const CSS_FRAMEWORKS = [
  { 
    id: 'tailwind', 
    name: 'Tailwind CSS', 
    logo: TailwindLogo, 
    color: 'text-cyan-500',
    description: 'Utility-first CSS framework'
  },
  { 
    id: 'vanilla', 
    name: 'Vanilla CSS', 
    logo: CssLogo, 
    color: 'text-blue-500',
    description: 'Pure CSS with full control'
  }
];

const VIEWPORT_PRESETS = [
  { name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { name: 'Mobile', width: 375, height: 812, icon: Smartphone },
];

export default function NewProjectModal({ show, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    type: 'website',
    viewport_width: 1440,
    viewport_height: 900,
    css_framework: 'tailwind',
    is_public: false
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    post('/api/projects', {
      onSuccess: (response) => {
        handleClose();
        // Redirect to editor
        const projectId = response.props?.flash?.data?.id || response.data?.id;
        if (projectId) {
          window.location.href = `/void/editor/${projectId}`;
        }
      },
      onError: (errors) => {
        console.error('Project creation failed:', errors);
      }
    });
  }, [data, post, handleClose]);

  const selectViewportPreset = useCallback((preset) => {
    setData(prev => ({
      ...prev,
      viewport_width: preset.width,
      viewport_height: preset.height
    }));
  }, [setData]);

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.1,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--color-bg)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="relative px-8 py-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--color-text)]">
                      Create New Project
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Start building your next masterpiece
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={processing}
                  className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Project Name & Description */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="My Awesome Project"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Brief description..."
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Project Type */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-medium text-[var(--color-text)]">Project Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROJECT_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = data.type === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => setData('type', type.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.gradient} flex items-center justify-center mb-4`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-[var(--color-text)] mb-2">
                            {type.name}
                          </h4>
                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            {type.description}
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                            >
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Configuration Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* CSS Framework */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[var(--color-text)]">CSS Framework</h3>
                    <div className="space-y-3">
                      {CSS_FRAMEWORKS.map((framework) => {
                        const LogoComponent = framework.logo;
                        const isSelected = data.css_framework === framework.id;
                        return (
                          <motion.button
                            key={framework.id}
                            type="button"
                            onClick={() => setData('css_framework', framework.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                              isSelected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center ${framework.color}`}>
                              <LogoComponent />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-[var(--color-text)]">{framework.name}</div>
                              <div className="text-sm text-[var(--color-text-muted)]">{framework.description}</div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Default Canvas Size */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[var(--color-text)]">Default Canvas Size</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {VIEWPORT_PRESETS.map((preset) => {
                        const IconComponent = preset.icon;
                        const isSelected = data.viewport_width === preset.width && data.viewport_height === preset.height;
                        return (
                          <motion.button
                            key={preset.name}
                            type="button"
                            onClick={() => selectViewportPreset(preset)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                              isSelected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                            }`}
                          >
                            <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                              isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                            }`} />
                            <div className="text-xs font-medium text-[var(--color-text)]">{preset.name}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">
                              {preset.width}×{preset.height}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {/* Custom Dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                          Width
                        </label>
                        <input
                          type="number"
                          value={data.viewport_width}
                          onChange={(e) => setData('viewport_width', parseInt(e.target.value) || 1440)}
                          min="320"
                          max="3840"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          value={data.viewport_height}
                          onChange={(e) => setData('viewport_height', parseInt(e.target.value) || 900)}
                          min="240"
                          max="2160"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Privacy Toggle */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-medium text-[var(--color-text)]">Privacy</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3">
                      {data.is_public ? (
                        <Eye className="w-5 h-5 text-[var(--color-primary)]" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-[var(--color-text-muted)]" />
                      )}
                      <div>
                        <div className="font-medium text-[var(--color-text)]">
                          {data.is_public ? 'Public Project' : 'Private Project'}
                        </div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                          {data.is_public 
                            ? 'Visible to everyone and can be used as template' 
                            : 'Only accessible by you'
                          }
                        </div>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setData('is_public', !data.is_public)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        data.is_public ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)]'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        layout
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          data.is_public ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                variants={itemVariants}
                className="flex justify-end pt-8 border-t border-[var(--color-border)] mt-8"
              >
                <motion.button
                  type="submit"
                  disabled={!data.name || processing}
                  whileHover={{ scale: processing ? 1 : 1.02 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}