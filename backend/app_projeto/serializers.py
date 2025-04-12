# serializers.py
from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp']

class UsuarioDetailSerializer(UsuarioSerializer):
    # Caso queira retornar dados mais detalhados do usuário (ex. senha ou informações sensíveis)
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp', 'senha']
