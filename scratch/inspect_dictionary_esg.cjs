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
  
  const esgGovFields = dicionario.filter(d => 
    String(d.campo_id).toLowerCase().includes('esg') || 
    String(d.campo_id).toLowerCase().includes('govern')
  );
  
  console.log('ESG / Gov fields in Dictionary:', esgGovFields.length);
  esgGovFields.forEach(f => {
    console.log(`- Id: ${f.campo_id} | Name: ${f.nome_exibido} | Aba: ${f.aba_destino} | Col: ${f.coluna_destino}`);
  });

} catch (err) {
  console.error(err);
}
