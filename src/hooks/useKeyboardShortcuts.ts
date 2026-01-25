import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onNewTask?: () => void;
  onToggleHelp?: () => void;
  onToggleDarkMode?: () => void;
  onEscape?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onToggleHelp,
  onToggleDarkMode,
  onEscape,
  onSearch,
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Escape even when typing
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Skip other shortcuts if typing
      if (isTyping) return;

      // Ignore if modifier keys are held (except for specific combos)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          onNewTask?.();
          break;
        case '?':
          e.preventDefault();
          onToggleHelp?.();
          break;
        case 'd':
          e.preventDefault();
          onToggleDarkMode?.();
          break;
        case '/':
          e.preventDefault();
          onSearch?.();
          break;
      }
    },
    [onNewTask, onToggleHelp, onToggleDarkMode, onEscape, onSearch]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'n', description: 'New task' },
  { key: 'd', description: 'Toggle dark mode' },
  { key: '/', description: 'Focus search' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Esc', description: 'Close modal / blur input' },
];
