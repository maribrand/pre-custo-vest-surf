import { useMemo, useState } from 'react';
import type { ModelAttribute, ProductModel } from '../../types/catalog';
import { Notification } from '../common/Notification';
import {
  getAttributesByModel,
  createAttribute,
  updateAttribute,
  deleteAttributeFromModel,
} from '../../services/optionsService';
import './AdminSection.css';

interface AttributesManagerProps {
    items: ModelAttribute[];
    models: ProductModel[];
    onChange: (next: ModelAttribute[]) => void;
}

interface AttributeForm {
    modelId: string;
    name: string;
    consumption: string;
    fixedCost: string;
    imageUrl: string;
}

const emptyForm: AttributeForm = { modelId: '', name: '', consumption: '', fixedCost: '', imageUrl: '' };

export function AttributesManager({ items, models, onChange }: AttributesManagerProps) {
    const [form, setForm] = useState<AttributeForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const hasModels = models.length > 0;
    const attributesForSelectedModel = useMemo(
        () => items.filter((attr) => attr.modelId === selectedModelId),
        [items, selectedModelId]
    );

    function showNotification(message: string, type: 'success' | 'error') {
        setNotification({ message, type });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form.modelId || !form.name.trim()) {
            showNotification('Preencha os campos obrigatórios.', 'error');
            return;
        }

        const parsedConsumption = Number(form.consumption);
        const parsedFixedCost = Number(form.fixedCost);

        if (Number.isNaN(parsedConsumption)) {
            showNotification('Valor de consumo inválido.', 'error');
            return;
        }

        if (Number.isNaN(parsedFixedCost)) {
            showNotification('Valor de custo fixo inválido.', 'error');
            return;
        }

        try {
            if (editingId) {
                await updateAttribute(
                    editingId,
                    {
                        name: form.name,
                        consumption: parsedConsumption,
                        fixedCost: parsedFixedCost,
                        imageUrl: form.imageUrl.trim() || undefined,
                    },
                    form.modelId
                );
                showNotification('Atributo atualizado com sucesso!', 'success');
            } else {
                await createAttribute(
                    {
                        name: form.name,
                        consumption: parsedConsumption,
                        fixedCost: parsedFixedCost,
                        imageUrl: form.imageUrl.trim() || undefined,
                    },
                    form.modelId
                );
                showNotification('Atributo cadastrado com sucesso!', 'success');
            }

            // Recarrega todos os atributos de todos os modelos
            const allAttributes: ModelAttribute[] = [];
            for (const model of models) {
                const attributes = await getAttributesByModel(model.id);
                allAttributes.push(...attributes);
            }
            onChange(allAttributes);

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

    function handleEdit(item: ModelAttribute) {
        setForm({
            modelId: item.modelId,
            name: item.name,
            consumption: String(item.consumption),
            fixedCost: String(item.fixedCost ?? 0),
            imageUrl: item.imageUrl ?? '',
        });
        setSelectedModelId(item.modelId);
        setEditingId(item.id);
    }

    async function handleDelete(id: string) {
        const attribute = items.find(a => a.id === id);
        if (!attribute) return;

        try {
            await deleteAttributeFromModel(id, attribute.modelId);
            if (editingId === id) {
                setForm(emptyForm);
                setEditingId(null);
            }
            showNotification('Atributo removido.', 'success');
            
            // Recarrega todos os atributos de todos os modelos
            const allAttributes: ModelAttribute[] = [];
            for (const model of models) {
                const attributes = await getAttributesByModel(model.id);
                allAttributes.push(...attributes);
            }
            onChange(allAttributes);
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
            <h3>Atributo por modelo</h3>
            <p>Defina atributos que aumentam o consumo de tecido (ex: bolsos, mangas).</p>

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
                    Nome do atributo
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </label>
                <label>
                    Consumo extra (tecido)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.consumption}
                        onChange={(e) => setForm({ ...form, consumption: e.target.value })}
                        required
                    />
                    <small style={{ fontSize: '0.85rem', color: '#64748b' }}>Em metros.</small>
                </label>
                <label>
                    Custo fixo extra (atributo)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.fixedCost}
                        onChange={(e) => setForm({ ...form, fixedCost: e.target.value })}
                        placeholder="0.00"
                    />
                    <small style={{ fontSize: '0.85rem', color: '#64748b' }}>Custo adicional por peça (ex: costura).</small>
                </label>
                <label>
                    Imagem do atributo (URL)
                    <input
                        type="url"
                        placeholder="https://..."
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    />
                </label>
                <button type="submit" disabled={!hasModels}>
                    {editingId ? 'Atualizar atributo' : 'Cadastrar atributo'}
                </button>
            </form>

            <div className="admin-list">
                {!selectedModelId && <p className="placeholder">Selecione um modelo para visualizar os atributos vinculados.</p>}
                {selectedModelId && attributesForSelectedModel.length === 0 && (
                    <p className="placeholder">Nenhuma atributo cadastrado para este modelo ainda.</p>
                )}
                {attributesForSelectedModel.map((item) => (
                    <div className="admin-list__item" key={item.id}>
                        <div>
                            <strong>{item.name}</strong>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                                Consumo extra: {item.consumption.toFixed(2)}m • Custo fixo: R$ {(item.fixedCost || 0).toFixed(2)}
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
        </section>
    );
}
