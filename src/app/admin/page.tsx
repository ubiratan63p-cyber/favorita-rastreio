'use client'

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { createOrder, getOrders, deleteOrder } from '../actions';

const PRODUCTS = [
  "Scooter Elétrica Zurbe Iron 001",
  "Scooter Elétrica Zurbe Zoom 500W",
  "Patinete Elétrico 350W",
  "Scooter Moto Elétrica Zurbe X15 1000W",
  "Scooter Moto Elétrica Zurbe X6 1000W",
  "Scooter Moto Elétrica Q8 800W Potência Autopropelido Zurbe",
  "Scooter Bike Elétrica 1000W BAW"
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'create' | 'manage'>('create');
  
  // Create State
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [products, setProducts] = useState([{ name: PRODUCTS[0], quantity: 1 }]);
  const [createdCode, setCreatedCode] = useState('');

  // Manage State
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && tab === 'manage') {
      loadOrders();
    }
  }, [isAuthenticated, tab]);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'favorita123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleAddProductRow = () => {
    setProducts([...products, { name: PRODUCTS[0], quantity: 1 }]);
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const handleRemoveProductRow = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createOrder({
      customerName,
      customerCpf,
      street,
      neighborhood,
      city,
      state,
      zip,
      products
    });

    if (result.success) {
      setCreatedCode(result.trackingCode);
      setCustomerName('');
      setCustomerCpf('');
      setStreet('');
      setNeighborhood('');
      setCity('');
      setState('');
      setZip('');
      setProducts([{ name: PRODUCTS[0], quantity: 1 }]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      await deleteOrder(id);
      loadOrders();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.loginBox}`}>
          <h2 className={styles.title} style={{marginBottom: 20}}>Acesso Restrito</h2>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Senha de acesso" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.submitBtn} style={{width: '100%'}}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Painel de Administração</h1>
        <div><span style={{color: 'var(--primary)', fontWeight: 'bold'}}>SuaEntrega</span></div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${tab === 'create' ? styles.active : ''}`}
          onClick={() => setTab('create')}
        >
          Novo Pedido
        </button>
        <button 
          className={`${styles.tab} ${tab === 'manage' ? styles.active : ''}`}
          onClick={() => setTab('manage')}
        >
          Gerenciar Pedidos
        </button>
      </div>

      {tab === 'create' && (
        <div className={styles.card}>
          <form onSubmit={handleCreateOrder}>
            {createdCode && (
              <div style={{background: '#dcfce3', color: '#166534', padding: 16, borderRadius: 8, marginBottom: 20}}>
                Pedido criado com sucesso! Código de Rastreio: <strong>{createdCode}</strong>
              </div>
            )}

            <h3 style={{marginBottom: 16}}>Produtos</h3>
            {products.map((p, index) => (
              <div key={index} className={styles.productRow}>
                <select 
                  className={styles.select}
                  value={p.name}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                >
                  {PRODUCTS.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  className={styles.qtyInput} 
                  value={p.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                />
                {products.length > 1 && (
                  <button type="button" className={styles.actionBtn} onClick={() => handleRemoveProductRow(index)}>
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={handleAddProductRow}>
              + Adicionar Produto
            </button>

            <h3 style={{marginBottom: 16, marginTop: 16}}>Dados do Comprador</h3>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome Completo</label>
                <input required type="text" className={styles.input} value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>CPF (Apenas números)</label>
                <input required type="text" className={styles.input} value={customerCpf} onChange={e => setCustomerCpf(e.target.value)} />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>CEP</label>
                <input required type="text" className={styles.input} value={zip} onChange={e => setZip(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Estado</label>
                <input required type="text" className={styles.input} value={state} onChange={e => setState(e.target.value)} />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cidade</label>
                <input required type="text" className={styles.input} value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bairro</label>
                <input required type="text" className={styles.input} value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rua / Endereço</label>
              <input required type="text" className={styles.input} value={street} onChange={e => setStreet(e.target.value)} />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Gerar Pedido e Rastreio
            </button>
          </form>
        </div>
      )}

      {tab === 'manage' && (
        <div className={styles.card}>
          <div style={{overflowX: 'auto'}}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Produtos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.trackingCode}</strong></td>
                    <td>{order.customerName}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.products.length} item(s)</td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => handleDelete(order.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{textAlign: 'center', color: '#6b7280'}}>Nenhum pedido encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
