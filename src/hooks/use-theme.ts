import { useAppStore } from '@/store/app-store';

export function useTheme() {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';
  
  return {
    isDark,
    theme,
    toggleTheme
  };
}