# TodoList-FrontEnd


## Visão geral

Aplicação frontend de lista de tarefas organizada em um quadro com os estados
`ToDo`, `Doing` e `Done`. O usuário pode criar, editar, excluir e mover tarefas,
configurar alarmes e cadastrar destinatários para avisos enviados pelo EmailJS.

### Formulários de tarefas e validação

O formulário de criação/edição é renderizado por
[BoardView.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/views/BoardView.js:24).
Ele contém `title`, `description` e `dueDate`; os três campos usam `required`, e
`dueDate` usa `datetime-local` ([BoardView.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/views/BoardView.js:26)).
Essa é uma validação nativa do navegador, não uma validação de domínio.

O envio é interceptado por `preventDefault` em
[AppController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/AppController.js:95)
e encaminhado ao `TaskController`
([AppController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/AppController.js:106)).
Na criação, [TaskController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/TaskController.js:66)
monta os valores e cria `new Task(values)`; na edição, chama `board.updateTask`.
Em ambos os caminhos, a persistência ocorre imediatamente em
`saveBoard(this.board)` ([TaskController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/TaskController.js:80)).

Não existe validação prévia no `TaskController`, `TaskModel` ou `BoardModel` para
espaços em branco, formato/validade da data, data passada, tamanho dos textos ou
coerência entre os campos. O modelo ainda converte valores ausentes para strings
vazias ([TaskModel.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/models/TaskModel.js:25)),
e o método de edição atribui os três valores diretamente
([BoardModel.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/models/BoardModel.js:123)).

A camada de persistência apenas serializa as tarefas e grava no `localStorage`
([StorageService.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/services/StorageService.js:1));
não faz sanitização ou validação. Portanto, a conclusão é: **existe validação
HTML nativa enquanto o formulário é submetido pelo navegador, mas não existe
validação robusta antes de criar/editar e armazenar a tarefa**. Uma chamada
direta ao controlador/modelo pode persistir dados inválidos.

O formulário de edição reutiliza o mesmo `#taskForm`: `editTask` preenche os
campos e define `data-editing-id`
([TaskController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/TaskController.js:157)).
Não há um componente separado de edição.

Como contexto relacionado, o formulário de destinatários também usa `required` e
`type="email"` ([EmailSettingsView.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/views/EmailSettingsView.js:8)),
mas o modelo aplica validações adicionais: remove espaços, normaliza o e-mail e
impede duplicatas ([EmailSettingsModel.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/models/EmailSettingsModel.js:6)).
Alarmes têm validação no controlador para minutos positivos e horário futuro
([TaskController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/TaskController.js:88)).

## Stack e estrutura

- HTML, CSS e JavaScript puro com módulos ES (`import`/`export`).
- Arquitetura MVC: `models/` contém estado e regras; `views/` renderiza HTML;
  `controllers/` coordena eventos; `services/` encapsula persistência, alarmes e
  EmailJS.
- [script.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/script.js)
  inicializa o [AppController.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/controllers/AppController.js).
- [services/StorageService.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/services/StorageService.js)
  usa as chaves `board` e `emailSettings` do Local Storage.
- `components/`, `styles/` e `assets/` contêm estilos, ícones e fontes; `tests/`
  contém os testes Node.js.

## Como executar

Não há npm nem processo de build. Como o projeto usa módulos JavaScript, sirva a
raiz por HTTP:

```bash
python3 -m http.server 5500
```

Abra `http://localhost:5500`. Para avisos de e-mail, configure os identificadores
públicos do EmailJS em
[EmailConfig.js](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/services/email/EmailConfig.js),
conforme detalhado no [README.md](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/README.md).

## Como testar

Execute:

```bash
node --test tests/*.test.mjs
```

Resultado da análise: **39 testes aprovados, 0 falhas**.

## Convenções

- Use módulos ES e mantenha a separação MVC existente.
- Alterações de tarefas passam pelo `TaskController`/`BoardModel` e persistem por
  `StorageService`; não grave diretamente no `localStorage`.
- Preserve os status `ToDo`, `Doing` e `Done` e os nomes das chaves de persistência.
- Ao alterar comportamento, atualize os testes correspondentes em `tests/`.
- Consulte o [README.md](/home/athus/Desktop/ZG/trilhasAcelera/k1/K1T6/TodoList-Front/README.md)
  para limitações, configuração do EmailJS e detalhes funcionais.
