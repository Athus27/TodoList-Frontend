const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getEmailScheduledAt(task) {
	const dueDate = new Date(task.dueDate);
	return new Date(dueDate.getTime() - ONE_DAY_IN_MILLISECONDS);
}

export function collectDueEmailNotifications(tasks, now = new Date()) {
	const nowTime = now.getTime();

	return tasks.filter((task) => {
		const dueDate = new Date(task.dueDate);
		const dueTime = dueDate.getTime();
		const scheduledTime = getEmailScheduledAt(task).getTime();

		if (!task.emailNotificationEnabled) return false;
		if (task.emailRecipientId == null) return false;
		if (task.status === "Done") return false;
		if (Number.isNaN(dueTime)) return false;
		if (task.emailNotifiedDueDate === task.dueDate) return false;

		return nowTime >= scheduledTime && nowTime < dueTime;
	});
}
