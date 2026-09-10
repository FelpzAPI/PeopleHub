from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    session
)

from datetime import date

from api.database import db

from api.models import (
    Feedback,
    Colaborador,
    Usuario
)

from api.auth import (
    login_obrigatorio,
    api_gestor_obrigatorio
)


feedback = Blueprint(
    "feedback",
    __name__
)


# ======================================
# PÁGINA
# ======================================

@feedback.route("/feedback")
@login_obrigatorio
def pagina_feedback():

    return render_template(
        "feedback.html"
    )


# ======================================
# LISTAR FEEDBACKS
# ======================================

@feedback.route(
    "/api/feedback",
    methods=["GET"]
)
@login_obrigatorio
def listar_feedbacks():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    if usuario.perfil == "Gestor":

        feedbacks = Feedback.query.all()


    else:

        if not usuario.colaborador_id:

            return jsonify([]), 200


        feedbacks = Feedback.query.filter_by(
            destinatario_id=usuario.colaborador_id
        ).all()



    lista = []


    for item in feedbacks:


        colaborador_item = Colaborador.query.get(
            item.destinatario_id
        )


        remetente_item = Usuario.query.get(
            item.remetente_id
        )


        lista.append({

            "id":
            item.id,


            "colaborador":
            colaborador_item.nome
            if colaborador_item
            else "Não encontrado",


            "responsavel":
            remetente_item.nome
            if remetente_item
            else "Não encontrado",


            "tipo":
            item.tipo,


            "mensagem":
            item.mensagem,


            "status":
            item.status,


            "data":
            item.data.strftime("%d/%m/%Y")
            if item.data
            else ""

        })


    return jsonify(lista), 200


# ======================================
# LISTAR COLABORADORES
# SOMENTE GESTOR
# ======================================

@feedback.route(
    "/api/feedback/colaboradores",
    methods=["GET"]
)
@api_gestor_obrigatorio
def listar_colaboradores():

    lista = Colaborador.query.filter_by(
        status="Ativo"
    ).all()


    return jsonify([

        {

            "id":
            c.id,

            "nome":
            c.nome

        }

        for c in lista

    ]), 200


# ======================================
# CRIAR FEEDBACK
# SOMENTE GESTOR
# ======================================

@feedback.route(
    "/api/feedback",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar_feedback():

    dados = request.json or {}


    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    tipo_envio = dados.get(
        "tipo_envio",
        "individual"
    )


    destinatario_id = dados.get(
        "destinatario_id"
    )


    tipo = dados.get(
        "tipo"
    )


    mensagem = dados.get(
        "mensagem"
    )


    status = dados.get(
        "status",
        "Enviado"
    )


    # ==================================
    # VALIDAÇÃO MENSAGEM
    # ==================================

    if not mensagem:

        return jsonify({

            "mensagem":
            "A mensagem do feedback é obrigatória."

        }), 400



    # ==================================
    # FEEDBACK EM MASSA
    # ==================================

    if tipo_envio == "massa":


        destinatarios_ids = dados.get(
            "destinatarios_ids",
            []
        )


        if not destinatarios_ids:

            return jsonify({

                "mensagem":
                "Selecione pelo menos um colaborador."

            }), 400



        colaboradores = Colaborador.query.filter(
            Colaborador.id.in_(destinatarios_ids)
        ).all()



        if not colaboradores:

            return jsonify({

                "mensagem":
                "Nenhum colaborador encontrado."

            }), 404



        for colaborador in colaboradores:


            novo = Feedback(

                remetente_id=
                usuario.id,

                destinatario_id=
                colaborador.id,

                tipo=
                tipo,

                mensagem=
                mensagem,

                status=
                status,

                data=
                date.today()

            )


            db.session.add(
                novo
            )


        db.session.commit()


        return jsonify({

            "mensagem":
            "Feedback enviado para todos os colaboradores."

        }), 201



    # ==================================
    # FEEDBACK INDIVIDUAL
    # ==================================

    if not destinatario_id:

        return jsonify({

            "mensagem":
            "Selecione um colaborador."

        }), 400



    colaborador = Colaborador.query.get(
        destinatario_id
    )


    if not colaborador:

        return jsonify({

            "mensagem":
            "Colaborador não encontrado."

        }), 404



    novo = Feedback(

        remetente_id=
        usuario.id,

        destinatario_id=
        colaborador.id,

        tipo=
        tipo,

        mensagem=
        mensagem,

        status=
        status,

        data=
        date.today()

    )


    db.session.add(
        novo
    )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Feedback salvo com sucesso."

    }), 201


# ======================================
# BUSCAR FEEDBACK
# ======================================

@feedback.route(
    "/api/feedback/<int:id>",
    methods=["GET"]
)
@login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )


    item = Feedback.query.get_or_404(
        id
    )


    # ==================================
    # FUNCIONÁRIO
    # ==================================

    if usuario.perfil != "Gestor":

        # Usuário sem colaborador
        # não pode acessar feedback.

        if not usuario.colaborador_id:

            return jsonify({

                "mensagem":
                "Acesso negado."

            }), 403


        # Impede acessar feedback
        # de outro colaborador.

        if item.destinatario_id != usuario.colaborador_id:

            return jsonify({

                "mensagem":
                "Você não tem permissão para visualizar este feedback."

            }), 403


        # ==================================
    # RETORNO
    # ==================================

    colaborador = Colaborador.query.get(
        item.destinatario_id
    )

    remetente = Usuario.query.get(
        item.remetente_id
    )


    return jsonify({

        "id":
        item.id,

        "destinatario_id":
        item.destinatario_id,

            "colaborador":
    colaborador.nome
    if colaborador
    else "-",


    "responsavel":
    remetente.nome
    if remetente
    else "-",

        "tipo":
        item.tipo,

        "mensagem":
        item.mensagem,

        "status":
        item.status,

        "data":
        item.data.strftime("%d/%m/%Y")
        if item.data
        else ""

    }), 200


# ======================================
# EDITAR
# SOMENTE GESTOR
# ======================================

@feedback.route(
    "/api/feedback/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def editar(id):

    item = Feedback.query.get_or_404(
        id
    )


    dados = request.json or {}


    novo_destinatario = dados.get(
        "destinatario_id",
        item.destinatario_id
    )


    # ==================================
    # VERIFICAR COLABORADOR
    # ==================================

    colaborador = Colaborador.query.get(
        novo_destinatario
    )


    if not colaborador:

        return jsonify({

            "mensagem":
            "Colaborador não encontrado."

        }), 404


    # ==================================
    # ATUALIZAR
    # ==================================

    item.destinatario_id = (
        novo_destinatario
    )


    item.tipo = dados.get(

        "tipo",

        item.tipo

    )


    item.mensagem = dados.get(

        "mensagem",

        item.mensagem

    )


    item.status = dados.get(

        "status",

        item.status

    )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Feedback atualizado com sucesso."

    }), 200


# ======================================
# EXCLUIR
# SOMENTE GESTOR
# ======================================

@feedback.route(
    "/api/feedback/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    item = Feedback.query.get_or_404(
        id
    )


    db.session.delete(
        item
    )

    db.session.commit()


    return jsonify({

        "mensagem":
        "Feedback excluído com sucesso."

    }), 200