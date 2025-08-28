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

## 🔧 Como usar
1. Crie uma planilha no Google Sheets com os dados (incluindo colunas como Nome e Email).  
2. Crie um modelo no Google Docs com os placeholders (`{{Nome}}`, `{{Email}}`, etc).  
3. Cole o código `Code.gs` no editor de scripts da planilha.  
4. Execute a função `mostrarSidebar()` para iniciar a automação.  

## 📬 Exemplo de uso
Imagine uma secretaria acadêmica que precisa enviar certificados para 100 alunos:  
- Basta colocar os nomes e e-mails na planilha.  
- O sistema gera os PDFs personalizados e envia para cada aluno automaticamente.  

---
🔗 Autor: [Andrey da Silva Araujo](https://github.com/araujo-andrey)  
