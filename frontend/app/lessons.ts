// Список уроков: используется на главной странице, в меню и для навигации
// «предыдущий / следующий урок».

export type Lesson = {
  number: number
  path: string
  hook: string
  title: string
  summary: string
  doc: string
}

export const LESSONS: Lesson[] = [
  {
    number: 1,
    path: "/lesson/1",
    hook: "useState",
    title: "Состояние компонента",
    summary:
      "Храним напряжение, флаг загрузки и ошибку. Пакетное обновление, функциональная форма сеттера, неизменяемость массивов.",
    doc: "docs/01-useState.md",
  },
  {
    number: 2,
    path: "/lesson/2",
    hook: "useEffect",
    title: "Побочные эффекты",
    summary:
      "Автоопрос устройства по таймеру, подписка на события браузера, массив зависимостей, функция очистки, StrictMode.",
    doc: "docs/02-useEffect.md",
  },
  {
    number: 3,
    path: "/lesson/3",
    hook: "useRef",
    title: "Ссылки и изменяемые значения",
    summary:
      "Чем ref отличается от state, доступ к DOM-элементу, хранение id таймера и предыдущего значения для расчёта ΔU.",
    doc: "docs/03-useRef.md",
  },
  {
    number: 4,
    path: "/lesson/4",
    hook: "useMemo",
    title: "Кэширование вычислений",
    summary:
      "Статистика по серии измерений (min, max, среднее, СКО, медиана) пересчитывается только при изменении данных.",
    doc: "docs/04-useMemo.md",
  },
  {
    number: 5,
    path: "/lesson/5",
    hook: "useCallback",
    title: "Стабильные функции",
    summary:
      "useCallback + React.memo: какие дочерние компоненты перерисовываются и почему важны зависимости (устаревшее замыкание).",
    doc: "docs/05-useCallback.md",
  },
  {
    number: 6,
    path: "/lesson/6",
    hook: "Свои хуки",
    title: "useVoltage и useInterval",
    summary:
      "Собираем логику прошлых уроков в собственные хуки и используем их в двух независимых «каналах».",
    doc: "docs/06-custom-hooks.md",
  },
]

export function getLesson(number: number): Lesson {
  const lesson = LESSONS.find((l) => l.number === number)
  if (!lesson) {
    throw new Error(`Урок ${number} не найден`)
  }
  return lesson
}
