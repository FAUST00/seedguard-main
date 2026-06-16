/**
 * Minimal className combiner — joins truthy class fragments with a space.
 * No external deps; good enough for our conditional-class needs.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
