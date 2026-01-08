import { useState } from 'react';
import type { ClientType } from '../../types/catalog';
import { Notification } from '../common/Notification';
import {
  createCustomerType,
  updateCustomerType,
  deleteCustomerType,
  getAllCustomerTypes,
} from '../../services/customerTypesService';
import './AdminSection.css';

interface ClientTypesManagerProps {
  items: ClientType[];
  onChange: (next: ClientType[]) => void;
}

interface ClientTypeForm {
  name: string;
  paymentCondition: string;
  shippingMethod: string;
  fixedValue: string;
  markup: string;
}

const emptyForm: ClientTypeForm = {
  name: '',
  paymentCondition: '',
  shippingMethod: '',
  fixedValue: '0',
  markup: '0',
};

export function ClientTypesManager({ items, onChange }: ClientTypesManagerProps) {
  const [form, setForm] = useState<ClientTypeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validações obrigatórias
    if (!form.name.trim() || !form.paymentCondition.trim() || !form.shippingMethod.trim()) {
      showNotification('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Conversão string -> número para campos numéricos
    const parsedFixedValue = Number(form.fixedValue) || 0;
    const parsedMarkup = Number(form.markup) || 0;

    try {
      if (editingId) {
        await updateCustomerType(editingId, {
          name: form.name,
          paymentCondition: form.paymentCondition,
          shippingMethod: form.shippingMethod,
          fixedValue: parsedFixedValue,
          markup: parsedMarkup,
        });
        showNotification('Tipo de cliente atualizado com sucesso!', 'success');
      } else {
        await createCustomerType({
          name: form.name,
          paymentCondition: form.paymentCondition,
          shippingMethod: form.shippingMethod,
          fixedValue: parsedFixedValue,
          markup: parsedMarkup,
        });
        showNotification('Tipo de cliente cadastrado com sucesso!', 'success');
      }

      // Recarrega os dados do banco
      const updatedItems = await getAllCustomerTypes();
      onChange(updatedItems);

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      showNotification(
        `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
  }

  function handleEdit(item: ClientType) {
    // Preenche o formulário com os dados selecionados para facilitar a edição
    setForm({
      name: item.name,
      paymentCondition: item.paymentCondition,
      shippingMethod: item.shippingMethod,
      fixedValue: String(item.fixedValue),
      markup: String(item.markup),
    });
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    try {
      await deleteCustomerType(id);
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }
      showNotification('Tipo de cliente removido.', 'success');
      
      // Recarrega os dados do banco
      const updatedItems = await getAllCustomerTypes();
      onChange(updatedItems);
    } catch (error) {
      showNotification(
        `Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
  }

  return (
    <section className="admin-section">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h3>Tipos de cliente</h3>
      <p>Cadastre perfis com condições comerciais diferentes.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Nome
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Condição de pagamento
          <input
            value={form.paymentCondition}
            onChange={(e) => setForm({ ...form, paymentCondition: e.target.value })}
            required
          />
        </label>
        <label>
          Forma de expedição
          <input
            value={form.shippingMethod}
            onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}
            required
          />
        </label>
        <label>
          Valor fixo (R$)
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.fixedValue}
            onChange={(e) => setForm({ ...form, fixedValue: e.target.value })}
          />
          <small style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Valor somado ao subtotal antes de aplicar o markup
          </small>
        </label>
        <label>
          Markup (%)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.markup}
            onChange={(e) => setForm({ ...form, markup: e.target.value })}
          />
          <small style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Percentual aplicado sobre o subtotal (ex.: 20 para 20%)
          </small>
        </label>
        <button type="submit">{editingId ? 'Atualizar' : 'Cadastrar'}</button>
      </form>

      <div className="admin-list">
        {items.map((item) => (
          <div className="admin-list__item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                Pagamento: {item.paymentCondition} • Expedição: {item.shippingMethod}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Valor fixo: R$ {item.fixedValue.toFixed(2)} • Markup: {item.markup.toFixed(1)}%
              </p>
            </div>
            <div className="admin-list__actions">
              <button type="button" onClick={() => handleEdit(item)}>
                Editar
              </button>
              <button type="button" onClick={() => handleDelete(item.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
