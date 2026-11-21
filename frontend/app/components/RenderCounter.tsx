import { useEffect, useRef } from "react"

// Счётчик рендеров (точнее, коммитов) компонента, внутри которого он находится.
// При каждом обновлении число увеличивается, а бейдж кратко подсвечивается.
//
// Сам счётчик тоже написан на хуках:
//  - значение хранится в useRef, потому что изменение ref НЕ вызывает рендер
//    (если бы счётчик был в useState, каждое обновление вызывало бы новый рендер
//    и получился бы бесконечный цикл);
//  - число увеличивается в useEffect без массива зависимостей — такой эффект
//    выполняется после КАЖДОГО рендера;
//  - текст меняется напрямую в DOM через ref, без участия React.
export function RenderCounter({ label = "Рендеров" }: { label?: string }) {
  const count = useRef(0)
  const skipNext = useRef(false)
  const valueRef = useRef<HTMLSpanElement>(null)

  // В режиме разработки StrictMode имитирует размонтирование и повторное
  // монтирование: все эффекты выполняются дважды. Этот эффект помечает такую
  // ситуацию, чтобы двойной запуск не считался вторым рендером.
  useEffect(() => {
    return () => {
      skipNext.current = true
    }
  }, [])

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    count.current += 1
    const el = valueRef.current
    if (!el) return
    el.textContent = String(count.current)
    el.animate(
      [{ backgroundColor: "rgb(250 204 21)" }, { backgroundColor: "transparent" }],
      { duration: 700 },
    )
  })

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300">
      {label}:
      <span ref={valueRef} className="rounded px-1 font-mono font-semibold" />
    </span>
  )
}
