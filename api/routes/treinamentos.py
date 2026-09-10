from flask import Blueprint, request, jsonify, render_template, session

from api.database import db
from api.models import Treinamento, TreinamentoConcluido, Usuario

from api.auth import (
    login_obrigatorio,
    api_login_obrigatorio,
    api_gestor_obrigatorio
)



treinamentos = Blueprint(
    "treinamentos",
    __name__
)





# ==============================
# PÁGINA HTML
# ==============================

@treinamentos.route("/treinamentos")
@login_obrigatorio
def pagina_treinamentos():


    lista = Treinamento.query.all()


    return render_template(

        "treinamentos.html",

        treinamentos=lista

    )









# ==============================
# LISTAR TREINAMENTOS
# ==============================

@treinamentos.route(
    "/api/treinamentos",
    methods=["GET"]
)
@api_login_obrigatorio
def listar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    lista = Treinamento.query.all()

    resultado = []

    for treinamento in lista:

        concluido = False

        if (
            usuario.perfil != "Gestor"
            and usuario.colaborador_id
        ):

            registro = TreinamentoConcluido.query.filter_by(
                colaborador_id=usuario.colaborador_id,
                treinamento_id=treinamento.id
            ).first()

            concluido = registro is not None

        resultado.append({

            "id":
            treinamento.id,

            "titulo":
            treinamento.titulo,

            "descricao":
            treinamento.descricao,

            "carga_horaria":
            treinamento.carga_horaria,

            "link":
            treinamento.link,

            "tipo":
            treinamento.tipo,

            "plataforma":
            treinamento.plataforma,

            "conteudo":
            treinamento.conteudo,
            "concluido":
            concluido

        })

    return jsonify(resultado), 200



# ==============================
# CRIAR TREINAMENTO
# ==============================

@treinamentos.route(
    "/api/treinamentos",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():


    dados = request.json or {}



    novo_treinamento = Treinamento(

    titulo=dados.get("titulo"),

    descricao=dados.get("descricao"),

    carga_horaria=dados.get("carga_horaria"),

    link=dados.get("link"),

    tipo=dados.get(
        "tipo",
        "externo"
    ),

    plataforma=dados.get(
        "plataforma"
    ),

    conteudo=dados.get(
        "conteudo"
    )

)



    db.session.add(
        novo_treinamento
    )


    db.session.commit()



    return jsonify({


        "mensagem":

        "Treinamento criado com sucesso"


    }),201







# ==============================
# BUSCAR TREINAMENTO
# ==============================

@treinamentos.route(
    "/api/treinamentos/<int:id>",
    methods=["GET"]
)
@api_login_obrigatorio
def buscar(id):


    treinamento = Treinamento.query.get_or_404(
        id
    )



    return jsonify({


        "id":

        treinamento.id,



        "titulo":

        treinamento.titulo,



        "descricao":

        treinamento.descricao,



        "carga_horaria":

        treinamento.carga_horaria,

            "link":
            treinamento.link,

            "tipo":
            treinamento.tipo,

            "plataforma":
            treinamento.plataforma,

            "conteudo":
            treinamento.conteudo

    }),200







# ==============================
# ATUALIZAR TREINAMENTO
# ==============================

@treinamentos.route(
    "/api/treinamentos/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):


    treinamento = Treinamento.query.get_or_404(
        id
    )



    dados = request.json or {}




    treinamento.titulo = dados.get(

        "titulo",

        treinamento.titulo

    )




    treinamento.descricao = dados.get(

        "descricao",

        treinamento.descricao

    )




    treinamento.carga_horaria = dados.get(

        "carga_horaria",

        treinamento.carga_horaria

    )




    treinamento.link = dados.get(

        "link",

        treinamento.link

    )

    treinamento.tipo = dados.get(
    "tipo",
    treinamento.tipo
    )

    treinamento.plataforma = dados.get(
        "plataforma",
        treinamento.plataforma
    )

    treinamento.conteudo = dados.get(
        "conteudo",
        treinamento.conteudo
    )




    db.session.commit()



    return jsonify({


        "mensagem":

        "Treinamento atualizado com sucesso"


    }),200







# ==============================
# EXCLUIR TREINAMENTO
# ==============================

@treinamentos.route(
    "/api/treinamentos/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):


    treinamento = Treinamento.query.get_or_404(
        id
    )



    db.session.delete(
        treinamento
    )


    db.session.commit()



    return jsonify({


        "mensagem":

        "Treinamento excluído com sucesso"


    }),200

# ==============================
# MARCAR COMO CONCLUÍDO
# ==============================

@treinamentos.route(
    "/api/treinamentos/<int:id>/concluir",
    methods=["PUT"]
)
@api_login_obrigatorio
def concluir(id):

    usuario = Usuario.query.get(session["usuario_id"])

    if usuario.perfil == "Gestor":

        return jsonify({

            "mensagem":
            "Gestores não podem concluir treinamentos."

        }), 403

    treinamento = Treinamento.query.get_or_404(id)

    registro = TreinamentoConcluido.query.filter_by(

        colaborador_id=usuario.colaborador_id,

        treinamento_id=treinamento.id

    ).first()

    if not registro:

        registro = TreinamentoConcluido(

            colaborador_id=usuario.colaborador_id,

            treinamento_id=treinamento.id

        )

        db.session.add(registro)

        db.session.commit()

    return jsonify({

        "mensagem":
        "Treinamento concluído."

    }), 200