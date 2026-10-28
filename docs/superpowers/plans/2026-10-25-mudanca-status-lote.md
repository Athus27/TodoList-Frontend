# Mudança de Status em Lote Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Selecionar várias tarefas e movê-las, em uma ação, para a seção escolhida, com persistência no `localStorage`.

**Architecture:** A interface sincroniza checkbox, `data-selected` e um array de IDs. O `BoardModel` concentra a regra de alteração em lote; `script.js` coordena a ação, salva e renderiza.

**Tech Stack:** HTML, CSS, JavaScript ES Modules, Node.js test runner, Local Storage.

**Spec:** `docs/superpowers/specs/2026-10-25-mudanca-status-lote-design.md`

## Global Constraints

- Não adicionar dependências.
- Preservar CRUD, alarmes e movimentação individual existentes.
- A seleção não deve ser persistida no `localStorage`.

## Review Focus

- Nenhuma tarefa selecionada não altera o board.
- IDs repetidos ou inexistentes não quebram a operação.
- Mover para o status atual é seguro.
- A renderização posterior não mantém seleção visual obsoleta.
- A estrutura HTML das três seções permanece válida.

---

### Task 1: Regra de domínio para mudança em lote

**Files:**
- Modify: `models/BoardModel.js`
- Create: `tests/bulk-status.test.mjs`

**Interfaces:**
- Produces: `BoardModel.updateTasksStatus(taskIds: number[], status: string): number`

- [x] Escrever testes falhando para múltiplos IDs, lista vazia e ID inexistente.
- [x] Executar `node --test tests/bulk-status.test.mjs` e confirmar a falha esperada.
- [x] Implementar `updateTasksStatus`, retornar a quantidade encontrada e reordenar as tarefas.
- [x] Executar os testes e confirmar aprovação.

### Task 2: Controles e estado de seleção

**Files:**
- Modify: `components/TaskCard.js`
- Modify: `scripts/task.js`
- Modify: `script.js`
- Modify: `components/TaskCard.css`

**Interfaces:**
- Produces: `setTaskSelected(checkbox: HTMLInputElement, selectedTaskIds: number[]): void`
- Consumes: IDs numéricos expostos por `data-task-id`.

- [x] Renderizar um checkbox acessível e o ID em cada card.
- [x] Sincronizar checkbox, `data-selected`, SVG e array ao clicar.
- [x] Verificar a sincronização por teste automatizado do manipulador.

### Task 3: Botões de destino e persistência

**Files:**
- Modify: `components/Board.js`
- Modify: `script.js`
- Modify: `components/Board.css`

**Interfaces:**
- Consumes: `BoardModel.updateTasksStatus(taskIds, status)` e `selectedTaskIds`.
- Produces: `applySelectedTasksStatus(button: HTMLButtonElement): void`.

- [x] Corrigir a estrutura das seções e adicionar `data-status` e botão em cada uma.
- [x] Aplicar o status da seção, salvar, limpar a seleção e renderizar.
- [x] Executar todos os testes e checar a sintaxe dos módulos.
- [x] Servir a aplicação e validar que HTML, módulos e SVGs respondem por HTTP; a automação visual do navegador não estava disponível.

