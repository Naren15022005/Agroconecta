
"use client";
import React, { useState, useEffect } from 'react';
import styles from './Wallet.module.css';
import { FaArrowDown, FaArrowUp, FaBell, FaCog, FaCreditCard, FaMoneyBillWave, FaPiggyBank, FaPlus, FaQrcode, FaQuestionCircle, FaShoppingCart, FaUser, FaFileInvoice, FaBuilding, FaBolt, FaMicrochip, FaCcVisa, FaCcMastercard } from 'react-icons/fa';

// Interfaces principales de la billetera admin
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  details: { icon: React.ReactNode; text: string }[];
}

export interface Card {
  id: number;
  type: string;
  number: string;
  holder: string;
  expiry: string;
  color: string;
  logo: React.ReactNode;
}

export interface Stat {
  id: number;
  title: string;
  value: string;
  trend: 'up' | 'down';
  trendText: string;
  icon: React.ReactNode;
}

export interface QuickAction {
  id: number;
  title: string;
  icon: React.ReactNode;
}

const Wallet: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/billetera/summary');
        if (!res.ok) throw new Error('Error al obtener datos de billetera');
        const data = await res.json();

        // Cards
        setCards(
          (data.cards || []).map((card: any) => ({
            ...card,
            logo: card.logo === 'nequi'
              ? <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Logo_Nequi.png" alt="Nequi" style={{height: 24}} />
              : card.logo === 'bancolombia'
                ? <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Bancolombia_logo_2021.png" alt="Bancolombia" style={{height: 24}} />
                : null
          }))
        );

        // Stats
        setStats([
          {
            id: 1,
            title: 'Ingresos totales (mes)',
            value: Number(data.ingresosMes || 0).toLocaleString(),
            trend: 'up',
            trendText: 'Comisiones recibidas',
            icon: <FaArrowDown />
          },
          {
            id: 2,
            title: 'Liquidaciones realizadas (mes)',
            value: Number(data.liquidacionesMes || 0).toLocaleString(),
            trend: 'down',
            trendText: 'Pagos a agricultores',
            icon: <FaMoneyBillWave />
          },
          {
            id: 3,
            title: 'Saldo disponible',
            value: Number(data.saldoDisponible || 0).toLocaleString(),
            trend: 'up',
            trendText: 'Monto para retirar',
            icon: <FaCreditCard />
          }
        ]);

        // Balance
        setBalance(Number(data.saldoDisponible || 0).toLocaleString());

        // Transactions
        setTransactions(
          (data.transacciones || []).map((tx: any) => ({
            id: tx.id,
            type: tx.type === 'income' ? 'income' : tx.type === 'liquidacion' ? 'liquidacion' : 'expense',
            title: tx.description || tx.type,
            amount: Number(tx.amount),
            details: [
              { icon: <FaUser />, text: 'Admin' },
              { icon: <FaFileInvoice />, text: `ID ${tx.id}` }
            ]
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions: QuickAction[] = [
    { id: 1, title: 'Retirar', icon: <FaMoneyBillWave /> },
    { id: 2, title: 'Enviar a cuenta', icon: <FaArrowUp /> },
  ];

  const handleActionClick = (title: string) => {
    alert(`Acción seleccionada: ${title}`);
  };

  const handleAddCard = () => {
    alert('Agregar nueva tarjeta: Redirigiendo al formulario...');
  };

  const handleTransactionClick = (transaction: Transaction) => {
    alert(`Detalles de transacción:\n${transaction.title}\n$${transaction.amount.toLocaleString()}`);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando billetera...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <>
      <WalletHeader />
      <BalanceSection 
        balance={balance}
        equivalent={"-"}
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
      <div style={{ margin: "2rem 0" }} />
    </>
  );
};

const WalletHeader = () => (
  <header className={styles["wallet-header"]}>
    <div className={styles["wallet-brand"]}>
      <div className={styles["wallet-logo"]}>A</div>
      <div className={styles["wallet-brand-text"]}>
        <h1>Mi Billetera</h1>
      </div>
    </div>
    <div className={styles["wallet-actions"]}>
      <div className={styles["wallet-action-btn"]} title="Notificaciones">
        <FaBell />
      </div>
      <div className={styles["wallet-action-btn"]} title="Ajustes">
        <FaCog />
      </div>
      <div className={styles["wallet-action-btn"]} title="Ayuda">
        <FaQuestionCircle />
      </div>
    </div>
  </header>
);

interface BalanceSectionProps {
  balance: string;
  equivalent: string;
  quickActions: QuickAction[];
  onActionClick: (title: string) => void;
}
const BalanceSection: React.FC<BalanceSectionProps> = ({ balance, equivalent, quickActions, onActionClick }) => (
  <section className={styles["balance-section"]}>
    <div className={styles["balance-card"]}>
      <div className={styles["balance-header"]}>
        <div className={styles["balance-title"]}>Saldo Disponible</div>
        <div className={styles["balance-currency"]}>COP</div>
      </div>
      <div className={styles["balance-amount"]}>$ {balance}</div>
      <div className={styles["balance-subtitle"]}>Equivalente a {equivalent}</div>
      <div className={styles["quick-actions"]}>
        {quickActions.map((action: any) => (
          <div 
            key={action.id} 
            className={styles["action-card"]}
            onClick={() => onActionClick(action.title)}
          >
            <div className={styles["action-icon"]}>
              {action.icon}
            </div>
            <div className={styles["action-title"]}>{action.title}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

interface CardsSectionProps {
  cards: Card[];
  onAddCard: () => void;
}
const CardsSection: React.FC<CardsSectionProps> = ({ cards, onAddCard }) => (
  <section className={styles["cards-section"]}>
    <div className={styles["section-header"]}>
      <h2 className={styles["section-title"]}>Mis Tarjetas</h2>
      <a href="#" className={styles["view-all"]}>
        Ver todas <span>&#8250;</span>
      </a>
    </div>
    <div className={styles["cards-container"]}>
      {cards.map((card: any) => (
        <div 
          key={card.id} 
          className={styles["card-item"]}
          style={{ background: card.color }}
        >
          <div className={styles["card-header"]}>
            <div className={styles["card-type"]}>{card.type}</div>
            <div className={styles["card-chip"]}>
              <FaMicrochip />
            </div>
          </div>
          <div className={styles["card-number"]}>{card.number}</div>
          <div className={styles["card-footer"]}>
            <div className={styles["card-info"]}>
              <div className={styles["card-label"]}>Titular</div>
              <div className={styles["card-value"]}>{card.holder}</div>
            </div>
            <div className={styles["card-info"]}>
              <div className={styles["card-label"]}>Válida hasta</div>
              <div className={styles["card-value"]}>{card.expiry}</div>
            </div>
            <div className={styles["card-logo"]}>
              {card.logo}
            </div>
          </div>
        </div>
      ))}
      <div className={`${styles["card-item"]} ${styles["add-card"]}`} onClick={onAddCard}>
        <div className={styles["add-card-icon"]}>
          <FaPlus />
        </div>
        <div className={styles["add-card-text"]}>Agregar tarjeta</div>
      </div>
    </div>
  </section>
);

interface StatsSectionProps {
  stats: Stat[];
}
const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => (
  <section className={styles["stats-section"]}>
    <div className={styles["section-header"]}>
      <h2 className={styles["section-title"]}>Resumen Financiero</h2>
    </div>
    <div className={styles["stats-container"]}>
      {stats.map((stat: any) => (
        <div key={stat.id} className={styles["stat-card"]}>
          <div className={styles["stat-header"]}>
            <div className={styles["stat-title"]}>{stat.title}</div>
            <div className={styles["stat-icon"]}>
              {stat.icon}
            </div>
          </div>
          <div className={styles["stat-value"]}>$ {stat.value}</div>
          <div className={styles["stat-trend"]}>
            {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {stat.trendText}
          </div>
        </div>
      ))}
    </div>
  </section>
);

interface TransactionsSectionProps {
  transactions: Transaction[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onTransactionClick: (transaction: Transaction) => void;
}
const TransactionsSection: React.FC<TransactionsSectionProps> = ({ transactions, activeFilter, onFilterChange, onTransactionClick }) => {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'income', label: 'Ingresos' },
    { id: 'liquidacion', label: 'Liquidaciones' },
    // { id: 'transfer', label: 'Transferencias' }, // Descomentar si se habilita en el sistema
  ];
  return (
    <section className={styles["transactions-section"]}>
      <div className={styles["section-header"]}>
        <h2 className={styles["section-title"]}>Últimas transacciones</h2>
        <a href="#" className={styles["view-all"]}>
          Ver historial <span>&#8250;</span>
        </a>
      </div>
      <div className={styles["transactions-container"]}>
        <div className={styles["filter-btns"]}>
          {filters.map(filter => (
            <div 
              key={filter.id}
              className={`${styles["filter-btn"]} ${activeFilter === filter.id ? styles["active"] : ""}`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </div>
          ))}
        </div>
        <div className={styles["transactions-list"]}>
          {transactions
            .filter((transaction: Transaction) => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'income') return transaction.type === 'income';
              if (activeFilter === 'liquidacion') return transaction.type === 'liquidacion';
              // if (activeFilter === 'transfer') return transaction.type === 'transfer';
              return false;
            })
            .map((transaction: any) => (
              <div 
                key={transaction.id}
                className={`${styles["transaction-item"]} ${styles[transaction.type]}`}
                onClick={() => onTransactionClick(transaction)}
              >
                <div className={styles["transaction-icon"]}>
                  {transaction.type === 'income' ? <FaArrowDown /> : transaction.type === 'liquidacion' ? <FaMoneyBillWave /> : <FaShoppingCart />}
                </div>
                <div className={styles["transaction-info"]}>
                  <div className={styles["transaction-title"]}>{transaction.title}</div>
                  <div className={styles["transaction-details"]}>
                    {transaction.details.map((detail: any, index: number) => (
                      <div key={index} className={styles["transaction-meta-item"]}>
                        {detail.icon} {detail.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles["transaction-amount"]}>
                  {transaction.type === 'income' ? '+' : transaction.type === 'liquidacion' ? '-' : '-'} $ {transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const WalletFooter = () => (
  <footer className={styles["wallet-footer"]}>
    AgroConecta Billetera Virtual &copy; 2025 - Todos los derechos reservados
  </footer>
);

export default Wallet;
