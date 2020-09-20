<template>
  <div>
    <v-row class="mb-3">
      <v-col cols="12" sm="6" class="py-2">
        <v-btn-toggle v-model="action" borderless>
          <v-btn value="move">
            <span class="hidden-sm-and-down">Передвижение</span>

            <v-icon right>mdi-format-align-left</v-icon>
          </v-btn>

          <v-btn value="add_vertex">
            <span class="hidden-sm-and-down">Добавить вершину</span>

            <v-icon right>mdi-format-align-left</v-icon>
          </v-btn>

          <v-btn value="add_edge">
            <span class="hidden-sm-and-down">Добавить ребро</span>

            <v-icon right>mdi-format-align-center</v-icon>
          </v-btn>

          <v-btn value="delete">
            <span class="hidden-sm-and-down">Удалить</span>

            <v-icon right>mdi-format-align-right</v-icon>
          </v-btn>

          <v-btn @click="cleanGraph" large color="error">Удалить все</v-btn>

          <v-btn value="shortestPath" large color="primary">Поиск кратчайшего пути</v-btn>

        </v-btn-toggle>
      </v-col>
    </v-row>

    <div class="mb-3">
      <ActionInfo :text="actionText"/>
    </div>

    <client-only>
      <div>
        <v-stage
          class="white"
          ref="stage"
          :config="stageSize"
          @click="stageClick"
        >
          <v-layer
            ref="layer"
            :config="{ draggable: false}"
          >

            <v-group v-for="edge in getEdges" :key="`edge-${edge.id}`" :config="{draggable: false}">
              <v-arrow
                :config="{
                  points: [edge.x1, edge.y1, edge.x2, edge.y2],
                  tension: 2,
                  stroke: edge.stroke,
                  strokeWidth : 4,
                  pointerLength: 30,
                  pointerWidth: 20
                }"
              ></v-arrow>

              <v-label
                :config="{
                  x: edge.x1 + (edge.x2 - edge.x1) / 2 - 15,
                  y: edge.y1 + (edge.y2 - edge.y1) / 2 - 15
                }"
              >
                <v-tag :config="{ fill: 'blue' }"></v-tag>
                <v-text
                  :config="{
                    fill: 'white',
                    text: edge.weight,
                    padding: 5,
                    ...textConfig
                  }"
                ></v-text>
              </v-label>
            </v-group>
            <v-group
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @dragmove="handleDragmoveVertex(vertex.id)"
              @dragend="handleDragEnd(vertex)"
              v-for="vertex in getVertexes"
              :key="`vertex-${vertex.id}`"
              @click="vertexClick(vertex)"
              :config="{ draggable: true }"
              :ref="`vertex_${vertex.id}`"
            >
              <v-circle
                :ref="`circle${vertex.id}`"
                :config="{
                  x: vertex.x,
                  y: vertex.y,
                  fill: vertex.fill,
                  ...vertexConfig
                }"
              >
              </v-circle>

              <v-text
                :config="{
                  text: vertex.name,
                  width: vertexConfig.radius,
                  height: vertexConfig.radius,
                  x: vertex.x - 10,
                  y: vertex.y - 7,
                  fill: 'white',
                  fontStyle: 'bold',
                  ...textConfig
                }"
              ></v-text>
            </v-group>


          </v-layer>
          <!-- <v-layer ref="dragLayer"></v-layer> -->
        </v-stage>
      </div>
    </client-only>

    <AddEdgeModal
      :dialog="showAddEdgeModal"
      @addWeight="addWeight"
      @cancel="addWeight"
    />
    <AddVertexModal
      :dialog="showAddVertexModal"
      @addVertex="addVertexClick"
      @cancel="closeAddVertexModal()"
    />
  </div>
</template>

<script>
  import AddEdgeModal from "../components/AddEdgeModal";
  import AddVertexModal from "../components/AddVertexModal";
  import ActionInfo from "../components/ActionInfo";
  import {mapGetters, mapMutations} from "vuex";
  import Graph from "../app/models/Graph";

  export default {
    data() {
      return {
        graphId: 1, // в данном тестовом задании работаем всегда только с одним графом
        stageSize: {
          width: 1160,
          height: 800,
          draggable: false
        },
        vertexConfig: {
          draggable: false,
          radius: 20
        },
        textConfig: {
          fontSize: 16,
          draggable: false,
          align: "center",
          verticalAlign: "center"
        },
        action: false,
        addEdgeAction: {
          start: false,
          end: false
        },
        shortestPathAction: {
          start: false,
          end: false
        },
        showAddEdgeModal: false,
        showAddVertexModal: false,
        actionText: "Перемещайте объекты"
      };
    },
    sockets: {
      connect: function () {
        console.log("socket connected");
      }
    },
    components: {
      AddEdgeModal,
      ActionInfo,
      AddVertexModal
    },
    computed: {
      ...mapGetters("graph", ["getGraph", "getVertexes", "getEdges"]),
    },
    methods: {
      ...mapMutations("graph", [
        "updateGraph",
        "addVertex",
        "updateVertex",
        "addEdge",
        "updateEdgePoints",
        "removeVertex",
        "removeEdge",
        "updateVertexes",
        "updateEdgeStroke"
      ]),

      /**
       * Обработка кликов по сцене
       *  */
      stageClick(evt) {
        if (this.action == "add_vertex") this.addVertexClick();
        if (this.action == "delete") this.deleteClick(evt);
      },

      /**
       * Обработка кликов по вершинам
       *  */
      vertexClick(vertex) {
        if (this.action == "add_edge") this.addEdgeClick(vertex);
        if (this.action == "shortestPath") this.getShortestPath(vertex);
      },

      /**
       * Обработка кликов по добавлению вершины
       *  */
      addVertexClick(name = false) {
        if (!name) {
          this.showAddVertexModal = true;
          return;
        } else
          this.showAddVertexModal = false;
        const stage = this.$refs.stage.getStage();
        const pos = stage.getPointerPosition();

        this.$socket.emit(
          "addVertex",
          {graphId: this.graphId, x: pos.x, y: pos.y, fill: "red", name},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else
              console.log('vertex added');
          }
        );
      },

      closeAddVertexModal() {
        this.showAddVertexModal = false;
      },

      /**
       * Обработка кликов по удалению элементов
       *  */
      deleteClick(evt) {
        let target = evt.target,
          isGroup = false;

        while (target.VueComponent && target.VueComponent._name !== "<VGroup>") {
          target = target.parent;
          isGroup = true;
        }
        if (!isGroup) return false;

        const key = target.VueComponent.$vnode.key;
        if (key && key.indexOf("vertex") > -1) {
          let id = key.split("-")[1];
          this.deleteVertex(id);
        }
        if (key && key.indexOf("edge") > -1) {
          let id = key.split("-")[1];
          this.deleteEdge(id);
        }
      },

      /**
       * Добавление веса к ребру
       *  */
      addWeight(weight = false) {
        this.showAddEdgeModal = false;
        if (!weight) {
          this.resetAddingWeight();
          return;
        }
        this.addEdgeClick(this.addEdgeAction.end, weight);
      },

      /**
       * Сброс сохраненного состояния после добавления ребра
       *  */
      resetAddingWeight() {
        if (this.getVertexes.length > 0 && this.addEdgeAction.start.id)
          this.updateVertex({id: this.addEdgeAction.start.id, fill: "red"});

        this.addEdgeAction.start = false;
        this.addEdgeAction.end = false;
      },

      /**
       * Обработка клика по добавлению ребра
       *  */
      addEdgeClick(vertex, weight = false) {
        if (!this.addEdgeAction.start) {
          this.updateVertex({id: vertex.id, fill: "#7d1900"});
          this.addEdgeAction.start = vertex;
          this.actionText = "Выберите конечную вершину ребра";
        } else if (!this.addEdgeAction.end) {
          this.addEdgeAction.end = vertex;
          this.showAddEdgeModal = true;
        }

        if (this.showAddEdgeModal) return false;

        if (!this.addEdgeAction.start || !this.addEdgeAction.end) return false;

        const start_vertex_node = this.$refs[
          `circle${this.addEdgeAction.start.id}`
          ][0].getNode();
        const end_vertex_node = this.$refs[
          `circle${this.addEdgeAction.end.id}`
          ][0].getNode();

        const edge = {
          x1: start_vertex_node.absolutePosition().x,
          y1: start_vertex_node.absolutePosition().y,
          x2: end_vertex_node.absolutePosition().x,
          y2: end_vertex_node.absolutePosition().y,
          start: this.addEdgeAction.start.id,
          end: this.addEdgeAction.end.id,
          weight: weight,
          isOriented: true,
          stroke: 'blue',
        };

        this.$socket.emit(
          "addEdge",
          {graphId: this.graphId, ...edge},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else {
              console.log('edge added');
            }
            this.resetAddingWeight();
            this.actionText = "Выберите исходную вершину ребра";
          });
      },

      /**
       * Получение позиции вершины
       *  */
      getVertexPoints(vertex_id) {
        const vertex_node = this.$refs[`circle${vertex_id}`][0].getNode();

        return {x: vertex_node.absolutePosition().x, y: vertex_node.absolutePosition().y};
      },

      /**
       * Обновление координат ребер при перетаскивании
       *  */
      updateEdgePointsAfterDrag(vertex_id, updateCallback = false) {
        let vertexPoints = this.getVertexPoints(vertex_id);
        let new_edges = [];
        let new_edges_start = this.getEdges.filter(
          edge => edge.startVertexId == vertex_id
        );
        let new_edges_end = this.getEdges.filter(
          edge => edge.endVertexId == vertex_id
        );

        if (new_edges_start == undefined || new_edges_end === undefined) return;

        Array.prototype.push.apply(new_edges, new_edges_start);
        Array.prototype.push.apply(new_edges, new_edges_end);

        new_edges.forEach(new_edge => {
          let id = new_edge.id;
          let x1, y1, x2, y2;

          if (vertex_id == new_edge.startVertexId) {
            x1 = vertexPoints.x;
            y1 = vertexPoints.y;
            x2 = new_edge.x2;
            y2 = new_edge.y2;
          } else {
            x2 = vertexPoints.x;
            y2 = vertexPoints.y;
            x1 = new_edge.x1;
            y1 = new_edge.y1;
          }
          if (updateCallback)
            updateCallback({id, x1, y1, x2, y2});
        });

        return new_edges;
      },

      /**
       * Обработка перетаскивания вершин
       *  */
      handleDragmoveVertex(vertex_id) {
        if (this.getEdges.length == 0) return;

        this.updateEdgePointsAfterDrag(vertex_id, this.updateEdgePoints);
      },

      /**
       * Отсылка через сокет координат вершин и ребер после перетаскивания
       *  */
      handleDragEnd(vertex) {
        let newEdges = this.getEdges;
        let vertexPoints = this.getVertexPoints(vertex.id);
        let newVertex = {
          id: vertex.id,
          name: vertex.name,
          x: vertexPoints.x,
          y: vertexPoints.y,
          fill: vertex.fill
        };
        this.$socket.emit("updateEdgeAndVertexPoints", {graphId: this.graphId, vertex: newVertex, newEdges},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else {
              console.log('success updateEdgeAndVertexPoints');
            }
          });
      },

      /**
       * Удаление всех элементов графа
       *  */
      cleanGraph() {
        this.$socket.emit(
          "cleanGraph",
          {graphId: this.graphId},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else {
              console.log('graph cleaned');
              this.action = 'move';
            }
          }
        );
      },

      /**
       * Удаление вершины
       *  */
      deleteVertex(id) {
        this.$socket.emit(
          "removeVertex",
          {graphId: this.graphId, id},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else
              console.log('vertex deleted');
          }
        );
      },

      /**
       * Удаление ребра
       *  */
      deleteEdge(id) {
        this.$socket.emit(
          "removeEdge",
          {graphId: this.graphId, id},
          (success, message = false) => {
            if (success === 0)
              alert(message);
            else
              console.log('edge deleted');
          }
        );
      },

      handleMouseEnter() {
        this.$refs.stage.$el.style.cursor = "pointer";
      },

      handleMouseLeave() {
        this.$refs.stage.$el.style.cursor = "default";
      },


      resetEdgesColor() {
        for (let edge of this.getEdges) {
          this.updateEdgeStroke({edge, stroke: 'blue'});
        }
      },

      /**
       * Поиск кратчайшего пути
       *  */
      getShortestPath(vertex) {
        if (!this.shortestPathAction.start) {
          this.shortestPathAction.start = vertex;
          this.updateVertex({id: vertex.id, fill: "#7d1900"});
          this.resetEdgesColor();
          this.actionText = "Выберите конечную вершину для поиска кратчайшего пути";
        } else if (!this.shortestPathAction.end) {
          this.shortestPathAction.end = vertex;

          this.$axios.$get(
            `/graph-algorithms/shortest-path/?graphId=${this.graphId}&startVertexId=${this.shortestPathAction.start.id}&endVertexId=${this.shortestPathAction.end.id}`)
            .then(response => {
              this.updateVertex({id: this.shortestPathAction.start.id, fill: "red"});
              this.drawShortestPath(response);
              this.shortestPathAction.start = false;
              this.shortestPathAction.end = false;
            }).catch(error => {
            console.log(error)
          });
        }

        return false;
      },

      /**
       * Отрисовка кратчайшего пути
       *  */
      drawShortestPath(response) {
        if (!response) {
          this.actionText = `Нет пути между данными вершинами. Для нового поиска выберите исходную вершину`;
          return;
        }
        for (let key in response.path) {
          let vertexId = response.path[key];
          if (response.path[+key + 1] !== undefined) {
            let nextVertexId = response.path[+key + 1];
            let edge = this.getEdges.filter(edge => edge.startVertexId == vertexId && edge.endVertexId == nextVertexId)[0];
            this.updateEdgeStroke({edge, stroke: 'green'});
          }
        }
        this.actionText = `Длина пути = ${response.distance}. Для нового поиска выберите исходную вершину`;
      }
    },
    mounted() {
      console.log(this.$axios.defaults);
      // подключение к сокету редактируемого графа и загрузка его элементов
      this.$socket.emit(
        "graphJoin",
        {graphId: this.graphId},
        data => {
          console.log('joined to graph');
          this.$axios.$get(`${this.$axios.defaults.baseURL}/graphs/${this.graphId}/all-vertexes-and-edges`).then(response => {
            let vertexes = [], edges = [];
            for (let vertex of response.vertexes) {
              vertex.x = +vertex.x;
              vertex.y = +vertex.y;
              vertexes.push({id: vertex.id, name: vertex.name, x: vertex.x, y: vertex.y, fill: vertex.color})
            }
            for (let edge of response.edges) {
              let startVertex = vertexes.filter(vertex => vertex.id == edge.start_vertex_id)[0];
              let endVertex = vertexes.filter(vertex => vertex.id == edge.end_vertex_id)[0];
              edges.push({
                id: edge.id,
                x1: +startVertex.x,
                y1: +startVertex.y,
                x2: +endVertex.x,
                y2: +endVertex.y,
                startVertexId: startVertex.id,
                endVertexId: endVertex.id,
                weight: edge.weight,
                isOriented: edge.is_oriented,
                stroke: 'blue',
              })
            }
            let graph = new Graph(this.graphId, vertexes, edges);
            this.updateGraph(graph);
          })
        }
      );
    },

    watch: {
      action: function (value) {
        if (value != "add_edge") {
          this.resetAddingWeight();
        }
        if (value != "shortestPath") {
          this.resetEdgesColor();
          if (this.shortestPathAction.start.id)
            this.updateVertex({id: this.shortestPathAction.start.id, fill: "red"});
        }
        if (value == "add_vertex") {
          this.actionText = "Выберите область для добавления вершины";
        }
        if (value == "add_edge") {
          this.actionText = "Выберите исходную вершину ребра";
        }
        if (value == "move") {
          this.actionText = "Перемещайте объекты";
        }
        if (value == "delete") {
          this.actionText = "Кликните на область фигуры для удаления";
        }
        if (value == "shortestPath") {
          this.actionText = "Выберите исходную вершину для поиска кратчайшего пути";
        }
      }
    },

    updated() {
    }
  };
</script>
