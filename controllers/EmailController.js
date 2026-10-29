import { processDueEmailNotifications } from "../services/email/EmailSchedulerService.js";
import { sendDeadlineEmail } from "../services/email/EmailService.js";

export class EmailController {
	constructor({
		board,
		emailSettings,
		saveBoard,
		saveEmailSettings,
		render,
		alertFn = () => {},
		sendEmail = sendDeadlineEmail
	}) {
		this.board = board;
		this.emailSettings = emailSettings;
		this.saveBoard = saveBoard;
		this.saveEmailSettings = saveEmailSettings;
		this.render = render;
		this.alert = alertFn;
		this.sendEmail = sendEmail;
		this.isTaskEmailModeOpen = false;
		this.pendingTaskIds = new Set();
	}

	handleSettingsSubmit(form) {
		const recipient = this.emailSettings.addRecipient({
			name: form.elements.recipientName.value,
			email: form.elements.recipientEmail.value
		});
		if (!recipient) return false;

		this.saveEmailSettings(this.emailSettings);
		form.reset();
		return true;
	}

	toggleTaskEmailMode() {
		this.isTaskEmailModeOpen = !this.isTaskEmailModeOpen;
		this.render();
	}

	setTaskEmailRecipient(taskId, recipientValue) {
		const task = this.board.getTask(taskId);
		if (!task) return false;

		const recipientId = recipientValue ? Number(recipientValue) : null;
		const recipientExists = this.emailSettings.getRecipient(recipientId) !== null;

		this.board.updateTaskEmailSettings(taskId, {
			enabled: recipientExists ? task.emailNotificationEnabled : false,
			recipientId: recipientExists ? recipientId : null
		});
		if (recipientExists) this.emailSettings.lastRecipientId = recipientId;

		this.saveBoard(this.board);
		this.saveEmailSettings(this.emailSettings);
		this.render();
		return true;
	}

	toggleTaskEmailNotification(taskId) {
		const task = this.board.getTask(taskId);
		if (!task) return false;

		const recipientId = task.emailRecipientId ?? this.emailSettings.lastRecipientId;
		const recipientExists = this.emailSettings.getRecipient(recipientId) !== null;
		if (!task.emailNotificationEnabled && !recipientExists) {
			this.alert("Cadastre e selecione um destinatário antes de ligar o aviso.");
			return false;
		}

		this.board.updateTaskEmailSettings(taskId, {
			enabled: !task.emailNotificationEnabled,
			recipientId
		});
		this.saveBoard(this.board);
		this.render();
		return true;
	}

	async checkDueNotifications(now = new Date()) {
		return processDueEmailNotifications({
			board: this.board,
			emailSettings: this.emailSettings,
			pendingTaskIds: this.pendingTaskIds,
			sendEmail: this.sendEmail,
			saveBoard: this.saveBoard,
			now
		});
	}
}
