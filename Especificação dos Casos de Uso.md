# Especificação dos Casos de Uso

Esta seção reúne a especificação dos casos de uso (seção 3.2) para cada tela principal do projeto.

## 3.2.1 Tela inicial / Home (`app/page.tsx`)
- Objetivo: apresentar propósito do serviço, links e CTAs para áreas principais (psicologia/psiquiatria/login/planos).
- Atores: Usuário anônimo.
- Pré-condições: nenhuma.
- Fluxo principal:
  1. Usuário abre a aplicação.
  2. Visualiza descrição, links e CTAs (buscar profissional / entrar).
  3. Clica em um link e é direcionado para a rota correspondente.
- Fluxos alternativos: usuário já logado → CTA leva à sua Área pessoal.
- Pós-condição: navegação para a rota selecionada.
- Dados: conteúdo estático e links.
- Critério de aceitação: links funcionais; conteúdo legível e responsivo.

## 3.2.2 Login (`app/login/page.tsx`)
- Objetivo: autenticar usuário (email/senha) e iniciar sessão.
- Atores: Usuário (paciente, psicólogo, psiquiatra, admin).
- Pré-condições: usuário possuir credenciais.
- Fluxo principal:
  1. Usuário informa email e senha.
  2. Envia formulário para o endpoint de autenticação.
  3. Backend responde com sessão/cookie; frontend redireciona conforme role.
- Alternativas/erros: credenciais inválidas → exibir mensagem; erro de rede → mostrar toast/alert.
- Pós-condição: cookie JWT setado; usuário redirecionado à área apropriada.
- Dados: email, senha; resposta com role, id e foto.
- Critério: autenticação bem-sucedida e redirecionamento correto.

## 3.2.3 Cadastro de usuário (`app/cadastro_usuario/page.tsx`)
- Objetivo: criar conta de paciente ou profissional (campos: crm/crp, especialidade, valor_consulta, etc.).
- Atores: Usuário novo.
- Pré-condições: nenhum.
- Fluxo principal:
  1. Usuário preenche formulário de cadastro.
  2. Valida campos localmente (formatos, obrigatoriedade).
  3. Envia POST para o backend para criar o usuário.
  4. Exibe confirmação/erro conforme resposta.
- Alternativas: email já cadastrado → sugerir recuperação de senha; campos inválidos → mostrar mensagens inline.
- Pós-condição: usuário criado no backend.
- Dados: nome, email, senha, role, crm/crp, valor_consulta, especialidade.
- Critério: backend retorna 201 e UI mostra sucesso/instrução.

## 3.2.4 Recuperar senha (`app/recuperar-senha/*`)
- Objetivo: solicitar e confirmar redefinição de senha.
- Atores: Usuário com conta.
- Pré-condições: usuário lembra o email cadastrado.
- Fluxos:
  - Solicitação:
    1. Usuário informa email.
    2. Backend envia e-mail com token/uid.
  - Redefinição:
    1. Usuário acessa link com token/uid.
    2. Informa nova senha e envia ao endpoint de reset.
- Alternativas: email não cadastrado → mensagem; token inválido/expirado → instrução para solicitar novamente.
- Pós-condição: senha atualizada.
- Dados: email, token, nova senha.
- Critério: usuário consegue logar com a nova senha.

## 3.2.5 Listagens: Psicologia e Psiquiatria (`app/psicologia/`, `app/psiquiatria/`)
- Objetivo: listar profissionais, mostrar resumo e permitir agendamento.
- Atores: Usuário anônimo ou autenticado.
- Pré-condições: endpoint de listagem disponível.
- Fluxo principal:
  1. Página carrega e busca lista via API.
  2. Exibe cartões com foto, nome, especialidade e valor_consulta.
  3. Usuário clica em "Agendar" → se não autenticado, redireciona para login; se autenticado, vai para `agendamento/[id]`.
- Alternativas: filtros e paginação; nenhum profissional encontrado → mensagem.
- Pós-condição: navegação para agendamento ou perfil.
- Dados: nome, foto, especialidade, crm/crp, valor_consulta.
- Critério: listagem paginada e botões funcionais.

## 3.2.6 Perfis / Meu Perfil (`app/meu_perfil*`)
- Objetivo: exibir e editar dados do usuário, upload de foto e integração Stripe para profissionais.
- Atores: Usuário autenticado (conforme role).
- Pré-condições: sessão ativa.
- Fluxo principal:
  1. Carregar dados via `/usuario_jwt/` e `/api/users/{id}`.
  2. Exibir campos; botão "Editar" habilita inputs.
  3. Ao salvar, enviar PUT para `/api/users/{id}`.
  4. Upload de foto via endpoint específico.
  5. Stripe onboarding: iniciar via endpoint e redirecionar.
- Alternativas: cancelar edição; auto-preenchimento de CEP via ViaCEP.
- Pós-condição: dados atualizados no backend.
- Dados: nome, telefone, crp/crm, valor_consulta, endereços, foto, stripe_account_id.
- Critério: edição salva, foto atualiza e Stripe onboarding inicia/retorna status.

## 3.2.7 Área do Usuário / Dashboard do Paciente (`app/area-do-usuario/page.tsx`)
- Objetivo: apresentar resumo (cards) e gráficos de uso (consultas, mensagens).
- Atores: Paciente autenticado.
- Pré-condições: sessão ativa e endpoints de agendamentos/mensagens disponíveis.
- Fluxo principal:
  1. Buscar agendamentos e mensagens do paciente.
  2. Renderizar cards: consultas realizadas, canceladas, próxima consulta, mensagens.
  3. Apresentar gráficos (barras e pizza) com agregações.
- Alternativas: dados vazios → placeholders; filtros por período.
- Pós-condição: dashboard mostra dados atualizados.
- Dados: agendamentos, status, datas, contagem de mensagens.
- Critério: gráficos e cards consistentes com os dados do backend.

## 3.2.8 Área do Psicólogo / Psiquiatra (`app/area-do-psicologo/`, `app/area-do-psiquiatra/`)
- Objetivo: dashboard profissional com indicadores (total de consultas, receita, cancelamentos), gráficos e navegação para prontuários.
- Atores: Psicólogo ou Psiquiatra autenticado.
- Pré-condições: sessão autenticada com role apropriada.
- Fluxo principal:
  1. Buscar agendamentos profissionais via API.
  2. Calcular totais e renderizar cards e gráficos.
  3. Permitir navegação para "Minhas Consultas", "Meu Perfil" e "Prontuário".
- Alternativas: exportar dados, aplicar filtros por período.
- Pós-condição: indicadores exibidos e ações disponíveis.
- Dados: valor_recebido_profissional, status, datas.
- Critério: totais e tooltips em formato pt-BR; gráficos responsivos.

## 3.2.9 Minhas Consultas (`consultas_*`)
- Objetivo: listar consultas por usuário (paciente/profissional/admin) com ações (confirmar, cancelar, ver prontuário).
- Atores: Profissional, Paciente, Admin.
- Pré-condições: sessão ativa e endpoint de agendamentos.
- Fluxo principal:
  1. Carregar agendamentos do usuário.
  2. Exibir itens com status, data, paciente/profissional e ações.
  3. Usuário executa ação → chamada API e atualização de UI.
- Alternativas: modal de confirmação; filtros por status/data.
- Pós-condição: alteração de status persistida.
- Dados: id, data, status, valor, observações.
- Critério: ações refletem no backend e UI atualiza sem reload completo.

## 3.2.10 Agendamento (`app/agendamento/[id]/page.tsx`)
- Objetivo: agendar sessão com um profissional.
- Atores: Paciente autenticado.
- Pré-condições: usuário autenticado; profissional disponível.
- Fluxo principal:
  1. Selecionar data/hora via calendário/slots.
  2. Página exibe resumo e valor_consulta (formatado pt-BR).
  3. Confirmar cria agendamento via POST.
  4. Redireciona para confirmação/pagamento se aplicável.
- Alternativas: conflito de horário → mostrar erro; profissional sem valor → aviso.
- Pós-condição: agendamento criado e notificação enviada.
- Dados: profissional.id, paciente.id, data/hora, valor_consulta.
- Critério: agendamento criado com resposta positiva do backend.

## 3.2.11 Pagamento (`app/pagamentoplano/`, `app/pagamentotst/`)
- Objetivo: processar pagamentos via Stripe, PIX ou cartão.
- Atores: Usuário autenticado.
- Pré-condições: backend de pagamentos disponível; plano/valor selecionado.
- Fluxo principal:
  1. Exibir resumo do pagamento com valor formatado.
  2. Usuário escolhe método: PIX (exibir código), Stripe (iniciar checkout), cartão (coletar dados).
  3. Iniciar processo e aguardar retorno do gateway.
- Alternativas: parcelamento com valores mostrados formatados.
- Pós-condição: pagamento iniciado/registrado.
- Dados: preco, plano, usuario_id, resposta do gateway.
- Critério: valores exibidos corretamente e checkout/redirecionamento funcionais.

## 3.2.12 Planos (`app/planos/page.tsx`)
- Objetivo: exibir planos e direcionar ao pagamento.
- Atores: Usuário anônimo ou autenticado.
- Fluxo: exibir cards e CTA para pagar → redirecionar a `pagamentoplano`.
- Critério: navegação e valores corretos.

## 3.2.13 Prontuário (`app/prontuario_*`)
- Objetivo: exibir histórico clínico, mensagens e anotações; permitir adições por profissionais.
- Atores: Profissional e Paciente (com permissões).
- Pré-condições: autorização adequada.
- Fluxo principal:
  1. Carregar registros via API.
  2. Exibir itens e permitir anotações para profissionais.
- Pós-condição: novos registros persistidos.
- Critério: permissões respeitadas e edição salva.

## 3.2.14 Admin (`app/area-admin/`, `app/admin/listagem/`)
- Objetivo: gestão de usuários, consultas e indicadores.
- Atores: Admin autenticado.
- Pré-condições: role=Admin.
- Fluxo principal:
  1. Carregar dados agregados.
  2. Filtrar por tipo e acessar listagens.
  3. Executar operações CRUD sobre usuários e consultas.
- Pós-condição: mudanças aplicadas no backend.
- Critério: operações CRUD funcionais e filtros corretos.

## 3.2.15 Páginas auxiliares (`app/Sobre/`, `app/teste/`)
- Objetivo: conteúdo institucional e ambiente de testes; exibição estática ou validação de componentes.
- Critério: conteúdo acessível.

---

### Observações e recomendações
- Padronizar exibição de moeda com `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })` (já utilizado no frontend).
- Recomendo incluir diagramas (caso de uso/atividade) para os fluxos críticos: Login, Agendamento, Pagamento e Área do Profissional.
- Caso queira, eu posso:
  - gerar um arquivo separado com diagramas básicos (SVG);
  - criar um índice/TOC para este documento.


*Fim da especificação.*
