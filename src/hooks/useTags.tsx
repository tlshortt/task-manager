import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Tag, Id } from '@/types';

interface UseTagsReturn {
  tags: Tag[] | undefined;
  isLoading: boolean;
  createTag: (name: string, color: string) => Promise<Id<'tags'>>;
  removeTag: (id: Id<'tags'>) => Promise<void>;
}

export function useTags(): UseTagsReturn {
  const tagDocs = useQuery(api.tags.list);
  const tags = tagDocs?.map((doc) => ({
    id: doc._id,
    name: doc.name,
    color: doc.color,
  }));
  const isLoading = tags === undefined;

  const createMutation = useMutation(api.tags.create);
  const removeMutation = useMutation(api.tags.remove);

  const createTag = async (name: string, color: string) => {
    const existing = tags?.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase() && tag.color === color
    );
    if (existing) {
      return existing.id as Id<'tags'>;
    }
    return await createMutation({ name, color });
  };

  const removeTag = async (id: Id<'tags'>) => {
    await removeMutation({ id });
  };

  return {
    tags,
    isLoading,
    createTag,
    removeTag,
  };
}
