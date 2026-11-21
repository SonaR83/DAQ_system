import { Button, Checkbox, Label, Select, TextInput } from "flowbite-react"
import { useEffect, useState } from "react"
import type { Route } from "./+types/lesson-2-use-effect"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { EventLog, useEventLog } from "~/components/EventLog"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { errorMessage, fetchLastVoltage, formatVoltage, isAbortError } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(2)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 2 · useEffect" }]
}

// Дочерний компонент с собственным таймером. Его можно скрыть и показать,
// чтобы увидеть монтирование и размонтирование (а значит, и очистку эффекта).
function Clock({ onLog }: { onLog: (text: string) => void }) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    onLog("Clock: монтирование → setInterval")
    const id = setInterval(() => setTime(new Date()), 1000)
    // Функция очистки: без неё таймер продолжил бы работать после того, как
    // компонент исчез со страницы, и пытался бы обновлять несуществующее состояние.
    return () => {
      clearInterval(id)
      onLog("Clock: cleanup → clearInterval")
    }
  }, [onLog])

  return (
    <span className="font-mono text-2xl text-gray-900 dark:text-white">
      {time.toLocaleTimeString("ru-RU")}
    </span>
  )
}

export default function LessonUseEffect() {
  const [voltage, setVoltage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [period, setPeriod] = useState(2000)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [showClock, setShowClock] = useState(true)
  const { entries, log, clear } = useEventLog()

  // ── Эффект A: пустой массив зависимостей ────────────────────────────────
  // Выполняется один раз после первого рендера (монтирования),
  // очистка — при размонтировании.
  // В режиме разработки StrictMode специально выполняет его дважды:
  // «монтирование → очистка → монтирование», чтобы проверить, что очистка написана верно.
  useEffect(() => {
    log("A: монтирование (deps = [])")
    return () => log("A: cleanup (размонтирование или проверка StrictMode)")
  }, [log])

  // ── Эффект B: зависимость от voltage ────────────────────────────────────
  // Выполняется после первого рендера и после каждого рендера,
  // в котором voltage изменилось. Рендеры из-за других состояний его не запускают.
  useEffect(() => {
    if (voltage === null) return
    log(`B: voltage изменилось → ${formatVoltage(voltage)} В (deps = [voltage])`)
  }, [voltage, log])

  // ── Эффект C: подписка на событие браузера ──────────────────────────────
  // Синхронизация с внешней системой: подписываемся в эффекте,
  // отписываемся в функции очистки.
  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = document.visibilityState === "visible"
      setIsTabVisible(visible)
      log(`C: вкладка ${visible ? "видна" : "скрыта"}`)
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    log("C: подписка на visibilitychange")
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      log("C: отписка от visibilitychange")
    }
  }, [log])

  // ── Эффект D: автоопрос устройства ──────────────────────────────────────
  // Зависит от трёх значений. Если любое из них меняется, React сначала
  // вызывает очистку старого эффекта (останавливает старый таймер),
  // а потом запускает эффект заново с новыми значениями.
  useEffect(() => {
    if (!isPolling || !isTabVisible) return

    log(`D: старт автоопроса, период ${period} мс`)
    // controller живёт в замыкании этого запуска эффекта: у каждого запуска свой
    let controller: AbortController | null = null

    const tick = async () => {
      controller?.abort() // отменяем предыдущий, ещё не завершённый запрос
      controller = new AbortController()
      try {
        const value = await fetchLastVoltage(controller.signal)
        setVoltage(value)
        setError(null)
      } catch (e) {
        if (!isAbortError(e)) setError(errorMessage(e))
      }
    }

    tick()
    const id = setInterval(tick, period)

    return () => {
      clearInterval(id)
      controller?.abort()
      log("D: cleanup → остановка таймера и отмена запроса")
    }
  }, [isPolling, period, isTabVisible, log])

  // ── Эффект E: без массива зависимостей ──────────────────────────────────
  // Выполняется после КАЖДОГО рендера. Здесь нельзя вызывать сеттер
  // без условия — получится бесконечный цикл «рендер → эффект → setState → рендер».
  useEffect(() => {
    console.log("E: эффект без зависимостей — после каждого рендера")
  })

  const measureOnce = async () => {
    try {
      setVoltage(await fetchLastVoltage())
      setError(null)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <p>
          <Code>useEffect</Code> выполняет код <b>после</b> того, как React отобразил
          компонент на экране. Он нужен для синхронизации с тем, что находится вне React:
          таймеры, сетевые запросы, подписки на события, работа с DOM. Массив
          зависимостей определяет, когда эффект запускается повторно, а функция очистки
          — как отменить то, что эффект сделал.
        </p>
      }
    >
      <DemoCard
        title="Автоопрос напряжения"
        aside={<RenderCounter />}
        observe={[
          <>
            Сразу после открытия страницы в журнале видны строки «A: монтирование» →
            «A: cleanup» → «A: монтирование»: так StrictMode в режиме разработки
            проверяет очистку. В production-сборке такого повтора нет.
          </>,
          <>
            Включите автоопрос и смените период: в журнале появится «D: cleanup», а
            затем новый «D: старт». Старый таймер остановлен, создан новый.
          </>,
          <>
            Переключитесь на другую вкладку браузера и вернитесь: эффект C изменит
            состояние, и опрос эффекта D остановится, а потом возобновится.
          </>,
          <>
            Эффект B пишет в журнал только при изменении <Code>voltage</Code>. Если
            устройство вернуло то же значение, B не запускается: React сравнивает
            зависимости через <Code>Object.is</Code>.
          </>,
        ]}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="l2-voltage">Напряжение, В</Label>
            <TextInput
              id="l2-voltage"
              className="w-44"
              value={formatVoltage(voltage)}
              readOnly
            />
          </div>
          <Button color="alternative" onClick={measureOnce}>
            Измерить один раз
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="l2-polling"
              checked={isPolling}
              onChange={(e) => setIsPolling(e.target.checked)}
            />
            <Label htmlFor="l2-polling">Автоопрос</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="l2-period">Период</Label>
            <Select
              id="l2-period"
              sizing="sm"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={1000}>1 с</option>
              <option value={2000}>2 с</option>
              <option value={5000}>5 с</option>
            </Select>
          </div>
        </div>

        <ErrorText error={error} />
        <Readout label="isPolling" value={String(isPolling)} />
        <Readout label="isTabVisible" value={String(isTabVisible)} />
        <EventLog entries={entries} onClear={clear} />
      </DemoCard>

      <DemoCard
        title="Монтирование и размонтирование"
        observe={[
          <>
            «Скрыть часы» убирает компонент <Code>Clock</Code> со страницы: React
            вызывает функцию очистки, и таймер останавливается.
          </>,
          <>
            «Показать часы» монтирует компонент заново: эффект создаёт новый таймер,
            а состояние часов инициализируется с нуля.
          </>,
        ]}
      >
        <div className="flex flex-wrap items-center gap-4">
          {showClock ? <Clock onLog={log} /> : <span className="text-gray-500">часы скрыты</span>}
          <Button color="alternative" onClick={() => setShowClock((v) => !v)}>
            {showClock ? "Скрыть часы" : "Показать часы"}
          </Button>
        </div>
      </DemoCard>
    </LessonLayout>
  )
}
