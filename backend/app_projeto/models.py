from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
import os


def user_foto_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('usuarios_fotos', filename)


class Usuario(models.Model):
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=15, blank=True, null=True)
    cpf = models.CharField(max_length=14, unique=True)
    senha = models.CharField(max_length=255)
    status = models.CharField(max_length=10, default='ativo')
    
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
    # stripe_email = models.EmailField(blank=True, null=True, help_text='E-mail da conta Stripe do profissional')
    # stripe_account_id = models.CharField(max_length=255, blank=True, null=True, help_text='ID da conta Stripe Connect')
    # Mercado Pago
    mp_user_id = models.CharField(max_length=255, blank=True, null=True, help_text='ID da conta Mercado Pago Connect')
    mp_access_token = models.CharField(max_length=255, blank=True, null=True, help_text='Access Token Mercado Pago')

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
        ('confirmado', 'Confirmado'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_paciente')
    psiquiatra = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_psiquiatra', blank=True, null=True)
    psicologo = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='agendamentos_psicologo', blank=True, null=True)  # NOVO CAMPO
    data_hora = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    link_consulta = models.URLField(max_length=255, blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

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