// Theme loader - applies saved theme on app startup
import { useEffect } from 'react';

export const useThemeLoader = () => {
  useEffect(() => {
    const applyTheme = () => {
      const savedColor = localStorage.getItem('primaryColor') || '#ff7f50';
      const savedBg = localStorage.getItem('backgroundImage') || '';
      
      // Apply color theme
      document.documentElement.style.setProperty('--primary-color', savedColor);
      
      // Calculate secondary color (darker shade)
      const num = parseInt(savedColor.replace("#", ""), 16);
      const r = Math.max(0, (num >> 16) - 20);
      const g = Math.max(0, ((num >> 8) & 0x00FF) - 20);
      const b = Math.max(0, (num & 0x0000FF) - 20);
      const secondaryColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      document.documentElement.style.setProperty('--secondary-color', secondaryColor);
      
      // Apply background
      if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
      } else {
        document.body.style.backgroundImage = 'none';
      }
    };

    // Apply theme immediately
    applyTheme();

    // Listen for theme changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'primaryColor' || e.key === 'backgroundImage') {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};

export default useThemeLoader;
