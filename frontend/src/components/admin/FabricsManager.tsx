import { useMemo, useState } from 'react';
import type { Fabric, ProductModel } from '../../types/catalog';
import { Notification } from '../common/Notification';
import {
  getFabricsByModel,
  createFabric,
  updateFabric,
  deleteFabricFromModel,
} from '../../services/fabricsService';
import './AdminSection.css';

interface FabricsManagerProps {
  items: Fabric[];
  models: ProductModel[];
  onChange: (next: Fabric[]) => void;
}

interface FabricForm {
  modelId: string;
  name: string;
  unitCost: string;
  imageUrl: string;
}

const emptyForm: FabricForm = { modelId: '', name: '', unitCost: '', imageUrl: '' };

export function FabricsManager({ items, models, onChange }: FabricsManagerProps) {
  const [form, setForm] = useState<FabricForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const hasModels = models.length > 0;
  const fabricsForModel = useMemo(
    () => items.filter((fabric) => fabric.modelId === selectedModelId),
    [items, selectedModelId]
  );
  const selectedModel = models.find((model) => model.id === selectedModelId);

  // Histórico de tecidos únicos para preenchimento rápido
  const uniqueFabrics = useMemo(() => {
    const map = new Map<string, { name: string; unitCost: number; imageUrl?: string }>();
    items.forEach((item) => {
      const key = `${item.name.toLowerCase()}-${item.unitCost}`;
      if (!map.has(key)) {
        map.set(key, { name: item.name, unitCost: item.unitCost, imageUrl: item.imageUrl });
      }
    });
    return Array.from(map.values());
  }, [items]);

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
  }

  function computeTotalCost(modelId: string, unitCost: number) {
    const model = models.find((item) => item.id === modelId);
    const consumption = model?.fabricConsumption ?? 0;
    return unitCost * consumption;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.modelId || !form.name.trim()) {
      showNotification('Preencha os campos obrigatórios.', 'error');
      return;
    }

    const parsedUnitCost = Number(form.unitCost);
    if (Number.isNaN(parsedUnitCost)) {
      showNotification('Custo inválido.', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateFabric(editingId, {
          name: form.name,
          unitCost: parsedUnitCost,
          imageUrl: form.imageUrl.trim() || undefined,
        });
        showNotification('Tecido atualizado com sucesso!', 'success');
      } else {
        await createFabric(
          {
            name: form.name,
            unitCost: parsedUnitCost,
            imageUrl: form.imageUrl.trim() || undefined,
          },
          form.modelId
        );
        showNotification('Tecido cadastrado com sucesso!', 'success');
      }

      // Recarrega todos os tecidos de todos os modelos
      const allFabrics: Fabric[] = [];
      for (const model of models) {
        const fabrics = await getFabricsByModel(model.id);
        allFabrics.push(...fabrics);
      }
      onChange(allFabrics);

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

  function handleEdit(item: Fabric) {
    setForm({
      modelId: item.modelId,
      name: item.name,
      unitCost: String(item.unitCost),
      imageUrl: item.imageUrl ?? '',
    });
    setSelectedModelId(item.modelId);
    setEditingId(item.id);
  }

  async function handleDelete(id: string) {
    const fabric = items.find(f => f.id === id);
    if (!fabric) return;

    try {
      await deleteFabricFromModel(id, fabric.modelId);
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }
      showNotification('Tecido removido.', 'success');
      
      // Recarrega todos os tecidos de todos os modelos
      const allFabrics: Fabric[] = [];
      for (const model of models) {
        const fabrics = await getFabricsByModel(model.id);
        allFabrics.push(...fabrics);
      }
      onChange(allFabrics);
    } catch (error) {
      showNotification(
        `Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
  }

  function handleQuickFill(fabric: { name: string; unitCost: number; imageUrl?: string }) {
    setForm((prev) => ({
      ...prev,
      name: fabric.name,
      unitCost: String(fabric.unitCost),
      imageUrl: fabric.imageUrl ?? '',
    }));
    showNotification('Dados preenchidos pelo histórico.', 'success');
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
      <h3>Tecidos por modelo</h3>
      <p>Cadastre os tecidos usados em cada modelo e calcule automaticamente o custo total.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
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
                    {model.name} — consumo {model.fabricConsumption.toFixed(2)} m
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome do tecido
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Custo do tecido (R$/m)
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
              Imagem do tecido (URL)
              <input
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </label>
            <button type="submit" disabled={!hasModels}>
              {editingId ? 'Atualizar tecido' : 'Cadastrar tecido'}
            </button>
          </form>

          <div className="admin-list">
            {!selectedModelId && <p className="placeholder">Selecione um modelo para visualizar os tecidos cadastrados.</p>}
            {selectedModelId && fabricsForModel.length === 0 && <p className="placeholder">Nenhum tecido cadastrado ainda.</p>}
            {fabricsForModel.map((fabric) => (
              <div className="admin-list__item" key={fabric.id}>
                <div>
                  <strong>{fabric.name}</strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                    Custo por metro: R$ {fabric.unitCost.toFixed(2)}
                  </p>
                  {selectedModel && (
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Consumo do modelo: {selectedModel.fabricConsumption.toFixed(2)} m • Custo total: R$ {fabric.totalCost.toFixed(2)}
                    </p>
                  )}
                  {fabric.imageUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={fabric.imageUrl}
                        alt={fabric.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}
                </div>
                <div className="admin-list__actions">
                  <button type="button" onClick={() => handleEdit(fabric)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDelete(fabric.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="history-panel" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', height: 'fit-content' }}>
          <h4 style={{ marginTop: 0, fontSize: '0.95rem', color: '#334155' }}>Histórico de tecidos</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Clique para preencher o formulário rapidamente.
          </p>

          {uniqueFabrics.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Nenhum tecido cadastrado no histórico.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {uniqueFabrics.map((fabric, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickFill(fabric)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 500 }}>{fabric.name}</span>
                <span style={{ color: '#64748b' }}>R$ {fabric.unitCost.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
