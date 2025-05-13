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

from app_projeto.views import cadastrar_usuario, get_csrf_token, login_usuario, rota_protegida, logout
from app_projeto.views import listar_usuarios , editar_usuario, excluir_usuario, listar_psiquiatras, listar_psiquiatras_id
from app_projeto.views import google_login_view, MyTokenObtainPairView, usuario_autenticado
from app_projeto.views import listar_agendamentos, criar_agendamento, atualizar_agendamento


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
    
    #Recuperar senha
    # path('recuperar-senha/', RecuperarSenhaAPIView.as_view(), name='recuperar-senha'),
    # path('redefinir-senha/<uidb64>/<token>/', RedefinirSenhaAPIView.as_view(), name='redefinir-senha'),

    
    
    # listagem de psiquiatras
    path('api/psiquiatras/', listar_psiquiatras, name='listar_psiquiatras'),
    path('api/psiquiatras/<int:id>/', listar_psiquiatras_id, name='listar_psiquiatras_id'),

    #AGENDAMENTO

    path('api/agendamentos/', listar_agendamentos, name='listar_agendamentos'),
    path('api/agendamentos/criar/', criar_agendamento, name='criar_agendamento'),
    path('api/agendamentos/<int:id>/atualizar/', atualizar_agendamento, name='atualizar_agendamento'),

]
