import { supabase } from './supabase';
import { getOrCreateCategory } from './productCategoriesService';
// Mapeia do banco para o tipo do frontend
async function mapFromDb(row) {
    let categoryName = '';
    if (row.category_id) {
        const { data: category } = await supabase
            .from('product_categories')
            .select('name')
            .eq('id', row.category_id)
            .single();
        categoryName = category?.name || '';
    }
    return {
        id: row.id,
        category: categoryName,
        name: row.name,
        baseCost: Number(row.base_cost) || 0,
        fabricConsumption: Number(row.base_fabric_consumption_m) || 0,
    };
}
// Mapeia do tipo do frontend para o banco
async function mapToDb(data) {
    // Busca ou cria a categoria
    const category = await getOrCreateCategory(data.category);
    return {
        category_id: category.id,
        name: data.name,
        base_cost: data.baseCost,
        base_fabric_consumption_m: data.fabricConsumption,
        is_active: true,
    };
}
export async function getAllProductModels() {
    const { data, error } = await supabase
        .from('product_models')
        .select('*')
        .eq('is_active', true)
        .order('name');
    if (error)
        throw error;
    // Mapeia todos os modelos
    const models = await Promise.all((data || []).map(mapFromDb));
    return models;
}
export async function getProductModelById(id) {
    const { data, error } = await supabase
        .from('product_models')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null;
        throw error;
    }
    return data ? await mapFromDb(data) : null;
}
export async function createProductModel(data) {
    const dbData = await mapToDb(data);
    const { data: inserted, error } = await supabase
        .from('product_models')
        .insert(dbData)
        .select()
        .single();
    if (error)
        throw error;
    return await mapFromDb(inserted);
}
export async function updateProductModel(id, data) {
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.baseCost !== undefined)
        updateData.base_cost = data.baseCost;
    if (data.fabricConsumption !== undefined)
        updateData.base_fabric_consumption_m = data.fabricConsumption;
    // Se a categoria mudou, precisa buscar/criar a nova categoria
    if (data.category !== undefined) {
        const category = await getOrCreateCategory(data.category);
        updateData.category_id = category.id;
    }
    const { data: updated, error } = await supabase
        .from('product_models')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return await mapFromDb(updated);
}
export async function deleteProductModel(id) {
    // Soft delete
    const { error } = await supabase
        .from('product_models')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
}
