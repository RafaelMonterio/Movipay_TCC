// Mirrors src/app/client/points/page.js on the web app exactly, so the
// gamification level a client sees is identical on mobile and web.
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000];
export const LEVEL_NAMES = ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
export const LEVEL_ICONS = ['🌱', '🥉', '🥈', '🥇', '💎', '👑'];

export function getLevel(pts) {
  let lvl = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (pts >= LEVEL_THRESHOLDS[i]) lvl = i;
  }
  return lvl;
}

export function getLevelProgress(pts) {
  const level = getLevel(pts);
  const nextLevel = LEVEL_THRESHOLDS[level + 1];
  const progress = nextLevel
    ? Math.round(((pts - LEVEL_THRESHOLDS[level]) / (nextLevel - LEVEL_THRESHOLDS[level])) * 100)
    : 100;
  return { level, nextLevel, progress };
}
