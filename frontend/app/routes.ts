import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Каждый урок — отдельная страница (маршрут).
export default [
  index("routes/home.tsx"),
  route("lesson/1", "routes/lesson-1-use-state.tsx"),
  route("lesson/2", "routes/lesson-2-use-effect.tsx"),
  route("lesson/3", "routes/lesson-3-use-ref.tsx"),
  route("lesson/4", "routes/lesson-4-use-memo.tsx"),
  route("lesson/5", "routes/lesson-5-use-callback.tsx"),
  route("lesson/6", "routes/lesson-6-custom-hooks.tsx"),
] satisfies RouteConfig;
