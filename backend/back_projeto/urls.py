"""
URL configuration for back_projeto project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from app_projeto.views import (
    cadastrar_usuario, get_csrf_token, login_usuario, rota_protegida, logout,
    listar_usuarios, editar_usuario, excluir_usuario, listar_psiquiatras, listar_psiquiatras_id,
    google_login_view, MyTokenObtainPairView, usuario_autenticado,
    listar_agendamentos, criar_agendamento, atualizar_agendamento, enderecos_usuario,
    detalhar_usuario, listar_psicologos,
    iniciar_oauth_mercadopago, oauth_callback_mercadopago, criar_pagamento_mercadopago,
    listar_agendamentos_profissional, listar_agendamentos_paciente, deletar_agendamento,
    detalhar_agendamento, horarios_ocupados, upload_foto_usuario
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('cadastrar_usuario/', cadastrar_usuario, name='cadastrar_usuario'),
    path('login_usuario/', login_usuario, name='login_usuario'),
    path('logout/', logout, name='logout'),
    path('usuario_jwt/', usuario_autenticado),
    path("api/protegida/", rota_protegida, name="rota_protegida"),
    path("get-csrf-token/", get_csrf_token, name="get-csrf-token"),
    path("api/auth/google/", google_login_view, name="google_login"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('csrf/', get_csrf_token, name='csrf_token'),

    path('api/users/', listar_usuarios, name='listar_usuarios'),
    path('api/users/<int:id>/', editar_usuario, name='editar_usuario'),
    path('api/users/<int:id>/delete/', excluir_usuario, name='excluir_usuario'),
    path('api/users/<int:id>/upload_foto/', upload_foto_usuario, name='upload_foto_usuario'),

    # listagem de psiquiatras
    path('api/psiquiatras/', listar_psiquiatras, name='listar_psiquiatras'),
    path('api/psiquiatras/<int:id>/', listar_psiquiatras_id, name='listar_psiquiatras_id'),
    # listagem de psicologos
    path('api/psicologos/', listar_psicologos, name='listar_psicologos'),
    path('api/psicologos/<int:id>/', listar_psicologos, name='listar_psicologos_id'),

    # AGENDAMENTO
    path('api/agendamentos/', listar_agendamentos, name='listar_agendamentos'),
    path('api/agendamentos/criar/', criar_agendamento, name='criar_agendamento'),
    path('api/agendamentos/<int:id>/atualizar/', atualizar_agendamento, name='atualizar_agendamento'),
    path('api/agendamentos/<int:id>/deletar/', deletar_agendamento, name='deletar_agendamento'),
    path('api/agendamentos_profissional/', listar_agendamentos_profissional, name='listar_agendamentos_profissional'),
    path('api/agendamentos_paciente/', listar_agendamentos_paciente, name='listar_agendamentos_paciente'),
    path('api/agendamentos/<int:id>/', detalhar_agendamento, name='detalhar_agendamento'),

    path('api/enderecos_usuario/<int:usuario_id>/', enderecos_usuario, name='enderecos_usuario'),

    path('api/perfil/<int:id>/', detalhar_usuario, name='detalhar_usuario'),

    # MERCADO PAGO
    path('api/mercadopago/oauth/', iniciar_oauth_mercadopago, name='iniciar_oauth_mercadopago'),
    path('api/mercadopago/oauth/callback/', oauth_callback_mercadopago, name='oauth_callback_mercadopago'),
    path('api/mercadopago/pagamento/', criar_pagamento_mercadopago, name='criar_pagamento_mercadopago'),

    # HORÁRIOS OCUPADOS
    path('api/horarios_ocupados/', horarios_ocupados, name='horarios_ocupados'),

    # (Removido endpoint de criar_sala_daily, agora o link é gerado direto no agendamento)
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)