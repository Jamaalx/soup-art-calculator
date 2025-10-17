// backend/src/routes/offers.ts

import express from 'express';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Generate PDF offer
router.post('/generate-pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      clientCompany,
      clientCUI,
      clientAddress,
      clientContact,
      offerType,
      menuType,
      pricePerMenu,
      validityDays,
      selectedItems,
      avgCost,
      profitPerMenu,
      profitMargin
    } = req.body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User negăsit' });
    }

    // Generate offer number
    const today = new Date();
    const offerNumber = `OF-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // Save offer to database
    await prisma.offer.create({
      data: {
        userId: req.userId!,
        offerNumber,
        clientCompany,
        clientCUI,
        clientAddress,
        clientContact,
        offerType,
        menuType,
        pricePerMenu,
        validityDays,
        selectedItems,
        avgCost,
        profitPerMenu,
        profitMargin
      }
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Oferta_${offerNumber}_${clientCompany.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    
    doc.pipe(res);

    const formattedDate = today.toLocaleDateString('ro-RO');
    const validUntil = new Date(today.getTime() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('ro-RO');

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('OFERTĂ COMERCIALĂ', { align: 'center' });
    doc.moveDown();

    // Offer details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nr. Ofertă: ${offerNumber}`);
    doc.text(`Data: ${formattedDate}`);
    doc.text(`Valabilitate: ${validityDays} zile (până la ${validUntil})`);
    doc.moveDown();

    // Supplier info
    doc.fontSize(12).font('Helvetica-Bold').text('DATE FURNIZOR');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${user.company}`);
    doc.text(`CUI: ${user.cui || 'N/A'}`);
    doc.text(`Adresă: ${user.address || 'N/A'}`);
    doc.text(`Telefon: ${user.phone || 'N/A'}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Reprezentant: ${user.name}`);
    doc.moveDown();

    // Client info
    doc.fontSize(12).font('Helvetica-Bold').text('DATE CLIENT');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${clientCompany}`);
    doc.text(`CUI: ${clientCUI}`);
    doc.text(`Adresă: ${clientAddress}`);
    doc.text(`Persoană de contact: ${clientContact}`);
    doc.moveDown();

    // Object
    doc.fontSize(12).font('Helvetica-Bold').text('OBIECTUL OFERTEI');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Furnizare meniuri ${offerType === 'daily' ? 'zilnice' : 'săptămânale'} complete, constând din:`);
    doc.text('• Ciorbă/Supă (porție 400ml)');
    doc.text('• Fel principal (porție 300-350g)');
    doc.text('• Garnitură (porție 200-250g)');
    doc.moveDown();

    // Menu items
    if (menuType === 'variations') {
      doc.fontSize(11).font('Helvetica-Bold').text('SISTEM: MENIU CU VARIAȚII');
      doc.fontSize(10).font('Helvetica');
      doc.text('Clientul poate alege zilnic din opțiunile disponibile pentru fiecare categorie.');
      doc.moveDown();

      // List selected items by category
      Object.keys(selectedItems).forEach(category => {
        const items = selectedItems[category];
        if (items && items.length > 0) {
          doc.font('Helvetica-Bold').text(`${category.toUpperCase()}:`);
          doc.font('Helvetica');
          items.forEach((item: string, idx: number) => {
            doc.text(`  ${idx + 1}. ${item}`);
          });
          doc.moveDown(0.5);
        }
      });
    } else {
      doc.fontSize(11).font('Helvetica-Bold').text('SISTEM: MENIURI FIXE PREDEFINITE');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown();

      // List fixed menus
      selectedItems.menus?.forEach((menu: any, idx: number) => {
        doc.font('Helvetica-Bold').text(`MENIUL ${idx + 1}:`);
        doc.font('Helvetica');
        doc.text(`  • Ciorbă: ${menu.ciorba}`);
        doc.text(`  • Fel principal: ${menu.fel}`);
        doc.text(`  • Garnitură: ${menu.garnitura}`);
        doc.moveDown(0.5);
      });
    }

    doc.moveDown();

    // Pricing
    doc.fontSize(12).font('Helvetica-Bold').text('PREȚURI ȘI CONDIȚII');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Preț per meniu: ${pricePerMenu.toFixed(2)} LEI (fără TVA)`);
    doc.text(`TVA (19%): ${(pricePerMenu * 0.19).toFixed(2)} LEI`);
    doc.font('Helvetica-Bold').text(`Preț total per meniu: ${(pricePerMenu * 1.19).toFixed(2)} LEI (cu TVA)`);
    doc.font('Helvetica');
    doc.moveDown();

    doc.text('PREȚUL INCLUDE:');
    doc.text('• Ingrediente proaspete de calitate superioară');
    doc.text('• Preparare culinară profesională');
    doc.text('• Ambalaj termic profesional');
    doc.text('• Transport la sediul clientului');
    doc.text('• Toate taxele și impozitele legale');
    doc.moveDown();

    // Terms
    doc.fontSize(12).font('Helvetica-Bold').text('TERMENI ȘI CONDIȚII');
    doc.fontSize(10).font('Helvetica');
    doc.text(`1. Prezenta ofertă este valabilă ${validityDays} zile de la data emiterii.`);
    doc.text('2. Prețurile sunt exprimate în LEI și includ toate costurile.');
    doc.text('3. Meniurile sunt preparate conform normelor HACCP.');
    doc.text('4. Anularea comenzilor se poate face cu minimum 24h în avans.');
    doc.text('5. Livrare zilnică între orele 11:00-13:00.');
    doc.text('6. Cantitate minimă: 10 meniuri/comandă.');
    doc.moveDown(2);

    // Signatures
    doc.text('_____________________          _____________________');
    doc.text('Furnizor                       Client');
    doc.text(`${user.name}                   ${clientContact}`);
    
    doc.moveDown();
    doc.fontSize(8).text('Document generat electronic | Powered by ZED ZEN - www.zed-zen.com', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF-ului' });
  }
});

// Get offer history
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ offers });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Eroare la obținerea ofertelor' });
  }
});

// Get single offer
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findFirst({
      where: { id, userId: req.userId }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Ofertă negăsită' });
    }

    res.json({ offer });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ error: 'Eroare la obținerea ofertei' });
  }
});

export default router;