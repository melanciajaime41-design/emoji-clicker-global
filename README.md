# Emoji Clicker 2 — Ranking Global

Esta versão mantém o jogo local e adiciona um ranking global usando **Cloudflare Pages + Pages Functions + D1**.

## Estrutura

- `index.html` — jogo + janela do ranking global.
- `functions/api/leaderboard.js` — API GET/POST do ranking.
- `schema.sql` — tabela do ranking.

## Configuração do servidor

1. Crie uma conta no Cloudflare.
2. Vá em **Workers & Pages → Create → Pages** e conecte um repositório GitHub contendo esta pasta. Pages Functions não funcionam por upload direto do painel.
3. Crie um banco **D1** em Workers & Pages → D1.
4. Abra o banco D1 e execute o conteúdo de `schema.sql` no console SQL.
5. No projeto Pages, abra **Settings → Bindings → Add → D1 database**.
6. Use exatamente o nome da variável/binding: `DB`.
7. Selecione o banco D1 que você criou e faça um novo deploy.

Depois do deploy, o jogo usará automaticamente `/api/leaderboard`.

## Observação importante

O ranking guarda o maior `totalEarned` enviado por cada navegador. Como o cálculo do jogo continua acontecendo no navegador, um usuário tecnicamente pode adulterar a pontuação. Para um ranking competitivo/anti-cheat, o cálculo da pontuação precisaria ser validado no servidor.

## Teste local

Você pode testar o HTML sozinho, mas o ranking só funciona depois que `/api/leaderboard` estiver publicado em Pages Functions com o D1 vinculado.
