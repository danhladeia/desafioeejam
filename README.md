# Duelo do Futuro — EEJAM 2027

## Educação Física — 6º ao 9º ano

O botão **EDF** oferece catorze jogos para o ano escolhido (6º, 7º, 8º ou 9º): os doze do modo normal adaptados aos conteúdos do caderno, a Trilha de Cartas e o Ordene a Sequência. Forca, caça-palavras, memória, quebra-cabeças, sílabas, caça-erro, rota, cabo de guerra e os demais usam o conteúdo EDF do ano. Há partidas solo/livres e campeonato próprio com equipes, alunos, quantidade de rodadas, sorteio de cinco segundos, troca individual de aluno, ranking e final. Instruções, regras e referências estão em [MODO_EDF_7_ANO.md](MODO_EDF_7_ANO.md).



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

- Solo: escolha apelido, dificuldade e desafio. As melhores marcas ficam neste aparelho.
- Partida livre: teste qualquer desafio, sem salvar resultado.
- Segure o botão de pausa por cerca de um segundo para abrir o modo apresentador. A tecla Esc também pausa.
- Ajustes oferece nível Desafio (14–15 anos), Avançado e redução de animações. O som pode ser desligado.
- A abertura não aparece se o sistema estiver com as animações desligadas. Para vê-la mesmo assim, abra Ajustes, desmarque "Reduzir animações e partículas" e salve.

## Modo Duelo (equipes, participantes e jogos à sua escolha)

O botão **Modo Duelo** da tela inicial abre direto a configuração, sem token. Ali o professor escolhe:

1. **Conteúdo do duelo:** *Normal* (os jogos do Duelo do Futuro) ou *Educação Física* (os mesmos jogos com o conteúdo dos cadernos). No EDF, escolhe também o **ano** (6º ao 9º) e as **unidades**.
2. **Jogos que entram no sorteio:** caixas de seleção, com **Marcar todos** e **Desmarcar todos**. É preciso ao menos um.
3. **Rodadas** (de 1 a 40, a última é a final) e **dificuldade inicial** (Fácil, Médio ou Difícil).
4. **Equipes** (de 2 a 8), cada uma com nome e a lista de **participantes**, um por linha (até 60 por equipe, sem repetição na mesma equipe).

Depois de **Criar duelo**, o fluxo é: sorteio animado de 5 segundos (equipes, participantes e jogo) → confronto, com **Sortear outro aluno** em um lado só → partida → resultado → ranking animado → próximo sorteio → final → equipe campeã. **Adicionar participantes** continua disponível durante o duelo.

- Classificatórias mantêm a diferença de participações entre as equipes em no máximo uma partida. A última rodada é a final entre as duas melhores. Quem já jogou não é sorteado de novo, inclusive na final.
- A tabela ordena por aproveitamento (vitórias ÷ jogos), vitórias e pontos; empate absoluto vai pelo nome da equipe.
- O duelo é salvo a cada rodada neste aparelho. Depois de recarregar, **Modo Duelo** mostra **Continuar**.
- O duelo salvo antes desta mudança (sem o campo de modo) continua abrindo e vale como EDF.

Os arquivos do duelo antigo por turmas (`duel.js`, `duel-ui.js`, `roster.js`) continuam no projeto, mas não são mais usados pelo botão. Apagá-los fica como limpeza futura.

## Jogos de dois jogadores no mesmo campo

**Vôlei Duplo** e **Futebol de Disco** usam uma arena compartilhada: os dois alunos jogam no mesmo campo, cada um na sua metade, com placares separados no topo. Eles aparecem no Modo Duelo e em **Jogar uma partida**, mas não no solo nem contra o robô.

- **Vôlei Duplo:** quadra lateral e uma única bola. Corte a bola com o dedo quando ela estiver do seu lado; a bola começa lenta e acelera a cada rebatida. Vence quem chegar a 7 pontos.
- **Futebol de Disco:** campo visto de cima, estilo disco bol. Arraste o seu disco na sua metade e empurre a bola para o gol do adversário. Vence quem chegar a 5 gols.
- Se o tempo acabar empatado, há uma prorrogação de 20 segundos em que o próximo ponto decide; persistindo o empate, o vencedor é sorteado.

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

`npm test` executa os testes de conteúdo, Modo Duelo, persistência e geração de caça-palavras. Para testes no navegador: `npm install`, `npx playwright install chromium` e `npx playwright test`.

Arquivos principais: app.js (telas/motor/efeitos), games.js (minijogos), content.js (banco revisável), style.css (estilos dos jogos), menu.css (palco, menu, abertura e escala para tablet), duel.js (regras e sorteio do Modo Duelo), duel-ui.js e duel.css (telas do Modo Duelo), roster.js (alunos do 9º A e B), sw.js (cache). Ao atualizar arquivos distribuídos, incremente a versão do cache em sw.js e app.js e revalide o offline antes do evento. edf-anos.js e edf-ano6.js a edf-ano9.js (conteúdo por ano), edf-sequencia.js (Ordene a Sequência) e forca-boneco.js (boneco da Forca).
# Arcade EDF

O projeto inclui o primeiro desafio arcade, **Corte Certo**: dois alunos podem cortar itens simultaneamente em arenas independentes. Ele funciona no modo normal e no EDF, respeita pausa, pontuação por rapidez, multitoque por arena e o cache offline. Os demais desafios arcade descritos em `ARQUITETURA_ARCADE.md` seguem a mesma base de canvas.

