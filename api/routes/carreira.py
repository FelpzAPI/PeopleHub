from flask import Blueprint, request, jsonify, render_template, session

from api.database import db
from api.models import PlanoCarreira, Colaborador, Usuario

from api.auth import login_obrigatorio, api_gestor_obrigatorio


carreira = Blueprint(
    "carreira",
    __name__
)


# ==============================
# PÁGINA HTML
# ==============================

@carreira.route("/carreira")
@login_obrigatorio
def pagina_carreira():

    return render_template(
        "carreira.html"
    )


# ==============================
# LISTAR PLANOS
# ==============================

@carreira.route(
    "/api/carreira",
    methods=["GET"]
)
@login_obrigatorio
def listar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    print("=" * 50)
    print("USUÁRIO:", usuario.nome)
    print("PERFIL:", usuario.perfil)
    print("USUARIO.COLABORADOR_ID:", usuario.colaborador_id)
    print("=" * 50)

    # ==========================
    # GESTOR
    # ==========================

    if usuario.perfil == "Gestor":

        lista = PlanoCarreira.query.all()

    # ==========================
    # FUNCIONÁRIO
    # ==========================

    else:

        lista = PlanoCarreira.query.filter_by(
            colaborador_id=usuario.colaborador_id
        ).all()

    print("PLANOS ENCONTRADOS:", len(lista))

    resultado = []

    for plano in lista:

        colaborador = Colaborador.query.get(
            plano.colaborador_id
        )

        resultado.append({

            "id":
            plano.id,

            "colaborador_id":
            plano.colaborador_id,

            "colaborador":
            colaborador.nome
            if colaborador
            else "Não encontrado",

            "cargo_atual":
            plano.cargo_atual,

            "cargo_desejado":
            plano.cargo_desejado,

            "objetivo":
            plano.objetivo,

            "status":
            plano.status

        })

    return jsonify(resultado), 200


# ==============================
# CRIAR PLANO
# ==============================

@carreira.route(
    "/api/carreira",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():

    dados = request.json or {}

    novo_plano = PlanoCarreira(

        colaborador_id=dados.get(
            "colaborador_id"
        ),

        cargo_atual=dados.get(
            "cargo_atual"
        ),

        cargo_desejado=dados.get(
            "cargo_desejado"
        ),

        objetivo=dados.get(
            "objetivo"
        ),

        status=dados.get(
            "status",
            "Em desenvolvimento"
        )

    )

    db.session.add(
        novo_plano
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Plano de carreira criado com sucesso!"

    }), 201


# ==============================
# BUSCAR
# ==============================

@carreira.route(
    "/api/carreira/<int:id>",
    methods=["GET"]
)
@login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    plano = PlanoCarreira.query.get_or_404(id)

    if (
        usuario.perfil != "Gestor"
        and plano.colaborador_id != usuario.colaborador_id
    ):

        return jsonify({

            "mensagem":
            "Você não tem permissão para visualizar este plano."

        }), 403

    return jsonify({

        "id":
        plano.id,

        "colaborador_id":
        plano.colaborador_id,

        "cargo_atual":
        plano.cargo_atual,

        "cargo_desejado":
        plano.cargo_desejado,

        "objetivo":
        plano.objetivo,

        "status":
        plano.status

    }), 200


# ==============================
# ATUALIZAR
# ==============================

@carreira.route(
    "/api/carreira/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    plano = PlanoCarreira.query.get_or_404(id)

    dados = request.json or {}

    plano.colaborador_id = dados.get(

        "colaborador_id",

        plano.colaborador_id

    )

    plano.cargo_atual = dados.get(

        "cargo_atual",

        plano.cargo_atual

    )

    plano.cargo_desejado = dados.get(

        "cargo_desejado",

        plano.cargo_desejado

    )

    plano.objetivo = dados.get(

        "objetivo",

        plano.objetivo

    )

    plano.status = dados.get(

        "status",

        plano.status

    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Plano atualizado com sucesso!"

    }), 200


# ==============================
# EXCLUIR
# ==============================

@carreira.route(
    "/api/carreira/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    plano = PlanoCarreira.query.get_or_404(id)

    db.session.delete(
        plano
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Plano de carreira excluído com sucesso!"

    }), 200