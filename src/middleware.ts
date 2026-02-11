import createMiddleware from 'next-intl/middleware';
import {routing} from './navigation';

export default createMiddleware({
  ...routing,
  localeDetection: false
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|ko)/:path*']
};