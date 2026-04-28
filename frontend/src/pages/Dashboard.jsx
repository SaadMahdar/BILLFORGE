import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load invoices
  useEffect(() => {
    api.get("/invoices").then((res) => {
      setInvoices(res.data);
      setLoading(false);
    });
  }, []);

  // Toggle status
  const handleToggleStatus = (invoiceId, currentStatus) => {
    let newStatus = "Paid";
    if (currentStatus === "Paid") {
      newStatus = "Unpaid";
    }

    api.patch(`/invoices/${invoiceId}/status`, { status: newStatus }).then(() => {
      // Reload invoices
      api.get("/invoices").then((res) => {
        setInvoices(res.data);
      });
    });
  };

  // Download PDF
  const handleDownloadPdf = (invoiceId) => {
    api.get(`/invoices/${invoiceId}/pdf`, { responseType: "blob" }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${invoiceId}.pdf`;
      link.click();
    });
  };

  // Calculate stats
  let paidCount = 0;
  let unpaidCount = 0;
  let totalRevenue = 0;

  for (let i = 0; i < invoices.length; i++) {
    if (invoices[i].status === "Paid") {
      paidCount++;
      totalRevenue = totalRevenue + invoices[i].total_amount;
    } else {
      unpaidCount++;
    }
  }

  return (
    <div className="page-layout">
      <header className="page-header">
        <h2 className="page-title">Tableau de bord</h2>
        <Link to="/invoices/create" className="btn btn-primary">
          + Nouvelle facture
        </Link>
      </header>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Chiffre d'affaires</div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>{totalRevenue.toFixed(2)} MAD</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total factures</div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>{invoices.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Payées</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-text)' }}>{paidCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Non payées</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--warning-text)' }}>{unpaidCount}</div>
        </div>
      </div>

      {/* Invoice table */}
      <div className="card">
        <h3 className="section-title">Mes factures</h3>
        
        {loading ? (
          <div>Chargement...</div>
        ) : invoices.length === 0 ? (
          <div>
            <p>Aucune facture pour l'instant.</p>
            <Link to="/invoices/create" className="btn btn-primary">
              Créer votre première facture
            </Link>
          </div>
        ) : (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>N°</th>
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
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                    >
                      {invoice.status === 'Paid' ? 'Impayé' : 'Payé'}
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleDownloadPdf(invoice.id)}
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
