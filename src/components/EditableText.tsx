import { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function EditableText({
  value,
  onSave,
  multiline = false,
  className = '',
  inputClassName = '',
  placeholder,
  ariaLabel,
  disabled = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (multiline) {
        textareaRef.current?.focus();
        // Place cursor at end
        textareaRef.current?.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isEditing, multiline]);

  const startEditing = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent triggering parent click handlers (like row expansion)
    setEditValue(value);
    setIsEditing(true);
  };

  const save = () => {
    const trimmed = editValue.trim();
    onSave(trimmed);
    setIsEditing(false);
  };

  const cancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cancel();
    } else if (e.key === 'Enter') {
      if (!multiline) {
        e.stopPropagation();
        save();
      } else if (!e.shiftKey) {
        e.stopPropagation();
        e.preventDefault();
        save();
      }
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          className={inputClassName}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
          rows={2}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={save}
        className={inputClassName}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div 
      onClick={startEditing} 
      className={className} 
      role="button" 
      tabIndex={0} 
      onKeyDown={(e) => { 
        if (e.key === 'Enter') startEditing(e); 
      }}
    >
      {value || placeholder}
    </div>
  );
}
