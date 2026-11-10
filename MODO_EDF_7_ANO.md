# Educação Física — 6º ao 9º ano

Abra **EDF** no menu inicial e escolha o ano: 6º, 7º, 8º ou 9º. Cada ano usa o conteúdo do seu caderno DED Express. O EDF oferece os doze jogos do modo normal adaptados aos conteúdos, a Trilha de Cartas e o Ordene a Sequência, totalizando catorze desafios.

## Jogar uma partida

Escolha o ano, marque os conteúdos, escolha um desafio e selecione solo ou duelo livre. Informe os nomes e clique em **Preparar jogo EDF**. O duelo livre também pode reaproveitar os nomes das equipes cadastradas no campeonato normal.

| Jogo EDF | Adaptação |
| --- | --- |
| Trilha de Cartas | Perguntas ilustradas e trilha de oito casas. |
| Toque Turbo | Conceitos e figuras dos temas selecionados, com cartas de descuido para evitar. |
| Rota dos Saberes | Classificação de situações e conceitos de Educação Física. |
| Memória em Movimento | Pares de conceitos, ilustrações do caderno e peças de tabuleiro. |
| Monte a Cena | Quebra-cabeças com as imagens dos temas, com fundo nas peças para preservar sua visibilidade. |
| Palavra Secreta | Disputa de palavras do conteúdo, com dicas. |
| Forca | Descoberta de palavras e conceitos do conteúdo, com a forca de madeira e o boneco tradicional (seis erros). |
| Desembaralha | Letras de palavras dos temas marcados. |
| Caça-Palavras | Palavras dos temas em oito direções, incluindo diagonais e inversas. |
| Cabo de Guerra | Perguntas do conteúdo puxam a corda a cada acerto. |
| Sílabas em Movimento | Formação de palavras dos temas, com ilustrações e sílabas. |
| Caça-Erro | Revisão da escrita em frases sobre os conteúdos. |
| Circuito em Equilíbrio | Combinação de blocos de minutos para planejar o tempo de um circuito. |
| Ordene a Sequência | Arrastar cartões para a ordem certa: linhas do tempo e passo a passo do caderno. Disponível só no EDF. |

Todos os desafios respeitam os temas selecionados. Os jogos de palavras, por exemplo, usam vocabulário dos temas marcados, em vez do banco do modo normal. As melhores marcas solo são separadas por jogo, temas e dificuldade.

## Equipes, alunos e sorteio

Na tela EDF, clique em **Equipes, alunos e sorteio**. Cadastre de duas a oito equipes, com nomes próprios e até sessenta alunos por equipe. Digite um nome ou apelido por linha; diferencie homônimos dentro da mesma equipe.

Escolha os conteúdos, os jogos válidos e a quantidade total de rodadas, de uma a quarenta, incluindo a final. Com mais de duas equipes, é necessário escolher rodadas suficientes para que todas participem antes da final.

O sorteio dura cinco segundos, gira os nomes, desacelera e revela o versus. Sorteia equipes, um aluno por lado e um jogo da seleção. A redução de movimento permite a revelação imediata.

As classificatórias equilibram o número de participações. A tabela considera aproveitamento, vitórias e pontos; empate absoluto é ordenado pelo nome da equipe. A última rodada reúne as duas melhores classificadas e sua vencedora é a campeã.

Depois da revelação, é possível sortear outro aluno em apenas um lado. O outro aluno, as equipes e o jogo permanecem. Nomes recusados não voltam naquela rodada. Quem já disputou uma rodada confirmada não é sorteado novamente no campeonato.

Se acabarem os nomes disponíveis, o sorteio avisa e preserva os resultados. Use **Adicionar alunos** para acrescentar participantes e continuar, sem reciclar quem já jogou. A confirmação de cada resultado salva a rodada e abre o ranking animado.

O campeonato EDF é salvo neste aparelho. Ao voltar pela mesma opção, o jogo recupera placar, alunos usados e sorteio pendente. Ele não altera o campeonato nem o Duelo das turmas do modo normal.

## Conteúdo e artes

Cada ano tem três unidades, que vêm marcadas por padrão:

| Ano | Unidades |
| --- | --- |
| 6º | Corpo em forma; Aventura na cidade; Lutas do Brasil |
| 7º | Ginástica e saúde; Aventura urbana segura; Lutas do Brasil: história e respeito. Jogos de tabuleiro é um complemento opcional e pode ser usado sozinho |
| 8º | Rede/parede e campo e taco; Invasão e combate: tática; Esporte e sociedade |
| 9º | Ginásticas e corpo; Aventura na natureza; Lutas do mundo |

Cada ano tem 27 cartas de revisão (9 por unidade), 48 palavras, 27 frases do Caça-Erro e 18 sequências do Ordene a Sequência, todas com a página do caderno. O 7º ano tem, além disso, seis cartas e três sequências complementares de tabuleiro. **Conferir cartas e fontes** mostra as cartas do ano escolhido, com as respostas comentadas e as páginas do material. As cartas, palavras e sequências dos anos 6, 8 e 9 foram escritas a partir do texto dos cadernos; o professor deve conferi-las antes de usar em turma.

Doze ilustrações PNG de cada ano foram extraídas do glossário da página 25 do caderno, com a transparência original preservada. As do 7º ano estão em `assets/visual/edf/`; as dos outros anos, em `assets/visual/edf/ano6/`, `ano8/` e `ano9/`. A procedência de cada arquivo está no `proveniencia.json` da pasta, e o script `scripts/extrair-glossario.py` repete a extração.

A nova prancha `assets/visual/edf/board-pieces-atlas-v1.png` contém nove ilustrações 3D de tabuleiro, com transparência: rei, peão, torre, bispo, cavalo, dama, peças de damas, tabuleiro e estratégia. Foi gerada pelo recurso de imagens integrado; o prompt completo e a ordem das células estão em `assets/visual/edf/board-pieces-generation-v1.json`. Os jogos recortam a prancha na própria tela, preservando o arquivo original.

## Pontuação e funcionamento

Mantêm-se pausa, efeitos verdes/vermelhos, som, dificuldade progressiva e bônus de rapidez. Cada acerto vale 1.000 pontos e até vinte extras pela velocidade; pausas e bloqueios do feedback não entram no tempo de resolução. A quantidade de acertos tem prioridade e o bônus acumulado não pode superar a vantagem de um acerto.

Jogos com missão finita podem encerrar ao concluir a missão. Nos demais, o relógio determina o término. Um empate absoluto em qualquer jogo EDF abre uma pergunta dos temas selecionados, igual para os dois lados.

Os módulos, imagens e telas entram no cache offline. Carregue a atualização com conexão até aparecer **Pronto para offline** antes de usar sem rede.

## Verificação desta atualização

Passaram 103 testes de regras e conteúdo e 116 dos 117 testes de navegador (o que falha, o da Palavra Secreta com o alfabeto inteiro, já falhava antes deste trabalho e não foi alterado), incluindo os 14 jogos EDF nos quatro anos, a Forca com boneco nos dois modos e o Ordene a Sequência por toque e por arrasto.
