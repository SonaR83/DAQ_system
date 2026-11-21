import { Link } from "react-router"
import type { Route } from "./+types/home"
import { Code } from "~/components/DemoCard"
import { API_URL } from "~/lib/api"
import { LESSONS } from "~/lessons"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAQ · Хуки React" },
    {
      name: "description",
      content: "Учебные примеры хуков React на системе сбора данных",
    },
  ]
}

export default function Home() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Хуки React на примере системы сбора данных
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Каждый урок — отдельная страница с живыми примерами. Данные берутся с
          backend по адресу <Code>{API_URL}</Code> (эндпоинты{" "}
          <Code>/voltage/get_last_value</Code> и <Code>/voltage/get_all</Code>),
          который, в свою очередь, опрашивает LabVIEW по UDP.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Теория к каждому уроку лежит в папке <Code>frontend/docs</Code>.
          Начните с <Code>docs/README.md</Code>.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2">
        {LESSONS.map((lesson) => (
          <li key={lesson.path}>
            <Link
              to={lesson.path}
              className="flex h-full flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
            >
              <span className="text-sm text-blue-700 dark:text-blue-400">
                Урок {lesson.number} · <span className="font-mono">{lesson.hook}</span>
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {lesson.title}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lesson.summary}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
