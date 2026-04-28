import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function InvoiceList() {
  // Simple state for invoices
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get invoices from API
  useEffect(() => {
    api.get("/invoices").then((res) => {
      setInvoices(res.data);
      setLoading(false);
    });
  }, []);

  // Toggle status
  const handleToggleStatus = (id, currentStatus) => {
    let newStatus = "Paid";
    if (currentStatus === "Paid") {
      newStatus = "Unpaid";
    }

    api.patch(`/invoices/${id}/status`, { status: newStatus }).then(() => {
      // Reload the list
      api.get("/invoices").then((res) => {
        setInvoices(res.data);
      });
    });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page-layout">
      <header className="page-header">
        <h2 className="page-title">Toutes les factures</h2>
        <Link to="/invoices/create" className="btn btn-primary">
          Nouvelle Facture
        </Link>
      </header>

      <div className="card">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.client_name}</td>
                <td>{invoice.issue_date}</td>
                <td>{invoice.total_amount} MAD</td>
                <td>
                  <span className={`badge ${invoice.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                    {invoice.status === 'Paid' ? 'Payée' : 'Non payée'}
                  </span>
                </td>
                <td>
                  <Link to={`/invoices/${invoice.id}`} className="btn btn-ghost btn-xs">
                    Voir
                  </Link>
                  <button 
                    onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                    className="btn btn-ghost btn-xs"
                  >
                    {invoice.status === 'Paid' ? 'Marquer impayé' : 'Marquer payé'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
