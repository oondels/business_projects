import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());

const port = 3048;

app.listen(port, ip, () => console.log(`App listening on port ${port}!`));

function getNextSaturday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  const yyyy = nextSaturday.getFullYear();
  const mm = String(nextSaturday.getMonth() + 1).padStart(2, "0");
  const dd = String(nextSaturday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const getNextBusinessDay = () => {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  let nextBusinessDay = new Date(today.getTime() + oneDay);

  while (nextBusinessDay.getDay() === 6 || nextBusinessDay.getDay() === 0) {
    nextBusinessDay = new Date(nextBusinessDay.getTime() + oneDay);
  }

  const year = nextBusinessDay.getFullYear();
  const month = String(nextBusinessDay.getMonth() + 1).padStart(2, "0");
  const day = String(nextBusinessDay.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/buscaColaboradorPeloRfid", async (req, res) => {
  try {
    const rfid = req.query.rfid;
    const result = await pool.query(
      "SELECT nome, matricula FROM colaborador.colaboradores WHERE rfid = $1",
      [rfid]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar colaborador pelo RFID: ", error });
  }
});

app.get("/buscaColaboradorPelaMatricula", async (req, res) => {
  try {
    const matricula = req.query.matricula;
    const result = await pool.query(
      "SELECT nome FROM colaborador.lista_funcionario WHERE matricula = $1",
      [matricula]
    );
    res.json(result.rows[0].nome);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar colaborador pela MATRICULA: ", error });
  }
});

app.post("/salvaConfiguracao", async (req, res) => {
  try {
    const {
      reservarSabadoNaSexta,
      dataAmanhaParaReserva,
      dataReservaExtra,
      usuarioCreate,
    } = req.body;

    if (!dataAmanhaParaReserva || !usuarioCreate || !dataReservaExtra) {
      return res.status(422).json({ error: "Dados inválidos ou ausentes" });
    }

    const salvaConfiguracao = await pool.query(
      "INSERT INTO refeitorio.configuracao (createdate, permissao, dataamanha, dataextra, usuariocreate) VALUES('NOW()', $1, $2, $3, $4)",
      [
        reservarSabadoNaSexta,
        dataAmanhaParaReserva,
        dataReservaExtra,
        usuarioCreate,
      ]
    );
    res.status(200).json({ message: "Configuração salva" });
  } catch (error) {
    res.status(500);
  }
});

app.get("/buscaConfiguracao", async (req, res) => {
  try {
    const configuracao = await pool.query(
      "SELECT * FROM refeitorio.configuracao ORDER BY id DESC LIMIT 1"
    );
    const dataAmanhaParaReserva = configuracao.rows[0].dataamanha
      .toISOString()
      .split("T")[0];
    const dataReserva = configuracao.rows[0].dataextra
      .toISOString()
      .split("T")[0];

    res.status(200).json({
      dataamanha: dataAmanhaParaReserva,
      permissao: configuracao.rows[0].permissao,
      dataextra: dataReserva,
    });
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/salvaReserva", async (req, res) => {
  try {
    const { matricula, codigoRfid, opcaoSelecionada } = req.body;

    if (!matricula || !codigoRfid || !opcaoSelecionada) {
      if (Number(matricula).length !== 7) {
        return res.status(404).json({ error: "Insira a matrícula completa" });
      }
      return res.status(422).json({ error: "Dados inválidos ou ausentes" });
    }

    const buscaColaboradorListaFuncionario = await pool.query(
      "SELECT * FROM colaborador.lista_funcionario WHERE matricula = $1",
      [matricula]
    );
    if (buscaColaboradorListaFuncionario.rows.length === 0) {
      return res.status(404).json({ error: "Colaborador não encontrado" });
    }
    const { nome, gerente, nome_setor } =
      buscaColaboradorListaFuncionario.rows[0];

    const verificaDisponibilidade = await pool.query(
      "SELECT matricula FROM refeitorio.reserva WHERE date_trunc('day', createdate) = date_trunc('day', CURRENT_TIMESTAMP) AND rfid = $1 AND consumido = false ORDER BY id DESC",
      [codigoRfid]
    );
    if (verificaDisponibilidade.rowCount > 0) {
      return res.status(400).json({ error: "Sua reserva já foi cadastrada" });
    }

    const configuracao = await pool.query(
      "SELECT * FROM refeitorio.configuracao ORDER BY id DESC LIMIT 1"
    );
    const dataAmanhaParaReserva = configuracao.rows[0].dataamanha
      .toISOString()
      .split("T")[0];

    const nextBusinessDay = getNextBusinessDay();

    const dataReserva =
      nextBusinessDay > dataAmanhaParaReserva
        ? nextBusinessDay
        : dataAmanhaParaReserva;

    const result = await pool.query(
      "INSERT INTO refeitorio.reserva (createdate, matricula, nome, gerente, setor, opcao_selecionada, rfid, data_reserva) VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7)",
      [
        matricula,
        nome,
        gerente,
        nome_setor,
        opcaoSelecionada.toUpperCase(),
        codigoRfid,
        dataReserva,
      ]
    );

    const buscaColaboradorRefeitorio = await pool.query(
      "SELECT * FROM colaborador.colaboradores WHERE matricula = $1",
      [matricula]
    );
    if (buscaColaboradorRefeitorio.rows.length === 0) {
      await pool.query(
        "INSERT INTO colaborador.colaboradores (rfid, matricula, nome) VALUES ($1, $2, $3)",
        [codigoRfid, matricula, nome]
      );
    } else {
      await pool.query(
        "UPDATE colaborador.colaboradores SET rfid= $1, nome = $2 WHERE matricula = $3",
        [codigoRfid, nome, matricula]
      );
    }

    res.status(200).json({ message: "Reserva salva com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar reserva:", error);
    res.status(500).json({ error: "Erro ao salvar reserva" });
  }
});

app.get("/buscaReservasDoDia", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM refeitorio.reserva WHERE date_trunc('day', data_reserva) = date_trunc('day', CURRENT_TIMESTAMP) ORDER BY id ASC"
    );

    const categorias = {
      totais: [],
      consumidas: [],
      light: [],
      lanche: [],
      lightConsumidas: [],
      lancheConsumidas: [],
    };

    result.rows.forEach((item) => {
      categorias.totais.push(item);
      if (item.consumido) {
        categorias.consumidas.push(item);
      }
      if (item.opcao_selecionada === "LIGHT") {
        categorias.light.push(item);
        if (item.consumido) {
          categorias.lightConsumidas.push(item);
        }
      }
      if (item.opcao_selecionada === "LANCHE") {
        categorias.lanche.push(item);
        if (item.consumido) {
          categorias.lancheConsumidas.push(item);
        }
      }
    });

    res.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar reservas de hoje: ", error);
    res.status(500).json({ error: "Erro ao buscar reservas de hoje" });
  }
});

app.get("/buscaReservasAmanhaDoDia", async (req, res) => {
  try {
    const nextBusinessDay = getNextBusinessDay();

    const result = await pool.query(
      `
            SELECT * FROM refeitorio.reserva 
            WHERE date_trunc('day', data_reserva) = $1 
            ORDER BY id ASC
        `,
      [nextBusinessDay]
    );

    const categorias = {
      totais: [],
      consumidas: [],
      light: [],
      lanche: [],
      lightConsumidas: [],
      lancheConsumidas: [],
    };

    result.rows.forEach((item) => {
      categorias.totais.push(item);
      if (item.consumido) {
        categorias.consumidas.push(item);
      }
      if (item.opcao_selecionada === "LIGHT") {
        categorias.light.push(item);
        if (item.consumido) {
          categorias.lightConsumidas.push(item);
        }
      }
      if (item.opcao_selecionada === "LANCHE") {
        categorias.lanche.push(item);
        if (item.consumido) {
          categorias.lancheConsumidas.push(item);
        }
      }
    });

    res.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar reservas do próximo dia útil: ", error);
    res
      .status(500)
      .json({ error: "Erro ao buscar reservas do próximo dia útil" });
  }
});

app.delete("/delete-reserva", async (req, res) => {
  try {
    const { id } = req.body;

    const deleteReserva = await pool.query(
      `
        DELETE FROM refeitorio.reserva
        WHERE 
          id = $1
      `,
      [id]
    );
    return res.status(200).send("Reserva cancelada com sucesso!");
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
  }
});

app.post("/entregaReservaPeloRfid", async (req, res) => {
  const { codigoRfid } = req.body;

  if (!codigoRfid) {
    return res.status(422).json({ error: "Leitura inválida" });
  }

  try {
    const verificaDisponibilidade = await pool.query(
      "SELECT consumido FROM refeitorio.reserva WHERE date_trunc('day', data_reserva) = date_trunc('day', CURRENT_TIMESTAMP) AND rfid = $1 AND consumido = false ORDER BY id DESC",
      [codigoRfid]
    );

    if (verificaDisponibilidade.rowCount > 0) {
      const result = await pool.query(
        "UPDATE refeitorio.reserva SET consumido = true, data_consumo = NOW() WHERE date_trunc('day', data_reserva) = date_trunc('day', CURRENT_TIMESTAMP) AND rfid = $1 RETURNING *",
        [codigoRfid]
      );
      if (result.rowCount > 0) {
        return res.status(200).json({
          message: "Reserva concluída com sucesso",
          reserva: result.rows[0],
        });
      }
    } else {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/entregaReservaPelaMatricula", async (req, res) => {
  const { matricula } = req.body;

  if (!matricula) {
    return res.status(422).json({ error: "Leitura inválida" });
  }

  try {
    const verificaDisponibilidade = await pool.query(
      "SELECT consumido FROM refeitorio.reserva WHERE date_trunc('day', data_reserva) = date_trunc('day', CURRENT_TIMESTAMP) AND matricula = $1 AND consumido = false ORDER BY id DESC",
      [matricula]
    );

    if (verificaDisponibilidade.rowCount > 0) {
      const result = await pool.query(
        "UPDATE refeitorio.reserva SET consumido = true, data_consumo = NOW() WHERE date_trunc('day', data_reserva) = date_trunc('day', CURRENT_TIMESTAMP) AND matricula = $1 RETURNING *",
        [matricula]
      );
      if (result.rowCount > 0) {
        return res.status(200).json({
          message: "Reserva concluída com sucesso",
          reserva: result.rows[0],
        });
      }
    } else {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Busca gerentes
app.get("/buscaNomesGerentes", async (req, res) => {
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
    console.error("Erro ao buscar os nomes dos gerentes: ", error);
  }
});

app.get("/buscaSetores", async (req, res) => {
  try {
    const gerente = req.query.gerente;
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

app.get("/buscaColaboradoresPorSetor", async (req, res) => {
  try {
    const dataReserva = req.query.dataReserva;
    const gerente = req.query.gerente;
    const setor = req.query.setor;

    const resultLista = await pool.query(
      "SELECT lf.*, CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(s.colaboradores) AS c(colab) WHERE (c.colab->>'matricula')::integer = lf.matricula) THEN 'Reservado' ELSE 'Sem Reserva' END AS disponibilidade, s.hora_reserva FROM colaborador.lista_funcionario lf LEFT JOIN (SELECT * FROM refeitorio.sabado s WHERE data_reserva = $1) s ON lf.matricula = ANY (ARRAY(SELECT (jsonb_array_elements(s.colaboradores)->>'matricula')::integer)) WHERE lf.gerente = $2 AND lf.nome_setor = $3 ORDER BY lf.nome;",
      [dataReserva, gerente, setor]
    );
    res.json(resultLista.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar colaboradores" });
  }
});

app.post("/salvarReservaSabado", async (req, res) => {
  try {
    const {
      setorSelecionado,
      gerenteSelecionado,
      dataReserva,
      horaReserva,
      usuarioCreate,
      colaboradores,
      gerenteDestino,
      setorDestino,
    } = req.body;

    if (
      !setorSelecionado ||
      !gerenteSelecionado ||
      !dataReserva ||
      !horaReserva ||
      !usuarioCreate ||
      !colaboradores ||
      !gerenteDestino ||
      !setorDestino
    ) {
      res
        .status(422)
        .json({ message: "Dados obrigatórios não foram preenchidos" });
    } else {
      const salvaReservaSabado = await pool.query(
        "INSERT INTO refeitorio.sabado (createdate, setor_selecionado, gerente_selecionado, data_reserva, hora_reserva, usuariocreate, colaboradores, gerente_destino, setor_destino) VALUES('NOW()', $1, $2, $3, $4, $5, $6, $7, $8);",
        [
          setorSelecionado,
          gerenteSelecionado,
          dataReserva,
          horaReserva,
          usuarioCreate,
          colaboradores,
          gerenteDestino,
          setorDestino,
        ]
      );
      res.status(200).json({ message: "Reserva salva com sucesso" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
    console.error("Erro ao salvar Reserva: ", error);
  }
});

app.get("/buscaGerenteReservadoSabado", async (req, res) => {
  try {
    const sabado = getNextSaturday();
    let gerenteReservado = [];

    const result = await pool.query(
      "SELECT DISTINCT gerente_destino FROM refeitorio.sabado WHERE data_reserva = $1 ORDER BY gerente_destino ASC",
      [sabado]
    );

    result.rows.map((item) => {
      gerenteReservado.push(item.gerente_destino);
    });
    res.json(gerenteReservado);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/geraVoucherPeloGerente", async (req, res) => {
  try {
    const gerente = req.query.gerente;
    const dataReserva = req.query.dataReserva;
    let dadosDocumento = [];

    const result = await pool.query(
      "SELECT * FROM refeitorio.sabado WHERE gerente_destino = $1 AND data_reserva = $2",
      [gerente, dataReserva]
    );
    result.rows.map((item) => {
      item.colaboradores.map((item2) => {
        dadosDocumento.push({
          nome: item2.nome,
          gerente: item2.gerente,
          matricula: item2.matricula,
          dataReserva: item.data_reserva,
          horaReserva: item.hora_reserva,
          usuarioCreate: item.usuariocreate,
          gerenteDestino: item.gerente_destino,
          setorDestino: item.setor_destino,
        });
      });
    });
    res.json(dadosDocumento);
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/geraRelatorioLancheSabado", async (req, res) => {
  try {
    const { tipoRelatorio, dataInicial, dataFinal, turno } = req.query;

    function selecionaTurno(turno) {
      if (turno === "Turno A") {
        return " AND createdate::time BETWEEN '07:00' AND '14:00' ";
      } else if (turno === "Turno B") {
        return " AND (createdate::time >= '14:30' OR createdate::time <= '01:00') ";
      } else {
        return "";
      }
    }

    const turnoClause = selecionaTurno(turno);

    const lancheQuery = `
            SELECT * FROM refeitorio.reserva 
            WHERE data_reserva BETWEEN $1 AND $2 ${turnoClause} 
            ORDER BY id
        `;
    const sabadoQuery = `
            SELECT * FROM refeitorio.sabado 
            WHERE data_reserva BETWEEN $1 AND $2 ${turnoClause} 
            ORDER BY id
        `;

    const lanche = await pool.query(lancheQuery, [dataInicial, dataFinal]);
    const sabado = await pool.query(sabadoQuery, [dataInicial, dataFinal]);

    if (tipoRelatorio === "Lanche") {
      res.json(lanche.rows);
    } else if (tipoRelatorio === "Sábado") {
      res.json(sabado.rows);
    } else {
      res.status(400).json("Tipo de relatório inválido");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao trazer dados do relatório: " + error.message });
  }
});

app.get("/geraRelatorioQuantidadeSabado", async (req, res) => {
  try {
    const dataReserva = req.query.dataReserva;
    const relatorio = await pool.query(
      "SELECT DISTINCT data_reserva,  hora_reserva, COUNT(hora_reserva) AS quantidade_hora FROM refeitorio.sabado WHERE data_reserva = $1 GROUP BY data_reserva, hora_reserva",
      [dataReserva]
    );
    res.json(relatorio.rows);
  } catch (error) {
    res.status(500).json("Erro ao trazer quantidade de reservas: ", error);
  }
});

app.get("/buscaDadoGlobaisAuditorias", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT EXTRACT(MONTH FROM data_reserva) AS mes, 
        EXTRACT(YEAR FROM data_reserva) AS ano, 
        COUNT(*) AS total_reservado, 
        COUNT(CASE WHEN consumido THEN 1 END) AS total_consumido 
      FROM 
        refeitorio.reserva 
      WHERE 
        data_reserva < CURRENT_DATE AND 
        EXTRACT(YEAR FROM data_reserva) = EXTRACT(YEAR FROM CURRENT_DATE) 
      GROUP BY 
        EXTRACT(YEAR FROM data_reserva), 
        EXTRACT(MONTH FROM data_reserva) 
      ORDER BY 
        ano, mes;`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados globais" });
  }
});

app.post("/vincularRfidMatricula", async (req, res) => {
  try {
    const { codigoRfid, usuarioUpdate, matricula, nome } = req.body;
    if (!codigoRfid || !usuarioUpdate || !matricula || !nome) {
      return res.status(422).json({ error: "Dados inválidos ou ausentes" });
    }
    const verificaExistencia = await pool.query(
      "SELECT * FROM colaborador.colaboradores WHERE matricula = $1",
      [matricula]
    );

    if (verificaExistencia.rowCount > 0) {
      const atualizaRfid = await pool.query(
        "UPDATE colaborador.colaboradores SET rfid = $1, usuarioupdate = $2, updatedate = NOW() WHERE matricula = $3",
        [codigoRfid, usuarioUpdate, matricula]
      );
    } else {
      const criaRfid = await pool.query(
        "INSERT INTO colaborador.colaboradores (rfid, usuarioupdate, updatedate, matricula, nome) VALUES($1, $2, 'NOW()', $3, $4)",
        [codigoRfid, usuarioUpdate, matricula, nome]
      );
    }
    res.status(200).json({ message: "Provisório vinculado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao vincular matrícula" });
  }
});
