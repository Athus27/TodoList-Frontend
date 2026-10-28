import test from "node:test";
import assert from "node:assert/strict";

import {
	buildDeadlineEmailParams,
	sendDeadlineEmail
} from "../scripts/email/email-service.js";

const task = {
	title: "Entregar projeto",
	description: "Finalizar TODO List",
	dueDate: "2026-10-30T14:00:00"
};
const recipient = {
	name: "Athus",
	email: "athus@example.com"
};

test("monta as variáveis esperadas pelo template do EmailJS", () => {
	assert.deepEqual(buildDeadlineEmailParams(task, recipient), {
		email: "athus@example.com",
		name: "Athus",
		task_title: "Entregar projeto",
		task_description: "Finalizar TODO List",
		due_date: new Date("2026-10-30T14:00:00").toLocaleString("pt-BR")
	});
});

test("envia pelo serviço e template configurados", async () => {
	let receivedArguments;
	const emailClient = {
		send(...args) {
			receivedArguments = args;
			return Promise.resolve({ status: 200, text: "OK" });
		}
	};
	const config = {
		serviceId: "service_test",
		templateId: "template_test",
		publicKey: "public_test"
	};

	const response = await sendDeadlineEmail(task, recipient, emailClient, config);

	assert.equal(response.status, 200);
	assert.deepEqual(receivedArguments, [
		"service_test",
		"template_test",
		buildDeadlineEmailParams(task, recipient),
		{ publicKey: "public_test" }
	]);
});

test("rejeita envio enquanto os IDs públicos não estiverem preenchidos", async () => {
	await assert.rejects(
		() => sendDeadlineEmail(task, recipient, { send() {} }, {
			serviceId: "",
			templateId: "",
			publicKey: ""
		}),
		/Configure o EmailJS/
	);
});
