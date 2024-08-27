import cors from "cors";
import express from "express";
import { ip } from "../ip.js";
import { pool } from "./db.cjs";

const app = express();

const port = 3042;
app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`App listening on port ${port} on ip ${ip}`));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/manual_maqs", async (req, res) => {
  try {
    const { filtro } = req.query;

    const params = [];

    let manualMaquinas = {};

    let query = `
        SELECT
            s.id AS setor_id, s.name AS setor_nome, m.id AS maquina_id, m.name AS maquina_nome, c.id AS categoria_id, c.name AS categoria_nome, json_agg(p.*) AS problemas
        FROM 
            Setor s
        JOIN 
            maquina_setor sm ON s.id = sm.setor_id
        JOIN 
            Maquinas m ON sm.maquina_id = m.id
        LEFT JOIN 
            Categoria c ON m.id = c.maquina_id
        LEFT JOIN 
            Problema p ON c.id = p.categoria_id
        WHERE 1=1 
        `;

    if (filtro && filtro.setor) {
      query += ` AND s.name = $${params.length + 1} `;
      params.push(filtro.setor);
    }

    if (filtro && filtro.maquina) {
      query += ` AND m.name = $${params.length + 1} `;
      params.push(filtro.maquina);
    }

    if (filtro && filtro.tipo) {
      query += ` AND p.tipo = $${params.length + 1} `;

      params.push(filtro.tipo);
    }

    query += ` GROUP BY s.id, m.id, c.id`;

    const result = await pool.query(query, params);
    const setorQuery = await pool.query(`SELECT DISTINCT name AS setor_nome FROM setor ORDER BY name`);

    const paramsMaquina = [];
    let queryMaquina = `
        SELECT
            s.id AS setor_id, s.name AS setor_nome, m.id AS maquina_id, m.name AS maquina_nome, c.id AS categoria_id, c.name AS categoria_nome, json_agg(p.*) AS problemas
        FROM 
            Setor s
        JOIN 
            maquina_setor sm ON s.id = sm.setor_id
        JOIN 
            Maquinas m ON sm.maquina_id = m.id
        LEFT JOIN 
            Categoria c ON m.id = c.maquina_id
        LEFT JOIN 
            Problema p ON c.id = p.categoria_id
        WHERE 1=1  `;

    if (filtro && filtro.setor) {
      queryMaquina += ` AND s.name = $${paramsMaquina.length + 1} `;
      paramsMaquina.push(filtro.setor);
    }

    queryMaquina += ` GROUP BY s.id, m.id, c.id`;

    const maquinaQuery = await pool.query(queryMaquina, paramsMaquina);

    result.rows.forEach((row) => {
      const setorNome = row.setor_nome;
      const maquinaNome = row.maquina_nome;
      const categoriaNome = row.categoria_nome;
      const solucoes = row.problemas;

      if (!manualMaquinas[setorNome]) {
        manualMaquinas[setorNome] = {};
      }

      if (!manualMaquinas[setorNome][maquinaNome]) {
        manualMaquinas[setorNome][maquinaNome] = {};
      }

      if (!manualMaquinas[setorNome][maquinaNome][categoriaNome]) {
        manualMaquinas[setorNome][maquinaNome][categoriaNome] = [];
      }

      solucoes.forEach((solucao) => {
        if (solucao) {
          manualMaquinas[setorNome][maquinaNome][categoriaNome].push(solucao.descricao);
        }
      });
    });

    let setor = [];
    let arraySetor = [];

    let maquina = [];
    let arrayMaquina = [];

    setorQuery.rows.forEach((row) => {
      setor.push(row.setor_nome);
      arraySetor = setor.filter((item, index) => setor.indexOf(item) === index);
    });

    maquinaQuery.rows.forEach((row) => {
      maquina.push(row.maquina_nome);
      arrayMaquina = maquina.filter((item, index) => maquina.indexOf(item) === index);
    });

    res.status(200).json({ manualMaquinas, maquinas: arrayMaquina, setores: arraySetor });
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).json({ error: "Erro ao buscar dados de manual_maqs" });
  }
});

app.post("/cadastro-maquina", async (req, res) => {
  const newManual = req.body;

  const criarSetor = async (nome) => {
    const client = await pool.connect();
    try {
      const newSetor = await client.query("INSERT INTO Setor (name) VALUES ($1) RETURNING *", [nome]);
      return newSetor.rows[0];
    } catch (error) {
      console.error("Erro ao criar Setor:", error);
      throw error;
    } finally {
      client.release();
    }
  };

  const criarMaquina = async (nome) => {
    const client = await pool.connect();
    try {
      const newMaquina = await client.query("INSERT INTO Maquinas (name) VALUES ($1) RETURNING *", [nome]);
      return newMaquina.rows[0];
    } catch (error) {
      console.error("Erro ao criar Maquina:", error);
      throw error;
    } finally {
      client.release();
    }
  };

  const criarCategoria = async (nome, maquinaId) => {
    const client = await pool.connect();
    try {
      const newCategoria = await client.query("INSERT INTO Categoria (name, maquina_id) VALUES ($1, $2) RETURNING *", [nome, maquinaId]);
      return newCategoria.rows[0];
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    } finally {
      client.release();
    }
  };

  const relacaoSetorMaquina = async (setorId, maquinaId) => {
    const client = await pool.connect();
    try {
      const relacao = await client.query("INSERT INTO maquina_setor (setor_id, maquina_id) VALUES ($1, $2) RETURNING *", [setorId, maquinaId]);
      return relacao.rows[0];
    } catch (error) {
      console.error("Erro ao criar relação de setor e máquina:", error);
      throw error;
    } finally {
      client.release();
    }
  };

  const criarProblema = async (descricao, categoriaId) => {
    const client = await pool.connect();
    try {
      const nomeProblema = await client.query("INSERT INTO Problema (descricao, categoria_id) VALUES ($1, $2) RETURNING *", [descricao, categoriaId]);
      return nomeProblema.rows[0];
    } catch (error) {
      console.error("Erro ao criar Problema:", error);
      throw error;
    } finally {
      client.release();
    }
  };

  try {
    for (const setorNome in newManual) {
      const setor = await criarSetor(setorNome);

      const maquinas = newManual[setorNome];
      for (const maquinaNome in maquinas) {
        const maquina = await criarMaquina(maquinaNome);
        await relacaoSetorMaquina(setor.id, maquina.id);

        const categorias = maquinas[maquinaNome];
        for (const categoriaNome in categorias) {
          const categoria = await criarCategoria(categoriaNome, maquina.id);

          const problemas = categorias[categoriaNome];
          for (const problemaNome of problemas) {
            await criarProblema(problemaNome, categoria.id);
          }
        }
      }
    }
    return res.status(201).json({ message: "Máquina cadastrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar os dados:", error);
    return res.status(500).json({ erro: `Error: ${error}` });
  }
});
