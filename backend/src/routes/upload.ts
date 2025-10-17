// backend/src/routes/upload.ts

import express, { Request, Response } from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Download template
router.get('/template', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Instructions sheet
    const instructionsSheet = workbook.addWorksheet('📋 INSTRUCȚIUNI');
    instructionsSheet.columns = [
      { header: 'Cum să folosești acest template', width: 80 }
    ];
    
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['PASUL 1: Înțelege structura']);
    instructionsSheet.addRow(['Fiecare sheet (filă) din acest fișier reprezintă o CATEGORIE de produse.']);
    instructionsSheet.addRow(['Exemplu: "Ciorbe", "Feluri Principale", "Garnituri", "Deserturi", etc.']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['PASUL 2: Completează produsele']);
    instructionsSheet.addRow(['În fiecare sheet, adaugă produsele tale astfel:']);
    instructionsSheet.addRow(['- Coloana A: Numele produsului (ex: "Ciorbă de burtă")']);
    instructionsSheet.addRow(['- Coloana B: Prețul de achiziție în LEI (ex: 13.06)']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['PASUL 3: Adaugă categorii noi (opțional)']);
    instructionsSheet.addRow(['Poți adăuga sheet-uri noi pentru categorii suplimentare:']);
    instructionsSheet.addRow(['- Click dreapta pe un sheet → Duplicate']);
    instructionsSheet.addRow(['- Redenumește sheet-ul cu categoria ta (ex: "Deserturi", "Băuturi")']);
    instructionsSheet.addRow(['- Completează produsele']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['PASUL 4: Salvează fișierul']);
    instructionsSheet.addRow(['Salvează ca .xlsx (Excel Workbook)']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['PASUL 5: Încarcă în aplicație']);
    instructionsSheet.addRow(['Mergi la pagina de Setări → Importă Prețuri → Alege fișierul']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['⚠️ IMPORTANT:']);
    instructionsSheet.addRow(['- Șterge acest sheet "📋 INSTRUCȚIUNI" înainte de upload SAU lasă-l, va fi ignorat']);
    instructionsSheet.addRow(['- Nu schimba formatul coloanelor (Nume | Preț)']);
    instructionsSheet.addRow(['- Prețurile trebuie să fie numere, nu text']);
    instructionsSheet.addRow(['']);
    instructionsSheet.addRow(['💡 SFAT: Sheet-ul "Costuri Fixe" este special!']);
    instructionsSheet.addRow(['Aici setezi costurile care se adaugă la FIECARE meniu:']);
    instructionsSheet.addRow(['- Ambalaj (ex: 2.00 LEI)']);
    instructionsSheet.addRow(['- Transport (ex: 1.00 LEI)']);

    // Apply styling
    instructionsSheet.getRow(1).font = { bold: true, size: 14 };
    instructionsSheet.getRow(3).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    instructionsSheet.getRow(8).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    instructionsSheet.getRow(13).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    instructionsSheet.getRow(19).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    instructionsSheet.getRow(22).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    instructionsSheet.getRow(25).font = { bold: true, size: 11, color: { argb: 'FFFF6600' } };
    instructionsSheet.getRow(30).font = { bold: true, size: 11, color: { argb: 'FF00AA00' } };

    // Sample categories
    const sampleCategories = [
      { name: '🍲 Ciorbe', products: [
        { name: 'Gulas de vita', price: 14.42 },
        { name: 'Ciorba de burta', price: 13.06 },
        { name: 'Ciorba radauteana', price: 11.41 },
      ]},
      { name: '🍖 Feluri Principale', products: [
        { name: 'Sarmale cu afumatura', price: 9.03 },
        { name: 'Tochitura moldoveneasca', price: 9.00 },
        { name: 'Snitel de pui', price: 5.08 },
      ]},
      { name: '🥔 Garnituri', products: [
        { name: 'Cartofi gratinati', price: 6.92 },
        { name: 'Mamaliga', price: 4.25 },
        { name: 'Piure de cartofi', price: 6.91 },
      ]},
    ];

    for (const category of sampleCategories) {
      const sheet = workbook.addWorksheet(category.name);
      sheet.columns = [
        { header: 'Nume Produs', key: 'name', width: 40 },
        { header: 'Preț (LEI)', key: 'price', width: 15 },
      ];
      
      // Style header
      sheet.getRow(1).font = { bold: true, size: 12 };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      // Add sample data
      category.products.forEach(product => {
        sheet.addRow(product);
      });
    }

    // Fixed Costs sheet
    const fixedCostsSheet = workbook.addWorksheet('⚙️ Costuri Fixe');
    fixedCostsSheet.columns = [
      { header: 'Tip Cost', key: 'name', width: 30 },
      { header: 'Cost (LEI)', key: 'cost', width: 15 },
    ];
    
    fixedCostsSheet.getRow(1).font = { bold: true, size: 12 };
    fixedCostsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' }
    };
    fixedCostsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    fixedCostsSheet.addRow({ name: 'Ambalaj', cost: 2.00 });
    fixedCostsSheet.addRow({ name: 'Transport', cost: 1.00 });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Preturi_Meniu.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Eroare la generarea template-ului' });
  }
});

// Upload and parse Excel
router.post('/import', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fișier lipsă' });
    }

    const userId = req.userId!;
    const workbook = new ExcelJS.Workbook();
    
    // FIX: Load directly from Buffer
    await workbook.xlsx.load(req.file.buffer as any);

    const results = {
      categoriesAdded: 0,
      productsAdded: 0,
      fixedCostsUpdated: 0,
      errors: [] as string[],
    };

    // Process each sheet
    for (const worksheet of workbook.worksheets) {
      const sheetName = worksheet.name;

      // Skip instructions sheet
      if (sheetName.includes('INSTRUCȚIUNI') || sheetName.includes('INSTRUCTIUNI')) {
        continue;
      }

      // Handle Fixed Costs sheet
      if (sheetName.includes('Costuri Fixe') || sheetName.includes('Fixed Cost')) {
        const promises: Promise<any>[] = [];
        
        worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
          if (rowNumber === 1) return; // Skip header
          
          const name = row.getCell(1).value?.toString().trim();
          const costValue = row.getCell(2).value;
          const cost = typeof costValue === 'number' ? costValue : parseFloat(costValue?.toString() || '0');

          if (name && !isNaN(cost)) {
            const promise = prisma.fixedCost.upsert({
              where: { userId_name: { userId, name } },
              update: { cost },
              create: { userId, name, cost },
            }).catch((err: Error) => {
              results.errors.push(`Costuri Fixe - ${name}: ${err.message}`);
            });
            
            promises.push(promise);
            results.fixedCostsUpdated++;
          }
        });
        
        await Promise.all(promises);
        continue;
      }

      // Handle product categories
      try {
        // Extract emoji from sheet name
        const emojiMatch = sheetName.match(/^(\p{Emoji})\s*/u);
        const emoji = emojiMatch ? emojiMatch[1] : '📦';
        const categoryName = sheetName.replace(/^(\p{Emoji})\s*/u, '').trim();

        // Create or get category
        const category = await prisma.category.upsert({
          where: { userId_name: { userId, name: categoryName } },
          update: { displayName: sheetName, emoji },
          create: {
            userId,
            name: categoryName,
            displayName: sheetName,
            emoji,
            order: workbook.worksheets.indexOf(worksheet),
          },
        });

        results.categoriesAdded++;

        // Delete existing products
        await prisma.product.deleteMany({
          where: { categoryId: category.id },
        });

        // Add products
        const productPromises: Promise<any>[] = [];
        
        worksheet.eachRow(async (row: ExcelJS.Row, rowNumber: number) => {
          if (rowNumber === 1) return; // Skip header

          const name = row.getCell(1).value?.toString().trim();
          const priceValue = row.getCell(2).value;
          const price = typeof priceValue === 'number' ? priceValue : parseFloat(priceValue?.toString() || '0');

          if (name && !isNaN(price) && price > 0) {
            const promise = prisma.product.create({
              data: {
                categoryId: category.id,
                name,
                price,
              },
            }).catch((err: Error) => {
              results.errors.push(`${categoryName} - ${name}: ${err.message}`);
            });
            
            productPromises.push(promise);
            results.productsAdded++;
          }
        });
        
        await Promise.all(productPromises);
      } catch (error: any) {
        results.errors.push(`Sheet "${sheetName}": ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Import finalizat cu succes!',
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Eroare la importul fișierului' });
  }
});

export default router;