import { useEffect, useRef } from "react"

/**
 * Вызывает callback каждые delay миллисекунд.
 * Если delay === null, таймер остановлен.
 *
 * Зачем отдельный хук, а не просто setInterval в useEffect:
 *  - callback обычно новая функция на каждом рендере. Если положить её
 *    в зависимости эффекта, таймер будет пересоздаваться при каждом рендере;
 *  - если НЕ класть, таймер будет вызывать устаревшую функцию из первого рендера.
 *
 * Решение: последняя версия callback хранится в ref, а таймер зависит
 * только от delay и всегда вызывает savedCallback.current.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // После каждого рендера, в котором callback изменился, запоминаем свежую версию
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Таймер пересоздаётся только при изменении delay
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
