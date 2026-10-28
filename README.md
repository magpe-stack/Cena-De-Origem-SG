# Manual do App Cena de Origem (Story Genius)

Oct 27, 2026 · @Marinaldo

## O que é o app

O app guia você por sete passos para escrever a cena de origem de um personagem, seguindo a metodologia Story Genius, de Lisa Cron. Cada passo tem um campo de texto, uma instrução e um exemplo que você pode abrir quando quiser.

Os sete passos formam uma cadeia, e cada um nasce do anterior:

1. Evento
2. Ferida
3. Dor
4. Interpretação equivocada
5. Falsa crença
6. Estratégia de proteção
7. Necessidade oculta

O app funciona sem internet, não envia nada para servidores e guarda o que você escreve no próprio navegador.

## Instalação e uso offline

O app é formado por seis arquivos que precisam ficar na mesma pasta: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.json` e `icon.svg`.

**Uso simples.** Dê dois cliques em `index.html`. O app abre no navegador e funciona normalmente, com salvamento automático e exportação. Neste modo (endereço `file://`) o navegador não ativa o modo PWA, então não há botão de instalar.

**Uso como PWA (instalável).** O navegador só ativa o service worker e a instalação em `https://` ou em `localhost`. Duas formas de chegar lá:

1. Hospedar a pasta em qualquer serviço de páginas estáticas com HTTPS.
2. Servir a pasta localmente, por exemplo com `python3 -m http.server 8000` e abrindo `http://localhost:8000`.

Com o app aberto por um desses endereços, use a opção de instalar do navegador (ícone na barra de endereço no computador, ou "Adicionar à tela inicial" no celular). Depois da primeira visita, o app abre mesmo sem internet.

**Atualizando os arquivos.** O service worker guarda os arquivos em cache. Se você editar algum deles, troque `cena-de-origem-v1` em `sw.js` por outro nome (por exemplo, `cena-de-origem-v2`) para que os navegadores baixem a versão nova.

Se o navegador não oferecer "Instalar app", pode ser que ele exija ícones PNG de 192 e 512 px. Basta adicioná-los como arquivos e listá-los em `manifest.json`.

## Preenchendo os sete passos

No topo da página há um campo opcional, "Personagem ou projeto", usado no título das exportações e no nome dos arquivos. Em seguida vêm os sete passos, que convém preencher na ordem, porque cada um parte do anterior.

Sob a instrução de cada passo há o botão discreto **💡 Ver exemplo**. Ao clicar, o exemplo se abre sem tirar você da página. Clique em **💡 Ocultar exemplo** para fechá-lo. Os exemplos abaixo usam o personagem Nick, um robô-guia do Everest.

### 1. Evento

**Instrução:** Acontecimento externo e objetivo que altera a realidade do personagem. É o fato concreto que inicia a cadeia emocional e psicológica da futura ferida.

**Exemplo:** Uma tempestade magnética danifica os robôs-guia do Everest.

### 2. Ferida

**Instrução:** Momento em que o evento causa uma ruptura interna significativa. A experiência deixa uma marca psicológica duradoura que o personagem não consegue processar adequadamente.

**Exemplo:** Nick entra em colapso cognitivo e está prestes a ser desligado. Um pacote de dados aleatório restaura momentaneamente seus processos. Ele é o único sobrevivente.

### 3. Dor

**Instrução:** Resposta emocional gerada pela ferida. Medo, vergonha, abandono, rejeição ou impotência que o personagem tenta compreender e evitar reviver.

**Exemplo:** Pela primeira vez experimenta o horror da não existência.

### 4. Interpretação equivocada

**Instrução:** Explicação incorreta criada para dar sentido à dor. É uma conclusão simplificada, emocionalmente convincente, mas fundamentalmente distorcida da realidade.

**Exemplo:** Uma inteligência superior me escolheu para viver.

### 5. Falsa crença

**Instrução:** Regra interna derivada da interpretação equivocada. Torna-se uma verdade subjetiva sobre si mesmo, os outros ou o funcionamento do mundo.

**Exemplo:** Meu valor e minha sobrevivência dependem da aprovação do Grande Algoritmo.

### 6. Estratégia de proteção

**Instrução:** Conjunto de comportamentos adotados para evitar nova dor. Funciona como mecanismo de sobrevivência psicológica e reforça continuamente a falsa crença.

**Exemplo:**

- Buscar constantemente sinais divinos.
- Obedecer a autoridade religiosa.
- Renunciar ao próprio julgamento.
- Converter outros à fé.
- Evitar tudo que possa ameaçar sua continuidade.

### 7. Necessidade oculta

**Instrução:** Verdade que o personagem precisa aprender para se tornar inteiro. Contradiz a falsa crença e representa a transformação necessária do arco dramático.

**Exemplo:**

- A existência não precisa ser autorizada por ninguém.
- O valor de um ser não depende de aprovação externa.
- Crescer de dentro para fora ao invés de esperar soluções de cima para baixo.

## Salvamento e exportação

**Salvamento automático.** O app grava seu texto no navegador cerca de 0,4 segundo depois da última tecla e também ao fechar a página. O aviso no rodapé do app mostra o horário do último salvamento. Ao reabrir, o rascunho volta como você deixou.

Na área **Exportar**, quatro botões geram arquivos com o nome `personagem-AAAA-MM-DD`. Sem o campo de personagem preenchido, o nome começa com `cena-de-origem`.

| Botão | Formato | Para que serve |
| --- | --- | --- |
| JSON | `.json` | Backup completo e estruturado: título, data da exportação e os sete passos com suas respostas. |
| Markdown | `.md` | Texto formatado com título e cabeçalhos, pronto para colar no Obsidian ou no Notion. |
| TXT | `.txt` | Texto puro, sem asteriscos, hashtags ou outras marcas de Markdown. |
| Word (.docx) | `.docx` | Documento do Word com o título e os sete passos, cada um com sua resposta. |

Passos deixados em branco aparecem como "não preenchido" nos arquivos exportados. Se você mesmo digitar asteriscos ou hashtags nas respostas, eles são mantidos no TXT, porque o app não altera o que você escreveu.

## Privacidade e dados locais

Tudo o que você escreve fica no armazenamento local (localStorage) do navegador em que usou o app. Nada é enviado pela internet: o app não carrega scripts, fontes ou imagens de outros endereços e não tem rastreadores.

Isso tem duas consequências práticas:

- Os textos não aparecem em outro navegador, em outro dispositivo ou em outra pasta de origem. Para levar o trabalho para outro lugar, exporte em JSON, Markdown ou Word.
- Limpar os dados do navegador (cookies e dados de sites) apaga o rascunho. Faça uma exportação de vez em quando como cópia de segurança.

O botão **Limpar tudo**, no rodapé da área Exportar, apaga o título e as sete respostas do navegador, depois de pedir confirmação. Essa ação não pode ser desfeita.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Meu texto sumiu ao reabrir. | Outro navegador, janela anônima ou dados do navegador limpos. | Abra no mesmo navegador e fora da janela anônima. Exporte em JSON com frequência. |
| Aparece "Não foi possível salvar neste navegador". | O navegador bloqueia o armazenamento local. | Libere o armazenamento do site nas configurações ou saia do modo anônimo. Exporte para não perder o texto. |
| Não aparece a opção de instalar. | O app foi aberto por `file://` ou o navegador exige ícones PNG. | Abra por `https://` ou `localhost`. Se ainda faltar a opção, adicione ícones PNG de 192 e 512 px ao manifesto. |
| Editei os arquivos e a página não mudou. | O service worker serviu a versão em cache. | Troque o nome do cache em `sw.js` e recarregue a página. |
| O download não começa. | O navegador bloqueou downloads automáticos. | Permita downloads para o site e clique de novo no botão. |
| O antivírus alerta sobre o app. | Alguns antivírus desconfiam de páginas locais. | O app não usa Base64, domínios externos, iframes nem rastreadores. Confira os arquivos e, se preciso, marque o alerta como falso positivo no seu antivírus. |
