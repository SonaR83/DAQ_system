import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { LESSONS } from "./lessons";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-gray-900 dark:text-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Показывается, пока загружается JavaScript приложения (режим SPA, ssr: false)
export function HydrateFallback() {
  return <p className="p-8 text-center text-gray-500">Загрузка…</p>;
}

function Header() {
  const base = "rounded-md px-2 py-1 text-sm whitespace-nowrap";
  const cls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${base} bg-blue-600 text-white`
      : `${base} text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800`;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-4 py-2">
        <NavLink to="/" end className={cls}>
          DAQ · Хуки React
        </NavLink>
        {LESSONS.map((lesson) => (
          <NavLink key={lesson.path} to={lesson.path} className={cls}>
            {lesson.number}. <span className="font-mono">{lesson.hook}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Ошибка";
  let details = "Произошла непредвиденная ошибка.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Ошибка";
    details =
      error.status === 404
        ? "Страница не найдена."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
