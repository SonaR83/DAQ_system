import type { ReactNode } from "react"
import { Link } from "react-router"
import { LESSONS, type Lesson } from "~/lessons"

// Общая обёртка страницы урока: заголовок, краткое описание,
// ссылка на документацию и навигация между уроками.
export function LessonLayout({
  lesson,
  intro,
  children,
}: {
  lesson: Lesson
  intro: ReactNode
  children: ReactNode
}) {
  const prev = LESSONS.find((l) => l.number === lesson.number - 1)
  const next = LESSONS.find((l) => l.number === lesson.number + 1)
  const linkClass = "text-blue-700 hover:underline dark:text-blue-400"

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
          Урок {lesson.number} · <span className="font-mono">{lesson.hook}</span>
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {lesson.title}
        </h1>
        <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">
          {intro}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Подробная теория — в файле{" "}
          <span className="font-mono">frontend/{lesson.doc}</span>. Откройте консоль
          браузера (F12): примеры пишут туда пояснения.
        </p>
      </header>

      {children}

      <nav className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
        {prev ? (
          <Link className={linkClass} to={prev.path}>
            ← Урок {prev.number}: {prev.hook}
          </Link>
        ) : (
          <Link className={linkClass} to="/">
            ← Все уроки
          </Link>
        )}
        {next && (
          <Link className={linkClass} to={next.path}>
            Урок {next.number}: {next.hook} →
          </Link>
        )}
      </nav>
    </main>
  )
}
