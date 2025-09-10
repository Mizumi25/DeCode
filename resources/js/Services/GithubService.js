// @/Services/githubService.js
import axios from 'axios';
import { FrontendAnalysisService } from './FrontendAnalysisService';

export class GitHubService {
  static async getUserRepos() {
    try {
      const response = await axios.get('/api/github/repos');
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw error;
    }
  }
  
  static async createProjectFromRepo(repoData) {
    try {
      const response = await axios.post('/api/github/import-project', repoData);
      return response.data;
    } catch (error) {
      console.error('Error creating project from repo:', error);
      throw error;
    }
  }
  
  static async checkGitHubConnection() {
    try {
      const response = await axios.get('/api/github/status');
      return response.data;
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Get repository contents for analysis
   */
  static async getRepositoryContents(repoId, path = '') {
    try {
      const response = await axios.get(`/api/github/repos/${repoId}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repository contents:', error);
      throw error;
    }
  }

  /**
   * Analyze repository for frontend files before import
   */
  static async analyzeRepositoryForFrontend(repoId) {
    try {
      // Get repository structure
      const contents = await this.getRepositoryContentsRecursive(repoId);
      
      // Analyze for frontend files
      const frontendFiles = FrontendAnalysisService.analyzeFrontendFiles(contents);
      
      return {
        success: true,
        frontend_files: frontendFiles,
        total_files: contents.length,
        estimated_frames: frontendFiles.length,
        analysis_summary: this.generateAnalysisSummary(frontendFiles)
      };
    } catch (error) {
      console.error('Error analyzing repository:', error);
      return {
        success: false,
        error: error.message,
        frontend_files: [],
        total_files: 0,
        estimated_frames: 0
      };
    }
  }

  /**
   * Get repository contents recursively (client-side coordination)
   */
  static async getRepositoryContentsRecursive(repoId, path = '', maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      return [];
    }

    let allFiles = [];
    
    try {
      const response = await this.getRepositoryContents(repoId, path);
      
      if (response.success && response.contents) {
        const contents = response.contents;
        
        for (const item of contents) {
          if (item.type === 'file') {
            allFiles.push(item);
          } else if (item.type === 'dir' && this.shouldExploreDirectory(item.name)) {
            // Recursively get subdirectory contents
            const subFiles = await this.getRepositoryContentsRecursive(
              repoId, 
              item.path, 
              maxDepth, 
              currentDepth + 1
            );
            allFiles = allFiles.concat(subFiles);
          }
        }
      }
    } catch (error) {
      console.warn(`Error fetching contents for path ${path}:`, error.message);
    }
    
    return allFiles;
  }

  /**
   * Determine if we should explore a directory (client-side logic)
   */
  static shouldExploreDirectory(dirname) {
    const frontendDirs = [
      'src', 'app', 'components', 'pages', 'views', 'templates', 
      'public', 'assets', 'static', 'client', 'frontend',
      'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'sass',
      'layouts', 'partials', 'includes'
    ];
    
    const ignoreDirs = [
      'node_modules', '.git', 'vendor', 'build', 'dist',
      'coverage', '.next', '.nuxt', '__pycache__', 'logs',
      'tmp', 'temp', '.cache', '.env'
    ];
    
    const lowercaseName = dirname.toLowerCase();
    
    // Skip ignore directories
    if (ignoreDirs.includes(lowercaseName)) {
      return false;
    }
    
    // Always explore frontend directories
    if (frontendDirs.includes(lowercaseName)) {
      return true;
    }
    
    // Explore if contains frontend-related keywords
    return frontendDirs.some(keyword => lowercaseName.includes(keyword));
  }

  /**
   * Generate analysis summary for UI display
   */
  static generateAnalysisSummary(frontendFiles) {
    const summary = {
      pages: frontendFiles.filter(f => f.type === 'page').length,
      components: frontendFiles.filter(f => f.type === 'component').length,
      frameworks_detected: [],
      complexity_distribution: {
        simple: frontendFiles.filter(f => f.estimated_complexity === 'simple').length,
        medium: frontendFiles.filter(f => f.estimated_complexity === 'medium').length,
        high: frontendFiles.filter(f => f.estimated_complexity === 'high').length
      }
    };

    // Detect frameworks based on file extensions and names
    const frameworks = new Set();
    frontendFiles.forEach(file => {
      if (file.extension === 'jsx' || file.extension === 'tsx') {
        frameworks.add('React');
      } else if (file.extension === 'vue') {
        frameworks.add('Vue.js');
      } else if (file.filename.includes('.component.')) {
        frameworks.add('Angular');
      } else if (file.extension === 'blade.php') {
        frameworks.add('Laravel Blade');
      } else if (file.extension === 'twig') {
        frameworks.add('Twig');
      }
    });

    summary.frameworks_detected = Array.from(frameworks);
    
    return summary;
  }

  /**
   * Preview repository analysis before import (for UI)
   */
  static async previewRepositoryImport(repoData) {
    try {
      // First analyze the repository
      const analysis = await this.analyzeRepositoryForFrontend(repoData.repository_id);
      
      return {
        success: true,
        repository: repoData,
        analysis: analysis,
        preview_frames: analysis.frontend_files.slice(0, 6), // Show first 6 for preview
        estimated_import_time: this.estimateImportTime(analysis.frontend_files.length)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Estimate import time based on number of files
   */
  static estimateImportTime(fileCount) {
    if (fileCount <= 5) return 'Less than 1 minute';
    if (fileCount <= 10) return '1-2 minutes';
    if (fileCount <= 20) return '2-3 minutes';
    return '3+ minutes';
  }

  /**
   * Create project with enhanced frontend analysis
   */
  static async createProjectFromRepoWithAnalysis(repoData) {
    try {
      // Add analysis flag to indicate we want frontend frame generation
      const enhancedRepoData = {
        ...repoData,
        analyze_frontend: true,
        generate_frames: true
      };

      const response = await axios.post('/api/github/import-project', enhancedRepoData);
      return response.data;
    } catch (error) {
      console.error('Error creating project with analysis:', error);
      throw error;
    }
  }
}