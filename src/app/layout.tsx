import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WS-5000 Weather Station Dashboard',
  description: 'Live ultrasonic wind, rainfall, solar radiation, and climate telemetry from Ambient Weather WS-5000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
