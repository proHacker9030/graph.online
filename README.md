# Тестовое задание Яппаров Н.В.
### Стек: nuxt.js, vue.js, vuetify, socket.io, vue-socket.io, vue-konva, vuex, express.js
#### При разворачивании проекта укажите url api:
1. nuxt.config.js  
`  axios: {
    baseURL: 'http://graph.api'
  },`
2. server/app.js  
`let apiUrl = 'http://graph.api';`

Задание: Поиск кратчайшего пути в графе.
Имеется граф - совокупность непустого множества вершин и ребер (наборов пар вершин).
Две вершины на графе смежны, если они соединяются общим ребром.
Путь в графе представляет собой последовательность смежных вершин.
Каждое ребро имеет вес для каждого направления (из А в В один вес, из B в А другой вес). По умолчанию, за вес можно взять расстояние между вершинами графа.
 
Необходимо найти кратчайший путь между двумя выбранными вершинами графа, направление имеет значение. 
Кратчайший путь, это набор смежных вершин с минимальной сумой весов связывающих их ребер.
 
Этапы:
 
1) REST API
Редактирование графа: создание и удаление графа, добавление вершин, удаление вершин, связывание вершин, вес ребер;
Поиск кратчайшего пути: указываем две вершины - получаем кратчайший путь;
Вся редактируемая информация должна храниться в БД.
Рекомендуемые инструменты: PHP (YII2), PostgreSQL
 
2) Реализовать визуализацию редактирования графа, используя вышеописанный REST API.
Фронтенд должен работать в браузере. 
Допускается использовать любой Javascript фреймворк.
 
3) Реализовать примитивное редактирование в совместном режиме. Т.е. отображать, в реальном времени изменения графа для всех пользователей, которые открыли интерфейс управления графом.
Для реализации этого функционала можно воспользоваться стеком Node.JS - Socket.IO


> Online graph editor

## Build Setup

``` bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
