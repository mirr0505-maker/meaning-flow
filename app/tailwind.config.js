/** @type {import('tailwindcss').Config} */
// 🚀 Meaning Flow 디자인 토큰: src/tokens.css 의 CSS 변수를 1:1 이식 (Phase 0 보존)
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#F4EFE6", deep: "#ECE5D6" },
        paper: { DEFAULT: "#FBF8F1", warm: "#F8F3E9" },
        ink:   { DEFAULT: "#1A1A1F", soft: "#5C5A53" },
        mute:  { DEFAULT: "#9A9486", light: "#B8B1A2" },
        hair:  { DEFAULT: "#DDD5C5", soft: "#E8E1D2" },
        morning: { DEFAULT: "#D8A06A", soft: "#F0DDC4" },
        day:     { DEFAULT: "#7FA37F", soft: "#C9D9C2" },
        evening: { DEFAULT: "#B8829C", soft: "#E6CFD8" },
        night: {
          DEFAULT: "#8F88B0",
          soft: "#C9C5DE",
          bg: "#14151C",
          bg2: "#1C1D26",
          bg3: "#262732",
          ink: "#E8E6E0",
          muted: "#7E7E92",
          hair: "#2D2E3A",
        },
        // 🌆 dusk — evening(통합) 모드 전용 그레이 톤. 다크 가기 전 중간 단계.
        dusk: {
          bg:   "#5A5867",
          card: "#6E6B7A",
        },
        leaf: { DEFAULT: "#7FA37F", soft: "#BFD2B4" },
      },
      borderRadius: {
        card: "18px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
