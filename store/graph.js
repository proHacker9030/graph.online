import Graph from "../app/models/Graph";

export const state = () => ({
  graph: {}
});

export const getters = {
  getGraph(state) {
    return state.graph;
  },

  getVertexes(state) {
    return state.graph.vertexes !== undefined ? state.graph.vertexes : [];
  },

  getEdges(state) {
    return state.graph.edges !== undefined ? state.graph.edges : [];
  }
};

export const mutations = {
  updateGraph(state, graph) {
    state.graph = graph;
  },
  SOCKET_addVertex(state, {id, x, y, fill, name}) {
    return state.graph.addVertex(id, x, y, fill, name);
  },
  updateVertex(state, changes) {
    state.graph.updateVertex(changes.id, changes);
  },

  SOCKET_updateVertex(state, changes) {
    state.graph.updateVertex(changes.id, changes);
  },

  updateVertexes(state, vertexes) {
    state.graph.updateVertexes(vertexes);
  },

  SOCKET_updateVertexAndEdges(state, {vertex, updatedEdges}) {
    state.graph.updateVertex(vertex.id, vertex);
    state.graph.updateEdges(updatedEdges);
  },

  SOCKET_removeVertex(state, id) {
    state.graph.removeVertex(id);
  },
  SOCKET_addEdge(state, {id, x1, y1, x2, y2, start, end, weight, isOriented, stroke}) {
    let result = state.graph.addEdge(id, x1, y1, x2, y2, start, end, weight, isOriented, stroke, );
    return result;
  },
  updateEdgePoints(state, {id, x1, y1, x2, y2}) {
    return state.graph.updateEdgePoints(id, x1, y1, x2, y2);
  },
  SOCKET_updateEdgePoints(state, {id, x1, y1, x2, y2}) {
    return state.graph.updateEdgePoints(id, x1, y1, x2, y2);
  },
  SOCKET_removeEdge(state, id) {
    state.graph.removeEdge(id);
  },

  updateEdgeStroke(state, {edge, stroke}) {
    state.graph.updateEdgeStroke(edge, stroke);
  },

  SOCKET_cleanGraph(state, id) {
    state.graph = new Graph(id);
  },
};
