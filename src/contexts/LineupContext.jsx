import { createContext, useContext, useMemo, useState, useEffect } from "react";

const LineupContext = createContext(null);

const BUDGET = 50.0;
const REQUIRED = { POR: 1, DEF: 2, MED: 2, DEL: 2 };

export function LineupProvider({ children }) {
  // ⬇️ cargamos del localStorage si existe
  const [picks, setPicks] = useState(() => {
    const saved = localStorage.getItem("fantasy_picks");
    return saved ? JSON.parse(saved) : [];
  });

  const [captainId, setCaptainId] = useState(() => {
  const saved = localStorage.getItem("fantasy_captain");
  return saved ? Number(saved) : null;
});

  // ⬇️ cada vez que picks cambie, guardamos
  useEffect(() => {
    localStorage.setItem("fantasy_picks", JSON.stringify(picks));
  }, [picks]);

  // ⬇️ cada vez que captainId cambie, guardamos
  useEffect(() => {
    if (captainId) {
      localStorage.setItem("fantasy_captain", captainId);
    } else {
      localStorage.removeItem("fantasy_captain");
    }
  }, [captainId]);

  const totals = useMemo(() => {
    const byPos = { POR: 0, DEF: 0, MED: 0, DEL: 0 };
    let cost = 0;
    for (const p of picks) {
      byPos[p.position] = (byPos[p.position] || 0) + 1;
      cost += p.price;
    }
    const remaining = BUDGET - cost;
    const validPos = Object.entries(REQUIRED).every(([pos, n]) => byPos[pos] === n);
    const full = picks.length === 7;
    const withinBudget = remaining >= 0;
    return { byPos, cost, remaining, validPos, full, withinBudget };
  }, [picks]);

  function canAdd(player) {
    if (picks.some((p) => p.id === player.id)) return { ok: false, reason: "Jugador ya elegido" };
    if (picks.length >= 7) return { ok: false, reason: "Ya tienes 7 jugadores" };
    const nextCount = picks.filter((p) => p.position === player.position).length + 1;
    if (nextCount > REQUIRED[player.position])
      return { ok: false, reason: `Máximo ${REQUIRED[player.position]} en ${player.position}` };
    if (totals.cost + player.price > BUDGET) return { ok: false, reason: "Sin presupuesto" };
    return { ok: true };
  }

  function add(player) {
    const chk = canAdd(player);
    if (!chk.ok) return chk;
    setPicks((prev) => [...prev, player]);
    return { ok: true };
  }

  function remove(id) {
    setPicks((prev) => prev.filter((p) => p.id !== id));
    if (captainId === id) setCaptainId(null);
  }

  const value = { picks, captainId, setCaptainId, add, remove, totals, BUDGET, REQUIRED };
  return <LineupContext.Provider value={value}>{children}</LineupContext.Provider>;
}

export function useLineup() {
  const ctx = useContext(LineupContext);
  if (!ctx) throw new Error("useLineup must be used within LineupProvider");
  return ctx;
}


