from flask import Blueprint, render_template, request, jsonify

from api.database import db
from api.models import Usuario, Colaborador
from api.utils.seguranca import senha_forte
from api.auth import login_obrigatorio, api_gestor_obrigatorio

from werkzeug.security import generate_password_hash


cadastro = Blueprint(
    "cadastro",
    __name__
)


# ==========================
# PÁGINA CADASTRO
# ==========================

@cadastro.route("/cadastro")
@login_obrigatorio
def pagina():

    return render_template(
        "cadastro.html"
    )


# ==========================
# API CADASTRO
# ==========================

@cadastro.route(
    "/api/cadastro",
    methods=["POST"]
)
@api_gestor_obrigatorio
def criar():

    dados = request.json or {}

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    perfil = dados.get("perfil", "Funcionário")
    cargo = dados.get("cargo")
    setor = dados.get("setor")

    if not nome or not email or not senha:

        return jsonify({

            "mensagem":
            "Preencha todos os campos obrigatórios"

        }), 400



    senha_valida, mensagem = senha_forte(senha)


    if not senha_valida:

        return jsonify({

            "mensagem": mensagem

        }), 400


    usuario_existente = Usuario.query.filter_by(
        email=email
    ).first()

    if usuario_existente:

        return jsonify({

            "mensagem":
            "Email já cadastrado"

        }), 400

    try:

        # ==========================
        # CRIAR COLABORADOR
        # ==========================

        colaborador = Colaborador(

            nome=nome,

            email=email,

            cargo=cargo,

            setor=setor,

            status="Ativo"

        )

        db.session.add(colaborador)

        db.session.flush()


        # ==========================
        # CRIAR USUÁRIO
        # ==========================

        usuario = Usuario(

            nome=nome,

            email=email,

            senha=generate_password_hash(senha),

            perfil=perfil,

            cargo=cargo,

            setor=setor,

            colaborador_id=colaborador.id

        )

        db.session.add(usuario)

        db.session.commit()

        return jsonify({

            "mensagem":
            f"{perfil} cadastrado com sucesso"

        }), 201

    except Exception as erro:

        db.session.rollback()

        print("ERRO CADASTRO:", erro)

        return jsonify({

            "mensagem":
            "Erro ao cadastrar usuário"

        }), 500