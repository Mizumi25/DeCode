import React, { useState, useEffect } from 'react';

const TypewriterWebGLHeader = () => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const fullText = "Bridging the gap between Designing and Coding";
  const typingSpeed = 80;
  const pauseDuration = 3000; // 3 second pause before restarting

  // Typewriter effect with loop
  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timer;

    const type = () => {
      if (!isDeleting && index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
        timer = setTimeout(type, typingSpeed);
      } else if (!isDeleting && index > fullText.length) {
        // Finished typing, pause before deleting
        timer = setTimeout(() => {
          isDeleting = true;
          type();
        }, pauseDuration);
      } else if (isDeleting && index > 0) {
        index--;
        setDisplayText(fullText.slice(0, index));
        timer = setTimeout(type, typingSpeed / 2); // Delete faster
      } else if (isDeleting && index === 0) {
        // Finished deleting, start typing again
        isDeleting = false;
        timer = setTimeout(type, 500);
      }
    };

    type();

    return () => clearTimeout(timer);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--color-primary)' }}>
        {displayText}
        <span 
          className="inline-block w-0.5 h-5 ml-1 align-middle"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s'
          }}
        />
      </h2>
    </div>
  );
};

export default TypewriterWebGLHeader;