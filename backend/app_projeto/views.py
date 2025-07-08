from django.http import JsonResponse, HttpResponseRedirect
import json
import re
import requests
from .models import Usuario, Endereco
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from .permissions import IsAdmin, IsPaciente, IsPsicologo, IsPsiquiatra
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status   
from .serializers import UsuarioSerializer, AgendamentoSerializer, EnderecoSerializer, UsuarioComEnderecoSerializer
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
from rest_framework.permissions import AllowAny
from django.views.decorators.http import require_POST
import os




def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


@csrf_exempt
def cadastrar_usuario(request):
    if request.method == 'POST':
        # Se multipart/form-data, use request.POST e request.FILES
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.POST
            foto = request.FILES.get('foto')
        else:
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Dados inválidos'}, status=400)
            foto = None

        # Coleta os dados do corpo da requisição
        nome = data.get('name')
        email = data.get('email')
        telefone = data.get('phone', '')
        cpf = data.get('cpf')  # CORRIGIDO: pega o campo correto do CPF
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

        # Criptografa a senha
        senha_criptografada = make_password(senha)

        # Valida especialidade e valor da consulta para psicólogos e psiquiatras
        if role in ['Psiquiatra', 'Psicologo']:
            if not data.get('especialidade'):
                return JsonResponse({'error': 'A especialidade é obrigatória para profissionais.'}, status=400)
            if not data.get('valor_consulta'):
                return JsonResponse({'error': 'O valor da consulta é obrigatório para profissionais.'}, status=400)
            try:
                valor_consulta = float(data.get('valor_consulta'))
            except (TypeError, ValueError):
                return JsonResponse({'error': 'Valor da consulta inválido.'}, status=400)
        else:
            valor_consulta = None

        # Foto (opcional, pode ser URL ou base64, ajuste conforme frontend)
        

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
            crp=data.get('crp') if role == 'Psicologo' else None,  # Atribui o CRP somente se for psiquiatra
            especialidade=data.get('especialidade') if role in ['Psiquiatra', 'Psicologo'] else None,
            valor_consulta=valor_consulta,
            foto=foto,  # Agora aceita arquivo
        )

        # Salva o usuário no banco de dados
        usuario.save()

        # Salva o endereço, se fornecido
        endereco_fields = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep', 'tipo_endereco']
        if all(data.get(field) for field in ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'tipo_endereco']):
            Endereco.objects.create(
                usuario=usuario,
                logradouro=data.get('logradouro'),
                numero=data.get('numero'),
                complemento=data.get('complemento', ''),
                bairro=data.get('bairro'),
                cidade=data.get('cidade'),
                estado=data.get('estado'),
                cep=data.get('cep'),
                tipo=data.get('tipo_endereco'),
            )

        # Gera o token JWT para o novo usuário usando SimpleJWT
        refresh = RefreshToken.for_user(usuario)
        token = str(refresh.access_token)

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
            refresh = RefreshToken.for_user(usuario)
            token = str(refresh.access_token)

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
        'foto': usuario.foto.url if usuario.foto else None,
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
        serializer = UsuarioComEnderecoSerializer(usuario)
        return JsonResponse(serializer.data, status=200)

    elif request.method == 'PUT':
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.POST
            foto = request.FILES.get('foto')
            print('DEBUG FOTO:', foto)  # <-- LOG PARA DEPURAÇÃO
            # Atualiza a foto se vier
            if foto:
                # Remove a foto antiga se existir
                if usuario.foto and hasattr(usuario.foto, 'path') and os.path.isfile(usuario.foto.path):
                    try:
                        os.remove(usuario.foto.path)
                    except Exception:
                        pass
                usuario.foto = foto
            # Atualiza outros campos normalmente
            usuario.nome = data.get('nome', usuario.nome)
            usuario.email = data.get('email', usuario.email)
            usuario.cpf = data.get('cpf', usuario.cpf)
            usuario.telefone = data.get('telefone', usuario.telefone)
            usuario.role = data.get('role', usuario.role)
            if usuario.role == 'Psiquiatra':
                usuario.crm = data.get('crm', usuario.crm)
                usuario.crp = None
            elif usuario.role == 'Psicologo':
                usuario.crp = data.get('crp', usuario.crp)
                usuario.crm = None
            usuario.especialidade = data.get('especialidade', usuario.especialidade)
            valor_consulta = data.get('valor_consulta', usuario.valor_consulta)
            if valor_consulta is not None:
                try:
                    usuario.valor_consulta = float(valor_consulta)
                except (TypeError, ValueError):
                    pass
            # usuario.stripe_email = data.get('stripe_email', usuario.stripe_email)
            # usuario.stripe_account_id = data.get('stripe_account_id', usuario.stripe_account_id)
            usuario.save()
            serializer = UsuarioComEnderecoSerializer(usuario)
            return JsonResponse(serializer.data, status=200)
        else:
            data = json.loads(request.body)
            foto = None
            usuario.nome = data.get('nome', usuario.nome)
            usuario.email = data.get('email', usuario.email)
            usuario.cpf = data.get('cpf', usuario.cpf)
            usuario.telefone = data.get('telefone', usuario.telefone)
            usuario.role = data.get('role', usuario.role)
            if usuario.role == 'Psiquiatra':
                usuario.crm = data.get('crm', usuario.crm)
                usuario.crp = None
            elif usuario.role == 'Psicologo':
                usuario.crp = data.get('crp', usuario.crp)
                usuario.crm = None
            usuario.especialidade = data.get('especialidade', usuario.especialidade)
            valor_consulta = data.get('valor_consulta', usuario.valor_consulta)
            if valor_consulta is not None:
                try:
                    usuario.valor_consulta = float(valor_consulta)
                except (TypeError, ValueError):
                    pass
            if foto is not None:
                print('DEBUG FOTO (json):', foto)  # <-- LOG PARA DEPURAÇÃO
                if usuario.foto and hasattr(usuario.foto, 'path') and os.path.isfile(usuario.foto.path):
                    try:
                        os.remove(usuario.foto.path)
                    except Exception:
                        pass
                usuario.foto = foto
            else:
                usuario.foto = data.get('foto', usuario.foto)
            usuario.save()
            serializer = UsuarioComEnderecoSerializer(usuario)
            return JsonResponse(serializer.data, status=200)

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
    # Apenas admin pode ver todos os agendamentos
    token = request.COOKIES.get('jwt') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return Response({'error': 'Não autenticado.'}, status=401)
    try:
        import jwt
        from django.conf import settings
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        usuario = Usuario.objects.get(id=user_id)
    except Exception:
        return Response({'error': 'Usuário não autenticado.'}, status=401)
    if usuario.role != 'Admin':
        return Response({'error': 'Apenas administradores podem ver todos os agendamentos.'}, status=403)
    agendamentos = Agendamento.objects.all()
    serializer = AgendamentoSerializer(agendamentos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def criar_agendamento(request):
    """
    Quando eu crio um agendamento, gero automaticamente o link da videoconferência no Jitsi Meet
    e salvo no campo link_consulta do agendamento.
    """
    from django.utils.crypto import get_random_string
    data = request.data.copy()  # Faço uma cópia mutável dos dados recebidos
    # Gero um nome único para a sala (ex: consulta-<timestamp>-<randstr>)
    nome_sala = f"consulta-{int(datetime.utcnow().timestamp())}-{get_random_string(6)}"
    url = f"https://meet.jit.si/{nome_sala}"
    data['link_consulta'] = url
    # Crio o agendamento normalmente, agora com o link_consulta preenchido
    serializer = AgendamentoSerializer(data=data)
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


@api_view(['DELETE'])
def deletar_agendamento(request, id):
    try:
        agendamento = Agendamento.objects.get(id=id)
    except Agendamento.DoesNotExist:
        return Response({"error": "Agendamento não encontrado"}, status=404)
    agendamento.delete()
    return Response({"success": "Agendamento excluído com sucesso."}, status=204)

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

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        jwt_token = str(refresh.access_token)
        return JsonResponse({"token": jwt_token})

@api_view(['GET', 'POST', 'PUT'])
def enderecos_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuário não encontrado.'}, status=404)

    if request.method == 'GET':
        enderecos = Endereco.objects.filter(usuario=usuario)
        serializer = EnderecoSerializer(enderecos, many=True)
        return Response(serializer.data)

    elif request.method in ['POST', 'PUT']:
        data = request.data
        # Checa se já existe algum endereço para o usuario
        endereco_existente = Endereco.objects.filter(usuario=usuario).first()
        if endereco_existente:
            # Atualiza o endereço existente
            serializer = EnderecoSerializer(endereco_existente, data={**data, 'usuario': usuario.id}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        else:
            # Cria novo endereço
            required_fields = ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'tipo']
            missing = [field for field in required_fields if not data.get(field)]
            if missing:
                return Response({'error': f'Todos os campos obrigatórios do endereço devem ser preenchidos. Faltando: {", ".join(missing)}'}, status=400)
            serializer = EnderecoSerializer(data={**data, 'usuario': usuario.id})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def detalhar_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)
    serializer = UsuarioComEnderecoSerializer(usuario)
    return Response(serializer.data)

@api_view(['GET'])
def listar_psicologos(request, id=None):
    if id:
        try:
            psicologo = Usuario.objects.get(id=id, role='Psicologo')
            serializer = UsuarioSerializer(psicologo)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response({"error": "Psicólogo não encontrado"}, status=404)
    else:
        psicologos = Usuario.objects.filter(role='Psicologo')
        serializer = UsuarioSerializer(psicologos, many=True)
        return Response(serializer.data)

# --- INÍCIO MERCADO PAGO ---
# Aqui estou importando as bibliotecas necessárias para integração com o Mercado Pago
import mercadopago
from urllib.parse import urlencode

# Endpoint para iniciar o OAuth do Mercado Pago (profissional autoriza o app)
@csrf_exempt
def iniciar_oauth_mercadopago(request):
    # Aqui eu gero a URL de autorização do Mercado Pago para o profissional vincular a conta
    # Eu pego o user_id do profissional que está tentando vincular
    user_id = request.GET.get('user_id') or request.POST.get('user_id')
    client_id = settings.MERCADOPAGO_CLIENT_ID
    redirect_uri = settings.MERCADOPAGO_REDIRECT_URI
    base_url = 'https://auth.mercadopago.com.br/authorization'
    # Eu adiciono o parâmetro state com o user_id para identificar o profissional no callback
    params = {
        'client_id': client_id,
        'response_type': 'code',
        'platform_id': 'mp',
        'redirect_uri': redirect_uri,
        'state': user_id,  # user_id vai no state
    }
    from urllib.parse import urlencode
    url = f"{base_url}?{urlencode(params)}"
    return JsonResponse({'auth_url': url})

# Endpoint para receber o callback do OAuth e salvar o access_token do profissional
@csrf_exempt
def oauth_callback_mercadopago(request):
    # Aqui eu troco o code pelo access_token do profissional e salvo no banco
    code = request.GET.get('code')
    user_id = request.GET.get('state')  # Envie o user_id no state para saber quem está autenticando
    if not code or not user_id:
        # Redireciona para o frontend com erro
        return HttpResponseRedirect("http://localhost:3000/meu_perfil_psicologo?mp_status=error")
    client_id = settings.MERCADOPAGO_CLIENT_ID
    client_secret = settings.MERCADOPAGO_CLIENT_SECRET
    redirect_uri = settings.MERCADOPAGO_REDIRECT_URI
    token_url = 'https://api.mercadopago.com/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri,
    }
    response = requests.post(token_url, data=data)
    if response.status_code == 200:
        token_data = response.json()
        mp_user_id = token_data['user_id']
        mp_access_token = token_data['access_token']
        usuario = Usuario.objects.get(id=user_id)
        usuario.mp_user_id = mp_user_id
        usuario.mp_access_token = mp_access_token
        usuario.save()
        # Redireciona para o perfil correto com sucesso
        perfil = 'meu_perfil_psicologo' if usuario.role == 'Psicologo' else 'meu_perfil_psiquiatra'
        return HttpResponseRedirect(f"http://localhost:3000/{perfil}?mp_status=success")
    else:
        # Redireciona para o perfil correto com erro
        try:
            usuario = Usuario.objects.get(id=user_id)
            perfil = 'meu_perfil_psicologo' if usuario.role == 'Psicologo' else 'meu_perfil_psiquiatra'
        except:
            perfil = 'meu_perfil_psicologo'
        return HttpResponseRedirect(f"http://localhost:3000/{perfil}?mp_status=error")
# --- FIM MERCADO PAGO ---

@csrf_exempt
def criar_pagamento_mercadopago(request):
    # Cria um pagamento para o profissional usando o access_token dele
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({'error': f'JSON inválido: {str(e)}'}, status=400)
    profissional_id = data.get('profissional_id')
    preco = float(data.get('preco', 100))
    nome_produto = data.get('nome_produto', 'Consulta Online')
    if not profissional_id:
        return JsonResponse({'error': 'profissional_id ausente'}, status=400)
    try:
        usuario = Usuario.objects.get(id=profissional_id)
    except Usuario.DoesNotExist:
        return JsonResponse({'error': 'Profissional não encontrado'}, status=400)
    if not usuario.mp_access_token:
        return JsonResponse({'error': 'Profissional não vinculado ao Mercado Pago.'}, status=400)
    sdk = mercadopago.SDK(usuario.mp_access_token)
    ngrok_url = "https://012f-181-213-251-83.ngrok-free.app"
    marketplace_fee = round(preco * 0.10, 2)
    preference_data = {
        "items": [
            {
                "title": nome_produto,
                "quantity": 1,
                "currency_id": "BRL",
                "unit_price": preco
            }
        ],
        "back_urls": {
            "success": f"{ngrok_url}/pagamentoplano?status=sucesso",
            "failure": f"{ngrok_url}/pagamentoplano?status=erro",
            "pending": f"{ngrok_url}/pagamentoplano?status=pendente"
        },
        "auto_return": "approved",
        "marketplace_fee": marketplace_fee,
        "payment_methods": {
            "excluded_payment_types": [
                {"id": "ticket"},        # Exclui boleto
                {"id": "atm"},           # Exclui lotérica/ATM
                {"id": "prepaid_card"}   # Exclui cartão pré-pago
            ]
        }
    }
    preference_response = sdk.preference().create(preference_data)
    print('Resposta Mercado Pago:', preference_response)  # <-- Adiciona log detalhado
    if preference_response.get('status') == 201:
        return JsonResponse({'checkout_url': preference_response.get('response', {}).get('init_point')})
    else:
        return JsonResponse({'error': 'Erro ao criar pagamento no Mercado Pago.', 'mp_response': preference_response}, status=400)

@api_view(['GET'])
def listar_agendamentos_profissional(request):
    # Busca o usuário logado via JWT manualmente
    token = request.COOKIES.get('jwt') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return Response({'error': 'Não autenticado.'}, status=401)
    try:
        import jwt
        from django.conf import settings
        from django.utils.timezone import localtime
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        usuario = Usuario.objects.get(id=user_id)
    except Exception:
        return Response({'error': 'Usuário não autenticado.'}, status=401)
    if usuario.role not in ['Psicologo', 'Psiquiatra']:
        return Response({'error': 'Apenas profissionais podem acessar suas consultas.'}, status=403)
    # Busca agendamentos para psicólogos e psiquiatras
    if usuario.role == 'Psiquiatra':
        agendamentos = Agendamento.objects.filter(psiquiatra=usuario)
    elif usuario.role == 'Psicologo':
        agendamentos = Agendamento.objects.filter(psicologo=usuario)
    else:
        agendamentos = Agendamento.objects.none()
    data = []
    for ag in agendamentos:
        paciente = ag.usuario
        # Garante que a data/hora seja convertida para o timezone local do servidor
        data_hora_local = localtime(ag.data_hora) if ag.data_hora else None
        data.append({
            'id': ag.id,
            'paciente': {
                'id': paciente.id,
                'nome': paciente.nome,
                'email': paciente.email,
                'telefone': paciente.telefone,
                'cpf': paciente.cpf,
                'status': paciente.status,
                'role': paciente.role,
            },
            'data_iso': data_hora_local.isoformat() if data_hora_local else '',
            'data': data_hora_local.strftime('%Y-%m-%d') if data_hora_local else '',
            'hora': data_hora_local.strftime('%H:%M') if data_hora_local else '',
            'status': ag.status,
            'observacao': ag.observacoes or '',
            'link_consulta': ag.link_consulta or '',
        })
    return Response(data)


@api_view(['GET'])
def listar_agendamentos_paciente(request):
    # Busca o usuário logado via JWT manualmente (igual ao de profissional)
    token = request.COOKIES.get('jwt') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return Response({'error': 'Não autenticado.'}, status=401)
    try:
        import jwt
        from django.conf import settings
        from django.utils.timezone import localtime
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        usuario = Usuario.objects.get(id=user_id)
    except Exception:
        return Response({'error': 'Usuário não autenticado.'}, status=401)
    agendamentos = Agendamento.objects.filter(usuario=usuario)
    data = []
    for ag in agendamentos:
        profissional = ag.psiquiatra if ag.psiquiatra else ag.psicologo
        profissional_dict = None
        if profissional:
            profissional_dict = {
                'id': profissional.id,
                'nome': profissional.nome,
                'email': profissional.email,
                'telefone': profissional.telefone,
                'role': profissional.role,
                'crm': getattr(profissional, 'crm', None),
                'crp': getattr(profissional, 'crp', None),
                'especialidade': getattr(profissional, 'especialidade', None),
                'valor_consulta': str(getattr(profissional, 'valor_consulta', '')),
            }
        # Garante que a data/hora seja convertida para o timezone local do servidor
        from django.utils.timezone import localtime
        data_hora_local = localtime(ag.data_hora) if ag.data_hora else None
        data.append({
            'id': ag.id,
            'profissional': profissional_dict,
            'data_iso': data_hora_local.isoformat() if data_hora_local else '',
            'data': data_hora_local.strftime('%Y-%m-%d') if data_hora_local else '',
            'hora': data_hora_local.strftime('%H:%M') if data_hora_local else '',
            'status': ag.status,
            'observacao': ag.observacoes or '',
            'link_consulta': ag.link_consulta or '',
        })
    return Response(data)

@api_view(['GET'])
def detalhar_agendamento(request, id):
    try:
        agendamento = Agendamento.objects.get(id=id)
    except Agendamento.DoesNotExist:
        return Response({'error': 'Agendamento não encontrado'}, status=404)
    serializer = AgendamentoSerializer(agendamento)
    return Response(serializer.data)


# --- INTEGRAÇÃO JITSI MEET ---
# Agora o link da videoconferência é gerado diretamente como https://meet.jit.si/consulta-<timestamp>-<randstr>

