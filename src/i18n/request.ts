import { getRequestConfig } from 'next-intl/server';
import { routing } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. 현재 접속한 언어(locale)를 가져옵니다.
  let locale = await requestLocale;
  
  // 2. 언어 정보가 없거나 지원하지 않는 언어라면 기본값(ko)을 사용합니다.
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 3. 최상단 messages 폴더 내의 json 파일을 불러옵니다.
    // 현재 위치가 src/i18n 이므로 ../../messages 로 접근합니다.
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});