import { Board } from "./components/Board.js";
import { Header } from "./components/ui/Header.js";
import { EmailSettingsPanel } from "./components/EmailSettingsPanel.js";
import { dropdownMenu,showEmailSettings } from "./scripts/header.js";
import { Task } from "./models/TaskModel.js";
import { BoardModel } from "./models/BoardModel.js";
import { EmailSettingsModel } from "./models/EmailSettingsModel.js";
import { loadTasks, saveBoard, loadEmailSettings, saveEmailSettings } from "./scripts/storage.js";
import { setTaskSelected, addTask, addTaskShow, showAndHiddenTaskOptions, toggleAlarmForm } from "./scripts/task.js";
import { Alarm } from "./models/AlarmModel.js";
import { collectDueAlarms } from "./scripts/alarm.js";
import { sendDeadlineEmail } from "./scripts/email/email-service.js";
import { processDueEmailNotifications } from "./scripts/email/email-scheduler.js";

const app = document.querySelector("#app");
const board = new BoardModel();

const selectedTaskIds = [];
let isTaskEmailModeOpen = false;
const pendingEmailTaskIds = new Set();

const savedEmails = loadEmailSettings();
const emailSettings = new EmailSettingsModel(savedEmails ?? {});


const savedTasks = loadTasks();
const initialTasks = savedTasks ?? [];

initialTasks.forEach((task) => {
	board.addTask(new Task(task));
});

function render() {
	selectedTaskIds.length = 0;
	app.innerHTML = `
    ${Header()}
    ${EmailSettingsPanel()}
    ${Board(board.getTasks(), emailSettings.recipients, isTaskEmailModeOpen)}
    `;
}

app.addEventListener("submit", (event) => {
	const form = event.target;

	if (form.id === "emailSettingsForm") {
		event.preventDefault();

		const recipient = emailSettings.addRecipient({
			name: form.elements.recipientName.value,
			email: form.elements.recipientEmail.value
		});

		if (!recipient) {
			alert("Esse e-mail já está cadastrado.");
			return;
		}

		saveEmailSettings(emailSettings);
		form.reset();
		alert("E-mail cadastrado com sucesso.");
		return;
	}

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
window.dropdownMenu = dropdownMenu;
window.showEmailSettings = showEmailSettings;
window.addTaskShow = addTaskShow;
window.setTaskSelected = (checkbox) => {
	setTaskSelected(checkbox, selectedTaskIds);
};
window.showAndHiddenTaskOptions = showAndHiddenTaskOptions;

window.toggleTaskEmailMode = () => {
	isTaskEmailModeOpen = !isTaskEmailModeOpen;
	render();
};

window.setTaskEmailRecipient = (taskId, recipientValue) => {
	const task = board.getTask(taskId);
	if (!task) return;

	const recipientId = recipientValue ? Number(recipientValue) : null;
	const recipientExists = emailSettings.recipients.some(
		(recipient) => recipient.id === recipientId
	);

	board.updateTaskEmailSettings(taskId, {
		enabled: recipientExists ? task.emailNotificationEnabled : false,
		recipientId: recipientExists ? recipientId : null
	});

	if (recipientExists) {
		emailSettings.lastRecipientId = recipientId;
	}

	saveBoard(board);
	saveEmailSettings(emailSettings);
	render();
};

window.toggleTaskEmailNotification = (taskId) => {
	const task = board.getTask(taskId);
	if (!task) return;

	const recipientId = task.emailRecipientId ?? emailSettings.lastRecipientId;
	const recipientExists = emailSettings.recipients.some(
		(recipient) => recipient.id === recipientId
	);

	if (!task.emailNotificationEnabled && !recipientExists) {
		alert("Cadastre e selecione um destinatário antes de ligar o aviso.");
		return;
	}

	board.updateTaskEmailSettings(taskId, {
		enabled: !task.emailNotificationEnabled,
		recipientId
	});

	saveBoard(board);
	render();
};

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

async function checkDueEmailNotifications() {
	const result = await processDueEmailNotifications({
		board,
		emailSettings,
		pendingTaskIds: pendingEmailTaskIds,
		sendEmail: sendDeadlineEmail,
		saveBoard
	});

	if (!result) return;

	if (result.status === "sent") {
		console.info(`E-mail enviado para a tarefa: ${result.task.title}`);
		return;
	}

	console.error(
		`Falha ao enviar e-mail da tarefa: ${result.task.title}`,
		result.error
	);
}

checkDueEmailNotifications();
setInterval(checkDueEmailNotifications, 60_000);

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
