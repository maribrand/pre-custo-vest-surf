import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Notification } from '../common/Notification';
import { getAttributesByModel, createAttribute, updateAttribute, deleteAttributeFromModel, } from '../../services/optionsService';
import './AdminSection.css';
const emptyForm = { modelId: '', name: '', consumption: '', fixedCost: '', imageUrl: '' };
export function AttributesManager({ items, models, onChange }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [notification, setNotification] = useState(null);
    const hasModels = models.length > 0;
    const attributesForSelectedModel = useMemo(() => items.filter((attr) => attr.modelId === selectedModelId), [items, selectedModelId]);
    function showNotification(message, type) {
        setNotification({ message, type });
    }
    async function handleSubmit(event) {
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
                await updateAttribute(editingId, {
                    name: form.name,
                    consumption: parsedConsumption,
                    fixedCost: parsedFixedCost,
                    imageUrl: form.imageUrl.trim() || undefined,
                }, form.modelId);
                showNotification('Atributo atualizado com sucesso!', 'success');
            }
            else {
                await createAttribute({
                    name: form.name,
                    consumption: parsedConsumption,
                    fixedCost: parsedFixedCost,
                    imageUrl: form.imageUrl.trim() || undefined,
                }, form.modelId);
                showNotification('Atributo cadastrado com sucesso!', 'success');
            }
            // Recarrega todos os atributos de todos os modelos
            const allAttributes = [];
            for (const model of models) {
                const attributes = await getAttributesByModel(model.id);
                allAttributes.push(...attributes);
            }
            onChange(allAttributes);
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
            consumption: String(item.consumption),
            fixedCost: String(item.fixedCost ?? 0),
            imageUrl: item.imageUrl ?? '',
        });
        setSelectedModelId(item.modelId);
        setEditingId(item.id);
    }
    async function handleDelete(id) {
        const attribute = items.find(a => a.id === id);
        if (!attribute)
            return;
        try {
            await deleteAttributeFromModel(id, attribute.modelId);
            if (editingId === id) {
                setForm(emptyForm);
                setEditingId(null);
            }
            showNotification('Atributo removido.', 'success');
            // Recarrega todos os atributos de todos os modelos
            const allAttributes = [];
            for (const model of models) {
                const attributes = await getAttributesByModel(model.id);
                allAttributes.push(...attributes);
            }
            onChange(allAttributes);
        }
        catch (error) {
            showNotification(`Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    return (_jsxs("section", { className: "admin-section", children: [notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), _jsx("h3", { children: "Atributo por modelo" }), _jsx("p", { children: "Defina atributos que aumentam o consumo de tecido (ex: bolsos, mangas)." }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Modelo vinculado", _jsxs("select", { value: form.modelId, onChange: (e) => {
                                    setForm({ ...form, modelId: e.target.value });
                                    setSelectedModelId(e.target.value);
                                }, required: true, disabled: !hasModels, children: [_jsx("option", { value: "", children: "Selecione" }), models.map((model) => (_jsxs("option", { value: model.id, children: [model.name, " \u2014 ", model.category] }, model.id)))] })] }), _jsxs("label", { children: ["Nome do atributo", _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("label", { children: ["Consumo extra (tecido)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.consumption, onChange: (e) => setForm({ ...form, consumption: e.target.value }), required: true }), _jsx("small", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Em metros." })] }), _jsxs("label", { children: ["Custo fixo extra (atributo)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.fixedCost, onChange: (e) => setForm({ ...form, fixedCost: e.target.value }), placeholder: "0.00" }), _jsx("small", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Custo adicional por pe\u00E7a (ex: costura)." })] }), _jsxs("label", { children: ["Imagem do atributo (URL)", _jsx("input", { type: "url", placeholder: "https://...", value: form.imageUrl, onChange: (e) => setForm({ ...form, imageUrl: e.target.value }) })] }), _jsx("button", { type: "submit", disabled: !hasModels, children: editingId ? 'Atualizar atributo' : 'Cadastrar atributo' })] }), _jsxs("div", { className: "admin-list", children: [!selectedModelId && _jsx("p", { className: "placeholder", children: "Selecione um modelo para visualizar os atributos vinculados." }), selectedModelId && attributesForSelectedModel.length === 0 && (_jsx("p", { className: "placeholder", children: "Nenhuma atributo cadastrado para este modelo ainda." })), attributesForSelectedModel.map((item) => (_jsxs("div", { className: "admin-list__item", children: [_jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsxs("p", { style: { margin: 0, fontSize: '0.9rem', color: '#475569' }, children: ["Consumo extra: ", item.consumption.toFixed(2), "m \u2022 Custo fixo: R$ ", (item.fixedCost || 0).toFixed(2)] }), item.imageUrl && (_jsx("div", { style: { marginTop: '0.5rem' }, children: _jsx("img", { src: item.imageUrl, alt: item.name, style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' } }) }))] }), _jsxs("div", { className: "admin-list__actions", children: [_jsx("button", { type: "button", onClick: () => handleEdit(item), children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleDelete(item.id), children: "Excluir" })] })] }, item.id)))] })] }));
}
