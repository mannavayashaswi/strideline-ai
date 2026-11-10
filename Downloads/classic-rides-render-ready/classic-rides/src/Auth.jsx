import { useState } from "react";
import { apiUrl } from "./api";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login"
        ? apiUrl("/api/auth/login")
        : apiUrl("/api/auth/register");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed.");
      }

      onLogin(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section auth-section">
      <p className="eyebrow">CLASSIC RIDES ACCOUNT</p>

      <h2>
        {mode === "login" ? (
          <>WELCOME <em>BACK</em></>
        ) : (
          <>CREATE <em>ACCOUNT</em></>
        )}
      </h2>

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && (
          <label className="field">
            Full Name

            <input
              name="name"
              value={form.name}
              onChange={update}
              required
              minLength={3}
            />
          </label>
        )}

        <label className="field">
          Email Address

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
          />
        </label>

        <label className="field">
          Password

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            required
            minLength={8}
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
          />
        </label>

        {error && <p className="err">{error}</p>}

        <button
          className="btn"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "PLEASE WAIT..."
            : mode === "login"
              ? "LOGIN →"
              : "REGISTER →"}
        </button>
      </form>

      <p className="auth-switch">
        {mode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? " Register" : " Login"}
        </button>
      </p>
    </section>
  );
}