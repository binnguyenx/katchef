import { getLevelProgress } from '../constants/levels';

export const formatDisplayName = (displayName?: string | null, email?: string | null) => {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (email?.includes('@')) {
    return email.split('@')[0];
  }

  return 'Chef';
};

export const titleCase = (value: string) =>
  value
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

export const formatConfidence = (confidence?: number) => {
  if (typeof confidence !== 'number') {
    return 'n/a';
  }

  return `${Math.round(confidence * 100)}%`;
};

export const formatXpSummary = (xp: number) => {
  const { current, next, xpRemaining } = getLevelProgress(xp);

  if (!next) {
    return `${current.title} - Max level`;
  }

  return `${current.title} - ${xpRemaining} XP to ${next.title}`;
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
