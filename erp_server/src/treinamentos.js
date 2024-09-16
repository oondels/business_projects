import cors from "cors";
import express from "express";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

app.use(cors());
app.use(express.json());

const port = 3020;

app.listen(port, ip, () => {
  console.log(`App listening on ip ${ip} and port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/postTraining", async (req, res) => {
  try {
    const infos = req.body;

    const queryTraining = await pool.query(
      `
          SELECT * FROM treinamentos.registros
          WHERE
            matricula = $1 AND 
            data_treinamento = $2 AND
            unidade_dass = $3 AND
            cancelado = false AND
            finalizado = false AND
            iniciado = false
        `,
      [infos.data.matricula, infos.data.data, infos.unidade]
    );

    if (queryTraining.rows.length > 0) {
      return res
        .status(403)
        .send(
          `Colaborador ja possui o treinamento de ${queryTraining.rows[0].treinamento} para esta data.`
        );
    }

    await pool.query(
      `
          INSERT INTO
            treinamentos.registros (nome, matricula, setor_colaborador, data_treinamento, celula, fabrica, gerente_celula, matricula_gerente, treinamento, treinamento_setor, criador_treinamento, unidade_dass)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
      [
        infos.data.nome,
        infos.data.matricula,
        infos.data.setor,
        infos.data.data,
        infos.data.celula,
        infos.data.fabrica,
        infos.gerente.nome,
        infos.gerente.matricula,
        infos.data.treinamento,
        infos.setorTreinamento,
        infos.usuario,
        infos.unidade,
      ]
    );

    return res
      .status(200)
      .send(
        `Treinamento agendado com sucesso para o colaborador ${infos.data.nome}`
      );
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
  }
});

app.get("/getEmployee", async (req, res) => {
  try {
    const matricula = req.query.employee;

    const query = await pool.query(
      `
        SELECT
          nome, matricula, nome_setor, gerente, funcao
        FROM
          colaborador.lista_funcionario  
        WHERE 
          matricula = $1
        `,
      [matricula]
    );

    if (query.rows.length === 0) {
      return res
        .status(404)
        .send(
          "Colaborador não encontrado. Verifique se digitou o crachá corretamente"
        );
    }

    return res.status(200).send(query.rows[0]);
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor.");
  }
});

app.get("/get-all-trainings", async (req, res) => {
  try {
    const setor = req.query.setor;
    const unidade = req.query.unidadeDass;

    let params = [];

    params.push(unidade);

    let queryTraining = `
    SELECT * FROM
      treinamentos.registros
    WHERE
      finalizado != true AND
      unidade_dass = $${params.length}
    `;

    let queryFinishedTraining = `
    SELECT * FROM
      treinamentos.registros
    WHERE
      finalizado = true AND
      unidade_dass = $${params.length}
    `;

    if (setor) {
      params.push(setor);
      queryTraining += ` AND treinamento_setor = $${params.length}`;
      queryFinishedTraining += ` AND treinamento_setor = $${params.length}`;
    }

    const orderClause = `
    ORDER BY
      data_treinamento ASC;
    `;

    queryTraining += orderClause;
    queryFinishedTraining += orderClause;

    let trainings;
    let finishedTrainings;

    if (setor) {
      trainings = await pool.query(queryTraining, [unidade, setor]);

      finishedTrainings = await pool.query(queryFinishedTraining, [
        unidade,
        setor,
      ]);
    } else {
      trainings = await pool.query(queryTraining, [unidade]);
      finishedTrainings = await pool.query(queryFinishedTraining, [unidade]);
    }

    return res.status(200).json({
      trainings: trainings.rows,
      finished: finishedTrainings.rows,
    });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor.");
  }
});

app.get("/getAllManagers", async (req, res) => {
  try {
    const query = await pool.query(
      `
        SELECT 
          nome, funcao, matricula
        FROM
          colaborador.lista_funcionario
        WHERE
          funcao ilike '%gerente%'
        `
    );

    return res.status(200).send(query.rows);
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send(error);
  }
});

app.put("/start-training/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.body.user;
    const unidade = req.body.unidade;

    await pool.query(
      `
          UPDATE treinamentos.registros
          SET
            date_inicio = now(), iniciado = true, start_treinamento_nome = $1
          WHERE
            id = $2 AND unidade_dass = $3
        `,
      [user, id, unidade]
    );

    return res.status(200).send("Treinamento Iniciado.");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/stop-training/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body.data;
    const user = req.body.user;
    const unidade = req.body.unidade;

    const queryUser = await pool.query(
      `
        SELECT start_treinamento_nome AS user
        FROM treinamentos.registros
        WHERE id = $1 AND unidade_dass = $2
      `,
      [id, unidade]
    );
    const start_user = queryUser.rows[0].user;

    if (user !== start_user) {
      return res
        .status(403)
        .send(
          "Somente o responsável que iniciou o treinamento pode concluí-lo."
        );
    }

    await pool.query(
      `
          UPDATE treinamentos.registros
          SET
            date_fim = now(), finalizado = true, result = $1, aprovado = $2, stop_treinamento_nome = $3
          WHERE
            id = $4 AND unidade_dass = $5
        `,
      [data.obs, data.result, user, id, unidade]
    );

    return res.status(200).send("Treinamento Finalizado.");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/cancel-training/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const motivo = req.body.motivo;
    const user = req.body.user;
    const unidade = req.body.unidade;

    const queryUser = await pool.query(
      `
      SELECT criador_treinamento as user
      FROM treinamentos.registros
      WHERE id = $1 AND unidade_dass = $2
    `,
      [id, unidade]
    );
    const createUser = queryUser.rows[0].user;

    if (user !== createUser) {
      return res
        .status(403)
        .send("Somente o criador do treinamento pode cancelar.");
    }

    await pool.query(
      `
      UPDATE treinamentos.registros
      SET cancelado = true, motivo_cancelamento = $2, usuario_cancelamento = $3, data_cancelamento = now()
      WHERE
        id = $1 AND unidade_dass = $4
        `,
      [id, motivo, user, unidade]
    );

    return res.status(200).send("Treinamento Cancelado");
  } catch (error) {
    console.error("Erro interno no servidor!");
    return res.status(500).send("Erro interno no servidor! ", error);
  }
});

app.get("/get-report-data", async (req, res) => {
  try {
    const reportInfo = req.query;

    const params = [
      reportInfo.date.start,
      reportInfo.date.end,
      reportInfo.setor,
    ];

    let queryReport = `
        SELECT * FROM treinamentos.registros
        WHERE
          data_treinamento BETWEEN  $1 AND $2 AND
          finalizado = true AND
          treinamento_setor = $3
      `;

    if (reportInfo.instrutor) {
      queryReport += `AND start_treinamento_nome = $${params.length + 1}`;
      params.push(reportInfo.instrutor);
    }

    const reportData = await pool.query(queryReport, params);

    if (reportData.rows.length === 0) {
      return res
        .status(404)
        .send("Nenhum registro encontrado no período de datas fornecidas.");
    }

    res.status(200).json(reportData.rows);
  } catch (error) {
    res.status(500).send("Erro Interno no Servidor");
    console.error("Erro interno no servidor: ", error);
  }
});
