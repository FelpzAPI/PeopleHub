from flask import (
    Blueprint,
    request,
    jsonify,
    render_template
)

import re

from werkzeug.security import generate_password_hash

from api.database import db

from api.models import (
    Colaborador,
    Usuario
)

from api.auth import (
    login_obrigatorio,
    api_login_obrigatorio,
    api_gestor_obrigatorio
)


colaboradores = Blueprint(
    "colaboradores",
    __name__
)

def validar_senha(senha):

    if len(senha) < 8:
        return "A senha deve ter no mínimo 8 caracteres."


    if not re.search(r"[A-Z]", senha):
        return "A senha deve possuir pelo menos uma letra maiúscula."


    if not re.search(r"[a-z]", senha):
        return "A senha deve possuir pelo menos uma letra minúscula."


    if not re.search(r"[0-9]", senha):
        return "A senha deve possuir pelo menos um número."


    if not re.search(r"[@$!%*?&]", senha):
        return "A senha deve possuir pelo menos um caractere especial (@$!%*?&)."


    return None


# =========================================================
# PÁGINA DE COLABORADORES
# =========================================================

@colaboradores.route(
    "/colaboradores"
)
@login_obrigatorio
def pagina_colaboradores():

    lista = Colaborador.query.all()

    return render_template(
        "colaboradores.html",
        colaboradores=lista
    )


# =========================================================
# PÁGINA NOVO COLABORADOR
# =========================================================

@colaboradores.route(
    "/colaboradores/novo"
)
@login_obrigatorio
def novo_colaborador():

    return render_template(
        "novo_colaborador.html"
    )


# =========================================================
# LISTAR COLABORADORES
# =========================================================

@colaboradores.route(
    "/api/colaboradores",
    methods=["GET"]
)
@api_login_obrigatorio
def listar():

    lista = Colaborador.query.all()

    resultado = []

    for colaborador in lista:

        usuario = Usuario.query.filter_by(
            colaborador_id=colaborador.id
        ).first()

        resultado.append({

            "id": colaborador.id,

            "nome": colaborador.nome,

            "cargo": colaborador.cargo,

            "setor": colaborador.setor,

            "email": colaborador.email,

            "status": colaborador.status,

            "tem_acesso": usuario is not None

        })

    return jsonify(
        resultado
    ), 200


# =========================================================
# BUSCAR COLABORADOR
# =========================================================

@colaboradores.route(
    "/api/colaboradores/<int:id>",
    methods=["GET"]
)
@api_login_obrigatorio
def buscar(id):

    colaborador = Colaborador.query.get_or_404(
        id
    )

    usuario = Usuario.query.filter_by(
        colaborador_id=colaborador.id
    ).first()

    return jsonify({

        "id": colaborador.id,

        "nome": colaborador.nome,

        "cargo": colaborador.cargo,

        "setor": colaborador.setor,

        "email": colaborador.email,

        "status": colaborador.status,

        "tem_acesso": usuario is not None

    }), 200


# =========================================================
# CRIAR COLABORADOR
# =========================================================

@colaboradores.route(
    "/api/colaboradores",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():

    dados = request.json or {}


    nome = dados.get(
        "nome"
    )

    cargo = dados.get(
        "cargo"
    )

    setor = dados.get(
        "setor"
    )

    email = dados.get(
        "email"
    )

    status = dados.get(
        "status",
        "Ativo"
    )

    criar_acesso = dados.get(
        "criar_acesso",
        False
    )

    senha = dados.get(
        "senha"
    )


    # =====================================================
    # VALIDAR NOME
    # =====================================================

    if not nome:

        return jsonify({

            "mensagem":
            "O nome do colaborador é obrigatório."

        }), 400


    # =====================================================
    # VALIDAR E-MAIL
    # =====================================================

    if email:

        email = email.strip().lower()


        colaborador_existente = (
            Colaborador.query
            .filter_by(email=email)
            .first()
        )


        if colaborador_existente:

            return jsonify({

                "mensagem":
                "Já existe um colaborador com este e-mail."

            }), 409


        usuario_existente = (
            Usuario.query
            .filter_by(email=email)
            .first()
        )


        if usuario_existente:

            return jsonify({

                "mensagem":
                "Já existe uma conta com este e-mail."

            }), 409


    # =====================================================
    # SE FOR CRIAR ACESSO, VALIDAR SENHA
    # =====================================================

    if criar_acesso:

        if not email:

            return jsonify({
            "mensagem":
            "O e-mail é obrigatório para criar o acesso."
        }), 400


    if not senha:

        return jsonify({
            "mensagem":
            "A senha é obrigatória para criar o acesso."
        }), 400


    erro_senha = validar_senha(senha)

    if erro_senha:

        return jsonify({
            "mensagem":
            erro_senha
        }), 400


    # =====================================================
    # CRIAR COLABORADOR
    # =====================================================

    novo_colaborador = Colaborador(

        nome=nome,

        cargo=cargo,

        setor=setor,

        email=email,

        status=status

    )


    db.session.add(
        novo_colaborador
    )


    db.session.flush()


    # =====================================================
    # CRIAR CONTA DE ACESSO
    # =====================================================

    if criar_acesso:

        novo_usuario = Usuario(

            nome=nome,

            email=email,

            senha=generate_password_hash(
                senha
            ),

            perfil="Funcionário",

            cargo=cargo,

            setor=setor,

            colaborador_id=novo_colaborador.id

        )


        db.session.add(
            novo_usuario
        )


    # =====================================================
    # SALVAR
    # =====================================================

    db.session.commit()


    return jsonify({

        "mensagem":
        "Colaborador cadastrado com sucesso.",

        "colaborador_id":
        novo_colaborador.id,

        "acesso_criado":
        criar_acesso

    }), 201


# =========================================================
# ATUALIZAR COLABORADOR
# =========================================================

@colaboradores.route(
    "/api/colaboradores/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    colaborador = Colaborador.query.get_or_404(
        id
    )

    dados = request.json or {}


    novo_email = dados.get(
        "email",
        colaborador.email
    )


    if novo_email:

        novo_email = novo_email.strip().lower()


    # =====================================================
    # VERIFICAR E-MAIL
    # =====================================================

    if novo_email != colaborador.email:

        email_existente = (
            Colaborador.query
            .filter(
                Colaborador.email == novo_email,
                Colaborador.id != colaborador.id
            )
            .first()
        )


        if email_existente:

            return jsonify({

                "mensagem":
                "Já existe outro colaborador com este e-mail."

            }), 409


        usuario_existente = (
            Usuario.query
            .filter(
                Usuario.email == novo_email,
                Usuario.colaborador_id != colaborador.id
            )
            .first()
        )


        if usuario_existente:

            return jsonify({

                "mensagem":
                "Este e-mail já está sendo utilizado por uma conta."

            }), 409


    # =====================================================
    # ATUALIZAR COLABORADOR
    # =====================================================

    colaborador.nome = dados.get(
        "nome",
        colaborador.nome
    )

    colaborador.cargo = dados.get(
        "cargo",
        colaborador.cargo
    )

    colaborador.setor = dados.get(
        "setor",
        colaborador.setor
    )

    colaborador.email = novo_email

    colaborador.status = dados.get(
        "status",
        colaborador.status
    )


    # =====================================================
    # ATUALIZAR CONTA VINCULADA
    # =====================================================

    usuario = Usuario.query.filter_by(
        colaborador_id=colaborador.id
    ).first()


    if usuario:

        usuario.nome = colaborador.nome

        usuario.email = colaborador.email

        usuario.cargo = colaborador.cargo

        usuario.setor = colaborador.setor


    db.session.commit()


    return jsonify({

        "mensagem":
        "Colaborador atualizado com sucesso."

    }), 200


# =========================================================
# EXCLUIR COLABORADOR
# =========================================================

@colaboradores.route(
    "/api/colaboradores/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    colaborador = Colaborador.query.get_or_404(
        id
    )


    usuario = Usuario.query.filter_by(
        colaborador_id=colaborador.id
    ).first()


    if usuario:

        db.session.delete(
            usuario
        )


    db.session.delete(
        colaborador
    )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Colaborador excluído com sucesso."

    }), 200


# =========================================================
# CRIAR ACESSO PARA COLABORADOR EXISTENTE
# =========================================================

@colaboradores.route(
    "/api/colaboradores/<int:id>/criar-acesso",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar_acesso(id):

    colaborador = Colaborador.query.get_or_404(
        id
    )

    dados = request.json or {}


    senha = dados.get(
        "senha"
    )


    # =====================================================
    # VERIFICAR SE JÁ POSSUI ACESSO
    # =====================================================

    usuario_existente = Usuario.query.filter_by(
        colaborador_id=colaborador.id
    ).first()


    if usuario_existente:

        return jsonify({

            "mensagem":
            "Este colaborador já possui uma conta."

        }), 409


    # =====================================================
    # VERIFICAR E-MAIL
    # =====================================================

    if not colaborador.email:

        return jsonify({

            "mensagem":
            "O colaborador precisa ter um e-mail."

        }), 400


    # =====================================================
    # VERIFICAR SENHA
    # =====================================================

    if not senha:

        return jsonify({

            "mensagem":
            "Informe uma senha."

        }), 400


    erro_senha = validar_senha(senha)

    if erro_senha:

        return jsonify({

            "mensagem":
            erro_senha

        }), 400


    # =====================================================
    # VERIFICAR E-MAIL NA TABELA USUÁRIOS
    # =====================================================

    email_existente = Usuario.query.filter_by(
        email=colaborador.email
    ).first()


    if email_existente:

        return jsonify({

            "mensagem":
            "Este e-mail já possui uma conta."

        }), 409


    # =====================================================
    # CRIAR USUÁRIO
    # =====================================================

    novo_usuario = Usuario(

        nome=colaborador.nome,

        email=colaborador.email,

        senha=generate_password_hash(
            senha
        ),

        perfil="Funcionário",

        cargo=colaborador.cargo,

        setor=colaborador.setor,

        colaborador_id=colaborador.id

    )


    db.session.add(
        novo_usuario
    )


    db.session.commit()


    return jsonify({

        "mensagem":
        "Acesso criado com sucesso."

    }), 201