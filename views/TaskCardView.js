export function TaskCardView(task, recipients = [], isTaskEmailModeOpen = false) {
	return `
        <div class="task-card" data-selected="false">
            <label class="task-selector" title="Selecionar tarefa">
                <input
                    class="task-selector-input"
                    type="checkbox"
                    data-task-id="${task.id}"
                    onchange="setTaskSelected(this)"
                    aria-label="Selecionar tarefa"
                >
                <img
                    class="select-task-icon"
                    src="../assets/icons/checkVazio.svg"
                    alt=""
                >
            </label>
            <div class="task-content">
               <div class="task-info">
                <div class="task-title-row">
                    <h2>${task.title}</h2>
                    ${renderPriorityBadge(task.priority)}
                </div>
                <p>${task.description}</p>
                    <p class="task-date">
                        <img
                            class="calendar-icon"
                            src="../assets/icons/calendar.svg"
                            alt=""
                        >
                        <span>Due Date: ${formatDate(task.dueDate)}</span>
                    </p>
                    ${renderEmailIndicator(task)}
					${renderEmailSettings(task, recipients, isTaskEmailModeOpen)}
                </div>
                <div class="task-controls">
                    <button class="showView" onClick=showAndHiddenTaskOptions(this)><img class = "icon" src = "../assets/icons/addTask.svg"></button>
                    <button class="ocultView"onClick=showAndHiddenTaskOptions(this)><img class="icon icon-minimize" src="../assets/icons/minimize.svg"></button>
                
                    <button class="opt-btn" onClick = "moveUpTask(${task.id})"><img class = "icon" src = "../assets/icons/up.svg"></button>
                    <button class="opt-btn" onClick = "moveDownTask(${task.id})"><img class = "icon" src = "../assets/icons/down.svg"></button>
                    <button class="opt-btn" onclick="editTask(${task.id})"><img class="icon" src="../assets/icons/edit.svg"></button>
                    <button class="opt-btn" onClick = "deleteTask(${task.id})"><img class = "icon" src = "../assets/icons/delete.svg"></button>
                </div>
            </div>
            <div class="task-options">
                <div class="task-alarm">
                    <div class="alarm-heading">
                        <h3>Alarms (${task.alarms.length})</h3>
                    </div>

                     <button
                        type="button"
                        class="alarm-toggle"
                        onclick="toggleAlarmForm(this)"
                    >   
                        + Add alarm
                    </button>

                    <div class="alarm-list">
                        ${renderAlarms(task.id, task.alarms)}
                    </div>

                    <form class="alarm-form" data-task-id="${task.id}" data-due-date="${task.dueDate}">
                        <label for="alarm-${task.id}">Minutes before</label>
                        <input id="alarm-${task.id}" type="number" name="minutesBefore" min="1" placeholder="Ex: 30" required>
                        <button type="submit">Add alarm</button>
                        <output class="alarm-preview">Enter the minutes to preview the alarm.</output>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderPriorityBadge(priority) {
	if (priority === null || priority === undefined || priority === "") return "";

	return `<span class="task-priority-badge">Prioridade ${priority}</span>`;
}

function renderEmailIndicator(task) {
	if (!task.emailNotificationEnabled || task.emailRecipientId == null) {
		return "";
	}

	return `
		<p class="task-email-indicator">
			<img src="../assets/icons/mailSend.svg" alt="">
			<span>E-mail programado para 24 horas antes, data: ${formatEmailScheduledAt(task)}</span>
		</p>
	`;
}

function formatEmailScheduledAt(task) {
	const dueDate = new Date(task.dueDate);
	const scheduledAt = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);

	return scheduledAt.toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).replace(",", " às");
}

function renderEmailSettings(task, recipients, isOpen) {
	if (!isOpen) return "";

	const options = recipients
		.map((recipient) => `
			<option value="${recipient.id}"${recipient.id === task.emailRecipientId ? " selected" : ""}>
				${recipient.name} (${recipient.email})
			</option>
		`)
		.join("");

	const toggleIcon = task.emailNotificationEnabled ? "on.svg" : "of.svg";
	const toggleLabel = task.emailNotificationEnabled ? "Desligar aviso" : "Ligar aviso";

	return `
		<div class="task-email-settings">
			<label for="task-email-recipient-${task.id}">Enviar e-mail 24h antes</label>
			<select
				id="task-email-recipient-${task.id}"
				class="task-email-recipient"
				onchange="setTaskEmailRecipient(${task.id}, this.value)"
			>
				<option value="">Selecione um destinatário</option>
				${options}
			</select>
			<button
				type="button"
				class="task-email-toggle"
				onclick="toggleTaskEmailNotification(${task.id})"
				aria-label="${toggleLabel}"
				title="${toggleLabel}"
			>
				<img src="../assets/icons/${toggleIcon}" alt="">
			</button>
		</div>
	`;
}

function formatDate(dateTime) {
    if (!dateTime) return "";

    const [date, time] = dateTime.split("T");
    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year} às ${time}`;
}

function renderAlarms(taskId, alarms) {
    if (!alarms.length) {
        return `<p class="alarm-empty">No alarms scheduled.</p>`;
    }

    return alarms
        .map((alarm) => `
            <div class="alarm-item">
                <span>
                    ${new Date(alarm.alarmAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short"
                    })}
                </span>

                <button
                    type="button"
                    class="alarm-delete"
                    onclick="deleteAlarm(${taskId}, ${alarm.id})"
                    title="Remove alarm"
                    aria-label="Remove alarm"
                >
                    &times;
                </button>
            </div>
        `)
        .join("");
}
