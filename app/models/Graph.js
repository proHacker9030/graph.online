import {generateID} from "../helpers/generator";

export default class Graph {
  constructor(id = 1, vertexes = [], edges = []) {
    this.id = id;
    this.vertexes = vertexes;
    this.edges = edges;
  }

  addVertex(id, x, y, fill, name) {
    const vertex = {
      id,
      x,
      y,
      name,
      fill
    };
    this.vertexes.push(vertex);

    return vertex;
  }

  updateVertex(id, changes) {
    let newVertex = this.vertexes.find(vertex => vertex.id == id);

    newVertex.x = changes.x ? +changes.x : newVertex.x;
    newVertex.y = changes.y ? +changes.y : newVertex.y;
    newVertex.name = changes.name ? changes.name : newVertex.name;
    newVertex.fill = changes.fill ? changes.fill : newVertex.fill;

  }

  removeVertex(id) {
    this.vertexes = this.vertexes.filter(vertex => vertex.id != id);
    this.edges = this.edges.filter(edge => {
      if (edge.startVertexId == id) return false;
      if (edge.endVertexId == id) return false;

      return true;
    });
  }

  addEdge(
    id,
    x1,
    y1,
    x2,
    y2,
    startVertexId,
    endVertexId,
    weight,
    isOriented = false,
    stroke
  ) {
    let is_exists_edge = this.edges.find(edge => {
      if (
        edge.startVertexId == startVertexId &&
        edge.endVertexId == endVertexId
      )
        return true;

      return false;
    });

    if (is_exists_edge) return false;
    else {
      const edge = {
        id,
        x1,
        y1,
        x2,
        y2,
        startVertexId,
        endVertexId,
        weight,
        isOriented,
        stroke
      };
      this.edges.push(edge);

      return edge;
    }
  }

  updateEdgePoints(id, x1, y1, x2, y2) {
    let index = this.edges.findIndex(edge => edge.id == id);
    if (index === undefined) return false;

    let newEdge = this.edges.find(edge => edge.id == id);

    newEdge.x1 = x1;
    newEdge.x2 = x2;
    newEdge.y1 = y1;
    newEdge.y2 = y2;
    this.edges[index] = newEdge;

    return true;
  }

  removeEdge(id) {
    this.edges = this.edges.filter(edge => edge.id != id);
  }

  updateVertexes(newVertexes) {
    this.vertexes = newVertexes;
  }

  updateEdges(newEdges) {
    this.edges = newEdges;
  }

  updateEdgeStroke(edge, stroke) {
    edge.stroke = stroke;
  }
}
