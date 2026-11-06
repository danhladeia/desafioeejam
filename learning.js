// Conteúdo de matemática e português dos jogos Cabo de Guerra, Sílabas Soltas e Caça-Erro.
// Texto revisável: cada lista pode ser editada sem mexer na lógica dos jogos.

/** Palavras com a separação silábica. Nível pelo número de sílabas: 2, 3 e 4 ou mais. */
export const SYLLABLE_WORDS = [
  ['META', 'ME-TA', 'Resultado que orienta as etapas de um projeto.'], ['DADO', 'DA-DO', 'Registro que pode ser analisado em uma pesquisa.'],
  ['REDE', 'RE-DE', 'Conexão entre pessoas ou dispositivos.'], ['TEXTO', 'TEX-TO', 'Mensagem organizada em palavras e ideias.'],
  ['FONTE', 'FON-TE', 'Origem de uma informação que precisa ser verificada.'], ['LIVRO', 'LI-VRO', 'Obra que reúne conhecimentos, argumentos ou narrativas.'],
  ['PRAZO', 'PRA-ZO', 'Data limite para concluir uma tarefa.'], ['CUSTO', 'CUS-TO', 'Valor necessário para executar uma ação.'],
  ['GRUPO', 'GRU-PO', 'Pessoas que compartilham uma atividade ou objetivo.'], ['PLANO', 'PLA-NO', 'Organização das ações para alcançar um resultado.'],
  ['MARCA', 'MAR-CA', 'Identidade que ajuda a reconhecer um produto ou projeto.'], ['CURSO', 'CUR-SO', 'Percurso organizado de aprendizagem.'],
  ['ESCOLA', 'ES-CO-LA', 'Lugar de aprender com os colegas.'], ['JANELA', 'JA-NE-LA', 'Por ela entra a luz.'],
  ['CADEIRA', 'CA-DEI-RA', 'Serve para sentar.'], ['CADERNO', 'CA-DER-NO', 'Onde anotamos a matéria.'],
  ['MOCHILA', 'MO-CHI-LA', 'Carrega o material nas costas.'], ['PROJETO', 'PRO-JE-TO', 'Plano com objetivo e etapas.'],
  ['DEBATE', 'DE-BA-TE', 'Troca de argumentos sobre um tema.'], ['ROTEIRO', 'RO-TEI-RO', 'Sequência planejada para uma apresentação ou vídeo.'],
  ['CAMPANHA', 'CAM-PA-NHA', 'Conjunto de ações de comunicação com um objetivo.'], ['RECURSO', 'RE-CUR-SO', 'Meio disponível para realizar uma atividade.'],
  ['RESUMO', 'RE-SU-MO', 'Texto que reúne as ideias centrais de outro.'], ['ESTUDO', 'ES-TU-DO', 'Aprender com atenção e comparar explicações.'],
  ['EQUIPE', 'E-QUI-PE', 'Pessoas que trabalham juntas.'], ['PESQUISA', 'PES-QUI-SA', 'Busca organizada de informações.'],
  ['GRÁFICO', 'GRÁ-FI-CO', 'Representação visual de dados e comparações.'], ['CRÍTICA', 'CRÍ-TI-CA', 'Análise que apresenta argumentos sobre algo.'],
  ['PÚBLICO', 'PÚ-BLI-CO', 'Grupo de pessoas a quem uma mensagem se dirige.'], ['CORAÇÃO', 'CO-RA-ÇÃO', 'Órgão que impulsiona o sangue pelo corpo.'],
  ['SÍNTESE', 'SÍN-TE-SE', 'Reunião das ideias essenciais de um assunto.'], ['ESCOLHA', 'ES-CO-LHA', 'Decisão entre possibilidades com consequências diferentes.'],
  ['PROFESSORA', 'PRO-FES-SO-RA', 'Ensina na escola.'], ['BORBOLETA', 'BOR-BO-LE-TA', 'Inseto de asas coloridas.'],
  ['COMPUTADOR', 'COM-PU-TA-DOR', 'Máquina para digitar e pesquisar.'], ['TELEFONE', 'TE-LE-FO-NE', 'Serve para ligar para alguém.'],
  ['BIBLIOTECA', 'BI-BLI-O-TE-CA', 'Lugar com muitos livros.'], ['ALFABETO', 'AL-FA-BE-TO', 'Conjunto das letras.'],
  ['MATEMÁTICA', 'MA-TE-MÁ-TI-CA', 'Estuda números e formas.'], ['ESTUDANTE', 'ES-TU-DAN-TE', 'Quem aprende na escola.'],
  ['CIDADANIA', 'CI-DA-DA-NI-A', 'Participação na sociedade com direitos e responsabilidades.'], ['AVENTURA', 'A-VEN-TU-RA', 'Experiência que envolve descobertas e desafios.'],
  ['ARGUMENTO', 'AR-GU-MEN-TO', 'Razão apresentada para sustentar uma ideia.'], ['TECNOLOGIA', 'TEC-NO-LO-GI-A', 'Conhecimentos e técnicas usados para criar soluções.'],
  ['CALCULADORA', 'CAL-CU-LA-DO-RA', 'Faz contas rapidamente.'],
].map(([word, split, hint]) => ({ word, syllables: split.split('-'), hint }));

/**
 * Frases com uma palavra escrita errada, no formato [errada|certa].
 * nivel 1: erro fácil de ver; 2: troca de letras; 3: acento ou grafia menos comum.
 */
export const MISTAKES = [
  [1, 'A [escursão|excursão] da turma foi ótima.'], [1, 'Ele ficou [ancioso|ansioso] pelo resultado.'],
  [1, 'Preciso fazer uma [pesquiza|pesquisa] para a aula.'], [1, 'Meu [interece|interesse] é aprender programação.'],
  [1, 'A [cadera|cadeira] da sala quebrou.'], [1, 'Ela [trouce|trouxe] o livro para a aula.'],
  [1, 'Guardei o caderno na [muchila|mochila].'], [1, 'A [empreza|empresa] contratou novos estagiários.'],
  [1, 'Coloque [assucar|açúcar] no suco.'], [1, 'A [rasão|razão] é simples.'],
  [2, 'Vamos [analizar|analisar] o gráfico juntos.'], [2, 'A [viajem|viagem] até a escola é rápida.'],
  [2, 'O professor vai [mecher|mexer] na planilha.'], [2, 'O [cidadam|cidadão] deve votar com consciência.'],
  [2, 'Vou [asistir|assistir] ao filme com a turma.'], [2, 'A [discução|discussão] terminou em paz.'],
  [2, 'Ele fez um [esforso|esforço] enorme.'], [2, 'Todos [obdeceram|obedeceram] às regras.'],
  [2, 'Ela [exitou|hesitou] antes de responder.'], [2, 'É [nescessário|necessário] revisar o texto.'],
  [3, 'Hoje a [excessão|exceção] foi aceita.'], [3, 'O [previlégio|privilégio] de estudar deve ser valorizado.'],
  [3, 'A campanha [beneficiente|beneficente] arrecadou alimentos.'], [3, 'O [mosquíto|mosquito] transmite doenças.'],
  [3, 'A [professôra|professora] explicou a matéria.'], [3, 'A [matematica|matemática] ajuda a resolver problemas.'],
  [3, 'O [exercicio|exercício] foi fácil.'], [3, 'Isso é [dificíl|difícil] de resolver.'],
  [3, 'Ele escolheu a [alternatíva|alternativa] certa.'], [3, 'O [aniversáro|aniversário] da escola é em abril.'],
].map(([level, text]) => {
  const tokens = text.split(' ').map((token) => {
    const m = token.match(/^(.*)\[(.+?)\|(.+?)\](.*)$/);
    return m ? { text: `${m[1]}${m[2]}${m[4]}`, wrong: true, right: `${m[1]}${m[3]}${m[4]}`.replace(/[.,!?]$/, '') } : { text: token, wrong: false };
  });
  return { level, tokens, right: tokens.find((t) => t.wrong).right };
});

/** Perguntas de português com quatro opções; a resposta certa é sempre o primeiro item aqui. */
const PORTUGUES = [
  [1, 'Qual palavra está escrita corretamente?', ['excursão', 'escursão', 'excurção', 'ecursão'], 'Excursão se escreve com X e com SÃO no fim.'],
  [1, 'Qual é o plural de “pão”?', ['pães', 'pãos', 'pões', 'pãões'], 'O plural de pão é pães.'],
  [1, 'Qual é o antônimo de “generoso”?', ['egoísta', 'bondoso', 'gentil', 'alegre'], 'Generoso reparte com os outros; o contrário é egoísta.'],
  [1, 'Qual palavra é sinônimo de “veloz”?', ['rápido', 'lento', 'pesado', 'calmo'], 'Veloz e rápido têm sentido parecido.'],
  [1, 'Quantas sílabas tem a palavra “janela”?', ['3', '2', '4', '5'], 'Ja-ne-la: três sílabas.'],
  [1, 'Qual é o feminino de “ator”?', ['atriz', 'atora', 'atriza', 'atrice'], 'O feminino de ator é atriz.'],
  [1, 'Qual é o coletivo de “peixes”?', ['cardume', 'manada', 'bando', 'matilha'], 'Um grupo de peixes é um cardume.'],
  [1, 'Quantas letras tem o alfabeto da língua portuguesa?', ['26', '24', '28', '23'], 'O alfabeto tem 26 letras.'],
  [2, 'Complete: “Moro aqui ___ dois anos.”', ['há', 'a', 'à', 'ah'], 'Para tempo passado usamos há.'],
  [2, 'Complete: “___ você mora?”', ['Onde', 'Aonde', 'Donde', 'Ao onde'], 'Para lugar onde se está usamos onde.'],
  [2, 'Complete: “Ele é um ___ exemplo.” (sentido de ruim)', ['mau', 'mal', 'maus', 'males'], 'Mau é o contrário de bom; mal é o contrário de bem.'],
  [2, 'Qual frase está correta?', ['Houve muitos alunos na festa.', 'Houveram muitos alunos na festa.', 'Haviam muitos alunos na festa.', 'Houvemos muitos alunos na festa.'], 'Haver com sentido de existir fica no singular: houve.'],
  [2, 'Qual é o aumentativo de “casa”?', ['casarão', 'casinha', 'casola', 'casica'], 'O aumentativo de casa é casarão.'],
  [2, 'Qual palavra tem “ç” escrito corretamente?', ['açúcar', 'assúcar', 'açucar', 'asúcar'], 'Açúcar leva cedilha e acento.'],
  [2, 'Qual é o coletivo de “lobos”?', ['matilha', 'cardume', 'enxame', 'rebanho'], 'Um grupo de lobos é uma matilha.'],
  [2, 'Complete: “Eles ___ ao cinema ontem.”', ['foram', 'fomos', 'foi', 'fui'], 'Eles combina com foram.'],
  [3, 'Qual palavra é proparoxítona e por isso leva acento?', ['lâmpada', 'cadeira', 'janela', 'mesa'], 'Lâmpada tem a antepenúltima sílaba forte.'],
  [3, 'Na frase “O gato preto dormiu.”, qual palavra é um adjetivo?', ['preto', 'gato', 'dormiu', 'O'], 'Preto dá uma característica ao gato.'],
  [3, 'Na frase “Os alunos estudam muito.”, qual é o verbo?', ['estudam', 'alunos', 'muito', 'Os'], 'Estudam indica a ação.'],
  [3, 'Complete: “Amanhã eu ___ o livro inteiro.”', ['lerei', 'li', 'lia', 'leio ontem'], 'Amanhã pede o futuro: lerei.'],
  [3, 'Qual palavra rima com “coração”?', ['canção', 'camisa', 'jornal', 'chuva'], 'Coração e canção terminam com o mesmo som.'],
  [3, 'Complete: “Cada um ___ seu lugar.”', ['tem', 'têm', 'tém', 'tenham'], 'Cada um pede o singular: tem.'],
].map(([level, question, options, explanation]) => ({ level, question, options, answer: 0, explanation }));

/** Mistura as alternativas e devolve o índice da certa, para que a posição varie. */
function withShuffledOptions(item, rng) {
  const order = item.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { ...item, options: order.map((i) => item.options[i]), answer: order.indexOf(item.answer) };
}

function numericOptions(correct, rng, unit = '') {
  const set = new Set([correct]);
  const spreads = [1, 2, 3, 5, 10, 11, 9, 4, 6];
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const delta = spreads[Math.floor(rng() * spreads.length)] * (rng() < 0.5 ? -1 : 1);
    const value = correct + delta;
    if (value > 0 && value !== correct) set.add(value);
  }
  let pad = 1;
  while (set.size < 4) set.add(correct + 12 + pad++);
  return [...set].map((n) => `${n}${unit}`);
}

/** Questões de matemática geradas por regra: sempre há uma só resposta certa. */
export function mathQuestions(level, rng, count = 40) {
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list) => list[Math.floor(rng() * list.length)];
  const kinds = level === 1 ? ['add', 'sub', 'mul2', 'story'] : level === 2 ? ['mul', 'div', 'mix', 'add3', 'story'] : ['pct', 'frac', 'pow', 'paren', 'area', 'mix'];
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 8) {
    let question, correct, explanation, unit = '';
    switch (pick(kinds)) {
      case 'add': { const a = int(12, 68), b = int(11, 49); correct = a + b; question = `${a} + ${b} = ?`; explanation = `${a} + ${b} = ${correct}.`; break; }
      case 'sub': { const a = int(40, 95), b = int(11, a - 8); correct = a - b; question = `${a} − ${b} = ?`; explanation = `${a} − ${b} = ${correct}.`; break; }
      case 'mul2': { const a = int(2, 5), b = int(2, 10); correct = a * b; question = `${a} × ${b} = ?`; explanation = `${a} × ${b} = ${correct}.`; break; }
      case 'story': { const a = int(14, 48), b = int(12, 35); correct = a + b; question = `Ana tinha ${a} figurinhas e ganhou mais ${b}. Com quantas ficou?`; explanation = `${a} + ${b} = ${correct}.`; break; }
      case 'mul': { const a = int(3, 9), b = int(4, 10); correct = a * b; question = `${a} × ${b} = ?`; explanation = `${a} × ${b} = ${correct}.`; break; }
      case 'div': { const b = int(2, 9), c = int(3, 10); correct = c; question = `${b * c} ÷ ${b} = ?`; explanation = `${b} × ${c} = ${b * c}, então ${b * c} ÷ ${b} = ${c}.`; break; }
      case 'add3': { const a = int(12, 40), b = int(12, 40), c = int(5, 30); correct = a + b + c; question = `${a} + ${b} + ${c} = ?`; explanation = `${a} + ${b} = ${a + b}, e ${a + b} + ${c} = ${correct}.`; break; }
      case 'mix': { const a = int(2, 9), b = int(2, 9), c = int(2, 20); correct = a * b + c; question = `${a} × ${b} + ${c} = ?`; explanation = `Primeiro a multiplicação: ${a} × ${b} = ${a * b}. Depois soma ${c}: ${correct}.`; break; }
      case 'paren': { const a = int(2, 9), b = int(2, 9), c = int(2, 8); correct = (a + b) * c; question = `(${a} + ${b}) × ${c} = ?`; explanation = `Primeiro o parêntese: ${a} + ${b} = ${a + b}. Depois × ${c} = ${correct}.`; break; }
      case 'pct': { const [p, step] = pick([[10, 10], [20, 5], [25, 4], [50, 2]]); const n = step * int(2, 20) * (p === 10 ? 1 : 1); correct = (n * p) / 100; if (!Number.isInteger(correct)) continue; question = `Quanto é ${p}% de ${n}?`; explanation = `${p}% de ${n} = ${n} × ${p} ÷ 100 = ${correct}.`; break; }
      case 'frac': { const [num, den] = pick([[1, 2], [1, 4], [3, 4], [2, 3], [1, 5]]); const n = den * int(2, 12); correct = (n / den) * num; question = `Quanto é ${num}/${den} de ${n}?`; explanation = `${n} ÷ ${den} = ${n / den}, e × ${num} = ${correct}.`; break; }
      case 'pow': { const kind = pick(['sq', 'two', 'root']); if (kind === 'sq') { const a = int(3, 12); correct = a * a; question = `${a} ao quadrado é quanto?`; explanation = `${a} × ${a} = ${correct}.`; } else if (kind === 'two') { const e = int(3, 7); correct = 2 ** e; question = `Quanto é 2 elevado a ${e}?`; explanation = `2 multiplicado ${e} vezes por ele mesmo é ${correct}.`; } else { const a = int(3, 12); correct = a; question = `Qual é a raiz quadrada de ${a * a}?`; explanation = `${a} × ${a} = ${a * a}.`; } break; }
      case 'area': { const a = int(3, 12), b = int(3, 12); if (rng() < 0.5) { correct = a * b; unit = ' cm²'; question = `Um retângulo mede ${a} cm por ${b} cm. Qual é a área?`; explanation = `Área = ${a} × ${b} = ${correct} cm².`; } else { correct = 2 * (a + b); unit = ' cm'; question = `Um retângulo mede ${a} cm por ${b} cm. Qual é o perímetro?`; explanation = `Perímetro = 2 × (${a} + ${b}) = ${correct} cm.`; } break; }
      default: continue;
    }
    if (out.some((q) => q.question === question)) continue;
    out.push(withShuffledOptions({ level, question, options: numericOptions(correct, rng, unit), answer: 0, explanation }, rng));
    // withShuffledOptions embaralhou: o primeiro item de numericOptions é sempre o correto.
  }
  return out;
}

/** Banco do Cabo de Guerra: metade conta, metade português, no nível pedido. */
export function learningBank(level, rng) {
  const lang = PORTUGUES.filter((q) => q.level === level).map((q) => withShuffledOptions(q, rng));
  const math = mathQuestions(level, rng, Math.max(24, lang.length));
  const mixed = [...lang, ...math];
  for (let i = mixed.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [mixed[i], mixed[j]] = [mixed[j], mixed[i]]; }
  return mixed;
}

export { PORTUGUES };
