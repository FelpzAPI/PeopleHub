from flask import Blueprint, render_template

from api.auth import api_gestor_obrigatorio



configuracoes = Blueprint(
    "configuracoes",
    __name__
)





# ==============================
# PÁGINA CONFIGURAÇÕES
# ==============================

@configuracoes.route(
    "/configuracoes"
)
@api_gestor_obrigatorio
def pagina_configuracoes():


    return render_template(
        "configuracoes.html"
    )