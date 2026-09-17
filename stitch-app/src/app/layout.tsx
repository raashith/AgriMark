import './globals.css';
import type { Metadata } from 'next';
import Telemetry from '@/app/_components/Telemetry';

export const metadata: Metadata = {
  title: 'AgriMark — Indian Agriculture Ecosystem',
  description: 'Farmer-first agriculture operations, marketplace, logistics and AgriAI experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-IN"><body><Telemetry route="__shell__" />{children}</body></html>;
}
