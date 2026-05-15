import { useState, useEffect, useRef } from "react";

const t = {
  en: {
    title: "Penalty Tracker",
    players: "players",
    sessions: "sessions",
    teamAvg: "Team Average",
    topScorer: "Top Scorer",
    totalAttempts: "Total Attempts",
    scored: "scored",
    missed: "missed",
    rank: "Rank",
    player: "Player",
    pctScored: "% Scored",
    pctMissed: "% Missed",
    addPlayer: "+ Add Player",
    addSession: "+ Session",
    removeSession: "− Session",
    add: "Add",
    cancel: "Cancel",
    noPlayers: "No players yet —",
    addPlayerCta: "Add a player",
    loading: "Loading…",
    errorTitle: "Error loading data",
    scoredLegend: "Scored (1)",
    missedLegend: "Missed (0)",
    notTaken: "Not taken (—)",
    tapHint: "Tap a result cell to cycle",
    enterName: "Enter a name",
    playerExists: "Player already exists",
    namePlaceholder: "Player name",
    addPlayerTitle: "Add Player",
    removePlayer: "Remove player",
    pctScoredShort: "%+",
    pctMissedShort: "%-",
    sortBtn: "Sort",
    sortOptions: [
      { label: "Default order", sortBy: null, sortDir: null },
      { label: "Highest to lowest", sortBy: "pctScored", sortDir: "desc" },
    ],
  },
  fr: {
    title: "Suivi des Penalties",
    players: "joueurs",
    sessions: "séances",
    teamAvg: "Moyenne équipe",
    topScorer: "Meilleur buteur",
    totalAttempts: "Total tentatives",
    scored: "marqués",
    missed: "ratés",
    rank: "Rang",
    player: "Joueur",
    pctScored: "% Marqués",
    pctMissed: "% Ratés",
    addPlayer: "+ Ajouter joueur",
    addSession: "+ Séance",
    removeSession: "− Séance",
    add: "Ajouter",
    cancel: "Annuler",
    noPlayers: "Aucun joueur —",
    addPlayerCta: "Ajouter un joueur",
    loading: "Chargement…",
    errorTitle: "Erreur de chargement",
    scoredLegend: "Marqué (1)",
    missedLegend: "Raté (0)",
    notTaken: "Non tiré (—)",
    tapHint: "Appuyez sur une cellule pour changer",
    enterName: "Entrez un nom",
    playerExists: "Joueur déjà existant",
    namePlaceholder: "Nom du joueur",
    addPlayerTitle: "Ajouter un joueur",
    removePlayer: "Supprimer",
    pctScoredShort: "%+",
    pctMissedShort: "%-",
    sortBtn: "Trier",
    sortOptions: [
      { label: "Ordre par défaut", sortBy: null, sortDir: null },
      { label: "Du plus haut au plus bas", sortBy: "pctScored", sortDir: "desc" },
    ],
  },
  ar: {
    title: "متتبع ركلات الجزاء",
    players: "لاعبون",
    sessions: "جلسات",
    teamAvg: "متوسط الفريق",
    topScorer: "أفضل مسجّل",
    totalAttempts: "إجمالي المحاولات",
    scored: "مسجّلة",
    missed: "فائتة",
    rank: "الترتيب",
    player: "اللاعب",
    pctScored: "% مسجّل",
    pctMissed: "% فائت",
    addPlayer: "+ إضافة لاعب",
    addSession: "+ جلسة",
    removeSession: "− جلسة",
    add: "إضافة",
    cancel: "إلغاء",
    noPlayers: "لا يوجد لاعبون بعد —",
    addPlayerCta: "أضف لاعبًا",
    loading: "جارٍ التحميل…",
    errorTitle: "خطأ في تحميل البيانات",
    scoredLegend: "مسجّل (1)",
    missedLegend: "فائت (0)",
    notTaken: "لم يُنفَّذ (—)",
    tapHint: "اضغط على خلية لتغيير النتيجة",
    enterName: "أدخل اسمًا",
    playerExists: "اللاعب موجود مسبقًا",
    namePlaceholder: "اسم اللاعب",
    addPlayerTitle: "إضافة لاعب",
    removePlayer: "حذف اللاعب",
    pctScoredShort: "%+",
    pctMissedShort: "%-",
    sortBtn: "ترتيب",
    sortOptions: [
      { label: "الترتيب الافتراضي", sortBy: null, sortDir: null },
      { label: "من الأعلى إلى الأدنى", sortBy: "pctScored", sortDir: "desc" },
    ],
  },
};

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

function nextValue(v) {
  if (v === null) return 1;
  if (v === 1) return 0;
  return null;
}

function ResultCell({ value, onClick }) {
  const base = "border border-gray-200 text-center px-3 py-5 font-bold cursor-pointer select-none transition-all active:scale-95 text-base [touch-action:manipulation]";
  if (value === 1)
    return <td onClick={onClick} className={`${base} text-white bg-emerald-500 active:bg-emerald-400`}>1</td>;
  if (value === 0)
    return <td onClick={onClick} className={`${base} text-white bg-red-500 active:bg-red-400`}>0</td>;
  return <td onClick={onClick} className={`${base} text-gray-400 bg-gray-50 active:bg-gray-200`}>—</td>;
}

function StatBar({ pct, color }) {
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right text-gray-700">{pct}%</span>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-500 font-bold text-xl">🥇</span>;
  if (rank === 2) return <span className="text-gray-400 font-bold text-xl">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold text-xl">🥉</span>;
  return <span className="text-gray-400 font-semibold">#{rank}</span>;
}

function SortMenu({ tr, sortBy, sortDir, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const active = tr.sortOptions.find(
    (o) => o.sortBy === (sortBy ?? null) && o.sortDir === (sortDir ?? null)
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl shadow-sm text-sm [touch-action:manipulation] active:bg-gray-50 transition-colors"
      >
        <span>⇅</span>
        <span>{active?.label ?? tr.sortBtn}</span>
      </button>
      {open && (
        <div className="absolute top-full mt-2 start-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[170px] overflow-hidden">
          {tr.sortOptions.map((opt) => {
            const isActive = opt.sortBy === sortBy && opt.sortDir === sortDir;
            return (
              <button
                key={opt.label}
                onClick={() => { onSelect(opt.sortBy, opt.sortDir); setOpen(false); }}
                className={`w-full text-start px-4 py-3 text-sm transition-colors [touch-action:manipulation] ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LangSwitcher({ lang, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {[["en", "EN"], ["fr", "FR"], ["ar", "ع"]].map(([code, label]) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors [touch-action:manipulation] ${
            lang === code
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 active:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AddPlayerModal({ lang: l, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef(null);
  const tr = t[l];
  const isRtl = l === "ar";

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  async function submit() {
    if (!name.trim()) { setErr(tr.enterName); return; }
    const r = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const d = await r.json();
    if (d.error) { setErr(tr.playerExists); return; }
    onAdd(d);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-gray-900 font-bold text-xl mb-5">{tr.addPlayerTitle}</h2>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={tr.namePlaceholder}
          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-2"
        />
        {err && <p className="text-red-500 text-sm mb-2">{err}</p>}
        <div className="flex gap-3 mt-4">
          <button
            onClick={submit}
            className="flex-1 bg-blue-600 active:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors text-base [touch-action:manipulation]"
          >
            {tr.add}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 active:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-base [touch-action:manipulation]"
          >
            {tr.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [testLabels, setTestLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [lang, setLang] = useState("en");

  const tr = t[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && t[saved]) setLang(saved);
  }, []);

  function changeLang(l) {
    setLang(l);
    localStorage.setItem("lang", l);
  }

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setPlayers(d.players); setTestLabels(d.testLabels); }
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  function applyStore(d) {
    setPlayers(d.players);
    setTestLabels(d.testLabels);
  }

  async function toggleCell(playerName, index) {
    const player = players.find((p) => p.name === playerName);
    const value = nextValue(player.results[index]);
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.name !== playerName) return p;
        const results = [...p.results];
        results[index] = value;
        return recalc({ ...p, results });
      })
    );
    const r = await fetch("/api/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, index, value }),
    });
    const d = await r.json();
    if (!d.error) applyStore(d);
  }

  async function deletePlayer(name) {
    const r = await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const d = await r.json();
    if (!d.error) applyStore(d);
  }

  async function addSession() {
    const r = await fetch("/api/sessions", { method: "POST" });
    const d = await r.json();
    if (!d.error) applyStore(d);
  }

  async function removeSession() {
    if (testLabels.length === 0) return;
    const r = await fetch("/api/sessions", { method: "DELETE" });
    const d = await r.json();
    if (!d.error) applyStore(d);
  }

  function setSort(by, dir) {
    setSortBy(by);
    setSortDir(dir);
  }

  const sorted = sortBy
    ? [...players].sort((a, b) => {
        const mul = sortDir === "desc" ? -1 : 1;
        if (sortBy === "name") return mul * a.name.localeCompare(b.name);
        return mul * (a[sortBy] - b[sortBy]);
      })
    : [...players];

  const ranked = [...players].sort((a, b) => b.pctScored - a.pctScored);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{tr.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">{tr.errorTitle}</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const topScorer = ranked[0];
  const teamAvg = players.length > 0
    ? Math.round(players.reduce((s, p) => s + p.pctScored, 0) / players.length)
    : 0;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 p-4 md:p-10">
      {showAddPlayer && (
        <AddPlayerModal
          lang={lang}
          onAdd={(d) => { applyStore(d); setShowAddPlayer(false); }}
          onClose={() => setShowAddPlayer(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              ⚽ {tr.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {players.length} {tr.players} · {testLabels.length} {tr.sessions}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LangSwitcher lang={lang} onChange={changeLang} />
            <SortMenu tr={tr} sortBy={sortBy} sortDir={sortDir} onSelect={setSort} />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-blue-600 active:bg-blue-500 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm [touch-action:manipulation] shadow-sm"
              >
                {tr.addPlayer}
              </button>
              <button
                onClick={addSession}
                className="bg-white border border-gray-200 active:bg-gray-50 text-gray-700 font-semibold px-4 py-3 rounded-xl transition-colors text-sm [touch-action:manipulation] shadow-sm"
              >
                {tr.addSession}
              </button>
              <button
                onClick={removeSession}
                disabled={testLabels.length === 0}
                className="bg-white border border-gray-200 active:bg-red-50 active:border-red-200 active:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-semibold px-4 py-3 rounded-xl transition-colors text-sm [touch-action:manipulation] shadow-sm"
              >
                {tr.removeSession}
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{tr.teamAvg}</p>
            <p className="text-4xl font-bold text-gray-900">{teamAvg}<span className="text-gray-400 text-xl">%</span></p>
            <StatBar pct={teamAvg} color="bg-blue-500" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{tr.topScorer}</p>
            <p className="text-2xl font-bold text-gray-900">{topScorer?.name ?? "—"}</p>
            <p className="text-emerald-600 font-semibold">{topScorer?.pctScored ?? 0}% {tr.scored}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{tr.totalAttempts}</p>
            <p className="text-4xl font-bold text-gray-900">
              {players.reduce((s, p) => s + p.total, 0)}
            </p>
            <p className="text-gray-500 text-sm">
              {players.reduce((s, p) => s + p.scored, 0)} {tr.scored} ·{" "}
              {players.reduce((s, p) => s + p.missed, 0)} {tr.missed}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="border-r border-gray-200 text-center px-3 py-4 text-gray-500 font-semibold">
                    {tr.rank}
                  </th>
                  <th className="border-r border-gray-200 text-start px-4 py-4 text-gray-500 font-semibold">
                    {tr.player}
                  </th>
                  {testLabels.map((label) => (
                    <th key={label} className="border-r border-gray-200 text-center px-4 py-4 text-gray-500 font-semibold">
                      {label}
                    </th>
                  ))}
                  <th className="border-r border-gray-200 text-center px-4 py-4 text-emerald-600 font-semibold">
                    {tr.pctScored}
                  </th>
                  <th className="border-r border-gray-200 text-center px-4 py-4 text-red-500 font-semibold">
                    {tr.pctMissed}
                  </th>
                  <th className="px-3 py-4 w-12" />
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr>
                    <td colSpan={5 + testLabels.length} className="text-center py-16 text-gray-400 text-base">
                      {tr.noPlayers}{" "}
                      <button
                        onClick={() => setShowAddPlayer(true)}
                        className="text-blue-500 underline [touch-action:manipulation]"
                      >
                        {tr.addPlayerCta}
                      </button>
                    </td>
                  </tr>
                )}
                {sorted.map((player) => {
                  const rank = ranked.findIndex((p) => p.name === player.name) + 1;
                  return (
                    <tr key={player.name} className="border-b border-gray-100 last:border-0">
                      <td className="border-r border-gray-100 text-center px-3 py-4">
                        <RankBadge rank={rank} />
                      </td>
                      <td className="border-r border-gray-100 px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {player.name}
                      </td>
                      {player.results.map((val, i) => (
                        <ResultCell key={i} value={val} onClick={() => toggleCell(player.name, i)} />
                      ))}
                      <td className="border-r border-gray-100 px-4 py-4">
                        <StatBar pct={player.pctScored} color="bg-emerald-500" />
                      </td>
                      <td className="border-r border-gray-100 px-4 py-4">
                        <StatBar pct={player.pctMissed} color="bg-red-400" />
                      </td>
                      <td className="text-center px-2 py-4">
                        <button
                          onClick={() => deletePlayer(player.name)}
                          className="w-9 h-9 flex items-center justify-center mx-auto rounded-lg text-gray-300 active:text-red-500 active:bg-red-50 transition-colors text-xl [touch-action:manipulation]"
                          title={tr.removePlayer}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span>{tr.scoredLegend}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>{tr.missedLegend}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200" />
            <span>{tr.notTaken}</span>
          </div>
          <span>· {tr.tapHint}</span>
        </div>
      </div>
    </div>
  );
}
