import { Button, Label, Spinner, TextInput } from "flowbite-react"
import { useState } from "react"
import type { Route } from "./+types/lesson-1-use-state"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { errorMessage, fetchLastVoltage, formatVoltage } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(1)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 1 · useState" }]
}

const now = () => new Date().toLocaleTimeString("ru-RU")

export default function LessonUseState() {
  // ── Пример 1. Состояние измерения ────────────────────────────────────────
  // useState(начальноеЗначение) возвращает пару [текущееЗначение, сеттер].
  // Вызов сеттера сохраняет новое значение и просит React перерисовать компонент.
  const [voltage, setVoltage] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<number[]>([])

  // ── Пример 2. Счётчик: обычное и функциональное обновление ──────────────
  const [clicks, setClicks] = useState(0)

  // ── Пример 3. Массив в состоянии: мутация против копии ──────────────────
  const [marks, setMarks] = useState<string[]>([])

  console.log("Урок 1: рендер", { voltage, isLoading, clicks, marks: marks.length })

  const measure = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const value = await fetchLastVoltage()
      setVoltage(value)
      // Новое значение зависит от старого — используем функциональную форму
      // и создаём НОВЫЙ массив (последние 10 значений).
      setHistory((prev) => [...prev, value].slice(-10))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setIsLoading(false)
    }
  }

  // Неправильно: все три вызова видят одно и то же значение clicks
  // из текущего рендера, поэтому счётчик вырастет только на 1.
  const addThreeWrong = () => {
    setClicks(clicks + 1)
    setClicks(clicks + 1)
    setClicks(clicks + 1)
  }

  // Правильно: React передаёт в функцию самое свежее значение из очереди
  // обновлений, поэтому счётчик вырастет на 3.
  const addThreeRight = () => {
    setClicks((c) => c + 1)
    setClicks((c) => c + 1)
    setClicks((c) => c + 1)
  }

  // Неправильно: меняем массив «на месте» и передаём ту же ссылку.
  // React сравнивает старое и новое значение через Object.is, видит тот же
  // объект и НЕ перерисовывает компонент.
  const addMarkMutation = () => {
    marks.push(now())
    setMarks(marks)
  }

  // Правильно: создаём новый массив.
  const addMarkCopy = () => {
    setMarks((prev) => [...prev, now()])
  }

  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <p>
          <Code>useState</Code> добавляет в функциональный компонент память, которая
          сохраняется между рендерами. Изменение состояния через сеттер — единственный
          правильный способ заставить React перерисовать компонент с новыми данными.
        </p>
      }
    >
      <DemoCard
        title="1. Измерение напряжения"
        aside={<RenderCounter />}
        observe={[
          <>
            Одно нажатие вызывает несколько сеттеров (<Code>setIsLoading</Code>,{" "}
            <Code>setError</Code>, <Code>setVoltage</Code>…), а рендеров добавляется
            всего 2: до запроса и после. React объединяет обновления в пакет.
          </>,
          <>Пока идёт запрос, кнопка заблокирована — это тоже состояние.</>,
          <>
            Если backend не запущен, ошибка показывается на странице, а не теряется
            в консоли.
          </>,
        ]}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="l1-voltage">Последнее значение, В</Label>
            <TextInput
              id="l1-voltage"
              className="w-44"
              value={formatVoltage(voltage)}
              readOnly
            />
          </div>
          <Button onClick={measure} disabled={isLoading}>
            {isLoading && <Spinner size="sm" className="me-2" light />}
            {isLoading ? "Измеряем…" : "Измерить"}
          </Button>
        </div>
        <ErrorText error={error} />
        <Readout
          label="История (последние 10)"
          value={history.length ? history.map((v) => v.toFixed(2)).join("  ") : "—"}
        />
      </DemoCard>

      <DemoCard
        title="2. Обычное и функциональное обновление"
        aside={<RenderCounter />}
        observe={[
          <>
            «+3 (неправильно)» увеличивает счётчик на 1: внутри обработчика{" "}
            <Code>clicks</Code> — это константа текущего рендера, и все три вызова
            записывают одно и то же <Code>clicks + 1</Code>.
          </>,
          <>
            «+3 (правильно)» увеличивает на 3: в <Code>{"c => c + 1"}</Code> React
            передаёт результат предыдущего обновления.
          </>,
          <>В обоих случаях рендер происходит один раз — обновления пакетные.</>,
        ]}
      >
        <Readout label="clicks" value={clicks} />
        <div className="flex flex-wrap gap-2">
          <Button color="red" onClick={addThreeWrong}>
            +3 (неправильно)
          </Button>
          <Button color="green" onClick={addThreeRight}>
            +3 (правильно)
          </Button>
          <Button color="alternative" onClick={() => setClicks(0)}>
            Сбросить
          </Button>
        </div>
      </DemoCard>

      <DemoCard
        title="3. Неизменяемость: мутация массива"
        aside={<RenderCounter />}
        observe={[
          <>
            «Мутация» не меняет экран и не добавляет рендер, хотя массив в памяти
            изменился: React получил ту же ссылку и решил, что менять нечего.
          </>,
          <>
            После нажатия «Копия» на экране появятся и «потерянные» отметки — они
            всё это время лежали в мутированном массиве.
          </>,
        ]}
      >
        <Readout label="Отметок" value={marks.length} />
        <Readout label="Отметки" value={marks.length ? marks.join(", ") : "—"} />
        <div className="flex flex-wrap gap-2">
          <Button color="red" onClick={addMarkMutation}>
            Добавить (мутация)
          </Button>
          <Button color="green" onClick={addMarkCopy}>
            Добавить (копия)
          </Button>
          <Button color="alternative" onClick={() => setMarks([])}>
            Очистить
          </Button>
        </div>
      </DemoCard>
    </LessonLayout>
  )
}
