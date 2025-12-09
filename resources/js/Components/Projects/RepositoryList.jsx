// @/Components/Projects/RepositoryList.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  GitFork, 
  Calendar, 
  Lock,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { GitHubService } from '@/Services/GithubService';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function RepositoryList({ onSelectRepo, selectedRepo, disabled = false }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, public, private, forked
  const [refreshing, setRefreshing] = useState(false);

  // Filter and search repositories
  const filteredRepos = useMemo(() => {
    let filtered = repos;

    // 🔥 FIRST: Filter only HTML/React projects with CSS/Tailwind
    filtered = filtered.filter(repo => {
      const language = (repo.language || '').toLowerCase();
      const name = (repo.name || '').toLowerCase();
      const description = (repo.description || '').toLowerCase();
      
      // Check if it's a web frontend project (NO TypeScript yet)
      const isWebProject = 
        language === 'javascript' ||
        language === 'html' ||
        language === 'jsx' ||
        name.includes('react') ||
        name.includes('html') ||
        name.includes('web') ||
        name.includes('frontend') ||
        description.includes('react') ||
        description.includes('html') ||
        description.includes('website') ||
        description.includes('web app');
      
      // Explicitly exclude TypeScript projects
      const isTypeScript = 
        language === 'typescript' ||
        language === 'tsx' ||
        name.includes('typescript') ||
        description.includes('typescript');
      
      // Exclude backend-only projects
      const isBackendOnly =
        language === 'python' ||
        language === 'java' ||
        language === 'ruby' ||
        language === 'go' ||
        language === 'rust' ||
        language === 'c++' ||
        language === 'c#' ||
        name.includes('api') ||
        name.includes('backend') ||
        name.includes('server') ||
        description.includes('api only') ||
        description.includes('backend');
      
      return isWebProject && !isBackendOnly && !isTypeScript;
    });

    // Apply type filter
    if (filter === 'public') {
      filtered = filtered.filter(repo => !repo.private);
    } else if (filter === 'private') {
      filtered = filtered.filter(repo => repo.private);
    } else if (filter === 'forked') {
      filtered = filtered.filter(repo => repo.fork);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
      );
    }

    // Sort by updated date (most recent first)
    return filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [repos, filter, searchQuery]);

  const fetchRepos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await GitHubService.getUserRepos();
      setRepos(response.repositories || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleRefresh = () => {
    fetchRepos(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f7df1e',
      TypeScript: '#3178c6',
      Python: '#3776ab',
      Java: '#ed8b00',
      'C++': '#00599c',
      CSS: '#1572b6',
      HTML: '#e34f26',
      PHP: '#777bb4',
      Ruby: '#cc342d',
      Go: '#00add8',
      Rust: '#ce422b',
      Swift: '#fa7343',
      Kotlin: '#7f52ff',
      'C#': '#239120',
      Vue: '#4fc08d',
      React: '#61dafb'
    };
    return colors[language] || '#64748b';
  };

  // Detect framework from repo
  const detectFramework = (repo) => {
    const name = (repo.name || '').toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const language = (repo.language || '').toLowerCase();
    
    // Check for React (most specific first)
    if (name.includes('react') || 
        description.includes('react') || 
        language === 'jsx' ||
        name.includes('next') || 
        description.includes('next.js') ||
        name.includes('gatsby') ||
        description.includes('gatsby')) {
      return 'React';
    }
    
    // Check for HTML
    if (language === 'html' || name.includes('html') || description.includes('html')) {
      return 'HTML';
    }
    
    // If it's JavaScript but not React, show JavaScript badge
    if (language === 'javascript') {
      return 'JavaScript';
    }
    
    return null;
  };

  // Detect styling framework from repo
  const detectStyleFramework = (repo) => {
    const name = (repo.name || '').toLowerCase();
    const description = (repo.description || '').toLowerCase();
    
    // Check for Tailwind
    if (name.includes('tailwind') || description.includes('tailwind')) {
      return 'Tailwind';
    }
    
    // Check for CSS/Vanilla
    if (name.includes('css') || description.includes('css')) {
      return 'CSS';
    }
    
    // Default assumption
    return 'CSS';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-4" />
        <p className="text-[var(--color-text-muted)]">Loading your repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">Failed to load repositories</h3>
        <p className="text-[var(--color-text-muted)] text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={() => fetchRepos()}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
            <GitHubIcon className="text-white dark:text-gray-900" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Your Repositories</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{filteredRepos.length} repositories</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors disabled:opacity-50"
          title="Refresh repositories"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--color-text-muted)] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent appearance-none"
          >
            <option value="all">All repos</option>
            <option value="public">Public only</option>
            <option value="private">Private only</option>
            <option value="forked">Forked</option>
          </select>
        </div>
      </div>

      {/* Repository List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredRepos.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              {searchQuery || filter !== 'all' ? 'No repositories match your criteria.' : 'No repositories found.'}
            </div>
          ) : (
            filteredRepos.map((repo) => {
              const isSelected = selectedRepo?.id === repo.id;
              return (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && onSelectRepo(repo)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-[var(--color-text)] truncate">
                          {repo.name}
                        </h4>
                        {repo.private ? (
                          <Lock className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                        ) : (
                          <Globe className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                        )}
                        {repo.fork && (
                          <GitFork className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                        )}
                      </div>
                      
                      {repo.description && (
                        <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      
                      {/* Framework & Style Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {/* Language Badge */}
                        {repo.language && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            <span className="text-xs font-medium text-[var(--color-text)]">{repo.language}</span>
                          </div>
                        )}
                        
                        {/* Framework Badge - Show React badge if detected */}
                        {(() => {
                          const framework = detectFramework(repo);
                          // Show React badge for React projects
                          if (framework === 'React') {
                            return (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                                <svg width="12" height="12" viewBox="0 0 30 30" className="flex-shrink-0">
                                  <path fill="#61DAFB" d="M 10.679688 4.1816406 C 10.068687 4.1816406 9.502 4.3184219 9 4.6074219 C 7.4311297 5.5132122 6.8339651 7.7205462 7.1503906 10.46875 C 4.6127006 11.568833 3 13.188667 3 15 C 3 16.811333 4.6127006 18.431167 7.1503906 19.53125 C 6.8341285 22.279346 7.4311297 24.486788 9 25.392578 C 9.501 25.681578 10.067687 25.818359 10.679688 25.818359 C 11.982314 25.818359 13.48785 25.164589 15 24.042969 C 16.512282 25.164589 18.01964 25.818359 19.322266 25.818359 C 19.933266 25.818359 20.499953 25.681578 21.001953 25.392578 C 22.570823 24.486788 23.167988 22.279346 22.851562 19.53125 C 25.388297 18.431167 27 16.811333 27 15 C 27 13.188667 25.388297 11.568833 22.851562 10.46875 C 23.167988 7.7205462 22.570823 5.5132122 21.001953 4.6074219 C 20.500953 4.3174219 19.934266 4.1816406 19.322266 4.1816406 C 18.019639 4.1816406 16.512282 4.8354109 15 5.9570312 C 13.48785 4.8354109 11.982314 4.1816406 10.679688 4.1816406 z M 10.679688 5.9316406 C 11.461321 5.9316406 12.730466 6.41083 14.044922 7.4199219 C 12.937384 8.3606929 11.83479 9.5012071 10.796875 10.767578 C 9.2057865 10.920335 7.8031683 11.175176 6.6425781 11.505859 C 6.3969308 9.3608811 6.8347345 7.6485393 7.8359375 7.0605469 C 8.3355375 6.7675469 9.0056867 6.0128906 10.679688 5.9316406 z M 19.322266 5.9316406 C 20.996266 5.9316406 21.666453 6.7675469 22.166016 7.0605469 C 23.168416 7.6495393 23.604453 9.3608811 23.359375 11.505859 C 22.197877 11.17519 20.796062 10.920333 19.203125 10.767578 C 18.16821 9.5022069 17.065384 8.3606929 15.957031 7.4199219 C 17.271488 6.41083 18.540633 5.9316406 19.322266 5.9316406 z"/>
                                </svg>
                                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">React</span>
                              </div>
                            );
                          }
                          // Don't show anything for vanilla JS (already shown in language badge)
                          // Don't show anything for HTML (already shown in language badge)
                          return null;
                        })()}
                        
                        {/* Style Framework Badge */}
                        {(() => {
                          const styleFramework = detectStyleFramework(repo);
                          if (styleFramework === 'Tailwind') {
                            return (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30">
                                <svg width="12" height="12" viewBox="0 0 24 24" className="flex-shrink-0">
                                  <path fill="#06B6D4" d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.5 6 12 6m-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.39 16.85 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.5 12 7 12z"/>
                                </svg>
                                <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Tailwind</span>
                              </div>
                            );
                          } else if (styleFramework === 'CSS') {
                            return (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30">
                                <svg width="12" height="12" viewBox="0 0 48 48" className="flex-shrink-0">
                                  <path fill="#0277BD" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
                                  <path fill="#039BE5" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
                                </svg>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">CSS</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                        {repo.stargazers_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                        )}
                        
                        {repo.forks_count > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Selected Repository Info */}
      {selectedRepo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Selected: <span className="text-[var(--color-primary)]">{selectedRepo.name}</span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Ready to import as a new project
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
        </motion.div>
      )}
    </div>
  );
}