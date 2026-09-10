// ==============================
// MODAL TREINAMENTO
// ==============================


function abrirFormularioTreinamento(){


    document
    .getElementById("modal-treinamento")
    .classList.add("ativo");


}



function fecharFormularioTreinamento(){


    document
    .getElementById("modal-treinamento")
    .classList.remove("ativo");


    limparFormulario();


}




function limparFormulario(){


    document.getElementById(
        "id-treinamento"
    ).value = "";


    document.getElementById(
        "titulo"
    ).value = "";


    document.getElementById(
        "descricao"
    ).value = "";


    document.getElementById(
        "carga_horaria"
    ).value = "";


    document.getElementById(
        "link"
    ).value = "";

    document.getElementById(
    "tipo"
    ).value = "youtube";


    document.getElementById(
        "plataforma"
    ).value = "";


    document.getElementById(
        "conteudo"
    ).value = "";


}






// ==============================
// SALVAR / EDITAR
// ==============================


document.addEventListener(
"DOMContentLoaded",
()=>{


const formulario =
document.getElementById(
"form-treinamento"
);



if(!formulario)
return;





formulario.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





const id =
document.getElementById(
"id-treinamento"
).value;






const dados = {


titulo:
document.getElementById(
"titulo"
).value,


descricao:
document.getElementById(
"descricao"
).value,


carga_horaria:
document.getElementById(
"carga_horaria"
).value,


link:
document.getElementById(
"link"
).value,

tipo:
document.getElementById(
"tipo"
).value,

plataforma:
document.getElementById("plataforma").value,


conteudo:
document.getElementById(
"conteudo"
).value


};






const metodo =
id
?
"PUT"
:
"POST";






const url =
id
?
`/api/treinamentos/${id}`
:
"/api/treinamentos";






try{


const resposta =
await fetch(
url,
{


method:metodo,


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






const mensagem =
document.getElementById(
"mensagem"
);



mensagem.innerHTML =
resultado.mensagem;






if(resposta.ok){


mensagem.style.color =
"green";



setTimeout(()=>{


fecharFormularioTreinamento();



window.location.reload();



},1000);



}



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
"Erro ao salvar treinamento";


mensagem.style.color =
"red";


}



});


});