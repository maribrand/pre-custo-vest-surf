import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Notification } from '../common/Notification';
import { createCustomerType, updateCustomerType, deleteCustomerType, getAllCustomerTypes, } from '../../services/customerTypesService';
import './AdminSection.css';
const emptyForm = {
    name: '',
    paymentCondition: '',
    shippingMethod: '',
    fixedValue: '0',
    markup: '0',
};
export function ClientTypesManager({ items, onChange }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [notification, setNotification] = useState(null);
    function showNotification(message, type) {
        setNotification({ message, type });
    }
    async function handleSubmit(event) {
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
            }
            else {
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
        }
        catch (error) {
            showNotification(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    function handleEdit(item) {
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
    async function handleDelete(id) {
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
        }
        catch (error) {
            showNotification(`Erro ao remover: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }
    return (_jsxs("section", { className: "admin-section", children: [notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), _jsx("h3", { children: "Tipos de cliente" }), _jsx("p", { children: "Cadastre perfis com condi\u00E7\u00F5es comerciais diferentes." }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Nome", _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("label", { children: ["Condi\u00E7\u00E3o de pagamento", _jsx("input", { value: form.paymentCondition, onChange: (e) => setForm({ ...form, paymentCondition: e.target.value }), required: true })] }), _jsxs("label", { children: ["Forma de expedi\u00E7\u00E3o", _jsx("input", { value: form.shippingMethod, onChange: (e) => setForm({ ...form, shippingMethod: e.target.value }), required: true })] }), _jsxs("label", { children: ["Valor fixo (R$)", _jsx("input", { type: "number", step: "0.01", min: "0", value: form.fixedValue, onChange: (e) => setForm({ ...form, fixedValue: e.target.value }) }), _jsx("small", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Valor somado ao subtotal antes de aplicar o markup" })] }), _jsxs("label", { children: ["Markup (%)", _jsx("input", { type: "number", step: "0.1", min: "0", value: form.markup, onChange: (e) => setForm({ ...form, markup: e.target.value }) }), _jsx("small", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Percentual aplicado sobre o subtotal (ex.: 20 para 20%)" })] }), _jsx("button", { type: "submit", children: editingId ? 'Atualizar' : 'Cadastrar' })] }), _jsx("div", { className: "admin-list", children: items.map((item) => (_jsxs("div", { className: "admin-list__item", children: [_jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsxs("p", { style: { margin: 0, fontSize: '0.9rem', color: '#475569' }, children: ["Pagamento: ", item.paymentCondition, " \u2022 Expedi\u00E7\u00E3o: ", item.shippingMethod] }), _jsxs("p", { style: { margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }, children: ["Valor fixo: R$ ", item.fixedValue.toFixed(2), " \u2022 Markup: ", item.markup.toFixed(1), "%"] })] }), _jsxs("div", { className: "admin-list__actions", children: [_jsx("button", { type: "button", onClick: () => handleEdit(item), children: "Editar" }), _jsx("button", { type: "button", onClick: () => handleDelete(item.id), children: "Excluir" })] })] }, item.id))) })] }));
}
