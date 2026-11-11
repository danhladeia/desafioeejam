# Duelo do Futuro — EEJAM 2027

## Educação Física — 6º ao 9º ano

O botão **EDF** oferece catorze jogos para o ano escolhido (6º, 7º, 8º ou 9º): os doze do modo normal adaptados aos conteúdos do caderno, a Trilha de Cartas e o Ordene a Sequência. Forca, caça-palavras, memória, quebra-cabeças, sílabas, caça-erro, rota, cabo de guerra e os demais usam o conteúdo EDF do ano. Há partidas solo/livres e campeonato próprio com equipes, alunos, quantidade de rodadas, sorteio de cinco segundos, troca individual de aluno, ranking e final. Instruções, regras e referências estão em [MODO_EDF_7_ANO.md](MODO_EDF_7_ANO.md).

## Atualização de campeonato e partidas

**Começar campeonato** permite cadastrar de 2 a 64 equipes com nomes e listas de participantes, ou escolher o modo individual. O novo **Jogar solo** salva as melhores marcas por jogo e dificuldade. Veja as regras atuais e os detalhes da atualização em [ATUALIZACAO_JOGOS.md](ATUALIZACAO_JOGOS.md).

## Novas artes e Cabo de Guerra

Os selos e as peças de Balança dos Números, Sílabas Soltas e Caça-Erro estão integrados ao catálogo, sorteio e partidas. As pranchas originais permanecem preservadas em assets/visual/new-games; o recorte é feito por CSS.

O Cabo de Guerra usa uma corda ilustrada e oito poses em PNG de Faísca e Pipo (quatro quadros por personagem). O ciclo de esforço acompanha a partida, um acerto causa um puxão e move a fita central conforme a diferença de pontos. O movimento é interrompido ao pausar ou entrar no desempate. A opção de reduzir animações conserva a indicação de vantagem sem o ciclo de esforço. Os novos arquivos estão no cache offline.

As personagens da diretora, vice e coordenadora foram retiradas do menu. As imagens originais continuam disponíveis na pasta de artes.

## Música e efeitos

O jogo inclui três trilhas eletrônicas instrumentais originais de competição: Corrida Neon (140 BPM), Órbita das Ideias (136 BPM) e Sprint do Futuro (148 BPM). Têm batida de dança marcada, caixa, chimbal, baixo pulsante, acordes curtos e arpejos. Os efeitos reduzem brevemente a música para que acertos, erros e avisos continuem audíveis. A trilha de cada partida é sorteada evitando repetição consecutiva, e troca após dois ciclos musicais durante partidas longas. Menus e resultados têm temas próprios. A síntese é feita no navegador pelo módulo audio.js, sem downloads, serviços externos ou arquivos remotos, inclusive offline.

O áudio inicia após o primeiro toque/clique ou tecla. O botão com a nota musical liga/desliga a música; o alto-falante controla todo o som. Em Ajustes há volumes independentes para música e efeitos, opção de desligar efeitos e um teste de som. As preferências são salvas. Pausa congela a trilha; sair da aba interrompe o áudio. Ao voltar durante uma partida, continue pelo modo apresentador.

Há efeitos diferentes para interface, contagem, largada, acerto, erro, bônus, desempate, pausa, vitória e campeão. O áudio complementa as indicações visuais.

Versão jogável local com 12 desafios no catálogo. Forca usa a forca e o boneco tradicional (seis erros); Palavra Secreta usa combustível de foguete e disputa rodadas de descoberta da mesma palavra.

## Abrir

Com Node.js instalado, dê dois cliques em **Abrir Jogo.cmd**. Alternativa: execute `npm start` nesta pasta e abra http://localhost:4173.

O jogo usa arquivos locais e não exige instalação de dependências para jogar. As dependências de desenvolvimento são apenas para testes.

## Operação

- Campeonato: cadastre de 2 a 64 equipes e seus integrantes, ou selecione Individual e informe os apelidos. Confira os confrontos e escolha o jogo. A equipe avança como uma unidade no chaveamento; a lista de integrantes fica disponível para consulta.
- Solo: escolha apelido, dificuldade e desafio. As melhores marcas ficam neste aparelho.
- Partida livre: teste qualquer desafio sem alterar o campeonato.
- Segure o botão de pausa por cerca de um segundo para abrir o modo apresentador. A tecla Esc também pausa.
- Confirme cada resultado para gravá-lo e avançar o vencedor. O último resultado confirmado pode ser desfeito.
- O campeonato é salvo em IndexedDB. Uma recarga recupera os resultados confirmados; uma partida interrompida precisa ser repetida.
- Exporte backups pelo botão Backup. A importação e a limpeza estão em Teste de toque. A importação é validada e pede confirmação antes de substituir o campeonato.
- Ajustes oferece nível Desafio (14–15 anos), Avançado e redução de animações. O som pode ser desligado.
- A abertura não aparece se o sistema estiver com as animações desligadas. Para vê-la mesmo assim, abra Ajustes, desmarque "Reduzir animações e partículas" e salve.

## Modo Duelo (três turmas)

No menu, **Modo Duelo** pede o token do professor. O token não fica escrito no código, só o seu resumo (hash). Isso afasta curiosos, mas não é segurança de verdade: quem souber mexer no código do navegador consegue contornar.

Turmas: 9º A EEJAM e 9º B EEJAM, com os alunos de `roster.js`, e 9º M. Braga, cujos nomes o professor digita em **Adicionar nomes** (um por linha, só o primeiro nome; nomes iguais precisam da inicial do sobrenome). Esses nomes ficam salvos só neste aparelho.

- O professor escolhe 5, 10, 15 ou 20 rodadas.
- Depois do token, selecione os jogos válidos. A roleta dura cinco segundos, desacelera e revela o versus com as turmas e os alunos. É possível trocar o aluno de cada lado sem alterar o outro lado, o jogo ou as turmas.
- Os jogos válidos percorrem ciclos sem repetição até esgotar a seleção. Com apenas um jogo escolhido, ele se repete.
- As classificatórias mantêm a diferença de participações das turmas em no máximo uma partida. A última rodada do total escolhido é a final entre as duas melhores classificadas.
- Um aluno que já jogou não será sorteado novamente, inclusive na final. Se os alunos inéditos acabarem, o sistema avisa para ajustar a lista ou iniciar outra bateria.
- Cada vitória vale uma vitória na tabela. As classificatórias ordenam por aproveitamento (vitórias ÷ jogos), vitórias e pontos; persistindo empate absoluto, o nome da turma define a ordem. A campeã é a vencedora da final. O ranking aparece com suspense após cada resultado confirmado.
- O duelo fica salvo a cada rodada. Depois de recarregar a página, **Modo Duelo**, o token e **Continuar** retomam no sorteio em que parou. Uma partida interrompida precisa ser repetida.
- **Apagar dados do duelo** remove o duelo e os nomes do M. Braga do aparelho. Os nomes dos 9º A e B são só primeiros nomes, tirados da lista da escola; confirme com a direção se podem ficar no código antes de publicar o jogo na internet.

## Jogos e dificuldade

Toque Turbo favorece precisão, limita alvos simultâneos e aumenta gradualmente as armadilhas. Respostas erradas travam brevemente a arena. Os desafios por tempo sobem de nível a cada três objetivos concluídos, até o nível 3. Memória usa seis ou oito pares; quebra-cabeças têm seis, oito ou doze peças. Caça-palavras usa oito direções, palavras invertidas e diagonais, chegando a uma grade 8×8. Cada rodada usa uma semente para equilibrar desafios dos dois lados.

Cada acerto vale 1.000 pontos e até 20 extras pela velocidade; um segundo ativo reduz o bônus em um ponto. Pausa e espera do feedback não contam. O bônus acumulado é limitado a 999: a quantidade de acertos tem prioridade e a rapidez desempata. Na corda, são os acertos que movem a bandeira. Jogos finitos podem terminar antes do relógio quando alguém completa a missão.

As arenas recebem toques independentes. Arrastos capturam o ponteiro na arena de origem. Excesso de toques bloqueia somente aquele lado por um segundo. Nenhuma mecânica dá pontos por força ou repetição de toques.

## Offline e equipamento

O aplicativo instala um cache local por Service Worker quando servido por localhost ou HTTPS. Abra uma vez, espere “Pronto para offline” e teste recarregar sem rede. Abrir index.html diretamente pelo Explorador não executa corretamente os módulos nem o cache. Para usar a lousa, hospede por HTTPS ou execute o servidor no próprio equipamento compatível com Node. O servidor local fornecido escuta apenas no computador atual.

Ainda é necessário confirmar o modelo/sistema da lousa Samsung e validar o multitouch e a ergonomia no equipamento real. A calibração da dificuldade precisa de um ensaio com estudantes. Não há garantia de 60 FPS no hardware ainda não testado.

## Artes

As artes originais permanecem preservadas em assets/visual/concepts. O menu usa recortes individuais em WebP, em assets/visual/menu. Os ícones funcionais usam imagens PNG/WebP compatíveis com a identidade visual. Memória usa figuras de materiais escolares e uma imagem de verso. Os quebra-cabeças usam duas cenas contínuas em assets/visual/puzzle, recortadas pela própria mecânica, sem emendas desenhadas na imagem. As personagens da equipe escolar ficam fora do menu; os mascotes da corda usam quadros animados.

A fonte Fredoka (The Fredoka Project Authors) é embutida em assets/fonts sob a licença SIL Open Font 1.1, incluída em OFL-Fredoka.txt.

Os fundos de cada jogo existem como prancha de referência; nesta versão o campo jogável usa fundos leves para contraste. A imagem do quebra-cabeça é uma cena genérica ilustrada e não representa uma foto real da escola. Informações de oferta/carga horária institucional não são inventadas.

## Testes

`npm test` executa testes do campeonato, persistência, conteúdo e geração de caça-palavras. Para testes no navegador: `npm install`, `npx playwright install chromium` e `npx playwright test`.

Arquivos principais: app.js (telas/motor/efeitos), games.js (minijogos), core.js (campeonato/persistência), content.js (banco revisável), style.css (estilos dos jogos), menu.css (palco, menu, abertura e escala para tablet), duel.js (regras e sorteio do Modo Duelo), duel-ui.js e duel.css (telas do Modo Duelo), roster.js (alunos do 9º A e B), sw.js (cache). Ao atualizar arquivos distribuídos, incremente a versão do cache em sw.js e app.js e revalide o offline antes do evento. edf-anos.js e edf-ano6.js a edf-ano9.js (conteúdo por ano), edf-sequencia.js (Ordene a Sequência) e forca-boneco.js (boneco da Forca).
# Arcade EDF

O projeto inclui o primeiro desafio arcade, **Corte Certo**: dois alunos podem cortar itens simultaneamente em arenas independentes. Ele funciona no modo normal e no EDF, respeita pausa, pontuação por rapidez, multitoque por arena e o cache offline. Os demais desafios arcade descritos em `ARQUITETURA_ARCADE.md` seguem a mesma base de canvas.

