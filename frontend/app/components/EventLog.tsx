import { Button } from "flowbite-react"
import { useCallback, useState } from "react"

export type LogEntry = { id: number; time: string; text: string }

let nextId = 1

// Вспомогательный хук журнала событий для урока 2.
// Функция log обёрнута в useCallback, поэтому между рендерами это одна и та же
// функция и её можно безопасно указывать в зависимостях useEffect
// (подробнее — в уроках 5 и 6).
export function useEventLog(limit = 40) {
  const [entries, setEntries] = useState<LogEntry[]>([])

  const log = useCallback(
    (text: string) => {
      console.log(`[журнал] ${text}`)
      const entry: LogEntry = {
        id: nextId++,
        time: new Date().toLocaleTimeString("ru-RU"),
        text,
      }
      setEntries((prev) => [entry, ...prev].slice(0, limit))
    },
    [limit],
  )

  const clear = useCallback(() => setEntries([]), [])

  return { entries, log, clear }
}

export function EventLog({
  entries,
  onClear,
}: {
  entries: LogEntry[]
  onClear: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Журнал эффектов (новые сверху)
        </span>
        <Button size="xs" color="alternative" onClick={onClear}>
          Очистить
        </Button>
      </div>
      <ol className="h-60 overflow-y-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-300">
        {entries.length === 0 && <li className="text-gray-500">пусто</li>}
        {entries.map((e) => (
          <li key={e.id}>
            <span className="text-gray-500">{e.time}</span> {e.text}
          </li>
        ))}
      </ol>
    </div>
  )
}
