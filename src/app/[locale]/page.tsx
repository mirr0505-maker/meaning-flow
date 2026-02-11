"use client";

import React from 'react';
import HomeScreen from './HomeScreen';

/**
 * 흑무영님, 이제 HomePage는 복잡한 로직을 직접 가질 필요가 없습니다.
 * 모든 데이터 연동과 상태 관리는 HomeScreen 내부에서 Supabase와 직접 수행합니다.
 */
export default function HomePage() {
  return (
    <HomeScreen />
  );
}