# Mudança de status em lote — Design

## Objetivo

Permitir que o usuário selecione várias tarefas e as mova, com uma única ação, para a seção ToDo, Doing ou Done, persistindo o resultado no `localStorage`.

## Abordagem escolhida

A seleção terá três representações sincronizadas, cada uma com um papel: o checkbox recebe a interação, `data-selected` expõe o estado no card para estilo e inspeção, e `selectedTaskIds` mantém em memória os IDs usados pela operação em lote. Cada seção informa seu destino por `data-status` e possui um botão de aplicação.

Foram descartadas as abordagens que usariam somente o caminho do SVG ou somente consultas ao DOM: o caminho da imagem é uma fonte de estado frágil, enquanto consultar apenas o DOM não exercitaria o estado em JavaScript solicitado para aprendizado.

## Regras

- Marcar ou desmarcar uma tarefa sincroniza checkbox, `data-selected`, ícone e `selectedTaskIds`.
- Clicar no botão de uma seção atribui seu status a todas as tarefas selecionadas.
- Nenhuma seleção resulta em nenhuma alteração.
- IDs inexistentes são ignorados.
- Após uma alteração bem-sucedida, a seleção é limpa, o board é salvo e a interface é renderizada novamente.
- O `localStorage` continua guardando somente as tarefas; a seleção é temporária.

## Arquivos envolvidos

- `components/TaskCard.js`: controle de seleção e identificação da tarefa.
- `components/Board.js`: botões de destino e identificação do status de cada seção.
- `scripts/task.js`: sincronização visual da seleção.
- `models/BoardModel.js`: regra de alteração de status em lote.
- `script.js`: estado `selectedTaskIds`, eventos, persistência e renderização.
- `components/Board.css` e `components/TaskCard.css`: apresentação dos novos controles.
- `tests/bulk-status.test.mjs`: testes da regra de domínio.

