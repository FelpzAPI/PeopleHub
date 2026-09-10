const formulario = document.getElementById("form-cadastro");

// ==========================
// CADASTRAR USUÁRIO
// ==========================

if (formulario) {

    formulario.addEventListener("submit", async function (e) {

        const senha =
    document.getElementById("senha").value;


if(
    senha.length < 8 ||
    !/[A-Z]/.test(senha) ||
    !/[a-z]/.test(senha) ||
    !/[0-9]/.test(senha) ||
    !/[@#$%&*!]/.test(senha)
){

    document.getElementById("mensagem").innerHTML =
        "A senha não atende aos requisitos de segurança.";

    document.getElementById("mensagem").style.color =
        "red";

    return;

}

        e.preventDefault();

        const dados = {

            nome: document.getElementById("nome").value.trim(),

            email: document.getElementById("email").value.trim(),

            senha: document.getElementById("senha").value,

            perfil: document.querySelector('input[name="perfil"]:checked').value,

            cargo: document.getElementById("cargo").value.trim(),

            setor: document.getElementById("setor").value.trim()

        };

        try {

            const resposta = await fetch("/api/cadastro", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)

            });

            const retorno = await resposta.json();

            document.getElementById("mensagem").innerHTML = retorno.mensagem;

            if (resposta.ok) {

                document.getElementById("mensagem").style.color = "green";

                formulario.reset();

            } else {

                document.getElementById("mensagem").style.color = "red";

            }

        }

        catch (erro) {

            console.error(erro);

            document.getElementById("mensagem").innerHTML = "Erro ao cadastrar usuário.";

            document.getElementById("mensagem").style.color = "red";

        }

    });

}



// ==========================
// LOGOUT
// ==========================

const btnSair = document.getElementById("btn-sair");

if (btnSair) {

    btnSair.addEventListener("click", async function () {

        try {

            await fetch("/logout");

        }

        catch (erro) {

            console.error(erro);

        }

        window.location.href = "/";

    });

}

// ==========================
// VALIDAÇÃO DE SENHA FORTE
// ==========================

const campoSenha = document.getElementById("senha");


if (campoSenha) {


    campoSenha.addEventListener(
        "input",
        function(){


            const senha = campoSenha.value;


            validarRequisito(
                "req-tamanho",
                senha.length >= 8
            );


            validarRequisito(
                "req-maiuscula",
                /[A-Z]/.test(senha)
            );


            validarRequisito(
                "req-minuscula",
                /[a-z]/.test(senha)
            );


            validarRequisito(
                "req-numero",
                /[0-9]/.test(senha)
            );


            validarRequisito(
                "req-especial",
                /[@#$%&*!]/.test(senha)
            );


        }
    );


}



function validarRequisito(id, valido){


    const elemento =
        document.getElementById(id);


    if(!elemento) return;



    const icone =
        elemento.querySelector("i");



    if(valido){


        elemento.classList.add(
            "valido"
        );


        elemento.classList.remove(
            "invalido"
        );


        icone.className =
            "fa-solid fa-circle-check";


    }else{


        elemento.classList.add(
            "invalido"
        );


        elemento.classList.remove(
            "valido"
        );


        icone.className =
            "fa-solid fa-circle-xmark";


    }


}