from flask import Blueprint, request, jsonify, render_template

from api.database import db
from api.models import Usuario, Colaborador

from api.auth import (
    gestor_obrigatorio,
    api_gestor_obrigatorio,
    usuario_logado
)


usuarios = Blueprint(
    "usuarios",
    __name__
)


# ==============================
# PÁGINA GERENCIAMENTO USUÁRIOS
# ==============================

@usuarios.route(
    "/gerenciamento-usuarios"
)
@gestor_obrigatorio
def gerenciamento():

    return render_template(
        "gerenciamento_usuarios.html"
    )


# ==============================
# LISTAR USUÁRIOS
# ==============================

@usuarios.route(
    "/api/usuarios",
    methods=["GET"]
)
@api_gestor_obrigatorio
def listar():

    lista = Usuario.query.all()

    resultado = []

    for usuario in lista:

        resultado.append({

            "id":
            usuario.id,

            "nome":
            usuario.nome,

            "email":
            usuario.email,

            "perfil":
            usuario.perfil,

            "cargo":
            usuario.cargo,

            "setor":
            usuario.setor,

            "colaborador_id":
            usuario.colaborador_id

        })

    return jsonify(resultado), 200


# ==============================
# BUSCAR USUÁRIO
# ==============================

@usuarios.route(
    "/api/usuarios/<int:id>",
    methods=["GET"]
)
@api_gestor_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(id)

    if not usuario:

        return jsonify({

            "mensagem":
            "Usuário não encontrado"

        }), 404

    return jsonify({

        "id":
        usuario.id,

        "nome":
        usuario.nome,

        "email":
        usuario.email,

        "perfil":
        usuario.perfil,

        "cargo":
        usuario.cargo,

        "setor":
        usuario.setor,

        "colaborador_id":
        usuario.colaborador_id

    }), 200


# ==============================
# EDITAR USUÁRIO
# ==============================

@usuarios.route(
    "/api/usuarios/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def editar(id):

    usuario = Usuario.query.get(id)

    if not usuario:

        return jsonify({

            "mensagem":
            "Usuário não encontrado"

        }), 404


    dados = request.json or {}


    # ==============================
    # DADOS BÁSICOS
    # ==============================

    usuario.nome = dados.get(
        "nome",
        usuario.nome
    )


    novo_email = dados.get(
        "email",
        usuario.email
    )


    # Verificar se o novo email
    # já pertence a outro usuário

    email_existente = Usuario.query.filter(
        Usuario.email == novo_email,
        Usuario.id != usuario.id
    ).first()


    if email_existente:

        return jsonify({

            "mensagem":
            "Este email já está sendo utilizado"

        }), 400


    usuario.email = novo_email


    usuario.cargo = dados.get(
        "cargo",
        usuario.cargo
    )


    usuario.setor = dados.get(
        "setor",
        usuario.setor
    )


    # ==============================
    # PERFIL
    # ==============================

    novo_perfil = dados.get(
        "perfil",
        usuario.perfil
    )


    if novo_perfil not in [
        "Gestor",
        "Funcionário"
    ]:

        return jsonify({

            "mensagem":
            "Perfil inválido"

        }), 400


    usuario.perfil = novo_perfil


    # ==============================
    # ATUALIZAR COLABORADOR
    # ==============================

    colaborador = None


    if usuario.colaborador_id:

        colaborador = Colaborador.query.get(
            usuario.colaborador_id
        )


    if colaborador:

        colaborador.nome = usuario.nome
        colaborador.email = usuario.email
        colaborador.cargo = usuario.cargo
        colaborador.setor = usuario.setor


    db.session.commit()


    return jsonify({

        "mensagem":
        "Usuário atualizado com sucesso"

    }), 200


# ==============================
# EXCLUIR USUÁRIO
# ==============================

@usuarios.route(
    "/api/usuarios/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    gestor = usuario_logado()


    usuario = Usuario.query.get(id)


    if not usuario:

        return jsonify({

            "mensagem":
            "Usuário não encontrado"

        }), 404


    # ==============================
    # IMPEDIR EXCLUSÃO DO PRÓPRIO
    # GESTOR LOGADO
    # ==============================

    if usuario.id == gestor.id:

        return jsonify({

            "mensagem":
            "Você não pode excluir seu próprio usuário"

        }), 400


    # ==============================
    # EXCLUIR USUÁRIO
    # ==============================

    db.session.delete(
        usuario
    )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Usuário removido com sucesso"

    }), 200