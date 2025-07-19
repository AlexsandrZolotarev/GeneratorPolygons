Тестовое задание
Лёгкое демо с веб-компонентами, состоящее из двух кастомных элементов:

BufferZone: генерирует случайные SVG-полигоны, поддерживает drag-and-drop в рабочую зону и хранение в localStorage.

WorkZone: принимает брошенные полигоны, отображает бесконечную сетку с осями X/Y, поддерживает панорамирование и масштабирование, а также сохраняет размещённые полигоны (с координатами) в localStorage.

Все компоненты написаны на чистых Web Components (без фреймворков), а drug and drop реализовано через SortableJS.


1. Клонировать репозиторий

    git clone <url вашего репозитория>
    cd <имя папки>

2. Установить зависимости 

    npm install

3. Запустить в режиме разработки

    npm run start

Приложение будет доступно по адресу http://localhost:8998 

4. Собрать в продакшен-режиме 

    npm run build

Структура проекта

├── public/<br />
│   └── index.html          # Главная HTML-страница<br />
├── src/<br />
│   ├── components/<br />
│   │   ├── buffer-zone/<br />
│   │   │   └── buffer-zone.js<br />
│   │   ├── work-zone/<br />
│   │   │   └── work-zone.js<br />
│   │   └── section-container/<br />
│   │       └── section-container.js<br />
│   ├── utils/<br />
│   │   ├── random.js       # getRandomNumber(min, max)<br />
│   │   └── svg-generator.js# generateSvgPolygons(container)<br />
│   └── index.js            # Точка входа (импорт компонентов)<br />
├── webpack.dev.js          # Конфигурация dev-сервера<br />
├── webpack.prod.js         # Конфигурация сборки в продакшен<br />
├── package.json<br />
└── README.md<br />

КОМПОНЕНТЫ

1. SectionContainer
* Тег: <section-container>

* Рендерит кнопки Create/Save/Reset и содержит <buffer-zone> и <work-zone>.

* Делегирует обработку кликов кнопок методам дочерних компонентов.

2. BufferZone
* Тег: <buffer-zone>

* Методы:

generatePolygons() — добавляет новый случайный SVG-полигон.

saveBufferZone() — сохраняет массив SVG-строк в localStorage под ключом polygonsBufferZone.

clearBufferZone() — очищает DOM и удаляет данные из localStorage.

Drag-and-Drop: настройка SortableJS:

group: 'polygons' для совместного перетаскивания с рабочей зоной.

sort: false — внутри буфера порядок не меняется.

3. WorkZone
* Тег: <work-zone>

* Возможности:

- CSS-сетка, создающая эффект бесконечной сетки.

- Оси X и Y с числовыми метками (с шагом 10 «мирных» единиц).

- Масштабирование (колёсико) с сохранением зоны вокруг курсора.

- Панорамирование (ЛКМ + тащить) с ограничениями по краям.

- Принимает перетаскиваемые полигоны из буфера через SortableJS.

* Методы:

- saveWorkZone() — сохраняет каждую SVG-строку и её left/top стили в localStorage под ключом polygonsWorkZone.

- clearWorkZone() — очищает содержимое и удаляет данные.

- loadPolygons() — восстанавливает сохранённые фигуры и применяет стили.
