import { EmailController } from "./EmailController.js";
import { TaskController } from "./TaskController.js";
import { BoardModel } from "../models/BoardModel.js";
import { EmailSettingsModel } from "../models/EmailSettingsModel.js";
import { Task } from "../models/TaskModel.js";
import {
	loadEmailSettings,
	loadTasks,
	saveBoard,
	saveEmailSettings
} from "../services/StorageService.js";
import { BoardView } from "../views/BoardView.js";
import { EmailSettingsView } from "../views/EmailSettingsView.js";
import { HeaderView } from "../views/HeaderView.js";

export class AppController {
	constructor({
		documentRef = document,
		windowRef = window,
		setIntervalFn = null,
		loadTasksFn = loadTasks,
		loadEmailSettingsFn = loadEmailSettings,
		saveBoardFn = saveBoard,
		saveEmailSettingsFn = saveEmailSettings,
		consoleRef = console
	} = {}) {
		this.document = documentRef;
		this.window = windowRef;
		this.setInterval = setIntervalFn
			? setIntervalFn.bind(windowRef)
			: (callback, milliseconds) => windowRef.setInterval(callback, milliseconds);
		this.loadTasks = loadTasksFn;
		this.loadEmailSettings = loadEmailSettingsFn;
		this.saveBoard = saveBoardFn;
		this.saveEmailSettings = saveEmailSettingsFn;
		this.console = consoleRef;
		this.started = false;
	}

	start() {
		if (this.started) return this;
		this.started = true;
		this.app = this.document.querySelector("#app");
		this.board = new BoardModel();
		this.emailSettings = new EmailSettingsModel(this.loadEmailSettings() ?? {});

		for (const task of this.loadTasks() ?? []) this.board.addTask(new Task(task));

		const alertFn = this.window.alert?.bind(this.window) ?? (() => {});
		this.taskController = new TaskController({
			board: this.board,
			saveBoard: this.saveBoard,
			render: () => this.render(),
			documentRef: this.document,
			alertFn,
			consoleRef: this.console
		});
		this.emailController = new EmailController({
			board: this.board,
			emailSettings: this.emailSettings,
			saveBoard: this.saveBoard,
			saveEmailSettings: this.saveEmailSettings,
			render: () => this.render(),
			alertFn
		});

		this.bindEvents();
		this.registerWindowHandlers();
		this.render();
		this.checkDueEmailNotifications();
		this.setInterval(() => this.checkDueEmailNotifications(), 60_000);
		this.setInterval(() => this.taskController.checkDueAlarms(), 1_000);
		return this;
	}

	render() {
		this.taskController.resetSelection();
		this.app.innerHTML = `
			${HeaderView()}
			${EmailSettingsView()}
			${BoardView(
				this.board.getTasks(),
				this.emailSettings.recipients,
				this.emailController.isTaskEmailModeOpen
			)}
		`;
	}

	bindEvents() {
		this.app.addEventListener("submit", (event) => this.handleSubmit(event));
		this.app.addEventListener("input", (event) => this.handleInput(event));
	}

	handleSubmit(event) {
		event.preventDefault();
		const form = event.target;

		if (form.id === "emailSettingsForm") {
			const added = this.emailController.handleSettingsSubmit(form);
			this.window.alert?.(added
				? "E-mail cadastrado com sucesso."
				: "Esse e-mail já está cadastrado.");
			return;
		}

		if (form.id === "taskForm") {
			this.taskController.handleTaskSubmit(form);
			return;
		}

		if (form.matches(".alarm-form")) {
			this.taskController.handleAlarmSubmit(form);
		}
	}

	handleInput(event) {
		if (event.target.name === "minutesBefore") {
			this.taskController.handleAlarmInput(event.target);
		}
	}

	registerWindowHandlers() {
		this.window.dropdownMenu = () => this.dropdownMenu();
		this.window.showEmailSettings = () => this.showEmailSettings();
		this.window.addTaskShow = () => this.taskController.addTaskShow();
		this.window.setTaskSelected = (checkbox) => this.taskController.setTaskSelected(checkbox);
		this.window.showAndHiddenTaskOptions = (button) => this.taskController.showAndHiddenTaskOptions(button);
		this.window.toggleTaskEmailMode = () => this.emailController.toggleTaskEmailMode();
		this.window.setTaskEmailRecipient = (taskId, value) => this.emailController.setTaskEmailRecipient(taskId, value);
		this.window.toggleTaskEmailNotification = (taskId) => this.emailController.toggleTaskEmailNotification(taskId);
		this.window.applySelectedTasksStatus = (button) => {
			const status = button.closest(".board-section")?.dataset.status;
			if (status) this.taskController.applySelectedTasksStatus(status);
		};
		this.window.moveDownTask = (taskId) => {
			if (!this.taskController.moveTask(taskId, "down")) this.window.alert?.("A tarefa já está em Done.");
		};
		this.window.moveUpTask = (taskId) => {
			if (!this.taskController.moveTask(taskId, "up")) this.window.alert?.("A tarefa já está em ToDo.");
		};
		this.window.editTask = (taskId) => this.taskController.editTask(taskId);
		this.window.deleteTask = (taskId) => this.taskController.deleteTask(taskId);
		this.window.toggleAlarmForm = (button) => this.taskController.toggleAlarmForm(button);
		this.window.deleteAlarm = (taskId, alarmId) => this.taskController.deleteAlarm(taskId, alarmId);
		this.window.board = this.board;
	}

	dropdownMenu() {
		const navLinks = this.document.querySelector(".nav-links");
		const nav = this.document.querySelector("nav");
		if (!navLinks || !nav) return;

		nav.style.backgroundColor = nav.style.backgroundColor === "var(--dark-gray)"
			? "var(--half-gray)"
			: "var(--dark-gray)";
		navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
	}

	showEmailSettings() {
		const panel = this.document.querySelector(".email-settings-panel");
		if (panel) panel.style.display = panel.style.display === "block" ? "none" : "block";
	}

	async checkDueEmailNotifications() {
		const result = await this.emailController.checkDueNotifications();
		if (!result) return;

		if (result.status === "sent") {
			this.console.info(`E-mail enviado para a tarefa: ${result.task.title}`);
		} else {
			this.console.error(`Falha ao enviar e-mail da tarefa: ${result.task.title}`, result.error);
		}
	}
}
