/**
 * Ponto de entrada chamado pelo HTML.
 * Recebe os dados da Sidebar e gerencia o fluxo.
 */
function malaDireta(modeloId, modeloNome, intervalo, enviar_ou_n_email, assunto_email, corpo_email) {
  try {
    // 1. Gera os PDFs e pega os dados processados
    var resultado = gerarPDF(modeloId, modeloNome, intervalo);
    
    // 2. Lógica de Envio de E-mail (Se selecionado)
    if (enviar_ou_n_email !== "NÃO Enviar email") {
      var rascunho = (enviar_ou_n_email === "Enviar rascunho");
      
      // Itera sobre os resultados para enviar emails
      for (var i = 0; i < resultado.emails.length; i++) {
        var emailDestino = resultado.emails[i];
        var nomeDestino = resultado.nomes[i];
        var arquivoPdf = resultado.pdfs[i];
        
        if (emailDestino) {
          // Personaliza o corpo do email se tiver o placeholder [NOME]
          var corpoFinal = corpo_email.replace("[NOME]", nomeDestino);
          
          if (rascunho) {
            GmailApp.createDraft(emailDestino, assunto_email, corpoFinal, {
              attachments: [arquivoPdf]
            });
          } else {
            GmailApp.sendEmail(emailDestino, assunto_email, corpoFinal, {
              attachments: [arquivoPdf]
            });
          }
        }
      }
    }
    
    return "Sucesso"; // Retorna para o HTML fechar o spinner
    
  } catch (e) {
    // Se der erro, lança para o HTML exibir no alerta
    throw new Error("Erro no Script: " + e.message);
  }
}

/**
 * Função de geração de PDFs.
 */
function gerarPDF(modeloId, modeloNome, intervalo) {
  // --- Validação Inicial ---
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getActiveSheet();

  var dados = intervalo
      ? aba.getRange(intervalo).getValues()
      : aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues();

  var cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  dados = [cabecalho].concat(dados);

  // Valida colunas
  if (intervalo) {
    var numColunasIntervalo = aba.getRange(intervalo).getNumColumns();
    if (numColunasIntervalo < cabecalho.length) {
      throw new Error("O intervalo selecionado tem menos colunas que o cabeçalho.");
    }
    if (aba.getRange(intervalo).getRow() === 1) {
      dados = dados.slice(1);
    }
  }

  // --- Prepara Modelo ---
  try {
    var arquivoModelo = DriveApp.getFileById(modeloId);
    var pastaModelo = obterPastaDoc(arquivoModelo);
  } catch (e) {
    throw new Error("ID do modelo inválido ou sem permissão.");
  }

  var lista_nomes = [];
  var lista_emails = [];
  var lista_pdfs = [];
  var dicionario = [];

  // --- Processa Dados da Planilha ---
  for (var linha = 1; linha < dados.length; linha++) {
    // Pula linhas vazias
    if (dados[linha].every(c => c === "")) continue;

    var mini_dicionario = [];
    for (var coluna = 0; coluna < cabecalho.length; coluna++) {
      var informacao = dados[linha][coluna];
      mini_dicionario.push(informacao);

      if (dados[0][coluna] === "Nome" || dados[0][coluna] === "Nome completo") {
        lista_nomes.push(informacao);
      } else if (dados[0][coluna] === "Email") {
        lista_emails.push(informacao);
      }
    }
    dicionario.push(mini_dicionario);
  }

  // Identifica índice do Nome
  var indiceNome = cabecalho.indexOf("Nome");
  if (indiceNome === -1) indiceNome = cabecalho.indexOf("Nome completo");
  if (indiceNome === -1) throw new Error("Coluna 'Nome' não encontrada.");

  // --- GERAÇÃO DOS DOCUMENTOS ---
  for (var i = 0; i < dicionario.length; i++) {
    var pastaDestinoFinal = criarOuObterPasta(pastaModelo, modeloNome);
    
    // Nome do arquivo PDF
    var nomeArquivo = modeloNome + " - " + dicionario[i][indiceNome];
    var arquivoCopia = arquivoModelo.makeCopy(nomeArquivo, pastaDestinoFinal);
    var idCopia = arquivoCopia.getId();
    var documentoCopia = DocumentApp.openById(idCopia);
    var texto = documentoCopia.getBody();

    // 1. Substituição Genérica (baseada no cabeçalho)
    for (var j = 0; j < dicionario[i].length; j++) {
      var troca = dicionario[i][j];
      // Converte para string para evitar erro no replaceText se for data ou número      
      texto.replaceText(
        "{{" + cabecalho[j].replace(/[()]/g, "\\$&") + "}}", 
        troca
      );
    }

    // 2. Substituições Fixas
    texto.replaceText("{{data_extenso}}", dataExtenso());
    texto.replaceText("{{data_numerica}}", dataNumerica());
    
    // CORREÇÃO: Removemos a limpeza forçada do {{Nome}} aqui, pois se ele já foi substituído no passo 1, 
    // isso não fará nada. Se não foi, isso limparia o placeholder. Deixarei comentado por segurança.
    // texto.replaceText("{{Nome}}", ""); 
    
    // 3. SEU BLOCO PROBLEMÁTICO (CORRIGIDO)
    for (var w = 0; w < cabecalho.length; w++) {
      var valorCelula = dicionario[i][w];
      
      // Só tenta processar se a célula não estiver vazia
      if (valorCelula) {
        if (cabecalho[w] === "Carimbo de data/hora") {
          var data_extraida = dataExtenso2(valorCelula);
          texto.replaceText("{{data_extraida}}", data_extraida);
        }
        if (cabecalho[w] === "Data de nascimento") {
          var data_extraida = dataExtenso2(valorCelula);
          texto.replaceText("{{data_extraida2}}", data_extraida);
        }
      } else {
        // Se a data estiver vazia, substitui placeholder por vazio para não ficar {{...}} no PDF
        if (cabecalho[w] === "Carimbo de data/hora") texto.replaceText("{{data_extraida}}", "");
        if (cabecalho[w] === "Data de nascimento") texto.replaceText("{{data_extraida2}}", "");
      }
    }

    documentoCopia.saveAndClose();

    // Cria PDF
    var pdfBlob = DriveApp.getFileById(idCopia).getAs('application/pdf');
    var novo_pdf = pastaDestinoFinal.createFile(pdfBlob).setName(nomeArquivo + ".pdf");
    lista_pdfs.push(novo_pdf);

    // Deleta o Doc temporário
    DriveApp.getFileById(idCopia).setTrashed(true);
  }

  return {
    nomes: lista_nomes,
    emails: lista_emails,
    pdfs: lista_pdfs
  };
}