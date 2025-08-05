import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only reset scroll position for scrollable containers, not the entire page
    // Since all our pages use fixed containers, we only need to reset inner scroll areas
    const resetScroll = () => {
      // Reset any scrollable containers within our fixed page containers
      const scrollableElements = document.querySelectorAll('.overflow-y-auto');
      scrollableElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });
    };

    // Small delay to avoid flash during navigation
    const timeoutId = setTimeout(resetScroll, 50);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;