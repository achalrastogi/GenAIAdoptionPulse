import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <span data-testid="theme-mode">{theme.mode}</span>
      <span data-testid="theme-background">{theme.colors.background}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove any theme classes from document
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should provide default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('theme-background')).toHaveTextContent('#ffffff');
  });

  it('should toggle between light and dark themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

    // Toggle to dark
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('theme-background')).toHaveTextContent('#111827');

    // Toggle back to light
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should set specific theme modes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Set dark theme
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // Set light theme
    fireEvent.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should persist theme preference in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Set dark theme
    fireEvent.click(screen.getByTestId('set-dark'));
    
    // Check localStorage
    expect(localStorage.getItem('genai-dashboard-theme')).toBe('dark');
  });

  it('should restore theme from localStorage', () => {
    // Set theme in localStorage before rendering
    localStorage.setItem('genai-dashboard-theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should start with dark theme
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });

  it('should apply dark class to document root when dark theme is active', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially no dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Set dark theme
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Set light theme
    fireEvent.click(screen.getByTestId('set-light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});