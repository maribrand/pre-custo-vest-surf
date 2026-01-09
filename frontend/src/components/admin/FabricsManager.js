import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Notification } from '../common/Notification';
import { getFabricsByModel, createFabric, updateFabric, deleteFabricFromModel, } from '../../services/fabricsService';
import './AdminSection.css';
const emptyForm = { modelId: '', name: '', unitCost: '', imageUrl: '' };
export function FabricsManager({ items, models, onChange }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [notification, setNotification] = useState(null);
    const hasModels = models.length > 0;
    const fabricsForModel = useMemo(() => items.filter((fabric) => fabric.modelId === selectedModelId), [items, selectedModelId]);
    const selectedModel = models.find((model) => model.id === selectedModelId);
    // Histórico de tecidos únicos para preenchimento rápido
    const uniqueFabrics = useMemo(() => {
        const map = new Map();
        items.forEach((item) => {
            const key = `${item.name.toLowerCase()}-${item.unitCost}`;
            if (!map.has(key)) {
                map.set(key, { name: item.name, unitCost: item.unitCost, imageUrl: item.imageUrl });
            }
        });
        return Array.from(map.values());
    }, [items]);
    function showNotification(message, type) {
        setNotification({ message, type });
    }
    function computeTotalCost(modelId, unitCost) {
        const model = models.find((item) => item.id === modelId);
        const consumption = model?.fabricConsumption ?? 0;
        return unitCost * consumption;
    }
    async function handleSubmit(event) {
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
            }
            else {
                await createFabric({
                    name: form.name,
                    unitCost: parsedUnitCost,
                    imageUrl: form.imageUrl.trim() || undefined,
                }, form.modelId);
                showNotification('Tecido cadastrado com sucesso!', 'success');
            }
            // Recarrega todos os tecidos de todos os modelos
            const allFabrics = [];
            for (const model of models) {
                const fabrics = await getFabricsByModel(model.id);
                allFabrics.push(...fabrics);
            }
            onChange(allFabrics);
            setForm(emptyForm);
            setEditingId(null);
            setSelectedModelId(form.modelId);
        }
        catch (error) {
            showNotification(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    function handleEdit(item) {
        setForm({
            modelId: item.modelId,
            name: item.name,
            unitCost: String(item.unitCost),
            imageUrl: item.imageUrl ?? '',
        });
        setSelectedModelId(item.modelId);
        setEditingId(item.id);
    }
    async function handleDelete(id) {
        const fabric = items.find(f => f.id === id);
        if (!fabric)
            return;
        try {
            await deleteFabricFromModel(id, fabric.modelId);
            if (editingId === id) {
                setForm(emptyForm);
                setEditingId(null);
            }
            showNotification('Tecido removido.', 'success');
            // Recarrega todos os tecidos de todos os modelos
            const allFabrics = [];
            for (const model of models) {
                const fabrics = await getFabricsByModel(model.id);
                allFabrics.push(...fabrics);
            }
            onChange(allFabrics);
        }
        catch (error) {
            showNotification(`Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    function handleQuickFill(fabric) {
        setForm((prev) => ({
            ...prev,
            name: fabric.name,
            unitCost: String(fabric.unitCost),
            imageUrl: fabric.imageUrl ?? '',
        }));
        showNotification('Dados preenchidos pelo histórico.', 'success');
    }
    return (_jsxs("section", { className: "admin-section", children: [notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), _jsx("h3", { children: "Tecidos por modelo" }), _jsx("p", { children: "Cadastre os tecidos usados em cada modelo e calcule automaticamente o custo total." }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }, children: [_jsxs("div", { children: [_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Modelo vinculado", _jsxs("select", { value: form.modelId, onChange: (e) => {
                                                    setForm({ ...form, modelId: e.target.value });
                                                    setSelectedModelId(e.target.value);
                                                }, required: true, disabled: !hasModels, children: [_jsx("option", { value: "", children: "Selecione" }), models.map((model) => (_jsxs("option", { value: model.id, children: [model.name, " \u2014 consumo ", model.fabricConsumption.toFixed(2), " m"] }, model.id)))] })] }), _jsxs("label", { children: ["Nome do tecido", _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("label", { children: ["Custo do tecido (R$/m)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.unitCost, onChange: (e) => setForm({ ...form, unitCost: e.target.value }), required: true })] }), _jsxs("label", { children: ["Imagem do tecido (URL)", _jsx("input", { type: "url", placeholder: "https://...", value: form.imageUrl, onChange: (e) => setForm({ ...form, imageUrl: e.target.value }) })] }), _jsx("button", { type: "submit", disabled: !hasModels, children: editingId ? 'Atualizar tecido' : 'Cadastrar tecido' })] }), _jsxs("div", { className: "admin-list", children: [!selectedModelId && _jsx("p", { className: "placeholder", children: "Selecione um modelo para visualizar os tecidos cadastrados." }), selectedModelId && fabricsForModel.length === 0 && _jsx("p", { className: "placeholder", children: "Nenhum tecido cadastrado ainda." }), fabricsForModel.map((fabric) => (_jsxs("div", { className: "admin-list__item", children: [_jsxs("div", { children: [_jsx("strong", { children: fabric.name }), _jsxs("p", { style: { margin: 0, fontSize: '0.9rem', color: '#475569' }, children: ["Custo por metro: R$ ", fabric.unitCost.toFixed(2)] }), selectedModel && (_jsxs("p", { style: { margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }, children: ["Consumo do modelo: ", selectedModel.fabricConsumption.toFixed(2), " m \u2022 Custo total: R$ ", fabric.totalCost.toFixed(2)] })), fabric.imageUrl && (_jsx("div", { style: { marginTop: '0.5rem' }, children: _jsx("img", { src: fabric.imageUrl, alt: fabric.name, style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' } }) }))] }), _jsxs("div", { className: "admin-list__actions", children: [_jsx("button", { type: "button", onClick: () => handleEdit(fabric), children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleDelete(fabric.id), children: "Excluir" })] })] }, fabric.id)))] })] }), _jsxs("div", { className: "history-panel", style: { background: '#f8fafc', padding: '1rem', borderRadius: '8px', height: 'fit-content' }, children: [_jsx("h4", { style: { marginTop: 0, fontSize: '0.95rem', color: '#334155' }, children: "Hist\u00F3rico de tecidos" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }, children: "Clique para preencher o formul\u00E1rio rapidamente." }), uniqueFabrics.length === 0 && (_jsx("p", { style: { fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }, children: "Nenhum tecido cadastrado no hist\u00F3rico." })), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }, children: uniqueFabrics.map((fabric, index) => (_jsxs("button", { type: "button", onClick: () => handleQuickFill(fabric), style: {
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
                                    }, children: [_jsx("span", { style: { fontWeight: 500 }, children: fabric.name }), _jsxs("span", { style: { color: '#64748b' }, children: ["R$ ", fabric.unitCost.toFixed(2)] })] }, index))) })] })] })] }));
}
