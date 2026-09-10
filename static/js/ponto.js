let pontos = [];

let perfil = "";

const API = "/api/ponto";


// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarPontos();


        const formulario =
            document.getElementById(
                "form-ponto"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                salvarPonto
            );

        }


        const pesquisa =
            document.getElementById(
                "pesquisa-ponto"
            );


        if (pesquisa) {

            pesquisa.addEventListener(
                "input",
                filtrarPontos
            );

        }


        const filtroSetor =
            document.getElementById(
                "filtro-setor"
            );


        if (filtroSetor) {

            filtroSetor.addEventListener(
                "change",
                filtrarPontos
            );

        }

    }
);


// ==============================
// CARREGAR PONTOS
// ==============================

async function carregarPontos() {

    try {

        const resposta =
            await fetch(API);


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar pontos."
            );

        }


        const dados =
            await resposta.json();


        /*
         * Backend retorna:
         *
         * {
         *     perfil: "...",
         *     pontos: [...]
         * }
         */


        perfil =
            dados.perfil;


        pontos =
            dados.pontos || [];


        renderizarPontos(
            pontos
        );


        atualizarCards(
            pontos
        );

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao carregar pontos."
        );

    }

}


// ==============================
// RENDERIZAR TABELA
// ==============================

function renderizarPontos(lista) {

    const tabela =
        document.getElementById(
            "lista-ponto"
        );


    if (!tabela) {

        return;

    }


    tabela.innerHTML = "";


    lista.forEach(p => {


        // ==================================
        // GESTOR
        // ==================================

        if (perfil === "Gestor") {

            tabela.innerHTML += `

                <tr>

                    <td>
                        ${p.colaborador || "Não informado"}
                    </td>

                    <td>
                        ${p.setor || "Não informado"}
                    </td>

                    <td>
                        ${formatarDataHora(p.entrada)}
                    </td>

                    <td>
                        ${formatarDataHora(p.saida)}
                    </td>

                    <td>
                        ${p.horas_trabalhadas || 0}h
                    </td>

                    <td>

                        <button
                            class="btn-editar"
                            onclick="editarPonto(${p.id})"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirPonto(${p.id})"
                        >

                            <i class="fa-solid fa-trash"></i>

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
                        ${formatarDataHora(p.entrada)}
                    </td>

                    <td>
                        ${formatarDataHora(p.saida)}
                    </td>

                    <td>
                        ${p.horas_trabalhadas || 0}h
                    </td>

                </tr>

            `;

        }

    });

}


// ==============================
// PESQUISA
// ==============================

function filtrarPontos() {

    /*
     * Filtro só é utilizado
     * pelo Gestor.
     */

    if (perfil !== "Gestor") {

        return;

    }


    const pesquisa =
        document.getElementById(
            "pesquisa-ponto"
        );


    const filtroSetor =
        document.getElementById(
            "filtro-setor"
        );


    if (!pesquisa || !filtroSetor) {

        return;

    }


    const texto =
        pesquisa.value
        .toLowerCase();


    const setor =
        filtroSetor.value;


    const filtrados =
        pontos.filter(p => {


            const nome =
                (
                    p.colaborador || ""
                )
                .toLowerCase();


            const setorColaborador =
                p.setor || "";


            const buscaNome =
                nome.includes(
                    texto
                );


            const buscaSetor =
                setor === "" ||
                setorColaborador === setor;


            return (
                buscaNome &&
                buscaSetor
            );

        });


    renderizarPontos(
        filtrados
    );

}


// ==============================
// CARREGAR COLABORADORES
// ==============================

async function carregarColaboradores() {

    /*
     * Somente o Gestor precisa
     * carregar a lista de colaboradores.
     */

    if (perfil !== "Gestor") {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/api/colaboradores"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar colaboradores."
            );

        }


        const dados =
            await resposta.json();


        /*
         * Dependendo do endpoint,
         * pode retornar diretamente
         * uma lista ou um objeto.
         */

        const colaboradores =
            Array.isArray(dados)
                ? dados
                : dados.colaboradores || [];


        const select =
            document.getElementById(
                "colaborador_id"
            );


        if (!select) {

            return;

        }


        select.innerHTML = `

            <option value="">
                Selecione um colaborador
            </option>

        `;


        colaboradores.forEach(c => {

            select.innerHTML += `

                <option value="${c.id}">
                    ${c.nome}
                </option>

            `;

        });

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


// ==============================
// ABRIR MODAL
// ==============================

async function abrirFormularioPonto() {

    const modal =
        document.getElementById(
            "modal-ponto"
        );


    if (!modal) {

        return;

    }


    // ==================================
    // GESTOR
    // ==================================

    if (perfil === "Gestor") {

        await carregarColaboradores();

    }


    // ==================================
    // FUNCIONÁRIO
    // ==================================

    else {

        /*
         * Funcionário não escolhe
         * o colaborador.
         *
         * O backend identifica
         * automaticamente o colaborador
         * vinculado ao usuário logado.
         */

        const campoColaborador =
            document.getElementById(
                "colaborador_id"
            );


        if (campoColaborador) {

            campoColaborador.value = "";

            campoColaborador.disabled = true;

        }

    }


    modal.style.display = "flex";

}


window.abrirFormularioPonto =
    abrirFormularioPonto;


// ==============================
// FECHAR MODAL
// ==============================

function fecharFormularioPonto() {

    const modal =
        document.getElementById(
            "modal-ponto"
        );


    const formulario =
        document.getElementById(
            "form-ponto"
        );


    const id =
        document.getElementById(
            "id"
        );


    const colaborador =
        document.getElementById(
            "colaborador_id"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    if (formulario) {

        formulario.reset();

    }


    if (id) {

        id.value = "";

    }


    /*
     * Reativa o campo para que,
     * caso o usuário seja Gestor,
     * ele possa utilizá-lo novamente.
     */

    if (colaborador) {

        colaborador.disabled = false;

    }

}


window.fecharFormularioPonto =
    fecharFormularioPonto;


// ==============================
// SALVAR / CRIAR / EDITAR
// ==============================

async function salvarPonto(evento) {

    evento.preventDefault();


    const id =
        document.getElementById(
            "id"
        ).value;


    // ==================================
    // FUNCIONÁRIO NÃO PODE EDITAR
    // ==================================

    if (
        perfil !== "Gestor" &&
        id
    ) {

        alert(
            "Você não pode editar registros de ponto."
        );

        return;

    }


    // ==================================
    // DADOS DO FORMULÁRIO
    // ==================================

    const dados = {

        entrada:
            document.getElementById(
                "entrada"
            ).value,

        saida:
            document.getElementById(
                "saida"
            ).value,

        horas_trabalhadas:
            document.getElementById(
                "horas_trabalhadas"
            ).value

    };


    // ==================================
    // GESTOR
    // ==================================

    if (perfil === "Gestor") {

        dados.colaborador_id =
            document.getElementById(
                "colaborador_id"
            ).value;

    }


    /*
     * IMPORTANTE:
     *
     * Funcionário NÃO envia
     * colaborador_id.
     *
     * O backend vai utilizar:
     *
     * usuario.colaborador_id
     *
     * automaticamente.
     */


    // ==================================
    // URL
    // ==================================

    const url =
        id
            ? `${API}/${id}`
            : API;


    // ==================================
    // MÉTODO
    // ==================================

    const metodo =
        id
            ? "PUT"
            : "POST";


    try {

        const resposta =
            await fetch(
                url,
                {

                    method:
                        metodo,

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


        // ==================================
        // SUCESSO
        // ==================================

        if (resposta.ok) {

            fecharFormularioPonto();


            await carregarPontos();


            alert(
                resultado.mensagem ||
                "Registro salvo com sucesso!"
            );

        }


        // ==================================
        // ERRO
        // ==================================

        else {

            alert(
                resultado.mensagem ||
                "Erro ao salvar registro."
            );

        }

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao salvar registro."
        );

    }

}


// ==============================
// EDITAR
// ==============================

async function editarPonto(id) {


    /*
     * SOMENTE GESTOR
     */

    if (perfil !== "Gestor") {

        alert(
            "Você não tem permissão para editar registros."
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API}/${id}`
            );


        const p =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                p.mensagem ||
                "Erro ao buscar registro."
            );

            return;

        }


        await carregarColaboradores();


        const modal =
            document.getElementById(
                "modal-ponto"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }


        document.getElementById(
            "id"
        ).value =
            p.id;


        document.getElementById(
            "colaborador_id"
        ).value =
            p.colaborador_id;


        document.getElementById(
            "entrada"
        ).value =
            converterParaInputDateTime(
                p.entrada
            );


        document.getElementById(
            "saida"
        ).value =
            converterParaInputDateTime(
                p.saida
            );


        document.getElementById(
            "horas_trabalhadas"
        ).value =
            p.horas_trabalhadas;


    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao editar registro."
        );

    }

}


window.editarPonto =
    editarPonto;


// ==============================
// EXCLUIR
// ==============================

async function excluirPonto(id) {


    /*
     * SOMENTE GESTOR
     */

    if (perfil !== "Gestor") {

        alert(
            "Você não tem permissão para excluir registros."
        );

        return;

    }


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

                    method:
                        "DELETE"

                }
            );


        const resultado =
            await resposta.json();


        if (resposta.ok) {

            await carregarPontos();


            alert(
                resultado.mensagem ||
                "Registro excluído com sucesso!"
            );

        }

        else {

            alert(
                resultado.mensagem ||
                "Erro ao excluir registro."
            );

        }

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao excluir registro."
        );

    }

}


window.excluirPonto =
    excluirPonto;


// ==============================
// CARDS
// ==============================

function atualizarCards(lista) {

    const registros =
        document.getElementById(
            "registros-hoje"
        );


    const horas =
        document.getElementById(
            "total-horas"
        );


    const colaboradores =
        document.getElementById(
            "colaboradores-ativos"
        );


    // ==================================
    // QUANTIDADE DE REGISTROS
    // ==================================

    if (registros) {

        registros.innerText =
            lista.length;

    }


    // ==================================
    // TOTAL DE HORAS
    // ==================================

    if (horas) {

        const total =
            lista.reduce(
                (
                    soma,
                    p
                ) => {

                    return soma +
                        Number(
                            p.horas_trabalhadas || 0
                        );

                },
                0
            );


        horas.innerText =
            `${total}h`;

    }


    // ==================================
    // COLABORADORES
    // SOMENTE GESTOR
    // ==================================

    if (
        colaboradores &&
        perfil === "Gestor"
    ) {

        const nomes =
            new Set(
                lista.map(
                    p =>
                        p.colaborador_id
                )
            );


        colaboradores.innerText =
            nomes.size;

    }

}


// ==============================
// FORMATAR DATA
// ==============================

function formatarDataHora(data) {

    if (!data) {

        return "-";

    }


    const dataObj =
        new Date(data);


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "-";

    }


    return dataObj.toLocaleString(
        "pt-BR",
        {

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


// ==============================
// CONVERTER PARA INPUT
// ==============================

function converterParaInputDateTime(
    data
) {

    if (!data) {

        return "";

    }


    const dataObj =
        new Date(data);


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "";

    }


    const ano =
        dataObj.getFullYear();


    const mes =
        String(
            dataObj.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const dia =
        String(
            dataObj.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const hora =
        String(
            dataObj.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minuto =
        String(
            dataObj.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;

}