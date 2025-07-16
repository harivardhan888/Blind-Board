import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors"; // Import CORS

const app = express();
const server = http.createServer(app);

// Enable CORS for Express
app.use(cors());

// Enable CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"], // Allowed methods
  },
});

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Blindboard Presentation Backend");
});

var currentquestion = ""

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("question", currentquestion);

  socket.on("word", (word) => {
    console.log("word received:", word);
    io.emit("word", word);
  });

  socket.on("question", (question) => {
    console.log("question received:", question);
    currentquestion = question
    io.emit("question", question);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
