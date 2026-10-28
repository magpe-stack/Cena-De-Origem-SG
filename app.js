'use strict';

/* ==========================================================
   Cena de Origem · Story Genius
   Somente APIs nativas do navegador. Sem rede, sem bibliotecas.
   ========================================================== */

var STORAGE_KEY = 'cena-de-origem:v1';

var STEPS = [
  {
    id: 'evento',
    numero: 1,
    titulo: 'EVENTO',
    instrucao: 'Acontecimento externo e objetivo que altera a realidade do personagem. É o fato concreto que inicia a cadeia emocional e psicológica da futura ferida.',
    exemplo: 'Uma tempestade magnética danifica os robôs-guia do Everest.'
  },
  {
    id: 'ferida',
    numero: 2,
    titulo: 'FERIDA',
    instrucao: 'Momento em que o evento causa uma ruptura interna significativa. A experiência deixa uma marca psicológica duradoura que o personagem não consegue processar adequadamente.',
    exemplo: 'Nick entra em colapso cognitivo e está prestes a ser desligado. Um pacote de dados aleatório restaura momentaneamente seus processos. Ele é o único sobrevivente.'
  },
  {
    id: 'dor',
    numero: 3,
    titulo: 'DOR',
    instrucao: 'Resposta emocional gerada pela ferida. Medo, vergonha, abandono, rejeição ou impotência que o personagem tenta compreender e evitar reviver.',
    exemplo: 'Pela primeira vez experimenta o horror da não existência.'
  },
  {
    id: 'interpretacao',
    numero: 4,
    titulo: 'INTERPRETAÇÃO EQUIVOCADA',
    instrucao: 'Explicação incorreta criada para dar sentido à dor. É uma conclusão simplificada, emocionalmente convincente, mas fundamentalmente distorcida da realidade.',
    exemplo: 'Uma inteligência superior me escolheu para viver.'
  },
  {
    id: 'falsa-crenca',
    numero: 5,
    titulo: 'FALSA CRENÇA',
    instrucao: 'Regra interna derivada da interpretação equivocada. Torna-se uma verdade subjetiva sobre si mesmo, os outros ou o funcionamento do mundo.',
    exemplo: 'Meu valor e minha sobrevivência dependem da aprovação do Grande Algoritmo.'
  },
  {
    id: 'estrategia',
    numero: 6,
    titulo: 'ESTRATÉGIA DE PROTEÇÃO',
    instrucao: 'Conjunto de comportamentos adotados para evitar nova dor. Funciona como mecanismo de sobrevivência psicológica e reforça continuamente a falsa crença.',
    exemplo: [
      'Buscar constantemente sinais divinos.',
      'Obedecer a autoridade religiosa.',
      'Renunciar ao próprio julgamento.',
      'Converter outros à fé.',
      'Evitar tudo que possa ameaçar sua continuidade.'
    ]
  },
  {
    id: 'necessidade',
    numero: 7,
    titulo: 'NECESSIDADE OCULTA',
    instrucao: 'Verdade que o personagem precisa aprender para se tornar inteiro. Contradiz a falsa crença e representa a transformação necessária do arco dramático.',
    exemplo: [
      'A existência não precisa ser autorizada por ninguém.',
      'O valor de um ser não depende de aprovação externa.',
      'Crescer de dentro para fora ao invés de esperar soluções de cima para baixo.'
    ]
  }
];

var DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/* ---------- Utilidades de texto ---------- */

function normalizarQuebras(texto) {
  return String(texto || '').replace(/\r\n?/g, '\n');
}

function nomeCapitalizado(titulo) {
  var minusculo = titulo.toLowerCase();
  return minusculo.charAt(0).toUpperCase() + minusculo.slice(1);
}

function fatiaDeNomeDeArquivo(texto) {
  var base = String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'cena-de-origem';
}

function dataParaArquivo(data) {
  var d = data || new Date();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

/* ---------- Construtores de conteúdo ---------- */

function construirJSON(dados, agora) {
  var passos = STEPS.map(function (p) {
    return {
      numero: p.numero,
      id: p.id,
      titulo: p.titulo,
      resposta: normalizarQuebras(dados.respostas[p.id])
    };
  });
  return JSON.stringify({
    aplicativo: 'Cena de Origem',
    metodologia: 'Story Genius',
    versao: 1,
    exportadoEm: (agora || new Date()).toISOString(),
    titulo: dados.titulo || '',
    passos: passos
  }, null, 2);
}

function construirMarkdown(dados) {
  var linhas = [];
  linhas.push('# Cena de Origem' + (dados.titulo ? ' — ' + dados.titulo : ''));
  linhas.push('');
  STEPS.forEach(function (p) {
    var resposta = normalizarQuebras(dados.respostas[p.id]).trim();
    linhas.push('## ' + p.numero + '. ' + nomeCapitalizado(p.titulo));
    linhas.push('');
    linhas.push(resposta ? resposta : '_(não preenchido)_');
    linhas.push('');
  });
  return linhas.join('\n');
}

/* TXT: texto plano, sem nenhuma marca de Markdown adicionada pelo app. */
function construirTXT(dados) {
  var linhas = [];
  linhas.push('CENA DE ORIGEM' + (dados.titulo ? ' - ' + dados.titulo : ''));
  linhas.push('');
  STEPS.forEach(function (p) {
    var resposta = normalizarQuebras(dados.respostas[p.id]).trim();
    linhas.push(p.numero + '. ' + p.titulo);
    linhas.push('');
    linhas.push(resposta ? resposta : '(não preenchido)');
    linhas.push('');
  });
  return linhas.join('\n');
}

/* ---------- DOCX (ZIP sem compressão, feito à mão) ---------- */

var tabelaCRC = (function () {
  var tabela = new Uint32Array(256);
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tabela[n] = c >>> 0;
  }
  return tabela;
})();

function crc32(bytes) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < bytes.length; i++) {
    crc = tabelaCRC[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dataHoraDOS(data) {
  var ano = Math.max(data.getFullYear(), 1980);
  var hora = (data.getHours() << 11) | (data.getMinutes() << 5) | (data.getSeconds() >> 1);
  var dia = ((ano - 1980) << 9) | ((data.getMonth() + 1) << 5) | data.getDate();
  return { hora: hora, dia: dia };
}

function criarZip(arquivos, agora) {
  var codificador = new TextEncoder();
  var dos = dataHoraDOS(agora || new Date());
  var partes = [];
  var central = [];
  var deslocamento = 0;

  arquivos.forEach(function (arq) {
    var nome = codificador.encode(arq.nome);
    var dados = codificador.encode(arq.conteudo);
    var crc = crc32(dados);

    var local = new Uint8Array(30 + nome.length);
    var v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x0800, true);
    v.setUint16(8, 0, true);
    v.setUint16(10, dos.hora, true);
    v.setUint16(12, dos.dia, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, dados.length, true);
    v.setUint32(22, dados.length, true);
    v.setUint16(26, nome.length, true);
    v.setUint16(28, 0, true);
    local.set(nome, 30);

    var cab = new Uint8Array(46 + nome.length);
    var c = new DataView(cab.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, dos.hora, true);
    c.setUint16(14, dos.dia, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, dados.length, true);
    c.setUint32(24, dados.length, true);
    c.setUint16(28, nome.length, true);
    c.setUint16(30, 0, true);
    c.setUint16(32, 0, true);
    c.setUint16(34, 0, true);
    c.setUint16(36, 0, true);
    c.setUint32(38, 0, true);
    c.setUint32(42, deslocamento, true);
    cab.set(nome, 46);

    partes.push(local, dados);
    central.push(cab);
    deslocamento += local.length + dados.length;
  });

  var tamanhoCentral = central.reduce(function (soma, b) { return soma + b.length; }, 0);
  var fim = new Uint8Array(22);
  var f = new DataView(fim.buffer);
  f.setUint32(0, 0x06054b50, true);
  f.setUint16(4, 0, true);
  f.setUint16(6, 0, true);
  f.setUint16(8, arquivos.length, true);
  f.setUint16(10, arquivos.length, true);
  f.setUint32(12, tamanhoCentral, true);
  f.setUint32(16, deslocamento, true);
  f.setUint16(20, 0, true);

  return new Blob(partes.concat(central, [fim]), { type: DOCX_MIME });
}

function escaparXML(texto) {
  return String(texto)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragrafoDocx(texto, estilo, italico) {
  var pPr = estilo ? '<w:pPr><w:pStyle w:val="' + estilo + '"/></w:pPr>' : '';
  if (texto === '') {
    return '<w:p>' + pPr + '</w:p>';
  }
  var rPr = italico ? '<w:rPr><w:i/></w:rPr>' : '';
  return '<w:p>' + pPr + '<w:r>' + rPr + '<w:t xml:space="preserve">' + escaparXML(texto) + '</w:t></w:r></w:p>';
}

function construirDocumentoXML(dados) {
  var corpo = [];
  corpo.push(paragrafoDocx('Cena de Origem', 'Title'));
  if (dados.titulo) {
    corpo.push(paragrafoDocx(dados.titulo, 'Subtitle'));
  }
  STEPS.forEach(function (p) {
    corpo.push(paragrafoDocx(p.numero + '. ' + nomeCapitalizado(p.titulo), 'Heading1'));
    var resposta = normalizarQuebras(dados.respostas[p.id]).trim();
    if (!resposta) {
      corpo.push(paragrafoDocx('(não preenchido)', null, true));
    } else {
      resposta.split('\n').forEach(function (linha) {
        corpo.push(paragrafoDocx(linha, null, false));
      });
    }
  });

  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' + corpo.join('') +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>' +
    '</w:body></w:document>';
}

var DOCX_CONTENT_TYPES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
  '</Types>';

var DOCX_RELS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
  '</Relationships>';

var DOCX_DOC_RELS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
  '</Relationships>';

var DOCX_STYLES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  '<w:docDefaults>' +
  '<w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>' +
  '<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault>' +
  '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>' +
  '</w:docDefaults>' +
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
  '<w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:b/><w:color w:val="2F4A6D"/><w:sz w:val="48"/><w:szCs w:val="48"/></w:rPr></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
  '<w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:i/><w:color w:val="5B6272"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
  '<w:pPr><w:keepNext/><w:spacing w:before="320" w:after="100"/><w:outlineLvl w:val="0"/></w:pPr>' +
  '<w:rPr><w:b/><w:color w:val="2F4A6D"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:style>' +
  '</w:styles>';

function construirDOCX(dados, agora) {
  return criarZip([
    { nome: '[Content_Types].xml', conteudo: DOCX_CONTENT_TYPES },
    { nome: '_rels/.rels', conteudo: DOCX_RELS },
    { nome: 'word/document.xml', conteudo: construirDocumentoXML(dados) },
    { nome: 'word/styles.xml', conteudo: DOCX_STYLES },
    { nome: 'word/_rels/document.xml.rels', conteudo: DOCX_DOC_RELS }
  ], agora);
}

/* ---------- Download seguro (APIs nativas) ---------- */

function baixarArquivo(conteudo, nomeArquivo, tipoMime) {
  var blob = (conteudo instanceof Blob)
    ? conteudo
    : new Blob([conteudo], { type: tipoMime });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ---------- Interface ---------- */

if (typeof document !== 'undefined') {
  (function iniciar() {
    var estado = { titulo: '', respostas: {} };
    var campos = {};
    var campoTitulo = document.getElementById('campo-titulo');
    var formulario = document.getElementById('formulario');
    var rotuloSalvo = document.getElementById('estado-salvo');
    var temporizador = null;

    function carregar() {
      try {
        var bruto = window.localStorage.getItem(STORAGE_KEY);
        if (!bruto) { return; }
        var lido = JSON.parse(bruto);
        if (lido && typeof lido === 'object') {
          estado.titulo = typeof lido.titulo === 'string' ? lido.titulo : '';
          if (lido.respostas && typeof lido.respostas === 'object') {
            STEPS.forEach(function (p) {
              if (typeof lido.respostas[p.id] === 'string') {
                estado.respostas[p.id] = lido.respostas[p.id];
              }
            });
          }
        }
      } catch (erro) {
        /* armazenamento indisponível ou dados inválidos: começa em branco */
      }
    }

    function mostrarSalvo(mensagem) {
      rotuloSalvo.textContent = mensagem;
    }

    function salvar() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          titulo: estado.titulo,
          respostas: estado.respostas,
          atualizadoEm: new Date().toISOString()
        }));
        var agora = new Date();
        var hh = String(agora.getHours()).padStart(2, '0');
        var mi = String(agora.getMinutes()).padStart(2, '0');
        mostrarSalvo('Salvo automaticamente às ' + hh + ':' + mi);
      } catch (erro) {
        mostrarSalvo('Não foi possível salvar neste navegador');
      }
    }

    function agendarSalvamento() {
      mostrarSalvo('Salvando…');
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(salvar, 400);
    }

    function criarExemplo(passo) {
      var caixa = document.createElement('div');
      caixa.className = 'exemplo-caixa';

      var rotulo = document.createElement('span');
      rotulo.className = 'exemplo-rotulo';
      rotulo.textContent = 'Exemplo';
      caixa.appendChild(rotulo);

      if (Array.isArray(passo.exemplo)) {
        var lista = document.createElement('ul');
        passo.exemplo.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          lista.appendChild(li);
        });
        caixa.appendChild(lista);
      } else {
        var par = document.createElement('p');
        par.textContent = passo.exemplo;
        caixa.appendChild(par);
      }
      return caixa;
    }

    function criarPasso(passo) {
      var secao = document.createElement('section');
      secao.className = 'passo';
      secao.setAttribute('aria-labelledby', 'titulo-' + passo.id);

      var cab = document.createElement('div');
      cab.className = 'passo-cabecalho';
      var num = document.createElement('span');
      num.className = 'passo-numero';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = String(passo.numero);
      var h2 = document.createElement('h2');
      h2.id = 'titulo-' + passo.id;
      h2.textContent = passo.titulo;
      cab.appendChild(num);
      cab.appendChild(h2);
      secao.appendChild(cab);

      var instrucao = document.createElement('p');
      instrucao.className = 'instrucao';
      instrucao.id = 'instrucao-' + passo.id;
      instrucao.textContent = passo.instrucao;
      secao.appendChild(instrucao);

      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'btn-exemplo';
      botao.id = 'btn-exemplo-' + passo.id;
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-controls', 'exemplo-' + passo.id);
      botao.textContent = '💡 Ver exemplo';
      secao.appendChild(botao);

      var envoltorio = document.createElement('div');
      envoltorio.className = 'exemplo-envoltorio';
      envoltorio.id = 'exemplo-' + passo.id;
      var interno = document.createElement('div');
      interno.className = 'exemplo-interno';
      interno.appendChild(criarExemplo(passo));
      envoltorio.appendChild(interno);
      secao.appendChild(envoltorio);

      botao.addEventListener('click', function () {
        var aberto = envoltorio.classList.toggle('aberto');
        botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        botao.textContent = aberto ? '💡 Ocultar exemplo' : '💡 Ver exemplo';
      });

      var area = document.createElement('textarea');
      area.id = 'campo-' + passo.id;
      area.name = passo.id;
      area.rows = 6;
      area.setAttribute('aria-labelledby', 'titulo-' + passo.id);
      area.setAttribute('aria-describedby', 'instrucao-' + passo.id);
      area.value = estado.respostas[passo.id] || '';
      area.addEventListener('input', function () {
        estado.respostas[passo.id] = area.value;
        agendarSalvamento();
      });
      secao.appendChild(area);

      campos[passo.id] = area;
      return secao;
    }

    function dadosAtuais() {
      return {
        titulo: estado.titulo.trim(),
        respostas: estado.respostas
      };
    }

    function nomeBase() {
      return fatiaDeNomeDeArquivo(estado.titulo) + '-' + dataParaArquivo();
    }

    function ligarExportacao() {
      document.getElementById('exportar-json').addEventListener('click', function () {
        baixarArquivo(construirJSON(dadosAtuais()), nomeBase() + '.json', 'application/json;charset=utf-8');
      });
      document.getElementById('exportar-md').addEventListener('click', function () {
        baixarArquivo(construirMarkdown(dadosAtuais()), nomeBase() + '.md', 'text/markdown;charset=utf-8');
      });
      document.getElementById('exportar-txt').addEventListener('click', function () {
        baixarArquivo(construirTXT(dadosAtuais()), nomeBase() + '.txt', 'text/plain;charset=utf-8');
      });
      document.getElementById('exportar-docx').addEventListener('click', function () {
        baixarArquivo(construirDOCX(dadosAtuais()), nomeBase() + '.docx', DOCX_MIME);
      });

      document.getElementById('limpar').addEventListener('click', function () {
        if (!window.confirm('Apagar todo o conteúdo salvo neste navegador? Esta ação não pode ser desfeita.')) {
          return;
        }
        estado.titulo = '';
        estado.respostas = {};
        campoTitulo.value = '';
        STEPS.forEach(function (p) { campos[p.id].value = ''; });
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (erro) { /* ignora */ }
        mostrarSalvo('Conteúdo apagado');
      });
    }

    function registrarServiceWorker() {
      if (!('serviceWorker' in navigator)) { return; }
      var protocolo = window.location.protocol;
      var local = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (protocolo !== 'https:' && !local) { return; }
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () { /* offline opcional */ });
      });
    }

    carregar();
    campoTitulo.value = estado.titulo;
    campoTitulo.addEventListener('input', function () {
      estado.titulo = campoTitulo.value;
      agendarSalvamento();
    });
    STEPS.forEach(function (p) { formulario.appendChild(criarPasso(p)); });
    window.addEventListener('pagehide', function () {
      window.clearTimeout(temporizador);
      salvar();
    });
    ligarExportacao();
    registrarServiceWorker();
    if (Object.keys(estado.respostas).length || estado.titulo) {
      mostrarSalvo('Rascunho anterior carregado');
    }
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STEPS: STEPS,
    construirJSON: construirJSON,
    construirMarkdown: construirMarkdown,
    construirTXT: construirTXT,
    construirDOCX: construirDOCX
  };
}
