import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function InvoiceList() {
  // 1. Un seul état pour stocker la liste (un tableau vide au départ)
  const [invoices, setInvoices] = useState([]);

  // 2. Fonction simple pour récupérer les factures
  const getInvoices = () => {
    api.get("/invoices").then((res) => {
      // On suppose que l'API renvoie directement le tableau
      setInvoices(res.data.data || res.data); 
    });
  };

  // 3. Charger les données au démarrage
  useEffect(() => {
    getInvoices();
  }, []);

  // 4. Changer le statut
  const handleToggleStatus = (id, currentStatus) => {
    let newStatus = "payee";
    if (currentStatus === "payee") {
      newStatus = "non_payee";
    }

    // On met à jour sur le serveur, puis on recharge la liste complète
    api.patch(`/invoices/${id}/status`, { status: newStatus }).then(() => {
      getInvoices(); 
    });
  };

  return (
    <div className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Toutes les factures</h1>
        <Link to="/invoices/create" className="btn btn-primary">
          Nouvelle Facture
        </Link>
      </header>

      {/* Tableau basique sans filtres de recherche */}
      <div className="table-wrapper">
        <table className="invoice-table" width="100%">
          <thead>
            <tr>
              <th align="left">N° Facture</th>
              <th align="left">Client</th>
              <th align="left">Date</th>
              <th align="left">Total TTC</th>
              <th align="left">Statut</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              // Logique de statut ultra simple dans la boucle
              let statusLabel = "Non payée";
              let statusClass = "badge badge-unpaid";
              
              if (invoice.status === "payee") {
                statusLabel = "Payée";
                statusClass = "badge badge-paid";
              }

              return (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_number}</td>
                  <td>{invoice.client_name}</td>
                  <td>{invoice.created_at ? invoice.created_at.substring(0, 10) : ""}</td>
                  <td>{Number(invoice.total_ttc).toFixed(2)} MAD</td>
                  <td>
                    <span className={statusClass}>{statusLabel}</span>
                  </td>
                  <td>
                    <Link to={`/invoices/${invoice.id}`} className="btn btn-ghost">
                      Voir
                    </Link>
                    <button 
                      onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                      className="btn btn-ghost"
                    >
                      Changer statut
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}