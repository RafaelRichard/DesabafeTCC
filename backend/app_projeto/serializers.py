# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario, Agendamento, AgendamentoHistorico, Endereco
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.SerializerMethodField()

    def get_foto(self, obj):
        if obj.foto:
            return obj.foto.name  # sempre retorna o caminho relativo
        return None

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp', 'especialidade', 'valor_consulta', 'foto', 'mp_user_id', 'mp_access_token']

class UsuarioDetailSerializer(UsuarioSerializer):
    # Caso queira retornar dados mais detalhados do usuário (ex. senha ou informações sensíveis)
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp', 'especialidade', 'valor_consulta', 'foto', 'senha', 'mp_user_id', 'mp_access_token']


class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'

class AgendamentoHistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgendamentoHistorico
        fields = '__all__'

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class UsuarioComEnderecoSerializer(serializers.ModelSerializer):
    enderecos = EnderecoSerializer(many=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp', 'especialidade', 'valor_consulta', 'foto', 'enderecos', 'mp_user_id', 'mp_access_token']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Adiciona claims extras ao payload do JWT
        token['email'] = user.email
        token['role'] = user.role
        token['nome'] = user.nome
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Adiciona também no response (opcional)
        data.update({
            "user_id": self.user.id,
            "name": self.user.nome,
            "email": self.user.email,
            "role": self.user.role,
        })
        return data