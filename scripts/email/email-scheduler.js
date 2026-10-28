import { collectDueEmailNotifications } from "./email-notifications.js";

export async function processDueEmailNotifications({
	board,
	emailSettings,
	pendingTaskIds,
	sendEmail,
	saveBoard,
	now = new Date()
}) {
	const task = collectDueEmailNotifications(board.getTasks(), now)
		.find((candidate) => (
			!pendingTaskIds.has(candidate.id)
			&& emailSettings.getRecipient(candidate.emailRecipientId)
		));

	if (!task) return null;

	const recipient = emailSettings.getRecipient(task.emailRecipientId);
	const dueDateAtSendStart = task.dueDate;
	pendingTaskIds.add(task.id);

	try {
		const response = await sendEmail(task, recipient);
		const marked = board.markEmailNotificationSent(task.id, dueDateAtSendStart);

		if (marked) saveBoard(board);

		return { status: "sent", task, response };
	} catch (error) {
		return { status: "failed", task, error };
	} finally {
		pendingTaskIds.delete(task.id);
	}
}
