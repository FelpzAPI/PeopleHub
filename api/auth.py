from functools import wraps

from flask import (
    session,
    redirect,
    url_for,
    jsonify
)

from api.models import Usuario


# =========================================================
# USUÁRIO LOGADO
# =========================================================

def usuario_logado():

    if "usuario_id" not in session:
        return None

    return Usuario.query.get(
        session["usuario_id"]
    )


# =========================================================
# LOGIN OBRIGATÓRIO
# =========================================================

def login_obrigatorio(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        usuario = usuario_logado()

        if not usuario:

            session.clear()

            return redirect(
                url_for(
                    "login.pagina_login"
                )
            )

        return func(
            *args,
            **kwargs
        )

    return wrapper


# =========================================================
# SOMENTE GESTOR
# =========================================================

def gestor_obrigatorio(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        usuario = usuario_logado()

        if not usuario:

            session.clear()

            return redirect(
                url_for(
                    "login.pagina_login"
                )
            )

        if usuario.perfil != "Gestor":

            return (
                "Acesso permitido somente para gestores.",
                403
            )

        return func(
            *args,
            **kwargs
        )

    return wrapper


# =========================================================
# API LOGIN
# =========================================================

def api_login_obrigatorio(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        usuario = usuario_logado()

        if not usuario:

            return jsonify({

                "mensagem":
                "Usuário não autenticado."

            }), 401

        return func(
            *args,
            **kwargs
        )

    return wrapper


# =========================================================
# API GESTOR
# =========================================================

def api_gestor_obrigatorio(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        usuario = usuario_logado()

        if not usuario:

            return jsonify({

                "mensagem":
                "Usuário não autenticado."

            }), 401

        if usuario.perfil != "Gestor":

            return jsonify({

                "mensagem":
                "Acesso permitido somente para gestores."

            }), 403

        return func(
            *args,
            **kwargs
        )

    return wrapper