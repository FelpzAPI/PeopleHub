document.addEventListener("DOMContentLoaded", () => {

    const botao = document.getElementById("btn-sair");

    if (botao) {

        botao.addEventListener("click", async () => {

            try {

                await fetch("/logout");

                window.location.href = "/";

            } catch (erro) {

                console.error(erro);

            }

        });

    }

});