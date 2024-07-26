import express from 'express';
import cors from 'cors';
import { pool } from './db.cjs';
import fileUpload from 'express-fileupload';
import XLSX from 'xlsx';
import { ip } from "../ip.js"

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());

const port = 3046;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, ip, () =>
    console.log(`App listening on port ${port}!`)
);

app.get("/buscaColaboradorPeloRfid", async (req, res) => {
    try {
        const rfid = req.query.codigoRfid;
        const result = await pool.query("SELECT cf.*, lf.* FROM colaborador.funcionario cf LEFT JOIN colaborador.lista_funcionario lf ON cf.matricula = lf.matricula WHERE rfid = $1", [rfid]);

        if (result.rowCount > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).send("Não encontrado")
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar colaborador pelo RFID: ', error })
    }
})

app.get("/buscaModelos", async (req, res) => {
    try {
        let modelos = [];

        const result = await pool.query("SELECT DISTINCT modelo FROM tempos_metodos.tempo_point ORDER BY modelo")
        if (result.rowCount > 0) {
            modelos.push(result.rows.map((item) => item.modelo))

            res.status(200).json(modelos[0]);
        } else {
            res.status(404).send("Não encontrado")
        }
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

app.get("/buscaPartes", async (req, res) => {
    try {
        let partes = [];
        let modelo = req.query.modelo;

        const result = await pool.query("SELECT DISTINCT parte, tempo_peca FROM tempos_metodos.tempo_point WHERE modelo = $1 ORDER BY parte", [modelo])

        if (result.rowCount > 0) {
            partes.push(result.rows.map((item) => item.parte + " - " + item.tempo_peca))
            res.status(200).json(partes);
        } else {
            res.status(404).send("Não encontrado")
        }
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

function ajustarPeriodo(dataInicio, dataConclusao) {
    const intervalosIgnorados = [
        { start: { hours: 8, minutes: 50 }, end: { hours: 9, minutes: 50 } },
        { start: { hours: 14, minutes: 36 }, end: { hours: 14, minutes: 46 } },
        { start: { hours: 19, minutes: 40 }, end: { hours: 20, minutes: 40 } },
    ];

    intervalosIgnorados.forEach(intervalo => {
        const startIgnoreTime = new Date(dataInicio);
        startIgnoreTime.setHours(intervalo.start.hours, intervalo.start.minutes, 0, 0);
        const endIgnoreTime = new Date(dataInicio);
        endIgnoreTime.setHours(intervalo.end.hours, intervalo.end.minutes, 0, 0);

        if (dataConclusao >= startIgnoreTime && dataConclusao <= endIgnoreTime) {
            const deltaTime = dataConclusao - startIgnoreTime;
            dataConclusao = new Date(endIgnoreTime.getTime() + deltaTime);
        }

        if (dataInicio < startIgnoreTime && dataConclusao > endIgnoreTime) {
            const deltaTime = endIgnoreTime - startIgnoreTime;
            dataConclusao = new Date(dataConclusao.getTime() + deltaTime);
        }
    });

    return dataConclusao;
}

app.post("/salvaPrevisaoProducao", async (req, res) => {
    try {
        const { previsao } = req.body;

        if (!previsao.rfidCreate || !previsao.nomeCreate || !previsao.setorCreate || !previsao.matriculaCreate || !previsao.modelo || !previsao.parte || !previsao.producaoIndicada || !previsao.tempoEstimado || !previsao.tempoParte || !previsao.dataEstimadaConclusao || !previsao.point) {
            return res.status(422).send("Dados inválidos ou ausentes");
        }

        const dataInicio = new Date();
        const dataEstimadaConclusaoInicial = new Date(previsao.dataEstimadaConclusao);
        const dataEstimadaConclusaoAjustada = ajustarPeriodo(dataInicio, dataEstimadaConclusaoInicial);
        const dataEstimadaConclusaoMillis = dataEstimadaConclusaoAjustada.getTime();
        const salvamento = await pool.query(

            "INSERT INTO tempos_metodos.point (createdate, rfid_create, nome_create, setor_create, matricula_create, modelo, parte, producao_indicada, tempo_estimado, tempo_parte, data_estimada_conclusao, point) VALUES(NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10 / 1000.0), $11) RETURNING id",
            [
                previsao.rfidCreate,
                previsao.nomeCreate,
                previsao.setorCreate,
                previsao.matriculaCreate,
                previsao.modelo,
                previsao.parte,
                previsao.producaoIndicada,
                previsao.tempoEstimado,
                previsao.tempoParte,
                dataEstimadaConclusaoMillis,
                previsao.point
            ]
        );

        return res.status(200).send(salvamento.rows[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Erro interno do servidor");
    }
});

app.get("/buscaContagem", async (req, res) => {
    try {
        const point = req.query.point;
        const buscaContagem = await pool.query("SELECT * FROM tempos_metodos.point WHERE point = $1 AND rodando = true", [point]);

        if (buscaContagem.rowCount > 0) {
            return res.status(200).json(buscaContagem.rows[0]);
        } else {
            return res.status(404).json({ message: "Nenhuma contagem encontrada." });
        }
    } catch (error) {
        return res.status(500).send("Erro interno do servidor");
    }
});

app.post("/pararContagem", async (req, res) => {
    try {
        const { parada } = req.body;

        const pararContagem = await pool.query(`UPDATE tempos_metodos.point SET rodando = false, conclusao_real = 'NOW()', tempo_conclusao = $1 WHERE point = $2 AND rodando=true`, [parada.tempoConclusao, parada.point])
        return res.status(200).send("Parado com sucesso!");
    } catch (error) {
        return res.status(500).send("Erro interno do servidor")
    }
})

app.get('/buscaDadosGrafico', async (req, res) => {
    try {
        const { point } = req.query
        let query = `
            SELECT
                to_char(createdate, 'Dy') AS day_of_week,
                SUM(producao_indicada) AS producao,
                SUM(EXTRACT(EPOCH FROM tempo_estimado)) AS tempo_produtivo,
                SUM(
                    CASE
                        WHEN tempo_conclusao LIKE '-%' THEN
                            EXTRACT(EPOCH FROM (tempo_conclusao::interval))
                        ELSE
                            0
                    END
                ) AS tempo_excedente
            FROM
                tempos_metodos.point p
            WHERE
                createdate >= NOW() - INTERVAL '7 days'
        `;

        const params = [];

        if (point) {
            query += `AND point = $${params.length + 1}`;
            params.push(point)
        }

        query += `GROUP BY
                    day_of_week,
                EXTRACT(DOW FROM createdate)
                    ORDER BY
                EXTRACT(DOW FROM createdate);`

        const resultados = await pool.query(query, params);

        // Inicializa os objetos de resposta
        const data = {
            labels: [],
            producao: {
                label: 'Produção',
                data: []
            },
            tempo_produtivo: {
                label: 'Tempo Estimado',
                data: []
            },
            tempo_excedente: {
                label: 'Tempo Excedente',
                data: []
            }
        };

        // Mapeamento dos dias da semana em português
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        resultados.rows.forEach(row => {
            const dayOfWeek = row.day_of_week.trim();
            const diaCompleto = diasSemana.find(dia => dia.startsWith(dayOfWeek)) || dayOfWeek;

            data.labels.push(diaCompleto);
            data.producao.data.push(parseInt(row.producao, 10));
            data.tempo_produtivo.data.push(parseFloat(row.tempo_produtivo));
            data.tempo_excedente.data.push(parseFloat(row.tempo_excedente));
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erro interno do servidor");
    }
});

app.get("/buscaPoints", async (req, res) => {
    try {
        let arrayPoints = [];
        const points = await pool.query(`SELECT DISTINCT point FROM tempos_metodos.point ORDER BY point`)
        points.rows.forEach((row) => arrayPoints.push(row.point));

        return res.status(200).json(arrayPoints);
    } catch (error) {
        return res.status(500).send("Erro interno do servidor");
    }
})

app.get("/buscaPrevisaoSetores", async (req, res) => {
    try {
        const { point, pagina = 1, limitePagina = 15 } = req.query;
        const params = [];

        let query = `
        SELECT 
            id, createdate, nome_create, setor_create, modelo, parte, producao_indicada,
            tempo_estimado, conclusao_real, point, tempo_conclusao 
        FROM tempos_metodos.point
        WHERE 1 = 1
        `;
        if (point) {
            query += ` AND point = $${params.length + 1}`;
            params.push(point);
        }

        const offset = (pagina - 1) * limitePagina;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitePagina, offset);

        const previsaoSetores = await pool.query(query, params);

        return res.status(200).json(previsaoSetores.rows);
    } catch (error) {
        return res.status(500).send("Erro interno do servidor");
    }
});
