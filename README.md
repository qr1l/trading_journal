# Торговый журнал

Веб-приложение (PWA) для трейдера: свои торговые системы с чек-листом входа, учёт сделок
и статистика «по правилам» против «с нарушениями».

Подробное описание MVP — в [docs/mvp-spec.md](docs/mvp-spec.md).

## Стек

- React 19 + TypeScript + Vite
- Обычный CSS + CSS Modules, mobile-first, без UI-библиотек
- Данные — в `localStorage` через модуль `src/storage` (позже заменяется на Supabase)
- Тесты — Vitest

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev -- --host   # открыть с телефона в локальной сети
```

Прочие команды:

```bash
npm run build      # проверка типов + сборка
npm run test       # юнит-тесты
npm run test:watch # тесты в watch-режиме
npm run lint       # oxlint
```

## Структура

```
src/
├── app/          # провайдеры, маршруты, навигация
├── components/   # переиспользуемые UI-компоненты и layout
├── domain/       # чистая логика предметной области (валидация, нормализация)
├── lib/          # утилиты (id, склонения)
├── screens/      # экраны по разделам
├── storage/      # единственный слой доступа к данным
├── styles/       # базовые стили и CSS-переменные
└── types/        # общие типы домена
docs/
├── architecture/ # ADR — принятые архитектурные решения
├── project/      # статус проекта и changelog
└── mvp-spec.md   # исходное ТЗ
```

## Правила разработки

- Экраны **не обращаются** к `localStorage` напрямую — только через `src/storage`.
- Логика, которую можно протестировать без DOM, живёт в `domain/` и `storage/`.
- Новые разделы навигации — через `src/app/routes.ts` и `BottomNav`.
- Важные решения фиксируются в `docs/architecture/ADR-*.md`.
