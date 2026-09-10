document.addEventListener(
"DOMContentLoaded",
()=>{


const formulario =
document.getElementById(
"form-colaborador"
);


const mensagem =
document.getElementById(
"mensagem"
);


const idCampo =
document.getElementById(
"id"
);


const textoBotao =
document.getElementById(
"texto-botao"
);


const checkboxAcesso =
document.getElementById(
"criar_acesso"
);


const camposAcesso =
document.getElementById(
"campos-acesso"
);


const senhaCampo =
document.getElementById(
"senha"
);


const confirmarSenhaCampo =
document.getElementById(
"confirmar_senha"
);



// ==============================
// MOSTRAR / ESCONDER ACESSO
// ==============================

if(checkboxAcesso){

    checkboxAcesso.addEventListener(
    "change",
    function(){

        if(this.checked){

            if(camposAcesso){
                camposAcesso.style.display = "block";
            }

            if(senhaCampo){
                senhaCampo.required = true;
            }

            if(confirmarSenhaCampo){
                confirmarSenhaCampo.required = true;
            }

        }

        else{

            if(camposAcesso){
                camposAcesso.style.display = "none";
            }

            if(senhaCampo){

                senhaCampo.required = false;

                senhaCampo.value = "";

            }

            if(confirmarSenhaCampo){

                confirmarSenhaCampo.required = false;

                confirmarSenhaCampo.value = "";

            }

        }

    });

}



// ==============================
// VERIFICAR EDIÇÃO
// ==============================

const editar =
localStorage.getItem(
"colaboradorEditar"
);


if(editar){

    const colaborador =
    JSON.parse(
        editar
    );


    idCampo.value =
    colaborador.id;


    document.getElementById(
        "nome"
    ).value =
    colaborador.nome;


    document.getElementById(
        "cargo"
    ).value =
    colaborador.cargo;


    document.getElementById(
        "setor"
    ).value =
    colaborador.setor;


    document.getElementById(
        "email"
    ).value =
    colaborador.email;


    document.getElementById(
        "status"
    ).value =
    colaborador.status;


    if(textoBotao){

        textoBotao.innerHTML =
        "Atualizar Colaborador";

    }


    /*
    Não permitimos criar acesso durante
    a edição por este formulário.
    */

    if(checkboxAcesso){

        checkboxAcesso.checked =
        false;

        checkboxAcesso.disabled =
        true;

    }


    if(camposAcesso){

        camposAcesso.style.display =
        "none";

    }


    localStorage.removeItem(
        "colaboradorEditar"
    );

}



// ==============================
// SALVAR / EDITAR
// ==============================

formulario.addEventListener(
"submit",
async function(e){

    e.preventDefault();


    const id =
    idCampo.value;



    // ==============================
    // VERIFICAR SENHAS
    // ==============================

    if(
        !id &&
        checkboxAcesso &&
        checkboxAcesso.checked
    ){

        if(
            !senhaCampo.value ||
            !confirmarSenhaCampo.value
        ){

            mensagem.innerHTML =
            "Informe e confirme a senha.";

            mensagem.style.color =
            "red";

            return;

        }


        if(
            senhaCampo.value !==
            confirmarSenhaCampo.value
        ){

            mensagem.innerHTML =
            "As senhas não coincidem.";

            mensagem.style.color =
            "red";

            return;

        }

            const regraSenha =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


    if(!regraSenha.test(senhaCampo.value)){

        mensagem.innerHTML =
        `
        A senha deve possuir:<br>
        ✔ mínimo de 8 caracteres<br>
        ✔ uma letra maiúscula<br>
        ✔ uma letra minúscula<br>
        ✔ um número
        `;

        mensagem.style.color =
        "red";

        return;

    }

    }



    // ==============================
    // DADOS DO COLABORADOR
    // ==============================

    const dados = {

        nome:
        document.getElementById(
            "nome"
        ).value,

        cargo:
        document.getElementById(
            "cargo"
        ).value,

        setor:
        document.getElementById(
            "setor"
        ).value,

        email:
        document.getElementById(
            "email"
        ).value,

        status:
        document.getElementById(
            "status"
        ).value

    };



    // ==============================
    // CRIAR ACESSO
    // ==============================

    if(
        !id &&
        checkboxAcesso &&
        checkboxAcesso.checked
    ){

        dados.criar_acesso =
        true;

        dados.senha =
        senhaCampo.value;

    }

    else{

        dados.criar_acesso =
        false;

    }



    // ==============================
    // MÉTODO
    // ==============================

    const metodo =
    id
    ? "PUT"
    : "POST";


    const url =
    id
    ? `/api/colaboradores/${id}`
    : "/api/colaboradores";



    try{


        const resposta =
        await fetch(
            url,
            {

                method:
                metodo,

                headers:{

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



        mensagem.innerHTML =
        resultado.mensagem;



        // ==============================
        // SUCESSO
        // ==============================

        if(resposta.ok){

            mensagem.style.color =
            "green";


            setTimeout(
            ()=>{

                window.location.href =
                "/colaboradores";

            },
            1000
            );

        }


        // ==============================
        // ERRO
        // ==============================

        else{

            mensagem.style.color =
            "red";

        }


    }


    catch(erro){

        console.error(
            erro
        );


        mensagem.innerHTML =
        "Erro ao salvar colaborador.";


        mensagem.style.color =
        "red";

    }


});

});



// ==============================
// BOTÃO SAIR
// ==============================

const btnSair =
document.getElementById(
"btn-sair"
);


if(btnSair){

    btnSair.addEventListener(
    "click",
    ()=>{

        window.location.href =
        "/logout";

    });

}