# DAQ frontend — уроки по хукам React

Учебный интерфейс системы сбора данных: React 19 + React Router 7 (режим SPA,
`ssr: false`) + Tailwind CSS 4 + Flowbite React.

Каждая страница `/lesson/1` … `/lesson/6` демонстрирует один хук React на задаче
измерения напряжения. Теория, разбор кода и задания — в папке [`docs/`](docs/README.md).

## Запуск в режиме разработки

```bash
npm install
npm run dev
```

Приложение: <http://localhost:5173>. Backend (FastAPI) должен работать на
`http://localhost:8000`, см. [`docs/README.md`](docs/README.md#запуск).

## Команды

| Команда             | Что делает                                     |
|---------------------|------------------------------------------------|
| `npm run dev`       | dev-сервер с горячей перезагрузкой             |
| `npm run typecheck` | генерация типов маршрутов и проверка TypeScript |
| `npm run build`     | сборка статического SPA в `build/client`        |
| `npm start`         | просмотр собранной версии (`vite preview`)      |

## Docker

```bash
docker build -t daq-frontend .
docker run -p 80:80 daq-frontend   # http://localhost
```

Собранное SPA раздаёт nginx (`nginx.conf`). Неизвестные пути отдают `index.html`,
поэтому прямые ссылки вида `/lesson/3` работают.

Учтите CORS: backend разрешает запросы с `http://localhost` (порт 80) и
`http://localhost:5173`. Для другого порта добавьте адрес в
`DAQ_backend/src/core/cors.py`.
