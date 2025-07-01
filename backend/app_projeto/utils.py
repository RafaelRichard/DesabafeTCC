import jwt
from django.conf import settings

ALGORITHM = "HS256"


def verify_jwt(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.DecodeError:
        return None  # Token inválido
