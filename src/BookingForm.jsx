import { useState } from "react";
import {
  MODELS,
  COLOURS,
  CITIES,
  BRANCHES,
  SLOTS
} from "./data";

const today = new Date().toISOString().split("T")[0];

export default function BookingForm({
  form,
  setForm,
  onSubmit,
  submitting
}) {
  const [errors, setErrors] = useState({});

  const update = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (form.name.trim().length < 3)
      newErrors.name = "Enter your name.";

    if (!/^[6-9]\d{9}$/.test(form.mobile))
      newErrors.mobile = "Enter a valid mobile number.";

    if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Enter a valid email.";

    if (!/^\d{6}$/.test(form.pin))
      newErrors.pin = "Enter a valid PIN code.";

    if (!form.colour)
      newErrors.colour = "Select a colour.";

    if (!form.city)
      newErrors.city = "Select a city.";

    if (!form.branch)
      newErrors.branch = "Select a showroom.";

    if (!form.date || form.date < today)
      newErrors.date = "Select a valid future date.";

    if (!form.slot)
      newErrors.slot = "Select a time slot.";

    if (!form.agree)
      newErrors.agree = "Please accept the declaration.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const Field = ({ label, name, children }) => (
    <label className="field">
      <span>{label}</span>
      {children}
      {errors[name] && (
        <span className="err">{errors[name]}</span>
      )}
    </label>
  );

  return (
    <section id="booking" className="section">
      <p className="eyebrow">02 / Your journey begins</p>

      <h2>
        PRE-BOOKING <em>ENQUIRY</em>
      </h2>

      <p className="sub">
        Submit your enquiry to save it in MongoDB Atlas.
      </p>

      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>01 — Motorcycle details</legend>

          <div className="grid">
            <Field label="Motorcycle" name="model">
              <select
                name="model"
                value={form.model}
                onChange={update}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Preferred colour" name="colour">
              <select
                name="colour"
                value={form.colour}
                onChange={update}
              >
                <option value="">Select colour</option>
                {COLOURS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend>02 — Personal details</legend>

          <div className="grid">
            <Field label="Full name" name="name">
              <input
                name="name"
                value={form.name}
                onChange={update}
                required
              />
            </Field>

            <Field label="Mobile number" name="mobile">
              <input
                name="mobile"
                value={form.mobile}
                onChange={update}
                maxLength={10}
                inputMode="numeric"
                required
              />
            </Field>

            <Field label="Email address" name="email">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                required
              />
            </Field>

            <Field label="PIN code" name="pin">
              <input
                name="pin"
                value={form.pin}
                onChange={update}
                maxLength={6}
                inputMode="numeric"
                required
              />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend>03 — Showroom details</legend>

          <div className="grid">
            <Field label="City" name="city">
              <select
                name="city"
                value={form.city}
                onChange={update}
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Showroom" name="branch">
              <select
                name="branch"
                value={form.branch}
                onChange={update}
              >
                <option value="">Select showroom</option>
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>

            <Field label="Visit date" name="date">
              <input
                type="date"
                name="date"
                min={today}
                value={form.date}
                onChange={update}
              />
            </Field>

            <Field label="Time slot" name="slot">
              <select
                name="slot"
                value={form.slot}
                onChange={update}
              >
                <option value="">Select time</option>
                {SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        <label className="check">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={update}
          />

          I understand this is an enquiry and not a confirmed booking.
        </label>

        {errors.agree && (
          <p className="err">{errors.agree}</p>
        )}

        <button
          type="submit"
          className="btn submit"
          disabled={submitting}
        >
          {submitting ? "SAVING..." : "SUBMIT ENQUIRY →"}
        </button>
      </form>
    </section>
  );
}