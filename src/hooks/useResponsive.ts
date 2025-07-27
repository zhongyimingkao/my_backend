'use client';
import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1200,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        screenWidth: width,
      });
    };

    // 初始化
    updateState();

    // 监听窗口大小变化
    window.addEventListener('resize', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
    };
  }, []);

  return state;
};
