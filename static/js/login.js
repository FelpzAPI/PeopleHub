
document
.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();


    const email =
    document.getElementById("email").value;


    const senha =
    document.getElementById("senha").value;



    try {


        const resposta = await fetch(
            "/api/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    email: email,
                    senha: senha
                })
            }
        );



        const dados = await resposta.json();



        document
        .getElementById("mensagem")
        .innerHTML = dados.mensagem;



        if(resposta.ok){

            setTimeout(()=>{

                window.location.href="/dashboard";

            },1000);

        }


    } catch(error){


        document
        .getElementById("mensagem")
        .innerHTML =
        "Erro ao conectar com o servidor.";


    }


});