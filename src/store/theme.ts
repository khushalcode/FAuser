/**
 * Theme store — manages light/dark/system theme mode with AsyncStorage
 * persistence. Uses useColorScheme() from react-native as the system seed.
 */
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  lightColors,
  darkColors,
  type ThemeColors,
  type ThemeMode,
} from '@/theme/colors';

type EffectiveMode = 'light' | 'dark';

interface ThemeState {
  /** User's selected preference. */
  mode: ThemeMode;
  /** Resolved mode after applying system preference. Always 'light' or 'dark'. */
  effective: EffectiveMode;
  /** The active color palette — re-rendered when effective changes. */
  colors: ThemeColors;
  /** Last-seen system scheme. */
  systemScheme: 'light' | 'dark' | null;
  /** Set explicit mode. */
  setMode: (m: ThemeMode) => void;
  /** Toggle between light and dark (resets system → dark, dark → light, light → dark). */
  toggle: () => void;
  /** Internal: recompute `effective` + `colors` from `mode` + system scheme. */
  recompute: (systemScheme: 'light' | 'dark' | null | undefined) => void;
}

function resolveEffective(
  mode: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined
): EffectiveMode {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

function pickColors(effective: EffectiveMode): ThemeColors {
  return effective === 'dark' ? darkColors : lightColors;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      effective: 'dark',
      colors: darkColors,
      systemScheme: 'dark',
      setMode: (m) => {
        const sys = get().systemScheme;
        const eff = resolveEffective(m, sys);
        set({ mode: m, effective: eff, colors: pickColors(eff) });
      },
      toggle: () => {
        const { mode, effective } = get();
        if (mode === 'system') {
          const next: ThemeMode = effective === 'dark' ? 'light' : 'dark';
          set({ mode: next, effective: next, colors: pickColors(next) });
        } else {
          const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
          set({ mode: next, effective: next, colors: pickColors(next) });
        }
      },
      recompute: (systemScheme) => {
        const { mode, effective: prevEff } = get();
        const eff = resolveEffective(mode, systemScheme);
        if (eff !== prevEff || get().systemScheme !== systemScheme) {
          set({
            systemScheme: (systemScheme as 'light' | 'dark' | null) ?? 'light',
            effective: eff,
            colors: pickColors(eff),
          });
        }
      },
    }),
    {
      name: 'foodmunch-customer-theme',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the user's preference, not the computed values.
      partialize: (s) => ({ mode: s.mode }),
    }
  )
);

/**
 * Hook that returns the active colors. The component re-renders when
 * the effective theme changes.
 *
 * Also wires up the system color scheme listener so that `mode: 'system'`
 * tracks the OS preference in real time.
 */
export function useThemeColors(): ThemeColors {
  const systemScheme = useColorScheme();
  const colors = useThemeStore((s) => s.colors);
  const recompute = useThemeStore((s) => s.recompute);

  React.useEffect(() => {
    recompute(systemScheme as 'light' | 'dark' | null | undefined);
  }, [systemScheme, recompute]);

  return colors;
}

/**
 * Returns the current effective mode ('light' | 'dark') — useful when you
 * need to know which mode you're in (e.g. to pick a status bar style).
 */
export function useEffectiveMode(): EffectiveMode {
  useThemeColors(); // subscribe to changes
  return useThemeStore((s) => s.effective);
}

/**
 * Returns true when the app is currently rendering in dark mode.
 */
export function useIsDark(): boolean {
  return useEffectiveMode() === 'dark';
}
