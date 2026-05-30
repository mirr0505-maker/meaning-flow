// 🚀 Apple Sign In — Supabase Secret Key (JWT) 생성기
//
// 사용법:
//   node scripts/apple-jwt.mjs
//
// 결과: 터미널에 JWT 토큰 출력. 그 토큰을 Supabase Dashboard 의
// Auth → Providers → Apple → Secret Key (For OAuth) 자리에 붙여넣기.
//
// JWT 만료: 6개월. 그 후 다시 이 스크립트 돌려서 갱신 필요 (Supabase 안내 그대로).
//
// 의존성 0 — Node 내장 crypto 모듈만 사용.

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

const TEAM_ID   = "6K9JN4KDFF";
const KEY_ID    = "67UR72Y72L";
const CLIENT_ID = "com.mirr.meaningflow.signin";
const P8_PATH   = new URL("../secrets/AuthKey_67UR72Y72L.p8", import.meta.url);

// base64url — JWT 표준 인코딩 (= 패딩 제거 + URL safe)
function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const nowSec = Math.floor(Date.now() / 1000);
const expSec = nowSec + 60 * 60 * 24 * 180;   // 6개월 (Apple 최대 허용)

const header = { alg: "ES256", kid: KEY_ID };
const payload = {
  iss: TEAM_ID,
  iat: nowSec,
  exp: expSec,
  aud: "https://appleid.apple.com",
  sub: CLIENT_ID,
};

const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

let privateKey;
try {
  privateKey = readFileSync(P8_PATH, "utf8");
} catch (e) {
  console.error(`\n❌ .p8 파일을 못 찾았어요: ${P8_PATH.pathname}\n`);
  console.error("   secrets/AuthKey_67UR72Y72L.p8 로 .p8 파일을 옮겨주세요.\n");
  process.exit(1);
}

// ES256 서명 — Apple JWT 표준
const sign = createSign("SHA256");
sign.update(signingInput);
sign.end();
// Apple 은 RAW (r||s) 형식 서명 요구. DER 아님.
const derSig = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" });

const jwt = `${signingInput}.${b64url(derSig)}`;

console.log("\n────────────────────────────────────────");
console.log("Apple Sign In — Supabase Secret Key (JWT)");
console.log("────────────────────────────────────────\n");
console.log(jwt);
console.log("\n────────────────────────────────────────");
console.log(`  Team ID    : ${TEAM_ID}`);
console.log(`  Key ID     : ${KEY_ID}`);
console.log(`  Client ID  : ${CLIENT_ID}`);
console.log(`  발급 시각  : ${new Date(nowSec * 1000).toISOString()}`);
console.log(`  만료 시각  : ${new Date(expSec * 1000).toISOString()}  (180일 후)`);
console.log("────────────────────────────────────────\n");
console.log("👉 위 JWT 를 복사해 Supabase Apple Provider 의");
console.log("   'Secret Key (For OAuth)' 자리에 붙여넣고 Save.\n");
