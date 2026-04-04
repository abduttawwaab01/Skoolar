'use client';

import React from 'react';

interface SafeFormattedDateProps {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  locale?: string;
  fallback?: string;
  className?: string;
  mode?: 'toLocaleString' | 'toLocaleDateString' | 'toLocaleTimeString' | 'toISOString';
}

function formatDateValue(date: Date | string | number, mode: string, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  if (mode === 'toISOString') {
    return d.toISOString();
  } else if (mode === 'toLocaleDateString') {
    return d.toLocaleDateString(locale, options);
  } else if (mode === 'toLocaleTimeString') {
    return d.toLocaleTimeString(locale, options);
  }
  return d.toLocaleString(locale, options);
}

/**
 * A component to safely render formatted dates without causing React hydration mismatches.
 * Uses suppressHydrationWarning to handle server/client time differences.
 */
export function SafeFormattedDate({
  date,
  options = { month: 'short', day: 'numeric', year: 'numeric' },
  locale = undefined,
  fallback = '---',
  className = '',
  mode = 'toLocaleString',
}: SafeFormattedDateProps) {
  const formatted = formatDateValue(date, mode, locale, options);
  const displayValue = formatted || fallback;
  
  return (
    <span className={className} suppressHydrationWarning>
      {displayValue}
    </span>
  );
}
