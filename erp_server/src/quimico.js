import { log } from "console";
import cors from "cors";
import ExcelJS from "exceljs";
import express, { query } from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

app.use(cors());
app.use(express.json());

const port = 3045;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
      }
    });
  });

  ws.on("close", () => {});
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, ip, () => {
  console.log(`App listening on port ${port} at ip ${ip}!`);
});

app.post("/cadastrarModelo", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { modelo, produtos, usuario } = req.body;

    if (!usuario) {
      return res.status(422).send("Você precisa realizar o login primeiro!");
    }

    if (!modelo.modelo || !modelo.processo || !modelo.marca) {
      return res.status(422).send("É necessário preencher todos os dados!");
    }

    const verificaModelo = await client.query(
      `SELECT modelo FROM quimico.modelo WHERE modelo = $1 AND processo = $2`,
      [modelo.modelo.toUpperCase(), modelo.processo.toUpperCase()]
    );
    if (verificaModelo.rowCount > 0) {
      return res
        .status(422)
        .send("Este modelo já possui um registro, altere o existente!");
    }

    const salvaModelo = await client.query(
      `
            INSERT INTO quimico.modelo (marca, modelo, processo, createdate, usuariocreate) 
            VALUES ($1, $2, $3, NOW(), $4) RETURNING id, modelo;`,
      [
        modelo.marca.toUpperCase(),
        modelo.modelo.toUpperCase(),
        modelo.processo.toUpperCase(),
        usuario.toUpperCase(),
      ]
    );

    if (salvaModelo.rowCount > 0) {
      const dadosModelo = salvaModelo.rows[0];

      for (const produto of produtos) {
        if (
          !produto.produto ||
          !produto.consumoPrevio ||
          !produto.precoKg ||
          !produto.base ||
          !produto.recipientes
        ) {
          return res.status(422).send("É necessário preencher todos os dados!");
        }

        await client.query(
          `
                    INSERT INTO quimico.produtos (produto, consumo_previo, preco_kg, base, recipientes, createdate, usuariocreate, id_modelo, modelo, processo)
                    VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9);`,
          [
            produto.produto.toUpperCase(),
            produto.consumoPrevio,
            produto.precoKg,
            produto.base.toUpperCase(),
            produto.recipientes,
            usuario.toUpperCase(),
            dadosModelo.id,
            dadosModelo.modelo.toUpperCase(),
            modelo.processo.toUpperCase(),
          ]
        );
      }

      await client.query("COMMIT");
      return res.send("Modelo cadastrado com sucesso");
    } else {
      await client.query("ROLLBACK");
      return res.status(400).send("Falha ao cadastrar modelo");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar modelo:", error);
    return res.status(500).send("Erro interno do servidor");
  } finally {
    client.release();
  }
});

app.put("/atualizar-modelo", async (req, res) => {
  try {
    const { newModelo, usuario } = req.body;

    if (!usuario) {
      return res.status(422).send("Você precisa realizar o login primeiro!");
    }

    await pool.query(
      `
        DELETE FROM quimico.produtos
        WHERE id_modelo = $1
      `,
      [newModelo.modeloSelecionado]
    );

    for (const p of newModelo.produto) {
      if (
        !p.produto ||
        !p.consumoPrevio ||
        !p.precoKg ||
        !p.base ||
        !p.recipientes
      ) {
        return res.status(422).json({
          message: "É necessário preencher todos os dados do(s) produto(s)!",
        });
      }

      const novosProdutos = await pool.query(
        `
          INSERT INTO quimico.produtos (produto, consumo_previo, preco_kg, base, recipientes, createdate, usuariocreate, id_modelo, modelo, processo)
          VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9)
        `,
        [
          p.produto.toUpperCase(),
          p.consumoPrevio,
          p.precoKg,
          p.base.toUpperCase(),
          p.recipientes,
          usuario.toUpperCase(),
          newModelo.modeloSelecionado,
          newModelo.modelo.toUpperCase(),
          newModelo.processo.toUpperCase(),
        ]
      );

      if (novosProdutos.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "Erro ao alterar o(s) produto(s)." });
      }
    }

    const modeloSelecionado = await pool.query(
      `
      SELECT * FROM quimico.modelo
      WHERE id = $1
      `,
      [newModelo.modeloSelecionado]
    );

    if (modeloSelecionado.rows.length === 0) {
      return res.status.json({ message: "Modelo não Encontrado." });
    }

    if (!newModelo.modelo || !newModelo.processo || !newModelo.marca) {
      return res
        .status(422)
        .json({ message: "É necessário preencher todos os dados do modelo!" });
    }

    const alterarModelo = await pool.query(
      `
        UPDATE quimico.modelo
        SET modelo = $1, processo = $2, marca = $3
        WHERE id = $4
      `,
      [
        newModelo.modelo,
        newModelo.processo,
        newModelo.marca,
        newModelo.modeloSelecionado,
      ]
    );

    if (alterarModelo.rowCount == 0) {
      return res
        .status(404)
        .json({ message: "Não foi possível alterar o modelo. Não Encontrado" });
    }

    res.status(200).json({ message: "Modelo alterado com sucesso" });
  } catch (error) {
    console.error("Erro no servidor: ", error);
    res.status(500).json({ error: `Erro no servidor: ${error}` });
  }
});

app.get("/buscaModelosCadastrados", async (req, res) => {
  try {
    const processo = req.query.processo;

    if (processo) {
      const modelosCadastrados = await pool.query(
        `SELECT id, modelo, marca, processo FROM quimico.modelo WHERE processo = $1 ORDER BY modelo;`,
        [processo]
      );

      return res.status(200).json(modelosCadastrados.rows);
    }

    const modelosCadastrados = await pool.query(
      `SELECT id, modelo, marca, processo FROM quimico.modelo`
    );
    return res.status(200).json(modelosCadastrados.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaProcessosCadastrados", async (req, res) => {
  try {
    let processos = [""];

    const processosCadastrados = await pool.query(
      `SELECT DISTINCT processo FROM quimico.modelo ORDER BY processo;`
    );
    processosCadastrados.rows.map((row) => processos.push(row.processo));
    return res.status(200).json(processos);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaSolicitante", async (req, res) => {
  try {
    const matricula = req.query.matricula;

    if (!matricula) {
      return res
        .status(404)
        .send("Você pode ter colocado a matrícula incorreta");
    }

    const solicitante = await pool.query(
      `SELECT * FROM colaborador.lista_funcionario WHERE matricula = $1`,
      [matricula]
    );
    return res.status(200).json(solicitante.rows[0]);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor", error);
  }
});

app.post("/salvarSolicitacaoPacote", async (req, res) => {
  try {
    const { solicitacoes, local, user } = req.body;

    for (const solicitacao of solicitacoes) {
      if (
        !solicitacao.modelo ||
        !solicitacao.idModelo ||
        !solicitacao.producao ||
        !solicitacao.processo ||
        !solicitacao.marca
      ) {
        return res.status(422).send("Dados inválidos ou ausentes");
      }

      if (!local.celula || !local.turno || !local.fabrica) {
        return res.status(422).send("Dados inválidos ou ausentes");
      }

      if (!user.nome || !user.matricula || !user.gerente) {
        return res.status(422).send("Dados inválidos ou ausentes");
      }

      let verificaModelo = await pool.query(
        `SELECT modelo
        FROM quimico.solicitacoes_pacotes
        WHERE id_modelo = $1
          AND entregue = false
          AND createdate::date = CURRENT_DATE AND celula = $2
          AND cancelado = false;`,
        [solicitacao.idModelo, local.celula]
      );

      if (verificaModelo.rowCount > 0) {
        return res
          .status(422)
          .send(
            "Você já fez uma solicitação para este(s) modelo(s) nesta célula hoje"
          );
      }

      let salvaSolicitacaoPacote = await pool.query(
        `
              INSERT INTO quimico.solicitacoes_pacotes (createdate, modelo, id_modelo, producao, celula, turno, fabrica, nome_solicitante, matricula_solicitante, gerente, processo, marca)
              VALUES ('NOW()', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          solicitacao.modelo,
          solicitacao.idModelo,
          solicitacao.producao,
          local.celula,
          local.turno,
          local.fabrica,
          user.nome,
          user.matricula,
          user.gerente,
          solicitacao.processo,
          solicitacao.marca,
        ]
      );
    }

    return res.status(200).send("Solicitação salva com sucesso!");
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaProdutosCadastrados", async (req, res) => {
  try {
    let produtos = [];

    const produtosCadastrados = await pool.query(
      `SELECT DISTINCT MAX(id) AS id, produto, MAX(preco_kg) as preco_kg FROM quimico.produtos GROUP BY produto ORDER BY produto;`
    );

    produtosCadastrados.rows.map((row) => {
      produtos.push({
        dados: { id: row.id, preco_kg: row.preco_kg },
        produto: row.produto,
      });
    });
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/salvarSolicitacaoIndividual", async (req, res) => {
  try {
    const { solicitacao } = req.body;

    if (
      !solicitacao.produto ||
      !solicitacao.idProduto ||
      !solicitacao.celula ||
      !solicitacao.turno ||
      !solicitacao.nome ||
      !solicitacao.matricula ||
      !solicitacao.gerente ||
      !solicitacao.recipientes ||
      !solicitacao.preco_kg ||
      !solicitacao.marca ||
      !solicitacao.motivo
    ) {
      return res.status(422).send("Dados inválidos ou ausentes");
    }

    const verificaProduto = await pool.query(
      `
            SELECT produto FROM quimico.solicitacoes_individuais WHERE id_produto = $1 AND entregue = false 
            AND createdate::date = CURRENT_DATE AND celula = $2;`,
      [solicitacao.idProduto, solicitacao.celula]
    );

    if (verificaProduto.rowCount > 0) {
      return res
        .status(422)
        .send(
          "Você já fez uma solicitação para este produto nesta célula hoje"
        );
    }

    const salvaSolicitacao = await pool.query(
      `
            INSERT INTO quimico.solicitacoes_individuais (createdate, produto, id_produto, celula, turno, nome_solicitante, matricula_solicitante, gerente, recipientes, preco_kg, marca, motivo_solicitacao) 
            VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        solicitacao.produto,
        solicitacao.idProduto,
        solicitacao.celula,
        solicitacao.turno,
        solicitacao.nome,
        solicitacao.matricula,
        solicitacao.gerente,
        solicitacao.recipientes,
        solicitacao.preco_kg,
        solicitacao.marca,
        solicitacao.motivo.toUpperCase(),
      ]
    );

    return res.status(200).send("Solicitação salva com sucesso!");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/pacoteSolicitacao", async (req, res) => {
  try {
    const solicitacao = await pool.query(`
        WITH solicitacoes_agrupadas AS (
          SELECT
              string_agg(DISTINCT s.id_modelo::text, ', ') AS ids,  -- Concatenando os IDs como texto
              MIN(s.createdate) AS createdate,
              MIN(s.gerente) AS gerente,
              string_agg(DISTINCT s.modelo, ' + ') AS modelo,  -- Concatenando os modelos
              SUM(s.producao) AS producao,
              s.celula,
              s.turno,
              s.fabrica,
              string_agg(DISTINCT s.id::text, ', ') AS solicitacao_ids,
              bool_and(s.entregue) AS entregue,
              MIN(s.processo) AS processo,
              bool_and(s.abastecendo) AS abastecendo,
              bool_and(s.cancelado) AS cancelado,
              s.marca,
              bool_and(s.produto_salvo) AS produto_salvo
          FROM
              quimico.solicitacoes_pacotes s
          WHERE
              s.entregue = false
              AND s.excluido = false
          GROUP BY
              s.celula,
              s.turno,
              s.marca,
              s.fabrica
      )
      SELECT
          sa.ids,
          sa.solicitacao_ids,
          sa.createdate,
          sa.gerente,
          sa.modelo,
          sa.producao,
          sa.celula,
          sa.turno,
          sa.fabrica,
          sa.entregue,
          sa.processo,
          sa.abastecendo,
          sa.cancelado,
          sa.marca,
          sa.produto_salvo,
          COALESCE(
              jsonb_agg(
                  jsonb_build_object(
                      'id', p.id,
                      'consumo_previo', p.consumo_previo,
                      'produto', p.produto,
                      'preco_kg', p.preco_kg,
                      'base', p.base,
                      'recipientes', p.recipientes
                  )
              ) FILTER (WHERE p.id_modelo IS NOT NULL), '[]'::jsonb
          ) AS produtos
      FROM
          solicitacoes_agrupadas sa
      LEFT JOIN LATERAL (
          SELECT p.*
          FROM quimico.produtos p
          WHERE p.id_modelo::text = ANY (regexp_split_to_array(sa.ids, '\, '))
      ) p ON true  -- LATERAL join com os produtos
      GROUP BY
          sa.ids,
          sa.solicitacao_ids,
          sa.createdate,
          sa.gerente,
          sa.modelo,
          sa.producao,
          sa.celula,
          sa.turno,
          sa.fabrica,
          sa.entregue,
          sa.processo,
          sa.abastecendo,
          sa.cancelado,
          sa.marca,
          sa.produto_salvo;
`);

    const removerDuplicatas = (objetoProdutos) => {
      let objs = [];
      objetoProdutos.forEach((obj) => {
        if (!obj || !obj.produtos || obj.ids.split(",").length === 1) {
          objs.push(obj);
          return;
        }

        // Utilizamos um Map para garantir que os produtos sejam únicos com base nas suas características
        const produtosUnicos = new Map();

        obj.produtos.forEach((produto) => {
          console.log(produto);
          // Cria uma chave única com base nos atributos do produto
          function normalizeText(text) {
            return text
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toUpperCase()
              .trim();
          }

          const chave = `${normalizeText(produto.produto)}-${normalizeText(
            produto.base
          )}-${parseFloat(produto.preco_kg).toFixed(2)}-${
            produto.recipientes
          }-${parseFloat(produto.consumo_previo).toFixed(3)}`;

          // Adiciona o produto ao mapa se a chave ainda não existir
          if (!produtosUnicos.has(chave)) {
            produtosUnicos.set(chave, produto);
          }
        });

        // Atualiza o array de produtos no objeto original, convertendo os valores únicos do mapa para um array
        obj.produtos = Array.from(produtosUnicos.values());

        // Retorna o objeto atualizado, com a lista de produtos única
        objs.push(obj);
      });

      return objs;
    };

    return res.status(200).json(removerDuplicatas(solicitacao.rows));
  } catch (error) {
    console.error("Erro interno no servidor: ", error);

    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/getProdutoSalvo", async (req, res) => {
  try {
    const getProdutoSalvos = await pool.query(
      `
        SELECT *
        FROM
          quimico.solicitacoes_pacotes
        WHERE
          produto_salvo = true
      `
    );

    res.status(200).send(getProdutoSalvos.rows);
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    res.status(500).send("Erro interno no servidor!");
  }
});

app.get("/individualSolicitado", async (req, res) => {
  try {
    const solicitacao = await pool.query(
      `SELECT * FROM quimico.solicitacoes_individuais WHERE entregue = false ORDER BY createdate ASC;`
    );

    return res.status(200).json(solicitacao.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/manipulaAbastecimento", async (req, res) => {
  try {
    const { abastecimento } = req.body;

    let ids;
    const checkAbastecimento = (abastecimento) => {
      if (abastecimento.includes(",")) {
        ids = abastecimento.split(",").map((id) => id.trim());
        return ids;
      }
      return [abastecimento];
    };

    if (abastecimento.instrucao === "inicio") {
      for (let id of checkAbastecimento(abastecimento.id)) {
        await pool.query(
          `UPDATE quimico.solicitacoes_pacotes SET abastecendo = true, data_inicio = NOW(), usuario_inicio = $1 WHERE id = $2`,
          [abastecimento.usuario, id]
        );
      }
      return res.status(200).send("Iniciado com sucesso");
    }

    let count_save = 0;
    if (abastecimento.instrucao === "salvar") {
      for (let id of checkAbastecimento(abastecimento.id)) {
        if (count_save === 0) {
          await pool.query(
            `
              UPDATE
                quimico.solicitacoes_pacotes
              SET
                abastecimento = $1,
                produto_salvo = true
              WHERE
                id = $2`,
            [abastecimento.abastecimentos, id]
          );
        } else {
          await pool.query(
            `
              UPDATE
                quimico.solicitacoes_pacotes
              SET
                produto_salvo = true
              WHERE
                id = $1`,
            [id]
          );
        }

        count_save += 1;
      }

      return res.status(200).json({ message: "Salvo com sucesso" });
    }

    if (abastecimento.instrucao === "fim") {
      const abastecimentosJson = JSON.parse(abastecimento.abastecimentos)[0];

      if (!abastecimentosJson.Final) {
        return res.status(400).json({
          message:
            "Dados incorretos ou ausentes. Verifique preenchimento e tente novamente!",
        });
      }

      if (!abastecimentosJson.Resíduo) {
        abastecimentosJson.Resíduo = 0;
      }

      let count_end = 0;
      for (let id of checkAbastecimento(abastecimento.id)) {
        if (count_end === 0) {
          await pool.query(
            `UPDATE quimico.solicitacoes_pacotes SET entregue = true, data_fim = NOW(), usuario_fim = $1, abastecimento = $2 WHERE id = $3`,
            [abastecimento.usuario, abastecimento.abastecimentos, id]
          );
        } else {
          await pool.query(
            `UPDATE quimico.solicitacoes_pacotes SET entregue = true, data_fim = NOW(), usuario_fim = $1 WHERE id = $2`,
            [abastecimento.usuario, id]
          );
        }
        count_end += 1;
      }

      return res.status(200).json({ message: "Finalizado com sucesso" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.put("/cancelarSolicitacao", async (req, res) => {
  try {
    const { id, matricula, motivoSelecionado } = req.body;

    if (!id || !matricula || !motivoSelecionado) {
      return res.status(400).send("ID e matrícula e motivo são obrigatórios");
    }

    const verificaDisponibilidade = await pool.query(
      `SELECT * FROM quimico.solicitacoes_pacotes WHERE id = $1 AND matricula_solicitante = $2`,
      [id, matricula]
    );
    if (verificaDisponibilidade.rowCount === 0) {
      return res
        .status(404)
        .send("Esta solicitação não foi feita pela matrícula fornecida");
    }

    const cacelaSolicitacao = await pool.query(
      `UPDATE quimico.solicitacoes_pacotes SET cancelado = true, motivo_cancelamento = $1 WHERE id = $2`,
      [motivoSelecionado, id]
    );

    return res.status(200).send("Solicitação cancelada com sucesso");
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.put("/excluiSolicitacao", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).send("ID é obrigatório");
    }

    const excluiSolicitacao = await pool.query(
      `UPDATE quimico.solicitacoes_pacotes SET excluido = true WHERE id = $1`,
      [id]
    );

    return res.status(200).send("Solicitação excluída com sucesso");
  } catch (error) {
    console.error("Erro ao excluir solicitação", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/salvaAbastecimentoIndividual", async (req, res) => {
  try {
    const { abastecimento } = req.body;

    if (!abastecimento) {
      return res.status(400).send("Dados de abastecimento não fornecidos");
    }

    if (abastecimento.instrucao === "inicio") {
      await pool.query(
        `UPDATE quimico.solicitacoes_individuais SET abastecendo = true, data_inicio = NOW(), usuario_inicio = $1 WHERE id = $2`,
        [abastecimento.usuario, abastecimento.id]
      );
      return res.status(200).send("Iniciado com sucesso");
    } else if (abastecimento.instrucao === "fim") {
      await pool.query(
        `UPDATE quimico.solicitacoes_individuais SET entregue = true, data_fim = NOW(), usuario_fim = $1, residuo = $2, abastecido = $3, mes = $4 WHERE id = $5`,
        [
          abastecimento.usuario,
          abastecimento.residuo,
          abastecimento.abastecido,
          abastecimento.mes,
          abastecimento.id,
        ]
      );
      return res.status(200).send("Finalizado com sucesso");
    } else {
      return res.status(400).send("Instrução inválida");
    }
  } catch (error) {
    console.error("Erro ao processar abastecimento", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaFiltrosIndividuais", async (req, res) => {
  try {
    const categoria = req.query.categoria;
    let filtros = [{ titulo: "", valor: "" }];

    if (!categoria) {
      return;
    }

    let categoriaFormatada =
      categoria[0].toLowerCase() + categoria.substring(1);
    let query = `SELECT DISTINCT ${categoriaFormatada} FROM quimico.solicitacoes_pacotes WHERE entregue = true ORDER BY ${categoriaFormatada} ASC;`;

    const filtrosData = await pool.query(query);

    filtrosData.rows.map((row) => {
      filtros.push({
        titulo: categoriaFormatada,
        valor: row[categoriaFormatada],
      });
    });

    return res.status(200).json(filtros);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaDadosProdutos", async (req, res) => {
  try {
    const { categoria, individual, produto } = req.query;
    const params = [];
    const produtos = [];

    let baseQuery = `
         WITH pacotes_aggregated AS (
            SELECT 
                qp.id AS produto_id,
                qp.produto,
                (abastecimento_item->>'mes')::int AS mes,
                SUM(CASE WHEN (abastecimento_item->>'Final') = '' THEN 0 ELSE (abastecimento_item->>'Final')::numeric END) AS total_produtivo,
                SUM(CASE WHEN (abastecimento_item->>'Resíduo') = '' THEN 0 ELSE (abastecimento_item->>'Resíduo')::numeric END) AS total_residuo,
                qp.preco_kg
            FROM 
                quimico.produtos qp
            JOIN 
                quimico.solicitacoes_pacotes sp ON true
            JOIN 
                jsonb_array_elements(sp.abastecimento) AS abastecimento_item
                ON (abastecimento_item->>'id')::int = qp.id
            WHERE 
                EXTRACT(YEAR FROM sp.createdate) = EXTRACT(YEAR FROM CURRENT_DATE) AND sp.cancelado = false`;

    if (individual && individual.titulo && individual.titulo !== "produto") {
      baseQuery += ` AND sp.${individual.titulo} = $${params.length + 1} `;
      params.push(individual.valor);
    }

    baseQuery += `
            GROUP BY 
                qp.id, qp.produto, mes, qp.preco_kg
        ),
        individuais_aggregated AS (
            SELECT 
                qp.id AS produto_id,
                qp.produto,
                si.mes AS mes,
                SUM(si.abastecido) AS total_produtivo,
                SUM(si.residuo) AS total_residuo,
                qp.preco_kg
            FROM 
                quimico.produtos qp
            JOIN 
                quimico.solicitacoes_individuais si ON si.id_produto = qp.id
            WHERE 
                EXTRACT(YEAR FROM si.createdate) = EXTRACT(YEAR FROM CURRENT_DATE)`;

    if (
      individual &&
      (individual.titulo === "gerente" || individual.titulo === "produto")
    ) {
      baseQuery += ` AND si.${individual.titulo} = $${params.length + 1} `;
      params.push(individual.valor);
    }

    baseQuery += `
            GROUP BY 
                qp.id, qp.produto, si.mes, qp.preco_kg
        ),
        combined_aggregated AS (
            SELECT 
                COALESCE(pa.produto_id, ia.produto_id) AS produto_id,
                COALESCE(pa.produto, ia.produto) AS produto,
                COALESCE(pa.mes, ia.mes) AS mes,
                COALESCE(pa.total_produtivo, 0) + COALESCE(ia.total_produtivo, 0) AS total_produtivo,
                COALESCE(pa.total_residuo, 0) + COALESCE(ia.total_residuo, 0) AS total_residuo,
                COALESCE(pa.preco_kg, ia.preco_kg) AS preco_kg
            FROM 
                pacotes_aggregated pa
            FULL OUTER JOIN 
                individuais_aggregated ia
            ON 
                pa.produto_id = ia.produto_id AND pa.mes = ia.mes
        )
        SELECT 
            produto,
            mes,
            total_produtivo + total_residuo AS total_consumido,
            total_produtivo,
            total_residuo,
            (total_produtivo + total_residuo) * preco_kg AS total_gasto,
            total_produtivo * preco_kg AS total_gasto_produtivo,
            total_residuo * preco_kg AS total_gasto_residuo
        FROM 
            combined_aggregated 
        WHERE 
            1 = 1`;

    if (produto) {
      baseQuery += ` AND produto = $${params.length + 1} `;
      params.push(produto);
    }

    baseQuery += `
        ORDER BY 
            produto, mes;`;

    const buscaDados = await pool.query(baseQuery, params);

    buscaDados.rows.forEach((row) => {
      const produto = row.produto;
      if (!produtos.includes(produto)) {
        produtos.push(produto);
      }
    });

    const montaGrafico = (
      dados,
      criterio,
      produtivo,
      residuo,
      label1,
      label2
    ) => {
      let dadosGrafico = {
        nome: criterio,
        labels: Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("pt-BR", { month: "long" })
        ),
        datasets: [
          {
            label: label1,
            data: Array(12).fill(0),
          },
          {
            label: label2,
            data: Array(12).fill(0),
          },
        ],
      };

      dados.forEach((item) => {
        let mesIndex = item.mes - 1;
        dadosGrafico.datasets[0].data[mesIndex] += Number(item[produtivo]);
        dadosGrafico.datasets[1].data[mesIndex] += Number(item[residuo]);
      });

      return dadosGrafico;
    };

    const graficoTotalProdutivoResiduoKG = montaGrafico(
      buscaDados.rows,
      "Consumo: Produtivo x Resíduo",
      "total_produtivo",
      "total_residuo",
      "Produtivo(Kg)",
      "Resíduo(Kg)"
    );
    const graficoTotalProdutivoResiduoRS = montaGrafico(
      buscaDados.rows,
      "Custo: Produtivo x Resíduo",
      "total_gasto_produtivo",
      "total_gasto_residuo",
      "Produtivo(R$)",
      "Resíduo(R$)"
    );
    const graficoTotalConsumoGasto = montaGrafico(
      buscaDados.rows,
      "Total Consumo x Gasto",
      "total_gasto",
      "total_consumido",
      "Gasto(R$)",
      "Consumido(Kg)"
    );

    return res.json({
      produtos: produtos,
      graficoTotalProdutivoResiduoKG: graficoTotalProdutivoResiduoKG,
      graficoTotalProdutivoResiduoRS: graficoTotalProdutivoResiduoRS,
      graficoTotalConsumoGasto: graficoTotalConsumoGasto,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/getProductHistory", async (req, res) => {
  try {
    const productData = req.query;
    const params = [];

    let query = `
      WITH pacotes_aggregated AS (
        SELECT 
            qp.id AS produto_id,
            qp.produto,
            (abastecimento_item->>'data')::timestamp AS data,
            (abastecimento_item->>'Final')::numeric AS produtivo,
            (abastecimento_item->>'Resíduo')::numeric AS residuo,
            qp.preco_kg
        FROM 
            quimico.produtos qp
        JOIN 
            quimico.solicitacoes_pacotes sp ON true
        JOIN 
            jsonb_array_elements(sp.abastecimento) AS abastecimento_item
            ON (abastecimento_item->>'id')::int = qp.id
        WHERE 
            EXTRACT(YEAR FROM sp.createdate) = EXTRACT(YEAR FROM CURRENT_DATE) AND sp.cancelado = false`;

    if (
      productData.individual &&
      productData.individual.titulo &&
      productData.individual.titulo !== "produto"
    ) {
      query += ` AND sp.${productData.individual.titulo} = $${
        params.length + 1
      } `;
      params.push(productData.individual.valor);
    }

    query += `
      GROUP BY 
            data, qp.id, qp.produto, produtivo, residuo
        ),

      individuais_aggregated AS (
            SELECT 
                qp.id AS produto_id,
                qp.produto,
                si.abastecido AS produtivo,
                si.residuo AS residuo,
                qp.preco_kg
            FROM 
                quimico.produtos qp
            JOIN 
                quimico.solicitacoes_individuais si ON si.id_produto = qp.id
            WHERE 
                EXTRACT(YEAR FROM si.createdate) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;

    if (
      productData.individual &&
      (productData.individual.titulo === "gerente" ||
        productData.individual.titulo === "produto")
    ) {
      query += ` AND si.${productData.individual.titulo} = $${
        params.length + 1
      } `;
      params.push(productData.individual.valor);
    }

    query += `
      GROUP BY 
            qp.id, qp.produto, produtivo, residuo
        ),
      combined_aggregated AS (
            SELECT 
                COALESCE(pa.produto_id, ia.produto_id) AS produto_id,
                COALESCE(pa.produto, ia.produto) AS produto,
                COALESCE(pa.data) AS data,
                COALESCE(pa.produtivo, 0) + COALESCE(ia.produtivo, 0) AS produtivo,
                COALESCE(pa.residuo, 0) + COALESCE(ia.residuo, 0) AS residuo,
                COALESCE(pa.preco_kg, ia.preco_kg) AS preco_kg
            FROM 
                pacotes_aggregated pa
            FULL OUTER JOIN 
                individuais_aggregated ia
            ON 
                pa.produto_id = ia.produto_id
        )
        SELECT 
            produto,
            data,
            produtivo AS total_consumido,
            produtivo - residuo AS produtivo,
            residuo,
            produtivo * preco_kg AS total_gasto,
            (produtivo - residuo) * preco_kg AS total_gasto_produtivo,
            residuo * preco_kg AS total_gasto_residuo
        FROM 
            combined_aggregated 
        WHERE 
            1 = 1
    `;

    if (productData.produto) {
      query += ` AND produto = $${params.length + 1} `;
      params.push(productData.produto);
    }

    query += `
      ORDER BY 
          produto, data;
    `;

    const buscaDados = await pool.query(query, params);

    const result = buscaDados.rows;

    result.sort((a, b) => {
      a - b;
    });

    let totalRsKg = {
      options: {
        chart: {
          id: "",
        },

        stroke: {
          width: 5,
          curve: "smooth",
        },

        xaxis: {
          categories: [],
        },
      },

      series: [
        {
          name: "Gasto (R$)",
          data: [],
        },
        {
          name: "Consumido (Kg)",
          data: [],
        },
      ],
    };

    let totalKg = {
      options: {
        chart: {
          id: "",
        },

        stroke: {
          width: 5,
          curve: "smooth",
        },

        xaxis: {
          categories: [],
        },
      },

      series: [
        {
          name: "Produtivo (Kg)",
          data: [],
        },
        {
          name: "Resíduo (Kg)",
          data: [],
        },
      ],
    };

    let totalRs = {
      options: {
        chart: {
          id: "",
        },

        stroke: {
          width: 5,
          curve: "smooth",
        },

        xaxis: {
          categories: [],
        },
      },

      series: [
        {
          name: "Produtivo (R$)",
          data: [],
        },
        {
          name: "Resíduo (R$)",
          data: [],
        },
      ],
    };

    let chartTitle = "";
    result.forEach((product) => {
      let date = new Date(product.data);
      chartTitle = product.produto;

      let day = String(date.getDate()).padStart(2, "0");
      let month = String(date.getMonth() + 1).padStart(2, "0");
      let year = date.getFullYear();
      let formatted = `${day}/${month}/${year}`;

      let hours = String(date.getHours()).padStart(2, "0");
      let minutes = String(date.getMinutes()).padStart(2, "0");
      let seconds = String(date.getSeconds()).padStart(2, "0");
      let formattedTime = `${hours}:${minutes}:${seconds}`;

      let formattedDate = formatted + "-" + formattedTime;

      // Total Gasto X Total Consumido
      totalRsKg.options.chart.id = product.produto;
      totalRsKg.options.xaxis.categories.push(formattedDate);
      totalRsKg.series[0].data.push(product.total_gasto);

      totalRsKg.options.chart.id = product.produto;
      totalRsKg.options.xaxis.categories.push(formattedDate);
      totalRsKg.series[1].data.push(product.total_consumido);

      // Total Gasto Kg - Residuo X Produtivo
      totalKg.options.chart.id = product.produto;
      totalKg.options.xaxis.categories.push(formattedDate);
      totalKg.series[0].data.push(product.produtivo);

      totalKg.options.chart.id = product.produto;
      totalKg.series[1].data.push(product.residuo);

      // Total Gasto R$ - Residuo X Produtivo
      totalRs.options.chart.id = product.produto;
      totalRs.options.xaxis.categories.push(formattedDate);
      totalRs.series[0].data.push(product.total_gasto_produtivo);

      totalRs.options.chart.id = product.produto;
      totalRs.series[1].data.push(product.total_gasto_residuo);
    });

    res.status(200).json({
      totalRs: totalRs,
      totalKg: totalKg,
      totalRsKg: totalRsKg,
      chartTitle: chartTitle,
      chartModel: productData.individual.valor,
    });
  } catch (error) {
    console.error("Erro ao consultar banco de dados: ", error);
  }
});

app.get("/todosProdutos", async (req, res) => {
  try {
    const { processo, modelo, pesquisa } = req.query;

    let queryBase = `SELECT * FROM quimico.produtos WHERE 1=1 `;
    const params = [];

    if (processo) {
      queryBase += `AND processo = $${params.length + 1} `;
      params.push(processo.toUpperCase());
    }

    if (modelo) {
      queryBase += `AND modelo = $${params.length + 1} `;
      params.push(modelo.toUpperCase());
    }

    if (pesquisa) {
      queryBase += `AND produto LIKE $${params.length + 1} `;
      params.push(`%${pesquisa.toUpperCase()}%`);
    }

    queryBase += `ORDER BY modelo;`;

    const produtos = await pool.query(queryBase, params);

    return res.status(200).json(produtos.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.put("/manipularProduto", async (req, res) => {
  try {
    const produto = req.body;

    if (!produto) {
      return res.status(400).send("Dados de produto não fornecidos");
    }

    if (!produto.id) {
      return res.status(400).send("ID do produto não fornecido");
    }

    const atualizaProduto = await pool.query(
      `
            UPDATE quimico.produtos
            SET produto = $1, consumo_previo = $2, preco_kg = $3, base = $4, recipientes = $5
            WHERE id = $6;`,
      [
        produto.produto.toUpperCase(),
        produto.consumo_previo,
        produto.preco_kg,
        produto.base.toUpperCase(),
        produto.recipientes,
        produto.id,
      ]
    );

    return res.status(200).send("Produto atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao editar produto", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.delete("/manipularProduto", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send("Produto não fornecido");
    }

    const deletaProduto = await pool.query(
      `DELETE FROM quimico.produtos WHERE id = $1`,
      [id]
    );

    return res.status(200).send("Produto deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar produto", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/manipularProduto", async (req, res) => {
  try {
    const produto = req.body;

    if (
      !produto.produto ||
      !produto.modelo ||
      !produto.processo ||
      !produto.recipientes ||
      !produto.consumo_previo ||
      !produto.preco_kg ||
      !produto.usuariocreate ||
      !produto.id_modelo ||
      !produto.base
    ) {
      return res.status(400).send("Dados de produto não fornecidos");
    }

    const salvaProduto = await pool.query(
      `
            INSERT INTO quimico.produtos (produto, consumo_previo, preco_kg, base, recipientes, createdate, usuariocreate, id_modelo, modelo, processo)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9);`,
      [
        produto.produto.toUpperCase(),
        produto.consumo_previo,
        produto.preco_kg,
        produto.base.toUpperCase(),
        produto.recipientes,
        produto.usuariocreate.toUpperCase(),
        produto.id_modelo,
        produto.modelo.toUpperCase(),
        produto.processo.toUpperCase(),
      ]
    );

    return res.status(200).send("Produto salvo com sucesso");
  } catch (error) {
    console.error("Erro ao salvar produto", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/xlsxPacotes", async (req, res) => {
  try {
    const solicitacao = await pool.query(`
            SELECT
                s.id,
                s.createdate,
                s.nome_solicitante,
                s.gerente,
                s.modelo,
                s.producao,
                s.celula,
                s.turno,
                s.fabrica,
                s.processo,
                s.abastecendo,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', p.id,
                            'consumo_previo', p.consumo_previo,
                            'produto', p.produto,
                            'preco_kg', p.preco_kg,
                            'base', p.base,
                            'recipientes', p.recipientes
                        )
                    ) FILTER (WHERE p.id IS NOT NULL), '[]'
                ) AS produtos
            FROM
                quimico.solicitacoes_pacotes s
            LEFT JOIN
                quimico.produtos p ON s.id_modelo = p.id_modelo
            WHERE
            s.entregue = false AND
            s.excluido = false
            GROUP BY
                s.id,
                s.createdate,
                s.nome_solicitante,
                s.gerente,
                s.modelo,
                s.producao,
                s.celula,
                s.turno,
                s.fabrica,
                s.processo,
                s.abastecendo;
        `);

    const solicitacoesPacote = solicitacao.rows;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Solicitações");

    const headers = [
      "Abastecendo",
      "Produto",
      "Abastec. Total",
      "Abastec. P/ Hora",
      "Solicitante",
      "Gerente",
      "Modelo",
      "Produção",
      "Célula",
      "Turno",
      "Fábrica",
      "Processo",
      "Recipientes",
    ];
    worksheet.addRow(headers);

    solicitacoesPacote.forEach((solicitacao) => {
      solicitacao.produtos.forEach((produto) => {
        let abastecimentoTotal = solicitacao.producao * produto.consumo_previo;
        let abastecimentoHorario = abastecimentoTotal / 4;

        worksheet.addRow([
          solicitacao.abastecendo === true ? "SIM" : "NÃO",
          produto.produto,
          abastecimentoTotal,
          abastecimentoHorario,
          solicitacao.nome_solicitante,
          solicitacao.gerente,
          solicitacao.modelo,
          solicitacao.producao,
          solicitacao.celula,
          solicitacao.turno,
          solicitacao.fabrica,
          solicitacao.processo,
          produto.recipientes,
        ]);
      });
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    worksheet.autoFilter = {
      from: "A1",
      to: "L1",
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=solicitacoes.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Erro ao buscar solicitações", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/cracha", async (req, res) => {
  try {
    const { colaborador } = req.body;

    if (
      !colaborador.matricula ||
      !colaborador.nome ||
      !colaborador.gerente ||
      !colaborador.setor ||
      !colaborador.autorizante
    ) {
      return res.status(422).send("Dados obrigatórios inválidos ou ausente");
    }

    const verificaDisponibilidade = await pool.query(
      `SELECT * FROM quimico.autorizados WHERE matricula = $1`,
      [colaborador.matricula]
    );
    if (verificaDisponibilidade.rowCount > 0) {
      return res.status(401).send("Este crachá já tem autorização.");
    }

    const salvaAltorizacao = await pool.query(
      `INSERT INTO quimico.autorizados (createdate, matricula, nome, gerente, setor, autorizante) VALUES ('NOW()', $1, $2, $3, $4, $5)`,
      [
        colaborador.matricula,
        colaborador.nome,
        colaborador.gerente,
        colaborador.setor,
        colaborador.autorizante,
      ]
    );

    return res.status(200).send("Autorização salva com sucesso");
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/cracha", async (req, res) => {
  try {
    const matricula = req.query.matricula;

    const params = [];
    let query = "SELECT * FROM quimico.autorizados  ";

    if (matricula) {
      query += `WHERE matricula LIKE $${params.length + 1} `;
      params.push(`${matricula}%`);
    }

    query += "ORDER BY createdate DESC LIMIT 10";

    const autorizados = await pool.query(query, params);

    return res.status(200).json(autorizados.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/solicitacoes", async (req, res) => {
  try {
    const { tipo, turno, gerente, data, celula } = req.query;

    const baseQueryIndividual = `
            SELECT 
                id, createdate, celula, turno, nome_solicitante, matricula_solicitante, gerente, residuo, abastecido,
                (residuo * preco_kg) as custo_residuo, 
                (abastecido * preco_kg) as custo_produtivo 
            FROM 
                quimico.solicitacoes_individuais 
            WHERE entregue = true`;

    const baseQueryPacote = `
            SELECT 
                id, createdate, celula, turno, nome_solicitante, matricula_solicitante, gerente,
                SUM(CASE WHEN (ab->>'Resíduo') = '' THEN 0 ELSE (ab->>'Resíduo')::numeric END) AS residuo,
                SUM(CASE WHEN (ab->>'Final') = '' THEN 0 ELSE (ab->>'Final')::numeric END) AS abastecido,
                SUM(CASE WHEN (ab->>'Resíduo') = '' THEN 0 ELSE (ab->>'Resíduo')::numeric END) * SUM(CASE WHEN (ab->>'preco_kg') = '' THEN 0 ELSE (ab->>'preco_kg')::numeric END) AS custo_residuo,
                SUM(CASE WHEN (ab->>'Final') = '' THEN 0 ELSE (ab->>'Final')::numeric END) * SUM(CASE WHEN (ab->>'preco_kg') = '' THEN 0 ELSE (ab->>'preco_kg')::numeric END) AS custo_produtivo
            FROM 
                quimico.solicitacoes_pacotes,
                jsonb_array_elements(abastecimento) AS ab   
            WHERE entregue = true`;

    const consulta = tipo === "individuais" ? "individuais" : "pacotes";
    let query = tipo === "individuais" ? baseQueryIndividual : baseQueryPacote;
    const params = [];

    if (turno) {
      query += ` AND turno = $${params.length + 1}`;
      params.push(turno);
    }

    if (gerente) {
      query += ` AND gerente = $${params.length + 1}`;
      params.push(gerente);
    }

    if (data) {
      query += ` AND date_trunc('day', createdate) = $${
        params.length + 1
      }::date`;
      params.push(data);
    }

    if (celula) {
      query += ` AND celula = $${params.length + 1}`;
      params.push(`${celula}%`);
    }

    query += ` GROUP BY id `;

    const result = await pool.query(query, params);

    const buscaGerentes = await pool.query(
      `SELECT DISTINCT gerente FROM quimico.solicitacoes_${consulta} WHERE entregue = true ORDER BY gerente ASC;`
    );

    let gerentes = [""];
    buscaGerentes.rows.forEach((row) => {
      gerentes.push(row.gerente);
    });

    return res
      .status(200)
      .json({ solicitacoes: result.rows, gerentes: gerentes });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return res.status(500).send("Erro interno do servidor");
  }
});
