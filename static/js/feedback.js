let feedbacks = [];


// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    carregarFeedbacks();


    const formulario =
        document.getElementById("form-feedback");


    if (formulario) {

        formulario.addEventListener(
            "submit",
            salvarFeedback
        );

    }


    const tipoEnvio =
        document.getElementById(
            "tipo_envio"
        );


    if(tipoEnvio){

        tipoEnvio.addEventListener(
    "change",
    alterarTipoEnvio
);

    }

});


// ===============================
// CARREGAR FEEDBACKS
// ===============================

async function carregarFeedbacks() {

    try {

        const resposta = await fetch(
            "/api/feedback"
        );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar feedbacks."
            );

        }

        feedbacks = await resposta.json();

        renderizarTabela(feedbacks);

        atualizarCards(feedbacks);

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao carregar feedbacks."
        );

    }

}


// ===============================
// RENDERIZAR TABELA
// ===============================

function renderizarTabela(lista) {

    const tabela = document.getElementById(
        "lista-feedbacks"
    );

    if (!tabela) {
        return;
    }

    tabela.innerHTML = "";


    // Verifica o perfil do usuário

    const gestor =
        window.perfilUsuario === "Gestor";


    lista.forEach(f => {


        // ===============================
        // AÇÕES
        // ===============================

        let acoes = "";


        if (gestor) {

            acoes = `

                <td>

                    <button
                        type="button"
                        class="btn-editar"
                        onclick="editarFeedback(${f.id})"
                        title="Editar"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="btn-excluir"
                        onclick="excluirFeedback(${f.id})"
                        title="Excluir"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            `;

        }


        // ===============================
        // LINHA
        // ===============================

        let clique = "";

if(!gestor){

    clique = `
        onclick="visualizarFeedback(${f.id})"
        style="cursor:pointer;"
    `;

}


tabela.innerHTML += `

<tr ${clique}>

    <td>
        ${f.colaborador || "-"}
    </td>

    <td>
        ${f.responsavel || "-"}
    </td>

    <td>
        ${f.tipo || "-"}
    </td>

    <td>
        ${f.data || "-"}
    </td>

    <td>
        ${f.status || "-"}
    </td>

    ${acoes}

</tr>

`;

    });


    // ===============================
    // CASO NÃO TENHA FEEDBACK
    // ===============================

    if (lista.length === 0) {

        const quantidadeColunas =
            gestor ? 6 : 5;

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="${quantidadeColunas}"
                    style="text-align: center;"
                >

                    Nenhum feedback encontrado.

                </td>

            </tr>

        `;

    }

}


// ===============================
// PESQUISA
// ===============================

function pesquisarFeedback() {

    filtrarFeedback();

}

window.pesquisarFeedback =
    pesquisarFeedback;


// ===============================
// FILTROS
// ===============================

function filtrarFeedback() {

    const campoPesquisa =
        document.getElementById("pesquisa");

    const campoTipo =
        document.getElementById("filtro-tipo");

    const campoStatus =
        document.getElementById("filtro-status");


    const texto =
        campoPesquisa
        ? campoPesquisa.value.toLowerCase()
        : "";


    const tipo =
        campoTipo
        ? campoTipo.value
        : "";


    const status =
        campoStatus
        ? campoStatus.value
        : "";


    const resultado =
        feedbacks.filter(f => {


            const nome =
                (f.colaborador || "")
                .toLowerCase()
                .includes(texto);


            const filtroTipo =
                tipo === "" ||
                f.tipo === tipo;


            const filtroStatus =
                status === "" ||
                f.status === status;


            return (
                nome &&
                filtroTipo &&
                filtroStatus
            );

        });


    renderizarTabela(resultado);

    atualizarCards(resultado);

}

window.filtrarFeedback =
    filtrarFeedback;


// ===============================
// CARREGAR COLABORADORES
// SOMENTE GESTOR
// ===============================

async function carregarColaboradores() {

    try {

        const resposta = await fetch(
            "/api/feedback/colaboradores"
        );


        const colaboradores =
            await resposta.json();


        const select =
            document.getElementById(
                "colaborador_id"
            );


        const listaCheckbox =
            document.getElementById(
                "checkbox-colaboradores"
            );


        if(select){

            select.innerHTML = `

                <option value="">
                    Selecione um colaborador
                </option>

            `;

        }


        if(listaCheckbox){

            listaCheckbox.innerHTML = "";

        }



        colaboradores.forEach(c => {


            // select individual

            if(select){

                select.innerHTML += `

                    <option value="${c.id}">
                        ${c.nome}
                    </option>

                `;

            }



            // checkbox massa

            if(listaCheckbox){

                listaCheckbox.innerHTML += `

                    <label class="check-colaborador">

                        <input 
                        type="checkbox"
                        value="${c.id}"
                        class="colaborador-checkbox"
                        >

                        ${c.nome}

                    </label>

                `;

            }


        });


    }

    catch(erro){

        console.error(
            erro
        );

        alert(
            "Erro ao carregar colaboradores."
        );

    }

}


// ===============================
// ABRIR MODAL
// ===============================

async function abrirFormularioFeedback() {


    // Segurança no JavaScript

    if (window.perfilUsuario !== "Gestor") {

        alert(
            "Somente gestores podem criar feedbacks."
        );

        return;

    }


    await carregarColaboradores();


const tipoEnvio =
document.getElementById("tipo_envio");


const campoIndividual =
document.getElementById(
    "campo-colaborador"
);


const campoMassa =
document.getElementById(
    "campo-massa"
);


if(tipoEnvio){

    tipoEnvio.value = "individual";

}


if(campoIndividual){

    campoIndividual.style.display = "flex";

}


if(campoMassa){

    campoMassa.style.display = "none";

}


const modal =
    document.getElementById(
        "modal-feedback"
    );


    if (modal) {

        modal.style.display = "flex";

    }

}

window.abrirFormularioFeedback =
    abrirFormularioFeedback;


// ===============================
// FECHAR MODAL
// ===============================

function fecharFormularioFeedback() {


    const modal =
        document.getElementById(
            "modal-feedback"
        );


    if (modal) {

        modal.style.display = "none";

    }


    const formulario =
        document.getElementById(
            "form-feedback"
        );


    if (formulario) {

        formulario.reset();

    }


    const id =
        document.getElementById("id");


    if (id) {

        id.value = "";

    }

    const campoIndividual =
document.getElementById(
    "campo-colaborador"
);


const campoMassa =
document.getElementById(
    "campo-massa"
);


if(campoIndividual){

    campoIndividual.style.display = "flex";

}


if(campoMassa){

    campoMassa.style.display = "none";

}

document
.querySelectorAll(
    ".colaborador-checkbox"
)
.forEach(cb => {

    cb.checked = false;

});

}

window.fecharFormularioFeedback =
    fecharFormularioFeedback;


// ===============================
// SALVAR FEEDBACK
// ===============================

async function salvarFeedback(e) {


    e.preventDefault();


    // Somente Gestor

    if (window.perfilUsuario !== "Gestor") {

        alert(
            "Somente gestores podem criar ou editar feedbacks."
        );

        return;

    }


    const id =
        document.getElementById(
            "id"
        ).value;


    document.querySelectorAll(
        ".colaborador-checkbox:checked"
    );


const dados = {

    tipo_envio:
        document.getElementById("tipo_envio")
        ? document.getElementById("tipo_envio").value
        : "individual",


    destinatario_id:

        document.getElementById(
            "tipo_envio"
        ).value === "massa"

        ?

        null

        :

        document.getElementById(
            "colaborador_id"
        ).value,


    destinatarios_ids:

        Array.from(
            document.querySelectorAll(
                ".colaborador-checkbox:checked"
            )
        ).map(
            c => c.value
        ),

        tipo:
            document.getElementById(
                "tipo"
            ).value,

        status:
            document.getElementById(
                "status"
            ).value,

        mensagem:
            document.getElementById(
                "mensagem"
            ).value

    };


    const url = id
        ? `/api/feedback/${id}`
        : "/api/feedback";


    const metodo = id
        ? "PUT"
        : "POST";


    try {

        const resposta =
            await fetch(
                url,
                {

                    method: metodo,

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(dados)

                }
            );


        const resultado =
            await resposta.json();


        if (resposta.ok) {


            fecharFormularioFeedback();


            await carregarFeedbacks();


        }

        else {


            alert(
                resultado.mensagem ||
                "Erro ao salvar feedback."
            );

        }

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao salvar feedback."
        );

    }

}




// ===============================
// EDITAR FEEDBACK
// ===============================

async function editarFeedback(id) {


    // Somente Gestor

    if (window.perfilUsuario !== "Gestor") {

        alert(
            "Somente gestores podem editar feedbacks."
        );

        return;

    }


    try {


        const resposta =
            await fetch(
                `/api/feedback/${id}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar feedback."
            );

        }


        const f =
            await resposta.json();


        await carregarColaboradores();

        const tipoEnvio =
document.getElementById(
    "tipo_envio"
);

if(tipoEnvio){

    tipoEnvio.value =
        f.tipo_envio || "individual";

    alterarTipoEnvio();

}


        const modal =
            document.getElementById(
                "modal-feedback"
            );


        if (modal) {

            modal.style.display = "flex";

        }


        document.getElementById(
            "id"
        ).value = f.id;


        document.getElementById(
            "colaborador_id"
        ).value =
            f.destinatario_id;


        document.getElementById(
            "tipo"
        ).value =
            f.tipo;


        document.getElementById(
            "status"
        ).value =
            f.status;


        document.getElementById(
            "mensagem"
        ).value =
            f.mensagem;


    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao carregar feedback."
        );

    }

}

window.editarFeedback =
    editarFeedback;


// ===============================
// EXCLUIR FEEDBACK
// ===============================

async function excluirFeedback(id) {


    // Somente Gestor

    if (window.perfilUsuario !== "Gestor") {

        alert(
            "Somente gestores podem excluir feedbacks."
        );

        return;

    }


    const confirmar =
        confirm(
            "Deseja excluir este feedback?"
        );


    if (!confirmar) {

        return;

    }


    try {


        const resposta =
            await fetch(
                `/api/feedback/${id}`,
                {

                    method: "DELETE"

                }
            );


        const resultado =
            await resposta.json();


        if (resposta.ok) {

            await carregarFeedbacks();

        }

        else {

            alert(
                resultado.mensagem ||
                "Erro ao excluir feedback."
            );

        }

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir feedback."
        );

    }

}

window.excluirFeedback =
    excluirFeedback;


// ===============================
// CARDS
// ===============================

function atualizarCards(lista) {


    const total =
        document.getElementById(
            "total-feedbacks"
        );


    const positivos =
        document.getElementById(
            "feedbacks-positivos"
        );


    const construtivos =
        document.getElementById(
            "feedbacks-construtivos"
        );


    const pendentes =
        document.getElementById(
            "feedbacks-pendentes"
        );


    if (total) {

        total.innerText =
            lista.length;

    }


    if (positivos) {

        positivos.innerText =
            lista.filter(
                f => f.tipo === "Positivo"
            ).length;

    }


    if (construtivos) {

        construtivos.innerText =
            lista.filter(
                f => f.tipo === "Construtivo"
            ).length;

    }


    if (pendentes) {

        pendentes.innerText =
            lista.filter(
                f => f.status === "Pendente"
            ).length;

    }

}

async function visualizarFeedback(id){

    try{

        const resposta =
            await fetch(
                `/api/feedback/${id}`
            );


        const f =
            await resposta.json();



        document.getElementById(
            "ver-tipo"
        ).innerText =
            f.tipo || "-";


        document.getElementById(
            "ver-responsavel"
        ).innerText =
            f.responsavel || "-";


        document.getElementById(
            "ver-data"
        ).innerText =
            f.data || "-";


        document.getElementById(
            "ver-mensagem"
        ).value =
            f.mensagem || "-";



        document.getElementById(
            "modal-ver-feedback"
        ).style.display =
            "flex";


    }

    catch(erro){

        console.error(erro);

        alert(
            "Erro ao abrir feedback."
        );

    }

}

function alterarTipoEnvio(){

    const tipo =
        document.getElementById(
            "tipo_envio"
        ).value;


    const individual =
        document.getElementById(
            "campo-colaborador"
        );


    const massa =
        document.getElementById(
            "campo-massa"
        );


    if(tipo === "massa"){


        individual.style.display =
            "none";


        massa.style.display =
            "flex";


    }
    else{


        individual.style.display =
            "flex";


        massa.style.display =
            "none";


    }

}


window.alterarTipoEnvio =
    alterarTipoEnvio;



function fecharVisualizarFeedback(){

    document.getElementById(
        "modal-ver-feedback"
    ).style.display =
        "none";

}


window.visualizarFeedback =
    visualizarFeedback;


window.fecharVisualizarFeedback =
    fecharVisualizarFeedback;