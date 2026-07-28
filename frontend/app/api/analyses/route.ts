export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { salario_actual_usd } = data;
    const p50 = 5000;
    const brecha = ((salario_actual_usd - p50) / p50) * 100;
    
    return Response.json({
      salario_actual_usd,
      peso_persona: 650,
      p50_usd: p50,
      brecha_pct: brecha.toFixed(1),
      recomendaciones: "Estás en el rango del mercado"
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
