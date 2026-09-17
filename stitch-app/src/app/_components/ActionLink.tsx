'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { trackAction } from '@/lib/telemetry';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  actionName?: string;
};

export default function ActionLink({ href, children, className, style, actionName }: Props) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  return (
    <Link
      href={href}
      prefetch
      aria-busy={busy}
      onClick={() => {
        setBusy(true);
        void trackAction(actionName || `navigate:${href}`, pathname || undefined, true, undefined, { href });
      }}
      className={className}
      style={{ ...style, opacity: busy ? 0.72 : 1, pointerEvents: busy ? 'none' : undefined }}
    >
      {busy ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
      {children}
    </Link>
  );
}
