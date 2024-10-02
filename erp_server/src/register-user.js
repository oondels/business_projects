import cors from "cors";
import crypto from "crypto";
import express from "express";

import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();
const port = 3023;

app.use(cors());
app.use(express.json());

app.listen(port, ip, () => {
  console.log(`App listening on port ${port} on ${ip}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

app.get("/get-employee", async (req, res) => {
  try {
    const { unidade, registration } = req.query;

    let query = `
            SELECT 
                lf.nome, lf.nome_setor, lf.gerente, lf.funcao, cc.codbarras
            FROM
                colaborador.lista_funcionario`;
    if (unidade === "SEST") {
      query += ` lf`;
    } else {
      query += `_${unidade.toLowerCase()} lf`;
    }

    query += `
        LEFT JOIN
            colaborador.colaboradores cc
        ON
            lf.matricula = cc.matricula
        WHERE
            lf.matricula = $1
    `;

    const result = await pool.query(query, [registration]);

    if (result.rows.length === 0) {
      return res.status(404).send("Colaborador não encontrado.");
    }
    const employee = result.rows[0];

    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.post("/register-user", async (req, res) => {
  try {
    const { user, unidade } = req.body;

    const checkUser = await pool.query(
      `
        SELECT * FROM autenticacao.usuarios
        WHERE matricula = $1
    `,
      [user.registration]
    );
    if (checkUser.rows.length > 0) {
      return res.status(403).send("Usuário já registrado!");
    }

    const hashedPassword = crypto
      .createHash("md5")
      .update(user.password)
      .digest("hex");

    if (!user.codbarras) {
      return res.status(403).send("Insira o código de barras!");
    }

    const queryUser = await pool.query(
      `
        SELECT * FROM colaborador.colaboradores
        WHERE matricula = $1
        `,
      [user.registration]
    );

    if (queryUser.rows.length === 0) {
      await pool.query(
        `
        INSERT INTO 
            colaborador.colaboradores (matricula, nome, codbarras, unidade_dass)
        VALUES
            ($1, $2, $3, $4)
    `,
        [user.registration, user.name, user.codbarras, unidade]
      );
    }

    const query = `
        INSERT INTO autenticacao.usuarios
            (createdat, updatedat, codigo_barras, matricula, nome,
            usuario, senha, funcao, setor, unidade)
        VALUES
            (NOW(), NOW(), $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const insert = await pool.query(query, [
      user.codbarras,
      user.registration,
      user.name,
      user.user,
      hashedPassword,
      user.function,
      user.department,
      unidade,
    ]);

    if (insert.rows.length === 0) {
      return res.status(400).send("Erro ao cadastrar usuário!");
    }

    return res.status(201).send(`Usuário ${user.user} cadastrado com sucesso!`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno no servidor");
  }
});
