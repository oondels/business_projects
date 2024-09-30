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

app.get("/buscaSetores/:gerente", async (req, res) => {
  try {
    const gerente = req.params.gerente;
    const result = await pool.query(
      `SELECT DISTINCT nome_setor FROM colaborador.lista_funcionario WHERE gerente = $1 ORDER BY nome_setor ASC`,
      [gerente]
    );
    const setores = result.rows.map((row) => row.nome_setor);
    res.json(setores);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar setores por gerente" });
  }
});

app.get("/get-emplpoyee-by-department/:department", async (req, res) => {
  try {
    const department = req.params.department;

    const query = await pool.query(
      `
      SELECT 
        nome, gerente, nome_setor, funcao, matricula
      FROM 
        colaborador.lista_funcionario
      WHERE 
        nome_setor = $1
      `,
      [department]
    );

    const employees = query.rows;

    employees.forEach((employee) => {
      if (!employee.select) {
        employee.select = false;
      }
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    res.status(500).send("Erro interno no servidor: ", error);
  }
});

app.post("/postTraining", async (req, res) => {
  try {
    const datas = req.body;
    let employeeNotInsert = "";

    for (let employee of datas.colaboradores) {
      const checkEmployee = await pool.query(
        `
          SELECT * FROM treinamentos.registros
          WHERE
            nome = $1 AND
            data_treinamento = $2 AND
            iniciado = true
        `,
        [employee.nome, datas.treinamento.data]
      );

      if (checkEmployee.rows.length > 0) {
        const nameSplited = checkEmployee.rows[0].nome.split(" ");
        const firstName = nameSplited[0];
        const lastName = nameSplited[nameSplited.length - 1];

        employeeNotInsert += `${firstName} ${lastName}, `;
        console.log(employeeNotInsert);
        continue;
      }

      await pool.query(
        `
            INSERT INTO
              treinamentos.registros (nome, matricula, setor_colaborador, funcao_colaborador, data_treinamento, celula, fabrica, gerente_celula, treinamento, treinamento_setor, criador_treinamento, unidade_dass)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
        [
          employee.nome,
          employee.matricula,
          employee.nome_setor,
          employee.funcao,
          datas.treinamento.data,
          datas.treinamento.celula,
          datas.treinamento.fabrica,
          datas.gerente,
          datas.treinamento.nome,
          datas.treinamento.setor,
          datas.usuario,
          datas.unidade,
        ]
      );
    }

    if (employeeNotInsert) {
      return res
        .status(403)
        .send(
          `Treinamento agendado com sucesso. Os colaboradores: ${employeeNotInsert} não foram inseridos pois estão em treinamento hoje.`
        );
    }
    return res.status(200).send(`Treinamento agendado com sucesso!`);
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

app.get("/check-barcode/:barcode", async (req, res) => {
  try {
    const barcode = req.params.barcode;

    const query = await pool.query(
      `
      SELECT
        nome
      FROM
        colaborador.colaboradores
      WHERE
        codbarras = $1
      `,
      [barcode]
    );
    console.log(query.rows[0].nome);

    res.status(200).send(query.rows);
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
    SELECT 
        STRING_AGG(id::text, ', ') AS ids,
        STRING_AGG(matricula::text, ', ') AS matriculas,
        treinamento,
        iniciado,
        finalizado,
        cancelado,
        data_treinamento,
        celula,
        gerente_celula,
        treinamento_setor,
        pausado,
        STRING_AGG(nome, ', ') AS nomes_colaboradores,
        date_trunc('minute', date_inicio) AS date_inicio
    FROM 
        treinamentos.registros
    WHERE 
        finalizado != true AND
        unidade_dass = 'sest'
    GROUP BY 
        treinamento,
        iniciado,
        finalizado,
        cancelado,
        data_treinamento, 
        celula, 
        gerente_celula, 
        treinamento_setor,
        pausado,
        date_trunc('minute', date_inicio)
    ORDER BY 
        data_treinamento ASC;
    `;

    const trainings = await pool.query(queryTraining);

    return res.status(200).json({
      trainings: trainings.rows,
    });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor.");
  }
});

app.get("/get-all-finished-trainings", async (req, res) => {
  try {
    const unidade = req.query.unidadeDass;

    let params = [];

    params.push(unidade);

    let queryTraining = `
    SELECT 
      STRING_AGG(DISTINCT  treinos.id::text, ', ') AS ids,
      STRING_AGG(DISTINCT  treinos.matricula::text, ', ') AS matriculas,
      treinos.treinamento,
      treinos.iniciado,
      treinos.finalizado,
      treinos.cancelado,
      treinos.data_treinamento,
      treinos.celula,
      treinos.gerente_celula,
      treinos.treinamento_setor,
      treinos.start_treinamento_nome,
      STRING_AGG(DISTINCT  treinos.nome, ', ') AS nomes_colaboradores,
      STRING_AGG(DISTINCT COALESCE(date_trunc('minute',pausas.pause_start)::text, ''), ', ') AS periodos_pausa_inicio,
      STRING_AGG(DISTINCT COALESCE(date_trunc('minute',pausas.pause_end)::text, ''), ', ') AS periodos_pausa_fim,
      date_trunc('minute', date_inicio) AS date_inicio,
      date_trunc('minute', date_fim) AS date_fim
    FROM 
        treinamentos.registros AS treinos
    LEFT JOIN 
        treinamentos.treinamentos_pausados AS pausas 
        ON treinos.id = pausas.training_id
    WHERE 
        treinos.finalizado = true
        AND treinos.unidade_dass = 'sest'
    GROUP BY 
        treinos.treinamento,
        treinos.iniciado,
        treinos.finalizado,
        treinos.cancelado,
        treinos.data_treinamento, 
        treinos.celula, 
        treinos.gerente_celula, 
        treinos.treinamento_setor,
        treinos.start_treinamento_nome,
        date_trunc('minute', date_inicio),
        date_trunc('minute', date_fim)
    ORDER BY 
        treinos.data_treinamento ASC;
    `;

    const trainings = await pool.query(queryTraining);

    return res.status(200).json({
      trainings: trainings.rows,
    });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor.");
  }
});

app.get("/getAllManagers", async (req, res) => {
  let gerentes = [];
  try {
    const result = await pool.query(
      "SELECT DISTINCT gerente FROM colaborador.lista_funcionario ORDER BY gerente ASC"
    );
    result.rows.map((item) => {
      gerentes.push(item.gerente);
    });
    res.json(gerentes);
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send(error);
  }
});

app.put("/start-training/:id", async (req, res) => {
  try {
    const ids = req.params.id;
    const user = req.body.user;
    const unidade = req.body.unidade;
    const absent = req.body.absent;

    for (let id of ids.split(",").map((i) => i.trim())) {
      if (absent && absent.length > 0) {
        // Cria a lista de placeholders ($4, $5, etc.) para os nomes ausentes
        const placeholders = absent
          .map((_, index) => `$${index + 4}`)
          .join(", ");

        await pool.query(
          `
            UPDATE treinamentos.registros
            SET
              date_inicio = now(), iniciado = true, start_treinamento_nome = $1, presenca = true
            WHERE
              id = $2 AND 
              unidade_dass = $3 AND
              nome NOT IN (${placeholders})
          `,
          [user, id, unidade, ...absent] // Os valores da query, incluindo os nomes ausentes
        );
      } else {
        // Caso não tenha nomes ausentes, não usa a cláusula NOT IN
        await pool.query(
          `
            UPDATE treinamentos.registros
            SET
              date_inicio = now(), iniciado = true, start_treinamento_nome = $1, presenca = true
            WHERE
              id = $2 AND 
              unidade_dass = $3
          `,
          [user, id, unidade]
        );
      }
    }

    return res.status(200).send("Treinamento Iniciado.");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/pause-training", async (req, res) => {
  try {
    const data = req.body.data;
    const user = req.body.user;
    const unidade = req.body.unidade;

    for (let id of data.ids.split(",").map((id) => id.trim(""))) {
      const queryUser = await pool.query(
        `
          SELECT start_treinamento_nome AS user
          FROM treinamentos.registros
          WHERE id = $1 AND unidade_dass = $2
        `,
        [id, unidade]
      );
      const startUser = queryUser.rows[0].user;

      if (user !== startUser) {
        return res
          .status(403)
          .send(
            "Somente o responsável que iniciou o treinamento pode concluí-lo."
          );
      }

      const queryPause = await pool.query(
        `
          UPDATE treinamentos.registros
          SET pausado = true
          WHERE id = $1
        `,
        [id]
      );

      await pool.query(
        `
          INSERT INTO treinamentos.treinamentos_pausados (training_id, pause_start)
          VALUES ($1, NOW())
        `,
        [id]
      );
    }
    return res.status(200).send("Treinamento pausado com sucesso!");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/unpause-training", async (req, res) => {
  try {
    const data = req.body.data;
    const user = req.body.user;
    const unidade = req.body.unidade;

    for (let id of data.ids.split(",").map((id) => id.trim(""))) {
      const queryUser = await pool.query(
        `
          SELECT start_treinamento_nome AS user
          FROM treinamentos.registros
          WHERE id = $1 AND unidade_dass = $2
        `,
        [id, unidade]
      );
      const startUser = queryUser.rows[0].user;

      if (user !== startUser) {
        return res
          .status(403)
          .send(
            "Somente o responsável que iniciou o treinamento pode concluí-lo."
          );
      }

      const queryPause = await pool.query(
        `
          UPDATE treinamentos.registros
          SET pausado = false
          WHERE id = $1
        `,
        [id]
      );

      await pool.query(
        `
          UPDATE treinamentos.treinamentos_pausados
          SET pause_end = NOW()
          WHERE training_id = $1
        `,
        [id]
      );
    }
    return res.status(200).send("Treinamento retomado com sucesso!");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/stop-training", async (req, res) => {
  try {
    const data = req.body.data;
    const user = req.body.user;
    const unidade = req.body.unidade;

    Object.entries(data).forEach(async ([nome, values]) => {
      const queryUser = await pool.query(
        `
          SELECT start_treinamento_nome AS user
          FROM treinamentos.registros
          WHERE id = $1 AND unidade_dass = $2
        `,
        [values.id, unidade]
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
                date_fim = now(), finalizado = true, stop_treinamento_nome = $1, aprovado = $2, observacao = $3
              WHERE
                id = $4 AND unidade_dass = $5
            `,
        [user, values.result, values.obs, values.id, unidade]
      );
    });

    return res.status(200).send("Treinamento Finalizado.");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno no servidor");
  }
});

app.put("/cancel-training", async (req, res) => {
  try {
    const ids = req.body.id;
    const motivo = req.body.motivo;
    const user = req.body.user;
    const unidade = req.body.unidade;

    for (let id of ids.split(",").map((i) => i.trim(""))) {
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
    }

    return res.status(200).send("Treinamento Cancelado");
  } catch (error) {
    console.error("Erro interno no servidor!");
    return res.status(500).send("Erro interno no servidor! ", error);
  }
});

app.get("/get-chart-data", async (req, res) => {
  try {
    const query = await pool.query(`
        SELECT 
          COUNT(*) AS total_treinamentos,
          COUNT(CASE WHEN finalizado = true THEN 1 END) AS total_treinamentos_concluidos,
          COUNT(CASE WHEN aprovado = true THEN 1 END) AS total_treinamentos_aprovados,
          COUNT(CASE WHEN cancelado = true THEN 1 END) AS total_treinamentos_cancelados,
          COUNT(CASE WHEN presenca = true THEN 1 END) AS total_colaboradores_presentes,
          EXTRACT(MONTH FROM data_treinamento) AS mes,
          gerente_celula
        FROM 
          treinamentos.registros
        GROUP BY
          gerente_celula,
          mes
      `);

    let managerTraining = {
      series: [
        {
          name: "Inflation",
          data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
        },
      ],
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: "top", 
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + "%";
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },

      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        position: "top",
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val + "%";
          },
        },
      },
      title: {
        text: "Monthly Inflation in Argentina, 2002",
        floating: true,
        offsetY: 330,
        align: "center",
        style: {
          color: "#444",
        },
      },
    };

    return res.status(200).json(query.rows);
  } catch (error) {
    console.error("Erro interno no servidor!", error);
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
        SELECT 
          treino.nome,
          treino.treinamento,
          treino.data_treinamento,
          treino.celula,
          treino.gerente_celula,
          treino.treinamento_setor,
          treino.start_treinamento_nome,
          treino.presenca,
          treino.aprovado,
          treino.observacao,
          STRING_AGG(DISTINCT date_trunc('minute', pausas.pause_start)::text, ', ') AS periodos_pausa_inicio,
          STRING_AGG(DISTINCT date_trunc('minute', pausas.pause_end)::text, ', ') AS periodos_pausa_fim,
          date_trunc('minute', treino.date_inicio) AS date_inicio,
          date_trunc('minute', treino.date_fim) AS date_fim
        FROM 
          treinamentos.registros AS treino
        LEFT JOIN
          treinamentos.treinamentos_pausados AS pausas
          ON treino.id = pausas.training_id
        WHERE
          data_treinamento BETWEEN $1 AND $2 AND
          finalizado = true AND
          treinamento_setor = $3
      `;

    if (reportInfo.instrutor) {
      queryReport += `AND start_treinamento_nome = $${params.length + 1}`;
      params.push(reportInfo.instrutor);
    }

    queryReport += `
      GROUP BY
        treino.nome,
        treino.treinamento,
        treino.data_treinamento,
        treino.celula,
        treino.gerente_celula,
        treino.treinamento_setor,
        treino.start_treinamento_nome,
        treino.presenca,
        treino.aprovado,
        treino.observacao,
        date_trunc('minute', treino.date_inicio),
        date_trunc('minute', treino.date_fim)
      ORDER BY
        treino.data_treinamento ASC;`;

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
