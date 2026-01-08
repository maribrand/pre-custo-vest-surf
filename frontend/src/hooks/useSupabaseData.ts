import { useState, useEffect } from 'react';
import type { ClientType, ProductModel, ModelVariant, ModelAttribute, Fabric } from '../types/catalog';
import {
  getAllCustomerTypes,
} from '../services/customerTypesService';
import {
  getAllProductModels,
} from '../services/productModelsService';
import {
  getFabricsByModel,
} from '../services/fabricsService';
import {
  getVariantsByModel,
  getAttributesByModel,
} from '../services/optionsService';
import { migrateSeedData } from '../services/migrateSeedData';
import { isSupabaseConfigured, getConfigurationError } from '../services/supabase';

interface UseSupabaseDataReturn {
  clientTypes: ClientType[];
  productModels: ProductModel[];
  variants: ModelVariant[];
  attributes: ModelAttribute[];
  fabrics: Fabric[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSupabaseData(): UseSupabaseDataReturn {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [productModels, setProductModels] = useState<ProductModel[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [attributes, setAttributes] = useState<ModelAttribute[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 Carregando dados do Supabase...');

      // Carrega tipos de cliente com timeout
      console.log('📦 Carregando tipos de cliente...');
      const clientTypesPromise = getAllCustomerTypes();
      const clientTypesTimeout = new Promise<ClientType[]>((resolve) => 
        setTimeout(() => {
          console.warn('⚠️ Timeout ao carregar tipos de cliente');
          resolve([]);
        }, 5000)
      );
      const clientTypesData = await Promise.race([clientTypesPromise, clientTypesTimeout]);
      setClientTypes(clientTypesData);
      console.log('✅ Tipos de cliente carregados:', clientTypesData.length);

      // Carrega modelos com timeout
      console.log('📦 Carregando modelos...');
      const modelsPromise = getAllProductModels();
      const modelsTimeout = new Promise<ProductModel[]>((resolve) => 
        setTimeout(() => {
          console.warn('⚠️ Timeout ao carregar modelos');
          resolve([]);
        }, 5000)
      );
      const modelsData = await Promise.race([modelsPromise, modelsTimeout]);
      setProductModels(modelsData);
      console.log('✅ Modelos carregados:', modelsData.length);

      // Carrega variantes de todos os modelos (com timeout individual)
      console.log('📦 Carregando variantes...');
      const allVariants: ModelVariant[] = [];
      for (const model of modelsData) {
        try {
          const variantPromise = getVariantsByModel(model.id);
          const variantTimeout = new Promise<ModelVariant[]>((resolve) => 
            setTimeout(() => {
              console.warn(`⚠️ Timeout ao carregar variantes do modelo ${model.id}`);
              resolve([]);
            }, 3000)
          );
          const modelVariants = await Promise.race([variantPromise, variantTimeout]);
          allVariants.push(...modelVariants);
        } catch (err) {
          console.warn(`Erro ao carregar variantes do modelo ${model.id}:`, err);
        }
      }
      setVariants(allVariants);
      console.log('✅ Variantes carregadas:', allVariants.length);

      // Carrega atributos de todos os modelos (com timeout individual)
      console.log('📦 Carregando atributos...');
      const allAttributes: ModelAttribute[] = [];
      for (const model of modelsData) {
        try {
          const attributePromise = getAttributesByModel(model.id);
          const attributeTimeout = new Promise<ModelAttribute[]>((resolve) => 
            setTimeout(() => {
              console.warn(`⚠️ Timeout ao carregar atributos do modelo ${model.id}`);
              resolve([]);
            }, 3000)
          );
          const modelAttributes = await Promise.race([attributePromise, attributeTimeout]);
          allAttributes.push(...modelAttributes);
        } catch (err) {
          console.warn(`Erro ao carregar atributos do modelo ${model.id}:`, err);
        }
      }
      setAttributes(allAttributes);
      console.log('✅ Atributos carregados:', allAttributes.length);

      // Carrega tecidos de todos os modelos (com timeout individual)
      console.log('📦 Carregando tecidos...');
      const allFabrics: Fabric[] = [];
      for (const model of modelsData) {
        try {
          const fabricPromise = getFabricsByModel(model.id);
          const fabricTimeout = new Promise<Fabric[]>((resolve) => 
            setTimeout(() => {
              console.warn(`⚠️ Timeout ao carregar tecidos do modelo ${model.id}`);
              resolve([]);
            }, 3000)
          );
          const modelFabrics = await Promise.race([fabricPromise, fabricTimeout]);
          allFabrics.push(...modelFabrics);
        } catch (err) {
          console.warn(`Erro ao carregar tecidos do modelo ${model.id}:`, err);
        }
      }
      setFabrics(allFabrics);
      console.log('✅ Tecidos carregados:', allFabrics.length);
      console.log('✅ Todos os dados carregados com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      console.error('❌ Erro ao carregar dados:', err);
      setError(errorMessage);
    } finally {
      console.log('📦 Finalizando loading dos dados');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verifica se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError(getConfigurationError());
      setLoading(false);
      return;
    }

    // Timeout absoluto para garantir que o loading sempre termine
    const absoluteTimeout = setTimeout(() => {
      console.warn('⚠️ TIMEOUT ABSOLUTO: Forçando finalização do loading de dados após 30 segundos');
      setLoading(false);
    }, 30000); // 30 segundos máximo

    // Tenta migrar dados iniciais na primeira carga (com timeout)
    const initialize = async () => {
      try {
        console.log('📦 Iniciando migração de dados...');
        const migrationPromise = migrateSeedData();
        const migrationTimeout = new Promise((resolve) => 
          setTimeout(() => {
            console.warn('⚠️ Timeout na migração de dados (continuando mesmo assim)');
            resolve({ migrated: false, message: 'Timeout' });
          }, 10000)
        );
        const migrationResult = await Promise.race([migrationPromise, migrationTimeout]) as any;
        if (migrationResult?.migrated) {
          console.log('✅ Dados iniciais migrados:', migrationResult.message);
        }
      } catch (err) {
        console.warn('⚠️ Erro na migração inicial (pode ser normal se já houver dados):', err);
      }
      
      // Carrega os dados
      await loadData();
      clearTimeout(absoluteTimeout);
    };

    initialize();

    return () => {
      clearTimeout(absoluteTimeout);
    };
  }, []);

  return {
    clientTypes,
    productModels,
    variants,
    attributes,
    fabrics,
    loading,
    error,
    refresh: loadData,
  };
}

