'use client'

import { useState } from 'react';
import styles from './page.module.css';
import { getOrderTracking } from './actions';

type OrderData = {
  trackingCode: string;
  customerName: string;
  customerCpf: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  createdAt: Date;
  products: { name: string; quantity: number }[];
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setError('Por favor, insira o código de rastreio.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await getOrderTracking(trackingCode.trim().toUpperCase());
      if (data) {
        setOrder(data as OrderData);
        setStep(3);
      } else {
        setError('Código de rastreio não encontrado.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao buscar o rastreio.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (createdAt: Date) => {
    const created = new Date(createdAt);
    const now = new Date();
    
    // Difference in days
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays >= 6) {
      return { text: 'Saiu para entrega', icon: '🚚', sub: 'O pedido está a caminho do seu endereço.' };
    } else if (diffDays >= 1) {
      return { text: 'Em rota ao destino', icon: '🛣️', sub: 'O pedido está em trânsito entre as bases.' };
    } else {
      return { text: 'Preparando para entrega', icon: '📦', sub: 'O pedido está sendo separado e embalado.' };
    }
  };

  const maskCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    const first3 = cleaned.substring(0, 3);
    return `${first3}.***.***-**`;
  };

  return (
    <main className={styles.container}>
      <div className={styles.logoArea}>
        <div className={styles.logoText}>Favorita<span className={styles.logoDot}>.</span></div>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.card}`}>
        {step === 1 && (
          <div>
            <h1 className={styles.title}>Rastreamento de Pedido</h1>
            <p className={styles.subtitle}>
              Acompanhe sua entrega em tempo real com rapidez e segurança.
            </p>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Rastrear minha entrega
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleTrack} className="animate-fade-in">
            <h2 className={styles.title}>Informe seu código</h2>
            <p className={styles.subtitle}>Digite o código de rastreio fornecido no momento da compra.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Código de Rastreio</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: FAV-123456" 
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              />
              {error && <div className={styles.error}>{error}</div>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar Pedido'}
            </button>
            <button type="button" className={`btn-primary ${styles.backBtn}`} onClick={() => { setStep(1); setError(''); }}>
              Voltar
            </button>
          </form>
        )}

        {step === 3 && order && (
          <div className={`animate-fade-in ${styles.resultCard}`} style={{ padding: 0 }}>
            <div className={styles.statusHeader}>
              <div className={styles.statusIcon}>
                {calculateStatus(order.createdAt).icon}
              </div>
              <div>
                <div className={styles.statusText}>{calculateStatus(order.createdAt).text}</div>
                <div className={styles.statusSub}>{calculateStatus(order.createdAt).sub}</div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Dados da Entrega</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Destinatário</span>
                <span className={styles.infoValue}>{order.customerName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>CPF</span>
                <span className={styles.infoValue}>{maskCPF(order.customerCpf)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Endereço</span>
                <span className={styles.infoValue}>{order.street}, {order.neighborhood}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Localidade</span>
                <span className={styles.infoValue}>{order.city} - {order.state}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>CEP</span>
                <span className={styles.infoValue}>{order.zip}</span>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Produtos</h3>
              <ul className={styles.productList}>
                {order.products.map((p, idx) => (
                  <li key={idx} className={styles.productItem}>
                    <span>{p.name}</span>
                    <span className={styles.productQty}>x{p.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className={`btn-primary ${styles.backBtn}`} onClick={() => { setStep(1); setTrackingCode(''); setOrder(null); }}>
              Novo Rastreio
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
