import type { Config } from "@react-router/dev/config";

export default {
  // SSR выключен: приложение работает как обычное SPA (рендер только в браузере).
  // Так проще изучать хуки: компонент не рендерится лишний раз на сервере,
  // а console.log выводится только в консоль браузера.
  ssr: false,
} satisfies Config;
