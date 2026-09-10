document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);

const idMeta = urlParams.get("id");


if(idMeta){

    carregarMetaEdicao(idMeta);

}


    const form = document.getElementById("form-meta");

    const selectColaborador = document.getElementById("colaborador");

    const mensagem = document.getElementById("mensagem");



    // ==============================
    // CARREGAR COLABORADORES
    // ==============================

    async function carregarColaboradores(){


        const resposta = await fetch(
            "/api/colaboradores"
        );


        const colaboradores = await resposta.json();



        selectColaborador.innerHTML = `
            <option value="">
                Selecione um colaborador
            </option>
        `;



        colaboradores.forEach(colaborador => {


            const option = document.createElement("option");


            option.value = colaborador.id;


            option.textContent = colaborador.nome;



            selectColaborador.appendChild(option);


        });


    }



    carregarColaboradores();




    // ==============================
    // CADASTRAR META
    // ==============================


    form.addEventListener(
        "submit",
        async (e)=>{


        e.preventDefault();

            if(!selectColaborador.value){

                mensagem.innerHTML = "Selecione um colaborador";
                mensagem.style.color = "red";

                return;

}

        const dados = {


            colaborador_id:
            selectColaborador.value,


            titulo:
            document.getElementById("titulo").value,


            descricao:
            document.getElementById("descricao").value,


            objetivo:
            document.getElementById("objetivo").value,


            prazo:
            document.getElementById("prazo").value,


            status:
            document.getElementById("status").value


        };




        const id = document
.getElementById("form-meta")
.dataset.id;


const url = id
? `/api/metas/${id}`
: "/api/metas";


const metodo = id
? "PUT"
: "POST";



const resposta = await fetch(
    url,
    {

        method:metodo,

                headers:{
                    "Content-Type":"application/json"
                },

                body:
                JSON.stringify(dados)

            }
        );




        const resultado = await resposta.json().catch(()=>{
        return {
        mensagem:"Erro ao cadastrar meta"
            }
        });




        mensagem.innerHTML =
        resultado.mensagem;



        if(resposta.ok){


            mensagem.style.color = "green";



            setTimeout(()=>{


                window.location.href =
                "/metas";


            },1000);



        }else{


            mensagem.style.color = "red";


        }



    });


});

async function carregarMetaEdicao(id){


    const resposta = await fetch(
        `/api/metas/${id}`
    );


    const meta = await resposta.json();



    document.getElementById("titulo").value =
    meta.titulo;



    document.getElementById("descricao").value =
    meta.descricao;



    document.getElementById("objetivo").value =
    meta.objetivo;



    document.getElementById("status").value =
    meta.status;



    document.getElementById("prazo").value =
    meta.prazo;



    document.getElementById("colaborador").value =
    meta.colaborador_id;



    // guarda o id para atualizar depois

    document.getElementById("form-meta")
    .dataset.id = id;


}