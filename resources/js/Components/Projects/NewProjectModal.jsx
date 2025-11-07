import { useState, useCallback, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import RepositoryList from './RepositoryList';
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
  X,
  ArrowRight,
  Sparkles,
  Plus,
  Github,
  LogOut,
  Building,
  Users,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubService } from '@/Services/GithubService';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import axios from 'axios';

// Custom Loading Spinner Component
const LoadingSpinner = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// GitHub Icon Component
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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



export default function NewProjectModal({ show, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [isImporting, setIsImporting] = useState(false);


  // Get current workspace from store
  const { currentWorkspace, workspaces } = useWorkspaceStore();

  // Regular project form - Include workspace_id from current workspace
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    type: 'website',
    viewport_width: 1440,
    viewport_height: 900,
    css_framework: 'tailwind',
    is_public: false,
    workspace_id: currentWorkspace?.id || null // Set current workspace ID
  });

  // GitHub import form - Include workspace_id from current workspace
  const { data: githubData, setData: setGithubData, post: postGithub, processing: processingGithub, errors: githubErrors, reset: resetGithub } = useForm({
    name: '',
    description: '',
    repository_id: '',
    repository_name: '',
    repository_url: '',
    clone_url: '',
    type: 'website',
    css_framework: 'tailwind',
    viewport_width: 1440,
    viewport_height: 900,
    is_public: false,
    workspace_id: currentWorkspace?.id || null // Set current workspace ID
  });

  // Update workspace_id when currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      setData('workspace_id', currentWorkspace.id);
      setGithubData('workspace_id', currentWorkspace.id);
    }
  }, [currentWorkspace?.id, setData, setGithubData]);

  // Define tabs
  const tabs = [
    {
      label: 'Create New',
      icon: Plus
    },
    {
      label: 'Import from GitHub',
      icon: Github
    }
  ];

  // Check GitHub connection status on mount
  useEffect(() => {
    if (show) {
      checkGitHubConnection();
    }
  }, [show]);

  const checkGitHubConnection = async () => {
    try {
      const response = await GitHubService.checkGitHubConnection();
      setGithubConnected(response.connected);
      if (response.connected) {
        setGithubUser({
          github_username: response.github_username,
          name: response.name,
          avatar: response.avatar
        });
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      setGithubConnected(false);
      setGithubUser(null);
    }
  };

  const handleClose = useCallback(() => {
    reset();
    resetGithub();
    setSelectedRepo(null);
    setActiveTab(0);
    onClose();
  }, [onClose, reset, resetGithub]);

  const handleTabChange = useCallback((tabIndex) => {
    setActiveTab(tabIndex);
    // Reset forms when switching tabs
    if (tabIndex === 0) {
      resetGithub();
      setSelectedRepo(null);
    } else {
      reset();
    }
  }, [reset, resetGithub]);

  // Handle regular project creation
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Ensure workspace_id is set
    const projectData = {
      ...data,
      workspace_id: currentWorkspace?.id || data.workspace_id
    };
    
    post('/projects', {
      data: projectData,
      onSuccess: (response) => {
        console.log('Project created successfully in workspace:', currentWorkspace?.name);
        handleClose();
      },
      onError: (errors) => {
        console.error('Project creation failed:', errors);
      }
    });
  }, [data, currentWorkspace, post, handleClose]);

  // Handle GitHub project import
  const handleGithubSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedRepo) {
      return;
    }
    
    setIsImporting(true);
  
    // Prepare data for GitHub import with current workspace
    const importData = {
      ...githubData,
      repository_id: selectedRepo.id,
      repository_name: selectedRepo.name,
      repository_url: selectedRepo.html_url,
      clone_url: selectedRepo.clone_url,
      description: githubData.description || selectedRepo.description || '',
      workspace_id: currentWorkspace?.id || githubData.workspace_id
    };
  
    try {
      // Use axios instead of Inertia
      const response = await axios.post('/api/github/import-project', importData);
      
      if (response.data.success) {
        console.log('GitHub project imported successfully to workspace:', currentWorkspace?.name);
        handleClose();
        
        // Handle redirect
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        }
      }
    } catch (error) {
      console.error('GitHub project import failed:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        // Set validation errors if needed
        const errors = error.response.data.errors || {};
        Object.keys(errors).forEach(key => {
          setGithubData(key + '_error', errors[key][0]);
        });
      }
    } finally {
      setIsImporting(false); // Clear loading state
    }
  }, [githubData, selectedRepo, currentWorkspace, handleClose]);
  
  // Don't forget to import axios at the top of your file:
  // import axios from 'axios';

  const selectViewportPreset = useCallback((preset) => {
    if (activeTab === 0) {
      setData(prev => ({
        ...prev,
        viewport_width: preset.width,
        viewport_height: preset.height
      }));
    } else {
      setGithubData(prev => ({
        ...prev,
        viewport_width: preset.width,
        viewport_height: preset.height
      }));
    }
  }, [activeTab, setData, setGithubData]);

  const handleRepoSelect = useCallback((repo) => {
    setSelectedRepo(repo);
    // Auto-fill some fields based on repository
    setGithubData(prev => ({
      ...prev,
      name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: repo.description || ''
    }));
  }, [setGithubData]);

  // Connect to GitHub with modal flag
  const connectToGitHub = () => {
    window.location.href = '/auth/github/redirect?modal=1';
  };

  // Disconnect from GitHub
  const disconnectFromGitHub = async () => {
    try {
      setDisconnecting(true);
      const response = await axios.delete('/api/github/disconnect');
      
      if (response.data.success) {
        setGithubConnected(false);
        setGithubUser(null);
        setSelectedRepo(null);
        resetGithub();
        console.log('GitHub account disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
    } finally {
      setDisconnecting(false);
    }
  };
  
  // Handle GitHub connection success/error messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('github_connected')) {
      const message = urlParams.get('message');
      if (message) {
        console.log('GitHub connected:', decodeURIComponent(message));
      }
      checkGitHubConnection();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('github_error')) {
      const message = urlParams.get('message');
      if (message) {
        console.error('GitHub connection failed:', decodeURIComponent(message));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [show]);

  // Get workspace icon
  const getWorkspaceIcon = (workspace) => {
    if (!workspace) return <Building className="w-4 h-4" />;
    
    switch (workspace.type) {
      case 'personal':
        return <Lock className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  // Tab content
  const createNewContent = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Current Workspace Info */}
      {currentWorkspace && (
        <div className="p-4 bg-[var(--color-bg-muted)] rounded-xl border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="text-[var(--color-text-muted)]">
              {getWorkspaceIcon(currentWorkspace)}
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Creating project in workspace:
              </p>
              <p className="font-medium text-[var(--color-text)]">
                {currentWorkspace.name}
                {currentWorkspace.type === 'personal' && (
                  <span className="ml-2 text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded">
                    Personal
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Name & Description */}
      <div className="space-y-6">
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
      </div>

      {/* Project Type */}
      <div className="space-y-4">
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
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

       
      </div>

      {/* Privacy Toggle */}
      <div className="space-y-4">
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
                  : 'Only accessible by workspace members'
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-8 border-t border-[var(--color-border)]">
        <motion.button
          type="submit"
          disabled={!data.name || processing || !currentWorkspace}
          whileHover={{ scale: processing ? 1 : 1.02 }}
          whileTap={{ scale: processing ? 1 : 0.98 }}
          className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
        >
          {processing ? (
            <>
              <LoadingSpinner />
              Creating...
            </>
          ) : (
            <>
              Create Project
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );

  const githubImportContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {!githubConnected ? (
        // GitHub Connection Required
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
            <GitHubIcon />
          </div>
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
            Connect to GitHub
          </h3>
          <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
            Import your existing repositories and convert them into DeCode projects with our visual editor.
          </p>
          <motion.button
            onClick={connectToGitHub}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
          >
            <GitHubIcon />
            Connect GitHub Account
          </motion.button>
        </div>
      ) : (
        // GitHub Import Form
        <form onSubmit={handleGithubSubmit} className="space-y-8">
          {/* Current Workspace Info */}
          {currentWorkspace && (
            <div className="p-4 bg-[var(--color-bg-muted)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="text-[var(--color-text-muted)]">
                  {getWorkspaceIcon(currentWorkspace)}
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Importing to workspace:
                  </p>
                  <p className="font-medium text-[var(--color-text)]">
                    {currentWorkspace.name}
                    {currentWorkspace.type === 'personal' && (
                      <span className="ml-2 text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded">
                        Personal
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GitHub User Info & Disconnect */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-bg-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              {githubUser?.avatar && (
                <img 
                  src={githubUser.avatar} 
                  alt={githubUser.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="font-medium text-[var(--color-text)]">
                  Connected as @{githubUser?.github_username}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {githubUser?.name}
                </div>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={disconnectFromGitHub}
              disabled={disconnecting}
              whileHover={{ scale: disconnecting ? 1 : 1.05 }}
              whileTap={{ scale: disconnecting ? 1 : 0.95 }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disconnecting ? (
                <>
                  <LoadingSpinner className="w-4 h-4" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </>
              )}
            </motion.button>
          </div>

          {/* Repository Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-text)]">Select Repository</h3>
            <RepositoryList 
              onSelectRepo={handleRepoSelect}
              selectedRepo={selectedRepo}
              disabled={processingGithub}
            />
          </div>

          {selectedRepo && (
            <>
              {/* Project Configuration */}
              <div className="space-y-6 pt-6 border-t border-[var(--color-border)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={githubData.name}
                      onChange={(e) => setGithubData('name', e.target.value)}
                      placeholder="Project name"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                      required
                    />
                    {githubErrors.name && (
                      <p className="text-sm text-red-500">{githubErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      Description
                    </label>
                    <input
                      type="text"
                      value={githubData.description}
                      onChange={(e) => setGithubData('description', e.target.value)}
                      placeholder="Project description"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Project Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[var(--color-text)]">Project Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROJECT_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = githubData.type === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => setGithubData('type', type.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.gradient} flex items-center justify-center mb-3`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-medium text-[var(--color-text)] text-sm mb-1">
                            {type.name}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {type.description}
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-[var(--color-border)]">
                <motion.button
                  type="submit"
                  disabled={!githubData.name || isImporting || !currentWorkspace}
                  whileHover={{ scale: isImporting ? 1 : 1.02 }}
                  whileTap={{ scale: isImporting ? 1 : 0.98 }}
                  className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
                >
                  {isImporting ? (
                    <>
                      <LoadingSpinner />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import Project
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </form>
      )}
    </motion.div>
  );

  const tabContent = {
    0: createNewContent,
    1: githubImportContent
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      maxWidth="3xl"
      title="Create New Project"
      enableTabs={true}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabContent={tabContent}
      isLoading={loadingGitHub && activeTab === 1}
    />
  );
}