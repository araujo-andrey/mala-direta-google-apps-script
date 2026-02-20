function extrairData() {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth();
  var ano = data.getFullYear();
  return {dia, mes, ano};
}

function dataNumerica() {

  var data_hoje = extrairData();


  var diaStr = data_hoje.dia < 10 ? "0" + data_hoje.dia : data_hoje.dia;
  var mesStr = (data_hoje.mes + 1) < 10 ? "0" + (data_hoje.mes + 1) : data_hoje.mes + 1;
  var anoStr = data_hoje.ano;

  Logger.log(diaStr + "/" + mesStr + "/" + anoStr)
  var data_numerica = diaStr + "/" + mesStr + "/" + anoStr;
  return data_numerica;
}

function dataExtenso(){
  
  var data_hoje = extrairData();
  
  var diaStr = data_hoje.dia < 10 ? "0" + data_hoje.dia : data_hoje.dia;
  var nome_mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var anoStr = data_hoje.ano;

  var data_extenso = diaStr + " de "+ nome_mes[data_hoje.mes]+ " de "+ anoStr;
  Logger.log(data_extenso);
  return data_extenso;
}


function extrairData2(data_celula) {
  // Se receber uma string, converte para Date
  var data = (typeof data_celula === 'string' || data_celula instanceof String) ? new Date(data_celula) : data_celula;
  
  var dia = data.getDate();
  var mes = data.getMonth();
  var ano = data.getFullYear();
  
  return {dia, mes, ano};
}

function dataExtenso2(data_celula) {
  var data_extraida = extrairData2(data_celula);
  var diaStr = data_extraida.dia < 10 ? "0" + data_extraida.dia : data_extraida.dia;
  var nome_mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var anoStr = data_extraida.ano;

  var data_extenso = diaStr + " de " + nome_mes[data_extraida.mes] + " de " + anoStr;
  Logger.log(data_extenso);
  return data_extenso;
}



// Funções auxiliares necessárias que parecem estar faltando no seu snippet original
function obterPastaDoc(arquivo) {
  var pais = arquivo.getParents();
  return pais.hasNext() ? pais.next() : DriveApp.getRootFolder();
}

function criarOuObterPasta(pastaPai, nomePasta) {
  var pastas = pastaPai.getFoldersByName(nomePasta);
  if (pastas.hasNext()) {
    return pastas.next();
  } else {
    return pastaPai.createFolder(nomePasta);
  }
}
