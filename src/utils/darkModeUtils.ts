/**
 * Safely checks if the user prefers dark mode using window.matchMedia
 * with optional chaining to prevent runtime errors
 */
export const prefersDarkMode = (): boolean => {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

/**
 * Safely checks if the user prefers light mode using window.matchMedia
 * with optional chaining to prevent runtime errors
 */
export const prefersLightMode = (): boolean => {
  return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ?? false;
};

/**
 * Gets the user's color scheme preference
 * Returns 'dark', 'light', or 'no-preference'
 */
export const getColorSchemePreference = (): 'dark' | 'light' | 'no-preference' => {
  if (prefersDarkMode()) return 'dark';
  if (prefersLightMode()) return 'light';
  return 'no-preference';
};
