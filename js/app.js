const CLIENT_ID_CLASSROOM =
    "201759939378-lt1oj42277jqjr8bppkjbrqi08tml64t.apps.googleusercontent.com";

const ESCOPOS_CLASSROOM = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly"
].join(" ");

// No site publicado, usa sempre o mesmo domínio que está aberto.
// Assim, renomear o projeto na Vercel não quebra a API da Maltéria.
const ENDERECO_IA = window.location.protocol === "file:"
    ? "https://malteria.vercel.app/api/estudar"
    : "/api/estudar";

const EMAIL_DONO_MALTERIA =
    "pepimalti@gmail.com";

let estudoGerado = null;
let periodoEstudoAtual = null;
let uploadsDaSessao = [];
let arquivosPdfParaIA = [];
const metasBimestraisDaSessao = new Map();

function adicionarEnfeitesVisiveisNasPaginas() {
    const configuracoes = {
        "#pagina-principal": ["📚", "✏️", "🧠", "✨", "🎓", "📐", "🔬", "🌎", "💡", "🎒"],
        "#pagina-agenda": ["📅", "⏰", "📌", "✅", "🗓️", "✏️", "🎒", "🔔", "📚", "🌟"],
        "#pagina-lembretes": ["🔔", "⏰", "📌", "✅", "🗓️", "⏳", "✨", "📝", "🎯", "🌟"],
        "#pagina-materias": ["📚", "📐", "🧪", "🌎", "✍️", "🔬", "🎓", "📖", "🧠", "✨"],
        "#pagina-redacoes": ["✍️", "📖", "📝", "💭", "✨", "📚", "🪶", "💡", "🎭", "⭐"],
        "#pagina-trabalhos": ["🗂️", "📋", "🎨", "🔬", "📊", "🎤", "📚", "✂️", "📅", "✨"],
        "#pagina-materia": ["📖", "📝", "💡", "🔎", "⭐", "🎒", "📏", "🧪", "🖍️", "🏆"],
        "#pagina-pesquisa": ["🔎", "📚", "💭", "✨", "🧠", "📝", "🗂️", "📌", "💡", "📖"],
        "#pagina-ajuda": ["💡", "🧭", "❓", "📘", "🗺️", "✨", "🛟", "🔎", "📌", "🤝"],
        "#pagina-nivel-melhora": ["🎯", "📈", "🌱", "🏆", "⭐", "📊", "🚀", "💪", "🧠", "✨"],
        "#pagina-pratica": ["✏️", "🧠", "📝", "🏆", "📚", "🎲", "⏱️", "🎯", "💡", "📐"],
        "#pagina-administracao": ["⚙️", "👑", "📊", "🔐", "📚", "✨", "🗂️", "👥", "🛡️", "📈"]
    };

    Object.entries(configuracoes).forEach(function ([seletor, emojis]) {
        const pagina = document.querySelector(seletor);
        if (!pagina || pagina.querySelector(".enfeites-visiveis-pagina")) return;

        const camada = document.createElement("div");
        camada.className = "enfeites-visiveis-pagina";
        camada.setAttribute("aria-hidden", "true");
        camada.style.cssText = "position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none";
        const posicoes = [
            "top:22%;left:-78px", "top:22%;right:-78px",
            "top:38%;left:-68px", "top:38%;right:-68px",
            "top:54%;left:-82px", "top:54%;right:-82px",
            "top:70%;left:-68px", "top:70%;right:-68px",
            "top:86%;left:-78px", "top:86%;right:-78px"
        ];
        const iconeDoCabecalho = pagina
            .querySelector(".cabecalho-ferramenta > span")
            ?.textContent.trim();
        const emojisSemRepeticao = emojis.filter(function (emoji, indice) {
            return emoji !== iconeDoCabecalho && emojis.indexOf(emoji) === indice;
        });

        camada.innerHTML = emojisSemRepeticao.map(function (emoji, indice) {
            return `<span style="--ordem-enfeite:${indice};position:absolute;${posicoes[indice]};">${emoji}</span>`;
        }).join("");

        const arte = document.createElement("img");
        arte.className = "arte-lateral-pagina";
        arte.src = "data:image/webp;base64,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";
        arte.alt = "";
        arte.setAttribute("aria-hidden", "true");
        pagina.prepend(arte);
        pagina.prepend(camada);
    });
}

/* LEMBRETES -------------------------------------------------------------- */

function chaveLocalDosLembretes() {
    const email = String(usuarioAtual?.email || "visitante")
        .trim()
        .toLowerCase();
    return "malteriaLembretes:" + email;
}

function lerLembretes() {
    try {
        const dados = JSON.parse(localStorage.getItem(chaveLocalDosLembretes()) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function salvarLembretes(lembretes) {
    localStorage.setItem(chaveLocalDosLembretes(), JSON.stringify(lembretes));
}

function prepararFormularioLembrete() {
    const campoData = document.querySelector("#lembrete-data");
    const campoHora = document.querySelector("#lembrete-hora");
    if (!campoData || !campoHora) return;
    const agora = new Date();
    if (!campoData.value) campoData.value = dataParaCampo(agora);
    if (!campoHora.value) {
        agora.setMinutes(agora.getMinutes() + 5);
        campoHora.value = String(agora.getHours()).padStart(2, "0") + ":" +
            String(agora.getMinutes()).padStart(2, "0");
    }
}

function dataHoraDoLembrete(lembrete) {
    return new Date(lembrete.data + "T" + lembrete.hora + ":00");
}

function formatarDataHoraLembrete(lembrete) {
    const data = dataHoraDoLembrete(lembrete);
    if (Number.isNaN(data.getTime())) return lembrete.data + " " + lembrete.hora;
    return data.toLocaleString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function desenharLembretes() {
    const area = document.querySelector("#lista-lembretes");
    if (!area) return;
    const lembretes = lerLembretes().sort(function (a, b) {
        return dataHoraDoLembrete(a) - dataHoraDoLembrete(b);
    });
    if (!lembretes.length) {
        area.innerHTML = '<div class="lembretes-vazios">🔕 Nenhum lembrete criado ainda.</div>';
        return;
    }
    area.innerHTML = lembretes.map(function (item) {
        const concluido = item.concluido === true;
        return `
            <article class="cartao-lembrete ${concluido ? "concluido" : ""}">
                <div class="icone-cartao-lembrete">${concluido ? "✅" : "⏰"}</div>
                <div class="conteudo-cartao-lembrete">
                    <strong>${protegerTexto(item.texto)}</strong>
                    <span>${protegerTexto(formatarDataHoraLembrete(item))}</span>
                    <small>${Number(item.repeticao) > 0 ? "Repete a cada " + Number(item.repeticao) + " min até concluir" : "Avisa uma vez"}</small>
                </div>
                <div class="acoes-cartao-lembrete">
                    ${concluido ? "" : '<button type="button" data-concluir-lembrete="' + item.id + '">Concluir</button>'}
                    <button type="button" data-excluir-lembrete="${item.id}">Excluir</button>
                </div>
            </article>`;
    }).join("");

    area.querySelectorAll("[data-concluir-lembrete]").forEach(function (botao) {
        botao.addEventListener("click", function () {
            concluirLembrete(botao.dataset.concluirLembrete);
        });
    });
    area.querySelectorAll("[data-excluir-lembrete]").forEach(function (botao) {
        botao.addEventListener("click", function () {
            salvarLembretes(lerLembretes().filter(function (item) {
                return item.id !== botao.dataset.excluirLembrete;
            }));
            desenharLembretes();
        });
    });
}

function concluirLembrete(id) {
    const lembretes = lerLembretes();
    const lembrete = lembretes.find(function (item) { return item.id === id; });
    if (!lembrete) return;
    lembrete.concluido = true;
    lembrete.concluidoEm = new Date().toISOString();
    salvarLembretes(lembretes);
    document.querySelector("#aviso-lembrete-ativo")?.remove();
    desenharLembretes();
}

async function pedirPermissaoDeNotificacao() {
    const status = document.querySelector("#status-lembretes");
    if (!("Notification" in window)) {
        if (status) status.textContent = "Este navegador não oferece notificações. O som dentro da Maltéria continuará funcionando.";
        return false;
    }
    if (Notification.permission === "granted") return true;
    const permissao = await Notification.requestPermission();
    if (status) status.textContent = permissao === "granted"
        ? "Notificações permitidas."
        : "Notificações não foram permitidas; o aviso dentro da página continuará funcionando.";
    return permissao === "granted";
}

function criarNovoLembrete() {
    const texto = document.querySelector("#lembrete-texto").value.trim();
    const data = document.querySelector("#lembrete-data").value;
    const hora = document.querySelector("#lembrete-hora").value;
    const repeticao = Number(document.querySelector("#lembrete-repeticao").value) || 0;
    const voz = document.querySelector("#lembrete-voz").checked;
    const status = document.querySelector("#status-lembretes");
    if (!texto || !data || !hora) {
        status.textContent = "Preencha o lembrete, a data e a hora.";
        return;
    }
    const momento = new Date(data + "T" + hora + ":00");
    if (Number.isNaN(momento.getTime())) {
        status.textContent = "A data ou a hora não é válida.";
        return;
    }
    const lembretes = lerLembretes();
    lembretes.push({
        id: "lembrete-" + Date.now(),
        texto,
        data,
        hora,
        repeticao,
        voz,
        concluido: false,
        criadoEm: new Date().toISOString(),
        ultimoAvisoEm: null,
        adiadoAte: null
    });
    salvarLembretes(lembretes);
    document.querySelector("#lembrete-texto").value = "";
    status.textContent = "Lembrete criado para " + formatarDataHoraLembrete({ data, hora }) + ".";
    pedirPermissaoDeNotificacao();
    desenharLembretes();
}

function tocarSomLembrete() {
    try {
        const AudioContexto = window.AudioContext || window.webkitAudioContext;
        const contexto = new AudioContexto();
        [0, 0.22, 0.44].forEach(function (atraso, indice) {
            const oscilador = contexto.createOscillator();
            const ganho = contexto.createGain();
            oscilador.frequency.value = [660, 880, 740][indice];
            ganho.gain.setValueAtTime(0.001, contexto.currentTime + atraso);
            ganho.gain.exponentialRampToValueAtTime(0.24, contexto.currentTime + atraso + 0.02);
            ganho.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + atraso + 0.18);
            oscilador.connect(ganho).connect(contexto.destination);
            oscilador.start(contexto.currentTime + atraso);
            oscilador.stop(contexto.currentTime + atraso + 0.2);
        });
    } catch (erro) {
        console.warn("O som do lembrete não pôde tocar.", erro);
    }
}

function falarLembrete(texto) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance("Lembrete da Maltéria: " + texto);
    fala.lang = "pt-BR";
    fala.rate = 1.02;
    window.speechSynthesis.speak(fala);
}

function adiarLembrete(id, minutos) {
    const lembretes = lerLembretes();
    const lembrete = lembretes.find(function (item) { return item.id === id; });
    if (!lembrete) return;
    lembrete.adiadoAte = new Date(Date.now() + minutos * 60000).toISOString();
    lembrete.ultimoAvisoEm = new Date().toISOString();
    salvarLembretes(lembretes);
    document.querySelector("#aviso-lembrete-ativo")?.remove();
    desenharLembretes();
}

function exibirAvisoLembrete(lembrete) {
    tocarSomLembrete();
    if (lembrete.voz) falarLembrete(lembrete.texto);
    if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification("🔔 Lembrete da Maltéria", { body: lembrete.texto, tag: lembrete.id, renotify: true }); } catch (erro) {}
    }
    document.querySelector("#aviso-lembrete-ativo")?.remove();
    const aviso = document.createElement("div");
    aviso.id = "aviso-lembrete-ativo";
    aviso.className = "fundo-aviso-lembrete";
    aviso.innerHTML = `
        <section class="aviso-lembrete-ativo" role="alertdialog" aria-modal="true">
            <div class="sino-animado">🔔</div>
            <small>LEMBRETE DA MALTÉRIA</small>
            <h2>${protegerTexto(lembrete.texto)}</h2>
            <p>Você marcou este lembrete para ${protegerTexto(formatarDataHoraLembrete(lembrete))}.</p>
            <button class="botao-principal" type="button" data-aviso-concluir>✅ Já fiz</button>
            <button class="botao-secundario" type="button" data-aviso-adiar>⏰ Lembrar novamente em 5 minutos</button>
        </section>`;
    document.body.appendChild(aviso);
    aviso.querySelector("[data-aviso-concluir]").addEventListener("click", function () { concluirLembrete(lembrete.id); });
    aviso.querySelector("[data-aviso-adiar]").addEventListener("click", function () { adiarLembrete(lembrete.id, 5); });
}

function verificarLembretes() {
    const agora = Date.now();
    const lembretes = lerLembretes();
    let alterou = false;
    const devido = lembretes.find(function (item) {
        if (item.concluido) return false;
        const momento = item.adiadoAte
            ? new Date(item.adiadoAte).getTime()
            : dataHoraDoLembrete(item).getTime();
        if (!Number.isFinite(momento) || momento > agora) return false;
        if (!item.ultimoAvisoEm) return true;
        if (Number(item.repeticao) <= 0 && !item.adiadoAte) return false;
        const intervalo = Math.max(1, Number(item.repeticao) || 5) * 60000;
        return agora - new Date(item.ultimoAvisoEm).getTime() >= intervalo;
    });
    if (!devido || document.querySelector("#aviso-lembrete-ativo")) return;
    devido.ultimoAvisoEm = new Date().toISOString();
    devido.adiadoAte = null;
    alterou = true;
    if (alterou) salvarLembretes(lembretes);
    exibirAvisoLembrete(devido);
}

adicionarEnfeitesVisiveisNasPaginas();
const animacaoMalteria =
    document.querySelector("#animacao-malteria");
const telaBoasVindas = document.querySelector("#boas-vindas");
const transicaoProximo =
    document.querySelector("#transicao-proximo");
const telaEscolha = document.querySelector("#escolha");
const telaLogin = document.querySelector("#login");
const telaCadastro = document.querySelector("#cadastro");
const telaVinculoFamilia = document.querySelector("#vinculo-familia");
const aplicativo = document.querySelector("#aplicativo");

const paginaPrincipal =
    document.querySelector("#pagina-principal");

const paginaAgenda =
    document.querySelector("#pagina-agenda");

const paginaLembretes =
    document.querySelector("#pagina-lembretes");

const paginaMaterias =
    document.querySelector("#pagina-materias");

const paginaRedacoes =
    document.querySelector("#pagina-redacoes");

const paginaTrabalhos =
    document.querySelector("#pagina-trabalhos");

const paginaMateria =
    document.querySelector("#pagina-materia");

const paginaPesquisa =
    document.querySelector("#pagina-pesquisa");

const paginaAjuda =
    document.querySelector("#pagina-ajuda");

const paginaNivelMelhora =
    document.querySelector("#pagina-nivel-melhora");

const paginaPratica =
    document.querySelector("#pagina-pratica");

const paginaCorrecao =
    document.querySelector("#pagina-correcao");

const paginaGabaritos =
    document.querySelector("#pagina-gabaritos");

const paginaAdministracao =
    document.querySelector("#pagina-administracao");

const centralPraticaConteudo =
    document.querySelector("#central-pratica-conteudo");

const criadorSimuladao =
    document.querySelector("#criador-simuladao");

if (centralPraticaConteudo && criadorSimuladao) {
    centralPraticaConteudo.appendChild(criadorSimuladao);
}

let paginaAnteriorFerramenta = paginaPrincipal;

const areaMateria =
    document.querySelector("#area-materia");

const parametrosPagina = new URLSearchParams(window.location.search);
const MODO_DEMONSTRACAO = parametrosPagina.get("demo") === "1";

let usuarioAtual = MODO_DEMONSTRACAO
    ? {
        nome: "Visitante",
        email: "demonstracao@malteria.app",
        tipo: "Aluno",
        administrador: false,
        bancoConectado: false,
        demonstracao: true
    }
    : null;

document.querySelector("#salvar-lembrete")?.addEventListener("click", criarNovoLembrete);
document.querySelector("#permitir-notificacoes")?.addEventListener("click", pedirPermissaoDeNotificacao);
prepararFormularioLembrete();
desenharLembretes();
window.setInterval(verificarLembretes, 15000);
window.setTimeout(verificarLembretes, 1500);
let materiaAtual = null;
let tokenClassroom = "";
let clienteClassroom = null;
let turmasClassroom = [];
let atividadesPorTurma = {};
let tentativaSilenciosaClassroom = false;
const recuperacaoSenhaAtiva = Boolean(
    window.MalteriaBanco &&
    window.MalteriaBanco.emRecuperacaoSenha &&
    window.MalteriaBanco.emRecuperacaoSenha()
);

/* ABERTURA ANIMADA DA MALTÉRIA */

let aberturaMalteriaEncerrada = false;

function encerrarAberturaMalteria() {
    if (aberturaMalteriaEncerrada) {
        return;
    }

    aberturaMalteriaEncerrada = true;
    animacaoMalteria.classList.add("intro-encerrando");

    window.setTimeout(function () {
        animacaoMalteria.classList.add("escondido");
        document.body.classList.remove("intro-ativa");
        mostrarTela(telaBoasVindas);
    }, 650);
}

const reduzirMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (recuperacaoSenhaAtiva) {
    animacaoMalteria.classList.add("escondido");
    document.body.classList.remove("intro-ativa");
    mostrarTela(telaLogin);
} else if (!animacaoMalteria.classList.contains("escondido")) {
    document.body.classList.add("intro-ativa");

    animacaoMalteria.addEventListener(
        "click",
        encerrarAberturaMalteria
    );

    animacaoMalteria.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            encerrarAberturaMalteria();
        }
    });

    window.setTimeout(
        encerrarAberturaMalteria,
        reduzirMovimento ? 900 : 4800
    );
}

function normalizarEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}

function usuarioEhDono(usuario) {
    return Boolean(
        normalizarEmail(usuario?.email) ===
            EMAIL_DONO_MALTERIA
    );
}

const CHAVE_MODULO_DONO = "malteriaModuloDono";
let moduloDonoAtual = "aluno";

function perfilVisualAtual() {
    if (usuarioEhDono(usuarioAtual)) {
        return moduloDonoAtual;
    }

    return usuarioAtual?.tipo === "Responsável"
        ? "responsavel"
        : "aluno";
}

function atualizarSeletorModuloDono() {
    const seletor = document.querySelector("#seletor-modulo-dono");
    if (!seletor) return;

    const podeAlternar = usuarioEhDono(usuarioAtual);
    seletor.classList.toggle("escondido", !podeAlternar);

    seletor.querySelectorAll("[data-modulo-dono]").forEach(function (botao) {
        const ativo = botao.dataset.moduloDono === moduloDonoAtual;
        botao.classList.toggle("ativo", ativo);
        botao.setAttribute("aria-pressed", String(ativo));
    });
}

function atualizarDescricaoDaConta() {
    const contaTipo = document.querySelector("#conta-tipo");
    if (!contaTipo || !usuarioAtual) return;

    contaTipo.textContent = usuarioEhDono(usuarioAtual)
        ? "Superadministrador • módulo " +
            (perfilVisualAtual() === "responsavel" ? "Responsável" : "Aluno")
        : usuarioAtual.tipo;
}

function trocarModuloDono(novoModulo) {
    if (!usuarioEhDono(usuarioAtual)) return;
    if (novoModulo !== "aluno" && novoModulo !== "responsavel") return;

    moduloDonoAtual = novoModulo;
    sessionStorage.setItem(CHAVE_MODULO_DONO, moduloDonoAtual);
    atualizarSeletorModuloDono();
    atualizarDescricaoDaConta();
    aplicarVisibilidadePorPerfil();

    if (perfilVisualAtual() === "responsavel") {
        prepararPainelResponsavel();
    } else {
        prepararPainelAluno();
    }

    mostrarPaginaPrincipal();
}

document.querySelectorAll("[data-modulo-dono]").forEach(function (botao) {
    botao.addEventListener("click", function () {
        trocarModuloDono(botao.dataset.moduloDono);
    });
});

function lerUsuariosLocais() {
    let usuarios = [];

    try {
        usuarios = JSON.parse(
            localStorage.getItem("malteriaUsuariosLocais")
        ) || [];
    } catch (erro) {
        usuarios = [];
    }

    try {
        const usuarioAntigo = JSON.parse(
            localStorage.getItem("usuarioPepiEstudos")
        );

        if (
            usuarioAntigo &&
            !usuarios.some(function (usuario) {
                return normalizarEmail(usuario.email) ===
                    normalizarEmail(usuarioAntigo.email);
            })
        ) {
            usuarios.push(usuarioAntigo);
        }
    } catch (erro) {
        // Mantém somente as contas válidas encontradas.
    }

    return usuarios;
}

function salvarUsuarioLocal(usuario) {
    if (MODO_DEMONSTRACAO || usuario?.demonstracao) {
        return;
    }

    const usuarios = lerUsuariosLocais();
    const email = normalizarEmail(usuario.email);
    const indice = usuarios.findIndex(function (item) {
        return normalizarEmail(item.email) === email;
    });

    if (usuario.bancoConectado) {
        usuario.administrador = usuario.administrador === true;
    } else {
        usuario.administrador = usuarioEhDono(usuario);
    }

    if (indice >= 0) {
        usuarios[indice] = usuario;
    } else {
        usuarios.push(usuario);
    }

    localStorage.setItem(
        "malteriaUsuariosLocais",
        JSON.stringify(usuarios)
    );

    localStorage.setItem(
        "usuarioPepiEstudos",
        JSON.stringify(usuario)
    );
}

async function restaurarSessaoMalteria() {
    if (MODO_DEMONSTRACAO) {
        return usuarioAtual;
    }

    if (
        recuperacaoSenhaAtiva ||
        !window.MalteriaBanco?.configurado ||
        !window.MalteriaBanco.restaurarSessao
    ) {
        return null;
    }

    try {
        const perfil = await window.MalteriaBanco.restaurarSessao();
        if (!perfil?.email) return null;

        const usuarios = lerUsuariosLocais();
        const usuarioLocal = usuarios.find(function (usuario) {
            return normalizarEmail(usuario.email) === normalizarEmail(perfil.email);
        }) || {};

        usuarioAtual = Object.assign({}, usuarioLocal, {
            id: perfil.id || usuarioLocal.id,
            nome: perfil.nome || usuarioLocal.nome || "Estudante",
            email: perfil.email,
            tipo: perfil.tipo || usuarioLocal.tipo || "Aluno",
            administrador: perfil.papel === "superadmin",
            bancoConectado: true,
            precisaTrocarSenha: perfil.precisaTrocarSenha === true
        });

        salvarUsuarioLocal(usuarioAtual);
        return usuarioAtual;
    } catch (erro) {
        console.warn("Nao foi possivel restaurar a sessao da Malteria:", erro);
        return null;
    }
}

const promessaRestauracaoSessao = restaurarSessaoMalteria();

/* NAVEGAÇÃO DA AUTENTICAÇÃO */

function esconderTelasPrincipais() {
    telaBoasVindas.classList.add("escondido");
    telaEscolha.classList.add("escondido");
    telaLogin.classList.add("escondido");
    telaCadastro.classList.add("escondido");
    telaVinculoFamilia.classList.add("escondido");
    aplicativo.classList.add("escondido");
}

document
    .querySelector("#avancar-apresentacao")
    .addEventListener("click", function () {
        esconderTelasPrincipais();
        transicaoProximo.classList.remove(
            "escondido",
            "transicao-saindo"
        );

        window.setTimeout(async function () {
            transicaoProximo.classList.add(
                "transicao-saindo"
            );

            await promessaRestauracaoSessao;

            if (usuarioAtual) {
                entrarNoAplicativo();
            } else {
                mostrarTela(telaEscolha);
            }

            window.setTimeout(function () {
                transicaoProximo.classList.add("escondido");
                transicaoProximo.classList.remove(
                    "transicao-saindo"
                );
            }, reduzirMovimento ? 30 : 480);
        }, reduzirMovimento ? 250 : 2100);
    });

function mostrarTela(tela) {
    esconderTelasPrincipais();
    tela.classList.remove("escondido");
}

function limparCamposDeAcesso(formulario) {
    formulario.reset();

    formulario
        .querySelectorAll("input")
        .forEach(function (campo) {
            if (
                campo.type !== "radio" &&
                campo.type !== "checkbox"
            ) {
                campo.value = "";
            }
        });
}

function protegerCamposContraPreenchimento(formulario) {
    formulario
        .querySelectorAll("input:not([type='radio']):not([type='checkbox'])")
        .forEach(function (campo, indice) {
            campo.value = "";
            campo.readOnly = true;
            campo.name =
                "campo-vazio-" + Date.now() + "-" + indice;

            function liberarCampo() {
                campo.readOnly = false;
                campo.value = "";

                if (campo.id.includes("email")) {
                    campo.type = "email";
                }
            }

            campo.addEventListener(
                "pointerdown",
                liberarCampo,
                { once: true }
            );

            campo.addEventListener(
                "keydown",
                liberarCampo,
                { once: true }
            );
        });
}

function abrirLoginLimpo() {
    const formulario =
        document.querySelector("#form-login");

    limparCamposDeAcesso(formulario);
    protegerCamposContraPreenchimento(formulario);
    document.querySelector("#erro-login").textContent = "";
    mostrarTela(telaLogin);

    window.setTimeout(function () {
        limparCamposDeAcesso(formulario);
        protegerCamposContraPreenchimento(formulario);
    }, 250);
}

function abrirCadastroLimpo() {
    const formulario =
        document.querySelector("#form-cadastro");

    limparCamposDeAcesso(formulario);
    protegerCamposContraPreenchimento(formulario);
    document.querySelector("#erro-cadastro").textContent = "";
    dadosFilho?.classList.add("escondido");
    document.querySelector("#opcao-familia-aluno")?.classList.remove("escondido");
    mostrarTela(telaCadastro);

    window.setTimeout(function () {
        limparCamposDeAcesso(formulario);
        protegerCamposContraPreenchimento(formulario);
        dadosFilho?.classList.add("escondido");
        document.querySelector("#opcao-familia-aluno")?.classList.remove("escondido");
    }, 250);
}

document
    .querySelector("#ir-login")
    .addEventListener("click", abrirLoginLimpo);

document
    .querySelector("#ir-cadastro")
    .addEventListener("click", abrirCadastroLimpo);

document
    .querySelector("#ir-login-hero")
    .addEventListener("click", abrirLoginLimpo);

document
    .querySelector("#ir-cadastro-hero")
    .addEventListener("click", abrirCadastroLimpo);

document
    .querySelectorAll(".voltar")
    .forEach(function (botao) {
        botao.addEventListener("click", function () {
            mostrarTela(telaEscolha);
        });
    });

/* BARRA LATERAL, PESQUISA E AJUDA */

const paginasInternas = [
    paginaPrincipal,
    paginaAgenda,
    paginaLembretes,
    paginaMaterias,
    paginaTrabalhos,
    paginaRedacoes,
    paginaMateria,
    paginaPesquisa,
    paginaAjuda,
    paginaNivelMelhora,
    paginaPratica,
    paginaCorrecao,
    paginaGabaritos,
    paginaAdministracao
];

function mostrarPaginaInterna(pagina) {
    paginasInternas.forEach(function (item) {
        item.classList.toggle(
            "escondido",
            item !== pagina
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function paginaVisivelAtual() {
    return paginasInternas.find(function (pagina) {
        return !pagina.classList.contains("escondido");
    }) || paginaPrincipal;
}

function abrirPainelPesquisa() {
    const atual = paginaVisivelAtual();

    if (atual !== paginaPesquisa) {
        paginaAnteriorFerramenta = atual;
    }

    mostrarPaginaInterna(paginaPesquisa);
    desenharHistoricoPesquisas();

    window.setTimeout(function () {
        document
            .querySelector("#campo-pesquisa")
            .focus();
    }, 120);
}

function abrirNovaPesquisa() {
    document.querySelector("#campo-pesquisa").value = "";
    document.querySelector("#materia-pesquisa").value = "";
    document.querySelector("#formato-pesquisa").value = "texto";

    const tipo = document.querySelector("#tipo-pesquisa");
    if (tipo) tipo.value = "todos";

    const semData = document.querySelector("#pesquisa-sem-data");
    semData.checked = false;
    semData.dispatchEvent(new Event("change"));
    preencherDatasDaSemana();

    document.querySelector("#status-pesquisa").textContent = "";
    const resposta = document.querySelector("#resposta-pesquisa");
    resposta.innerHTML = "";
    resposta.classList.add("escondido");

    abrirPainelPesquisa();
}

function fecharPainelPesquisa() {
    mostrarPaginaInterna(
        paginaAnteriorFerramenta || paginaPrincipal
    );
}

function abrirPainelAjuda() {
    const atual = paginaVisivelAtual();

    if (atual !== paginaAjuda) {
        paginaAnteriorFerramenta = atual;
    }

    mostrarPaginaInterna(paginaAjuda);
}

function fecharPainelAjuda() {
    mostrarPaginaInterna(
        paginaAnteriorFerramenta || paginaPrincipal
    );
}

document
    .querySelector("#abrir-pesquisa")
    .addEventListener("click", abrirNovaPesquisa);

document
    .querySelector("#fechar-pesquisa")
    .addEventListener("click", fecharPainelPesquisa);

document
    .querySelector("#abrir-ajuda")
    .addEventListener("click", abrirPainelAjuda);

document
    .querySelector("#fechar-ajuda")
    .addEventListener("click", fecharPainelAjuda);

document
    .querySelectorAll("[data-ajuda-acao]")
    .forEach(function (botao) {
        botao.addEventListener("click", function () {
            if (botao.dataset.ajudaAcao === "pesquisa") {
                abrirPainelPesquisa();
            }

            if (botao.dataset.ajudaAcao === "classroom") {
                mostrarPaginaPrincipal();
                conectarClassroom();
            }

            if (botao.dataset.ajudaAcao === "meta") {
                paginaAnteriorFerramenta = paginaAjuda;
                mostrarPaginaInterna(paginaNivelMelhora);
                prepararPainelMetaEvolucao();
            }

            if (botao.dataset.ajudaAcao === "relatorio") {
                mostrarPaginaPrincipal();
                document.querySelector("#painel-responsavel-resumo")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            if (botao.dataset.ajudaAcao === "filhos") {
                mostrarPaginaPrincipal();
                document.querySelector("#area-filhos")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });

document
    .querySelectorAll("[data-ajuda-perfil]")
    .forEach(function (botao) {
        botao.addEventListener("click", function () {
            const perfil = botao.dataset.ajudaPerfil;

            document
                .querySelectorAll("[data-ajuda-perfil]")
                .forEach(function (opcao) {
                    opcao.classList.toggle("ativo", opcao === botao);
                });

            document
                .querySelectorAll("[data-conteudo-ajuda]")
                .forEach(function (conteudo) {
                    conteudo.classList.toggle(
                        "escondido",
                        conteudo.dataset.conteudoAjuda !== perfil
                    );
                });
        });
    });

/* ALUNO OU RESPONSÁVEL */

const opcoesTipoConta = document.querySelectorAll(
    'input[name="tipo-conta"]'
);

const dadosFilho =
    document.querySelector("#dados-filho");

const filhoNome =
    document.querySelector("#filho-nome");

const filhoEmail =
    document.querySelector("#filho-email");

const opcaoFamiliaAluno =
    document.querySelector("#opcao-familia-aluno");

opcoesTipoConta.forEach(function (opcao) {
    opcao.addEventListener("change", function () {
        const responsavel =
            opcao.checked &&
            opcao.value === "Responsável";

        dadosFilho.classList.toggle(
            "escondido",
            !responsavel
        );

        opcaoFamiliaAluno.classList.toggle(
            "escondido",
            responsavel
        );

        filhoNome.required = responsavel;
        filhoEmail.required = responsavel;
    });
});

/* CADASTRO */

document
    .querySelector("#form-cadastro")
    .addEventListener("submit", async function (evento) {
        evento.preventDefault();
        document.querySelector("#erro-login").textContent = "";

        const nome = document
            .querySelector("#cadastro-nome")
            .value
            .trim();

        const email = document
            .querySelector("#cadastro-email")
            .value
            .trim();

        const senha = document
            .querySelector("#cadastro-senha")
            .value;

        const tipo = document.querySelector(
            'input[name="tipo-conta"]:checked'
        ).value;

        const desejaVincularFamilia =
            tipo === "Aluno" &&
            document.querySelector("#aluno-tem-familia").checked;

        if (nome.length < 2) {
            mostrarErroCadastro(
                "Digite um nome válido."
            );

            return;
        }

        if (senha.length < 6) {
            mostrarErroCadastro(
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }

        const bancoAtivo = Boolean(
            window.MalteriaBanco && window.MalteriaBanco.configurado
        );

        const emailJaCadastrado = !bancoAtivo &&
            lerUsuariosLocais().some(
                function (usuario) {
                    return normalizarEmail(
                        usuario.email
                    ) === normalizarEmail(email);
                }
            );

        if (emailJaCadastrado) {
            mostrarErroCadastro(
                "Este e-mail já possui uma conta. Use a tela de login."
            );

            return;
        }

        usuarioAtual = {
            nome: nome,
            email: email,
            senha: bancoAtivo ? undefined : senha,
            tipo: tipo,
            filhos: []
        };

        if (tipo === "Responsável") {
            const primeiroFilho = {
                nome: filhoNome.value.trim(),
                email: filhoEmail.value.trim(),

                codigo:
                    document
                        .querySelector("#filho-codigo")
                        .value
                        .trim() ||
                    gerarCodigo()
            };

            usuarioAtual.filhos.push(primeiroFilho);

            usuarioAtual.codigoFamilia =
                gerarCodigo();
        } else {
            usuarioAtual.codigoAluno =
                gerarCodigo();
        }

        if (bancoAtivo) {
            try {
                const usuarioBanco = await window.MalteriaBanco.cadastrar(
                    usuarioAtual,
                    senha
                );
                usuarioAtual.id = usuarioBanco && usuarioBanco.id;
                usuarioAtual.bancoConectado = true;
            } catch (erro) {
                mostrarErroCadastro(
                    erro.message || "Não foi possível criar a conta."
                );
                return;
            }
        }

        salvarUsuarioLocal(usuarioAtual);

        if (desejaVincularFamilia) {
            document.querySelector("#codigo-vinculo-familia").value = "";
            document.querySelector("#erro-vinculo-familia").textContent = "";
            mostrarTela(telaVinculoFamilia);
            return;
        }

        entrarNoAplicativo();
    });

function mostrarErroCadastro(mensagem) {
    document.querySelector(
        "#erro-cadastro"
    ).textContent = mensagem;
}

function gerarCodigo() {
    const numero =
        Math.floor(1000 + Math.random() * 9000);

    return "PEPI-" + numero;
}

function normalizarCodigoFamilia(codigo) {
    return String(codigo || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}

document
    .querySelector("#form-vinculo-familia")
    .addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const campoCodigo = document.querySelector("#codigo-vinculo-familia");
        const areaErro = document.querySelector("#erro-vinculo-familia");
        const codigo = normalizarCodigoFamilia(campoCodigo.value);

        if (!codigo) {
            areaErro.textContent = "Digite o código enviado pelo seu responsável.";
            return;
        }

        const responsavel = lerUsuariosLocais().find(function (usuario) {
            if (usuario.tipo !== "Responsável") return false;

            const codigoDaFamilia =
                normalizarCodigoFamilia(usuario.codigoFamilia);
            const codigoDeUmFilho = (usuario.filhos || []).some(
                function (filho) {
                    return normalizarCodigoFamilia(filho.codigo) === codigo;
                }
            );

            return codigoDaFamilia === codigo || codigoDeUmFilho;
        });

        if (!responsavel) {
            areaErro.textContent =
                "Não encontramos esse código neste navegador. Confira o código ou peça ao responsável para abrir a conta neste aparelho.";
            return;
        }

        responsavel.filhos = responsavel.filhos || [];

        let filhoVinculado = responsavel.filhos.find(function (filho) {
            return normalizarCodigoFamilia(filho.codigo) === codigo;
        });

        if (!filhoVinculado) {
            filhoVinculado = responsavel.filhos.find(function (filho) {
                return normalizarEmail(filho.email) ===
                    normalizarEmail(usuarioAtual.email);
            });
        }

        if (filhoVinculado) {
            filhoVinculado.nome = usuarioAtual.nome;
            filhoVinculado.email = usuarioAtual.email;
            usuarioAtual.codigoAluno =
                filhoVinculado.codigo || usuarioAtual.codigoAluno;
        } else {
            filhoVinculado = {
                nome: usuarioAtual.nome,
                email: usuarioAtual.email,
                codigo: usuarioAtual.codigoAluno || gerarCodigo()
            };
            responsavel.filhos.push(filhoVinculado);
            usuarioAtual.codigoAluno = filhoVinculado.codigo;
        }

        usuarioAtual.responsavelEmail = responsavel.email;
        usuarioAtual.familiaCodigoVinculado = responsavel.codigoFamilia || codigo;
        usuarioAtual.vinculoFamiliaAtivo = true;

        salvarUsuarioLocal(responsavel);
        salvarUsuarioLocal(usuarioAtual);
        entrarNoAplicativo();
    });

document
    .querySelector("#pular-vinculo-familia")
    .addEventListener("click", function () {
        entrarNoAplicativo();
    });

/* LOGIN */

let modoTrocaSenha = "obrigatoria";

function abrirModalTrocaSenha(titulo, descricao, modo) {
    modoTrocaSenha = modo || "conta";
    document.querySelector("#titulo-trocar-senha").textContent = titulo;
    document.querySelector("#modal-trocar-senha > section > p").textContent = descricao;
    document.querySelector("#erro-trocar-senha").textContent = "";
    document.querySelector("#form-trocar-senha-obrigatoria").reset();
    document.querySelector("#modal-trocar-senha").classList.remove("escondido");
}

document
    .querySelector("#form-login")
    .addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const email = document
            .querySelector("#login-email")
            .value
            .trim();

        const senha = document
            .querySelector("#login-senha")
            .value;

        const bancoAtivo = Boolean(
            window.MalteriaBanco && window.MalteriaBanco.configurado
        );

        if (bancoAtivo) {
            try {
                const perfil = await window.MalteriaBanco.entrar(email, senha);
                const usuarioLocal = lerUsuariosLocais().find(
                    function (usuario) {
                        return normalizarEmail(usuario.email) ===
                            normalizarEmail(email);
                    }
                ) || {};

                usuarioAtual = Object.assign({}, usuarioLocal, {
                    id: perfil.id,
                    nome: perfil.nome,
                    email: perfil.email,
                    tipo: perfil.tipo,
                    administrador: perfil.papel === "superadmin",
                    bancoConectado: true
                });

                salvarUsuarioLocal(usuarioAtual);
                if (perfil.precisaTrocarSenha) {
                    abrirModalTrocaSenha(
                        "Crie sua nova senha",
                        "Você entrou com uma senha temporária. Troque-a antes de continuar.",
                        "obrigatoria"
                    );
                } else {
                    entrarNoAplicativo();
                }
                return;
            } catch (erro) {
                const detalhe = String(erro && erro.message || "").toLowerCase();
                mostrarErroLogin(
                    detalhe.includes("invalid login credentials")
                        ? "A senha informada não é a senha atual desta conta. Redefina a senha para recuperar o acesso."
                        : (erro.message || "E-mail ou senha incorretos.")
                );
                return;
            }
        }

        const usuarioSalvo = lerUsuariosLocais().find(
            function (usuario) {
                return normalizarEmail(usuario.email) ===
                    normalizarEmail(email);
            }
        );

        if (!usuarioSalvo) {
            mostrarErroLogin(
                "Nenhuma conta foi cadastrada neste navegador."
            );

            return;
        }

        if (
            normalizarEmail(usuarioSalvo.email) !==
                normalizarEmail(email) ||
            usuarioSalvo.senha !== senha
        ) {
            mostrarErroLogin(
                "E-mail ou senha incorretos."
            );

            return;
        }

        usuarioAtual = usuarioSalvo;
        usuarioAtual.administrador =
            usuarioEhDono(usuarioAtual);

        salvarUsuarioLocal(usuarioAtual);

        entrarNoAplicativo();
    });

document
    .querySelector("#form-trocar-senha-obrigatoria")
    .addEventListener("submit", async function (evento) {
        evento.preventDefault();
        const novaSenha = document.querySelector("#nova-senha-obrigatoria").value;
        const confirmacao = document.querySelector("#confirmar-senha-obrigatoria").value;
        const erro = document.querySelector("#erro-trocar-senha");
        erro.textContent = "";
        if (novaSenha.length < 8) {
            erro.textContent = "A nova senha precisa ter pelo menos 8 caracteres.";
            return;
        }
        if (novaSenha !== confirmacao) {
            erro.textContent = "As duas senhas precisam ser iguais.";
            return;
        }
        const botao = this.querySelector("button[type=submit]");
        botao.disabled = true;
        try {
            await window.MalteriaBanco.trocarSenhaObrigatoria(novaSenha);
            document.querySelector("#modal-trocar-senha").classList.add("escondido");
            this.reset();
            if (modoTrocaSenha === "recuperacao") {
                await window.MalteriaBanco.sair();
                usuarioAtual = null;
                abrirLoginLimpo();
                document.querySelector("#erro-login").textContent =
                    "Senha alterada. Entre usando sua nova senha.";
            } else {
                entrarNoAplicativo();
            }
        } catch (falha) {
            erro.textContent = falha.message || "Não foi possível trocar a senha.";
        } finally {
            botao.disabled = false;
        }
    });

window.addEventListener("malteria:recuperar-senha", function () {
    abrirModalTrocaSenha(
        "Redefina sua senha",
        "Digite uma nova senha segura para recuperar o acesso à sua conta.",
        "recuperacao"
    );
});

if (
    window.MalteriaBanco &&
    window.MalteriaBanco.configurado &&
    window.MalteriaBanco.emRecuperacaoSenha &&
    recuperacaoSenhaAtiva
) {
    window.setTimeout(function () {
        abrirModalTrocaSenha(
            "Redefina sua senha",
            "Digite uma nova senha segura. Você não precisa da senha temporária nem da senha antiga.",
            "recuperacao"
        );
    }, 300);
}

document.querySelector("#mostrar-senha-login").addEventListener("click", function () {
    const campo = document.querySelector("#login-senha");
    campo.readOnly = false;
    campo.type = campo.type === "password" ? "text" : "password";
    this.textContent = campo.type === "password" ? "👁️" : "🙈";
});

document.querySelector("#esqueci-senha-login").addEventListener("click", async function () {
    const email = document.querySelector("#login-email").value.trim();
    const mensagem = document.querySelector("#erro-login");
    if (!email || !email.includes("@")) {
        mensagem.textContent = "Digite primeiro o e-mail da conta que deseja recuperar.";
        return;
    }
    this.disabled = true;
    try {
        await window.MalteriaBanco.enviarRedefinicaoSenha(email);
        mensagem.textContent = "Enviamos um link para " + email + ". Abra somente o e-mail mais recente e escolha sua nova senha na Maltéria.";
    } catch (erro) {
        const detalhe = String(erro && erro.message || "").toLowerCase();
        if (detalhe.includes("rate limit") || detalhe.includes("too many")) {
            mensagem.textContent = "Muitos e-mails foram solicitados. Use o link mais recente que já chegou ou aguarde até 1 hora antes de pedir outro.";
        } else {
            mensagem.textContent = erro.message || "Não foi possível enviar o link de recuperação.";
        }
    } finally {
        this.disabled = false;
    }
});

function mostrarErroLogin(mensagem) {
    document.querySelector(
        "#erro-login"
    ).textContent = mensagem;
}

/* ENTRAR NO APLICATIVO */

function entrarNoAplicativo() {
    mostrarTela(aplicativo);

    if (!usuarioAtual.bancoConectado) {
        usuarioAtual.administrador =
            usuarioEhDono(usuarioAtual);
    }

    if (!MODO_DEMONSTRACAO) {
        salvarUsuarioLocal(usuarioAtual);
    }
    desenharHistoricoPesquisas();

    if (usuarioEhDono(usuarioAtual)) {
        const moduloSalvo = sessionStorage.getItem(CHAVE_MODULO_DONO);
        moduloDonoAtual = moduloSalvo === "responsavel"
            ? "responsavel"
            : "aluno";
    }

    atualizarSeletorModuloDono();

    document.querySelector(
        "#saudacao"
    ).textContent =
        "Olá, " + usuarioAtual.nome + "!";

    document.querySelector(
        "#conta-nome"
    ).textContent =
        usuarioAtual.nome;

    document.querySelector(
        "#conta-email"
    ).textContent =
        usuarioAtual.email;

    atualizarDescricaoDaConta();

    document.querySelector(
        "#abrir-administracao"
    ).classList.toggle(
        "escondido",
        !usuarioAtual.administrador
    );

    const codigo =
        usuarioAtual.codigoFamilia ||
        usuarioAtual.codigoAluno;

    document.querySelector(
        "#codigo-familia"
    ).textContent =
        codigo
            ? "Código: " + codigo
            : "";

    aplicarVisibilidadePorPerfil();

    if (perfilVisualAtual() === "responsavel") {
        prepararPainelResponsavel();
    } else {
        prepararPainelAluno();
    }

    mostrarPaginaPrincipal();

    if (MODO_DEMONSTRACAO) {
        configurarModoDemonstracao();
    }

    restaurarConexaoClassroom();
}

function aplicarVisibilidadePorPerfil() {
    const perfil = perfilVisualAtual();

    document.querySelectorAll("[data-perfil-visivel]").forEach(function (elemento) {
        elemento.hidden = elemento.dataset.perfilVisivel !== perfil;
    });
}

function prepararPainelAluno() {
    document.querySelector(
        "#titulo-principal"
    ).textContent =
        "Suas matérias";

    document.querySelector(
        "#area-filhos"
    ).classList.add("escondido");

    document.querySelector(
        "#painel-responsavel-resumo"
    ).classList.remove("escondido");

    prepararRelatorioResponsavel();
    preencherMateriasCorrecao();
}

function prepararPainelResponsavel() {
    document.querySelector(
        "#titulo-principal"
    ).textContent =
        "Acompanhamento dos estudos";

    document.querySelector(
        "#area-filhos"
    ).classList.remove("escondido");

    document.querySelector(
        "#painel-responsavel-resumo"
    ).classList.remove("escondido");

    atualizarListaDeFilhos();
    prepararRelatorioResponsavel();
    preencherSeletorGabaritos();
}

/* VÁRIOS FILHOS */

function filhoSelecionadoAtual() {
    if (perfilVisualAtual() !== "responsavel") return null;

    const seletor = document.querySelector("#filho-selecionado");
    const filhos = usuarioAtual?.filhos || [];
    const indice = Number(seletor?.value);

    return Number.isInteger(indice) ? filhos[indice] || null : null;
}

function contaEscolarClassroomAtual() {
    const filho = filhoSelecionadoAtual();

    if (filho) {
        return {
            nome: filho.nome || "aluno",
            email: normalizarEmail(filho.email || filho.emailGoogleVerificado || "")
        };
    }

    return {
        nome: usuarioAtual?.nome || "aluno",
        email: normalizarEmail(usuarioAtual?.email || "")
    };
}

function chaveFilhoSelecionado() {
    return "malteriaFilhoSelecionado:" + normalizarEmail(
        usuarioAtual?.email || "sem-conta"
    );
}

function atualizarListaDeFilhos() {
    const seletor = document.querySelector(
        "#filho-selecionado"
    );

    seletor.innerHTML = "";

    const filhos = usuarioAtual.filhos || [];

    if (filhos.length === 0) {
        const opcao = document.createElement("option");
        opcao.value = "";
        opcao.textContent = "Nenhum aluno vinculado";
        seletor.appendChild(opcao);
        seletor.disabled = true;
        return;
    }

    seletor.disabled = false;
    const emailSalvo = normalizarEmail(
        localStorage.getItem(chaveFilhoSelecionado()) || ""
    );
    let indiceSelecionado = 0;

    filhos.forEach(function (filho, indice) {
        const opcao = document.createElement(
            "option"
        );

        opcao.value = indice;
        opcao.textContent = filho.nome;

        seletor.appendChild(opcao);

        if (normalizarEmail(filho.email) === emailSalvo) {
            indiceSelecionado = indice;
        }
    });

    seletor.value = String(indiceSelecionado);
}

document
    .querySelector("#filho-selecionado")
    .addEventListener("change", async function () {
        const filho = filhoSelecionadoAtual();

        localStorage.setItem(
            chaveFilhoSelecionado(),
            normalizarEmail(filho?.email || "")
        );

        materiaAtual = null;
        await restaurarConexaoClassroom();
        prepararRelatorioResponsavel();
    });

document
    .querySelector("#adicionar-filho")
    .addEventListener("click", function () {
        const nome = prompt(
            "Digite o nome do aluno:"
        );

        if (!nome) {
            return;
        }

        const email = prompt(
            "Digite o e-mail escolar do aluno:"
        );

        if (!email) {
            return;
        }

        const novoFilho = {
            nome: nome.trim(),
            email: email.trim(),
            codigo: gerarCodigo()
        };

        usuarioAtual.filhos =
            usuarioAtual.filhos || [];

        usuarioAtual.filhos.push(novoFilho);

        salvarUsuarioLocal(usuarioAtual);

        atualizarListaDeFilhos();
    });

/* MATÉRIAS DE DEMONSTRAÇÃO */

const materiasDemonstracao = [
    {
        id: "matematica",
        name: "Matemática",
        icon: "📐",
        descricao: "Frações e geometria"
    },
    {
        id: "portugues",
        name: "Português",
        icon: "📚",
        descricao: "Gramática e interpretação"
    },
    {
        id: "ciencias",
        name: "Ciências",
        icon: "🧪",
        descricao: "Células e ecossistemas"
    },
    {
        id: "historia",
        name: "História",
        icon: "🏛️",
        descricao: "Brasil colonial"
    },
    {
        id: "geografia",
        name: "Geografia",
        icon: "🌎",
        descricao: "Clima e relevo"
    },
    {
        id: "ingles",
        name: "Inglês",
        icon: "💬",
        descricao: "Vocabulário"
    }
];

function configurarModoDemonstracao() {
    document.body.classList.add("modo-demonstracao");

    const indicador = document.querySelector("#indicador-demonstracao");
    indicador?.classList.remove("escondido");

    const botaoMinhaConta = document.querySelector("#minha-conta");
    botaoMinhaConta?.classList.add("escondido");

    const status = document.querySelector("#status-classroom");
    if (status && !status.textContent.trim()) {
        status.textContent =
            "Na demonstração, você pode conectar sua própria conta Google Classroom.";
    }

    if (turmasClassroom.length === 0) {
        desenharMaterias(materiasDemonstracao);
    }
}

function desenharMaterias(materias) {
    const lista =
        document.querySelector("#lista-materias");

    const seletorPesquisa =
        document.querySelector("#materia-pesquisa");

    lista.innerHTML = "";

    seletorPesquisa.innerHTML = `
        <option value="">
            Escolha uma matéria
        </option>

        <option value="__todas__">
            Todas as matérias
        </option>
    `;

    materias.forEach(function (materia) {
        const botao =
            document.createElement("button");

        botao.className = "cartao-materia";

        botao.innerHTML = `
            <span>${materia.icon || "🎓"}</span>

            <strong>
                ${protegerTexto(materia.name)}
            </strong>

            <small>
                ${protegerTexto(
                    materia.descricao ||
                    materia.section ||
                    "Google Classroom"
                )}
            </small>
        `;

        botao.addEventListener(
            "click",
            function () {
                abrirMateria(materia);
            }
        );

        lista.appendChild(botao);

        const opcao =
            document.createElement("option");

        opcao.value = materia.name;
        opcao.textContent = materia.name;

        seletorPesquisa.appendChild(opcao);
    });
}

desenharMaterias(materiasDemonstracao);

prepararFiltrosPesquisa();

function prepararFiltrosPesquisa() {
    const caixa =
        document.querySelector(".pesquisa-inteligente");

    const seletorMateria =
        document.querySelector("#materia-pesquisa");

    if (
        !caixa ||
        !seletorMateria ||
        document.querySelector("#tipo-pesquisa")
    ) {
        return;
    }

    const labelMateria =
        document.querySelector(
            'label[for="materia-pesquisa"]'
        );

    const labelTipo =
        document.createElement("label");

    labelTipo.setAttribute(
        "for",
        "tipo-pesquisa"
    );

    labelTipo.textContent =
        "O que deseja encontrar?";

    const seletorTipo =
        document.createElement("select");

    seletorTipo.id = "tipo-pesquisa";

    seletorTipo.innerHTML = `
        <option value="todos">
            Tudo do período
        </option>

        <option value="dever">
            Deveres de casa
        </option>

        <option value="prova">
            Provas e avaliações
        </option>

        <option value="trabalho">
            Trabalhos e projetos
        </option>

        <option value="exercicio">
            Exercícios e listas
        </option>

        <option value="material">
            Materiais e aulas
        </option>

        <option value="agenda">
            Eventos do Google Agenda
        </option>
    `;

    caixa.insertBefore(
        labelTipo,
        labelMateria
    );

    caixa.insertBefore(
        seletorTipo,
        labelMateria
    );

    preencherDatasDaSemana();
}

const opcaoPesquisaSemData =
    document.querySelector("#pesquisa-sem-data");

opcaoPesquisaSemData.addEventListener("change", function () {
    const semData = opcaoPesquisaSemData.checked;
    const periodo = document.querySelector("#periodo-pesquisa");

    periodo.classList.toggle("periodo-desativado", semData);
    document.querySelector("#data-inicial").disabled = semData;
    document.querySelector("#data-final").disabled = semData;
});

function preencherDatasDaSemana() {
    const inicial =
        document.querySelector("#data-inicial");

    const final =
        document.querySelector("#data-final");

    if (!inicial || !final) {
        return;
    }

    const hoje = new Date();

    const segunda = new Date(hoje);

    const diaSemana =
        hoje.getDay() === 0
            ? 7
            : hoje.getDay();

    segunda.setDate(
        hoje.getDate() - diaSemana + 1
    );

    const domingo = new Date(segunda);

    domingo.setDate(
        segunda.getDate() + 6
    );

    if (!inicial.value) {
        inicial.value =
            dataParaCampo(segunda);
    }

    if (!final.value) {
        final.value =
            dataParaCampo(domingo);
    }
}

function dataParaCampo(data) {
    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return ano + "-" + mes + "-" + dia;
}


/* ABRIR MATÉRIA */

function abrirMateria(materia) {
    materiaAtual = materia;

    if (usuarioAtual?.email) {
        localStorage.setItem(
            "malteriaUltimaMateria:" + normalizarEmail(usuarioAtual.email),
            JSON.stringify({ id: String(materia.id), name: materia.name })
        );
    }

    mostrarPaginaInterna(paginaMateria);

    document.querySelector(
        "#nome-materia"
    ).textContent =
        materia.name;

    document.querySelector(
        "#icone-materia"
    ).textContent =
        materia.icon || "🎓";

    areaMateria.innerHTML = `
        <h2>
            O que você quer fazer em
            ${protegerTexto(materia.name)}?
        </h2>

        <p>
            Escolha uma das opções acima.
        </p>
    `;

}

function mostrarPaginaPrincipal() {
    const titulo = document.querySelector("#titulo-principal");
    if (titulo) {
        const nome = usuarioAtual?.nome?.trim();
        titulo.textContent = nome
            ? "Olá, " + nome + "!"
            : "Bem-vindo à Maltéria!";
    }
    mostrarPaginaInterna(paginaPrincipal);
}

function mostrarPaginaAgenda() {
    prepararRelatorioResponsavel();
    mostrarPaginaInterna(paginaAgenda);
}

function mostrarPaginaLembretes() {
    prepararFormularioLembrete();
    desenharLembretes();
    mostrarPaginaInterna(paginaLembretes);
}

function mostrarPaginaMaterias() {
    mostrarPaginaInterna(paginaMaterias);
}

function mostrarPaginaTrabalhos() {
    mostrarPaginaInterna(paginaTrabalhos);
    prepararPaginaTrabalhos();
}

function mostrarPaginaRedacoes() {
    preencherMateriasRedacao();
    mostrarPaginaInterna(paginaRedacoes);
}

function mostrarPaginaCorrecao() {
    preencherMateriasCorrecao();
    mostrarPaginaInterna(paginaCorrecao);
}

function mostrarPaginaGabaritos() {
    preencherSeletorGabaritos();
    desenharGabaritosDoAluno();
    mostrarPaginaInterna(paginaGabaritos);
}

document
    .querySelector("#inicio")
    .addEventListener(
        "click",
        mostrarPaginaPrincipal
    );

document
    .querySelector("#inicio-lateral")
    .addEventListener(
        "click",
        mostrarPaginaPrincipal
    );

document
    .querySelector("#abrir-agenda-lateral")
    .addEventListener("click", mostrarPaginaAgenda);

document
    .querySelector("#abrir-lembretes-lateral")
    .addEventListener("click", mostrarPaginaLembretes);

document
    .querySelector("#fechar-lembretes")
    .addEventListener("click", mostrarPaginaPrincipal);

document
    .querySelector("#abrir-materias-lateral")
    .addEventListener("click", mostrarPaginaMaterias);

document
    .querySelector("#abrir-trabalhos-lateral")
    .addEventListener("click", mostrarPaginaTrabalhos);

document
    .querySelector("#abrir-redacoes-lateral")
    .addEventListener("click", mostrarPaginaRedacoes);

document
    .querySelector("#abrir-correcao-lateral")
    .addEventListener("click", mostrarPaginaCorrecao);

document
    .querySelector("#abrir-gabaritos-lateral")
    .addEventListener("click", mostrarPaginaGabaritos);

document.querySelectorAll("[data-atalho-pagina]").forEach(function (botao) {
    botao.addEventListener("click", function () {
        const destino = botao.dataset.atalhoPagina;
        if (destino === "agenda") mostrarPaginaAgenda();
        if (destino === "lembretes") mostrarPaginaLembretes();
        if (destino === "materias") mostrarPaginaMaterias();
        if (destino === "redacoes") mostrarPaginaRedacoes();
        if (destino === "trabalhos") mostrarPaginaTrabalhos();
        if (destino === "correcao") mostrarPaginaCorrecao();
        if (destino === "gabaritos") mostrarPaginaGabaritos();
        if (destino === "pesquisa") abrirNovaPesquisa();
        if (destino === "meta") document.querySelector("#abrir-nivel-melhora").click();
        if (destino === "simulados") document.querySelector("#abrir-pratica").click();
        if (destino === "ajuda") abrirPainelAjuda();
    });
});

document
    .querySelector("#voltar-materias")
    .addEventListener(
        "click",
        mostrarPaginaMaterias
    );

/* MENU DA MATÉRIA */

document
    .querySelectorAll(".menu-materia button")
    .forEach(function (botao) {
        botao.addEventListener(
            "click",
            function () {
                const opcao =
                    botao.dataset.opcao;

                if (opcao === "atividades") {
                    mostrarAtividades();
                }

                if (opcao === "explicacoes") {
                    mostrarExplicacoes();
                }

                if (opcao === "uploads") {
                    mostrarUpload();
                }

                if (opcao === "simulado") {
                    mostrarSimulado();
                }
            }
        );
    });

/* ATIVIDADES */

async function mostrarAtividades() {
    if (
        !materiaAtual ||
        !materiaAtual.id ||
        !String(materiaAtual.id).match(/^\d+$/)
    ) {
        areaMateria.innerHTML = `
            <h2>Atividades</h2>

            <p>
                Conecte o Classroom para carregar
                atividades reais desta matéria.
            </p>
        `;

        return;
    }

    areaMateria.innerHTML = `
        <h2>Carregando atividades...</h2>
    `;

    try {
        let atividades =
            atividadesPorTurma[materiaAtual.id];

        if (!atividades) {
            const dados = await chamarClassroom(
                "courses/" +
                materiaAtual.id +
                "/courseWork?pageSize=100"
            );

            atividades =
                dados.courseWork || [];

            atividadesPorTurma[
                materiaAtual.id
            ] = atividades;
        }

        desenharAtividades(atividades);
    } catch (erro) {
        areaMateria.innerHTML = `
            <h2>Não foi possível carregar</h2>

            <p>${protegerTexto(erro.message)}</p>
        `;
    }
}

function desenharAtividades(atividades) {
    if (atividades.length === 0) {
        areaMateria.innerHTML = `
            <h2>Atividades</h2>
            <p>Nenhuma atividade encontrada.</p>
        `;

        return;
    }

    const itens = atividades
        .map(function (atividade) {
            return `
                <div class="arquivo">
                    <strong>
                        📝 ${protegerTexto(
                            atividade.title
                        )}
                    </strong>

                    <p>
                        ${formatarPrazo(
                            atividade.dueDate
                        )}
                    </p>

                    ${
                        atividade.alternateLink
                            ? `
                                <a
                                    href="${atividade.alternateLink}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Abrir no Classroom
                                </a>
                            `
                            : ""
                    }
                </div>
            `;
        })
        .join("");

    areaMateria.innerHTML = `
        <h2>Atividades</h2>
        ${itens}
    `;
}

/* EXPLICAÇÕES */


async function mostrarExplicacoes() {
    const hoje = new Date();
    const ontem = new Date(hoje);

    ontem.setDate(
        ontem.getDate() - 1
    );

    areaMateria.innerHTML = `
        <h2>Explicações</h2>

        <p>
            Escolha de qual dia você quer estudar
            os materiais, explicações e slides.
        </p>

        <div class="seletor-data-estudo">
            <button
                id="estudar-hoje"
                class="botao-principal pequeno"
            >
                Matéria de hoje
            </button>

            <button
                id="estudar-ontem"
                class="botao-secundario pequeno"
            >
                Matéria de ontem
            </button>

            <button
                id="estudar-semana"
                class="botao-secundario pequeno"
            >
                Últimos 7 dias
            </button>

            <button
                id="estudar-duas-semanas"
                class="botao-secundario pequeno"
            >
                Últimas 2 semanas
            </button>

            <div class="escolher-data-estudo">
                <label for="data-estudo">
                    Escolher outra data
                </label>

                <input
                    id="data-estudo"
                    type="date"
                    value="${dataParaCampo(hoje)}"
                >

                <button
                    id="estudar-data"
                    class="botao-principal pequeno"
                >
                    Criar explicação
                </button>
            </div>
        </div>
    `;

    document.querySelector(
        "#estudar-hoje"
    ).addEventListener(
        "click",
        function () {
            criarEstudoDaData(
                dataParaCampo(hoje),
                "Hoje"
            );
        }
    );

    document.querySelector(
        "#estudar-ontem"
    ).addEventListener(
        "click",
        function () {
            criarEstudoDaData(
                dataParaCampo(ontem),
                "Ontem"
            );
        }
    );

    document.querySelector("#estudar-semana")
        .addEventListener("click", function () {
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - 6);
            criarEstudoDoPeriodo(
                dataParaCampo(inicio),
                dataParaCampo(hoje),
                "últimos 7 dias"
            );
        });

    document.querySelector("#estudar-duas-semanas")
        .addEventListener("click", function () {
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - 13);
            criarEstudoDoPeriodo(
                dataParaCampo(inicio),
                dataParaCampo(hoje),
                "últimas 2 semanas"
            );
        });

    document.querySelector(
        "#estudar-data"
    ).addEventListener(
        "click",
        function () {
            const data =
                document.querySelector(
                    "#data-estudo"
                ).value;

            if (!data) {
                return;
            }

            criarEstudoDaData(
                data,
                formatarDataCampo(data)
            );
        }
    );
}

async function criarEstudoDaData(
    data,
    nomePeriodo
) {
    return criarEstudoDoPeriodo(data, data, nomePeriodo);
}

async function criarEstudoDoPeriodo(
    dataInicial,
    dataFinal,
    nomePeriodo
) {
    periodoEstudoAtual = {
        inicio: dataInicial,
        fim: dataFinal,
        nome: nomePeriodo
    };

    estudoGerado = null;

    areaMateria.innerHTML = `
        <h2>Preparando a matéria de ${protegerTexto(nomePeriodo)}...</h2>

        <p>
            Lendo atividades, uploads, textos,
            documentos e slides dessa data.
        </p>
    `;

    try {
        estudoGerado =
            await gerarEstudoDaMateria();

        registrarPraticaLocal({
            tipo: "estudo_preparado",
            materia: materiaAtual?.name || "Matéria",
            periodo: nomePeriodo,
            minutos: 10
        });

        desenharOpcoesDoEstudo();
    } catch (erro) {
        console.error(erro);

        const mensagem =
            traduzirErroDaInteligencia(
                erro.message
            );

        areaMateria.innerHTML = `
            <h2>Não foi possível criar a explicação</h2>

            <p>${protegerTexto(mensagem)}</p>

            <div class="acoes-erro-ia">
                <button
                    id="tentar-novamente-estudo"
                    class="botao-principal"
                >
                    Tentar novamente
                </button>

                <button
                    id="voltar-escolha-data"
                    class="botao-secundario"
                >
                    Escolher outra data
                </button>
            </div>
        `;

        document.querySelector(
            "#tentar-novamente-estudo"
        ).addEventListener(
            "click",
                function () {
                criarEstudoDoPeriodo(
                    dataInicial,
                    dataFinal,
                    nomePeriodo
                );
            }
        );

        document.querySelector(
            "#voltar-escolha-data"
        ).addEventListener(
            "click",
            mostrarExplicacoes
        );
    }
}

function desenharOpcoesDoEstudo() {
    areaMateria.innerHTML = `
        <h2>
            Estudo de
            ${protegerTexto(materiaAtual.name)}
        </h2>

        <div class="opcoes-explicacao">
            <button data-estudo="explicacao">
                💡 Explicação
            </button>

            <button data-estudo="copia">
                ✍️ Cópia guiada
            </button>

            <button data-estudo="slides">
                🖥️ Slides
            </button>

            <button data-estudo="revisao">
                🔁 Revisão
            </button>

            <button data-estudo="audio">
                🎧 Ouvir
            </button>

        </div>

        <div id="conteudo-estudo"></div>
    `;

    document
        .querySelectorAll("[data-estudo]")
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    abrirFormatoDeEstudo(
                        botao.dataset.estudo
                    );
                }
            );
        });

    abrirFormatoDeEstudo("explicacao");
}

function abrirFormatoDeEstudo(formato) {
    const area = document.querySelector(
        "#conteudo-estudo"
    );

    if (formato === "explicacao") {
        area.innerHTML = `
            <div class="arquivo">
                <h3>Explicação</h3>

                <div class="texto-estudo">
                    ${formatarTexto(
                        estudoGerado.explicacao
                    )}
                </div>
            </div>
        `;
    }

    if (formato === "copia") {
        area.innerHTML = `
            <div class="arquivo">
                <h3>Cópia guiada</h3>

                <div class="texto-estudo copia-estudo">
                    ${formatarTexto(
                        estudoGerado.copia
                    )}
                </div>
            </div>
        `;
    }

    if (formato === "slides") {
        const slides =
            estudoGerado.slides || [];

        if (slides.length === 0) {
            area.innerHTML = `
                <div class="arquivo">
                    <h3>Nenhum slide foi criado</h3>
                    <p>Não encontrei conteúdo suficiente para a apresentação.</p>
                </div>
            `;
            return;
        }

        let slideAtual = 0;

        area.innerHTML = `
            <section class="apresentacao-slides">
                <div class="topo-slides">
                    <strong>Apresentação de ${protegerTexto(materiaAtual.name)}</strong>
                    <span id="contador-slide"></span>
                </div>

                <div class="barra-slides">
                    <div id="progresso-slides"></div>
                </div>

                <article id="slide-atual" class="slide-visual"></article>

                <div class="controles-slides">
                    <button id="slide-anterior" class="botao-secundario pequeno">
                        ← Anterior
                    </button>

                    <button id="slide-proximo" class="botao-principal pequeno">
                        Próximo →
                    </button>
                </div>
            </section>
        `;

        function desenharSlideAtual() {
            const slide = slides[slideAtual];

            const pontos = (slide.pontos || [])
                .map(function (ponto) {
                    return `<li>${protegerTexto(ponto)}</li>`;
                })
                .join("");

            document.querySelector("#slide-atual").innerHTML = `
                <div class="numero-slide">
                    ${String(slideAtual + 1).padStart(2, "0")}
                </div>

                <div class="conteudo-slide">
                    <small>MALTÉRIA</small>
                    <h2>${protegerTexto(slide.titulo)}</h2>
                    <ul>${pontos}</ul>
                </div>
            `;

            document.querySelector("#contador-slide").textContent =
                "Slide " + (slideAtual + 1) + " de " + slides.length;

            document.querySelector("#progresso-slides").style.width =
                (((slideAtual + 1) / slides.length) * 100) + "%";

            document.querySelector("#slide-anterior").disabled =
                slideAtual === 0;

            document.querySelector("#slide-proximo").textContent =
                slideAtual === slides.length - 1
                    ? "Recomeçar ↻"
                    : "Próximo →";
        }

        document.querySelector("#slide-anterior").addEventListener(
            "click",
            function () {
                if (slideAtual > 0) {
                    slideAtual--;
                    desenharSlideAtual();
                }
            }
        );

        document.querySelector("#slide-proximo").addEventListener(
            "click",
            function () {
                slideAtual =
                    slideAtual < slides.length - 1
                        ? slideAtual + 1
                        : 0;

                desenharSlideAtual();
            }
        );

        desenharSlideAtual();
        return;
    }

    if (formato === "revisao") {
        const pontos = estudoGerado.revisao
            .map(function (ponto) {
                return `
                    <li>
                        ${protegerTexto(ponto)}
                    </li>
                `;
            })
            .join("");

        area.innerHTML = `
            <div class="arquivo">
                <h3>Revisão</h3>
                <ul>${pontos}</ul>
            </div>
        `;
    }

    if (formato === "audio") {
        const blocosPodcast = obterBlocosPodcast();
        const previaPodcast = blocosPodcast
            .map(function (bloco, indice) {
                return `
                    <article class="fala-podcast" data-fala-podcast="${indice}">
                        <span>${iconeDoPersonagem(bloco.personagem)}</span>
                        <div>
                            <strong>${protegerTexto(bloco.personagem)}</strong>
                            <small>${protegerTexto(bloco.intencao || "Explicação")}</small>
                            <p>${protegerTexto(bloco.texto)}</p>
                        </div>
                    </article>
                `;
            })
            .join("");

        area.innerHTML = `
            <div class="arquivo audio-professora podcast-aula">
                <span class="audio-professora-icone">👩‍🏫</span>
                <h3>Podcast da aula</h3>

                <p>
                    Uma professora conduz a explicação dos slides com
                    exemplos, perguntas e participações breves da turma.
                </p>

                <div class="audio-roteiro-previa podcast-roteiro">
                    <strong>Roteiro interativo</strong>
                    <div class="lista-falas-podcast">${previaPodcast}</div>
                </div>

                <p id="status-audio" class="status-audio">
                    Pronto para começar.
                </p>

                <button
                    id="iniciar-audio"
                    class="botao-principal"
                >
                    ▶ Ouvir podcast
                </button>

                <button
                    id="parar-audio"
                    class="botao-secundario"
                    style="margin-top: 8px"
                >
                    ■ Parar
                </button>
            </div>
        `;

        document.querySelector(
            "#iniciar-audio"
        ).addEventListener(
            "click",
            iniciarAudio
        );

        document.querySelector(
            "#parar-audio"
        ).addEventListener(
            "click",
            function () {
                pararAudio();
            }
        );
    }
}

function desenharListaImpressa(area) {
    const lista = estudoGerado.listaImpressa || {};
    const questoes = Array.isArray(lista.questoes) ? lista.questoes : [];
    const gabarito = Array.isArray(lista.gabarito) ? lista.gabarito : [];

    if (questoes.length === 0) {
        area.innerHTML = `
            <div class="arquivo">
                <h3>Lista ainda não disponível</h3>
                <p>Gere novamente o estudo para criar a folha de exercícios à mão.</p>
            </div>
        `;
        return;
    }

    const htmlQuestoes = questoes.map(function (questao, indice) {
        const linhas = Math.min(10, Math.max(2, Number(questao.espacoLinhas) || 4));
        return `
            <article class="questao-folha">
                <p><strong>${Number(questao.numero) || indice + 1}.</strong> ${protegerTexto(questao.enunciado)}</p>
                <div class="linhas-resposta" style="--quantidade-linhas: ${linhas}"></div>
            </article>
        `;
    }).join("");

    const htmlGabarito = gabarito.map(function (item, indice) {
        return `
            <li>
                <strong>${Number(item.numero) || indice + 1}.</strong>
                ${protegerTexto(item.resposta)}
                <small>${protegerTexto(item.explicacao)}</small>
            </li>
        `;
    }).join("");

    area.innerHTML = `
        <div class="acoes-lista-impressa">
            <p>Resolva no papel e confira o gabarito somente depois.</p>
            <button id="imprimir-lista" class="botao-principal" type="button">
                🖨️ Imprimir ou salvar em PDF
            </button>
        </div>

        <section class="folha-impressa">
            <header>
                <span class="marca-folha">MALTÉRIA</span>
                <h2>${protegerTexto(lista.titulo || ("Lista de " + materiaAtual.name))}</h2>
                <p>${protegerTexto(lista.orientacoes || "Resolva com atenção e mostre seu raciocínio.")}</p>
                <div class="identificacao-folha">
                    <span>Nome: ____________________________________</span>
                    <span>Data: ____/____/________</span>
                </div>
            </header>
            <main>${htmlQuestoes}</main>
        </section>

        <details class="gabarito-lista">
            <summary>Ver gabarito depois de terminar</summary>
            <ol>${htmlGabarito}</ol>
        </details>
    `;

    document.querySelector("#imprimir-lista").addEventListener("click", function () {
        document.body.classList.add("imprimindo-lista");
        window.print();
        setTimeout(function () {
            document.body.classList.remove("imprimindo-lista");
        }, 500);
    });
}

let temporizadorPodcast = null;
let podcastInterrompido = false;
let tentativaDeCarregarVozes = 0;

function iniciarAudio() {
    pararAudio();
    podcastInterrompido = false;

    const status = document.querySelector("#status-audio");
    const blocos = obterBlocosPodcast();

    if (!blocos.length) {
        status.textContent = "Não há roteiro de podcast disponível.";
        return;
    }

    const vozes = escolherVozesPodcast();

    if (!vozes.professora) {
        if (speechSynthesis.getVoices().length === 0 && tentativaDeCarregarVozes < 2) {
            tentativaDeCarregarVozes++;
            status.textContent = "Carregando a voz da professora...";
            temporizadorPodcast = setTimeout(iniciarAudio, 650);
            return;
        }

        status.textContent =
            "Este aparelho não disponibilizou uma voz feminina em português. " +
            "Instale ou ative uma voz feminina do sistema para ouvir o podcast.";
        return;
    }

    tentativaDeCarregarVozes = 0;
    status.textContent = "A professora está abrindo o podcast...";
    falarBlocoDoPodcast(blocos, 0, vozes, status);
}

function pararAudio() {
    podcastInterrompido = true;
    speechSynthesis.cancel();
    clearTimeout(temporizadorPodcast);
    document.querySelectorAll(".fala-podcast.ativa").forEach(function (elemento) {
        elemento.classList.remove("ativa");
    });

    const status = document.querySelector("#status-audio");
    if (status) {
        status.textContent = "Podcast parado. Você pode recomeçar quando quiser.";
    }
}

function falarBlocoDoPodcast(blocos, indice, vozes, status) {
    if (podcastInterrompido || indice >= blocos.length) {
        if (!podcastInterrompido) {
            status.textContent = "Podcast concluído. Agora responda à pergunta final!";
        }
        return;
    }

    const bloco = blocos[indice];
    const papel = normalizarPapelPodcast(bloco.personagem);
    const fala = new SpeechSynthesisUtterance(bloco.texto);
    const elementoAtual = document.querySelector(`[data-fala-podcast="${indice}"]`);

    document.querySelectorAll(".fala-podcast.ativa").forEach(function (elemento) {
        elemento.classList.remove("ativa");
    });

    fala.lang = "pt-BR";
    fala.volume = 1;
    fala.voice = papel === "professora" ? vozes.professora : (vozes.estudante || vozes.professora);
    fala.rate = papel === "professora" ? 1.02 : 1.08;
    fala.pitch = papel === "professora" ? 1.06 : 1.2;

    fala.onstart = function () {
        if (elementoAtual) {
            elementoAtual.classList.add("ativa");
            elementoAtual.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        status.textContent =
            bloco.personagem + " — parte " + (indice + 1) + " de " + blocos.length + ".";
    };

    fala.onend = function () {
        if (elementoAtual) {
            elementoAtual.classList.remove("ativa");
        }

        if (!podcastInterrompido) {
            const pausa = papel === "professora" && /\?\s*$/.test(bloco.texto) ? 900 : 320;
            temporizadorPodcast = setTimeout(function () {
                falarBlocoDoPodcast(blocos, indice + 1, vozes, status);
            }, pausa);
        }
    };

    fala.onerror = function () {
        status.textContent = "O áudio foi interrompido pelo navegador. Tente novamente.";
    };

    speechSynthesis.speak(fala);
}

function escolherVozesPodcast() {
    const vozesPortugues = speechSynthesis.getVoices().filter(function (voz) {
        return /^pt(-|_)/i.test(voz.lang);
    });
    const femininas = [
        "francisca", "maria", "camila", "leticia", "letícia", "luciana",
        "vitoria", "vitória", "fernanda", "helena", "helia", "hélia",
        "joana", "ingrid", "female", "feminina", "mulher",
        "google português do brasil", "google portugues do brasil"
    ];
    const masculinas = [
        "daniel", "felipe", "ricardo", "antonio", "antônio", "thiago",
        "paulo", "male", "masculina", "homem"
    ];
    const pontuar = function (voz) {
        const nome = voz.name.toLowerCase();
        const indice = femininas.findIndex(function (preferida) {
            return nome.includes(preferida);
        });
        return indice < 0 ? 999 : indice;
    };
    const candidatas = vozesPortugues
        .filter(function (voz) {
            const nome = voz.name.toLowerCase();
            return !masculinas.some(function (masculina) {
                return nome.includes(masculina);
            }) && femininas.some(function (feminina) {
                return nome.includes(feminina);
            });
        })
        .sort(function (a, b) {
            return pontuar(a) - pontuar(b);
        });

    return {
        professora: candidatas[0] || null,
        estudante: candidatas[1] || candidatas[0] || null
    };
}

function obterBlocosPodcast() {
    if (Array.isArray(estudoGerado.podcastAudio) && estudoGerado.podcastAudio.length) {
        return estudoGerado.podcastAudio
            .filter(function (bloco) {
                return bloco && String(bloco.texto || "").trim();
            })
            .map(function (bloco) {
                return {
                    personagem: String(bloco.personagem || "PROFESSORA").trim(),
                    texto: limparTextoParaAudio(bloco.texto),
                    intencao: String(bloco.intencao || "Conversa guiada").trim()
                };
            });
    }

    const roteiro = limparTextoParaAudio(
        estudoGerado.roteiroAudio || estudoGerado.explicacao || ""
    );

    return dividirRoteiroParaAudio(roteiro).map(function (trecho, indice) {
        return {
            personagem: "PROFESSORA",
            texto: trecho,
            intencao: indice === 0 ? "Abertura" : "Explicação comentada"
        };
    });
}

function limparTextoParaAudio(texto) {
    return String(texto || "")
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizarPapelPodcast(personagem) {
    return /professora|professor|apresentadora/i.test(String(personagem))
        ? "professora"
        : "estudante";
}

function iconeDoPersonagem(personagem) {
    const papel = normalizarPapelPodcast(personagem);
    if (papel === "professora") {
        return "👩‍🏫";
    }
    if (/turma/i.test(String(personagem))) {
        return "👥";
    }
    return "🧑‍🎓";
}

function dividirRoteiroParaAudio(texto) {
    const frases = texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [texto];
    const trechos = [];
    let atual = "";

    frases.forEach(function (frase) {
        if ((atual + " " + frase).length > 420 && atual) {
            trechos.push(atual.trim());
            atual = frase;
        } else {
            atual += " " + frase;
        }
    });

    if (atual.trim()) {
        trechos.push(atual.trim());
    }

    return trechos;
}

/* UPLOADS */

function mostrarUpload() {
    const hoje =
        dataParaCampo(new Date());

    areaMateria.innerHTML = `
        <h2>Uploads</h2>

        <p>
            Adicione fotos, PDFs, exercícios,
            provas antigas ou anotações.
        </p>

        <label for="data-upload">
            Data do material
        </label>

        <input
            id="data-upload"
            type="date"
            value="${hoje}"
        >

        <label for="tipo-upload">
            Tipo do material
        </label>

        <select id="tipo-upload">
            <option value="Anotação">Anotação</option>
            <option value="Exercício">Exercício</option>
            <option value="Prova antiga">Prova antiga</option>
            <option value="Resumo">Resumo</option>
            <option value="Slide">Slide</option>
            <option value="Outro">Outro</option>
        </select>

        <label
            class="botao-upload"
            for="seletor-arquivos"
        >
            📎 Escolher arquivos
        </label>

        <input
            id="seletor-arquivos"
            type="file"
            accept="image/*,.pdf,.txt,.md,.doc,.docx,.ppt,.pptx"
            multiple
            hidden
        >

        <div id="lista-arquivos"></div>
    `;

    document.querySelector(
        "#seletor-arquivos"
    ).addEventListener(
        "change",
        async function (evento) {
            const arquivos =
                Array.from(
                    evento.target.files
                );

            const data =
                document.querySelector(
                    "#data-upload"
                ).value;

            const tipo =
                document.querySelector(
                    "#tipo-upload"
                ).value;

            for (const arquivo of arquivos) {
                let texto = "";
                let arquivoIA = null;

                if (
                    arquivo.type.startsWith("text/") ||
                    arquivo.name.endsWith(".md")
                ) {
                    texto =
                        await arquivo.text();
                }

                if (
                    arquivo.type === "application/pdf" ||
                    arquivo.type.startsWith("image/")
                ) {
                    const preparado = await prepararArquivoEvolucao(
                        arquivo,
                        arquivo.type === "application/pdf" ? "material_pdf" : "foto_da_folha"
                    );

                    arquivoIA = {
                        nome: preparado.nome,
                        mimeType: preparado.mimeType,
                        data: preparado.data,
                        tamanho: preparado.tamanho
                    };

                    texto = arquivo.type === "application/pdf"
                        ? "PDF integral preparado para leitura pela IA."
                        : "Foto da folha preparada para leitura pela IA.";
                }

                uploadsDaSessao.push({
                    materiaId:
                        String(materiaAtual.id),

                    data: data,
                    tipo: tipo,
                    nome: arquivo.name,
                    texto: texto,
                    arquivoIA: arquivoIA
                });
            }

            desenharUploadsDaMateria();
        }
    );

    desenharUploadsDaMateria();
}

function desenharUploadsDaMateria() {
    const lista =
        document.querySelector(
            "#lista-arquivos"
        );

    if (!lista) {
        return;
    }

    const itens = uploadsDaSessao
        .filter(function (upload) {
            return (
                upload.materiaId ===
                String(materiaAtual.id)
            );
        })
        .sort(function (a, b) {
            return b.data.localeCompare(a.data);
        });

    if (itens.length === 0) {
        lista.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum upload adicionado nesta matéria.
            </p>
        `;
        return;
    }

    lista.innerHTML = itens
        .map(function (upload) {
            return `
                <div class="arquivo">
                    <strong>
                        📄 ${protegerTexto(upload.nome)}
                    </strong>

                    <p>
                        ${protegerTexto(upload.tipo)}
                        — ${formatarDataCampo(upload.data)}
                    </p>
                </div>
            `;
        })
        .join("");
}

/* SIMULADO */

async function mostrarSimulado() {
    areaMateria.innerHTML = `
        <section class="caixa configurador-simulado-materia">
            <h2>Simulado de ${protegerTexto(materiaAtual.name)}</h2>
            <p>Escolha como deseja responder. As questões serão criadas somente com os materiais desta matéria.</p>
            <div class="grade-configuracao-simuladao">
                <label>Tipo de questão
                    <select id="modalidade-simulado-materia">
                        <option value="objetiva" selected>Objetivas: marcar alternativa</option>
                        <option value="discursiva">Discursivas: escrever resposta</option>
                        <option value="manual">Lista para fazer à mão</option>
                    </select>
                </label>
                <label>Quantidade de questões
                    <input id="quantidade-simulado-materia" type="number" min="5" max="75" value="10" inputmode="numeric">
                </label>
                <label>Nível
                    <select id="dificuldade-simulado-materia">
                        <option value="gradual" selected>Gradual</option>
                        <option value="reforco">Reforço</option>
                        <option value="desafio">Desafio</option>
                    </select>
                </label>
                <label>Data específica (opcional)
                    <input id="data-simulado-materia" type="date">
                </label>
            </div>
            <button id="criar-simulado-materia" class="botao-principal" type="button">Criar simulado</button>
            <div id="status-simulado-materia" class="status-pesquisa" aria-live="polite"></div>
            <section id="resultado-simulado-materia" class="resultado-simuladao escondido"></section>
        </section>
    `;

    document.querySelector("#criar-simulado-materia").addEventListener(
        "click",
        criarSimuladoDaMateria
    );
}

async function criarSimuladoDaMateria() {
    const status = document.querySelector("#status-simulado-materia");
    const area = document.querySelector("#resultado-simulado-materia");
    const botao = document.querySelector("#criar-simulado-materia");
    const modalidade = document.querySelector("#modalidade-simulado-materia").value;
    const modalidadeIA = modalidade === "manual" ? "discursiva" : modalidade;
    const quantidade = limitarQuantidadeQuestoes(
        document.querySelector("#quantidade-simulado-materia").value
    );
    const dificuldade = document.querySelector("#dificuldade-simulado-materia").value;
    const dataEspecifica = document.querySelector("#data-simulado-materia").value;
    const fim = dataEspecifica || periodoEstudoAtual?.fim || dataParaCampo(new Date());
    const inicioPadrao = new Date(fim + "T12:00:00");
    inicioPadrao.setDate(inicioPadrao.getDate() - 13);
    const inicio = dataEspecifica || periodoEstudoAtual?.inicio || dataParaCampo(inicioPadrao);

    botao.disabled = true;
    area.classList.add("escondido");
    status.textContent = "Lendo os materiais da disciplina...";

    try {
        arquivosPdfParaIA = [];
        const conteudo = await obterConteudoSimuladao([materiaAtual], inicio, fim);
        status.textContent = "Criando " + quantidade + " questões em partes, para manter a qualidade...";
        const dados = await gerarQuestoesEmLotes({
            tipo: "simulado",
            materia: materiaAtual.name,
            titulo: "Simulado de " + materiaAtual.name,
            conteudo: conteudo,
            dificuldade: dificuldade,
            modalidade: modalidadeIA,
            mapaDificuldade: { [materiaAtual.name]: dificuldade }
        }, quantidade);

        if (modalidade === "manual") {
            desenharListaSimuladoParaImprimir(dados, {
                area: area,
                titulo: "Lista de " + materiaAtual.name,
                materias: [materiaAtual.name],
                inicio: inicio,
                fim: fim
            });
        } else {
            desenharSimuladaoInterativo(dados, {
                area: area,
                dias: 14,
                modalidade: modalidade,
                tipoRegistro: "simulado",
                materias: [materiaAtual.name]
            });
        }
        status.textContent = "Simulado pronto. Faça no seu ritmo.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
    }
}

function traduzirErroDaInteligencia(mensagemOriginal) {
    const mensagem =
        String(mensagemOriginal || "");

    if (
        /high demand|spikes in demand|try again later|overloaded|unavailable/i
            .test(mensagem)
    ) {
        return (
            "A inteligência está recebendo muitas solicitações " +
            "neste momento. A Maltéria tentará outro modelo; " +
            "se ainda não funcionar, espere um minuto e tente novamente."
        );
    }

    if (
        /quota|resource exhausted|too many requests|429/i
            .test(mensagem)
    ) {
        return (
            "O limite de solicitações da inteligência foi atingido. " +
            "Espere um minuto e tente novamente."
        );
    }

    if (/api key|chave do gemini/i.test(mensagem)) {
        return (
            "A chave da inteligência precisa ser conferida " +
            "nas configurações do aplicativo."
        );
    }

    return mensagem ||
        "Ocorreu um problema temporário. Tente novamente.";
}
/* PESQUISA INTELIGENTE */

document
    .querySelector("#pesquisar")
    .addEventListener(
        "click",
        pesquisarMateriais
    );

async function pesquisarMateriais() {
    arquivosPdfParaIA = [];

    const materiaEscolhida =
        document.querySelector(
            "#materia-pesquisa"
        ).value;

    const tipoPesquisa =
        document.querySelector(
            "#tipo-pesquisa"
        )?.value || "todos";

    const formatoPesquisa =
        document.querySelector("#formato-pesquisa").value;

    const semData =
        document.querySelector("#pesquisa-sem-data").checked;

    const dataInicial =
        document.querySelector(
            "#data-inicial"
        ).value;

    const dataFinal =
        document.querySelector(
            "#data-final"
        ).value;

    let pergunta =
        document.querySelector(
            "#campo-pesquisa"
        ).value.trim();

    const perguntaFoiDigitada = Boolean(pergunta);

    const botao =
        document.querySelector("#pesquisar");

    const status =
        document.querySelector(
            "#status-pesquisa"
        );

    const areaResposta =
        document.querySelector(
            "#resposta-pesquisa"
        );

    areaResposta.classList.add("escondido");
    areaResposta.innerHTML = "";

    if (!tokenClassroom) {
        status.textContent =
            "Conecte sua conta Google antes de pesquisar.";
        return;
    }

    if (!materiaEscolhida) {
        status.textContent =
            "Escolha uma matéria ou Todas as matérias.";
        return;
    }

    if (!semData && (!dataInicial || !dataFinal)) {
        status.textContent =
            "Escolha a data inicial e a data final.";
        return;
    }

    if (!semData && dataInicial > dataFinal) {
        status.textContent =
            "A data inicial não pode ser posterior à data final.";
        return;
    }

    if (semData && tipoPesquisa === "agenda") {
        status.textContent =
            "Para pesquisar a Agenda, desmarque Sem data e escolha um período.";
        return;
    }

    if (!pergunta) {
        pergunta =
            criarPerguntaAutomatica(tipoPesquisa);
    }

    const turmas =
        materiaEscolhida === "__todas__"
            ? turmasClassroom
            : turmasClassroom.filter(
                function (turma) {
                    return turma.name ===
                        materiaEscolhida;
                }
            );

    if (turmas.length === 0) {
        status.textContent =
            "Nenhuma matéria foi encontrada.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Pesquisando...";

    status.textContent =
        "Lendo o Classroom e o Google Agenda...";

    try {
        const resultados = [];

        for (const turma of turmas) {
            const resultado =
                await obterMateriaisDoPeriodo(
                    turma,
                    semData ? "" : dataInicial,
                    semData ? "" : dataFinal,
                    tipoPesquisa
                );

            resultados.push(resultado);
        }

        let fontes = resultados.flatMap(
            function (resultado) {
                return resultado.fontes;
            }
        );

        let conteudo = resultados
            .map(function (resultado) {
                return resultado.conteudo;
            })
            .join("\n\n");

        if (
            !semData &&
            (
                tipoPesquisa === "todos" ||
                tipoPesquisa === "agenda"
            )
        ) {
            const agenda =
                await obterEventosAgenda(
                    dataInicial,
                    dataFinal
                );

            fontes = fontes.concat(
                agenda.fontes
            );

            conteudo +=
                "\n\n" + agenda.conteudo;
        }

        const uploadsPesquisa = uploadsDaSessao.filter(function (upload) {
            const pertenceMateria =
                materiaEscolhida === "__todas__" ||
                turmas.some(function (turma) {
                    return String(turma.id) === String(upload.materiaId);
                });

            const estaNoPeriodo = semData ||
                (!upload.data ||
                    (upload.data >= dataInicial && upload.data <= dataFinal));

            return pertenceMateria && estaNoPeriodo;
        });

        if (uploadsPesquisa.length > 0) {
            uploadsPesquisa.forEach(function (upload) {
                if (upload.arquivoIA) {
                    adicionarPdfParaIA(upload.arquivoIA);
                }
            });

            conteudo += "\n\nUPLOADS DA MATÉRIA:\n" +
                uploadsPesquisa.map(function (upload) {
                    return (
                        "UPLOAD: " + upload.nome +
                        "\nDATA: " + (upload.data || "Sem data") +
                        "\nCONTEÚDO: " +
                        (upload.texto || "Arquivo enviado pelo aluno")
                    );
                }).join("\n\n");

            fontes = fontes.concat(
                uploadsPesquisa.map(function (upload, indice) {
                    return {
                        chave: "upload-pesquisa-" + indice + "-" + upload.nome,
                        origem: "upload",
                        pendente: false,
                        tipo: "Upload",
                        materia: materiaEscolhida === "__todas__"
                            ? "Material enviado"
                            : materiaEscolhida,
                        titulo: upload.nome,
                        descricao: upload.texto || "",
                        data: upload.data
                            ? new Date(upload.data + "T12:00:00")
                            : new Date(),
                        prazo: null,
                        link: ""
                    };
                })
            );
        }

        const urgentes =
            encontrarAvisosUrgentes(fontes);

        conteudo =
            "TOTAL DE FONTES: " + fontes.length + "\n\n" +
            conteudo;

        status.textContent =
            fontes.length > 0
                ? "A inteligência da MALTÉRIA está analisando os resultados..."
                : "Não achei esse assunto nos materiais. Pesquisando uma explicação externa...";

        const respostaServidor = await fetch(
            ENDERECO_IA,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    tipo: "pesquisa",

                    materia:
                        materiaEscolhida === "__todas__"
                            ? "Todas as matérias"
                            : materiaEscolhida,

                    pergunta: pergunta,
                    formato: formatoPesquisa,
                    semData: semData,
                    dataInicial: semData ? "" : dataInicial,
                    dataFinal: semData ? "" : dataFinal,
                    permitirPesquisaExterna:
                        perguntaFoiDigitada &&
                        (tipoPesquisa === "todos" || tipoPesquisa === "material"),
                    conteudo:
                        conteudo.slice(0, 60000),
                    arquivos: arquivosPdfParaIA
                })
            }
        );

        const dados =
            await respostaServidor.json();

        if (!respostaServidor.ok) {
            throw new Error(
                dados.erro ||
                "A inteligência não conseguiu responder."
            );
        }

        const fontesExternas = Array.isArray(dados.fontes)
            ? dados.fontes.map(function (fonte, indice) {
                return {
                    chave: "fonte-externa-" + indice + "-" + (fonte.url || ""),
                    origem: "google",
                    pendente: false,
                    tipo: "Fonte externa",
                    materia: materiaEscolhida === "__todas__"
                        ? "Pesquisa geral"
                        : materiaEscolhida,
                    titulo: fonte.titulo || "Fonte consultada",
                    descricao: "Resultado usado somente nesta pesquisa.",
                    data: new Date(),
                    prazo: null,
                    link: fonte.url || ""
                };
            }).filter(function (fonte) {
                return Boolean(fonte.link);
            })
            : [];

        const fontesParaExibir = fontes.concat(fontesExternas);

        desenharResultadoPesquisa(
            dados,
            fontesParaExibir,
            urgentes,
            materiaEscolhida === "__todas__"
                ? "Todas as matérias"
                : materiaEscolhida,
            semData ? "" : dataInicial,
            semData ? "" : dataFinal,
            formatoPesquisa
        );

        salvarPesquisaNoHistorico({
            pergunta: pergunta,
            materiaValor: materiaEscolhida,
            materia: materiaEscolhida === "__todas__"
                ? "Todas as matérias"
                : materiaEscolhida,
            tipo: tipoPesquisa,
            formato: formatoPesquisa,
            semData: semData,
            dataInicial: semData ? "" : dataInicial,
            dataFinal: semData ? "" : dataFinal,
            dados: dados,
            fontes: fontesParaExibir
        });

        status.textContent =
            dados.origem === "pesquisa_externa"
                ? "Resposta complementada com pesquisa externa e fontes consultadas."
                : fontes.length +
                    (
                        fontes.length === 1
                            ? " item encontrado."
                            : " itens encontrados."
                    );
    } catch (erro) {
        console.error(erro);
        status.textContent =
            traduzirErroDaInteligencia(
                erro.message
            );
    } finally {
        botao.disabled = false;
        botao.textContent =
            "🔎 Pesquisar nos materiais";
    }
}

/* TRABALHOS ESCOLARES */

function limitesSugeridosDoBimestre(ano, bimestre) {
    const limites = {
        1: ["02-01", "04-30"],
        2: ["05-01", "07-31"],
        3: ["08-01", "09-30"],
        4: ["10-01", "12-20"]
    };
    const periodo = limites[Number(bimestre)] || limites[1];
    return {
        inicio: ano + "-" + periodo[0],
        fim: ano + "-" + periodo[1]
    };
}

function bimestreSugeridoParaData(data) {
    const mes = data.getMonth() + 1;
    if (mes <= 4) return 1;
    if (mes <= 7) return 2;
    if (mes <= 9) return 3;
    return 4;
}

function atualizarDatasSugeridasDosTrabalhos() {
    const ano = Number(document.querySelector("#ano-trabalhos").value) || new Date().getFullYear();
    const bimestre = Number(document.querySelector("#bimestre-trabalhos").value) || 1;
    const limites = limitesSugeridosDoBimestre(ano, bimestre);
    document.querySelector("#inicio-trabalhos").value = limites.inicio;
    document.querySelector("#fim-trabalhos").value = limites.fim;
}

function prepararPaginaTrabalhos() {
    const campoAno = document.querySelector("#ano-trabalhos");
    const campoBimestre = document.querySelector("#bimestre-trabalhos");
    if (!campoAno.value) {
        const hoje = new Date();
        campoAno.value = hoje.getFullYear();
        campoBimestre.value = String(bimestreSugeridoParaData(hoje));
        atualizarDatasSugeridasDosTrabalhos();
    }
}

function itemPareceTrabalhoEscolar(item) {
    const texto = normalizarPesquisa(
        (item.titulo || item.title || item.summary || "") + " " +
        (item.descricao || item.description || "") + " " +
        (item.tipo || "")
    );
    return /trabalho|projeto|seminario|apresentacao|pesquisa|maquete|cartaz|producao|portfolio|relatorio/.test(texto);
}

function textoFonteTrabalho(item) {
    return [
        "FONTE: " + (item.origem === "agenda" ? "Google Agenda" : "Google Classroom"),
        "MATÉRIA: " + (item.materia || "Não identificada"),
        "TÍTULO: " + (item.titulo || "Sem título"),
        "TIPO: " + (item.tipo || "Trabalho"),
        "DATA OU PRAZO: " + formatarDataPesquisa(item.prazo || item.data),
        "DESCRIÇÃO: " + (item.descricao || "Não informada"),
        "SITUAÇÃO NO CLASSROOM: " + (item.pendente ? "Pendente" : "Sem pendência confirmada")
    ].join("\n");
}

function trabalhoBrutoDaFonte(item) {
    return {
        titulo: item.titulo || "Trabalho sem título",
        materia: item.materia || "Não identificada",
        tipo: item.tipo || "Trabalho",
        dataEntrega: item.prazo || item.data ? formatarDataPesquisa(item.prazo || item.data) : "Não informada",
        conteudoCobrado: "Consulte a descrição e os anexos do professor.",
        oQueFazer: item.descricao || "Instruções não informadas.",
        situacao: item.pendente ? "Pendente" : "Verificar no Classroom",
        evidencia: item.origem === "agenda" ? "Google Agenda" : "Google Classroom",
        link: item.link || ""
    };
}

function encontrarLinkDoTrabalho(trabalho, fontes) {
    const titulo = normalizarPesquisa(trabalho.titulo || "");
    const fonte = fontes.find(function (item) {
        const tituloFonte = normalizarPesquisa(item.titulo || "");
        return titulo && (tituloFonte.includes(titulo) || titulo.includes(tituloFonte));
    });
    return fonte && fonte.link || "";
}

function desenharTabelaTrabalhos(dados, fontes, periodo) {
    const area = document.querySelector("#resultado-trabalhos");
    const trabalhos = Array.isArray(dados.trabalhos) ? dados.trabalhos : [];
    if (!trabalhos.length) {
        area.innerHTML =
            "<div class=\"vazio-trabalhos\"><span>🔎</span><h2>Nenhum trabalho identificado</h2>" +
            "<p>Não encontrei evidência de trabalhos nesse período. Confira as datas ou veja se o Classroom está conectado.</p></div>";
        area.classList.remove("escondido");
        return;
    }

    const linhas = trabalhos.map(function (trabalho) {
        const link = trabalho.link || encontrarLinkDoTrabalho(trabalho, fontes);
        return "<tr>" +
            "<td><strong>" + protegerTexto(trabalho.titulo || "Trabalho") + "</strong><small>" + protegerTexto(trabalho.tipo || "Trabalho") + "</small></td>" +
            "<td>" + protegerTexto(trabalho.materia || "Não identificada") + "</td>" +
            "<td>" + protegerTexto(trabalho.dataEntrega || "Não informada") + "</td>" +
            "<td>" + protegerTexto(trabalho.conteudoCobrado || "Não informado") + "</td>" +
            "<td>" + protegerTexto(trabalho.oQueFazer || "Não informado") + "</td>" +
            "<td><span class=\"situacao-trabalho\">" + protegerTexto(trabalho.situacao || "Verificar") + "</span>" +
            (link ? "<a href=\"" + protegerTexto(link) + "\" target=\"_blank\" rel=\"noopener\">Abrir fonte</a>" : "") + "</td>" +
        "</tr>";
    }).join("");

    area.innerHTML =
        "<div class=\"resumo-trabalhos\"><div><small>VISÃO DO BIMESTRE</small><h2>" + trabalhos.length +
        (trabalhos.length === 1 ? " trabalho encontrado" : " trabalhos encontrados") + "</h2></div>" +
        "<p>" + protegerTexto(dados.resumo || ("Período de " + periodo.inicio + " até " + periodo.fim + ".")) + "</p></div>" +
        "<div class=\"tabela-trabalhos-rolagem\"><table class=\"tabela-trabalhos\"><thead><tr>" +
        "<th>Trabalho</th><th>Matéria</th><th>Entrega</th><th>O que vai cair</th><th>O que fazer</th><th>Situação</th>" +
        "</tr></thead><tbody>" + linhas + "</tbody></table></div>" +
        "<p class=\"nota-trabalhos\">A Maltéria organiza apenas o que encontrou nas fontes. Confirme instruções importantes diretamente com a escola.</p>";
    area.classList.remove("escondido");
}

async function atualizarTrabalhosDoBimestre() {
    const botao = document.querySelector("#atualizar-trabalhos");
    const status = document.querySelector("#status-trabalhos");
    const area = document.querySelector("#resultado-trabalhos");
    const inicio = document.querySelector("#inicio-trabalhos").value;
    const fim = document.querySelector("#fim-trabalhos").value;
    const bimestre = document.querySelector("#bimestre-trabalhos").value;

    if (!inicio || !fim || inicio > fim) {
        status.textContent = "Confira as datas de início e fim do bimestre.";
        return;
    }
    if (!tokenClassroom || !turmasClassroom.length) {
        status.textContent = "Conecte a conta escolar ao Classroom antes de procurar os trabalhos.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Lendo o bimestre...";
    status.textContent = "Procurando trabalhos no Classroom, nos anexos e na Agenda...";
    area.classList.add("escondido");
    try {
        const resultadosClassroom = await Promise.all(turmasClassroom.map(async function (turma) {
            try {
                return await obterMateriaisDoPeriodo(turma, inicio, fim, "trabalho");
            } catch (erro) {
                console.warn("Trabalhos não carregados em " + turma.name, erro);
                return { conteudo: "", fontes: [] };
            }
        }));
        let agenda = { conteudo: "", fontes: [] };
        try {
            agenda = await obterEventosAgenda(inicio, fim);
        } catch (erroAgenda) {
            console.warn("A Agenda não pôde ser consultada; continuando com o Classroom.", erroAgenda);
        }
        const fontes = resultadosClassroom.flatMap(function (resultado) { return resultado.fontes; })
            .concat(agenda.fontes.filter(function (item) {
                return item.calendarioEscolar && itemPareceTrabalhoEscolar(item);
            }));
        const fontesUnicas = Array.from(new Map(fontes.map(function (item) {
            return [item.chave, item];
        })).values());

        if (!fontesUnicas.length) {
            desenharTabelaTrabalhos({ trabalhos: [] }, [], { inicio: inicio, fim: fim });
            status.textContent = "Busca concluída sem trabalhos identificados.";
            return;
        }

        const conteudo = fontesUnicas.map(textoFonteTrabalho).join("\n\n");
        let dados;
        try {
            const resposta = await fetch(ENDERECO_IA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "trabalhos_bimestre",
                    materia: "Todas as matérias",
                    titulo: bimestre + "º bimestre",
                    dataInicio: inicio,
                    dataFinal: fim,
                    conteudo: conteudo
                })
            });
            dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.erro || "A IA não conseguiu organizar os trabalhos.");
        } catch (erroIA) {
            console.warn("Tabela inteligente indisponível; mostrando fontes encontradas.", erroIA);
            dados = {
                resumo: "A inteligência não pôde completar a interpretação, mas estas fontes foram identificadas no período.",
                trabalhos: fontesUnicas.map(trabalhoBrutoDaFonte)
            };
        }
        desenharTabelaTrabalhos(dados, fontesUnicas, { inicio: inicio, fim: fim });
        status.textContent = "Tabela atualizada com dados do período selecionado.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message || "Não foi possível localizar os trabalhos.");
    } finally {
        botao.disabled = false;
        botao.textContent = "✨ Identificar trabalhos do bimestre";
    }
}

document.querySelector("#bimestre-trabalhos").addEventListener("change", atualizarDatasSugeridasDosTrabalhos);
document.querySelector("#ano-trabalhos").addEventListener("change", atualizarDatasSugeridasDosTrabalhos);
document.querySelector("#atualizar-trabalhos").addEventListener("click", atualizarTrabalhosDoBimestre);

/* OFICINA DE REDAÇÃO */

function materiasDeRedacaoDisponiveis() {
    const turmas = Array.isArray(turmasClassroom) ? turmasClassroom : [];
    const redacao = turmas.filter(function (turma) {
        const nome = normalizarPesquisa(turma.name || "");
        return /redacao|producao textual|oficina de texto/.test(nome);
    });

    if (redacao.length) return redacao;

    return turmas.filter(function (turma) {
        const nome = normalizarPesquisa(turma.name || "");
        return /lingua portuguesa|portugues/.test(nome);
    });
}

function preencherMateriasRedacao() {
    const seletor = document.querySelector("#materia-redacao");
    if (!seletor) return;

    const valorAnterior = seletor.value;
    const materias = materiasDeRedacaoDisponiveis();

    if (!materias.length) {
        seletor.innerHTML = '<option value="">Conecte o Classroom para localizar Redação</option>';
        return;
    }

    seletor.innerHTML = materias.map(function (turma) {
        return '<option value="' + protegerTexto(String(turma.id)) + '">' +
            protegerTexto(turma.name) + '</option>';
    }).join("");

    if (materias.some(function (turma) { return String(turma.id) === valorAnterior; })) {
        seletor.value = valorAnterior;
    }
}

function preencherMateriasCorrecao() {
    const seletor = document.querySelector("#materia-correcao-dever");
    if (!seletor) return;

    const valorAnterior = seletor.value;
    const materias = Array.isArray(turmasClassroom) ? turmasClassroom : [];

    if (!materias.length) {
        seletor.innerHTML = '<option value="">Conecte o Classroom para escolher a matéria</option>';
        return;
    }

    seletor.innerHTML = '<option value="">Escolha uma matéria</option>' +
        materias.map(function (turma) {
            return '<option value="' + protegerTexto(String(turma.id)) + '">' +
                protegerTexto(turma.name) + '</option>';
        }).join("");

    if (materias.some(function (turma) { return String(turma.id) === valorAnterior; })) {
        seletor.value = valorAnterior;
    }
}

function periodoDaPropostaRedacao() {
    const modo = document.querySelector("#modo-periodo-redacao").value;
    const hoje = new Date();

    if (modo === "data") {
        const data = document.querySelector("#data-redacao").value;
        return data ? { inicio: data, fim: data } : null;
    }

    const dias = Number(modo) || 14;
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - dias + 1);
    return {
        inicio: dataParaCampo(inicio),
        fim: dataParaCampo(hoje)
    };
}

async function gerarPropostaRedacao() {
    const materiaId = document.querySelector("#materia-redacao").value;
    const genero = document.querySelector("#genero-redacao").value;
    const status = document.querySelector("#status-redacao");
    const area = document.querySelector("#resultado-redacao");
    const botao = document.querySelector("#gerar-proposta-redacao");
    const periodo = periodoDaPropostaRedacao();
    const turma = materiasDeRedacaoDisponiveis().find(function (item) {
        return String(item.id) === String(materiaId);
    });

    area.classList.add("escondido");
    area.innerHTML = "";

    if (!tokenClassroom) {
        status.textContent = "Conecte a conta escolar ao Classroom primeiro.";
        return;
    }
    if (!turma) {
        status.textContent = "Não encontrei a matéria de Redação nessa conta.";
        return;
    }
    if (!periodo) {
        status.textContent = "Escolha a data da aula que deseja usar.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Lendo as folhas de Redação...";
    status.textContent = "Procurando materiais e atividades da matéria escolhida...";
    arquivosPdfParaIA = [];

    try {
        const resultado = await obterMateriaisDoPeriodo(
            turma,
            periodo.inicio,
            periodo.fim,
            "todos"
        );

        if (!resultado.fontes.length && !resultado.conteudo.trim()) {
            throw new Error("Não encontrei folhas ou atividades de Redação nesse período.");
        }

        const generoPedido = genero === "automatico"
            ? "Identifique nos materiais qual gênero textual está sendo estudado."
            : "O gênero obrigatório é " + genero + ".";

        const pergunta = [
            "Analise os materiais de Redação fornecidos.",
            generoPedido,
            "Crie UMA proposta inédita de redação no mesmo nível e estilo das folhas da escola.",
            "Não escreva a redação pelo aluno e não forneça um texto pronto.",
            "Organize a resposta nestas partes: gênero identificado, tema, situação de escrita, instruções, elementos obrigatórios, tamanho sugerido e lista de conferência.",
            "Se for fábula, peça personagens, conflito, desfecho e moral, respeitando o que estiver nas folhas.",
            "Use linguagem clara para uma criança, mas mantenha o nível de exigência da escola."
        ].join(" ");

        status.textContent = "Criando uma proposta baseada no que foi estudado...";
        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "pesquisa",
                materia: turma.name,
                pergunta: pergunta,
                formato: "texto",
                semData: false,
                dataInicial: periodo.inicio,
                dataFinal: periodo.fim,
                conteudo: resultado.conteudo.slice(0, 60000),
                arquivos: arquivosPdfParaIA
            })
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível criar a proposta.");
        }

        area.innerHTML =
            '<div class="proposta-redacao-topo"><span>✍️</span><div><small>PROPOSTA CRIADA A PARTIR DAS AULAS</small><h2>' +
            protegerTexto(turma.name) +
            '</h2><p>' + protegerTexto(formatarDataCampo(periodo.inicio)) +
            (periodo.inicio === periodo.fim ? "" : " até " + protegerTexto(formatarDataCampo(periodo.fim))) +
            '</p></div></div><div class="texto-proposta-redacao">' +
            formatarTexto(dados.resposta || "A proposta não foi retornada.") +
            '</div><p class="lembrete-redacao">💡 A Maltéria cria o desafio; a redação é escrita por você.</p>';
        area.classList.remove("escondido");
        status.textContent = resultado.fontes.length +
            (resultado.fontes.length === 1 ? " material usado." : " materiais usados.");
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = "✨ Criar proposta de redação";
    }
}

const modoPeriodoRedacao = document.querySelector("#modo-periodo-redacao");
if (modoPeriodoRedacao) {
    modoPeriodoRedacao.addEventListener("change", function () {
        document.querySelector("#campo-data-redacao").classList.toggle(
            "escondido",
            modoPeriodoRedacao.value !== "data"
        );
    });
}

const dataRedacao = document.querySelector("#data-redacao");
if (dataRedacao && !dataRedacao.value) dataRedacao.value = dataParaCampo(new Date());

document
    .querySelector("#gerar-proposta-redacao")
    .addEventListener("click", gerarPropostaRedacao);

/* HISTÓRICO DE PESQUISAS */

async function corrigirRedacao() {
    const texto = document.querySelector("#texto-correcao-redacao").value.trim();
    const arquivo = document.querySelector("#arquivo-correcao-redacao").files[0];
    const status = document.querySelector("#status-correcao-redacao");
    const area = document.querySelector("#resultado-correcao-redacao");
    const botao = document.querySelector("#corrigir-redacao");

    if (!texto && !arquivo) {
        status.textContent = "Digite a redação ou envie uma foto/PDF.";
        return;
    }

    botao.disabled = true;
    area.classList.add("escondido");
    status.textContent = "Lendo sua redação com atenção...";

    try {
        const arquivos = arquivo
            ? [await prepararArquivoEvolucao(arquivo, "redacao")]
            : [];
        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "pesquisa",
                materia: "Redação",
                formato: "texto",
                semData: true,
                pergunta: [
                    "Atue como uma professora de Redação cuidadosa e adequada para uma criança.",
                    "Corrija a redação enviada sem humilhar e sem inventar critérios que não aparecem no texto.",
                    "Organize em: resumo do que entendeu; pontos fortes; ortografia e pontuação; organização das ideias; adequação ao gênero; trechos que precisam melhorar; sugestões práticas; proposta de reescrita.",
                    "Mostre exemplos curtos de correção, mas não substitua todo o texto do aluno.",
                    "Ao final, apresente uma lista de conferência para a reescrita."
                ].join(" "),
                conteudo: texto,
                arquivos: arquivos
            })
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Não foi possível corrigir a redação.");

        area.innerHTML = `
            <div class="proposta-redacao-topo"><span>📝</span><div><small>CORREÇÃO DA MALTÉRIA</small><h2>Orientações para sua reescrita</h2></div></div>
            <div class="texto-proposta-redacao">${formatarTexto(dados.resposta || "A correção não foi retornada.")}</div>
        `;
        area.classList.remove("escondido");
        status.textContent = "Correção concluída. Leia as orientações e faça sua própria reescrita.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
    }
}

document.querySelector("#corrigir-redacao").addEventListener("click", corrigirRedacao);

async function corrigirDeverDoAluno() {
    const seletor = document.querySelector("#materia-correcao-dever");
    const arquivosSelecionados = Array.from(
        document.querySelector("#arquivos-correcao-dever").files || []
    ).slice(0, 6);
    const observacao = document.querySelector("#observacao-correcao-dever").value.trim();
    const status = document.querySelector("#status-correcao-dever");
    const area = document.querySelector("#resultado-correcao-dever");
    const botao = document.querySelector("#corrigir-dever");
    const turma = turmasClassroom.find(function (item) {
        return String(item.id) === String(seletor.value);
    });

    if (!turma) {
        status.textContent = "Escolha a matéria do dever.";
        return;
    }

    if (!arquivosSelecionados.length) {
        status.textContent = "Envie pelo menos uma foto ou um PDF do dever.";
        return;
    }

    botao.disabled = true;
    area.classList.add("escondido");
    status.textContent = "Lendo o dever e conferindo cada resposta...";

    try {
        const arquivos = [];
        for (const arquivo of arquivosSelecionados) {
            arquivos.push(await prepararArquivoEvolucao(arquivo, "dever-de-casa"));
        }

        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "pesquisa",
                materia: turma.name,
                formato: "texto",
                semData: true,
                pergunta: [
                    "Atue como uma professora cuidadosa corrigindo um dever de casa enviado por uma criança.",
                    "Leia somente o que estiver visível nos arquivos. Não invente enunciados, respostas nem gabaritos.",
                    "Analise exercício por exercício e organize em: número ou identificação; resposta encontrada; resultado (certo, precisa revisar ou não foi possível ler); explicação; como corrigir.",
                    "Quando não houver informação suficiente para confirmar uma resposta, diga claramente que é preciso conferir com o enunciado ou material da escola.",
                    "Não entregue apenas a resposta final: explique o raciocínio em linguagem adequada à criança.",
                    "Ao final, apresente: total identificado, acertos confirmados, itens para revisar e próximos passos.",
                    observacao ? "Pedido do aluno: " + observacao : "Confira todo o dever enviado."
                ].join(" "),
                conteudo: "Dever de casa enviado para correção na matéria " + turma.name + ".",
                arquivos: arquivos
            })
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível corrigir o dever.");
        }

        area.innerHTML = `
            <div class="topo-correcao-dever">
                <span>✅</span>
                <div><small>CORREÇÃO DA MALTÉRIA</small><h2>${protegerTexto(turma.name)}</h2></div>
            </div>
            <div class="texto-correcao-dever">${formatarTexto(dados.resposta || "A correção não foi retornada.")}</div>
            <p class="aviso-correcao-dever">Confira orientações importantes com o professor ou com seu responsável.</p>
        `;
        area.classList.remove("escondido");
        status.textContent = "Correção concluída. Revise os itens indicados antes de entregar.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
    }
}

document.querySelector("#corrigir-dever").addEventListener("click", corrigirDeverDoAluno);
document.querySelector("#fechar-correcao").addEventListener("click", mostrarPaginaPrincipal);
document.querySelector("#fechar-gabaritos").addEventListener("click", mostrarPaginaPrincipal);

function chaveHistoricoPesquisas() {
    const conta = usuarioAtual?.email
        ? normalizarEmail(usuarioAtual.email)
        : "visitante";

    return "malteriaHistoricoPesquisas:" + conta;
}

function lerHistoricoPesquisas() {
    try {
        const historico = JSON.parse(
            localStorage.getItem(chaveHistoricoPesquisas()) || "[]"
        );

        return Array.isArray(historico) ? historico : [];
    } catch (erro) {
        return [];
    }
}

function prepararFonteParaHistorico(fonte) {
    return {
        chave: fonte.chave || "",
        origem: fonte.origem || "",
        pendente: fonte.pendente === true,
        tipo: fonte.tipo || "Material",
        materia: fonte.materia || "",
        titulo: fonte.titulo || "Material sem título",
        data: fonte.data ? new Date(fonte.data).toISOString() : null,
        prazo: fonte.prazo ? new Date(fonte.prazo).toISOString() : null,
        link: fonte.link || ""
    };
}

function restaurarFonteDoHistorico(fonte) {
    return {
        ...fonte,
        data: fonte.data ? new Date(fonte.data) : new Date(),
        prazo: fonte.prazo ? new Date(fonte.prazo) : null
    };
}

function salvarPesquisaNoHistorico(pesquisa) {
    const registro = {
        id: "pesquisa-" + Date.now(),
        criadoEm: new Date().toISOString(),
        ...pesquisa,
        fontes: pesquisa.fontes.map(prepararFonteParaHistorico)
    };

    let historico = [registro, ...lerHistoricoPesquisas()].slice(0, 20);

    try {
        localStorage.setItem(
            chaveHistoricoPesquisas(),
            JSON.stringify(historico)
        );
    } catch (erro) {
        historico = historico.slice(0, 8);
        localStorage.setItem(
            chaveHistoricoPesquisas(),
            JSON.stringify(historico)
        );
    }

    desenharHistoricoPesquisas();
}

function desenharHistoricoPesquisas() {
    const lista = document.querySelector("#lista-historico-pesquisas");
    if (!lista) return;

    const historico = lerHistoricoPesquisas();

    if (historico.length === 0) {
        lista.innerHTML = '<p class="historico-vazio">Suas pesquisas aparecerão aqui.</p>';
        return;
    }

    lista.innerHTML = historico.map(function (pesquisa) {
        const titulo = pesquisa.pergunta || "Pesquisa sem título";
        const data = new Date(pesquisa.criadoEm).toLocaleDateString(
            "pt-BR",
            { day: "2-digit", month: "2-digit" }
        );

        return `
            <button class="item-historico-pesquisa" type="button" data-pesquisa-id="${protegerTexto(pesquisa.id)}">
                <span>${protegerTexto(titulo)}</span>
                <small>${protegerTexto(pesquisa.materia || "Matéria")} · ${data}</small>
            </button>
        `;
    }).join("");

    lista.querySelectorAll("[data-pesquisa-id]").forEach(function (botao) {
        botao.addEventListener("click", function () {
            abrirPesquisaDoHistorico(botao.dataset.pesquisaId);
        });
    });
}

function abrirPesquisaDoHistorico(id) {
    const pesquisa = lerHistoricoPesquisas().find(function (item) {
        return item.id === id;
    });

    if (!pesquisa) return;

    abrirPainelPesquisa();

    const materia = document.querySelector("#materia-pesquisa");
    const materiaExiste = Array.from(materia.options).some(function (opcao) {
        return opcao.value === pesquisa.materiaValor;
    });

    materia.value = materiaExiste ? pesquisa.materiaValor : "__todas__";
    document.querySelector("#campo-pesquisa").value = pesquisa.pergunta || "";
    document.querySelector("#formato-pesquisa").value = pesquisa.formato || "texto";

    const tipo = document.querySelector("#tipo-pesquisa");
    if (tipo) tipo.value = pesquisa.tipo || "todos";

    const semData = document.querySelector("#pesquisa-sem-data");
    semData.checked = pesquisa.semData === true;
    semData.dispatchEvent(new Event("change"));

    if (!semData.checked) {
        document.querySelector("#data-inicial").value = pesquisa.dataInicial || "";
        document.querySelector("#data-final").value = pesquisa.dataFinal || "";
    }

    const fontes = (pesquisa.fontes || []).map(restaurarFonteDoHistorico);

    desenharResultadoPesquisa(
        pesquisa.dados || { resposta: "Resposta não disponível." },
        fontes,
        encontrarAvisosUrgentes(fontes),
        pesquisa.materia || "Pesquisa salva",
        pesquisa.dataInicial || "",
        pesquisa.dataFinal || "",
        pesquisa.formato || "texto"
    );

    document.querySelector("#status-pesquisa").textContent =
        "Pesquisa salva em " +
        new Date(pesquisa.criadoEm).toLocaleString("pt-BR") + ".";
}

function criarPerguntaAutomatica(tipo) {
    const perguntas = {
        todos:
            "Mostre e explique tudo o que aconteceu nesse período.",

        dever:
            "Mostre todos os deveres de casa desse período.",

        prova:
            "Mostre todas as provas e avaliações desse período.",

        trabalho:
            "Mostre todos os trabalhos e projetos desse período.",

        exercicio:
            "Mostre todos os exercícios e listas desse período.",

        material:
            "Resuma os materiais e aulas publicados nesse período.",

        agenda:
            "Mostre os compromissos e eventos do Google Agenda nesse período."
    };

    return perguntas[tipo] || perguntas.todos;
}

async function obterMateriaisDoPeriodo(
    turma,
    dataInicial,
    dataFinal,
    filtro
) {
    const semData = !dataInicial || !dataFinal;

    const inicio = semData
        ? null
        : new Date(dataInicial + "T00:00:00");

    const fim = semData
        ? null
        : new Date(dataFinal + "T23:59:59");

    const respostas = await Promise.all([
        chamarClassroom(
            "courses/" +
            turma.id +
            "/courseWork?pageSize=100"
        ),

        chamarClassroom(
            "courses/" +
            turma.id +
            "/courseWorkMaterials?pageSize=100"
        ),

        chamarClassroom(
            "courses/" +
            turma.id +
            "/courseWork/-/studentSubmissions" +
            "?userId=me&pageSize=100"
        )
    ]);

    const atividades =
        respostas[0].courseWork || [];

    const materiais =
        respostas[1].courseWorkMaterial || [];

    const envios =
        respostas[2].studentSubmissions || [];

    const enviosPorAtividade =
        new Map(
            envios.map(function (envio) {
                return [
                    envio.courseWorkId,
                    envio
                ];
            })
        );

    const itens = [];

    atividades.forEach(function (atividade) {
        const data =
            obterDataDoItem(atividade);

        const tipo =
            identificarTipoAtividade(
                atividade
            );

        if (
            (semData || dataEstaNoPeriodo(data, inicio, fim)) &&
            tipoCombinaComFiltro(tipo, filtro)
        ) {
            itens.push({
                chave:
                    "classroom-" +
                    turma.id +
                    "-" +
                    atividade.id,

                origem: "classroom",

                pendente:
                    envioEstaPendente(
                        enviosPorAtividade.get(
                            atividade.id
                        )
                    ),

                tipo: tipo,
                materia: turma.name,

                titulo:
                    atividade.title ||
                    "Atividade sem título",

                descricao:
                    atividade.description || "",

                data: data,
                prazo: data,

                materiais:
                    atividade.materials || [],

                link:
                    atividade.alternateLink || ""
            });
        }
    });

    materiais.forEach(function (material) {
            const data =
                obterDataDoItem(material);

            const tipoDetectado =
                identificarTipoAtividade(
                    material
                );

            const tipo =
                tipoDetectado === "Atividade"
                    ? "Material"
                    : tipoDetectado;

            if (
                (semData || dataEstaNoPeriodo(
                    data,
                    inicio,
                    fim
                )) &&
                (
                    filtro === "todos" ||
                    filtro === "material" ||
                    tipoCombinaComFiltro(
                        tipo,
                        filtro
                    )
                )
            ) {
                itens.push({
                    chave:
                        "material-" +
                        turma.id +
                        "-" +
                        material.id,

                    origem: "classroom",
                    pendente: false,

                    tipo: tipo,
                    materia: turma.name,

                    titulo:
                        material.title ||
                        "Material sem título",

                    descricao:
                        material.description || "",

                    data: data,
                    prazo: null,

                    materiais:
                        material.materials || [],

                    link:
                        material.alternateLink || ""
                });
            }
        });

    itens.sort(function (a, b) {
        return a.data - b.data;
    });

    let conteudo =
        "MATÉRIA: " +
        turma.name +
        "\nABRANGÊNCIA: " +
        (semData
            ? "Todos os materiais disponíveis da matéria"
            : dataInicial + " até " + dataFinal) +
        "\n";

    const anexos = [];

    itens.forEach(function (item) {
        conteudo +=
            "\nTIPO: " + item.tipo +
            "\nTÍTULO: " + item.titulo +
            "\nDATA: " +
            formatarDataPesquisa(item.data) +
            "\nDESCRIÇÃO: " +
            item.descricao +
            "\n";

        recolherAnexos(
            item.materiais,
            anexos
        );
    });

    const anexosUnicos = Array.from(
        new Map(
            anexos.map(function (anexo) {
                return [anexo.id, anexo];
            })
        ).values()
    );

    for (
        const anexo of anexosUnicos.slice(0, 15)
    ) {
        try {
            const textoArquivo =
                await lerArquivoDoDrive(
                    anexo.id
                );

            conteudo +=
                "\nARQUIVO: " +
                anexo.nome +
                "\nCONTEÚDO:\n" +
                textoArquivo +
                "\n";
        } catch (erro) {
            console.warn(
                "Não foi possível ler:",
                anexo.nome,
                erro
            );
        }
    }

    return {
        conteudo: conteudo,
        fontes: itens
    };
}

function tipoCombinaComFiltro(
    tipo,
    filtro
) {
    if (filtro === "todos") {
        return true;
    }

    const valor = normalizarPesquisa(tipo);

    if (filtro === "dever") {
        return valor.includes("dever");
    }

    if (filtro === "prova") {
        return (
            valor.includes("prova") ||
            valor.includes("avalia") ||
            valor.includes("teste") ||
            valor.includes("quiz") ||
            valor.includes("exame") ||
            valor.includes("verificacao") ||
            valor.includes("simulado") ||
            valor.includes("recuperacao")
        );
    }

    if (filtro === "trabalho") {
        return (
            valor.includes("trabalho") ||
            valor.includes("projeto") ||
            valor.includes("seminario") ||
            valor.includes("apresentacao")
        );
    }

    if (filtro === "exercicio") {
        return (
            valor.includes("exercicio") ||
            valor.includes("lista") ||
            valor.includes("questionario") ||
            valor.includes("pratica")
        );
    }

    return false;
}

async function buscarTodosOsItensDoGoogleAgenda(enderecoBase) {
    const itens = [];
    let tokenDaPagina = "";

    do {
        const endereco = new URL(enderecoBase);
        if (tokenDaPagina) endereco.searchParams.set("pageToken", tokenDaPagina);

        const resposta = await fetch(endereco.toString(), {
            headers: { Authorization: "Bearer " + tokenClassroom }
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error?.message || "Não foi possível consultar o Google Agenda."
            );
        }

        itens.push(...(dados.items || []));
        tokenDaPagina = dados.nextPageToken || "";
    } while (tokenDaPagina);

    return itens;
}

async function obterEventosAgenda(
    dataInicial,
    dataFinal
) {
    const emailGoogleConectado =
        obterEmailGoogleConectado();

    const inicio =
        new Date(
            dataInicial + "T00:00:00"
        ).toISOString();

    const fim =
        new Date(
            dataFinal + "T23:59:59"
        ).toISOString();

    const calendarios = await buscarTodosOsItensDoGoogleAgenda(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList" +
        "?minAccessRole=reader&maxResults=250&showHidden=true"
    );

    const fontes = [];

    for (
        const calendario of calendarios
    ) {
        const endereco =
            "https://www.googleapis.com/calendar/v3/calendars/" +
            encodeURIComponent(calendario.id) +
            "/events" +
            "?singleEvents=true" +
            "&orderBy=startTime" +
            "&maxResults=2500" +
            "&timeMin=" +
            encodeURIComponent(inicio) +
            "&timeMax=" +
            encodeURIComponent(fim);

        let eventosDoCalendario = [];
        try {
            eventosDoCalendario = await buscarTodosOsItensDoGoogleAgenda(endereco);
        } catch (erro) {
            console.warn(
                "Agenda não carregada:",
                calendario.summary,
                erro
            );
            continue;
        }

        eventosDoCalendario.forEach(
            function (evento) {
                const inicioEvento =
                    evento.start?.dateTime ||
                    evento.start?.date;

                if (!inicioEvento) {
                    return;
                }

                // Datas de eventos de dia inteiro chegam como AAAA-MM-DD.
                // Criá-las diretamente com new Date() usa UTC e, no Brasil,
                // pode deslocar o evento para o dia anterior.
                const dataEvento = evento.start?.date
                    ? new Date(evento.start.date + "T12:00:00")
                    : new Date(inicioEvento);

                fontes.push({
                    chave:
                        "agenda-" +
                        calendario.id +
                        "-" +
                        evento.id,

                    origem: "agenda",
                    pendente: false,

                    tipo:
                        "Evento da agenda",

                    materia:
                        limparNomeDoCalendario(
                            calendario.summary || "",
                            calendario.id || ""
                        ),

                    titulo:
                        evento.summary ||
                        "Evento sem título",

                    descricao:
                        limparDescricaoDaAgenda(
                            evento.description || ""
                        ),

                    data:
                        dataEvento,

                    prazo:
                        dataEvento,

                    link:
                        criarLinkDaAgendaEscolar(
                            evento.htmlLink || "",
                            emailGoogleConectado
                        ),

                    emailGoogle:
                        emailGoogleConectado,

                    calendarioId:
                        calendario.id || "",

                    calendarioOriginal:
                        calendario.summary || "",

                    calendarioEscolar:
                        calendarioDaAgendaPareceEscolar(calendario)
                });
            }
        );
    }

    const conteudo = fontes
        .map(function (item) {
            return (
                "AGENDA: " +
                item.materia +
                "\nEVENTO: " +
                item.titulo +
                "\nDATA: " +
                formatarDataPesquisa(
                    item.data
                ) +
                "\nDESCRIÇÃO: " +
                item.descricao
            );
        })
        .join("\n\n");

    return {
        conteudo: conteudo,
        fontes: fontes
    };
}

function obterEmailGoogleConectado() {
    const conexaoSalva = lerConexaoClassroom();

    return normalizarEmail(
        usuarioAtual?.emailGoogleVerificado ||
        conexaoSalva?.emailGoogle ||
        ""
    );
}

function criarLinkDaAgendaEscolar(linkOriginal, emailGoogle) {
    if (!linkOriginal) {
        return "";
    }

    try {
        const endereco = new URL(linkOriginal);

        if (emailGoogle) {
            endereco.searchParams.set(
                "authuser",
                emailGoogle
            );
        }

        return endereco.toString();
    } catch (erro) {
        return linkOriginal;
    }
}

function limparDescricaoDaAgenda(valor) {
    if (!valor) {
        return "";
    }

    const htmlComQuebras = String(valor)
        .replace(/<br\s*\/?\s*>/gi, "\n")
        .replace(/<\/(p|div|li|tr|h[1-6]|table)>/gi, "\n");

    const documento = new DOMParser().parseFromString(
        htmlComQuebras,
        "text/html"
    );

    documento
        .querySelectorAll("script, style")
        .forEach(function (elemento) {
            elemento.remove();
        });

    return (documento.body.textContent || "")
        .replace(/\u00a0/g, " ")
        /* Metadados acrescentados por cópias e sincronizações do Google. */
        .replace(/\[\s*copiado\s+de[^\]]*\]/gi, "")
        .replace(/#SYNC:[^\r\n]*/gi, "")
        .replace(/^\s*(?:sync|source|calendar)[-_:=][^\r\n]*(?:\r?\n|$)/gim, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n")
        .trim();
}

function limparNomeDoCalendario(nome, identificador) {
    const valor = String(nome || "").trim();
    const id = String(identificador || "").trim();
    const pareceEmailTecnico =
        /^[^\s@]+@(?:group\.calendar\.google\.com|google\.com)$/i.test(valor) ||
        /^[^\s@]+@(?:group\.calendar\.google\.com|google\.com)$/i.test(id);
    const pareceContaEscolar =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(valor);

    if (!valor || pareceEmailTecnico || pareceContaEscolar) {
        return "Agenda escolar";
    }

    return valor
        .replace(/\s*\[copiado[^\]]*\]\s*/gi, " ")
        .trim() || "Agenda escolar";
}

function obterDataDoItem(item) {
    if (item.dueDate) {
        return new Date(
            item.dueDate.year,
            item.dueDate.month - 1,
            item.dueDate.day
        );
    }

    const texto =
        item.updateTime ||
        item.creationTime ||
        item.scheduledTime;

    return texto
        ? new Date(texto)
        : null;
}

function dataEstaNoPeriodo(
    data,
    inicio,
    fim
) {
    return Boolean(
        data &&
        !Number.isNaN(data.getTime()) &&
        data >= inicio &&
        data <= fim
    );
}

function identificarTipoAtividade(item) {
    const nomesAnexos = (item.materials || [])
        .map(function (material) {
            return (
                material.form?.title ||
                material.driveFile?.driveFile?.title ||
                material.link?.title ||
                material.youtubeVideo?.title ||
                ""
            );
        })
        .join(" ");

    const texto = normalizarPesquisa(
        (item.title || "") + " " +
        (item.description || "") + " " +
        (item.gradeCategory?.name || "") + " " +
        nomesAnexos
    );

    if (
        texto.includes("prova") ||
        texto.includes("avaliacao") ||
        texto.includes("teste") ||
        texto.includes("quiz") ||
        texto.includes("exame") ||
        texto.includes("verificacao") ||
        texto.includes("simulado") ||
        texto.includes("recuperacao") ||
        texto.includes("segunda chamada") ||
        texto.includes("trimestral") ||
        texto.includes("bimestral") ||
        /(^|\s)(av|ap|p)\s*[-_.]?\s*[1-9](\s|$)/.test(texto)
    ) {
        return "Prova e avaliação";
    }

    if (
        texto.includes("dever") ||
        texto.includes("para casa") ||
        texto.includes("tarefa de casa")
    ) {
        return "Dever de casa";
    }

    if (
        texto.includes("exercicio") ||
        texto.includes("lista") ||
        texto.includes("questionario") ||
        texto.includes("pratica")
    ) {
        return "Exercício";
    }

    if (
        texto.includes("trabalho") ||
        texto.includes("projeto") ||
        texto.includes("seminario") ||
        texto.includes("apresentacao") ||
        texto.includes("pesquisa")
    ) {
        return "Trabalho";
    }

    return "Atividade";
}

function normalizarPesquisa(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function envioEstaPendente(envio) {
    if (!envio) {
        return false;
    }

    return [
        "NEW",
        "CREATED",
        "RECLAIMED_BY_STUDENT",
        "STUDENT_EDITED_AFTER_TURN_IN"
    ].includes(envio.state);
}

function encontrarAvisosUrgentes(fontes) {
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const depoisDeAmanha =
        new Date(hoje);

    depoisDeAmanha.setDate(
        depoisDeAmanha.getDate() + 2
    );

    return fontes.filter(
        function (fonte) {
            return Boolean(
                fonte.origem === "classroom" &&
                fonte.pendente === true &&
                fonte.prazo &&
                fonte.prazo <
                    depoisDeAmanha
            );
        }
    );
}

function desenharResultadoPesquisa(
    dados,
    fontes,
    urgentes,
    materia,
    dataInicial,
    dataFinal,
    formato
) {
    const area =
        document.querySelector(
            "#resposta-pesquisa"
        );

    const concluidos =
        carregarItensConcluidos();

    const avisos = urgentes.length
        ? `
            <details class="avisos-urgentes detalhes-finais">
                <summary>
                    🚨 ${urgentes.length}
                    ${urgentes.length === 1
                        ? "aviso urgente"
                        : "avisos urgentes"}
                </summary>

                <div class="conteudo-detalhes">
                    ${urgentes.map(function (item) {
                        const hoje = new Date();
                        hoje.setHours(0, 0, 0, 0);

                        const atrasado =
                            item.prazo < hoje;

                        return `
                            <div class="aviso-urgente">
                                <strong>
                                    ${atrasado
                                        ? "ATRASADO"
                                        : "PRAZO PRÓXIMO"}:
                                    ${protegerTexto(item.titulo)}
                                </strong>

                                <span>
                                    ${protegerTexto(item.materia)}
                                    — ${formatarDataPesquisa(item.prazo)}
                                </span>
                            </div>
                        `;
                    }).join("")}
                </div>
            </details>
        `
        : "";

    const lista = fontes
        .map(function (fonte) {
            const marcado =
                Boolean(
                    concluidos[fonte.chave]
                );

            return `
                <article class="resultado-item ${marcado ? "concluido" : ""}">
                    <label class="marcar-concluido">
                        <input
                            type="checkbox"
                            data-concluir="${protegerTexto(fonte.chave)}"
                            ${marcado ? "checked" : ""}
                        >

                        <span>Marcar como concluído</span>
                    </label>

                    <strong>
                        ${protegerTexto(fonte.tipo)}:
                        ${protegerTexto(fonte.titulo)}
                    </strong>

                    <p>
                        ${protegerTexto(fonte.materia)}
                        — ${formatarDataPesquisa(fonte.data)}
                    </p>

                    ${fonte.link
                        ? `
                            <a
                                href="${fonte.link}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Abrir no Google
                            </a>
                        `
                        : ""}
                </article>
            `;
        })
        .join("");

    area.innerHTML = `
        <div class="cabecalho-resultado">
            <span>✨ Resposta da MALTÉRIA</span>

            <h2>${protegerTexto(materia)}</h2>

            <p>${dataInicial && dataFinal
                ? formatarDataCampo(dataInicial) + " até " + formatarDataCampo(dataFinal)
                : "Todos os materiais disponíveis da matéria"}
            </p>
        </div>

        <article class="resposta-ia">
            ${formato === "slides" && Array.isArray(dados.slides)
                ? renderizarSlidesDaPesquisa(dados.slides)
                : formato === "tabela" && dados.tabela
                    ? renderizarTabelaDaPesquisa(dados.tabela)
                    : formatarTexto(dados.resposta)}
        </article>

        <details class="detalhes-finais">
            <summary>
                Ler mais: ver ${fontes.length}
                ${fontes.length === 1
                    ? "item encontrado"
                    : "itens encontrados"}
            </summary>

            <section class="lista-resultados">
                ${lista}
            </section>
        </details>

        ${avisos}
    `;

    area
        .querySelectorAll("[data-concluir]")
        .forEach(function (campo) {
            campo.addEventListener(
                "change",
                function () {
                    salvarItemConcluido(
                        campo.dataset.concluir,
                        campo.checked
                    );

                    campo
                        .closest(".resultado-item")
                        .classList.toggle(
                            "concluido",
                            campo.checked
                        );
                }
            );
        });

    area.classList.remove("escondido");

    area.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function renderizarSlidesDaPesquisa(slides) {
    return `
        <div class="slides-pesquisa">
            ${slides.map(function (slide, indice) {
                return `
                    <section class="slide-pesquisa">
                        <small>SLIDE ${indice + 1}</small>
                        <h3>${protegerTexto(slide.titulo || "")}</h3>
                        <ul>
                            ${(slide.pontos || []).map(function (ponto) {
                                return `<li>${protegerTexto(ponto)}</li>`;
                            }).join("")}
                        </ul>
                    </section>
                `;
            }).join("")}
        </div>
    `;
}

function renderizarTabelaDaPesquisa(tabela) {
    const colunas = Array.isArray(tabela.colunas)
        ? tabela.colunas
        : [];
    const linhas = Array.isArray(tabela.linhas)
        ? tabela.linhas
        : [];

    if (colunas.length === 0) {
        return formatarTexto(tabela.titulo || "Não foi possível montar a tabela.");
    }

    return `
        <section class="tabela-pesquisa-container">
            <h3>${protegerTexto(tabela.titulo || "Tabela da pesquisa")}</h3>
            <div class="tabela-pesquisa-rolagem">
                <table class="tabela-pesquisa">
                    <thead>
                        <tr>
                            ${colunas.map(function (coluna) {
                                return `<th>${protegerTexto(coluna)}</th>`;
                            }).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${linhas.map(function (linha) {
                            const celulas = Array.isArray(linha.celulas)
                                ? linha.celulas
                                : [];

                            return `
                                <tr>
                                    ${colunas.map(function (_, indice) {
                                        return `<td>${protegerTexto(celulas[indice] || "—")}</td>`;
                                    }).join("")}
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function carregarItensConcluidos() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "malteriaItensConcluidos"
            )
        ) || {};
    } catch (erro) {
        return {};
    }
}

function salvarItemConcluido(
    chave,
    concluido
) {
    const itens =
        carregarItensConcluidos();

    if (concluido) {
        itens[chave] = true;
    } else {
        delete itens[chave];
    }

    localStorage.setItem(
        "malteriaItensConcluidos",
        JSON.stringify(itens)
    );
}

function formatarDataPesquisa(data) {
    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function formatarDataCampo(data) {
    const partes = data.split("-");

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}

/* GOOGLE CLASSROOM */

const botaoClassroom = document.querySelector(
    "#conectar-classroom"
);

const statusClassroom = document.querySelector(
    "#status-classroom"
);

const cartaoClassroom = document.querySelector(
    "#cartao-classroom"
);

const textoClassroom = document.querySelector(
    "#texto-classroom"
);

botaoClassroom.addEventListener(
    "click",
    conectarClassroom
);

function chaveConexaoClassroom() {
    const contaEscolar = contaEscolarClassroomAtual();
    const email = normalizarPesquisa(
        contaEscolar.email || usuarioAtual?.email || "sem-conta"
    );

    return "malteriaClassroom:" + email;
}

function salvarConexaoClassroom() {
    if (!usuarioAtual) {
        return;
    }

    const contaEscolar = contaEscolarClassroomAtual();
    const filho = filhoSelecionadoAtual();
    const emailGoogleConectado = normalizarEmail(
        filho?.emailGoogleVerificado ||
        usuarioAtual.emailGoogleVerificado ||
        contaEscolar.email
    );

    localStorage.setItem(
        chaveConexaoClassroom(),
        JSON.stringify({
            conectado: true,
            turmas: turmasClassroom,
            nomeAluno: contaEscolar.nome,
            emailGoogle: emailGoogleConectado,
            atualizadoEm: new Date().toISOString()
        })
    );
}

function lerConexaoClassroom() {
    try {
        return JSON.parse(
            localStorage.getItem(
                chaveConexaoClassroom()
            )
        );
    } catch (erro) {
        return null;
    }
}

function desenharTurmasClassroom(turmas) {
    const materiasReais = turmas.map(
        function (turma) {
            return {
                id: turma.id,
                name: turma.name,
                icon: "🎓",

                descricao:
                    turma.section ||
                    "Google Classroom"
            };
        }
    );

    desenharMaterias(materiasReais);
    preencherMateriasRedacao();
    preencherMateriasCorrecao();

    if (usuarioAtual?.email) {
        try {
            const ultima = JSON.parse(
                localStorage.getItem("malteriaUltimaMateria:" + normalizarEmail(usuarioAtual.email)) || "null"
            );
            const encontrada = materiasReais.find(function (materia) {
                return String(materia.id) === String(ultima?.id);
            });
            if (encontrada) materiaAtual = encontrada;
        } catch (erro) {
            localStorage.removeItem("malteriaUltimaMateria:" + normalizarEmail(usuarioAtual.email));
        }
    }
}

function prepararClienteClassroom() {
    if (clienteClassroom) {
        return true;
    }

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.oauth2
    ) {
        return false;
    }

    clienteClassroom =
        google.accounts.oauth2.initTokenClient({
            client_id:
                CLIENT_ID_CLASSROOM,

            scope:
                ESCOPOS_CLASSROOM,

            callback:
                receberTokenClassroom,

            error_callback:
                function (erroGoogle) {
                    if (tentativaSilenciosaClassroom) {
                        statusClassroom.textContent =
                            "Sua conta foi lembrada, mas o Google " +
                            "pediu uma nova autorização.";

                        textoClassroom.textContent =
                            "Reconectar ao Classroom";
                    } else {
                        statusClassroom.textContent =
                            erroGoogle?.type === "popup_failed_to_open"
                                ? "O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente."
                                : "O Google bloqueou ou cancelou a autorização. " +
                                  "Durante os testes, o e-mail da criança precisa estar na lista de testadores; " +
                                  "contas escolares também podem exigir liberação pela administração da escola.";

                        textoClassroom.textContent =
                            "Tentar conectar novamente";
                    }

                    tentativaSilenciosaClassroom = false;

                    cartaoClassroom.classList.remove(
                        "carregando"
                    );
                }
        });

    return true;
}

async function restaurarConexaoClassroom() {
    tokenClassroom = "";
    clienteClassroom = null;
    atividadesPorTurma = {};

    cartaoClassroom.classList.remove(
        "conectado",
        "carregando"
    );

    textoClassroom.textContent =
        "Conectar ao Classroom";

    statusClassroom.textContent = "";

    const conexaoSalva =
        lerConexaoClassroom();

    if (!conexaoSalva?.conectado) {
        turmasClassroom = [];
        desenharMaterias(materiasDemonstracao);
        return;
    }

    turmasClassroom =
        conexaoSalva.turmas || [];

    if (turmasClassroom.length > 0) {
        desenharTurmasClassroom(
            turmasClassroom
        );
    }

    cartaoClassroom.classList.add("conectado");
    textoClassroom.textContent =
        "Atualizar Classroom";
    statusClassroom.textContent =
        turmasClassroom.length > 0
            ? turmasClassroom.length +
              (turmasClassroom.length === 1
                  ? " turma lembrada. Clique para atualizar."
                  : " turmas lembradas. Clique para atualizar.")
            : "Conta escolar lembrada. Clique para atualizar.";

    tentarRenovarClassroomSilenciosamente();
}

function tentarRenovarClassroomSilenciosamente(tentativa = 0) {
    if (!usuarioAtual || tokenClassroom || tentativa > 6) return;

    if (!prepararClienteClassroom()) {
        setTimeout(function () {
            tentarRenovarClassroomSilenciosamente(tentativa + 1);
        }, 700);
        return;
    }

    tentativaSilenciosaClassroom = true;
    try {
        clienteClassroom.requestAccessToken({ prompt: "" });
    } catch (erro) {
        tentativaSilenciosaClassroom = false;
        textoClassroom.textContent = "Reconectar ao Classroom";
    }
}

function conectarClassroom() {
    tentativaSilenciosaClassroom = false;

    if (!prepararClienteClassroom()) {
        statusClassroom.textContent =
            "O Google ainda está carregando. " +
            "Aguarde e tente novamente.";

        return;
    }

    textoClassroom.textContent =
        "Abrindo o Google...";

    cartaoClassroom.classList.add("carregando");

    try {
        clienteClassroom.requestAccessToken({
            prompt: "select_account"
        });
    } catch (erro) {
        cartaoClassroom.classList.remove("carregando");
        textoClassroom.textContent =
            "Tentar conectar novamente";
        statusClassroom.textContent =
            "Não foi possível abrir o Google. Clique novamente.";
    }
}

async function receberTokenClassroom(resposta) {
    tentativaSilenciosaClassroom = false;

    if (resposta.error) {
        statusClassroom.textContent =
            "O Google não autorizou o acesso.";

        textoClassroom.textContent =
            "Conectar ao Classroom";

        cartaoClassroom.classList.remove(
            "carregando"
        );

        return;
    }

    tokenClassroom = resposta.access_token;

    textoClassroom.textContent =
        "Classroom conectado";

    cartaoClassroom.classList.remove("carregando");
    cartaoClassroom.classList.add("conectado");

    statusClassroom.textContent =
        "Classroom conectado. Confirmando a conta...";

    try {
        await confirmarIdentidadeGoogle();

        statusClassroom.textContent =
            "Conta confirmada. Carregando turmas...";

        await carregarTurmas();
    } catch (erro) {
        tokenClassroom = "";
        cartaoClassroom.classList.remove("conectado", "carregando");
        textoClassroom.textContent = "Tentar conectar novamente";
        statusClassroom.textContent = erro.message;
    }
}

async function confirmarIdentidadeGoogle() {
    if (!tokenClassroom || !usuarioAtual) {
        return;
    }

    try {
        const resposta = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization:
                        "Bearer " + tokenClassroom
                }
            }
        );

        if (!resposta.ok) {
            throw new Error(
                "O Google não confirmou a identidade."
            );
        }

        const identidade = await resposta.json();
        const emailGoogle = normalizarEmail(
            identidade.email
        );
        const contaEscolar = contaEscolarClassroomAtual();
        const emailDaConta = contaEscolar.email;

        if (identidade.email_verified !== true || !emailGoogle) {
            throw new Error("O Google não confirmou o e-mail desta conta.");
        }

        const filho = filhoSelecionadoAtual();
        if (filho) {
            filho.emailGoogleVerificado = emailGoogle;
            filho.identidadeGoogleVerificada = true;
        } else {
            usuarioAtual.emailGoogleVerificado = emailGoogle;
            usuarioAtual.identidadeGoogleVerificada = true;
        }

        salvarUsuarioLocal(usuarioAtual);

        usuarioAtual.administrador =
            usuarioEhDono(usuarioAtual);

        document.querySelector(
            "#abrir-administracao"
        ).classList.toggle(
            "escondido",
            !usuarioAtual.administrador
        );

        atualizarDescricaoDaConta();
        atualizarSeletorModuloDono();

        if (
            emailDaConta === EMAIL_DONO_MALTERIA &&
            !usuarioAtual.administrador
        ) {
            statusClassroom.textContent =
                "Para liberar a Super administração, " +
                "conecte a conta Google pepimalti@gmail.com.";
        }
    } catch (erro) {
        const filho = filhoSelecionadoAtual();
        if (filho) {
            filho.identidadeGoogleVerificada = false;
        } else {
            usuarioAtual.identidadeGoogleVerificada = false;
        }
        salvarUsuarioLocal(usuarioAtual);
        throw erro;
    }
}

async function chamarClassroom(caminho) {
    const resposta = await fetch(
        "https://classroom.googleapis.com/v1/" +
        caminho,
        {
            headers: {
                Authorization:
                    "Bearer " + tokenClassroom
            }
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.error?.message ||
            "Erro no Google Classroom."
        );
    }

    return dados;
}

async function chamarClassroomPaginado(caminho, propriedade) {
    const itens = [];
    let tokenDaPagina = "";

    do {
        const separador = caminho.includes("?") ? "&" : "?";
        const caminhoDaPagina = tokenDaPagina
            ? caminho + separador + "pageToken=" + encodeURIComponent(tokenDaPagina)
            : caminho;
        const dados = await chamarClassroom(caminhoDaPagina);
        itens.push(...(Array.isArray(dados[propriedade]) ? dados[propriedade] : []));
        tokenDaPagina = dados.nextPageToken || "";
    } while (tokenDaPagina);

    return itens;
}

async function carregarTurmas() {
    try {
        const dados = await chamarClassroom(
            "courses" +
            "?courseStates=ACTIVE" +
            "&studentId=me" +
            "&pageSize=100"
        );

        turmasClassroom =
            dados.courses || [];

        if (turmasClassroom.length === 0) {
            statusClassroom.textContent =
                "A conta foi conectada, mas nenhuma " +
                "turma ativa foi encontrada.";

            textoClassroom.textContent =
                "Nenhuma turma encontrada";

            salvarConexaoClassroom();

            await carregarAtividadesDaData();

            return;
        }

        desenharTurmasClassroom(
            turmasClassroom
        );

        salvarConexaoClassroom();

        statusClassroom.textContent =
            turmasClassroom.length +
            (
                turmasClassroom.length === 1
                    ? " turma carregada."
                    : " turmas carregadas."
            );

        textoClassroom.textContent =
            turmasClassroom.length +
            (
                turmasClassroom.length === 1
                    ? " turma conectada"
                    : " turmas conectadas"
            );

        await carregarAtividadesDaData();
    } catch (erro) {
        statusClassroom.textContent =
            "A conta foi lembrada, mas é preciso " +
            "reconectar para atualizar os materiais.";

        textoClassroom.textContent =
            "Reconectar ao Classroom";

        cartaoClassroom.classList.remove(
            "carregando"
        );
    }
}

/* RELATÓRIO DO RESPONSÁVEL */

const dataRelatorioResponsavel =
    document.querySelector("#data-relatorio-responsavel");

const dataReferenciaRelatorioResponsavel =
    document.querySelector("#data-referencia-relatorio-responsavel");

const arquivoHorarioOficial =
    document.querySelector("#arquivo-horario-oficial");

const botaoAnalisarHorarioOficial =
    document.querySelector("#analisar-horario-oficial");

const statusHorarioOficial =
    document.querySelector("#status-horario-oficial");

document
    .querySelector("#atualizar-relatorio-responsavel")
    .addEventListener("click", carregarRelatorioResponsavel);

if (botaoAnalisarHorarioOficial) {
    botaoAnalisarHorarioOficial.addEventListener("click", analisarHorarioOficial);
}

async function analisarHorarioOficial() {
    const arquivo = arquivoHorarioOficial?.files?.[0];
    if (!arquivo) {
        statusHorarioOficial.textContent = "Escolha a foto ou o PDF oficial do horário.";
        return;
    }

    const turma = identificarTurmaCompletaParaHorario();
    if (!turma) {
        statusHorarioOficial.textContent =
            "Conecte o Classroom primeiro para a Maltéria identificar a turma do aluno.";
        return;
    }

    botaoAnalisarHorarioOficial.disabled = true;
    botaoAnalisarHorarioOficial.textContent = "Lendo horário...";
    statusHorarioOficial.textContent =
        "Conferindo somente a coluna da turma " + turma + " no documento oficial...";

    try {
        const preparado = await prepararArquivoEvolucao(arquivo, "horario-oficial");
        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "interpretar_horario",
                materia: "Horário escolar",
                turma: turma,
                conteudo: "Documento oficial do horário semanal da escola.",
                arquivos: [preparado]
            })
        });
        const dados = await resposta.json().catch(function () { return {}; });
        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível ler o horário.");
        }

        const horario = dados.horarioEncontrado === true
            ? normalizarHorarioSemanalConfiavel(dados.horarioSemanal)
            : [];
        if (!horario.length) {
            throw new Error(
                dados.observacao ||
                "A coluna da turma " + turma + " não foi identificada no documento."
            );
        }

        salvarHorarioSemanalResponsavel(horario);
        statusHorarioOficial.textContent =
            "Horário oficial da turma " +
            (dados.turmaIdentificada || turma) +
            " salvo para este aluno.";
        await carregarRelatorioResponsavel();
    } catch (erro) {
        console.error(erro);
        statusHorarioOficial.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botaoAnalisarHorarioOficial.disabled = false;
        botaoAnalisarHorarioOficial.textContent = "Usar esta imagem como horário oficial";
    }
}

function prepararRelatorioResponsavel() {
    dataReferenciaRelatorioResponsavel.value = dataParaCampo(new Date());

    if (!dataRelatorioResponsavel.value) {
        dataRelatorioResponsavel.value = dataParaCampo(proximoDiaLetivo(new Date()));
    }
}

function proximoDiaLetivo(data) {
    const proximo = new Date(data);
    do {
        proximo.setDate(proximo.getDate() + 1);
    } while (proximo.getDay() === 0 || proximo.getDay() === 6);
    return proximo;
}

async function carregarRelatorioResponsavel(configuracao = {}) {
    if (configuracao instanceof Event) configuracao = {};
    prepararRelatorioResponsavel();

    const status = configuracao.statusElement || document.querySelector("#status-relatorio-responsavel");
    const area = configuracao.areaElement || document.querySelector("#resultado-relatorio-responsavel");
    const botao = configuracao.buttonElement === null
        ? null
        : document.querySelector("#atualizar-relatorio-responsavel");
    const dataAlvo = configuracao.dataAlvo || dataRelatorioResponsavel.value;
    const dataReferencia = configuracao.dataReferencia || dataReferenciaRelatorioResponsavel.value;
    const horizonte = configuracao.horizonte || document.querySelector("#horizonte-relatorio-responsavel").value;
    // Janela retroativa completa: termina na data-alvo e volta exatamente
    // a quantidade de dias escolhida, mesmo quando a consulta ocorre meses depois.
    const dias = Math.max(14, Math.min(56, Number(horizonte) || 14));

    if (!tokenClassroom) {
        status.textContent = "Conecte a conta Google do aluno para consultar a Agenda e o Classroom.";
        return;
    }

    if (!dataAlvo || !dataReferencia) {
        status.textContent = "Escolha a data para a qual deseja consultar os deveres.";
        return;
    }

    // A janela deve voltar a partir da data que será preparada, e não
    // a partir do dia em que a consulta está sendo feita. Exemplo:
    // 8 semanas para 08/05 consulta março-maio, mesmo que hoje seja julho.
    const inicio = new Date(dataAlvo + "T12:00:00");
    inicio.setDate(inicio.getDate() - dias);
    const dataInicio = dataParaCampo(inicio);
    const dataFimConsulta = dataAlvo;
    const descricaoJanelaCompleta =
        dias + " dias: " +
        dataInicio.split("-").reverse().join("/") + " até " +
        dataFimConsulta.split("-").reverse().join("/");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Atualizando...";
    }
    status.textContent = "Relendo avisos antigos da Agenda e procurando o horário de aulas...";
    area.classList.add("escondido");
    arquivosPdfParaIA = [];

    try {
        status.textContent = "Consultando a janela completa de " + descricaoJanelaCompleta + "...";
        const agenda = await obterEventosAgenda(dataInicio, dataFimConsulta);
        const turmaPrincipal = identificarTurmaPrincipalDoAluno();
        const eventosEscolares = agenda.fontes
            .filter(eventoDaAgendaPareceEscolar)
            .filter(function (evento) {
                return eventoPertenceATurma(evento, turmaPrincipal);
            });
        // Somente um horário lido do documento oficial ou confirmado e salvo
        // para este aluno pode ser usado. A frequência dos eventos da Agenda
        // não representa a grade de aulas e não é uma fonte confiável.
        const horarioSalvo = normalizarHorarioSemanalConfiavel(
            lerHorarioSemanalResponsavel()
        );
        const horarioBase = horarioSalvo;
        const contextoClassroom = await obterContextoResponsavelClassroom(
            dataInicio,
            dataFimConsulta,
            horarioBase
        );
        const entregasLocaisAgenda = eventosEscolares
            .map(function (item) {
                return criarEntregaLocalDaAgenda(item, dataAlvo, horarioBase);
            })
            .filter(Boolean);
        const entregasLocais = entregasLocaisAgenda.concat(
            Array.isArray(contextoClassroom.entregas)
                ? contextoClassroom.entregas
                : []
        );
        const avisosLocais = eventosEscolares
            .map(function (item) {
                return criarAvisoLocalDaAgenda(item, dataAlvo);
            })
            .filter(Boolean);

        const conteudoAgenda = eventosEscolares.map(function (item) {
            return (
                "REGISTRO DA AGENDA\n" +
                "Data em que aparece: " + dataParaCampo(item.data) + "\n" +
                "Dia da semana do registro: " + nomeDoDiaDaSemana(item.data) + "\n" +
                "Calendário/matéria: " + item.materia + "\n" +
                "Nome original do calendário: " +
                    (item.calendarioOriginal || item.materia) + "\n" +
                "Título: " + item.titulo + "\n" +
                "Descrição: " + (item.descricao || "Sem descrição") + "\n" +
                "Pista de prazo calculada no navegador: " +
                    pistaLocalDeEntrega(item)
            );
        }).join("\n\n");

        const turmasOficiais = turmasClassroom.filter(function (turma) {
            return !turmaPrincipal || nomePertenceATurma(turma.name, turmaPrincipal);
        }).map(function (turma) {
            return turma.name + (turma.section ? " — " + turma.section : "");
        }).join(" | ");

        status.textContent = "Interpretando as datas reais de entrega...";

        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "relatorio_responsavel",
                materia: "Agenda escolar do aluno",
                dataInicio: dataInicio,
                dataReferencia: dataReferencia,
                dataAlvo: dataAlvo,
                conteudo: (
                    "=== DATAS DA CONSULTA ===\n" +
                    "Dia em que o responsável está: " + dataReferencia +
                    " (" + nomeDoDiaDaSemana(new Date(dataReferencia + "T12:00:00")) + ")\n" +
                    "Dia que deseja preparar: " + dataAlvo +
                    " (" + nomeDoDiaDaSemana(new Date(dataAlvo + "T12:00:00")) + ")\n"
                ),
                agenda: conteudoAgenda,
                classroom: contextoClassroom.texto,
                entregasConfirmadas: entregasLocais,
                horarioSemanal: horarioBase,
                turmasOficiais:
                    (turmasOficiais || "Nenhuma turma oficial carregada.") +
                    "\nTurma principal identificada: " +
                    (turmaPrincipal || "não identificada"),
                arquivos: arquivosPdfParaIA
            })
        });

        const respostaDados = await resposta.json().catch(function () { return {}; });
        const dados = resposta.ok ? respostaDados : {
            resumo: "Relatório montado diretamente com os dados confirmados da Agenda e do Classroom.",
            entregas: [],
            avisos: [],
            horarioSemanal: horarioSalvo,
            horarioEncontrado: horarioSalvo.length > 0
        };

        // O relatório não tem permissão para inventar ou reescrever a grade.
        // Somente o leitor explícito da foto/PDF oficial salva o horário.
        const horarioLidoDoClassroom =
            contextoClassroom.documentoHorarioEncontrado === true &&
            dados.horarioEncontrado === true
                ? normalizarHorarioSemanalConfiavel(dados.horarioSemanal)
                : [];
        const horarioConfirmado = horarioSalvo.length
            ? horarioSalvo
            : horarioLidoDoClassroom;

        if (!horarioSalvo.length && horarioLidoDoClassroom.length) {
            salvarHorarioSemanalResponsavel(horarioLidoDoClassroom);
        }

        // Na primeira leitura, o documento oficial pode ter acabado de ser
        // interpretado pela IA. Recalcula então os avisos "para casa" e
        // "próxima aula" usando esse horário, ainda na mesma consulta.
        const entregasRecalculadas = horarioConfirmado.length
            ? eventosEscolares.map(function (item) {
                return criarEntregaLocalDaAgenda(item, dataAlvo, horarioConfirmado);
            }).filter(Boolean)
            : [];

        incorporarEntregasLocaisNoRelatorio(
            dados,
            entregasLocais.concat(entregasRecalculadas)
        );

        dados.horarioEncontrado = horarioConfirmado.length > 0;
        dados.horarioSemanal = horarioConfirmado;

        normalizarRelatorioEscolar(dados, {
            dataAlvo: dataAlvo,
            horarioSalvo: horarioConfirmado,
            avisosLocais: avisosLocais
        });

        desenharRelatorioResponsavel(
            dados,
            dataAlvo,
            dataInicio,
            dataReferencia,
            area
        );
        let mensagemAtualizacao =
            "Relatório atualizado às " +
            new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) +
            ".";
        if (configuracao.enviarEmail === true) {
            const resultadoEmail = await enviarEmailDeveresAmanha(dados, dataAlvo);
            if (resultadoEmail.enviado) {
                mensagemAtualizacao += " O resumo também foi enviado ao e-mail do responsável.";
            } else if (resultadoEmail.motivo === "ja-enviado") {
                mensagemAtualizacao += " Este mesmo resumo já havia sido enviado por e-mail.";
            } else if (resultadoEmail.motivo === "sem-entregas") {
                mensagemAtualizacao += " Nenhum e-mail foi enviado porque não há entregas confirmadas.";
            } else if (resultadoEmail.erro) {
                mensagemAtualizacao += " Relatório pronto; e-mail pendente: " + resultadoEmail.erro;
            }
        }
        status.textContent = mensagemAtualizacao;
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
        if (configuracao.areaElement) {
            area.innerHTML = '<p class="erro">' +
                protegerTexto(traduzirErroDaInteligencia(erro.message)) +
                '</p>';
            area.classList.remove("escondido");
        }
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "↻ Atualizar relatório";
        }
    }
}

async function enviarEmailDeveresAmanha(dados, dataAlvo) {
    const podeReceberResumo =
        usuarioAtual?.tipo === "Responsável" ||
        usuarioEhDono(usuarioAtual);
    if (!podeReceberResumo || perfilVisualAtual() !== "responsavel") {
        return { enviado: false };
    }
    if (!window.MalteriaBanco?.configurado) {
        return { enviado: false, erro: "banco de dados não configurado" };
    }
    try {
        const token = await window.MalteriaBanco.tokenAcesso();
        if (!token) return { enviado: false, erro: "entre novamente na conta" };
        const resposta = await fetch("/api/lembrete-amanha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                dataAlvo: dataAlvo,
                entregas: Array.isArray(dados?.entregas) ? dados.entregas : [],
                avisos: Array.isArray(dados?.avisos) ? dados.avisos : [],
                semAula: dados?.semAula === true
            })
        });
        const resultado = await resposta.json().catch(function () { return {}; });
        if (!resposta.ok) {
            return { enviado: false, erro: resultado.erro || "falha no serviço de e-mail" };
        }
        return resultado;
    } catch (erro) {
        console.error("E-mail do relatório:", erro);
        return { enviado: false, erro: erro.message || "falha no envio" };
    }
}

function chaveHorarioSemanalResponsavel() {
    const filho = filhoSelecionadoAtual();
    const identificador = normalizarEmail(
        filho?.email || usuarioAtual?.email || "aluno-atual"
    );
    const conta = normalizarEmail(usuarioAtual?.email || "sem-conta");
    // v3 ignora grades que uma versão anterior permitia que o relatório
    // reescrevesse. Agora somente a leitura explícita do PDF/foto pode salvar.
    return "malteriaHorarioSemanal:v3:" + conta + ":" + identificador;
}

function lerHorarioSemanalResponsavel() {
    try {
        const horario = JSON.parse(
            localStorage.getItem(chaveHorarioSemanalResponsavel()) || "[]"
        );
        return Array.isArray(horario) ? horario : [];
    } catch (erro) {
        return [];
    }
}

function salvarHorarioSemanalResponsavel(horario) {
    localStorage.setItem(
        chaveHorarioSemanalResponsavel(),
        JSON.stringify(horario)
    );
}

function normalizarHorarioSemanalConfiavel(horario) {
    if (!Array.isArray(horario)) return [];
    const porDia = new Map();

    horario.forEach(function (entrada) {
        const dia = String(entrada?.dia || "").trim();
        const indiceDia = indiceDoDiaDaSemana(dia);
        if (indiceDia < 1 || indiceDia > 5) return;

        if (!porDia.has(indiceDia)) {
            porDia.set(indiceDia, { dia: dia, aulas: [] });
        }

        const aulas = porDia.get(indiceDia).aulas;
        (Array.isArray(entrada.aulas) ? entrada.aulas : []).forEach(function (aula) {
            const nome = String(aula || "").trim();
            const normalizado = normalizarPesquisa(nome);
            if (!nome || !normalizado) return;
            if (
                normalizado.includes("agenda escolar") ||
                normalizado === "agenda" ||
                normalizado.includes("recreio") ||
                normalizado.includes("intervalo")
            ) return;
            if (!aulas.some(function (existente) {
                return nomesDeMateriaCompativeis(existente, nome);
            })) aulas.push(nome);
        });

    });

    return Array.from(porDia.entries())
        .sort(function (a, b) { return a[0] - b[0]; })
        .map(function (item) { return item[1]; })
        .filter(function (entrada) { return entrada.aulas.length > 0; });
}

function nomeDoDiaDaSemana(data) {
    return new Date(data).toLocaleDateString(
        "pt-BR",
        { weekday: "long" }
    );
}

function textoPareceEntregaDaAgenda(texto) {
    return /\b(?:dever|tarefa|para casa|exercicio|lista|pagina|folha|trabalho|projeto|seminario|apresentacao|pesquisa|entrega|prova|teste|avaliacao)\b/.test(
        normalizarPesquisa(texto)
    );
}

function textoPareceAvisoInstitucional(texto) {
    const normalizado = normalizarPesquisa(texto);
    return [
        "periodo de inscricao", "inscricoes abertas", "prazo de inscricao",
        "aulas de revisao de conteudos", "aula de revisao de conteudos",
        "coordenacao e alunos", "coordenacao", "secretaria",
        "comunicado", "informativo", "circular", "boleto",
        "reuniao de responsaveis", "reuniao de pais", "viagem pedagogica",
        "aviso", "lembrete", "evento escolar", "olimpiada", "oba"
    ].some(function (termo) {
        return normalizado.includes(termo);
    });
}

function extrairLetraDaTurma(texto) {
    const valor = normalizarPesquisa(texto || "");
    const correspondencia = valor.match(/\bturma\s*([a-z])\b/) ||
        valor.match(/\b\d{1,2}\s*(?:ano\s*)?([a-z])\b/);
    return correspondencia ? correspondencia[1].toUpperCase() : "";
}

function identificarTurmaPrincipalDoAluno() {
    const filho = filhoSelecionadoAtual();
    const informada = extrairLetraDaTurma(
        filho?.turma || usuarioAtual?.turma || ""
    );
    if (informada) return informada;

    const contagem = new Map();
    turmasClassroom.forEach(function (turma) {
        const letra = extrairLetraDaTurma(
            (turma.name || "") + " " + (turma.section || "")
        );
        if (letra) contagem.set(letra, (contagem.get(letra) || 0) + 1);
    });

    return Array.from(contagem.entries()).sort(function (a, b) {
        return b[1] - a[1];
    })[0]?.[0] || "";
}

function identificarTurmaCompletaParaHorario() {
    const letra = identificarTurmaPrincipalDoAluno();
    const filho = filhoSelecionadoAtual();
    const fontes = [
        filho?.turma,
        usuarioAtual?.turma,
        ...turmasClassroom.map(function (turma) {
            return (turma.name || "") + " " + (turma.section || "");
        })
    ].filter(Boolean);

    for (const fonte of fontes) {
        const texto = normalizarPesquisa(fonte);
        const serie = texto.match(/\b(\d{1,2})\s*(?:ano|o)?\b/);
        const letraDaFonte = extrairLetraDaTurma(fonte) || letra;
        if (serie && letraDaFonte) return serie[1] + letraDaFonte;
    }

    return letra;
}

function nomePertenceATurma(texto, turmaPrincipal) {
    if (!turmaPrincipal) return true;
    const letra = extrairLetraDaTurma(texto);
    return !letra || letra === turmaPrincipal;
}

function eventoPertenceATurma(evento, turmaPrincipal) {
    return nomePertenceATurma([
        evento.materia,
        evento.calendarioOriginal,
        evento.titulo
    ].filter(Boolean).join(" "), turmaPrincipal);
}

function inferirHorarioPelosEventos(eventos) {
    const ocorrencias = new Map();

    (eventos || []).forEach(function (evento) {
        const materia = limparNomeDoCalendario(
            evento.materia || evento.calendarioOriginal || "",
            evento.calendarioId || ""
        ).trim();
        if (!materia || !evento.data) return;

        const dia = new Date(evento.data).getDay();
        if (dia === 0 || dia === 6) return;

        const chave = normalizarPesquisa(materia);
        if (!ocorrencias.has(chave)) {
            ocorrencias.set(chave, { materia: materia, dias: new Map() });
        }
        const registro = ocorrencias.get(chave);
        registro.dias.set(dia, (registro.dias.get(dia) || 0) + 1);
    });

    const nomesDias = [
        "domingo", "segunda-feira", "terça-feira", "quarta-feira",
        "quinta-feira", "sexta-feira", "sábado"
    ];
    const horarioPorDia = new Map();

    ocorrencias.forEach(function (registro) {
        const diasOrdenados = Array.from(registro.dias.entries())
            .sort(function (a, b) { return b[1] - a[1]; });

        diasOrdenados.forEach(function (item) {
            const dia = item[0];
            if (!horarioPorDia.has(dia)) horarioPorDia.set(dia, []);
            const aulas = horarioPorDia.get(dia);
            if (!aulas.some(function (aula) {
                return nomesDeMateriaCompativeis(aula, registro.materia);
            })) {
                aulas.push(registro.materia);
            }
        });
    });

    return Array.from(horarioPorDia.entries())
        .sort(function (a, b) { return a[0] - b[0]; })
        .map(function (item) {
            return { dia: nomesDias[item[0]], aulas: item[1] };
        });
}

function mesclarHorariosSemanais(principal, complementar) {
    const porDia = new Map();

    [principal, complementar].forEach(function (horario) {
        (Array.isArray(horario) ? horario : []).forEach(function (entrada) {
            const indice = indiceDoDiaDaSemana(entrada.dia || "");
            if (indice < 1 || indice > 5) return;
            if (!porDia.has(indice)) {
                porDia.set(indice, { dia: entrada.dia, aulas: [] });
            }
            const destino = porDia.get(indice);
            (entrada.aulas || []).forEach(function (aula) {
                if (!destino.aulas.some(function (existente) {
                    return nomesDeMateriaCompativeis(existente, aula);
                })) destino.aulas.push(aula);
            });
        });
    });

    return Array.from(porDia.entries())
        .sort(function (a, b) { return a[0] - b[0]; })
        .map(function (item) { return item[1]; });
}

function dataEhFimDeSemana(dataCampo) {
    const dia = new Date(dataCampo + "T12:00:00").getDay();
    return dia === 0 || dia === 6;
}

function materiasDoHorarioNaData(horarioSemanal, dataCampo) {
    if (!Array.isArray(horarioSemanal) || !horarioSemanal.length) return [];
    const indiceAlvo = new Date(dataCampo + "T12:00:00").getDay();
    const entrada = horarioSemanal.find(function (item) {
        return indiceDoDiaDaSemana(item.dia || "") === indiceAlvo;
    });
    return entrada && Array.isArray(entrada.aulas) ? entrada.aulas.filter(Boolean) : [];
}

function criarAvisoLocalDaAgenda(item, dataAlvo) {
    const texto = [item.titulo, item.descricao, item.calendarioOriginal, item.materia]
        .filter(Boolean)
        .join(" ");
    if (!textoPareceAvisoInstitucional(texto)) return null;

    const dataRegistro = dataParaCampo(new Date(item.data));
    const origem = item.calendarioOriginal || item.materia || "Agenda escolar";
    const publicadoEm = dataRegistro
        ? " (publicado em " + formatarDataCampo(dataRegistro) + ")"
        : "";

    // Avisos institucionais continuam importantes mesmo quando foram
    // publicados antes da data preparada. Eles aparecem na seção Avisos,
    // nunca como dever de casa ou aula.
    return (item.titulo || "Aviso da escola") +
        " — " + origem + publicadoEm;
}

function normalizarRelatorioEscolar(dados, opcoes) {
    if (!dados || typeof dados !== "object") return dados;
    const dataAlvo = opcoes.dataAlvo;
    const horarioSalvo = Array.isArray(opcoes.horarioSalvo) ? opcoes.horarioSalvo : [];
    const avisosLocais = Array.isArray(opcoes.avisosLocais) ? opcoes.avisosLocais : [];
    const avisos = Array.isArray(dados.avisos) ? dados.avisos.slice() : [];
    const entregas = Array.isArray(dados.entregas) ? dados.entregas : [];
    const entregasValidas = [];

    entregas.forEach(function (item) {
        const texto = [item.titulo, item.tipo, item.justificativa, item.origem]
            .filter(Boolean)
            .join(" ");
        if (textoPareceAvisoInstitucional(texto)) {
            avisos.push((item.titulo || "Aviso escolar") +
                (item.origem ? " — " + item.origem : ""));
            return;
        }
        if (item.dataEntrega && item.dataEntrega !== dataAlvo) return;
        entregasValidas.push(item);
    });

    avisos.push(...avisosLocais);
    dados.entregas = entregasValidas;
    dados.avisos = Array.from(new Set(avisos.filter(Boolean)));

    const fimDeSemana = dataEhFimDeSemana(dataAlvo);
    const horarioConfiavel = Array.isArray(dados.horarioSemanal) && dados.horarioSemanal.length
        ? dados.horarioSemanal
        : horarioSalvo;
    const materiasEsperadas = fimDeSemana
        ? []
        : materiasDoHorarioNaData(horarioConfiavel, dataAlvo);

    dados.semAula = fimDeSemana || (horarioConfiavel.length > 0 && materiasEsperadas.length === 0);
    if (dados.semAula) {
        dados.materiasDoDia = [];
        dados.resumo = fimDeSemana
            ? "Não há aulas regulares previstas porque a data escolhida cai no fim de semana. " +
              (entregasValidas.length
                  ? "Mesmo assim, há uma entrega com prazo explícito para esse dia."
                  : "Nenhum dever com prazo explícito foi confirmado para esse dia.")
            : "O horário consultado não mostra aulas regulares nessa data.";
    } else if (materiasEsperadas.length) {
        const materiasDaIA = Array.isArray(dados.materiasDoDia) ? dados.materiasDoDia : [];
        dados.materiasDoDia = materiasEsperadas.map(function (materia) {
            const nome = normalizarPesquisa(materia);
            return materiasDaIA.find(function (item) {
                const nomeItem = normalizarPesquisa(item.materia || "");
                return nomeItem.includes(nome) || nome.includes(nomeItem);
            }) || {
                materia: materia,
                situacao: "Nenhum dever confirmado",
                detalhe: "A matéria aparece no horário, mas não foi encontrado prazo para esse dia."
            };
        });
    }
    return dados;
}

function indiceDoDiaDaSemana(texto) {
    const dia = normalizarPesquisa(texto);
    if (dia.includes("domingo")) return 0;
    if (dia.includes("segunda")) return 1;
    if (dia.includes("terca")) return 2;
    if (dia.includes("quarta")) return 3;
    if (dia.includes("quinta")) return 4;
    if (dia.includes("sexta")) return 5;
    if (dia.includes("sabado")) return 6;
    return -1;
}

function proximaDataComDiaDaSemana(dataRegistro, diaSemana) {
    const resultado = new Date(dataRegistro);
    let diferenca = (diaSemana - resultado.getDay() + 7) % 7;
    if (diferenca === 0) diferenca = 7;
    resultado.setDate(resultado.getDate() + diferenca);
    return resultado;
}

function nomesDeMateriaCompativeis(nomeA, nomeB) {
    const a = normalizarPesquisa(nomeA || "");
    const b = normalizarPesquisa(nomeB || "");
    if (!a || !b) return false;

    // No colégio, Geografia e Geography são disciplinas diferentes.
    const aGeography = /\b(?:geography|ghy)\b/.test(a);
    const bGeography = /\b(?:geography|ghy)\b/.test(b);
    const aGeografia = /\bgeografia\b/.test(a) && !aGeography;
    const bGeografia = /\bgeografia\b/.test(b) && !bGeography;
    if ((aGeography && bGeografia) || (bGeography && aGeografia)) {
        return false;
    }

    if (a === b) return true;

    function possuiTermo(texto, termo) {
        const termoNormalizado = normalizarPesquisa(termo);
        if (!termoNormalizado) return false;
        // Siglas curtas precisam ser palavras completas. Assim IG não casa
        // com "língua" e RED não casa com um pedaço de outra palavra.
        if (termoNormalizado.length <= 3) {
            return texto.split(/\s+/).includes(termoNormalizado);
        }
        return texto === termoNormalizado ||
            texto.startsWith(termoNormalizado + " ") ||
            texto.endsWith(" " + termoNormalizado) ||
            texto.includes(" " + termoNormalizado + " ");
    }

    const grupos = [
        ["red", "rd", "redacao", "producao textual"],
        ["lp", "port", "portugues", "lingua portuguesa"],
        ["m", "mat", "matematica"],
        ["c", "cie", "ciencias"],
        ["g", "geo", "geografia"],
        ["geography", "ghy"],
        ["h", "his", "historia"],
        ["ig", "ing", "ingles", "english"],
        ["esp", "espanhol", "spanish"],
        ["er", "religiao", "ensino religioso"],
        ["pec", "pensamento computacional", "computacao"],
        ["art", "artes"],
        ["ef", "educacao fisica"],
        ["emo", "educacao emocional", "educacao socioemocional"]
    ];

    return grupos.some(function (grupo) {
        return grupo.some(function (termo) { return possuiTermo(a, termo); }) &&
            grupo.some(function (termo) { return possuiTermo(b, termo); });
    });
}

function identificarMateriaDoEventoNoHorario(item, horarioSemanal) {
    const materiasDoHorario = [];

    (Array.isArray(horarioSemanal) ? horarioSemanal : []).forEach(function (entrada) {
        (Array.isArray(entrada.aulas) ? entrada.aulas : []).forEach(function (materia) {
            if (!materiasDoHorario.some(function (existente) {
                return nomesDeMateriaCompativeis(existente, materia);
            })) {
                materiasDoHorario.push(materia);
            }
        });
    });

    // Vários calendários escolares chegam com um e-mail técnico como nome.
    // Nesses casos a disciplina aparece no título (por exemplo, RED 6B,
    // LP 6B ou MAT 6B). O horário oficial apenas fornece a lista de matérias;
    // não usamos a frequência da Agenda para inventar a grade.
    const fontes = [
        item?.materia,
        item?.calendarioOriginal,
        item?.titulo,
        item?.descricao
    ].filter(Boolean);

    for (const fonte of fontes) {
        const materiaEncontrada = materiasDoHorario.find(function (materia) {
            return nomesDeMateriaCompativeis(materia, fonte);
        });
        if (materiaEncontrada) return materiaEncontrada;
    }

    const materiaInformada = String(item?.materia || "").trim();
    if (normalizarPesquisa(materiaInformada) !== "agenda escolar") {
        return materiaInformada;
    }

    return "";
}

function calcularEntregaLocalDaAgenda(item, horarioSemanal) {
    const textoOriginal = (item.titulo || "") + " " + (item.descricao || "");
    const texto = normalizarPesquisa(textoOriginal);
    if (textoPareceAvisoInstitucional(textoOriginal)) return null;
    const registro = new Date(item.data);
    let entrega = null;
    let regra = "";

    if (/\bdepois de amanha\b/.test(texto)) {
        entrega = new Date(registro);
        entrega.setDate(entrega.getDate() + 2);
        regra = "O aviso diz ‘depois de amanhã’.";
    } else if (/\b(?:para|pra|p) amanha\b/.test(texto)) {
        entrega = new Date(registro);
        entrega.setDate(entrega.getDate() + 1);
        regra = "O aviso diz ‘para amanhã’.";
    }

    if (!entrega) {
        const dataCompleta = texto.match(/\b(?:dia\s*)?(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
        if (dataCompleta) {
            let ano = dataCompleta[3] ? Number(dataCompleta[3]) : registro.getFullYear();
            if (ano < 100) ano += 2000;
            entrega = new Date(ano, Number(dataCompleta[2]) - 1, Number(dataCompleta[1]), 12);
            if (!dataCompleta[3] && entrega < registro) entrega.setFullYear(entrega.getFullYear() + 1);
            regra = "O aviso informa a data " + dataCompleta[0] + ".";
        }
    }

    if (!entrega) {
        const somenteDia = texto.match(/\b(?:para|pro|ate)\s+(?:o\s+)?dia\s+(\d{1,2})\b/);
        if (somenteDia) {
            entrega = new Date(registro.getFullYear(), registro.getMonth(), Number(somenteDia[1]), 12);
            if (entrega <= registro) entrega.setMonth(entrega.getMonth() + 1);
            regra = "O aviso informa o dia " + somenteDia[1] + ".";
        }
    }

    if (!entrega) {
        const diaEscrito = texto.match(/\b(?:para|pra|na)\s+(segunda|terca|quarta|quinta|sexta|sabado|domingo)(?:-feira)?\b/);
        if (diaEscrito) {
            const indice = indiceDoDiaDaSemana(diaEscrito[1]);
            if (indice >= 0) {
                entrega = proximaDataComDiaDaSemana(registro, indice);
                regra = "O aviso indica " + diaEscrito[1] + ".";
            }
        }
    }

    const mencionaProximaAula = /\bproxima aula\b/.test(texto);
    const ehDeverParaProximaAula = /\b(?:para\s+casa|dever(?:\s+de\s+casa)?|tarefa(?:\s+(?:para|de)\s+casa)?|atividade\s+para\s+casa|exercicios?|lista(?:\s+de\s+exercicios?)?|paginas?|folhas?|fazer|responder|produzir|escrever|copiar|concluir)\b/.test(texto);

    if (
        !entrega &&
        (mencionaProximaAula || ehDeverParaProximaAula) &&
        Array.isArray(horarioSemanal)
    ) {
        const materia = identificarMateriaDoEventoNoHorario(item, horarioSemanal) ||
            item.materia || item.calendarioOriginal || "";
        const proximasDatas = horarioSemanal.filter(function (entrada) {
            return (entrada.aulas || []).some(function (aula) {
                return nomesDeMateriaCompativeis(aula, materia);
            });
        }).map(function (entrada) {
            const indice = indiceDoDiaDaSemana(entrada.dia);
            return indice >= 0 ? proximaDataComDiaDaSemana(registro, indice) : null;
        }).filter(Boolean).sort(function (a, b) {
            return a.getTime() - b.getTime();
        });

        if (proximasDatas.length) {
            entrega = proximasDatas[0];
            regra = mencionaProximaAula
                ? "O aviso diz 'próxima aula' e foi cruzado com o horário semanal."
                : "O registro indica dever para casa e foi associado à próxima aula da matéria.";
        }
    }

    return entrega ? { data: dataParaCampo(entrega), regra: regra } : null;
}

function criarEntregaLocalDaAgenda(item, dataAlvo, horarioSemanal) {
    const calculo = calcularEntregaLocalDaAgenda(item, horarioSemanal);
    if (!calculo || calculo.data !== dataAlvo) return null;

    const materiaIdentificada =
        identificarMateriaDoEventoNoHorario(item, horarioSemanal) ||
        item.materia || item.calendarioOriginal || "Matéria a confirmar";

    return {
        materia: materiaIdentificada,
        tipo: identificarTipoAtividade({
            title: item.titulo || "",
            description: item.descricao || "",
            materials: []
        }),
        titulo: item.titulo || "Tarefa registrada na Agenda",
        descricao: item.descricao || "",
        dataEntrega: dataAlvo,
        dataRegistro: dataParaCampo(new Date(item.data)),
        origem: "Google Agenda",
        link: item.link || "",
        justificativa: calculo.regra,
        prioridade: "Alta"
    };
}

function incorporarEntregasLocaisNoRelatorio(dados, entregasLocais) {
    if (!dados || !Array.isArray(entregasLocais) || !entregasLocais.length) return;

    const entregasDaIA = Array.isArray(dados.entregas) ? dados.entregas : [];
    const mapa = new Map();
    entregasDaIA.concat(entregasLocais).forEach(function (item) {
        const chave = normalizarPesquisa(
            (item.materia || "") + "|" + (item.titulo || "") + "|" + (item.dataEntrega || "")
        );
        if (!mapa.has(chave)) mapa.set(chave, item);
    });
    dados.entregas = Array.from(mapa.values());

    const materias = Array.isArray(dados.materiasDoDia) ? dados.materiasDoDia : [];
    entregasLocais.forEach(function (entrega) {
        const nome = normalizarPesquisa(entrega.materia);
        const existente = materias.find(function (item) {
            const materia = normalizarPesquisa(item.materia);
            return materia.includes(nome) || nome.includes(materia);
        });
        if (existente) {
            existente.situacao = "Entrega encontrada";
            existente.detalhe = entrega.titulo;
        } else {
            materias.push({
                materia: entrega.materia,
                situacao: "Entrega encontrada",
                detalhe: entrega.titulo
            });
        }
    });
    dados.materiasDoDia = materias;

    if (dados.entregas.length) {
        dados.resumo = "Foram localizadas " + dados.entregas.length +
            (dados.entregas.length === 1 ? " entrega" : " entregas") +
            " para a data escolhida, após examinar a janela anterior a esse dia.";
    }
}

function pistaLocalDeEntrega(item) {
    const texto = normalizarPesquisa(
        (item.titulo || "") + " " + (item.descricao || "")
    );
    const dataRegistro = new Date(item.data);
    const dataCalculada = new Date(dataRegistro);

    if (/\bdepois de amanha\b/.test(texto)) {
        dataCalculada.setDate(dataCalculada.getDate() + 2);
        return "depois de amanhã = " + dataParaCampo(dataCalculada);
    }

    if (/\b(?:para|pra|p) amanha\b/.test(texto)) {
        dataCalculada.setDate(dataCalculada.getDate() + 1);
        return "para amanhã = " + dataParaCampo(dataCalculada);
    }

    if (/\bproxima aula\b/.test(texto)) {
        return "próxima aula; cruzar obrigatoriamente com o horário semanal";
    }

    if (/\b(?:para\s+casa|dever(?:\s+de\s+casa)?|tarefa(?:\s+(?:para|de)\s+casa)?|exercicios?|lista(?:\s+de\s+exercicios?)?|paginas?|folhas?)\b/.test(texto)) {
        return "atividade para casa; calcular a entrega pela próxima aula da matéria";
    }

    const dataEscrita = texto.match(
        /\b(?:dia\s*)?(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/
    );

    if (dataEscrita) {
        return "data escrita no aviso: " + dataEscrita[0];
    }

    return "nenhuma data explícita; verificar o texto e o horário da matéria";
}

async function obterContextoResponsavelClassroom(dataInicio, dataAlvo, horarioSemanal) {
    let texto = "";
    const anexosHorario = [];
    const entregas = [];
    let documentoHorarioEncontrado = false;

    for (const turma of turmasClassroom.slice(0, 20)) {
        try {
            const respostas = await Promise.all([
                chamarClassroomPaginado(
                    "courses/" + turma.id + "/courseWorkMaterials?pageSize=100",
                    "courseWorkMaterial"
                ),
                chamarClassroomPaginado(
                    "courses/" + turma.id + "/courseWork?pageSize=100",
                    "courseWork"
                )
            ]);

            const materiais = respostas[0];
            const atividades = respostas[1];

            materiais.forEach(function (material) {
                const descricao =
                    (material.title || "") + " " + (material.description || "");
                const normalizado = normalizarPesquisa(descricao);
                const dataCriacao = dataParaCampo(
                    new Date(material.creationTime || material.updateTime || 0)
                );
                const pareceHorario = [
                    "horario", "grade de aulas", "quadro de horarios",
                    "cronograma semanal", "tabela de aulas"
                ].some(function (termo) {
                    return normalizado.includes(termo);
                });

                if (pareceHorario) {
                    documentoHorarioEncontrado = true;
                    texto +=
                        "\nPOSSÍVEL HORÁRIO DA TURMA " + turma.name +
                        "\nTítulo: " + (material.title || "") +
                        "\nDescrição: " + (material.description || "") + "\n";
                    recolherAnexos(material.materials, anexosHorario);
                }

                if (dataCriacao >= dataInicio && dataCriacao <= dataAlvo) {
                    texto +=
                        "\nMATERIAL PUBLICADO NO CLASSROOM\n" +
                        "Matéria: " + turma.name + "\n" +
                        "Data do registro: " + dataCriacao + "\n" +
                        "Título: " + (material.title || "") + "\n" +
                        "Descrição: " + (material.description || "") + "\n";

                    const calculoMaterial = calcularEntregaLocalDaAgenda({
                        titulo: material.title || "",
                        descricao: material.description || "",
                        data: new Date(material.creationTime || material.updateTime || 0),
                        materia: turma.name,
                        calendarioOriginal: turma.name
                    }, horarioSemanal || []);

                    if (calculoMaterial && calculoMaterial.data === dataAlvo) {
                        entregas.push({
                            materia: turma.name,
                            tipo: identificarTipoAtividade(material),
                            titulo: material.title || "Material com atividade para casa",
                            descricao: material.description || "",
                            dataEntrega: dataAlvo,
                            dataRegistro: dataCriacao,
                            origem: "Material do Google Classroom",
                            link: material.alternateLink || "",
                            justificativa: calculoMaterial.regra,
                            prioridade: "Alta"
                        });
                    }
                }
            });

            atividades.forEach(function (atividade) {
                const dataCriacao = dataParaCampo(
                    new Date(atividade.creationTime || atividade.updateTime || 0)
                );
                const dataEntrega = atividade.dueDate
                    ? dataParaCampo(new Date(
                        atividade.dueDate.year,
                        atividade.dueDate.month - 1,
                        atividade.dueDate.day
                    ))
                    : "não informada";

                if (
                    dataEntrega === dataAlvo ||
                    (dataCriacao >= dataInicio && dataCriacao <= dataAlvo)
                ) {
                    texto +=
                        "\nATIVIDADE DO CLASSROOM\n" +
                        "Matéria: " + turma.name + "\n" +
                        "Data do registro: " + dataCriacao + "\n" +
                        "Data oficial de entrega: " + dataEntrega + "\n" +
                        "Título: " + (atividade.title || "") + "\n" +
                        "Descrição: " + (atividade.description || "") + "\n";
                }

                let calculoLocal = null;
                if (dataEntrega === dataAlvo) {
                    calculoLocal = {
                        data: dataAlvo,
                        regra: "O Classroom informa oficialmente esta data de entrega."
                    };
                } else if (dataCriacao >= dataInicio && dataCriacao <= dataAlvo) {
                    calculoLocal = calcularEntregaLocalDaAgenda({
                        titulo: atividade.title || "",
                        descricao: atividade.description || "",
                        data: new Date(atividade.creationTime || atividade.updateTime || 0),
                        materia: turma.name,
                        calendarioOriginal: turma.name
                    }, horarioSemanal || []);
                }

                if (calculoLocal && calculoLocal.data === dataAlvo) {
                    entregas.push({
                        materia: turma.name,
                        tipo: identificarTipoAtividade(atividade),
                        titulo: atividade.title || "Atividade do Classroom",
                        descricao: atividade.description || "",
                        dataEntrega: dataAlvo,
                        dataRegistro: dataCriacao,
                        origem: "Google Classroom",
                        link: atividade.alternateLink || "",
                        justificativa: calculoLocal.regra,
                        prioridade: "Alta"
                    });
                }
            });
        } catch (erro) {
            console.warn("Não foi possível consultar a turma:", turma.name, erro);
        }
    }

    const anexosUnicos = Array.from(
        new Map(anexosHorario.map(function (anexo) {
            return [anexo.id, anexo];
        })).values()
    );

    for (const anexo of anexosUnicos.slice(0, 3)) {
        try {
            const conteudo = await lerArquivoDoDrive(anexo.id);
            texto += "\nARQUIVO DE HORÁRIO: " + anexo.nome + "\n" + conteudo + "\n";
        } catch (erro) {
            console.warn("Horário não lido:", anexo.nome, erro);
        }
    }

    return {
        texto: texto || "Nenhum horário ou atividade adicional foi localizado no Classroom.",
        entregas: entregas,
        documentoHorarioEncontrado: documentoHorarioEncontrado
    };
}

function desenharRelatorioResponsavel(
    dados,
    dataAlvo,
    dataInicio,
    dataReferencia,
    areaDestino
) {
    const area = areaDestino || document.querySelector("#resultado-relatorio-responsavel");
    const entregas = Array.isArray(dados.entregas) ? dados.entregas : [];
    const avisos = Array.isArray(dados.avisos) ? dados.avisos : [];
    const horario = Array.isArray(dados.horarioSemanal) ? dados.horarioSemanal : [];
    const materiasDoDia = Array.isArray(dados.materiasDoDia)
        ? dados.materiasDoDia
        : [];
    const auditoria = dados.auditoria && typeof dados.auditoria === "object"
        ? dados.auditoria
        : null;

    area.innerHTML = `
        <div class="resumo-relatorio-responsavel">
            <div>
                <small>PREPARAÇÃO PARA</small>
                <h3>${formatarDataCampo(dataAlvo)}</h3>
                <span>Consultado como se hoje fosse ${formatarDataCampo(dataReferencia)}</span>
                <span>Busca realizada desde ${formatarDataCampo(dataInicio)}</span>
            </div>
            <p>${protegerTexto(dados.resumo || "")}</p>
        </div>

        <section class="cobertura-materias-relatorio">
            <h3>Matérias previstas para esse dia</h3>
            ${dados.semAula === true ? `
                <p class="aviso-horario-nao-encontrado sem-aula-prevista">
                    Não há aulas regulares previstas para essa data.
                </p>
            ` : materiasDoDia.length ? `
                <div class="grade-cobertura-materias">
                    ${materiasDoDia.map(function (item) {
                        const situacao = item.situacao || "A confirmar";
                        const classe = normalizarPesquisa(situacao).replace(/\s+/g, "-");
                        return `
                            <article class="${protegerTexto(classe)}">
                                <strong>${protegerTexto(item.materia || "Matéria")}</strong>
                                <span>${protegerTexto(situacao)}</span>
                                <small>${protegerTexto(item.detalhe || "")}</small>
                            </article>
                        `;
                    }).join("")}
                </div>
            ` : `
                <p class="aviso-horario-nao-encontrado">
                    O horário desse dia não foi localizado com segurança.
                    O relatório abaixo não deve ser considerado uma lista completa.
                </p>
            `}
        </section>

        <div class="tabela-pesquisa-rolagem">
            <h3 class="titulo-lista-relatorio">Deveres e entregas</h3>
            <table class="tabela-pesquisa tabela-entregas-responsavel">
                <thead><tr><th>Matéria</th><th>Tipo</th><th>O que fazer</th><th>Quando foi avisado</th><th>Prioridade</th></tr></thead>
                <tbody>
                    ${entregas.length ? entregas.map(function (item, indice) {
                        const idDetalhes = "detalhes-entrega-" + indice;
                        const descricaoCompleta = item.descricao || item.titulo ||
                            "O registro não trouxe uma descrição adicional. Confira a fonte abaixo.";
                        return `
                            <tr class="linha-entrega-clicavel"
                                tabindex="0"
                                role="button"
                                aria-expanded="false"
                                aria-controls="${idDetalhes}"
                                data-alvo-detalhes="${idDetalhes}">
                                <td>${protegerTexto(item.materia || "A confirmar")}</td>
                                <td><span class="etiqueta-tipo-entrega">${protegerTexto(item.tipo || "Tarefa")}</span></td>
                                <td>
                                    <strong>${protegerTexto(item.titulo || "")}</strong>
                                    <small>${protegerTexto(item.justificativa || "")}</small>
                                    <span class="comando-ver-dever">Ver atividade completa ▾</span>
                                </td>
                                <td>${protegerTexto(item.dataRegistro || "Não informada")}</td>
                                <td>${protegerTexto(item.prioridade || "Normal")}</td>
                            </tr>
                            <tr id="${idDetalhes}" class="linha-detalhes-entrega" hidden>
                                <td colspan="5">
                                    <div class="conteudo-detalhes-entrega">
                                        <h4>O que precisa ser feito</h4>
                                        <p>${protegerTexto(descricaoCompleta).replace(/\n/g, "<br>")}</p>
                                        <p><strong>Como a data foi calculada:</strong> ${protegerTexto(item.justificativa || "Prazo informado pela fonte escolar.")}</p>
                                        <p><strong>Fonte:</strong> ${protegerTexto(item.origem || "Agenda ou Classroom")}</p>
                                        ${item.link ? `<a href="${protegerTexto(item.link)}" target="_blank" rel="noopener noreferrer">Abrir registro original</a>` : ""}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("") : '<tr><td colspan="5">Nenhuma entrega confirmada para essa data.</td></tr>'}
                </tbody>
            </table>
        </div>

        <details class="detalhes-finais avisos-relatorio-responsavel">
            <summary>📢 Ver avisos escolares (${avisos.length})</summary>
            <div class="conteudo-avisos-relatorio">
                ${avisos.length ? `
                    <ul>${avisos.map(function (aviso) {
                        return `<li>${protegerTexto(aviso)}</li>`;
                    }).join("")}</ul>
                ` : '<p>Nenhum aviso escolar encontrado nas semanas consultadas.</p>'}
            </div>
        </details>

        ${auditoria ? `
            <details class="detalhes-finais auditoria-relatorio-responsavel">
                <summary>🔎 Como a Maltéria procurou os deveres</summary>
                <div class="conteudo-avisos-relatorio">
                    <ul>
                        <li>Atividades do Classroom lidas: ${Number(auditoria.atividadesClassroomLidas) || 0}</li>
                        <li>Materiais do Classroom lidos: ${Number(auditoria.materiaisClassroomLidos) || 0}</li>
                        <li>Registros da Agenda lidos: ${Number(auditoria.registrosAgendaLidos) || 0}</li>
                        <li>Candidatos a tarefa analisados: ${Number(auditoria.candidatosAnalisados) || 0}</li>
                    </ul>
                    <p>${protegerTexto(auditoria.observacao || "Auditoria concluída.")}</p>
                </div>
            </details>
        ` : ""}

    `;

    area.querySelectorAll(".linha-entrega-clicavel").forEach(function (linha) {
        function alternarDetalhes() {
            const detalhes = area.querySelector("#" + linha.dataset.alvoDetalhes);
            if (!detalhes) return;
            const vaiAbrir = detalhes.hidden;
            detalhes.hidden = !vaiAbrir;
            linha.setAttribute("aria-expanded", String(vaiAbrir));
            const comando = linha.querySelector(".comando-ver-dever");
            if (comando) {
                comando.textContent = vaiAbrir
                    ? "Ocultar atividade ▴"
                    : "Ver atividade completa ▾";
            }
        }

        linha.addEventListener("click", alternarDetalhes);
        linha.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                alternarDetalhes();
            }
        });
    });

    area.classList.remove("escondido");
}

/* AVISOS POR DATA */

const campoDataAtividades =
    document.querySelector("#data-atividades");

const tituloAtividadesData =
    document.querySelector("#titulo-atividades-data");

function prepararDataInicialAtividades() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    campoDataAtividades.value = dataParaCampo(amanha);
}

async function carregarAtividadesDaData() {
    prepararDataInicialAtividades();

    tituloAtividadesData.textContent = "Para amanhã";

    // Aluno e responsável usam a mesma busca retroativa. Assim, “Para
    // amanhã” lê os avisos das últimas três semanas e calcula a data real
    // indicada por “para amanhã”, “próxima aula” ou uma data escrita.
    const statusAutomatico = { textContent: "" };
    await carregarRelatorioResponsavel({
        dataAlvo: campoDataAtividades.value,
        dataReferencia: dataParaCampo(new Date()),
        horizonte: 21,
        statusElement: statusAutomatico,
        areaElement: document.querySelector("#atividades-amanha"),
        buttonElement: null,
        enviarEmail: perfilVisualAtual() === "responsavel"
    });
}

function desenharAtividadesDaData(itens, dataEscolhida) {
    const area = document.querySelector(
        "#atividades-amanha"
    );

    if (itens.length === 0) {
        area.innerHTML = `
            <p>
                Nenhum compromisso escolar encontrado na Agenda em
                ${protegerTexto(dataEscolhida.toLocaleDateString("pt-BR"))}.
            </p>
        `;

        return;
    }

    area.innerHTML =
        itens
            .map(function (item) {
                const descricao = item.descricao || "";
                const descricaoLonga = descricao.length > 420;
                const resumo = descricaoLonga
                    ? descricao.slice(0, 417).trim() + "..."
                    : descricao;

                return `
                    <div class="arquivo">
                        <strong>
                            ${protegerTexto(
                                item.titulo
                            )}
                        </strong>

                        <p>
                            ${protegerTexto(
                                item.materia
                            )}
                        </p>

                        ${resumo ? `
                            <p class="resumo-agenda">
                                ${protegerTexto(resumo)}
                            </p>
                        ` : ""}

                        ${descricaoLonga ? `
                            <details class="detalhes-agenda">
                                <summary>Ver descrição completa</summary>
                                <p>${protegerTexto(descricao).replace(/\n/g, "<br>")}</p>
                            </details>
                        ` : ""}

                        ${item.link ? `
                            <a href="${protegerTexto(item.link)}"
                               target="_blank" rel="noopener noreferrer">
                                Abrir na Agenda escolar
                            </a>
                            ${item.emailGoogle ? `
                                <small class="conta-link-agenda">
                                    Conta: ${protegerTexto(item.emailGoogle)}
                                </small>
                            ` : `
                                <small class="conta-link-agenda aviso">
                                    O Google poderá pedir que você escolha uma Conta Google com acesso ao Classroom.
                                </small>
                            `}
                        ` : ""}
                    </div>
                `;
            })
            .join("");
}

prepararDataInicialAtividades();

campoDataAtividades.addEventListener("change", function () {
    if (tokenClassroom) {
        carregarAtividadesDaData();
    } else {
        tituloAtividadesData.textContent =
            "Para " + new Date(
                campoDataAtividades.value + "T12:00:00"
            ).toLocaleDateString("pt-BR");
    }
});

function calendarioDaAgendaPareceEscolar(calendario) {
    const texto = normalizarPesquisa(
        (calendario.summary || "") + " " + (calendario.description || "")
    );

    const padraoTurmaOuMateria =
        /\b(?:red|mat|cie|cien|his|geo|ing|port|lp|relig|comp)\s*[-–]?\s*\d{1,2}\s*[a-z]\b/;

    const correspondeATurma = turmasClassroom.some(function (turma) {
        return palavrasImportantes(turma.name).some(function (palavra) {
            return palavra.length >= 3 && texto.includes(palavra);
        });
    });

    return correspondeATurma ||
        padraoTurmaOuMateria.test(texto) ||
        /\b(?:turma|ano|classroom|colegio|escola|materia|aula)\b/.test(texto);
}

function eventoDaAgendaPareceEscolar(evento) {
    const texto = normalizarPesquisa(
        evento.materia + " " +
        (evento.calendarioOriginal || "") + " " +
        evento.titulo + " " + evento.descricao
    );

    const termosEscolares = [
        "classroom", "escola", "colegio", "aula", "materia",
        "atividade", "dever", "tarefa", "trabalho", "prova",
        "avaliacao", "teste", "exercicio", "lista", "entrega",
        "seminario", "projeto", "estudar", "estudo", "revisao",
        "para casa", "para amanha", "proxima aula", "pagina",
        "folha", "livro", "caderno", "red 6", "mat 6", "cie 6",
        "coordenacao", "inscricao", "comunicado", "secretaria",
        "responsaveis", "alunos"
    ];

    const correspondeATurma = turmasClassroom.some(function (turma) {
        return palavrasImportantes(turma.name).some(function (palavra) {
            return texto.includes(palavra);
        });
    });

    return evento.calendarioEscolar ||
        correspondeATurma || termosEscolares.some(function (termo) {
        return texto.includes(termo);
    });
}

async function gerarEstudoDaMateria() {
    arquivosPdfParaIA = [];

    const conteudo =
        await obterConteudoDaMateria(
            periodoEstudoAtual
        );

    if (conteudo.trim().length < 40) {
        throw new Error(
            "Não encontrei material suficiente " +
            "nessa matéria e nessa data."
        );
    }

    const resposta = await fetch(
        ENDERECO_IA,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                materia:
                    materiaAtual.name,

                titulo:
                    "Materiais de " +
                    (
                        periodoEstudoAtual?.nome ||
                        "todo o período"
                    ),

                conteudo: conteudo,
                arquivos: arquivosPdfParaIA
            })
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.erro ||
            "O servidor da IA recusou a solicitação."
        );
    }

    return dados;
}

async function obterConteudoDaMateria(
    periodo
) {
    let texto =
        "PACOTE DE ESTUDO DO MALTÉRIA\n" +
        "Matéria: " + materiaAtual.name + "\n";

    if (periodo) {
        texto +=
            "Período escolhido: " +
            periodo.inicio + " até " + (periodo.fim || periodo.inicio) +
            "\n";
    }

    if (
        !materiaAtual.id ||
        !String(materiaAtual.id).match(/^\d+$/)
    ) {
        throw new Error(
            "Conecte o Classroom primeiro."
        );
    }

    let atividades =
        atividadesPorTurma[materiaAtual.id];

    if (!atividades) {
        const dados = await chamarClassroom(
            "courses/" +
            materiaAtual.id +
            "/courseWork?pageSize=100"
        );

        atividades =
            dados.courseWork || [];

        atividadesPorTurma[
            materiaAtual.id
        ] = atividades;
    }

    const dadosMateriais =
        await chamarClassroom(
            "courses/" +
            materiaAtual.id +
            "/courseWorkMaterials?pageSize=100"
        );

    const publicacoes =
        dadosMateriais.courseWorkMaterial || [];

    let eventosAgenda = [];

    if (periodo?.inicio) {
        try {
            const agenda = await obterEventosAgenda(
                periodo.inicio,
                periodo.fim || periodo.inicio
            );

            eventosAgenda = agenda.fontes.filter(
                eventoCombinaComMateriaAtual
            );
        } catch (erro) {
            console.warn(
                "A Agenda não pôde ser consultada:",
                erro
            );
        }
    }

    const atividadesDoDia = atividades.filter(
        function (item) {
            return itemEstaNoPeriodoDeEstudo(
                item,
                periodo
            );
        }
    );

    const publicacoesDoDia = publicacoes.filter(
        function (item) {
            return itemEstaNoPeriodoDeEstudo(
                item,
                periodo
            );
        }
    );

    const contextoDoDia = [
        ...eventosAgenda.map(function (evento) {
            return evento.titulo + " " + evento.descricao;
        }),
        ...atividadesDoDia.map(function (atividade) {
            return atividade.title + " " +
                (atividade.description || "");
        })
    ].join(" ");

    const atividadesRelacionadas = escolherItensRelacionados(
        atividades,
        atividadesDoDia,
        contextoDoDia,
        6
    );

    const publicacoesRelacionadas = escolherItensRelacionados(
        publicacoes,
        publicacoesDoDia,
        contextoDoDia,
        8
    );

    const atividadesSelecionadas = unirItensSemRepetir(
        atividadesDoDia,
        atividadesRelacionadas
    );

    const publicacoesSelecionadas = unirItensSemRepetir(
        publicacoesDoDia,
        publicacoesRelacionadas
    );

    const anexosDrive = [];

    texto += "\n=== 1. AGENDA E TAREFAS DA DATA ===\n";

    if (eventosAgenda.length === 0) {
        texto +=
            "Nenhum evento da Agenda identificado como pertencente " +
            "a esta matéria na data escolhida.\n";
    }

    eventosAgenda.forEach(function (evento) {
        texto +=
            "\nAGENDA: " + evento.titulo +
            "\nDESCRIÇÃO: " + (evento.descricao || "") +
            "\n";
    });

    atividadesSelecionadas.forEach(
        function (atividade) {
            texto +=
                "\nATIVIDADE DO CLASSROOM: " +
                (atividade.title || "") +
                "\nDESCRIÇÃO: " +
                (atividade.description || "") +
                "\nRELAÇÃO COM A DATA: " +
                (atividadesDoDia.includes(atividade)
                    ? "atividade localizada na data solicitada"
                    : "atividade relacionada usada como apoio") +
                "\n";

            recolherAnexos(
                atividade.materials,
                anexosDrive
            );

            texto += descreverMateriaisClassroom(
                atividade.materials
            );
        }
    );

    texto += "\n=== 2. MATERIAIS DA DISCIPLINA NO CLASSROOM ===\n";

    publicacoesSelecionadas.forEach(
        function (publicacao) {
            texto +=
                "\nMATERIAL: " +
                (publicacao.title || "") +
                "\nDESCRIÇÃO: " +
                (publicacao.description || "") +
                "\nRELAÇÃO COM A DATA: " +
                (publicacoesDoDia.includes(publicacao)
                    ? "material publicado/atualizado na data solicitada"
                    : "material relacionado ou material de apoio da disciplina") +
                "\n";

            recolherAnexos(
                publicacao.materials,
                anexosDrive
            );

            texto += descreverMateriaisClassroom(
                publicacao.materials
            );
        }
    );

    let uploads = uploadsDaSessao.filter(
        function (upload) {
            return (
                upload.materiaId ===
                    String(materiaAtual.id) &&
                (
                    !periodo ||
                    !upload.data ||
                    (
                        upload.data >= periodo.inicio &&
                        upload.data <= (periodo.fim || periodo.inicio)
                    )
                )
            );
        }
    );

    if (uploads.length === 0) {
        uploads = uploadsDaSessao
            .filter(function (upload) {
                return upload.materiaId ===
                    String(materiaAtual.id);
            })
            .slice(-5);
    }

    texto += "\n=== 3. UPLOADS DO ALUNO ===\n";

    uploads.forEach(function (upload) {
        if (upload.arquivoIA) {
            adicionarPdfParaIA(upload.arquivoIA);
        }

        texto +=
            "\nUPLOAD: " +
            upload.nome +
            "\nTIPO: " +
            upload.tipo +
            "\nCONTEÚDO: " +
            (
                upload.texto ||
                "Arquivo anexado sem texto extraído."
            ) +
            "\n";
    });

    const anexosUnicos = Array.from(
        new Map(
            anexosDrive.map(function (anexo) {
                return [anexo.id, anexo];
            })
        ).values()
    );

    texto += "\n=== 4. CONTEÚDO DOS ANEXOS ===\n";

    let anexosLidos = 0;

    for (const anexo of anexosUnicos) {
        try {
            const textoDoArquivo =
                await lerArquivoDoDrive(
                    anexo.id
                );

            texto +=
                "\nARQUIVO: " +
                anexo.nome +
                "\nCONTEÚDO:\n" +
                textoDoArquivo +
                "\n";

            anexosLidos++;
        } catch (erro) {
            console.warn(
                "Não foi possível ler:",
                anexo.nome,
                erro
            );
        }
    }

    const quantidadeFontes =
        eventosAgenda.length +
        atividadesSelecionadas.length +
        publicacoesSelecionadas.length +
        uploads.length +
        anexosLidos;

    texto +=
        "\n=== 5. VERIFICAÇÃO DA BUSCA ===\n" +
        "Agenda consultada: " + (periodo?.inicio ? "sim" : "não") + "\n" +
        "Eventos da matéria na data: " + eventosAgenda.length + "\n" +
        "Atividades do Classroom usadas: " + atividadesSelecionadas.length + "\n" +
        "Materiais do Classroom usados: " + publicacoesSelecionadas.length + "\n" +
        "Anexos com conteúdo lido: " + anexosLidos + "\n" +
        "Uploads usados: " + uploads.length + "\n" +
        "TOTAL DE FONTES: " + quantidadeFontes + "\n" +
        (quantidadeFontes > 0
            ? "RESULTADO: há material disponível para produzir a explicação.\n"
            : "RESULTADO: nenhuma fonte com conteúdo foi encontrada após consultar Agenda e Classroom.\n");

    return texto.slice(0, 60000);
}

function palavrasImportantes(texto) {
    const ignoradas = new Set([
        "ano", "turma", "para", "com", "dos", "das", "uma",
        "sobre", "aula", "atividade", "material", "dever",
        "casa", "classe", "classroom"
    ]);

    return normalizarPesquisa(texto)
        .split(/\s+/)
        .filter(function (palavra) {
            return palavra.length >= 4 && !ignoradas.has(palavra);
        });
}

function eventoCombinaComMateriaAtual(evento) {
    const palavrasMateria = palavrasImportantes(
        materiaAtual.name
    );
    const textoEvento = normalizarPesquisa(
        evento.materia + " " + evento.titulo + " " + evento.descricao
    );

    return palavrasMateria.some(function (palavra) {
        return textoEvento.includes(palavra);
    });
}

function pontuarItemPorContexto(item, contexto) {
    const palavras = palavrasImportantes(contexto);
    const textoItem = normalizarPesquisa(
        (item.title || "") + " " + (item.description || "")
    );

    return palavras.reduce(function (total, palavra) {
        return total + (textoItem.includes(palavra) ? 1 : 0);
    }, 0);
}

function escolherItensRelacionados(
    todos,
    itensDoDia,
    contexto,
    limite
) {
    const restantes = todos.filter(function (item) {
        return !itensDoDia.includes(item);
    });

    const pontuados = restantes
        .map(function (item) {
            return {
                item: item,
                pontos: pontuarItemPorContexto(item, contexto),
                data: new Date(
                    item.updateTime || item.creationTime || 0
                ).getTime()
            };
        })
        .sort(function (a, b) {
            return b.pontos - a.pontos || b.data - a.data;
        });

    const relacionados = pontuados.filter(function (registro) {
        return registro.pontos > 0;
    });

    return (relacionados.length > 0 ? relacionados : pontuados)
        .slice(0, limite)
        .map(function (registro) {
            return registro.item;
        });
}

function unirItensSemRepetir(principais, complementares) {
    const vistos = new Set();

    return [...principais, ...complementares].filter(function (item) {
        const chave = item.id ||
            item.title + "-" + item.creationTime;

        if (vistos.has(chave)) {
            return false;
        }

        vistos.add(chave);
        return true;
    });
}

function descreverMateriaisClassroom(materiais) {
    return (materiais || []).map(function (material) {
        const drive = material.driveFile?.driveFile;

        if (drive) {
            return "ANEXO DO DRIVE: " + (drive.title || "Arquivo") + "\n";
        }

        if (material.youtubeVideo) {
            return "VÍDEO: " +
                (material.youtubeVideo.title || "Vídeo da aula") +
                " - https://youtu.be/" + material.youtubeVideo.id + "\n";
        }

        if (material.link) {
            return "LINK: " + (material.link.title || material.link.url) +
                " - " + material.link.url + "\n";
        }

        if (material.form) {
            return "FORMULÁRIO: " +
                (material.form.title || "Formulário") + "\n";
        }

        return "";
    }).join("");
}

function itemEstaNoPeriodoDeEstudo(
    item,
    periodo
) {
    if (!periodo) {
        return true;
    }

    const datas = [];

    if (item.dueDate) {
        datas.push(new Date(
            item.dueDate.year,
            item.dueDate.month - 1,
            item.dueDate.day
        ));
    }

    [
        item.creationTime,
        item.updateTime,
        item.scheduledTime
    ].filter(Boolean).forEach(function (textoData) {
        datas.push(new Date(textoData));
    });

    return datas.some(function (data) {
        const valor = dataParaCampo(data);
        return valor >= periodo.inicio &&
            valor <= (periodo.fim || periodo.inicio);
    });
}

function recolherAnexos(
    materiais,
    destino
) {
    (materiais || []).forEach(
        function (material) {
            const arquivo =
                material.driveFile?.driveFile;

            if (arquivo?.id) {
                destino.push({
                    id: arquivo.id,

                    nome:
                        arquivo.title ||
                        "Arquivo do Drive"
                });
            }
        }
    );
}

async function lerArquivoDoDrive(id) {
    const metadadosResposta = await fetch(
        "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(id) +
        "?fields=id,name,mimeType",
        {
            headers: {
                Authorization:
                    "Bearer " + tokenClassroom
            }
        }
    );

    const metadados =
        await metadadosResposta.json();

    if (!metadadosResposta.ok) {
        throw new Error(
            metadados.error?.message ||
            "Não foi possível abrir o arquivo."
        );
    }

    const tipo = metadados.mimeType;

    let endereco;

    if (
        tipo ===
        "application/vnd.google-apps.document"
    ) {
        endereco =
            "https://www.googleapis.com/drive/v3/files/" +
            encodeURIComponent(id) +
            "/export?mimeType=text%2Fplain";
    } else if (
        tipo ===
        "application/vnd.google-apps.presentation"
    ) {
        endereco =
            "https://www.googleapis.com/drive/v3/files/" +
            encodeURIComponent(id) +
            "/export?mimeType=text%2Fplain";
    } else if (
        tipo.startsWith("text/")
    ) {
        endereco =
            "https://www.googleapis.com/drive/v3/files/" +
            encodeURIComponent(id) +
            "?alt=media";
    } else if (tipo === "application/pdf") {
        const respostaPdf = await fetch(
            "https://www.googleapis.com/drive/v3/files/" +
            encodeURIComponent(id) +
            "?alt=media",
            {
                headers: {
                    Authorization: "Bearer " + tokenClassroom
                }
            }
        );

        if (!respostaPdf.ok) {
            throw new Error(await respostaPdf.text());
        }

        const blob = await respostaPdf.blob();

        if (blob.size > 2800000) {
            return (
                "PDF encontrado: " + metadados.name +
                ". O arquivo é maior que o limite de leitura integral desta versão."
            );
        }

        const dataUrl = await lerBlobComoDataUrl(blob);
        const foiAdicionado = adicionarPdfParaIA({
            id: id,
            nome: metadados.name,
            mimeType: "application/pdf",
            data: dataUrl.split(",")[1],
            tamanho: blob.size
        });

        return foiAdicionado
            ? "PDF integral anexado à solicitação da IA: " + metadados.name
            : "PDF encontrado, mas o limite conjunto de documentos foi atingido: " + metadados.name;
    } else {
        return (
            "Arquivo anexado: " +
            metadados.name +
            ". Formato ainda não convertido: " +
            tipo
        );
    }

    const arquivoResposta = await fetch(
        endereco,
        {
            headers: {
                Authorization:
                    "Bearer " + tokenClassroom
            }
        }
    );

    if (!arquivoResposta.ok) {
        const erro =
            await arquivoResposta.text();

        throw new Error(erro);
    }

    return await arquivoResposta.text();
}

function adicionarPdfParaIA(arquivo) {
    if (
        !arquivo?.data ||
        !(
            arquivo.mimeType === "application/pdf" ||
            arquivo.mimeType.startsWith("image/")
        )
    ) {
        return false;
    }

    const jaExiste = arquivosPdfParaIA.some(function (item) {
        return (
            arquivo.id && item.id === arquivo.id
        ) || (
            !arquivo.id &&
            item.nome === arquivo.nome &&
            item.data.length === arquivo.data.length
        );
    });

    if (jaExiste) {
        return true;
    }

    const tamanhoAtual = arquivosPdfParaIA.reduce(function (total, item) {
        return total + (Number(item.tamanho) || 0);
    }, 0);

    if (
        arquivosPdfParaIA.length >= 5 ||
        tamanhoAtual + (Number(arquivo.tamanho) || 0) > 3000000
    ) {
        return false;
    }

    arquivosPdfParaIA.push({
        id: arquivo.id || "",
        nome: arquivo.nome || "Material.pdf",
        mimeType: "application/pdf",
        data: arquivo.data,
        tamanho: Number(arquivo.tamanho) || 0
    });

    return true;
}

function formatarTexto(texto) {
    const seguro = protegerTexto(texto || "")
        .replace(/\s+(#{1,3})\s+/g, "\n$1 ")
        .replace(/\s+-\s+\*\*/g, "\n- **");

    const linhas = seguro.split(/\n+/);
    let html = "";
    let listaAberta = false;

    function fecharLista() {
        if (listaAberta) {
            html += "</ul>";
            listaAberta = false;
        }
    }

    linhas.forEach(function (linhaOriginal) {
        const linha = linhaOriginal.trim();

        if (!linha) {
            fecharLista();
            return;
        }

        const titulo = linha.match(/^#{1,3}\s+(.+)/);
        const topico = linha.match(/^(?:[-•*]|\d+[.)])\s+(.+)/);

        if (titulo) {
            fecharLista();
            html += "<h3>" + formatarNegritoSeguro(titulo[1]) + "</h3>";
            return;
        }

        if (topico) {
            if (!listaAberta) {
                html += "<ul>";
                listaAberta = true;
            }

            html += "<li>" + formatarNegritoSeguro(topico[1]) + "</li>";
            return;
        }

        fecharLista();
        html += "<p>" + formatarNegritoSeguro(linha) + "</p>";
    });

    fecharLista();
    return html;
}

function formatarNegritoSeguro(texto) {
    return texto.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/* SUPER ADMINISTRAÇÃO */

const listaUsuariosAdministracao =
    document.querySelector("#lista-usuarios-administracao");
const resumoUsuariosAdministracao =
    document.querySelector("#resumo-usuarios-administracao");
const botaoAtualizarUsuariosAdministracao =
    document.querySelector("#atualizar-usuarios-administracao");
const modalSenhaTemporaria =
    document.querySelector("#modal-senha-temporaria");
const valorSenhaTemporaria =
    document.querySelector("#valor-senha-temporaria");
let senhaTemporariaFoiCopiada = false;
const modalCriarUsuario = document.querySelector("#modal-criar-usuario");
const modalDadosUsuario = document.querySelector("#modal-dados-usuario");
const conteudoDadosUsuario = document.querySelector("#conteudo-dados-usuario");
const usuariosAdministracaoPorChave = new Map();

function contasEscolaresDoUsuario(usuario) {
    if (
        usuario.tipo === "Responsável" &&
        Array.isArray(usuario.filhos)
    ) {
        return usuario.filhos
            .map(function (filho) {
                return filho.email;
            })
            .filter(Boolean);
    }

    return usuario.email ? [usuario.email] : [];
}

function textoDataAdministracao(valor) {
    if (!valor) return "Nunca";
    const data = new Date(valor);
    return Number.isNaN(data.getTime())
        ? "Não informado"
        : data.toLocaleString("pt-BR");
}

function criarListaAdministracao(titulo, valores, vazio) {
    const bloco = document.createElement("div");
    const rotulo = document.createElement("small");
    const lista = document.createElement("ul");
    rotulo.textContent = titulo;
    (valores && valores.length ? valores : [vazio]).forEach(function (valor) {
        const item = document.createElement("li");
        item.textContent = valor;
        lista.appendChild(item);
    });
    bloco.append(rotulo, lista);
    return bloco;
}

function criarBotaoAdministracao(texto, acao, usuario, classe) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.dataset.acaoAdmin = acao;
    botao.dataset.usuarioId = usuario.id;
    botao.dataset.usuarioEmail = usuario.email || "";
    botao.dataset.usuarioChave = usuario.id || usuario.email || "";
    botao.className = "botao-admin " + (classe || "");
    if (usuario.email && normalizarEmail(usuario.email) === EMAIL_DONO_MALTERIA) {
        if (["senha_temporaria", "bloquear", "desbloquear", "excluir"].includes(acao)) botao.disabled = true;
    }
    return botao;
}

function renderizarUsuariosAdministracao(usuarios, origemBanco) {
    listaUsuariosAdministracao.innerHTML = "";
    usuariosAdministracaoPorChave.clear();
    if (usuarios.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = "Nenhuma conta encontrada.";
        listaUsuariosAdministracao.appendChild(vazio);
        return;
    }

    if (resumoUsuariosAdministracao) {
        const ativos = usuarios.filter(function (item) { return item.status === "Ativa"; }).length;
        const bloqueados = usuarios.filter(function (item) { return item.status === "Bloqueada"; }).length;
        resumoUsuariosAdministracao.textContent =
            usuarios.length + " usuários • " + ativos + " ativos • " + bloqueados + " bloqueados";
    }

    usuarios.forEach(function (usuario) {
        usuariosAdministracaoPorChave.set(usuario.id || usuario.email || "", usuario);
        const cartao = document.createElement("article");
        const cabecalho = document.createElement("div");
        const nome = document.createElement("strong");
        const tipo = document.createElement("span");
        const email = document.createElement("p");
        const metadados = document.createElement("div");
        const acoes = document.createElement("div");

        cartao.className = "usuario-administracao";
        cabecalho.className = "usuario-administracao-cabecalho";
        nome.textContent = usuario.nome || "Usuário sem nome";
        tipo.textContent = usuario.papel === "superadmin" || usuarioEhDono(usuario)
            ? "Dono"
            : usuario.tipo || "Conta";
        email.textContent = usuario.email || "E-mail não informado";
        metadados.className = "usuario-administracao-metadados";
        metadados.innerHTML =
            "<span><b>Status:</b> " + protegerTexto(usuario.status || "Local") + "</span>" +
            "<span><b>Último acesso:</b> " + protegerTexto(textoDataAdministracao(usuario.ultimoAcesso)) + "</span>" +
            "<span><b>Criada em:</b> " + protegerTexto(textoDataAdministracao(usuario.criadoEm)) + "</span>";
        acoes.className = "usuario-administracao-acoes";

        acoes.append(
            criarBotaoAdministracao("👁️ Ver dados", "ver", usuario, "primario"),
            criarBotaoAdministracao("✉️ Enviar redefinição", "redefinir", usuario)
        );

        if (origemBanco && !usuarioEhDono(usuario)) {
            acoes.append(
                criarBotaoAdministracao("🔑 Gerar senha temporária", "senha_temporaria", usuario, "primario"),
                criarBotaoAdministracao(
                    usuario.status === "Bloqueada" ? "✅ Desbloquear" : "⛔ Bloquear",
                    usuario.status === "Bloqueada" ? "desbloquear" : "bloquear",
                    usuario
                ),
                criarBotaoAdministracao("🗑️ Excluir", "excluir", usuario, "perigo")
            );
        }

        cabecalho.append(nome, tipo);
        cartao.append(
            cabecalho,
            email,
            metadados,
            criarListaAdministracao(
                "CLASSROOM CONECTADO",
                usuario.classroom || contasEscolaresDoUsuario(usuario),
                "Nenhuma conta Classroom conectada"
            ),
            criarListaAdministracao(
                "VÍNCULOS FAMILIARES",
                usuario.vinculos || [],
                "Nenhum vínculo familiar ativo"
            ),
            acoes
        );
        listaUsuariosAdministracao.appendChild(cartao);
    });
}

async function requisicaoAdministracao(metodo, corpo) {
    if (!window.MalteriaBanco || !window.MalteriaBanco.configurado) {
        throw new Error("O banco de dados ainda não está conectado.");
    }
    const token = await window.MalteriaBanco.tokenAcesso();
    if (!token) throw new Error("Faça login novamente para abrir a administração.");
    const resposta = await fetch("/api/admin-usuarios", {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    const dados = await resposta.json().catch(function () { return {}; });
    if (!resposta.ok) {
        let mensagem = dados.erro || "Não foi possível concluir a operação.";
        if (resposta.status === 404) {
            mensagem = "A API administrativa ainda não foi publicada. Crie o arquivo api/admin-usuarios.js no GitHub e aguarde a Vercel reimplantar.";
        } else if (resposta.status === 401) {
            mensagem = "Sua sessão expirou. Saia da conta e entre novamente.";
        } else if (resposta.status === 403) {
            mensagem = "Esta conta não foi reconhecida como Super Administrador no banco.";
        } else if (resposta.status === 500 || resposta.status === 503) {
            mensagem = dados.erro || "A Super Administração ainda não recebeu a chave secreta do Supabase na Vercel. Configure SUPABASE_SECRET_KEY com a chave sb_secret_... e reimplante em Produção.";
        }
        throw new Error(mensagem);
    }
    return dados;
}

async function desenharUsuariosAdministracao() {
    listaUsuariosAdministracao.innerHTML = "<p class=\"carregando-administracao\">Carregando usuários do banco...</p>";
    if (resumoUsuariosAdministracao) resumoUsuariosAdministracao.textContent = "";
    try {
        const dados = await requisicaoAdministracao("GET");
        renderizarUsuariosAdministracao(dados.usuarios || [], true);
    } catch (erro) {
        const usuarios = lerUsuariosLocais();
        renderizarUsuariosAdministracao(usuarios, false);
        const aviso = document.createElement("p");
        aviso.className = "erro-administracao";
        aviso.textContent = erro.message + " Exibindo apenas os dados locais.";
        listaUsuariosAdministracao.prepend(aviso);
    }
}

async function executarAcaoAdministracao(botao) {
    const acao = botao.dataset.acaoAdmin;
    const id = botao.dataset.usuarioId;
    const email = botao.dataset.usuarioEmail;
    if (acao === "ver") {
        const usuario = usuariosAdministracaoPorChave.get(botao.dataset.usuarioChave);
        if (usuario) mostrarDadosUsuarioAdministracao(usuario);
        return;
    }
    if (acao === "excluir" && !window.confirm("Excluir definitivamente a conta de " + email + "?")) return;
    if (acao === "bloquear" && !window.confirm("Bloquear o acesso de " + email + "?")) return;
    botao.disabled = true;
    try {
        if (acao === "redefinir") {
            await window.MalteriaBanco.enviarRedefinicaoSenha(email);
            window.alert("E-mail de redefinição enviado para " + email + ".");
        } else {
            if (acao === "senha_temporaria" && !window.confirm(
                "Atenção: gerar uma senha temporária troca a senha da conta imediatamente. A senha antiga deixará de funcionar. Deseja continuar?"
            )) return;
            const dados = await requisicaoAdministracao("POST", { acao: acao, usuarioId: id });
            if (acao === "senha_temporaria") {
                valorSenhaTemporaria.textContent = dados.senhaTemporaria;
                senhaTemporariaFoiCopiada = false;
                document.querySelector("#copiar-senha-temporaria").textContent =
                    "Copiar senha temporária";
                modalSenhaTemporaria.classList.remove("escondido");
            }
            await desenharUsuariosAdministracao();
        }
    } catch (erro) {
        window.alert(erro.message);
    } finally {
        botao.disabled = false;
    }
}

function mostrarDadosUsuarioAdministracao(usuario) {
    conteudoDadosUsuario.innerHTML = "";
    const linhas = [
        ["Nome", usuario.nome || "Não informado"],
        ["E-mail", usuario.email || "Não informado"],
        ["Tipo de conta", usuario.tipo || "Não informado"],
        ["Permissão", usuario.papel || "usuário"],
        ["Status", usuario.status || "Local"],
        ["Último acesso", textoDataAdministracao(usuario.ultimoAcesso)],
        ["Conta criada em", textoDataAdministracao(usuario.criadoEm)],
        ["Classroom", (usuario.classroom || contasEscolaresDoUsuario(usuario)).join(", ") || "Não conectado"],
        ["Vínculos familiares", (usuario.vinculos || []).join(", ") || "Nenhum vínculo ativo"]
    ];
    linhas.forEach(function (linha) {
        const bloco = document.createElement("p");
        const rotulo = document.createElement("strong");
        const valor = document.createElement("span");
        rotulo.textContent = linha[0];
        valor.textContent = linha[1];
        bloco.append(rotulo, valor);
        conteudoDadosUsuario.appendChild(bloco);
    });
    modalDadosUsuario.classList.remove("escondido");
}

listaUsuariosAdministracao.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-acao-admin]");
    if (botao) executarAcaoAdministracao(botao);
});

if (botaoAtualizarUsuariosAdministracao) {
    botaoAtualizarUsuariosAdministracao.addEventListener("click", desenharUsuariosAdministracao);
}

document.querySelector("#fechar-senha-temporaria").addEventListener("click", function () {
    if (valorSenhaTemporaria.textContent && !senhaTemporariaFoiCopiada) {
        window.alert("Copie a senha temporária antes de fechar. Ela não será mostrada novamente.");
        return;
    }
    valorSenhaTemporaria.textContent = "";
    modalSenhaTemporaria.classList.add("escondido");
});

document.querySelector("#copiar-senha-temporaria").addEventListener("click", async function () {
    try {
        await navigator.clipboard.writeText(valorSenhaTemporaria.textContent);
        senhaTemporariaFoiCopiada = true;
        this.textContent = "✓ Senha copiada — agora pode fechar";
    } catch (erro) {
        window.alert("Não consegui copiar automaticamente. Selecione a senha exibida e use Ctrl+C.");
    }
});

document.querySelector("#criar-usuario-administracao").addEventListener("click", function () {
    document.querySelector("#form-criar-usuario-administracao").reset();
    document.querySelector("#erro-criar-usuario").textContent = "";
    modalCriarUsuario.classList.remove("escondido");
});

document.querySelector("#fechar-criar-usuario").addEventListener("click", function () {
    modalCriarUsuario.classList.add("escondido");
});

document.querySelector("#fechar-dados-usuario").addEventListener("click", function () {
    modalDadosUsuario.classList.add("escondido");
});

document.querySelector("#form-criar-usuario-administracao").addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const erroFormulario = document.querySelector("#erro-criar-usuario");
    const botao = this.querySelector("button[type='submit']");
    erroFormulario.textContent = "";
    botao.disabled = true;
    try {
        const dados = await requisicaoAdministracao("POST", {
            acao: "criar",
            nome: document.querySelector("#admin-novo-nome").value.trim(),
            email: document.querySelector("#admin-novo-email").value.trim(),
            tipo: document.querySelector("#admin-novo-tipo").value
        });
        modalCriarUsuario.classList.add("escondido");
        valorSenhaTemporaria.textContent = dados.senhaTemporaria;
        modalSenhaTemporaria.classList.remove("escondido");
        await desenharUsuariosAdministracao();
    } catch (erro) {
        erroFormulario.textContent = erro.message;
    } finally {
        botao.disabled = false;
    }
});

/* NÍVEL DE MELHORA */

document
    .querySelector("#abrir-nivel-melhora")
    .addEventListener("click", function () {
        paginaAnteriorFerramenta = paginaVisivelAtual();
        mostrarPaginaInterna(paginaNivelMelhora);
        prepararPainelMetaEvolucao();
        restaurarAnaliseEvolucao();
    });

document
    .querySelector("#fechar-nivel-melhora")
    .addEventListener("click", function () {
        mostrarPaginaInterna(
            paginaAnteriorFerramenta || paginaPrincipal
        );
    });

document
    .querySelector("#abrir-pratica")
    .addEventListener("click", function () {
        paginaAnteriorFerramenta = paginaVisivelAtual();
        mostrarPaginaInterna(paginaPratica);
        preencherMateriasSimuladao();
        atualizarRecomendacaoSimuladao();
    });

document
    .querySelector("#fechar-pratica")
    .addEventListener("click", function () {
        mostrarPaginaInterna(
            paginaAnteriorFerramenta || paginaPrincipal
        );
    });

document
    .querySelector("#analisar-evolucao")
    .addEventListener("click", analisarNivelEvolucao);

document
    .querySelector("#salvar-meta-bimestral")
    .addEventListener("click", salvarMetaBimestral);

document
    .querySelector("#criar-simuladao")
    .addEventListener("click", criarSimuladaoGeral);

document
    .querySelector("#selecionar-todas-materias")
    .addEventListener("click", alternarTodasMateriasSimuladao);

document
    .querySelector("#dificuldade-simuladao")
    .addEventListener("change", atualizarRecomendacaoSimuladao);

document
    .querySelector("#quantidade-simuladao")
    .addEventListener("change", atualizarRecomendacaoSimuladao);

[
    "#bimestre-meta",
    "#media-atual-meta",
    "#media-desejada-meta",
    "#escala-meta",
    "#regras-nota-meta"
].forEach(function (seletor) {
    document.querySelector(seletor).addEventListener("input", salvarRascunhoMetaBimestral);
    document.querySelector(seletor).addEventListener("change", salvarRascunhoMetaBimestral);
});

function chaveAnaliseEvolucao() {
    const conta = usuarioAtual?.email
        ? normalizarEmail(usuarioAtual.email)
        : "visitante";

    return "malteriaAnaliseEvolucao:" + conta;
}

function chaveDadosEvolucao(sufixo) {
    const conta = usuarioAtual?.email
        ? normalizarEmail(usuarioAtual.email)
        : "visitante";

    return "malteria:" + sufixo + ":" + conta;
}

function prepararPainelMetaEvolucao() {
    restaurarMetaBimestral();
    desenharEstatisticasPratica();
    preencherMateriasSimuladao();
}

function salvarRascunhoMetaBimestral() {
    const rascunho = {
        bimestre: document.querySelector("#bimestre-meta").value,
        mediaAtual: document.querySelector("#media-atual-meta").value,
        mediaDesejada: document.querySelector("#media-desejada-meta").value,
        escala: document.querySelector("#escala-meta").value,
        regras: document.querySelector("#regras-nota-meta").value,
        salva: false
    };
    metasBimestraisDaSessao.set(chaveMetaDaSessao(), rascunho);
}

function chaveMetaDaSessao() {
    return normalizarEmail(usuarioAtual?.email || "visitante");
}

function salvarMetaBimestral() {
    const mediaAtual = Number(
        document.querySelector("#media-atual-meta").value
    );
    const mediaDesejada = Number(
        document.querySelector("#media-desejada-meta").value
    );
    const escala = Number(
        document.querySelector("#escala-meta").value
    );
    const resumo = document.querySelector("#resumo-meta-bimestral");

    if (
        !Number.isFinite(mediaAtual) ||
        !Number.isFinite(mediaDesejada) ||
        !Number.isFinite(escala) ||
        escala <= 0 ||
        mediaAtual < 0 ||
        mediaDesejada < 0 ||
        mediaAtual > escala ||
        mediaDesejada > escala
    ) {
        resumo.textContent =
            "Informe médias válidas e o valor máximo usado pela escola.";
        return;
    }

    const meta = {
        bimestre: document.querySelector("#bimestre-meta").value,
        mediaAtual: mediaAtual,
        mediaDesejada: mediaDesejada,
        escala: escala,
        regras: document.querySelector("#regras-nota-meta").value.trim(),
        atualizadaEm: new Date().toISOString()
    };

    meta.salva = true;
    metasBimestraisDaSessao.set(chaveMetaDaSessao(), meta);

    desenharResumoMeta(meta);
}

function restaurarMetaBimestral() {
    const meta = metasBimestraisDaSessao.get(chaveMetaDaSessao()) || null;

    if (!meta) {
        document.querySelector("#bimestre-meta").value = "1";
        document.querySelector("#media-atual-meta").value = "";
        document.querySelector("#media-desejada-meta").value = "";
        document.querySelector("#escala-meta").value = "";
        document.querySelector("#regras-nota-meta").value = "";
        document.querySelector("#resumo-meta-bimestral").innerHTML = `
            <strong>Comece pela meta, não pela cobrança.</strong>
            <span>Quando o boletim for enviado, a Maltéria poderá revisar esta meta conforme a escala real da escola.</span>
        `;
        return;
    }

    document.querySelector("#bimestre-meta").value = meta.bimestre || "1";
    document.querySelector("#media-atual-meta").value = meta.mediaAtual;
    document.querySelector("#media-desejada-meta").value = meta.mediaDesejada;
    document.querySelector("#escala-meta").value = meta.escala;
    document.querySelector("#regras-nota-meta").value = meta.regras || "";
    if (meta.salva) {
        desenharResumoMeta(meta);
    }
}

function desenharResumoMeta(meta) {
    const diferenca = Number(meta.mediaDesejada) - Number(meta.mediaAtual);
    const percentualAtual = Math.round(
        (Number(meta.mediaAtual) / Number(meta.escala)) * 100
    );
    const resumo = document.querySelector("#resumo-meta-bimestral");

    resumo.innerHTML = `
        <strong>${meta.bimestre}º bimestre: ${protegerTexto(meta.mediaAtual)} → ${protegerTexto(meta.mediaDesejada)}</strong>
        <span>Média atual equivalente a ${percentualAtual}% da escala informada. Caminho até a meta: ${protegerTexto(diferenca.toFixed(2))} ponto(s).</span>
        <small>A meta orienta a prática; não é promessa de nota nem instrumento de pressão.</small>
    `;
}

function registrarPraticaLocal(registro) {
    const chave = chaveDadosEvolucao("praticas");
    let praticas = [];

    try {
        praticas = JSON.parse(localStorage.getItem(chave) || "[]");
    } catch (erro) {
        praticas = [];
    }

    const registroCompleto = {
        ...registro,
        id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random(),
        data: new Date().toISOString()
    };

    praticas.push(registroCompleto);

    localStorage.setItem(
        chave,
        JSON.stringify(praticas.slice(-500))
    );

    const emailEscolar = obterEmailGoogleConectado();
    const emailDaConta = normalizarEmail(usuarioAtual?.email || "");
    if (emailEscolar && emailEscolar !== emailDaConta) {
        const chaveEscolar = "malteria:praticas:" + emailEscolar;
        let praticasEscolares = [];
        try {
            praticasEscolares = JSON.parse(localStorage.getItem(chaveEscolar) || "[]");
            if (!Array.isArray(praticasEscolares)) praticasEscolares = [];
        } catch (erro) {
            praticasEscolares = [];
        }
        praticasEscolares.push(registroCompleto);
        localStorage.setItem(chaveEscolar, JSON.stringify(praticasEscolares.slice(-500)));
    }

    desenharEstatisticasPratica();
}

function praticasDoAlunoPorEmail(email) {
    if (!email) return [];

    try {
        const dados = JSON.parse(
            localStorage.getItem(
                "malteria:praticas:" + normalizarEmail(email)
            ) || "[]"
        );
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function preencherSeletorGabaritos() {
    const seletor = document.querySelector("#filho-gabaritos");
    if (!seletor || !usuarioAtual) return;

    const filhos = Array.isArray(usuarioAtual.filhos) ? usuarioAtual.filhos : [];
    const valorAnterior = seletor.value;

    seletor.innerHTML = filhos.length
        ? filhos.map(function (filho, indice) {
            return '<option value="' + indice + '">' +
                protegerTexto(filho.nome || filho.email || "Aluno") +
                '</option>';
        }).join("")
        : '<option value="">Nenhum aluno vinculado</option>';

    if (valorAnterior && filhos[Number(valorAnterior)]) {
        seletor.value = valorAnterior;
    }
}

function desenharGabaritosDoAluno() {
    const seletor = document.querySelector("#filho-gabaritos");
    const area = document.querySelector("#lista-gabaritos");
    const resumo = document.querySelector("#resumo-gabaritos");
    if (!seletor || !area || !resumo || !usuarioAtual) return;

    const filhos = Array.isArray(usuarioAtual.filhos) ? usuarioAtual.filhos : [];
    const filho = filhos[Number(seletor.value)];

    if (!filho?.email) {
        resumo.innerHTML = "";
        area.innerHTML = "<p>Vincule a conta do aluno para acompanhar os simulados.</p>";
        return;
    }

    const simulados = praticasDoAlunoPorEmail(filho.email)
        .filter(function (item) {
            return item.tipo === "simulado" || item.tipo === "simuladao";
        })
        .sort(function (a, b) { return new Date(b.data) - new Date(a.data); });

    const totalQuestoes = simulados.reduce(function (total, item) {
        return total + (Number(item.questoesConcluidas) || Number(item.total) || 0);
    }, 0);
    const totalAcertos = simulados.reduce(function (total, item) {
        return total + (Number(item.acertos) || 0);
    }, 0);

    resumo.innerHTML = `
        <article><strong>${simulados.length}</strong><span>simulados concluídos</span></article>
        <article><strong>${totalQuestoes}</strong><span>questões respondidas</span></article>
        <article><strong>${totalQuestoes ? Math.round(totalAcertos / totalQuestoes * 100) + "%" : "—"}</strong><span>acertos registrados</span></article>
    `;

    if (!simulados.length) {
        area.innerHTML = "<p>Ainda não há simulados concluídos por este aluno neste aparelho.</p>";
        return;
    }

    area.innerHTML = simulados.map(function (simulado, indice) {
        const questoes = Array.isArray(simulado.gabarito) ? simulado.gabarito : [];
        const data = simulado.data
            ? new Date(simulado.data).toLocaleString("pt-BR")
            : "Data não registrada";
        const detalhes = questoes.length
            ? '<ol class="questoes-gabarito">' + questoes.map(function (questao) {
                const respostaAluno = questao.respostaAluno || "Não registrada";
                const respostaCorreta = questao.respostaCorreta || "Resposta orientadora não registrada";
                return `
                    <li class="${questao.acertou === true ? "acertou" : questao.acertou === false ? "revisar" : "discursiva"}">
                        <strong>${protegerTexto(questao.pergunta || "Questão")}</strong>
                        <p><b>Resposta do aluno:</b> ${protegerTexto(respostaAluno)}</p>
                        <p><b>Gabarito:</b> ${protegerTexto(respostaCorreta)}</p>
                        ${questao.explicacao ? `<p><b>Explicação:</b> ${protegerTexto(questao.explicacao)}</p>` : ""}
                        ${questao.fonte ? `<small>Fonte: ${protegerTexto(questao.fonte)}</small>` : ""}
                    </li>
                `;
            }).join("") + "</ol>"
            : '<p class="aviso-gabarito-legado">Este simulado foi feito antes da criação do gabarito detalhado. O resultado geral foi preservado.</p>';

        return `
            <details class="cartao-gabarito" ${indice === 0 ? "open" : ""}>
                <summary>
                    <span><strong>${protegerTexto(simulado.materia || "Simulado")}</strong><small>${protegerTexto(data)}</small></span>
                    <b>${simulado.avaliavel === false ? "Discursivo" : (Number(simulado.acertos) || 0) + "/" + (Number(simulado.total) || 0)}</b>
                </summary>
                ${detalhes}
            </details>
        `;
    }).join("");
}

document.querySelector("#filho-gabaritos").addEventListener("change", desenharGabaritosDoAluno);

function obterPraticasLocais() {
    try {
        return JSON.parse(
            localStorage.getItem(
                chaveDadosEvolucao("praticas")
            ) || "[]"
        );
    } catch (erro) {
        return [];
    }
}

function desenharEstatisticasPratica() {
    const area = document.querySelector("#estatisticas-pratica");
    if (!area) return;

    const limite = new Date();
    limite.setDate(limite.getDate() - 29);

    const praticas = obterPraticasLocais().filter(function (item) {
        return new Date(item.data) >= limite;
    });
    const dias = new Set(praticas.map(function (item) {
        return String(item.data).slice(0, 10);
    }));
    const simulados = praticas.filter(function (item) {
        return item.tipo === "simulado" || item.tipo === "simuladao";
    });
    const acertos = simulados.reduce(function (total, item) {
        return total + (Number(item.acertos) || 0);
    }, 0);
    const questoes = simulados.reduce(function (total, item) {
        return total + (Number(item.total) || 0);
    }, 0);
    const minutos = praticas.reduce(function (total, item) {
        return total + (Number(item.minutos) || 0);
    }, 0);

    area.innerHTML = `
        <article><strong>${dias.size}</strong><span>dias com prática</span></article>
        <article><strong>${praticas.length}</strong><span>atividades registradas</span></article>
        <article><strong>${minutos}</strong><span>minutos estimados</span></article>
        <article><strong>${questoes ? Math.round(acertos / questoes * 100) + "%" : "—"}</strong><span>acertos em simulados</span></article>
    `;
}

function preencherMateriasSimuladao() {
    const area = document.querySelector("#lista-materias-simuladao");
    const turmas = Array.isArray(turmasClassroom) ? turmasClassroom : [];

    if (turmas.length === 0) {
        area.innerHTML = "<p>Conecte o Classroom para escolher as matérias.</p>";
        return;
    }

    area.innerHTML = turmas.map(function (turma) {
        return `
            <article class="materia-configuracao-simuladao">
                <label>
                    <input type="checkbox" name="materia-simuladao" value="${protegerTexto(turma.id)}">
                    <span>${protegerTexto(turma.name)}</span>
                </label>
                <select data-nivel-materia="${protegerTexto(turma.id)}" aria-label="Nível de ${protegerTexto(turma.name)}" disabled>
                    <option value="auto" selected>Seguir recomendação</option>
                    <option value="reforco">Reforço</option>
                    <option value="gradual">Gradual</option>
                    <option value="desafio">Desafio</option>
                </select>
            </article>
        `;
    }).join("");

    area.querySelectorAll('input[name="materia-simuladao"]').forEach(function (campo) {
        campo.addEventListener("change", function () {
            const seletor = area.querySelector('[data-nivel-materia="' + campo.value + '"]');
            if (seletor) seletor.disabled = !campo.checked;
            atualizarRecomendacaoSimuladao();
        });
    });

    area.querySelectorAll("[data-nivel-materia]").forEach(function (seletor) {
        seletor.addEventListener("change", atualizarRecomendacaoSimuladao);
    });

    atualizarRecomendacaoSimuladao();
}

function alternarTodasMateriasSimuladao() {
    const campos = Array.from(
        document.querySelectorAll('input[name="materia-simuladao"]')
    );
    const selecionar = campos.some(function (campo) { return !campo.checked; });

    campos.forEach(function (campo) {
        campo.checked = selecionar;
        const seletor = document.querySelector('[data-nivel-materia="' + campo.value + '"]');
        if (seletor) seletor.disabled = !selecionar;
    });

    document.querySelector("#selecionar-todas-materias").textContent =
        selecionar ? "Limpar seleção" : "Selecionar todas";
    atualizarRecomendacaoSimuladao();
}

function recomendarNivelDaMateria(nomeMateria) {
    const nome = normalizarPesquisa(nomeMateria);
    const simulados = obterPraticasLocais().filter(function (item) {
        return normalizarPesquisa(item.materia || "").includes(nome) &&
            Number(item.total) > 0;
    });
    const total = simulados.reduce(function (soma, item) {
        return soma + Number(item.total || 0);
    }, 0);
    const acertos = simulados.reduce(function (soma, item) {
        return soma + Number(item.acertos || 0);
    }, 0);

    if (total < 10) return "gradual";
    const taxa = acertos / total;
    if (taxa < 0.6) return "reforco";
    if (taxa >= 0.85 && total >= 15) return "desafio";
    return "gradual";
}

function configuracaoDoSimuladao(materias) {
    const estrategia = document.querySelector("#dificuldade-simuladao").value;
    const mapa = {};

    materias.forEach(function (materia) {
        const seletor = document.querySelector('[data-nivel-materia="' + materia.id + '"]');
        const individual = seletor ? seletor.value : "auto";
        mapa[materia.name] = individual !== "auto"
            ? individual
            : estrategia === "inteligente"
                ? recomendarNivelDaMateria(materia.name)
                : estrategia;
    });

    const quantidade = limitarQuantidadeQuestoes(
        document.querySelector("#quantidade-simuladao").value
    );

    return { estrategia: estrategia, mapa: mapa, quantidade: quantidade };
}

function limitarQuantidadeQuestoes(valor) {
    return Math.min(75, Math.max(5, Math.round(Number(valor) || 5)));
}

async function gerarQuestoesEmLotes(payload, quantidadeTotal) {
    const questoes = [];
    const orientacoes = [];
    const tamanhoDoLote = 20;
    let tentativas = 0;

    while (questoes.length < quantidadeTotal && tentativas < 5) {
        tentativas++;
        const quantidade = Math.min(tamanhoDoLote, quantidadeTotal - questoes.length);
        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...payload,
                quantidade: quantidade,
                arquivos: arquivosPdfParaIA,
                perguntasAnteriores: questoes.map(function (questao) {
                    return questao.pergunta || "";
                })
            })
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível criar as questões.");
        }

        const novas = Array.isArray(dados.questoes) ? dados.questoes : [];
        if (novas.length === 0) {
            throw new Error("A IA não conseguiu criar questões com os materiais encontrados.");
        }

        const chavesExistentes = new Set(questoes.map(function (questao) {
            return normalizarPesquisa(questao.pergunta || "");
        }));
        const comprovadasENovas = novas.filter(function (questao) {
            const chave = normalizarPesquisa(questao.pergunta || "");
            return Boolean(
                chave &&
                questao.fonte &&
                questao.evidencia &&
                !chavesExistentes.has(chave)
            );
        });

        questoes.push(...comprovadasENovas.slice(0, quantidade));
        if (dados.orientacao) orientacoes.push(dados.orientacao);
        if (dados.aviso) orientacoes.push(dados.aviso);

        if (comprovadasENovas.length < quantidade) break;
    }

    return {
        questoes: questoes.slice(0, quantidadeTotal),
        orientacao: orientacoes.join(" ") || "Use o resultado para escolher o que revisar.",
        aviso: questoes.length < quantidadeTotal
            ? "A Maltéria encontrou fonte suficiente para " + questoes.length +
              " questões. As demais não foram inventadas."
            : ""
    };
}

function rotuloNivelSimuladao(nivel) {
    return { reforco: "reforço", gradual: "gradual", desafio: "desafio" }[nivel] || "gradual";
}

function atualizarRecomendacaoSimuladao() {
    const area = document.querySelector("#recomendacao-simuladao");
    if (!area) return;

    const ids = Array.from(
        document.querySelectorAll('input[name="materia-simuladao"]:checked')
    ).map(function (campo) { return campo.value; });
    const materias = (Array.isArray(turmasClassroom) ? turmasClassroom : [])
        .filter(function (turma) { return ids.includes(String(turma.id)); });

    if (materias.length === 0) {
        area.innerHTML = "<strong>Inteligência Maltéria</strong><p>Selecione as matérias. A recomendação aparecerá aqui.</p>";
        return;
    }

    const configuracao = configuracaoDoSimuladao(materias);
    const niveis = materias.map(function (materia) {
        return "<li><strong>" + protegerTexto(materia.name) + ":</strong> " +
            rotuloNivelSimuladao(configuracao.mapa[materia.name]) + "</li>";
    }).join("");

    area.innerHTML = `
        <strong>✨ Recomendação da Maltéria</strong>
        <p>Serão criadas aproximadamente <b>${configuracao.quantidade} questões</b>. Sem histórico suficiente, o nível começa gradual; desafio só é recomendado depois de acertos consistentes.</p>
        <ul>${niveis}</ul>
    `;
}

async function criarSimuladaoGeral() {
    const status = document.querySelector("#status-simuladao");
    const area = document.querySelector("#resultado-simuladao");
    const botao = document.querySelector("#criar-simuladao");
    const ids = Array.from(
        document.querySelectorAll('input[name="materia-simuladao"]:checked')
    ).map(function (campo) { return campo.value; });

    if (!tokenClassroom) {
        status.textContent = "Conecte a conta escolar do Google primeiro.";
        return;
    }

    if (ids.length < 1) {
        status.textContent = "Escolha pelo menos uma matéria.";
        return;
    }

    const materias = turmasClassroom.filter(function (turma) {
        return ids.includes(String(turma.id));
    });
    const dias = Number(document.querySelector("#periodo-simuladao").value) || 14;
    const configuracao = configuracaoDoSimuladao(materias);
    const dificuldade = configuracao.estrategia;
    const modalidade = document.querySelector("#modalidade-simuladao").value;
    const modalidadeIA = modalidade === "manual" ? "discursiva" : modalidade;
    const dataEspecifica = document.querySelector("#data-simuladao").value;
    const fim = dataEspecifica ? new Date(dataEspecifica + "T12:00:00") : new Date();
    const inicio = new Date(fim);
    if (!dataEspecifica) inicio.setDate(inicio.getDate() - (dias - 1));

    botao.disabled = true;
    area.classList.add("escondido");
    status.textContent = "Reunindo atividades e materiais das matérias escolhidas...";

    try {
        arquivosPdfParaIA = [];
        const conteudo = await obterConteudoSimuladao(
            materias,
            dataParaCampo(inicio),
            dataParaCampo(fim)
        );

        status.textContent = "Criando " + configuracao.quantidade + " questões com níveis ajustados por matéria...";

        const dados = await gerarQuestoesEmLotes({
            tipo: "simuladao",
            materia: materias.map(function (item) { return item.name; }).join(", "),
            titulo: "Simuladão dos últimos " + dias + " dias",
            conteudo: conteudo,
            dificuldade: dificuldade,
            modalidade: modalidadeIA,
            mapaDificuldade: configuracao.mapa
        }, configuracao.quantidade);

        if (modalidade === "manual") {
            desenharListaSimuladoParaImprimir(dados, {
                area: area,
                titulo: "Simuladão para fazer à mão",
                materias: materias.map(function (item) { return item.name; }),
                inicio: dataParaCampo(inicio),
                fim: dataParaCampo(fim)
            });
        } else {
            desenharSimuladaoInterativo(dados, {
                dias: dias,
                dificuldade: dificuldade,
                modalidade: modalidade,
                tipoRegistro: "simuladao",
                materias: materias.map(function (item) { return item.name; })
            });
        }
        status.textContent = "Simuladão pronto. Faça no seu ritmo.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
    }
}

async function obterConteudoSimuladao(materias, inicio, fim) {
    let anexosLidos = 0;
    let texto = `SIMULADÃO MALTÉRIA\nPERÍODO: ${inicio} até ${fim}\n`;

    for (const materia of materias) {
        const respostas = await Promise.all([
            chamarClassroom("courses/" + materia.id + "/courseWork?pageSize=100"),
            chamarClassroom("courses/" + materia.id + "/courseWorkMaterials?pageSize=100")
        ]);
        const periodo = { inicio: inicio, fim: fim };
        const atividades = (respostas[0].courseWork || [])
            .filter(function (item) { return itemEstaNoPeriodoDeEstudo(item, periodo); })
            .slice(0, 12);
        const materiais = (respostas[1].courseWorkMaterial || [])
            .filter(function (item) { return itemEstaNoPeriodoDeEstudo(item, periodo); })
            .slice(0, 12);
        const anexos = [];

        texto += `\n=== ${materia.name} ===\n`;
        atividades.forEach(function (item) {
            recolherAnexos(item.materials, anexos);
            texto += "ATIVIDADE: " + (item.title || "") +
                "\n" + (item.description || "") +
                descreverMateriaisClassroom(item.materials) + "\n";
        });
        materiais.forEach(function (item) {
            recolherAnexos(item.materials, anexos);
            texto += "MATERIAL: " + (item.title || "") +
                "\n" + (item.description || "") +
                descreverMateriaisClassroom(item.materials) + "\n";
        });

        const anexosUnicos = Array.from(new Map(anexos.map(function (anexo) {
            return [anexo.id, anexo];
        })).values()).slice(0, 8);

        for (const anexo of anexosUnicos) {
            try {
                const conteudoAnexo = await lerArquivoDoDrive(anexo.id);
                texto += "\nFONTE/ARQUIVO: " + anexo.nome +
                    "\nCONTEUDO REAL DO ARQUIVO:\n" + conteudoAnexo + "\n";
                anexosLidos++;
            } catch (erro) {
                console.warn("Nao foi possivel ler o anexo do simulado:", anexo.nome, erro);
            }
        }

        const uploads = uploadsDaSessao.filter(function (upload) {
            return String(upload.materiaId) === String(materia.id) &&
                (!upload.data || (upload.data >= inicio && upload.data <= fim));
        });

        uploads.forEach(function (upload) {
            texto += "\nFONTE/UPLOAD DO ALUNO: " + upload.nome +
                "\nCONTEUDO INFORMADO:\n" +
                (upload.texto || "Arquivo visual enviado para leitura.") + "\n";
            if (upload.arquivoIA) adicionarPdfParaIA(upload.arquivoIA);
        });

        if (atividades.length + materiais.length === 0) {
            texto += "Nenhum item publicado dentro deste período.\n";
        }
    }

    texto += "\nANEXOS LIDOS OU ENVIADOS PARA A IA: " + anexosLidos + "\n";

    if (texto.length < 240) {
        throw new Error("Não encontrei material suficiente no período escolhido.");
    }

    return texto.slice(0, 60000);
}

function desenharListaSimuladoParaImprimir(dados, configuracao) {
    const area = configuracao.area || document.querySelector("#resultado-simuladao");
    const questoes = Array.isArray(dados.questoes) ? dados.questoes : [];
    if (!questoes.length) throw new Error("A IA não conseguiu criar a lista solicitada.");

    const enunciados = questoes.map(function (questao, indice) {
        return `
            <article class="questao-folha">
                <p><strong>${indice + 1}.</strong> ${protegerTexto(questao.pergunta || "")}</p>
                <div class="linhas-resposta" style="--quantidade-linhas: 6"></div>
            </article>
        `;
    }).join("");
    const gabarito = questoes.map(function (questao, indice) {
        return `
            <li><strong>${indice + 1}.</strong> ${protegerTexto(
                questao.respostaModelo || questao.explicacao || "Consulte o material estudado."
            )}</li>
        `;
    }).join("");

    area.innerHTML = `
        <div class="acoes-lista-impressa">
            <p>Faça à mão e abra o gabarito somente depois de terminar.</p>
            <button class="botao-principal imprimir-simulado-manual" type="button">🖨️ Imprimir ou salvar em PDF</button>
        </div>
        <section class="folha-impressa">
            <header>
                <span class="marca-folha">MALTÉRIA</span>
                <h2>${protegerTexto(configuracao.titulo || "Lista de exercícios")}</h2>
                <p>${protegerTexto(configuracao.materias.join(" • "))}</p>
                <div class="identificacao-folha"><span>Nome: ____________________________________</span><span>Data: ____/____/________</span></div>
            </header>
            <main>${enunciados}</main>
        </section>
        <details class="gabarito-lista"><summary>Ver gabarito depois de terminar</summary><ol>${gabarito}</ol></details>
    `;
    area.classList.remove("escondido");
    area.querySelector(".imprimir-simulado-manual").addEventListener("click", function () {
        document.body.classList.add("imprimindo-lista");
        window.print();
        setTimeout(function () { document.body.classList.remove("imprimindo-lista"); }, 500);
    });
}

function desenharSimuladaoInterativo(dados, configuracao) {
    const area = configuracao.area || document.querySelector("#resultado-simuladao");
    const questoes = Array.isArray(dados.questoes) ? dados.questoes : [];
    const discursiva = configuracao.modalidade === "discursiva";

    if (questoes.length === 0) {
        throw new Error("A IA não conseguiu preparar questões com os materiais encontrados.");
    }

    let atual = 0;
    let pontos = 0;
    const respostasDoSimulado = [];

    function fonteDaQuestao(questao) {
        return `
            <div class="fonte-questao-simuladao">
                <strong>Fonte usada</strong>
                <p>${protegerTexto(questao.fonte || "Material da disciplina")}</p>
                <blockquote>${protegerTexto(questao.evidencia || "")}</blockquote>
            </div>
        `;
    }

    function desenhar() {
        const questao = questoes[atual];
        const campoResposta = discursiva
            ? `
                <label class="resposta-discursiva">
                    Sua resposta
                    <textarea id="resposta-discursiva-simuladao" rows="7" placeholder="Escreva seu raciocínio antes de conferir a resposta orientadora."></textarea>
                </label>
                <button id="conferir-discursiva-simuladao" class="botao-principal" type="button">Conferir resposta orientadora</button>
            `
            : `
                <div class="alternativas-simuladao">
                    ${(questao.alternativas || []).map(function (alternativa, indice) {
                        return `<button class="alternativa" data-indice="${indice}" type="button">${protegerTexto(alternativa)}</button>`;
                    }).join("")}
                </div>
            `;

        area.innerHTML = `
            <div class="cabecalho-questao-simuladao">
                <span>${protegerTexto(questao.materia || "Simuladão")}</span>
                <small>Questão ${atual + 1} de ${questoes.length} · ${protegerTexto(questao.nivel || "progressiva")}</small>
            </div>
            <h3>${protegerTexto(questao.pergunta)}</h3>
            ${campoResposta}
            <div id="retorno-simuladao"></div>
        `;
        area.classList.remove("escondido");

        if (discursiva) {
            area.querySelector("#conferir-discursiva-simuladao").addEventListener("click", function () {
                const resposta = area.querySelector("#resposta-discursiva-simuladao").value.trim();
                if (!resposta) {
                    area.querySelector("#retorno-simuladao").textContent = "Escreva sua tentativa antes de conferir.";
                    return;
                }
                mostrarRetornoDiscursivo(questao);
            });
        } else {
            area.querySelectorAll(".alternativa").forEach(function (botao) {
                botao.addEventListener("click", function () {
                    responder(Number(botao.dataset.indice));
                });
            });
        }
    }

    function mostrarRetornoDiscursivo(questao) {
        const campoResposta = area.querySelector("#resposta-discursiva-simuladao");
        const respostaAluno = campoResposta.value.trim();
        respostasDoSimulado.push({
            materia: questao.materia || configuracao.materias.join(", "),
            pergunta: questao.pergunta || "",
            respostaAluno: respostaAluno,
            respostaCorreta: questao.respostaModelo || questao.explicacao || "Resposta orientadora não registrada.",
            acertou: null,
            explicacao: questao.explicacao || "",
            fonte: questao.fonte || "",
            evidencia: questao.evidencia || ""
        });
        campoResposta.disabled = true;
        area.querySelector("#conferir-discursiva-simuladao").disabled = true;
        area.querySelector("#retorno-simuladao").innerHTML = `
            <div class="arquivo">
                <strong>📝 Resposta orientadora</strong>
                <p>${protegerTexto(questao.respostaModelo || questao.explicacao || "Compare sua resposta com os materiais usados no simulado.")}</p>
                <p>${protegerTexto(questao.explicacao || "")}</p>
                ${fonteDaQuestao(questao)}
                <button id="avancar-simuladao" class="botao-principal" type="button">${atual + 1 < questoes.length ? "Próxima questão" : "Concluir"}</button>
            </div>
        `;
        prepararAvanco();
    }

    function responder(indice) {
        const questao = questoes[atual];
        const acertou = indice === Number(questao.correta);
        if (acertou) pontos++;

        respostasDoSimulado.push({
            materia: questao.materia || configuracao.materias.join(", "),
            pergunta: questao.pergunta || "",
            respostaAluno: (questao.alternativas || [])[indice] || "Não registrada",
            respostaCorreta: (questao.alternativas || [])[Number(questao.correta)] || "Não registrada",
            acertou: acertou,
            explicacao: questao.explicacao || "",
            fonte: questao.fonte || "",
            evidencia: questao.evidencia || ""
        });

        area.querySelectorAll(".alternativa").forEach(function (botao, indiceBotao) {
            botao.disabled = true;
            if (indiceBotao === Number(questao.correta)) botao.classList.add("correta");
            else if (indiceBotao === indice) botao.classList.add("errada");
        });

        area.querySelector("#retorno-simuladao").innerHTML = `
            <div class="arquivo">
                <strong>${acertou ? "✅ Boa estratégia!" : "💡 Esta é uma oportunidade de revisão."}</strong>
                <p>${protegerTexto(questao.explicacao || "")}</p>
                ${fonteDaQuestao(questao)}
                <button id="avancar-simuladao" class="botao-principal" type="button">${atual + 1 < questoes.length ? "Próxima questão" : "Ver resultado"}</button>
            </div>
        `;

        prepararAvanco();
    }

    function prepararAvanco() {
        area.querySelector("#avancar-simuladao").addEventListener("click", function () {
            atual++;
            if (atual < questoes.length) {
                desenhar();
                return;
            }

            registrarPraticaLocal({
                tipo: configuracao.tipoRegistro || "simuladao",
                materia: configuracao.materias.join(", "),
                periodo: "últimos " + configuracao.dias + " dias",
                acertos: pontos,
                total: discursiva ? 0 : questoes.length,
                questoesConcluidas: questoes.length,
                avaliavel: !discursiva,
                gabarito: respostasDoSimulado,
                minutos: Math.max(20, questoes.length * 2)
            });

            area.innerHTML = `
                <h2>Prática concluída</h2>
                <p>${discursiva
                    ? `Você respondeu <strong>${questoes.length}</strong> questões discursivas e conferiu as respostas orientadoras.`
                    : `Você acertou <strong>${pontos} de ${questoes.length}</strong> questões.`}</p>
                <p>${protegerTexto(dados.orientacao || "Use o resultado para escolher o que revisar. Não se trata de uma nota escolar.")}</p>
            `;
        });
    }

    desenhar();
}

function restaurarAnaliseEvolucao() {
    try {
        const analise = JSON.parse(
            localStorage.getItem(chaveAnaliseEvolucao()) || "null"
        );

        if (analise) {
            desenharAnaliseEvolucao(analise);
        }
    } catch (erro) {
        localStorage.removeItem(chaveAnaliseEvolucao());
    }
}

async function analisarNivelEvolucao() {
    const boletim = document.querySelector("#boletim-evolucao").files[0];
    const avaliacoes = Array.from(
        document.querySelector("#avaliacoes-evolucao").files
    );
    const consentimento = document.querySelector("#consentimento-evolucao").checked;
    const objetivo = document.querySelector("#objetivo-evolucao").value;
    const status = document.querySelector("#status-evolucao");
    const botao = document.querySelector("#analisar-evolucao");

    if (!boletim) {
        status.textContent = "Envie o boletim escolar para iniciar a análise.";
        return;
    }

    if (!consentimento) {
        status.textContent = "Confirme a autorização para a análise temporária dos documentos.";
        return;
    }

    if (avaliacoes.length > 5) {
        status.textContent = "Escolha no máximo 5 provas ou folhas de exercícios.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Analisando documentos...";
    status.textContent = "Preparando o boletim e as avaliações com segurança...";

    try {
        const arquivosOriginais = [
            { arquivo: boletim, categoria: "boletim" },
            ...avaliacoes.map(function (arquivo) {
                return { arquivo: arquivo, categoria: "avaliacao" };
            })
        ];

        const arquivos = [];
        let tamanhoTotal = 0;

        for (const item of arquivosOriginais) {
            const preparado = await prepararArquivoEvolucao(
                item.arquivo,
                item.categoria
            );

            tamanhoTotal += preparado.tamanho;
            arquivos.push(preparado);
        }

        if (tamanhoTotal > 3000000) {
            throw new Error(
                "Os documentos ficaram grandes demais. Envie menos arquivos ou fotos com tamanho menor."
            );
        }

        status.textContent = "A inteligência da Maltéria está identificando notas, dificuldades e pontos fortes...";

        const resposta = await fetch(ENDERECO_IA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "nivel_evolucao",
                materia: "Desempenho escolar geral",
                conteudo: "Análise de boletim e avaliações enviados pelo aluno.",
                objetivo: objetivo,
                arquivos: arquivos.map(function (arquivo) {
                    return {
                        nome: arquivo.nome,
                        categoria: arquivo.categoria,
                        mimeType: arquivo.mimeType,
                        data: arquivo.data
                    };
                })
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível analisar os documentos.");
        }

        localStorage.setItem(
            chaveAnaliseEvolucao(),
            JSON.stringify(dados)
        );

        desenharAnaliseEvolucao(dados);
        status.textContent = "Análise concluída. Os arquivos enviados não foram guardados no histórico.";
    } catch (erro) {
        console.error(erro);
        status.textContent = traduzirErroDaInteligencia(erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = "✨ Analisar meu nível";
    }
}

async function prepararArquivoEvolucao(arquivo, categoria) {
    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error("Use somente imagens JPG, PNG, WEBP ou arquivos PDF.");
    }

    let blob = arquivo;

    if (arquivo.type.startsWith("image/")) {
        blob = await comprimirImagemEvolucao(arquivo);
    } else if (arquivo.size > 2500000) {
        throw new Error("O PDF deve ter no máximo 2,5 MB.");
    }

    const dataUrl = await lerBlobComoDataUrl(blob);

    return {
        nome: arquivo.name,
        categoria: categoria,
        mimeType: blob.type || arquivo.type,
        data: dataUrl.split(",")[1],
        tamanho: blob.size
    };
}

function lerBlobComoDataUrl(blob) {
    return new Promise(function (resolve, reject) {
        const leitor = new FileReader();
        leitor.onload = function () { resolve(leitor.result); };
        leitor.onerror = function () { reject(new Error("Não foi possível ler um dos arquivos.")); };
        leitor.readAsDataURL(blob);
    });
}

async function comprimirImagemEvolucao(arquivo) {
    const url = URL.createObjectURL(arquivo);

    try {
        const imagem = await new Promise(function (resolve, reject) {
            const elemento = new Image();
            elemento.onload = function () { resolve(elemento); };
            elemento.onerror = function () { reject(new Error("Não foi possível abrir uma das imagens.")); };
            elemento.src = url;
        });

        const limite = 1600;
        const escala = Math.min(1, limite / Math.max(imagem.width, imagem.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(imagem.width * escala);
        canvas.height = Math.round(imagem.height * escala);
        canvas.getContext("2d").drawImage(imagem, 0, 0, canvas.width, canvas.height);

        return await new Promise(function (resolve, reject) {
            canvas.toBlob(
                function (blob) {
                    if (blob) resolve(blob);
                    else reject(new Error("Não foi possível preparar uma das imagens."));
                },
                "image/jpeg",
                0.78
            );
        });
    } finally {
        URL.revokeObjectURL(url);
    }
}

function desenharAnaliseEvolucao(dados) {
    const area = document.querySelector("#resultado-evolucao");
    const indice = Math.max(0, Math.min(100, Number(dados.indicePotencial) || 0));
    const confianca = protegerTexto(dados.confianca || "Não informada");
    const materias = Array.isArray(dados.materiasPrioritarias)
        ? dados.materiasPrioritarias
        : [];
    const plano = Array.isArray(dados.planoSemanal) ? dados.planoSemanal : [];

    area.innerHTML = `
        <div class="painel-indice-evolucao">
            <div class="circulo-evolucao" style="--indice-evolucao: ${indice * 3.6}deg">
                <strong>${indice}%</strong>
                <span>oportunidade de evolução</span>
            </div>
            <div>
                <small>ESTIMATIVA DO PLANO DE ESTUDOS</small>
                <h2>Há espaço para evoluir — e isso é uma boa notícia</h2>
                <p class="explicacao-percentual-evolucao">
                    Os ${indice}% não medem sua inteligência, capacidade ou valor pessoal.
                    Eles representam quanto a Maltéria estima que organização, explicações
                    e prática direcionada podem ajudar neste momento.
                </p>
                <small>NÍVEL INICIAL RECOMENDADO</small>
                <h2>${protegerTexto(dados.nivelDificuldade || "Intermediário")}</h2>
                <p>${protegerTexto(dados.resumo || "")}</p>
            </div>
        </div>

        <section class="como-ler-evolucao">
            <h3>🔎 Como interpretar este resultado</h3>
            <div>
                <article>
                    <strong>O que significa</strong>
                    <p>É uma estimativa da oportunidade de melhora encontrada nos materiais analisados.</p>
                </article>
                <article>
                    <strong>O que não significa</strong>
                    <p>Não é nota de inteligência, diagnóstico, promessa de resultado nem limite do aluno.</p>
                </article>
                <article>
                    <strong>Base da análise</strong>
                    <p>Boletim, provas, listas ou folhas que foram enviados. Confiança da análise: ${confianca}.</p>
                </article>
                <article>
                    <strong>O que acontece depois</strong>
                    <p>A estimativa muda quando entram novos boletins, atividades e resultados de estudo.</p>
                </article>
            </div>
        </section>

        <p class="mensagem-formal-evolucao">
            A Maltéria encontrou uma oportunidade estimada de evolução de ${indice}% com
            um plano consistente. A plataforma ajuda com organização, explicações e prática;
            o progresso real acontece gradualmente e também depende da participação do aluno,
            do tempo disponível e do acompanhamento escolar.
        </p>

        <div class="grade-diagnostico-evolucao">
            <article>
                <h3>✨ Pontos fortes</h3>
                <ul>${(dados.pontosFortes || []).map(function (item) {
                    return `<li>${protegerTexto(item)}</li>`;
                }).join("")}</ul>
            </article>
            <article>
                <h3>🎯 Pontos de atenção</h3>
                <ul>${(dados.pontosAtencao || []).map(function (item) {
                    return `<li>${protegerTexto(item)}</li>`;
                }).join("")}</ul>
            </article>
        </div>

        <section class="prioridades-evolucao">
            <h3>Prioridades por matéria</h3>
            ${materias.map(function (item) {
                return `
                    <article>
                        <strong>${protegerTexto(item.materia)}</strong>
                        <span>${protegerTexto(item.situacao)}</span>
                        <p>${protegerTexto(item.acao)}</p>
                    </article>
                `;
            }).join("")}
        </section>

        <section class="plano-evolucao">
            <h3>Plano inicial recomendado</h3>
            ${plano.map(function (item) {
                return `
                    <article>
                        <strong>${protegerTexto(item.dia)}</strong>
                        <span>${protegerTexto(item.foco)} · ${Number(item.minutos) || 20} min</span>
                        <p>${protegerTexto(item.atividade)}</p>
                    </article>
                `;
            }).join("")}
        </section>

        <p class="aviso-indice-evolucao">
            <strong>Importante:</strong> esta porcentagem não representa “quanto o aluno é
            inteligente” nem significa que falta uma parte de sua capacidade. É apenas uma
            estimativa educacional de oportunidade, criada a partir dos documentos enviados.
            Ela não garante aumento equivalente nas notas e deve ser recalculada quando houver
            um novo boletim ou novas avaliações.
        </p>
    `;

    area.classList.remove("escondido");
    area.scrollIntoView({ behavior: "smooth", block: "start" });
}

document
    .querySelector("#abrir-administracao")
    .addEventListener("click", function () {
        if (!usuarioEhDono(usuarioAtual)) {
            return;
        }

        desenharUsuariosAdministracao();
        paginaAnteriorFerramenta =
            paginaVisivelAtual();
        mostrarPaginaInterna(
            paginaAdministracao
        );
    });

document
    .querySelector("#fechar-administracao")
    .addEventListener("click", function () {
        mostrarPaginaInterna(
            paginaAnteriorFerramenta ||
            paginaPrincipal
        );
    });

/* MINHA CONTA */

const modalConta =
    document.querySelector("#modal-conta");

document
    .querySelector("#minha-conta")
    .addEventListener("click", function () {
        modalConta.classList.remove("escondido");
    });

document
    .querySelector("#fechar-conta")
    .addEventListener("click", function () {
        modalConta.classList.add("escondido");
    });

document
    .querySelector("#alterar-minha-senha")
    .addEventListener("click", function () {
        modalConta.classList.add("escondido");
        abrirModalTrocaSenha(
            "Alterar minha senha",
            "Crie uma nova senha com pelo menos 8 caracteres. A senha atual continuará protegida e não será exibida.",
            "conta"
        );
    });

document
    .querySelector("#sair")
    .addEventListener("click", async function () {
        if (window.MalteriaBanco && window.MalteriaBanco.configurado) {
            try {
                await window.MalteriaBanco.sair();
            } catch (erro) {
                console.error("Não foi possível encerrar a sessão do banco.", erro);
            }
        }

        usuarioAtual = null;
        tokenClassroom = "";
        clienteClassroom = null;
        turmasClassroom = [];
        atividadesPorTurma = {};
        tentativaSilenciosaClassroom = false;

        modalConta.classList.add("escondido");

        mostrarTela(telaEscolha);
    });

/* FUNÇÕES AUXILIARES */

function formatarPrazo(data) {
    if (!data) {
        return "Sem prazo informado";
    }

    return (
        "Entrega: " +
        String(data.day).padStart(2, "0") +
        "/" +
        String(data.month).padStart(2, "0") +
        "/" +
        data.year
    );
}

function protegerTexto(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = texto || "";

    return elemento.innerHTML;
}
