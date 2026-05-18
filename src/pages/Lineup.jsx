import { useLineup } from "../contexts/LineupContext.jsx";

export default function Lineup() {
  const {
    picks,
    remove,
    captainId,
    setCaptainId,   // <- importante: este es el nombre correcto del contexto
    totals,
    BUDGET,
    REQUIRED,
  } = useLineup();

  const ok = totals.full && totals.validPos && totals.withinBudget;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Tu Alineación</h2>

      {/* Estado general */}
      <div
        className={`rounded-xl border p-3 text-sm font-medium ${
          ok
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {ok ? "✅ Alineación válida y completa" : "⚠️ Revisa tu alineación"}
      </div>

      {/* Presupuesto */}
      <div className="text-sm text-gray-700">
        <strong>Presupuesto:</strong> {totals.cost.toFixed(1)} / {BUDGET.toFixed(1)} M ·{" "}
        Restante: {totals.remaining.toFixed(1)} M
      </div>

      {/* Chips de posiciones */}
      <div className="flex flex-wrap gap-2 text-sm">
        {Object.entries(REQUIRED).map(([pos, n]) => (
          <span key={pos} className="rounded-xl border border-union-gray px-2.5 py-1">
            {pos}: {totals.byPos[pos] || 0}/{n}
          </span>
        ))}
        <span className="rounded-xl border border-union-gray px-2.5 py-1">
          Total: {picks.length}/7
        </span>
      </div>

      {/* Avisos */}
      {!totals.withinBudget && (
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          ⚠️ Te pasas del presupuesto.
        </p>
      )}
      {picks.length === 7 && !totals.validPos && (
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          ⚠️ Debe ser 1 POR, 2 DEF, 2 MED, 2 DEL.
        </p>
      )}

      {/* Tabla de alineación */}
      <div className="overflow-x-auto rounded-2xl border border-union-gray bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Posición</th>
              <th className="px-3 py-2 text-left">Precio (M)</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((p, i) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.position}</td>
                <td className="px-3 py-2">{p.price.toFixed(1)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => remove(p.id)}
                      className="px-3 py-2 rounded-xl border border-union-black hover:bg-union-black hover:text-white transition"
                    >
                      Quitar
                    </button>
                    <button
                      onClick={() => setCaptainId(p.id)}
                      className={`px-3 py-2 rounded-xl border transition ${
                        captainId === p.id
                          ? "bg-union-accent border-yellow-500 text-black"
                          : "border-union-black hover:bg-union-black hover:text-white"
                      }`}
                    >
                      {captainId === p.id ? "Capitán ✅" : "Capitán"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {picks.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={5}>
                  Aún no has añadido jugadores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CTA final (demo) */}
      <div>
        <button
          disabled={!(ok && !!captainId)}
          onClick={() => alert("Alineación guardada (demo)")}
          className={`px-4 py-2 rounded-xl border transition ${
            ok && !!captainId
              ? "bg-union-black text-white border-union-black hover:opacity-90"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Confirmar alineación (demo)
        </button>
      </div>
    </section>
  );
}

