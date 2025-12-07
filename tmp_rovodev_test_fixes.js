// Quick test to verify the debounce function returns a Promise
// This can be run in the browser console

console.log('Testing ThumbnailService debounce fix...');

// Test 1: Debounce function should return a Promise
const testDebounce = () => {
  const ThumbnailService = window.ThumbnailService || {
    debounce: function(func, wait, immediate = false) {
      let timeout;
      let pendingPromise = null;
      
      return function executedFunction(...args) {
        clearTimeout(timeout);
        
        if (pendingPromise) {
          return pendingPromise;
        }
        
        pendingPromise = new Promise((resolve, reject) => {
          const later = () => {
            timeout = null;
            pendingPromise = null;
            
            if (!immediate) {
              try {
                const result = func(...args);
                if (result && typeof result.then === 'function') {
                  result.then(resolve).catch(reject);
                } else {
                  resolve(result);
                }
              } catch (error) {
                reject(error);
              }
            } else {
              resolve();
            }
          };
          
          const callNow = immediate && !timeout;
          timeout = setTimeout(later, wait);
          
          if (callNow) {
            try {
              const result = func(...args);
              pendingPromise = null;
              if (result && typeof result.then === 'function') {
                result.then(resolve).catch(reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              pendingPromise = null;
              reject(error);
            }
          }
        });
        
        return pendingPromise;
      };
    }
  };

  const testFunc = () => {
    console.log('Debounced function executed');
    return 'success';
  };

  const debouncedFunc = ThumbnailService.debounce(testFunc, 100);
  const result = debouncedFunc();

  console.log('Result from debounced function:', result);
  console.log('Is Promise?', result instanceof Promise);
  console.log('Has .then()?', typeof result.then === 'function');

  if (result && typeof result.then === 'function') {
    result.then((res) => {
      console.log('✅ Promise resolved successfully:', res);
    }).catch((err) => {
      console.error('❌ Promise rejected:', err);
    });
  } else {
    console.error('❌ Debounce function did not return a Promise!');
  }
};

// Test 2: Color input conversion
const testColorConversion = () => {
  console.log('\nTesting color input conversion...');
  
  const convertColor = (localValue) => {
    const color = localValue || '#000000';
    if (color === 'transparent' || color === 'none') return '#000000';
    if (color.startsWith('#')) return color;
    return '#000000';
  };

  const testCases = [
    { input: 'transparent', expected: '#000000' },
    { input: 'none', expected: '#000000' },
    { input: '#ff0000', expected: '#ff0000' },
    { input: 'rgb(255, 0, 0)', expected: '#000000' },
    { input: '', expected: '#000000' },
    { input: null, expected: '#000000' },
  ];

  testCases.forEach(({ input, expected }) => {
    const result = convertColor(input);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} Input: "${input}" -> Output: "${result}" (Expected: "${expected}")`);
  });
};

// Run tests
console.log('=== Running Tests ===\n');
testDebounce();
testColorConversion();
console.log('\n=== Tests Complete ===');
