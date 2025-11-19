
# Разработка фронтенда

## Требования

- Node.js v24.11.1 (или любая LTS-версия, можно и ниже)
- VS Code (Visual Studio Code)

## Создание проекта

1. Установить Node.js (LTS-версию) с официального сайта.

2. В корневой папке проекта выполнить одну из команд для создания фронтенда на Vite:

   **JavaScript (React + JS):**
   ```bash
   npm create vite@latest frontend -- --template react-js
   ```

   **TypeScript (React + TS):**
   ```bash
   npm create vite@latest frontend -- --template react-ts
   ```

3. Перейти в папку `frontend` и установить зависимости:

   ```bash
   cd frontend
   ```

## Установка UI-библиотеки Flowbite React

1. Попытаться инициализировать Flowbite React командой:

   ```bash
   npx flowbite-react@latest init
   ```

2. Если при выполнении команды возникают ошибки (иногда такое бывает на некоторых версиях Node.js под Windows), установить зависимости напрямую:

   ```bash
   npm install flowbite-react flowbite
   ```

## Подготовка компонента `Welcome`

1. Открыть в VS Code исходный компонент (например, `src/Welcome.tsx` или `src/components/Welcome.tsx`).

2. Очистить содержимое компонента (удалить стартовую разметку Vite/React).

3. Добавить импорты UI-компонентов из Flowbite React:

   ```tsx
   import { Button, Card, Label, TextInput } from "flowbite-react"
   ```

4. Добавить импорты хуков React:

   ```tsx
   import { useState, useEffect } from "react"
   ```

5. Вставить реализацию компонента `Welcome`:

   ```tsx
   import { Button, Card, Label, TextInput } from "flowbite-react"
   import { useState, useEffect } from "react"

   export function Welcome() {
     const [voltage, setVoltage] = useState(0)
     const [mean, setMean] = useState(0)
     console.log("render")

     useEffect(() => {
       // console.log('render')
     }, [voltage, setVoltage, mean, setMean])

     const getVoltage = async () => {
       const res = await fetch(`http://localhost:8000/voltage/get_last_value`, {
         method: "get",
         headers: {
           accept: "application/json",
         },
       })
       if (!res.ok) {
         throw new Error("Ошибка ответа сервера")
       }
       const data = await res.json()
       setVoltage(Number(data.response_text.toFixed(4)))
     }

     const getMean = async () => {
       const res = await fetch(`http://localhost:8000/voltage/get_all`, {
         method: "get",
         headers: {
           accept: "application/json",
         },
       })
       if (!res.ok) {
         throw new Error("Ошибка ответа сервера")
       }
       const data = await res.json()
       const sum = data.response_text.reduce((a: number, b: number) => a + b, 0)
       const meanVal: number = Number((sum / data.response_text.length).toFixed(4))
       setMean(meanVal)
     }

     return (
       <div className="flex items-center justify-center pt-16 pb-4">
         <div className="flex items-center justify-cente">
           <Card className="max-w-md w-6xl">
             <div className="max-w-xs">
               <Label className="ml-4" htmlFor="age">
                 Последнее значение напряжения
               </Label>
               <div className="flex m-2 flex-column">
                 <TextInput
                   className="m-1 w-40"
                   id="last_value"
                   type="number"
                   min={0}
                   max={120}
                   value={voltage}
                   readOnly
                 />
                 <Button className="m-1 w-40" onClick={() => getVoltage()}>
                   Измерить
                 </Button>
               </div>
             </div>
             <div className="max-w-xs">
               <Label className="ml-4" htmlFor="age">
                 Среднее
               </Label>
               <div className="flex m-2 flex-column">
                 <TextInput
                   className="m-1 w-40"
                   id="mean_value"
                   type="number"
                   min={0}
                   max={120}
                   value={mean}
                   readOnly
                 />
                 <Button className="m-1 w-40" onClick={() => getMean()}>
                   Измерить
                 </Button>
               </div>
             </div>
           </Card>
         </div>
       </div>
     )
   }
   ```

---

## Описание логики компонента `Welcome`

### Используемые состояния

- `voltage: number` — последнее измеренное значение напряжения.
- `mean: number` — среднее значение напряжения по всем измерениям.

Оба состояния инициализируются нулём и обновляются по результатам запросов к backend-сервису.

### Эффекты (`useEffect`)

```tsx
useEffect(() => {
  // console.log('render')
}, [voltage, setVoltage, mean, setMean])
```

- Эффект сейчас фактически ничего не делает (внутри только закомментированный `console.log`).
- Он будет срабатывать при изменении зависимостей `voltage`, `setVoltage`, `mean`, `setMean`.
- При необходимости внутрь можно добавить дополнительную логику (например, логирование или побочные действия).

### Функция `getVoltage`

```tsx
const getVoltage = async () => {
  const res = await fetch(`http://localhost:8000/voltage/get_last_value`, {
    method: "get",
    headers: {
      accept: "application/json",
    },
  })
  if (!res.ok) {
    throw new Error("Ошибка ответа сервера")
  }
  const data = await res.json()
  setVoltage(Number(data.response_text.toFixed(4)))
}
```

- Отправляет GET-запрос на `http://localhost:8000/voltage/get_last_value`.
- Ожидает ответ в формате JSON с полем `response_text`, содержащим числовое значение напряжения.
- Округляет значение до 4 знаков после запятой и сохраняет его в состоянии `voltage`.
- В случае ошибки HTTP-ответа выбрасывает исключение с сообщением «Ошибка ответа сервера».

### Функция `getMean`

```tsx
const getMean = async () => {
  const res = await fetch(`http://localhost:8000/voltage/get_all`, {
    method: "get",
    headers: {
      accept: "application/json",
    },
  })
  if (!res.ok) {
    throw new Error("Ошибка ответа сервера")
  }
  const data = await res.json()
  const sum = data.response_text.reduce((a: number, b: number) => a + b, 0)
  const meanVal: number = Number((sum / data.response_text.length).toFixed(4))
  setMean(meanVal)
}
```

- Отправляет GET-запрос на `http://localhost:8000/voltage/get_all`.
- Ожидает массив чисел в `data.response_text`.
- Суммирует все элементы массива, делит на их количество, получает среднее значение.
- Округляет результат до 4 знаков после запятой и сохраняет в состояние `mean`.
- В случае ошибки HTTP-ответа выбрасывает исключение с сообщением «Ошибка ответа сервера».

### Интерфейс пользователя

Компонент использует элементы из библиотеки **Flowbite React**:

- `Card` — контейнер для формы.
- `Label` — подписи к полям.
- `TextInput` — поля вывода значений (только для чтения).
- `Button` — кнопки для запуска измерений.

Разметка состоит из двух блоков:

1. **Последнее значение напряжения**
   - Поле `TextInput` с `id="last_value"`, где отображается состояние `voltage`.
   - Кнопка «Измерить», по нажатию которой вызывается `getVoltage()`.

2. **Среднее значение**
   - Поле `TextInput` с `id="mean_value"`, где отображается состояние `mean`.
   - Кнопка «Измерить», по нажатию которой вызывается `getMean()`.

Оба блока расположены внутри `Card`, который центрируется по горизонтали и имеет отступы сверху и снизу (`pt-16 pb-4`). Стили задаются с помощью классов Tailwind CSS.

---

# Компонент `Welcome` (React + TypeScript + Flowbite React)

Ниже приведён компонент `Welcome`, оформленный под TypeScript (TSX) и использующий библиотеку **Flowbite React** и утилиты Tailwind CSS. Компонент выполняет две основные задачи:

1. Получает последнее значение напряжения с backend-сервиса.
2. Получает все измерения напряжения и вычисляет среднее значение.

## Полный код компонента с комментариями

```tsx
// Импорт UI-компонентов из библиотеки Flowbite React
import { Button, Card, Label, TextInput } from "flowbite-react"

// Импорт хука useState из React для управления состоянием
import { useState } from "react"

// Тип для ответа backend при запросе "последнего значения напряжения"
// Ожидается, что сервер вернёт объект вида: { response_text: число }
type VoltageResponse = {
  response_text: number
}

// Тип для ответа backend при запросе "всех значений напряжения"
// Ожидается массив чисел: { response_text: number[] }
type VoltageListResponse = {
  response_text: number[]
}

// Функциональный компонент Welcome
// Компонент можно использовать, например, как <Welcome /> в App.tsx
export function Welcome() {
  // voltage — последнее значение напряжения, отображается в верхнем поле
  // setVoltage — функция для обновления состояния voltage
  const [voltage, setVoltage] = useState<number>(0)

  // mean — среднее значение по всем измерениям
  // setMean — функция для обновления состояния mean
  const [mean, setMean] = useState<number>(0)

  // Функция для запроса последнего значения напряжения с backend
  // GET http://localhost:8000/voltage/get_last_value
  const getLastVoltageValue = async () => {
    const res = await fetch("http://localhost:8000/voltage/get_last_value", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    // Проверка статуса HTTP-ответа
    if (!res.ok) {
      // В реальном приложении здесь можно добавить обработчик ошибок (toast, alert и т.п.)
      throw new Error("Ошибка ответа сервера")
    }

    // Приводим ответ к типу VoltageResponse
    const data: VoltageResponse = await res.json()

    // Округляем значение до 4 знаков после запятой и сохраняем в состояние
    setVoltage(Number(data.response_text.toFixed(4)))
  }

  // Функция для запроса всех значений напряжения и вычисления среднего
  // GET http://localhost:8000/voltage/get_all
  const getMean = async () => {
    const res = await fetch("http://localhost:8000/voltage/get_all", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    // Аналогичная проверка успешности ответа
    if (!res.ok) {
      throw new Error("Ошибка ответа сервера")
    }

    // Приводим ответ к типу VoltageListResponse
    const data: VoltageListResponse = await res.json()

    // Суммируем все элементы массива
    const sum = data.response_text.reduce((a, b) => a + b, 0)

    // Вычисляем среднее значение и округляем до 4 знаков после запятой
    const meanVal = Number((sum / data.response_text.length).toFixed(4))

    // Сохраняем среднее значение в состоянии
    setMean(meanVal)
  }

  // JSX-разметка компонента
  return (
    // Внешний контейнер: центрирование по горизонтали и вертикали,
    // отступы сверху и снизу
    <div className="flex items-center justify-center pt-16 pb-4">
      {/* Внутренний контейнер с карточкой */}
      <div className="flex items-center justify-center">
        {/* Карточка Flowbite для группировки элементов формы */}
        <Card className="max-w-md w-6xl">
          {/* Блок для отображения последнего значения напряжения */}
          <div className="max-w-xs">
            {/* Подпись к полю ввода, связываем через htmlFor и id */}
            <Label className="ml-4" htmlFor="last_value">
              Последнее значение напряжения
            </Label>
            {/* Контейнер с полем вывода и кнопкой */}
            <div className="flex m-2 flex-col">
              {/* Поле для отображения последнего значения напряжения */}
              <TextInput
                className="m-1 w-40"
                id="last_value"
                type="number"
                min={0}
                max={120}
                value={voltage}     // Привязка к состоянию voltage
                readOnly            // Поле только для чтения, ввод с клавиатуры запрещён
              />
              {/* Кнопка, по нажатию вызывающая getLastVoltageValue */}
              <Button className="m-1 w-40" onClick={getLastVoltageValue}>
                Измерить
              </Button>
            </div>
          </div>

          {/* Блок для отображения среднего значения напряжения */}
          <div className="max-w-xs">
            <Label className="ml-4" htmlFor="mean_value">
              Среднее
            </Label>
            <div className="flex m-2 flex-col">
              {/* Поле для отображения среднего значения */}
              <TextInput
                className="m-1 w-40"
                id="mean_value"
                type="number"
                min={0}
                max={120}
                value={mean}        // Привязка к состоянию mean
                readOnly
              />
              {/* Кнопка, по нажатию вызывающая getMean */}
              <Button className="m-1 w-40" onClick={getMean}>
                Измерить
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

---

## Пояснения по структуре и логике

### 1. Типы ответов от сервера

```ts
type VoltageResponse = {
  response_text: number
}

type VoltageListResponse = {
  response_text: number[]
}
```

Эти типы задают ожидаемый формат JSON-ответов от backend:

- `VoltageResponse` — один числовой результат (последнее значение).
- `VoltageListResponse` — массив чисел (все измерения).

Это позволяет TypeScript проверять корректность работы с данными и подсвечивать ошибки на этапе разработки.

---

### 2. Состояния React-компонента

```ts
const [voltage, setVoltage] = useState<number>(0)
const [mean, setMean] = useState<number>(0)
```

- `voltage` — отображается в верхнем `TextInput` («Последнее значение напряжения»).
- `mean` — отображается в нижнем `TextInput` («Среднее»).

Начальное значение обоих состояний — `0`.

---

### 3. Функция `getLastVoltageValue`

```ts
const getLastVoltageValue = async () => {
  const res = await fetch("http://localhost:8000/voltage/get_last_value", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Ошибка ответа сервера")
  }

  const data: VoltageResponse = await res.json()
  setVoltage(Number(data.response_text.toFixed(4)))
}
```

- Выполняет HTTP GET-запрос к endpoint’у `voltage/get_last_value`.
- Проверяет статус ответа `res.ok`.
- Читает JSON и интерпретирует его как `VoltageResponse`.
- Округляет полученное значение до 4 знаков после запятой и записывает в `voltage`.

---

### 4. Функция `getMean`

```ts
const getMean = async () => {
  const res = await fetch("http://localhost:8000/voltage/get_all", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Ошибка ответа сервера")
  }

  const data: VoltageListResponse = await res.json()
  const sum = data.response_text.reduce((a, b) => a + b, 0)
  const meanVal = Number((sum / data.response_text.length).toFixed(4))
  setMean(meanVal)
}
```

- Выполняет HTTP GET-запрос к endpoint’у `voltage/get_all`.
- Ожидает массив измерений напряжения.
- Суммирует все элементы массива и делит на их количество.
- Результат округляется до 4 знаков после запятой и записывается в `mean`.

---

### 5. Интерфейс (JSX + Flowbite React + Tailwind)

Компонент формирует простую панель с двумя блоками:

1. **Последнее значение напряжения**
   - Подпись `Label`.
   - Поле `TextInput`, связанное с состоянием `voltage`.
   - Кнопка `Button`, вызывающая `getLastVoltageValue`.

2. **Среднее значение**
   - Подпись `Label`.
   - Поле `TextInput`, связанное с состоянием `mean`.
   - Кнопка `Button`, вызывающая `getMean`.

Tailwind-классы (`flex`, `items-center`, `justify-center`, `pt-16`, `pb-4`, `m-2`, `flex-col`, `w-40` и т.д.) используются для:

- Центрирования карточки на экране.
- Задания отступов.
- Организации компонентов в колонку.
- Ограничения ширины элементов.

---

## Как использовать компонент

1. Убедитесь, что настроены:

   - **Vite + React + TypeScript**.
   - Tailwind CSS.
   - Flowbite + Flowbite React.

2. Поместите файл с компонентом, например, в `src/components/Welcome.tsx`.

3. Подключите компонент в `App.tsx`:

   ```tsx
   import { Welcome } from "./components/Welcome"

   function App() {
     return <Welcome />
   }

   export default App
   ```

4. Убедитесь, что backend-сервис доступен по адресу `http://localhost:8000` и реализует endpoints:

   - `GET /voltage/get_last_value`
   - `GET /voltage/get_all`

После этого при нажатии на кнопки «Измерить» будут выполняться запросы к backend, а результаты выводиться в соответствующие поля.
