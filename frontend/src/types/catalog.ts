export interface ClientType {
  id: string;
  name: string;
  paymentCondition: string; // Condição de pagamento
  shippingMethod: string; // Forma de expedição
  fixedValue: number; // Valor fixo em R$ - somado ao subtotal ANTES do markup
  markup: number; // Percentual aplicado sobre o subtotal (ex.: 20 = 20%)
}

export interface ProductModel {
  id: string;
  category: string;
  name: string;
  baseCost: number; // Custo fixo base do modelo
  fabricConsumption: number; // Consumo de tecido em metros
}

export interface ModelVariant {
  id: string;
  modelId: string; // Referência ao modelo cadastrado
  name: string;
  unitCost: number;
  consumption: number;
  totalValue: number; // Calculado automaticamente: unitCost * consumption
  imageUrl?: string;
}

export interface ModelAttribute {
  id: string;
  modelId: string; // Referência ao modelo cadastrado
  name: string;
  consumption: number; // Consumo extra de tecido em metros
  fixedCost: number; // Custo fixo extra (ex: costura)
  imageUrl?: string;
}

export interface Fabric {
  id: string;
  modelId: string; // Referência ao modelo cadastrado
  name: string;
  unitCost: number; // Custo por metro do tecido
  totalCost: number; // Calculado automaticamente: unitCost * consumoTecidoDoModelo
  imageUrl?: string;
}

export interface CompleteModel {
  id: string;
  modelId: string;
  category: string;
  name: string;
  baseCost: number;
  fabricConsumption: number;
  variants: Array<{
    id: string;
    name: string;
    unitCost: number;
    consumption: number;
    totalValue: number;
  }>;
}
