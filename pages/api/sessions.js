import path from "path";
import fs from "fs";

const dataPath = path.join(process.cwd(), "data", "players.json");

function readStore() {
  if (!fs.existsSync(dataPath)) return { testLabels: [], players: [] };
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
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

export default function handler(req, res) {
  if (req.method === "POST") {
    const store = readStore();
    const newLabel = `T${store.testLabels.length + 1}`;
    store.testLabels.push(newLabel);
    store.players = store.players.map((p) =>
      recalc({ ...p, results: [...p.results, null] })
    );
    writeStore(store);
    return res.status(200).json(store);
  }

  if (req.method === "DELETE") {
    const store = readStore();
    if (store.testLabels.length === 0)
      return res.status(400).json({ error: "No sessions to remove" });
    store.testLabels.pop();
    store.players = store.players.map((p) =>
      recalc({ ...p, results: p.results.slice(0, -1) })
    );
    writeStore(store);
    return res.status(200).json(store);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
