RESUMO

Atualmente estou desenvolvendo um sistema utilizando Next.js no frontend e Django no backend. O sistema será uma agenda psiquiátrica online. O mesmo terá uma área de acesso para usuários já cadastrados. Caso o usuário não tenha cadastro, ele deverá criar uma conta fornecendo: Nome Completo, Email, Telefone, CPF e Senha. Após fazer login, o usuário poderá agendar seu atendimento. Ao confirmar o agendamento, o usuário será direcionado para a página de pagamento. Depois que o pagamento for confirmado, ele receberá um email com os dados completos da consulta: Médico, Especialização e link para atendimento online.

Palavras-chave: Agenda online, Telemedicina, Psiquiatria, Next.js, Django, Pagamento online.


SUMÁRIO

1. Introdução
1.1. Contexto
1.2. Descrição da Solução
1.3. Objetivos
1.4. Metodologia de Desenvolvimento
2. Modelagem de Negócio
2.1. Business Model Canvas
2.2. Product Backlog Priorizado
3. Modelagem de Sistemas
3.1. Diagrama de Casos de Uso
3.2. Especificação dos Casos de Uso
3.2.1 Cadastrar Cursos (por exemplo)
3.3. Diagrama de Classes
3.4. Diagrama do Banco de Dados (DER, M, p.ER, etc.)
3.5. Diagrama de Sequência
3.5.1 Diagrama de Sequencia – Cadastrar Cursos
3.6. Diagrama de Componentes / Implantação
4. Conclusão
5. Referências Bibliográficas


LISTA DE FIGURAS

Figura 1 - Exemplo de diagrama de caso de uso
Figura 2 - Mookup da tela de cadastro de cursos
Figura 3 - Ficha de Curso de Ação - Cadastrar Cursos
Figura 4 - Ficha Tecnica do curso de Ação
Figura 5 - Exemplo de Diagrama de Classes
Figura 6 - Modelo de Diagrama E/R
Figura 7 - Exemplo de Diagrama de Sequencia - Cadastrar Cursos
Figura 8 - Exemplo de Diagrama de Componentes


1. Introdução

1.1. Contexto
A crescente demanda por serviços de saúde mental tem impulsionado a necessidade de soluções digitais que facilitem o acesso a consultas psiquiátricas. Atualmente, muitos atendimentos são agendados por telefone ou através de sistemas manuais, o que pode gerar dificuldades como agendamentos conflitantes, dificuldade de confirmação de consultas e falta de um controle eficiente para os profissionais da saúde.
Além disso, plataformas existentes no mercado nem sempre oferecem integração com pagamento online ou não proporcionam uma experiência fluida para o usuário final.
Diante desse cenário, este projeto propõe o desenvolvimento de um sistema de agenda psiquiátrica online, automatizando o processo de agendamento e pagamento de consultas, proporcionando maior comodidade tanto para os pacientes quanto para os profissionais de saúde.

1.2. Descrição da Solução
O sistema será desenvolvido utilizando Next.js no frontend e Django no backend, garantindo uma solução moderna, performática e segura.
As principais funcionalidades do sistema incluem:
- Agendamento de consultas por meio de uma interface intuitiva, permitindo a seleção de médicos e especializações.
- Integração com gateway de pagamento (Stripe ou PayPal) para confirmação de agendamentos.
- Envio automático de emails com confirmação de consulta e lembretes pré-agendamento.
- Painel administrativo para gerenciamento de agendamentos e controle de pacientes.
O backend será desenvolvido utilizando Django Rest Framework (DRF) para a criação das APIs RESTful, enquanto o frontend utilizará Next.js para proporcionar uma experiência rápida e responsiva. O banco de dados utilizado será MySQL, garantindo o armazenamento das informações.

1.3. Objetivos
Os principais objetivos do projeto são:
- Automatizar e otimizar o processo de agendamento de consultas psiquiátricas, proporcionando uma interface intuitiva para pacientes e profissionais.
- Implementar um sistema seguro e eficiente para autenticação, pagamento e gerenciamento de consultas, garantindo proteção de dados sensíveis.
- Facilitar o acompanhamento de consultas e pagamentos, oferecendo integração com notificações automáticas para lembretes e confirmação de agendamentos.

1.4. Metodologia de Desenvolvimento
(Plataformas, Tecnologias, Metodologias de Desenvolvimento etc.)

2. Modelagem de Negócio

2.1. Business Model Canvas
Desabafe: Plataforma de Consultas Psiquiátricas Online
Uma solução digital que conecta pacientes a psiquiatras e psicólogos por meio de um sistema prático, seguro e totalmente online. A plataforma oferece agendamento, pagamento e realização de consultas sem sair de casa, promovendo conveniência tanto para pacientes quanto para profissionais da saúde mental.

1. Proposta de Valor (Value Proposition)
Para pacientes:
• Agendamento prático de consultas psicológicas e psiquiátricas online.
• Pagamento seguro via cartão, boleto ou Pix.
• Lembretes automáticos e acesso a atendimentos sem sair de casa.
Para profissionais (psiquiatras e psicólogos):
• Plataforma simples e intuitiva para gerenciar sua agenda e atendimentos online.
• Autonomia total para definir o valor da consulta.
• Pagamento fixo por uso da plataforma (mensal ou anual).
• Repasse financeiro das consultas realizadas em até 30 dias úteis.

2. Segmentos de Clientes (Customer Segments)
• Pacientes que buscam atendimento psiquiátrico ou psicológico acessível, seguro e online.
• Profissionais da saúde mental (psiquiatras e psicólogos) que desejam atender virtualmente com flexibilidade, autonomia e controle de agenda.

3. Canais (Channels)
• Plataforma web responsiva para cadastro, agendamento, pagamento e acesso à consulta.
• E-mail para envio de confirmações, lembretes e suporte.
• Redes sociais (Instagram, Facebook, LinkedIn) para aquisição, engajamento e divulgação.

4. Relacionamento com Clientes (Customer Relationships)
• Automação de mensagens (confirmações, lembretes, orientações pré e pós-consulta).
• Suporte técnico humanizado via e-mail ou chat.
• Área exclusiva para profissionais com histórico de agendamentos, controle financeiro e gestão de atendimentos.
• Acesso à plataforma liberado somente com assinatura ativa (mensal ou anual).
• Profissionais recebem o pagamento das consultas em até 30 dias úteis após a realização.

5. Fontes de Receita (Revenue Streams)
• Planos mensais ou anuais pagos pelos profissionais para uso da plataforma.
• A plataforma não cobra comissão por consulta — o valor da consulta é definido e recebido integralmente pelo profissional (após o prazo estipulado).
• Possibilidade futura de venda de serviços adicionais (ex: destaque no site, agendamentos preferenciais, relatórios avançados).

6. Recursos Principais (Key Resources)
• Plataforma web (tecnologia Django no backend e Next.js no frontend).
• Equipe técnica de desenvolvimento, suporte e manutenção.
• Integrações com gateways de pagamento (Stripe, PayPal, Pix).
• Ferramentas de e-mail e videoconferência (Mailgun, SendGrid, Zoom, Google Meet).
• Infraestrutura para armazenamento e proteção de dados conforme LGPD.

7. Atividades Principais (Key Activities)
• Desenvolvimento e manutenção da plataforma.
• Atendimento e suporte a usuários (pacientes e profissionais).
• Marketing digital e aquisição de usuários.
• Gestão de pagamentos, agendamentos e dados sensíveis.
• Monitoramento de desempenho e experiência do usuário.

8. Parcerias Principais (Key Partnerships)
• Gateways de pagamento (Stripe, PayPal, integrações com Pix).
• Serviços de e-mail transacional (Mailgun, SendGrid).
• Plataformas de videoconferência (Zoom, Google Meet).
• Profissionais credenciados (psiquiatras e psicólogos).
• Agências de marketing (para divulgação, se aplicável).

9. Estrutura de Custos (Cost Structure)
• Custos de desenvolvimento e manutenção da plataforma (servidores, hospedagem, equipe).
• Despesas com integrações externas (pagamento, e-mail, vídeo).
• Investimentos em marketing digital, SEO e redes sociais.
• Suporte técnico e atendimento ao cliente.
• Custos com segurança da informação e conformidade com LGPD.

2.2. Product Backlog Priorizado
O que é o Product Backlog?
O Product Backlog é uma lista ordenada de tudo que precisa ser feito no projeto. Ele inclui funcionalidades, melhorias, requisitos técnicos e correções necessárias para que o produto atenda às necessidades dos usuários.
No contexto do meu TCC, o backlog é dividido entre requisitos funcionais (o que o sistema deve fazer) e não funcionais (como o sistema deve se comportar). Esse backlog é vivo: ele é atualizado e priorizado continuamente, acompanhando a evolução do projeto.

2. Visão Geral do Product Backlog
Requisitos Funcionais:
• R1 – Login de Usuário: Permitir login com e-mail e senha, com proteção contra acessos inválidos.
• R8 – Cadastro de Usuário: Cadastro com validação de dados e envio de verificação por e-mail.
• R10 – Tela de Agendamento: Permitir agendamento com filtro por médico, especialização, data e hora.
• R11 – Integração de Pagamento: Conectar com gateways como Stripe ou PayPal para pagamento de consultas.
• R12 – Envio de Notificação Pós-Pagamento: Enviar e-mail confirmando o pagamento e agendamento.
• R13 – Plano de Assinatura para Profissionais: Permitir que psiquiatras/psicólogos escolham entre plano mensal ou anual.
• R14 – Cobrança Recorrente e Gestão de Planos: Automatizar a cobrança dos planos e suspender contas inadimplentes.
• R15 – Cadastro de Profissionais com Plano Ativo: Apenas profissionais com plano ativo aparecerão nas buscas para agendamento.
• R16 – Definição de Preço por Consulta: O profissional poderá definir livremente o valor de suas consultas.
• R17 – Tela de Gerenciamento do Profissional: Profissionais poderão acompanhar agendamentos, pagamentos e perfil.
Requisitos Não Funcionais:
• R2 – Responsividade: O sistema deve se adaptar a dispositivos móveis e tablets.
• R4 – Performance: As requisições devem ser respondidas em no máximo 4 segundos.
• R18 – Segurança de Dados: Implementar criptografia, autenticação e armazenamento seguro.

3. Priorização dos Itens
A priorização foi feita com base na criticidade e impacto de cada funcionalidade:
• Alta Prioridade: Essenciais para o funcionamento inicial.
o R1 (Login), R8 (Cadastro), R10 (Agendamento), R11 (Pagamento), R13 (Planos), R15 (Filtro de profissionais com plano ativo).
• Média Prioridade: Requisitos importantes, mas que não bloqueiam o uso básico.
o R2 (Responsividade), R12 (Notificações), R14 (Cobrança Recorrente), R16 (Preço Personalizado).
• Baixa Prioridade: Podem ser implementados em versões futuras.
o R17 (Painel Avançado do Profissional), R18 (Segurança Avançada).

4. Estimativas de Esforço
Cada item foi estimado com base na complexidade e tempo necessário para implementação:
• Login de Usuário: 20 horas.
• Integração de Pagamento: 50 horas (por envolver APIs externas e testes).
• Planos e Gestão de Profissionais: 60 horas (criação do modelo de planos, integração de cobrança e regras de acesso).
Essas estimativas ajudam a montar as sprints e controlar o cronograma.

5. Dependências Entre Itens
Alguns requisitos estão interligados:
• R8 (Cadastro de Usuário) deve vir antes de R9 (Verificação de E-mail).
• R13 (Planos) precisa ser implementado antes de permitir a exibição de profissionais (R15) ou configuração de preço (R16).
• O agendamento só funciona após o profissional ter plano ativo e preço definido.

6. Critérios de Aceitação
Cada requisito só será considerado “pronto” se cumprir os critérios definidos. Exemplos:
• Login (R1): Deve autenticar apenas usuários válidos e bloquear após 3 tentativas erradas.
• Agendamento (R10): Deve permitir selecionar especialidade, médico, data e hora, e confirmar apenas se houver pagamento.
• Planos (R13): Deve permitir a contratação de planos mensais ou anuais, com ativação automática após o pagamento.
• Listagem de Profissionais (R15): O sistema só exibirá profissionais com plano ativo.

7. Refinamento Contínuo
O backlog será revisado periodicamente para:
• Ajustar prioridades com base no feedback do orientador e nos testes.
• Incluir novas funcionalidades ou melhorias.
• Corrigir requisitos obsoletos ou duplicados.
Isso garante agilidade e adaptação contínua ao longo do projeto.

8. Planejamento de Sprints
Com base nas estimativas e prioridades, os requisitos serão distribuídos em sprints de 2 semanas. Cada sprint terá um objetivo claro, por exemplo:
• Sprint 1: Autenticação, Cadastro e Verificação de E-mail.
• Sprint 2: Tela de Agendamento + Integração de Pagamento.
• Sprint 3: Implementação de Planos e Gestão de Profissionais.
Esse modelo permite entregas incrementais e facilita testes e ajustes.
9. Conclusão
O Product Backlog é um pilar fundamental do projeto, garantindo que todas as funcionalidades essenciais estejam bem definidas, priorizadas e estimadas. Com ele, é possível acompanhar o progresso, adaptar o escopo e garantir que o sistema final seja funcional, seguro e eficiente.
Além disso, a monetização por meio dos planos dos profissionais é um diferencial estratégico do projeto, permitindo escalar a plataforma de forma sustentável e justa, oferecendo autonomia para os profissionais definirem seus próprios valores de consulta.

3. Modelagem de Sistemas

3.1. Diagrama de Casos de Uso
O diagrama de caso de uso tem como objetivo representar as funcionalidades de um sistema e as interações dos usuários com ele. Ele ilustra os atores (usuários ou sistemas externos) e os casos de uso (ações ou funcionalidades oferecidas pelo sistema), permitindo entender como o sistema atende às necessidades dos usuários.
Componentes:
    Atores: São os usuários ou sistemas que interagem com o sistema. No diagrama, temos o Usuário, Administrador, Médico, Psicólogo, Sistema de Pagamento e Sistema de Notificações.
    Casos de Uso: São as funcionalidades que o sistema oferece, como criar conta, agendar consulta, visualizar agenda, gerenciar usuários, entre outros.
    Relacionamentos: Mostram como os atores se conectam aos casos de uso, com associações diretas ou através de inclusões e extensões.
No diagrama do Sistema de Agenda Psiquiátrica Online, os principais módulos incluem autenticação de usuários, agendamento de consultas, pagamento, notificações, e gestão dos profissionais de saúde. O diagrama organiza essas funcionalidades em pacotes, facilitando a visualização das interações e processos dentro do sistema.

3.2. Especificação dos Casos de Uso
Para cada evento, ou item do Backlog ou caso de uso (todos devem contém os mesmos elementos) apresentar o protótipo da tela que será/foi criada, bem como as condições de uso da interface

3.2.1 Home


Figura 2 - Mookup da tela de cadastro de cursos
Tonsig(2023, p. 20)

Criar a ficha de curso de ação para o caso de uso “Cadastrar Cursos”.

1. Tela de Cadastro de Usuário
Permite o cadastro de novos usuários.
Campos obrigatórios: Nome, E-mail, Senha, CPF.
Campos opcionais: Telefone, CRM (para psiquiatras), CRP (para psicólogos).
Seleção do tipo de usuário: Paciente, Psicólogo, Psiquiatra ou Admin.
Validação de CPF e exibição de mensagens de erro/sucesso

1. Tela de Login
Autenticação de usuários com e-mail e senha.
Armazena o token JWT no localStorage após login bem-sucedido.
Redireciona para a área específica do usuário com base no tipo de conta.

3. Tela de Área do Admin
Dashboard administrativo com acesso a:
Gerenciamento de usuários.
Gerenciamento de consultas.
Configurações gerais do sistema.
Botão para logout.

4. Tela de Área do Psicólogo
Exibe informações do psicólogo logado.
Funcionalidades disponíveis:
Gerenciar perfil.
Visualizar e gerenciar consultas.

5. Tela de Área do Psiquiatra
Exibe informações do psiquiatra logado.
Funcionalidades disponíveis:
Gerenciar perfil.
Visualizar e gerenciar consultas.
Configurações de conta.
Botão para logout.

6. Tela de Área do Usuário
Exibe informações do usuário logado.
Acesso a funcionalidades como:
Visualizar e editar perfil.
Gerenciar consultas.
Configurações de conta.

7. Tela de Psicologia
Lista de psicólogos disponíveis.
Exibe informações como nome, especialidade e CRP.
Botão para agendar consulta com o psicólogo selecionado.

8. Tela de Psiquiatria
Lista de psiquiatras disponíveis.
Exibe informações como nome, especialidade e CRM.
Botão para agendar consulta com o psiquiatra selecionado.

9. Tela de Agendamento
Permite agendar consultas com profissionais.
Campos: Data e Hora, Observações (opcional).
Botão para confirmar o agendamento.

10.Tela de Pagamento
Objetivo: Gerenciar pagamentos relacionados aos serviços.
Funcionalidades:
Exibição de informações sobre o pagamento.
Possibilidade de realizar pagamentos (detalhes não fornecidos no código atual).
Integração com métodos de pagamento (se aplicável).
Destaques:
Interface amigável para facilitar o processo de pagamento.
Possibilidade de expandir para incluir histórico de pagamentos ou recibos.

11.Tela de Prontuário Médico
Objetivo: Criar e salvar prontuários médicos.
Funcionalidades:
Campos para preenchimento:
Histórico Clínico.
Diagnóstico.
Tratamento.
Prescrição.
Exibição de IDs do médico responsável e do paciente (somente leitura).
Geração automática de ID do prontuário.
Botão para salvar o prontuário.
Destaques:
Validação de campos obrigatórios.
Exibição de mensagens de sucesso ao salvar.

3.3. Diagrama de Classes
Indicar Objetivo do Diagrama de Classes
O diagrama de classes tem como objetivo mostrar a estrutura do sistema de forma visual. Ele apresenta as classes (que são como os "blocos" do sistema), os dados que cada uma armazena (atributos), as ações que podem executar (métodos) e como se relacionam entre si. Esse tipo de diagrama ajuda bastante no entendimento, desenvolvimento e manutenção do sistema, pois dá uma visão geral clara e organizada.

Principais Classes do Projeto e Seus Objetivos
    Usuário
    Representa a pessoa que utiliza o sistema, como um paciente. Armazena informações como nome, e-mail, CPF e senha. O usuário pode fazer login, agendar consultas e visualizar o seu histórico.

    Médico
    Representa o profissional de saúde. Guarda dados como nome completo, CRM e contato. O médico pode gerenciar sua agenda, acessar históricos e realizar atendimentos.

    Consulta
    Representa o agendamento entre o paciente e o médico. Possui informações como data, horário, status e link da consulta online.

    Pagamento
    Armazena os dados relacionados ao pagamento de uma consulta, como valor, método utilizado, data e status.

    Especialização
    Mostra a área médica em que o médico atua, como cardiologia, pediatria, entre outras.

    Acompanhamento da Consulta
    Permite registrar informações pós-consulta, como evoluções do paciente, prescrições e observações do médico.

    Prontuário
    Armazena o histórico clínico do paciente, incluindo diagnósticos, tratamentos e prescrições feitas.

    Histórico da Consulta e Histórico de Pagamento
    Guardam as mudanças de status ao longo do tempo, registrando quando houve alterações em consultas ou pagamentos.

    Notificação e Lembrete de Consulta
    Usadas para manter o usuário informado, enviando mensagens ou lembretes sobre compromissos e atualizações.

    Remarcação de Agendamento
    Registra quando uma consulta é remarcada, com a nova data e o motivo da mudança.

    Comunicação Médica
    Usada para trocas de mensagens entre médico e paciente fora da consulta, como dúvidas ou orientações.

    Indisponibilidade Médica
    Mostra os dias e horários em que o médico está disponível para realizar atendimentos.

    Papel do Usuário (UsuarioRole)
    Define o tipo de usuário no sistema: se é um paciente, médico ou administrador.

    Arquivo
    Armazena documentos importantes, como exames, receitas ou laudos médicos enviados pelos usuários.

3.4. Diagrama do Banco de Dados (DER, MER etc.)

3.5. Diagrama de Sequência
Apresentar o diagrama de sequência dos casos de uso do projeto, indicando quais são os objetos envolvidos na operação.
3.5.1 Diagrama de Sequência – Cadastrar Cursos

1. Cadastro e Verificação de Email

2. Login

3. Assinatura de Plano Mensal do Profissional

4. Agendamento e Pagamento de Consulta pelo Cliente

5. Repasse do Valor ao Profissional após 30 dias

6. Notificações Pós-Pagamento (Clientes)

3.6. Diagrama de Componentes / Implantação

4. Conclusão
O Desabafe representa mais do que uma simples plataforma de agendamento psiquiátrico — ele simboliza uma nova forma de olhar para a saúde mental: com respeito, acessibilidade e humanidade. Ao combinar tecnologias robustas como Next.js e Django com uma proposta centrada no acolhimento, conseguimos transformar um processo muitas vezes burocrático e distante em uma experiência fluida, segura e empática.
Cada linha de código foi pensada não só para funcionar, mas para cuidar. Criamos um ambiente onde o usuário se sente amparado, onde buscar ajuda não exige coragem heroica, mas sim apenas um clique. Essa é a verdadeira inovação: usar a tecnologia para abrir portas, aproximar pessoas e reduzir o silêncio que ainda cerca o sofrimento mental.
Com uma arquitetura preparada para evoluir, o Desabafe não é um projeto que se encerra — é uma plataforma viva, pronta para crescer junto com as necessidades de quem confia nela. Porque democratizar o acesso à saúde emocional não é apenas um avanço técnico. É um compromisso social. É um passo essencial rumo a uma sociedade mais saudável, consciente e humana.
5. Referências Bibliográficas

ATUALMENTE TENHO ISSO DE DOCUMENTACAO



<!-- PARTE 2 -->
RESUMO

Atualmente estou desenvolvendo um sistema utilizando Next.js no frontend e Django no backend. O sistema será uma agenda psiquiátrica online. O mesmo terá uma área de acesso para usuários já cadastrados. Caso o usuário não tenha cadastro, ele deverá criar uma conta fornecendo: Nome Completo, Email, Telefone, CPF e Senha. Após fazer login, o usuário poderá agendar seu atendimento. Ao confirmar o agendamento, o usuário será direcionado para a página de pagamento. Depois que o pagamento for confirmado, ele receberá um email com os dados completos da consulta: Médico, Especialização e link para atendimento online.

Palavras-chave: Agenda online, Telemedicina, Psiquiatria, Next.js, Django, Pagamento online.


SUMÁRIO

1. Introdução
1.1. Contexto
1.2. Descrição da Solução
1.3. Objetivos
1.4. Metodologia de Desenvolvimento
2. Modelagem de Negócio
2.1. Business Model Canvas
2.2. Product Backlog Priorizado
3. Modelagem de Sistemas
3.1. Diagrama de Casos de Uso
3.2. Especificação dos Casos de Uso
3.2.1 Cadastrar Cursos (por exemplo)
3.3. Diagrama de Classes
3.4. Diagrama do Banco de Dados (DER, M, p.ER, etc.)
3.5. Diagrama de Sequência
3.5.1 Diagrama de Sequencia – Cadastrar Cursos
3.6. Diagrama de Componentes / Implantação
4. Conclusão
5. Referências Bibliográficas


LISTA DE FIGURAS

Figura 1 - Exemplo de diagrama de caso de uso
Figura 2 - Mookup da tela de cadastro de cursos
Figura 3 - Ficha de Curso de Ação - Cadastrar Cursos
Figura 4 - Ficha Tecnica do curso de Ação
Figura 5 - Exemplo de Diagrama de Classes
Figura 6 - Modelo de Diagrama E/R
Figura 7 - Exemplo de Diagrama de Sequencia - Cadastrar Cursos
Figura 8 - Exemplo de Diagrama de Componentes


1. Introdução

1.1. Contexto
A crescente demanda por serviços de saúde mental tem impulsionado a necessidade de soluções digitais que facilitem o acesso a consultas psiquiátricas. Atualmente, muitos atendimentos são agendados por telefone ou através de sistemas manuais, o que pode gerar dificuldades como agendamentos conflitantes, dificuldade de confirmação de consultas e falta de um controle eficiente para os profissionais da saúde.
Além disso, plataformas existentes no mercado nem sempre oferecem integração com pagamento online ou não proporcionam uma experiência fluida para o usuário final.
Diante desse cenário, este projeto propõe o desenvolvimento de um sistema de agenda psiquiátrica online, automatizando o processo de agendamento e pagamento de consultas, proporcionando maior comodidade tanto para os pacientes quanto para os profissionais de saúde.

1.2. Descrição da Solução
O sistema será desenvolvido utilizando Next.js no frontend e Django no backend, garantindo uma solução moderna, performática e segura.
As principais funcionalidades do sistema incluem:
- Agendamento de consultas por meio de uma interface intuitiva, permitindo a seleção de médicos e especializações.
- Integração com gateway de pagamento (Stripe ou PayPal) para confirmação de agendamentos.
- Envio automático de emails com confirmação de consulta e lembretes pré-agendamento.
- Painel administrativo para gerenciamento de agendamentos e controle de pacientes.
O backend será desenvolvido utilizando Django Rest Framework (DRF) para a criação das APIs RESTful, enquanto o frontend utilizará Next.js para proporcionar uma experiência rápida e responsiva. O banco de dados utilizado será MySQL, garantindo o armazenamento das informações.

1.3. Objetivos
Os principais objetivos do projeto são:
- Automatizar e otimizar o processo de agendamento de consultas psiquiátricas, proporcionando uma interface intuitiva para pacientes e profissionais.
- Implementar um sistema seguro e eficiente para autenticação, pagamento e gerenciamento de consultas, garantindo proteção de dados sensíveis.
- Facilitar o acompanhamento de consultas e pagamentos, oferecendo integração com notificações automáticas para lembretes e confirmação de agendamentos.

1.4. Metodologia de Desenvolvimento
(Plataformas, Tecnologias, Metodologias de Desenvolvimento etc.)

2. Modelagem de Negócio

2.1. Business Model Canvas
Desabafe: Plataforma de Consultas Psiquiátricas Online
Uma solução digital que conecta pacientes a psiquiatras e psicólogos por meio de um sistema prático, seguro e totalmente online. A plataforma oferece agendamento, pagamento e realização de consultas sem sair de casa, promovendo conveniência tanto para pacientes quanto para profissionais da saúde mental.

1. Proposta de Valor (Value Proposition)
Para pacientes:
• Agendamento prático de consultas psicológicas e psiquiátricas online.
• Pagamento seguro via cartão, boleto ou Pix.
• Lembretes automáticos e acesso a atendimentos sem sair de casa.
Para profissionais (psiquiatras e psicólogos):
• Plataforma simples e intuitiva para gerenciar sua agenda e atendimentos online.
• Autonomia total para definir o valor da consulta.
• Pagamento fixo por uso da plataforma (mensal ou anual).
• Repasse financeiro das consultas realizadas em até 30 dias úteis.

2. Segmentos de Clientes (Customer Segments)
• Pacientes que buscam atendimento psiquiátrico ou psicológico acessível, seguro e online.
• Profissionais da saúde mental (psiquiatras e psicólogos) que desejam atender virtualmente com flexibilidade, autonomia e controle de agenda.

3. Canais (Channels)
• Plataforma web responsiva para cadastro, agendamento, pagamento e acesso à consulta.
• E-mail para envio de confirmações, lembretes e suporte.
• Redes sociais (Instagram, Facebook, LinkedIn) para aquisição, engajamento e divulgação.

4. Relacionamento com Clientes (Customer Relationships)
• Automação de mensagens (confirmações, lembretes, orientações pré e pós-consulta).
• Suporte técnico humanizado via e-mail ou chat.
• Área exclusiva para profissionais com histórico de agendamentos, controle financeiro e gestão de atendimentos.
• Acesso à plataforma liberado somente com assinatura ativa (mensal ou anual).
• Profissionais recebem o pagamento das consultas em até 30 dias úteis após a realização.

5. Fontes de Receita (Revenue Streams)
• Planos mensais ou anuais pagos pelos profissionais para uso da plataforma.
• A plataforma não cobra comissão por consulta — o valor da consulta é definido e recebido integralmente pelo profissional (após o prazo estipulado).
• Possibilidade futura de venda de serviços adicionais (ex: destaque no site, agendamentos preferenciais, relatórios avançados).

6. Recursos Principais (Key Resources)
• Plataforma web (tecnologia Django no backend e Next.js no frontend).
• Equipe técnica de desenvolvimento, suporte e manutenção.
• Integrações com gateways de pagamento (Stripe, PayPal, Pix).
• Ferramentas de e-mail e videoconferência (Mailgun, SendGrid, Zoom, Google Meet).
• Infraestrutura para armazenamento e proteção de dados conforme LGPD.

7. Atividades Principais (Key Activities)
• Desenvolvimento e manutenção da plataforma.
• Atendimento e suporte a usuários (pacientes e profissionais).
• Marketing digital e aquisição de usuários.
• Gestão de pagamentos, agendamentos e dados sensíveis.
• Monitoramento de desempenho e experiência do usuário.

8. Parcerias Principais (Key Partnerships)
• Gateways de pagamento (Stripe, PayPal, integrações com Pix).
• Serviços de e-mail transacional (Mailgun, SendGrid).
• Plataformas de videoconferência (Zoom, Google Meet).
• Profissionais credenciados (psiquiatras e psicólogos).
• Agências de marketing (para divulgação, se aplicável).

9. Estrutura de Custos (Cost Structure)
• Custos de desenvolvimento e manutenção da plataforma (servidores, hospedagem, equipe).
• Despesas com integrações externas (pagamento, e-mail, vídeo).
• Investimentos em marketing digital, SEO e redes sociais.
• Suporte técnico e atendimento ao cliente.
• Custos com segurança da informação e conformidade com LGPD.

2.2. Product Backlog Priorizado
O que é o Product Backlog?
O Product Backlog é uma lista ordenada de tudo que precisa ser feito no projeto. Ele inclui funcionalidades, melhorias, requisitos técnicos e correções necessárias para que o produto atenda às necessidades dos usuários.
No contexto do meu TCC, o backlog é dividido entre requisitos funcionais (o que o sistema deve fazer) e não funcionais (como o sistema deve se comportar). Esse backlog é vivo: ele é atualizado e priorizado continuamente, acompanhando a evolução do projeto.

2. Visão Geral do Product Backlog
Requisitos Funcionais:
• R1 – Login de Usuário: Permitir login com e-mail e senha, com proteção contra acessos inválidos.
• R8 – Cadastro de Usuário: Cadastro com validação de dados e envio de verificação por e-mail.
• R10 – Tela de Agendamento: Permitir agendamento com filtro por médico, especialização, data e hora.
• R11 – Integração de Pagamento: Conectar com gateways como Stripe ou PayPal para pagamento de consultas.
• R12 – Envio de Notificação Pós-Pagamento: Enviar e-mail confirmando o pagamento e agendamento.
• R13 – Plano de Assinatura para Profissionais: Permitir que psiquiatras/psicólogos escolham entre plano mensal ou anual.
• R14 – Cobrança Recorrente e Gestão de Planos: Automatizar a cobrança dos planos e suspender contas inadimplentes.
• R15 – Cadastro de Profissionais com Plano Ativo: Apenas profissionais com plano ativo aparecerão nas buscas para agendamento.
• R16 – Definição de Preço por Consulta: O profissional poderá definir livremente o valor de suas consultas.
# Documentação do Projeto TCC — Desabafe

Versão: documentação inicial consolidada (conteúdo e código atuais)
Data: 2025-09-08

## RESUMO

Desabafe é um sistema de agendamento psiquiátrico online desenvolvido com Next.js (frontend) e Django + Django REST Framework (backend). O sistema permite que usuários cadastrem-se (Nome, Email, Telefone, CPF, Senha), façam login, agendem consultas com profissionais (psiquiatras/psicólogos), realizem pagamento via Stripe (Checkout + Connect) e recebam confirmação por e-mail contendo os dados da consulta e o link para atendimento online (Jitsi Meet).

Palavras-chave: Agenda online, Telemedicina, Psiquiatria, Next.js, Django, Stripe, Pagamento online.

## Sumário (navegável)

1. Introdução
2. Tecnologias e Ferramentas
3. Arquitetura do Sistema
4. Modelagem (Modelos e Banco de Dados)
5. API e Endpoints (descrição e exemplos)
6. Fluxos principais (Autenticação, Agendamento, Pagamento, Webhook)
7. Frontend — páginas e integração
8. Configuração e execução local (dev)
9. Segurança e boas práticas
10. Backlog, Sprints e Cronograma
11. Conclusão
12. Referências

---

## 1. Introdução

1.1 Contexto

A demanda por serviços de saúde mental tem aumentado. Desabafe visa facilitar a conexão entre pacientes e profissionais (psiquiatras/psicólogos) por meio de agendamento online, pagamento integrado e consultas virtuais.

1.2 Objetivo

Documentar o sistema, descrevendo arquitetura, modelos, endpoints, fluxos e instruções para desenvolvimento e entrega do TCC.

## 2. Tecnologias e Ferramentas

- Frontend: Next.js (React 19, App Router), TypeScript parcial, Tailwind CSS
- Backend: Django 5.x, Django REST Framework, djangorestframework-simplejwt
- Banco de dados: MySQL (configurado em settings)
- Pagamento: Stripe (Checkout + Connect + Webhooks)
- Autenticação: JWT (SimpleJWT) com tokens armazenados em cookies e/ou Authorization header
- E-mail: SMTP (configurado via settings.py — recomendado trocar para serviço como SendGrid/Mailgun)
- Videoconferência: Jitsi Meet (links gerados automaticamente)

## 3. Arquitetura do Sistema

Visão geral:
- Frontend Next.js consome APIs REST do backend Django.
- Backend expõe endpoints para autenticação, gerenciamento de usuários, agendamentos, pagamentos e prontuários.
- Stripe é usado para criar sessões de pagamento e transferir fundos para contas conectadas (professionals).
- Webhook Stripe confirma pagamentos e atualiza agendamentos.

Componentes principais:
- App Next.js (UI, pages, autenticação, chamadas ao backend)
- API Django (DRF) com views funcionais e algumas APIView
- Banco MySQL para persistência
- Armazenamento de mídia: diretório `media/usuarios_fotos`

Diagrama (texto):
- [Browser] ⇄ Next.js (client) ⇄ Backend API (Django REST) ⇄ MySQL
- Backend ⇄ Stripe (Checkout / Webhooks)

## 4. Modelagem (Modelos e Banco de Dados)

Modelos principais (resumo a partir de `app_projeto/models.py`):

- Usuario
    - id (PK)
    - nome: Char
    - email: EmailField (unique)
    - telefone: Char
    - cpf: Char (unique)
    - senha: Char (armazenada com hashing via make_password)
    - status: Char (p.ex. 'ativo')
    - role: Char (Paciente, Psiquiatra, Psicologo, Admin)
    - crm, crp: Char (profissionais)
    - especialidade: Char
    - valor_consulta: Decimal
    - foto: ImageField (upload path `usuarios_fotos/`)
    - stripe_email, stripe_account_id: campos para Stripe Connect

- Agendamento
    - id
    - usuario (FK -> Usuario)
    - psiquiatra (FK -> Usuario, null)
    - psicologo (FK -> Usuario, null)
    - data_hora: DateTime
    - status: choices (pendente, paga, confirmado, cancelado)
    - link_consulta: URL
    - observacoes: Text
    - valor_recebido_profissional, valor_plataforma: Decimal
    - stripe_session_id: Char

- Prontuario
    - agendamento (OneToOne -> Agendamento)
    - texto, mensagem_paciente, data_criacao, data_atualizacao

- Endereco
    - usuario (FK -> Usuario)
    - logradouro, numero, complemento, bairro, cidade, estado, cep, tipo

Observações:
- O projeto manteve migrações no diretório `migrations/` mostrando evolução do modelo (ex.: adição de psicologo, stripe fields, etc.).

## 5. API e Endpoints (resumo)

Base URL: http://localhost:8000/ (dev) — usar `NEXT_PUBLIC_BACKEND_URL` no frontend

- Autenticação
    - POST /cadastrar_usuario/ — cria usuário (multipart/form-data ou JSON). Retorna token JWT.
        - Campos: name, email, phone, cpf, password, role, crm/crp, especialidade, valor_consulta, foto
    - POST /login_usuario/ — login com email+password. Define cookie `jwt` e retorna token
    - GET /usuario_jwt/ — retorna dados do usuário autenticado (lê cookie `jwt`)
    - POST /api/token/ (SimpleJWT) — rota para emissão de token via MyTokenObtainPairView
    - POST /api/token/refresh/ — refresh token

- Usuários
    - GET /api/users/ — listar usuários
    - GET/PUT /api/users/<id>/ — detalhar e editar usuário (upload de foto via endpoint dedicado `/upload_foto/`)
    - DELETE /api/users/<id>/delete/ — excluir

- Profissionais
    - GET /api/psiquiatras/ — listar psiquiatras
    - GET /api/psicologos/ — listar psicólogos

- Agendamentos
    - GET /api/agendamentos/ — listar (admin)
    - POST /api/agendamentos/criar/ — criar agendamento (gera link Jitsi e valida conflitos de 30 minutos)
    - PUT /api/agendamentos/<id>/atualizar/ — atualizar agendamento
    - DELETE /api/agendamentos/<id>/deletar/ — deletar
    - GET /api/agendamentos_profissional/ — listar por profissional (JWT)
    - GET /api/agendamentos_paciente/ — listar por paciente (JWT)
    - GET /api/agendamentos/<id>/ — detalhar
    - GET /api/horarios_ocupados/?profissional_id=&tipo=&data=YYYY-MM-DD — retorna horários ocupados

- Pagamentos / Stripe
    - POST /api/stripe/pagamento/ — cria sessão Stripe Checkout e salva session.id em Agendamento
        - Corpo: preco, nome_produto, profissional_id, usuario_id (opcional)
    - POST /api/stripe/webhook/ — webhook para processar eventos (checkout.session.completed). Atualiza agendamento para status 'paga' e envia email de confirmação.
    - POST /api/stripe/connect/onboarding/<id>/ — cria conta Stripe Connect (express) e retorna link de onboarding
    - GET /api/stripe/connect/status/<id>/ — checa status da conta connect
    - POST /api/stripe/estorno/<agendamento_id>/ — cria refund e altera status do agendamento para 'cancelado'

- Prontuários
    - GET /api/prontuarios/ — lista prontuários conforme role
    - GET/PATCH /api/prontuarios/<id>/ — detalhar/editar (edição permitida somente ao psiquiatra responsável)

Exemplo de payload (criar agendamento):
{
    "usuario": 1,
    "psiquiatra": 5,
    "data_hora": "2025-09-12T14:30:00Z",
    "observacoes": "Consulta inicial"
}

## 6. Fluxos principais

6.1 Autenticação
- Cadastro: usuário envia dados -> backend valida (CPF, CRM/CRP quando necessário) -> senha é hashada com make_password -> usuário criado -> RefreshToken.for_user(usuario) gera token de acesso
- Login: valida senha com check_password -> retorna token e cookie `jwt` (httponly recomendado)
- Proteção: o projeto usa SimpleJWT (REST_FRAMEWORK DEFAULT_AUTHENTICATION_CLASSES) mas também decodifica tokens manualmente em várias views; recomenda-se padronizar.

6.2 Agendamento
- Usuário seleciona profissional, data/hora -> requisição POST /api/agendamentos/criar/ -> backend valida conflitos em bloco de 30 minutos -> gera link Jitsi Meet automaticamente -> cria agendamento com status 'pendente'

6.3 Pagamento (Stripe)
- Frontend cria requisição a POST /api/stripe/pagamento/ com preço e profissional_id -> backend cria sessão Stripe Checkout com transfer_data (Split: 80% profissional, 20% plataforma) -> backend salva session.id no agendamento pendente -> redireciona usuário para session.url
- Webhook `checkout.session.completed` processa evento, localiza agendamento por session_id, marca como 'paga', salva link se necessário e envia e-mail de confirmação

6.4 Estorno
- Endpoint POST /api/stripe/estorno/<agendamento_id>/ recupera session -> payment_intent -> stripe.Refund.create(...) -> marca agendamento como 'cancelado' e notifica paciente por e-mail

## 7. Frontend — páginas e integração

Principais páginas (em `frontend/app`):
- `cadastro_usuario/page.tsx` — formulário de cadastro chama `/cadastrar_usuario/`
- `login/page.tsx` — chama `/login_usuario/` (ou `/api/token/` de SimpleJWT)
- `psicologia/`, `psiquiatria/` — listagens de profissionais (consomem `/api/psicologos/` e `/api/psiquiatras/`)
- `agendamento/[id]/` — tela de agendamento; ao confirmar chama criação de agendamento e em seguida /pagamento
- `pagamentotst/` e `pagamentoplano/` — páginas de teste/integração com Stripe
- `meu_perfil_*` — perfis e links para criar Stripe Connect onboarding

O frontend usa `app/utils/backend.ts` para obter a base URL do backend e `context/authContext.js` para gerenciar token localmente.

## 8. Configuração e execução local (desenvolvimento)

Requisitos:
- Python 3.11+ (compatível com Django 5.x)
- Node.js 18+ / npm
- MySQL local ou container

Passos (PowerShell):
```powershell
cd d:\Faculdade\TCC\backend
python -m venv .venv
.\.venv\Scripts\Activate; pip install -r requirements.txt
copy .env.example .env  # criar .env com variáveis (SECRET_KEY, STRIPE keys, DB creds, EMAIL creds)
python manage.py migrate
python manage.py runserver

cd ..\frontend
npm install
npm run dev
```

Observação: crie um `.env` no backend com chaves:
- SECRET_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY, STRIPE_WEBHOOK_SECRET, EMAIL_HOST_PASSWORD, DATABASE credentials

## 9. Segurança e boas práticas (recomendações imediatas)

1. Segredos: remover `SECRET_KEY`, `STRIPE_*` e `EMAIL_HOST_PASSWORD` do `settings.py` e usar variáveis de ambiente (`.env`) — já existe `.env` no repositório, mas `settings.py` contém valores hard-coded.
2. Usuário customizado: definir `AUTH_USER_MODEL = 'app_projeto.Usuario'` se `Usuario` deve ser o user principal; caso contrário, usar `django.contrib.auth.models.User` consistentemente.
3. Normalizar roles: padronizar valores de `role` (ex.: sempre minúsculo) e ajustar verificações em `permissions.py` (atualmente compara com minúsculas enquanto models usam capitalizado).
4. Padronizar autenticação: confiar no `JWTAuthentication` do DRF e remover decodificações manuais repetidas nas views; usar `@permission_classes` e `request.user` quando possível.
5. CSRF / Cookies: ajustar `CSRF_COOKIE_SECURE`, `SESSION_COOKIE_SECURE` e `CSRF_COOKIE_SAMESITE` conforme ambiente (localhost vs produção HTTPS).
6. Webhook: proteger webhook verificando assinatura com `STRIPE_WEBHOOK_SECRET` (o projeto já faz checagem quando a secret existe).

## 10. Backlog, Sprints e Cronograma (resumido)

Sprint 1 (2 semanas): Autenticação, Cadastro, Verificação de Email, Listagem de Profissionais
Sprint 2 (2 semanas): Tela de Agendamento, Verificação de conflitos, geração de link Jitsi
Sprint 3 (3 semanas): Integração com Stripe (Checkout + Connect), Webhook, Emails de confirmação
Sprint 4 (2 semanas): Painel do Profissional, Planos de assinatura, cobrança recorrente (integração futura)

Estimativas: já incluídas na documentação anterior (Login:20h, Pagamento:50h, Planos:60h).

## 11. Conclusão

Esta documentação consolida o que foi desenvolvido até 2025-09-08. O sistema já possui modelos, endpoints principais, integração com Stripe (checkout, connect, webhooks), geração de link de videoconferência, envio de e-mails (via SMTP) e funcionalidade de prontuário mínimo. Ainda há pontos de melhoria (segurança de segredos, padronização do modelo de usuário, centralização da autenticação) que recomendo priorizar antes de mover para produção.

## 12. Referências

- Django documentation — https://docs.djangoproject.com/
- Django REST Framework — https://www.django-rest-framework.org/
- Stripe API docs — https://stripe.com/docs/api
- Next.js — https://nextjs.org/

---

## Arquivos e locais importantes do projeto (resumo rápido)

- Backend: `d:\Faculdade\TCC\backend`
    - `app_projeto/models.py` — modelos Usuario, Agendamento, Prontuario, Endereco
    - `app_projeto/views.py` — endpoints principais (autenticação, agendamento, stripe, prontuários)
    - `back_projeto/settings.py` — configurações do Django (ver segredos)
    - `back_projeto/urls.py` — mapeamento das rotas

- Frontend: `d:\Faculdade\TCC\frontend`
    - `app/` — páginas (home, login, cadastro, agendamento, planos, pagamentos)
    - `app/utils/backend.ts` — função `getBackendUrl()`
    - `context/authContext.js` — contexto de autenticação

---

Se quiser, eu posso agora:
1) Fazer revisão ortográfica/formatar o Markdown e gerar sumário com âncoras; ou
2) Gerar diagramas (PlantUML) para casos de uso, DER e sequência e salvar SVGs em `docs/`; ou
3) Implementar correções recomendadas no backend (mover segredos para `.env`, corrigir roles, ajustar `AUTH_USER_MODEL`) — para isso preciso confirmar que quer que eu altere o código.

Diga qual ação prefere que eu execute em seguida e eu procedo.
