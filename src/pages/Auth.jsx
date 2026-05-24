import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Auth() {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            display_name: displayName,
          },
        ]);
      }

      alert("Cuenta creada correctamente 🚀");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      alert("Sesión iniciada 🚀");
    }

    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Fantasy Unionistas
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Nombre visible
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-black bg-black px-4 py-3 font-semibold text-yellow-400 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Cargando..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
          className="mt-4 text-sm text-gray-500 underline"
        >
          {mode === "login"
            ? "No tengo cuenta"
            : "Ya tengo cuenta"}
        </button>
      </div>
    </section>
  );
}