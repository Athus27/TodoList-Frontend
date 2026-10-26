import { Board } from "./components/Board.js";
import { Header } from "./components/ui/Header.js";
import { Task } from "./models/TaskModel.js";
import { BoardModel } from "./models/BoardModel.js";
import { loadTasks, saveBoard } from "./scripts/storage.js";
import { setTaskSelected, addTask, addTaskShow, showAndHiddenTaskOptions, toggleAlarmForm } from "./scripts/task.js";
import { Alarm } from "./models/AlarmModel.js";
import { collectDueAlarms } from "./scripts/alarm.js";

const app = document.querySelector("#app");
const board = new BoardModel();
const selectedTaskIds = [];

const savedTasks = loadTasks();
const initialTasks = savedTasks ?? [];

initialTasks.forEach((task) => {
	board.addTask(new Task(task));
});

function render() {
	selectedTaskIds.length = 0;
	app.innerHTML = `
    ${Header()}
    ${Board(board.getTasks())}
    `;
}

app.addEventListener("submit", (event) => {
	const form = event.target;

	if (form.id === "taskForm") {
		event.preventDefault();

		const editingId = form.dataset.editingId;

		if (editingId) {
			board.updateTask(Number(editingId), {
				title: form.elements.title.value,
				description: form.elements.description.value,
				dueDate: form.elements.dueDate.value
			});

			saveBoard(board);
		} else {
			addTask(event, board);
		}

		render();
		return;
	}

	if (!form.matches(".alarm-form")) return;

	event.preventDefault();

	const taskId = Number(form.dataset.taskId);
	const minutesBefore = Number(form.elements.minutesBefore.value);

	const task = board.getTask(taskId);
	if (!task) {
		alert("Tarefa não encontrada.");
		return;
	}

	const dueDate = new Date(task.dueDate);
	const alarmDate = new Date(dueDate.getTime() - minutesBefore * 60_000);

	if (minutesBefore <= 0) {
		alert("Informe uma quantidade válida de minutos.");
		return;
	}

	if (alarmDate <= new Date()) {
		alert("O horário do alarme já passou.");
		return;
	}

	const alarm = new Alarm({
		minutesBefore,
		alarmAt: alarmDate.toISOString()
	});

	if (!board.addAlarm(taskId, alarm)) {
		alert("Não é possível adicionar alarmes em tarefas concluídas.");
		return;
	}

	saveBoard(board);
	render();
});

app.addEventListener("input", (event) => {
	if (event.target.name !== "minutesBefore") return;

	const form = event.target.closest(".alarm-form");
	const preview = form.querySelector(".alarm-preview");

	const minutesBefore = Number(event.target.value);
	const dueDate = new Date(form.dataset.dueDate);

	if (minutesBefore <= 0) {
		preview.textContent = "Informe um valor maior que zero";
		return;
	}

	const alarmAt = new Date(dueDate.getTime() - minutesBefore * 60_000);

	if (alarmAt <= new Date()) {
		preview.textContent = "Esse horário já passou";
		return;
	}

	preview.innerHTML = `Programado para: ${alarmAt.toLocaleString("pt-BR", {
		dateStyle: "short",
		timeStyle: "short"
	})}`;
});

window.addTaskShow = addTaskShow;
window.setTaskSelected = (checkbox) => {
	setTaskSelected(checkbox, selectedTaskIds);
};
window.showAndHiddenTaskOptions = showAndHiddenTaskOptions;

window.applySelectedTasksStatus = (button) => {
	const section = button.closest(".board-section");
	if (!section || selectedTaskIds.length === 0) return;

	const updatedCount = board.updateTasksStatus(
		selectedTaskIds,
		section.dataset.status
	);

	if (updatedCount === 0) return;

	saveBoard(board);
	render();
};

window.moveDownTask = (taskId) => {
	if (!board.moveTask(taskId, "down")) {
		alert("A tarefa já está em Done.");
		return;
	}

	saveBoard(board);
	render();
};

window.moveUpTask = (taskId) => {
	if (!board.moveTask(taskId, "up")) {
		alert("A tarefa já está em ToDo.");
		return;
	}

	saveBoard(board);
	render();
};

window.editTask = (taskId) => {
	const task = board.getTask(taskId);
	if (!task) return;

	const container = document.querySelector(".add-task-form");
	const form = document.querySelector("#taskForm");

	form.elements.title.value = task.title;
	form.elements.description.value = task.description;
	form.elements.dueDate.value = task.dueDate;

	form.dataset.editingId = taskId;
	form.querySelector('[type="submit"]').textContent = "Save changes";

	container.style.display = "block";
	document.querySelector(".add-task-btn").textContent = "-";

	container.scrollIntoView({
		behavior: "smooth",
		block: "center"
	});
};

window.deleteTask = (taskId) => {
	board.removeTask(taskId);
	saveBoard(board);
	render();
};
window.toggleAlarmForm = toggleAlarmForm;
window.deleteAlarm = (taskId, alarmId) => {
	board.removeAlarm(taskId, alarmId);
	saveBoard(board);
	render();
};

// Apenas para depuração no console.
window.board = board;

render();

setInterval(() => {
	const triggeredAlarms = collectDueAlarms(board);

	if (!triggeredAlarms.length) return;

	for (const { task, alarm } of triggeredAlarms) {
		const message = [
			"=== TASK ALARM ===",
			`Task: ${task.title}`,
			`Description: ${task.description}`,
			`Due date: ${new Date(task.dueDate).toLocaleString("pt-BR")}`,
			`Alarm: ${new Date(alarm.alarmAt).toLocaleString("pt-BR")}`
		].join("\n");

		console.warn(message);
		alert(message);
	}

	saveBoard(board);
	render();
}, 1000);
