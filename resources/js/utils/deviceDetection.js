// utils/deviceDetection.js
/**
 * Detect user's device type based on user agent
 * Returns: 'phone', 'tablet', or 'desktop'
 */
export const detectDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // Check for mobile devices
  const isMobile = /iphone|ipod|android|blackberry|windows phone|opera mini|iemobile|mobile/i.test(userAgent);
  
  // Check for tablets
  const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i.test(userAgent) || 
                   (isMobile && width >= 768);

  // Determine device type
  if (isTablet) {
    return 'tablet';
  } else if (isMobile || width < 768) {
    return 'phone';
  } else {
    return 'desktop';
  }
};

/**
 * Get device icon name for Lucide React
 */
export const getDeviceIcon = (deviceType) => {
  const icons = {
    phone: 'Smartphone',
    tablet: 'Tablet',
    desktop: 'Monitor',
  };
  return icons[deviceType] || 'Monitor';
};

/**
 * Get device display name
 */
export const getDeviceDisplayName = (deviceType) => {
  const names = {
    phone: 'Mobile',
    tablet: 'Tablet',
    desktop: 'Desktop',
  };
  return names[deviceType] || 'Desktop';
};
