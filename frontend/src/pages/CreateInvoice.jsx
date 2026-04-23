import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../GlobalCss.css";

export default function CreateInvoice() {
  const navigate = useNavigate();

  // 1. États très simples
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  
  const [vatRate, setVatRate] = useState(20);
  const [discountRate, setDiscountRate] = useState(0);

  // 2. État pour les lignes
  const [lines, setLines] = useState([
    { id: Date.now(), description: "", quantity: 1, unit_price: 0 }
  ]);

  // 3. Calculs en temps réel
  let subtotal = 0;
  for (let i = 0; i < lines.length; i++) {
    subtotal = subtotal + (lines[i].quantity * lines[i].unit_price);
  }

  let discountAmount = subtotal * (discountRate / 100);
  let afterDiscount = subtotal - discountAmount;
  let vatAmount = afterDiscount * (vatRate / 100);
  let totalTtc = afterDiscount + vatAmount;

  // 4. Fonctions simples
  const addLine = () => {
    const newLine = { id: Date.now(), description: "", quantity: 1, unit_price: 0 };
    setLines([...lines, newLine]);
  };

  const removeLine = (id) => {
    if (lines.length > 1) {
      const filteredLines = lines.filter((line) => line.id !== id);
      setLines(filteredLines);
    }
  };

  const updateLine = (id, field, value) => {
    const updatedLines = lines.map((line) => {
      if (line.id === id) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setLines(updatedLines);
  };

  // 5. Envoi au serveur
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      client_name: clientName,
      client_email: clientEmail,
      invoice_date: invoiceDate,
      vat_rate: Number(vatRate),
      discount_rate: Number(discountRate),
      subtotal: subtotal,
      discount_amount: discountAmount,
      vat_amount: vatAmount,
      total_ttc: totalTtc,
      status: "non_payee",
      lines: lines
    };

    api.post("/invoices", payload).then((res) => {
      navigate(`/dashboard`);
    });
  };

  return (
    /* Remplacement de create-invoice-layout par page-layout du global CSS */
    <div className="page-layout">
      
      <header className="page-header">
        <div>
          <Link to="/dashboard" className="btn btn-ghost btn-xs">← Retour</Link>
          <h2 className="page-title" style={{ marginTop: '8px' }}>Nouvelle facture</h2>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Enregistrer la facture
          </button>
        </div>
      </header>

      {/* Grille 2 colonnes (66% / 33%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Colonne Gauche : Formulaire */}
        <div>
          {/* Utilisation de la classe globale .card au lieu de .form-section */}
          <section className="card">
            <h3 className="section-title">Informations client</h3>
            <div className="field">
              <label>Nom / Raison sociale</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Entreprise SARL"
              />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="contact@client.com"
              />
            </div>
            <div className="field">
              <label>Date de facture</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </section>

          <section className="card">
            <h3 className="section-title">Lignes de facturation</h3>
            
            {lines.map((line) => (
              <div key={line.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="field" style={{ flex: 2, marginBottom: 0 }}>
                  <input
                    placeholder="Description du produit/service"
                    value={line.description}
                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                  <input
                    type="number"
                    placeholder="Prix unitaire"
                    value={line.unit_price}
                    onChange={(e) => updateLine(line.id, "unit_price", Number(e.target.value))}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => removeLine(line.id)}
                  style={{ color: 'var(--danger-text)', borderColor: 'var(--border-light)' }}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={addLine}>
              + Ajouter une ligne
            </button>
          </section>

          <section className="card">
            <h3 className="section-title">Taxes et Remises</h3>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>TVA (%)</label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Remise (%)</label>
                <input
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Colonne Droite : Récapitulatif en direct */}
        <aside className="card" style={{ position: 'sticky', top: '24px' }}>
          <h3 className="section-title">Récapitulatif</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <span>Sous-total HT</span>
            <span>{subtotal.toFixed(2)} MAD</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <span>Remise</span>
            <span>- {discountAmount.toFixed(2)} MAD</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <span>TVA</span>
            <span>+ {vatAmount.toFixed(2)} MAD</span>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '20px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Total TTC</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {totalTtc.toFixed(2)} MAD
            </span>
          </div>
        </aside>
        
      </div>
    </div>
  );
}