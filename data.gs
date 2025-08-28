
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

function formatarDataparaNumerica(dataISO) {
  var data = new Date(dataISO); // converte "2025-12-30" em objeto Date
  var dia = data.getDate();
  var mes = data.getMonth() + 1; // mês começa em 0
  var ano = data.getFullYear();

  var diaStr = dia.toString().padStart(2, "0");
  var mesStr = mes.toString().padStart(2, "0");
  Logger.log(diaStr + "/" + mesStr + "/" + ano)
  return diaStr + "/" + mesStr + "/" + ano;
}