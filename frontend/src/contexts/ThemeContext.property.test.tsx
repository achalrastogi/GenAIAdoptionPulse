import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme, ThemeMode } from './ThemeContext';

// Test component for property-based testing
const PropertyTestComponent = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <span data-testid="theme-mode">{theme.mode}</span>
      <span data-testid="theme-background">{theme.colors.background}</span>
      <button 
        data-testid="set-theme" 
        onClick={() => setTheme(theme.mode === 'light' ? 'dark' : 'light')}
      >
        Set Theme
      </button>
    </div>
  );
};

describe('ThemeContext Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  /**
   * **Feature: genai-dashboard, Property 10: Theme persistence consistency**
   * **Validates: Requirements 8.4, 8.5**
   */
  it('Property 10: Theme persistence consistency - for any theme selection, preference should be persisted and restored', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as ThemeMode, 'dark' as ThemeMode),
        (selectedTheme) => {
          // Clear any previous state
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          // Render component
          const { unmount } = render(
            <ThemeProvider>
              <PropertyTestComponent />
            </ThemeProvider>
          );

          // Set the theme by simulating the setTheme call
          const TestComponentWithTheme = () => {
            const { setTheme } = useTheme();
            setTheme(selectedTheme);
            return <PropertyTestComponent />;
          };

          unmount();
          render(
            <ThemeProvider>
              <TestComponentWithTheme />
            </ThemeProvider>
          );

          // Verify theme is persisted in localStorage
          const persistedTheme = localStorage.getItem('genai-dashboard-theme');
          expect(persistedTheme).toBe(selectedTheme);

          // Unmount and re-render to test restoration
          unmount();
          render(
            <ThemeProvider>
              <PropertyTestComponent />
            </ThemeProvider>
          );

          // Verify theme is restored
          const restoredTheme = screen.getByTestId('theme-mode').textContent;
          expect(restoredTheme).toBe(selectedTheme);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: genai-dashboard, Property 11: Theme propagation completeness**
   * **Validates: Requirements 8.3**
   */
  it('Property 11: Theme propagation completeness - for any theme change, all UI components should update', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as ThemeMode, 'dark' as ThemeMode),
        (targetTheme) => {
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          const TestComponentWithThemeChange = () => {
            const { theme, setTheme } = useTheme();
            
            return (
              <div>
                <span data-testid="current-theme">{theme.mode}</span>
                <span data-testid="background-color">{theme.colors.background}</span>
                <span data-testid="text-color">{theme.colors.text}</span>
                <span data-testid="surface-color">{theme.colors.surface}</span>
                <button 
                  data-testid="change-theme" 
                  onClick={() => setTheme(targetTheme)}
                >
                  Change Theme
                </button>
              </div>
            );
          };

          render(
            <ThemeProvider>
              <TestComponentWithThemeChange />
            </ThemeProvider>
          );

          // Change to target theme
          fireEvent.click(screen.getByTestId('change-theme'));

          // Verify all theme properties are updated consistently
          expect(screen.getByTestId('current-theme')).toHaveTextContent(targetTheme);
          
          // Verify colors are consistent with the theme
          const expectedColors = targetTheme === 'light' 
            ? { background: '#ffffff', text: '#111827', surface: '#f9fafb' }
            : { background: '#111827', text: '#f9fafb', surface: '#1f2937' };

          expect(screen.getByTestId('background-color')).toHaveTextContent(expectedColors.background);
          expect(screen.getByTestId('text-color')).toHaveTextContent(expectedColors.text);
          expect(screen.getByTestId('surface-color')).toHaveTextContent(expectedColors.surface);

          // Verify document class is updated
          const shouldHaveDarkClass = targetTheme === 'dark';
          expect(document.documentElement.classList.contains('dark')).toBe(shouldHaveDarkClass);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Theme state consistency - theme object should always be valid', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light' as ThemeMode, 'dark' as ThemeMode),
        (themeMode) => {
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          const ThemeValidationComponent = () => {
            const { theme, setTheme } = useTheme();
            
            // Set the theme
            setTheme(themeMode);
            
            return (
              <div>
                <span data-testid="theme-valid">
                  {JSON.stringify({
                    hasMode: typeof theme.mode === 'string',
                    hasColors: typeof theme.colors === 'object',
                    hasBackground: typeof theme.colors.background === 'string',
                    hasText: typeof theme.colors.text === 'string',
                    modeIsValid: theme.mode === 'light' || theme.mode === 'dark'
                  })}
                </span>
              </div>
            );
          };

          render(
            <ThemeProvider>
              <ThemeValidationComponent />
            </ThemeProvider>
          );

          const validationResult = JSON.parse(
            screen.getByTestId('theme-valid').textContent || '{}'
          );

          // All validation checks should pass
          expect(validationResult.hasMode).toBe(true);
          expect(validationResult.hasColors).toBe(true);
          expect(validationResult.hasBackground).toBe(true);
          expect(validationResult.hasText).toBe(true);
          expect(validationResult.modeIsValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});