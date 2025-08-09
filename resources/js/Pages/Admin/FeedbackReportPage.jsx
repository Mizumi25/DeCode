import { 
  MessageSquare, 
  Search, 
  Filter, 
  Star,
  Clock,
  User,
  Mail,
  Eye,
  Reply,
  Archive,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Bug,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Users,
  MessageCircle,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function FeedbackReportPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Mock feedback data
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      type: 'bug',
      subject: 'Drag feature sometimes doesn\'t align properly',
      message: 'When I try to drag elements in the editor, they sometimes snap to the wrong position. This happens especially with nested components.',
      user: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: 'AJ'
      },
      status: 'open',
      priority: 'high',
      rating: null,
      submittedAt: '2024-08-07T14:30:00Z',
      responseCount: 2,
      tags: ['editor', 'drag-drop', 'ui-bug']
    },
    {
      id: 2,
      type: 'feedback',
      subject: 'Love the UI, but the preview lag is noticeable',
      message: 'The interface is beautiful and intuitive, but when I switch to preview mode, there\'s a noticeable delay. It would be great if this could be optimized.',
      user: {
        name: 'Kaye Mitchell',
        email: 'kaye@example.com',
        avatar: 'KM'
      },
      status: 'in-progress',
      priority: 'medium',
      rating: 4,
      submittedAt: '2024-08-06T09:15:00Z',
      responseCount: 1,
      tags: ['performance', 'preview', 'ui']
    },
    {
      id: 3,
      type: 'feature',
      subject: 'Request: Dark mode for the editor',
      message: 'Would love to have a dark mode option for the editor interface. Working late hours with the bright interface can be straining.',
      user: {
        name: 'Marcus Chen',
        email: 'marcus.chen@studio.com',
        avatar: 'MC'
      },
      status: 'planned',
      priority: 'low',
      rating: null,
      submittedAt: '2024-08-05T16:45:00Z',
      responseCount: 0,
      tags: ['feature-request', 'dark-mode', 'accessibility']
    },
    {
      id: 4,
      type: 'bug',
      subject: 'Component library not loading on mobile',
      message: 'The component library panel doesn\'t load properly on mobile devices. Getting a blank screen when trying to access it.',
      user: {
        name: 'Sarah Williams',
        email: 'sarah.w@design.co',
        avatar: 'SW'
      },
      status: 'resolved',
      priority: 'high',
      rating: null,
      submittedAt: '2024-08-04T11:20:00Z',
      responseCount: 3,
      tags: ['mobile', 'component-library', 'critical']
    },
    {
      id: 5,
      type: 'feedback',
      subject: 'Amazing tool! Just a few suggestions',
      message: 'This is by far the best website builder I\'ve used. The code generation is incredible. A few small suggestions: better keyboard shortcuts and maybe a template marketplace.',
      user: {
        name: 'David Park',
        email: 'david@webagency.io',
        avatar: 'DP'
      },
      status: 'open',
      priority: 'low',
      rating: 5,
      submittedAt: '2024-08-03T13:10:00Z',
      responseCount: 1,
      tags: ['positive', 'suggestions', 'templates']
    }
  ]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return Bug;
      case 'feedback': return MessageCircle;
      case 'feature': return Heart;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bug': return 'text-red-500';
      case 'feedback': return 'text-blue-500';
      case 'feature': return 'text-green-500';
      default: return 'text-[var(--color-text-muted)]';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-[var(--color-text-muted)]';
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || feedback.type === activeTab;
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  const handleSelectFeedback = (feedbackId) => {
    setSelectedFeedback(prev => 
      prev.includes(feedbackId) 
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleReply = (feedback) => {
    setReplyingTo(feedback);
    setShowReplyModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: feedbacks.length,
    open: feedbacks.filter(f => f.status === 'open').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    avgRating: feedbacks.filter(f => f.rating).reduce((acc, f) => acc + f.rating, 0) / feedbacks.filter(f => f.rating).length || 0
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[var(--fs-xl)] font-semibold mb-2 flex items-center gap-3">
          <MessageSquare size={24} className="text-[var(--color-primary)]" /> 
          Feedback & Reports
        </h1>
        <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
          Manage user feedback, bug reports, and feature requests for DeCode
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-primary-soft)] rounded-[var(--radius-sm)]">
              <MessageCircle size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Total Feedback</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-[var(--radius-sm)]">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Open Issues</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-[var(--radius-sm)]">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Resolved</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-accent)] bg-opacity-20 rounded-[var(--radius-sm)]">
              <Star size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-sm mb-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--color-border)] pb-4">
          {['all', 'feedback', 'bug', 'feature'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-[var(--radius-sm)] text-[var(--fs-sm)] font-medium transition-all duration-[var(--transition)] ${
                activeTab === tab
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-black bg-opacity-20 rounded-full text-xs">
                  {feedbacks.filter(f => f.type === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search feedback, users, or emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-[var(--transition)]"
              />
            </div>
            
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-[var(--transition)]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="planned">Planned</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFeedback.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--fs-sm)] text-[var(--color-text-muted)]">
                {selectedFeedback.length} selected
              </span>
              <button className="px-3 py-2 text-[var(--fs-sm)] bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:bg-[var(--color-border)] transition-colors">
                <Archive size={14} className="inline mr-1" />
                Archive
              </button>
              <button className="px-3 py-2 text-[var(--fs-sm)] bg-red-50 text-red-600 border border-red-200 rounded-[var(--radius-sm)] hover:bg-red-100 transition-colors">
                <Trash2 size={14} className="inline mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-sm">
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
            <h3 className="text-[var(--fs-lg)] font-medium mb-2">No feedback found</h3>
            <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No feedback has been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filteredFeedbacks.map((feedback) => {
              const TypeIcon = getTypeIcon(feedback.type);
              const isSelected = selectedFeedback.includes(feedback.id);
              
              return (
                <div key={feedback.id} className="p-6 hover:bg-[var(--color-bg-muted)] transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectFeedback(feedback.id)}
                      className="mt-1 w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] focus:ring-2"
                    />

                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-medium text-[var(--fs-sm)] flex-shrink-0">
                      {feedback.user.avatar}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <TypeIcon size={16} className={getTypeIcon(feedback.type) !== MessageSquare ? getTypeColor(feedback.type) : 'text-[var(--color-text-muted)]'} />
                            <h3 className="font-semibold text-[var(--fs-base)] truncate">
                              {feedback.subject}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(feedback.status)}`}>
                                {feedback.status.replace('-', ' ')}
                              </span>
                              {feedback.priority && (
                                <span className={`text-xs ${getPriorityColor(feedback.priority)}`}>
                                  {feedback.priority} priority
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)] mb-3 line-clamp-2">
                            {feedback.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{feedback.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail size={12} />
                              <span>{feedback.user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(feedback.submittedAt)}</span>
                            </div>
                            {feedback.rating && (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-[var(--color-accent)]" />
                                <span>{feedback.rating}/5</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {feedback.tags && feedback.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {feedback.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] text-xs rounded-[var(--radius-sm)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleReply(feedback)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] transition-all"
                            title="Reply"
                          >
                            <Reply size={16} />
                          </button>
                          <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] transition-all" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] transition-all">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Response Count */}
                      {feedback.responseCount > 0 && (
                        <div className="text-xs text-[var(--color-primary)] cursor-pointer hover:underline">
                          View {feedback.responseCount} response{feedback.responseCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[var(--fs-lg)] font-semibold">Reply to Feedback</h3>
              <button
                onClick={() => {setShowReplyModal(false); setReplyingTo(null);}}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Original Feedback */}
            <div className="bg-[var(--color-bg-muted)] p-4 rounded-[var(--radius-md)] mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-medium text-xs">
                  {replyingTo.user.avatar}
                </div>
                <div>
                  <p className="font-medium text-[var(--fs-sm)]">{replyingTo.user.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{replyingTo.user.email}</p>
                </div>
              </div>
              <h4 className="font-semibold mb-2">{replyingTo.subject}</h4>
              <p className="text-[var(--fs-sm)] text-[var(--color-text-muted)]">{replyingTo.message}</p>
            </div>

            {/* Reply Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[var(--fs-sm)] font-medium mb-2">Reply Message</label>
                <textarea
                  rows={6}
                  className="w-full p-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                  placeholder="Type your reply here..."
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="block text-[var(--fs-sm)] font-medium">Update Status:</label>
                <select className="px-3 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--fs-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="planned">Planned</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {setShowReplyModal(false); setReplyingTo(null);}}
                  className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] transition-colors">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}