import { supabase } from './supabase';
import type { ClientType, ProductModel, Fabric, ModelVariant, ModelAttribute } from '../types/catalog';
import { getProductModelById } from './productModelsService';
import { getFabricsByModel } from './fabricsService';
import { getVariantsByModel, getAttributesByModel } from './optionsService';
import { getCustomerTypeById } from './customerTypesService';

export interface Quote {
  id: string;
  customerName: string;
  customerTypeId: string | null;
  status: 'open' | 'sent' | 'approved' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  modelId: string | null;
  fabricId: string | null;
  quantity: number;
  // Snapshots
  modelNameSnapshot: string;
  fabricNameSnapshot: string;
  baseCostSnapshot: number;
  fabricCostSnapshot: number;
  fabricConsumptionMSnapshot: number;
  optionsCostSnapshot: number;
  subtotalSnapshot: number;
  fixedFeeSnapshot: number;
  markupPctSnapshot: number;
  finalPriceSnapshot: number;
}

export interface QuoteItemOption {
  id: string;
  quoteItemId: string;
  optionId: string | null;
  optionType: 'variant' | 'attribute' | null;
  optionNameSnapshot: string;
  unitCostSnapshot: number;
  consumptionMSnapshot: number;
  totalCostSnapshot: number;
}

interface CartItemInput {
  modelId: string;
  fabricId?: string;
  variantIds: string[];
  attributeIds: string[];
  quantity: number;
  clientTypeId: string;
  clientName: string;
}

// Calcula todos os snapshots para um item do carrinho
async function calculateSnapshots(
  modelId: string,
  fabricId: string | undefined,
  variantIds: string[],
  attributeIds: string[],
  clientTypeId: string
): Promise<{
  modelName: string;
  fabricName: string;
  baseCost: number;
  fabricCost: number;
  fabricConsumptionM: number;
  optionsCost: number;
  subtotal: number;
  fixedFee: number;
  markupPct: number;
  finalPrice: number;
  options: Array<{
    optionId: string;
    optionType: 'variant' | 'attribute';
    optionName: string;
    unitCost: number;
    consumptionM: number;
    totalCost: number;
  }>;
}> {
  // Busca o modelo
  const model = await getProductModelById(modelId);
  if (!model) throw new Error(`Modelo não encontrado: ${modelId}`);

  // Busca o tipo de cliente
  const clientType = await getCustomerTypeById(clientTypeId);
  if (!clientType) throw new Error(`Tipo de cliente não encontrado: ${clientTypeId}`);

  // Busca o tecido se fornecido
  let fabric: Fabric | undefined;
  if (fabricId) {
    const fabrics = await getFabricsByModel(modelId);
    fabric = fabrics.find(f => f.id === fabricId);
  }

  // Busca variantes e atributos
  const allVariants = await getVariantsByModel(modelId);
  const allAttributes = await getAttributesByModel(modelId);
  
  const selectedVariants = allVariants.filter(v => variantIds.includes(v.id));
  const selectedAttributes = allAttributes.filter(a => attributeIds.includes(a.id));

  // Calcula valores
  const baseCost = model.baseCost;
  const baseConsumption = model.fabricConsumption;
  const attributesConsumption = selectedAttributes.reduce((acc, attr) => acc + attr.consumption, 0);
  const attributesFixedCost = selectedAttributes.reduce((acc, attr) => acc + (attr.fixedCost || 0), 0);
  const totalConsumption = baseConsumption + attributesConsumption;
  const fabricUnitCost = fabric?.unitCost || 0;
  const fabricCost = totalConsumption * fabricUnitCost;
  const variantsTotal = selectedVariants.reduce((total, variant) => total + variant.totalValue, 0);
  const fixedFee = clientType.fixedValue;
  const subtotal = baseCost + fabricCost + variantsTotal + attributesFixedCost + fixedFee;
  const markupPct = clientType.markup;
  const finalPrice = subtotal * (1 + markupPct / 100);

  // Prepara opções para snapshot
  const options = [
    ...selectedVariants.map(v => ({
      optionId: v.id,
      optionType: 'variant' as const,
      optionName: v.name,
      unitCost: v.unitCost,
      consumptionM: v.consumption,
      totalCost: v.totalValue,
    })),
    ...selectedAttributes.map(a => ({
      optionId: a.id,
      optionType: 'attribute' as const,
      optionName: a.name,
      unitCost: a.fixedCost,
      consumptionM: a.consumption,
      totalCost: a.fixedCost,
    })),
  ];

  return {
    modelName: model.name,
    fabricName: fabric?.name || 'N/A',
    baseCost,
    fabricCost,
    fabricConsumptionM: totalConsumption,
    optionsCost: variantsTotal + attributesFixedCost,
    subtotal,
    fixedFee,
    markupPct,
    finalPrice,
    options,
  };
}

// Cria um quote com itens
export async function createQuote(items: CartItemInput[]): Promise<Quote> {
  if (items.length === 0) throw new Error('Carrinho vazio');

  const firstItem = items[0];
  const customerName = firstItem.clientName;
  const customerTypeId = firstItem.clientTypeId;

  // Cria o quote
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      customer_name: customerName,
      customer_type_id: customerTypeId,
      status: 'open',
    })
    .select()
    .single();

  if (quoteError) throw quoteError;

  // Cria os itens com snapshots
  for (const item of items) {
    const snapshots = await calculateSnapshots(
      item.modelId,
      item.fabricId,
      item.variantIds,
      item.attributeIds,
      item.clientTypeId
    );

    // Cria o quote_item
    const { data: quoteItem, error: itemError } = await supabase
      .from('quote_items')
      .insert({
        quote_id: quote.id,
        model_id: item.modelId,
        fabric_id: item.fabricId || null,
        quantity: item.quantity,
        model_name_snapshot: snapshots.modelName,
        fabric_name_snapshot: snapshots.fabricName,
        base_cost_snapshot: snapshots.baseCost,
        fabric_cost_snapshot: snapshots.fabricCost,
        fabric_consumption_m_snapshot: snapshots.fabricConsumptionM,
        options_cost_snapshot: snapshots.optionsCost,
        subtotal_snapshot: snapshots.subtotal,
        fixed_fee_snapshot: snapshots.fixedFee,
        markup_pct_snapshot: snapshots.markupPct,
        final_price_snapshot: snapshots.finalPrice,
      })
      .select()
      .single();

    if (itemError) throw itemError;

    // Cria as opções do item
    if (snapshots.options.length > 0) {
      const optionsData = snapshots.options.map(opt => ({
        quote_item_id: quoteItem.id,
        option_id: opt.optionId,
        option_type: opt.optionType,
        option_name_snapshot: opt.optionName,
        unit_cost_snapshot: opt.unitCost,
        consumption_m_snapshot: opt.consumptionM,
        total_cost_snapshot: opt.totalCost,
      }));

      const { error: optionsError } = await supabase
        .from('quote_item_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;
    }
  }

  return {
    id: quote.id,
    customerName: quote.customer_name,
    customerTypeId: quote.customer_type_id,
    status: quote.status as Quote['status'],
    createdAt: new Date(quote.created_at),
    updatedAt: new Date(quote.updated_at),
  };
}

// Busca todos os quotes
export async function getAllQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    customerName: row.customer_name,
    customerTypeId: row.customer_type_id,
    status: row.status as Quote['status'],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

// Busca um quote com seus itens
export async function getQuoteById(id: string): Promise<{
  quote: Quote;
  items: QuoteItem[];
  itemOptions: QuoteItemOption[];
}> {
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (quoteError) throw quoteError;

  const { data: items, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', id)
    .order('created_at');

  if (itemsError) throw itemsError;

  const itemIds = (items || []).map(item => item.id);
  const { data: options, error: optionsError } = await supabase
    .from('quote_item_options')
    .select('*')
    .in('quote_item_id', itemIds);

  if (optionsError) throw optionsError;

  return {
    quote: {
      id: quote.id,
      customerName: quote.customer_name,
      customerTypeId: quote.customer_type_id,
      status: quote.status as Quote['status'],
      createdAt: new Date(quote.created_at),
      updatedAt: new Date(quote.updated_at),
    },
    items: (items || []).map(item => ({
      id: item.id,
      quoteId: item.quote_id,
      modelId: item.model_id,
      fabricId: item.fabric_id,
      quantity: item.quantity,
      modelNameSnapshot: item.model_name_snapshot,
      fabricNameSnapshot: item.fabric_name_snapshot,
      baseCostSnapshot: Number(item.base_cost_snapshot),
      fabricCostSnapshot: Number(item.fabric_cost_snapshot),
      fabricConsumptionMSnapshot: Number(item.fabric_consumption_m_snapshot),
      optionsCostSnapshot: Number(item.options_cost_snapshot),
      subtotalSnapshot: Number(item.subtotal_snapshot),
      fixedFeeSnapshot: Number(item.fixed_fee_snapshot),
      markupPctSnapshot: Number(item.markup_pct_snapshot),
      finalPriceSnapshot: Number(item.final_price_snapshot),
    })),
    itemOptions: (options || []).map(opt => ({
      id: opt.id,
      quoteItemId: opt.quote_item_id,
      optionId: opt.option_id,
      optionType: opt.option_type as 'variant' | 'attribute' | null,
      optionNameSnapshot: opt.option_name_snapshot,
      unitCostSnapshot: Number(opt.unit_cost_snapshot),
      consumptionMSnapshot: Number(opt.consumption_m_snapshot),
      totalCostSnapshot: Number(opt.total_cost_snapshot),
    })),
  };
}

// Atualiza status do quote
export async function updateQuoteStatus(
  id: string,
  status: Quote['status']
): Promise<void> {
  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// Deleta um quote (cascade deleta itens e opções)
export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

