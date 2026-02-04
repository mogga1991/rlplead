import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FedLeads - Federal Contractor Lead Generation',
  description: 'Find and enrich federal government contractor leads',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <SessionProvider>
            <Sidebar />
            {children}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
