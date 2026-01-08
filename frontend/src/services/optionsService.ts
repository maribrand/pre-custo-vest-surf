import { supabase } from './supabase';
import type { ModelVariant, ModelAttribute } from '../types/catalog';

type OptionType = 'variant' | 'attribute';

// Mapeia variant do banco para o tipo do frontend
async function mapVariantFromDb(row: any, modelId: string): Promise<ModelVariant> {
  const unitCost = Number(row.unit_cost_override || row.default_unit_cost) || 0;
  const consumption = Number(row.consumption_m_override || row.default_consumption_m) || 0;
  const totalValue = unitCost * consumption;

  return {
    id: row.option_id || row.id,
    modelId,
    name: row.option_name || row.name,
    unitCost,
    consumption,
    totalValue,
    imageUrl: row.image_url || undefined,
  };
}

// Mapeia attribute do banco para o tipo do frontend
async function mapAttributeFromDb(row: any, modelId: string): Promise<ModelAttribute> {
  const consumption = Number(row.consumption_m_override || row.default_consumption_m) || 0;
  const fixedCost = Number(row.unit_cost_override || row.default_unit_cost) || 0;

  return {
    id: row.option_id || row.id,
    modelId,
    name: row.option_name || row.name,
    consumption,
    fixedCost,
    imageUrl: row.image_url || undefined,
  };
}

// Busca variantes de um modelo
export async function getVariantsByModel(modelId: string): Promise<ModelVariant[]> {
  const { data, error } = await supabase
    .from('model_options')
    .select(`
      option_id,
      unit_cost_override,
      consumption_m_override,
      options!inner (
        id,
        name,
        type,
        default_unit_cost,
        default_consumption_m,
        image_url
      )
    `)
    .eq('model_id', modelId)
    .eq('is_active', true)
    .eq('options.type', 'variant');

  if (error) throw error;

  return Promise.all(
    (data || []).map(row => {
      const option = row.options as any;
      return mapVariantFromDb({
        option_id: row.option_id,
        option_name: option.name,
        unit_cost_override: row.unit_cost_override,
        consumption_m_override: row.consumption_m_override,
        default_unit_cost: option.default_unit_cost,
        default_consumption_m: option.default_consumption_m,
        image_url: option.image_url,
      }, modelId);
    })
  );
}

// Busca atributos de um modelo
export async function getAttributesByModel(modelId: string): Promise<ModelAttribute[]> {
  const { data, error } = await supabase
    .from('model_options')
    .select(`
      option_id,
      unit_cost_override,
      consumption_m_override,
      options!inner (
        id,
        name,
        type,
        default_unit_cost,
        default_consumption_m,
        image_url
      )
    `)
    .eq('model_id', modelId)
    .eq('is_active', true)
    .eq('options.type', 'attribute');

  if (error) throw error;

  return Promise.all(
    (data || []).map(row => {
      const option = row.options as any;
      return mapAttributeFromDb({
        option_id: row.option_id,
        option_name: option.name,
        unit_cost_override: row.unit_cost_override,
        consumption_m_override: row.consumption_m_override,
        default_unit_cost: option.default_unit_cost,
        default_consumption_m: option.default_consumption_m,
        image_url: option.image_url,
      }, modelId);
    })
  );
}

// Cria uma variante (option + model_option)
export async function createVariant(
  data: Omit<ModelVariant, 'id' | 'totalValue'>,
  modelId: string
): Promise<ModelVariant> {
  // Verifica se a option já existe
  const { data: existing } = await supabase
    .from('options')
    .select('*')
    .eq('name', data.name)
    .eq('type', 'variant')
    .eq('is_active', true)
    .single();

  let optionId: string;

  if (existing) {
    optionId = existing.id;
  } else {
    // Cria nova option
    const { data: inserted, error } = await supabase
      .from('options')
      .insert({
        name: data.name,
        type: 'variant',
        default_unit_cost: data.unitCost,
        default_consumption_m: data.consumption,
        image_url: data.imageUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    optionId = inserted.id;
  }

  // Associa ao modelo
  const { error: assocError } = await supabase
    .from('model_options')
    .upsert({
      model_id: modelId,
      option_id: optionId,
      unit_cost_override: data.unitCost,
      consumption_m_override: data.consumption,
      is_active: true,
    }, {
      onConflict: 'model_id,option_id',
    });

  if (assocError) throw assocError;

  // Retorna a variante criada
  const variants = await getVariantsByModel(modelId);
  return variants.find(v => v.name === data.name)!;
}

// Cria um atributo (option + model_option)
export async function createAttribute(
  data: Omit<ModelAttribute, 'id'>,
  modelId: string
): Promise<ModelAttribute> {
  // Verifica se a option já existe
  const { data: existing } = await supabase
    .from('options')
    .select('*')
    .eq('name', data.name)
    .eq('type', 'attribute')
    .eq('is_active', true)
    .single();

  let optionId: string;

  if (existing) {
    optionId = existing.id;
  } else {
    // Cria nova option
    const { data: inserted, error } = await supabase
      .from('options')
      .insert({
        name: data.name,
        type: 'attribute',
        default_unit_cost: data.fixedCost,
        default_consumption_m: data.consumption,
        image_url: data.imageUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    optionId = inserted.id;
  }

  // Associa ao modelo
  const { error: assocError } = await supabase
    .from('model_options')
    .upsert({
      model_id: modelId,
      option_id: optionId,
      unit_cost_override: data.fixedCost,
      consumption_m_override: data.consumption,
      is_active: true,
    }, {
      onConflict: 'model_id,option_id',
    });

  if (assocError) throw assocError;

  // Retorna o atributo criado
  const attributes = await getAttributesByModel(modelId);
  return attributes.find(a => a.name === data.name)!;
}

// Atualiza uma variante
export async function updateVariant(
  id: string,
  data: Partial<Omit<ModelVariant, 'id' | 'modelId' | 'totalValue'>>,
  modelId: string
): Promise<ModelVariant> {
  // Atualiza a option global se necessário
  if (data.name !== undefined) {
    const { error: optionError } = await supabase
      .from('options')
      .update({ name: data.name })
      .eq('id', id);

    if (optionError) throw optionError;
  }

  // Atualiza a associação model_option
  const updateData: any = {};
  if (data.unitCost !== undefined) updateData.unit_cost_override = data.unitCost;
  if (data.consumption !== undefined) updateData.consumption_m_override = data.consumption;
  if (data.imageUrl !== undefined) {
    const { error: imgError } = await supabase
      .from('options')
      .update({ image_url: data.imageUrl || null })
      .eq('id', id);
    if (imgError) throw imgError;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('model_options')
      .update(updateData)
      .eq('option_id', id)
      .eq('model_id', modelId);

    if (error) throw error;
  }

  const variants = await getVariantsByModel(modelId);
  return variants.find(v => v.id === id)!;
}

// Atualiza um atributo
export async function updateAttribute(
  id: string,
  data: Partial<Omit<ModelAttribute, 'id' | 'modelId'>>,
  modelId: string
): Promise<ModelAttribute> {
  // Atualiza a option global se necessário
  if (data.name !== undefined) {
    const { error: optionError } = await supabase
      .from('options')
      .update({ name: data.name })
      .eq('id', id);

    if (optionError) throw optionError;
  }

  // Atualiza a associação model_option
  const updateData: any = {};
  if (data.fixedCost !== undefined) updateData.unit_cost_override = data.fixedCost;
  if (data.consumption !== undefined) updateData.consumption_m_override = data.consumption;
  if (data.imageUrl !== undefined) {
    const { error: imgError } = await supabase
      .from('options')
      .update({ image_url: data.imageUrl || null })
      .eq('id', id);
    if (imgError) throw imgError;
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('model_options')
      .update(updateData)
      .eq('option_id', id)
      .eq('model_id', modelId);

    if (error) throw error;
  }

  const attributes = await getAttributesByModel(modelId);
  return attributes.find(a => a.id === id)!;
}

// Remove variante de um modelo
export async function deleteVariantFromModel(variantId: string, modelId: string): Promise<void> {
  const { error } = await supabase
    .from('model_options')
    .update({ is_active: false })
    .eq('option_id', variantId)
    .eq('model_id', modelId);

  if (error) throw error;
}

// Remove atributo de um modelo
export async function deleteAttributeFromModel(attributeId: string, modelId: string): Promise<void> {
  const { error } = await supabase
    .from('model_options')
    .update({ is_active: false })
    .eq('option_id', attributeId)
    .eq('model_id', modelId);

  if (error) throw error;
}

