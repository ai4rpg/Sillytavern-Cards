export function getQualityColor(quality: string): string {
  switch (quality) {
    case '普通':
      return 'var(--text-dim)';
    case '稀有':
      return 'var(--aq-green)';
    case '史诗':
      return 'var(--aq-orange)';
    case '传说':
      return 'var(--aq-gold)';
    default:
      return 'var(--text-light)';
  }
}
