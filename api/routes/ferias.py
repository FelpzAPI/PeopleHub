from flask import Blueprint, request, jsonify, render_template, session

from api.database import db
from api.models import Ferias, Colaborador, Usuario

from api.auth import login_obrigatorio, api_gestor_obrigatorio

from datetime import datetime


ferias = Blueprint(
    "ferias",
    __name__
)


# ==============================
# PÁGINA HTML
# ==============================

@ferias.route("/ferias")
@login_obrigatorio
def pagina_ferias():

    return render_template(
        "ferias.html"
    )


# ==============================
# LISTAR FÉRIAS
# ==============================

@ferias.route(
    "/api/ferias",
    methods=["GET"]
)
@login_obrigatorio
def listar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    # ==========================================
    # GESTOR
    # ==========================================

    if usuario.perfil == "Gestor":

        # Gestor visualiza todas as férias
        lista = Ferias.query.all()

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    else:

        colaborador_id = usuario.colaborador_id

        # Funcionário visualiza somente as próprias férias
        lista = Ferias.query.filter_by(
            colaborador_id=colaborador_id
        ).all()

    resultado = []

    for item in lista:

        colaborador = Colaborador.query.get(
            item.colaborador_id
        )

        resultado.append({

            "id":
            item.id,

            "colaborador":
            colaborador.nome
            if colaborador
            else "Não encontrado",

            "setor":
            colaborador.setor
            if colaborador
            else "-",

            "colaborador_id":
            item.colaborador_id,

            "data_inicio":
            str(item.data_inicio),

            "data_fim":
            str(item.data_fim),

            "status":
            item.status

        })

    return jsonify({

        "perfil":
        usuario.perfil,

        "ferias":
        resultado

    }), 200

# ==============================
# DATAS OCUPADAS
# ==============================

@ferias.route(
    "/api/ferias/ocupadas",
    methods=["GET"]
)
@login_obrigatorio
def datas_ocupadas():

    lista = Ferias.query.filter(
        Ferias.status.in_([
            "Aprovada",
            "Pendente"
        ])
    ).all()

    resultado = []

    for item in lista:

        resultado.append({

            "inicio":
            str(item.data_inicio),

            "fim":
            str(item.data_fim),

            "status":
            item.status

        })

    return jsonify(resultado), 200


# ==============================
# CRIAR SOLICITAÇÃO
# ==============================

@ferias.route(
    "/api/ferias",
    methods=["POST"]
)
@login_obrigatorio
def criar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    dados = request.json or {}

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    if usuario.perfil != "Gestor":

        # Funcionário só pode solicitar
        # férias para ele mesmo

        colaborador_id = usuario.colaborador_id

        # Verifica se o usuário está vinculado
        # a um colaborador

        if not colaborador_id:

            return jsonify({

                "mensagem":
                "Usuário não está vinculado a um colaborador."

            }), 400

    # ==========================================
    # GESTOR
    # ==========================================

    else:

        colaborador_id = dados.get(
            "colaborador_id"
        )

        if not colaborador_id:

            return jsonify({

                "mensagem":
                "Informe o colaborador."

            }), 400

    # ==========================================
    # DATAS
    # ==========================================

    data_inicio = dados.get(
        "data_inicio"
    )

    data_fim = dados.get(
        "data_fim"
    )

    if not data_inicio or not data_fim:

        return jsonify({

            "mensagem":
            "Informe a data de início e a data de fim."

        }), 400

    try:

        data_inicio = datetime.strptime(
            data_inicio,
            "%Y-%m-%d"
        ).date()

        data_fim = datetime.strptime(
            data_fim,
            "%Y-%m-%d"
        ).date()

    except ValueError:

        return jsonify({

            "mensagem":
            "Formato de data inválido."

        }), 400

    # Verifica se a data final não é anterior
    # à data inicial

    if data_fim < data_inicio:

        return jsonify({

            "mensagem":
            "A data final não pode ser anterior à data inicial."

        }), 400

    # ==========================================
    # CRIAR FÉRIAS
    # ==========================================

    nova_ferias = Ferias(

        colaborador_id=colaborador_id,

        data_inicio=data_inicio,

        data_fim=data_fim,

        status="Pendente"

    )

    db.session.add(
        nova_ferias
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Solicitação de férias enviada!"

    }), 201


# ==============================
# BUSCAR FÉRIAS POR ID
# ==============================

@ferias.route(
    "/api/ferias/<int:id>",
    methods=["GET"]
)
@login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    item = Ferias.query.get_or_404(
        id
    )

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    if usuario.perfil != "Gestor":

        # Funcionário não pode consultar
        # férias de outro colaborador

        if item.colaborador_id != usuario.colaborador_id:

            return jsonify({

                "mensagem":
                "Você não tem permissão para visualizar estas férias."

            }), 403

    return jsonify({

        "id":
        item.id,

        "colaborador_id":
        item.colaborador_id,

        "data_inicio":
        str(item.data_inicio),

        "data_fim":
        str(item.data_fim),

        "status":
        item.status

    }), 200


# ==============================
# ATUALIZAR
# ==============================

@ferias.route(
    "/api/ferias/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    item = Ferias.query.get_or_404(
        id
    )

    dados = request.json or {}

    # ==========================================
    # COLABORADOR
    # ==========================================

    if dados.get("colaborador_id"):

        item.colaborador_id = dados.get(
            "colaborador_id"
        )

    # ==========================================
    # DATA INÍCIO
    # ==========================================

    if dados.get("data_inicio"):

        try:

            item.data_inicio = datetime.strptime(

                dados["data_inicio"],

                "%Y-%m-%d"

            ).date()

        except ValueError:

            return jsonify({

                "mensagem":
                "Formato de data de início inválido."

            }), 400

    # ==========================================
    # DATA FIM
    # ==========================================

    if dados.get("data_fim"):

        try:

            item.data_fim = datetime.strptime(

                dados["data_fim"],

                "%Y-%m-%d"

            ).date()

        except ValueError:

            return jsonify({

                "mensagem":
                "Formato de data final inválido."

            }), 400

    # ==========================================
    # VALIDAR DATAS
    # ==========================================

    if item.data_fim < item.data_inicio:

        return jsonify({

            "mensagem":
            "A data final não pode ser anterior à data inicial."

        }), 400

    # ==========================================
    # STATUS
    # ==========================================

    item.status = dados.get(

        "status",

        item.status

    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Férias atualizadas com sucesso!"

    }), 200


# ==============================
# EXCLUIR
# ==============================

@ferias.route(
    "/api/ferias/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    item = Ferias.query.get_or_404(
        id
    )

    db.session.delete(
        item
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Férias excluídas com sucesso!"

    }), 200


# ==============================
# ALTERAR STATUS
# ==============================

@ferias.route(
    "/api/ferias/<int:id>/status",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def alterar_status(id):

    item = Ferias.query.get_or_404(
        id
    )

    dados = request.json or {}

    item.status = dados.get(

        "status",

        item.status

    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Status atualizado com sucesso!"

    }), 200