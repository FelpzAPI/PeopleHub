import re


def senha_forte(senha):

    if len(senha) < 8:
        return False, "A senha deve possuir pelo menos 8 caracteres."


    if not re.search(r"[A-Z]", senha):
        return False, "A senha deve possuir pelo menos uma letra maiúscula."


    if not re.search(r"[a-z]", senha):
        return False, "A senha deve possuir pelo menos uma letra minúscula."


    if not re.search(r"[0-9]", senha):
        return False, "A senha deve possuir pelo menos um número."


    if not re.search(r"[@#$%&*!]", senha):
        return False, "A senha deve possuir pelo menos um caractere especial."


    return True, ""