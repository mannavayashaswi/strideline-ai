import { MODELS } from "./data";

export default function Models({ selected, onSelect }) {
  return (
    <section id="models" className="section">
      <p className="eyebrow">01 / THE COLLECTION</p>

      <h2>
        CHOOSE YOUR <em>CLASSIC</em>
      </h2>

      <div className="cards">
        {MODELS.map((model) => (
          <button
            key={model.id}
            className={
              "card" + (selected === model.id ? " active" : "")
            }
            onClick={() => onSelect(model.id)}
          >
            <span className="card-num">{model.num}</span>

            <h3>{model.id}</h3>

            <p>{model.text}</p>

            <span className="card-cta">
              {selected === model.id
                ? "SELECTED ✓"
                : "SELECT MODEL →"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}