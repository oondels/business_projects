import cors from "cors";
import express from "express";
import http from "http";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();
const port = 3023;

const server = http.createServer(app);

app.use(cors());
app.use(express.json());

server.listen(port, ip, () => {
  console.log(`App listening on port ${port} at ${ip}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/get-all-models", async (req, res) => {
  try {
    const unidade = req.query.unidade;
    const query = await pool.query(
      `
            SELECT nome, id
            FROM reposicao_pecas.modelos
            WHERE unidade_dass = $1
        `,
      [unidade]
    );

    res.status(200).json(query.rows);
  } catch (error) {
    console.error("Erro ao buscar modelos: ", error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/get-pecas/:id", async (req, res) => {
  try {
    const modelId = req.params.id;

    const query = await pool.query(`
            SELECT nome, id
            FROM reposicao_pecas.pecas
        `);

    res.status(200).json(query.rows);
  } catch (error) {
    console.error("Erro ao buscar modelos: ", error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/get-managers", async (req, res) => {
  try {
    const unidade = req.query.unidade;

    let queryBase = `
    SELECT matricula, nome
    FROM colaborador.lista_funcionario`;

    if (unidade !== "SEST") {
      queryBase += `_${unidade.toLowerCase()}`;
    }

    let queryBranch = `${queryBase} WHERE funcao ILIKE '%marca%' ORDER BY nome ASC`;
    let queryManager = `${queryBase} WHERE funcao ILIKE '%gerente%' AND NOT funcao ILIKE '%marca%' ORDER BY nome ASC`;

    const branchManagers = await pool.query(queryBranch);
    const managers = await pool.query(queryManager);

    res.status(200).json({
      branch: branchManagers.rows,
      manager: managers.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/get-quality-inspectors-coordinators", async (req, res) => {
  try {
    const unidade = req.query.unidade;

    let queryBase = `
    SELECT matricula, nome
    FROM colaborador.lista_funcionario`;

    if (unidade !== "SEST") {
      queryBase += `_${unidade.toLowerCase()}`;
    }

    let queryInspectors = `${queryBase} WHERE funcao = 'INSPETOR DE QUALIDADE' ORDER BY nome ASC`;
    let queryCoordinators = `${queryBase} WHERE funcao ILIKE '%COORDENADOR%' ORDER BY nome ASC`;

    const qualityInspectors = await pool.query(queryInspectors);
    const coordinators = await pool.query(queryCoordinators);

    res.status(200).json({
      quality: qualityInspectors.rows,
      coordinator: coordinators.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/get-employee", async (req, res) => {
  try {
    const unidade = req.query.unidade;
    const registration = req.query.registration;

    const employee = await pool.query(
      `
    SELECT nome, matricula, usuario
    FROM autenticacao.usuarios
    WHERE matricula = $1 AND unidade = $2
    `,
      [registration, unidade]
    );
    if (employee.rows.length === 0) {
      return res
        .status(404)
        .send("Colaborador Não Encontrado. Verifique a Matrícula!");
    }

    res.status(200).json(employee.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/motivo-pedido", async (req, res) => {
  try {
    const unidade = req.query.unidade;

    let query = await pool.query(
      `
    SELECT nome, codigo 
    FROM reposicao_pecas.motivo_pedido
    WHERE unidade_dass = $1
    `,
      [unidade]
    );

    res.status(200).json(query.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/get-solicitations", async (req, res) => {
  try {
    const unidade = req.query.unidade;

    const query = await pool.query(
      `
      SELECT * FROM
        reposicao_pecas.solicitacoes
      WHERE
       unidade_dass = $1
    `,
      [unidade]
    );

    res.status(200).json(query.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.post("/post-solicitation", async (req, res) => {
  try {
    const { data, unidade } = req.body;

    const post = await pool.query(
      `
      INSERT INTO reposicao_pecas.solicitacoes
      (modelo_id, solicitante, solicitante_matricula, data_solicitacao,
      data_embarque, celula, turno, pedido, ordem, motivo, cod_motivo_pedido,
      gerente_marca, gerente_marca_matricula, gerente, gerente_matricula,
      inspetor_qualidade, inspetor_qualidade_matricula, coordenador, coordenador_matricula,
      unidade_dass, pecas, falta_material, modelo, defeito_material)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
      $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `,
      [
        data.model.id,
        data.requester.usuario,
        data.requester.matricula,
        data.solicitationDate,
        data.embarqueDate,
        data.cel,
        data.turno,
        data.request,
        data.order,
        data.reason.name,
        data.reason.cod,
        data.evaluators.branchManager.nome,
        data.evaluators.branchManager.matricula,
        data.evaluators.manager.nome,
        data.evaluators.manager.matricula,
        data.evaluators.qualityInspector.nome,
        data.evaluators.qualityInspector.matricula,
        data.evaluators.coordinator.nome,
        data.evaluators.coordinator.matricula,
        unidade,
        JSON.stringify(data.pecas),
        data.faltaMaterial,
        data.model.nome,
        data.defeitoMaterial,
      ]
    );

    if (post.rows.length === 0) {
      return res.status(400).send("Erro ao realizar solicitação.");
    }

    return res.status(200).send("Solicitação Realizada com Sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.post("/post-evaluation", async (req, res) => {
  try {
    const { evaluation, role, id } = req.body;

    const roleEvaluation = {
      // Alterar depois para GERENTE
      AUTOMACAO: "aprovacao_gerente",
      "GERENTE MARCA": "aprovacao_gerente_marca",
      "INSPETOR DE QUALIDADE": "aprovacao_inspetor_qualidade",
    };

    let query = `UPDATE reposicao_pecas.solicitacoes SET `;
    query += `${roleEvaluation[role]} = $1 WHERE id = $2 RETURNING *`;

    const post = await pool.query(query, [evaluation, id]);

    if (post.rows.length === 0) {
      return res.status(400).send("Erro ao Atualizar Avaliação.");
    }

    return res.status(200).send("Avaliação Registrada com Sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});

app.put("/start-solicitation", async (req, res) => {
  try {
    const { solicitationId } = req.body;

    const query = await pool.query(
      `
      UPDATE reposicao_pecas.solicitacoes
      SET iniciado = true, start_date = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [solicitationId]
    );

    if (query.rows.length === 0) {
      return res.status(400).send("Erro ao Iniciar Solicitação!");
    }

    return res.status(200).send("Solicitação Iniciada!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro interno no servidor");
  }
});
