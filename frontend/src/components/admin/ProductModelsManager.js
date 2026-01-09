import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Notification } from '../common/Notification';
import { createProductModel, updateProductModel, deleteProductModel, getAllProductModels, } from '../../services/productModelsService';
import './AdminSection.css';
const emptyForm = {
    category: '',
    name: '',
    baseCost: '',
    fabricConsumption: '',
};
export function ProductModelsManager({ items, onChange }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [notification, setNotification] = useState(null);
    function showNotification(message, type) {
        setNotification({ message, type });
    }
    async function handleSubmit(event) {
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
            }
            else {
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
        }
        catch (error) {
            showNotification(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    function handleEdit(item) {
        setForm({
            category: item.category,
            name: item.name,
            baseCost: String(item.baseCost),
            fabricConsumption: String(item.fabricConsumption),
        });
        setEditingId(item.id);
    }
    async function handleDelete(id) {
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
        }
        catch (error) {
            showNotification(`Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    return (_jsxs("section", { className: "admin-section", children: [notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), _jsx("h3", { children: "Categoria do produto e modelos" }), _jsx("p", { children: "Cadastre modelos completos informando categoria, custo base e consumo de tecido." }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Categoria do produto", _jsx("input", { value: form.category, onChange: (e) => setForm({ ...form, category: e.target.value }), required: true })] }), _jsxs("label", { children: ["Modelo do produto", _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("label", { children: ["Custo base do modelo (R$)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.baseCost, onChange: (e) => setForm({ ...form, baseCost: e.target.value }), required: true })] }), _jsxs("label", { children: ["Consumo de tecido (m)", _jsx("input", { type: "number", min: "0", step: "0.01", value: form.fabricConsumption, onChange: (e) => setForm({ ...form, fabricConsumption: e.target.value }), required: true })] }), _jsx("button", { type: "submit", children: editingId ? 'Atualizar modelo' : 'Cadastrar modelo' })] }), _jsxs("div", { className: "admin-list", children: [items.map((item) => (_jsxs("div", { className: "admin-list__item", children: [_jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsxs("p", { style: { margin: 0, fontSize: '0.9rem', color: '#475569' }, children: ["Categoria: ", item.category] }), _jsxs("p", { style: { margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }, children: ["Custo base: R$ ", item.baseCost.toFixed(2), " \u2022 Consumo tecido: ", item.fabricConsumption.toFixed(2), " m"] })] }), _jsxs("div", { className: "admin-list__actions", children: [_jsx("button", { type: "button", onClick: () => handleEdit(item), children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleDelete(item.id), children: "Excluir" })] })] }, item.id))), items.length === 0 && _jsx("p", { className: "placeholder", children: "Nenhum modelo cadastrado ainda." })] })] }));
}
