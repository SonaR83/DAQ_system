import { Button, Checkbox, Label, Spinner, TextInput } from "flowbite-react"
import { useMemo, useState } from "react"
import type { Route } from "./+types/lesson-4-use-memo"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { errorMessage, fetchVoltageList } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(4)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 4 · useMemo" }]
}

type Stats = {
  count: number
  min: number
  max: number
  mean: number
  std: number
  median: number
  ms: number // сколько миллисекунд занял расчёт
  computedAt: string // когда выполнен расчёт
}

// «Дорогая» функция: несколько проходов по массиву и сортировка копии.
// Это обычная чистая функция, она ничего не знает о React.
function computeStats(samples: number[]): Stats | null {
  console.log(`computeStats: пересчёт для ${samples.length} точек`)
  if (samples.length === 0) return null
  const t0 = performance.now()

  let min = Infinity
  let max = -Infinity
  let sum = 0
  for (const v of samples) {
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }
  const mean = sum / samples.length

  let squares = 0
  for (const v of samples) squares += (v - mean) ** 2
  const std = Math.sqrt(squares / samples.length)

  const sorted = [...samples].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

  const t = new Date()
  return {
    count: samples.length,
    min,
    max,
    mean,
    std,
    median,
    ms: performance.now() - t0,
    computedAt: `${t.toLocaleTimeString("ru-RU")}.${String(t.getMilliseconds()).padStart(3, "0")}`,
  }
}

// Синтетический сигнал: 14,2 В + синусоида + шум. Нужен, чтобы урок работал
// без LabVIEW и чтобы на большом массиве была заметна цена вычислений.
function generateSamples(n: number): number[] {
  return Array.from(
    { length: n },
    (_, i) => 14.2 + 0.05 * Math.sin(i / 50) + (Math.random() - 0.5) * 0.02,
  )
}

export default function LessonUseMemo() {
  const [samples, setSamples] = useState<number[]>([])
  const [source, setSource] = useState("нет данных")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Состояние, которое НЕ влияет на статистику, но вызывает рендеры
  const [comment, setComment] = useState("")
  const [isMemoEnabled, setIsMemoEnabled] = useState(true)

  // useMemo вызывает computeStats при первом рендере и потом только тогда,
  // когда изменилась ссылка samples. В остальных рендерах возвращает
  // сохранённый результат.
  const memoStats = useMemo(() => computeStats(samples), [samples])

  // Хуки нельзя вызывать внутри условий: порядок вызовов хуков должен быть
  // одинаковым в каждом рендере. Поэтому useMemo вызывается всегда, а условие —
  // только при выборе, какой результат показать.
  const stats = isMemoEnabled ? memoStats : computeStats(samples)

  const loadFromDevice = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const values = await fetchVoltageList()
      setSamples(values)
      setSource(`устройство (${values.length} точек)`)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setIsLoading(false)
    }
  }

  const loadDemo = (n: number) => {
    setSamples(generateSamples(n))
    setSource(`демо-данные (${n.toLocaleString("ru-RU")} точек)`)
  }

  const fmt = (v: number | undefined, digits = 4) => (v === undefined ? "—" : v.toFixed(digits))

  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <p>
          <Code>useMemo(вычисление, зависимости)</Code> запоминает результат вычисления
          между рендерами и пересчитывает его только при изменении зависимостей. Хук
          нужен, когда расчёт заметно дорогой, а компонент часто перерисовывается по
          другим причинам.
        </p>
      }
    >
      <DemoCard
        title="Статистика по серии измерений"
        aside={<RenderCounter />}
        observe={[
          <>
            Загрузите 1 000 000 демо-точек и печатайте в поле «Комментарий». С
            включённым <Code>useMemo</Code> время расчёта не меняется: результат
            взят из кэша, и ввод не тормозит.
          </>,
          <>
            Выключите <Code>useMemo</Code>: каждое нажатие клавиши перезапускает расчёт
            (время в строке «Рассчитано» обновляется), ввод начинает заметно
            подтормаживать, а в консоли появляются сообщения «computeStats: пересчёт».
          </>,
          <>
            Повторная загрузка тех же данных всё равно вызывает пересчёт: создан новый
            массив, ссылка изменилась.
          </>,
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadFromDevice} disabled={isLoading}>
            {isLoading && <Spinner size="sm" className="me-2" light />}
            Загрузить с устройства
          </Button>
          <Button color="alternative" onClick={() => loadDemo(10_000)}>
            Демо: 10 000
          </Button>
          <Button color="alternative" onClick={() => loadDemo(1_000_000)}>
            Демо: 1 000 000
          </Button>
        </div>
        <ErrorText error={error} />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="l4-memo"
              checked={isMemoEnabled}
              onChange={(e) => setIsMemoEnabled(e.target.checked)}
            />
            <Label htmlFor="l4-memo">Использовать useMemo</Label>
          </div>
          <div className="flex grow items-center gap-2">
            <Label htmlFor="l4-comment">Комментарий</Label>
            <TextInput
              id="l4-comment"
              className="grow"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="печатайте здесь"
            />
          </div>
        </div>

        <div>
          <Readout label="Источник" value={source} />
          <Readout label="Точек" value={stats?.count ?? 0} />
          <Readout label="Минимум, В" value={fmt(stats?.min)} />
          <Readout label="Максимум, В" value={fmt(stats?.max)} />
          <Readout label="Среднее, В" value={fmt(stats?.mean)} />
          <Readout label="Медиана, В" value={fmt(stats?.median)} />
          <Readout label="СКО, В" value={fmt(stats?.std, 5)} />
          <Readout
            label="Рассчитано"
            value={stats ? `${stats.computedAt}, за ${stats.ms.toFixed(1)} мс` : "—"}
          />
        </div>
      </DemoCard>
    </LessonLayout>
  )
}
