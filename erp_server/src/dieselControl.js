import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { pool } from "./db.cjs";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 2399;

// Store the last known data for comparison
let lastData = null;

// Function to fetch the latest diesel data
const fetchLatestDieselData = async () => {
  try {
    const query = await pool.query(`
      SELECT diesel.nivel, diesel.data_medicao, unidade.id AS unidade_id, unidade.name AS unidade_nome
      FROM manutencao.diesel AS diesel
      INNER JOIN manutencao.unidade_dass AS unidade
      ON diesel.unidade_dass = unidade.id
      ORDER BY diesel.data_medicao DESC
      LIMIT 1;
    `);

    return query.rows[query.rows.length - 1];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Polling function to check for updates
const checkForUpdates = async () => {
  const newData = await fetchLatestDieselData();
  if (newData && JSON.stringify(newData) !== JSON.stringify(lastData)) {
    lastData = newData;
    io.emit("update", newData);
  }
};

// Set polling interval (e.g., every 10 seconds)
setInterval(checkForUpdates, 10000);

server.listen(port, () => console.log("Server running on port:", port));

io.on("connection", (socket) => {
  console.log("Socket connected");
  socket.emit("update", lastData);
});

app.use(cors());
app.use(express.json());

app.get("/get-diesel", async (req, res) => {
  try {
    const result = await fetchLatestDieselData();
    console.log(result);

    return res.status(200).json({ response: result });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ response: "Erro ao consultar banco de dados" });
  }
});
