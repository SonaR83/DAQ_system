import { Button, Label, Select, TextInput } from "flowbite-react"
import { memo, useCallback, useState } from "react"
import type { Route } from "./+types/lesson-5-use-callback"
import { Code, DemoCard, ErrorText, Readout } from "~/components/DemoCard"
import { LessonLayout } from "~/components/LessonLayout"
import { RenderCounter } from "~/components/RenderCounter"
import { errorMessage, fetchLastVoltage } from "~/lib/api"
import { getLesson } from "~/lessons"

const lesson = getLesson(5)

export function meta({}: Route.MetaArgs) {
  return [{ title: "Урок 5 · useCallback" }]
}

// memo() — компонент перерисовывается только тогда, когда изменился хотя бы один
// проп (сравнение через Object.is). Функция-проп считается изменившейся, если это
// другой объект функции, даже с тем же кодом внутри.
const MeasureButton = memo(function MeasureButton({
  title,
  description,
  color,
  onMeasure,
}: {
  title: string
  description: string
  color: "red" | "green" | "yellow"
  onMeasure: () => void
}) {
  console.log(`MeasureButton «${title}»: рендер`)
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        <RenderCounter />
      </div>
      <p className="grow text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <Button size="sm" color={color} onClick={onMeasure}>
        Измерить
      </Button>
    </div>
  )
})

export default function LessonUseCallback() {
  // comment не связан с измерением — он нужен, чтобы вызывать рендеры родителя
  const [comment, setComment] = useState("")
  const [precision, setPrecision] = useState(2)
  const [result, setResult] = useState<{ by: string; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Общая функция измерения. Использует только сеттеры (они стабильны),
  // поэтому список зависимостей пустой — функция создаётся один раз.
  const report = useCallback(async (by: string, digits: number) => {
    setError(null)
    try {
      const value = await fetchLastVoltage()
      setResult({ by, text: value.toFixed(digits) })
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [])

  // 1. Обычная функция: новый объект при КАЖДОМ рендере.
  //    memo в MeasureButton бесполезен — проп всегда «новый».
  const handlePlain = () => report("обычная функция", precision)

  // 2. useCallback с правильными зависимостями: функция пересоздаётся,
  //    только когда меняется precision (или report).
  const handleMemo = useCallback(
    () => report("useCallback [report, precision]", precision),
    [report, precision],
  )

  // 3. useCallback с НЕПОЛНЫМИ зависимостями (ошибка, сделано намеренно).
  //    Функция создаётся один раз и навсегда запоминает precision из первого
  //    рендера — это «устаревшее замыкание» (stale closure).
  const handleStale = useCallback(
    () => report("useCallback [report] — precision забыт", precision),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [report],
  )

  return (
    <LessonLayout
      lesson={lesson}
      intro={
        <>
          <p>
            При каждом рендере все функции, объявленные внутри компонента, создаются
            заново. Обычно это не проблема. Но если функция передаётся в дочерний
            компонент, обёрнутый в <Code>memo</Code>, или указана в зависимостях{" "}
            <Code>useEffect</Code>, новая ссылка означает «проп изменился» и «эффект
            нужно перезапустить».
          </p>
          <p>
            <Code>useCallback(функция, зависимости)</Code> возвращает одну и ту же
            функцию, пока не изменились зависимости. По сути это{" "}
            <Code>{"useMemo(() => функция, зависимости)"}</Code>.
          </p>
        </>
      }
    >
      <DemoCard
        title="Какие кнопки перерисовываются"
        observe={[
          <>
            Печатайте в «Комментарий»: рендерится родитель, а с ним и «Обычная
            функция» (каждый раз новый проп). Две кнопки с <Code>useCallback</Code>{" "}
            не перерисовываются: их проп не изменился, и <Code>memo</Code> пропускает
            рендер.
          </>,
          <>
            Смените точность: перерисуются «Обычная» и «useCallback [precision]», а
            «забытая зависимость» — нет.
          </>,
          <>
            Нажмите «Измерить» на жёлтой кнопке после смены точности: результат
            по-прежнему выводится с 2 знаками. Функция «застряла» в первом рендере.
            Поэтому в зависимостях нужно указывать все значения, которые функция
            использует.
          </>,
        ]}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="l5-precision">Знаков после запятой</Label>
            <Select
              id="l5-precision"
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
            >
              <option value={0}>0</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
            </Select>
          </div>
          <div className="flex grow flex-col gap-1">
            <Label htmlFor="l5-comment">Комментарий (вызывает рендер родителя)</Label>
            <TextInput
              id="l5-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="печатайте здесь"
            />
          </div>
          <RenderCounter label="Рендеров родителя" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MeasureButton
            title="Обычная функция"
            description="const handlePlain = () => …"
            color="red"
            onMeasure={handlePlain}
          />
          <MeasureButton
            title="useCallback [precision]"
            description="Зависимости указаны полностью"
            color="green"
            onMeasure={handleMemo}
          />
          <MeasureButton
            title="Забытая зависимость"
            description="useCallback(…, [report]) — precision не указан"
            color="yellow"
            onMeasure={handleStale}
          />
        </div>

        <ErrorText error={error} />
        <Readout label="Результат, В" value={result?.text ?? "—"} />
        <Readout label="Чем измерено" value={result?.by ?? "—"} />
      </DemoCard>
    </LessonLayout>
  )
}
