from django.http import JsonResponse
import json
import re
import requests
from .models import Usuario
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect
from .utils import generate_jwt
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login, get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import IsAdmin, IsPaciente, IsPsicologo, IsPsiquiatra
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UsuarioSerializer



def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


@csrf_exempt
def cadastrar_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos'}, status=400)

        # Coleta os dados do corpo da requisição
        nome = data.get('name')
        email = data.get('email')
        telefone = data.get('phone', '')
        cpf = data.get('cpf')
        senha = data.get('password')
        status = data.get('status', 'ativo')  # Definido como 'ativo' por padrão
        role = data.get('role')

        # Se o role for 'Admin', devemos garantir que o usuário autenticado seja admin
        if role == 'Admin':
            if not request.user.is_superuser:  # Verifica se o usuário que está criando é um admin
                return JsonResponse({'error': 'Apenas administradores podem criar outros administradores.'}, status=403)

        # Valida o CPF
        cpf_regex = r'^\d{3}\.\d{3}\.\d{3}-\d{2}$'
        if not re.match(cpf_regex, cpf):
            return JsonResponse({'error': 'CPF inválido. O formato deve ser XXX.XXX.XXX-XX.'}, status=400)

        # Valida o CRM para psiquiatras
        if role == 'Psiquiatra' and not data.get('crm'):
            return JsonResponse({'error': 'O CRM é obrigatório para psiquiatras.'}, status=400)
        
        # Valida o CRP para psicólogos
        if role == 'Psicologo' and not data.get('crp'):
            return JsonResponse({'error': 'O CRP é obrigatório para psicólogos.'}, status=400)

        # Verifica se o email já está registrado
        if Usuario.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email já cadastrado.'}, status=400)

        # Criptografa a senha
        senha_criptografada = make_password(senha)

        # Criação do usuário no banco de dados
        usuario = Usuario(
            nome=nome,
            email=email,
            telefone=telefone,
            cpf=cpf,
            senha=senha_criptografada,
            status=status,
            role=role,  # Adiciona o campo role corretamente
            crm=data.get('crm') if role == 'Psiquiatra' else None,  # Atribui o CRM somente se for psiquiatra
            crp=data.get('crp') if role == 'Psicologo' else None,  # Atribui o CRP somente se for psicólogo
        )

        # Salva o usuário no banco de dados
        usuario.save()

        # Gera o token JWT para o novo usuário
        token = generate_jwt(usuario)

        # Retorna uma resposta de sucesso com o token JWT
        return JsonResponse({'message': 'Cadastro realizado com sucesso!', 'token': token}, status=201)
    
    # Retorna erro para métodos não permitidos
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@csrf_exempt
def login_usuario(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

        if check_password(password, usuario.senha):  
            token = generate_jwt(usuario)

            response = JsonResponse({
                'message': 'Login bem-sucedido!',
                'token': token,
                'email': usuario.email,
                'role': usuario.role
            })
            response.set_cookie(
                key='jwt',
                value=token,
                httponly=True,
                secure=False,  # True em produção
                samesite='Lax'
            )
            return response
        else:
            return JsonResponse({'error': 'Credenciais inválidas'}, status=401)

    return JsonResponse({'error': 'Método não permitido'}, status=405)

def logout_usuario(request):
    response = JsonResponse({'message': 'Logout realizado com sucesso'})
    response.delete_cookie('jwt')
    return response

@api_view(['GET'])
def listar_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)

@csrf_exempt  # se necessário para desabilitar a verificação de CSRF
def editar_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)
    
    if request.method == 'PUT':
        # Supondo que você está recebendo um JSON com os dados do usuário
        data = json.loads(request.body)
        
        # Atualiza os campos com os dados recebidos, usando o nome correto dos campos no modelo
        usuario.nome = data.get('nome', usuario.nome)
        usuario.email = data.get('email', usuario.email)
        usuario.cpf = data.get('cpf', usuario.cpf)
        usuario.telefone = data.get('telefone', usuario.telefone)  # Usando o nome correto 'telefone'
        usuario.role = data.get('role', usuario.role)

        # Salvar o usuário com as modificações
        usuario.save()

        return JsonResponse({'message': 'Usuário atualizado com sucesso'}, status=200)

    return JsonResponse({'message': 'Método não permitido'}, status=405)


@csrf_exempt  # Se necessário, para desabilitar a verificação de CSRF
def excluir_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)

    if request.method == 'DELETE':
        # Excluir o usuário
        usuario.delete()
        
        return JsonResponse({'message': 'Usuário excluído com sucesso'}, status=200)

    return JsonResponse({'message': 'Método não permitido'}, status=405)

@api_view(['GET'])
def get_user(request, id):
    try:
        user = User.objects.get(id=id)
        return Response(user.serialize(), status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"message": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

def rota_protegida(request):
    if hasattr(request, "user_data"):
        return JsonResponse({"message": "Acesso autorizado!", "user": request.user_data})
    
    return JsonResponse({"error": "Acesso não autorizado"}, status=401)


@csrf_exempt
def google_login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        token = data.get("token")

        # Validar o token com o Google
        google_response = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
        if google_response.status_code != 200:
            return JsonResponse({"error": "Token inválido"}, status=400)

        user_data = google_response.json()
        email = user_data.get("email")
        name = user_data.get("name")

        # Criar usuário se não existir
        user, created = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": name})

        jwt_token = generate_jwt(user)
        return JsonResponse({"token": jwt_token})


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)  # Gera os tokens padrão
        user = self.user  # Obtém o usuário autenticado
        
        # Adiciona informações extras na resposta
        data.update({
            "user_id": user.id,
            "name": user.nome,  # Corrigido para "nome", se seu modelo `Usuario` usa esse campo
            "email": user.email,
            "role": user.role,  # Se tiver esse campo no seu modelo
        })
        return data


# Modifica a view para usar o novo serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class AdminOnlyView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({"message": "Acesso permitido para admins"})


class PsicologoOnlyView(APIView):
    permission_classes = [IsPsicologo]

    def get(self, request):
        return Response({"message": "Acesso permitido para psicólogos"})


class PsiquiatraOnlyView(APIView):
    permission_classes = [IsPsiquiatra]

    def get(self, request):
        return Response({"message": "Acesso permitido para psiquiatras"})


class PacienteOnlyView(APIView):
    permission_classes = [IsPaciente]

    def get(self, request):
        return Response({"message": "Acesso permitido para pacientes"})
