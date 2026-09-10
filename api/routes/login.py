from flask import (
    Blueprint,
    request,
    jsonify,
    render_template,
    session,
    redirect,
    url_for
)

from werkzeug.security import check_password_hash

from api.models import Usuario


login = Blueprint(
    "login",
    __name__
)


# =========================================================
# PÁGINA DE LOGIN
# =========================================================

@login.route(
    "/login"
)
def pagina_login():

    return render_template(
        "login.html"
    )


# =========================================================
# REALIZAR LOGIN
# =========================================================

@login.route(
    "/api/login",
    methods=["POST"]
)
def realizar_login():

    dados = request.json or {}

    email = dados.get(
        "email"
    )

    senha = dados.get(
        "senha"
    )


    if not email or not senha:

        return jsonify({

            "mensagem":
            "Informe e-mail e senha."

        }), 400


    usuario = Usuario.query.filter_by(
        email=email
    ).first()


    if not usuario:

        return jsonify({

            "mensagem":
            "E-mail ou senha incorretos."

        }), 401


    if not check_password_hash(
        usuario.senha,
        senha
    ):

        return jsonify({

            "mensagem":
            "E-mail ou senha incorretos."

        }), 401


    # =====================================================
    # CRIAR SESSÃO
    # =====================================================

    session.clear()

    session["usuario_id"] = usuario.id

    session["perfil"] = usuario.perfil

    session["nome"] = usuario.nome


    return jsonify({

        "mensagem":
        "Login realizado com sucesso.",

        "perfil":
        usuario.perfil,

        "redirect":
        url_for(
            "dashboard.dashboard_page"
        )

    }), 200


# =========================================================
# LOGOUT
# =========================================================

@login.route(
    "/logout"
)
def logout():

    session.clear()

    return redirect(
        url_for(
            "login.pagina_login"
        )
    )