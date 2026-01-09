import { supabase } from './supabase';
import { getProductModelById } from './productModelsService';
// Mapeia do banco para o tipo do frontend
// Como no frontend Fabric tem modelId, precisamos buscar os modelos associados
async function mapFromDb(row, modelId) {
    // Se modelId foi fornecido, calcula o totalCost baseado no consumo do modelo
    let totalCost = 0;
    if (modelId) {
        const model = await getProductModelById(modelId);
        if (model) {
            totalCost = Number(row.cost_per_meter) * model.fabricConsumption;
        }
    }
    return {
        id: row.id,
        modelId: modelId || '', // Será preenchido quando buscar por modelo
        name: row.name,
        unitCost: Number(row.cost_per_meter) || 0,
        totalCost,
        imageUrl: row.image_url || undefined,
    };
}
// Busca tecidos associados a um modelo específico
export async function getFabricsByModel(modelId) {
    // Busca as associações model_fabrics
    const { data: associations, error: assocError } = await supabase
        .from('model_fabrics')
        .select('fabric_id, consumption_m')
        .eq('model_id', modelId)
        .eq('is_active', true);
    if (assocError)
        throw assocError;
    if (!associations || associations.length === 0)
        return [];
    // Busca os tecidos
    const fabricIds = associations.map(a => a.fabric_id);
    const { data: fabrics, error: fabricsError } = await supabase
        .from('fabrics')
        .select('*')
        .in('id', fabricIds)
        .eq('is_active', true);
    if (fabricsError)
        throw fabricsError;
    // Busca o modelo para calcular totalCost
    const model = await getProductModelById(modelId);
    const baseConsumption = model?.fabricConsumption || 0;
    // Mapeia os tecidos com consumo específico se houver
    const mappedFabrics = await Promise.all((fabrics || []).map(async (fabric) => {
        const association = associations.find(a => a.fabric_id === fabric.id);
        const consumption = association?.consumption_m
            ? Number(association.consumption_m)
            : baseConsumption;
        return {
            id: fabric.id,
            modelId,
            name: fabric.name,
            unitCost: Number(fabric.cost_per_meter) || 0,
            totalCost: Number(fabric.cost_per_meter) * consumption,
            imageUrl: fabric.image_url || undefined,
        };
    }));
    return mappedFabrics;
}
// Busca todos os tecidos (globais)
export async function getAllFabrics() {
    const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .eq('is_active', true)
        .order('name');
    if (error)
        throw error;
    return Promise.all((data || []).map(row => mapFromDb(row)));
}
// Cria um tecido global e associa a um modelo
export async function createFabric(data, modelId) {
    // Verifica se o tecido já existe (por nome)
    const { data: existing } = await supabase
        .from('fabrics')
        .select('*')
        .eq('name', data.name)
        .eq('is_active', true)
        .single();
    let fabricId;
    if (existing) {
        // Usa o tecido existente
        fabricId = existing.id;
    }
    else {
        // Cria novo tecido
        const { data: inserted, error } = await supabase
            .from('fabrics')
            .insert({
            name: data.name,
            cost_per_meter: data.unitCost,
            image_url: data.imageUrl || null,
            is_active: true,
        })
            .select()
            .single();
        if (error)
            throw error;
        fabricId = inserted.id;
    }
    // Associa o tecido ao modelo (ou atualiza se já existir)
    const model = await getProductModelById(modelId);
    const consumption = model?.fabricConsumption || 0;
    const { error: assocError } = await supabase
        .from('model_fabrics')
        .upsert({
        model_id: modelId,
        fabric_id: fabricId,
        consumption_m: consumption, // Usa o consumo padrão do modelo
        is_active: true,
    }, {
        onConflict: 'model_id,fabric_id',
    });
    if (assocError)
        throw assocError;
    // Retorna o tecido com modelId e totalCost calculado
    return getFabricsByModel(modelId).then(fabrics => fabrics.find(f => f.id === fabricId));
}
// Atualiza um tecido (global)
export async function updateFabric(id, data) {
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.unitCost !== undefined)
        updateData.cost_per_meter = data.unitCost;
    if (data.imageUrl !== undefined)
        updateData.image_url = data.imageUrl || null;
    const { data: updated, error } = await supabase
        .from('fabrics')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return mapFromDb(updated);
}
// Remove associação de tecido com modelo (não deleta o tecido global)
export async function deleteFabricFromModel(fabricId, modelId) {
    const { error } = await supabase
        .from('model_fabrics')
        .update({ is_active: false })
        .eq('fabric_id', fabricId)
        .eq('model_id', modelId);
    if (error)
        throw error;
}
// Deleta tecido globalmente (soft delete)
export async function deleteFabric(id) {
    const { error } = await supabase
        .from('fabrics')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
}
