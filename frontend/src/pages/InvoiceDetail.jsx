import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function InvoiceDetail() {
  // 1. Récupérer l'ID dans l'URL
  const { id } = useParams();

  // 2. Un seul état pour stocker la facture (null au départ)
  const [invoice, setInvoice] = useState(null);

  // 3. Charger les données au démarrage
  useEffect(() => {
    api.get(`/invoices/${id}`).then((res) => {
      setInvoice(res.data);
    });
  }, [id]);

  // 4. Changer le statut (très basique)
  const handleToggleStatus = () => {
    let newStatus = "payee";
    if (invoice.status === "payee") {
      newStatus = "non_payee";
    }

    // On met à jour sur le serveur, puis on modifie l'état local
    api.patch(`/invoices/${id}/status`, { status: newStatus }).then(() => {
      setInvoice({ ...invoice, status: newStatus });
    });
  };

  // 5. Télécharger le PDF (le minimum syndical)
  const handleDownloadPdf = () => {
    api.get(`/invoices/${id}/pdf`, { responseType: "blob" }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${invoice.invoice_number}.pdf`;
      link.click();
    });
  };

  // 6. Si la facture n'est pas encore chargée, on affiche juste un texte
  if (invoice === null) {
    return <div>Chargement de la facture...</div>;
  }

  // 7. Logique simple pour le badge de statut (sans ternaire)
  let statusLabel = "Non payée";
  let statusClass = "badge badge-unpaid";
  
  if (invoice.status === "payee") {
    statusLabel = "Payée";
    statusClass = "badge badge-paid";
  }

  return (
    <div className="invoice-detail-layout">
      {/* En-tête */}
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/dashboard" className="back-link">← Tableau de bord</Link>
          <h2>Facture {invoice.invoice_number}</h2>
          <span className={statusClass}>{statusLabel}</span>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost" onClick={handleToggleStatus}>
            Changer le statut
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            Télécharger PDF
          </button>
        </div>
      </header>

      <div className="invoice-detail-body">
        
        {/* Infos Client et Facture */}
        <div className="detail-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h4>Client</h4>
            <p><strong>{invoice.client_name}</strong></p>
            <p>{invoice.client_email}</p>
            <p>{invoice.client_address}</p>
          </div>
          <div>
            <h4>Détails</h4>
            <p>N° : {invoice.invoice_number}</p>
            <p>Date : {invoice.invoice_date}</p>
          </div>
        </div>

        {/* Lignes de facturation */}
        <div className="detail-card">
          <h4>Lignes de facturation</h4>
          <table className="invoice-table" width="100%">
            <thead>
              <tr>
                <th textAlign="left">Description</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {/* Boucle simple sur les lignes */}
              {invoice.lines.map((line, index) => (
                <tr key={index}>
                  <td>{line.description}</td>
                  <td>{line.quantity}</td>
                  <td>{Number(line.unit_price).toFixed(2)} MAD</td>
                  <td>{(line.quantity * line.unit_price).toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="detail-card">
          <h4>Récapitulatif</h4>
          <p>Sous-total HT : {Number(invoice.subtotal).toFixed(2)} MAD</p>
          <p>Remise : - {Number(invoice.discount_amount).toFixed(2)} MAD</p>
          <p>TVA : + {Number(invoice.vat_amount).toFixed(2)} MAD</p>
          <hr />
          <h2>Total TTC : {Number(invoice.total_ttc).toFixed(2)} MAD</h2>
        </div>

      </div>
    </div>
  );
}