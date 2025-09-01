// @/Services/githubService.js
import axios from 'axios';

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
}