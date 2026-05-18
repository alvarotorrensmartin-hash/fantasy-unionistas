import { useState, useMemo, useEffect } from "react";
import { players } from "../data/players.js";
import { useLineup } from "../contexts/LineupContext.jsx";

const positions = ["ALL", "POR", "DEF", "MED", "DEL"];

export default function Players() {
  console.log("✅ Players renderizado correctamente");
  const [query, setQuery] = useState(() => localStorage.getItem("fantasy_filter_query") || "");
  const [pos, setPos] = useState(() => localStorage.getItem("fantasy_filter_pos") || "ALL");
  const { add } = useLineup();

  // guardar filtros
  useEffect(() => {
    localStorage.setItem("fantasy_filter_query", query);
    localStorage.setItem("fantasy_filter_pos", pos);
  }, [query, pos]);

  // aplicar filtros
  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchPos = pos === "ALL" || p.position === pos;
      const matchText = p.name.toLowerCase().includes(query.toLowerCase());
      return matchPos && matchText;
    });
  }, [query, pos]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Jugadores</h2>

      {/* filtros */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="border rounded-xl px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-gray-400"
        />
        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
        >
          {positions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* tabla de jugadores */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">#</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Posición</th>
            <th className="p-2">Precio (M)</th>
            <th className="p-2 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
  {filtered.map((p) => (
    <tr key={p.id} className="border-b hover:bg-gray-50">
      <td className="p-2">{p.id}</td>
      <td className="p-2">{p.name}</td>
      <td className="p-2">{p.position}</td>
      <td className="p-2">{p.price.toFixed(1)}</td>
      <td className="p-2 text-right">
        <button
          onClick={() => add(p)}
          className="px-3 py-2 rounded-xl border border-union-black text-union-black bg-white
                     hover:!bg-union-black hover:!text-union-accent
                     active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:!ring-union-accent"
        >
          Añadir
        </button>
      </td>
    </tr>
  ))}

  {filtered.length === 0 && (
    <tr>
      <td colSpan={5} className="p-4 text-center text-gray-500">
        No se encontraron jugadores.
      </td>
    </tr>
  )}
</tbody>
      </table>
    </section>
  );
}

