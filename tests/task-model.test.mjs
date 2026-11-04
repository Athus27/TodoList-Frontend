import test from "node:test";
import assert from "node:assert/strict";

import { BoardModel } from "../models/BoardModel.js";
import { Task } from "../models/TaskModel.js";

test("preserva prioridade ao reconstruir uma tarefa carregada", () => {
	const task = new Task({
		id: 7,
		title: "Tarefa salva",
		priority: 4
	});

	assert.equal(task.priority, 4);
});

test("mantém tarefas legadas sem prioridade carregáveis", () => {
	const task = new Task({
		id: 8,
		title: "Demonstração antiga"
	});

	assert.equal(task.priority, null);
});

test("atualiza a prioridade sem remover os demais dados da tarefa", () => {
	const board = new BoardModel();
	const task = new Task({
		id: 9,
		title: "Tarefa",
		description: "Descrição",
		priority: 2,
		dueDate: "2026-12-01T10:00",
		alarms: [{ id: 3, minutesBefore: 30, alarmAt: "2026-12-01T09:30:00.000Z" }],
		emailNotificationEnabled: true,
		emailRecipientId: 5
	});
	board.addTask(task);

	assert.equal(board.updateTask(9, {
		title: task.title,
		description: task.description,
		priority: 5,
		dueDate: task.dueDate
	}), true);

	assert.equal(task.priority, 5);
	assert.equal(task.alarms.length, 1);
	assert.equal(task.emailNotificationEnabled, true);
	assert.equal(task.emailRecipientId, 5);
});
