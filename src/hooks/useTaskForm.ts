import { useState } from 'react';
import type { Priority, Tag } from '@/types';

interface UseTaskFormProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority, tags?: Tag[], description?: string) => void;
}

export function useTaskForm({ onAddTask }: UseTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setShowDatePicker(false);
    setShowTagPicker(false);
    setShowDescription(false);
    setPriority('medium');
    setTags([]);
    setNewTagName('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (title.trim()) {
      onAddTask(
        title.trim(),
        dueDate,
        priority,
        tags.length > 0 ? tags : undefined,
        description.trim() || undefined
      );
      resetForm();
    }
  };

  const addTag = (color: string) => {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color,
    };
    setTags([...tags, tag]);
    setNewTagName('');
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId));
  };

  const handleDateChange = (date: Date | null) => {
    setDueDate(date ?? undefined);
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      resetForm();
    }
  };

  return {
    formState: {
      title,
      description,
      dueDate,
      showDatePicker,
      showTagPicker,
      showDescription,
      priority,
      tags,
      newTagName,
    },
    setters: {
      setTitle,
      setDescription,
      setShowDatePicker,
      setShowTagPicker,
      setShowDescription,
      setPriority,
      setNewTagName,
    },
    actions: {
      handleSubmit,
      addTag,
      removeTag,
      handleDateChange,
      handleEscape,
      resetForm
    }
  };
}
