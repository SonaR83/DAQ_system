import { Card } from "flowbite-react"
import type { ReactNode } from "react"

// Карточка с одним демонстрационным примером урока.
// observe — список того, на что обратить внимание при работе с примером.
export function DemoCard({
  title,
  aside,
  observe,
  children,
}: {
  title: string
  aside?: ReactNode
  observe?: ReactNode[]
  children: ReactNode
}) {
  return (
    <Card className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {aside}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      {observe && observe.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
          <p className="mb-1 font-semibold">Что наблюдать</p>
          <ul className="list-disc space-y-1 pl-5">
            {observe.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

// Строка «подпись: значение» моноширинным шрифтом
export function Readout({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gray-200 py-1 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-mono text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

// Фрагмент кода внутри текста
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-pink-700 dark:bg-gray-800 dark:text-pink-300">
      {children}
    </code>
  )
}

// Сообщение об ошибке запроса (ничего не выводит, если ошибки нет)
export function ErrorText({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      <span className="font-medium">Не удалось получить данные.</span> {error}
    </div>
  )
}
