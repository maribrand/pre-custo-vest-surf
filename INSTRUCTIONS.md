# Instruções - Imagens em Variantes, Atributos e Tecidos

## Resumo das Alterações
1.  **Tecidos**: 
    *   Corrigida a exibição de imagem nos cards (componente `SelectionCard` já suportava, mas agora foi validado).
    *   Verificado que o campo `imageUrl` está sendo passado corretamente.
2.  **Variantes e Atributos**:
    *   **Admin**: Adicionados campos "Imagem da variante/atributo (URL)" nos formulários de cadastro e edição.
    *   **Tipos**: Atualizadas interfaces `ModelVariant` e `ModelAttribute` para incluir `imageUrl`.
    *   **Representante**: Substituída a lista de checkboxes por **Cards Visuais (`SelectionCard`)**, idênticos aos de tecido, mas permitindo seleção múltipla.
    *   **Visual**: Agora Variantes e Atributos com imagens cadastradas exibem a foto no card.

## Arquivos Modificados
*   `frontend/src/types/catalog.ts` (Adicionado `imageUrl` em Variant e Attribute)
*   `frontend/src/components/admin/VariationsManager.tsx` (Campo de imagem no form e lista)
*   `frontend/src/components/admin/AttributesManager.tsx` (Campo de imagem no form e lista)
*   `frontend/src/components/layout/SellerLayout.tsx` (Uso de `SelectionCard` para Variantes/Atributos)

## Passo-a-Passo de Teste

### 1. Cadastrar Imagens (Admin)
1.  Acesse **Admin / Precificação**.
2.  **Variantes**:
    *   Vá em "Variantes e adicionais".
    *   Edite ou crie uma variante (ex: "Bolso Embutido").
    *   Cole uma URL de imagem no novo campo (ex: `https://via.placeholder.com/150`).
    *   Salve e verifique se a miniatura aparece na lista.
3.  **Atributos**:
    *   Vá em "Atributo por modelo".
    *   Edite ou crie um atributo (ex: "Manga Longa").
    *   Cole uma URL de imagem.
    *   Salve e verifique a miniatura.

### 2. Verificar Visualização (Representante)
1.  Troque para o perfil **Representante / Comercial**.
2.  Selecione Cliente e Modelo.
3.  **Tecidos**: Verifique se os cards mostram as imagens cadastradas anteriormente.
4.  **Variantes**: 
    *   Agora você deve ver Cards ao invés de checkboxes.
    *   Se tiver imagem, ela aparece. Se não, mostra o ícone 📷.
    *   Clique para selecionar (seleção múltipla continua funcionando). O card fica azul com check.
5.  **Atributos**:
    *   Mesmo comportamento: Cards visuais com imagem.

### Observação sobre Links de Imagem
Certifique-se de usar URLs diretas de imagem (que terminam em .jpg, .png, etc) ou links públicos de hospedagem que renderizam a imagem diretamente. Links de visualização de Google Drive (viewer) podem não funcionar em tags `<img>` dependendo das permissões.
