# Todo List Application

Aplicação frontend para criação e organização de tarefas em um quadro com os status **ToDo**, **Doing** e **Done**.

O projeto utiliza HTML, CSS e JavaScript puro. As tarefas e configurações são persistidas no Local Storage, e o EmailJS envia avisos quando uma tarefa entra na janela de 24 horas antes do prazo.

## Funcionalidades

- Criar, editar e excluir tarefas.
- Mover tarefas entre ToDo, Doing e Done.
- Selecionar várias tarefas e alterar seus status simultaneamente.
- Criar alarmes por quantidade de minutos antes do prazo.
- Persistir tarefas e configurações no Local Storage.
- Cadastrar destinatários de e-mail.
- Escolher um destinatário e ligar ou desligar o aviso de cada tarefa.
- Enviar um e-mail uma única vez dentro das 24 horas anteriores ao prazo.

## Arquitetura MVC

```text
controllers/
├── AppController.js
├── EmailController.js
└── TaskController.js

models/
├── AlarmModel.js
├── BoardModel.js
├── EmailSettingsModel.js
└── TaskModel.js

views/
├── BoardView.js
├── EmailSettingsView.js
├── HeaderView.js
└── TaskCardView.js

services/
├── AlarmService.js
├── StorageService.js
└── email/
    ├── EmailConfig.js
    ├── EmailNotificationService.js
    ├── EmailSchedulerService.js
    └── EmailService.js
```

- **Models:** armazenam o estado e as regras das tarefas, alarmes, board e destinatários.
- **Views:** recebem dados e produzem o HTML exibido na página.
- **Controllers:** recebem as ações do usuário e coordenam models, views e services.
- **Services:** isolam Local Storage, alarmes e integração com EmailJS.
- **`script.js`:** inicia o `AppController`.

## Como executar

O projeto não utiliza npm nem possui processo de build. Como utiliza módulos JavaScript (`import` e `export`), ele deve ser executado por meio de um servidor local.

Você pode abrir o `index.html` utilizando a extensão **Live Server** do VS Code ou iniciar um servidor pela raiz do projeto:

```bash
python3 -m http.server 5500
# Inicia um servidor HTTP local na porta 5500.
```

Depois, acesse [http://localhost:5500](http://localhost:5500) no navegador.

## Configuração do EmailJS

Crie um serviço e um template no [EmailJS](https://www.emailjs.com/) e preencha os valores públicos em `services/email/EmailConfig.js`:

```javascript
export const EMAILJS_CONFIG = {
	serviceId: "SEU_SERVICE_ID",
	templateId: "SEU_TEMPLATE_ID",
	publicKey: "SUA_PUBLIC_KEY"
};
```

O template deve utilizar estas variáveis:

```text
{{email}}
{{name}}
{{task_title}}
{{task_description}}
{{due_date}}
```

O agendador verifica as tarefas a cada 60 segundos. Para o envio ocorrer, a aplicação precisa estar aberta e a tarefa deve:

- estar em ToDo ou Doing;
- possuir destinatário;
- ter o aviso de e-mail ligado;
- estar entre 24 horas antes do prazo e o próprio prazo.

O `publicKey`, `serviceId` e `templateId` são identificadores usados pelo frontend. Nunca coloque senha do e-mail, private key ou credencial SMTP no projeto.

## Local Storage

A aplicação utiliza duas chaves:

- `board`: tarefas e seus alarmes/configurações de e-mail;
- `emailSettings`: destinatários cadastrados e última seleção.

## Testes

Execute todos os testes com:

```bash
node --test tests/*.test.mjs
# Executa os testes dos models, views, controllers e services.
```

## Limitações

- Os dados ficam armazenados apenas no navegador atual.
- O envio de e-mail depende da aplicação permanecer aberta.
- Como não existe backend, duas abas abertas simultaneamente não compartilham um bloqueio de envio em andamento.
