import test from "node:test";
import assert from "node:assert/strict";

import { BoardModel } from "../models/BoardModel.js";
import { Task } from "../models/TaskModel.js";

test("cria tarefa antiga com configuração de e-mail desligada", () => {
	const task = new Task({ id: 1, title: "Estudar" });

	assert.equal(task.emailNotificationEnabled, false);
	assert.equal(task.emailRecipientId, null);
	assert.equal(task.emailNotifiedDueDate, null);
});

test("preserva configuração de e-mail carregada do storage", () => {
	const task = new Task({
		id: 1,
		title: "Estudar",
		emailNotificationEnabled: true,
		emailRecipientId: 7,
		emailNotifiedDueDate: "2026-10-30T18:00"
	});

	assert.equal(task.emailNotificationEnabled, true);
	assert.equal(task.emailRecipientId, 7);
	assert.equal(task.emailNotifiedDueDate, "2026-10-30T18:00");
});

test("atualiza o destinatário e o estado da notificação", () => {
	const board = new BoardModel();
	board.addTask(new Task({ id: 1, title: "Estudar" }));

	const updated = board.updateTaskEmailSettings(1, {
		enabled: true,
		recipientId: 3
	});

	assert.equal(updated, true);
	assert.equal(board.getTask(1).emailNotificationEnabled, true);
	assert.equal(board.getTask(1).emailRecipientId, 3);
});

test("não atualiza configuração de uma tarefa inexistente", () => {
	const board = new BoardModel();

	assert.equal(
		board.updateTaskEmailSettings(999, { enabled: true, recipientId: 3 }),
		false
	);
});

test("marca o prazo como notificado somente quando ainda é o prazo atual", () => {
	const board = new BoardModel();
	board.addTask(new Task({
		id: 1,
		title: "Estudar",
		dueDate: "2026-10-30T14:00:00"
	}));

	assert.equal(
		board.markEmailNotificationSent(1, "2026-10-30T14:00:00"),
		true
	);
	assert.equal(
		board.getTask(1).emailNotifiedDueDate,
		"2026-10-30T14:00:00"
	);
	assert.equal(
		board.markEmailNotificationSent(1, "2026-10-29T14:00:00"),
		false
	);
});
