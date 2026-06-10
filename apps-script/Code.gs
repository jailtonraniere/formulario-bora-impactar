/**
 * Google Apps Script Backend — Bora Impactar
 * 
 * Provides API endpoints for the Smart Form.
 * Published as a Web App (run as owner, accessible by anyone).
 */

// Global configuration properties
var CONFIG = {
  APP_URL: "https://recife-bora-impactar.web.app", // Default client app URL
  DEFAULT_EMAIL_SENDER: "Bora Impactar <contato.boraimpactar@recife.pe.gov.br>"
};

/**
 * Helper to get the spreadsheet.
 * Tries SCRIPT_PROPERTIES "SPREADSHEET_ID" first, then container-bound active sheet.
 */
function getSpreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id && id.trim() !== "") {
    return SpreadsheetApp.openById(id);
  }
  return SpreadsheetApp.getActive();
}

/**
 * Standard response helper.
 */
function createResponse(success, data, errorCode, errorMessage) {
  var result = {
    success: success,
    data: data || null,
    error: success ? null : {
      code: errorCode || "ERROR",
      message: errorMessage || "Unknown error occurred"
    }
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET Request Handler (health check / basic lists retrieval).
 */
function doGet(e) {
  try {
    var action = e.parameter.action || "healthCheck";
    
    if (action === "healthCheck") {
      return createResponse(true, { 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: PropertiesService.getScriptProperties().getProperty("ENVIRONMENT") || "development"
      });
    }
    
    if (action === "getLists") {
      var lists = getListsData();
      return createResponse(true, lists);
    }
    
    return createResponse(false, null, "INVALID_ACTION", "Action not supported via GET.");
  } catch (err) {
    return createResponse(false, null, "SERVER_ERROR", err.toString());
  }
}

/**
 * POST Request Handler (all interactive operations).
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return createResponse(false, null, "BAD_REQUEST", "No payload provided.");
    }
    
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    
    if (!action) {
      return createResponse(false, null, "BAD_REQUEST", "Field 'action' is required.");
    }
    
    switch (action) {
      case "healthCheck":
        return createResponse(true, { status: "OK" });
      case "getLists":
        return createResponse(true, getListsData());
      case "searchOrganizations":
        return searchOrganizations(payload.query);
      case "requestAccess":
        return requestAccess(payload.organizacao_id);
      case "verifyAccess":
      case "getDraft":
        return getDraft(payload.token);
      case "saveDraft":
        return saveDraft(payload.token, payload.step, payload.percentage, payload.data);
      case "submitExistingOrganizationUpdate":
        return submitExistingOrganizationUpdate(payload.token, payload.data);
      case "submitNewOrganization":
        return submitNewOrganization(payload.data);
      case "registerAudit":
        return registerAudit(payload.organizacao_id, payload.acao, payload.detalhes);
      case "saveDocumentMetadata":
        return saveDocumentMetadata(payload.organizacao_id, payload.tipo_documento, payload.nome_arquivo, payload.link_drive);
      default:
        return createResponse(false, null, "INVALID_ACTION", "Action '" + action + "' is not supported.");
    }
  } catch (err) {
    return createResponse(false, null, "SERVER_ERROR", err.toString());
  }
}

/**
 * Reads data rows from a sheet starting from row 5 (0-indexed rawRows[4]).
 */
function getSheetRows(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length < 4) return [];
  
  var headers = values[3]; // Row 4 (0-indexed 3) is headers
  var dataRows = values.slice(4); // Row 5+ is data
  
  return dataRows.map(function(row, idx) {
    var obj = {};
    headers.forEach(function(header, cIdx) {
      if (header) {
        obj[header] = row[cIdx] !== undefined ? row[cIdx] : "";
      }
    });
    obj._rowNum = idx + 5; // 1-based row index in spreadsheet
    return obj;
  });
}

/**
 * Append row to spreadsheet sheet using column headers in Row 4.
 */
function appendRowToSheet(sheetName, dataObject) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' not found.");
  
  var values = sheet.getDataRange().getValues();
  var headers = values[3]; // Row 4 headers
  
  var newRow = headers.map(function(header) {
    if (!header) return "";
    return dataObject[header] !== undefined ? dataObject[header] : "";
  });
  
  sheet.appendRow(newRow);
  return sheet.getLastRow();
}

/**
 * Update row in spreadsheet.
 */
function updateRowInSheet(sheetName, rowNum, dataObject) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' not found.");
  
  var headers = sheet.getRange(4, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  headers.forEach(function(header, cIdx) {
    if (header && dataObject[header] !== undefined) {
      sheet.getRange(rowNum, cIdx + 1).setValue(dataObject[header]);
    }
  });
}

/**
 * Retrieve lookup lists.
 */
function getListsData() {
  var rows = getSheetRows("LISTAS");
  var lists = {};
  
  rows.forEach(function(row) {
    for (var key in row) {
      if (key !== "_rowNum" && row[key]) {
        if (!lists[key]) lists[key] = [];
        lists[key].push(row[key]);
      }
    }
  });
  return lists;
}

/**
 * Public Search for Organizations. Returns MINIMUM public data only.
 */
function searchOrganizations(query) {
  if (!query || query.trim() === "") {
    return createResponse(true, []);
  }
  
  var orgs = getSheetRows("ORGANIZACOES");
  var territories = getSheetRows("TERRITORIOS");
  
  // Create a map of neighborhood by orgId
  var territoryMap = {};
  territories.forEach(function(t) {
    if (t.organizacao_id) {
      territoryMap[t.organizacao_id] = t.bairro || "";
    }
  });
  
  var cleanQuery = query.toLowerCase().trim();
  var results = [];
  
  orgs.forEach(function(org) {
    if (!org.organizacao_id) return;
    
    var nameMatches = org.nome_oficial.toLowerCase().includes(cleanQuery) || 
                       org.nome_conhecido.toLowerCase().includes(cleanQuery);
    
    if (nameMatches) {
      results.push({
        id: org.organizacao_id,
        name: org.nome_oficial,
        tradingName: org.nome_conhecido || org.nome_oficial,
        neighborhood: territoryMap[org.organizacao_id] || "Recife",
        formalizationStatus: org.situacao_formalizacao || "",
        status: org.status_cadastro || "Rascunho"
      });
    }
  });
  
  return createResponse(true, results.slice(0, 30)); // Cap search at 30 items
}

/**
 * Initiates validation token access and generates email link.
 */
function requestAccess(orgId) {
  if (!orgId) {
    return createResponse(false, null, "BAD_REQUEST", "Organization ID is required.");
  }
  
  var orgs = getSheetRows("ORGANIZACOES");
  var matchedOrg = orgs.find(function(o) { return o.organizacao_id === orgId; });
  
  if (!matchedOrg) {
    return createResponse(false, null, "NOT_FOUND", "Organization not found.");
  }
  
  // Find email of contact
  var contacts = getSheetRows("CONTATOS");
  var matchedContact = contacts.find(function(c) { 
    return c.organizacao_id === orgId; 
  });
  
  var orgEmail = matchedContact ? matchedContact.email : "";
  if (!orgEmail || orgEmail.trim() === "") {
    return createResponse(false, null, "NO_EMAIL_CONFIGURED", "This organization has no email contact configured in the system. Please contact technical support.");
  }
  
  // Generate random secure token
  var token = "tok_" + generateRandomString(32);
  var rascunhos = getSheetRows("RASCUNHOS");
  
  // Load existing data to populate the draft
  var fullData = getMergedOrganizationData(orgId, matchedOrg);
  
  // Upsert draft row
  var existingDraft = rascunhos.find(function(r) { return r.organizacao_id === orgId; });
  var draftRow = {
    organizacao_id: orgId,
    codigo_acesso: token,
    email: orgEmail,
    etapa_atual: 1,
    percentual_conclusao: 0,
    dados_json: JSON.stringify(fullData),
    data_ultimo_salvamento: new Date().toLocaleDateString("pt-BR"),
    status: "Rascunho"
  };
  
  if (existingDraft) {
    draftRow.rascunho_id = existingDraft.rascunho_id;
    draftRow.data_criacao = existingDraft.data_criacao;
    updateRowInSheet("RASCUNHOS", existingDraft._rowNum, draftRow);
  } else {
    draftRow.rascunho_id = "ras_" + generateRandomString(12);
    draftRow.data_criacao = new Date().toLocaleDateString("pt-BR");
    appendRowToSheet("RASCUNHOS", draftRow);
  }
  
  // Audit log creation
  writeAuditLog(orgId, "SOLICITAR_ACESSO", "Token de acesso gerado.");
  
  // Format masked email for safety response
  var maskedEmail = maskEmail(orgEmail);
  var linkUrl = CONFIG.APP_URL + "/?token=" + token;
  
  // Dispatch email
  try {
    var emailBody = "Olá,\n\nRecebemos uma solicitação de atualização cadastral para " + matchedOrg.nome_oficial + ".\n\n" +
                    "Use o link exclusivo abaixo para acessar com segurança o formulário e complementar suas informações:\n\n" +
                    linkUrl + "\n\n" +
                    "Este link é individual e expira após o preenchimento.\n\n" +
                    "Atenciosamente,\nEquipe Bora Impactar - Prefeitura do Recife";
                    
    MailApp.sendEmail(orgEmail, "Formulário Bora Impactar — Link de Acesso Seguro", emailBody, {
      name: "Bora Impactar"
    });
  } catch (emailErr) {
    Logger.log("Failed to send email to: " + orgEmail + ". Error: " + emailErr.toString());
  }
  
  // Return masked email and the token (in development/logs only)
  return createResponse(true, {
    emailMasked: maskedEmail,
    // Return token in payload for developer/user simulator to access without reading email
    developmentToken: token 
  });
}

/**
 * Retrieve pre-filled draft using token.
 */
function getDraft(token) {
  if (!token) {
    return createResponse(false, null, "BAD_REQUEST", "Token parameter is missing.");
  }
  
  var rascunhos = getSheetRows("RASCUNHOS");
  var matchedDraft = rascunhos.find(function(r) { return r.codigo_acesso === token; });
  
  if (!matchedDraft) {
    return createResponse(false, null, "UNAUTHORIZED", "Access token is invalid or expired.");
  }
  
  var parsedData = JSON.parse(matchedDraft.dados_json);
  
  // Look up original database data for comparison
  var orgId = matchedDraft.organizacao_id;
  var originalDados = null;
  if (orgId && !orgId.startsWith("BI-TEMP-")) {
    var orgs = getSheetRows("ORGANIZACOES");
    var matchedOrg = orgs.find(function(o) { return o.organizacao_id === orgId; });
    if (matchedOrg) {
      originalDados = getMergedOrganizationData(orgId, matchedOrg);
    }
  }
  
  writeAuditLog(matchedDraft.organizacao_id, "VALIDAR_ACESSO", "Acesso ao formulário verificado pelo token.");
  
  return createResponse(true, {
    organizacao_id: matchedDraft.organizacao_id,
    etapa_atual: Number(matchedDraft.etapa_atual) || 1,
    percentual_conclusao: Number(matchedDraft.percentual_conclusao) || 0,
    dados: parsedData,
    originalDados: originalDados
  });
}

/**
 * Auto-save draft.
 */
function saveDraft(token, step, percentage, data) {
  if (!token) {
    return createResponse(false, null, "BAD_REQUEST", "Token parameter is missing.");
  }
  
  var rascunhos = getSheetRows("RASCUNHOS");
  var matchedDraft = rascunhos.find(function(r) { return r.codigo_acesso === token; });
  
  if (!matchedDraft) {
    return createResponse(false, null, "UNAUTHORIZED", "Token is invalid.");
  }
  
  var updateData = {
    etapa_atual: step || matchedDraft.etapa_atual,
    percentual_conclusao: percentage !== undefined ? percentage : matchedDraft.percentual_conclusao,
    dados_json: JSON.stringify(data),
    data_ultimo_salvamento: new Date().toLocaleDateString("pt-BR")
  };
  
  updateRowInSheet("RASCUNHOS", matchedDraft._rowNum, updateData);
  
  return createResponse(true, { message: "Draft auto-saved successfully." });
}

/**
 * Submits updates for an existing organization.
 * MUST NOT overwrite the main database. Appends details to ATUALIZACOES.
 */
function submitExistingOrganizationUpdate(token, data) {
  if (!token) {
    return createResponse(false, null, "BAD_REQUEST", "Token is required.");
  }
  
  var rascunhos = getSheetRows("RASCUNHOS");
  var matchedDraft = rascunhos.find(function(r) { return r.codigo_acesso === token; });
  
  if (!matchedDraft) {
    return createResponse(false, null, "UNAUTHORIZED", "Token is invalid.");
  }
  
  var orgId = matchedDraft.organizacao_id;
  var protocol = generateProtocolCode();
  
  var submission = {
    atualizacao_id: "upd_" + generateRandomString(12),
    organizacao_id: orgId,
    protocolo: protocol,
    tipo_solicitacao: "Atualização",
    status: "Enviado",
    data_inicio: matchedDraft.data_criacao,
    data_envio: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
    responsavel_preenchimento: data.fillerName || data.legalRepName || "",
    email_responsavel: matchedDraft.email,
    etapa_atual: 8,
    percentual_conclusao: 100,
    observacao_equipe: "Aguardando análise da equipe técnica.",
    dados_json: JSON.stringify(data) // Append the full update payload in custom column
  };
  
  appendRowToSheet("ATUALIZACOES", submission);
  
  // Log audit event
  writeAuditLog(orgId, "SUBMETER_FORMULARIO", "Atualização enviada para triagem. Protocolo: " + protocol);
  
  // Clear rascunho
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("RASCUNHOS");
  sheet.deleteRow(matchedDraft._rowNum);
  
  return createResponse(true, {
    protocol: protocol,
    message: "Solicitação de atualização enviada com sucesso."
  });
}

/**
 * Submits a new organization registration.
 * Appends details to ATUALIZACOES.
 */
function submitNewOrganization(data) {
  var tempId = "BI-TEMP-" + generateRandomString(6).toUpperCase();
  var protocol = generateProtocolCode();
  
  var submission = {
    atualizacao_id: "upd_" + generateRandomString(12),
    organizacao_id: tempId,
    protocolo: protocol,
    tipo_solicitacao: "Novo Cadastro",
    status: "Enviado",
    data_inicio: new Date().toLocaleDateString("pt-BR"),
    data_envio: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
    responsavel_preenchimento: data.fillerName || data.legalRepName || "",
    email_responsavel: data.email || "",
    etapa_atual: 8,
    percentual_conclusao: 100,
    observacao_equipe: "Novo cadastro aguardando triagem.",
    dados_json: JSON.stringify(data)
  };
  
  appendRowToSheet("ATUALIZACOES", submission);
  
  // Log audit event
  writeAuditLog(tempId, "SUBMETER_NOVO_CADASTRO", "Novo cadastro enviado. Protocolo: " + protocol);
  
  return createResponse(true, {
    protocol: protocol,
    message: "Novo cadastro enviado com sucesso para triagem."
  });
}

/**
 * Registry events to AUDITORIA sheet.
 */
function registerAudit(orgId, acao, detalhes) {
  writeAuditLog(orgId || "SYSTEM", acao, detalhes);
  return createResponse(true, { message: "Audit logged." });
}

/**
 * Save file metadata to DOCUMENTOS.
 */
function saveDocumentMetadata(orgId, tipoDoc, nomeArq, linkDrive) {
  var docObj = {
    documento_id: "doc_" + generateRandomString(12),
    organizacao_id: orgId || "BI-TEMP",
    tipo_documento: tipoDoc,
    nome_arquivo: nomeArq,
    link_drive: linkDrive,
    data_envio: new Date().toLocaleDateString("pt-BR"),
    autorizado_divulgacao: "Sim"
  };
  
  appendRowToSheet("DOCUMENTOS", docObj);
  return createResponse(true, docObj);
}

/**
 * Write a row to the AUDITORIA tab.
 */
function writeAuditLog(orgId, action, details) {
  try {
    var auditRow = {
      registro_id: "aud_" + generateRandomString(12),
      data_hora: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
      acao: action,
      organizacao_id: orgId || "SYSTEM",
      usuario: "Sistema Form",
      campo_alterado: "Geral",
      informacao_anterior: "",
      informacao_nova: "",
      resultado: details || ""
    };
    appendRowToSheet("AUDITORIA", auditRow);
  } catch (e) {
    Logger.log("Failed to write audit log: " + e.toString());
  }
}

/**
 * Merges relational rows from sheet database into a single flat JSON for OrgId.
 */
function getMergedOrganizationData(orgId, matchedOrg) {
  var data = {
    id: orgId,
    name: matchedOrg.nome_oficial || "",
    tradingName: matchedOrg.nome_conhecido || "",
    formalizationStatus: matchedOrg.situacao_formalizacao || "",
    cnpj: matchedOrg.cnpj || "",
    foundationYear: matchedOrg.ano_fundacao || "",
    legalNature: matchedOrg.natureza_juridica || "",
    certifications: matchedOrg.certificacoes ? matchedOrg.certificacoes.split(", ") : [],
    certificationsOther: matchedOrg.certificacoes_outras || "",
    history: matchedOrg.historia || "",
    mission: matchedOrg.missao || "",
    vision: matchedOrg.visao || "",
    values: matchedOrg.valores || "",
    mainCause: matchedOrg.causa_principal || "",
    secondaryCauses: matchedOrg.causas_relacionadas ? matchedOrg.causas_relacionadas.split(", ") : [],
    socialProblem: matchedOrg.problema_social || "",
    relevanceRecife: matchedOrg.relevancia_recife || "",
    mainActivities: matchedOrg.atividades || "",
    differentiator: matchedOrg.diferencial || "",
    operatingHours: matchedOrg.horario_funcionamento || "",
    status: matchedOrg.status_cadastro || "Rascunho"
  };
  
  // Merge address (TERRITORIOS)
  var territories = getSheetRows("TERRITORIOS");
  var t = territories.find(function(item) { return item.organizacao_id === orgId; });
  if (t) {
    data.cep = t.cep || "";
    data.street = t.logradouro || "";
    data.number = t.numero || "";
    data.complement = t.complemento || "";
    data.neighborhood = t.bairro || "";
    data.city = t.cidade || "Recife";
    data.state = t.estado || "PE";
    data.rpa = t.rpa || "";
    data.communitiesOfActivity = t.comunidade || "";
  }
  
  // Merge contacts (CONTATOS)
  var contacts = getSheetRows("CONTATOS");
  var c = contacts.find(function(item) { return item.organizacao_id === orgId; });
  if (c) {
    data.legalRepName = c.legal_rep_nome || c.nome || "";
    data.legalRepRole = c.legal_rep_funcao || c.funcao || "";
    data.fillerName = c.filler_nome || "";
    data.fillerRole = c.filler_funcao || "";
    data.phone = c.telefone || "";
    data.whatsapp = c.whatsapp || "";
    data.email = c.email || "";
    data.website = c.site || "";
    data.instagram = c.instagram || "";
    data.facebook = c.facebook || "";
    data.linkedin = c.linkedin || "";
    data.youtube = c.youtube || "";
    data.otherSocials = c.outras_redes || "";
    data.phonePermission = c.uso_interno || "internal";
    data.whatsappPermission = c.compartilhar_empresas || "partners";
    data.emailPermission = c.publicar_catalogo || "public";
  }
  
  // Merge impact (IMPACTO)
  var impacts = getSheetRows("IMPACTO");
  var imp = impacts.find(function(item) { return item.organizacao_id === orgId; });
  if (imp) {
    data.servedLast12Months = imp.pessoas_atendidas || "";
    data.totalAttendancesLast12Months = imp.atendimentos_realizados || "";
    data.isEstimateOrExact = imp.numero_exato_ou_estimado || "";
    data.mainResultsSummary = imp.resultado_descricao || "";
    data.indicatorStatus = imp.situacao_indicadores || "";
    data.resultsTrackingMethod = imp.forma_acompanhamento || "";
    data.evaluationFrequency = imp.frequencia_avaliacao || "";
    data.goalsNext12Months = imp.metas_12_meses || "";
    data.hasActivityReport = String(imp.possui_relatorio_atividades).toLowerCase() === "sim";
    data.hasImpactReport = String(imp.possui_relatorio_impacto).toLowerCase() === "sim";
    data.hasTestimonials = String(imp.possui_casos_sucesso).toLowerCase() === "sim";
    data.authorizeTestimonialsPublishing = String(imp.autoriza_divulgacao_relatos).toLowerCase() === "sim";
    data.audiences = imp.publicos_atendidos ? imp.publicos_atendidos.split(", ") : [];
    data.ageRanges = imp.faixas_etarias ? imp.faixas_etarias.split(", ") : [];
  }
  
  // Merge resources (RECURSOS)
  var recs = getSheetRows("RECURSOS");
  var r = recs.find(function(item) { return item.organizacao_id === orgId; });
  if (r) {
    data.annualBudgetRange = r.faixa_orcamento_anual || "";
    data.revenueSources = r.fontes_receita ? r.fontes_receita.split(", ") : [];
    data.hasInstitutionalBankInstAccount = String(r.possui_conta_institucional).toLowerCase() === "sim";
    data.canReceiveCorporateDonations = String(r.recebe_doacoes_empresariais).toLowerCase() === "sim";
    data.emitsReceipts = String(r.emite_recibos).toLowerCase() === "sim";
    data.hasApprovedIncentiveProject = String(r.possui_projeto_lei_incentivo).toLowerCase() === "sim";
    data.incentiveProjectName = r.nome_projeto_incentivado || "";
    data.incentiveProjectLawName = r.lei_incentivo || "";
    data.incentiveApprovedValue = r.valor_aprovado || "";
    data.incentiveCaptationDeadline = r.prazo_captacao || "";
    data.incentiveProjectCurrentStatus = r.situacao_captacao || "";
    data.hasReceivedCorporateSupport = String(r.recebeu_apoio_empresas).toLowerCase() === "sim";
    data.supportedCompaniesNames = r.empresas_apoiadoras || "";
    data.authorizeCitingCompanies = String(r.autoriza_citar_empresas).toLowerCase() === "sim";
    data.seeksNewPartners = String(r.busca_novos_parceiros).toLowerCase() === "sim";
    data.hasCompanyRelationStaff = String(r.responsavel_parcerias).toLowerCase() === "sim";
  }
  
  // Merge ODS_GOVERNANCA (load lists of ODS numbers)
  var odsGovData = getSheetRows("ODS_GOVERNANCA");
  var myOds = odsGovData.filter(function(item) {
    return item.organizacao_id === orgId && item.tipo_registro === "ods";
  });
  
  data.selectedOdsList = [];
  data.priorityOdsList = [];
  data.odsExplanations = {};
  
  myOds.forEach(function(item) {
    var odsKey = "ods_" + item.ods_numero;
    data.selectedOdsList.push(odsKey);
    if (String(item.ods_prioritario).toLowerCase() === "sim") {
      data.priorityOdsList.push(odsKey);
      data.odsExplanations[odsKey] = item.contribuicao_ods || "";
    }
  });
  
  return data;
}

/**
 * Utility helper to generate standard unique protocol.
 */
function generateProtocolCode() {
  var year = new Date().getFullYear();
  var randNum = Math.floor(100000 + Math.random() * 900000);
  return "BI-" + year + "-" + randNum;
}

/**
 * Helper to generate random keys.
 */
function generateRandomString(length) {
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Masks an email for protection.
 * ex: contatos@entidade.org -> co******@entidade.org
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  var parts = email.split("@");
  var name = parts[0];
  var domain = parts[1];
  
  if (name.length <= 2) {
    return name + "***@" + domain;
  }
  return name.substring(0, 2) + "*****" + name.substring(name.length - 1) + "@" + domain;
}
