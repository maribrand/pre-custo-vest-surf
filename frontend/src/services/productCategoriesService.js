import { supabase } from './supabase';
// Mapeia do banco para o tipo do frontend
function mapFromDb(row) {
    return {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
    };
}
export async function getAllCategories() {
    const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
    if (error)
        throw error;
    return (data || []).map(mapFromDb);
}
export async function getCategoryById(id) {
    const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null;
        throw error;
    }
    return data ? mapFromDb(data) : null;
}
export async function getCategoryByName(name) {
    const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null;
        throw error;
    }
    return data ? mapFromDb(data) : null;
}
export async function createCategory(name) {
    const { data: inserted, error } = await supabase
        .from('product_categories')
        .insert({ name, is_active: true })
        .select()
        .single();
    if (error)
        throw error;
    return mapFromDb(inserted);
}
export async function getOrCreateCategory(name) {
    // Tenta buscar primeiro
    const existing = await getCategoryByName(name);
    if (existing)
        return existing;
    // Se não existe, cria
    return createCategory(name);
}
export async function updateCategory(id, name) {
    const { data: updated, error } = await supabase
        .from('product_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return mapFromDb(updated);
}
export async function deleteCategory(id) {
    // Soft delete
    const { error } = await supabase
        .from('product_categories')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
}
