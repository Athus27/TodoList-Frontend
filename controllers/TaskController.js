import { Alarm } from "../models/AlarmModel.js";
import { Task } from "../models/TaskModel.js";
import { collectDueAlarms } from "../services/AlarmService.js";
import {
	validateDueDate,
	validatePriority
} from "../services/TaskValidation.js";

const TASK_FIELD_ERRORS = {
	priority: {
		required: "Informe a prioridade.",
		range: "A prioridade deve ser um número inteiro de 1 a 5."
	},
	dueDate: {
		required: "Informe a data de término.",
		format: "Informe a data no formato AAAA-MM-DDTHH:MM.",
		"invalid-date": "Informe uma data de término válida.",
		past: "A data de término deve ser posterior à data e hora atuais."
	}
};
const TASK_ERROR_IDS = {
	priority: "priority-error",
	dueDate: "due-date-error"
};

function setFieldError(form, fieldName, message) {
	const errorElement = form.querySelector?.(`#${TASK_ERROR_IDS[fieldName]}`);
	const field = form.elements[fieldName];
	if (!errorElement || !field) return;

	errorElement.textContent = message;
	errorElement.hidden = !message;
	field.setAttribute?.("aria-invalid", String(Boolean(message)));
}

export function updateSelectedTaskIds(selectedTaskIds, taskId, isSelected) {
	const currentIndex = selectedTaskIds.indexOf(taskId);

	if (isSelected && currentIndex === -1) selectedTaskIds.push(taskId);
	if (!isSelected && currentIndex !== -1) selectedTaskIds.splice(currentIndex, 1);
}

export class TaskController {
	constructor({
		board,
		saveBoard,
		render,
		documentRef = null,
		alertFn = () => {},
		consoleRef = console
	}) {
		this.board = board;
		this.saveBoard = saveBoard;
		this.render = render;
		this.document = documentRef;
		this.alert = alertFn;
		this.console = consoleRef;
		this.selectedTaskIds = [];
	}

	resetSelection() {
		this.selectedTaskIds.length = 0;
	}

	setTaskSelected(checkbox) {
		const taskId = Number(checkbox.dataset.taskId);
		updateSelectedTaskIds(this.selectedTaskIds, taskId, checkbox.checked);

		const card = checkbox.closest(".task-card");
		if (!card) return;
		const icon = card.querySelector(".select-task-icon");
		card.dataset.selected = String(checkbox.checked);
		if (icon) {
			icon.src = checkbox.checked
				? "../assets/icons/checkPreenchido.svg"
				: "../assets/icons/checkVazio.svg";
		}
	}

	addTaskShow() {
		const form = this.document.querySelector(".add-task-form");
		const button = this.document.querySelector(".add-task-btn");
		const isOpen = form.style.display === "block";
		form.style.display = isOpen ? "none" : "block";
		button.textContent = isOpen ? "+" : "-";
	}

	showAndHiddenTaskOptions(button) {
		button.closest(".task-card")?.classList.toggle("options-open");
	}

	toggleAlarmForm(button) {
		const form = button.closest(".task-alarm")?.querySelector(".alarm-form");
		if (form) form.hidden = !form.hidden;
	}

	handleTaskSubmit(form, now = new Date()) {
		const editingId = form.dataset.editingId;
		const priority = validatePriority(form.elements.priority.value);
		const dueDate = validateDueDate(form.elements.dueDate.value, now);
		setFieldError(
			form,
			"priority",
			priority.valid ? "" : TASK_FIELD_ERRORS.priority[priority.error]
		);
		setFieldError(
			form,
			"dueDate",
			dueDate.valid ? "" : TASK_FIELD_ERRORS.dueDate[dueDate.error]
		);

		if (!priority.valid || !dueDate.valid) return false;

		const values = {
			title: form.elements.title.value,
			description: form.elements.description.value,
			priority: priority.value,
			dueDate: form.elements.dueDate.value
		};

		if (editingId) {
			this.board.updateTask(Number(editingId), values);
		} else {
			this.board.addTask(new Task(values));
		}

		this.saveBoard(this.board);
		this.render();
		return true;
	}

	handleAlarmSubmit(form, now = new Date()) {
		const taskId = Number(form.dataset.taskId);
		const minutesBefore = Number(form.elements.minutesBefore.value);
		const task = this.board.getTask(taskId);
		if (!task) {
			this.alert("Tarefa não encontrada.");
			return false;
		}

		const alarmDate = new Date(
			new Date(task.dueDate).getTime() - minutesBefore * 60_000
		);

		if (minutesBefore <= 0) {
			this.alert("Informe uma quantidade válida de minutos.");
			return false;
		}
		if (alarmDate <= now) {
			this.alert("O horário do alarme já passou.");
			return false;
		}

		const added = this.board.addAlarm(taskId, new Alarm({
			minutesBefore,
			alarmAt: alarmDate.toISOString()
		}));
		if (!added) {
			this.alert("Não é possível adicionar alarmes em tarefas concluídas.");
			return false;
		}

		this.saveBoard(this.board);
		this.render();
		return true;
	}

	handleAlarmInput(input, now = new Date()) {
		const form = input.closest(".alarm-form");
		const preview = form.querySelector(".alarm-preview");
		const minutesBefore = Number(input.value);
		const alarmAt = new Date(
			new Date(form.dataset.dueDate).getTime() - minutesBefore * 60_000
		);

		if (minutesBefore <= 0) preview.textContent = "Informe um valor maior que zero";
		else if (alarmAt <= now) preview.textContent = "Esse horário já passou";
		else preview.textContent = `Programado para: ${alarmAt.toLocaleString("pt-BR", {
			dateStyle: "short",
			timeStyle: "short"
		})}`;
	}

	applySelectedTasksStatus(status) {
		const updatedCount = this.board.updateTasksStatus(this.selectedTaskIds, status);
		if (updatedCount === 0) return 0;

		this.saveBoard(this.board);
		this.render();
		return updatedCount;
	}

	moveTask(taskId, direction) {
		if (!this.board.moveTask(taskId, direction)) return false;
		this.saveBoard(this.board);
		this.render();
		return true;
	}

	editTask(taskId) {
		const task = this.board.getTask(taskId);
		if (!task) return false;

		const container = this.document.querySelector(".add-task-form");
		const form = this.document.querySelector("#taskForm");
		form.elements.title.value = task.title;
		form.elements.description.value = task.description;
		form.elements.priority.value = task.priority ?? "";
		form.elements.dueDate.value = task.dueDate;
		form.dataset.editingId = taskId;
		form.querySelector('[type="submit"]').textContent = "Save changes";
		container.style.display = "block";
		this.document.querySelector(".add-task-btn").textContent = "-";
		container.scrollIntoView({ behavior: "smooth", block: "center" });
		return true;
	}

	deleteTask(taskId) {
		this.board.removeTask(taskId);
		this.saveBoard(this.board);
		this.render();
	}

	deleteAlarm(taskId, alarmId) {
		this.board.removeAlarm(taskId, alarmId);
		this.saveBoard(this.board);
		this.render();
	}

	checkDueAlarms(now = new Date()) {
		const triggeredAlarms = collectDueAlarms(this.board, now);
		if (!triggeredAlarms.length) return [];

		for (const { task, alarm } of triggeredAlarms) {
			const message = [
				"=== TASK ALARM ===",
				`Task: ${task.title}`,
				`Description: ${task.description}`,
				`Due date: ${new Date(task.dueDate).toLocaleString("pt-BR")}`,
				`Alarm: ${new Date(alarm.alarmAt).toLocaleString("pt-BR")}`
			].join("\n");
			this.console.warn(message);
			this.alert(message);
		}

		this.saveBoard(this.board);
		this.render();
		return triggeredAlarms;
	}
}
