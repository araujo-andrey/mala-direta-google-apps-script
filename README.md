# Mala Direta Automatizada com Google Apps Script

Este projeto automatiza o envio de **mala direta personalizada** a partir de dados no Google Sheets, integrando com Google Docs e Gmail.

## 📌 Funcionalidades
- Geração automática de PDFs a partir de modelos do Google Docs
- Substituição de placeholders por dados da planilha
- Envio de e-mails personalizados com anexos
- Criação de rascunhos no Gmail
- Interface amigável via barra lateral no Google Sheets

## 🚀 Tecnologias utilizadas
- Google Apps Script (JavaScript)
- Google Sheets
- Google Docs
- Gmail API

## 📂 Estrutura do projeto
- `Code.gs` → script principal com todas as funções
- `appsscript.json` → arquivo de configuração do projeto (obrigatório para importar como projeto no Apps Script)

## 🔧 Como usar

1. **Planilha de dados**  
   - Crie uma planilha no Google Sheets contendo pelo menos as colunas obrigatórias:  
     `Nome` | `Email`  
   - Outras colunas podem ser adicionadas para substituir placeholders no modelo do Google Docs, como `Curso`, `Data`, etc.  
   - **Atenção:** se faltar a coluna `Nome` ou `Email`, o script não funcionará.

2. **Modelo do documento**  
   - Crie um Google Docs com os placeholders correspondentes (ex.: `{{Nome}}`, `{{Email}}`, `{{Curso}}`).

3. **Importar código**  
   - Cole o arquivo `Code.gs` no editor de scripts da planilha.  
   - Inclua também o `appsscript.json` se estiver usando o projeto versionado.

4. **Ativar a barra lateral**  
   - Para que a sidebar funcione como Add-on, crie um **Add-on de teste**:  
     - No editor do Apps Script, clique em **Executar > Testar Add-on**.  
     - Escolha a planilha onde deseja testar.  
     - A barra lateral aparecerá no menu **Extensões > Add-ons > Testar**.

5. **Gerar PDFs e enviar e-mails**  
   - Selecione o modelo, o intervalo de dados, configure se quer enviar e-mails ou criar rascunhos, e clique em **Iniciar Mala Direta**.

## 📬 Exemplo de uso
Imagine uma secretaria acadêmica que precisa enviar certificados para 100 alunos:  
- Basta colocar os nomes e e-mails na planilha.  
- O sistema gera os PDFs personalizados e envia para cada aluno automaticamente.

---
🔗 Autor: [Andrey da Silva Araujo](https://github.com/araujo-andrey)



