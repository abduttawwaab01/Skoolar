'use client';

import React from 'react';
import { ParentResults } from './parent-results';

/**
 * Wrapper for ParentResults to serve as the 'Report Cards' view for parents
 * while allowing the sidebar to highlight them separately.
 */
export function ParentReportCards() {
  return <ParentResults showReportCardsInitially={true} />;
}
