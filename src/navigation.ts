import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['ko', 'en'] as const;

// 1. 라우팅 설정 정의
export const routing = defineRouting({
  locales,
  defaultLocale: 'ko',
  localePrefix: 'always'
});

// 2. 최신 함수인 createNavigation 사용 (에러 해결 핵심)
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
