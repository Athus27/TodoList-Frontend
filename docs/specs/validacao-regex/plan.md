# Plano de implementação — Validação de tarefas (K1-T8)

As tarefas estão ordenadas por dependência. As tarefas 1, 2 e 3 estão
concluídas; as demais permanecem pendentes.

## 1. Criar as regras reutilizáveis de validação

- **Dependências:** nenhuma.
- [x] **O que será feito:** Implementar funções puras para validar prioridade e
  data de término conforme `spec.md`: Regex `^[1-5]$`, Regex de
  `datetime-local`, existência real da data e comparação estrita com o instante
  atual. As funções devem retornar resultado suficiente para diferenciar cada
  mensagem de erro.
- **Arquivos criados ou alterados:**
  - Criar `services/TaskValidation.js` (ou outro módulo de domínio equivalente,
    mantendo a separação MVC).
  - Criar `tests/task-validation.test.mjs`.
- **Como validar:** Executar `node --test tests/task-validation.test.mjs` e
  cobrir valores `1`, `5`, `0`, `6`, `01`, decimais, texto, datas válidas,
  formato inválido, datas inexistentes, data passada e instante atual. Verificar
  que a validação de data usa o horário local e aceita apenas o formato
  especificado.

## 2. Adicionar prioridade e mensagens ao formulário

- **Dependências:** tarefa 1, para alinhar os campos e mensagens às regras de
  validação.
- [x] **O que será feito:** Adicionar o campo de prioridade ao `#taskForm`,
  incluindo os atributos nativos adequados, e criar elementos de mensagem
  associados aos campos de prioridade e data. As mensagens devem ser visíveis,
  atualizáveis e identificáveis por tecnologias assistivas, sem alterar os
  formulários de e-mail ou alarmes.
- **Arquivos criados ou alterados:**
  - Alterar `views/BoardView.js`.
  - Alterar estilos existentes apenas se necessário para exibir estados de erro
    do formulário.
  - Atualizar ou criar testes de renderização em `tests/components.test.mjs`.
- **Como validar:** Executar os testes de componentes e verificar no HTML
  renderizado o campo de prioridade, os identificadores das mensagens e a
  associação entre cada campo e sua mensagem. No navegador, abrir o formulário
  e confirmar que criação e edição usam os mesmos elementos.

## 3. Preservar prioridade no modelo e no carregamento do board

- **Dependências:** tarefa 1, para definir o formato válido da prioridade; a
  tarefa 4 depende desta etapa.
- [x] **O que será feito:** Incluir prioridade no `Task`, preservar o valor no
  carregamento inicial feito pelo `script.js`/`AppController` e atualizar a
  prioridade durante edição sem remover alarmes, destinatário ou configuração de
  notificação. As tarefas antigas usadas na demonstração devem ser apenas
  atualizadas para conter uma prioridade válida; não será criada migração
  automática para todos os dados legados do `localStorage`.
- **Arquivos criados ou alterados:**
  - Alterar `models/TaskModel.js`.
  - Alterar `models/BoardModel.js`.
  - Atualizar testes de modelo existentes ou criar testes específicos em
    `tests/task-validation.test.mjs`/novo teste de modelo.
- **Como validar:** Testar criação e carregamento com prioridade, atualização de
  tarefa existente, preservação dos campos não editados e atualização dos dados
  de demonstração. Confirmar que `StorageService` continua usando a chave
  `board` e serializa a prioridade.

## 4. Integrar a validação no fluxo de criação e edição

- **Dependências:** tarefas 1, 2 e 3. O fluxo só deve criar ou atualizar tarefas
  depois que o campo existir na view e o modelo puder armazenar a prioridade.
- [ ] **O que será feito:** Validar os valores no envio antes de `new Task`,
  `board.updateTask` e `saveBoard`. Bloquear a operação quando houver erro,
  exibir a mensagem junto ao campo correspondente, limpar/atualizar mensagens
  quando os dados forem corrigidos e manter os valores anteriores em edições
  inválidas.
- **Arquivos criados ou alterados:**
  - Alterar `controllers/TaskController.js`.
  - Alterar `controllers/AppController.js` somente se for necessário repassar o
    instante atual ou coordenar a apresentação dos erros.
  - Ajustar `tests/controllers.test.mjs`.
- **Como validar:** Criar testes para submissão válida, cada erro de prioridade,
  cada erro de data, ausência de chamada a `saveBoard` quando inválido, criação
  bem-sucedida e edição inválida preservando os dados anteriores. Executar
  `node --test tests/controllers.test.mjs tests/task-validation.test.mjs`.

## 5. Completar a cobertura de regressão e aceitação

- **Dependências:** tarefas 1 a 4.
- [ ] **O que será feito:** Incorporar os critérios de aceite da especificação
  aos testes de componentes, controller e modelo, garantindo que as
  funcionalidades existentes de status, alarmes, e-mail, exclusão e seleção em
  lote não sejam afetadas.
- **Arquivos criados ou alterados:**
  - Alterar os testes relevantes em `tests/components.test.mjs`,
    `tests/controllers.test.mjs` e testes de modelo/integração necessários.
  - Não alterar testes de e-mail sem necessidade funcional.
- **Como validar:** Executar a suíte completa:
  `node --test tests/*.test.mjs`. O resultado esperado é zero falhas, incluindo
  os 39 testes existentes mais os novos casos da K1-T8. Verificar também que
  nenhum salvamento ocorre em entradas inválidas.

## 6. Executar verificação manual no navegador

- **Dependências:** tarefa 5.
- [ ] **O que será feito:** Validar o comportamento integrado em servidor local,
  cobrindo criação e edição, mensagens junto aos campos, prioridade válida e
  inválida, datas inexistentes e datas passadas. Confirmar a persistência e a
  manutenção de alarmes/configurações de e-mail.
- **Arquivos criados ou alterados:** Nenhum arquivo adicional; somente corrigir
  os arquivos das tarefas anteriores caso a verificação revele divergências.
- **Como validar:** Executar `python3 -m http.server 5500`, acessar
  `http://localhost:5500` e verificar manualmente:
  - prioridade `1` e `5` aceitas;
  - `0`, `6`, `01`, decimais e texto rejeitados;
  - data futura válida aceita;
  - formato inválido, data inexistente, data passada e instante atual rejeitados;
  - edição inválida não altera a tarefa;
  - edição válida preserva alarmes e configurações de e-mail;
  - recarregar a página mantém a prioridade no `localStorage`.
