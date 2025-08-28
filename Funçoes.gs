/**
 * Gera arquivos PDF a partir de um modelo do Google Docs, preenchendo placeholders com dados de uma planilha do Google Sheets.
 * @param {string} modeloId - ID do arquivo modelo no Google Drive.
 * @param {string} [intervalo] - Intervalo de células da planilha (ex.: "A1:C10"). Se não informado, usa todos os dados da aba ativa.
 * @param {string} [endereco_planilha] - URL ou ID de um arquivo modelo alternativo no Google Drive. Se não informado, usa modeloId.
 * @returns {Object} Objeto contendo duas listas: `emails` (lista de endereços de e-mail extraídos) e `pdfs` (lista de objetos File dos PDFs gerados).
 */
function gerarPDF(modeloId, intervalo, endereco_planilha, data_hoje) {
  try{
    //Configurações para abrir a planilha,aba e intervalo
    var planilha = SpreadsheetApp.getActiveSpreadsheet();  // Pega a planilha aberta no navegador
    var aba = planilha.getActiveSheet();  // Pega a aba da planilha aberta no navegador
    var dados = intervalo ? aba.getRange(intervalo).getValues() : aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues(); // O intervalod será o valor informado ou a aba toda
    var cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0]; // pega a primeira linha, primeira coluna e termina na primeira linha e ultima coluna
    dados = [cabecalho].concat(dados); 

    Logger.log("dados: " + dados);
    Logger.log("cabeçalho: " + cabecalho);

    // Validação do número de colunas
    if (intervalo) {
      var numColunasIntervalo = aba.getRange(intervalo).getNumColumns();
      if (numColunasIntervalo < cabecalho.length) {
          throw new Error("O intervalo informado (" + intervalo + ") tem menos colunas (" + numColunasIntervalo + ") do que o cabeçalho (" + cabecalho.length + "). Inclua todas as colunas necessárias.");
  }
    }

    if (intervalo && aba.getRange(intervalo).getRow() === 1) {
    dados = dados.slice(1); // Remove a primeira linha se o intervalo incluir o cabeçalho
  }
    
    Logger.log("dados: " + dados);
    Logger.log("cabeçalho: " + cabecalho);
  
  
  }catch (e){
    Logger.log("intervalo: " + intervalo);
    throw new Error("Intervalo inválido: '" + intervalo + "'. Use o formato A1:D10.");
  }


  var arquivoModelo_digitado = endereco_planilha;

  try{
    var arquivoModelo = arquivoModelo_digitado ? DriveApp.getFileById(arquivoModelo_digitado.match(/[-\w]{25,}/)[0]) : DriveApp.getFileById(modeloId);
    Logger.log("Arquivo modelo" + arquivoModelo);

  }catch (e){
    Logger.log("Arquivo modelo: " + arquivoModelo);
    throw new Error("Endereço URL inválido. Verifique o link informado");

  }
  
  var lista_nomes = [];
  var lista_emails = [];
  var lista_pdfs = [];



  //CRIAÇÃO DE UM DICIONARIO COM MINIDICIONARIOS
  //Armazena o cabeçalho da planilha



  //Armazena o dicionário em listas - cada lista é um mini_dicionário para cada linha diferente
  var dicionario = [];

  //Cada iteração linha, obtem todos os dados das colunas e armazena num mini_dicionario diferente 
  for (var linha = 1; linha < dados.length; linha++) {
    var mini_dicionario = [];


    // Verifica se a linha é vazia (todas as células são "")
    var vazio = dados[linha].every(cell => cell === "");
    if (vazio) {
      continue; // Pula a linha em branco
    }

    for (var coluna = 0; coluna < cabecalho.length; coluna++) {
      var informacao = dados[linha][coluna];
      mini_dicionario.push(informacao);


      //verifica se é email
      if (dados[0][coluna] === "Nome"){
        lista_nomes.push(informacao)
      }
      else if(dados[0][coluna] === "Email"){
        lista_emails.push(informacao)
      }

    }

    dicionario.push(mini_dicionario);
  }
  Logger.log(dicionario);



  //APLICANDO O DICIONÁRIO, SALVANDO O ARQUIVO EM PDF e armazenando a id dos PDFs em uma lista
  //Cada iteração i percorre cada linha e cada iteração j aplica o dicionário para cada coluna 
  for (var i = 0; i < dicionario.length; i++) {    
    //Faz uma cópia do arquivoModolo e abre
    var arquivoCopia = arquivoModelo.makeCopy(dicionario[i][cabecalho.indexOf("Nome")]);
    var idCopia = arquivoCopia.getId();
    var documentoCopia = DocumentApp.openById(idCopia);
    var texto = documentoCopia.getBody();

    for (var j = 0; j < dicionario[i].length; j++) {
      var troca = dicionario[i][j];
      texto.replaceText("{{" + cabecalho[j] + "}}",troca);
    }
    documentoCopia.saveAndClose();

    
    texto.replaceText("{{data_hoje}}",data_hoje);
    Logger.log("data de hoje: " + data_hoje);


    // Converte o documento PDF
    var pdf = DriveApp.getFileById(idCopia).getAs('application/pdf');
    var novo_pdf = DriveApp.createFile(pdf);
    novo_pdf.setName(dicionario[i][cabecalho.indexOf("Nome")] + ".pdf");
    lista_pdfs.push(novo_pdf)



    // Exclui a cópia do documento do Drive (movendo para a lixeira)
    DriveApp.getFileById(idCopia).setTrashed(true);
  }
  return {
  nomes: lista_nomes,
  emails: lista_emails,
  pdfs: lista_pdfs
  }; 
}


function gerarEmail(lista_nomes, lista_emails, lista_pdfs, assunto_email, corpo_email) {
  for (var i = 0; i < lista_emails.length; i++) {    
    var destinatario = lista_emails[i];

    // Definindo o assunto
    var assunto = assunto_email ? assunto_email : "Envio de documento em anexo";
    Logger.log("Assunto definido: " + assunto);

    // Definindo o corpo bruto (do usuário ou padrão)
    var corpo_bruto = corpo_email ? corpo_email : "Prezado(a) {{NOME}},\n\nEncaminhamos em anexo o documento gerado via mala direta para sua apreciação. \n\n\n Atenciosamente, \n\n Secretaria de Pós-Graduação/Graduate Studies Office \n Instituto de Física da USP/Institute of Physics - USP \n http://portal.if.usp.br/pg";

    // Substitui \n por <br> para manter quebras de linha no HTML
    corpo_bruto = corpo_bruto.replace(/\n/g, "<br>");

    // Substitui o [NOME] pelo nome correto
    var corpo_com_nome = corpo_bruto.replace("{{NOME}}", lista_nomes[i]);

    // Formatando o corpo final com a fonte desejada
    var corpo_html = '<div style="font-family: sans-serif, Arial, Verdana; font-size: 14px;">' + corpo_com_nome + '</div>';
    Logger.log("Corpo final em HTML: " + corpo_html);

    // Criar o rascunho
    var email = GmailApp.sendEmail(destinatario, assunto, '', {
      htmlBody: corpo_html,
      attachments: [lista_pdfs[i].getBlob()]
    });

    Logger.log("Texto de e-mail criado com ID: " + email.getId());
  }
}




function gerarRascunho(lista_nomes, lista_emails, lista_pdfs, assunto_email, corpo_email) {
  for (var i = 0; i < lista_emails.length; i++) {    
    var destinatario = lista_emails[i];

    // Definindo o assunto
    var assunto = assunto_email ? assunto_email : "Envio de documento em anexo";
    Logger.log("Assunto definido: " + assunto);

    // Definindo o corpo bruto (do usuário ou padrão)
    var corpo_bruto = corpo_email ? corpo_email : "Prezado(a) {{NOME}},\n\nEncaminhamos em anexo o documento gerado via mala direta para sua apreciação. \n\n\n Atenciosamente, \n\n Secretaria de Pós-Graduação/Graduate Studies Office \n Instituto de Física da USP/Institute of Physics - USP \n http://portal.if.usp.br/pg";

    // Substitui \n por <br> para manter quebras de linha no HTML
    corpo_bruto = corpo_bruto.replace(/\n/g, "<br>");

    // Substitui o [NOME] pelo nome correto
    var corpo_com_nome = corpo_bruto.replace("{{NOME}}", lista_nomes[i]);

    // Formatando o corpo final com a fonte desejada
    var corpo_html = '<div style="font-family: sans-serif, Arial, Verdana; font-size: 14px;">' + corpo_com_nome + '</div>';
    Logger.log("Corpo final em HTML: " + corpo_html);

    // Criar o rascunho
    var rascunho = GmailApp.createDraft(destinatario, assunto, '', {
      htmlBody: corpo_html,
      attachments: [lista_pdfs[i].getBlob()]
    });

    Logger.log("Rascunho de e-mail criado com ID: " + rascunho.getId());
  }
}





function malaDireta(modeloId, intervalo, endereco_planilha, enviar_ou_n_email, assunto_email, corpo_email) {
  var resultado = gerarPDF(modeloId, intervalo,endereco_planilha,assunto_email, corpo_email);

  if (enviar_ou_n_email === "Enviar rascunho"){
    gerarRascunho(resultado.nomes, resultado.emails, resultado.pdfs, assunto_email, corpo_email);
  }
  else if(enviar_ou_n_email === "Enviar email"){
    gerarEmail(resultado.nomes, resultado.emails, resultado.pdfs, assunto_email, corpo_email);

  }
}
