import { useState, useEffect } from "react";

function ResultCell({ value }) {
  if (value === 1) {
    return (
      <td className="border border-slate-700 text-center px-4 py-3 font-bold text-white bg-emerald-600">
        1
      </td>
    );
  }
  if (value === 0) {
    return (
      <td className="border border-slate-700 text-center px-4 py-3 font-bold text-white bg-red-600">
        0
      </td>
    );
  }
  return (
    <td className="border border-slate-700 text-center px-4 py-3 text-slate-500">
      —
    </td>
  );
}

function StatBar({ pct, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{pct}%</span>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-400 font-bold text-lg">🥇</span>;
  if (rank === 2) return <span className="text-slate-300 font-bold text-lg">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold text-lg">🥉</span>;
  return <span className="text-slate-500 text-sm font-semibold">#{rank}</span>;
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("pctScored");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const sorted = data
    ? [...data.players].sort((a, b) => {
        const mul = sortDir === "desc" ? -1 : 1;
        return mul * (a[sortBy] - b[sortBy]);
      })
    : [];

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-blue-400 ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading penalty data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-400 font-semibold text-lg mb-2">Error loading data</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const topScorer = [...(data?.players || [])].sort((a, b) => b.pctScored - a.pctScored)[0];
  const teamAvg =
    data.players.length > 0
      ? Math.round(data.players.reduce((s, p) => s + p.pctScored, 0) / data.players.length)
      : 0;

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            ⚽ Penalty Tracker
          </h1>
          <p className="text-slate-400 text-sm">
            Loaded from <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">PENALTY.xlsx</code>
            {" · "}{data.players.length} players · {data.testLabels.length} attempts
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Team average</p>
            <p className="text-4xl font-bold text-white">{teamAvg}<span className="text-slate-400 text-xl">%</span></p>
            <StatBar pct={teamAvg} color="bg-blue-500" />
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Top scorer</p>
            <p className="text-2xl font-bold text-white">{topScorer?.name}</p>
            <p className="text-emerald-400 font-semibold">{topScorer?.pctScored}% scored</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total attempts</p>
            <p className="text-4xl font-bold text-white">
              {data.players.reduce((s, p) => s + p.total, 0)}
            </p>
            <p className="text-slate-500 text-sm">
              {data.players.reduce((s, p) => s + p.scored, 0)} scored ·{" "}
              {data.players.reduce((s, p) => s + p.missed, 0)} missed
            </p>
          </div>
        </div>

        {/* Main table */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/60">
                  <th className="border border-slate-700 text-left px-4 py-3 text-slate-400 font-semibold w-10">
                    Rank
                  </th>
                  <th
                    className="border border-slate-700 text-left px-4 py-3 text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    Player <SortIcon col="name" />
                  </th>
                  {data.testLabels.map((label) => (
                    <th
                      key={label}
                      className="border border-slate-700 text-center px-4 py-3 text-slate-400 font-semibold"
                    >
                      {label}
                    </th>
                  ))}
                  <th
                    className="border border-slate-700 text-center px-4 py-3 text-emerald-400 font-semibold cursor-pointer hover:text-emerald-300 transition-colors"
                    onClick={() => toggleSort("pctScored")}
                  >
                    % Scored <SortIcon col="pctScored" />
                  </th>
                  <th
                    className="border border-slate-700 text-center px-4 py-3 text-red-400 font-semibold cursor-pointer hover:text-red-300 transition-colors"
                    onClick={() => toggleSort("pctMissed")}
                  >
                    % Missed <SortIcon col="pctMissed" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, idx) => {
                  const originalRank =
                    [...data.players]
                      .sort((a, b) => b.pctScored - a.pctScored)
                      .findIndex((p) => p.name === player.name) + 1;
                  return (
                    <tr
                      key={player.name}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="border border-slate-700 text-center px-4 py-3">
                        <RankBadge rank={originalRank} />
                      </td>
                      <td className="border border-slate-700 px-4 py-3 font-semibold text-white">
                        {player.name}
                      </td>
                      {player.results.map((val, i) => (
                        <ResultCell key={i} value={val} />
                      ))}
                      <td className="border border-slate-700 px-4 py-3">
                        <StatBar pct={player.pctScored} color="bg-emerald-500" />
                      </td>
                      <td className="border border-slate-700 px-4 py-3">
                        <StatBar pct={player.pctMissed} color="bg-red-500" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-600" />
            <span>Scored (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600" />
            <span>Missed (0)</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span>Click column headers to sort</span>
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-6 text-center">
          To update players — replace <code className="bg-slate-800 px-1 rounded">public/PENALTY.xlsx</code> and redeploy
        </p>
      </div>
    </div>
  );
}
