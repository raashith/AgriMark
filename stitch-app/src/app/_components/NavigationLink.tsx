'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackAction } from '@/lib/telemetry';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  actionName?: string;
};

export default function NavigationLink({ href, children, className, style, actionName }: Props) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      prefetch
      className={className}
      style={style}
      onClick={() => void trackAction(actionName || `navigate:${href}`, pathname || undefined, true, undefined, { href })}
    >
      {children}
    </Link>
  );
}
