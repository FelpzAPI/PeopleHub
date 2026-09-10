from flask import Blueprint, render_template, jsonify, session

from api.models import (
    Colaborador,
    Meta,
    Avaliacao,
    Treinamento,
    Ferias,
    Ponto,
    Usuario
)

from api.auth import login_obrigatorio


dashboard = Blueprint(
    "dashboard",
    __name__
)


# ==============================
# PÁGINA DASHBOARD
# ==============================

@dashboard.route("/dashboard")
@login_obrigatorio
def dashboard_page():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    # ==========================================
    # GESTOR
    # ==========================================

    if usuario.perfil == "Gestor":

        dados = {

            "perfil": "Gestor",

            "nome": usuario.nome,

            "colaboradores":
            Colaborador.query.count(),

            "ferias":
            Ferias.query.count(),

            "treinamentos":
            Treinamento.query.count(),

            "avaliacoes":
            Avaliacao.query.count(),

            "metas":
            Meta.query.count(),

            "pontos":
            Ponto.query.count()

        }

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    else:

        colaborador_id = usuario.colaborador_id

        dados = {

            "perfil": "Funcionário",

            "nome": usuario.nome,

            # ----------------------------------
            # Minhas metas
            # ----------------------------------

            "metas":
            Meta.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            # ----------------------------------
            # Minhas avaliações
            # ----------------------------------

            "avaliacoes":
            Avaliacao.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            # ----------------------------------
            # Minhas férias
            # ----------------------------------

            "ferias":
            Ferias.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            # ----------------------------------
            # Meu ponto
            # ----------------------------------

            "pontos":
            Ponto.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            # ----------------------------------
            # Treinamentos continuam globais
            # ----------------------------------

            "treinamentos":
            Treinamento.query.count(),

            # ----------------------------------
            # Não mostrar quantidade de
            # colaboradores para funcionário
            # ----------------------------------

            "colaboradores": 0

        }


    return render_template(
        "menu.html",
        dados=dados,
        usuario=usuario
    )


# ==============================
# API DASHBOARD
# ==============================

@dashboard.route(
    "/api/dashboard",
    methods=["GET"]
)
@login_obrigatorio
def dados_dashboard():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    # ==========================================
    # GESTOR
    # ==========================================

    if usuario.perfil == "Gestor":

        dados = {

            "perfil": "Gestor",

            "nome": usuario.nome,

            "colaboradores":
            Colaborador.query.count(),

            "ferias":
            Ferias.query.count(),

            "treinamentos":
            Treinamento.query.count(),

            "avaliacoes":
            Avaliacao.query.count(),

            "metas":
            Meta.query.count(),

            "pontos":
            Ponto.query.count(),

            "presenca": 95,

            "desempenho": 87

        }


    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    else:

        colaborador_id = usuario.colaborador_id


        dados = {

            "perfil": "Funcionário",

            "nome": usuario.nome,

            "colaboradores": 0,

            "ferias":
            Ferias.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            "treinamentos":
            Treinamento.query.count(),

            "avaliacoes":
            Avaliacao.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            "metas":
            Meta.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            "pontos":
            Ponto.query.filter_by(
                colaborador_id=colaborador_id
            ).count(),

            "presenca": 0,

            "desempenho": 0

        }


    return jsonify(
        dados
    ), 200