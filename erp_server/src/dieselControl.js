import cors from "cors";
import express from "express";
import http from "http";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();
const port = 2399;

const server = http.createServer(app);

server.listen(port, () => console.log("Server running on port:", port));

app.use(cors());
app.use(express.json());

app.get("/get-diesel", async (req, res) => {
  try {
    const query = await pool.query(`
      SELECT diesel.nivel, diesel.data_medicao, unidade.id AS unidade_id, unidade.name AS unidade_nome
      FROM manutencao.diesel AS diesel
      INNER JOIN manutencao.unidade_dass AS unidade
      ON diesel.unidade_dass = unidade.id;
      `);

    const result = query.rows;
    console.log(result);

    return res.status(200).json({ response: result });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ response: "Erro ao consultar banco de dados" });
  }
});
