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
from .serializers import UsuarioSerializer, AgendamentoSerializer
from .models import Agendamento, AgendamentoHistorico
import jwt
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime   
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode




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
                secure=True,  # True em produção
                samesite='None'
            )
            
            return response
        else:
            return JsonResponse({'error': 'Credenciais inválidas'}, status=401)

    return JsonResponse({'error': 'Método não permitido'}, status=405)

# Função para decodificar o token JWT com verificação de assinatura
def decode_jwt(token):
    try:
        # Decodifica o token com a verificação de assinatura, usando o algoritmo "HS256"
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
@api_view(['GET'])
def usuario_autenticado(request):
    # Obtendo o token da cookie
    token = request.COOKIES.get('jwt')
    print("JWT Token recebido:", token)

    if not token:
        return Response({'error': 'Token JWT não encontrado'}, status=401)

    try:
        # Decodificando o token e verificando a assinatura e expiração
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": True})
        print("Payload decodificado:", payload)

        # Verificando se o 'user_id' (não 'sub') está no payload
        user_id = payload.get('user_id')
        if not user_id:
            raise TokenError("Token não contém 'user_id'.")

        # Buscando o usuário com o 'user_id'
        usuario = Usuario.objects.get(id=user_id)
        
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expirado'}, status=401)
    except jwt.InvalidTokenError:
        return Response({'error': 'Token inválido'}, status=401)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=404)
    except TokenError as e:
        return Response({'error': str(e)}, status=401)

    # Preparando a resposta
    response_data = {
        'id': usuario.id,
        'email': usuario.email,
        'role': usuario.role,
        'nome': usuario.nome,
    }
    # Retornando as informações do usuário
    return Response(response_data)

def create_jwt_for_user(user):
    # Criando o token de refresh para o usuário
    refresh = RefreshToken.for_user(user)

    # Adicionando o 'user_id' ao payload do token
    refresh.payload['user_id'] = user.id

    # Retorna o token de acesso
    return str(refresh.access_token)


def generate_jwt(usuario):
    refresh = RefreshToken.for_user(usuario)
    refresh.payload['user_id'] = usuario.id  # Adicionando o 'user_id' explicitamente
    return str(refresh.access_token)

# Recuperação de Senha (envio de e-mail para redefinir a senha)
# class RecuperarSenhaAPIView(APIView):
#     def post(self, request):
#         email = request.data.get('email')
#         try:
#             user = User.objects.get(email=email)
#             uid = urlsafe_base64_encode(force_bytes(user.pk))
#             token = default_token_generator.make_token(user)
#             reset_url = f"http://localhost:3000/recuperar-senha/{uid}/{token}/"

#             send_mail(
#                 'Redefinição de Senha',
#                 f'Clique no link para redefinir sua senha: {reset_url}',
#                 'noreply@seudominio.com',
#                 [email],
#                 fail_silently=False,
#             )

#             return Response({'detail': 'Email de recuperação enviado.'})
#         except User.DoesNotExist:
#             return Response({'detail': 'Erro interno no servidor.'}, status=status.HTTP_404_NOT_FOUND)


# Redefinir Senha
# class RedefinirSenhaAPIView(APIView):
#     def post(self, request, uidb64, token):
#         try:
#             uid = urlsafe_base64_decode(uidb64).decode('utf-8')
#             user = get_user_model().objects.get(pk=uid)

#             if not default_token_generator.check_token(user, token):
#                 return Response({'detail': 'Token inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

#             nova_senha = request.data.get('password')
#             if not nova_senha:
#                 return Response({'detail': 'Nova senha não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

#             user.set_password(nova_senha)
#             user.save()

#             return Response({'detail': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)

#         except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
#             return Response({'detail': 'Token inválido ou usuário não encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        
        
@csrf_exempt
def logout(request):
    response = JsonResponse({'message': 'Logout realizado com sucesso'})
    
    # Remover o cookie "jwt"
    response.delete_cookie(
        key='jwt',
        path='/',
        samesite='Lax',  # Mantenha o mesmo valor que foi utilizado na definição do cookie
    )

    return response

@api_view(['GET'])
def listar_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def listar_psiquiatras(request, id=None):
    if id:
        try:
            # Agora estamos filtrando apenas pelo role 'Psiquiatra'
            psiquiatra = Usuario.objects.get(id=id, role='Psiquiatra')
            serializer = UsuarioSerializer(psiquiatra)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response({"error": "Psiquiatra não encontrado"}, status=404)
    else:
        # Listando todos os usuários com o role 'Psiquiatra'
        psiquiatras = Usuario.objects.filter(role='Psiquiatra')
        serializer = UsuarioSerializer(psiquiatras, many=True)
        return Response(serializer.data)
    

@api_view(['GET'])
def listar_psiquiatras_id(request, id):
    try:
        psiquiatra = Usuario.objects.get(id=id, role='Psiquiatra')
    except Usuario.DoesNotExist:
        return Response({'error': 'Psiquiatra não encontrado'}, status=404)

    serializer = UsuarioSerializer(psiquiatra)
    return Response(serializer.data)




@csrf_exempt  # se necessário para desabilitar a verificação de CSRF
def editar_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)

    if request.method == 'GET':
        return JsonResponse({
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'cpf': usuario.cpf,
            'telefone': usuario.telefone,
            'role': usuario.role,
        }, status=200)

    elif request.method == 'PUT':
        data = json.loads(request.body)
        usuario.nome = data.get('nome', usuario.nome)
        usuario.email = data.get('email', usuario.email)
        usuario.cpf = data.get('cpf', usuario.cpf)
        usuario.telefone = data.get('telefone', usuario.telefone)
        usuario.role = data.get('role', usuario.role)
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
def get_usuario_por_id(request, id):
    try:
        usuario = Usuario.objects.get(id=id)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({"message": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)


def rota_protegida(request):
    if hasattr(request, "user_data"):
        return JsonResponse({"message": "Acesso autorizado!", "user": request.user_data})
    
    return JsonResponse({"error": "Acesso não autorizado"}, status=401)

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


#REGION AGENDAMENTO

@api_view(['GET'])
def listar_agendamentos(request):
    agendamentos = Agendamento.objects.all()
    serializer = AgendamentoSerializer(agendamentos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def criar_agendamento(request):
    serializer = AgendamentoSerializer(data=request.data)
    if serializer.is_valid():
        agendamento = serializer.save()

        # Adiciona histórico
        AgendamentoHistorico.objects.create(
            agendamento=agendamento,
            status_anterior='pendente'
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def atualizar_agendamento(request, id):
    try:
        agendamento = Agendamento.objects.get(id=id)
    except Agendamento.DoesNotExist:
        return Response({"error": "Agendamento não encontrado"}, status=404)

    status_anterior = agendamento.status
    serializer = AgendamentoSerializer(agendamento, data=request.data)

    if serializer.is_valid():
        serializer.save()

        # Registra no histórico se o status mudou
        if request.data.get("status") and request.data.get("status") != status_anterior:
            AgendamentoHistorico.objects.create(
                agendamento=agendamento,
                status_anterior=status_anterior
            )

        return Response(serializer.data)
    return Response(serializer.errors, status=400)


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

