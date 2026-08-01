import crypto from "node:crypto";

function configuracaoSupabase() {
    const url = String(
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://nyrryhhalbtuvquufzsm.supabase.co"
    ).replace(/\/$/, "");
    const chave = String(
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        ""
    ).trim();
    if (!chave || /^sb_publishable_/i.test(chave)) {
        const erro = new Error("O servidor ainda não recebeu a chave secreta do Supabase.");
        erro.status = 503;
        throw erro;
    }
    return { url, chave };
}

async function supabaseFetch(caminho, opcoes = {}) {
    const { url, chave } = configuracaoSupabase();
    const resposta = await fetch(url + caminho, {
        ...opcoes,
        headers: {
            apikey: chave,
            Authorization: opcoes.token ? "Bearer " + opcoes.token : "Bearer " + chave,
            "Content-Type": "application/json",
            Prefer: "return=representation",
            ...(opcoes.headers || {})
        }
    });
    const texto = await resposta.text();
    let dados = {};
    try { dados = texto ? JSON.parse(texto) : {}; } catch (_) { dados = { mensagem: texto }; }
    if (!resposta.ok) {
        const erro = new Error(dados.message || dados.msg || dados.mensagem || "Erro no Supabase.");
        erro.status = resposta.status;
        throw erro;
    }
    return dados;
}

async function exigirResponsavel(req) {
    const cabecalho = String(req.headers.authorization || "");
    const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
    if (!token) {
        const erro = new Error("Entre na conta para enviar o lembrete.");
        erro.status = 401;
        throw erro;
    }
    const usuario = await supabaseFetch("/auth/v1/user", { token });
    const perfis = await supabaseFetch(
        "/rest/v1/perfis?id=eq." + encodeURIComponent(usuario.id) +
        "&select=id,nome,email,tipo"
    );
    const perfil = perfis[0];
    if (!perfil || perfil.tipo !== "Responsável") {
        const erro = new Error("O lembrete por e-mail é exclusivo da conta do responsável.");
        erro.status = 403;
        throw erro;
    }
    return perfil;
}

function escaparHtml(valor) {
    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function limparEntregas(entregas) {
    if (!Array.isArray(entregas)) return [];
    return entregas.slice(0, 50).map((item) => ({
        materia: String(item.materia || "Matéria a confirmar").slice(0, 120),
        tipo: String(item.tipo || "Tarefa").slice(0, 80),
        titulo: String(item.titulo || "").slice(0, 500),
        justificativa: String(item.justificativa || "").slice(0, 1000),
        prioridade: String(item.prioridade || "Normal").slice(0, 40)
    })).filter((item) => item.titulo);
}

function limparAvisos(avisos) {
    if (!Array.isArray(avisos)) return [];
    return Array.from(new Set(
        avisos.slice(0, 30).map((aviso) => String(aviso || "").trim().slice(0, 1000)).filter(Boolean)
    ));
}

function montarEmail(perfil, dataAlvo, entregas, avisos, semAula) {
    const linhas = entregas.map((item) => `
        <tr>
            <td style="padding:12px;border-bottom:1px solid #e8e1ff"><strong>${escaparHtml(item.materia)}</strong></td>
            <td style="padding:12px;border-bottom:1px solid #e8e1ff">${escaparHtml(item.tipo)}</td>
            <td style="padding:12px;border-bottom:1px solid #e8e1ff">
                <strong>${escaparHtml(item.titulo)}</strong>
                ${item.justificativa ? `<br><small>${escaparHtml(item.justificativa)}</small>` : ""}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e8e1ff">${escaparHtml(item.prioridade)}</td>
        </tr>
    `).join("");
    const blocoEntregas = entregas.length ? `
        <table style="width:100%;border-collapse:collapse">
            <thead><tr style="text-align:left;background:#f6f2ff">
                <th style="padding:12px">Matéria</th><th style="padding:12px">Tipo</th>
                <th style="padding:12px">O que fazer</th><th style="padding:12px">Prioridade</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
        </table>
    ` : `
        <p style="padding:14px;border-radius:12px;background:#f5f3ff">
            Nenhum dever com prazo confirmado para esta data.
        </p>
    `;
    const blocoAvisos = avisos.length ? `
        <h2 style="margin-top:24px">📢 Avisos</h2>
        <ul style="padding-left:22px">${avisos.map((aviso) =>
            `<li style="margin:8px 0">${escaparHtml(aviso)}</li>`
        ).join("")}</ul>
    ` : `
        <h2 style="margin-top:24px">📢 Avisos</h2>
        <p>Nenhum aviso escolar encontrado para esta data.</p>
    `;
    return `
        <div style="font-family:Arial,sans-serif;color:#25223b;max-width:760px;margin:auto">
            <div style="background:linear-gradient(135deg,#5526e8,#925cff);color:white;padding:24px;border-radius:20px 20px 0 0">
                <h1 style="margin:0">Maltéria · Para amanhã</h1>
                <p style="margin:8px 0 0">Olá, ${escaparHtml(perfil.nome || "responsável")}.</p>
            </div>
            <div style="padding:24px;border:1px solid #e8e1ff;border-radius:0 0 20px 20px">
                ${semAula ? `
                    <p style="padding:14px;border-radius:12px;background:#ecfff8">
                        <strong>Não há aulas regulares previstas nessa data.</strong>
                    </p>
                ` : ""}
                <h2>Deveres e entregas</h2>
                <p>Estas são as tarefas com prazo confirmado para <strong>${escaparHtml(dataAlvo)}</strong>.</p>
                ${blocoEntregas}
                ${blocoAvisos}
                <p style="color:#747087;font-size:13px;margin-top:20px">
                    A Maltéria separa deveres de comunicados. Confira informações importantes também na Agenda e no Google Classroom da escola.
                </p>
            </div>
        </div>
    `;
}

async function enviarPeloResend(destinatario, assunto, html) {
    const chave = String(process.env.RESEND_API_KEY || "").trim();
    const remetente = String(process.env.EMAIL_REMETENTE || "Maltéria <onboarding@resend.dev>").trim();
    if (!chave) {
        const erro = new Error("Falta configurar RESEND_API_KEY na Vercel.");
        erro.status = 503;
        throw erro;
    }
    const resposta = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + chave, "Content-Type": "application/json" },
        body: JSON.stringify({ from: remetente, to: [destinatario], subject: assunto, html })
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        const erro = new Error(dados.message || "O serviço de e-mail recusou o envio.");
        erro.status = resposta.status;
        throw erro;
    }
    return dados;
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ erro: "Método não permitido." });
        }
        const perfil = await exigirResponsavel(req);
        const corpo = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const dataAlvo = String(corpo.dataAlvo || "");
        const entregas = limparEntregas(corpo.entregas);
        const avisos = limparAvisos(corpo.avisos);
        const semAula = corpo.semAula === true;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAlvo)) {
            return res.status(400).json({ erro: "Data do lembrete inválida." });
        }
        const resumo = JSON.stringify({ entregas, avisos, semAula });
        const hash = crypto.createHash("sha256").update(resumo).digest("hex");
        const existentes = await supabaseFetch(
            "/rest/v1/emails_deveres_enviados?responsavel_id=eq." +
            encodeURIComponent(perfil.id) + "&data_alvo=eq." + encodeURIComponent(dataAlvo) +
            "&select=id,conteudo_hash"
        );
        if (existentes[0] && existentes[0].conteudo_hash === hash) {
            return res.status(200).json({ enviado: false, motivo: "ja-enviado" });
        }

        await enviarPeloResend(
            perfil.email,
            semAula
                ? "Maltéria: amanhã não há aulas regulares (" + dataAlvo + ")"
                : "Maltéria: deveres para amanhã (" + dataAlvo + ")",
            montarEmail(perfil, dataAlvo, entregas, avisos, semAula)
        );

        await supabaseFetch("/rest/v1/emails_deveres_enviados?on_conflict=responsavel_id,data_alvo", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify({
                responsavel_id: perfil.id,
                data_alvo: dataAlvo,
                conteudo_hash: hash,
                enviado_em: new Date().toISOString()
            })
        });
        return res.status(200).json({ enviado: true });
    } catch (erro) {
        console.error(erro);
        return res.status(erro.status || 500).json({
            erro: erro.message || "Não foi possível enviar o lembrete."
        });
    }
}
