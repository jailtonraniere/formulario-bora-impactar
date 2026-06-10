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

  const dicionario = parseSheetData('DICIONARIO_CAMPOS');
  console.log('Total fields in dictionary:', dicionario.length);
  console.log('\nSample fields in dictionary (first 10):');
  console.log(dicionario.slice(0, 10));

} catch (err) {
  console.error(err);
}
