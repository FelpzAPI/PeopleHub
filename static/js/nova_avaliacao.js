document.addEventListener("DOMContentLoaded", () => {


    const selectColaborador =
    document.getElementById("colaborador");


    const form =
    document.getElementById("form-avaliacao");


    const mensagem =
    document.getElementById("mensagem");


    let idEdicao = null;



    // ==============================
    // CARREGAR COLABORADORES
    // ==============================

    async function carregarColaboradores(){


        const resposta =
        await fetch(
            "/api/avaliacoes/colaboradores"
        );


        const colaboradores =
        await resposta.json();



        selectColaborador.innerHTML =
        `
        <option value="">
            Selecione um colaborador
        </option>
        `;



        colaboradores.forEach(colaborador=>{


            const option =
            document.createElement("option");


            option.value =
            colaborador.id;


            option.textContent =
            colaborador.nome;


            selectColaborador.appendChild(
                option
            );


        });


    }




    // ==============================
    // CARREGAR EDIÇÃO
    // ==============================

    function carregarEdicao(){


        const dados =
        localStorage.getItem(
            "avaliacaoEditar"
        );



        if(dados){


            const avaliacao =
            JSON.parse(dados);



            idEdicao =
            avaliacao.id;



            selectColaborador.value =
            avaliacao.colaborador_id;



            document.getElementById(
                "resultado"
            ).value =
            avaliacao.periodo || "";



            document.getElementById(
                "pontos_positivos"
            ).value =
            avaliacao.pontos_positivos || "";



            document.getElementById(
                "pontos_melhoria"
            ).value =
            avaliacao.pontos_melhoria || "";


            document.getElementById(
                "comentario"
            ).value =
            avaliacao.comentario || "";

            document.getElementById(
                "feedback_colaborador"
            ).value =
            avaliacao.feedback_colaborador || "";



            localStorage.removeItem(
                "avaliacaoEditar"
            );



            const botao =
            document.querySelector(
                "button[type='submit']"
            );


            if(botao){

                botao.innerHTML =
                "Atualizar Avaliação";

            }


        }


    }




    carregarColaboradores()
    .then(()=>{

        carregarEdicao();

    });





    // ==============================
    // SALVAR / EDITAR
    // ==============================


    form.addEventListener(
    "submit",
    async(e)=>{


        e.preventDefault();



        const dados = {


            colaborador_id:
            selectColaborador.value,


            periodo:
            document.getElementById(
                "resultado"
            ).value,

            tipo:
            document.getElementById(
                "tipo"
            ).value,

            pontos_positivos:
            document.getElementById(
                "pontos_positivos"
            ).value,



            pontos_melhoria:
            document.getElementById(
                "pontos_melhoria"
            ).value,



            comentario:
            document.getElementById(
                "comentario"
            ).value,

            feedback_colaborador:
            document.getElementById(
                "feedback_colaborador"
            ).value

        };





        const metodo =
        idEdicao
        ? "PUT"
        : "POST";



        const url =
        idEdicao
        ? `/api/avaliacoes/${idEdicao}`
        : "/api/avaliacoes";





        try{


            const resposta =
            await fetch(
                url,
                {

                    method: metodo,


                    headers:{

                        "Content-Type":
                        "application/json"

                    },


                    body:
                    JSON.stringify(dados)

                }
            );




            const resultado =
            await resposta.json();




            mensagem.innerHTML =
            resultado.mensagem;




            if(resposta.ok){


                mensagem.style.color =
                "green";



                setTimeout(()=>{


                    window.location.href =
                    "/avaliacoes";


                },1000);


            }



        }


        catch(erro){


            console.error(
                erro
            );


            mensagem.innerHTML =
            "Erro ao salvar avaliação";


            mensagem.style.color =
            "red";


        }



    });



});