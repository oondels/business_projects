import cors from "cors";
import express from "express";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

app.use(cors());
app.use(express.json());

const port = 3043;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, ip, () => console.log(`App listening on port ${port}!`));

app.get("/colaboradores", async (req, res) => {
  try {
    const matricula = req.query.matricula;
    const colaboradores = await pool.query(
      `SELECT nome, gerente, nome_setor FROM colaborador.lista_funcionario WHERE matricula = $1 LIMIT 1`,
      [matricula]
    );

    return res.status(200).json(colaboradores.rows[0]);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/produtos", async (req, res) => {
  try {
    const { codigo, ordem, colaborador } = req.body;

    if (
      !codigo ||
      !ordem ||
      !colaborador.matricula ||
      !colaborador.nome ||
      !colaborador.gerente ||
      !colaborador.setor
    ) {
      return res.status(422).send("Dados inválidos ou ausentes");
    }

    const verificaDisponibilidade = await pool.query(
      "SELECT * FROM produtos.produtos_cadastrados WHERE codigo = $1 OR ordem = $2",
      [codigo, ordem]
    );
    if (verificaDisponibilidade.rowCount > 0) {
      return res.status(409).send("Código ou ordem já cadastrados");
    }

    const produtos = await pool.query(
      `INSERT INTO produtos.produtos_cadastrados (createdate, codigo, ordem, matricula, nome, gerente, setor) VALUES ('NOW()', $1, $2, $3, $4, $5, $6)`,
      [
        codigo,
        ordem,
        colaborador.matricula,
        colaborador.nome,
        colaborador.gerente,
        colaborador.setor,
      ]
    );

    return res.status(200).send("Código salvo com sucesso");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/produtos", async (req, res) => {
  try {
    const { filtro } = req.query;

    let querySaidaMontagem = `SELECT * FROM produtos.produtos_cadastrados WHERE 1=1 `;
    let queryEntradaExpedicao = `SELECT pe.id, pe.epc as codigo, pe.createdate, pc.ordem, pe.identificacao_antena FROM produtos.expedicao pe LEFT JOIN produtos.produtos_cadastrados pc ON pe.epc = pc.codigo WHERE pe.identificacao_antena = 'ENTRADA EXPEDICAO' `;
    let querySaidaExpedicao = `SELECT pe.id, pe.epc AS codigo, pe.createdate, pc.ordem, pe.identificacao_antena FROM produtos.expedicao pe LEFT JOIN produtos.produtos_cadastrados pc ON pe.epc = pc.codigo WHERE pe.identificacao_antena = 'SAIDA EXPEDICAO' `;

    const params = [];

    if (filtro && filtro.data) {
      querySaidaMontagem += ` AND createdate::date = $${params.length + 1} `;
      queryEntradaExpedicao += `AND pe.createdate::date = $${
        params.length + 1
      } `;
      querySaidaExpedicao += `AND pe.createdate::date = $${params.length + 1} `;
      params.push(filtro.data);
    }

    if (filtro && filtro.ordem) {
      querySaidaMontagem += ` AND ordem = $${params.length + 1} `;
      queryEntradaExpedicao += `AND pc.ordem = $${params.length + 1} `;
      querySaidaExpedicao += `AND pc.ordem = $${params.length + 1} `;
      params.push(filtro.ordem);
    }

    if (filtro && filtro.codigo) {
      querySaidaMontagem += ` AND codigo = $${params.length + 1} `;
      queryEntradaExpedicao += `AND pc.codigo = $${params.length + 1} `;
      querySaidaExpedicao += `AND pc.codigo = $${params.length + 1} `;
      params.push(filtro.codigo);
    }

    const saidaMontagem = await pool.query(querySaidaMontagem, params);
    const entradaExpedicao = await pool.query(queryEntradaExpedicao, params);
    const saidaExpedicao = await pool.query(querySaidaExpedicao, params);

    return res.status(200).json({
      saidaMontagem: saidaMontagem.rows,
      entradaExpedicao: entradaExpedicao.rows,
      saidaExpedicao: saidaExpedicao.rows,
    });
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/expedicao", async (req, res) => {
  try {
    const expedicao = await pool.query(`SELECT * FROM produtos.expedicao`);

    return res.status(200).json(expedicao.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});
