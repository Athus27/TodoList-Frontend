# Notificações automáticas por e-mail — Design

## Objetivo

Integrar o TODO List ao EmailJS para enviar automaticamente um e-mail 24 horas antes do prazo de uma tarefa. O usuário poderá cadastrar vários destinatários, escolher um destinatário por tarefa e ligar ou desligar a notificação de cada tarefa.

## Experiência do usuário

- O cabeçalho principal terá um botão com `mailConfig.svg` para abrir o cadastro de destinatários.
- O cabeçalho do board terá um botão com `mail.svg` para mostrar ou ocultar os controles de e-mail em cada tarefa.
- O painel permitirá cadastrar destinatários com nome e e-mail e exibirá os destinatários já cadastrados.
- Cada `TaskCard`, quando o modo de configuração estiver aberto, terá um seletor de destinatário e um toggle com `on.svg`/`of.svg`.
- A última escolha de destinatário ficará memorizada e será sugerida para tarefas ainda não configuradas.
- Uma tarefa com e-mail ativo mostrará `mailSend.svg` abaixo da data no `TaskCard`.
- O envio ocorrerá uma única vez quando a aplicação estiver aberta e o horário atual entrar na janela entre 24 horas antes do prazo e o próprio prazo.

## Modelo de dados

As configurações globais ficam separadas das tarefas e são persistidas na chave `emailSettings` do `localStorage`:

```text
EmailSettings
├── recipients: [{ id, name, email }]
└── lastRecipientId
```

Cada `Task` guarda apenas sua associação e o controle contra duplicidade:

```text
Task
├── emailNotificationEnabled
├── emailRecipientId
└── emailNotifiedDueDate
```

`emailNotifiedDueDate` recebe o valor exato de `task.dueDate` somente depois que o EmailJS confirma o envio. Assim, o mesmo prazo não é enviado duas vezes; se o prazo for editado, o novo valor volta a ser elegível.

## Arquitetura

- `EmailSettingsModel` administra destinatários e a última seleção.
- `storage.js` mantém `board` e `emailSettings` em chaves separadas.
- `EmailSettingsPanel` apenas renderiza a interface de configuração.
- `email-notifications.js` decide quais tarefas estão na hora de notificar.
- `email-service.js` é o único arquivo que conhece EmailJS, Service ID, Template ID e Public Key.
- `script.js` coordena interface, models, persistência e o intervalo de verificação.

## Regras

- Não usar reCAPTCHA no template automático.
- Não colocar senha, secret key ou credencial SMTP no frontend.
- Service ID, Template ID e Public Key do EmailJS podem ser usados no frontend; nenhuma private key será adicionada.
- Tarefas `Done`, notificações desligadas, destinatários ausentes, datas inválidas e prazos já vencidos não geram envio.
- Um envio em andamento não pode ser iniciado novamente pelo próximo ciclo do intervalo.
- Falhas de rede não marcam a tarefa como notificada; ela poderá ser tentada novamente no ciclo seguinte.
- A aplicação precisa permanecer aberta para executar o envio, pois não existe backend ou agendador externo.

## Abordagens consideradas

- **Configurações globais separadas — escolhida:** evita duplicar nome/e-mail e permite reutilizar um destinatário em várias tarefas.
- Copiar destinatário para cada tarefa: seria inicialmente simples, mas duplicaria dados e dificultaria correções.
- Guardar associação apenas no DOM: seria perdida ao recarregar e não atenderia à persistência esperada.

