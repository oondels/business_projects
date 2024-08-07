import cors from "cors";
import express from "express";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

const port = 3043;
app.use(cors());
app.use(express.json());

app.listen(port, ip, () => {
  console.log(`App listening on port ${port} at ip ${ip}`);
});

app.post("/register-candidate", async (req, res) => {
  try {
    const candidateData = req.body;

    if (!candidateData.registration || typeof candidateData.registration !== "number") {
      return res.status(400).json({ result: "Matrícula do Colaborador(a) não fornecido!" });
    }

    if (!candidateData.poll) {
      return res.status(400).json({ result: "Competição não selecionado!" });
    }

    const result = await pool.query(
      `
        SELECT * FROM colaborador.lista_funcionario
        WHERE matricula = $1
      `,
      [candidateData.registration]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ result: "Colaborador(a) não Encontrado. Verifique a digitação do crachá!" });
    }

    const queryEmployee = result.rows[0];

    const registredEmployee = await pool.query(
      `
        SELECT * FROM votacao.candidatos
        WHERE matricula = $1
      `,
      [candidateData.registration]
    );

    if (registredEmployee.rows.length > 0) {
      return res.status(401).json({ result: "Colaborador(a) já esta registrado na competição." });
    }

    await pool.query(
      `
        INSERT INTO votacao.candidatos (name, matricula, gerente, nome_setor, eleicao_id, funcao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `,
      [queryEmployee.nome, candidateData.registration, queryEmployee.gerente, queryEmployee.nome_setor, candidateData.poll, queryEmployee.funcao]
    );

    return res.status(201).json({ result: `Cadastrado o colaborador(a): ${queryEmployee.nome}` });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ result: "Erro ao cadastrar Colaborador(a)" });
  }
});

app.get("/get-polls", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM votacao.eleicoes
      `);

    const polls = [result.rows];

    res.status(200).json(polls);
  } catch (error) {
    console.error("Erro ao buscar eleições: ", error);
  }
});

app.get("/get-candidates", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, gerente, nome_setor, eleicao_id
        FROM votacao.candidatos;
      `);

    const candidates = result.rows;

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).send("Erro ao buscar candidatos");
  }
});

app.get("/validate-vote", async (req, res) => {
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
      return res.status(404).send("Colaborador(a) não encontrado!");
    }

    const employee = result.rows[0];

    const checkDuplicity = await pool.query(
      `
        SELECT * FROM votacao.votos
        WHERE colaborador_matricula = $1
      `,
      [employee.matricula]
    );

    if (checkDuplicity.rows.length > 0) {
      return res.status(401).send("Colaborador ja votou");
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).send("Error ao buscar colaborador");
  }
});

app.post("/register-polling", async (req, res) => {
  try {
    const poll = req.body;
    const currentDate = new Date();
    const start = new Date(poll.startDate);
    const end = new Date(poll.endDate);

    if (!poll.name || !poll.startDate || !poll.endDate) {
      return res.status(400).send("Dados Inválidos ou não preenchidos!");
    }

    if (start < currentDate || end < currentDate) {
      return res.status(400).send("As datas devem ser posterior a data atual");
    }

    if (start > end) {
      return res.status(400).send("Data de término deve ser posterior à data de início.");
    }

    await pool.query(
      `
      INSERT INTO votacao.eleicoes (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *
      `,
      [poll.name, poll.startDate, poll.endDate]
    );

    res.status(201).send("Eleição cadastrada com Sucesso!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error:", error);
  }
});

app.post("/post-vote", async (req, res) => {
  try {
    const vote = req.body;

    await pool.query(
      `
      INSERT INTO votacao.votos (candidato_id, eleicao_id, colaborador_matricula) VALUES ($1, $2, $3) RETURNING *
      `,
      [vote.choice.id, vote.choice.eleicao_id, vote.employee.matricula]
    );

    res.status(200).json({ voto: "Voto Computado" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Erro ao computar voto!");
  }
});

app.get("/get-votes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        candidato.name as candidato_name,
        eleicao.name as poll_name,
        COUNT(v.id) as total_votos
      FROM
        votacao.votos v
        JOIN votacao.candidatos candidato ON v.candidato_id = candidato.id
        JOIN votacao.eleicoes eleicao ON v.eleicao_id = eleicao.id
      GROUP BY
        candidato.name,
        eleicao.name
      ORDER BY
        eleicao.name,
        total_votos DESC;
      `);

    const votes = result.rows;

    res.status(201).json({ result: votes });
  } catch (error) {}
});
