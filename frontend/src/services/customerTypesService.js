import { supabase } from './supabase';
// Mapeia do banco para o tipo do frontend
function mapFromDb(row) {
    return {
        id: row.id,
        name: row.name,
        paymentCondition: row.payment_terms || '',
        shippingMethod: row.shipping_method || '',
        fixedValue: Number(row.fixed_fee) || 0,
        markup: Number(row.markup_pct) || 0,
    };
}
// Mapeia do tipo do frontend para o banco
function mapToDb(data) {
    return {
        name: data.name,
        payment_terms: data.paymentCondition,
        shipping_method: data.shippingMethod,
        fixed_fee: data.fixedValue,
        markup_pct: data.markup,
        is_active: true,
    };
}
export async function getAllCustomerTypes() {
    const { data, error } = await supabase
        .from('customer_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
    if (error)
        throw error;
    return (data || []).map(mapFromDb);
}
export async function getCustomerTypeById(id) {
    const { data, error } = await supabase
        .from('customer_types')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null; // Not found
        throw error;
    }
    return data ? mapFromDb(data) : null;
}
export async function createCustomerType(data) {
    const { data: inserted, error } = await supabase
        .from('customer_types')
        .insert(mapToDb(data))
        .select()
        .single();
    if (error)
        throw error;
    return mapFromDb(inserted);
}
export async function updateCustomerType(id, data) {
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.paymentCondition !== undefined)
        updateData.payment_terms = data.paymentCondition;
    if (data.shippingMethod !== undefined)
        updateData.shipping_method = data.shippingMethod;
    if (data.fixedValue !== undefined)
        updateData.fixed_fee = data.fixedValue;
    if (data.markup !== undefined)
        updateData.markup_pct = data.markup;
    const { data: updated, error } = await supabase
        .from('customer_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return mapFromDb(updated);
}
export async function deleteCustomerType(id) {
    // Soft delete - marca como inativo
    const { error } = await supabase
        .from('customer_types')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
}
