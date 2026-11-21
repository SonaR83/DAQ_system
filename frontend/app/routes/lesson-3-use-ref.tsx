import { Button, Label, TextInput } from "flowbite-react"
import { useEffect, useRef, useState } from "react"
import type { Route } from "./+types/lesson-3-use-ref"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { errorMessage, fetchLastVoltage, formatVoltage } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(3)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 3 · useRef" }]
}

export default function LessonUseRef() {
  // ── Пример 1. ref и state ───────────────────────────────────────────────
  const [stateClicks, setStateClicks] = useState(0)
  // useRef(0) возвращает объект { current: 0 }. Это один и тот же объект
  // на протяжении всей жизни компонента. Изменение current НЕ вызывает рендер.
  const refClicks = useRef(0)

  // ── Пример 2. Ссылка на DOM-элемент ────────────────────────────────────
  // После монтирования React запишет в commentRef.current сам <input>.
  const commentRef = useRef<HTMLInputElement>(null)

  // ── Пример 3. Опрос по таймеру, управляемый вручную ─────────────────────
  const [voltage, setVoltage] = useState<number | null>(null)
  const [delta, setDelta] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null) // id таймера
  const lastValueRef = useRef<number | null>(null) // предыдущее значение для ΔU
  const busyRef = useRef(false) // идёт ли сейчас запрос
  const skippedRef = useRef(0) // сколько тиков пропущено, пока шёл запрос

  // Один тик опроса. Использует только ref и сеттеры, поэтому даже «старая»
  // копия функции, которую запомнил setInterval, работает правильно.
  const tick = async () => {
    if (busyRef.current) {
      // Предыдущий запрос ещё не завершился (устройство отвечает дольше периода).
      skippedRef.current += 1
      return
    }
    busyRef.current = true
    try {
      const value = await fetchLastVoltage()
      setDelta(lastValueRef.current === null ? null : value - lastValueRef.current)
      lastValueRef.current = value
      setVoltage(value)
      setError(null)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      busyRef.current = false
    }
  }

  const start = () => {
    if (timerRef.current !== null) return
    tick()
    timerRef.current = setInterval(tick, 1000)
    setIsRunning(true)
  }

  const stop = () => {
    if (timerRef.current === null) return
    clearInterval(timerRef.current)
    timerRef.current = null
    setIsRunning(false)
  }

  // При уходе со страницы таймер нужно остановить, иначе он продолжит работать.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <p>
          <Code>useRef</Code> даёт «коробку» <Code>{"{ current }"}</Code>, которая
          сохраняется между рендерами, как и состояние, но её изменение{" "}
          <b>не вызывает</b> перерисовку. Применяется для двух задач: доступ к
          DOM-элементам и хранение значений, которые не нужно показывать на экране
          (id таймеров, флаги, предыдущие значения).
        </p>
      }
    >
      <DemoCard
        title="1. ref против state"
        aside={<RenderCounter />}
        observe={[
          <>
            «ref + 1» увеличивает <Code>refClicks.current</Code>, но число на экране не
            меняется и рендеров не добавляется.
          </>,
          <>
            «state + 1» вызывает рендер, и только тогда на экране появляется
            накопленное значение ref.
          </>,
        ]}
      >
        <Readout label="stateClicks" value={stateClicks} />
        <Readout label="refClicks.current (на момент рендера)" value={refClicks.current} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setStateClicks((c) => c + 1)}>state + 1</Button>
          <Button
            color="alternative"
            onClick={() => {
              refClicks.current += 1
              console.log("refClicks.current =", refClicks.current)
            }}
          >
            ref + 1
          </Button>
        </div>
      </DemoCard>

      <DemoCard
        title="2. Доступ к DOM-элементу"
        observe={[
          <>
            Атрибут <Code>ref={"{commentRef}"}</Code> говорит React: «после
            монтирования положи этот элемент в <Code>commentRef.current</Code>».
          </>,
          <>
            Методы DOM (<Code>focus()</Code>, <Code>select()</Code>,{" "}
            <Code>scrollIntoView()</Code>) нельзя вызвать через состояние — для этого и
            нужен ref.
          </>,
        ]}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="l3-comment">Комментарий к измерению</Label>
            <TextInput id="l3-comment" ref={commentRef} className="w-72" placeholder="например, «канал 1, без нагрузки»" />
          </div>
          <Button color="alternative" onClick={() => commentRef.current?.focus()}>
            Фокус
          </Button>
          <Button color="alternative" onClick={() => commentRef.current?.select()}>
            Выделить текст
          </Button>
        </div>
      </DemoCard>

      <DemoCard
        title="3. Опрос с изменением ΔU"
        aside={<RenderCounter />}
        observe={[
          <>
            id таймера хранится в <Code>timerRef</Code>: он нужен функции{" "}
            <Code>stop</Code>, но на экран не выводится, поэтому state не нужен.
          </>,
          <>
            <Code>lastValueRef</Code> хранит предыдущее значение для расчёта ΔU.
          </>,
          <>
            Если LabVIEW отвечает дольше секунды (таймаут backend — 1,5 с), флаг{" "}
            <Code>busyRef</Code> не даст запустить второй запрос, а счётчик пропусков
            вырастет. Счётчик хранится в ref, поэтому обновляется на экране только
            вместе со следующим рендером.
          </>,
        ]}
      >
        <Readout label="Напряжение, В" value={formatVoltage(voltage)} />
        <Readout
          label="ΔU относительно прошлого, В"
          value={delta === null ? "—" : (delta >= 0 ? "+" : "") + delta.toFixed(4)}
        />
        <Readout label="Пропущено тиков (ref)" value={skippedRef.current} />
        <ErrorText error={error} />
        <div className="flex flex-wrap gap-2">
          <Button color="green" onClick={start} disabled={isRunning}>
            Старт (1 раз в секунду)
          </Button>
          <Button color="red" onClick={stop} disabled={!isRunning}>
            Стоп
          </Button>
        </div>
      </DemoCard>
    </LessonLayout>
  )
}
