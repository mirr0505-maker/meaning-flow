// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "@/globals.css";
// import Navigation from "./Navigation"; // 🚀 삭제

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased select-none bg-[#FFFBF5]">
        <NextIntlClientProvider messages={messages}>
          {/* 🚀 중복 레이아웃 구조를 도려내고 children만 깔끔하게 렌더링합니다. */}
          <div className="relative min-h-screen">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}