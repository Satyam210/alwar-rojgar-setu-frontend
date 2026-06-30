import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Deterministic, brand-like logo icon for a company.
 *
 * Companies in this app come from data and have no uploaded logo, so we derive
 * a stable monogram + colour from the company name. The same name always yields
 * the same icon, giving the homepage a consistent, "branded" feel.
 */

const PALETTE = [
  { bg: '#1d4ed8', fg: '#ffffff' }, // blue
  { bg: '#b91c1c', fg: '#ffffff' }, // red
  { bg: '#b45309', fg: '#ffffff' }, // amber
  { bg: '#0f766e', fg: '#ffffff' }, // teal
  { bg: '#7c3aed', fg: '#ffffff' }, // violet
  { bg: '#be185d', fg: '#ffffff' }, // pink
  { bg: '#0369a1', fg: '#ffffff' }, // sky
  { bg: '#15803d', fg: '#ffffff' }, // green
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface CompanyLogoProps {
  name: string;
  className?: string;
}

export function CompanyLogo({ name, className }: CompanyLogoProps) {
  const color = PALETTE[hashString(name) % PALETTE.length];
  const initials = getInitials(name);

  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: color.bg, color: color.fg }}
      className={cn(
        'flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-xl text-sm font-extrabold tracking-tight shadow-sm ring-1 ring-black/5',
        className,
      )}
    >
      {initials}
    </span>
  );
}

interface CompanyBrandLogoProps {
  name: string;
  /** Absolute or base-relative URL to the brand logo. Falls back to a monogram on error. */
  src?: string;
  className?: string;
}

/**
 * Shows a company's real logo inside a neutral white tile. If no logo is
 * provided (or it fails to load), it gracefully falls back to the deterministic
 * monogram so the layout never breaks.
 */
export function CompanyBrandLogo({ name, src, className }: CompanyBrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <CompanyLogo name={name} className={cn('h-14 w-14 text-base', className)} />;
  }

  return (
    <span
      className={cn(
        'flex h-14 min-w-14 max-w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white px-2.5 py-2 shadow-sm',
        className,
      )}
    >
      <img
        src={src}
        alt={`${name} logo`}
        className="max-h-full w-auto object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
