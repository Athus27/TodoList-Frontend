import test from "node:test";
import assert from "node:assert/strict";

import { TaskController } from "../controllers/TaskController.js";
import { EmailController } from "../controllers/EmailController.js";
import { AppController } from "../controllers/AppController.js";
import { BoardModel } from "../models/BoardModel.js";
import { EmailSettingsModel } from "../models/EmailSettingsModel.js";
import { Task } from "../models/TaskModel.js";

function createTaskForm(values, editingId = undefined) {
	const errors = {
		priority: { textContent: "", hidden: true },
		dueDate: { textContent: "", hidden: true }
	};
	const fields = {
		title: { value: values.title ?? "" },
		description: { value: values.description ?? "" },
		priority: {
			value: values.priority ?? "",
			setAttribute(name, value) {
				this[name] = value;
			}
		},
		dueDate: {
			value: values.dueDate ?? "",
			setAttribute(name, value) {
				this[name] = value;
			}
		}
	};

	return {
		dataset: editingId === undefined ? {} : { editingId: String(editingId) },
		elements: fields,
		querySelector(selector) {
			return selector === "#priority-error"
				? errors.priority
				: selector === "#due-date-error"
					? errors.dueDate
					: null;
		},
		errors
	};
}

test("TaskController cria tarefa com prioridade válida e persiste", () => {
	const board = new BoardModel();
	let saveCalls = 0;
	let renderCalls = 0;
	const controller = new TaskController({
		board,
		saveBoard: () => { saveCalls++; },
		render: () => { renderCalls++; }
	});
	const form = createTaskForm({
		title: "Tarefa",
		description: "Descrição",
		priority: "3",
		dueDate: "2026-12-01T10:00"
	});

	assert.equal(controller.handleTaskSubmit(form, new Date(2026, 10, 1, 9)), true);
	assert.equal(board.getTasks()[0].priority, 3);
	assert.equal(saveCalls, 1);
	assert.equal(renderCalls, 1);
});

test("TaskController bloqueia prioridade inválida e exibe erro", () => {
	const board = new BoardModel();
	let saveCalls = 0;
	const controller = new TaskController({
		board,
		saveBoard: () => { saveCalls++; },
		render: () => {}
	});
	const form = createTaskForm({
		title: "Tarefa",
		description: "Descrição",
		priority: "6",
		dueDate: "2026-12-01T10:00"
	});

	assert.equal(controller.handleTaskSubmit(form, new Date(2026, 10, 1, 9)), false);
	assert.equal(board.getTasks().length, 0);
	assert.equal(saveCalls, 0);
	assert.equal(form.errors.priority.textContent,
		"A prioridade deve ser um número inteiro de 1 a 5.");
	assert.equal(form.errors.priority.hidden, false);
});

test("TaskController bloqueia data inválida e exibe erro", () => {
	const board = new BoardModel();
	const controller = new TaskController({
		board,
		saveBoard: () => {},
		render: () => {}
	});
	const form = createTaskForm({
		title: "Tarefa",
		description: "Descrição",
		priority: "2",
		dueDate: "2026-02-30T10:00"
	});

	assert.equal(controller.handleTaskSubmit(form, new Date(2026, 0, 1)), false);
	assert.equal(board.getTasks().length, 0);
	assert.equal(form.errors.dueDate.textContent,
		"Informe uma data de término válida.");
	assert.equal(form.errors.dueDate.hidden, false);
});

test("TaskController preserva tarefa quando a edição é inválida", () => {
	const board = new BoardModel();
	board.addTask(new Task({
		id: 1,
		title: "Original",
		description: "Descrição",
		priority: 4,
		dueDate: "2026-12-01T10:00"
	}));
	let saveCalls = 0;
	const controller = new TaskController({
		board,
		saveBoard: () => { saveCalls++; },
		render: () => {}
	});
	const form = createTaskForm({
		title: "Alterada",
		description: "Nova descrição",
		priority: "1",
		dueDate: "2026-02-30T10:00"
	}, 1);

	assert.equal(controller.handleTaskSubmit(form, new Date(2026, 0, 1)), false);
	assert.equal(board.getTask(1).title, "Original");
	assert.equal(board.getTask(1).priority, 4);
	assert.equal(saveCalls, 0);
});

test("TaskController edita prioridade e preserva alarmes e e-mail", () => {
	const board = new BoardModel();
	board.addTask(new Task({
		id: 2,
		title: "Original",
		description: "Descrição",
		priority: 2,
		dueDate: "2026-12-01T10:00",
		alarms: [{ id: 4, minutesBefore: 15, alarmAt: "2026-12-01T09:45:00.000Z" }],
		emailNotificationEnabled: true,
		emailRecipientId: 7
	}));
	let saveCalls = 0;
	const controller = new TaskController({
		board,
		saveBoard: () => { saveCalls++; },
		render: () => {}
	});
	const form = createTaskForm({
		title: "Atualizada",
		description: "Nova descrição",
		priority: "5",
		dueDate: "2026-12-02T11:00"
	}, 2);

	assert.equal(controller.handleTaskSubmit(form, new Date(2026, 11, 1, 9)), true);
	const task = board.getTask(2);
	assert.equal(task.title, "Atualizada");
	assert.equal(task.priority, 5);
	assert.equal(task.dueDate, "2026-12-02T11:00");
	assert.equal(task.alarms.length, 1);
	assert.equal(task.emailNotificationEnabled, true);
	assert.equal(task.emailRecipientId, 7);
	assert.equal(saveCalls, 1);
});

test("TaskController limpa mensagens quando a submissão seguinte é válida", () => {
	const board = new BoardModel();
	const controller = new TaskController({
		board,
		saveBoard: () => {},
		render: () => {}
	});
	const form = createTaskForm({
		title: "Tarefa",
		description: "Descrição",
		priority: "0",
		dueDate: "2026-02-30T10:00"
	});
	const now = new Date(2026, 0, 1);

	assert.equal(controller.handleTaskSubmit(form, now), false);
	assert.equal(form.errors.priority.hidden, false);
	assert.equal(form.errors.dueDate.hidden, false);

	form.elements.priority.value = "3";
	form.elements.dueDate.value = "2026-12-01T10:00";

	assert.equal(controller.handleTaskSubmit(form, now), true);
	assert.equal(form.errors.priority.hidden, true);
	assert.equal(form.errors.priority.textContent, "");
	assert.equal(form.errors.dueDate.hidden, true);
	assert.equal(form.errors.dueDate.textContent, "");
});

test("TaskController informa formato e passado para datas inválidas", () => {
	const board = new BoardModel();
	const controller = new TaskController({
		board,
		saveBoard: () => {},
		render: () => {}
	});
	const now = new Date(2026, 10, 1, 10);
	const form = createTaskForm({
		title: "Tarefa",
		description: "Descrição",
		priority: "3",
		dueDate: "2026/12/01 10:00"
	});

	assert.equal(controller.handleTaskSubmit(form, now), false);
	assert.equal(form.errors.dueDate.textContent,
		"Informe a data no formato AAAA-MM-DDTHH:MM.");

	form.elements.dueDate.value = "2026-10-01T10:00";
	assert.equal(controller.handleTaskSubmit(form, now), false);
	assert.equal(form.errors.dueDate.textContent,
		"A data de término deve ser posterior à data e hora atuais.");
});

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
