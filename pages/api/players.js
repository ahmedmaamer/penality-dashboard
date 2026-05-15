import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.Srorage_KV_REST_API_URL,
  token: process.env.Srorage_KV_REST_API_TOKEN,
});

const KEY = "penalty_store";

async function readStore() {
  return (await redis.get(KEY)) ?? { testLabels: [], players: [] };
}

async function writeStore(data) {
  await redis.set(KEY, data);
}

function recalc(player) {
  const valid = player.results.filter((v) => v !== null);
  const scored = valid.filter((v) => v === 1).length;
  const missed = valid.filter((v) => v === 0).length;
  const total = valid.length;
  return {
    ...player,
    scored,
    missed,
    total,
    pctScored: total > 0 ? Math.round((scored / total) * 100) : 0,
    pctMissed: total > 0 ? Math.round((missed / total) * 100) : 0,
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(await readStore());
  }

  if (req.method === "POST") {
    const store = await readStore();
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    const cleanName = name.trim().toUpperCase();
    if (store.players.find((p) => p.name === cleanName))
      return res.status(400).json({ error: "Player already exists" });
    store.players.push(recalc({ name: cleanName, results: Array(store.testLabels.length).fill(null) }));
    await writeStore(store);
    return res.status(200).json(store);
  }

  if (req.method === "DELETE") {
    const store = await readStore();
    const { name } = req.body;
    store.players = store.players.filter((p) => p.name !== name);
    await writeStore(store);
    return res.status(200).json(store);
  }

  if (req.method === "PATCH") {
    const store = await readStore();
    const { name, index, value } = req.body;
    store.players = store.players.map((p) => {
      if (p.name !== name) return p;
      const results = [...p.results];
      results[index] = value;
      return recalc({ ...p, results });
    });
    await writeStore(store);
    return res.status(200).json(store);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
