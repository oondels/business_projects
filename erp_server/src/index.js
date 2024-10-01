import cors from "cors";
import crypto from "crypto";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ip } from "../ip.js";
import { PRIVATE_KEY, tokenValidated } from "./auth.js";
import { pool } from "./db.cjs";

import axios from "axios";

// Função para obter o caminho do diretório atual em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseMD5(senha) {
  return crypto.createHash("md5").update(senha).digest("hex");
}

const app = express();

app.use(cors());
app.use(express.json());

const port = 3041;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, ip, () =>
  console.log(`App listening on port ${port}! at ip ${ip}`)
);

const storagePalavraGerencial = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "assets/arquivos/palavra_gerencial/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageDestaque = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "assets/arquivos/destaques/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadPalavraGerencial = multer({ storage: storagePalavraGerencial });
const uploadDestaque = multer({ storage: storageDestaque });

app.use(
  "/arquivos/palavra_gerencial",
  express.static(path.join(__dirname, "assets/arquivos/palavra_gerencial"))
);
app.use(
  "/arquivos/destaques",
  express.static(path.join(__dirname, "assets/arquivos/destaques"))
);

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const result = await pool.query(
      "SELECT * FROM autenticacao.usuarios WHERE usuario = $1 AND senha = $2",
      [usuario.toUpperCase(), parseMD5(senha)]
    );

    if (result.rows.length === 0)
      return res.status(401).send("Usuário ou senha incorreta!");
    const dadosBanco = result.rows[0];

    const token = jsonwebtoken.sign(
      {
        usuario: dadosBanco.usuario,
        codbarras: dadosBanco.codigo_barras,
        rfid: dadosBanco.rfid,
        matricula: dadosBanco.matricula,
        setor: dadosBanco.setor,
        nivel: dadosBanco.nivel,
        unidade: dadosBanco.unidade,
      },
      PRIVATE_KEY
    );

    return res.status(200).json({ data: { token } });
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.post("/recuperar", async (req, res) => {
  const { codigo, novaSenha } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM autenticacao.usuarios WHERE codigo_barras = $1",
      [codigo]
    );

    if (result.rows.length === 0)
      return res.status(401).send("Crachá incorreto ou não autorizado!");

    const update = await pool.query(
      "UPDATE autenticacao.usuarios SET senha = $2 WHERE codigo_barras = $1",
      [codigo, parseMD5(novaSenha)]
    );

    return res.status(200).send("Senha alterada com sucesso");
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/geo-location", async (req, res) => {
  try {
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    const publicIp = ipResponse.data.ip;

    const geoResponse = await axios.get(
      `https://ipinfo.io/${publicIp}?token=6b0724aa2eaca3`
    );

    res.send(geoResponse.data);
  } catch (error) {
    console.error("Erro interno no serviodor ", error);
  }
});

// Tela inicial

app.get("/buscaPenseAja", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT situacao_atual, nome_projeto AS title, turno, TO_CHAR(data_realizada, 'DD/MM') AS data, (regexp_split_to_array(nome, ' '))[1] || ' ' || (regexp_split_to_array(nome, ' '))[array_length(regexp_split_to_array(nome, ' '), 1)] AS nome FROM pense_aja.pense_aja WHERE status_analista = 'APROVAR' AND classificacao = 'A' ORDER BY id DESC LIMIT 6"
    );
    res.json(result.rows);
  } catch {
    return res.status(500);
  }
});

app.post(
  "/adicionarDestaque",
  uploadDestaque.single("destaque"),
  async (req, res) => {
    try {
      const { usuario } = req.body;
      const caminho = `arquivos/destaques/${req.file.filename}`;
      const titulo = req.file.filename.split("-")[1];

      const salvaCaminho = await pool.query(
        "INSERT INTO unix.arquivos (createdate, usuariocreate, arquivo, caminho, titulo) VALUES(NOW(), $1, 'DESTAQUE', $2, $3)",
        [usuario, caminho, titulo]
      );

      res.status(200).send("Arquivo salvo com sucesso!");
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao salvar arquivo");
    }
  }
);

app.get("/buscaDestaques", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, createdate, arquivo, caminho, titulo FROM unix.arquivos WHERE arquivo = 'DESTAQUE' AND createdate >= CURRENT_DATE - INTERVAL '2 months' ORDER BY id DESC"
    );
    const items = result.rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      dateTime: new Date(row.createdate).toLocaleDateString("pt-BR"),
      caminho: row.caminho,
    }));
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar itens");
  }
});

app.post(
  "/adicionarPalavraGerencial",
  uploadPalavraGerencial.single("palavraGerencial"),
  async (req, res) => {
    try {
      const { usuario } = req.body;
      const caminho = `arquivos/palavra_gerencial/${req.file.filename}`;
      const titulo = req.file.filename.split("-")[1];

      const salvaCaminho = await pool.query(
        "INSERT INTO unix.arquivos (createdate, usuariocreate, arquivo, caminho, titulo) VALUES(NOW(), $1, 'PALAVRA GERENCIAL', $2, $3)",
        [usuario, caminho, titulo]
      );

      res.status(200).send("Arquivo salvo com sucesso");
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao salvar arquivo");
    }
  }
);

app.get("/getPalavrasGerenciais", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, createdate, arquivo, caminho, titulo FROM unix.arquivos WHERE arquivo = 'PALAVRA GERENCIAL' AND createdate >= CURRENT_DATE - INTERVAL '2 months' ORDER BY id DESC"
    );
    const items = result.rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      dateTime: new Date(row.createdate).toLocaleDateString("pt-BR"),
      caminho: row.caminho,
    }));
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar itens");
  }
});

// Pesquisas

app.get("/buscaColaboradorPelaMatricula", async (req, res) => {
  try {
    const matricula = req.query.matricula;
    const result = await pool.query(
      "SELECT nome, matricula, gerente, nome_setor FROM colaborador.lista_funcionario WHERE matricula = $1",
      [matricula]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar colaborador pela MATRICULA: ", error });
  }
});

app.post("/salvaPesquisa", async (req, res) => {
  try {
    const { pesquisa } = req.body;
    if (
      !pesquisa.turno ||
      !pesquisa.diaGozado ||
      !pesquisa.diaCompensacao ||
      !pesquisa.matricula ||
      !pesquisa.nome ||
      !pesquisa.gerente ||
      !pesquisa.setor
    ) {
      return res.status(422).send("Dados inválidos ou ausentes");
    }

    const verificaDisponibilidade = await pool.query(
      "SELECT * FROM unix.pesquisa_junina WHERE matricula = $1",
      [pesquisa.matricula]
    );
    if (verificaDisponibilidade.rowCount > 0) {
      return res.status(400).send("Votação já registrada no sistema.");
    }

    const salvaPesquisa = await pool.query(
      "INSERT INTO unix.pesquisa_junina(createdate, turno, dia_gozado, dia_compensacao, matricula, nome, gerente, setor) VALUES('NOW()', $1, $2, $3, $4, $5, $6, $7)",
      [
        pesquisa.turno,
        pesquisa.diaGozado,
        pesquisa.diaCompensacao,
        pesquisa.matricula,
        pesquisa.nome,
        pesquisa.gerente,
        pesquisa.setor,
      ]
    );
    return res.status(200).send("Votação salva com sucesso");
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaPesquisaParcial", async (req, res) => {
  try {
    const buscaPesquisa = await pool.query(`WITH expanded_gozado AS (
            SELECT turno, unnest(dia_gozado::_varchar) AS dia_gozado
            FROM unix.pesquisa_junina
        ), expanded_compensacao AS (
            SELECT turno, unnest(dia_compensacao::_varchar) AS dia_compensacao
            FROM unix.pesquisa_junina
        ), gozado_counts AS (
            SELECT turno, dia_gozado, COUNT(*) AS count_gozado
            FROM expanded_gozado
            GROUP BY turno, dia_gozado
        ), compensacao_counts AS (
            SELECT turno, dia_compensacao, COUNT(*) AS count_compensacao
            FROM expanded_compensacao
            GROUP BY turno, dia_compensacao
        )
        SELECT
            g.turno,
            jsonb_object_agg(g.dia_gozado, g.count_gozado) AS dia_gozado,
            jsonb_object_agg(c.dia_compensacao, c.count_compensacao) AS dia_compensacao
        FROM
            gozado_counts g
            LEFT JOIN compensacao_counts c ON g.turno = c.turno
        GROUP BY
            g.turno
        ORDER BY g.turno;
        `);

    function criaCompensacao(nome, turno) {
      let compensacao = turno.dia_compensacao;
      const labels = Object.keys(compensacao);
      const data = Object.values(compensacao);

      const chart = {
        name: nome,
        labels: labels,
        datasets: {
          label: "Escolhidos",
          data: data,
        },
      };
      return chart;
    }

    function criaFolga(nome, turno) {
      let folga = turno.dia_gozado;
      const labels = Object.keys(folga);
      const data = Object.values(folga);

      const chart = {
        labels: labels,
        datasets: {
          label: "Escolhidos",
          data: data,
        },
      };
      return chart;
    }

    return res.json([
      { compensacaoTurno1: criaCompensacao("1° Turno", buscaPesquisa.rows[0]) },
      { compensacaoTurno2: criaCompensacao("2° Turno", buscaPesquisa.rows[1]) },
      { compensacaoTurno3: criaCompensacao("3° Turno", buscaPesquisa.rows[2]) },
      {
        compensacaoComercial: criaCompensacao(
          "Comercial",
          buscaPesquisa.rows[3]
        ),
      },

      { folgaTurno1: criaFolga("1° Turno", buscaPesquisa.rows[0]) },
      { folgaTurno2: criaFolga("2° Turno", buscaPesquisa.rows[1]) },
      { folgaTurno3: criaFolga("3° Turno", buscaPesquisa.rows[2]) },
      { folgaComercial: criaFolga("Comercial", buscaPesquisa.rows[3]) },
    ]);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaPesquisaTotal", async (req, res) => {
  try {
    const buscaPesquisa = await pool.query(`WITH expanded_gozado AS (
            SELECT unnest(dia_gozado::varchar[]) AS dia_gozado
            FROM unix.pesquisa_junina
        ), expanded_compensacao AS (
            SELECT unnest(dia_compensacao::varchar[]) AS dia_compensacao
            FROM unix.pesquisa_junina
        ), gozado_counts AS (
            SELECT dia_gozado, COUNT(*) AS count_gozado
            FROM expanded_gozado
            GROUP BY dia_gozado
        ), compensacao_counts AS (
            SELECT dia_compensacao, COUNT(*) AS count_compensacao
            FROM expanded_compensacao
            GROUP BY dia_compensacao
        )
        SELECT
            (SELECT jsonb_object_agg(dia_gozado, count_gozado) FROM gozado_counts) AS dia_gozado,
            (SELECT jsonb_object_agg(dia_compensacao, count_compensacao) FROM compensacao_counts) AS dia_compensacao;
                
        `);

    function criaCompensacao(nome, turno) {
      let compensacao = turno.dia_compensacao;
      const labels = Object.keys(compensacao);
      const data = Object.values(compensacao);

      const chart = {
        name: nome,
        labels: labels,
        datasets: {
          label: "Escolhidos",
          data: data,
        },
      };
      return chart;
    }

    function criaFolga(nome, turno) {
      let folga = turno.dia_gozado;
      const labels = Object.keys(folga);
      const data = Object.values(folga);

      const chart = {
        labels: labels,
        datasets: {
          label: "Escolhidos",
          data: data,
        },
      };
      return chart;
    }

    return res.json([
      { compensacaoTotal: criaCompensacao("Total", buscaPesquisa.rows[0]) },
      { folgaTotal: criaFolga("Total", buscaPesquisa.rows[0]) },
    ]);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaTotaisVotacao", async (req, res) => {
  try {
    const totaisVotacao = await pool.query(`
    SELECT
        SUM(CASE WHEN turno = '1° Turno' THEN 1 ELSE 0 END) AS total_turno1,
        SUM(CASE WHEN turno = '2° Turno' THEN 1 ELSE 0 END) AS total_turno2,
        SUM(CASE WHEN turno = '3° Turno' THEN 1 ELSE 0 END) AS total_turno3,
        SUM(CASE WHEN turno = 'Comercial' THEN 1 ELSE 0 END) AS total_comercial,
        count(*) as total_votacao 
    FROM
        unix.pesquisa_junina pj;
    `);

    return res.status(200).json(totaisVotacao.rows[0]);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/buscaDadosGerais", async (req, res) => {
  try {
    const buscaDadosGerais = await pool.query(`
        WITH expanded_gozado AS (
            SELECT 
                CASE 
                    WHEN dia_gozado = 'Não quero trocar' THEN 'Não quero trocar'
                    ELSE 'Outras opções'
                END AS categoria_gozado
            FROM (
                SELECT unnest(dia_gozado::varchar[]) AS dia_gozado
                FROM unix.pesquisa_junina
            ) subquery_gozado
        ), expanded_compensacao AS (
            SELECT 
                CASE 
                    WHEN dia_compensacao = 'Não quero trocar' THEN 'Não quero trocar'
                    ELSE 'Outras opções'
                END AS categoria_compensacao
            FROM (
                SELECT unnest(dia_compensacao::varchar[]) AS dia_compensacao
                FROM unix.pesquisa_junina
            ) subquery_compensacao
        ), gozado_counts AS (
            SELECT categoria_gozado, COUNT(*) AS count_gozado
            FROM expanded_gozado
            GROUP BY categoria_gozado
        ), compensacao_counts AS (
            SELECT categoria_compensacao, COUNT(*) AS count_compensacao
            FROM expanded_compensacao
            GROUP BY categoria_compensacao
        )
        SELECT
            (SELECT jsonb_object_agg(categoria_gozado, count_gozado) FROM gozado_counts) AS dia_gozado,
            (SELECT jsonb_object_agg(categoria_compensacao, count_compensacao) FROM compensacao_counts) AS dia_compensacao;        
        `);

    function criaOpcao(turno) {
      let compensacao = turno.dia_compensacao;
      const labels = Object.keys(compensacao);
      const data = Object.values(compensacao);

      const chart = {
        labels: labels,
        datasets: {
          label: "Votados",
          data: data,
        },
      };
      return chart;
    }

    return res.json(criaOpcao(buscaDadosGerais.rows[0]));
  } catch (error) {}
});

app.get("/buscaQuantidadeVotos", async (req, res) => {
  try {
    const buscaDadosGerais = await pool.query(`
        WITH gozado_categorias AS (
    SELECT 
        CASE 
            WHEN 'Não quero trocar' = ANY(dia_gozado) THEN 'Não quero trocar'
            ELSE 'Outras opções'
        END AS categoria_gozado
    FROM unix.pesquisa_junina
), compensacao_categorias AS (
    SELECT 
        CASE 
            WHEN 'Não quero trocar' = ANY(dia_compensacao) THEN 'Não quero trocar'
            ELSE 'Outras opções'
        END AS categoria_compensacao
    FROM unix.pesquisa_junina
), gozado_counts AS (
    SELECT categoria_gozado, COUNT(*) AS count_gozado
    FROM gozado_categorias
    GROUP BY categoria_gozado
), compensacao_counts AS (
    SELECT categoria_compensacao, COUNT(*) AS count_compensacao
    FROM compensacao_categorias
    GROUP BY categoria_compensacao
)
SELECT
    (SELECT jsonb_object_agg(categoria_gozado, count_gozado) FROM gozado_counts) AS dia_gozado,
    (SELECT jsonb_object_agg(categoria_compensacao, count_compensacao) FROM compensacao_counts) AS dia_compensacao;
`);

    function criaOpcao(turno) {
      let compensacao = turno.dia_compensacao;
      const labels = Object.keys(compensacao);
      const data = Object.values(compensacao);

      const chart = {
        labels: labels,
        datasets: {
          label: "Votados",
          data: data,
        },
      };
      return chart;
    }

    return res.json(criaOpcao(buscaDadosGerais.rows[0]));
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});

// Sorteio
app.post("/ganhadores", async (req, res) => {
  try {
    const { sorteio } = req.body;
    const ganhadores = [];

    const result = await pool.query(
      `
            SELECT DISTINCT matricula 
            FROM (
                SELECT matricula
                FROM sorteio.falta_zero 
                WHERE sorteado = false 
                ORDER BY RANDOM()
            ) AS subquery
            LIMIT $1
        `,
      [sorteio.quantidadeGanhadores]
    );

    for (let row of result.rows) {
      const atualizaGanhadores = await pool.query(
        `
                UPDATE sorteio.falta_zero 
                SET sorteado = true, evento = 'FALTA ZERO', data_sorteio = NOW() 
                WHERE matricula = $1 AND sorteado = false 
                RETURNING *
            `,
        [row.matricula]
      );
      ganhadores.push(...atualizaGanhadores.rows);
    }

    return res.status(200).json(ganhadores);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/filtros", async (req, res) => {
  try {
    const filtro = await pool.query(`
            SELECT gerente, setor 
            FROM (
                SELECT DISTINCT gerente, setor 
                FROM sorteio.falta_zero 
                WHERE sorteado = true
            ) AS subquery 
            ORDER BY gerente;
        `);
    const gerentes = [""];
    const setores = [""];

    filtro.rows.forEach((row) => {
      if (!gerentes.includes(row.gerente)) {
        gerentes.push(row.gerente);
      }
      if (!setores.includes(row.setor)) {
        setores.push(row.setor);
      }
    });
    return res.status(200).json({ gerentes, setores });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
});

app.get("/ganhadores", async (req, res) => {
  try {
    const { filtro } = req.query;

    let query = `SELECT * FROM sorteio.falta_zero WHERE sorteado = true `;
    const params = [];

    if (filtro.gerente) {
      query += `AND gerente = $${params.length + 1}`;
      params.push(filtro.gerente);
    }

    if (filtro.setor) {
      query += `AND setor = $${params.length + 1}`;
      params.push(filtro.setor);
    }

    if (filtro.evento) {
      query += `AND evento = $${params.length + 1}`;
      params.push(filtro.evento);
    }

    if (filtro.dataSorteio) {
      query += `AND DATE(data_sorteio) = $${params.length + 1}`;
      params.push(filtro.dataSorteio);
    }

    query += ` ORDER BY data_sorteio DESC`;

    const ganhadores = await pool.query(query, params);
    return res.status(200).json(ganhadores.rows);
  } catch (error) {
    return res.status(500).send("Erro interno do servidor");
  }
});
