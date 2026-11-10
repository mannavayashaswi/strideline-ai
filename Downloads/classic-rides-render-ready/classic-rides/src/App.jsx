import { useEffect, useState } from "react";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Models from "./Models";
import BookingForm from "./BookingForm";
import Receipt from "./Receipt";
import Footer from "./Footer";
import Auth from "./Auth";
import { apiUrl } from "./api";

const emptyForm = {
  model: "Classic 350",
  colour: "",
  name: "",
  mobile: "",
  email: "",
  pin: "",
  city: "",
  branch: "",
  date: "",
  slot: "",
  agree: false
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(apiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setUser(data.user);
        setForm((p) => ({
          ...p,
          name: data.user.name,
          email: data.user.email
        }));
      })
      .catch(() => {
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogin = (result) => {
    sessionStorage.setItem("token", result.token);
    setToken(result.token);
    setUser(result.user);

    setForm((p) => ({
      ...p,
      name: result.user.name,
      email: result.user.email
    }));
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setReceipt(null);
    setForm(emptyForm);
  };

  const selectModel = (model) => {
    setForm((p) => ({ ...p, model }));

    document.getElementById("booking")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const submitBooking = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Booking failed.");
      }

      setReceipt(result.booking);

    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="section">Loading account...</p>;
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <Auth onLogin={handleLogin} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="user-bar">
        <span>Welcome, {user.name}</span>

        <button className="btn ghost" onClick={logout}>
          LOGOUT
        </button>
      </div>

      <Hero />

      <Models
        selected={form.model}
        onSelect={selectModel}
      />

      <BookingForm
        form={form}
        setForm={setForm}
        onSubmit={submitBooking}
        submitting={submitting}
      />

      <Footer />

      {receipt && (
        <Receipt
          id={receipt._id}
          data={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </>
  );
}