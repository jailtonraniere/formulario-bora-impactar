const xlsx = require('c:/Users/User/Desktop/Jailton/Antigravity/Formulario do Bora Impactar/node_modules/xlsx');

const filePath = 'c:/Users/User/Desktop/Jailton/Antigravity/Formulario do Bora Impactar/Bora_Impactar_Base_Oficial_PRONTA.xlsx';

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
  const types = new Set(odsGov.map(r => r.tipo_registro));
  console.log('Unique tipo_registro in ODS_GOVERNANCA:', Array.from(types));

  console.log('\nSample ESG social rows:');
  console.log(odsGov.filter(r => r.tipo_registro === 'esg_social').slice(0, 3));

  console.log('\nSample ESG environmental rows:');
  console.log(odsGov.filter(r => r.tipo_registro === 'esg_ambiental').slice(0, 3));

  console.log('\nSample ESG governance rows:');
  console.log(odsGov.filter(r => r.tipo_registro === 'esg_governanca').slice(0, 3));

  console.log('\nSample governance rows:');
  console.log(odsGov.filter(r => r.tipo_registro === 'governanca').slice(0, 3));

} catch (err) {
  console.error(err);
}
