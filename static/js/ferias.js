const API = "/api/ferias";

let listaFerias = [];
let perfilAtual = "";
let datasBloqueadas = [];


// ==========================
// INICIALIZAÇÃO
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    carregarFerias();

    const hoje = new Date().toISOString().split("T")[0];

const campoInicio =
    document.getElementById("data_inicio");

const campoFim =
    document.getElementById("data_fim");

if (campoInicio) {

    campoInicio.min = hoje;

}

if (campoFim) {

    campoFim.min = hoje;

}


    const formulario = document.getElementById(
        "form-ferias"
    );


    if (formulario) {

        formulario.addEventListener(
            "submit",
            salvarFerias
        );

    }


    const pesquisa = document.getElementById(
        "pesquisa-ferias"
    );


    const setor = document.getElementById(
        "filtro-setor"
    );


    const status = document.getElementById(
        "filtro-status"
    );


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            filtrarFerias
        );

    }


    if (setor) {

        setor.addEventListener(
            "change",
            filtrarFerias
        );

    }


    if (status) {

        status.addEventListener(
            "change",
            filtrarFerias
        );

    }

});


// ==========================
// LISTAR FÉRIAS
// ==========================

async function carregarFerias() {

    try {

        const resposta = await fetch(
            API
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar férias."
            );

        }


        const respostaJson =
            await resposta.json();


        // Guarda o perfil do usuário

        perfilAtual =
            respostaJson.perfil;


        // Guarda as férias

        listaFerias =
            respostaJson.ferias || [];


        // Atualiza os cards

        atualizarCards(
            listaFerias
        );


        // Monta a tabela

        montarTabelaFerias(
            listaFerias,
            perfilAtual
        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao carregar férias."
        );

    }

}


// ==========================
// MONTAR TABELA
// ==========================

function montarTabelaFerias(
    dados,
    perfil
) {

    const tabela =
        document.getElementById(
            "lista-ferias"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    // ==================================
    // SEM REGISTROS
    // ==================================

    if (dados.length === 0) {

        const quantidadeColunas =
            perfil === "Gestor"
                ? 6
                : 3;


        tabela.innerHTML = `

            <tr>

                <td
                    colspan="${quantidadeColunas}"
                    style="text-align: center;"
                >

                    Nenhuma solicitação de férias encontrada.

                </td>

            </tr>

        `;

        return;

    }


    // ==================================
    // CRIAR LINHAS
    // ==================================

    dados.forEach(item => {

        const dias =
            calcularDias(
                item.data_inicio,
                item.data_fim
            );


        // ==================================
        // GESTOR
        // ==================================

        if (perfil === "Gestor") {

            tabela.innerHTML += `

                <tr>

                    <td>
                        ${item.colaborador}
                    </td>

                    <td>
                        ${item.setor}
                    </td>

                    <td>

                        ${formatarData(
                            item.data_inicio
                        )}

                        até

                        ${formatarData(
                            item.data_fim
                        )}

                    </td>

                    <td>
                        ${dias}
                    </td>

                    <td>
                        ${item.status}
                    </td>

                    <td>

                        <button
                            class="btn-aprovar"
                            onclick="aprovarFerias(${item.id})"
                        >

                            Aprovar

                        </button>


                        <button
                            class="btn-reprovar"
                            onclick="reprovarFerias(${item.id})"
                        >

                            Reprovar

                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirFerias(${item.id})"
                        >

                            Excluir

                        </button>

                    </td>

                </tr>

            `;

        }


        // ==================================
        // FUNCIONÁRIO
        // ==================================

        else {

            tabela.innerHTML += `

                <tr>

                    <td>

                        ${formatarData(
                            item.data_inicio
                        )}

                        até

                        ${formatarData(
                            item.data_fim
                        )}

                    </td>

                    <td>
                        ${dias}
                    </td>

                    <td>
                        ${item.status}
                    </td>

                </tr>

            `;

        }

    });

}


// ==========================
// CADASTRAR / SOLICITAR
// ==========================

async function salvarFerias(evento) {

    evento.preventDefault();


    const dataInicio =
        document.getElementById(
            "data_inicio"
        ).value;


    const dataFim =
        document.getElementById(
            "data_fim"
        ).value;


    // ==================================
    // VALIDAÇÃO
    // ==================================

    if (!dataInicio || !dataFim) {

        alert(
            "Informe a data de início e a data de fim."
        );

        return;

    }


    if (dataFim < dataInicio) {

        alert(
            "A data final não pode ser anterior à data inicial."
        );

        return;

    }

    // ==================================
// NÃO PERMITIR DATAS PASSADAS
// ==================================

const hoje = new Date();

hoje.setHours(0, 0, 0, 0);

const inicio = new Date(
    `${dataInicio}T00:00:00`
);

if (inicio < hoje) {

    alert(
        "A data de início não pode ser anterior à data de hoje."
    );

    return;

}


    // ==================================
    // DADOS
    // ==================================

    const dados = {

        data_inicio:
            dataInicio,

        data_fim:
            dataFim,

        status:
            "Pendente"

    };


    // ==================================
    // SOMENTE GESTOR
    // ==================================

    if (perfilAtual === "Gestor") {

        const colaboradorSelect =
            document.getElementById(
                "colaborador_id"
            );


        if (
            !colaboradorSelect ||
            !colaboradorSelect.value
        ) {

            alert(
                "Selecione um colaborador."
            );

            return;

        }


        dados.colaborador_id =
            colaboradorSelect.value;

    }


    try {

        const resposta =
            await fetch(

                API,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            dados
                        )

                }

            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao solicitar férias."
            );

            return;

        }


        alert(
            resultado.mensagem ||
            "Solicitação de férias enviada!"
        );


        document
            .getElementById(
                "form-ferias"
            )
            .reset();


        fecharModalFerias();


        await carregarFerias();

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao salvar férias."
        );

    }

}


// ==========================
// EXCLUIR
// ==========================

async function excluirFerias(id) {

    if (
        !confirm(
            "Deseja excluir este registro?"
        )
    ) {

        return;

    }


    try {

        const resposta =
            await fetch(

                `${API}/${id}`,

                {

                    method: "DELETE"

                }

            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao excluir férias."
            );

            return;

        }


        alert(
            resultado.mensagem ||
            "Férias excluídas com sucesso!"
        );


        carregarFerias();

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao excluir férias."
        );

    }

}


// ==========================
// APROVAR
// ==========================

async function aprovarFerias(id) {

    try {

        const resposta =
            await fetch(

                `${API}/${id}/status`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                "Aprovada"

                        })

                }

            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao aprovar férias."
            );

            return;

        }


        carregarFerias();

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao aprovar férias."
        );

    }

}


// ==========================
// REPROVAR
// ==========================

async function reprovarFerias(id) {

    try {

        const resposta =
            await fetch(

                `${API}/${id}/status`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                "Reprovada"

                        })

                }

            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao reprovar férias."
            );

            return;

        }


        carregarFerias();

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao reprovar férias."
        );

    }

}

// ==========================
// CARREGAR DATAS OCUPADAS
// ==========================

async function carregarDatasOcupadas() {

    const resposta = await fetch(
        "/api/ferias/ocupadas"
    );

    datasBloqueadas = await resposta.json();

}


// ==========================
// MODAL
// ==========================

async function abrirModalFerias() {

    if (perfilAtual === "Gestor") {

        await carregarColaboradores();

    }

    await carregarDatasOcupadas();

    const modal =
        document.getElementById(
            "modal-ferias"
        );

    if (modal) {

        modal.style.display = "flex";

    }

    flatpickr(
        "#data_inicio",
        {

            locale: "pt",

            dateFormat: "Y-m-d",

            disable: datasBloqueadas.map(f => ({

                from: f.inicio,

                to: f.fim

            })),

            onDayCreate: function(dObj, dStr, fp, dayElem) {

                const data = dayElem.dateObj
                    .toISOString()
                    .split("T")[0];

                datasBloqueadas.forEach(f => {

                    if (data >= f.inicio && data <= f.fim) {

                        if (f.status === "Aprovada") {

                            dayElem.style.background =
                                "#dc3545";

                            dayElem.style.color =
                                "#fff";

                        }

                        if (f.status === "Pendente") {

                            dayElem.style.background =
                                "#ffc107";

                            dayElem.style.color =
                                "#000";

                        }

                    }

                });

            }

        }

    );

    flatpickr(
        "#data_fim",
        {

            locale: "pt",

            dateFormat: "Y-m-d",

            disable: datasBloqueadas.map(f => ({

                from: f.inicio,

                to: f.fim

            })),

            onDayCreate: function(dObj, dStr, fp, dayElem) {

                const data = dayElem.dateObj
                    .toISOString()
                    .split("T")[0];

                datasBloqueadas.forEach(f => {

                    if (data >= f.inicio && data <= f.fim) {

                        if (f.status === "Aprovada") {

                            dayElem.style.background =
                                "#dc3545";

                            dayElem.style.color =
                                "#fff";

                        }

                        if (f.status === "Pendente") {

                            dayElem.style.background =
                                "#ffc107";

                            dayElem.style.color =
                                "#000";

                        }

                    }

                });

            }

        }

    );

}


// ==========================
// FECHAR MODAL
// ==========================

function fecharModalFerias() {

    const modal =
        document.getElementById(
            "modal-ferias"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    const formulario =
        document.getElementById(
            "form-ferias"
        );


    if (formulario) {

        formulario.reset();

    }

}


// ==========================
// CARREGAR COLABORADORES
// ==========================

async function carregarColaboradores() {

    try {

        const resposta =
            await fetch(
                "/api/feedback/colaboradores"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar colaboradores."
            );

        }


        const colaboradores =
            await resposta.json();


        const select =
            document.getElementById(
                "colaborador_id"
            );


        if (!select) {
            return;
        }


        select.innerHTML = `

            <option value="">
                Selecione
            </option>

        `;


        colaboradores.forEach(
            colaborador => {

                select.innerHTML += `

                    <option
                        value="${colaborador.id}"
                    >

                        ${colaborador.nome}

                    </option>

                `;

            }
        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao carregar colaboradores."
        );

    }

}


// ==========================
// CARDS
// ==========================

function atualizarCards(dados) {

    const total =
        document.getElementById(
            "total-ferias"
        );


    const aprovadas =
        document.getElementById(
            "ferias-aprovadas"
        );


    const pendentes =
        document.getElementById(
            "ferias-pendentes"
        );


    const andamento =
        document.getElementById(
            "ferias-andamento"
        );


    if (total) {

        total.innerText =
            dados.length;

    }


    if (aprovadas) {

        aprovadas.innerText =
            dados.filter(

                item =>
                    item.status ===
                    "Aprovada"

            ).length;

    }


    if (pendentes) {

        pendentes.innerText =
            dados.filter(

                item =>
                    item.status ===
                    "Pendente"

            ).length;

    }


    if (andamento) {

        andamento.innerText =
            dados.filter(

                item =>
                    item.status ===
                    "Em Férias"

            ).length;

    }

}


// ==========================
// FORMATAR DATA
// ==========================

function formatarData(data) {

    if (!data) {
        return "";
    }


    const partes =
        data.split("-");


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ==========================
// CALCULAR DIAS
// ==========================

function calcularDias(
    inicio,
    fim
) {

    const dataInicio =
        new Date(
            `${inicio}T00:00:00`
        );


    const dataFim =
        new Date(
            `${fim}T00:00:00`
        );


    const diferenca =
        dataFim -
        dataInicio;


    return (
        diferenca /
        (1000 * 60 * 60 * 24)
    ) + 1;

}


// ==========================
// FILTRAR FÉRIAS
// ==========================

function filtrarFerias() {

    // ==================================
    // TEXTO
    // ==================================

    const campoPesquisa =
        document.getElementById(
            "pesquisa-ferias"
        );


    const texto =
        campoPesquisa
            ? campoPesquisa.value
                .toLowerCase()
                .trim()
            : "";


    // ==================================
    // SETOR
    // ==================================

    const campoSetor =
        document.getElementById(
            "filtro-setor"
        );


    const setor =
        campoSetor
            ? campoSetor.value
            : "";


    // ==================================
    // STATUS
    // ==================================

    const campoStatus =
        document.getElementById(
            "filtro-status"
        );


    const status =
        campoStatus
            ? campoStatus.value
            : "";


    // ==================================
    // FILTRAR
    // ==================================

    const filtrados =
        listaFerias.filter(
            item => {

                const nome =
                    (
                        item.colaborador ||
                        ""
                    )
                    .toLowerCase();


                const correspondeNome =
                    !texto ||
                    nome.includes(
                        texto
                    );


                const correspondeSetor =
                    !setor ||
                    item.setor === setor;


                const correspondeStatus =
                    !status ||
                    item.status === status;


                return (
                    correspondeNome &&
                    correspondeSetor &&
                    correspondeStatus
                );

            }
        );


    // ==================================
    // ATUALIZAR TABELA
    // ==================================

    montarTabelaFerias(
        filtrados,
        perfilAtual
    );

}