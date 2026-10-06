import type { Metadata } from 'next';
import { Cormorant_Garamond, Lato } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const lato = Lato({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
});

export const metadata: Metadata = {
  title: 'Andreea & Răzvan | Invitație de nuntă',
  description: 'Invitație digitală de nuntă cu RSVP și dashboard admin.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${lato.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f7efe8] text-stone-800">{children}</body>
    </html>
  );
}
