export const VAULT_COLORS = [
  { id: 'emerald', name: 'Emerald', class: 'bg-vault-emerald' },
  { id: 'blue', name: 'Ocean', class: 'bg-vault-blue' },
  { id: 'violet', name: 'Violet', class: 'bg-vault-violet' },
  { id: 'amber', name: 'Amber', class: 'bg-vault-amber' },
  { id: 'rose', name: 'Rose', class: 'bg-vault-rose' },
  { id: 'cyan', name: 'Cyan', class: 'bg-vault-cyan' },
] as const;

export type VaultColorId = typeof VAULT_COLORS[number]['id'];

export function getVaultColorClass(colorId: string): string {
  const color = VAULT_COLORS.find(c => c.id === colorId);
  return color?.class || 'bg-vault-emerald';
}

export function getVaultColorHsl(colorId: string): string {
  const colorMap: Record<string, string> = {
    emerald: 'var(--vault-emerald)',
    blue: 'var(--vault-blue)',
    violet: 'var(--vault-violet)',
    amber: 'var(--vault-amber)',
    rose: 'var(--vault-rose)',
    cyan: 'var(--vault-cyan)',
  };
  return colorMap[colorId] || colorMap.emerald;
}
