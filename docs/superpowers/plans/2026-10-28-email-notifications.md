# Notificações Automáticas por E-mail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cadastrar destinatários e enviar, pelo EmailJS, um aviso automático e único 24 horas antes do prazo das tarefas que tiverem notificação ligada.

**Architecture:** Destinatários são administrados por um model global e persistidos separadamente do board. Cada tarefa referencia um destinatário por ID; um coletor puro identifica notificações vencendo e um adaptador isolado envia pelo EmailJS. `script.js` coordena o painel, os toggles, a persistência e o agendador.

**Tech Stack:** HTML, CSS, JavaScript ES Modules, Local Storage, EmailJS Browser SDK v4 via CDN e Node.js Test Runner.

**Spec:** `docs/superpowers/specs/2026-10-28-email-notifications-design.md`

## Global Constraints

- Não usar reCAPTCHA no template de envio automático.
- Não armazenar senha, SMTP password, secret key ou private key no repositório.
- Manter compatibilidade com tarefas antigas já salvas no `localStorage`.
- Enviar no máximo um e-mail por tarefa para cada valor de `dueDate`.
- Não quebrar CRUD, alarmes nem alteração de status em lote.
- A aplicação precisa estar aberta para o agendador funcionar.

## Review Focus

- Recarregar tarefas antigas sem os novos campos deve aplicar valores padrão sem erro.
- O mesmo prazo não pode gerar dois e-mails, mesmo com vários ciclos do intervalo.
- Falha do EmailJS não pode marcar a notificação como enviada.
- Destinatário excluído ou inexistente deve impedir o envio e deixar a aplicação estável.
- Editar `dueDate` depois de um envio deve permitir uma notificação para o novo prazo.

---

## Mapa de arquivos

### Criar

- `models/EmailSettingsModel.js`: cadastro e consulta de destinatários.
- `components/EmailSettingsPanel.js`: HTML do painel global.
- `components/EmailSettingsPanel.css`: layout do painel, lista e toggles.
- `scripts/email-config.js`: IDs públicos usados pelo EmailJS.
- `scripts/email-service.js`: inicialização e envio pelo EmailJS.
- `scripts/email-notifications.js`: regra temporal de 24 horas.
- `tests/email-settings.test.mjs`: comportamento do cadastro.
- `tests/email-notifications.test.mjs`: elegibilidade e duplicidade.
- `tests/email-service.test.mjs`: parâmetros enviados ao EmailJS.
- `tests/email-components.test.mjs`: controles renderizados.

### Modificar

- `index.html`: carregar o SDK do EmailJS.
- `style.css`: importar o CSS do painel.
- `components/Board.js`: adicionar o botão `mailConfig.svg` e renderizar o painel.
- `components/TaskCard.js`: mostrar `mailSend.svg` quando a notificação estiver ativa.
- `components/Board.css` e `components/TaskCard.css`: estilos dos ícones.
- `models/TaskModel.js`: adicionar configuração e marcador de envio.
- `models/BoardModel.js`: atualizar configuração de e-mail de uma tarefa.
- `scripts/storage.js`: salvar e carregar `emailSettings`.
- `script.js`: coordenar formulário, toggles, destinatários e envio automático.
- `tests/components.test.mjs`: preservar os testes atuais e cobrir o novo indicador.

---

### Task 0: Estrutura visual do painel de e-mail

**Explicação:** Você começará pelo frontend, como pediu. Nesta etapa o painel ainda não salva nem envia nada: ele recebe arrays simples e prova somente a aparência e a estrutura dos controles.

**Files:**
- Create: `components/EmailSettingsPanel.js`
- Create: `components/EmailSettingsPanel.css`
- Create: `tests/email-components.test.mjs`
- Modify: `components/Board.js`
- Modify: `components/Board.css`
- Modify: `style.css`

**Interfaces:**
- Produces: `EmailSettingsPanel(tasks, emailSettings, isOpen): string`
- Produces no HTML: `#emailRecipientForm`, `.email-recipient-list`, `.task-email-setting`, `.task-email-recipient` e `.task-email-toggle`.

- [ ] **Step 1: Escrever testes de renderização**

Cobrir painel aberto/fechado, destinatário cadastrado, todas as tasks, opções do select e imagens `on.svg`/`of.svg`.

- [ ] **Step 2: Executar e confirmar as falhas esperadas**

```bash
node --test tests/email-components.test.mjs
# Demonstra que o componente e seus controles ainda não existem.
```

- [ ] **Step 3: Implementar os três blocos do componente**

Criar formulário de nome/e-mail, lista de destinatários e lista de tasks com select e toggle. Use dados recebidos por parâmetro; não leia `localStorage` dentro do componente. Não criar eventos nesta etapa.

- [ ] **Step 4: Adicionar `mailConfig.svg` ao cabeçalho do board**

Alterar `Board` para receber `emailSettings` e `isEmailSettingsOpen`, renderizando o componente logo abaixo do cabeçalho.

- [ ] **Step 5: Implementar CSS responsivo e verificar sintaxe**

```bash
node --test tests/email-components.test.mjs
# Confirma a estrutura do painel estático.
node --check components/EmailSettingsPanel.js
# Verifica a sintaxe JavaScript do novo componente.
```

- [ ] **Step 6: Commit da etapa visual**

```bash
git add components/EmailSettingsPanel.js components/EmailSettingsPanel.css components/Board.js components/Board.css style.css tests/email-components.test.mjs
# Prepara somente a primeira versão visual do painel.
git commit -m "feat(email): criar painel de configurações"
# Registra o frontend estático antes das regras de negócio.
```

---

### Task 1: Model de destinatários e persistência separada

**Explicação:** Esta etapa cria a fonte de verdade dos e-mails. As tarefas não copiarão nome e endereço; guardarão apenas o ID do destinatário.

**Files:**
- Create: `models/EmailSettingsModel.js`
- Modify: `scripts/storage.js`
- Test: `tests/email-settings.test.mjs`

**Interfaces:**
- Produces: `new EmailSettingsModel(data?)`
- Produces: `addRecipient({ name, email }): recipient`
- Produces: `getRecipient(recipientId): recipient | null`
- Produces: `removeRecipient(recipientId): boolean`
- Produces: `setLastRecipient(recipientId): boolean`
- Produces: `saveEmailSettings(settings): void`
- Produces: `loadEmailSettings(): object | null`

- [ ] **Step 1: Escrever testes falhando do model**

Cobrir: cadastro com ID único, normalização de espaços, rejeição de nome/e-mail vazio, consulta por ID, remoção, impedimento de e-mail duplicado e atualização de `lastRecipientId`.

- [ ] **Step 2: Executar o teste e confirmar a falha pela ausência do model**

```bash
node --test tests/email-settings.test.mjs
# Executa somente os testes do cadastro de destinatários.
```

- [ ] **Step 3: Implementar `EmailSettingsModel`**

O construtor deve reconstruir dados do `localStorage`. Gere o próximo ID numérico a partir do maior ID existente, sem depender apenas de variável estática.

- [ ] **Step 4: Testar persistência na chave `emailSettings`**

Use um `localStorage` falso no teste e verifique que salvar configurações não altera a chave `board`.

- [ ] **Step 5: Executar os testes até passarem**

```bash
node --test tests/email-settings.test.mjs
# Confirma o cadastro, a consulta e a persistência separada.
```

- [ ] **Step 6: Commit da etapa**

```bash
git add models/EmailSettingsModel.js scripts/storage.js tests/email-settings.test.mjs
# Prepara apenas o model, o storage e seus testes.
git commit -m "feat(email): adicionar cadastro de destinatários"
# Registra a primeira parte independente da integração.
```

---

### Task 2: Configuração de e-mail dentro de cada tarefa

**Explicação:** A tarefa passa a saber se a notificação está ligada, qual destinatário utilizar e para qual prazo o e-mail já foi enviado.

**Files:**
- Modify: `models/TaskModel.js`
- Modify: `models/BoardModel.js`
- Create: `tests/task-email-settings.test.mjs`

**Interfaces:**
- Produces: `Task.emailNotificationEnabled: boolean`
- Produces: `Task.emailRecipientId: number | null`
- Produces: `Task.emailNotifiedDueDate: string | null`
- Produces: `BoardModel.updateTaskEmailSettings(taskId, { enabled, recipientId }): boolean`
- Produces: `BoardModel.markEmailNotificationSent(taskId, dueDate): boolean`

- [ ] **Step 1: Escrever testes falhando dos valores padrão**

Uma tarefa antiga, criada sem campos de e-mail, deve resultar em `false`, `null` e `null`. Uma tarefa carregada deve preservar valores existentes.

- [ ] **Step 2: Escrever testes falhando dos métodos do board**

Cobrir: ativar com destinatário, desativar, rejeitar task inexistente e marcar envio somente quando `dueDate` ainda corresponde ao prazo atual.

- [ ] **Step 3: Executar e confirmar as falhas esperadas**

```bash
node --test tests/task-email-settings.test.mjs
# Demonstra que os novos campos e métodos ainda não existem.
```

- [ ] **Step 4: Implementar os campos e os dois métodos**

Ao editar `dueDate`, não é necessário apagar manualmente o marcador: o coletor compara `emailNotifiedDueDate` com o valor atual de `dueDate`.

- [ ] **Step 5: Executar os testes da etapa e toda a suíte existente**

```bash
node --test tests/task-email-settings.test.mjs tests/*.test.mjs
# Verifica a feature nova e confirma que as anteriores continuam funcionando.
```

- [ ] **Step 6: Commit da etapa**

```bash
git add models/TaskModel.js models/BoardModel.js tests/task-email-settings.test.mjs
# Prepara a configuração de e-mail das tarefas.
git commit -m "feat(tasks): adicionar configuração de notificação por email"
# Registra os novos campos e regras do board.
```

---

### Task 3: Regra de envio 24 horas antes do prazo

**Explicação:** Este arquivo decide *quando* enviar, sem conhecer EmailJS nem alterar o DOM. Separar essa regra permite testar datas com precisão.

**Files:**
- Create: `scripts/email-notifications.js`
- Create: `tests/email-notifications.test.mjs`

**Interfaces:**
- Produces: `collectDueEmailNotifications(tasks, now = new Date()): Task[]`

- [ ] **Step 1: Escrever os casos temporais falhando**

Cobrir literalmente:

- `now` anterior a `dueDate - 24h`: não retorna.
- `now` exatamente em `dueDate - 24h`: retorna.
- `now` entre o aviso e o prazo: retorna.
- `now` igual ou posterior ao prazo: não retorna.
- task `Done`: não retorna.
- toggle desligado: não retorna.
- destinatário `null`: não retorna.
- data inválida: não retorna.
- `emailNotifiedDueDate === dueDate`: não retorna.
- `emailNotifiedDueDate` pertence ao prazo antigo: retorna para o novo prazo.

- [ ] **Step 2: Executar e confirmar a falha pela função ausente**

```bash
node --test tests/email-notifications.test.mjs
# Executa todos os limites da janela de 24 horas.
```

- [ ] **Step 3: Implementar o coletor puro**

Calcule `notificationAt = dueDate.getTime() - 24 * 60 * 60 * 1000`. Não altere as tasks dentro do coletor; apenas retorne as elegíveis.

- [ ] **Step 4: Executar os testes até passarem**

```bash
node --test tests/email-notifications.test.mjs
# Confirma a regra temporal e a proteção contra duplicidade.
```

- [ ] **Step 5: Commit da etapa**

```bash
git add scripts/email-notifications.js tests/email-notifications.test.mjs
# Prepara a regra pura e seus testes de data.
git commit -m "feat(email): identificar tarefas próximas do prazo"
# Registra o agendamento de 24 horas.
```

---

### Task 4: Adaptador do EmailJS

**Explicação:** Somente este módulo conversará com o serviço externo. O restante da aplicação trabalhará com funções próprias e não dependerá diretamente de `window.emailjs`.

**Files:**
- Create: `scripts/email-config.js`
- Create: `scripts/email-service.js`
- Create: `tests/email-service.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Produces: `EMAILJS_CONFIG: { publicKey, serviceId, templateId }`
- Produces: `buildDeadlineEmailParams(task, recipient): object`
- Produces: `initEmailService(emailClient = window.emailjs): void`
- Produces: `sendDeadlineEmail(task, recipient, emailClient = window.emailjs): Promise<object>`

- [ ] **Step 1: Escrever teste falhando do mapeamento do template**

Verifique estes nomes exatos, iguais ao template configurado:

```text
email
name
task_title
task_description
due_date
```

- [ ] **Step 2: Escrever teste falhando do envio com cliente falso**

O cliente falso deve registrar `serviceId`, `templateId`, parâmetros e `publicKey`. O teste deve verificar a chamada real ao método `send`, sem rede.

- [ ] **Step 3: Executar e confirmar as falhas esperadas**

```bash
node --test tests/email-service.test.mjs
# Confirma que o adaptador ainda não foi implementado.
```

- [ ] **Step 4: Criar configuração e adaptador**

Preencha apenas os IDs públicos fornecidos pelo painel EmailJS. Nunca coloque Gmail password, SMTP password, private key ou secret do reCAPTCHA.

- [ ] **Step 5: Carregar o SDK antes de `script.js`**

Adicionar ao `index.html` o CDN oficial do EmailJS Browser v4. Manter `script.js` como módulo carregado depois do SDK.

- [ ] **Step 6: Executar os testes da etapa**

```bash
node --test tests/email-service.test.mjs
# Verifica os parâmetros e a chamada ao SDK sem enviar e-mail real.
```

- [ ] **Step 7: Commit da etapa**

```bash
git add index.html scripts/email-config.js scripts/email-service.js tests/email-service.test.mjs
# Prepara o SDK, a configuração pública e o adaptador testado.
git commit -m "feat(email): integrar cliente EmailJS"
# Registra a integração isolada com o serviço externo.
```

---

### Task 5: Conectar o painel aos dados modelados

**Explicação:** O painel criado na Task 0 deixa de usar apenas fixtures e passa a refletir destinatários e configurações reais reconstruídas pelos models.

**Files:**
- Modify: `components/EmailSettingsPanel.js`
- Modify: `components/EmailSettingsPanel.css`
- Modify: `tests/email-components.test.mjs`
- Modify: `components/Board.js`
- Modify: `components/Board.css`
- Modify: `style.css`

**Interfaces:**
- Produces: `EmailSettingsPanel(tasks, emailSettings, isOpen): string`
- Produces no HTML: `#emailRecipientForm`, `.email-recipient-list`, `.task-email-setting`, `.task-email-recipient`, `.task-email-toggle`.
- Consumes: `mailConfig.svg`, `on.svg` e `of.svg`.

- [ ] **Step 1: Ampliar os testes de renderização**

Cobrir: botão de configuração no cabeçalho do board, painel fechado, painel aberto, formulário de nome/e-mail, destinatários cadastrados, todas as tasks, seletor com escolha atual e ícone correto para on/off.

- [ ] **Step 2: Executar e confirmar as falhas**

```bash
node --test tests/email-components.test.mjs
# Verifica a estrutura HTML esperada antes de criá-la.
```

- [ ] **Step 3: Adaptar o componente e a integração com `Board`**

Alterar a assinatura para `Board(tasks, emailSettings, isEmailSettingsOpen)`. O botão `mailConfig.svg` chama `toggleEmailSettingsPanel()`.

- [ ] **Step 4: Implementar o CSS do painel**

Organizar três regiões: formulário, destinatários cadastrados e configurações por tarefa. Em telas pequenas, usar uma coluna; em telas largas, permitir duas colunas sem reduzir a legibilidade.

- [ ] **Step 5: Executar testes e checar sintaxe**

```bash
node --test tests/email-components.test.mjs tests/components.test.mjs
# Confirma o painel novo e preserva a renderização anterior.
node --check components/EmailSettingsPanel.js
# Verifica a sintaxe do componente.
```

- [ ] **Step 6: Commit da etapa**

```bash
git add components/EmailSettingsPanel.js components/EmailSettingsPanel.css components/Board.js components/Board.css style.css tests/email-components.test.mjs tests/components.test.mjs
# Prepara o painel, seus estilos e testes.
git commit -m "feat(email): adicionar painel de notificações"
# Registra a interface global de configuração.
```

---

### Task 6: Indicador de e-mail no TaskCard

**Explicação:** O ícone no card não envia nada. Ele comunica que aquela tarefa está configurada para enviar um aviso 24 horas antes.

**Files:**
- Modify: `components/TaskCard.js`
- Modify: `components/TaskCard.css`
- Modify: `tests/components.test.mjs`

**Interfaces:**
- Consumes: `task.emailNotificationEnabled` e `task.emailRecipientId`.
- Produces no HTML: `.task-email-indicator` usando `mailSend.svg`.

- [ ] **Step 1: Escrever teste falhando do indicador**

Com toggle ligado e destinatário definido, deve renderizar `mailSend.svg` e o texto acessível “E-mail programado para 24 horas antes”. Com toggle desligado ou destinatário ausente, não deve renderizar.

- [ ] **Step 2: Executar e confirmar a falha**

```bash
node --test tests/components.test.mjs
# Demonstra que o indicador ainda não aparece no card.
```

- [ ] **Step 3: Implementar o indicador abaixo de `.task-date`**

O ícone será apenas decorativo (`alt=""`); o texto acessível ficará em um `<span>`.

- [ ] **Step 4: Executar os testes até passarem**

```bash
node --test tests/components.test.mjs
# Confirma os estados visível e oculto do indicador.
```

- [ ] **Step 5: Commit da etapa**

```bash
git add components/TaskCard.js components/TaskCard.css tests/components.test.mjs
# Prepara o indicador visual do card.
git commit -m "feat(email): indicar aviso programado nas tarefas"
# Registra o estado visual da notificação.
```

---

### Task 7: Ligar painel, models e memória da última escolha

**Explicação:** Aqui os controles visuais passam a alterar dados reais. A última escolha é salva em `EmailSettings.lastRecipientId` e sugerida quando uma task ainda não tem destinatário.

**Files:**
- Modify: `script.js`
- Modify: `components/Board.js`
- Modify: `scripts/storage.js`
- Create: `tests/email-controller.test.mjs`

**Interfaces:**
- Consumes: interfaces das Tasks 1, 2 e 5.
- Produces no browser: `toggleEmailSettingsPanel()`, `setTaskEmailRecipient(taskId, recipientId)` e `toggleTaskEmailNotification(taskId)`.

- [ ] **Step 1: Extrair funções testáveis de coordenação**

Evitar testar diretamente `window`. Criar funções que recebam `board`, `emailSettings` e callbacks de persistência/renderização.

- [ ] **Step 2: Escrever testes falhando dos fluxos**

Cobrir: cadastrar destinatário; selecioná-lo em uma task; memorizar `lastRecipientId`; sugerir a última escolha numa task sem configuração; ligar toggle somente com destinatário válido; desligar sem apagar a escolha.

- [ ] **Step 3: Executar e confirmar as falhas**

```bash
node --test tests/email-controller.test.mjs
# Verifica a coordenação sem depender do navegador.
```

- [ ] **Step 4: Integrar eventos e renderização**

O submit de `#emailRecipientForm` adiciona o destinatário, salva `emailSettings` e renderiza. Alterações no select e toggle atualizam o board, salvam ambas as estruturas quando necessário e renderizam.

- [ ] **Step 5: Executar os testes da etapa e a suíte**

```bash
node --test tests/email-controller.test.mjs tests/*.test.mjs
# Confirma o fluxo completo dos controles e todas as regressões existentes.
```

- [ ] **Step 6: Commit da etapa**

```bash
git add script.js components/Board.js scripts/storage.js tests/email-controller.test.mjs
# Prepara a ligação entre painel, models e persistência.
git commit -m "feat(email): configurar destinatário por tarefa"
# Registra o comportamento dos controles do painel.
```

---

### Task 8: Agendador automático e proteção contra duplicidade

**Explicação:** Esta é a integração final. O intervalo encontra tarefas elegíveis, resolve seus destinatários e envia. Um `Set` temporário impede dois envios simultâneos enquanto a Promise do EmailJS ainda está pendente.

**Files:**
- Modify: `script.js`
- Create: `tests/email-scheduler.test.mjs`

**Interfaces:**
- Consumes: `collectDueEmailNotifications`, `sendDeadlineEmail`, `getRecipient` e `markEmailNotificationSent`.
- Produces: `processDueEmailNotifications({ board, emailSettings, pendingTaskIds, sendEmail, saveBoard }): Promise<result[]>`.

- [ ] **Step 1: Escrever testes falhando do processamento**

Cobrir: envio bem-sucedido marca `emailNotifiedDueDate`; falha não marca; destinatário inexistente não chama EmailJS; ID já presente em `pendingTaskIds` não envia novamente; o ID sempre sai do Set ao finalizar.

- [ ] **Step 2: Executar e confirmar as falhas**

```bash
node --test tests/email-scheduler.test.mjs
# Verifica sucesso, falha e concorrência antes da implementação.
```

- [ ] **Step 3: Implementar o processador e o intervalo**

Inicializar EmailJS uma vez ao carregar. Executar o processador a cada 60 segundos, não a cada segundo. Também executar uma vez após o carregamento para não esperar o primeiro minuto.

- [ ] **Step 4: Tratar resultado para o usuário**

Em sucesso, registrar uma mensagem curta no console. Em falha, registrar `console.error` com task ID, sem mostrar chaves nem dados secretos e sem interromper os alarmes existentes.

- [ ] **Step 5: Executar toda a suíte**

```bash
node --test tests/*.test.mjs
# Executa todos os testes antigos e novos da aplicação.
```

- [ ] **Step 6: Commit da etapa**

```bash
git add script.js tests/email-scheduler.test.mjs
# Prepara o agendador automático e seus testes.
git commit -m "feat(email): enviar alertas automáticos de prazo"
# Registra a integração final com o EmailJS.
```

---

### Task 9: Validação manual real e documentação

**Explicação:** Testes unitários não comprovam a conexão com Gmail/EmailJS. Esta etapa usa um prazo curto para validar a integração real sem esperar 24 horas.

**Files:**
- Modify: `README.md` (criar se ainda não existir)

- [ ] **Step 1: Validar configuração no painel EmailJS**

Confirmar que o template automático está sem reCAPTCHA e possui exatamente `email`, `name`, `task_title`, `task_description` e `due_date`.

- [ ] **Step 2: Servir a aplicação localmente**

```bash
python3 -m http.server 4173
# Disponibiliza a aplicação em http://localhost:4173 para o teste manual.
```

- [ ] **Step 3: Fazer um teste real controlado**

Temporariamente, no ambiente de teste, criar uma task cuja `dueDate` esteja dentro da janela de 24 horas e ainda no futuro. Cadastrar seu próprio e-mail, ligar o toggle e confirmar um único envio no Email History do EmailJS e na caixa de entrada.

- [ ] **Step 4: Validar persistência e proteção contra repetição**

Recarregar a página: destinatários, seleção e toggle devem permanecer. Aguardar dois ciclos do intervalo e confirmar que nenhum segundo e-mail foi enviado para o mesmo `dueDate`.

- [ ] **Step 5: Validar falha segura**

Usar temporariamente um Template ID inválido, confirmar que a task não recebe `emailNotifiedDueDate`, restaurar o ID correto e confirmar que o próximo ciclo consegue enviar.

- [ ] **Step 6: Documentar no README**

Registrar: EmailJS escolhido, funcionamento 24 horas antes, necessidade de a aplicação ficar aberta, configuração dos três IDs públicos, variáveis do template e passos para teste.

- [ ] **Step 7: Verificação final**

```bash
node --test tests/*.test.mjs
# Confirma que toda a suíte permanece verde após a integração real.
git diff --check
# Verifica espaços inválidos e marcadores de conflito no diff.
```

- [ ] **Step 8: Commit da documentação**

```bash
git add README.md
# Prepara a documentação de instalação e teste.
git commit -m "docs: documentar notificações por email"
# Registra as instruções exigidas pela atividade.
```

---

## Ordem de aprendizado

1. **Frontend estático:** veja primeiro o painel e os controles que você quer construir.
2. **Model e Local Storage:** aprenda onde os destinatários vivem.
3. **Task e associação por ID:** entenda por que não copiamos o e-mail em toda task.
4. **Regra temporal pura:** pratique datas sem misturar DOM ou serviço externo.
5. **Adaptador EmailJS:** veja como isolar uma dependência externa.
6. **Frontend conectado:** troque os dados de exemplo pelos models reais.
7. **Controller:** conecte eventos aos models e à persistência.
8. **Agendador:** una tudo somente quando as peças estiverem testadas.

Não avance duas etapas ao mesmo tempo. Em cada task, veja o teste falhar, implemente o mínimo e faça o teste passar antes de continuar.

