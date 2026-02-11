import { getRequestConfig } from 'next-intl/server';
import { routing } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // routing 설정이 없거나 로드되지 않았을 경우를 대비한 기본값
  const locales = routing?.locales ?? ['ko', 'en'];
  const defaultLocale = routing?.defaultLocale ?? 'ko';

  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  try {
    return {
      locale,
      messages: (await import(`../../${locale}.json`)).default
    };
  } catch (error) {
    console.error(`❌ ${locale}.json 파일을 불러오는 데 실패했습니다.`, error);
    // 에러 발생 시 빈 메시지 객체를 반환하여 페이지가 멈추지 않도록 함
    return {
      locale,
      messages: {}
    };
  }
});