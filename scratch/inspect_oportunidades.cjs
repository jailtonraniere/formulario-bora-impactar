const xlsx = require('../node_modules/xlsx');

const filePath = '../Bora_Impactar_Base_Oficial_PRONTA.xlsx';

try {
  const workbook = xlsx.readFile(filePath);
  
  function parseSheetData(sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (rawRows.length < 4) return [];
    
    const headers = rawRows[3];
    const dataRows = rawRows.slice(4);
    
    return dataRows.map((row, rIdx) => {
      const obj = {};
      headers.forEach((h, cIdx) => {
        if (h) {
          obj[h] = row[cIdx] !== undefined ? row[cIdx] : '';
        }
      });
      return obj;
    });
  }

  const oport = parseSheetData('OPORTUNIDADES').filter(r => r.organizacao_id);
  console.log('Total opportunities with organization_id:', oport.length);
  const docs = parseSheetData('DOCUMENTOS').filter(r => r.organizacao_id);
  console.log('Total documents with organization_id:', docs.length);
  
} catch (err) {
  console.error(err);
}
