from django.http import JsonResponse
from .utils import verify_jwt  # Função que valida o JWT

class JWTAuthenticationMiddleware:
    """Middleware para proteger rotas com JWT."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Exclui a rota de cadastro do middleware
        if request.path == 'cadastrar_usuario/':  # Ajuste conforme sua URL
            return self.get_response(request)

        # Verifica o cabeçalho Authorization para outras rotas
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]  # Extrai o token
            payload = verify_jwt(token)  # Verifica o JWT com a função verify_jwt

            if payload:
                request.user_data = payload  # Se o token for válido, armazena as informações do usuário
            else:
                return JsonResponse({"error": "Token inválido"}, status=401)
        else:
            return JsonResponse({"error": "Token ausente"}, status=401)

        # Se o token for válido, continua com a requisição
        response = self.get_response(request)
        return response
