import { Alarm } from "./AlarmModel.js";

export class Task {
	static nextId = 1;

	id;
	title;
	description;
	status;
	alarms;


	constructor(parameters) {
		if (parameters.id !== undefined) {
			this.id = parameters.id;
			Task.nextId = Math.max(Task.nextId, parameters.id + 1);
		} else {
			this.id = Task.nextId++;
		}

		this.alarms = (parameters.alarms || []).map((alarm) =>
			alarm instanceof Alarm ? alarm : new Alarm(alarm)
		);

		this.title = parameters.title || "";
		this.description = parameters.description || "";
		this.dueDate = parameters.dueDate || "";
		this.status = parameters.status || "ToDo";
		this.emailNotificationEnabled = parameters.emailNotificationEnabled ?? false;
		this.emailRecipientId = parameters.emailRecipientId ?? null;
		this.emailNotifiedDueDate = parameters.emailNotifiedDueDate ?? null;
	}

	addAlarm(alarm){
		this.alarms.push(alarm)
	}

	removeAlarm(alarmId){
		this.alarms = this.alarms.filter((alarm)=> alarm.id !== alarmId);
	}

}
