import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { SelectionCard } from '../common/SelectionCard';
import { createQuote } from '../../services/quotesService';
import './SellerLayout.css';
export function SellerLayout({ clientTypes, models, variations, attributes, fabrics, mode }) {
    const [selectedClientType, setSelectedClientType] = useState('');
    const [clientName, setClientName] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedFabricId, setSelectedFabricId] = useState('');
    const [selectedVariations, setSelectedVariations] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    // Cart State
    const [cart, setCart] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(null);
    const currentModel = useMemo(() => models.find((model) => model.id === selectedModel), [models, selectedModel]);
    const currentClientType = useMemo(() => clientTypes.find((client) => client.id === selectedClientType), [clientTypes, selectedClientType]);
    const availableVariations = useMemo(() => variations.filter((variation) => variation.modelId === selectedModel), [variations, selectedModel]);
    const availableAttributes = useMemo(() => attributes.filter((attr) => attr.modelId === selectedModel), [attributes, selectedModel]);
    const availableFabrics = useMemo(() => fabrics.filter((fabric) => fabric.modelId === selectedModel), [fabrics, selectedModel]);
    const currentFabric = useMemo(() => availableFabrics.find((f) => f.id === selectedFabricId), [availableFabrics, selectedFabricId]);
    const additions = useMemo(() => {
        return selectedVariations
            .map((variationId) => availableVariations.find((variation) => variation.id === variationId))
            .filter((variation) => Boolean(variation));
    }, [selectedVariations, availableVariations]);
    const selectedAttributesList = useMemo(() => {
        return selectedAttributes
            .map((attrId) => availableAttributes.find((attr) => attr.id === attrId))
            .filter((attr) => Boolean(attr));
    }, [selectedAttributes, availableAttributes]);
    // Cálculo do preço
    const basePrice = currentModel?.baseCost ?? 0;
    const baseConsumption = currentModel?.fabricConsumption ?? 0;
    const attributesConsumption = selectedAttributesList.reduce((acc, attr) => acc + attr.consumption, 0);
    const attributesFixedCost = selectedAttributesList.reduce((acc, attr) => acc + (attr.fixedCost || 0), 0);
    const totalConsumption = baseConsumption + attributesConsumption;
    const fabricUnitCost = currentFabric?.unitCost ?? 0;
    const fabricCost = totalConsumption * fabricUnitCost;
    const additionsTotal = additions.reduce((total, variation) => total + variation.totalValue, 0);
    const fixedValue = currentClientType?.fixedValue ?? 0;
    const subtotal = basePrice + fabricCost + additionsTotal + attributesFixedCost + fixedValue;
    const markup = currentClientType?.markup ?? 0;
    const estimatedPrice = subtotal * (1 + markup / 100);
    useEffect(() => {
        // Ao trocar de modelo, limpamos as seleções para evitar combinações antigas.
        setSelectedVariations([]);
        setSelectedAttributes([]);
        setSelectedFabricId('');
    }, [selectedModel]);
    function toggleVariation(id) {
        setSelectedVariations((prev) => (prev.includes(id) ? prev.filter((variationId) => variationId !== id) : [...prev, id]));
    }
    function toggleAttribute(id) {
        setSelectedAttributes((prev) => (prev.includes(id) ? prev.filter((attrId) => attrId !== id) : [...prev, id]));
    }
    const currency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const showAdditionValues = mode === 'internal';
    const handleAddToCart = async () => {
        if (!currentModel) {
            alert("Selecione um modelo.");
            return;
        }
        // Check if fabrics are available but none selected.
        if (availableFabrics.length > 0 && !currentFabric) {
            alert("Selecione um tecido.");
            return;
        }
        if (!selectedClientType) {
            alert("Selecione um tipo de cliente.");
            return;
        }
        if (!clientName.trim()) {
            alert("Preencha o nome do cliente.");
            return;
        }
        const newItem = {
            id: crypto.randomUUID(),
            modelName: currentModel.name,
            category: currentModel.category,
            fabricName: currentFabric?.name || "N/A",
            variantNames: additions.map(v => v.name),
            attributeNames: selectedAttributesList.map(a => a.name),
            finalPrice: estimatedPrice,
            clientTypeName: currentClientType?.name || "Não selecionado",
            timestamp: new Date()
        };
        setCart([...cart, newItem]);
        // Clear selections
        setSelectedModel('');
        setShowSuccessMessage("Modelo adicionado ao carrinho com sucesso!");
        setTimeout(() => setShowSuccessMessage(null), 3000);
    };
    const handleSaveQuote = async () => {
        if (cart.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }
        if (!clientName.trim()) {
            alert("Por favor, preencha o Nome do cliente antes de salvar o orçamento.");
            return;
        }
        if (!selectedClientType) {
            alert("Por favor, selecione um tipo de cliente.");
            return;
        }
        try {
            // Converte os itens do carrinho para o formato do quotesService
            const quoteItems = cart.map(item => {
                // Encontra o modelo pelo nome
                const model = models.find(m => m.name === item.modelName);
                if (!model)
                    throw new Error(`Modelo não encontrado: ${item.modelName}`);
                // Encontra o tecido pelo nome
                const fabric = fabrics.find(f => f.name === item.fabricName && f.modelId === model.id);
                // Encontra variantes e atributos pelos nomes
                const variantIds = item.variantNames
                    .map(name => {
                    const variant = variations.find(v => v.name === name && v.modelId === model.id);
                    return variant?.id;
                })
                    .filter((id) => Boolean(id));
                const attributeIds = item.attributeNames
                    .map(name => {
                    const attribute = attributes.find(a => a.name === name && a.modelId === model.id);
                    return attribute?.id;
                })
                    .filter((id) => Boolean(id));
                return {
                    modelId: model.id,
                    fabricId: fabric?.id,
                    variantIds,
                    attributeIds,
                    quantity: 1,
                    clientTypeId: selectedClientType,
                    clientName: clientName.trim(),
                };
            });
            await createQuote(quoteItems);
            setShowSuccessMessage("Orçamento salvo com sucesso no banco de dados!");
            setTimeout(() => setShowSuccessMessage(null), 3000);
            // Limpa o carrinho após salvar
            setCart([]);
        }
        catch (error) {
            alert(`Erro ao salvar orçamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };
    const handleRemoveFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };
    const generatePDF = () => {
        if (cart.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }
        if (!clientName.trim()) {
            alert("Por favor, preencha o Nome do cliente antes de gerar o PDF.");
            return;
        }
        const doc = new jsPDF();
        const marginLeft = 15;
        let currentY = 20;
        // Header
        doc.setFontSize(16);
        doc.text("RESUMO DO PRÉ-PEDIDO", marginLeft, currentY);
        currentY += 10;
        doc.setFontSize(12);
        doc.text(`Cliente: ${clientName}`, marginLeft, currentY);
        currentY += 7;
        const typeLabel = cart[0]?.clientTypeName || currentClientType?.name || "N/A";
        doc.text(`Tipo de cliente: ${typeLabel}`, marginLeft, currentY);
        currentY += 15;
        doc.text("Itens do pedido:", marginLeft, currentY);
        currentY += 10;
        cart.forEach((item, index) => {
            // Check for page break
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}) Modelo: ${item.modelName}`, marginLeft, currentY);
            currentY += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`   Categoria: ${item.category}`, marginLeft, currentY);
            currentY += 5;
            doc.text(`   Tecido: ${item.fabricName}`, marginLeft, currentY);
            currentY += 5;
            if (item.variantNames.length > 0) {
                doc.text(`   Variantes:`, marginLeft, currentY);
                currentY += 5;
                item.variantNames.forEach(v => {
                    doc.text(`     - ${v}`, marginLeft, currentY);
                    currentY += 5;
                });
            }
            if (item.attributeNames.length > 0) {
                doc.text(`   Atributos:`, marginLeft, currentY);
                currentY += 5;
                item.attributeNames.forEach(a => {
                    doc.text(`     - ${a}`, marginLeft, currentY);
                    currentY += 5;
                });
            }
            doc.setFont("helvetica", "bold");
            doc.text(`   Preço estimado: ${item.finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, marginLeft, currentY);
            currentY += 10;
        });
        // Separator line after list
        doc.line(marginLeft, currentY, 195, currentY);
        currentY += 10;
        // Footer
        currentY += 10;
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const footerText = "Valores estimados para análise e aprovação comercial e administrativa.\nEste documento não caracteriza pedido final.";
        doc.text(footerText, marginLeft, currentY);
        // Save
        doc.save("pre_pedido_resumo.pdf");
    };
    const cartTotal = cart.reduce((acc, item) => acc + item.finalPrice, 0);
    return (_jsxs("section", { children: [_jsx("h2", { children: mode === 'internal' ? 'PCP – Simulador completo' : 'Representante – Simulador simplificado' }), _jsx("p", { style: { color: '#475569', marginBottom: '1.5rem' }, children: "Escolha o perfil do cliente, selecione um modelo base e monte o produto com as varia\u00E7\u00F5es desejadas. O c\u00E1lculo \u00E9 sempre atualizado automaticamente \u2013 apenas a visualiza\u00E7\u00E3o muda conforme o perfil." }), showSuccessMessage && (_jsx("div", { style: {
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #bbf7d0'
                }, children: showSuccessMessage })), _jsxs("div", { className: "seller-grid", children: [_jsxs("div", { className: "seller-panel", children: [_jsx("h3", { children: "Configura\u00E7\u00F5es iniciais" }), _jsxs("form", { onSubmit: (e) => e.preventDefault(), children: [_jsxs("label", { children: ["Nome do cliente", _jsx("input", { type: "text", value: clientName, onChange: (event) => setClientName(event.target.value), placeholder: "Ex: Marca X, Loja Y", required: true, style: {
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    fontSize: '1rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                    marginBottom: '1rem'
                                                } })] }), _jsxs("label", { children: ["Tipo de cliente", _jsxs("select", { value: selectedClientType, onChange: (event) => setSelectedClientType(event.target.value), children: [_jsx("option", { value: "", children: "Selecione" }), clientTypes.map((client) => (_jsx("option", { value: client.id, children: client.name }, client.id)))] })] }), _jsxs("label", { children: ["Modelo de produto", _jsxs("select", { value: selectedModel, onChange: (event) => setSelectedModel(event.target.value), children: [_jsx("option", { value: "", children: "Selecione" }), models.map((model) => (_jsxs("option", { value: model.id, children: [model.name, " \u2014 base ", currency(model.baseCost)] }, model.id)))] })] })] })] }), _jsxs("div", { className: "seller-panel", children: [_jsx("h3", { children: "Tecidos dispon\u00EDveis" }), !currentModel && _jsx("p", { className: "placeholder", children: "Selecione um modelo para visualizar os tecidos." }), currentModel && availableFabrics.length === 0 && (_jsx("p", { className: "placeholder", children: "Nenhum tecido cadastrado para este modelo." })), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }, children: availableFabrics.map((fabric) => (_jsx(SelectionCard, { title: fabric.name, imageUrl: fabric.imageUrl, price: showAdditionValues ? currency(fabric.totalCost) : undefined, selected: fabric.id === selectedFabricId, onClick: () => setSelectedFabricId(fabric.id) }, fabric.id))) })] }), _jsxs("div", { className: "seller-panel", children: [_jsx("h3", { children: "Variantes dispon\u00EDveis" }), !currentModel && _jsx("p", { className: "placeholder", children: "Selecione um modelo para liberar as variantes vinculadas." }), currentModel && availableVariations.length === 0 && (_jsx("p", { className: "placeholder", children: "Nenhuma variante cadastrada para este modelo." })), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }, children: currentModel &&
                                    availableVariations.map((option) => (_jsx(SelectionCard, { title: option.name, imageUrl: option.imageUrl, price: showAdditionValues ? currency(option.totalValue) : undefined, selected: selectedVariations.includes(option.id), onClick: () => toggleVariation(option.id) }, option.id))) })] }), _jsxs("div", { className: "seller-panel", children: [_jsx("h3", { children: "Atributos por modelo" }), !currentModel && _jsx("p", { className: "placeholder", children: "Selecione um modelo para liberar os atributos." }), currentModel && availableAttributes.length === 0 && (_jsx("p", { className: "placeholder", children: "Nenhum atributo cadastrado para este modelo." })), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }, children: currentModel &&
                                    availableAttributes.map((option) => (_jsx(SelectionCard, { title: option.name, imageUrl: option.imageUrl, price: showAdditionValues ? `+${option.consumption}m` : undefined, selected: selectedAttributes.includes(option.id), onClick: () => toggleAttribute(option.id) }, option.id))) })] }), _jsxs("div", { className: "price-highlight", children: [showAdditionValues && (_jsxs(_Fragment, { children: [_jsx("span", { children: "Pre\u00E7o base" }), _jsx("strong", { children: currency(basePrice) }), _jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } }), _jsx("span", { children: "Tecido selecionado" }), currentFabric ? (_jsxs("div", { children: [currentFabric.name, ": ", currency(fabricCost), _jsxs("div", { style: { fontSize: '0.85rem', color: '#cbd5e1' }, children: ["(", currentFabric.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), "/m x ", totalConsumption.toFixed(2), "m)"] })] })) : (_jsx("div", { style: { fontStyle: 'italic', opacity: 0.7 }, children: "Nenhum tecido selecionado" })), _jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } }), _jsx("span", { children: "Adicionais selecionados" }), _jsxs("ul", { style: { margin: 0, paddingLeft: '1.2rem' }, children: [additions.length === 0 && _jsx("li", { children: "Nenhuma varia\u00E7\u00E3o aplicada" }), additions.map((variation) => (_jsxs("li", { children: [variation.name, ": ", currency(variation.totalValue)] }, variation.id)))] }), _jsxs("div", { style: { marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }, children: ["Subtotal (base + tecido + adicionais): ", currency(basePrice + fabricCost + additionsTotal)] }), currentClientType && (_jsxs(_Fragment, { children: [_jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } }), _jsx("span", { children: "Valor fixo do cliente" }), _jsx("strong", { children: currency(fixedValue) }), _jsxs("div", { style: { fontSize: '0.9rem', opacity: 0.9 }, children: ["Subtotal com valor fixo: ", currency(subtotal)] }), markup > 0 && (_jsxs(_Fragment, { children: [_jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } }), _jsxs("span", { children: ["Markup (", markup.toFixed(1), "%)"] }), _jsxs("div", { style: { fontSize: '0.9rem', opacity: 0.9 }, children: ["Aplicado sobre: ", currency(subtotal)] })] }))] })), _jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } })] })), !showAdditionValues && (_jsx(_Fragment, { children: currentModel && (_jsxs(_Fragment, { children: [_jsx("span", { children: "Pre\u00E7o base" }), _jsx("strong", { children: currency(basePrice) }), _jsx("hr", { style: { border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' } })] })) })), _jsx("span", { children: "Pre\u00E7o estimado final" }), _jsx("strong", { children: currency(estimatedPrice) }), mode === 'rep' && (_jsx("small", { style: { opacity: 0.85, display: 'block', marginTop: '0.5rem' }, children: "O detalhe dos adicionais, valor fixo e markup ficam ocultos para o representante, mas o total considera todas as regras configuradas." })), _jsx("div", { style: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }, children: _jsx("button", { className: "action-button primary", onClick: handleAddToCart, style: {
                                        padding: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }, children: "Adicionar modelo ao carrinho" }) })] })] }), cart.length > 0 && (_jsxs("div", { style: { marginTop: '3rem', borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }, children: [_jsxs("h2", { style: { margin: 0 }, children: ["Carrinho de Modelos (", cart.length, ")"] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("button", { onClick: handleSaveQuote, style: {
                                            padding: '0.75rem 1.5rem',
                                            fontWeight: 'bold',
                                            backgroundColor: '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }, children: "Salvar Or\u00E7amento" }), _jsx("button", { onClick: generatePDF, style: {
                                            padding: '0.75rem 1.5rem',
                                            fontWeight: 'bold',
                                            backgroundColor: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }, children: "Gerar PDF" })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: cart.map((item, index) => (_jsxs("div", { style: {
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '1rem',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }, children: [_jsxs("div", { children: [_jsxs("h4", { style: { margin: '0 0 0.5rem 0', fontSize: '1.1rem' }, children: [index + 1, ". ", item.modelName, " ", _jsxs("span", { style: { fontSize: '0.9rem', fontWeight: 'normal', color: '#64748b' }, children: ["(", item.category, ")"] })] }), mode === 'internal' && (_jsxs("div", { style: { fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Tecido:" }), " ", item.fabricName] }), item.variantNames.length > 0 && _jsxs("div", { children: [_jsx("strong", { children: "Variantes:" }), " ", item.variantNames.join(', ')] }), item.attributeNames.length > 0 && _jsxs("div", { children: [_jsx("strong", { children: "Atributos:" }), " ", item.attributeNames.join(', ')] })] })), mode === 'rep' && (_jsx("div", { style: { fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }, children: _jsxs("div", { children: [_jsx("strong", { children: "Op\u00E7\u00F5es:" }), " ", [item.fabricName, ...item.variantNames, ...item.attributeNames].join(', ')] }) })), _jsxs("div", { style: { fontSize: '0.85rem', color: '#94a3b8' }, children: ["Cliente: ", item.clientTypeName] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("div", { style: { fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }, children: currency(item.finalPrice) }), _jsx("button", { onClick: () => handleRemoveFromCart(item.id), style: {
                                                color: '#ef4444',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                textDecoration: 'underline'
                                            }, children: "Remover" })] })] }, item.id))) }), _jsxs("div", { style: {
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'right',
                            border: '1px solid #e2e8f0'
                        }, children: [_jsx("span", { style: { fontSize: '1.1rem', marginRight: '1rem' }, children: "Total geral do carrinho:" }), _jsx("strong", { style: { fontSize: '1.5rem', color: '#0f172a' }, children: currency(cartTotal) })] })] }))] }));
}
