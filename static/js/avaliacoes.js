let avaliacoesLista = [];

let perfilUsuario = "";


// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarAvaliacoes();


        const pesquisa =
            document.getElementById(
                "pesquisa"
            );


        if (pesquisa) {

            pesquisa.addEventListener(
                "input",
                pesquisarAvaliacao
            );

        }

    }
);


// ==============================
// CARREGAR AVALIAÇÕES
// ==============================

async function carregarAvaliacoes() {

    const tabela =
        document.getElementById(
            "lista-avaliacoes"
        );


    if (!tabela) return;


    try {

        const resposta =
            await fetch(
                "/api/avaliacoes"
            );


        // ==============================
        // NÃO AUTENTICADO
        // ==============================

        if (resposta.status === 401) {

            window.location.href = "/";

            return;

        }


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar avaliações."
            );

        }


        const dados =
            await resposta.json();


        // ==============================
        // NOVO FORMATO DA API
        // ==============================

        perfilUsuario =
            dados.perfil || "";


        avaliacoesLista =
            dados.avaliacoes || [];


        // Garantir que seja array

        if (!Array.isArray(avaliacoesLista)) {

            avaliacoesLista = [];

        }


        console.log(
            "Perfil logado:",
            perfilUsuario
        );


        console.log(
            "Avaliações:",
            avaliacoesLista
        );


        renderizarAvaliacoes(
            avaliacoesLista
        );


        atualizarNumeros(
            avaliacoesLista
        );


        ajustarInterface();

    }

    catch (erro) {

        console.error(
            "Erro ao carregar avaliações:",
            erro
        );


        alert(
            "Erro ao carregar avaliações."
        );

    }

}


// ==============================
// AJUSTAR INTERFACE
// ==============================

function ajustarInterface() {

    const ehGestor =
        perfilUsuario === "Gestor";


    // ==============================
    // BOTÃO NOVA AVALIAÇÃO
    // ==============================

    const botaoNova =
        document.querySelector(
            ".nova-avaliacao"
        );


    if (botaoNova) {

        botaoNova.style.display =
            ehGestor
                ? "inline-flex"
                : "none";

    }


    // ==============================
    // TÍTULO
    // ==============================

    const titulo =
        document.querySelector(
            ".topo h1"
        );


    if (titulo) {

        titulo.textContent =
            ehGestor
                ? "Avaliações"
                : "Minhas Avaliações";

    }


    // ==============================
    // DESCRIÇÃO
    // ==============================

    const descricao =
        document.querySelector(
            ".topo p"
        );


    if (descricao) {

        descricao.textContent =
            ehGestor
                ? "Gerencie as avaliações dos colaboradores."
                : "Acompanhe suas avaliações e seu desempenho.";

    }


    // ==============================
    // COLUNA AÇÕES
    // ==============================

    const tabela =
        document.querySelector(
            ".tabela table"
        );


    if (!tabela) return;


    const cabecalho =
        tabela.querySelector(
            "thead tr"
        );


    if (!cabecalho) return;


    const colunaAcoes =
        cabecalho.querySelector(
            ".coluna-acoes"
        );

}


// ==============================
// RENDERIZAR TABELA
// ==============================

function renderizarAvaliacoes(lista) {

    const tabela =
        document.getElementById(
            "lista-avaliacoes"
        );


    if (!tabela) return;


    tabela.innerHTML = "";


    // ==============================
    // NENHUMA AVALIAÇÃO
    // ==============================

    if (lista.length === 0) {

        const colspan =
            perfilUsuario === "Gestor"
                ? 6
                : 5;


        tabela.innerHTML = `

            <tr>

                <td
                    colspan="${colspan}"
                    style="text-align:center;"
                >

                    Nenhuma avaliação encontrada.

                </td>

            </tr>

        `;

        return;

    }


    // ==============================
    // RENDERIZAR
    // ==============================

    lista.forEach(
        avaliacao => {

            const ehGestor =
                perfilUsuario === "Gestor";


            let colunaAcoes = "";


            // ==============================
            // AÇÕES SOMENTE GESTOR
            // ==============================

            if (ehGestor) {

                colunaAcoes = `

                    <td class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editarAvaliacao(${avaliacao.id})"
                            title="Editar"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirAvaliacao(${avaliacao.id})"
                            title="Excluir"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                `;

            }


            tabela.innerHTML += `

                <tr>

                    <td>

                        ${escaparHTML(
                            avaliacao.colaborador
                            || "Não encontrado"
                        )}

                    </td>


                    <td>

                        ${escaparHTML(
                            avaliacao.periodo
                            || "-"
                        )}

                    </td>


                    <td>

                        ${escaparHTML(
                            avaliacao.tipo
                            || "-"
                        )}

                    </td>


                    <td>

                        ${formatarData(
                            avaliacao.data
                        )}

                    </td>


                    <td>

                        ${escaparHTML(
                            avaliacao.comentario
                            || ""
                        )}

                    </td>

                    <td>

                    <button 
                    class="btn-feedback"
                    onclick='abrirFeedback(${JSON.stringify(avaliacao)})'>

                    <i class="fa-solid fa-eye"></i>

                    Ver

                    </button>

                    </td>


                    ${colunaAcoes}

                </tr>

            `;

        }
    );

}


// ==============================
// PESQUISA
// ==============================

function pesquisarAvaliacao() {

    const campo =
        document.getElementById(
            "pesquisa"
        );


    if (!campo) return;


    const texto =
        campo.value
            .toLowerCase()
            .trim();


    const filtradas =
        avaliacoesLista.filter(
            avaliacao => {

                const nome =
                    (
                        avaliacao.colaborador
                        || ""
                    )
                    .toLowerCase();


                const tipo =
                    (
                        avaliacao.tipo
                        || ""
                    )
                    .toLowerCase();


                const comentario =
                    (
                        avaliacao.comentario
                        || ""
                    )
                    .toLowerCase();


                return (
                    nome.includes(texto)
                    ||
                    tipo.includes(texto)
                    ||
                    comentario.includes(texto)
                );

            }
        );


    renderizarAvaliacoes(
        filtradas
    );


    // Os cards continuam mostrando
    // os números reais, não o resultado
    // filtrado.

    atualizarNumeros(
        avaliacoesLista
    );

}


// ==============================
// CARDS
// ==============================

function atualizarNumeros(lista) {


    const total =
        document.getElementById(
            "total-avaliacoes"
        );


    const acima =
        document.getElementById(
            "avaliacoes-acima"
        );


    const dentro =
        document.getElementById(
            "avaliacoes-dentro"
        );


    const desenvolvimento =
        document.getElementById(
            "avaliacoes-desenvolvimento"
        );


    const acompanhamento =
        document.getElementById(
            "avaliacoes-acompanhamento"
        );



    if(total){

        total.innerHTML =
            lista.length;

    }



    if(acima){

        acima.innerHTML =
            lista.filter(
                avaliacao =>
                    avaliacao.periodo ===
                    "Acima das expectativas"
            ).length;

    }



    if(dentro){

        dentro.innerHTML =
            lista.filter(
                avaliacao =>
                    avaliacao.periodo ===
                    "Dentro das expectativas"
            ).length;

    }



    if(desenvolvimento){

        desenvolvimento.innerHTML =
            lista.filter(
                avaliacao =>
                    avaliacao.periodo ===
                    "Em desenvolvimento"
            ).length;

    }



    if(acompanhamento){

        acompanhamento.innerHTML =
            lista.filter(
                avaliacao =>
                    avaliacao.periodo ===
                    "Necessita acompanhamento"
            ).length;

    }

}

// ==============================
// EXCLUIR
// ==============================

async function excluirAvaliacao(id) {

    // Segurança no front-end

    if (
        perfilUsuario !== "Gestor"
    ) {

        alert(
            "Você não possui permissão para excluir avaliações."
        );

        return;

    }


    const confirmar =
        confirm(
            "Deseja excluir esta avaliação?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `/api/avaliacoes/${id}`,
                {

                    method: "DELETE"

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                dados.mensagem
                ||
                "Erro ao excluir avaliação."
            );

            return;

        }


        alert(
            dados.mensagem
            ||
            "Avaliação excluída com sucesso!"
        );


        await carregarAvaliacoes();

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao excluir avaliação."
        );

    }

}


window.excluirAvaliacao =
    excluirAvaliacao;


// ==============================
// EDITAR
// ==============================

async function editarAvaliacao(id) {

    // Segurança no front-end

    if (
        perfilUsuario !== "Gestor"
    ) {

        alert(
            "Você não possui permissão para editar avaliações."
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `/api/avaliacoes/${id}`
            );


        if (!resposta.ok) {

            const dados =
                await resposta.json();


            alert(
                dados.mensagem
                ||
                "Erro ao buscar avaliação."
            );

            return;

        }


        const avaliacao =
            await resposta.json();


        localStorage.setItem(
            "avaliacaoEditar",
            JSON.stringify(
                avaliacao
            )
        );


        window.location.href =
            "/nova-avaliacao";

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao carregar avaliação."
        );

    }

}


window.editarAvaliacao =
    editarAvaliacao;


// ==============================
// FORMATAR DATA
// ==============================

function formatarData(data) {

    if (!data) {

        return "-";

    }


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );

}


// ==============================
// PROTEGER HTML
// ==============================

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}

function abrirFeedback(avaliacao){


    document.getElementById(
        "texto-positivos"
    ).textContent =
        avaliacao.pontos_positivos ||
        "Nenhum ponto positivo informado.";



    document.getElementById(
        "texto-melhoria"
    ).textContent =
        avaliacao.pontos_melhoria ||
        "Nenhum ponto de melhoria informado.";



    document.getElementById(
        "texto-comentario"
    ).textContent =
        avaliacao.comentario ||
        "Nenhum comentário informado.";



    document.getElementById(
        "modal-feedback"
    ).style.display =
        "flex";

}



function fecharFeedback(){

    document.getElementById(
        "modal-feedback"
    ).style.display = "none";

}



window.abrirFeedback =
abrirFeedback;


window.fecharFeedback =
fecharFeedback;