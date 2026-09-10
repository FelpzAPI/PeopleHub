from api.database import db


# =========================================================
# COLABORADORES
# =========================================================

class Colaborador(db.Model):

    __tablename__ = "colaboradores"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    cargo = db.Column(
        db.String(100)
    )

    setor = db.Column(
        db.String(100)
    )

    email = db.Column(
        db.String(120),
        unique=True
    )

    status = db.Column(
        db.String(30),
        default="Ativo"
    )


# =========================================================
# METAS
# =========================================================

class Meta(db.Model):

    __tablename__ = "metas"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    titulo = db.Column(
        db.String(100),
        nullable=False
    )

    descricao = db.Column(
        db.Text
    )

    objetivo = db.Column(
        db.Text
    )

    status = db.Column(
        db.String(30)
    )

    prazo = db.Column(
        db.Date
    )

    colaborador_id = db.Column(
        db.Integer
    )


# =========================================================
# AVALIAÇÕES
# =========================================================

class Avaliacao(db.Model):

    __tablename__ = "avaliacoes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    colaborador_id = db.Column(
        db.Integer,
        nullable=False
    )

    periodo = db.Column(
        db.String(50)
    )

    tipo = db.Column(
    db.String(50)
    )

    pontos_positivos = db.Column(
        db.Text
    )

    pontos_melhoria = db.Column(
        db.Text
    )

    comentario = db.Column(
        db.Text
    )

    feedback_colaborador = db.Column(
        db.Text
    )

    avaliador = db.Column(
        db.String(100)
    )

    data = db.Column(
        db.Date
    )


# =========================================================
# TREINAMENTOS
# =========================================================

class Treinamento(db.Model):

    __tablename__ = "treinamentos"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    titulo = db.Column(
        db.String(100),
        nullable=False
    )

    descricao = db.Column(
        db.Text
    )

    carga_horaria = db.Column(
        db.Integer
    )

    tipo = db.Column(
        db.String(20),
        default="externo"
    )

    link = db.Column(
        db.String(255)
    )

    plataforma = db.Column(
        db.String(100)
    )

    conteudo = db.Column(
        db.Text
    )

    # =========================================================
# TREINAMENTOS CONCLUÍDOS
# =========================================================

class TreinamentoConcluido(db.Model):

    __tablename__ = "treinamentos_concluidos"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    colaborador_id = db.Column(
        db.Integer,
        db.ForeignKey("colaboradores.id"),
        nullable=False
    )

    treinamento_id = db.Column(
        db.Integer,
        db.ForeignKey("treinamentos.id"),
        nullable=False
    )

    concluido = db.Column(
        db.Boolean,
        default=True
    )


# =========================================================
# FEEDBACK
# =========================================================

class Feedback(db.Model):

    __tablename__ = "feedbacks"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    remetente_id = db.Column(
        db.Integer
    )

    destinatario_id = db.Column(
        db.Integer
    )

    tipo = db.Column(
        db.String(50)
    )

    mensagem = db.Column(
        db.Text
    )

    data = db.Column(
        db.Date
    )

    status = db.Column(
        db.String(50),
        default="Enviado"
    )


# =========================================================
# PLANO DE CARREIRA
# =========================================================

class PlanoCarreira(db.Model):

    __tablename__ = "planos_carreira"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    colaborador_id = db.Column(
        db.Integer
    )

    cargo_atual = db.Column(
        db.String(100)
    )

    cargo_desejado = db.Column(
        db.String(100)
    )

    objetivo = db.Column(
        db.Text
    )

    status = db.Column(
        db.String(30)
    )


# =========================================================
# FÉRIAS
# =========================================================

class Ferias(db.Model):

    __tablename__ = "ferias"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    colaborador_id = db.Column(
        db.Integer
    )

    data_inicio = db.Column(
        db.Date
    )

    data_fim = db.Column(
        db.Date
    )

    observacao = db.Column(
        db.Text
    )

    data_solicitacao = db.Column(
        db.Date
    )

    status = db.Column(
        db.String(30),
        default="Pendente"
    )


# =========================================================
# PONTO
# =========================================================

class Ponto(db.Model):

    __tablename__ = "ponto"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    colaborador_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "colaboradores.id"
        ),
        nullable=False
    )

    entrada = db.Column(
        db.DateTime,
        nullable=True
    )

    saida = db.Column(
        db.DateTime,
        nullable=True
    )

    horas_trabalhadas = db.Column(
        db.String(20),
        nullable=True
    )

    colaborador = db.relationship(
        "Colaborador",
        backref="pontos"
    )


# =========================================================
# USUÁRIO / CONTA DE ACESSO
# =========================================================

class Usuario(db.Model):

    __tablename__ = "usuarios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    senha = db.Column(
        db.String(255),
        nullable=False
    )

    perfil = db.Column(
        db.String(30),
        default="Funcionário"
    )

    cargo = db.Column(
        db.String(100)
    )

    setor = db.Column(
        db.String(100)
    )

    colaborador_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "colaboradores.id"
        ),
        nullable=True
    )

    colaborador = db.relationship(
        "Colaborador",
        backref="usuario",
        uselist=False
    )