const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// lista de usuários conectados (em memória)
let users = [];

io.on("connection", (socket) => {
  console.log("novo cliente:", socket.id);

  // cliente envia seus dados de perfil ao entrar
  socket.on("register_user", (profile) => {
    const user = {
      id: socket.id,
      name: profile.name,
      avatar: profile.avatarPreview || null,
      online: true,
    };

    // remove se já existia e adiciona
    users = users.filter((u) => u.id !== socket.id);
    users.push(user);

    // manda lista atualizada para todos
    io.emit("users_list", users);
  });

  socket.on("send_message", (data) => {
    // para simplificar, manda para todos
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("cliente saiu:", socket.id);
    users = users.filter((u) => u.id !== socket.id);
    io.emit("users_list", users);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Servidor Socket.io rodando na porta", PORT);
});
