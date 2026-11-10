export default function Receipt({ id, data, onClose }) {
  const rows = [
    ["Reference ID", id],
    ["Motorcycle", data.model],
    ["Colour", data.colour],
    ["Name", data.name],
    ["Mobile", data.mobile],
    ["Email", data.email],
    ["PIN", data.pin],
    ["City", data.city],
    ["Showroom", data.branch],
    ["Date", data.date],
    ["Time", data.slot]
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="receipt"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>ENQUIRY RECEIPT</h3>

        <p>Enquiry saved successfully!</p>

        <dl>
          {rows.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <button className="btn" onClick={() => window.print()}>
          PRINT RECEIPT
        </button>

        <button className="btn ghost" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}