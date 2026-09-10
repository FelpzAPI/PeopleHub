from flask import (
    Blueprint,
    request,
    jsonify,
    render_template,
    session
)

from api.database import db
from api.models import (
    Ponto,
    Usuario
)

from api.auth import (
    login_obrigatorio,
    api_login_obrigatorio,
    api_gestor_obrigatorio
)

from datetime import datetime


ponto = Blueprint(
    "ponto",
    __name__
)
# ==============================
# PÁGINA HTML
# ==============================

@ponto.route("/ponto")
@login_obrigatorio
def pagina_ponto():

    return render_template(
        "ponto.html"
    )


# ==============================
# CONVERTER DATA
# ==============================

def converter_data(valor):

    if not valor:

        return None

    try:

        return datetime.fromisoformat(
            valor
        )

    except (ValueError, TypeError):

        return None


# ==============================
# LISTAR
# ==============================

@ponto.route(
    "/api/ponto",
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

        # Gestor visualiza todos os registros

        registros = Ponto.query.all()

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    else:

        colaborador_id = usuario.colaborador_id

        # Funcionário visualiza somente
        # os próprios registros

        registros = Ponto.query.filter_by(
            colaborador_id=colaborador_id
        ).all()

    resultado = []

    for registro in registros:

        resultado.append({

            "id":
            registro.id,

            "colaborador_id":
            registro.colaborador_id,

            "colaborador":
            registro.colaborador.nome
            if registro.colaborador
            else "Não informado",

            "setor":
            registro.colaborador.setor
            if registro.colaborador
            else "Não informado",

            "entrada":
            registro.entrada.isoformat()
            if registro.entrada
            else "",

            "saida":
            registro.saida.isoformat()
            if registro.saida
            else "",

            "horas_trabalhadas":
            registro.horas_trabalhadas
            or 0

        })

    return jsonify({

        "perfil":
        usuario.perfil,

        "pontos":
        resultado

    }), 200


# ==============================
# CRIAR
# ==============================

@ponto.route(
    "/api/ponto",
    methods=["POST"]
)
@api_login_obrigatorio
def criar():

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    dados = request.json or {}

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    if usuario.perfil != "Gestor":

        # Funcionário só pode registrar
        # o próprio ponto

        colaborador_id = usuario.colaborador_id

        if not colaborador_id:

            return jsonify({

                "mensagem":
                "Usuário não está vinculado a um colaborador."

            }), 400

    # ==========================================
    # GESTOR
    # ==========================================

    else:

        colaborador_id = dados.get(
            "colaborador_id"
        )

        if not colaborador_id:

            return jsonify({

                "mensagem":
                "Informe o colaborador."

            }), 400

    # ==========================================
    # DATAS
    # ==========================================

    entrada = converter_data(
        dados.get("entrada")
    )

    saida = converter_data(
        dados.get("saida")
    )

    # ==========================================
    # VALIDAR ENTRADA
    # ==========================================

    if dados.get("entrada") and not entrada:

        return jsonify({

            "mensagem":
            "Data ou horário de entrada inválido."

        }), 400

    # ==========================================
    # VALIDAR SAÍDA
    # ==========================================

    if dados.get("saida") and not saida:

        return jsonify({

            "mensagem":
            "Data ou horário de saída inválido."

        }), 400

    # ==========================================
    # VALIDAR HORÁRIOS
    # ==========================================

    if entrada and saida:

        if saida < entrada:

            return jsonify({

                "mensagem":
                "A saída não pode ser anterior à entrada."

            }), 400

    # ==========================================
    # HORAS TRABALHADAS
    # ==========================================

    horas_trabalhadas = dados.get(
        "horas_trabalhadas",
        0
    )

    try:

        horas_trabalhadas = float(
            horas_trabalhadas
        )

    except (ValueError, TypeError):

        horas_trabalhadas = 0

    # ==========================================
    # CRIAR REGISTRO
    # ==========================================

    novo_ponto = Ponto(

        colaborador_id=
        colaborador_id,

        entrada=
        entrada,

        saida=
        saida,

        horas_trabalhadas=
        horas_trabalhadas

    )

    db.session.add(
        novo_ponto
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Registro de ponto criado com sucesso!"

    }), 201


# ==============================
# BUSCAR
# ==============================

@ponto.route(
    "/api/ponto/<int:id>",
    methods=["GET"]
)
@api_login_obrigatorio
def buscar(id):

    usuario = Usuario.query.get(
        session["usuario_id"]
    )

    registro = Ponto.query.get_or_404(
        id
    )

    # ==========================================
    # FUNCIONÁRIO
    # ==========================================

    if usuario.perfil != "Gestor":

        # Funcionário não pode acessar
        # ponto de outro colaborador

        if registro.colaborador_id != usuario.colaborador_id:

            return jsonify({

                "mensagem":
                "Você não tem permissão para visualizar este registro."

            }), 403

    return jsonify({

        "id":
        registro.id,

        "colaborador_id":
        registro.colaborador_id,

        "colaborador":
        registro.colaborador.nome
        if registro.colaborador
        else "Não informado",

        "setor":
        registro.colaborador.setor
        if registro.colaborador
        else "Não informado",

        "entrada":
        registro.entrada.isoformat()
        if registro.entrada
        else "",

        "saida":
        registro.saida.isoformat()
        if registro.saida
        else "",

        "horas_trabalhadas":
        registro.horas_trabalhadas
        or 0

    }), 200


# ==============================
# ATUALIZAR
# ==============================

@ponto.route(
    "/api/ponto/<int:id>",
    methods=["PUT"]
)
@api_gestor_obrigatorio
def atualizar(id):

    registro = Ponto.query.get_or_404(
        id
    )

    dados = request.json or {}

    # ==========================================
    # COLABORADOR
    # ==========================================

    if dados.get("colaborador_id"):

        registro.colaborador_id = dados.get(
            "colaborador_id"
        )

    # ==========================================
    # ENTRADA
    # ==========================================

    if dados.get("entrada"):

        entrada = converter_data(
            dados.get("entrada")
        )

        if not entrada:

            return jsonify({

                "mensagem":
                "Data ou horário de entrada inválido."

            }), 400

        registro.entrada = entrada

    # ==========================================
    # SAÍDA
    # ==========================================

    if dados.get("saida"):

        saida = converter_data(
            dados.get("saida")
        )

        if not saida:

            return jsonify({

                "mensagem":
                "Data ou horário de saída inválido."

            }), 400

        registro.saida = saida

    # ==========================================
    # VALIDAR HORÁRIOS
    # ==========================================

    if registro.entrada and registro.saida:

        if registro.saida < registro.entrada:

            return jsonify({

                "mensagem":
                "A saída não pode ser anterior à entrada."

            }), 400

    # ==========================================
    # HORAS TRABALHADAS
    # ==========================================

    if "horas_trabalhadas" in dados:

        try:

            registro.horas_trabalhadas = float(
                dados["horas_trabalhadas"]
            )

        except (ValueError, TypeError):

            return jsonify({

                "mensagem":
                "Quantidade de horas inválida."

            }), 400

    db.session.commit()

    return jsonify({

        "mensagem":
        "Registro atualizado com sucesso!"

    }), 200


# ==============================
# EXCLUIR
# ==============================

@ponto.route(
    "/api/ponto/<int:id>",
    methods=["DELETE"]
)
@api_gestor_obrigatorio
def excluir(id):

    registro = Ponto.query.get_or_404(
        id
    )

    db.session.delete(
        registro
    )

    db.session.commit()

    return jsonify({

        "mensagem":
        "Registro excluído com sucesso!"

    }), 200