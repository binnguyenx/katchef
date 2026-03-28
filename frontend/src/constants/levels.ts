export type LevelMeta = {
  level: number;
  minXp: number;
  title: string;
  badge: string;
};

export const LEVELS: LevelMeta[] = [
  { level: 1, minXp: 0, title: 'Curious Kitten', badge: 'First Paw' },
  { level: 2, minXp: 80, title: 'Sous Paws', badge: 'Sous Paws' },
  { level: 3, minXp: 180, title: 'Prep Panther', badge: 'Prep Panther' },
  { level: 4, minXp: 320, title: 'Kitchen Whiskers', badge: 'Kitchen Whiskers' },
  { level: 5, minXp: 520, title: 'Chef Supreme', badge: 'Chef Supreme' },
];

export const getLevelMeta = (xp: number): LevelMeta =>
  [...LEVELS].reverse().find(level => xp >= level.minXp) ?? LEVELS[0];

export const getNextLevelMeta = (xp: number): LevelMeta | null =>
  LEVELS.find(level => xp < level.minXp) ?? null;

export const getLevelProgress = (xp: number) => {
  const current = getLevelMeta(xp);
  const next = getNextLevelMeta(xp);

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
      xpIntoLevel: xp - current.minXp,
      xpNeeded: 0,
      xpRemaining: 0,
    };
  }

  const span = next.minXp - current.minXp;
  const xpIntoLevel = xp - current.minXp;
  const progress = span <= 0 ? 1 : Math.min(1, xpIntoLevel / span);

  return {
    current,
    next,
    progress,
    xpIntoLevel,
    xpNeeded: span,
    xpRemaining: next.minXp - xp,
  };
};

export const getUnlockedBadges = (xp: number, existingBadges: string[] = []) => {
  const unlockedByXp = LEVELS.filter(level => xp >= level.minXp).map(level => level.badge);
  return Array.from(new Set([...existingBadges, ...unlockedByXp]));
};
