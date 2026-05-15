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
  if (req.method === "POST") {
    const store = await readStore();
    const newLabel = `T${store.testLabels.length + 1}`;
    store.testLabels.push(newLabel);
    store.players = store.players.map((p) =>
      recalc({ ...p, results: [...p.results, null] })
    );
    await writeStore(store);
    return res.status(200).json(store);
  }

  if (req.method === "DELETE") {
    const store = await readStore();
    if (store.testLabels.length === 0)
      return res.status(400).json({ error: "No sessions to remove" });
    store.testLabels.pop();
    store.players = store.players.map((p) =>
      recalc({ ...p, results: p.results.slice(0, -1) })
    );
    await writeStore(store);
    return res.status(200).json(store);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
