import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

// Default blank line item
const blankLine = () => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: "",
  unit_price: "",
});

const DEFAULT_VAT = 20; // TVA 20% by default

export default function CreateInvoice() {
  const navigate = useNavigate();

  // --- Client info state ---
  const [client, setClient] = useState({
    client_name: "",
    client_email: "",
    client_address: "",
  });

  // --- Invoice meta state ---
  const [meta, setMeta] = useState({
    invoice_date: new Date().toISOString().slice(0, 10),
  });

  // --- Line items state ---
  const [lines, setLines] = useState([blankLine()]);

  // --- Rates state ---
  const [vatRate, setVatRate] = useState("");
  const [discountRate, setDiscountRate] = useState(""); // percentage

  // --- UI state ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Real-time calculations ───────────────────────────────────────────────
  const calculations = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const qty = parseFloat(line.quantity) || 0;
      const price = parseFloat(line.unit_price) || 0;
      return sum + qty * price;
    }, 0);

    const vatRateNum = parseFloat(vatRate) || 0;
    const discountRateNum = parseFloat(discountRate) || 0;
    
    const discountAmount = subtotal * (discountRateNum / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * (vatRateNum / 100);
    const totalTtc = afterDiscount + vatAmount;

    return { subtotal, discountAmount, afterDiscount, vatAmount, totalTtc };
  }, [lines, vatRate, discountRate]);

  // ─── Client field handler ─────────────────────────────────────────────────
  const handleClientChange = (e) => {
    setClient((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMetaChange = (e) => {
    setMeta((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Line item handlers ───────────────────────────────────────────────────
  const handleLineChange = (id, field, value) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const addLine = () => setLines((prev) => [...prev, blankLine()]);

  const removeLine = (id) => {
    if (lines.length === 1) return; // keep at least one line
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    const hasEmptyLine = lines.some((l) => !l.description.trim());
    if (hasEmptyLine) {
      setError("Veuillez remplir la description de chaque ligne.");
      return;
    }

    const payload = {
      client_name: client.client_name,
      client_email: client.client_email,
      client_address: client.client_address,
      invoice_date: meta.invoice_date,
      vat_rate: parseFloat(vatRate),
      discount_rate: parseFloat(discountRate),
      subtotal: calculations.subtotal,
      discount_amount: calculations.discountAmount,
      vat_amount: calculations.vatAmount,
      total_ttc: calculations.totalTtc,
      status: "non_payee",
      lines: lines.map(({ id, ...rest }) => ({
        description: rest.description,
        quantity: parseFloat(rest.quantity),
        unit_price: parseFloat(rest.unit_price),
        total: (parseFloat(rest.quantity) || 0) * (parseFloat(rest.unit_price) || 0),
      })),
    };

    setLoading(true);
    try {
      const res = await api.post("/invoices", payload);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setError(Object.values(apiErrors).flat().join(" "));
      } else {
        setError(err.response?.data?.message || "Erreur lors de la création de la facture.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div className="create-invoice-layout">
      {/* Top bar */}
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/dashboard" className="back-link">← Tableau de bord</Link>
          <h2>Nouvelle facture</h2>
        </div>
        <div className="page-header-right">
          <Link to="/dashboard" className="btn btn-ghost">Annuler</Link>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer la facture"}
          </button>
        </div>
      </header>

      <div className="create-invoice-body">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Left column: form */}
        <div className="invoice-form-col">

          {/* Client info */}
          <section className="form-section">
            <h3 className="section-title">Informations client</h3>
            <div className="form-grid form-grid-2">
              <div className="field">
                <label>Nom / Raison sociale *</label>
                <input
                  name="client_name"
                  value={client.client_name}
                  onChange={handleClientChange}
                  placeholder="Entreprise SARL"
                  required
                />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input
                  name="client_email"
                  type="email"
                  value={client.client_email}
                  onChange={handleClientChange}
                  placeholder="contact@client.com"
                />
              </div>
              <div className="field field-full">
                <label>Adresse</label>
                <input
                  name="client_address"
                  value={client.client_address}
                  onChange={handleClientChange}
                  placeholder="123 Rue Mohammed V, Casablanca"
                />
              </div>
            </div>
          </section>

          {/* Invoice meta */}
          <section className="form-section">
            <h3 className="section-title">Détails de la facture</h3>
            <div className="form-grid form-grid-2">
              <div className="field">
                <label>Date de facture *</label>
                <input
                  name="invoice_date"
                  type="date"
                  value={meta.invoice_date}
                  onChange={handleMetaChange}
                  required
                />
              </div>
              <div className="field">
                <label>TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="20"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Remise (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Line items */}
          <section className="form-section">
            <h3 className="section-title">Lignes de facturation</h3>
            <div className="lines-table">
              <div className="lines-header">
                <span className="col-desc">Description</span>
                <span className="col-qty">Qté</span>
                <span className="col-price">Prix unitaire</span>
                <span className="col-total">Total HT</span>
                <span className="col-action"></span>
              </div>

              {lines.map((line) => {
                const lineTotal =
                  (parseFloat(line.quantity) || 0) * (parseFloat(line.unit_price) || 0);
                return (
                  <div key={line.id} className="line-row">
                    <input
                      className="col-desc"
                      placeholder="Description du produit / service"
                      value={line.description}
                      onChange={(e) => handleLineChange(line.id, "description", e.target.value)}
                    />
                    <input
                      className="col-qty"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantité"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(line.id, "quantity", e.target.value)}
                    />
                    <input
                      className="col-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prix unitaire"
                      value={line.unit_price}
                      onChange={(e) => handleLineChange(line.id, "unit_price", e.target.value)}
                    />
                    <span className="col-total line-total">{fmt(lineTotal)}</span>
                    <button
                      type="button"
                      className="col-action btn-remove-line"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      title="Supprimer la ligne"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              <button type="button" className="btn btn-ghost btn-sm add-line-btn" onClick={addLine}>
                + Ajouter une ligne
              </button>
            </div>
          </section>

        </div>

        {/* Right column: live summary */}
        <aside className="invoice-summary-col">
          <div className="summary-card">
            <h3 className="section-title">Récapitulatif</h3>

            <div className="summary-row">
              <span>Sous-total HT</span>
              <span>{fmt(calculations.subtotal)} MAD</span>
            </div>

            {calculations.discountAmount > 0 && (
              <div className="summary-row summary-row--discount">
                <span>Remise ({discountRate}%)</span>
                <span>− {fmt(calculations.discountAmount)} MAD</span>
              </div>
            )}

            <div className="summary-row">
              <span>Montant HT après remise</span>
              <span>{fmt(calculations.afterDiscount)} MAD</span>
            </div>

            <div className="summary-row">
              <span>TVA ({vatRate}%)</span>
              <span>{fmt(calculations.vatAmount)} MAD</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-row--total">
              <span>Total TTC</span>
              <span>{fmt(calculations.totalTtc)} MAD</span>
            </div>

            <div className="summary-status">
              <span className="badge badge-unpaid">Non payée</span>
              <span className="text-muted text-sm">Statut par défaut</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
