const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Análisis salarial (endpoint principal)
app.post('/api/analyses', (req, res) => {
  const { salario_actual_usd, peso_persona } = req.body;
  
  // Cálculo simple del peso
  const p50 = 5000;
  const brecha = ((salario_actual_usd - p50) / p50) * 100;
  
  res.json({
    salario_actual_usd,
    peso_persona: peso_persona || 650,
    p50_usd: p50,
    brecha_pct: brecha.toFixed(1),
    recomendaciones: "Estás en el rango del mercado"
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
