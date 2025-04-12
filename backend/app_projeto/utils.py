import jwt
import datetime
from django.conf import settings

# Chave secre  ta para assinar o token
SECRET_KEY = "8Xb3x6HUQd"
ALGORITHM = "HS256"
TOKEN_EXPIRATION = datetime.timedelta(hours=1)


def generate_jwt(user):
    """Gera um token JWT para o usuário."""
    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + TOKEN_EXPIRATION,
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def verify_jwt(token):
    try:
        # Decodificando o token com a chave secreta do Django
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.DecodeError:
        return None  # Token inválido
    