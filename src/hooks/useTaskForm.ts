import { useState } from 'react';
import type { Priority, Tag, Subtask } from '@/types';

const MAX_SUBTASKS = 10;

interface UseTaskFormProps {
  onAddTask: (title: string, dueDate?: Date, priority?: Priority, tags?: Tag[], description?: string, subtasks?: Subtask[]) => void;
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
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
    setSubtasks([]);
    setShowSubtasks(false);
    setNewSubtaskTitle('');
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim() || subtasks.length >= MAX_SUBTASKS) return;
    const subtask: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, subtask]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (title.trim()) {
      onAddTask(
        title.trim(),
        dueDate,
        priority,
        tags.length > 0 ? tags : undefined,
        description.trim() || undefined,
        subtasks.length > 0 ? subtasks : undefined
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
      subtasks,
      showSubtasks,
      newSubtaskTitle,
    },
    setters: {
      setTitle,
      setDescription,
      setShowDatePicker,
      setShowTagPicker,
      setShowDescription,
      setPriority,
      setNewTagName,
      setShowSubtasks,
      setNewSubtaskTitle,
    },
    actions: {
      handleSubmit,
      addTag,
      removeTag,
      addSubtask,
      removeSubtask,
      handleDateChange,
      handleEscape,
      resetForm
    }
  };
}
