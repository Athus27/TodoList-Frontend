import test from "node:test";
import assert from "node:assert/strict";

import {
	collectDueEmailNotifications,
	getEmailScheduledAt
} from "../scripts/email/email-notifications.js";

const activeTask = {
	id: 1,
	status: "ToDo",
	dueDate: "2026-10-30T14:00:00",
	emailNotificationEnabled: true,
	emailRecipientId: 2,
	emailNotifiedDueDate: null
};

test("calcula o envio exatamente 24 horas antes do prazo", () => {
	assert.equal(
		getEmailScheduledAt(activeTask).getTime(),
		new Date("2026-10-29T14:00:00").getTime()
	);
});

test("seleciona tarefa quando entra na janela de 24 horas", () => {
	const tasks = collectDueEmailNotifications(
		[activeTask],
		new Date("2026-10-29T14:00:00")
	);

	assert.deepEqual(tasks, [activeTask]);
});

test("não seleciona tarefa antes da janela, concluída ou já notificada", () => {
	const tasks = collectDueEmailNotifications(
		[
			activeTask,
			{ ...activeTask, id: 2, status: "Done" },
			{
				...activeTask,
				id: 3,
				emailNotifiedDueDate: activeTask.dueDate
			}
		],
		new Date("2026-10-29T13:59:59")
	);

	assert.deepEqual(tasks, []);
});

test("não seleciona tarefa vencida", () => {
	const tasks = collectDueEmailNotifications(
		[activeTask],
		new Date("2026-10-30T14:00:01")
	);

	assert.deepEqual(tasks, []);
});
