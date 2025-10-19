'use client';

import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { getCategoryLabel } from '@/lib/data/categories';

interface OfferGeneratorProps {
  products: Product[];
}

interface ClientInfo {
  denumire: string;
  cui: string;
  adresa: string;
  contact: string;
}

interface OfferSettings {
  offerType: 'fix' | 'variatii';
  pretMeniu: number;
  cantitateMinima: number;
  termenPlata: number;
  selectedProducts: {
    [key: string]: string[]; // category -> productIds[]
  };
}

const OfferGenerator: React.FC<OfferGeneratorProps> = ({ products }) => {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    denumire: '',
    cui: '',
    adresa: '',
    contact: ''
  });

  const [settings, setSettings] = useState<OfferSettings>({
    offerType: 'variatii',
    pretMeniu: 35.00,
    cantitateMinima: 10,
    termenPlata: 7,
    selectedProducts: {}
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // FIXED: Get categories dynamically from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return uniqueCategories.sort();
  }, [products]);

  // FIXED: Filter active products properly
  const productsByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = products.filter(p => p.category === cat && p.is_active);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [categories, products]);

  const handleToggleProduct = (category: string, productId: string) => {
    setSettings(prev => {
      const categoryProducts = prev.selectedProducts[category] || [];
      const isSelected = categoryProducts.includes(productId);
      
      return {
        ...prev,
        selectedProducts: {
          ...prev.selectedProducts,
          [category]: isSelected
            ? categoryProducts.filter(id => id !== productId)
            : [...categoryProducts, productId]
        }
      };
    });
  };

  const handleSelectAllCategory = (category: string) => {
    const allIds = productsByCategory[category].map(p => p.id);
    setSettings(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [category]: allIds
      }
    }));
  };

  const generateOfferText = () => {
    const today = new Date();
    const offerNumber = `OF-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 30);

    const tva = settings.pretMeniu * 0.19;
    const pretTotal = settings.pretMeniu + tva;

    let offerText = `═══════════════════════════════════════════════════════════════
                    OFERTĂ COMERCIALĂ
═══════════════════════════════════════════════════════════════

Nr. Ofertă: ${offerNumber}
Data: ${today.toLocaleDateString('ro-RO')}
Valabilitate: 30 zile (până la ${validUntil.toLocaleDateString('ro-RO')})

───────────────────────────────────────────────────────────────
                    DATE FURNIZOR
───────────────────────────────────────────────────────────────

Denumire: [COMPLETAȚI DATELE FURNIZOR]
CUI: [CUI FURNIZOR]
Adresă: [ADRESA FURNIZOR]
Telefon: [TELEFON FURNIZOR]
Email: [EMAIL FURNIZOR]
Reprezentant: [NUME REPREZENTANT]

───────────────────────────────────────────────────────────────
                    DATE CLIENT
───────────────────────────────────────────────────────────────

Denumire: ${clientInfo.denumire || '[DENUMIRE CLIENT]'}
CUI: ${clientInfo.cui || '[CUI CLIENT]'}
Adresă: ${clientInfo.adresa || '[ADRESA CLIENT]'}
Persoană de contact: ${clientInfo.contact || '[CONTACT CLIENT]'}

───────────────────────────────────────────────────────────────
                    OBIECTUL OFERTEI
───────────────────────────────────────────────────────────────

Furnizare meniuri zilnice complete, constând din:
• Ciorbă/Supă (porție 400ml)
• Fel principal (porție 300-350g)
• Garnitură (porție 200-250g)

`;

    if (settings.offerType === 'fix') {
      offerText += `
SISTEM: MENIU FIX
Meniu cu compoziție prestabilită pentru fiecare zi.

COMPOZIȚIE MENIU:
`;
      Object.entries(settings.selectedProducts).forEach(([category, productIds]) => {
        if (productIds.length > 0) {
          offerText += `\n${getCategoryLabel(category).toUpperCase()}:\n`;
          productIds.forEach((id, index) => {
            const product = products.find(p => p.id === id);
            if (product) {
              offerText += `  ${index + 1}. ${product.nume}\n`;
            }
          });
        }
      });
    } else {
      offerText += `
SISTEM: MENIU CU VARIAȚII
Clientul poate alege zilnic din opțiunile disponibile pentru fiecare categorie.

OPȚIUNI DISPONIBILE:
`;
      Object.entries(settings.selectedProducts).forEach(([category, productIds]) => {
        if (productIds.length > 0) {
          offerText += `\n${getCategoryLabel(category).toUpperCase()} (alegeți zilnic):\n`;
          productIds.forEach((id, index) => {
            const product = products.find(p => p.id === id);
            if (product) {
              offerText += `  ${index + 1}. ${product.nume}\n`;
            }
          });
        }
      });
    }

    offerText += `

───────────────────────────────────────────────────────────────
                    PREȚURI ȘI CONDIȚII
───────────────────────────────────────────────────────────────

Preț per meniu:                    ${settings.pretMeniu.toFixed(2)} LEI (fără TVA)
TVA (19%):                          ${tva.toFixed(2)} LEI
Preț total per meniu:               ${pretTotal.toFixed(2)} LEI (cu TVA)

PREȚUL INCLUDE:
• Ingrediente proaspete de calitate superioară
• Preparare culinară profesională
• Ambalaj termic profesional (2 LEI)
• Transport la sediul clientului (1 LEI)
• Toate taxele și impozitele legale

───────────────────────────────────────────────────────────────
                    CONDIȚII DE LIVRARE
───────────────────────────────────────────────────────────────

• Livrare zilnică la adresa specificată de client
• Program de livrare: între orele 11:00-13:00
• Comenzile se plasează cu o zi în avans până la ora 15:00
• Cantitate minimă: ${settings.cantitateMinima} meniuri/comandă
• Mod de plată: transfer bancar (termen de plată: ${settings.termenPlata} zile)

───────────────────────────────────────────────────────────────
                    TERMENI ȘI CONDIȚII
───────────────────────────────────────────────────────────────

1. Prezenta ofertă este valabilă 30 zile de la data emiterii.

2. Prețurile sunt exprimate în LEI și includ toate costurile 
   de preparare, ambalare și transport.

3. Meniurile sunt preparate în conformitate cu normele HACCP și 
   legislația sanitară în vigoare.

4. Furnizorul își rezervă dreptul de a înlocui produsele 
   indisponibile cu alternative similare, cu acordul clientului.

5. Anularea comenzilor se poate face cu minimum 24h în avans.

6. Facturile vor fi emise lunar/săptămânal conform acordului.

7. Litigiile vor fi soluționate pe cale amiabilă sau, în caz 
   contrar, de către instanțele competente din România.

───────────────────────────────────────────────────────────────
                    CERTIFICĂRI ȘI AUTORIZAȚII
───────────────────────────────────────────────────────────────

• Autorizație sanitară veterinară valabilă
• Certificat HACCP
• Certificat de înregistrare fiscală (CIF)

───────────────────────────────────────────────────────────────

Pentru acceptarea prezentei oferte, vă rugăm să ne transmiteți
confirmarea în scris pe email sau să semnați și să ne returnați
o copie a acestui document.

Pentru informații suplimentare:
Contact: [NUME CONTACT]
Telefon: [TELEFON]
Email: [EMAIL]

Cu stimă,
[NUME REPREZENTANT]


_____________________          _____________________
Furnizor                       Client
[NUME FURNIZOR]                ${clientInfo.denumire || '[NUME CLIENT]'}
Data: ${today.toLocaleDateString('ro-RO')}         Data: ______________


───────────────────────────────────────────────────────────────
Document generat electronic | Powered by ZED ZEN
www.zed-zen.com
───────────────────────────────────────────────────────────────`;

    return offerText;
  };

  const handleDownloadTXT = () => {
    const offerText = generateOfferText();
    const blob = new Blob([offerText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Oferta_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    const offerText = generateOfferText();
    navigator.clipboard.writeText(offerText);
    alert('Oferta a fost copiată în clipboard!');
  };

  const selectedProductsCount = Object.values(settings.selectedProducts).reduce(
    (sum, ids) => sum + ids.length, 0
  );

  return (
    <div className="space-y-6">
      
      {/* Client Information */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          📋 INFORMAȚII CLIENT
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-black mb-2">DENUMIRE</label>
            <input
              type="text"
              value={clientInfo.denumire}
              onChange={(e) => setClientInfo({ ...clientInfo, denumire: e.target.value })}
              placeholder="Ex: SC RESTAURANT SRL"
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-black mb-2">CUI</label>
            <input
              type="text"
              value={clientInfo.cui}
              onChange={(e) => setClientInfo({ ...clientInfo, cui: e.target.value })}
              placeholder="Ex: RO12345678"
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-black mb-2">ADRESĂ</label>
            <input
              type="text"
              value={clientInfo.adresa}
              onChange={(e) => setClientInfo({ ...clientInfo, adresa: e.target.value })}
              placeholder="Ex: Str. Principală nr. 1, București"
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-black mb-2">PERSOANĂ CONTACT</label>
            <input
              type="text"
              value={clientInfo.contact}
              onChange={(e) => setClientInfo({ ...clientInfo, contact: e.target.value })}
              placeholder="Ex: Ion Popescu"
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>
        </div>
      </div>

      {/* Offer Settings */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          ⚙️ SETĂRI OFERTĂ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-black mb-2">TIP MENIU</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSettings({ ...settings, offerType: 'fix' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 border-black font-bold ${
                  settings.offerType === 'fix' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                }`}
              >
                MENIU FIX
              </button>
              <button
                onClick={() => setSettings({ ...settings, offerType: 'variatii' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 border-black font-bold ${
                  settings.offerType === 'variatii' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                }`}
              >
                MENIU VARIAȚII
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-2">
              PREȚ PER MENIU (fără TVA)
            </label>
            <input
              type="number"
              step="0.5"
              value={settings.pretMeniu}
              onChange={(e) => setSettings({ ...settings, pretMeniu: parseFloat(e.target.value) })}
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-2">
              CANTITATE MINIMĂ / COMANDĂ
            </label>
            <input
              type="number"
              value={settings.cantitateMinima}
              onChange={(e) => setSettings({ ...settings, cantitateMinima: parseInt(e.target.value) })}
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-2">
              TERMEN DE PLATĂ (zile)
            </label>
            <input
              type="number"
              value={settings.termenPlata}
              onChange={(e) => setSettings({ ...settings, termenPlata: parseInt(e.target.value) })}
              className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-100 rounded-xl border-2 border-black">
          <p className="text-sm font-bold text-black">
            PREȚ TOTAL CU TVA: <span className="text-xl font-black">{(settings.pretMeniu * 1.19).toFixed(2)} LEI</span>
          </p>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          🍽️ SELECTEAZĂ PRODUSELE ({selectedProductsCount} selectate)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`py-3 px-4 rounded-xl border-2 border-black font-bold ${
                selectedCategory === cat ? 'bg-yellow-400 text-black' : 'bg-white text-black'
              }`}
            >
              {getCategoryLabel(cat)} ({settings.selectedProducts[cat]?.length || 0})
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-black text-black">
                {getCategoryLabel(selectedCategory)}
              </h4>
              <button
                onClick={() => handleSelectAllCategory(selectedCategory)}
                className="px-4 py-2 bg-green-500 text-white rounded-xl border-2 border-black font-bold hover:bg-green-600"
              >
                SELECTEAZĂ TOATE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {productsByCategory[selectedCategory]?.map(product => {
                const isSelected = settings.selectedProducts[selectedCategory]?.includes(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleToggleProduct(selectedCategory, product.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-black bg-green-200 font-black' 
                        : 'border-gray-300 bg-white font-bold hover:border-black'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-black">{product.nume}</span>
                      {isSelected && <span className="text-green-600 font-black">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Generate Buttons */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <h3 className="text-2xl font-black mb-4 text-black">
          📄 GENEREAZĂ OFERTA
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleDownloadTXT}
            disabled={selectedProductsCount === 0}
            className="flex-1 py-4 bg-blue-500 text-white rounded-2xl border-4 border-black font-black text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⬇️ DESCARCĂ TXT
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            disabled={selectedProductsCount === 0}
            className="flex-1 py-4 bg-green-500 text-white rounded-2xl border-4 border-black font-black text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📋 COPIAZĂ ÎN CLIPBOARD
          </button>
        </div>

        {selectedProductsCount === 0 && (
          <p className="mt-4 text-center text-sm font-bold text-red-600">
            ⚠️ Selectează cel puțin un produs pentru a genera oferta
          </p>
        )}
      </div>
    </div>
  );
};

export default OfferGenerator;