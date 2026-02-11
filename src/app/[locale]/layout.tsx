// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "@/globals.css";
import Navigation from "./Navigation";

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
          <div className="relative min-h-screen pb-24"> {/* 네비바 높이만큼 여백 확보 */}
            {children}
            
            {/* 네비바를 하단에 고정 (광고 영역 삭제) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100">
              <Navigation />
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}