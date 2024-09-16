import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import nodeMailer from "nodemailer";
import { WebSocketServer } from "ws";
import { pool } from "./db.cjs";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 3021;

dotenv.config();

app.use(cors());
app.use(express.json());

wss.on("connection", (ws) => {
  console.log("Socket connected");

  const sendDieselData = async () => {
    try {
      const query = await pool.query(`
        SELECT * FROM manutencao.diesel 
        ORDER BY id DESC
        LIMIT 5;
      `);
      const result = query.rows;
      ws.send(JSON.stringify(result));
    } catch (error) {
      console.error("Erro ao buscar dados!", error);
    }
  };

  // Enviar dados a cada 5 segundos
  const intervalId = setInterval(sendDieselData, 2000);

  // Limpar intervalo quando a conexão é fechada
  ws.on("close", () => {
    clearInterval(intervalId);
    console.log("Socket disconnected");
  });
});

// Configuração de Email
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-email", async (req, res) => {
  await transporter
    .sendMail({
      to: "hendrius.santana@grupodass.com.br",
      subject: `⚠️ Nível de Diesel Baixo ⚠️`,
      html: `
            <div style="font-family: Arial, sans-serif; color: #FF6F61; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #FF6F61; font-size: 24px; margin: 0;">Nível de Diesel Crítico</h1>
              </div>

              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
                <h2 style="color: #FF6F61; font-size: 20px; margin: 0 0 10px; text-align: center;"><strong>Automação Dass</strong></h2>

                <h1 style="color: #0d9757; font-size: 22px; margin-bottom: 10px;">Mensagem:</h1>
                <p style="font-size: 16px; color: #555; background-color: #f4f4f4; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                  O volume de Diesel atingiu nível crítico. É necessário fazer solicitação de compra para abastecimento!
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
                <p>Este e-mail foi gerado automaticamente. Por favor, não responda.</p>
              </div>
          </div>
            `,
    })
    .then(() => {
      return res
        .status(200)
        .send("Email enviado, responderei o mais rápido possível.");
    })
    .catch((error) => {
      console.error("Erro sending email: ", error);
      return res
        .status(404)
        .send("Erro de comunicação... Estamos trabalhando para consertar.");
    });
});

app.post("/post-diesel", async (req, res) => {
  try {
    const { nivel, unidade_dass, distancia } = req.body;

    // console.log(`Distância: ${distancia}`);
    // console.log(`Nível: ${nivel}`);

    const nivelMedido = parseFloat(nivel).toFixed(2);

    const getDiesel = await pool.query(`
        SELECT * FROM manutencao.diesel
        ORDER BY id DESC
        LIMIT 2;
      `);

    if (getDiesel.rows[1]) {
      const lastMeasure = getDiesel.rows[1];
      const threshold = parseFloat(lastMeasure.nivel) * 0.1;

      if (nivel > parseFloat(lastMeasure.nivel) + parseFloat(threshold)) {
        await pool.query(
          `
            INSERT INTO manutencao.abastecimento (quantidade, unidade_dass)
            VALUES ($1, $2);
          `,
          [nivelMedido - lastMeasure.nivel, unidade_dass]
        );
      }

      if (nivel < parseFloat(lastMeasure.nivel) - parseFloat(threshold)) {
        await pool.query(
          `
            INSERT INTO manutencao.consumo_diesel (saida, unidade_dass)
            VALUES ($1, $2);
          `,
          [lastMeasure.nivel - nivelMedido, unidade_dass]
        );
      }
    }

    await pool.query(
      `
        INSERT INTO manutencao.diesel (nivel, unidade_dass)
        VALUES ($1, $2);
      `,
      [nivelMedido, unidade_dass]
    );

    return res.status(200).json({ response: "Dados Recebidos" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ response: "Erro ao consultar dados" });
  }
});

app.get("/get-supplies", async (req, res) => {
  try {
    const query = await pool.query(`
        SELECT * FROM manutencao.abastecimento
        ORDER BY id DESC
        LIMIT 5
      `);

    const result = query.rows;

    return res.status(200).json({ response: result });
  } catch (error) {}
});

app.get("/diesel-consumption", async (req, res) => {
  try {
    const queryAvgSumDiesel = await pool.query(`
      SELECT 
          AVG(saida) as avg_consumption,
          SUM(saida) as sum_consumption,
          COUNT(*) as total_records
        FROM 
          manutencao.consumo_diesel
        WHERE 
          EXTRACT(YEAR FROM data_consumo) = EXTRACT(YEAR from CURRENT_DATE) AND
          EXTRACT(MONTH FROM data_consumo) = EXTRACT(MONTH from CURRENT_DATE);
      `);
    const avgSumDiesel = queryAvgSumDiesel.rows;

    const queryConsumptionHours = await pool.query(`
        SELECT
          EXTRACT(EPOCH FROM (data_consumo - LAG(data_consumo) OVER (ORDER BY data_consumo))) AS time_consumption
        FROM
          manutencao.consumo_diesel
        ORDER BY
          data_consumo;
      `);
    const hourConsumption = queryConsumptionHours.rows;

    const getDiesel = await pool.query(`
        SELECT * FROM manutencao.diesel
        ORDER BY id DESC
        LIMIT 2;
      `);

    // INFO: Última nível de Diesel
    const lastMeasure = getDiesel.rows[0];

    const sumConsumption = parseFloat(avgSumDiesel[0].sum_consumption);

    // INFO: Cálculo do tempo total de intervalo entre consumo
    let totalTime = 0;
    hourConsumption.forEach((value) => {
      if (value.time_consumption) {
        totalTime += parseFloat(value.time_consumption);
      }
    });

    const consumoMedio = sumConsumption / (totalTime / 3600);

    // INFO: Horas úteis
    const workingHours = lastMeasure.nivel / consumoMedio;
    const hours = Math.floor(workingHours);
    const minutes = Math.floor((workingHours - hours) * 60);

    res.status(200).json({
      avgSum: avgSumDiesel,
      workingHours: { hours: hours, minutes: minutes },
    });
  } catch (error) {
    console.error("Erro ao consultar banco de dados: ", error);

    res.status(500).json({ message: "Erro ao consultar banco de dados" });
  }
});

app.get("/chart-data", async (req, res) => {
  try {
    const getMonth = (monthNumber) => {
      const months = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return months[monthNumber - 1];
    };

    const query_supply = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM data_abastecimento) as month,
        SUM(quantidade) as total_supply
      FROM 
        manutencao.abastecimento
      WHERE 
        EXTRACT(YEAR FROM data_abastecimento) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY
        month
      ORDER BY 
        month;
    `);
    const supplyData = query_supply.rows;

    const query_consumption = await pool.query(`
        SELECT 
          EXTRACT(MONTH FROM data_consumo) as month,
          SUM(saida) as total_consumption
        FROM 
          manutencao.consumo_diesel
        WHERE 
          EXTRACT(YEAR FROM data_consumo) = EXTRACT(YEAR from CURRENT_DATE)
        GROUP BY
          month
        ORDER BY
          month
      `);
    const consumptionData = query_consumption.rows;

    let supplyConsumption = {
      options: {
        chart: {
          id: "supply-consumption",
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
          name: "Abastecimento Diesel",
          data: [],
        },
        {
          name: "Consumo Diesel",
          data: [],
        },
      ],
    };

    supplyData.forEach((value) => {
      if (
        !supplyConsumption.options.xaxis.categories.includes(
          getMonth(value.month)
        )
      ) {
        supplyConsumption.options.xaxis.categories.push(getMonth(value.month));
        supplyConsumption.series[0].data.push(value.total_supply);
      }
    });

    consumptionData.forEach((value) => {
      supplyConsumption.series[1].data.push(value.total_consumption);
    });

    res.status(200).json({ supplyConsumption });
  } catch (error) {
    console.error("Erro ao se comunicar com servidor: ", error);
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
