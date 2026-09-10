from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for
)

from api.database import db

from api.models import (
    Avaliacao,
    Colaborador,
    Usuario
)

from api.auth import (
    login_obrigatorio,
    api_login_obrigatorio,
    api_gestor_obrigatorio
)

from datetime import date, datetime


avaliacao = Blueprint(
    "avaliacao",
    __name__
)


# ==============================
# PÁGINA NOVA AVALIAÇÃO
# ==============================

@avaliacao.route("/nova-avaliacao")
@login_obrigatorio
def nova_avaliacao():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    # Funcionário não pode acessar
    # a página de criação

    if usuario.perfil != "Gestor":

        return redirect(
            url_for(
                "avaliacao.pagina_avaliacoes"
            )
        )

    return render_template(
        "nova_avaliacao.html"
    )


# ==============================
# PÁGINA AVALIAÇÕES
# ==============================

@avaliacao.route("/avaliacoes")
@login_obrigatorio
def pagina_avaliacoes():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    return render_template(
        "avaliacoes.html",
        usuario=usuario
    )


# ==============================
# LISTAR AVALIAÇÕES
# ==============================

@avaliacao.route(
    "/api/avaliacoes",
    methods=["GET"]
)
@api_login_obrigatorio
def listar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    # ==========================================
    # GESTOR
    # ==========================================

    if usuario.perfil == "Gestor":

        lista = Avaliacao.query.all()

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    else:

        colaborador_id = usuario.colaborador_id

        if not colaborador_id:

            return jsonify({

                "perfil":
                "Funcionário",

                "avaliacoes":
                []

            }), 200

        lista = Avaliacao.query.filter_by(
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

            "colaborador_id":
            item.colaborador_id,

            "colaborador":
            colaborador.nome
            if colaborador
            else "Não encontrado",

            "periodo":
            item.periodo
            or "",

            "pontos_positivos":
            item.pontos_positivos
            or "",

            "pontos_melhoria":
            item.pontos_melhoria
            or "",

            "feedback_colaborador":
            item.feedback_colaborador
            or "",

            "comentario":
            item.comentario
            or "",

            "tipo":
            item.tipo
            or "",

            "data":
            str(item.data)
            if item.data
            else ""

        })

    return jsonify({

        "perfil":
        usuario.perfil,

        "avaliacoes":
        resultado

    }), 200


# ==============================
# LISTAR COLABORADORES
# ==============================

@avaliacao.route(
    "/api/avaliacoes/colaboradores",
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
# CRIAR AVALIAÇÃO
# ==============================

@avaliacao.route(
    "/api/avaliacoes",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():

    dados = request.json or {}

    # ==========================================
    # COLABORADOR
    # ==========================================

    colaborador_id = dados.get(
        "colaborador_id"
    )

    if not colaborador_id:

        return jsonify({

            "mensagem":
            "Informe o colaborador."

        }), 400

    colaborador = Colaborador.query.get(
        colaborador_id
    )

    if not colaborador:

        return jsonify({

            "mensagem":
            "Colaborador não encontrado."

        }), 404


    # ==========================================
    # DATA
    # ==========================================

    data_recebida = dados.get(
        "data"
    )

    if data_recebida:

        try:

            data_avaliacao = datetime.strptime(
                data_recebida,
                "%Y-%m-%d"
            ).date()

        except (ValueError, TypeError):

            return jsonify({

                "mensagem":
                "Data da avaliação inválida."

            }), 400

    else:

        data_avaliacao = date.today()

    # ==========================================
    # CRIAR
    # ==========================================

    nova_avaliacao = Avaliacao(

    colaborador_id=
    colaborador_id,

    periodo=
    dados.get(
        "periodo"
    ),

    pontos_positivos=
    dados.get(
        "pontos_positivos"
    ),

    pontos_melhoria=
    dados.get(
        "pontos_melhoria"
    ),

    comentario=
    dados.get(
        "comentario"
    ),

    feedback_colaborador=
    dados.get(
        "feedback_colaborador"
    ),

    tipo=
    dados.get(
        "tipo"
    ),

    data=
    data_avaliacao

)

    db.session.add(
        nova_avaliacao
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Avaliação criada com sucesso!"

    }), 201


# ==============================
# BUSCAR AVALIAÇÃO
# ==============================

@avaliacao.route(
    "/api/avaliacoes/<int:id>",
    methods=["GET"]
)
@api_login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    item = Avaliacao.query.get_or_404(
        id
    )

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    if usuario.perfil != "Gestor":

        if (
            not usuario.colaborador_id
            or
            item.colaborador_id
            !=
            usuario.colaborador_id
        ):

            return jsonify({

                "mensagem":
                "Você não tem permissão para visualizar esta avaliação."

            }), 403

    colaborador = Colaborador.query.get(
        item.colaborador_id
    )

    return jsonify({

        "id":
        item.id,

        "colaborador_id":
        item.colaborador_id,

        "colaborador":
        colaborador.nome
        if colaborador
        else "Não encontrado",

        "periodo":
        item.periodo
        or "",

        "pontos_positivos":
        item.pontos_positivos
        or "",

        "pontos_melhoria":
        item.pontos_melhoria
        or "",

        "comentario":
        item.comentario
        or "",

        "feedback_colaborador":
        item.feedback_colaborador
        or "",

        "tipo":
        item.tipo
        or "",

        "data":
        str(item.data)
        if item.data
        else ""

    }), 200


# ==============================
# ATUALIZAR AVALIAÇÃO
# ==============================

@avaliacao.route(
    "/api/avaliacoes/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    item = Avaliacao.query.get_or_404(
        id
    )

    dados = request.json or {}

    # ==========================================
    # COLABORADOR
    # ==========================================

    if "colaborador_id" in dados:

        colaborador_id = dados.get(
            "colaborador_id"
        )

        if not colaborador_id:

            return jsonify({

                "mensagem":
                "Informe o colaborador."

            }), 400

        colaborador = Colaborador.query.get(
            colaborador_id
        )

        if not colaborador:

            return jsonify({

                "mensagem":
                "Colaborador não encontrado."

            }), 404

        item.colaborador_id = colaborador_id

    # ==========================================
    # COMENTÁRIO
    # ==========================================

    if "comentario" in dados:

        item.comentario = dados.get(
            "comentario"
        )

    

        # ==========================================
    # PERÍODO DA AVALIAÇÃO
    # ==========================================

    if "periodo" in dados:

        item.periodo = dados.get(
            "periodo"
        )


    # ==========================================
    # PONTOS POSITIVOS
    # ==========================================

    if "pontos_positivos" in dados:

        item.pontos_positivos = dados.get(
            "pontos_positivos"
        )


    # ==========================================
    # PONTOS DE MELHORIA
    # ==========================================

    if "pontos_melhoria" in dados:

        item.pontos_melhoria = dados.get(
            "pontos_melhoria"
        )

        # ==========================================
    # FEEDBACK DO COLABORADOR
    # ==========================================

    if "feedback_colaborador" in dados:

        item.feedback_colaborador = dados.get(
            "feedback_colaborador"
        )

    # ==========================================
    # TIPO
    # ==========================================

    if "tipo" in dados:

        item.tipo = dados.get(
            "tipo"
        )

    # ==========================================
    # DATA
    # ==========================================

    if "data" in dados:

        data_recebida = dados.get(
            "data"
        )

        if data_recebida:

            try:

                item.data = datetime.strptime(
                    data_recebida,
                    "%Y-%m-%d"
                ).date()

            except (ValueError, TypeError):

                return jsonify({

                    "mensagem":
                    "Data da avaliação inválida."

                }), 400

        else:

            item.data = None

    db.session.commit()

    return jsonify({

        "mensagem":
        "Avaliação atualizada com sucesso!"

    }), 200


# ==============================
# EXCLUIR AVALIAÇÃO
# ==============================

@avaliacao.route(
    "/api/avaliacoes/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    item = Avaliacao.query.get_or_404(
        id
    )

    db.session.delete(
        item
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Avaliação excluída com sucesso!"

    }), 200