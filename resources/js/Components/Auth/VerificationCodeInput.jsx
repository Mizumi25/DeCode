// @/Components/Auth/VerificationCodeInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VerificationCodeInput({ 
  length = 6, 
  value = '', 
  onChange, 
  onComplete,
  disabled = false,
  error = false 
}) {
  const [codes, setCodes] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update codes when value prop changes
  useEffect(() => {
    if (value) {
      const newCodes = value.split('').slice(0, length);
      while (newCodes.length < length) {
        newCodes.push('');
      }
      setCodes(newCodes);
    }
  }, [value, length]);

  const handleChange = (index, newValue) => {
    // Only allow digits
    const digit = newValue.replace(/[^0-9]/g, '');
    
    if (digit.length === 0) {
      // Handle deletion
      const newCodes = [...codes];
      newCodes[index] = '';
      setCodes(newCodes);
      onChange(newCodes.join(''));
      
      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (digit.length === 1) {
      // Single digit entered
      const newCodes = [...codes];
      newCodes[index] = digit;
      setCodes(newCodes);
      onChange(newCodes.join(''));
      
      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Check if complete
      if (newCodes.every(c => c !== '') && onComplete) {
        onComplete(newCodes.join(''));
      }
    } else {
      // Multiple digits pasted - distribute across boxes
      handlePaste(digit, index);
    }
  };

  const handlePaste = (pastedText, startIndex = 0) => {
    const digits = pastedText.replace(/[^0-9]/g, '').split('');
    const newCodes = [...codes];
    
    digits.forEach((digit, i) => {
      const targetIndex = startIndex + i;
      if (targetIndex < length) {
        newCodes[targetIndex] = digit;
      }
    });
    
    setCodes(newCodes);
    onChange(newCodes.join(''));
    
    // Focus last filled input or next empty
    const nextEmptyIndex = newCodes.findIndex(c => c === '');
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
    
    // Check if complete
    if (newCodes.every(c => c !== '') && onComplete) {
      onComplete(newCodes.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && codes[index] === '' && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    // Select content on focus for easy replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex justify-center gap-3">
      {codes.map((code, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              handlePaste(pastedText, index);
            }}
            disabled={disabled}
            className={`
              w-14 h-16 text-center text-2xl font-bold rounded-xl
              bg-[var(--color-bg)] border-2 
              ${error 
                ? 'border-red-500 text-red-500' 
                : code 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-[var(--color-border)] text-[var(--color-text)]'
              }
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${!disabled && 'hover:border-[var(--color-primary)]/50'}
            `}
            style={{
              caretColor: error ? '#ef4444' : 'var(--color-primary)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
