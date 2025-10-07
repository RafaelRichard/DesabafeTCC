#!/usr/bin/env python
"""
Script para criar avaliações de teste no sistema
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back_projeto.settings')
django.setup()

from app_projeto.models import Agendamento, Avaliacao, Usuario

def criar_avaliacoes_teste():
    print("=== CRIANDO AVALIAÇÕES DE TESTE ===")
    
    # Buscar o agendamento concluído
    agendamento_concluido = Agendamento.objects.filter(status='Concluida').first()
    
    if not agendamento_concluido:
        print("❌ Nenhum agendamento concluído encontrado!")
        return
    
    print(f"✅ Agendamento encontrado: ID {agendamento_concluido.id}")
    print(f"   Paciente: {agendamento_concluido.usuario.nome}")
    
    profissional = agendamento_concluido.psiquiatra or agendamento_concluido.psicologo
    if profissional:
        print(f"   Profissional: {profissional.nome} ({profissional.role})")
    
    # Verificar se já existem avaliações
    avaliacoes_existentes = Avaliacao.objects.filter(agendamento=agendamento_concluido)
    if avaliacoes_existentes.exists():
        print(f"⚠️  Já existem {avaliacoes_existentes.count()} avaliações para este agendamento")
        for av in avaliacoes_existentes:
            print(f"   - {av.tipo_avaliador}: {av.nota}★ por {av.avaliador.nome}")
        return
    
    # Criar avaliação do paciente
    try:
        avaliacao_paciente = Avaliacao.objects.create(
            agendamento=agendamento_concluido,
            avaliador=agendamento_concluido.usuario,
            tipo_avaliador='paciente',
            nota=5,
            comentario='Excelente atendimento! O profissional foi muito atencioso e me ajudou muito.'
        )
        print(f"✅ Avaliação do paciente criada: {avaliacao_paciente.nota}★")
    except Exception as e:
        print(f"❌ Erro ao criar avaliação do paciente: {e}")
    
    # Criar avaliação do profissional (se existir)
    if profissional:
        try:
            avaliacao_profissional = Avaliacao.objects.create(
                agendamento=agendamento_concluido,
                avaliador=profissional,
                tipo_avaliador='profissional',
                nota=4,
                comentario='Paciente muito colaborativo e interessado no tratamento. Compareceu pontualmente.'
            )
            print(f"✅ Avaliação do profissional criada: {avaliacao_profissional.nota}★")
        except Exception as e:
            print(f"❌ Erro ao criar avaliação do profissional: {e}")
    
    print(f"\n🎉 Total de avaliações no sistema: {Avaliacao.objects.count()}")
    print("✅ Agora o admin pode ver as avaliações!")

if __name__ == "__main__":
    criar_avaliacoes_teste()