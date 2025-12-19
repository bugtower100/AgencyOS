import { useThemeStore } from '@/stores/theme-store';
import type { ThemeMode } from '@/stores/theme-store';
import { cn } from './utils';

/**
 * 检查当前主题是否为复古风格（win98 或 retro）
 */
export function useIsRetroStyle() {
  const themeMode = useThemeStore((state) => state.mode);
  return themeMode === 'win98' || themeMode === 'retro';
}

/**
 * 检查当前主题是否为特定模式
 */
export function useIsTheme(mode: ThemeMode) {
  const currentMode = useThemeStore((state) => state.mode);
  return currentMode === mode;
}

/**
 * 根据当前主题模式应用不同的样式类
 */
export function useThemeClassnames(
  styles: Record<string, string | undefined> & { default: string }
) {
  const themeMode = useThemeStore((state) => state.mode);
  // styles may not contain every ThemeMode key (e.g. siphon), so safely fallback to default
  return cn(styles[themeMode] || styles.default);
}

/**
 * 根据意图（intent）和主题模式获取对应的样式类
 */
export function useIntentClassnames(
  intent: 'default' | 'warning' | 'critical' = 'default',
  options?: {
    base?: string;
    intentMap?: Record<string, Record<string, string>>;
  }
) {
  const themeMode = useThemeStore((state) => state.mode);

  // 默认的意图样式映射
  const defaultIntentMap: Record<string, Record<string, string>> = {
    default: {
      win98: 'text-black border-agency-border/80',
      retro: 'text-black border-agency-border/80',
      night: 'text-agency-cyan border-agency-border',
      day: 'text-agency-cyan border-agency-border',
      fluent: 'text-agency-cyan border-agency-border',
      default: 'text-agency-cyan border-agency-border'
    },
    warning: {
      win98: 'text-agency-amber border-agency-border/80',
      retro: 'text-agency-amber border-agency-border/80',
      night: 'text-agency-amber border-agency-amber/50',
      day: 'text-agency-amber border-agency-amber/50',
      fluent: 'text-agency-amber border-agency-amber/50',
      default: 'text-agency-amber border-agency-amber/50'
    },
    critical: {
      win98: 'text-agency-magenta border-agency-border/80',
      retro: 'text-agency-magenta border-agency-border/80',
      night: 'text-agency-magenta border-agency-magenta/60',
      day: 'text-agency-magenta border-agency-magenta/60',
      fluent: 'text-agency-magenta border-agency-magenta/60',
      default: 'text-agency-magenta border-agency-magenta/60'
    }
  };

  const intentMap = options?.intentMap || defaultIntentMap;
  const baseClass = options?.base || '';
  
  return cn(
    baseClass,
    intentMap[intent][themeMode] || intentMap[intent].default
  );
}

/**
 * 获取面板组件的基础样式类
 */
export function usePanelClassnames(customClass?: string) {
  const isRetroStyle = useIsRetroStyle();
  
  return cn(
    isRetroStyle
      ? 'rounded-none border-2 border-agency-border bg-agency-panel p-3 text-agency-cyan'
      : 'rounded-2xl border border-agency-border bg-agency-panel/90 p-4 text-agency-cyan shadow-panel backdrop-blur-lg',
    customClass
  );
}
