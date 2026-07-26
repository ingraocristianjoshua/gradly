import { UniversityAdapter } from './types';
import { unipa } from './unipa';

// Registry of supported universities
export const universities: Record<string, UniversityAdapter> = {
  unipa,
};

export const getUniversity = (id: string): UniversityAdapter | undefined => universities[id];
export const getAllUniversities = () => Object.values(universities).map(u => ({ id: u.id, name: u.name }));
