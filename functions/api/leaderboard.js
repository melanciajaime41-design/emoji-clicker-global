export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '*';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (!env.DB) return new Response(JSON.stringify({ error: 'D1 database binding DB is missing.' }), { status: 500, headers });

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100);
      const result = await env.DB.prepare(`
        SELECT player_id, player_name, score
        FROM leaderboard
        ORDER BY score DESC, updated_at ASC
        LIMIT ?
      `).bind(limit).all();
      return new Response(JSON.stringify({ rows: result.results || [] }), { headers });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const playerId = String(body.player_id || '').trim();
      const playerName = String(body.player_name || '').trim().replace(/[^\p{L}\p{N}_ .-]/gu, '').slice(0, 20);
      const score = Number(body.score);

      if (!/^[a-zA-Z0-9-]{10,100}$/.test(playerId)) {
        return new Response(JSON.stringify({ error: 'ID de jogador inválido.' }), { status: 400, headers });
      }
      if (!playerName) return new Response(JSON.stringify({ error: 'Nome inválido.' }), { status: 400, headers });
      if (!Number.isFinite(score) || score < 0 || score > 1e18) {
        return new Response(JSON.stringify({ error: 'Pontuação inválida.' }), { status: 400, headers });
      }

      await env.DB.prepare(`
        INSERT INTO leaderboard (player_id, player_name, score, updated_at)
        VALUES (?, ?, ?, unixepoch())
        ON CONFLICT(player_id) DO UPDATE SET
          player_name = excluded.player_name,
          score = CASE WHEN excluded.score > leaderboard.score THEN excluded.score ELSE leaderboard.score END,
          updated_at = CASE WHEN excluded.score > leaderboard.score THEN unixepoch() ELSE leaderboard.updated_at END
      `).bind(playerId, playerName, Math.floor(score)).run();

      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Método não permitido.' }), { status: 405, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno no ranking.' }), { status: 500, headers });
  }
}
