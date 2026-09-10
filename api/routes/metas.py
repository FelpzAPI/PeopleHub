from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    session
)

from api.database import db

from api.models import (
    Meta,
    Colaborador,
    Usuario
)

from api.auth import (
    login_obrigatorio,
    api_gestor_obrigatorio,
    api_login_obrigatorio
)

from datetime import datetime


metas = Blueprint(
    "metas",
    __name__
)


# ==============================
# PÁGINA NOVA META
# ==============================

@metas.route("/nova-meta")
@api_gestor_obrigatorio
def nova_meta():

    return render_template(
        "nova_meta.html"
    )


# ==============================
# PÁGINA HTML
# ==============================

@metas.route("/metas")
@login_obrigatorio
def pagina_metas():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    return render_template(
        "metas.html",
        usuario=usuario
    )


# ==============================
# LISTAR METAS
# ==============================

@metas.route(
    "/api/metas",
    methods=["GET"]
)
@api_login_obrigatorio
def listar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    # ==============================
    # GESTOR
    # ==============================

    if usuario.perfil == "Gestor":

        lista = Meta.query.all()


    # ==============================
    # FUNCIONÁRIO
    # ==============================

    else:

        colaborador_id = usuario.colaborador_id

        if not colaborador_id:

            return jsonify({

                "perfil": "Funcionário",

                "metas": []

            }), 200


        lista = Meta.query.filter_by(
            colaborador_id=colaborador_id
        ).all()


    resultado = []


    for meta in lista:

        colaborador = Colaborador.query.get(
            meta.colaborador_id
        )


        resultado.append({

            "id":
            meta.id,

            "titulo":
            meta.titulo,

            "descricao":
            meta.descricao,

            "objetivo":
            meta.objetivo,

            "status":
            meta.status,

            "prazo":
            str(meta.prazo)
            if meta.prazo
            else "",

            "colaborador":
            colaborador.nome
            if colaborador
            else "Não encontrado",

            "colaborador_id":
            meta.colaborador_id

        })


    return jsonify({

        "perfil":
        usuario.perfil,

        "metas":
        resultado

    }), 200


# ==============================
# CRIAR META
# ==============================

@metas.route(
    "/api/metas",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():

    dados = request.json or {}


    # ==============================
    # CAMPOS
    # ==============================

    titulo = dados.get(
        "titulo"
    )

    prazo = dados.get(
        "prazo"
    )

    colaborador_id = dados.get(
        "colaborador_id"
    )


    # ==============================
    # VALIDAR TÍTULO
    # ==============================

    if not titulo:

        return jsonify({

            "mensagem":
            "Informe o título da meta."

        }), 400


    # ==============================
    # VALIDAR PRAZO
    # ==============================

    if not prazo:

        return jsonify({

            "mensagem":
            "Informe o prazo da meta."

        }), 400


    # ==============================
    # VALIDAR COLABORADOR
    # ==============================

    if not colaborador_id:

        return jsonify({

            "mensagem":
            "Informe o colaborador."

        }), 400


    # ==============================
    # CONVERTER DATA
    # ==============================

    try:

        prazo_convertido = datetime.strptime(
            prazo,
            "%Y-%m-%d"
        ).date()

    except (ValueError, TypeError):

        return jsonify({

            "mensagem":
            "Prazo inválido."

        }), 400

    # ==============================
# IMPEDIR DATA PASSADA
# ==============================

    if prazo_convertido < datetime.today().date():

        return jsonify({

        "mensagem":
        "O prazo da meta não pode ser anterior à data atual."

    }), 400


    # ==============================
    # VERIFICAR COLABORADOR
    # ==============================

    colaborador = Colaborador.query.get(
        colaborador_id
    )


    if not colaborador:

        return jsonify({

            "mensagem":
            "Colaborador não encontrado."

        }), 404


    # ==============================
    # CRIAR META
    # ==============================

    nova_meta = Meta(

        titulo=titulo,

        descricao=dados.get(
            "descricao"
        ),

        objetivo=dados.get(
            "objetivo"
        ),

        status=dados.get(
            "status",
            "Em andamento"
        ),

        prazo=prazo_convertido,

        colaborador_id=colaborador_id

    )


    db.session.add(
        nova_meta
    )

    db.session.commit()


    return jsonify({

        "mensagem":
        "Meta criada com sucesso!"

    }), 201


# ==============================
# BUSCAR META
# ==============================

@metas.route(
    "/api/metas/<int:id>",
    methods=["GET"]
)
@api_login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    meta = Meta.query.get_or_404(
        id
    )


    # ==============================
    # FUNCIONÁRIO
    # ==============================

    if usuario.perfil != "Gestor":

        if (
            not usuario.colaborador_id
            or
            meta.colaborador_id != usuario.colaborador_id
        ):

            return jsonify({

                "mensagem":
                "Você não tem permissão para visualizar esta meta."

            }), 403


    return jsonify({

        "id":
        meta.id,

        "titulo":
        meta.titulo,

        "descricao":
        meta.descricao,

        "objetivo":
        meta.objetivo,

        "status":
        meta.status,

        "prazo":
        str(meta.prazo)
        if meta.prazo
        else "",

        "colaborador_id":
        meta.colaborador_id

    }), 200


# ==============================
# ATUALIZAR META
# ==============================

@metas.route(
    "/api/metas/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    meta = Meta.query.get_or_404(
        id
    )

    dados = request.json or {}


    # ==============================
    # TÍTULO
    # ==============================

    meta.titulo = dados.get(
        "titulo",
        meta.titulo
    )


    # ==============================
    # DESCRIÇÃO
    # ==============================

    meta.descricao = dados.get(
        "descricao",
        meta.descricao
    )


    # ==============================
    # OBJETIVO
    # ==============================

    meta.objetivo = dados.get(
        "objetivo",
        meta.objetivo
    )


    # ==============================
    # STATUS
    # ==============================

    meta.status = dados.get(
        "status",
        meta.status
    )


    # ==============================
    # PRAZO
    # ==============================

    if dados.get("prazo"):

        try:

             prazo_convertido = datetime.strptime(
            dados.get("prazo"),
            "%Y-%m-%d"
        ).date()

        except (ValueError, TypeError):

            return jsonify({

            "mensagem":
            "Prazo inválido."

        }), 400

    if prazo_convertido < datetime.today().date():

        return jsonify({

            "mensagem":
            "O prazo da meta não pode ser anterior à data atual."

        }), 400

    meta.prazo = prazo_convertido


    # ==============================
    # COLABORADOR
    # ==============================

    if dados.get("colaborador_id"):

        colaborador = Colaborador.query.get(
            dados.get("colaborador_id")
        )


        if not colaborador:

            return jsonify({

                "mensagem":
                "Colaborador não encontrado."

            }), 404


        meta.colaborador_id = dados.get(
            "colaborador_id"
        )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Meta atualizada com sucesso!"

    }), 200


# ==============================
# LISTAR COLABORADORES
# ==============================

@metas.route(
    "/api/metas/colaboradores",
    methods=["GET"]
)
@api_gestor_obrigatorio
def listar_colaboradores():

    lista = Colaborador.query.all()


    resultado = []


    for colaborador in lista:

        resultado.append({

            "id":
            colaborador.id,

            "nome":
            colaborador.nome

        })


    return jsonify(
        resultado
    ), 200


# ==============================
# EXCLUIR META
# ==============================

@metas.route(
    "/api/metas/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    meta = Meta.query.get_or_404(
        id
    )


    db.session.delete(
        meta
    )

    db.session.commit()


    return jsonify({

        "mensagem":
        "Meta excluída com sucesso!"

    }), 200