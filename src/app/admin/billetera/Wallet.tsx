"use client";
import React, { useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBell, FaCog, FaCreditCard, FaMoneyBillWave, FaPiggyBank, FaPlus, FaQrcode, FaQuestionCircle, FaShoppingCart, FaUser, FaFileInvoice, FaBuilding, FaBolt, FaMicrochip, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
// ...existing imports...

const Wallet = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const transactions = [
    {
      id: 1,
      type: 'income',
      title: 'Pago de cliente',
      amount: 320000,
      details: [
        { icon: <FaUser />, text: 'Juan Pérez' },
        { icon: <FaFileInvoice />, text: 'Factura #1341' }
      ]
    },
    {
      id: 2,
      type: 'expense',
      title: 'Compra en supermercado',
      amount: 185400,
      details: [
        { icon: <FaUser />, text: 'Éxito' },
        { icon: <FaCreditCard />, text: 'Visa ****4512' }
      ]
    },
    {
      id: 3,
      type: 'income',
      title: 'Transferencia recibida',
      amount: 180000,
      details: [
        { icon: <FaUser />, text: 'María Ruiz' },
        { icon: <FaFileInvoice />, text: 'Pago de deuda' }
      ]
    },
    {
      id: 4,
      type: 'expense',
      title: 'Pago de servicios',
      amount: 120500,
      details: [
        { icon: <FaBuilding />, text: 'EPM' },
        { icon: <FaFileInvoice />, text: 'Factura 789456' }
      ]
    },
    {
      id: 5,
      type: 'expense',
      title: 'Transferencia enviada',
      amount: 400000,
      details: [
        { icon: <FaUser />, text: 'Carlos Mendoza' },
        { icon: <FaFileInvoice />, text: 'Préstamo' }
      ]
    }
  ];

  const cards = [
    {
      id: 1,
      type: 'Principal',
      number: '**** **** **** 4512',
      holder: 'PEDRO GÓMEZ',
      expiry: '08/27',
      color: 'linear-gradient(45deg, #2a2d5e, #4a2c7c)',
  logo: <FaCcVisa className="text-2xl" />
    },
    {
      id: 2,
      type: 'Dólares',
      number: '**** **** **** 7821',
      holder: 'PEDRO GÓMEZ',
      expiry: '11/28',
      color: 'linear-gradient(45deg, #1d3b5a, #0b5e7a)',
  logo: <FaCcMastercard className="text-2xl" />
    }
  ];

  const stats = [
    {
      id: 1,
      title: 'Ingresos (mes)',
      value: '8.120.000',
      trend: 'up',
      trendText: '12% más que el mes pasado',
      icon: <FaArrowDown />
    },
    {
      id: 2,
      title: 'Gastos (mes)',
      value: '3.210.000',
      trend: 'down',
      trendText: '4% menos que el mes pasado',
      icon: <FaArrowUp />
    },
    {
      id: 3,
      title: 'Ahorro mensual',
      value: '1.450.000',
      trend: 'up',
      trendText: '18% de tus ingresos',
      icon: <FaPiggyBank />
    }
  ];

  const quickActions = [
    { id: 1, title: 'Recargar', icon: <FaArrowDown /> },
    { id: 2, title: 'Enviar', icon: <FaArrowUp /> },
    { id: 3, title: 'Recibir', icon: <FaQrcode /> },
    { id: 4, title: 'Pagar', icon: <FaMoneyBillWave /> }
  ];

  const handleActionClick = (title: string) => {
    alert(`Acción seleccionada: ${title}`);
  };

  const handleAddCard = () => {
    alert('Agregar nueva tarjeta: Redirigiendo al formulario...');
  };

  const handleTransactionClick = (transaction: any) => {
    alert(`Detalles de transacción:\n${transaction.title}\n$${transaction.amount.toLocaleString()}`);
  };

  return (
    <div className="wallet-app" style={{ background: "var(--bg)", minHeight: "100vh", color: "#fff" }}>
      <WalletHeader />
      <BalanceSection 
        balance="12.450.780" 
        equivalent="$3,250 USD" 
        quickActions={quickActions} 
        onActionClick={handleActionClick}
      />
      <CardsSection 
        cards={cards} 
        onAddCard={handleAddCard}
      />
      <StatsSection stats={stats} />
      <TransactionsSection 
        transactions={transactions} 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onTransactionClick={handleTransactionClick}
      />
      <WalletFooter />
      <div style={{ margin: "2rem 0" }}>
  {/* ColorPaletteTable removed */}
      </div>
      <style jsx global>{`
        .wallet-app {
          background: var(--bg) !important;
          color: #fff !important;
        }
        .wallet-header, .wallet-footer {
          background: var(--card) !important;
          color: #fff !important;
        }
        .balance-card, .cards-container .card-item, .transactions-container, .stat-card {
          background: var(--card) !important;
          color: #fff !important;
          border-radius: var(--radius);
        }
        .balance-section .balance-title, .section-title, .stat-title {
          color: #fff !important;
        }
        .balance-section .balance-subtitle, .card-label, .transaction-details, .stat-trend {
          color: var(--muted) !important;
        }
        .balance-section::before {
          background: radial-gradient(circle, var(--accent-2) 0%, transparent 70%);
        }
        .balance-section::after {
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
        }
        .wallet-logo {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
        }
        .view-all {
          color: var(--accent-2);
        }
        .card-item.primary-card {
          background: linear-gradient(45deg, var(--accent-2), var(--accent));
        }
        .card-item.secondary-card {
          background: linear-gradient(45deg, var(--accent), var(--accent-2));
        }
        .add-card {
          background: var(--glass);
          border: 2px dashed var(--muted);
        }
        .add-card:hover {
          background: var(--glass-2);
          border-color: var(--accent-2);
        }
        .add-card-icon {
          background: var(--glass);
          color: var(--accent-2);
        }
        .income .transaction-icon {
          background: var(--glass);
          color: var(--success);
        }
        .expense .transaction-icon {
          background: var(--glass);
          color: var(--danger);
        }
        .income .transaction-amount {
          color: var(--success);
        }
        .expense .transaction-amount {
          color: var(--danger);
        }
        .filter-btn.active {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          color: #fff;
        }
        .filter-btn {
          background: var(--glass);
          color: #fff;
        }
        .action-card {
          background: var(--glass);
        }
        .action-card:hover {
          background: var(--glass-2);
        }
        .action-icon {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
        }
      `}</style>
    </div>
  );
};

const WalletHeader = () => (
  <header className="wallet-header">
    <div className="wallet-brand">
      <div className="wallet-logo">A</div>
      <div className="wallet-brand-text">
        <h1>Mi Billetera</h1>
      </div>
    </div>
    <div className="wallet-actions">
      <div className="wallet-action-btn" title="Notificaciones">
        <FaBell />
      </div>
      <div className="wallet-action-btn" title="Ajustes">
        <FaCog />
      </div>
      <div className="wallet-action-btn" title="Ayuda">
        <FaQuestionCircle />
      </div>
    </div>
  </header>
);

const BalanceSection = ({ balance, equivalent, quickActions, onActionClick }: any) => (
  <section className="balance-section">
    <div className="balance-card">
      <div className="balance-header">
        <div className="balance-title">Saldo Disponible</div>
        <div className="balance-currency">COP</div>
      </div>
      <div className="balance-amount">$ {balance}</div>
      <div className="balance-subtitle">Equivalente a {equivalent}</div>
      <div className="quick-actions">
        {quickActions.map((action: any) => (
          <div 
            key={action.id} 
            className="action-card" 
            onClick={() => onActionClick(action.title)}
          >
            <div className="action-icon">
              {action.icon}
            </div>
            <div className="action-title">{action.title}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CardsSection = ({ cards, onAddCard }: any) => (
  <section className="cards-section">
    <div className="section-header">
      <h2 className="section-title">Mis Tarjetas</h2>
      <a href="#" className="view-all">
        Ver todas <span>&#8250;</span>
      </a>
    </div>
    <div className="cards-container">
      {cards.map((card: any) => (
        <div 
          key={card.id} 
          className="card-item"
          style={{ background: card.color }}
        >
          <div className="card-header">
            <div className="card-type">{card.type}</div>
            <div className="card-chip">
              <FaMicrochip />
            </div>
          </div>
          <div className="card-number">{card.number}</div>
          <div className="card-footer">
            <div className="card-info">
              <div className="card-label">Titular</div>
              <div className="card-value">{card.holder}</div>
            </div>
            <div className="card-info">
              <div className="card-label">Válida hasta</div>
              <div className="card-value">{card.expiry}</div>
            </div>
            <div className="card-logo">
              {card.logo}
            </div>
          </div>
        </div>
      ))}
      <div className="card-item add-card" onClick={onAddCard}>
        <div className="add-card-icon">
          <FaPlus />
        </div>
        <div className="add-card-text">Agregar tarjeta</div>
      </div>
    </div>
  </section>
);

const StatsSection = ({ stats }: any) => (
  <section className="stats-section">
    <div className="section-header">
      <h2 className="section-title">Resumen Financiero</h2>
    </div>
    <div className="stats-container">
      {stats.map((stat: any) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-header">
            <div className="stat-title">{stat.title}</div>
            <div className="stat-icon">
              {stat.icon}
            </div>
          </div>
          <div className="stat-value">$ {stat.value}</div>
          <div className={`stat-trend ${stat.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {stat.trendText}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const TransactionsSection = ({ transactions, activeFilter, onFilterChange, onTransactionClick }: any) => {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'income', label: 'Ingresos' },
    { id: 'expense', label: 'Gastos' },
    { id: 'shopping', label: 'Compras' },
    { id: 'transfer', label: 'Transferencias' }
  ];
  return (
    <section className="transactions-section">
      <div className="section-header">
        <h2 className="section-title">Últimas transacciones</h2>
        <a href="#" className="view-all">
          Ver historial <span>&#8250;</span>
        </a>
      </div>
      <div className="transactions-container">
        <div className="filters">
          {filters.map(filter => (
            <div 
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </div>
          ))}
        </div>
        <div className="transactions-list">
          {transactions.map((transaction: any) => (
            <div 
              key={transaction.id}
              className={`transaction-item ${transaction.type}`}
              onClick={() => onTransactionClick(transaction)}
            >
              <div className="transaction-icon">
                {transaction.type === 'income' ? <FaArrowDown /> : <FaShoppingCart />}
              </div>
              <div className="transaction-info">
                <div className="transaction-title">{transaction.title}</div>
                <div className="transaction-details">
                  {transaction.details.map((detail: any, index: number) => (
                    <div key={index} className="transaction-detail">
                      {detail.icon} {detail.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="transaction-amount">
                {transaction.type === 'income' ? '+' : '-'} $ {transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WalletFooter = () => (
  <footer className="wallet-footer">
    AgroConecta Billetera Virtual &copy; 2025 - Todos los derechos reservados
  </footer>
);

export default Wallet;
