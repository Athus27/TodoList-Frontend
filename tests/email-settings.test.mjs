import test from "node:test";
import assert from "node:assert/strict";

import { EmailSettingsModel } from "../models/EmailSettingsModel.js";

test("cadastra destinatário com ID e memoriza a última escolha", () => {
	const settings = new EmailSettingsModel();

	const recipient = settings.addRecipient({
		name: "  Athus  ",
		email: "  athus@example.com  "
	});

	assert.deepEqual(recipient, {
		id: 1,
		name: "Athus",
		email: "athus@example.com"
	});
	assert.deepEqual(settings.recipients, [recipient]);
	assert.equal(settings.lastRecipientId, 1);
});

test("não cadastra o mesmo e-mail duas vezes", () => {
	const settings = new EmailSettingsModel({
		recipients: [{ id: 3, name: "Athus", email: "athus@example.com" }],
		lastRecipientId: 3
	});

	const recipient = settings.addRecipient({
		name: "Outro nome",
		email: "ATHUS@example.com"
	});

	assert.equal(recipient, null);
	assert.equal(settings.recipients.length, 1);
});

test("continua a sequência de IDs dos dados carregados", () => {
	const settings = new EmailSettingsModel({
		recipients: [{ id: 5, name: "Salvo", email: "salvo@example.com" }]
	});

	const recipient = settings.addRecipient({
		name: "Novo",
		email: "novo@example.com"
	});

	assert.equal(recipient.id, 6);
});
