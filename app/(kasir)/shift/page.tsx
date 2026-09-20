import React from 'react';
import { fetchActiveShiftSummary } from './actions';
import ShiftClientView from './ShiftClientView';

export const dynamic = 'force-dynamic';

export default async function KasirShiftPage() {
  const summary = await fetchActiveShiftSummary();

  return <ShiftClientView initialSummary={summary} />;
}
