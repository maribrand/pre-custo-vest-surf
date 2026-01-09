import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { createId } from '../../utils/id';
import { Notification } from '../common/Notification';
import { getVariantsByModel, createVariant, updateVariant, deleteVariantFromModel, } from '../../services/optionsService';
import './AdminSection.css';
const emptyForm = { modelId: '', name: '', unitCost: '', consumption: '', imageUrl: '' };
export function VariationsManager({ items, models, completeModels, onChange, onCompleteModelSave }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [selectedModelId, setSelectedModelId] = useState('');
    const [notification, setNotification] = useState(null);
    const hasModels = models.length > 0;
    const variantsForSelectedModel = useMemo(() => items.filter((variant) => variant.modelId === selectedModelId), [items, selectedModelId]);
    const selectedModel = models.find((model) => model.id === selectedModelId);
    function showNotification(message, type) {
        setNotification({ message, type });
    }
    async function handleSubmit(event) {
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
                await updateVariant(editingId, {
                    name: form.name,
                    unitCost: parsedUnitCost,
                    consumption: parsedConsumption,
                    imageUrl: form.imageUrl.trim() || undefined,
                }, form.modelId);
                showNotification('Variante atualizada com sucesso!', 'success');
            }
            else {
                await createVariant({
                    name: form.name,
                    unitCost: parsedUnitCost,
                    consumption: parsedConsumption,
                    imageUrl: form.imageUrl.trim() || undefined,
                }, form.modelId);
                showNotification('Variante cadastrada com sucesso!', 'success');
            }
            // Recarrega todas as variantes de todos os modelos
            const allVariants = [];
            for (const model of models) {
                const variants = await getVariantsByModel(model.id);
                allVariants.push(...variants);
            }
            onChange(allVariants);
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
            consumption: String(item.consumption),
            imageUrl: item.imageUrl ?? '',
        });
        setSelectedModelId(item.modelId);
        setEditingId(item.id);
    }
    async function handleDelete(id) {
        const variant = items.find(v => v.id === id);
        if (!variant)
            return;
        try {
            await deleteVariantFromModel(id, variant.modelId);
            if (editingId === id) {
                setForm(emptyForm);
                setEditingId(null);
            }
            showNotification('Variante removida.', 'success');
            // Recarrega todas as variantes de todos os modelos
            const allVariants = [];
            for (const model of models) {
                const variants = await getVariantsByModel(model.id);
                allVariants.push(...variants);
            }
            onChange(allVariants);
        }
        catch (error) {
            showNotification(`Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    function handleSaveCompleteModel() {
        if (!selectedModel)
            return;
        const variants = variantsForSelectedModel;
        if (variants.length === 0) {
            showNotification('Nenhuma variante para salvar.', 'error');
            return;
        }
        const payload = {
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
    return (_jsxs("section", { className: "admin-section", children: [notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), _jsx("h3", { children: "Variantes e adicionais por modelo" }), _jsx("p", { children: "Vincule varia\u00E7\u00F5es a um modelo espec\u00EDfico e calcule automaticamente o valor final." }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Modelo vinculado", _jsxs("select", { value: form.modelId, onChange: (e) => {
                                    setForm({ ...form, modelId: e.target.value });
                                    setSelectedModelId(e.target.value);
                                }, required: true, disabled: !hasModels, children: [_jsx("option", { value: "", children: "Selecione" }), models.map((model) => (_jsxs("option", { value: model.id, children: [model.name, " \u2014 ", model.category] }, model.id)))] })] }), _jsxs("label", { children: ["Nome da variante", _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("label", { children: ["Custo unit\u00E1rio (R$)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.unitCost, onChange: (e) => setForm({ ...form, unitCost: e.target.value }), required: true })] }), _jsxs("label", { children: ["Consumo da variante", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.consumption, onChange: (e) => setForm({ ...form, consumption: e.target.value }), required: true }), _jsx("small", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Informe em metros ou unidades \u2014 multiplicado pelo custo." })] }), _jsxs("label", { children: ["Imagem da variante (URL)", _jsx("input", { type: "url", placeholder: "https://...", value: form.imageUrl, onChange: (e) => setForm({ ...form, imageUrl: e.target.value }) })] }), _jsx("button", { type: "submit", disabled: !hasModels, children: editingId ? 'Atualizar variante' : 'Cadastrar variante' })] }), _jsxs("div", { className: "admin-list", children: [!selectedModelId && _jsx("p", { className: "placeholder", children: "Selecione um modelo para visualizar as variantes vinculadas." }), selectedModelId && variantsForSelectedModel.length === 0 && (_jsx("p", { className: "placeholder", children: "Nenhuma variante cadastrada para este modelo ainda." })), variantsForSelectedModel.map((item) => (_jsxs("div", { className: "admin-list__item", children: [_jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsxs("p", { style: { margin: 0, fontSize: '0.9rem', color: '#475569' }, children: ["Custo unit\u00E1rio: R$ ", item.unitCost.toFixed(2), " \u2022 Consumo: ", item.consumption.toFixed(2)] }), _jsxs("p", { style: { margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }, children: ["Valor final calculado: R$ ", item.totalValue.toFixed(2)] }), _jsxs("p", { style: { margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }, children: ["Valor final calculado: R$ ", item.totalValue.toFixed(2)] }), item.imageUrl && (_jsx("div", { style: { marginTop: '0.5rem' }, children: _jsx("img", { src: item.imageUrl, alt: item.name, style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' } }) }))] }), _jsxs("div", { className: "admin-list__actions", children: [_jsx("button", { type: "button", onClick: () => handleEdit(item), children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleDelete(item.id), children: "Excluir" })] })] }, item.id)))] }), _jsx("div", { style: { marginTop: '1rem' }, children: _jsx("button", { type: "button", onClick: handleSaveCompleteModel, disabled: !selectedModel || variantsForSelectedModel.length === 0, children: "Salvar modelo completo" }) })] }));
}
