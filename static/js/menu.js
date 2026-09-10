fetch("/api/dashboard")

.then(response => response.json())

.then(data => {


document.getElementById("total-colaboradores").innerHTML = data.colaboradores;

document.getElementById("total-ferias").innerHTML = data.ferias;

document.getElementById("total-treinamentos").innerHTML = data.treinamentos;

document.getElementById("total-avaliacoes").innerHTML = data.avaliacoes;


document.getElementById("presenca").innerHTML = data.presenca + "%";

document.getElementById("metas-concluidas").innerHTML = data.metas + "%";

document.getElementById("desempenho").innerHTML = data.desempenho + "%";


})


.catch(error => {

console.log("Erro dashboard:", error);

});