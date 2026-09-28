import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const SNIPE_URL = process.env.SNIPE_URL;
const SNIPE_TOKEN = process.env.SNIPE_TOKEN;

if (!SNIPE_URL || !SNIPE_TOKEN) {
  console.error("SNIPE_URL ou SNIPE_TOKEN não configurado no .env");
  process.exit(1);
}

const snipeHeaders = {
  Authorization: `Bearer ${SNIPE_TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

// Teste
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend SniperIT funcionando",
  });
});

// Buscar ativos
app.get("/api/assets", async (req, res) => {
  try {
    const limit = req.query.limit || "50";
    const offset = req.query.offset || "0";
    const search = req.query.search || "";

    const url = new URL(`${SNIPE_URL}/api/v1/hardware`);

    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);

    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: snipeHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao consultar Snipe-IT",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erro ao conectar ao Snipe-IT",
      message: error.message,
    });
  }
});

// Buscar um ativo pelo ID
app.get("/api/assets/:id", async (req, res) => {
  try {
    const response = await fetch(
      `${SNIPE_URL}/api/v1/hardware/${req.params.id}`,
      {
        headers: snipeHeaders,
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao consultar ativo",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});