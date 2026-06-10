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
  const contatos = parseSheetData('CONTATOS').filter(r => r.organizacao_id);
  const territorios = parseSheetData('TERRITORIOS').filter(r => r.organizacao_id);
  const impactos = parseSheetData('IMPACTO').filter(r => r.organizacao_id);
  const odsGov = parseSheetData('ODS_GOVERNANCA').filter(r => r.organizacao_id);
  const recursos = parseSheetData('RECURSOS').filter(r => r.organizacao_id);

  console.log(`Loaded rows:`);
  console.log(`Orgs: ${orgs.length}`);
  console.log(`Contatos: ${contatos.length}`);
  console.log(`Territorios: ${territorios.length}`);
  console.log(`Impactos: ${impactos.length}`);
  console.log(`OdsGov: ${odsGov.length}`);
  console.log(`Recursos: ${recursos.length}`);

  const testOrgId = 'BI-0001';
  const matchedOrg = orgs.find(o => o.organizacao_id === testOrgId);
  const matchedContato = contatos.find(c => c.organizacao_id === testOrgId);
  const matchedTerritorio = territorios.find(t => t.organizacao_id === testOrgId);
  const matchedImpacto = impactos.find(i => i.organizacao_id === testOrgId);
  const matchedRecurso = recursos.find(r => r.organizacao_id === testOrgId);
  const matchedOds = odsGov.filter(o => o.organizacao_id === testOrgId && o.tipo_registro === 'ODS');

  console.log(`\n--- Org raw:`, matchedOrg);
  console.log(`--- Contato raw:`, matchedContato);
  console.log(`--- Territorio raw:`, matchedTerritorio);
  console.log(`--- Impacto raw:`, matchedImpacto);
  console.log(`--- Recurso raw:`, matchedRecurso);
  console.log(`--- Ods raw:`, matchedOds);

} catch (err) {
  console.error(err);
}
