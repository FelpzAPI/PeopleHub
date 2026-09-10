from flask import Flask, session, redirect, url_for

from api.config import Config
from api.database import db
from api.models import Usuario


def criar_app():

    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )


    # ==========================
    # CONFIGURAÇÕES
    # ==========================

    app.config.from_object(Config)

    # Necessário para usar session/login
    app.secret_key = "peoplehub-chave-secreta"


    # ==========================
    # INICIALIZAR BANCO
    # ==========================

    db.init_app(app)


    # ==========================
    # ROTA INICIAL
    # ==========================

    @app.route("/")
    def inicio():

        return redirect(
            url_for("login.pagina_login")
        )


    # ==========================
    # USUÁRIO GLOBAL NOS HTMLS
    # ==========================

    @app.context_processor
    def usuario_global():

        usuario = None

        if "usuario_id" in session:

            usuario = Usuario.query.get(
                session["usuario_id"]
            )

        return {
            "usuario_logado": usuario
        }


    # ==========================
    # IMPORTAR ROTAS
    # ==========================

    from api.routes.dashboard import dashboard
    from api.routes.colaboradores import colaboradores
    from api.routes.metas import metas
    from api.routes.avaliacao import avaliacao
    from api.routes.treinamentos import treinamentos
    from api.routes.feedback import feedback
    from api.routes.carreira import carreira
    from api.routes.ferias import ferias
    from api.routes.ponto import ponto
    from api.routes.login import login
    from api.routes.cadastro import cadastro
    from api.routes.usuarios import usuarios
    from api.routes.configuracoes import configuracoes


    # ==========================
    # REGISTRAR BLUEPRINTS
    # ==========================

    app.register_blueprint(dashboard)
    app.register_blueprint(colaboradores)
    app.register_blueprint(metas)
    app.register_blueprint(avaliacao)
    app.register_blueprint(treinamentos)
    app.register_blueprint(feedback)
    app.register_blueprint(carreira)
    app.register_blueprint(cadastro)
    app.register_blueprint(ferias)
    app.register_blueprint(ponto)
    app.register_blueprint(login)
    app.register_blueprint(usuarios)
    app.register_blueprint(configuracoes)


    # ==========================
    # CRIAR TABELAS DO BANCO
    # ==========================

    with app.app_context():

        db.create_all()


    return app


# ==========================
# CRIAR APLICAÇÃO
# ==========================

app = criar_app()


# ==========================
# EXECUTAR
# ==========================

if __name__ == "__main__":

    app.run(
        debug=True
    )