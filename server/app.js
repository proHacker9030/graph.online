const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const axios = require("axios");

let apiUrl = 'http://graph.api';

io.on("connection", socket => {

  socket.on('graphJoin', (data, cb) => {
    socket.join(data.graphId);
    cb();
  });

  socket.on("addVertex", (data, cb) => {
    axios.post(`${apiUrl}/vertices`, {
      graph_id: data.graphId, name: data.name,
      x: data.x, y: data.y, color: data.fill
    }).then(response => {
      let result = {
        id: response.data.id,
        x: response.data.x,
        y: response.data.y,
        fill: response.data.color,
        name: response.data.name
      };
      socket.emit("addVertex", result);
      cb(1);
      socket.broadcast
        .to(data.graphId)
        .emit("addVertex", result);
    }).catch(error => {
      cb(0, error);
    });
  });

  socket.on("removeVertex", (data, cb) => {
    axios.delete(`${apiUrl}/vertices/${data.id}`).then(response => {
      socket.emit("removeVertex", data.id);
      cb(1);
      socket.broadcast
        .to(data.graphId)
        .emit("removeVertex", data.id);
    }).catch(error => {
      cb(0, error);
    });
  });

  socket.on("addEdge", (data, cb) => {
    axios.post(`${apiUrl}/edges`, {
      graph_id: data.graphId, is_oriented: data.isOriented,
      start_vertex_id: data.start, end_vertex_id: data.end, weight: data.weight
    }).then(response => {
      socket.emit("addEdge", {id: response.data.id, ...data});
      cb();
      socket.broadcast
        .to(data.graphId)
        .emit("addEdge", {id: response.data.id, ...data});
    }).catch(error => {
      cb(0, error);
    });
  });

  socket.on("removeEdge", (data, cb) => {
    axios.delete(`${apiUrl}/edges/${data.id}`).then(response => {
      socket.emit("removeEdge", data.id);
      cb(1);
      socket.broadcast
        .to(data.graphId)
        .emit("removeEdge", data.id);
    }).catch(error => {
      cb(0, error);
    });
  });

  socket.on("updateEdgeAndVertexPoints", (data, cb) => {
    let vertex = data.vertex;
    axios.put(`${apiUrl}/vertices/${vertex.id}`, {
      id: vertex.id,
      graph_id: vertex.graph_id,
      name: vertex.name,
      x: vertex.x,
      y: vertex.y,
    }).then(response => {
      vertex.x = response.data.x;
      vertex.y = response.data.y;
      cb();
      socket.broadcast
        .to(data.graphId)
        .emit("updateVertexAndEdges", {vertex, updatedEdges: data.newEdges});
    }).catch(error => {
      cb(0, error);
    });
  });

  socket.on("cleanGraph", (data, cb) => {
    axios.delete(`${apiUrl}/graphs/${data.graphId}/clean`).then(response => {
      socket.emit("cleanGraph", data.graphId);
      cb(1);
      socket.broadcast
        .to(data.graphId)
        .emit("cleanGraph", data.graphId);
    }).catch(error => {
      cb(0, error);
    });
  });

});

module.exports = {
  app,
  server
};

