// 🚀 Supabase 클라이언트 — RN/Web 공용
// CLAUDE.md M6 데이터 프라이버시: anon key 는 client 노출 OK (RLS 보호 전제),
// service_role 키는 절대 client 에 두지 않는다.

import "react-native-url-polyfill/auto"; // RN 의 URL/URLSearchParams 폴리필 (supabase-js 전제)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // 빌드 시점에 .env 누락을 빨리 발견하기 위한 의도적 가드
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 가 비어 있음. app/.env 확인."
  );
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,        // RN: AsyncStorage / Web: 내부적으로 localStorage 대체
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    // RN 환경에선 false (URL fragment 자동 파싱 불필요)
  },
});
