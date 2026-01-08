import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import type { ClientType, ProductModel, ModelVariant, Fabric, ModelAttribute } from '../../types/catalog';
import { SelectionCard } from '../common/SelectionCard';
import { createQuote } from '../../services/quotesService';
import './SellerLayout.css';

type SimulatorMode = 'internal' | 'rep';

interface SellerLayoutProps {
  clientTypes: ClientType[];
  models: ProductModel[];
  variations: ModelVariant[];
  attributes: ModelAttribute[];
  fabrics: Fabric[];
  mode: SimulatorMode;
}

interface CartItem {
  id: string; // unique ID for the cart item
  modelName: string;
  category: string;
  fabricName: string;
  variantNames: string[];
  attributeNames: string[];
  finalPrice: number;
  clientTypeName: string;
  timestamp: Date;
}

export function SellerLayout({ clientTypes, models, variations, attributes, fabrics, mode }: SellerLayoutProps) {
  const [selectedClientType, setSelectedClientType] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  const currentModel = useMemo(() => models.find((model) => model.id === selectedModel), [models, selectedModel]);

  const currentClientType = useMemo(
    () => clientTypes.find((client) => client.id === selectedClientType),
    [clientTypes, selectedClientType]
  );

  const availableVariations = useMemo(
    () => variations.filter((variation) => variation.modelId === selectedModel),
    [variations, selectedModel]
  );

  const availableAttributes = useMemo(
    () => attributes.filter((attr) => attr.modelId === selectedModel),
    [attributes, selectedModel]
  );

  const availableFabrics = useMemo(
    () => fabrics.filter((fabric) => fabric.modelId === selectedModel),
    [fabrics, selectedModel]
  );

  const currentFabric = useMemo(
    () => availableFabrics.find((f) => f.id === selectedFabricId),
    [availableFabrics, selectedFabricId]
  );

  const additions = useMemo(() => {
    return selectedVariations
      .map((variationId) => availableVariations.find((variation) => variation.id === variationId))
      .filter((variation): variation is ModelVariant => Boolean(variation));
  }, [selectedVariations, availableVariations]);

  const selectedAttributesList = useMemo(() => {
    return selectedAttributes
      .map((attrId) => availableAttributes.find((attr) => attr.id === attrId))
      .filter((attr): attr is ModelAttribute => Boolean(attr));
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

  function toggleVariation(id: string) {
    setSelectedVariations((prev) => (prev.includes(id) ? prev.filter((variationId) => variationId !== id) : [...prev, id]));
  }

  function toggleAttribute(id: string) {
    setSelectedAttributes((prev) => (prev.includes(id) ? prev.filter((attrId) => attrId !== id) : [...prev, id]));
  }

  const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

    const newItem: CartItem = {
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
        if (!model) throw new Error(`Modelo não encontrado: ${item.modelName}`);

        // Encontra o tecido pelo nome
        const fabric = fabrics.find(f => f.name === item.fabricName && f.modelId === model.id);
        
        // Encontra variantes e atributos pelos nomes
        const variantIds = item.variantNames
          .map(name => {
            const variant = variations.find(v => v.name === name && v.modelId === model.id);
            return variant?.id;
          })
          .filter((id): id is string => Boolean(id));

        const attributeIds = item.attributeNames
          .map(name => {
            const attribute = attributes.find(a => a.name === name && a.modelId === model.id);
            return attribute?.id;
          })
          .filter((id): id is string => Boolean(id));

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
    } catch (error) {
      alert(`Erro ao salvar orçamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleRemoveFromCart = (id: string) => {
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

  return (
    <section>
      <h2>{mode === 'internal' ? 'PCP – Simulador completo' : 'Representante – Simulador simplificado'}</h2>
      <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
        Escolha o perfil do cliente, selecione um modelo base e monte o produto com as variações desejadas. O cálculo é
        sempre atualizado automaticamente – apenas a visualização muda conforme o perfil.
      </p>

      {showSuccessMessage && (
        <div style={{
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #bbf7d0'
        }}>
          {showSuccessMessage}
        </div>
      )}

      <div className="seller-grid">
        <div className="seller-panel">
          <h3>Configurações iniciais</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Nome do cliente
              <input
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Ex: Marca X, Loja Y"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  marginBottom: '1rem'
                }}
              />
            </label>
            <label>
              Tipo de cliente
              <select value={selectedClientType} onChange={(event) => setSelectedClientType(event.target.value)}>
                <option value="">Selecione</option>
                {clientTypes.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modelo de produto
              <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
                <option value="">Selecione</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — base {currency(model.baseCost)}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </div>

        <div className="seller-panel">
          <h3>Tecidos disponíveis</h3>
          {!currentModel && <p className="placeholder">Selecione um modelo para visualizar os tecidos.</p>}
          {currentModel && availableFabrics.length === 0 && (
            <p className="placeholder">Nenhum tecido cadastrado para este modelo.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {availableFabrics.map((fabric) => (
              <SelectionCard
                key={fabric.id}
                title={fabric.name}
                imageUrl={fabric.imageUrl}
                price={showAdditionValues ? currency(fabric.totalCost) : undefined}
                selected={fabric.id === selectedFabricId}
                onClick={() => setSelectedFabricId(fabric.id)}
              />
            ))}
          </div>
        </div>

        <div className="seller-panel">
          <h3>Variantes disponíveis</h3>
          {!currentModel && <p className="placeholder">Selecione um modelo para liberar as variantes vinculadas.</p>}
          {currentModel && availableVariations.length === 0 && (
            <p className="placeholder">Nenhuma variante cadastrada para este modelo.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {currentModel &&
              availableVariations.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.name}
                  imageUrl={option.imageUrl}
                  price={showAdditionValues ? currency(option.totalValue) : undefined}
                  selected={selectedVariations.includes(option.id)}
                  onClick={() => toggleVariation(option.id)}
                />
              ))}
          </div>
        </div>

        <div className="seller-panel">
          <h3>Atributos por modelo</h3>
          {!currentModel && <p className="placeholder">Selecione um modelo para liberar os atributos.</p>}
          {currentModel && availableAttributes.length === 0 && (
            <p className="placeholder">Nenhum atributo cadastrado para este modelo.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {currentModel &&
              availableAttributes.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.name}
                  imageUrl={option.imageUrl}
                  price={showAdditionValues ? `+${option.consumption}m` : undefined}
                  selected={selectedAttributes.includes(option.id)}
                  onClick={() => toggleAttribute(option.id)}
                />
              ))}
          </div>
        </div>

        <div className="price-highlight">
          {showAdditionValues && (
            <>
              <span>Preço base</span>
              <strong>{currency(basePrice)}</strong>
              <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />

              <span>Tecido selecionado</span>
              {currentFabric ? (
                <div>
                  {currentFabric.name}: {currency(fabricCost)}
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    ({currentFabric.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m x {totalConsumption.toFixed(2)}m)
                  </div>
                </div>
              ) : (
                <div style={{ fontStyle: 'italic', opacity: 0.7 }}>Nenhum tecido selecionado</div>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />

              <span>Adicionais selecionados</span>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {additions.length === 0 && <li>Nenhuma variação aplicada</li>}
                {additions.map((variation) => (
                  <li key={variation.id}>
                    {variation.name}: {currency(variation.totalValue)}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>
                Subtotal (base + tecido + adicionais): {currency(basePrice + fabricCost + additionsTotal)}
              </div>

              {currentClientType && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />
                  <span>Valor fixo do cliente</span>
                  <strong>{currency(fixedValue)}</strong>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Subtotal com valor fixo: {currency(subtotal)}
                  </div>
                  {markup > 0 && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />
                      <span>Markup ({markup.toFixed(1)}%)</span>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Aplicado sobre: {currency(subtotal)}
                      </div>
                    </>
                  )}
                </>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />
            </>
          )}
          {!showAdditionValues && (
            <>
              {currentModel && (
                <>
                  <span>Preço base</span>
                  <strong>{currency(basePrice)}</strong>
                  <hr style={{ border: 'none', borderTop: '1px solid rgb(255 255 255 / 35%)', width: '100%' }} />
                </>
              )}
            </>
          )}
          <span>Preço estimado final</span>
          <strong>{currency(estimatedPrice)}</strong>
          {mode === 'rep' && (
            <small style={{ opacity: 0.85, display: 'block', marginTop: '0.5rem' }}>
              O detalhe dos adicionais, valor fixo e markup ficam ocultos para o representante, mas o total considera
              todas as regras configuradas.
            </small>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="action-button primary"
              onClick={handleAddToCart}
              style={{
                padding: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Adicionar modelo ao carrinho
            </button>
          </div>
        </div>
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div style={{ marginTop: '3rem', borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Carrinho de Modelos ({cart.length})</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSaveQuote}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Salvar Orçamento
              </button>
              <button
                onClick={generatePDF}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Gerar PDF
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item, index) => (
              <div key={item.id} style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{index + 1}. {item.modelName} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#64748b' }}>({item.category})</span></h4>

                  {mode === 'internal' && (
                    <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                      <div><strong>Tecido:</strong> {item.fabricName}</div>
                      {item.variantNames.length > 0 && <div><strong>Variantes:</strong> {item.variantNames.join(', ')}</div>}
                      {item.attributeNames.length > 0 && <div><strong>Atributos:</strong> {item.attributeNames.join(', ')}</div>}
                    </div>
                  )}

                  {mode === 'rep' && (
                    <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                      <div><strong>Opções:</strong> {[item.fabricName, ...item.variantNames, ...item.attributeNames].join(', ')}</div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Cliente: {item.clientTypeName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
                    {currency(item.finalPrice)}
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'right',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '1.1rem', marginRight: '1rem' }}>Total geral do carrinho:</span>
            <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>{currency(cartTotal)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}
