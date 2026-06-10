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

  const odsGov = parseSheetData('ODS_GOVERNANCA').filter(r => r.organizacao_id);
  
  console.log('Total rows in ODS_GOVERNANCA:', odsGov.length);
  
  const populatedCols = {};
  odsGov.forEach(row => {
    Object.keys(row).forEach(key => {
      if (row[key] !== '') {
        populatedCols[key] = (populatedCols[key] || 0) + 1;
      }
    });
  });
  
  console.log('Populated columns count:', populatedCols);
  
  const nonOdsRows = odsGov.filter(r => String(r.tipo_registro).toLowerCase() !== 'ods');
  console.log('Non-ODS rows count:', nonOdsRows.length);
  if (nonOdsRows.length > 0) {
    console.log('Sample non-ODS rows:', nonOdsRows.slice(0, 5));
  }
} catch (err) {
  console.error(err);
}
