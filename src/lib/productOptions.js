// Tailles / couleurs d'un produit : la base peut contenir "S, M", "{S,M}" ou '{"S","M"}'.
export const parseOptions = (raw) => {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw !== 'string') return [];
  return raw
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
};

// Version texte pour le formulaire vendeur : "S, M, L"
export const optionsToText = (raw) => parseOptions(raw).join(', ');
