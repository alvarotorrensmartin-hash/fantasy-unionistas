export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Fantasy Unionistas ⚽</h2>

        <p className="mt-2 text-gray-600">
          Bienvenido a la demo del Fantasy Unionistas. Elige tu equipo antes del
          cierre de alineaciones y compite en el ranking de la jornada.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold">Normas básicas</h3>

        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>✅ Cada participante debe crear una alineación de 7 jugadores.</li>
          <li>✅ Presupuesto máximo: <strong>50M</strong>.</li>
          <li>✅ La alineación debe estar formada por:</li>
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-center">
            <p className="text-sm font-bold text-yellow-800">1</p>
            <p className="text-xs text-yellow-800">Portero</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="text-sm font-bold text-blue-800">2</p>
            <p className="text-xs text-blue-800">Defensas</p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-sm font-bold text-green-800">2</p>
            <p className="text-xs text-green-800">Medios</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-sm font-bold text-red-800">2</p>
            <p className="text-xs text-red-800">Delanteros</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>✅ Hay que elegir un capitán.</li>
          <li>✅ El capitán puntúa doble.</li>
          <li>✅ Una vez cerradas las alineaciones, no se podrán modificar.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold">Sistema de puntuación</h3>

        <p className="mt-2 text-sm text-gray-600">
          La puntuación estará basada en sistemas Fantasy tipo MARCA/Biwenger y
          podrá ajustarse durante las pruebas.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <h4 className="text-lg font-bold text-green-800">
              ➕ Acciones positivas
            </h4>

            <ul className="mt-3 space-y-2 text-sm text-green-900">
              <li className="flex justify-between">
                <span>⚽ Gol portero/defensa</span>
                <strong>+6</strong>
              </li>
              <li className="flex justify-between">
                <span>⚽ Gol mediocentro</span>
                <strong>+5</strong>
              </li>
              <li className="flex justify-between">
                <span>⚽ Gol delantero</span>
                <strong>+4</strong>
              </li>
              <li className="flex justify-between">
                <span>🅰️ Asistencia</span>
                <strong>+3</strong>
              </li>
              <li className="flex justify-between">
                <span>🧤 Penalti parado</span>
                <strong>+5</strong>
              </li>
              <li className="flex justify-between">
                <span>🚫 Portería a cero (POR)</span>
                <strong>+4</strong>
              </li>
              <li className="flex justify-between">
                <span>🚫 Portería a cero (DEF)</span>
                <strong>+3</strong>
              </li>
              <li className="flex justify-between">
                <span>⭐ Capitán</span>
                <strong>x2</strong>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h4 className="text-lg font-bold text-red-800">
              ➖ Acciones negativas
            </h4>

            <ul className="mt-3 space-y-2 text-sm text-red-900">
              <li className="flex justify-between">
                <span>🟨 Tarjeta amarilla</span>
                <strong>-1</strong>
              </li>
              <li className="flex justify-between">
                <span>🟥 Tarjeta roja</span>
                <strong>-3</strong>
              </li>
              <li className="flex justify-between">
                <span>❌ Penalti fallado</span>
                <strong>-2</strong>
              </li>
              <li className="flex justify-between">
                <span>🥅 Cada 2 goles encajados (POR/DEF)</span>
                <strong>-2</strong>
              </li>
              <li className="flex justify-between">
                <span>📉 Mal rendimiento</span>
                <strong>Variable</strong>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Referencia basada en sistemas Fantasy tipo MARCA/Biwenger.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ Esta es una demo inicial. Las normas y puntuaciones pueden cambiar
        después de las primeras pruebas.
      </div>
    </section>
  );
}