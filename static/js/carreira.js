let planos = [];


// ===============================
// CARREGAR TABELA
// ===============================

async function carregarCarreira() {

    const resposta =
        await fetch("/api/carreira");

    planos =
        await resposta.json();

    renderizarTabela(planos);

    atualizarCards(planos);

}


// ===============================
// TABELA
// ===============================

function renderizarTabela(lista) {

    const tabela =
        document.getElementById("lista-carreira");

    if (!tabela) return;

    tabela.innerHTML = "";

    const gestor =
        document.getElementById("modal-carreira") !== null;

    lista.forEach(p => {

        tabela.innerHTML += `

        <tr>

            <td>${p.colaborador}</td>

            <td>${p.cargo_atual}</td>

            <td>${p.cargo_desejado}</td>

            <td>${p.objetivo}</td>

            <td>${p.status}</td>

            ${
                gestor
                ?
                `
                <td>

                    <button
                        class="btn-editar"
                        onclick="editarCarreira(${p.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirCarreira(${p.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>
                `
                :
                ""
            }

        </tr>

        `;

    });

}


// ===============================
// CARDS
// ===============================

function atualizarCards(lista) {

    const total =
        document.getElementById("total-planos");

    if (total)
        total.innerHTML = lista.length;

    const desenvolvimento =
        document.getElementById("planos-desenvolvimento");

    if (desenvolvimento)
        desenvolvimento.innerHTML =
            lista.filter(
                p => p.status == "Em desenvolvimento"
            ).length;

    const promocoes =
        document.getElementById("promocoes-previstas");

    if (promocoes)
        promocoes.innerHTML =
            lista.filter(
                p => p.status == "Promoção prevista"
            ).length;

    const concluidos =
        document.getElementById("planos-concluidos");

    if (concluidos)
        concluidos.innerHTML =
            lista.filter(
                p => p.status == "Concluído"
            ).length;

}


// ===============================
// COLABORADORES
// ===============================

async function carregarColaboradores() {

    const select =
        document.getElementById("colaborador_id");

    if (!select) return;

    const resposta =
        await fetch("/api/feedback/colaboradores");

    const dados =
        await resposta.json();

    select.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;

    dados.forEach(c => {

        select.innerHTML += `
            <option value="${c.id}">
                ${c.nome}
            </option>
        `;

    });

}


// ===============================
// ABRIR
// ===============================

async function abrirModalCarreira() {

    await carregarColaboradores();

    const modal =
        document.getElementById("modal-carreira");

    if (modal)
        modal.style.display = "flex";

}

window.abrirModalCarreira = abrirModalCarreira;


// ===============================
// FECHAR
// ===============================

function fecharModalCarreira() {

    const modal =
        document.getElementById("modal-carreira");

    if (modal)
        modal.style.display = "none";

    const form =
        document.getElementById("form-carreira");

    if (form)
        form.reset();

    const id =
        document.getElementById("id");

    if (id)
        id.value = "";

}

window.fecharModalCarreira = fecharModalCarreira;


// ===============================
// SALVAR
// ===============================

const formulario =
    document.getElementById("form-carreira");

if (formulario) {

    formulario.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const id =
                document.getElementById("id").value;

            const dados = {

                colaborador_id:
                    document.getElementById("colaborador_id").value,

                cargo_atual:
                    document.getElementById("cargo_atual").value,

                cargo_desejado:
                    document.getElementById("cargo_desejado").value,

                objetivo:
                    document.getElementById("objetivo").value,

                status:
                    document.getElementById("status").value

            };

            const resposta =
                await fetch(

                    id
                        ? `/api/carreira/${id}`
                        : "/api/carreira",

                    {

                        method:
                            id ? "PUT" : "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body:
                            JSON.stringify(dados)

                    }

                );

            if (resposta.ok) {

                fecharModalCarreira();

                carregarCarreira();

            }

        }
    );

}


// ===============================
// EDITAR
// ===============================

async function editarCarreira(id) {

    const resposta =
        await fetch(`/api/carreira/${id}`);

    const p =
        await resposta.json();

    await carregarColaboradores();

    document.getElementById("modal-carreira").style.display = "flex";

    document.getElementById("id").value = p.id;

    document.getElementById("colaborador_id").value = p.colaborador_id;

    document.getElementById("cargo_atual").value = p.cargo_atual;

    document.getElementById("cargo_desejado").value = p.cargo_desejado;

    document.getElementById("objetivo").value = p.objetivo;

    document.getElementById("status").value = p.status;

}


// ===============================
// EXCLUIR
// ===============================

async function excluirCarreira(id) {

    await fetch(

        `/api/carreira/${id}`,

        {
            method: "DELETE"
        }

    );

    carregarCarreira();

}


document.addEventListener(
    "DOMContentLoaded",
    carregarCarreira
);