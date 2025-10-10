// CREATE a new file: Components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // ✅ ADD: Special handling for Echo errors
    if (error.message && error.message.includes('channels')) {
      console.warn('Echo channel error detected, attempting cleanup...');
      
      // Try to cleanup all channels
      if (window.Echo?.connector?.channels) {
        Object.keys(window.Echo.connector.channels).forEach(channelName => {
          try {
            window.Echo.leave(channelName);
          } catch (e) {
            console.warn('Could not leave channel:', channelName);
          }
        });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // ✅ ADD: Check if it's an Echo error
      const isEchoError = this.state.error?.message?.includes('channels') || 
                          this.state.error?.message?.includes('leave');
      
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {isEchoError ? 'Connection Error' : 'Something went wrong'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isEchoError 
              ? 'Lost connection to real-time updates. Please reload the page.'
              : (this.state.error?.message || 'Unknown error occurred')
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;