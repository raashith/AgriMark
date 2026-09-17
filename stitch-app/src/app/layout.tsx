import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgriMark — Indian Agriculture Ecosystem',
  description: 'Farmer-first agriculture operations, marketplace, logistics and AgriAI experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-IN"><body>{children}</body></html>;
}
