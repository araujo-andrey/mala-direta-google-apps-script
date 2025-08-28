function mostrarSidebar() {
  
  //Modelos de documentos disponíveis para gerar os PDFs
  
  var planilha2 = SpreadsheetApp.openById("1AMU_O8DOqh1WQaOXh8dyqiB-OkQY4ZkPhuN_HQOvl4E");
  var aba2 = planilha2.getSheetByName("Página1");
  var nomeModelos = aba2.getRange(2, 1, aba2.getLastRow() - 1, 1).getValues();
  var idModelos = aba2.getRange(2, 2, aba2.getLastRow() - 1, 1).getValues();

  let modelos = {};
  for (let i = 0; i < nomeModelos.length; i++) {
    modelos["📄 " + nomeModelos[i]] = idModelos[i];
  }


  //parte para retornar a id do docuemnto
  var opcoes1 = `<option value="">Selecione...</option>` + 
    Object.entries(modelos).map(([nome, id]) => {
      return `<option value="${id}">${nome}</option>`;
    }).join("");


  //Modelos de documentos disponíveis para gerar os PDFs
  var enviar_ou_n_email = {
  "NÃO Enviar email": "NÃO Enviar email",
  "Enviar email": "Enviar email",
  "Enviar rascunho": "Enviar rascunho",
  }


  //parte para retornar a opção escolhida
  var opcoes2 = Object.entries(enviar_ou_n_email).map(([nome, id]) => {
      return `<option value="${id}">${nome}</option>`;
    }).join("");




  var htmlContent = `
    <style>
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        font-size: 14px;
        color: #333;
        padding: 10px;
      }

      .secao {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: #f9f9f9;
      }

      input, select {
        width: 100%;
        padding: 6px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }

      button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      button:hover {
        background-color: #45a049;
      }

      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
        margin: auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      #status {
        margin-top: 10px;
        font-style: italic;
      }
    </style>

    <div class="secao">
      <h3>📄 1 - Modelo do Documento</h3>
      <p>Escolha um modelo de documento no Google Drive para gerar os PDFs:</p>
      
      <p>Informe a URL do documento (opcional):</p>
      <input type="text" id="endereco_planilha" placeholder="https://docs.google.com/document/..." title="Cole aqui o link completo do documento Google Docs" />

      <p>ou selecione um modelo:</p>
      <select id="modeloSelecionado" title="Escolha um modelo da lista">
        ${opcoes1}
      </select>
    </div>

    <div class="secao">
      <h3>📊 2 - Intervalo de Dados</h3>
      <p>Informe o intervalo da planilha (ex: A2:D10) ou deixe em branco para usar tudo:</p>
      <input type="text" id="intervalo" placeholder="A2:D10" title="Intervalo como A2:D10" />
    </div>

    <div class="secao">
      <h2>📬 3 - E-mail</h2>
      <p>Escolha a opção abaixo:</p>
      <select id="enviar_ou_n_email" title="Escolha">
        ${opcoes2}
      </select>      
      <p>Informe o assunto do email:</p>
      <input type="text" id="assunto_email" placeholder="Rascunho para o email: + lista_emails[i] + criado pela mala direta" title="Assunto do email" />

      <p>Corpo do email:</p>
      <textarea id="corpo_email"
      placeholder="Prezado(a) [NOME],&#10;&#10;Encaminhamos em anexo o documento gerado via mala direta para sua apreciação.&#10;&#10;Atenciosamente,&#10;&#10;Secretaria de Pós-Graduação/Graduate Studies Office&#10;Instituto de Física da USP/Institute of Physics - USP&#10;http://portal.if.usp.br/pg"
      title="Corpo do email"
      oninput="autoResize(this)"></textarea>


        <script>
          // Função que ajusta automaticamente o tamanho do campo
          function autoResize(textarea) {
            // Resetando a altura para calcular o novo tamanho
            textarea.style.height = 'auto'; 
            // Ajusta a altura para o conteúdo
            textarea.style.height = (textarea.scrollHeight) + 'px';
          }
        </script>

      </div>
      
    <div class="secao">      
      <p>Clique abaixo para executar:</p>
      <button id="btnGerar" onclick="executarMalaDireta()">Iniciar Mala Direta</button>

      <div id="status"></div>
      <div id="spinner" style="display:none; margin-top: 10px;">
        <div class="loader"></div>
      </div>
    </div>

    <script>
      function executarMalaDireta() {
        var modeloId = document.getElementById("modeloSelecionado").value;
        var intervalo = document.getElementById("intervalo").value;
        var endereco_planilha = document.getElementById("endereco_planilha").value;
        var enviar_ou_n_email = document.getElementById("enviar_ou_n_email").value;
        var assunto_email = document.getElementById("assunto_email").value;
        var corpo_email = document.getElementById("corpo_email").value;


        if (!modeloId && !endereco_planilha) {
          alert("Por favor, selecione um modelo ou informe a URL do documento.");
          return;
        }

        document.getElementById("btnGerar").disabled = true;
        document.getElementById("status").innerText = "🔄 Processando, por favor aguarde...";
        document.getElementById("spinner").style.display = "block";

        google.script.run
          .withSuccessHandler(function() {
            document.getElementById("status").innerHTML = "✅ Mala direta concluída com sucesso!";
            document.getElementById("spinner").style.display = "none";
            document.getElementById("btnGerar").disabled = false;
          })
          .withFailureHandler(function(error) {
            document.getElementById("status").innerText = "";
            document.getElementById("spinner").style.display = "none";
            document.getElementById("btnGerar").disabled = false;
            alert("❌ Ocorreu um erro: " + error.message);
          })
          .malaDireta(modeloId, intervalo, endereco_planilha, enviar_ou_n_email, assunto_email, corpo_email);
      }
    </script>
  `;

  var html = HtmlService.createHtmlOutput(htmlContent)
    .setTitle("Gerar PDF e Mala Direta");
  SpreadsheetApp.getUi().showSidebar(html);
}
