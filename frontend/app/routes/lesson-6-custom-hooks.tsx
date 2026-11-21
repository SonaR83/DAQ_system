import { Button, Checkbox, Label, Select, Spinner } from "flowbite-react"
import { useState } from "react"
import type { Route } from "./+types/lesson-6-custom-hooks"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { useVoltage } from "~/hooks/useVoltage"
import { formatVoltage } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(6)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 6 · Свои хуки" }]
}

// Компонент «канал измерения». Вся логика — в одной строке с useVoltage,
// компонент отвечает только за отображение.
function VoltageChannel({ name, defaultPeriod }: { name: string; defaultPeriod: number }) {
  const [isPolling, setIsPolling] = useState(false)
  const [period, setPeriod] = useState(defaultPeriod)
  const { voltage, history, stats, error, isLoading, measure, reset } = useVoltage({
    pollMs: isPolling ? period : null,
    historySize: 10,
  })

  const id = name.replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
        <RenderCounter />
      </div>

      <div className="font-mono text-3xl text-gray-900 dark:text-white">
        {formatVoltage(voltage)} <span className="text-base text-gray-500">В</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={measure} disabled={isLoading}>
          {isLoading && <Spinner size="sm" className="me-2" light />}
          Измерить
        </Button>
        <Button size="sm" color="alternative" onClick={reset}>
          Сброс
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-polling`}
            checked={isPolling}
            onChange={(e) => setIsPolling(e.target.checked)}
          />
          <Label htmlFor={`${id}-polling`}>Автоопрос</Label>
        </div>
        <Select
          sizing="sm"
          aria-label="Период опроса"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={1000}>1 с</option>
          <option value={2000}>2 с</option>
          <option value={5000}>5 с</option>
        </Select>
      </div>

      <ErrorText error={error} />
      <div>
        <Readout label="Измерений в истории" value={history.length} />
        <Readout label="Мин / макс, В" value={stats ? `${stats.min.toFixed(3)} / ${stats.max.toFixed(3)}` : "—"} />
        <Readout label="Среднее, В" value={stats ? stats.mean.toFixed(4) : "—"} />
      </div>
    </div>
  )
}

export default function LessonCustomHooks() {
  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <>
          <p>
            Собственный хук — это обычная функция, имя которой начинается с{" "}
            <Code>use</Code> и внутри которой вызываются другие хуки. Он позволяет
            вынести логику с состоянием из компонента и использовать её повторно.
          </p>
          <p>
            Здесь логика уроков 1–5 собрана в два хука: <Code>useInterval</Code>{" "}
            (файл <Code>app/hooks/useInterval.ts</Code>) и <Code>useVoltage</Code>{" "}
            (файл <Code>app/hooks/useVoltage.ts</Code>).
          </p>
        </>
      }
    >
      <DemoCard
        title="Два независимых канала"
        observe={[
          <>
            Оба канала вызывают один и тот же <Code>useVoltage</Code>, но у каждого своё
            состояние: история, ошибка и таймер не общие. Хук делится{" "}
            <b>логикой</b>, а не данными.
          </>,
          <>
            Включите автоопрос в одном канале: счётчик рендеров растёт только у
            него.
          </>,
          <>
            Смена периода пересоздаёт таймер внутри <Code>useInterval</Code>, а
            история измерений при этом сохраняется.
          </>,
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <VoltageChannel name="Канал A" defaultPeriod={1000} />
          <VoltageChannel name="Канал B" defaultPeriod={5000} />
        </div>
      </DemoCard>
    </LessonLayout>
  )
}
