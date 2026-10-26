import test from "node:test";
import assert from "node:assert/strict";

import { Board } from "../components/Board.js";
import { TaskCard } from "../components/TaskCard.js";

test("renderiza um botão de destino para cada status", () => {
	const html = Board([]);

	assert.equal((html.match(/class="apply-status-btn"/g) || []).length, 3);
	assert.match(html, /data-status="ToDo"/);
	assert.match(html, /data-status="Doing"/);
	assert.match(html, /data-status="Done"/);
});

test("renderiza checkbox identificado pelo ID da tarefa", () => {
	const html = TaskCard({
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
	const html = TaskCard({
		id: 9,
		title: 'Revisar "contrato"',
		description: "Teste",
		dueDate: "2026-10-25T18:00",
		alarms: []
	});

	assert.match(html, /aria-label="Selecionar tarefa"/);
	assert.doesNotMatch(html, /aria-label="Selecionar Revisar/);
});
