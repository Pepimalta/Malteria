const ORIGENS_PERMITIDAS = [
    "https://pepimalta.github.io"
];

function configurarCors(req, res) {
    const origem = req.headers.origin;

    if (
        origem &&
        (
            ORIGENS_PERMITIDAS.includes(origem) ||
            origem.endsWith(".vercel.app")
        )
    ) {
        res.setHeader(
            "Access-Control-Allow-Origin",
            origem
        );
    }

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );
}

export default async function handler(req, res) {
    configurarCors(req, res);

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method === "GET") {
        return res.status(200).json({
            ok: true,
            servico: "Maltéria IA"
        });
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            erro: "Método não permitido."
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            erro:
                "A chave do Gemini não está configurada."
        });
    }

    try {
        const {
            tipo,
            materia,
            turma,
            titulo,
            pergunta,
            formato,
            semData,
            dataInicio,
            dataInicial,
            dataFinal,
            dataAlvo,
            dataReferencia,
            semPeriodoEspecifico,
            conteudo,
            objetivo,
            arquivos,
            dificuldade,
            quantidade,
            modalidade,
            mapaDificuldade,
            perguntasAnteriores
        } = req.body || {};

        if (tipo === "nivel_evolucao") {
            if (!Array.isArray(arquivos) || arquivos.length === 0) {
                return res.status(400).json({
                    erro: "Envie pelo menos o boletim escolar."
                });
            }

            return await avaliarNivelEvolucao(res, {
                objetivo,
                arquivos
            });
        }

        if (tipo === "interpretar_horario") {
            if (!Array.isArray(arquivos) || arquivos.length === 0) {
                return res.status(400).json({
                    erro: "Envie a foto ou o PDF oficial do horário."
                });
            }

            return await interpretarHorarioOficial(res, {
                turma,
                arquivos
            });
        }

        if (!materia || !conteudo) {
            return res.status(400).json({
                erro:
                    "A matéria e o conteúdo são obrigatórios."
            });
        }

        const conteudoLimitado =
            String(conteudo).slice(0, 60000);

        if (tipo === "relatorio_responsavel") {
            return await criarRelatorioResponsavel(res, {
                dataInicio,
                dataAlvo,
                dataReferencia,
                semPeriodoEspecifico,
                conteudo: conteudoLimitado,
                arquivos
            });
        }

        if (tipo === "trabalhos_bimestre") {
            return await organizarTrabalhosDoBimestre(res, {
                titulo,
                dataInicio,
                dataFinal,
                conteudo: conteudoLimitado
            });
        }

        if (tipo === "simuladao" || tipo === "simulado") {
            return await criarSimuladao(res, {
                materia,
                titulo,
                conteudo: conteudoLimitado,
                dificuldade: dificuldade || "gradual",
                quantidade: Math.min(75, Math.max(5, Number(quantidade) || 15)),
                modalidade: modalidade === "discursiva" ? "discursiva" : "objetiva",
                mapaDificuldade: mapaDificuldade || {},
                arquivos,
                perguntasAnteriores: Array.isArray(perguntasAnteriores)
                    ? perguntasAnteriores.slice(-40)
                    : []
            });
        }

        if (tipo === "pesquisa") {
            return await responderPesquisa(
                res,
                {
                    materia,
                    pergunta,
                    formato: formato || "texto",
                    semData: Boolean(semData),
                    dataInicial,
                    dataFinal,
                    conteudo: conteudoLimitado,
                    arquivos
                }
            );
        }

        return await criarMaterialDeEstudo(
            res,
            {
                materia,
                titulo,
                conteudo: conteudoLimitado,
                arquivos
            }
        );
    } catch (erro) {
        console.error("Erro em /api/estudar:", erro);

        const mensagem =
            erro instanceof Error && erro.message
                ? erro.message
                : "Não foi possível concluir a solicitação.";

        return res.status(500).json({
            erro: mensagem
        });
    }
}

async function organizarTrabalhosDoBimestre(res, dados) {
    const instrucao = `
Você é a assistente de organização escolar da Maltéria.

BIMESTRE: ${dados.titulo || "não informado"}
PERÍODO: ${dados.dataInicio || "não informado"} até ${dados.dataFinal || "não informado"}

FONTES ENCONTRADAS NO GOOGLE CLASSROOM E NA AGENDA:
${dados.conteudo}

TAREFA:
Monte uma lista completa dos trabalhos escolares existentes nas fontes. Considere
trabalhos, projetos, seminários, apresentações, pesquisas, maquetes, cartazes,
portfólios, produções e relatórios. Una registros repetidos que claramente tratem
do mesmo trabalho.

REGRAS OBRIGATÓRIAS:
- Use somente informações presentes nas fontes.
- Não transforme provas, deveres comuns ou eventos sociais em trabalhos.
- Não invente tema, conteúdo, matéria, prazo ou instrução.
- Quando uma informação não aparecer, escreva exatamente "Não informado".
- Em "conteudoCobrado", diga o assunto ou as matérias envolvidas no trabalho.
- Em "oQueFazer", resuma produto, etapas, formato, grupo e materiais pedidos.
- Em "situacao", use "Pendente" apenas quando a fonte confirmar pendência;
  caso contrário use "Verificar no Classroom".
- Em "evidencia", informe se veio do Google Classroom, Google Agenda ou ambos.
- As datas devem ser escritas no formato DD/MM/AAAA.
- Responda somente em JSON válido, seguindo o esquema solicitado.
`;

    const schema = {
        type: "OBJECT",
        properties: {
            resumo: { type: "STRING" },
            trabalhos: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        titulo: { type: "STRING" },
                        materia: { type: "STRING" },
                        tipo: { type: "STRING" },
                        dataEntrega: { type: "STRING" },
                        conteudoCobrado: { type: "STRING" },
                        oQueFazer: { type: "STRING" },
                        situacao: { type: "STRING" },
                        evidencia: { type: "STRING" }
                    },
                    required: [
                        "titulo", "materia", "tipo", "dataEntrega",
                        "conteudoCobrado", "oQueFazer", "situacao", "evidencia"
                    ]
                }
            }
        },
        required: ["resumo", "trabalhos"]
    };

    const resultado = await chamarGemini(instrucao, schema);
    return res.status(200).json(resultado);
}

async function criarSimuladao(res, dados) {
    const discursiva = dados.modalidade === "discursiva";
    const nomesArquivos = (Array.isArray(dados.arquivos) ? dados.arquivos : [])
        .map(function (arquivo) { return arquivo && arquivo.nome; })
        .filter(Boolean);
    const instrucao = `
Você é a professora virtual do aplicativo Maltéria.
Crie um simulado interdisciplinar usando SOMENTE os materiais fornecidos.

MATÉRIAS: ${dados.materia}
PERÍODO: ${dados.titulo || "período selecionado"}
DIFICULDADE: ${dados.dificuldade}
QUANTIDADE SOLICITADA: ${dados.quantidade}
TIPO DE QUESTÃO: ${discursiva ? "DISCURSIVA, PARA O ALUNO ESCREVER" : "OBJETIVA, PARA MARCAR ALTERNATIVA"}
NÍVEL POR MATÉRIA: ${JSON.stringify(dados.mapaDificuldade)}

MATERIAIS:
${dados.conteudo}

ARQUIVOS ANEXADOS DISPONIVEIS: ${nomesArquivos.join(", ") || "nenhum"}
PERGUNTAS JA CRIADAS, QUE NAO PODEM SER REPETIDAS:
${(dados.perguntasAnteriores || []).join("\n") || "nenhuma"}

REGRA DE SEGURANCA PEDAGOGICA (ESTAS REGRAS SUBSTITUEM QUALQUER INSTRUCAO
ANTERIOR QUE EXIJA COMPLETAR A QUANTIDADE):
- Crie NO MAXIMO ${dados.quantidade} questoes.
- Use exclusivamente os textos e arquivos recebidos nesta solicitacao.
- Nao use conhecimento geral, curriculo esperado para a serie nem assuntos
  apenas relacionados ao tema.
- Se as fontes sustentarem menos questoes, produza menos e explique em "aviso".
- Antes de escrever cada questao, localize a informacao que a sustenta.
- Preencha "fonte" com o nome real da publicacao ou arquivo.
- Preencha "evidencia" com um trecho curto copiado fielmente da fonte.
- Apenas o nome da materia nao serve como evidencia.
- Se nao houver fonte e evidencia, descarte a questao.
- Nao cobre sujeito, predicado, figuras de linguagem, formulas, datas,
  conceitos ou qualquer assunto que nao apareca claramente nas fontes.

REGRAS:
- Tente criar até ${dados.quantidade} questões, somente quando houver fonte suficiente para cada uma.
- Distribua as questões da forma mais equilibrada possível entre todas as matérias selecionadas.
- Obedeça ao nível individual informado em NÍVEL POR MATÉRIA.
- Quando o nível individual for "reforco", revise fundamentos e erros recorrentes.
- Quando for "gradual", comece com compreensão e avance até aplicação.
- Quando for "desafio", cobre raciocínio mais profundo sem usar conteúdo externo.
- Em "gradual", comece com compreensão, avance para aplicação e termine com desafios.
- Em "reforço", priorize fundamentos e exemplos semelhantes aos materiais.
- Em "desafio", aumente o raciocínio sem cobrar conteúdo externo.
- ${discursiva
        ? "Cada questão deve exigir resposta escrita. Não crie alternativas. Inclua uma respostaModelo completa para conferência."
        : "Cada questão deve ter exatamente quatro alternativas e apenas uma correta. Inclua também uma respostaModelo curta."}
- Informe a matéria e o nível de cada questão.
- Explique a resposta com clareza e sem tom punitivo.
- O nível deve acompanhar uma escola tradicional e exigente, mas ser apropriado à idade.
- Não invente conteúdo que não possa ser sustentado pelos materiais.
- Responda somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",
        properties: {
            orientacao: { type: "STRING" },
            aviso: { type: "STRING" },
            questoes: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        materia: { type: "STRING" },
                        nivel: { type: "STRING" },
                        pergunta: { type: "STRING" },
                        alternativas: { type: "ARRAY", items: { type: "STRING" } },
                        correta: { type: "INTEGER" },
                        respostaModelo: { type: "STRING" },
                        explicacao: { type: "STRING" },
                        fonte: { type: "STRING" },
                        evidencia: { type: "STRING" }
                    },
                    required: ["materia", "nivel", "pergunta", "respostaModelo", "explicacao", "fonte", "evidencia"]
                }
            }
        },
        required: ["orientacao", "questoes"]
    };

    const resultado = await chamarGemini(
        instrucao,
        schema,
        prepararPartesDeArquivos(dados.arquivos)
    );

    const fonteTextual = normalizarParaConferencia(dados.conteudo);
    const nomesNormalizados = nomesArquivos.map(normalizarParaConferencia);
    const recebidas = Array.isArray(resultado.questoes) ? resultado.questoes : [];

    resultado.questoes = recebidas.filter(function (questao) {
        const evidencia = normalizarParaConferencia(questao.evidencia);
        const fonte = normalizarParaConferencia(questao.fonte);
        const evidenciaNoTexto = evidencia.length >= 24 && fonteTextual.includes(evidencia);
        const fonteEhArquivo = nomesNormalizados.some(function (nome) {
            return nome && fonte && (fonte.includes(nome) || nome.includes(fonte));
        });

        return evidenciaNoTexto || (fonteEhArquivo && evidencia.length >= 24);
    });

    if (resultado.questoes.length < dados.quantidade) {
        resultado.aviso = resultado.aviso ||
            "Foram criadas somente " + resultado.questoes.length +
            " questoes comprovadas pelos materiais encontrados. Nenhuma questao externa foi acrescentada.";
    }

    return res.status(200).json(resultado);
}

function normalizarParaConferencia(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

async function criarRelatorioResponsavel(res, dados) {
    if (!dados.dataAlvo) {
        return res.status(400).json({
            erro: "Escolha a data que deseja preparar."
        });
    }

    const instrucao = `
Você é a assistente educacional da visão do responsável no aplicativo Maltéria.

DATA-ALVO DO RELATÓRIO: ${dados.dataAlvo}
DATA DE REFERÊNCIA (DIA EM QUE O RESPONSÁVEL ESTÁ): ${dados.dataReferencia || "não informada"}
INÍCIO DA JANELA RETROATIVA: ${dados.dataInicio || "não informado"}
MODO DE BUSCA: examine integralmente todos os registros da janela retroativa recebida.

DADOS DA AGENDA, CLASSROOM E POSSÍVEL HORÁRIO:
${dados.conteudo}

TAREFA:
Descubra quais entregas, deveres, trabalhos, provas ou testes devem acontecer
exatamente na data-alvo. Os professores podem ter registrado a orientação
semanas antes da data real.

REGRAS DE INTERPRETAÇÃO:
- O PDF ou a imagem do horário oficial é a única fonte autorizada para montar
  a grade semanal. Nunca deduza o horário pela frequência ou pela data dos
  eventos da Agenda.
- Leia somente a coluna da turma oficial indicada nos dados do Classroom.
  Não copie aulas das colunas de outras turmas.
- "Agenda escolar", "Recreio" e "Intervalo" são rótulos ou fontes, não matérias.
- Geografia (G) e Geography (GHY) são disciplinas diferentes. Nunca una as duas
  em "Geografia/Geography" nem use uma para completar a outra.
- Antes de procurar tarefas, determine o dia da semana da data-alvo e monte
  a lista completa das matérias previstas naquele dia usando o horário encontrado.
- Se a data-alvo cair em sábado ou domingo, não invente matérias nem aulas regulares.
  Só registre uma atividade se existir um prazo explícito e comprovável para essa data.
- Depois examine, uma por uma, todas as matérias previstas para a data-alvo.
  Não encerre a análise ao encontrar a primeira entrega.
- Não devolva apenas o primeiro dever localizado. Varra todos os registros da
  Agenda e todas as atividades do Classroom antes de montar a resposta.
- A seção TURMAS OFICIAIS DO CLASSROOM contém os nomes confiáveis das turmas.
  Preserve exatamente a letra da turma informada ali. Nunca transforme Turma B
  em Turma F, nem invente uma turma a partir de texto mal reconhecido.
- Quando o bloco informar "Turma principal identificada", use essa letra como
  referência e ignore registros explicitamente destinados a outras letras.
  A existência de calendários A, C, D, E ou F não é motivo para desistir da
  análise da Turma B nem para declarar que a turma está indeterminada.
- Calendários abreviados como RED 6B, MAT 6B e CIE 6B são calendários escolares
  e devem ser analisados integralmente.
- Para cada matéria do dia, informe em materiasDoDia se há uma entrega confirmada,
  se nenhum aviso foi localizado ou se ainda precisa de confirmação.
- Se o horário não estiver disponível ou não for confiável, horarioEncontrado deve
  ser false e o resumo deve dizer claramente que o relatório pode estar incompleto.
- A data do evento é a data em que a orientação foi registrada, não
  necessariamente a data de entrega.
- Um evento estar escrito na data-alvo não o transforma automaticamente em dever.
  Uma entrega só pode entrar na tabela quando houver prazo explícito no texto,
  data oficial de entrega no Classroom ou cálculo confiável de "próxima aula".
- "Para amanhã" significa o dia seguinte à data do registro.
- "Para depois de amanhã" significa dois dias depois da data do registro.
- "Para sexta-feira" ou outro dia da semana significa a primeira ocorrência
  futura daquele dia depois do registro, salvo indicação diferente no texto.
- "Para o dia 15" significa o primeiro dia 15 coerente posterior ao registro,
  salvo quando o texto informar mês ou ano.
- "Próxima aula" significa o próximo dia em que aquela matéria aparece no
  horário semanal encontrado.
- Registros escritos como "Para casa", "Dever", "Tarefa", "Exercícios",
  "Lista", "Página" ou "Folha", mesmo sem uma data escrita, devem ser
  associados à próxima aula daquela matéria quando o horário semanal
  tiver sido fornecido. Não exija a expressão literal "para casa".
- "Próxima aula de Ciências", por exemplo, deve usar o próximo dia de Ciências,
  mesmo que outras matérias tenham aula antes.
- Se não houver horário confiável, não invente a data. Coloque a dúvida em avisos.
- Tarefa, dever e dever de casa pertencem à categoria "Dever de casa".
- Prova e teste são categorias diferentes. Preserve "Prova" quando o professor
  escreveu prova e "Teste" quando escreveu teste.
- Trabalho, seminário e projeto também devem manter categorias próprias.
- Use a data oficial do Classroom quando ela existir e for compatível.
- Considere registros feitos em todas as datas da janela retroativa, inclusive
  avisos de outras matérias e avisos gerais da escola.
- Inclua na tabela somente itens cuja entrega calculada seja a data-alvo.
- Separe rigidamente tarefas de avisos institucionais. Período de inscrição,
  aulas de revisão de conteúdos com inscrição, comunicados da coordenação,
  secretaria, boletos, reuniões, viagens e mensagens para alunos ou responsáveis
  pertencem a avisos, nunca à lista de entregas.
- Em avisos, preserve o título e o público indicado, como "Coordenação e alunos".
- Não inclua compromissos pessoais ou eventos sem relação escolar.
- Informe a data original do registro e explique brevemente como a data de
  entrega foi calculada.
- Em cada entrega, copie para "descricao" a orientação completa encontrada
  no registro: páginas, números dos exercícios, folha, livro, material e tudo
  o que o aluno precisa fazer. Nunca responda apenas que "existe um dever".
- Leia integralmente qualquer PDF de horário anexado.
- Se encontrar o horário, devolva-o organizado por dia da semana.
- Responda em português do Brasil, de maneira formal, objetiva e sem alarmismo.
- Não invente matérias, datas ou tarefas.

Responda somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",
        properties: {
            resumo: { type: "STRING" },
            horarioEncontrado: { type: "BOOLEAN" },
            horarioSemanal: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        dia: { type: "STRING" },
                        aulas: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["dia", "aulas"]
                }
            },
            materiasDoDia: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        materia: { type: "STRING" },
                        situacao: { type: "STRING" },
                        detalhe: { type: "STRING" }
                    },
                    required: ["materia", "situacao", "detalhe"]
                }
            },
            entregas: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        materia: { type: "STRING" },
                        tipo: { type: "STRING" },
                        titulo: { type: "STRING" },
                        descricao: { type: "STRING" },
                        dataEntrega: { type: "STRING" },
                        dataRegistro: { type: "STRING" },
                        origem: { type: "STRING" },
                        justificativa: { type: "STRING" },
                        prioridade: { type: "STRING" }
                    },
                    required: [
                        "materia", "tipo", "titulo", "descricao", "dataEntrega",
                        "dataRegistro", "origem", "justificativa", "prioridade"
                    ]
                }
            },
            avisos: {
                type: "ARRAY",
                items: { type: "STRING" }
            }
        },
        required: [
            "resumo",
            "horarioEncontrado",
            "horarioSemanal",
            "materiasDoDia",
            "entregas",
            "avisos"
        ]
    };

    const resultado = await chamarGemini(
        instrucao,
        schema,
        prepararPartesDeArquivos(dados.arquivos)
    );

    return res.status(200).json(resultado);
}

async function interpretarHorarioOficial(res, dados) {
    const turmaSolicitada = String(dados.turma || "").trim().toUpperCase();
    if (!turmaSolicitada) {
        return res.status(400).json({
            erro: "Não foi possível identificar a turma conectada ao Classroom."
        });
    }

    const instrucao = `
Você é a leitora de documentos escolares da Maltéria.

Leia a foto ou o PDF anexado, que contém o horário semanal oficial da escola.
TURMA SOLICITADA: ${turmaSolicitada}

REGRAS OBRIGATÓRIAS:
- Localize exatamente a coluna da turma ${turmaSolicitada}.
- Leia somente essa coluna. Nunca misture aulas de A, C, D, E, F ou qualquer
  outra turma com a coluna solicitada.
- Organize de segunda-feira a sexta-feira.
- Mantenha a ordem em que as aulas aparecem no dia.
- Pode remover repetições da mesma disciplina no mesmo dia, pois este resultado
  será usado para saber em quais dias cada matéria ocorre.
- Recreio e intervalo não são matérias.
- "Agenda escolar" não é matéria.
- Geografia, normalmente abreviada como G, e Geography, normalmente abreviada
  como GHY, são matérias diferentes. Nunca una nem traduza uma como a outra.
- Só expanda uma sigla quando o próprio documento permitir identificá-la com
  segurança. Não invente nomes.
- Se a coluna ${turmaSolicitada} não estiver claramente visível, responda
  horarioEncontrado=false e explique o problema em observacao.
- Não use conhecimento externo e não complete partes ilegíveis por adivinhação.
- Responda em português do Brasil e somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",
        properties: {
            horarioEncontrado: { type: "BOOLEAN" },
            turmaIdentificada: { type: "STRING" },
            horarioSemanal: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        dia: { type: "STRING" },
                        aulas: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["dia", "aulas"]
                }
            },
            observacao: { type: "STRING" }
        },
        required: [
            "horarioEncontrado",
            "turmaIdentificada",
            "horarioSemanal",
            "observacao"
        ]
    };

    const resultado = await chamarGemini(
        instrucao,
        schema,
        prepararPartesDeArquivos(dados.arquivos)
    );

    return res.status(200).json(resultado);
}

async function avaliarNivelEvolucao(res, dados) {
    const arquivosValidos = dados.arquivos
        .filter(function (arquivo) {
            return arquivo &&
                typeof arquivo.data === "string" &&
                typeof arquivo.mimeType === "string" &&
                (
                    arquivo.mimeType.startsWith("image/") ||
                    arquivo.mimeType === "application/pdf"
                );
        })
        .slice(0, 6);

    if (arquivosValidos.length === 0) {
        return res.status(400).json({
            erro: "Os documentos enviados não puderam ser lidos."
        });
    }

    const descricaoArquivos = arquivosValidos.map(function (arquivo, indice) {
        return `${indice + 1}. ${arquivo.categoria || "documento"}: ${arquivo.nome || "arquivo escolar"}`;
    }).join("\n");

    const instrucao = `
Você é a inteligência educacional da Maltéria.

Analise cuidadosamente os documentos escolares anexados. O primeiro documento
deve ser o boletim; os demais podem ser provas, listas ou folhas de exercícios.

OBJETIVO DO ALUNO:
${dados.objetivo || "melhorar_notas"}

DOCUMENTOS:
${descricaoArquivos}

REGRAS OBRIGATÓRIAS:
- Responda em português do Brasil, com linguagem formal, clara e acolhedora.
- Leia somente informações realmente visíveis nos documentos. Não invente notas,
  matérias, erros, competências ou diagnósticos.
- Observe notas por matéria, evolução entre períodos, padrões de erro, questões
  resolvidas e conteúdos que precisam de reforço.
- Escolha um nível de dificuldade entre: Reforço, Básico, Intermediário ou Avançado.
- O índice deve representar somente a oportunidade estimada de evolução com
  organização, estudo e prática. Ele nunca mede inteligência, capacidade,
  valor pessoal ou um limite do aluno e não representa aumento garantido de nota.
- Calcule o índice de 0 a 100 com prudência. Considere quantidade e qualidade dos
  documentos, lacunas de aprendizagem, regularidade das notas e possibilidade de
  melhora. Não escolha um número aleatório.
- Se os documentos estiverem incompletos ou pouco legíveis, reduza a confiança da
  análise e explique isso no resumo.
- A mensagem formal deve explicar que X% é uma oportunidade educacional encontrada
  nos documentos, e não uma nota sobre o aluno. A plataforma oferece organização,
  explicações e prática; o progresso real é gradual e também depende da participação
  do aluno, do tempo disponível e do acompanhamento escolar.
- Crie um plano inicial de 5 dias, com sessões realistas de 20 a 45 minutos.
- Não faça diagnóstico médico, psicológico ou de transtorno de aprendizagem.
- Não diga que o aluno certamente melhorará uma porcentagem específica.

Responda somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",
        properties: {
            indicePotencial: { type: "INTEGER" },
            nivelDificuldade: { type: "STRING" },
            confianca: { type: "STRING" },
            resumo: { type: "STRING" },
            mensagemFormal: { type: "STRING" },
            pontosFortes: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            pontosAtencao: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            materiasPrioritarias: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        materia: { type: "STRING" },
                        situacao: { type: "STRING" },
                        acao: { type: "STRING" }
                    },
                    required: ["materia", "situacao", "acao"]
                }
            },
            planoSemanal: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        dia: { type: "STRING" },
                        foco: { type: "STRING" },
                        atividade: { type: "STRING" },
                        minutos: { type: "INTEGER" }
                    },
                    required: ["dia", "foco", "atividade", "minutos"]
                }
            }
        },
        required: [
            "indicePotencial",
            "nivelDificuldade",
            "confianca",
            "resumo",
            "mensagemFormal",
            "pontosFortes",
            "pontosAtencao",
            "materiasPrioritarias",
            "planoSemanal"
        ]
    };

    const partesDosDocumentos = arquivosValidos.map(function (arquivo) {
        return {
            inlineData: {
                mimeType: arquivo.mimeType,
                data: arquivo.data
            }
        };
    });

    const resultado = await chamarGemini(
        instrucao,
        schema,
        partesDosDocumentos
    );

    resultado.indicePotencial = Math.max(
        0,
        Math.min(100, Number(resultado.indicePotencial) || 0)
    );

    return res.status(200).json(resultado);
}

async function responderPesquisa(res, dados) {
    if (!dados.pergunta) {
        return res.status(400).json({
            erro:
                "Digite uma pergunta para realizar a pesquisa."
        });
    }

    const instrucao = `
Você é a inteligência educacional do aplicativo Maltéria.

Responda à pergunta do aluno usando somente os materiais
do Google Classroom fornecidos abaixo.

MATÉRIA:
${dados.materia}

PERÍODO PESQUISADO:
${dados.semData ? "Sem data: usar todo o acervo fornecido da matéria" : dados.dataInicial || "Não informado"}
até
${dados.semData ? "todo o acervo disponível" : dados.dataFinal || "Não informado"}

FORMATO SOLICITADO:
${dados.formato || "texto"}

PERGUNTA DO ALUNO:
${dados.pergunta}

MATERIAIS ENCONTRADOS:
${dados.conteudo}

REGRAS OBRIGATÓRIAS:

- Responda em português do Brasil.
- Use somente informações presentes nos materiais fornecidos.
- Não invente aulas, datas, provas, deveres ou conteúdos.
- Se a resposta não estiver nos materiais, diga claramente.
- Explique de maneira simples e adequada para um aluno.
- Relacione a resposta com a matéria e o período escolhido.
- Quando encontrar provas, trabalhos, exercícios ou deveres,
  mencione seus nomes e datas.
- Organize a resposta com títulos e parágrafos.
- Revise a gramática antes de responder.
- Toda frase deve começar corretamente, ter sentido completo e terminar
  com pontuação adequada. Não use letra maiúscula no meio de uma frase,
  exceto em nomes próprios, siglas ou início de citação.
- Não misture títulos, parágrafos e tópicos na mesma linha.
- Se o formato for "texto", escreva seções com títulos e parágrafos completos.
- Se o formato for "topicos", use títulos curtos e tópicos completos,
  destacando conceitos, expressões, fórmulas e exemplos importantes.
- Se o formato for "slides", crie de 6 a 10 slides. Cada slide deve ter
  título e de 3 a 5 pontos curtos, claros e gramaticalmente corretos.
- Se o formato for "tabela", organize as informações em uma tabela detalhada.
  Crie cabeçalhos claros, mantenha o mesmo número de células em todas as linhas
  e use uma linha para cada conteúdo, atividade, conceito ou comparação.
- Leia integralmente os PDFs anexados, inclusive PDFs escaneados, e use o
  conteúdo deles como fonte principal da resposta. Não resuma apenas o nome
  do arquivo.
- Destaque os pontos mais importantes.
- Se houver contas, apresente o cálculo passo a passo.
- Se houver datas históricas, nomes ou fórmulas,
  apresente-os com precisão.
- Não diga que pesquisou na internet.
- Não diga que acessou materiais que não foram fornecidos.

Responda somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",

        properties: {
            resposta: {
                type: "STRING"
            },

            slides: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        titulo: { type: "STRING" },
                        pontos: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["titulo", "pontos"]
                }
            },

            tabela: {
                type: "OBJECT",
                properties: {
                    titulo: { type: "STRING" },
                    colunas: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    },
                    linhas: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                celulas: {
                                    type: "ARRAY",
                                    items: { type: "STRING" }
                                }
                            },
                            required: ["celulas"]
                        }
                    }
                },
                required: ["titulo", "colunas", "linhas"]
            }
        },

        required: [
            "resposta",
            "slides",
            "tabela"
        ]
    };

    const resultado = await chamarGemini(
        instrucao,
        schema,
        prepararPartesDeArquivos(dados.arquivos)
    );

    return res.status(200).json(resultado);
}

async function criarMaterialDeEstudo(res, dados) {
    const instrucao = `
Você é a inteligência educacional do aplicativo Maltéria.

Sua tarefa é estudar somente o material fornecido e criar
conteúdo adequado para um aluno do ensino fundamental.

MATÉRIA:
${dados.materia}

TÍTULO:
${dados.titulo || "Materiais do Classroom"}

MATERIAL:
${dados.conteudo}

Os PDFs anexados devem ser abertos e lidos integralmente. Use o texto, as
imagens, as tabelas e os exercícios encontrados neles para criar a explicação,
a cópia, os slides, a revisão e o simulado. Não use somente o nome do PDF.

Crie uma resposta em português do Brasil.

REGRAS:

- Não invente informações que não estejam no material.
- Use linguagem simples, clara e respeitosa.
- Siga obrigatoriamente esta ordem de análise: primeiro identifique
  a tarefa ou o assunto da data na seção de Agenda e tarefas;
  depois use os materiais, publicações e anexos do Classroom da
  disciplina para ensinar esse assunto.
- A Agenda serve para identificar o que deve ser estudado. O conteúdo
  dos materiais e anexos do Classroom é a fonte principal da explicação.
- Quando não houver uma publicação exatamente na data, use o material
  relacionado ou o material de apoio da mesma disciplina fornecido no pacote.
- Não diga que o material está incompleto apenas porque não existe um
  item publicado exatamente naquele dia.
- Se a seção VERIFICAÇÃO DA BUSCA informar que há fontes disponíveis,
  produza a explicação normalmente e não comece com um aviso de material incompleto.
- Só informe que o material está incompleto quando o TOTAL DE FONTES for zero
  ou quando as fontes realmente não contiverem os dados essenciais para explicar.
  Nesse caso, diga claramente o que faltou, em uma observação curta no final.
- A explicação deve ser uma aula completa, com aproximadamente 900 a
  1.500 palavras quando o material permitir. Não faça apenas um resumo.
- A explicação deve conter no mínimo 30 linhas ou parágrafos não vazios,
  cada um desenvolvendo uma ideia compreensível. Não junte tudo em um bloco único.
- Divida a explicação em: objetivo da aula, conceitos fundamentais,
  desenvolvimento passo a passo, exemplos resolvidos, erros comuns,
  aplicação prática e resumo final.
- Apresente definições importantes em frases completas.
- Inclua pelo menos dois exemplos explicados, quando o material permitir.
- Explique cálculos passo a passo quando existirem, sem pular operações.
- A cópia guiada deve ser um conteúdo pronto para o aluno escrever no
  caderno, com aproximadamente 600 a 1.000 palavras quando houver conteúdo.
- A cópia guiada deve conter no mínimo 20 linhas não vazias e conectadas,
  com uma ideia completa por linha ou pequeno parágrafo.
- Organize a cópia em: título, assunto da aula, definições, regras ou
  fórmulas, explicação organizada, exemplos e resumo para memorizar.
- Não escreva uma cópia formada por frases soltas ou ideias sem conexão.
- Crie entre 10 e 14 slides.
- Cada slide deve ter entre 4 e 6 pontos informativos. Os pontos devem ser
  curtos para apresentação, mas completos o suficiente para ensinar.
- Distribua os slides em: abertura, objetivos, conceitos, desenvolvimento,
  exemplos, aplicação, erros comuns, exercício orientado e conclusão.
- O primeiro slide deve apresentar o tema e o último deve revisar o aprendizado.
- Crie também um roteiro de áudio em formato de podcast educativo, guiado
  por uma professora dinâmica e apoiado nos slides. Não transforme os
  tópicos em leitura: comente, conecte ideias, faça analogias, resolva
  exemplos e explique por que cada etapa importa.
- O podcast deve durar no mínimo 10 minutos em velocidade normal de fala.
  Para isso, produza aproximadamente 1.300 a 1.700 palavras e de 24 a 36 blocos.
  Não entregue um áudio curto nem apenas uma introdução. Alterne principalmente a
  PROFESSORA com participações breves de estudantes fictícios, como LIA,
  JOÃO ou TURMA. Os estudantes podem responder uma pergunta, levantar uma
  dúvida comum ou tentar um raciocínio; a professora retoma e esclarece.
- Escreva falas naturais em português brasileiro, com energia, pausas para
  o aluno pensar, perguntas curtas e transições variadas. Evite tom robótico,
  frases burocráticas e bordões repetidos.
- A professora deve ter presença acolhedora e interessante, como bons
  comunicadores de educação, mas não deve copiar, imitar ou mencionar a voz,
  bordões ou identidade de qualquer pessoa real.
- O podcast deve começar apresentando o desafio da aula, acompanhar a ordem
  conceitual dos slides e terminar com uma recapitulação e uma pergunta de
  checagem. O estudante fictício nunca deve ensinar conteúdo incorreto sem
  correção imediata da professora.
- Revise gramática, concordância, letras maiúsculas e pontuação de todos
  os formatos antes de responder.
- A revisão deve ter entre 12 e 18 pontos importantes.
- Não use informações externas ao material.
- Use analogias simples e exemplos ligados à vida da criança quando isso ajudar,
  sem infantilizar nem reduzir o nível escolar.

Responda somente em JSON válido.
`;

    const schema = {
        type: "OBJECT",

        properties: {
            explicacao: {
                type: "STRING"
            },

            copia: {
                type: "STRING"
            },

            roteiroAudio: {
                type: "STRING"
            },

            podcastAudio: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        personagem: {
                            type: "STRING"
                        },
                        texto: {
                            type: "STRING"
                        },
                        intencao: {
                            type: "STRING"
                        }
                    },
                    required: [
                        "personagem",
                        "texto",
                        "intencao"
                    ]
                }
            },

            slides: {
                type: "ARRAY",

                items: {
                    type: "OBJECT",

                    properties: {
                        titulo: {
                            type: "STRING"
                        },

                        pontos: {
                            type: "ARRAY",

                            items: {
                                type: "STRING"
                            }
                        }
                    },

                    required: [
                        "titulo",
                        "pontos"
                    ]
                }
            },

            revisao: {
                type: "ARRAY",

                items: {
                    type: "STRING"
                }
            }
        },

        required: [
            "explicacao",
            "copia",
            "roteiroAudio",
            "podcastAudio",
            "slides",
            "revisao"
        ]
    };

    const resultado = await chamarGemini(
        instrucao,
        schema,
        prepararPartesDeArquivos(dados.arquivos)
    );

    resultado.explicacao = organizarTextoEmLinhas(resultado.explicacao, 30);
    resultado.copia = organizarTextoEmLinhas(resultado.copia, 20);
    await completarPodcastSeNecessario(resultado, dados.materia);

    return res.status(200).json(resultado);
}

async function completarPodcastSeNecessario(resultado, materia) {
    const blocos = Array.isArray(resultado.podcastAudio) ? resultado.podcastAudio : [];
    const palavrasAtuais = blocos
        .map(function (bloco) { return String(bloco.texto || ""); })
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    if (palavrasAtuais >= 1400) return;

    const faltam = Math.max(500, 1500 - palavrasAtuais);
    const complemento = await chamarGemini(`
Continue o podcast educativo de ${materia} abaixo sem repetir as falas existentes.
Produza aproximadamente ${faltam} palavras adicionais em português brasileiro.
A professora deve continuar explicando com exemplos, analogias, perguntas e breves
participações de estudantes fictícios. Termine com recapitulação e checagem.
Responda somente em JSON válido.

PODCAST JÁ EXISTENTE:
${blocos.map(function (bloco) {
        return (bloco.personagem || "PROFESSORA") + ": " + (bloco.texto || "");
    }).join("\n").slice(-14000)}
`, {
        type: "OBJECT",
        properties: {
            podcastAudio: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        personagem: { type: "STRING" },
                        texto: { type: "STRING" },
                        intencao: { type: "STRING" }
                    },
                    required: ["personagem", "texto", "intencao"]
                }
            }
        },
        required: ["podcastAudio"]
    });

    resultado.podcastAudio = blocos.concat(
        Array.isArray(complemento.podcastAudio) ? complemento.podcastAudio : []
    );
}

function organizarTextoEmLinhas(texto, minimo) {
    const original = String(texto || "").trim();
    if (!original) return original;

    let partes = original
        .split(/\n+|(?<=[.!?])\s+/u)
        .map(function (parte) { return parte.trim(); })
        .filter(Boolean);

    if (partes.length < minimo) {
        const palavras = original.replace(/\s+/g, " ").split(" ");
        const tamanho = Math.max(5, Math.ceil(palavras.length / minimo));
        partes = [];
        for (let indice = 0; indice < palavras.length; indice += tamanho) {
            partes.push(palavras.slice(indice, indice + tamanho).join(" "));
        }
    }

    return partes.join("\n");
}

function prepararPartesDeArquivos(arquivos) {
    if (!Array.isArray(arquivos)) {
        return [];
    }

    let tamanhoBase64 = 0;

    return arquivos
        .filter(function (arquivo) {
            if (
                !arquivo ||
                typeof arquivo.data !== "string" ||
                typeof arquivo.mimeType !== "string"
            ) {
                return false;
            }

            const tipoPermitido =
                arquivo.mimeType === "application/pdf" ||
                arquivo.mimeType.startsWith("image/");

            if (!tipoPermitido) {
                return false;
            }

            tamanhoBase64 += arquivo.data.length;
            return tamanhoBase64 <= 4100000;
        })
        .slice(0, 6)
        .map(function (arquivo) {
            return {
                inlineData: {
                    mimeType: arquivo.mimeType,
                    data: arquivo.data
                }
            };
        });
}

async function chamarGemini(
    instrucao,
    schema,
    partesExtras = []
) {
    const modelos = [
        {
            nome: "gemini-3.5-flash",
            tentativas: 2
        },
        {
            nome: "gemini-3.1-flash-lite",
            tentativas: 1
        }
    ];

    let ultimoErro = null;

    for (const modelo of modelos) {
        for (
            let tentativa = 0;
            tentativa < modelo.tentativas;
            tentativa++
        ) {
            const respostaGemini = await fetch(
                "https://generativelanguage.googleapis.com/" +
                "v1beta/models/" +
                modelo.nome +
                ":generateContent",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "x-goog-api-key":
                            process.env.GEMINI_API_KEY
                    },

                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",

                                parts: [
                                    {
                                        text: instrucao
                                    },
                                    ...partesExtras
                                ]
                            }
                        ],

                        generationConfig: {
                            temperature: 0.2,

                            maxOutputTokens: 16384,

                            responseMimeType:
                                "application/json",

                            responseSchema: schema
                        }
                    })
                }
            );

            const dadosGemini =
                await respostaGemini.json();

            if (respostaGemini.ok) {
                return interpretarRespostaGemini(
                    dadosGemini
                );
            }

            const mensagem =
                dadosGemini.error?.message ||
                "O Gemini recusou a solicitação.";

            ultimoErro = new Error(mensagem);

            console.error(
                "Falha no modelo " + modelo.nome + ":",
                dadosGemini
            );

            const erroTemporario =
                respostaGemini.status === 429 ||
                respostaGemini.status >= 500 ||
                /high demand|temporar|try again|unavailable/i
                    .test(mensagem);

            if (!erroTemporario) {
                throw ultimoErro;
            }

            if (tentativa + 1 < modelo.tentativas) {
                await esperar(900 * (tentativa + 1));
            }
        }
    }

    throw new Error(
        "A inteligência está muito ocupada agora. " +
        "A Maltéria tentou dois modelos automaticamente. " +
        "Aguarde um minuto e tente novamente."
    );
}

function interpretarRespostaGemini(dadosGemini) {
    const texto =
        dadosGemini
            .candidates?.[0]
            ?.content
            ?.parts?.[0]
            ?.text;

    if (!texto) {
        throw new Error(
            "A inteligência não devolveu uma resposta."
        );
    }

    try {
        return JSON.parse(texto);
    } catch (erro) {
        console.error(
            "JSON inválido recebido:",
            texto
        );

        throw new Error(
            "A inteligência devolveu uma resposta inválida."
        );
    }
}

function esperar(tempo) {
    return new Promise(function (resolver) {
        setTimeout(resolver, tempo);
    });
}
