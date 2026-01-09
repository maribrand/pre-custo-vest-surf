import { getAllCustomerTypes, createCustomerType, } from './customerTypesService';
import { getAllProductModels, createProductModel, } from './productModelsService';
import { createFabric, } from './fabricsService';
import { createVariant, createAttribute, } from './optionsService';
import { initialClientTypes, initialProductModels, initialVariants, initialFabrics, initialAttributes, } from '../data/seed';
/**
 * Migra os dados iniciais do seed.ts para o banco de dados Supabase.
 * Só executa a migração se o banco estiver vazio (não há dados).
 */
export async function migrateSeedData() {
    try {
        // Verifica se já existem dados
        const existingClientTypes = await getAllCustomerTypes();
        const existingModels = await getAllProductModels();
        if (existingClientTypes.length > 0 || existingModels.length > 0) {
            return {
                migrated: false,
                message: 'Banco de dados já contém dados. Migração não executada.',
            };
        }
        // Migra tipos de cliente
        const clientTypeMap = new Map();
        for (const clientType of initialClientTypes) {
            const created = await createCustomerType({
                name: clientType.name,
                paymentCondition: clientType.paymentCondition,
                shippingMethod: clientType.shippingMethod,
                fixedValue: clientType.fixedValue,
                markup: clientType.markup,
            });
            clientTypeMap.set(clientType.id, created.id);
        }
        // Migra modelos de produto
        const modelMap = new Map();
        for (const model of initialProductModels) {
            const created = await createProductModel({
                category: model.category,
                name: model.name,
                baseCost: model.baseCost,
                fabricConsumption: model.fabricConsumption,
            });
            modelMap.set(model.id, created.id);
        }
        // Migra tecidos
        for (const fabric of initialFabrics) {
            const modelId = modelMap.get(fabric.modelId);
            if (modelId) {
                await createFabric({
                    name: fabric.name,
                    unitCost: fabric.unitCost,
                    imageUrl: fabric.imageUrl,
                }, modelId);
            }
        }
        // Migra variantes
        for (const variant of initialVariants) {
            const modelId = modelMap.get(variant.modelId);
            if (modelId) {
                await createVariant({
                    name: variant.name,
                    unitCost: variant.unitCost,
                    consumption: variant.consumption,
                    imageUrl: variant.imageUrl,
                }, modelId);
            }
        }
        // Migra atributos
        for (const attribute of initialAttributes) {
            const modelId = modelMap.get(attribute.modelId);
            if (modelId) {
                await createAttribute({
                    name: attribute.name,
                    consumption: attribute.consumption,
                    fixedCost: attribute.fixedCost,
                    imageUrl: attribute.imageUrl,
                }, modelId);
            }
        }
        return {
            migrated: true,
            message: 'Dados iniciais migrados com sucesso!',
        };
    }
    catch (error) {
        console.error('Erro ao migrar dados iniciais:', error);
        return {
            migrated: false,
            message: `Erro ao migrar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        };
    }
}
