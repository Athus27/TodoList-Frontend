# Especificação — Validação do formulário de tarefas (K1-T8)

## Contexto e objetivo

O TodoList-FrontEnd é uma aplicação frontend em HTML, CSS e JavaScript puro,
organizada em MVC. O formulário de tarefa é renderizado por
`views/BoardView.js` e o mesmo `#taskForm` é usado para criar e editar tarefas.
Atualmente, os campos de título, descrição e data de término usam apenas a
validação nativa `required`; `TaskController` encaminha os valores diretamente
para `Task` ou `BoardModel.updateTask`, e `StorageService` os persiste no
`localStorage`.

Esta mudança deve acrescentar ao formulário um campo de prioridade e validar,
antes de criar ou atualizar uma tarefa:

- prioridade inteira entre 1 e 5, usando Regex;
- formato da data de término, usando Regex;
- existência da data informada;
- data e horário de término posteriores ao momento atual.

Quando houver erro, o usuário deve receber uma mensagem junto ao campo
inválido, o salvamento deve ser interrompido e nenhum dado inválido deve ser
persistido.

## Regras de negócio

### Prioridade

1. A prioridade é obrigatória no formulário de tarefa.
2. O valor aceito deve ser exclusivamente um dígito de `1` a `5`.
3. A validação textual deve usar a Regex `^[1-5]$`.
4. Valores como `0`, `6`, `10`, `1.5`, sinais, espaços ou texto devem ser
   rejeitados.
5. A prioridade deve ser aplicada tanto na criação quanto na edição.
6. A prioridade deve ser preservada no objeto da tarefa e no `localStorage`.

### Data de término

1. A data de término é obrigatória.
2. O valor textual deve seguir o formato local produzido pelo campo
   `datetime-local`: `YYYY-MM-DDTHH:mm`.
3. A validação de formato deve usar a Regex
   `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`.
4. Depois da validação de formato, a data deve ser convertida e conferida
   quanto à existência real. Datas como `2026-02-30T10:00` devem ser
   rejeitadas, mesmo que o parser normalize o valor.
5. A comparação deve considerar data e horário completos, no fuso local do
   navegador.
6. A data de término deve ser estritamente posterior ao instante atual. Uma
   data no instante atual ou anterior deve ser rejeitada.
7. As mesmas regras devem ser aplicadas na criação e na edição.

### Persistência e fluxo

1. A validação deve ocorrer antes de `new Task(...)`, `board.updateTask(...)` e
   `saveBoard(...)`.
2. Se qualquer campo validado for inválido, a tarefa não deve ser criada nem
   atualizada.
3. Em uma edição inválida, os valores anteriormente persistidos devem
   permanecer inalterados.
4. Em uma submissão válida, o fluxo existente de renderização e persistência
   deve continuar funcionando.
5. A validação nativa existente (`required` e `datetime-local`) deve ser
   mantida como primeira barreira, sem substituir as validações de domínio.

## Mensagens de erro

As mensagens devem aparecer junto ao respectivo campo, ser visíveis e
descrever como corrigir o valor:

- Prioridade vazia: `Informe a prioridade.`
- Prioridade fora de 1 a 5: `A prioridade deve ser um número inteiro de 1 a 5.`
- Data vazia: `Informe a data de término.`
- Formato inválido: `Informe a data no formato AAAA-MM-DDTHH:MM.`
- Data inexistente: `Informe uma data de término válida.`
- Data passada ou igual ao momento atual:
  `A data de término deve ser posterior à data e hora atuais.`

Ao corrigir o valor, a mensagem correspondente deve ser removida ou atualizada.
O campo inválido deve permanecer identificável para tecnologias assistivas,
preferencialmente por meio de estado de erro e associação com a mensagem.

## Casos de borda

- `1` e `5` são válidos; `0` e `6` são inválidos.
- `01`, `10`, `1.0`, `1,5`, `+1` e `-1` são inválidos pela Regex da prioridade.
- Datas de meses inexistentes, dias fora do mês, como 30 de fevereiro, e horas
  ou minutos fora dos limites devem ser rejeitados.
- Uma data futura no calendário, mas com horário já ultrapassado no mesmo dia,
  deve ser rejeitada.
- Uma data exatamente igual ao instante de validação deve ser rejeitada.
- A validação deve ser repetida no envio, mesmo que o usuário tenha alterado o
  valor depois da validação nativa do navegador.
- A edição de uma tarefa existente deve validar os novos dados sem apagar os
  alarmes e as configurações de e-mail já associados, salvo comportamento
  existente explicitamente definido fora desta mudança.
- As tarefas antigas usadas para demonstração devem ser apenas atualizadas para
  conter uma prioridade válida, preservando seus demais dados.
- Não é necessário criar uma migração automática para todos os registros antigos
  já existentes no `localStorage`; dados legados fora da demonstração não fazem
  parte desta entrega.
- O carregamento inicial não deve quebrar por causa de uma tarefa antiga sem
  prioridade, mas uma nova criação ou edição só pode ser salva com prioridade
  válida.

## Critérios de aceite

### Prioridade

#### Cenário 1 — Criar tarefa com prioridade válida

**Given** que o formulário de tarefa está aberto para criação  
**And** a prioridade informada é `3`  
**And** a data de término tem formato válido, existe e está no futuro  
**When** o usuário envia o formulário  
**Then** a tarefa é criada com prioridade `3`  
**And** a tarefa é persistida no `localStorage`.

#### Cenário 2 — Rejeitar prioridade fora do intervalo

**Given** que o usuário informa prioridade `0`, `6` ou `10`  
**When** o usuário envia o formulário  
**Then** a tarefa não é criada nem persistida  
**And** a mensagem de prioridade inválida aparece junto ao campo.

#### Cenário 3 — Rejeitar prioridade não inteira

**Given** que o usuário informa `1.5`, `01` ou texto  
**When** o usuário envia o formulário  
**Then** a tarefa não é criada nem persistida  
**And** a mensagem de prioridade inválida aparece junto ao campo.

### Data de término

#### Cenário 4 — Criar tarefa com data futura válida

**Given** que o usuário informa uma data no formato `YYYY-MM-DDTHH:mm`  
**And** a data representa um instante existente posterior ao momento atual  
**When** o usuário envia o formulário  
**Then** a tarefa é criada e persistida com a data informada.

#### Cenário 5 — Rejeitar formato de data inválido

**Given** que o valor da data não corresponde à Regex definida  
**When** o usuário envia o formulário  
**Then** a tarefa não é criada nem persistida  
**And** a mensagem de formato inválido aparece junto ao campo.

#### Cenário 6 — Rejeitar data inexistente

**Given** que o usuário informa uma data como `2026-02-30T10:00`  
**When** o usuário envia o formulário  
**Then** a tarefa não é criada nem persistida  
**And** a mensagem de data inexistente aparece junto ao campo.

#### Cenário 7 — Rejeitar data passada ou no instante atual

**Given** que a data informada é anterior ou igual ao instante atual  
**When** o usuário envia o formulário  
**Then** a tarefa não é criada nem persistida  
**And** a mensagem de data futura aparece junto ao campo.

### Edição e mensagens

#### Cenário 8 — Editar tarefa com dados válidos

**Given** que uma tarefa existente está sendo editada  
**And** a prioridade e a data de término informadas são válidas  
**When** o usuário salva a edição  
**Then** os campos são atualizados  
**And** os dados são persistidos sem remover alarmes ou configurações de e-mail.

#### Cenário 9 — Impedir edição inválida

**Given** que uma tarefa existente está sendo editada  
**And** a prioridade ou a data de término é inválida  
**When** o usuário salva a edição  
**Then** a tarefa mantém os valores anteriores  
**And** nenhum salvamento ocorre  
**And** a mensagem correspondente aparece junto ao campo.

#### Cenário 10 — Limpar erro após correção

**Given** que um campo exibe uma mensagem de erro  
**When** o usuário informa um valor válido e envia novamente  
**Then** a mensagem daquele campo é removida  
**And** a submissão prossegue se todos os campos forem válidos.

## Exibição da prioridade nos cartões

1. Cada cartão de tarefa deve exibir a prioridade ao lado do título, na mesma
   linha visual.
2. A prioridade deve ser apresentada como um selo pequeno no formato
   `Prioridade N`, em que `N` é o valor armazenado na tarefa.
3. O título e o selo devem permanecer agrupados sem alterar os controles,
   descrição, data, alarmes ou configurações de e-mail do cartão.
4. Em telas pequenas, o título e o selo podem quebrar linha para evitar
   sobreposição ou estouro horizontal.
5. O estilo deve reutilizar a identidade visual existente do cartão e manter o
   selo legível.
6. Cartões legados sem prioridade não devem exibir um selo vazio ou incorreto.

### Critérios de aceite do cartão

#### Cenário 11 — Exibir prioridade ao lado do título

**Given** que uma tarefa possui prioridade `3`  
**When** o cartão é renderizado  
**Then** o título e um selo com o texto `Prioridade 3` aparecem na mesma área
**And** o selo fica ao lado do título.

#### Cenário 12 — Preservar o conteúdo existente do cartão

**Given** que uma tarefa possui título, descrição, data, alarmes e configurações
de e-mail  
**When** o cartão é renderizado  
**Then** o selo de prioridade é adicionado  
**And** os demais conteúdos e controles continuam presentes.

#### Cenário 13 — Permitir quebra em telas pequenas

**Given** que o cartão é exibido em uma largura reduzida  
**When** o título e o selo não couberem na mesma linha  
**Then** eles podem quebrar linha  
**And** nenhum conteúdo deve ficar cortado por sobreposição horizontal.

#### Cenário 14 — Omitir selo sem prioridade

**Given** que uma tarefa legada não possui prioridade  
**When** o cartão é renderizado  
**Then** nenhum selo vazio ou com valor incorreto é exibido.

## Impacto nas funcionalidades existentes

- O formulário `#taskForm` ganhará o campo de prioridade e continuará sendo
  reutilizado para criação e edição.
- O `TaskController` deverá validar os dados antes de criar ou atualizar a
  tarefa e deverá controlar a exibição das mensagens.
- O modelo `Task` e a serialização do board deverão preservar a prioridade.
- As tarefas antigas usadas na demonstração deverão ser atualizadas com uma
  prioridade válida antes da entrega; não haverá rotina geral de migração.
- A persistência continuará sendo feita pela chave `board` do `localStorage`;
  não haverá mudança de mecanismo de armazenamento.
- Criação, edição, movimentação entre `ToDo`, `Doing` e `Done`, exclusão,
  alarmes e notificações de e-mail devem continuar disponíveis.
- Testes de controller, modelo e componentes deverão cobrir os critérios acima.
- A validação de data pode impedir o salvamento de tarefas que antes eram
  aceitas por não haver validação de domínio. Essa é uma mudança intencional de
  comportamento.
- Os cartões de tarefa passarão a exibir a prioridade armazenada ao lado do
  título, sem alterar as ações existentes.

## Fora do escopo

- Implementar a mudança nesta etapa.
- Alterar validações do formulário de destinatários de e-mail.
- Alterar regras de alarmes, status, envio de e-mail ou seleção em lote.
- Adicionar backend, banco de dados ou novo mecanismo de persistência.
- Definir limites de tamanho ou novas regras para título e descrição.
- Converter datas para UTC ou alterar o fuso usado pelo navegador.
- Criar validação em tempo real obrigatória antes do envio; a exigência mínima
  é impedir o salvamento inválido e apresentar o erro no envio.
- Migrar ou corrigir automaticamente todos os registros antigos do
  `localStorage`.
- Alterar regras de prioridade, persistência ou validação já implementadas.
