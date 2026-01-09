import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ClientTypesManager } from '../admin/ClientTypesManager';
import { ProductModelsManager } from '../admin/ProductModelsManager';
import { VariationsManager } from '../admin/VariationsManager';
import { AttributesManager } from '../admin/AttributesManager';
import { FabricsManager } from '../admin/FabricsManager';
export function AdminLayout({ clientTypes, productModels, variants, attributes, completeModels, fabrics, onClientTypesChange, onProductModelsChange, onVariantsChange, onAttributesChange, onCompleteModelsChange, onFabricsChange, }) {
    return (_jsxs("section", { children: [_jsx("h2", { children: "Admin \u2013 Parametriza\u00E7\u00E3o" }), _jsx("p", { style: { color: '#475569', marginBottom: '1.5rem' }, children: "Utilize os formul\u00E1rios abaixo para montar o cat\u00E1logo e as regras de pr\u00E9-custo. Todos os dados ficam em mem\u00F3ria durante o MVP." }), _jsxs("div", { style: { display: 'grid', gap: '1.5rem' }, children: [_jsx(ClientTypesManager, { items: clientTypes, onChange: onClientTypesChange }), _jsx(ProductModelsManager, { items: productModels, onChange: onProductModelsChange }), _jsx(FabricsManager, { items: fabrics, models: productModels, onChange: onFabricsChange }), _jsx(AttributesManager, { items: attributes, models: productModels, onChange: onAttributesChange }), _jsx(VariationsManager, { items: variants, models: productModels, completeModels: completeModels, onChange: onVariantsChange, onCompleteModelSave: onCompleteModelsChange })] })] }));
}
