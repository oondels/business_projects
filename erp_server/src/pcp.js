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

const port = 3047;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, ip, () =>
    console.log(`App listening on port ${port}!`)
);

app.post('/salvaEntrega', async (req, res) => {
    try {
        const { rfid, nome, matricula, pedido, produto, descricao, usuario } = req.body;

        if (!rfid || !nome || !matricula || !pedido || !produto || !descricao || !usuario) {
            res.status(422).json({ message: "Dados inválidos ou ausentes" })
        }

        const salvaEntrega = await pool.query("INSERT INTO pcp.entrega_pedido (createdate, rfid, nome, matricula, pedido, produto, descricao, usuariocreate) VALUES('NOW()', $1, $2, $3, $4, $5, $6, $7)", [rfid, nome, matricula, pedido, produto, descricao, usuario])
        res.status(200).json({ message: "Entrerga salva com sucesso" })

    } catch (error) {
        res.status(500).json({ error })
    }
})

app.get('/buscaEntregas', async (req, res) => {
    try {
        const data = req.query.data

        const entregas = await pool.query("SELECT * FROM pcp.entrega_pedido WHERE DATE(createdate) = $1", [data])
        res.status(200).json(entregas.rows)
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

app.get('/buscaColaboradorRfid', async (req, res) => {
    try {
        const codigoRfid = req.query.codigoRfid

        const colaborador = await pool.query("SELECT * FROM colaborador.funcionario WHERE codbarras = $1 LIMIT 1", [codigoRfid])
        res.status(200).json(colaborador.rows[0])
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

app.get('/buscaColaboradorMatricula', async (req, res) => {
    try {
        const matricula = req.query.matricula

        const colaborador = await pool.query("SELECT * FROM colaborador.lista_funcionario WHERE matricula = $1 LIMIT 1", [matricula])
        res.status(200).json(colaborador.rows[0])
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

app.get('/buscaPedido', async (req, res) => {
    try {
        const pedido = req.query.pedido

        const dadosPedido = await pool.query("SELECT * FROM pcp.pedidos WHERE docto = $1 LIMIT 1", [pedido])
        res.status(200).json(dadosPedido.rows[0])
    } catch (error) {
        res.status(500).json("Erro interno do servidor")
    }
})

app.post('/importarPlanilhaPedidos', async (req, res) => {
    try {
        if (!req.files || !req.files.planilha) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        const planilha = req.files.planilha;
        const workbook = XLSX.read(planilha.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const limpaTabela = await pool.query("DELETE FROM pcp.pedidos")

        for (const row of sheet) {
            await pool.query(
                "INSERT INTO pcp.pedidos (createdate, semana, linha, docto, ordem, produto, descricao, cor, entradacorte, saidacorte) VALUES(NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [row.Semana, row.Linha, row.Docto, row.Ordem, row.Produto, row.Descricao, row.Cor, row.EntradaCORTE, row.SaidaCORTE]
            );
        }

        res.status(200).json({ message: 'Dados importados com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao importar dados' });
    }
});