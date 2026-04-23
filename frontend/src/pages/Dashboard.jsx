import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { STATUS_LABELS, STATUS_CLASS, formatCurrency } from "../utilities";
import "../GlobalCss.css";

export default function Dashboard() {
  // 1. États basiques
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ 
    total_revenue: 0, 
    paid_count: 0, 
    unpaid_count: 0, 
    total_count: 0 
  });

  // 2. Fonction très simple pour récupérer les données
  const getData = () => {
    // Appel 1 : Les factures
    api.get("/invoices").then((res) => {
      setInvoices(res.data);
    });

    // Appel 2 : Les statistiques
    api.get("/invoices/stats").then((res) => {
      setStats(res.data);
    });
  };

  // 3. Charger les données au démarrage
  useEffect(() => {
    getData();
  }, []);

  // 4. Changer le statut
  const handleToggleStatus = (id, currentStatus) => {
    let newStatus = "payee";
    if (currentStatus === "payee") {
      newStatus = "non_payee";
    }

    api.patch(`/invoices/${id}/status`, { status: newStatus }).then(() => {
      getData(); 
    });
  };

  // 5. Télécharger le PDF
  const handleDownloadPdf = (id, number) => {
    api.get(`/invoices/${id}/pdf`, { responseType: "blob" }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${number}.pdf`;
      link.click();
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar (Barre latérale) */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', padding: '0 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span></span>
          <span>BILLFORGE</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link to="/dashboard" style={{ padding: '12px 24px', color: 'var(--primary)', backgroundColor: 'var(--bg-app)', borderRight: '3px solid var(--primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', gap: '12px' }}>
            <span></span> Tableau de bord
          </Link>
          <Link to="/invoices/create" style={{ padding: '12px 24px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500', display: 'flex', gap: '12px' }}>
            <span>➕</span> Nouvelle facture
          </Link>
        </nav>
      </aside>

      {/* Main content (Contenu principal) */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        <header className="page-header">
          <div>
            <h2 className="page-title">Tableau de bord</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Gérez vos factures efficacement.</p>
          </div>
          <Link to="/invoices/create" className="btn btn-primary">
            + Nouvelle facture
          </Link>
        </header>

        {/* Stats Grid (Grille des statistiques) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div className="card" style={{ borderTop: '3px solid var(--success-text)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>Chiffre d'affaires (payé)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{formatCurrency(stats.total_revenue)}</div>
          </div>
          
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>Total factures</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total_count}</div>
          </div>
          
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>Factures payées</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success-text)' }}>{stats.paid_count}</div>
          </div>
          
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>Factures impayées</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--warning-text)' }}>{stats.unpaid_count}</div>
          </div>

        </div>

        {/* Invoice table (Tableau des factures) */}
        <div className="card" style={{ padding: '24px 0' }}>
          
          <div style={{ padding: '0 24px', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Mes factures récentes</h3>
          </div>

          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: '500' }}>{invoice.invoice_number}</td>
                    <td>{invoice.client_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(invoice.created_at).toLocaleDateString("fr-MA")}</td>
                    <td style={{ fontWeight: '500' }}>{formatCurrency(invoice.total_ttc)}</td>
                    <td>
                      {/* Utilisation des classes exportées depuis utilities.js */}
                      <span className={`badge ${STATUS_CLASS[invoice.status]}`}>
                        {STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                        >
                          Changer statut
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleDownloadPdf(invoice.id, invoice.invoice_number)}
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}