import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { pool } from "./db.cjs";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 2399;

app.use(cors());
app.use(express.json());

wss.on("connection", (ws) => {
  console.log("Socket connected");

  const sendDieselData = async () => {
    try {
      const query = await pool.query(`
        SELECT * FROM manutencao.diesel 
        ORDER BY id DESC
        LIMIT 5;
      `);
      const result = query.rows;
      ws.send(JSON.stringify(result));
    } catch (error) {
      console.error("Erro ao buscar dados!", error);
    }
  };

  // Enviar dados a cada 5 segundos
  const intervalId = setInterval(sendDieselData, 7000);

  // Limpar intervalo quando a conexão é fechada
  ws.on("close", () => {
    clearInterval(intervalId);
    console.log("Socket disconnected");
  });
});

app.post("/post-diesel", async (req, res) => {
  try {
    const { nivel, unidade_dass } = req.body;

    const getDiesel = await pool.query(`
        SELECT * FROM manutencao.diesel
        ORDER BY id DESC
        LIMIT 2;
      `);

    if (getDiesel.rows[1]) {
      const lastMeasure = getDiesel.rows[1];
      const threshold = parseFloat(lastMeasure.nivel) * 0.1;

      if (nivel > parseFloat(lastMeasure.nivel) + parseFloat(threshold)) {
        await pool.query(
          `
            INSERT INTO manutencao.abastecimento (quantidade, unidade_dass)
            VALUES ($1, $2);
          `,
          [nivel - lastMeasure.nivel, unidade_dass]
        );
      }

      if (nivel < parseFloat(lastMeasure.nivel) - parseFloat(threshold)) {
        await pool.query(
          `
            INSERT INTO manutencao.consumo_diesel (saida, unidade_dass)
            VALUES ($1, $2);
          `,
          [lastMeasure.nivel - nivel, unidade_dass]
        );
      }
    }

    await pool.query(
      `
        INSERT INTO manutencao.diesel (nivel, unidade_dass)
        VALUES ($1, $2);
      `,
      [nivel, unidade_dass]
    );

    return res.status(200).json({ response: "Dados Recebidos" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ response: "Erro ao consultar dados" });
  }
});

app.get("/get-supplies", async (req, res) => {
  try {
    const query = await pool.query(`
        SELECT * FROM manutencao.abastecimento
        ORDER BY id DESC
        LIMIT 5
      `);

    const result = query.rows;

    return res.status(200).json({ response: result });
  } catch (error) {}
});

app.get("/chart-data", async (req, res) => {
  const query_supply = await pool.query(`
    SELECT * FROM manutencao.abastecimento
  `);
  const supply = query.rows;

  const query_consumption = await pool.query(`
      SELECT * FROM manutencao.consumo_diesel
    `);
  const consumption = query_consumption.rows;

  res.status(200).json(result);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
