import test from "node:test";
import assert from "node:assert/strict";

import { BoardModel } from "../models/BoardModel.js";
import { Task } from "../models/TaskModel.js";

function createBoard() {
	const board = new BoardModel();
	board.addTask(new Task({ id: 1, title: "A", status: "ToDo" }));
	board.addTask(new Task({ id: 2, title: "B", status: "Doing" }));
	board.addTask(new Task({ id: 3, title: "C", status: "ToDo" }));
	return board;
}

test("altera o status de todas as tarefas selecionadas", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([1, 3], "Done");

	assert.equal(updatedCount, 2);
	assert.equal(board.getTask(1).status, "Done");
	assert.equal(board.getTask(2).status, "Doing");
	assert.equal(board.getTask(3).status, "Done");
});

test("não altera tarefas quando a seleção está vazia", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([], "Done");

	assert.equal(updatedCount, 0);
	assert.equal(board.getTask(1).status, "ToDo");
	assert.equal(board.getTask(2).status, "Doing");
});

test("ignora IDs inexistentes e não conta IDs repetidos", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([2, 2, 999], "ToDo");

	assert.equal(updatedCount, 1);
	assert.equal(board.getTask(2).status, "ToDo");
});

test("não altera tarefas quando o status é inválido", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([1], "Archived");

	assert.equal(updatedCount, 0);
	assert.equal(board.getTask(1).status, "ToDo");
});

test("aceita mover uma tarefa para o status que ela já possui", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([1], "ToDo");

	assert.equal(updatedCount, 1);
	assert.equal(board.getTask(1).status, "ToDo");
});

test("retorna zero quando nenhum ID existe", () => {
	const board = createBoard();

	const updatedCount = board.updateTasksStatus([998, 999], "Done");

	assert.equal(updatedCount, 0);
	assert.equal(board.getTask(1).status, "ToDo");
	assert.equal(board.getTask(2).status, "Doing");
});
