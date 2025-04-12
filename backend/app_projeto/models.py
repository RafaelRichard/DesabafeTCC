from django.db import models
from django.core.exceptions import ValidationError

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
    crm = models.CharField(max_length=20, blank=True, null=True)  
    crp = models.CharField(max_length=20, blank=True, null=True)  

    def clean(self):
        if self.role == 'Psiquiatra' and not self.crm:
            raise ValidationError('O CRM é obrigatório para psiquiatras.')
        if self.role == 'Psicologo' and not self.crp:
            raise ValidationError('O CRP é obrigatório para psicólogos.')
        # Não é necessário validar CRM ou CRP para 'Admin'
        super().clean()

    def __str__(self):
        return self.nome
