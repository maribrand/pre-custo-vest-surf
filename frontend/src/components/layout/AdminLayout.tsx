import type { ClientType, ProductModel, ModelVariant, CompleteModel, Fabric, ModelAttribute } from '../../types/catalog';
import { ClientTypesManager } from '../admin/ClientTypesManager';
import { ProductModelsManager } from '../admin/ProductModelsManager';
import { VariationsManager } from '../admin/VariationsManager';
import { AttributesManager } from '../admin/AttributesManager';
import { FabricsManager } from '../admin/FabricsManager';

interface AdminLayoutProps {
  clientTypes: ClientType[];
  productModels: ProductModel[];
  variants: ModelVariant[];
  attributes: ModelAttribute[];
  completeModels: CompleteModel[];
  fabrics: Fabric[];
  onClientTypesChange: (next: ClientType[]) => void;
  onProductModelsChange: (next: ProductModel[]) => void;
  onVariantsChange: (next: ModelVariant[]) => void;
  onAttributesChange: (next: ModelAttribute[]) => void;
  onCompleteModelsChange: (next: CompleteModel[]) => void;
  onFabricsChange: (next: Fabric[]) => void;
}

export function AdminLayout({
  clientTypes,
  productModels,
  variants,
  attributes,
  completeModels,
  fabrics,
  onClientTypesChange,
  onProductModelsChange,
  onVariantsChange,
  onAttributesChange,
  onCompleteModelsChange,
  onFabricsChange,
}: AdminLayoutProps) {
  return (
    <section>
      <h2>Admin – Parametrização</h2>
      <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
        Utilize os formulários abaixo para montar o catálogo e as regras de pré-custo. Todos os dados ficam em
        memória durante o MVP.
      </p>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <ClientTypesManager items={clientTypes} onChange={onClientTypesChange} />
        <ProductModelsManager items={productModels} onChange={onProductModelsChange} />
        <FabricsManager items={fabrics} models={productModels} onChange={onFabricsChange} />
        <AttributesManager items={attributes} models={productModels} onChange={onAttributesChange} />
        <VariationsManager
          items={variants}
          models={productModels}
          completeModels={completeModels}
          onChange={onVariantsChange}
          onCompleteModelSave={onCompleteModelsChange}
        />
      </div>
    </section>
  );
}
