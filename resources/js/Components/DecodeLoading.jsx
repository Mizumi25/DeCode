import { useEffect } from 'react';
import NProgress from 'nprogress';
import { router } from '@inertiajs/react';
import 'nprogress/nprogress.css';

export default function DecodeLoading() {
  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 120,
      minimum: 0.05,
      easing: "ease",
      speed: 600,
    });

    // Start on initial load
    document.body.classList.add("decode-loading");
    NProgress.start();

    // Listen to Inertia navigation events
    const startHandler = () => {
      document.body.classList.add("decode-loading");
      NProgress.start();
    };

    const finishHandler = () => {
      NProgress.done();
      document.body.classList.remove("decode-loading");
    };

    // Inertia event listeners - returns removal functions
    const removeStart = router.on('start', startHandler);
    const removeFinish = router.on('finish', finishHandler);

    // Initial page load - finish after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
      document.body.classList.remove("decode-loading");
    }, 800); // Adjust timing as needed

    // Cleanup
    return () => {
      clearTimeout(timer);
      removeStart();
      removeFinish();
      NProgress.done();
      document.body.classList.remove("decode-loading");
    };
  }, []);

  return null;
}