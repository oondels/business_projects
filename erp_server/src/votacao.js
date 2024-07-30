import cors from "cors";
import express from "express";
import { pool } from "./db.cjs";

const app = express();
const port = 3043;

app.use(cors());

app.listen(port, () => {
  console.log("Server listening on port:", port);
});

app.get("/post-choice", async (req, res) => {
  try {
    const { userRfid } = req.query;

    if (!userRfid) {
      return res.status(400).json({ error: "RFID do usuário não fornecido!" });
    }

    const result = await pool.query(
      `
      SELECT * FROM colaborador.colaboradores
      WHERE rfid = $1
      `,
      [userRfid]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Colaborador não encontrado!");
    }
    const employee = result.rows[0];

    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).send("Error ao buscar colaborador");
  }
});

app.post("/register-polling", async (req, res) => {
  try {
    const { poll } = req.query;

    const result = await pool.query(
      `
      INSERT INTO votacao.eleicoes (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *
      `,
      [poll.name, poll.startDate, poll.endDate]
    );

    console.log(result.rows[0]);
    res.send("dados enviados");
  } catch (error) {
    console.error("Error:", error);
  }
});
