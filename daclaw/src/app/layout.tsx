import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Navigation from '@/components/layout/Navigation';
import ClientProvider from '@/components/ClientProvider';
import QAChatbot from '@/components/QAChatbot';
import AgentationDev from '@/components/AgentationDev';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DACLAW - 해커톤 올인원 플랫폼',
  description: '해커톤 탐색부터 팀 매칭, 제출, 성장 추적, 대회 운영까지 — 참가자와 운영자 모두를 위한 해커톤 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${jetbrainsMono.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Navigation />
        <ClientProvider>
          <main className="flex-1">{children}</main>
          <QAChatbot />
          <AgentationDev />
        </ClientProvider>
      </body>
    </html>
  );
}
