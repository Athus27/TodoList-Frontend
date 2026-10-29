import test from "node:test";
import assert from "node:assert/strict";

import { BoardModel } from "../models/BoardModel.js";
import { EmailSettingsModel } from "../models/EmailSettingsModel.js";
import { Task } from "../models/TaskModel.js";
import { processDueEmailNotifications } from "../services/email/EmailSchedulerService.js";

function createScenario() {
	const board = new BoardModel();
	board.addTask(new Task({
		id: 1,
		title: "Entregar projeto",
		description: "TODO List",
		dueDate: "2026-10-30T14:00:00",
		emailNotificationEnabled: true,
		emailRecipientId: 2
	}));

	const emailSettings = new EmailSettingsModel({
		recipients: [
			{ id: 2, name: "Athus", email: "athus@example.com" }
		]
	});

	return { board, emailSettings };
}

test("marca e salva a tarefa somente depois do envio confirmado", async () => {
	const { board, emailSettings } = createScenario();
	let saved = false;

	const result = await processDueEmailNotifications({
		board,
		emailSettings,
		pendingTaskIds: new Set(),
		sendEmail: async () => ({ status: 200, text: "OK" }),
		saveBoard: () => { saved = true; },
		now: new Date("2026-10-29T14:00:00")
	});

	assert.equal(result.status, "sent");
	assert.equal(board.getTask(1).emailNotifiedDueDate, "2026-10-30T14:00:00");
	assert.equal(saved, true);
});

test("falha do serviço não marca a tarefa como notificada", async () => {
	const { board, emailSettings } = createScenario();

	const result = await processDueEmailNotifications({
		board,
		emailSettings,
		pendingTaskIds: new Set(),
		sendEmail: async () => { throw new Error("rede indisponível"); },
		saveBoard: () => {},
		now: new Date("2026-10-29T14:00:00")
	});

	assert.equal(result.status, "failed");
	assert.equal(board.getTask(1).emailNotifiedDueDate, null);
});

test("não repete uma tarefa cujo envio ainda está em andamento", async () => {
	const { board, emailSettings } = createScenario();
	const pendingTaskIds = new Set([1]);
	let sendCalls = 0;

	const result = await processDueEmailNotifications({
		board,
		emailSettings,
		pendingTaskIds,
		sendEmail: async () => { sendCalls++; },
		saveBoard: () => {},
		now: new Date("2026-10-29T14:00:00")
	});

	assert.equal(result, null);
	assert.equal(sendCalls, 0);
});
