import type { PageKey } from '../types';
import type { Profile, UserRole } from '../types/database';

const basePages: PageKey[] = ['home', 'calculator', 'species', 'rules', 'ranking', 'profile'];
const commissionPages: PageKey[] = [...basePages, 'team', 'weighing'];
const adminPages: PageKey[] = [...commissionPages, 'settings'];

export const getAllowedPages = (role: UserRole = 'participant'): PageKey[] => {
  if (role === 'admin') {
    return adminPages;
  }

  if (role === 'commission') {
    return commissionPages;
  }

  return basePages;
};

export const canAccessPage = (role: UserRole | undefined, page: PageKey) => getAllowedPages(role ?? 'participant').includes(page);

export const canManageTeams = (profile: Pick<Profile, 'role'> | null | undefined) =>
  profile?.role === 'admin' || profile?.role === 'commission';
