import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { errorMessage, fetchLastVoltage, isAbortError } from "~/lib/api"
import { useInterval } from "./useInterval"

export type UseVoltageOptions = {
  /** Период автоопроса в мс; null — автоопрос выключен */
  pollMs?: number | null
  /** Сколько последних значений хранить в истории */
  historySize?: number
}

export type VoltageStats = { min: number; max: number; mean: number }

/**
 * Собственный хук: всё, что нужно компоненту для работы с напряжением.
 * Внутри — хуки из предыдущих уроков:
 *  - useState    — значение, история, ошибка, флаг загрузки (урок 1);
 *  - useEffect   — отмена запроса при размонтировании (урок 2);
 *  - useRef      — текущий AbortController, защита от параллельных запросов (урок 3);
 *  - useMemo     — статистика по истории (урок 4);
 *  - useCallback — стабильная функция measure (урок 5);
 *  - useInterval — автоопрос (собственный хук, тоже из этого урока).
 *
 * Каждый компонент, вызвавший useVoltage, получает СВОЁ независимое состояние.
 */
export function useVoltage({ pollMs = null, historySize = 20 }: UseVoltageOptions = {}) {
  const [voltage, setVoltage] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const measure = useCallback(async () => {
    // Предыдущий запрос ещё выполняется — новый не запускаем
    if (controllerRef.current) return
    const controller = new AbortController()
    controllerRef.current = controller
    setIsLoading(true)
    try {
      const value = await fetchLastVoltage(controller.signal)
      setVoltage(value)
      setError(null)
      setHistory((prev) => [...prev, value].slice(-historySize))
    } catch (e) {
      if (!isAbortError(e)) setError(errorMessage(e))
    } finally {
      controllerRef.current = null
      setIsLoading(false)
    }
  }, [historySize])

  useInterval(measure, pollMs)

  // При размонтировании отменяем незавершённый запрос
  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  const stats = useMemo<VoltageStats | null>(() => {
    if (history.length === 0) return null
    const sum = history.reduce((a, b) => a + b, 0)
    return {
      min: Math.min(...history),
      max: Math.max(...history),
      mean: sum / history.length,
    }
  }, [history])

  const reset = useCallback(() => {
    setVoltage(null)
    setHistory([])
    setError(null)
  }, [])

  return { voltage, history, stats, error, isLoading, measure, reset }
}
