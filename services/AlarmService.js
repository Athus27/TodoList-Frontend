export function collectDueAlarms(board, now = new Date()) {
	const triggered = [];
	const currentTime = now.getTime();

	for (const task of board.getTasks()) {
		if (task.status === "Done") continue;

		const pending = [];

		for (const alarm of task.alarms) {
			const alarmTime = new Date(alarm.alarmAt).getTime();

			if (Number.isFinite(alarmTime) && alarmTime <= currentTime) {
				triggered.push({ task, alarm });
			} else {
				pending.push(alarm);
			}
		}

		task.alarms = pending;
	}

	return triggered;
}
