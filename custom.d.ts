import messages from './messages/ko.json';
import { routing } from './src/shared/config/i18n/routing';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
