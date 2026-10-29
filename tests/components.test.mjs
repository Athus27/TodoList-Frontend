import test from "node:test";
import assert from "node:assert/strict";

import { BoardView } from "../views/BoardView.js";
import { TaskCardView } from "../views/TaskCardView.js";

test("renderiza um botão de destino para cada status", () => {
	const html = BoardView([]);

	assert.equal((html.match(/class="apply-status-btn"/g) || []).length, 3);
	assert.match(html, /data-status="ToDo"/);
	assert.match(html, /data-status="Doing"/);
	assert.match(html, /data-status="Done"/);
});

test("renderiza o botão que abre a configuração de e-mail das tarefas", () => {
	const html = BoardView([]);

	assert.match(html, /class="task-email-mode-btn"/);
	assert.match(html, /onclick="toggleTaskEmailMode\(\)"/);
	assert.match(html, /assets\/icons\/mail\.svg/);
});

test("renderiza checkbox identificado pelo ID da tarefa", () => {
	const html = TaskCardView({
		id: 42,
		title: "Estudar",
		description: "Local Storage",
		dueDate: "2026-10-25T18:00",
		alarms: []
	});

	assert.match(html, /type="checkbox"/);
	assert.match(html, /data-task-id="42"/);
	assert.match(html, /data-selected="false"/);
});

test("o nome da tarefa não é interpolado nos atributos do seletor", () => {
	const html = TaskCardView({
		id: 9,
		title: 'Revisar "contrato"',
		description: "Teste",
		dueDate: "2026-10-25T18:00",
		alarms: []
	});

	assert.match(html, /aria-label="Selecionar tarefa"/);
	assert.doesNotMatch(html, /aria-label="Selecionar Revisar/);
});

test("exibe seletor de destinatário e toggle no modo de configuração", () => {
	const html = TaskCardView(
		{
			id: 8,
			title: "Entregar projeto",
			description: "TODO List",
			dueDate: "2026-10-30T18:00",
			alarms: [],
			emailNotificationEnabled: false,
			emailRecipientId: 2
		},
		[
			{ id: 1, name: "Ana", email: "ana@example.com" },
			{ id: 2, name: "Athus", email: "athus@example.com" }
		],
		true
	);

	assert.match(html, /class="task-email-settings"/);
	assert.match(html, /Enviar e-mail 24h antes/);
	assert.match(html, /onchange="setTaskEmailRecipient\(8, this\.value\)"/);
	assert.match(html, /value="2" selected/);
	assert.match(html, /assets\/icons\/of\.svg/);
});

test("oculta os controles de e-mail fora do modo de configuração", () => {
	const html = TaskCardView(
		{ id: 8, title: "Tarefa", description: "", dueDate: "", alarms: [] },
		[],
		false
	);

	assert.doesNotMatch(html, /class="task-email-settings"/);
});

test("exibe indicador quando a tarefa possui aviso de e-mail ativo", () => {
	const html = TaskCardView({
		id: 8,
		title: "Tarefa",
		description: "",
		dueDate: "2026-10-30T18:00",
		alarms: [],
		emailNotificationEnabled: true,
		emailRecipientId: 2
	});

	assert.match(html, /class="task-email-indicator"/);
	assert.match(html, /assets\/icons\/mailSend\.svg/);
	assert.match(
		html,
		/E-mail programado para 24 horas antes, data: 29\/10\/2026 às 18:00/
	);
});
