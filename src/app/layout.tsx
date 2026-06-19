import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerAI - AI-Powered Job Matching',
  description: 'Your career, matched by intelligence. Upload your CV and discover job opportunities tailored to your skills.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0f1e" />
      </head>
      <body className="bg-background text-text-primary">{children}</body>
    </html>
  );
}
