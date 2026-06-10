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

  const orgs = parseSheetData('ORGANIZACOES').filter(r => r.organizacao_id);
  const formalizations = new Set(orgs.map(o => o.situacao_formalizacao));
  console.log('Unique situacao_formalizacao in ORGANIZACOES:', Array.from(formalizations));

  const listSheet = workbook.Sheets['LISTAS'];
  const rawListRows = xlsx.utils.sheet_to_json(listSheet, { header: 1 });
  console.log('\nHeader of LISTAS sheet (first few columns):');
  console.log(rawListRows[3]); // headers
  
  // Let's print unique values in LISTAS under each column
  const listsData = parseSheetData('LISTAS');
  console.log('\nSample rows in LISTAS:', listsData.slice(0, 5));

} catch (err) {
  console.error(err);
}
