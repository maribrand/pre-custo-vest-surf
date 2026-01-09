export const initialClientTypes = [
    {
        id: 'client-loja',
        name: 'Loja Multimarcas',
        paymentCondition: '30/60',
        shippingMethod: 'FOB',
        fixedValue: 3,
        markup: 20,
    },
    {
        id: 'client-marca',
        name: 'Marca Própria',
        paymentCondition: '50% entrada',
        shippingMethod: 'CIF',
        fixedValue: 0,
        markup: 15,
    },
];
export const initialProductModels = [
    {
        id: 'model-short-basico',
        category: 'Short',
        name: 'Short básico Vest Surf',
        baseCost: 40,
        fabricConsumption: 1.5,
    },
];
export const initialVariants = [
    { id: 'var-bolso-embutido', modelId: 'model-short-basico', name: 'Bolso embutido', unitCost: 4, consumption: 0.3, totalValue: 1.2 },
    { id: 'var-bolso-chapado', modelId: 'model-short-basico', name: 'Bolso chapado', unitCost: 3, consumption: 0.2, totalValue: 0.6 },
    { id: 'var-tecido-dryfit', modelId: 'model-short-basico', name: 'Tecido Dry Fit', unitCost: 12, consumption: 1, totalValue: 12 },
    { id: 'var-cos-elastico', modelId: 'model-short-basico', name: 'Cós elástico', unitCost: 5, consumption: 0.15, totalValue: 0.75 },
];
export const initialFabrics = [
    { id: 'fabric-dryfit-premium', modelId: 'model-short-basico', name: 'Dry Fit Premium', unitCost: 20, totalCost: 30 },
    { id: 'fabric-poli-light', modelId: 'model-short-basico', name: 'Poliéster Light', unitCost: 15, totalCost: 22.5 },
];
export const initialAttributes = [
    { id: 'attr-manga-longa', modelId: 'model-short-basico', name: 'Manga Longa', consumption: 0.5, fixedCost: 5.0 },
];
