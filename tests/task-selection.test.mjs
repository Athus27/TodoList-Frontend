import test from "node:test";
import assert from "node:assert/strict";

import { setTaskSelected, updateSelectedTaskIds } from "../scripts/task.js";

test("adiciona o ID quando a tarefa é marcada", () => {
	const selectedTaskIds = [];

	updateSelectedTaskIds(selectedTaskIds, 7, true);

	assert.deepEqual(selectedTaskIds, [7]);
});

test("não duplica um ID já selecionado", () => {
	const selectedTaskIds = [7];

	updateSelectedTaskIds(selectedTaskIds, 7, true);

	assert.deepEqual(selectedTaskIds, [7]);
});

test("remove o ID quando a tarefa é desmarcada", () => {
	const selectedTaskIds = [3, 7];

	updateSelectedTaskIds(selectedTaskIds, 7, false);

	assert.deepEqual(selectedTaskIds, [3]);
});

test("sincroniza checkbox, data-selected, ícone e array", () => {
	const icon = { src: "../assets/icons/checkVazio.svg" };
	const taskCard = {
		dataset: { selected: "false" },
		querySelector: () => icon
	};
	const checkbox = {
		checked: true,
		dataset: { taskId: "12" },
		closest: () => taskCard
	};
	const selectedTaskIds = [];

	setTaskSelected(checkbox, selectedTaskIds);

	assert.deepEqual(selectedTaskIds, [12]);
	assert.equal(taskCard.dataset.selected, "true");
	assert.match(icon.src, /checkPreenchido\.svg$/);
});
