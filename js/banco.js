(function () {
    "use strict";

    const config = window.MALTERIA_BANCO_CONFIG || {};
    const configurado = Boolean(
        window.supabase &&
        /^https:\/\/.+\.supabase\.co$/i.test(config.url || "") &&
        config.chavePublica &&
        !String(config.chavePublica).startsWith("COLE_AQUI")
    );

    const cliente = configurado
        ? window.supabase.createClient(config.url, config.chavePublica, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        })
        : null;

    let intervalo = null;
    let salvando = false;

    function capturarEstadoLocal() {
        const dados = {};
        const proibidas = [
            "malteriaUsuariosLocais",
            "usuarioPepiEstudos"
        ];

        for (let indice = 0; indice < localStorage.length; indice += 1) {
            const chave = localStorage.key(indice);

            if (
                !chave ||
                proibidas.includes(chave) ||
                /token|senha|oauth/i.test(chave)
            ) {
                continue;
            }

            if (!/^(malteria|pepi|classroom)/i.test(chave)) {
                continue;
            }

            dados[chave] = localStorage.getItem(chave);
        }

        return dados;
    }

    async function perfilAtual() {
        if (!cliente) return null;

        const usuarioResposta = await cliente.auth.getUser();

        if (usuarioResposta.error) {
            throw usuarioResposta.error;
        }

        const usuarioAuth = usuarioResposta.data.user;

        if (!usuarioAuth) return null;

        const resposta = await cliente
            .from("perfis")
            .select("id,nome,email,tipo,papel")
            .eq("id", usuarioAuth.id)
            .maybeSingle();

        if (resposta.error) {
            throw resposta.error;
        }

        if (resposta.data) {
            return resposta.data;
        }

        const metadados = usuarioAuth.user_metadata || {};

        return {
            id: usuarioAuth.id,
            nome:
                metadados.nome ||
                String(usuarioAuth.email || "").split("@")[0] ||
                "Usuário",
            email: usuarioAuth.email || "",
            tipo: metadados.tipo === "Responsável"
                ? "Responsável"
                : "Aluno",
            papel:
                String(usuarioAuth.email || "").toLowerCase() ===
                "pepimalti@gmail.com"
                    ? "superadmin"
                    : "usuario",
            perfilPendente: true
        };
    }

    async function cadastrar(usuario, senha) {
        if (!cliente) return null;

        const resposta = await cliente.auth.signUp({
            email: usuario.email,
            password: senha,
            options: {
                data: {
                    nome: usuario.nome,
                    tipo: usuario.tipo
                }
            }
        });

        if (resposta.error) {
            throw resposta.error;
        }

        return {
            usuario: resposta.data.user,
            precisaConfirmarEmail: !resposta.data.session
        };
    }

    async function entrar(email, senha) {
        if (!cliente) return null;

        const resposta = await cliente.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (resposta.error) {
            throw resposta.error;
        }

        const usuarioAuth = resposta.data.user;
        let perfil;

        try {
            perfil = await perfilAtual();
        } catch (erroPerfil) {
            console.warn(
                "Login realizado, mas o perfil não pôde ser carregado:",
                erroPerfil
            );

            const metadados =
                usuarioAuth && usuarioAuth.user_metadata || {};

            perfil = {
                id: usuarioAuth && usuarioAuth.id,
                nome:
                    metadados.nome ||
                    String(
                        usuarioAuth && usuarioAuth.email || email
                    ).split("@")[0],
                email: usuarioAuth && usuarioAuth.email || email,
                tipo: metadados.tipo === "Responsável"
                    ? "Responsável"
                    : "Aluno",
                papel:
                    String(
                        usuarioAuth && usuarioAuth.email || email
                    ).toLowerCase() === "pepimalti@gmail.com"
                        ? "superadmin"
                        : "usuario",
                perfilPendente: true
            };
        }

        try {
            await carregarEstado();
        } catch (erroSincronizacao) {
            console.warn(
                "Login realizado, mas os dados ainda não foram sincronizados:",
                erroSincronizacao
            );
        }

        iniciarSincronizacao();

        return Object.assign({}, perfil, {
            precisaTrocarSenha: Boolean(
                resposta.data.user &&
                resposta.data.user.user_metadata &&
                resposta.data.user.user_metadata.precisa_trocar_senha
            )
        });
    }

    async function restaurarSessao() {
        if (!cliente) return null;

        const resposta = await cliente.auth.getSession();

        if (resposta.error) {
            throw resposta.error;
        }

        const sessao = resposta.data.session;

        if (!sessao || !sessao.user) {
            return null;
        }

        let perfil;

        try {
            perfil = await perfilAtual();
        } catch (erroPerfil) {
            console.warn(
                "Sessao encontrada, mas o perfil nao pode ser carregado:",
                erroPerfil
            );

            const metadados = sessao.user.user_metadata || {};

            perfil = {
                id: sessao.user.id,
                nome:
                    metadados.nome ||
                    String(sessao.user.email || "").split("@")[0] ||
                    "Usuario",
                email: sessao.user.email || "",
                tipo: metadados.tipo === "Responsavel"
                    ? "Responsavel"
                    : "Aluno",
                papel:
                    String(sessao.user.email || "").toLowerCase() ===
                    "pepimalti@gmail.com"
                        ? "superadmin"
                        : "usuario",
                perfilPendente: true
            };
        }

        try {
            await carregarEstado();
        } catch (erroSincronizacao) {
            console.warn(
                "Sessao restaurada, mas os dados ainda nao foram sincronizados:",
                erroSincronizacao
            );
        }

        iniciarSincronizacao();

        return Object.assign({}, perfil, {
            precisaTrocarSenha: Boolean(
                sessao.user.user_metadata &&
                sessao.user.user_metadata.precisa_trocar_senha
            )
        });
    }

    async function tokenAcesso() {
        if (!cliente) return "";

        const resposta = await cliente.auth.getSession();

        if (resposta.error) {
            throw resposta.error;
        }

        return resposta.data.session
            ? resposta.data.session.access_token
            : "";
    }

    async function enviarRedefinicaoSenha(email) {
        if (!cliente) {
            throw new Error("Banco de dados não configurado.");
        }

        const origemAtual = window.location.protocol === "https:"
            ? window.location.origin
            : "https://pepi-estudos.vercel.app";

        const retorno =
            origemAtual.replace(/\/$/, "") +
            "/?recuperar-senha=1";

        const resposta = await cliente.auth.resetPasswordForEmail(
            email,
            { redirectTo: retorno }
        );

        if (resposta.error) {
            throw resposta.error;
        }
    }

    async function trocarSenhaObrigatoria(novaSenha) {
        if (
            typeof novaSenha !== "string" ||
            novaSenha.length < 8
        ) {
            throw new Error("Use pelo menos 8 caracteres.");
        }

        if (!cliente) {
            throw new Error("Banco de dados não configurado.");
        }

        const usuarioResposta = await cliente.auth.getUser();

        if (usuarioResposta.error) {
            throw usuarioResposta.error;
        }

        if (!usuarioResposta.data.user) {
            throw new Error(
                "Sua sessão expirou. Solicite um novo link de recuperação ou entre novamente."
            );
        }

        if (
            emRecuperacaoSenha() &&
            sessionStorage.getItem("malteriaRecuperacaoSenha") !==
                usuarioResposta.data.user.id
        ) {
            throw new Error(
                "Link de recuperação inválido ou expirado. Volte ao login e solicite um novo link."
            );
        }

        const metadados = Object.assign(
            {},
            usuarioResposta.data.user &&
                usuarioResposta.data.user.user_metadata,
            { precisa_trocar_senha: false }
        );

        const resposta = await cliente.auth.updateUser({
            password: novaSenha,
            data: metadados
        });

        if (resposta.error) {
            throw resposta.error;
        }

        sessionStorage.removeItem("malteriaRecuperacaoSenha");

        if (window.history && window.history.replaceState) {
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }

    function emRecuperacaoSenha() {
        const parametros = new URLSearchParams(
            window.location.search
        );

        return (
            parametros.get("recuperar-senha") === "1" ||
            Boolean(
                sessionStorage.getItem("malteriaRecuperacaoSenha")
            ) ||
            /type=recovery/i.test(window.location.hash)
        );
    }

    async function sair(opcoes = {}) {
        if (!cliente) return;

        if (
            opcoes.sincronizar !== false &&
            !emRecuperacaoSenha()
        ) {
            try {
                await salvarEstado();
            } catch (erro) {
                console.warn(
                    "Não foi possível sincronizar antes de sair:",
                    erro
                );
            }
        }

        const resposta = await cliente.auth.signOut();

        if (resposta.error) {
            throw resposta.error;
        }

        sessionStorage.removeItem("malteriaRecuperacaoSenha");

        if (intervalo) {
            window.clearInterval(intervalo);
        }

        intervalo = null;
    }

    async function salvarEstado() {
        if (
            !cliente ||
            salvando ||
            emRecuperacaoSenha()
        ) {
            return;
        }

        salvando = true;

        try {
            const usuarioResposta = await cliente.auth.getUser();
            const usuario = usuarioResposta.data.user;

            if (!usuario) return;

            const resposta = await cliente
                .from("dados_aplicativo")
                .upsert(
                    {
                        perfil_id: usuario.id,
                        dados: capturarEstadoLocal(),
                        atualizado_em: new Date().toISOString()
                    },
                    { onConflict: "perfil_id" }
                );

            if (resposta.error) {
                throw resposta.error;
            }
        } finally {
            salvando = false;
        }
    }

    async function carregarEstado() {
        if (!cliente) return;

        const usuarioResposta = await cliente.auth.getUser();
        const usuario = usuarioResposta.data.user;

        if (!usuario) return;

        const resposta = await cliente
            .from("dados_aplicativo")
            .select("dados")
            .eq("perfil_id", usuario.id)
            .maybeSingle();

        if (resposta.error) {
            throw resposta.error;
        }

        const dados = resposta.data && resposta.data.dados;

        if (!dados) return;

        Object.entries(dados).forEach(function (item) {
            if (typeof item[1] === "string") {
                localStorage.setItem(item[0], item[1]);
            }
        });
    }

    function iniciarSincronizacao() {
        if (!cliente || intervalo) return;

        intervalo = window.setInterval(function () {
            salvarEstado().catch(console.error);
        }, 12000);
    }

    window.addEventListener("pagehide", function () {
        salvarEstado().catch(function () {});
    });

    if (cliente) {
        cliente.auth.onAuthStateChange(function (evento, sessao) {
            if (evento === "SIGNED_OUT") {
                sessionStorage.removeItem(
                    "malteriaRecuperacaoSenha"
                );
            }

            if (
                evento === "PASSWORD_RECOVERY" &&
                sessao &&
                sessao.user
            ) {
                sessionStorage.setItem(
                    "malteriaRecuperacaoSenha",
                    sessao.user.id
                );

                window.dispatchEvent(
                    new CustomEvent("malteria:recuperar-senha")
                );
            }
        });
    }

    window.MalteriaBanco = {
        configurado: configurado,
        cliente: cliente,
        cadastrar: cadastrar,
        entrar: entrar,
        restaurarSessao: restaurarSessao,
        sair: sair,
        perfilAtual: perfilAtual,
        tokenAcesso: tokenAcesso,
        enviarRedefinicaoSenha: enviarRedefinicaoSenha,
        emRecuperacaoSenha: emRecuperacaoSenha,
        trocarSenhaObrigatoria: trocarSenhaObrigatoria,
        carregarEstado: carregarEstado,
        salvarEstado: salvarEstado,
        iniciarSincronizacao: iniciarSincronizacao
    };
})();
