let treinamentosLista = [];


// ==============================
// VERIFICAR PERFIL
// ==============================

function usuarioEhGestor(){

    return window.perfilUsuario === "Gestor";

}


// ==============================
// CARREGAR TREINAMENTOS
// ==============================

async function carregarTreinamentos(){

    const tabela =
        document.getElementById(
            "lista-treinamentos"
        );

    if(!tabela) return;


    try{

        const resposta =
            await fetch(
                "/api/treinamentos"
            );


        if(!resposta.ok){

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        treinamentosLista =
            await resposta.json();


        renderizarTreinamentos(
            treinamentosLista
        );


        atualizarNumeros(
            treinamentosLista
        );


    }

    catch(erro){

        console.error(
            "Erro ao carregar treinamentos:",
            erro
        );

    }

}


// ==============================
// FORMATAR LINK
// ==============================

function formatarLink(link){

    if(
        !link.startsWith("http://") &&
        !link.startsWith("https://")
    ){

        return "https://" + link;

    }


    return link;

}

function gerarAcessoTreinamento(treinamento){

    if(!treinamento.link){

        return "Sem conteúdo";

    }


    const link =
        formatarLink(treinamento.link);



    // YOUTUBE

    if(
        link.includes("youtube.com") ||
        link.includes("youtu.be")
    ){

        return `

        <button
            class="btn-acessar"
            onclick="abrirTreinamento(${treinamento.id})"
        >

            Assistir

        </button>

        `;

    }



    // PDF

    if(
        link.toLowerCase().endsWith(".pdf")
    ){

        return `

        <button
            class="btn-acessar"
            onclick="abrirTreinamento(${treinamento.id})"
        >

            Visualizar PDF

        </button>

        `;

    }



    // OUTRAS PLATAFORMAS

    return `

        <button
            class="btn-acessar"
            onclick="abrirTreinamento(${treinamento.id})"
        >

            Ver curso

        </button>

    `;

}


// ==============================
// RENDERIZAR
// ==============================

function renderizarTreinamentos(lista){

    const tabela =
        document.getElementById(
            "lista-treinamentos"
        );


    if(!tabela) return;


    tabela.innerHTML = "";


    lista.forEach(treinamento => {

        let colunaAcoes = "";


        // ==================================
        // AÇÕES SOMENTE PARA GESTOR
        // ==================================

        if(usuarioEhGestor()){

            colunaAcoes = `

                <td>

                    <button
                        class="btn-editar"
                        onclick="editarTreinamento(${treinamento.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="btn-excluir"
                        onclick="excluirTreinamento(${treinamento.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            `;

        }


        tabela.innerHTML += `

            <tr>

                <td>
                    ${treinamento.titulo ?? ""}
                </td>


                <td>
                    ${treinamento.descricao ?? ""}
                </td>


                <td>
                    ${treinamento.carga_horaria ?? 0} horas
                </td>


                <td>

${gerarAcessoTreinamento(treinamento)}

</td>

<td>

${
    usuarioEhGestor()
    ? "-"
    : treinamento.concluido
        ? `<span class="status-concluido">Concluído</span>`
        : `
            <button
                class="btn-concluir"
                onclick="concluirTreinamento(${treinamento.id})"
            >
                Concluir
            </button>
        `
}

</td>

${colunaAcoes}

            </tr>

        `;

    });

}


// ==============================
// PESQUISAR
// ==============================

function pesquisarTreinamento(){

    const campo =
        document.getElementById(
            "pesquisa"
        );


    if(!campo) return;


    const texto =
        campo.value
            .toLowerCase();


    const filtrados =
        treinamentosLista.filter(
            t =>

                (t.titulo ?? "")
                    .toLowerCase()
                    .includes(texto)

        );


    renderizarTreinamentos(
        filtrados
    );

}


// ==============================
// CARDS
// ==============================

function atualizarNumeros(lista){

    const total =
        document.getElementById(
            "total-treinamentos"
        );


    const carga =
        document.getElementById(
            "carga-treinamentos"
        );


    const totalHoras =
        lista.reduce(
            (soma, treinamento) => {

                return soma +
                    Number(
                        treinamento.carga_horaria || 0
                    );

            },
            0
        );


    if(total){

        total.innerHTML =
            lista.length;

    }


    if(carga){

        carga.innerHTML =
            totalHoras + "h";

    }

}


// ==============================
// EXCLUIR
// ==============================

async function excluirTreinamento(id){

    // Proteção adicional no JS
    if(!usuarioEhGestor()){

        alert(
            "Apenas gestores podem excluir treinamentos."
        );

        return;

    }


    if(
        !confirm(
            "Deseja excluir este treinamento?"
        )
    ){

        return;

    }


    try{

        const resposta =
            await fetch(
                `/api/treinamentos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await resposta.json();


        if(!resposta.ok){

            alert(
                resultado.mensagem ||
                "Você não tem permissão para excluir este treinamento."
            );

            return;

        }


        carregarTreinamentos();

    }

    catch(erro){

        console.error(
            "Erro ao excluir treinamento:",
            erro
        );


        alert(
            "Erro ao excluir treinamento."
        );

    }

}


// ==============================
// EDITAR
// ==============================

async function editarTreinamento(id){

    // Proteção adicional no JS
    if(!usuarioEhGestor()){

        alert(
            "Apenas gestores podem editar treinamentos."
        );

        return;

    }


    try{

        const resposta =
            await fetch(
                `/api/treinamentos/${id}`
            );


        if(!resposta.ok){

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const treinamento =
            await resposta.json();


        document.getElementById(
            "id-treinamento"
        ).value =
            treinamento.id;


        document.getElementById(
            "titulo"
        ).value =
            treinamento.titulo ?? "";


        document.getElementById(
            "descricao"
        ).value =
            treinamento.descricao ?? "";


        document.getElementById(
            "carga_horaria"
        ).value =
            treinamento.carga_horaria ?? "";


        document.getElementById(
            "link"
        ).value =
            treinamento.link ?? "";


        document.getElementById(
            "titulo-modal"
        ).innerHTML = `

            <i class="fa-solid fa-pen"></i>

            Editar Treinamento

        `;


        abrirFormularioTreinamento();

    }


    catch(erro){

        console.error(
            "Erro ao buscar treinamento:",
            erro
        );


        alert(
            "Erro ao carregar treinamento."
        );

    }

}

// ==============================
// CONCLUIR TREINAMENTO
// ==============================

async function concluirTreinamento(id){

    try{

        const resposta =
            await fetch(

                `/api/treinamentos/${id}/concluir`,

                {

                    method: "PUT"

                }

            );

        const resultado =
            await resposta.json();

        if(!resposta.ok){

            alert(
                resultado.mensagem ||
                "Erro ao concluir treinamento."
            );

            return;

        }

        alert(
            resultado.mensagem
        );

        carregarTreinamentos();

    }

    catch(erro){

        console.error(erro);

        alert(
            "Erro ao concluir treinamento."
        );

    }

}


// ==============================
// DISPONIBILIZAR FUNÇÕES
// ==============================

window.pesquisarTreinamento =
    pesquisarTreinamento;


window.excluirTreinamento =
    excluirTreinamento;


window.editarTreinamento =
    editarTreinamento;

window.concluirTreinamento =
    concluirTreinamento;


// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    carregarTreinamentos
);


// ==============================
// ABRIR VISUALIZAÇÃO TREINAMENTO
// ==============================

async function abrirTreinamento(id){


    try{


        const resposta =
            await fetch(
                `/api/treinamentos/${id}`
            );


        const treinamento =
            await resposta.json();



        document.getElementById(
            "visualizar-titulo"
        ).innerText =
            treinamento.titulo;



        document.getElementById(
            "visualizar-descricao"
        ).innerText =
            treinamento.descricao || "-";



        const plataforma =
            document.getElementById(
                "visualizar-plataforma"
            );


        if(plataforma){

            plataforma.innerText =
                treinamento.plataforma
                ?
                "Plataforma: " + treinamento.plataforma
                :
                "Conteúdo do curso";

        }




        // CAPÍTULOS

        const capitulos =
            document.getElementById(
                "visualizar-capitulos"
            );


        capitulos.innerHTML = "";



        if(treinamento.conteudo){


            treinamento.conteudo
            .split("\n")
            .forEach(capitulo => {


                capitulos.innerHTML += `

                    <li>
                        ${capitulo}
                    </li>

                `;


            });


        }





        const player =
            document.getElementById(
                "visualizar-player"
            );


        const botao =
            document.getElementById(
                "btn-acessar-curso"
            );


        player.innerHTML = "";
        player.style.display = "none";
        botao.style.display = "none";




        const link =
            formatarLink(
                treinamento.link
            );

            console.log("LINK:", link);
            console.log("É PDF:", link.toLowerCase().endsWith(".pdf"));



        // ==========================
        // YOUTUBE
        // ==========================

       if(
    link.includes("youtube.com") ||
    link.includes("youtu.be")
){

    let videoId = "";

    const url = new URL(link);


    if(url.hostname.includes("youtube.com")){

        videoId =
            url.searchParams.get("v");

    }


    else if(url.hostname.includes("youtu.be")){

        videoId =
            url.pathname.replace("/", "");

    }



    player.innerHTML = `

    <div class="video-bloqueado">

        <p>
            Este vídeo não permite reprodução dentro da plataforma.
        </p>


        <a
            href="${link}"
            target="_blank"
            class="btn-acessar"
        >
            Assistir no YouTube
        </a>

    </div>

    `;


    player.style.display = "block";


        }



        // ==========================
        // PDF
        // ==========================

        else if(
            link.toLowerCase().endsWith(".pdf")
        ){


            player.innerHTML = `

                <iframe

                    width="100%"
                    height="500"

                    src="${link}">

                </iframe>

            `;


            player.style.display =
                "block";


        }



        // ==========================
        // OUTRAS PLATAFORMAS
        // ==========================

        else{


            botao.href =
                link;


            botao.style.display =
                "inline-flex";


        }




        document.getElementById(
            "modal-visualizar-treinamento"
        ).classList.add(
            "ativo"
        );


    }


    catch(erro){


        console.error(
            erro
        );


        alert(
            "Erro ao abrir treinamento."
        );


    }

}

function fecharVisualizacaoTreinamento(){


    document.getElementById(
        "modal-visualizar-treinamento"
    )
    .classList.remove(
        "ativo"
    );


}


window.abrirTreinamento =
    abrirTreinamento;


window.fecharVisualizacaoTreinamento =
    fecharVisualizacaoTreinamento;