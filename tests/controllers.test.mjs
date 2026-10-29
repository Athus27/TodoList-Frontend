import test from "node:test";
import assert from "node:assert/strict";

import { TaskController } from "../controllers/TaskController.js";
import { EmailController } from "../controllers/EmailController.js";
import { AppController } from "../controllers/AppController.js";
import { BoardModel } from "../models/BoardModel.js";
import { EmailSettingsModel } from "../models/EmailSettingsModel.js";
import { Task } from "../models/TaskModel.js";

test("TaskController move as tarefas selecionadas e persiste o board", () => {
	const board = new BoardModel();
	board.addTask(new Task({ id: 1, title: "A", status: "ToDo" }));
	let saveCalls = 0;
	let renderCalls = 0;

	const controller = new TaskController({
		board,
		saveBoard: () => { saveCalls++; },
		render: () => { renderCalls++; }
	});
	controller.selectedTaskIds.push(1);

	const updated = controller.applySelectedTasksStatus("Done");

	assert.equal(updated, 1);
	assert.equal(board.getTask(1).status, "Done");
	assert.equal(saveCalls, 1);
	assert.equal(renderCalls, 1);
});

test("EmailController seleciona destinatário e memoriza a escolha", () => {
	const board = new BoardModel();
	board.addTask(new Task({ id: 1, title: "A" }));
	const emailSettings = new EmailSettingsModel({
		recipients: [{ id: 4, name: "Athus", email: "athus@example.com" }]
	});
	let boardSaves = 0;
	let settingsSaves = 0;

	const controller = new EmailController({
		board,
		emailSettings,
		saveBoard: () => { boardSaves++; },
		saveEmailSettings: () => { settingsSaves++; },
		render: () => {}
	});

	const updated = controller.setTaskEmailRecipient(1, "4");

	assert.equal(updated, true);
	assert.equal(board.getTask(1).emailRecipientId, 4);
	assert.equal(emailSettings.lastRecipientId, 4);
	assert.equal(boardSaves, 1);
	assert.equal(settingsSaves, 1);
});

test("EmailController exige destinatário antes de ligar a notificação", () => {
	const board = new BoardModel();
	board.addTask(new Task({ id: 1, title: "A" }));
	const messages = [];
	const controller = new EmailController({
		board,
		emailSettings: new EmailSettingsModel(),
		saveBoard: () => {},
		saveEmailSettings: () => {},
		render: () => {},
		alertFn: (message) => messages.push(message)
	});

	const updated = controller.toggleTaskEmailNotification(1);

	assert.equal(updated, false);
	assert.equal(board.getTask(1).emailNotificationEnabled, false);
	assert.deepEqual(messages, [
		"Cadastre e selecione um destinatário antes de ligar o aviso."
	]);
});

test("AppController carrega os models, renderiza e inicia os timers uma vez", () => {
	const appElement = {
		innerHTML: "",
		addEventListener() {}
	};
	const documentRef = {
		querySelector(selector) {
			return selector === "#app" ? appElement : null;
		}
	};
	const intervals = [];
	const windowRef = {
		setInterval(callback, milliseconds) {
			assert.equal(this, windowRef);
			intervals.push({ callback, milliseconds });
		}
	};
	const controller = new AppController({
		documentRef,
		windowRef,
		setIntervalFn: null,
		loadTasksFn: () => [{ id: 5, title: "Salva", status: "ToDo" }],
		loadEmailSettingsFn: () => ({ recipients: [] }),
		saveBoardFn: () => {},
		saveEmailSettingsFn: () => {}
	});

	controller.start();
	controller.start();

	assert.equal(controller.board.getTask(5).title, "Salva");
	assert.match(appElement.innerHTML, /Salva/);
	assert.deepEqual(intervals.map((interval) => interval.milliseconds), [
		60_000,
		1_000
	]);
	assert.equal(typeof windowRef.toggleTaskEmailMode, "function");
});
