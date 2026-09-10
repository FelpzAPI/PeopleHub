let colaboradoresLista = [];


// ==============================
// CARREGAR COLABORADORES
// ==============================

async function carregarColaboradores() {


    const tabela =
    document.getElementById(
        "lista-colaboradores"
    );


    if(!tabela) return;



    try {


        const resposta =
        await fetch(
            "/api/colaboradores"
        );


        colaboradoresLista =
        await resposta.json();



        renderizarColaboradores(
            colaboradoresLista
        );


        atualizarNumeros(
            colaboradoresLista
        );


    }


    catch(erro){

        console.error(
            "Erro ao carregar colaboradores:",
            erro
        );

    }

}





// ==============================
// RENDERIZAR TABELA
// ==============================

function renderizarColaboradores(lista){


    const tabela =
    document.getElementById(
        "lista-colaboradores"
    );


    if(!tabela) return;



    tabela.innerHTML = "";



    lista.forEach(colaborador => {



        tabela.innerHTML += `

        <tr>


            <td>
                ${colaborador.nome || ""}
            </td>


            <td>
                ${colaborador.cargo || ""}
            </td>


            <td>
                ${colaborador.setor || ""}
            </td>


            <td>
                ${colaborador.email || ""}
            </td>


            <td>
                ${colaborador.status || ""}
            </td>


            <td>


                <button
                class="btn-editar"
                onclick="editarColaborador(${colaborador.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>



                <button
                class="btn-excluir"
                onclick="excluirColaborador(${colaborador.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>


            </td>


        </tr>

        `;


    });


}







// ==============================
// PESQUISAR
// ==============================

function filtrarColaborador(){


    const texto =
    document.getElementById(
        "pesquisa"
    ).value.toLowerCase();



    const setor =
    document.getElementById(
        "filtro-setor"
    ).value;



    const filtrados =
    colaboradoresLista.filter(colaborador => {



        const nome =
        colaborador.nome
        ? colaborador.nome.toLowerCase()
        : "";



        const filtroNome =
        nome.includes(texto);



        const filtroSetor =
        setor === ""
        ||
        colaborador.setor === setor;



        return filtroNome && filtroSetor;


    });



    renderizarColaboradores(
        filtrados
    );


}






// ==============================
// CARDS
// ==============================

function atualizarNumeros(lista){


    const total =
    document.getElementById(
        "total-colaboradores"
    );


    const ativos =
    document.getElementById(
        "colaboradores-ativos"
    );



    if(total){

        total.innerHTML =
        lista.length;

    }



    if(ativos){


        ativos.innerHTML =
        lista.filter(
            colaborador =>
            colaborador.status === "Ativo"

        ).length;


    }


}







// ==============================
// EXCLUIR
// ==============================

async function excluirColaborador(id){


    if(
        !confirm(
            "Deseja excluir este colaborador?"
        )
    ){

        return;

    }



    try{


        const resposta =
        await fetch(
            `/api/colaboradores/${id}`,
            {
                method:"DELETE"
            }
        );



        if(resposta.ok){


            carregarColaboradores();


        }


    }


    catch(erro){


        console.error(
            "Erro ao excluir:",
            erro
        );


        alert(
            "Erro ao excluir colaborador."
        );


    }


}








// ==============================
// EDITAR
// ==============================

async function editarColaborador(id){


    try{


        const resposta =
        await fetch(
            `/api/colaboradores/${id}`
        );



        if(!resposta.ok){

            throw new Error(
                "Colaborador não encontrado"
            );

        }



        const colaborador =
        await resposta.json();



        localStorage.setItem(
            "colaboradorEditar",
            JSON.stringify(colaborador)
        );



        window.location.href =
        "/colaboradores/novo";


    }


    catch(erro){


        console.error(
            erro
        );


        alert(
            "Erro ao buscar colaborador."
        );


    }


}






// ==============================
// DISPONIBILIZAR PARA HTML
// ==============================

window.editarColaborador =
editarColaborador;


window.excluirColaborador =
excluirColaborador;


window.filtrarColaborador =
filtrarColaborador;





document.addEventListener(
"DOMContentLoaded",
carregarColaboradores
);