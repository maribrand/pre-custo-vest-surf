import { useState } from 'react';
import type { ProductModel } from '../../types/catalog';
import { Notification } from '../common/Notification';
import {
  createProductModel,
  updateProductModel,
  deleteProductModel,
  getAllProductModels,
} from '../../services/productModelsService';
import './AdminSection.css';

interface ProductModelsManagerProps {
  items: ProductModel[];
  onChange: (next: ProductModel[]) => void;
}

interface ProductModelForm {
  category: string;
  name: string;
  baseCost: string;
  fabricConsumption: string;
}

const emptyForm: ProductModelForm = {
  category: '',
  name: '',
  baseCost: '',
  fabricConsumption: '',
};

export function ProductModelsManager({ items, onChange }: ProductModelsManagerProps) {
  const [form, setForm] = useState<ProductModelForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.category.trim() || !form.name.trim()) {
      showNotification('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const parsedBaseCost = Number(form.baseCost);
    const parsedFabricConsumption = Number(form.fabricConsumption);

    if (Number.isNaN(parsedBaseCost) || Number.isNaN(parsedFabricConsumption)) {
      showNotification('Valores numéricos inválidos.', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateProductModel(editingId, {
          category: form.category,
          name: form.name,
          baseCost: parsedBaseCost,
          fabricConsumption: parsedFabricConsumption,
        });
        showNotification('Modelo atualizado com sucesso!', 'success');
      } else {
        await createProductModel({
          category: form.category,
          name: form.name,
          baseCost: parsedBaseCost,
          fabricConsumption: parsedFabricConsumption,
        });
        showNotification('Modelo cadastrado com sucesso!', 'success');
      }

      // Recarrega os dados do banco
      const updatedItems = await getAllProductModels();
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

  function handleEdit(item: ProductModel) {
    setForm({
      category: item.category,
      name: item.name,
      baseCost: String(item.baseCost),
      fabricConsumption: String(item.fabricConsumption),
    });
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    try {
      await deleteProductModel(id);
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }
      showNotification('Modelo removido.', 'success');
      
      // Recarrega os dados do banco
      const updatedItems = await getAllProductModels();
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
      <h3>Categoria do produto e modelos</h3>
      <p>Cadastre modelos completos informando categoria, custo base e consumo de tecido.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Categoria do produto
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        </label>
        <label>
          Modelo do produto
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Custo base do modelo (R$)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.baseCost}
            onChange={(e) => setForm({ ...form, baseCost: e.target.value })}
            required
          />
        </label>
        <label>
          Consumo de tecido (m)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.fabricConsumption}
            onChange={(e) => setForm({ ...form, fabricConsumption: e.target.value })}
            required
          />
        </label>
        <button type="submit">{editingId ? 'Atualizar modelo' : 'Cadastrar modelo'}</button>
      </form>

      <div className="admin-list">
        {items.map((item) => (
          <div className="admin-list__item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>Categoria: {item.category}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Custo base: R$ {item.baseCost.toFixed(2)} • Consumo tecido: {item.fabricConsumption.toFixed(2)} m
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
        {items.length === 0 && <p className="placeholder">Nenhum modelo cadastrado ainda.</p>}
      </div>
    </section>
  );
}
