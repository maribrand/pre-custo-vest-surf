import { useMemo, useState } from 'react';
import type { CompleteModel, ModelVariant, ProductModel } from '../../types/catalog';
import { createId } from '../../utils/id';
import { Notification } from '../common/Notification';
import {
  getVariantsByModel,
  createVariant,
  updateVariant,
  deleteVariantFromModel,
} from '../../services/optionsService';
import './AdminSection.css';

interface VariationsManagerProps {
  items: ModelVariant[];
  models: ProductModel[];
  completeModels: CompleteModel[];
  onChange: (next: ModelVariant[]) => void;
  onCompleteModelSave: (next: CompleteModel[]) => void;
}

interface VariationForm {
  modelId: string;
  name: string;
  unitCost: string;
  consumption: string;
  imageUrl: string;
}

const emptyForm: VariationForm = { modelId: '', name: '', unitCost: '', consumption: '', imageUrl: '' };

export function VariationsManager({ items, models, completeModels, onChange, onCompleteModelSave }: VariationsManagerProps) {
  const [form, setForm] = useState<VariationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const hasModels = models.length > 0;
  const variantsForSelectedModel = useMemo(
    () => items.filter((variant) => variant.modelId === selectedModelId),
    [items, selectedModelId]
  );
  const selectedModel = models.find((model) => model.id === selectedModelId);

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.modelId || !form.name.trim()) {
      showNotification('Preencha os campos obrigatórios.', 'error');
      return;
    }

    const parsedUnitCost = Number(form.unitCost);
    const parsedConsumption = Number(form.consumption);

    if (Number.isNaN(parsedUnitCost) || Number.isNaN(parsedConsumption)) {
      showNotification('Valores numéricos inválidos.', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateVariant(
          editingId,
          {
            name: form.name,
            unitCost: parsedUnitCost,
            consumption: parsedConsumption,
            imageUrl: form.imageUrl.trim() || undefined,
          },
          form.modelId
        );
        showNotification('Variante atualizada com sucesso!', 'success');
      } else {
        await createVariant(
          {
            name: form.name,
            unitCost: parsedUnitCost,
            consumption: parsedConsumption,
            imageUrl: form.imageUrl.trim() || undefined,
          },
          form.modelId
        );
        showNotification('Variante cadastrada com sucesso!', 'success');
      }

      // Recarrega todas as variantes de todos os modelos
      const allVariants: ModelVariant[] = [];
      for (const model of models) {
        const variants = await getVariantsByModel(model.id);
        allVariants.push(...variants);
      }
      onChange(allVariants);

      setForm(emptyForm);
      setEditingId(null);
      setSelectedModelId(form.modelId);
    } catch (error) {
      showNotification(
        `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
  }

  function handleEdit(item: ModelVariant) {
    setForm({
      modelId: item.modelId,
      name: item.name,
      unitCost: String(item.unitCost),
      consumption: String(item.consumption),
      imageUrl: item.imageUrl ?? '',
    });
    setSelectedModelId(item.modelId);
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    const variant = items.find(v => v.id === id);
    if (!variant) return;

    try {
      await deleteVariantFromModel(id, variant.modelId);
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }
      showNotification('Variante removida.', 'success');
      
      // Recarrega todas as variantes de todos os modelos
      const allVariants: ModelVariant[] = [];
      for (const model of models) {
        const variants = await getVariantsByModel(model.id);
        allVariants.push(...variants);
      }
      onChange(allVariants);
    } catch (error) {
      showNotification(
        `Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
  }

  function handleSaveCompleteModel() {
    if (!selectedModel) return;

    const variants = variantsForSelectedModel;
    if (variants.length === 0) {
      showNotification('Nenhuma variante para salvar.', 'error');
      return;
    }

    const payload: CompleteModel = {
      id: createId('complete-model'),
      modelId: selectedModel.id,
      category: selectedModel.category,
      name: selectedModel.name,
      baseCost: selectedModel.baseCost,
      fabricConsumption: selectedModel.fabricConsumption,
      variants: variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        unitCost: variant.unitCost,
        consumption: variant.consumption,
        totalValue: variant.totalValue,
        imageUrl: variant.imageUrl,
      })),
    };

    const next = [...completeModels.filter((entry) => entry.modelId !== selectedModel.id), payload];
    onCompleteModelSave(next);
    showNotification('Modelo completo salvo com sucesso!', 'success');
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
      <h3>Variantes e adicionais por modelo</h3>
      <p>Vincule variações a um modelo específico e calcule automaticamente o valor final.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Modelo vinculado
          <select
            value={form.modelId}
            onChange={(e) => {
              setForm({ ...form, modelId: e.target.value });
              setSelectedModelId(e.target.value);
            }}
            required
            disabled={!hasModels}
          >
            <option value="">Selecione</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} — {model.category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nome da variante
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Custo unitário (R$)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.unitCost}
            onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
            required
          />
        </label>
        <label>
          Consumo da variante
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.consumption}
            onChange={(e) => setForm({ ...form, consumption: e.target.value })}
            required
          />
          <small style={{ fontSize: '0.85rem', color: '#64748b' }}>Informe em metros ou unidades — multiplicado pelo custo.</small>
        </label>
        <label>
          Imagem da variante (URL)
          <input
            type="url"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </label>
        <button type="submit" disabled={!hasModels}>
          {editingId ? 'Atualizar variante' : 'Cadastrar variante'}
        </button>
      </form>

      <div className="admin-list">
        {!selectedModelId && <p className="placeholder">Selecione um modelo para visualizar as variantes vinculadas.</p>}
        {selectedModelId && variantsForSelectedModel.length === 0 && (
          <p className="placeholder">Nenhuma variante cadastrada para este modelo ainda.</p>
        )}
        {variantsForSelectedModel.map((item) => (
          <div className="admin-list__item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                Custo unitário: R$ {item.unitCost.toFixed(2)} • Consumo: {item.consumption.toFixed(2)}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Valor final calculado: R$ {item.totalValue.toFixed(2)}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Valor final calculado: R$ {item.totalValue.toFixed(2)}
              </p>
              {item.imageUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}
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

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleSaveCompleteModel}
          disabled={!selectedModel || variantsForSelectedModel.length === 0}
        >
          Salvar modelo completo
        </button>
      </div>
    </section>
  );
}
