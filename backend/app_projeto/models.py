from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import os
from django.db.models.signals import post_save
from django.dispatch import receiver

# Modelo de Prontuário: cada consulta tem UM prontuário
class Prontuario(models.Model):
    agendamento = models.OneToOneField('Agendamento', on_delete=models.CASCADE, related_name='prontuario')
    texto = models.TextField(blank=True, null=True)  # O texto do prontuário pode começar vazio (privado)
    mensagem_paciente = models.TextField(blank=True, null=True)  # Mensagem visível ao paciente
    atestado_pdf = models.FileField(upload_to='prontuarios/atestados/', blank=True, null=True)
    receita_pdf = models.FileField(upload_to='prontuarios/receitas/', blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Prontuário de {self.agendamento.usuario.nome} ({self.agendamento.data_hora.date()})'



@receiver(post_save, sender='app_projeto.agendamento')
def criar_prontuario_automatico(sender, instance, created, **kwargs):
    if created:
        from .models import Prontuario
        Prontuario.objects.create(agendamento=instance)



def user_foto_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('usuarios_fotos', filename)


class Usuario(models.Model):
    @property
    def password(self):
        return self.senha

    @password.setter
    def password(self, value):
        self.senha = value
    def get_username(self):
        return self.email
    def get_email_field_name(self):
        return "email"
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=15, blank=True, null=True)
    cpf = models.CharField(max_length=14, unique=True)
    senha = models.CharField(max_length=255)
    status = models.CharField(max_length=10, default='ativo')
    last_login = models.DateTimeField(blank=True, null=True)  # Necessário para reset de senha
    
    role = models.CharField(
        max_length=10, 
        choices=[
            ('Paciente', 'Paciente'), 
            ('Psiquiatra', 'Psiquiatra'), 
            ('Psicologo', 'Psicólogo'),
            ('Admin', 'Admin')  # Adiciona o papel de Admin
        ], 
        default='Paciente'
    )
    crm = models.CharField(max_length=20, blank=True, null=True)  # Apenas para psiquiatras
    crp = models.CharField(max_length=20, blank=True, null=True)  # Apenas para psicólogos
    especialidade = models.CharField(max_length=50, blank=True, null=True)  # Campo para especialidade, agora opcional
    valor_consulta = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # Valor da consulta
    foto = models.ImageField(upload_to=user_foto_upload_path, blank=True, null=True)  # Foto do profissional
    stripe_email = models.EmailField(blank=True, null=True, help_text='E-mail da conta Stripe do profissional')
    stripe_account_id = models.CharField(max_length=255, blank=True, null=True, help_text='ID da conta Stripe Connect')
    # Mercado Pago
    # mp_user_id = models.CharField(max_length=255, blank=True, null=True, help_text='ID da conta Mercado Pago Connect')
    # mp_access_token = models.CharField(max_length=255, blank=True, null=True, help_text='Access Token Mercado Pago')

    def clean(self):
        # Validações personalizadas
        if self.role == 'Psiquiatra' and not self.crm:
            raise ValidationError('O CRM é obrigatório para psiquiatras.')
        if self.role == 'Psicologo' and not self.crp:
            raise ValidationError('O CRP é obrigatório para psicólogos.')
        # Não é necessário validar CRM ou CRP para 'Admin' ou 'Paciente'
        super().clean()

    def __str__(self):
        return self.nome


class Agendamento(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('paga', 'Consulta paga'),
        ('confirmado', 'Confirmado'),
        ('Concluida', 'Concluída'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_paciente')
    psiquiatra = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_psiquiatra', blank=True, null=True)
    psicologo = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_psicologo', blank=True, null=True)  # NOVO CAMPO
    data_hora = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    link_consulta = models.URLField(max_length=255, blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)


    # Novos campos para split de pagamento
    valor_recebido_profissional = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Valor recebido pelo profissional (R$)")
    valor_plataforma = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Valor recebido pela plataforma (R$)")
    data_criacao = models.DateTimeField(auto_now_add=True)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID da sessão Stripe para refund")


    def __str__(self):
        return f"{self.usuario.nome} com {self.psiquiatra.nome if self.psiquiatra else ''}{' / ' + self.psicologo.nome if self.psicologo else ''} - {self.data_hora}"


class AgendamentoHistorico(models.Model):
    agendamento = models.ForeignKey(Agendamento, on_delete=models.CASCADE)
    status_anterior = models.CharField(max_length=20, choices=Agendamento.STATUS_CHOICES)
    data_status = models.DateTimeField(auto_now_add=True)


class Endereco(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='enderecos')
    logradouro = models.CharField(max_length=255)
    numero = models.CharField(max_length=50)
    complemento = models.CharField(max_length=255, blank=True, null=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=100)
    cep = models.CharField(max_length=10)
    tipo = models.CharField(max_length=20, choices=[('residencial', 'Residencial'), ('comercial', 'Comercial'), ('consultorio', 'Consultório')])
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.logradouro}, {self.numero} - {self.cidade}/{self.estado} ({self.tipo})"


class HorarioTrabalho(models.Model):
    DIAS_SEMANA = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    profissional = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='horarios_trabalho',
        limit_choices_to={'role__in': ['Psiquiatra', 'Psicologo']}
    )
    dia_semana = models.IntegerField(choices=DIAS_SEMANA)
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['profissional', 'dia_semana', 'horario_inicio', 'horario_fim']
        ordering = ['profissional', 'dia_semana', 'horario_inicio']

    def clean(self):
        if self.horario_inicio >= self.horario_fim:
            raise ValidationError('Horário de início deve ser anterior ao horário de fim.')
        
        # Verifica se o profissional tem role correto
        if self.profissional.role not in ['Psiquiatra', 'Psicologo']:
            raise ValidationError('Apenas psiquiatras e psicólogos podem cadastrar horários de trabalho.')

    def __str__(self):
        dia_nome = dict(self.DIAS_SEMANA)[self.dia_semana]
        return f"{self.profissional.nome} - {dia_nome} ({self.horario_inicio} às {self.horario_fim})"


class Avaliacao(models.Model):
    TIPO_AVALIADOR_CHOICES = [
        ('paciente', 'Paciente'),
        ('profissional', 'Profissional'),
    ]
    
    agendamento = models.ForeignKey(Agendamento, on_delete=models.CASCADE, related_name='avaliacoes')
    avaliador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='avaliacoes_feitas')
    tipo_avaliador = models.CharField(max_length=20, choices=TIPO_AVALIADOR_CHOICES)
    nota = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Nota de 1 a 5 estrelas"
    )
    comentario = models.TextField(blank=True, null=True, max_length=500)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['agendamento', 'avaliador', 'tipo_avaliador']
        ordering = ['-data_criacao']

    def clean(self):
        # Verifica se o avaliador está relacionado ao agendamento
        if self.tipo_avaliador == 'paciente' and self.avaliador != self.agendamento.usuario:
            raise ValidationError('Apenas o paciente da consulta pode fazer avaliação como paciente.')
        elif self.tipo_avaliador == 'profissional' and self.avaliador not in [self.agendamento.psiquiatra, self.agendamento.psicologo]:
            raise ValidationError('Apenas o profissional da consulta pode fazer avaliação como profissional.')
        
        # Verifica se a consulta já foi realizada
        if self.agendamento.status != 'Concluida':
            raise ValidationError('Só é possível avaliar consultas concluídas.')

    def __str__(self):
        return f"Avaliação {self.nota}★ - {self.tipo_avaliador} - {self.agendamento}"