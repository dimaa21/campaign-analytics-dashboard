import type { Theme } from '../../hooks/useTheme';
import { useTheme } from '../../hooks/useTheme';

export interface ChartPalette {
  clicks: string;
  leads: string;
  revenue: string;
  grid: string;
  axis: string;
  good: string;
  bad: string;
  ink: string;
  muted: string;
  panel: string;
  nutra: string;
  crypto: string;
  dating: string;
  gambling: string;
}

const PALETTE: Record<Theme, ChartPalette> = {
  light: {
    clicks: '#0c7c74',
    leads: '#c2410c',
    revenue: '#1d4ed8',
    grid: '#e4ebf2',
    axis: '#5c6d80',
    good: '#0d7a45',
    bad: '#b42318',
    ink: '#142033',
    muted: '#4d5d70',
    panel: '#ffffff',
    nutra: '#0c7c74',
    crypto: '#c2410c',
    dating: '#1d4ed8',
    gambling: '#7c3aed',
  },
  dark: {
    clicks: '#3dd6c6',
    leads: '#f0b429',
    revenue: '#8eb6ff',
    grid: '#243140',
    axis: '#93a4b8',
    good: '#3ddc97',
    bad: '#ff8b96',
    ink: '#e8eef5',
    muted: '#a8b8c9',
    panel: '#141c26',
    nutra: '#3dd6c6',
    crypto: '#f0b429',
    dating: '#8eb6ff',
    gambling: '#d2b4ff',
  },
};

export function useChartColors(): ChartPalette {
  const { theme } = useTheme();
  return PALETTE[theme];
}
