import { EMAILJS_CONFIG } from "./email-config.js";

export function buildDeadlineEmailParams(task, recipient) {
	return {
		email: recipient.email,
		name: recipient.name,
		task_title: task.title,
		task_description: task.description,
		due_date: new Date(task.dueDate).toLocaleString("pt-BR")
	};
}

export function sendDeadlineEmail(
	task,
	recipient,
	emailClient = window.emailjs,
	config = EMAILJS_CONFIG
) {
	if (!config.serviceId || !config.templateId || !config.publicKey) {
		return Promise.reject(
			new Error("Configure o EmailJS em scripts/email/email-config.js")
		);
	}

	if (!emailClient?.send) {
		return Promise.reject(new Error("SDK do EmailJS não foi carregado"));
	}

	return emailClient.send(
		config.serviceId,
		config.templateId,
		buildDeadlineEmailParams(task, recipient),
		{ publicKey: config.publicKey }
	);
}
