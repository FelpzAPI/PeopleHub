const API = "/api/metas";

let listaMetas = [];

let perfilUsuario = "";


// ==========================
// INICIALIZAÇÃO
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    carregarMetas();


    const pesquisa = document.getElementById(
        "pesquisa-meta"
    );


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            filtrarMetas
        );

    }


    const filtroStatus = document.getElementById(
        "filtro-status"
    );


    if (filtroStatus) {

        filtroStatus.addEventListener(
            "change",
            filtrarMetas
        );

    }

});


// ==========================
// CARREGAR METAS
// ==========================

async function carregarMetas() {

    try {

        const resposta = await fetch(API);


        if (!resposta.ok) {

            if (resposta.status === 401) {

                window.location.href = "/";

                return;

            }

            throw new Error(
                "Erro ao buscar metas."
            );

        }


        const dados = await resposta.json();


        perfilUsuario =
            dados.perfil || "";


        listaMetas =
            dados.metas || [];


        renderizarMetas(listaMetas);


        atualizarCards(listaMetas);


        ajustarInterface();


    }

    catch(error){

        console.error(error);

        alert(
            "Erro ao carregar metas."
        );

    }

}



// ==========================
// AJUSTAR INTERFACE
// ==========================

function ajustarInterface(){

    const ehGestor =
        perfilUsuario === "Gestor";


    const botaoNovaMeta =
        document.querySelector(
            ".nova-meta"
        );


    if(botaoNovaMeta){

        botaoNovaMeta.style.display =
            ehGestor
            ? "inline-flex"
            : "none";

    }



    const titulo =
        document.querySelector(
            ".topo h1"
        );


    if(titulo){

        titulo.textContent =
            ehGestor
            ? "Metas"
            : "Minhas Metas";

    }



    const descricao =
        document.querySelector(
            ".topo p"
        );


    if(descricao){

        descricao.textContent =
            ehGestor
            ? "Gerencie as metas dos colaboradores."
            : "Acompanhe suas metas e seu progresso.";

    }

}



// ==========================
// RENDERIZAR TABELA
// ==========================

function renderizarMetas(metas){


    const tabela =
        document.getElementById(
            "lista-metas"
        );


    if(!tabela) return;


    tabela.innerHTML = "";


    const ehGestor =
        perfilUsuario === "Gestor";



    if(metas.length === 0){

        tabela.innerHTML = `

            <tr>

                <td 
                    colspan="${ehGestor ? 5 : 3}"
                    style="text-align:center;"
                >

                    Nenhuma meta encontrada.

                </td>

            </tr>

        `;

        return;

    }



    metas.forEach(meta => {



        let colaborador = "";

        let acoes = "";



        if(ehGestor){


            colaborador = `

                <td>

                    ${escaparHTML(
                        meta.colaborador || ""
                    )}

                </td>

            `;



            acoes = `

                <td class="acoes">


                    <button
                        class="btn-editar"
                        onclick="editarMeta(${meta.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                        Editar

                    </button>



                    <button
                        class="btn-excluir"
                        onclick="excluirMeta(${meta.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Excluir

                    </button>


                </td>

            `;


        }



        tabela.innerHTML += `

            <tr>


                <td>

                    ${escaparHTML(
                        meta.titulo || ""
                    )}

                </td>



                ${colaborador}



                <td>

                    ${formatarData(
                        meta.prazo
                    )}

                </td>



                <td>

                    ${escaparHTML(
                        meta.status || ""
                    )}

                </td>



                ${acoes}



            </tr>

        `;


    });


}



// ==========================
// FILTROS
// ==========================

function filtrarMetas(){


    const pesquisa =
        document.getElementById(
            "pesquisa-meta"
        );


    const filtro =
        document.getElementById(
            "filtro-status"
        );



    const texto =
        pesquisa
        ? pesquisa.value.toLowerCase().trim()
        : "";



    const status =
        filtro
        ? filtro.value
        : "";



    const resultado =
        listaMetas.filter(meta => {


            const titulo =
                (meta.titulo || "")
                .toLowerCase();



            const colaborador =
                (meta.colaborador || "")
                .toLowerCase();



            const busca =
                titulo.includes(texto)
                ||
                colaborador.includes(texto);



            const statusOk =
                status === ""
                ||
                meta.status === status;



            return busca && statusOk;


        });



    renderizarMetas(resultado);


    atualizarCards(listaMetas);


}



// ==========================
// CARDS
// ==========================

function atualizarCards(lista){


    const total =
        lista.length;


    const andamento =
        lista.filter(
            meta =>
            meta.status === "Em andamento"
        ).length;


    const concluidas =
        lista.filter(
            meta =>
            meta.status === "Concluída"
        ).length;


    const atrasadas =
        lista.filter(
            meta =>
            meta.status === "Atrasada"
        ).length;



    document.getElementById(
        "total-metas"
    ).innerHTML = total;



    document.getElementById(
        "metas-andamento"
    ).innerHTML = andamento;



    document.getElementById(
        "metas-concluidas"
    ).innerHTML = concluidas;



    document.getElementById(
        "metas-atrasadas"
    ).innerHTML = atrasadas;


}



// ==========================
// EDITAR
// ==========================

function editarMeta(id){


    if(perfilUsuario !== "Gestor"){

        alert(
            "Você não tem permissão para editar metas."
        );

        return;

    }


    window.location.href =
        `/nova-meta?id=${id}`;


}


window.editarMeta = editarMeta;



// ==========================
// EXCLUIR
// ==========================

async function excluirMeta(id){


    if(perfilUsuario !== "Gestor"){

        alert(
            "Você não tem permissão para excluir metas."
        );

        return;

    }



    const confirmar =
        confirm(
            "Deseja excluir essa meta?"
        );



    if(!confirmar) return;



    try{


        const resposta =
            await fetch(
                `${API}/${id}`,
                {
                    method:"DELETE"
                }
            );



        const dados =
            await resposta.json();



        if(!resposta.ok){

            alert(
                dados.mensagem ||
                "Erro ao excluir meta."
            );

            return;

        }



        alert(
            "Meta excluída com sucesso!"
        );



        carregarMetas();



    }


    catch(error){

        console.error(error);

        alert(
            "Erro ao excluir meta."
        );

    }


}


window.excluirMeta = excluirMeta;



// ==========================
// DATA
// ==========================

function formatarData(data){


    if(!data)
        return "";



    const partes =
        data.split("-");



    if(partes.length !== 3)
        return data;



    return `${partes[2]}/${partes[1]}/${partes[0]}`;


}



// ==========================
// SEGURANÇA HTML
// ==========================

function escaparHTML(texto){


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;


}