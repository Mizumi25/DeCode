import React, { useEffect, useRef, useState } from 'react';

// 🎬 CSS Animation Keyframes Generator
const generateKeyframes = (preset) => {
  const keyframes = {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    slideUp: {
      from: { opacity: 0, transform: 'translateY(30px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    slideDown: {
      from: { opacity: 0, transform: 'translateY(-30px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    slideLeft: {
      from: { opacity: 0, transform: 'translateX(30px)' },
      to: { opacity: 1, transform: 'translateX(0)' }
    },
    slideRight: {
      from: { opacity: 0, transform: 'translateX(-30px)' },
      to: { opacity: 1, transform: 'translateX(0)' }
    },
    scale: {
      from: { opacity: 0, transform: 'scale(0.8)' },
      to: { opacity: 1, transform: 'scale(1)' }
    },
    rotate: {
      from: { opacity: 0, transform: 'rotate(-10deg)' },
      to: { opacity: 1, transform: 'rotate(0deg)' }
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-20px)' }
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 }
    },
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(-10px)' },
      '75%': { transform: 'translateX(10px)' }
    },
    flip: {
      from: { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
      to: { transform: 'perspective(400px) rotateY(0)', opacity: 1 }
    }
  };
  
  return keyframes[preset] || keyframes.fadeIn;
};

// 🎬 AnimatedComponent Wrapper
export default function AnimatedComponent({ children, component, isPreview = false }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const animationConfig = component?.props?.animation;
  
  // Check if animations should be enabled
  const shouldAnimate = isPreview && animationConfig?.enabled;
  
  useEffect(() => {
    if (!shouldAnimate || !elementRef.current) return;
    
    const trigger = animationConfig.trigger;
    
    // onLoad trigger - play immediately
    if (trigger === 'onLoad') {
      setIsVisible(true);
      setHasPlayed(true);
    }
    
    // onScroll trigger - use Intersection Observer
    if (trigger === 'onScroll') {
      const threshold = animationConfig.scrollConfig?.threshold || 0.2;
      const once = animationConfig.scrollConfig?.once !== false;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (once) {
                setHasPlayed(true);
                observer.disconnect();
              }
            } else if (!once && hasPlayed) {
              setIsVisible(false);
            }
          });
        },
        { threshold }
      );
      
      observer.observe(elementRef.current);
      
      return () => observer.disconnect();
    }
  }, [shouldAnimate, animationConfig, hasPlayed]);
  
  // Generate animation styles
  const getAnimationStyle = () => {
    if (!shouldAnimate) return {};
    
    const trigger = animationConfig.trigger;
    const cssConfig = animationConfig.css || {};
    const preset = cssConfig.preset || 'fadeIn';
    const duration = cssConfig.duration || 0.5;
    const delay = cssConfig.delay || 0;
    const easing = cssConfig.easing || 'ease-in-out';
    const iterations = cssConfig.iterations || 1;
    const fillMode = cssConfig.fillMode || 'both';
    
    // For onClick and onHover, don't apply animation styles yet
    if (trigger === 'onClick' || trigger === 'onHover') {
      const keyframes = generateKeyframes(preset);
      
      // Apply initial state from keyframes
      if (trigger === 'onHover' && !isHovered) {
        return keyframes.from || {};
      }
      
      // Apply animation when triggered
      if ((trigger === 'onClick' && isVisible) || (trigger === 'onHover' && isHovered)) {
        return {
          ...keyframes.to,
          transition: `all ${duration}s ${easing} ${delay}s`
        };
      }
      
      return keyframes.from || {};
    }
    
    // For onLoad and onScroll triggers
    if (isVisible || hasPlayed) {
      const animationName = `${preset}-${component.id}`;
      
      return {
        animationName,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: easing,
        animationIterationCount: iterations,
        animationFillMode: fillMode
      };
    }
    
    // Initial state (before animation)
    const keyframes = generateKeyframes(preset);
    return keyframes.from || {};
  };
  
  // Handle click trigger
  const handleClick = () => {
    if (shouldAnimate && animationConfig.trigger === 'onClick') {
      setIsVisible(true);
      
      // Reset after animation completes
      const duration = (animationConfig.css?.duration || 0.5) * 1000;
      setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
  };
  
  // Handle hover trigger
  const handleMouseEnter = () => {
    if (shouldAnimate && animationConfig.trigger === 'onHover') {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (shouldAnimate && animationConfig.trigger === 'onHover') {
      const reverseOnLeave = animationConfig.hoverConfig?.reverseOnLeave !== false;
      if (reverseOnLeave) {
        setIsHovered(false);
      }
    }
  };
  
  // Clone children and apply animation
  const animatedChild = React.cloneElement(children, {
    ref: elementRef,
    style: {
      ...children.props.style,
      ...getAnimationStyle()
    },
    onClick: (e) => {
      handleClick();
      children.props.onClick?.(e);
    },
    onMouseEnter: (e) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    }
  });
  
  return animatedChild;
}

// 🎬 Generate CSS Keyframes for Preview
export function generatePreviewKeyframes(components) {
  const keyframesCSS = [];
  
  components.forEach(component => {
    if (component.props?.animation?.enabled) {
      const preset = component.props.animation.css?.preset || 'fadeIn';
      const animationName = `${preset}-${component.id}`;
      const keyframes = generateKeyframes(preset);
      
      // Convert keyframes object to CSS
      let cssKeyframes = `@keyframes ${animationName} {\n`;
      
      Object.entries(keyframes).forEach(([key, value]) => {
        cssKeyframes += `  ${key} {\n`;
        Object.entries(value).forEach(([prop, val]) => {
          cssKeyframes += `    ${prop}: ${val};\n`;
        });
        cssKeyframes += `  }\n`;
      });
      
      cssKeyframes += `}`;
      keyframesCSS.push(cssKeyframes);
    }
    
    // Recursively generate for children
    if (component.children) {
      keyframesCSS.push(...generatePreviewKeyframes(component.children));
    }
  });
  
  return keyframesCSS;
}
