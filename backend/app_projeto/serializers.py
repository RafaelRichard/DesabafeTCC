# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario, Agendamento, AgendamentoHistorico, Endereco, Prontuario, HorarioTrabalho, Avaliacao

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.SerializerMethodField()

    def get_foto(self, obj):
        if obj.foto:
            # Retorna o path relativo a partir de 'usuarios_fotos/'
            path = obj.foto.name
            idx = path.find('usuarios_fotos/')
            if idx != -1:
                return f"media/{path[idx:]}"
            return f"media/{path.lstrip('/')}"
        return None

    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp',
            'especialidade', 'valor_consulta', 'foto',
            'stripe_account_id', 'stripe_email',
        ]

class UsuarioDetailSerializer(UsuarioSerializer):
    # Caso queira retornar dados mais detalhados do usuário (ex. senha ou informações sensíveis)
    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp',
            'especialidade', 'valor_consulta', 'foto', 'senha',
            'stripe_account_id', 'stripe_email',
        ]


class AgendamentoSerializer(serializers.ModelSerializer):
    # Adicionando os campos de nome do psiquiatra, psicólogo e paciente
    usuario_nome = serializers.CharField(source='usuario.nome', read_only=True)
    psiquiatra_nome = serializers.CharField(source='psiquiatra.nome', read_only=True)
    psicologo_nome = serializers.CharField(source='psicologo.nome', read_only=True)
    
    # CORREÇÃO: Incluir data_hora formatada corretamente com timezone
    data_hora_local = serializers.SerializerMethodField()

    def get_data_hora_local(self, obj):
        """Retorna data_hora convertida para timezone local"""
        if obj.data_hora:
            from django.utils.timezone import localtime
            return localtime(obj.data_hora).isoformat()
        return None

    class Meta:
        model = Agendamento
        fields = [
            'id', 'data_hora', 'data_hora_local', 'status', 'link_consulta', 'observacoes', 'data_criacao',
            'usuario', 'usuario_nome', 'psiquiatra', 'psiquiatra_nome', 'psicologo', 'psicologo_nome',
            'valor_recebido_profissional', 'valor_plataforma'
        ]

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
    foto = serializers.SerializerMethodField()

    def get_foto(self, obj):
        if obj.foto:
            # Retorna o path relativo a partir de 'usuarios_fotos/'
            path = obj.foto.name
            idx = path.find('usuarios_fotos/')
            if idx != -1:
                return f"media/{path[idx:]}"
            return f"media/{path.lstrip('/')}"
        return None

    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'telefone', 'cpf', 'status', 'role', 'crm', 'crp',
            'especialidade', 'valor_consulta', 'foto', 'enderecos',
            'stripe_account_id', 'stripe_email',
        ]

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
        # Verifica se o usuário está inativo
        if hasattr(self.user, 'status') and self.user.status == 'inativo':
            raise serializers.ValidationError('Usuário inativo. O acesso não é permitido.')
        # Adiciona também no response (opcional)
        data.update({
            "user_id": self.user.id,
            "name": self.user.nome,
            "email": self.user.email,
            "role": self.user.role,
        })
        return data

# Serializer para o Prontuário, incluindo dados completos da consulta e do paciente
class ProntuarioSerializer(serializers.ModelSerializer):
    agendamento = AgendamentoSerializer()  # Consulta completa
    paciente = UsuarioSerializer(source='agendamento.usuario')  # Paciente completo
    atestado_pdf_url = serializers.SerializerMethodField()
    receita_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Prontuario
        fields = ['id', 'agendamento', 'paciente', 'texto', 'mensagem_paciente', 'atestado_pdf', 'receita_pdf', 'atestado_pdf_url', 'receita_pdf_url', 'data_criacao', 'data_atualizacao']

    def get_atestado_pdf_url(self, obj):
        if obj.atestado_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.atestado_pdf.url)
        return None

    def get_receita_pdf_url(self, obj):
        if obj.receita_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receita_pdf.url)
        return None


class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    dia_semana_nome = serializers.SerializerMethodField()
    profissional_nome = serializers.CharField(source='profissional.nome', read_only=True)

    class Meta:
        model = HorarioTrabalho
        fields = [
            'id', 'profissional', 'profissional_nome', 'dia_semana', 'dia_semana_nome',
            'horario_inicio', 'horario_fim', 'ativo', 'data_criacao', 'data_atualizacao'
        ]

    def get_dia_semana_nome(self, obj):
        dias = {
            0: 'Segunda-feira',
            1: 'Terça-feira', 
            2: 'Quarta-feira',
            3: 'Quinta-feira',
            4: 'Sexta-feira',
            5: 'Sábado',
            6: 'Domingo'
        }
        return dias.get(obj.dia_semana, '')

    def validate(self, data):
        # Validação para garantir que horário de início seja antes do fim
        if data['horario_inicio'] >= data['horario_fim']:
            raise serializers.ValidationError("Horário de início deve ser anterior ao horário de fim.")
        
        # Validação para garantir que apenas profissionais podem cadastrar horários
        if 'profissional' in data and data['profissional'].role not in ['Psiquiatra', 'Psicologo']:
            raise serializers.ValidationError("Apenas psiquiatras e psicólogos podem cadastrar horários de trabalho.")
        
        return data


class AvaliacaoSerializer(serializers.ModelSerializer):
    avaliador_nome = serializers.CharField(source='avaliador.nome', read_only=True)
    paciente_nome = serializers.CharField(source='agendamento.usuario.nome', read_only=True)
    profissional_nome = serializers.SerializerMethodField(read_only=True)
    data_consulta = serializers.DateTimeField(source='agendamento.data_hora', read_only=True)
    tipo_avaliador_display = serializers.CharField(source='get_tipo_avaliador_display', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'agendamento', 'avaliador', 'avaliador_nome', 'tipo_avaliador', 'tipo_avaliador_display',
            'nota', 'comentario', 'data_criacao', 'data_atualizacao',
            'paciente_nome', 'profissional_nome', 'data_consulta'
        ]
        read_only_fields = ['data_criacao', 'data_atualizacao', 'avaliador']

    def get_profissional_nome(self, obj):
        # Retorna o nome do profissional (psiquiatra ou psicólogo) da consulta
        if obj.agendamento.psiquiatra:
            return obj.agendamento.psiquiatra.nome
        elif obj.agendamento.psicologo:
            return obj.agendamento.psicologo.nome
        return None

    def validate(self, data):
        print(f"DEBUG: Validando dados: {data}")
        
        # Pega o usuário atual do contexto da requisição
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            agendamento = data.get('agendamento')
            tipo_avaliador = data.get('tipo_avaliador')
            
            print(f"DEBUG: Usuário: {user.nome} (ID: {user.id})")
            print(f"DEBUG: Agendamento: {agendamento.id if agendamento else 'None'}")
            print(f"DEBUG: Tipo avaliador: {tipo_avaliador}")
            
            if agendamento:
                print(f"DEBUG: Status da consulta: {agendamento.status}")
                print(f"DEBUG: Paciente: {agendamento.usuario.nome if agendamento.usuario else 'None'}")
                print(f"DEBUG: Psiquiatra: {agendamento.psiquiatra.nome if agendamento.psiquiatra else 'None'}")
                print(f"DEBUG: Psicólogo: {agendamento.psicologo.nome if agendamento.psicologo else 'None'}")
            
            # Verifica se o usuário pode fazer esta avaliação
            if tipo_avaliador == 'paciente' and user != agendamento.usuario:
                print(f"DEBUG: Erro - usuário {user.nome} não é o paciente {agendamento.usuario.nome}")
                raise serializers.ValidationError("Apenas o paciente da consulta pode fazer avaliação como paciente.")
            elif tipo_avaliador == 'profissional' and user not in [agendamento.psiquiatra, agendamento.psicologo]:
                print(f"DEBUG: Erro - usuário {user.nome} não é o profissional da consulta")
                raise serializers.ValidationError("Apenas o profissional da consulta pode fazer avaliação como profissional.")
            
            # Verifica se a consulta foi concluída
            if agendamento.status != 'Concluida':
                print(f"DEBUG: Erro - consulta não está concluída, status: {agendamento.status}")
                raise serializers.ValidationError("Só é possível avaliar consultas concluídas.")
                
            print(f"DEBUG: Validação passou")
        
        return data

    def create(self, validated_data):
        # Define o avaliador baseado no usuário autenticado
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['avaliador'] = request.user
            print(f"DEBUG: Criando avaliação com avaliador: {request.user.nome}")
        
        return super().create(validated_data)


class AvaliacaoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de avaliações de um profissional"""
    avaliador_nome = serializers.CharField(source='avaliador.nome', read_only=True)
    data_consulta = serializers.DateTimeField(source='agendamento.data_hora', read_only=True)

    class Meta:
        model = Avaliacao
        fields = ['id', 'nota', 'comentario', 'data_criacao', 'avaliador_nome', 'data_consulta']