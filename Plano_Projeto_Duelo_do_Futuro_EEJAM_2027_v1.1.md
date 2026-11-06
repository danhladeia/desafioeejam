# Duelo do Futuro — EEJAM 2027

**Plano completo de projeto e desenvolvimento · Versão 1.1 · Novembro de 2026**

Escola Estadual Jesuzinha Araújo Magalhães

Minijogos educativos e competitivos para receber estudantes do 9º ano e apresentar o Ensino Médio em Tempo Integral e Marketing.

**Entrega proposta:** 6 minijogos obrigatórios · pacote opcional de 4 jogos · competição 1 × 1 · chaveamento eliminatório · dois mascotes cartoon · operação offline · modo apresentador.

## O que mudou na versão 1.1

- **Novos jogos opcionais (seção 5A):** Palavra Secreta, Desembaralha, Caça-Palavras EEJAM e Cabo de Guerra das Ideias. Os seis jogos originais continuam sendo a entrega obrigatória.
- **Proteção da lousa contra impacto (seção 12.1):** novas regras de jogo e de evento, com ajustes no Toque Turbo, no desempate, nos testes e no procedimento do dia.
- **Equipamento:** a tela é uma lousa digital Samsung. O modelo e o sistema ainda precisam ser confirmados na Fase 0.
- **Contrato dos minijogos (seção 10.3):** novo `onFinish` para encerrar partidas antes do tempo.
- **Requisitos e fases:** novos RF19 a RF21, Fase 4B, itens de backlog, riscos e item 9 da Definição de Pronto.

## Pendências abertas

- [ ] Informar o modelo da lousa Samsung e confirmar o sistema.
- [ ] Adicionar `duelo_futuro_eejam_2027.html` à pasta do projeto.
- [ ] Definir a data do evento e o número esperado de visitantes.
- [ ] Obter o logo em alta resolução e a autorização das fotos.

**Versão do plano:** 1.1

**Instituição:** Escola Estadual Jesuzinha Araújo Magalhães (EEJAM)

**Público-alvo:** estudantes visitantes do 9º ano que poderão ingressar no Ensino Médio em 2027

**Tema:** Ensino Médio em Tempo Integral (EMTI) e formação em Marketing

**Ambiente:** lousa digital Samsung em orientação horizontal, com multitouch. Modelo e sistema a confirmar na Fase 0; este plano assume Android até essa confirmação

**Formato:** party game educativo, competição 1 × 1 e campeonato eliminatório

**Plataforma proposta:** Web App/PWA offline-first em HTML, CSS e JavaScript

**Resumo executivo:** transformar a visita à EEJAM em uma competição acessível, dinâmica e memorável. Dois alunos jogam simultaneamente em lados independentes da tela; um professor gerencia participantes, partidas, resultados e chaveamento. Os jogos incorporam a identidade visual da escola, o EMTI e noções introdutórias de Marketing sem parecer uma prova escolar.

## 1. OBJETIVOS DO PRODUTO

### 1.1 Objetivo geral

Criar um sistema de minijogos para tela grande que valorize a escola, desperte curiosidade pelo EMTI e pelo curso de Marketing e mantenha estudantes e plateia envolvidos durante o evento de recepção.

### 1.2 Objetivos específicos

- Receber de forma lúdica os estudantes visitantes.
- Permitir disputas entre dois alunos simultaneamente, com áreas touchscreen separadas.
- Oferecer seis minijogos com mecânicas variadas: tocar, arrastar, classificar, memorizar, montar e escolher.
- Organizar campeonatos eliminatórios com sorteio, fases, classificação automática e grande final.
- Possibilitar troca rápida de duplas sem cadastrar contas ou exigir dispositivos pessoais.
- Apresentar informações curtas, verificadas e visualmente interessantes sobre EEJAM, EMTI e Marketing.
- Operar sem internet durante o evento após instalação e validação do cache offline.
- Manter dados e andamento do campeonato após recarga ou fechamento acidental do navegador, sempre que o armazenamento local estiver disponível.

### 1.3 Critérios de sucesso do evento

- Todos os controles essenciais podem ser usados diretamente na tela Android.
- Duas pessoas tocam ao mesmo tempo sem interferir nas pontuações.
- O apresentador inicia a próxima disputa em poucos toques.
- O sistema reconhece um vencedor e atualiza a chave automaticamente.
- A partida se recupera de interrupções sem perder o campeonato salvo.
- A experiência é compreendida após uma instrução visual de poucos segundos.

## 2. PRINCÍPIOS DE DESIGN

1. Diversão primeiro: explicações muito curtas; menos texto durante o jogo.
2. Competição justa: cada jogador recebe oportunidades de dificuldade equivalente.
3. Tela dividida e independente: azul à esquerda, laranja à direita, placar legível à distância.
4. Acessibilidade física: alvos grandes, área de jogo preferencialmente na região alcançável da tela, comandos de professor afastados dos alvos.
5. Identidade escolar: logo oficial e conteúdos confirmados pela escola; mascotes autorais, não presumidos como mascotes oficiais.
6. Offline e robustez: nenhuma dependência de APIs, fontes remotas ou autenticação para jogar.
7. Privacidade: utilizar apelidos e códigos de jogadores; não coletar fotos, contatos ou dados escolares dos visitantes desnecessariamente.
8. Modularidade: cada minijogo usa a mesma estrutura de campeonato, áudio, pontuação, controle de tela e navegação.
9. Toque leve: nenhum jogo premia bater, repetir toques ou usar força; precisão vale mais que velocidade bruta.

## 3. EXPERIÊNCIA COMPLETA DO USUÁRIO

### 3.1 Jornada do professor/apresentador

1. Abrir o jogo no Android e verificar o modo de tela cheia.
2. Escolher Campeonato ou Partida de demonstração.
3. Selecionar uma bateria (recomendado: 8 ou 16 participantes, conforme o tempo disponível).
4. Digitar os apelidos ou nomes curtos autorizados dos participantes; IDs internos serão gerados automaticamente.
5. Acionar sorteio dos confrontos.
6. Chamar a próxima dupla e escolher o minijogo ou usar sorteio automático.
7. Exibir instrução de 1 tela (5–8 segundos) e iniciar a contagem 3, 2, 1.
8. Acompanhar a partida, o vencedor e a curiosidade da EEJAM.
9. Confirmar o resultado para atualizar a chave e chamar a próxima dupla.
10. Exibir grande final e campeão; depois iniciar nova bateria ou encerrar.

### 3.2 Jornada dos jogadores

- Chegar à tela, reconhecer azul/laranja e posicionar-se nos lados correspondentes.
- Ler/ouvir uma instrução curta: “toque nos alvos”, “arraste o item”, “encontre os pares” etc.
- Jogar durante 30–75 segundos, sem teclado, mouse ou telefone.
- Receber feedback imediato por animação, som e pontos.
- Visualizar o vencedor e o avanço no torneio.

### 3.3 Jornada da plateia

- Visualizar título do minijogo, nomes, cronômetro, pontos e progressão da rodada.
- Torcer pelos estudantes e reconhecer elementos da escola.
- Assistir a celebrações curtas, sem esperas excessivas.

## 4. SISTEMA DE COMPETIÇÃO

### 4.1 Modo principal: campeonato eliminatório simples

- Sorteio inicial aleatório de participantes, com possibilidade de conferir a chave antes de começar.
- O vencedor de cada partida avança automaticamente; o perdedor é eliminado daquela bateria.
- Rodadas automáticas: oitavas, quartas, semifinais e final, conforme a quantidade de inscritos.
- Quantidades não potência de dois são completadas com avanços automáticos (byes) determinados por sorteio; ninguém recebe uma derrota por estar sem adversário.
- Nomes repetidos são permitidos no futuro mediante IDs únicos; na interface, distinguir visualmente nomes semelhantes.
- Empate: desempate relâmpago com regra determinística, repetido ou por primeiro acerto válido até que haja um vencedor; nunca avançar um empate como resultado final. O desempate premia o primeiro acerto válido, nunca a repetição rápida de toques.
- Registrar pontuações, minijogo, fase, horário e resultado para auditoria simples.
- Modo melhor de três fica como expansão opcional; não deve alongar o formato principal sem necessidade.

### 4.2 Organização recomendada no evento

- Bateria de 8 jogadores: 7 confrontos. Estimativa de operação: cerca de 15–25 minutos incluindo trocas e instruções.
- Bateria de 16 jogadores: 15 confrontos. Estimativa: cerca de 30–50 minutos.
- Para muitos visitantes, realizar múltiplas baterias e opcionalmente uma final entre campeões de baterias.
- O professor controla quantas baterias ocorrem; não é necessário incluir todos os visitantes em um único campeonato de 64, pois isso pode consumir muito tempo.

### 4.3 Funcionalidades obrigatórias do chaveamento

- Criar, visualizar, reordenar/corrigir antes do início e confirmar sorteio.
- Avançar vencedores automaticamente e indicar partidas concluídas.
- Indicar próxima dupla e fase do torneio.
- Recuperar torneio salvo.
- Pausar, repetir uma partida anulada e desfazer último resultado mediante confirmação do professor, com registro de alteração.
- Exportar JSON de backup; CSV para registro de resultados em versão completa.
- Limpar informações do evento após a conclusão, por decisão do responsável.

### 4.4 Política de sorteio de minijogos

- Escolha manual ou sorteio automático pelo professor.
- Evitar repetição consecutiva do mesmo minijogo, quando houver outros disponíveis.
- Manter a mesma dificuldade para os dois lados da tela.
- Permitir definir antecipadamente um minijogo específico para semifinal ou final.

## 5. MINIJOGOS — ESPECIFICAÇÕES

### 5.1 Toque Turbo: Missão EEJAM — PRIORIDADE 1

**Competência central:** reflexo e atenção.

**Duração inicial:** 45 segundos.

**Como jogar:** cada lado recebe alvos temporários que representam ideias, livros, projetos, tecnologia e comunicação. Toque em símbolos positivos e evite armadilhas.

**Pontuação:** +10 por alvo comum; +25 por bônus; −5 por armadilha; piso mínimo de 0 opcional e consistente.

**Dificuldade:** alvos ligeiramente menores/mais rápidos de forma progressiva, dentro do alcance confortável.

**Justiça competitiva:** gerar uma sequência de desafios compartilhada e espelhar condições; cada lado pode ter posições diferentes, mas equivalentes em dificuldade, tamanho, duração e valor.

**Feedback:** explosão breve de partículas, número de pontos flutuante, som positivo/negativo e reação do mascote.

**Validação:** um alvo não soma pontos duas vezes; toques no lado esquerdo nunca alteram pontos do lado direito; ambas as mãos podem tocar simultaneamente.

**Proteção contra impacto:** este é o jogo com maior risco de estimular batidas na lousa. Usar menos alvos ao mesmo tempo, manter cada alvo tempo suficiente para um toque calmo e dar bônus por sequência de acertos. Aplicar a trava por toques em excesso da seção 12.1. Avaliar nos testes se a partida deve cair de 45 para 30–35 segundos.

### 5.2 Marketing Express — PRIORIDADE 2

**Competência central:** percepção visual, associação e comunicação.

**Duração sugerida:** 60 segundos.

**Como jogar:** montar rapidamente uma campanha simples, escolhendo/arrastando para combinar produto, público-alvo, slogan e imagem.

**Exemplo:** “Divulgue uma feira de profissões para estudantes” → escolher a imagem e o slogan adequados entre opções pré-validadas.

**Pontuação:** acerto, tempo e bônus por sequência.

**Justiça:** mesmos desafios e número de opções para ambos; ordem das respostas visualmente equilibrada.

**Nota pedagógica:** as regras precisam ser objetivas e não atribuir uma única resposta a perguntas subjetivas de criatividade.

### 5.3 Rota do EMTI — PRIORIDADE 3

**Competência central:** organização e classificação.

**Duração sugerida:** 50–60 segundos.

**Como jogar:** surgem cartas de atividades e o estudante deve arrastá-las a áreas como “Aprender”, “Criar Projetos” e “Conviver”.

**Conteúdo:** usar exemplos genéricos de aprendizagem, colaboração, desenvolvimento de projetos e protagonismo juvenil; publicar informações específicas de rotina/carga horária somente após confirmação da direção.

**Pontuação:** +10 por classificação correta, com feedback imediato.

### 5.4 Memória EEJAM — PRIORIDADE 4

**Competência central:** memória visual.

**Duração sugerida:** 60 segundos.

**Como jogar:** encontrar pares de cartas com fotografias autorizadas e símbolos escolares.

**Equidade:** mesmo número de pares e dificuldade equivalente; posicionamento independente para evitar que um jogador simplesmente copie o outro.

**Pontuação:** pares corretos, bônus por sequência e/ou tempo, com regra fixada antes do jogo.

### 5.5 Monte a EEJAM — PRIORIDADE 5

**Competência central:** observação e raciocínio espacial.

**Duração sugerida:** 60–75 segundos.

**Como jogar:** reconstruir imagem de um espaço da escola por meio de blocos grandes arrastáveis.

**Dificuldade:** começar com 3 × 3 peças; liberar 4 × 4 apenas após validar conforto na tela grande.

**Conteúdo:** entrada, laboratório, quadra ou ambiente real, conforme fotos oficiais disponibilizadas pela escola.

### 5.6 Batalha das Ideias — PRIORIDADE 6

**Competência central:** decisões rápidas, lógica e noções introdutórias de Marketing.

**Duração sugerida:** 60 segundos.

**Como jogar:** cada lado recebe cartões visuais com situações objetivas e escolhe a melhor entre 2–4 opções grandes.

**Conteúdo:** público-alvo, mensagem, canais de comunicação, uso de logotipos e situações da vida escolar.

**Cuidados:** evitar questões longas, ambíguas ou que dependam de conhecimentos prévios de Marketing.

## 5A. PACOTE OPCIONAL DE MINIJOGOS

Estes quatro jogos ampliam o catálogo, mas não fazem parte da entrega obrigatória dos seis minijogos. Só devem começar depois do aceite dos seis, salvo decisão da escola de usá-los como substitutos. Pontuações e tamanhos abaixo são valores iniciais, a calibrar na lousa real.

### 5.7 Palavra Secreta — OPCIONAL 1

**Competência central:** vocabulário e raciocínio.

**Duração sugerida:** 60 segundos.

**Como jogar:** versão adaptada da forca, sem boneco enforcado. O jogador descobre palavras curtas tocando em cerca de 12 letras grandes: as da palavra e algumas erradas. Cada erro tira combustível de um foguete; sem combustível, passa para a próxima palavra sem pontuar.

**Pontuação:** +20 por palavra completa e +5 por combustível restante.

**Justiça:** palavras diferentes em cada lado, porque o adversário enxerga a tela. Os pares de palavras têm o mesmo tamanho e dificuldade equivalente, sorteados pela `seed`.

**Conteúdo:** palavras de 4 a 7 letras sobre Marketing, escola e projetos, como MARCA, SLOGAN e PROJETO. O banco deve ter palavras suficientes para os 60 segundos. Acentos e Ç são normalizados no teclado: A vale também para Ã.

### 5.8 Desembaralha — OPCIONAL 2

**Competência central:** vocabulário e atenção.

**Duração sugerida:** 60 segundos.

**Como jogar:** tocar nas letras grandes na ordem certa para formar a palavra. Tocar em uma letra já colocada a devolve ao conjunto.

**Pontuação:** +15 por palavra, com bônus por sequência de palavras.

**Justiça:** mesma regra de pares da Palavra Secreta, usando o mesmo banco.

**Conteúdo:** evitar palavras que formem outra palavra válida com as mesmas letras.

### 5.9 Caça-Palavras EEJAM — OPCIONAL 3

**Competência central:** observação e atenção.

**Duração sugerida:** 60–75 segundos.

**Como jogar:** encontrar 4 ou 5 palavras em uma grade 7 × 7, arrastando sobre a palavra ou tocando na primeira e na última letra. Começar com palavras na horizontal e na vertical, sem palavras invertidas. Liberar diagonais e grade 8 × 8 apenas após validar conforto na lousa.

**Pontuação:** +20 por palavra. Quem encontrar todas encerra a partida via `onFinish` e recebe bônus de tempo.

**Justiça:** mesma lista de palavras nos dois lados, com grades diferentes geradas pela mesma `seed` e com a mesma quantidade de palavras por direção.

**Validação:** ao cruzar a borda da grade, o arrasto continua do mesmo jogador e a seleção fica limitada à grade.

### 5.10 Cabo de Guerra das Ideias — OPCIONAL 4

**Competência central:** decisões rápidas e noções de Marketing.

**Duração sugerida:** 60 segundos.

**Como jogar:** cada lado responde às mesmas perguntas, no próprio ritmo, em botões grandes. Cada acerto puxa a corda central um passo para o seu lado. Erro não puxa a corda e trava aquele lado por 1 segundo. Recomendado para semifinais e final, usando a escolha antecipada da seção 4.4.

**Pontuação:** vence quem levar a corda até a marca do seu lado, encerrando via `onFinish`, ou quem estiver à frente no fim do tempo. Corda no centro vai para o desempate.

**Conteúdo:** reutiliza `questions.json` da Batalha das Ideias, que deve estar pronta antes.

**Cuidados:** a corda só é puxada por respostas certas, nunca por toques repetidos. A corda é apenas visual; os toques continuam nas arenas de cada jogador.

### 5.11 Ideias reservadas e descartadas

- **Sequência Relâmpago (reserva):** repetir uma sequência crescente em 4 botões grandes. Não depende de conteúdo da escola.
- **Fato ou Mito (reserva):** frases rápidas com duas opções gigantes. Deve ser um modo da Batalha das Ideias, não um jogo separado.
- **Descartados:** cruzadinha e Stop exigem digitação; jogos de ritmo dependem de áudio sem atraso; jogo dos erros exige muita arte nova; cabo de guerra por toques rápidos estimula bater na lousa.

## 6. IDENTIDADE VISUAL E MASCOTES

### 6.1 Direção de arte

- Estética de jogos de festa: 2D cartoon, formas arredondadas, expressões exageradas, cores vivas, partículas e transições rápidas.
- Paleta inicial proposta: azul #2167DA; laranja #E76C2D; amarelo #FFE06A; roxo #5236B8; verde #30C48D; fundo escuro #1E2359. Ajustar com base na logo oficial da EEJAM.
- Interface com alto contraste, texto curto, botões grandes, placar visível e indicação adicional por nome/ícone — não confiar apenas na cor.
- Criar duas figuras originais, provisoriamente Faísca (azul) e Pipo (laranja); nomes e aparência devem ser validados antes da arte final.

### 6.2 Pacote de mascotes

Para cada mascote, preparar versões: parado, acerto, erro, surpresa, comemoração, derrota amistosa, apontando instruções e pose de abertura. Preferir SVG/PNG/WebP otimizados e sprites leves.

### 6.3 Elementos gráficos

- Logo oficial da EEJAM em alta resolução e uso autorizado.
- Ícones autorais: luz/ideia, megafone, livro, computador, projeto, foguete, estrela.
- Fundos temáticos diferentes por minijogo; evitar fotos pesadas como background de partidas.
- Cartões “VOCÊ SABIA?” com informações conferidas pela escola.
- Tela de vitória com confetes, troféu e reação dos mascotes.

### 6.4 Áudio

- Sons originais ou licenciados para acerto, erro, início, contagem, vitória e final.
- Música de fundo opcional com controle claro de volume e opção “sem som”.
- Áudio inicializado apenas após toque do apresentador, respeitando restrições do navegador.
- Não depender do som para transmitir uma informação essencial.

## 7. TELAS DO SISTEMA

- **T01** — Abertura: marca, slogan, mascotes, iniciar campeonato, modo demonstração, instruções.
- **T02** — Configuração: nome da bateria, participantes, duração, sorteio, parâmetros, modo de minijogos, áudio.
- **T03** — Chaveamento: rodadas, status, próximo confronto, placar de partidas concluídas.
- **T04** — Seleção de minijogo: grade 2 × 3 para os seis obrigatórios, ampliada para 2 × 5 quando o pacote opcional estiver ativo; escolha manual, sorteio, marcador de repetição.
- **T05** — Preparação: jogadores em cada lado, regra ilustrada, lembrete “um dedo, toque leve” com demonstração do mascote, toque do apresentador para iniciar e contagem regressiva.
- **T06** — Partida: arenas independentes, mascotes, cronômetro central, pontos, feedback visual e proteção contra saída acidental.
- **T07** — Resultado: vencedor, pontuações, curiosidade EEJAM, próximo confronto.
- **T08** — Final: campeão, celebração especial, resumo do torneio, iniciar nova bateria.
- **T09** — Modo apresentador: pausa, reinício, som, duração, anular partida, recuperar campeonato, exportação e limpeza.
- **T10** — Diagnóstico: contagem de toques simultâneos, mapa de toques, resolução e taxa de quadros estimada.

## 8. REQUISITOS FUNCIONAIS

- **RF01** Iniciar partidas 1 × 1 na mesma tela.
- **RF02** Processar eventos multitouch simultâneos por área.
- **RF03** Exibir regras curtas e contagem 3–2–1.
- **RF04** Atualizar pontuação e cronômetro em tempo real.
- **RF05** Identificar empate e realizar desempate.
- **RF06** Gerenciar torneios com 2–64 participantes (desempenho da interface de chaveamento a verificar).
- **RF07** Gerar chave eliminatória e avanços automáticos justos.
- **RF08** Salvar e restaurar o estado do campeonato.
- **RF09** Incluir 6 minijogos obrigatórios, todos temáticos, com suporte a ativar ou desativar os jogos do pacote opcional.
- **RF10** Permitir selecionar/sortear minijogo.
- **RF11** Proteger as ações administrativas durante as partidas.
- **RF12** Funcionar offline após instalação e cache testado.
- **RF13** Oferecer controles de som, reinício, pausa e tela cheia, com tratamento de falhas de navegador.
- **RF14** Exibir vencedor e classificação automaticamente.
- **RF15** Permitir exportar/restaurar backup JSON, observando que importação pode sobrescrever estado mediante confirmação.
- **RF16** Exibir e editar informações oficiais EEJAM/EMTI/Marketing em arquivo de configuração.
- **RF17** Ter teste de multitouch no próprio sistema.
- **RF18** Registrar resultados localmente com identificador único e estado do confronto.
- **RF19** Detectar toques em excesso por jogador e aplicar trava temporária somente àquele lado, com aviso visual.
- **RF20** Permitir que um minijogo encerre a partida antes do tempo por meio do motor comum.
- **RF21** Manter banco de palavras revisável em arquivo de dados, com tamanho, dificuldade e tema de cada palavra.

## 9. REQUISITOS NÃO FUNCIONAIS

- Desempenho: buscar animações fluidas próximas de 60 FPS no dispositivo real; qualidade adaptável e limite de efeitos se necessário.
- Responsividade: layout horizontal 16:9 como referência, adaptando proporção e resolução reais da tela.
- Toque: alvos grandes (referência visual inicial de 80–120 unidades CSS, a calibrar fisicamente); minimizar toque incorreto e fadiga.
- Segurança: código sem dependências remotas durante partidas; escapar entradas de texto; nenhum comando administrativo sem confirmação quando destrutivo.
- Resiliência: persistência após resultado, recuperação após interrupção, backup antes de mudanças de versão.
- Manutenibilidade: separação entre jogos, torneio, renderização, entrada, áudio, dados e persistência.
- Acessibilidade: ícones + texto, alto contraste, feedback não apenas por áudio, conteúdo de leitura breve, adaptação a alturas diferentes e opção para desativar animações intensas.
- Compatibilidade: testar o navegador efetivo da tela Android — Chromium/WebView ou navegador do fabricante — e não presumir que se comporta exatamente como Chrome para desktop.

## 10. ARQUITETURA DE SOFTWARE

### 10.1 Stack recomendada

- HTML5 + CSS3 + JavaScript ES Modules: interface, estados e componentes.
- Canvas 2D para gráficos, alvos, partículas e animações com requestAnimationFrame. Para telas administrativas, usar DOM/CSS.
- Pointer Events para multitouch, incluindo pointerId, pointerdown, pointermove, pointerup, pointercancel.
- Web Audio API ou elementos Audio para efeitos; desbloqueio após gesto válido.
- IndexedDB para campeonato, partidas e backups locais; localStorage apenas para preferências simples.
- Service Worker + manifest.webmanifest para PWA offline-first servida em HTTPS.
- Fullscreen API opcional, acionada por gesto do usuário e condicionada ao suporte do navegador.
- Screen Wake Lock API opcional, com alternativa de configuração de repouso do próprio Android.
- Sem backend obrigatório na primeira versão: o dispositivo é a fonte local de dados. Uma futura sincronização online requer desenho separado.

### 10.2 Estrutura proposta

```text
duelo-do-futuro/
├── index.html
├── manifest.webmanifest
├── sw.js
├── assets/
│ ├── brand/ # logo e identidade visual
│ ├── mascots/ # figuras e poses dos mascotes
│ ├── icons/ # ícones usados nos jogos
│ ├── photos/ # espaços reais com uso autorizado
│ └── sounds/ # efeitos e música licenciados
├── src/
│ ├── main.js # inicialização do aplicativo
│ ├── app-state.js # fluxo de telas e estados
│ ├── ui/ # telas, modais, componentes
│ ├── core/
│ │ ├── game-engine.js
│ │ ├── input-manager.js
│ │ ├── audio-manager.js
│ │ ├── timer.js
│ │ ├── tournament.js
│ │ ├── persistence.js
│ │ └── content.js
│ ├── games/
│ │ ├── touch-turbo.js
│ │ ├── marketing-express.js
│ │ ├── emti-route.js
│ │ ├── memory-eejam.js
│ │ ├── puzzle-eejam.js
│ │ ├── battle-ideas.js
│ │ ├── word-secret.js      # opcional
│ │ ├── word-scramble.js    # opcional
│ │ ├── word-search.js      # opcional
│ │ └── tug-of-war.js       # opcional
│ ├── data/
│ │ ├── school-facts.json
│ │ ├── questions.json
│ │ ├── words.json
│ │ └── game-settings.json
│ └── styles/
│ ├── base.css
│ ├── screens.css
│ └── games.css
├── tests/
│ ├── tournament.test.js
│ ├── scoring.test.js
│ ├── touch-input.test.js
│ └── persistence.test.js
└── README.md
```

### 10.3 Contrato para minijogos

Todo jogo deve expor funções equivalentes a:

```js
const game = {
  id: 'touch-turbo',
  title: 'Toque Turbo',
  durationSec: 45,
  prepare({ players, seed, difficulty, container, onFinish }) {},
  start() {},
  onPointer({ playerId, pointerId, type, x, y }) {},
  pause() {},
  resume() {},
  finish() { return { scores: [0, 0], winnerId: null }; },
  destroy() {}
};
```

O motor comum deve controlar temporizador, navegação, interface do resultado, áudio global, salvamento e transições. Os minijogos não alteram diretamente o chaveamento.

`onFinish` é chamado pelo jogo quando a partida termina antes do tempo, como ao encontrar todas as palavras ou ao levar a corda até a marca. O motor então chama `finish()` uma única vez. Memória EEJAM também usa esse recurso.

## 11. MODELO DE DADOS

### 11.1 Entidades

- Tournament: id, nome, criação, atualização, estado, configuração, rodadas, jogadorCampeãoId.
- Player: id estável e displayName (apelido), sem informação pessoal adicional obrigatória.
- Match: id, rodada, posição, playerAId, playerBId, gameId, seed, status, scores, winnerId, timestamps, motivo de eventual anulação.
- Settings: volume, modo de jogo, velocidade, duração, acessibilidade.
- SchoolContent: textos aprovados, identidade visual e cartões informativos.

### 11.2 Exemplo resumido

```json
{
  "tournamentId": "eejam-bateria-01",
  "status": "in_progress",
  "players": [
    {"id": "p01", "displayName": "Visitante 01"},
    {"id": "p02", "displayName": "Visitante 02"}
  ],
  "matches": [
    {
      "id": "m01",
      "round": 1,
      "playerAId": "p01",
      "playerBId": "p02",
      "gameId": "touch-turbo",
      "status": "finished",
      "scores": [180, 150],
      "winnerId": "p01"
    }
  ]
}
```

**Regra crítica:** nunca usar nome exibido como chave de identidade ou como única referência de vencedor. Utilizar IDs estáveis.

## 12. MULTITOUCH E ERGONOMIA

- Dividir horizontalmente a largura em duas arenas, sem sobreposição; mapear cada toque a um jogador no instante do pointerdown.
- Atribuir pointerId a uma sessão de toque para permitir arrastar sem trocar de jogador ao cruzar divisórias.
- Utilizar touch-action: none somente nas superfícies jogáveis; fora delas, preservar a navegação necessária ao professor.
- Em arrasto, capturar o ponteiro no elemento de jogo e liberar em pointerup ou pointercancel.
- Impedir que o mesmo alvo conte duas vezes, mesmo com dois dedos encostados quase simultaneamente.
- Ignorar cliques sintetizados que possam gerar pontuação duplicada.
- Posicionar controles administrativos em área protegida, preferencialmente acessível por gesto prolongado + confirmação.
- Reservar faixas superiores para placar/título e concentrar a interação principalmente na faixa média/inferior acessível aos estudantes.
- Criar a tela de diagnóstico “TOQUE AQUI” que exibe número de contatos ativos e círculo por ponteiro para validar o hardware.

### 12.1 Proteção da lousa contra impacto

A lousa registra toques leves, mas o jogo não deve depender de medir força, pois esse dado pode não existir ou não ser confiável. O sistema reage ao ritmo dos toques.

**Regras de jogo**

- Bater ou tocar repetidamente nunca dá vantagem.
- Toques em excesso ou fora dos alvos travam aquele lado por cerca de 1 segundo, e o mascote mostra “Toque leve!”. O limite exato deve ser calibrado para não punir jogadas rápidas normais.
- Nenhum jogo ou desempate usa contagem de toques rápidos como mecânica.
- Preferir arrastar, escolher e pensar antes de tocar nos jogos de maior tensão.

**Regras do evento**

- Mostrar “um dedo, toque leve” antes de cada partida e demonstrar no primeiro jogo da bateria.
- Manter um professor ao lado da lousa, além de quem opera o campeonato.
- Quem bater recebe um aviso; se repetir, a partida é anulada e refeita pelo modo apresentador.
- Testar as canetas da lousa, se o modelo tiver, com dois alunos jogando ao mesmo tempo.

**Verificações físicas**

- Conferir se a lousa está bem presa à parede ou, em suporte com rodas, se as rodas estão travadas.
- Verificar com a escola as condições de garantia e a responsabilidade em caso de dano por impacto.

## 13. INSTALAÇÃO E OPERAÇÃO NO ANDROID

> **Pendente:** esta seção assume Android. As lousas Samsung podem variar de sistema conforme a linha. Confirmar o modelo na Fase 0; se não for Android, revisar a estratégia de instalação, offline e navegador antes de desenvolver.

### 13.1 Estratégia PWA offline-first

1. Publicar app estático em hospedagem HTTPS de teste ou produção.
2. Registrar Service Worker que faça cache versionado de HTML, JS, CSS, sprites, áudio e demais recursos necessários.
3. Abrir no navegador Android compatível, carregar a versão completa e verificar instalação/adicionar à tela inicial quando disponível.
4. Desconectar o Wi-Fi e abrir novamente o jogo para comprovar funcionamento offline completo.
5. Usar requestFullscreen() apenas após toque do operador e tratar navegadores que recusam o modo.
6. Solicitar Wake Lock, se disponível, e configurar tempo de repouso da tela como plano alternativo.
7. Bloquear rotação e comportamentos indesejados conforme o navegador/aparelho efetivamente permite; orientar o uso físico da tela em paisagem.

**Atenção:** abrir um único arquivo por file:// pode ser suficiente para testes básicos, mas não substitui os testes de PWA/Service Worker em HTTPS. Nem todo Android de painel interativo implementa igualmente APIs de navegador.

### 13.2 Backup operacional

- Exportar JSON antes do evento.
- Manter cópia offline dos arquivos da versão estável e verificar integridade.
- Não realizar atualizações nem limpar dados de navegação durante uma bateria.
- Ter uma versão alternativa com jogo demonstrativo, caso o navegador local apresente restrições.

## 14. SEGURANÇA, PRIVACIDADE E CONTEÚDO EDUCACIONAL

- Priorizar nomes fictícios/apelidos ou códigos; evitar nome completo, foto, número, contato e turma sem necessidade operacional.
- Como o público inclui menores de idade, validar com a escola o uso de identificadores, fotografias e qualquer publicação de resultados; observar a LGPD e o melhor interesse da criança e do adolescente.
- Não publicar ranking nominal na internet na versão inicial.
- Limitar qualquer armazenamento à finalidade do evento e permitir apagamento local posterior.
- Informações sobre oferta de curso, matriz curricular, carga horária e benefícios do EMTI dependem de confirmação da direção; evitar promessas específicas não verificadas.
- Incluir créditos/licenças para imagens, sons e fontes de terceiros; preferir ativos originais.

## 15. TESTES E CRITÉRIOS DE ACEITE

### 15.1 Testes do motor e da competição

- Criar torneios com 2, 3, 5, 8, 16, 17 e 32 jogadores, verificando confrontos e avanços.
- Confirmar que nenhum jogador aparece em dois confrontos da mesma rodada.
- Confirmar que o número total de partidas disputadas para eliminação simples é N−1, excetuando somente eventuais cancelamentos/refações.
- Confirmar que empates não avançam como resultado definitivo.
- Confirmar que vencedor corresponde a ID de participante inscrito.
- Anular/refazer partida com confirmação e sem corromper as fases posteriores.
- Interromper e recarregar após partida: chaveamento intacto.
- Exportar e reimportar backup válido com confirmação.

### 15.2 Testes multitouch

- Dois dedos, um em cada lado, geram dois eventos independentes.
- Duas pessoas tocam simultaneamente durante 60 segundos sem travamentos.
- Arrasto em uma arena não aciona a arena oposta.
- Dois dedos no mesmo alvo contam uma única vez.
- Toque rápido, arrasto, retirada súbita e pointercancel são tratados.
- Scroll, pinch zoom e menus do Android não são acionados pelo gesto de jogar quando o navegador permitir bloqueio.
- Alvos são alcançáveis por alunos de alturas diferentes, inclusive próximos da borda e no centro da tela.
- Toques em excesso travam somente o lado que os fez e não punem uma jogada rápida normal.
- Bater ou tocar repetidamente nunca aumenta a pontuação.

### 15.3 Testes offline e performance

- O jogo abre offline após instalação e cache concluídos.
- Sons, fontes e imagens estão em cache; nenhum recurso externo necessário.
- Tela cheia e áudio têm fallbacks claros.
- Retomar após saída da aba não marca vencedor indevido.
- Sem vazamento de temporizadores ao repetir partidas sucessivas.
- Partidas permanecem fluidas no aparelho real, reduzindo partículas quando necessário.
- Testar com o som do evento e com toque impreciso de muitos usuários.

### 15.4 Aceite final da escola

A versão está apta para o evento somente após um teste presencial simulando uma bateria de 8 participantes no equipamento verdadeiro, de preferência com alunos e um professor operando o painel.

### 15.5 Testes do pacote opcional

- Mesma `seed` gera as mesmas palavras e grades; os dois lados recebem dificuldade equivalente.
- Toda grade do Caça-Palavras contém todas as palavras da lista.
- Palavras com acento e Ç funcionam na Palavra Secreta e no Desembaralha.
- O banco de palavras não acaba antes do fim da partida.
- `onFinish` encerra a partida uma única vez, mesmo com dois eventos quase simultâneos.
- A corda só se move com resposta certa, e o empate no centro leva ao desempate.
- Grade e letras são legíveis e alcançáveis na lousa real.

## 16. PLANO DE EXECUÇÃO POR FASES

### Fase 0 — Diagnóstico e especificação do dispositivo

**Atividades:** confirmar modelo da lousa Samsung, sistema e versão, navegador, suporte a PWA/offline, orientação, resolução, som, limite real de toques, canetas e fixação; validar logo e textos oficiais.

**Entregáveis:** ficha do equipamento, mapa de toques e conteúdos aprovados.

**Critério para avançar:** dois contatos independentes comprovados no navegador da tela e sistema da lousa confirmado como compatível com a arquitetura.

### Fase 1 — Refatoração da base e motor central

**Atividades:** separar o HTML inicial em módulos; consolidar estado, telas, temporizador, eventos, audio manager, input manager com trava por toques em excesso, persistência e interface de minijogos com `onFinish`.

**Entregáveis:** aplicativo navegável com motor comum e Toque Turbo migrado.

**Aceite:** iniciar, jogar, encerrar e reiniciar várias partidas sem interferência entre sessões.

### Fase 2 — Campeonato robusto

**Atividades:** IDs únicos, sorteio/balanced byes, chave, classificação automática, salvar/restaurar, desempate definitivo, reversão de resultados, baterias e backup/exportação.

**Entregáveis:** torneio funcional e persistente.

**Aceite:** baterias de 8/16 completadas sem divergências de classificação.

### Fase 3 — Arte, áudio e identidade EEJAM

**Atividades:** criar dois mascotes cartoon originais e poses; interface party game; partículas, confetes, fundos, ícones, efeitos sonoros e cartões informativos.

**Entregáveis:** UI final do Toque Turbo e telas do evento.

**Aceite:** leitura e controle confortáveis na tela grande real.

### Fase 4 — Expansão do catálogo

**Atividades:** implementar Marketing Express, Rota do EMTI, Memória EEJAM, Monte a EEJAM e Batalha das Ideias, um por vez, usando o contrato do motor.

**Entregáveis:** seis minijogos integrados ao mesmo campeonato.

**Aceite:** cada jogo retorna resultado consistente e respeita separação multitouch.

### Fase 4B — Pacote opcional

**Atividades:** criar `words.json` e implementar, nesta ordem, Palavra Secreta, Desembaralha, Caça-Palavras EEJAM e Cabo de Guerra das Ideias.

**Entregáveis:** jogos opcionais integrados ao mesmo campeonato e selecionáveis pelo professor.

**Aceite:** cada jogo passa nos testes da seção 15.5 sem atrasar a entrega dos seis obrigatórios.

### Fase 5 — PWA, modo apresentador e robustez

**Atividades:** criar manifest, Service Worker, cache offline, modo apresentador protegido, diagnóstico, configurações, logs simples e ferramenta de backup.

**Entregáveis:** versão de distribuição Android.

**Aceite:** baterias completas offline com recuperação após atualização/recarga controlada.

### Fase 6 — Testes presenciais e congelamento da versão

**Atividades:** testes com estudantes e professor, ajustes ergonômicos, medição de performance, revisão dos textos escolares, testes com som, ensaio geral.

**Entregáveis:** versão estável, manual do apresentador, checklist pré-evento, pacote de backup.

**Aceite:** executar simulação completa sem intervenção técnica.

## 17. BACKLOG PRIORIZADO

### MVP obrigatório (primeira versão validável)

- Dois lados com multitouch independente.
- Toque Turbo estável e justo.
- Trava por toques em excesso e lembrete de toque leve.
- Cadastro simples, sorteio e campeonato eliminatório.
- Placar, cronômetro, desempate e vencedor.
- Persistência local da chave e resultado.
- Tela de classificação e próximo confronto.
- Teste real no painel Android.

### Versão de evento

- Seis minijogos.
- Mascotes cartoon originais e animações.
- Sons, confetes, tela de campeão e cartões EEJAM.
- PWA offline, modo apresentador, backup e diagnóstico.
- Ajustes físicos após ensaio com estudantes.

### Pacote opcional, após os seis minijogos

- Banco de palavras revisado.
- Palavra Secreta.
- Desembaralha.
- Caça-Palavras EEJAM.
- Cabo de Guerra das Ideias, depois da Batalha das Ideias.

### Melhorias futuras, não bloqueantes

- Campeonato entre vencedores de baterias.
- Tema por área de conhecimento.
- Narração opcional dos mascotes.
- Ranking geral não nominal.
- Exportação de pôster digital do campeão (sem fotos/nomes completos por padrão).
- Sincronização ou painel web remoto, somente com planejamento de infraestrutura e privacidade.

## 18. ESTIMATIVA DE ESFORÇO E DEPENDÊNCIAS

Estimativa orientativa, a recalibrar após testar o dispositivo e avaliar o código: 5–7 ciclos de desenvolvimento curtos; o esforço real depende da criação de artes, da performance do Android e do grau de acabamento desejado. Não usar essa estimativa como compromisso de entrega sem validar recursos e prazo do evento.

**Dependências externas:** modelo e sistema da lousa Samsung; logotipo oficial; informações corretas de EMTI e Marketing; autorização das fotografias; acesso ao painel Android para ensaio; organização de participantes; definição de data e duração total do evento.

## 19. RISCOS E CONTINGÊNCIAS

| Risco | Probabilidade/Impacto | Mitigação |
|---|---|---|
| Navegador do painel não reconhece toques simultâneos corretamente | Médio/Alto | Teste de diagnóstico antes de desenvolver os jogos; navegador alternativo quando permitido |
| Interface do Android interfere em toques/gestos | Médio/Alto | touch-action, modo PWA/tela cheia, ajustes no aparelho, áreas seguras |
| Internet instável | Alto/Médio | Cache PWA verificado com Wi-Fi desligado |
| Perda de torneio ao fechar aba | Médio/Alto | IndexedDB e exportação de backup; validação de recuperação |
| Rodadas longas demais para o fluxo do evento | Alto/Médio | Baterias de 8 ou 16 e partida de 45–60 segundos |
| Jogadores com alturas diferentes não alcançam alvos | Médio/Alto | Calibração de área inferior; não colocar toque crítico na parte alta |
| Fotos/textos escolares não aprovados | Médio/Médio | Conteúdo genérico aprovado como fallback; jogos de palavras podem substituir Memória EEJAM e Monte a EEJAM no evento |
| Confusão com modo de administração | Médio/Médio | Gestos de acesso protegidos, confirmações e botões afastados do campo de jogo |
| Animações pesadas causam travamento | Médio/Alto | Canvas 2D leve, limite de partículas e perfil baixo |
| Alunos batem com força na lousa | Alto/Alto | Medidas da seção 12.1: jogos que premiam precisão, trava por toques em excesso, instrução de toque leve, professor ao lado da lousa e regra de anulação |
| Lousa Samsung não usa Android ou limita PWA/offline | Médio/Alto | Identificar modelo e sistema na Fase 0, antes de desenvolver; testar navegador, cache offline e multitouch no aparelho real |
| Pacote opcional atrasa os seis jogos obrigatórios | Médio/Médio | Iniciar o pacote somente depois do aceite dos seis jogos, salvo substituição decidida pela escola |

## 20. PROCEDIMENTO NO DIA DO EVENTO

**Antes de começar:** conferir a fixação da lousa ou o travamento das rodas; conectar alimentação, testar áudio, confirmar orientação horizontal, brilho e acesso físico; abrir PWA; validar teste de dois dedos; verificar modo offline; carregar bateria/turma; salvar backup; realizar uma partida de demonstração.

**Durante:** um professor fica ao lado da lousa para orientar o toque leve; professor controla o campeonato; trocar a dupla; apresentar instrução; começar; confirmar o vencedor; mostrar chaveamento; chamar a próxima dupla.

**Em erro:** pausar, usar função de anulação/refação, recuperar estado salvo, nunca excluir dados sem confirmação.

**Ao finalizar:** mostrar o campeão, exportar resultados se autorizado, encerrar a bateria e apagar dados quando não forem mais necessários.

## 21. DEFINIÇÃO DE PRONTO (DoD)

O produto é considerado pronto para uso no evento quando:

1. os seis minijogos funcionam em 1 × 1 multitouch;
2. a competição sorteia, pontua, desempata e promove vencedores sem inconsistências;
3. as informações da escola foram revisadas;
4. o visual cartoon, os mascotes e a identidade EEJAM estão integrados;
5. o sistema abre e roda offline após instalação e teste;
6. o professor consegue recuperar campeonato e repetir partida anulada;
7. a experiência foi testada presencialmente na lousa real;
8. existe manual simples e backup local estável;
9. as medidas de proteção contra impacto da seção 12.1 foram testadas na lousa real.

Os jogos do pacote opcional não são exigidos nesta definição, salvo se a escola decidir usá-los como substitutos.

## 22. PROMPT MESTRE PARA IMPLEMENTAÇÃO COM AGENTE DE PROGRAMAÇÃO

Desenvolva incrementalmente o projeto Duelo do Futuro — EEJAM 2027, um party game offline-first para painel Android gigante multitouch. Utilize HTML5, CSS3, JavaScript ES Modules e Canvas 2D. Preserve e refatore o protótipo inicial, sem descartar seu torneio e Toque Turbo existentes. Separe motor de jogo, input manager por pointerId, camada de campeonato, telas, persistência IndexedDB, áudio, conteúdo escolar e seis minijogos. Garanta arenas simultâneas e isoladas por jogador, justiça competitiva, grandes áreas tocáveis, transições rápidas e modo apresentador protegido. Desenvolva primeiro o diagnóstico multitouch e Toque Turbo, depois o campeonato robusto, identidade cartoon e demais minijogos. Implemente PWA com cache offline em HTTPS, sem serviços externos necessários para partidas. Crie testes para bracket de 2, 3, 5, 8, 16, 17 e 32 jogadores, desempate, pontuação duplicada, toques simultâneos, persistência e retomada após interrupção. Não invente dados institucionais: separe textos sobre EEJAM, EMTI e Marketing em arquivos revisáveis. Não inclua cadastro pessoal, fotos de alunos ou publicação de ranking nominal por padrão. Documente execução, instalação Android, testes no dispositivo e procedimento do dia do evento. Execute cada fase com critérios de aceite antes de avançar.

**Complemento da v1.1:** nenhum jogo pode premiar bater ou tocar repetidamente; implemente a trava da seção 12.1 e o `onFinish` da seção 10.3. Confirme o sistema da lousa antes de assumir Android. Os jogos da seção 5A só começam após os seis obrigatórios.

## 23. O QUE JÁ EXISTE NO PROTÓTIPO INICIAL

Inspeção do arquivo duelo_futuro_eejam_2027.html fornecido no ambiente desta conversa: existem tela inicial, teste do Toque Turbo, cadastro básico de 2–64 participantes, sorteio, chaveamento eliminatório, partida de 45 segundos com tipos de alvos, desempate, resultado e cartões de curiosidades. O visual atual usa emojis provisórios como mascotes. Ainda não estão implementados persistência, PWA/offline, modo apresentador protegido, áudio e os cinco minijogos adicionais; o uso em painel Android real não foi validado. O desenvolvimento deve iniciar corrigindo essas lacunas, não descrevendo o HTML inicial como produto final pronto.

**Pendente na v1.1:** o arquivo `duelo_futuro_eejam_2027.html` não está na pasta do projeto e precisa ser adicionado antes do desenvolvimento.

## 24. REFERÊNCIAS TÉCNICAS E NORMATIVAS

- MDN — Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN — Multi-touch interaction: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction
- MDN — Using Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- MDN — Guide to Fullscreen API: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide
- MDN — Screen Wake Lock API: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- ANPD — Dados pessoais de crianças e adolescentes: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_legitimo_interesse.pdf

**Nota final:** a especificação está pronta para orientar a implementação. Dados ainda não fornecidos — modelo exato da lousa Samsung e seu sistema, data do evento, número esperado de visitantes e logo em alta resolução — são dependências a levantar na Fase 0, mas não impedem iniciar o desenvolvimento técnico.
