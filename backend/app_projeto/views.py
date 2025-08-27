
from django.http import JsonResponse, HttpResponseRedirect
import json
import re
import requests
from .models import Usuario, Endereco, Prontuario
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
from .serializers import UsuarioSerializer, AgendamentoSerializer, EnderecoSerializer, UsuarioComEnderecoSerializer, ProntuarioSerializer
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
from django.utils.dateparse import parse_date
# ViewSet para Prontuário: permite listar, visualizar e editar prontuários
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Prontuario, Usuario
from .serializers import ProntuarioSerializer
import stripe
from django.conf import settings
from .models import Agendamento, Usuario
import json
# Endpoint para detalhar e editar prontuário (GET e PATCH)
from rest_framework.decorators import api_view
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives


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
            crp=data.get('crp') if role == 'Psicologo' else None,  # Atribui o CRP somente se for psicólogo
            especialidade=data.get('especialidade') if role in ['Psiquiatra', 'Psicologo'] else None,
            valor_consulta=valor_consulta,
            foto=foto if foto else None,
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
            if usuario.status.strip().lower() != 'ativo':
                return JsonResponse({'error': 'Usuário inativo'}, status=403)
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


class RecuperarSenhaAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = Usuario.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:3000/recuperar-senha/{uid}/{token}/"
            subject = 'Redefinição de Senha - Desabafe'
            text_content = f'Olá,\n\nRecebemos uma solicitação para redefinir sua senha.\n\nClique no link abaixo para criar uma nova senha:\n{reset_url}\n\nSe você não solicitou, ignore este e-mail.'
            html_content = f'''
                <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>Redefinição de Senha</h2>
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                                    <p><a href="{reset_url}" style="background: #6366f1; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Clique aqui para redefinir sua senha</a></p>
                                    <p>Ou copie e cole o link no navegador:<br><span style="color:#6366f1">{reset_url}</span></p>
                                    <p style="font-size: 0.9em; color: #888;">Se você não solicitou, ignore este e-mail.</p>
                                    <hr style="margin: 24px 0;">
                                    <p style="font-size: 0.8em; color: #aaa;">Desabafe - Equipe de Suporte</p>
                                </div>
                        '''
            msg = EmailMultiAlternatives(subject, text_content, 'suportedesabafe@gmail.com', [email])
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)

            return Response({'detail': 'Email de recuperação enviado.'})
        except Usuario.DoesNotExist:
            return Response({'detail': 'Erro interno no servidor.'}, status=status.HTTP_404_NOT_FOUND)


class RedefinirSenhaAPIView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode('utf-8')
            user = Usuario.objects.get(pk=uid)

            if not default_token_generator.check_token(user, token):
                return Response({'detail': 'Token inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

            nova_senha = request.data.get('password')
            if not nova_senha:
                return Response({'detail': 'Nova senha não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

            user.senha = make_password(nova_senha)
            user.save()

            return Response({'detail': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)

        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({'detail': 'Token inválido ou usuário não encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        
        
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
            novo_status = data.get('status', usuario.status)
            print(f"[DEBUG] Status recebido (form): {novo_status}")
            usuario.status = novo_status
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
            usuario.refresh_from_db()  # Garante que o path da foto está atualizado
            print(f"[DEBUG] Status salvo no banco (json): {usuario.status}")
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
            novo_status = data.get('status', usuario.status)
            print(f"[DEBUG] Status recebido (json): {novo_status}")
            usuario.status = novo_status
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
            usuario.refresh_from_db()  # Garante que o path da foto está atualizado
            print(f"[DEBUG] Status salvo no banco (form): {usuario.status}")
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
    # Antes de criar, verifica se já existe agendamento no mesmo bloco de 30 minutos
    from datetime import timedelta
    from .models import Agendamento, Usuario
    try:
        data_hora = data.get('data_hora')
        if not data_hora:
            return Response({'error': 'data_hora é obrigatória.'}, status=400)
        # Converte para datetime
        from django.utils.dateparse import parse_datetime
        inicio = parse_datetime(data_hora)
        if not inicio:
            return Response({'error': 'data_hora inválida.'}, status=400)
        fim = inicio + timedelta(minutes=30)

        # Descobre profissional e campo correto
        profissional_id = None
        if data.get('psiquiatra'):
            profissional_id = data.get('psiquiatra')
            data['psicologo'] = None
        elif data.get('psicologo'):
            profissional_id = data.get('psicologo')
            data['psiquiatra'] = None
        if not profissional_id:
            return Response({'error': 'Profissional não informado.'}, status=400)

        # Busca conflitos (pendente ou confirmado)
        from django.db.models import Q
        conflito = Agendamento.objects.filter(
            (Q(psiquiatra_id=profissional_id) | Q(psicologo_id=profissional_id)) &
            Q(data_hora__lt=fim) & Q(data_hora__gte=inicio) &
            Q(status__in=['pendente', 'confirmado'])
        ).exists()
        if conflito:
            return Response({'error': 'Já existe um agendamento neste horário ou bloco de 30 minutos.'}, status=400)
    except Exception as e:
        return Response({'error': f'Erro ao validar conflito de horário: {str(e)}'}, status=400)

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


import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def criar_pagamento_stripe(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    try:
        data = json.loads(request.body)
        preco = float(data.get('preco', 100))
        nome_produto = data.get('nome_produto', 'Consulta Online')
        profissional_id = data.get('profissional_id')
        if not profissional_id:
            return JsonResponse({'error': 'Profissional não informado.'}, status=400)
        profissional = Usuario.objects.filter(id=profissional_id).first()
        if not profissional or not profissional.stripe_account_id:
            return JsonResponse({'error': 'Profissional sem conta Stripe Connect.'}, status=400)
        preco_cents = int(preco * 100)
        # Split: 80% profissional, 20% plataforma
        split_percent = 0.8
        amount_to_profissional = int(preco_cents * split_percent)
        application_fee = preco_cents - amount_to_profissional

        # Definir URLs de sucesso/erro conforme o role do usuário
        usuario_id = data.get('usuario_id')
        success_url = 'http://localhost:3000/'
        cancel_url = 'http://localhost:3000/'
        if usuario_id:
            try:
                usuario = Usuario.objects.get(id=usuario_id)
                if usuario.role == 'Paciente':
                    success_url = 'http://localhost:3000/consultas_paciente?status=sucesso'
                    cancel_url = 'http://localhost:3000/consultas_paciente?status=erro'
                elif usuario.role == 'Psicologo':
                    success_url = 'http://localhost:3000/consultas_psicologos?status=sucesso'
                    cancel_url = 'http://localhost:3000/consultas_psicologos?status=erro'
                elif usuario.role == 'Psiquiatra':
                    success_url = 'http://localhost:3000/consultas_psiquiatras?status=sucesso'
                    cancel_url = 'http://localhost:3000/consultas_psiquiatras?status=erro'
            except Usuario.DoesNotExist:
                pass

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'brl',
                    'product_data': {   
                        'name': nome_produto,
                    },
                    'unit_amount': preco_cents,
                },
                'quantity': 1,
            }],
            mode='payment',
            payment_intent_data={
                'application_fee_amount': application_fee,
                'transfer_data': {
                    'destination': profissional.stripe_account_id,
                },
            },
            success_url=success_url,
            cancel_url=cancel_url,
        )
        # Salva o session_id no agendamento pendente mais recente do usuário e profissional
        usuario_id = data.get('usuario_id')
        from .models import Agendamento
        agendamento = None
        if usuario_id:
            agendamento_qs = Agendamento.objects.filter(
                usuario_id=usuario_id,
                status__in=['pendente', 'confirmado'],
                psiquiatra_id=profissional_id if profissional.role == 'Psiquiatra' else None,
                psicologo_id=profissional_id if profissional.role == 'Psicologo' else None
            ).order_by('-id')
            agendamento = agendamento_qs.first()
            if agendamento:
                agendamento.stripe_session_id = session.id
                agendamento.valor_recebido_profissional = amount_to_profissional / 100.0
                agendamento.valor_plataforma = application_fee / 100.0
                agendamento.status = 'paga'
                agendamento.save()
            else:
                # Log detalhado para depuração
                print(f"[ERRO PAGAMENTO] Nenhum agendamento pendente encontrado para usuario_id={usuario_id}, profissional_id={profissional_id}, role={profissional.role}")
                return JsonResponse({'error': 'Nenhum agendamento pendente encontrado para salvar o pagamento. Agende a consulta antes de pagar.'}, status=400)
        return JsonResponse({'checkout_url': session.url})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


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
    if usuario.role == 'Admin':
        tipo = request.GET.get('tipo')
        if tipo == 'psiquiatra':
            agendamentos = Agendamento.objects.filter(psiquiatra__isnull=False)
        elif tipo == 'psicologo':
            agendamentos = Agendamento.objects.filter(psicologo__isnull=False)
        else:
            agendamentos = Agendamento.objects.all()
    elif usuario.role == 'Psiquiatra':
        agendamentos = Agendamento.objects.filter(psiquiatra=usuario)
    elif usuario.role == 'Psicologo':
        agendamentos = Agendamento.objects.filter(psicologo=usuario)
    else:
        return Response({'error': 'Apenas profissionais ou admin podem acessar suas consultas.'}, status=403)
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
            'valor_recebido_profissional': float(ag.valor_recebido_profissional) if ag.valor_recebido_profissional is not None else 0.0,
            'valor_plataforma': float(ag.valor_plataforma) if ag.valor_plataforma is not None else 0.0,
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
    if usuario.role == 'Admin':
        tipo = request.GET.get('tipo')
        if tipo == 'psiquiatra':
            agendamentos = Agendamento.objects.filter(psiquiatra__isnull=False)
        elif tipo == 'psicologo':
            agendamentos = Agendamento.objects.filter(psicologo__isnull=False)
        else:
            agendamentos = Agendamento.objects.all()
    else:
        agendamentos = Agendamento.objects.filter(usuario=usuario)
    data = []
    for ag in agendamentos:
        paciente = ag.usuario
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
        from django.utils.timezone import localtime
        data_hora_local = localtime(ag.data_hora) if ag.data_hora else None
        # Sempre incluir os campos de valor, independente do tipo de usuário
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
            'profissional': profissional_dict,
            'data_iso': data_hora_local.isoformat() if data_hora_local else '',
            'data': data_hora_local.strftime('%Y-%m-%d') if data_hora_local else '',
            'hora': data_hora_local.strftime('%H:%M') if data_hora_local else '',
            'status': ag.status,
            'observacao': ag.observacoes or '',
            'link_consulta': ag.link_consulta or '',
            'valor_pago_profissional': float(ag.valor_recebido_profissional) if ag.valor_recebido_profissional is not None else 0.0,
            'valor_plataforma': float(ag.valor_plataforma) if ag.valor_plataforma is not None else 0.0,
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


@api_view(['GET'])
def horarios_ocupados(request):
    profissional_id = request.GET.get('profissional_id')
    tipo = request.GET.get('tipo')
    data_str = request.GET.get('data')
    if not profissional_id or not tipo or not data_str:
        return Response({'error': 'profissional_id, tipo e data são obrigatórios.'}, status=400)
    try:
        data = parse_date(data_str)
        if not data:
            raise ValueError
    except Exception:
        return Response({'error': 'Data inválida.'}, status=400)
    from .models import Agendamento, Usuario
    from datetime import timedelta
    profissional = Usuario.objects.filter(id=profissional_id, role__iexact=tipo.capitalize()).first()
    if not profissional:
        return Response({'error': 'Profissional não encontrado.'}, status=404)
    # Busca agendamentos confirmados ou pendentes para o dia
    if tipo == 'psiquiatra':
        ags = Agendamento.objects.filter(psiquiatra=profissional, data_hora__date=data, status__in=['pendente', 'confirmado', 'paga'])
    else:
        ags = Agendamento.objects.filter(psicologo=profissional, data_hora__date=data, status__in=['pendente', 'confirmado', 'paga'])

    horarios_ocupados = set()
    intervalo = timedelta(minutes=30)
    for ag in ags:
        inicio = ag.data_hora
        fim = inicio + intervalo
        atual = inicio
        while atual < fim:
            horarios_ocupados.add(atual.strftime('%H:%M'))
            atual += intervalo

    horarios = sorted(horarios_ocupados)
    return Response(horarios)

@csrf_exempt
def upload_foto_usuario(request, id):
    """
    Endpoint dedicado para upload de foto de perfil via POST (multipart/form-data).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    usuario = get_object_or_404(Usuario, id=id)
    foto = request.FILES.get('foto')
    if not foto:
        return JsonResponse({'error': 'Nenhuma foto enviada.'}, status=400)
    # Remove a foto antiga se existir
    if usuario.foto and hasattr(usuario.foto, 'path') and os.path.isfile(usuario.foto.path):
        try:
            os.remove(usuario.foto.path)
        except Exception:
            pass
    usuario.foto = foto
    usuario.save()
    usuario.refresh_from_db()
    serializer = UsuarioComEnderecoSerializer(usuario)
    return JsonResponse(serializer.data, status=200)



# ViewSet para Prontuário: permite listar, visualizar e editar prontuários


# Listar prontuários conforme o papel do usuário autenticado (padrão das outras views)

@api_view(['GET'])
def listar_prontuarios(request):
    # Busca o usuário logado via JWT manualmente
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

    if usuario.role == 'Psiquiatra':
        prontuarios = Prontuario.objects.filter(agendamento__psiquiatra=usuario)
    elif usuario.role == 'Psicologo':
        prontuarios = Prontuario.objects.filter(agendamento__psicologo=usuario)
    elif usuario.role == 'Admin':
        prontuarios = Prontuario.objects.all()
    else:
        prontuarios = Prontuario.objects.none()

    serializer = ProntuarioSerializer(prontuarios, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(['GET', 'PATCH'])
def prontuario_detalhe_editar(request, id):
    # Autenticação manual via JWT (igual padrão)
    token = request.COOKIES.get('jwt')
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            possible_token = auth_header.replace('Bearer ', '').strip()
            if possible_token and possible_token.lower() != 'null':
                token = possible_token
    if not token or token.lower() == 'null':
        return Response({'error': 'Não autenticado.'}, status=401)
    try:
        import jwt
        from django.conf import settings
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        usuario = Usuario.objects.get(id=user_id)
    except Exception:
        return Response({'error': 'Usuário não autenticado.'}, status=401)

    # Busca o prontuário
    try:
        prontuario = Prontuario.objects.get(id=id)
    except Prontuario.DoesNotExist:
        return Response({'error': 'Prontuário não encontrado.'}, status=404)

    # Só psiquiatra do agendamento ou admin pode editar/ver
    if usuario.role == 'Psiquiatra' and prontuario.agendamento.psiquiatra_id != usuario.id:
        return Response({'error': 'Sem permissão para acessar este prontuário.'}, status=403)
    if usuario.role == 'Psicologo' and prontuario.agendamento.psicologo_id != usuario.id:
        return Response({'error': 'Sem permissão para acessar este prontuário.'}, status=403)
    if usuario.role not in ['Psiquiatra', 'Admin', 'Psicologo']:
        return Response({'error': 'Sem permissão.'}, status=403)

    if request.method == 'GET':
        # Serializa com dados do paciente e agendamento
        data = {
            'id': prontuario.id,
            'texto': prontuario.texto,
            'data_criacao': prontuario.data_criacao,
            'data_atualizacao': prontuario.data_atualizacao,
            'paciente': {
                'id': prontuario.agendamento.usuario.id,
                'nome': prontuario.agendamento.usuario.nome,
                'email': prontuario.agendamento.usuario.email,
                'telefone': prontuario.agendamento.usuario.telefone,
                'cpf': prontuario.agendamento.usuario.cpf,
                'status': prontuario.agendamento.usuario.status,
                'role': prontuario.agendamento.usuario.role,
            },
            'agendamento': {
                'id': prontuario.agendamento.id,
                'data_hora': prontuario.agendamento.data_hora,
                'status': prontuario.agendamento.status,
                'link_consulta': prontuario.agendamento.link_consulta,
                'observacoes': prontuario.agendamento.observacoes,
                'data_criacao': prontuario.agendamento.data_criacao,
            }
        }
        return Response(data)

    if request.method == 'PATCH':
        # Só psiquiatra do agendamento pode editar
        if usuario.role != 'Psiquiatra' or prontuario.agendamento.psiquiatra_id != usuario.id:
            return Response({'error': 'Apenas o psiquiatra responsável pode editar.'}, status=403)
        try:
            body = request.data
            novo_texto = body.get('texto', '').strip()
            if not novo_texto:
                return Response({'error': 'O texto do prontuário não pode ser vazio.'}, status=400)
            prontuario.texto = novo_texto
            prontuario.save()
            return Response({'success': 'Prontuário atualizado com sucesso.'})
        except Exception as e:
            return Response({'error': f'Erro ao atualizar prontuário: {str(e)}'}, status=400)
        
@csrf_exempt
def stripe_webhook(request):
    
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
    event = None
    try:
        if endpoint_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            event = json.loads(payload)
    except Exception as e:
        return JsonResponse({'error': f'Webhook error: {str(e)}'}, status=400)

    # Processa eventos relevantes
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        pass

    return JsonResponse({'status': 'success'})

@csrf_exempt
@api_view(['POST'])
def criar_stripe_connect_account(request, id=None):
    """
    Cria uma conta Stripe Connect para o profissional e retorna o link de onboarding.
    O usuário deve estar autenticado e ser profissional (Psiquiatra ou Psicologo).
    Agora também checa se a capability 'transfers' está habilitada.
    """
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
    if usuario.role not in ['Psiquiatra', 'Psicologo']:
        return Response({'error': 'Apenas profissionais podem criar conta Stripe Connect.'}, status=403)
    # Se já tem conta Stripe, retorna status detalhado
    if usuario.stripe_account_id:
        try:
            account = stripe.Account.retrieve(usuario.stripe_account_id)
            transfers_status = account.get('capabilities', {}).get('transfers')
            details_submitted = account.get('details_submitted', False)
            if transfers_status == 'active':
                return Response({
                    'message': 'Conta Stripe Connect pronta para receber pagamentos.',
                    'stripe_account_id': usuario.stripe_account_id,
                    'transfers_enabled': True,
                    'url': None
                })
            else:
                # Sempre gera link de onboarding se transfers não está ativa
                account_link = stripe.AccountLink.create(
                    account=usuario.stripe_account_id,
                    refresh_url='https://localhost:3000/meu_perfil_psiquiatra',
                    return_url='https://localhost:3000/meu_perfil_psiquiatra',
                    type='account_onboarding',
                )
                msg = 'Sua conta Stripe está vinculada, mas ainda não está pronta para receber pagamentos. Finalize o onboarding no Stripe para liberar os pagamentos.'
                return Response({
                    'message': msg,
                    'stripe_account_id': usuario.stripe_account_id,
                    'transfers_enabled': False,
                    'url': account_link.url
                })
        except Exception as e:
            return Response({'error': f'Erro ao consultar conta Stripe: {str(e)}'}, status=400)
    # Cria conta Stripe Connect se não existir
    if not usuario.stripe_account_id:
        account = stripe.Account.create(
            type='express',
            country='BR',
            email=usuario.email,
            capabilities={
                'transfers': {'requested': True},
                'card_payments': {'requested': True},
            },
            business_type='individual',
        )
        usuario.stripe_account_id = account['id']
        usuario.stripe_email = usuario.email
        usuario.save()
    # Gera link de onboarding
    account_link = stripe.AccountLink.create(
        account=usuario.stripe_account_id,
        refresh_url='https://localhost:3000/meu_perfil_psiquiatra',
        return_url='https://localhost:3000/meu_perfil_psiquiatra',
        type='account_onboarding',
    )
    return Response({'url': account_link.url, 'stripe_account_id': usuario.stripe_account_id, 'transfers_enabled': False})

@csrf_exempt
@api_view(['GET'])
def status_connect_account(request, id=None):
    """
    Retorna o status da conta Stripe Connect do profissional autenticado.
    Se transfers não estiver ativo, retorna o link de onboarding.
    """
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
    if usuario.role not in ['Psiquiatra', 'Psicologo']:
        return Response({'error': 'Apenas profissionais podem consultar status Stripe Connect.'}, status=403)
    if not usuario.stripe_account_id:
        return Response({
            'stripe_account_id': None,
            'transfers_enabled': False,
            'url': None
        })
    try:
        account = stripe.Account.retrieve(usuario.stripe_account_id)
        transfers_status = account.get('capabilities', {}).get('transfers')
        if transfers_status == 'active':
            return Response({
                'stripe_account_id': usuario.stripe_account_id,
                'transfers_enabled': True,
                'url': None
            })
        else:
            account_link = stripe.AccountLink.create(
                account=usuario.stripe_account_id,
                refresh_url='https://localhost:3000/meu_perfil_psiquiatra',
                return_url='https://localhost:3000/meu_perfil_psiquiatra',
                type='account_onboarding',
            )
            return Response({
                'stripe_account_id': usuario.stripe_account_id,
                'transfers_enabled': False,
                'url': account_link.url
            })
    except Exception as e:
        return Response({'error': f'Erro ao consultar conta Stripe: {str(e)}'}, status=400)
    
@csrf_exempt
@api_view(["POST"])
def estornar_pagamento_stripe(request, agendamento_id):
    """
    Realiza o estorno (refund) do pagamento Stripe referente ao agendamento.
    """
    try:
        from .models import Agendamento
        agendamento = Agendamento.objects.get(id=agendamento_id)
        if not agendamento.stripe_session_id:
            return JsonResponse({"error": "Agendamento não possui session_id Stripe."}, status=400)
        session = stripe.checkout.Session.retrieve(agendamento.stripe_session_id)
        payment_intent = session.get("payment_intent")
        if not payment_intent:
            return JsonResponse({"error": "Session Stripe sem payment_intent."}, status=400)
        refund = stripe.Refund.create(payment_intent=payment_intent)
        agendamento.status = "cancelado"
        agendamento.save()

        # Envia e-mail ao paciente informando o estorno
        paciente = agendamento.usuario
        email = paciente.email
        profissional = agendamento.psiquiatra or agendamento.psicologo
        profissional_nome = profissional.nome if profissional else "Profissional"
        data_hora = agendamento.data_hora.strftime('%d/%m/%Y %H:%M') if agendamento.data_hora else "-"
        subject = 'Estorno de pagamento - Desabafe'
        text_content = f"Olá,\n\nSeu pagamento referente à consulta com {profissional_nome} em {data_hora} foi estornado com sucesso.\n\nSe tiver dúvidas, entre em contato com o suporte.\n\nEquipe Desabafe."
        html_content = f"""
            <div style='font-family: Arial, sans-serif; color: #222;'>
            <h2>Estorno de Pagamento</h2>
            <p>Olá,</p>
            <p>Seu pagamento referente à consulta com <b>{profissional_nome}</b> em <b>{data_hora}</b> foi <span style='color:#e53e3e;font-weight:bold;'>estornado</span> com sucesso.</p>
            <p>O valor será devolvido ao seu método de pagamento em breve.</p>
            <p style='font-size: 0.9em; color: #888;'>Se tiver dúvidas, entre em contato com o suporte.</p>
            <hr style='margin: 24px 0;'>
            <p style='font-size: 0.8em; color: #aaa;'>Desabafe - Equipe de Suporte</p>
            </div>
        """
        msg = EmailMultiAlternatives(subject, text_content, 'suportedesabafe@gmail.com', [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=True)

        return JsonResponse({"success": True, "refund_id": refund.id})
    except Agendamento.DoesNotExist:
        return JsonResponse({"error": "Agendamento não encontrado."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)