import { useState, useEffect } from 'react';

export function useNavbarHeight(navbarType: 'simple' | 'dashboard' = 'simple') {
  const [navbarHeight, setNavbarHeight] = useState<number>(0);
  const [remainingHeight, setRemainingHeight] = useState<string>('100vh');

  useEffect(() => {
    const calculateNavbarHeight = () => {
      if (navbarType === 'simple') {
        const height = window.innerHeight * 0.08; 
        setNavbarHeight(height);
        setRemainingHeight('calc(100vh - 8vh)');
      } else {
        const dashboardNavbar = document.querySelector('[data-navbar="dashboard"]');
        if (dashboardNavbar) {
          const height = dashboardNavbar.getBoundingClientRect().height;
          setNavbarHeight(height);
          setRemainingHeight(`calc(100vh - ${height}px)`);
        } else {
          const isMobile = window.innerWidth < 768;
          const estimatedHeight = isMobile ? 280 : 350;
          setNavbarHeight(estimatedHeight);
          setRemainingHeight(`calc(100vh - ${estimatedHeight}px)`);
        }
      }
    };

    calculateNavbarHeight();
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateNavbarHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navbarType]);

  return {
    navbarHeight,
    remainingHeight,
    navbarHeightVh: navbarType === 'simple' ? '8vh' : `${navbarHeight}px`
  };
}