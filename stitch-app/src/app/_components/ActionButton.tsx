'use client';

import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { trackAction } from '@/lib/telemetry';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  actionName?: string;
};

export default function ActionButton({ actionName, onClick, disabled, children, ...props }: Props) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || busy) return;
    const started = performance.now();
    setBusy(true);
    try {
      await onClick?.(event);
      void trackAction(actionName || 'button:click', pathname || undefined, true, Math.round(performance.now() - started));
    } catch (error) {
      void trackAction(actionName || 'button:click', pathname || undefined, false, Math.round(performance.now() - started), {
        error: error instanceof Error ? error.message : 'unknown',
      });
      // Keep interaction errors inside the current page so the UI can recover.
      // Callers that need custom error rendering should catch errors in their handler.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button {...props} disabled={disabled || busy} aria-busy={busy} onClick={handleClick}>
      {busy ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
      {children}
    </button>
  );
}
