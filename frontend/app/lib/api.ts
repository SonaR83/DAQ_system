// Работа с backend (FastAPI). Вынесено в отдельный модуль, чтобы в уроках
// оставался только код, относящийся к хукам.

// Адрес backend можно переопределить переменной окружения VITE_API_URL.
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"

// Общие поля ответа backend: как прошёл UDP-обмен с LabVIEW
type UdpResponseBase = {
  sent_to: string
  out_encoding: string
  in_encoding: string
  from: string
  response_len: number
}

// GET /voltage/get_last_value
export type VoltageResponse = UdpResponseBase & {
  response_text: number
}

// GET /voltage/get_all
export type VoltageListResponse = UdpResponseBase & {
  response_text: number[]
}

// Запрос был отменён через AbortController (это не ошибка, а штатная ситуация)
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

// Текст ошибки для показа пользователю
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    // fetch падает без ответа, если сервер не запущен или запрос заблокирован CORS
    throw new Error(`Сервер ${API_URL} недоступен`)
  }

  if (!res.ok) {
    // FastAPI кладёт описание ошибки в поле detail (например, 504 UDP response timeout)
    let detail = res.statusText
    try {
      const body: unknown = await res.json()
      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail
      }
    } catch {
      // тело ответа не JSON — оставляем statusText
    }
    throw new Error(`Ошибка ${res.status}: ${detail}`)
  }

  return (await res.json()) as T
}

// Последнее измеренное значение напряжения, В
export async function fetchLastVoltage(signal?: AbortSignal): Promise<number> {
  const data = await getJson<VoltageResponse>("/voltage/get_last_value", signal)
  return data.response_text
}

// Все накопленные значения напряжения, В
export async function fetchVoltageList(signal?: AbortSignal): Promise<number[]> {
  const data = await getJson<VoltageListResponse>("/voltage/get_all", signal)
  return data.response_text
}

// Форматирование напряжения для вывода: null -> прочерк
export function formatVoltage(value: number | null, digits = 4): string {
  return value === null ? "—" : value.toFixed(digits)
}
