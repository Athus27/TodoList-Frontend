export class BoardModel {
	constructor() {
		this.tasks = [];
	}

	addTask(task) {
		this.tasks.push(task);
		this.tasks = this.orderTasksBySection(this.tasks);
	}

	removeTask(taskId) {
		this.tasks = this.tasks.filter((task) => task.id !== taskId);
	}

	getTask(taskId) {
		return this.tasks.find((task) => task.id === taskId) ?? null;
	}

	getTasks() {
		console.log("getTasks chamada");
		return this.tasks;
	}

	updateTaskStatus(status) {
		switch (status) {
			case "ToDo":
				return "Doing";
			case "Doing":
				return "Done";
			case "Done":
				return null;
			default:
				return status;
		}
	}

	/**
	 * Dado um array de tarefas, ordena as tarefas com base na ordem das seções (ToDo, Doing, Done).
	 * A arrow function usada para comparar as seções das tarefas e determinar a ordem correta.
	 * Se >0, taskB vem antes, se <0, taskA vem antes, se 0, a ordem permanece inalterada.
	 * @param {Array<import('./TaskModel').TaskModel>} tasks
	 * @returns {Array<import('./TaskModel').TaskModel>} Retorna um novo array de tarefas ordenadas.
	 */
	orderTasksBySection(tasks) {
		console.log("OrderTasks chamada");
		return tasks.sort((taskA, taskB) => {
			return this.getSectionOrder(taskA.status) - this.getSectionOrder(taskB.status);
		});
	}

	getSectionOrder(section) {
		switch (section) {
			case "ToDo":
				return 1;
			case "Doing":
				return 2;
			case "Done":
				return 3;
			default:
				return 4;
		}
	}

	moveTask(taskId, direction) {
		const task = this.tasks.find((task) => task.id === taskId);
		if (!task) return false;

		const statuses = ["ToDo", "Doing", "Done"];
		const currentIndex = statuses.indexOf(task.status);
		const movement = direction === "down" ? 1 : -1;
		const nextIndex = currentIndex + movement;

		if (nextIndex < 0 || nextIndex >= statuses.length) {
			return false;
		}

		task.status = statuses[nextIndex];
		this.orderTasksBySection(this.tasks);

		return true;
	}

	updateTasksStatus(taskIds, status) {
		const validStatuses = ["ToDo", "Doing", "Done"];
		if (!validStatuses.includes(status)) return 0;

		const selectedIds = new Set(taskIds);
		let updatedCount = 0;

		for (const task of this.tasks) {
			if (!selectedIds.has(task.id)) continue;

			task.status = status;
			updatedCount++;
		}

		this.orderTasksBySection(this.tasks);
		return updatedCount;
	}

	addAlarm(taskId, alarm) {
		const task = this.getTask(taskId);

		if (!task || task.status === "Done") {
			return false;
		}

		task.addAlarm(alarm);
		return true;
	}

	removeAlarm(taskId, alarmId) {
		const task = this.getTask(taskId);

		if (task) {
			task.removeAlarm(alarmId);
			return;
		}

		console.log("não foi possivel remover o alarme");
	}

	updateTask(taskId, changes) {
		const task = this.getTask(taskId);

		if (!task) return false;

		task.title = changes.title;
		task.description = changes.description;
		task.dueDate = changes.dueDate;

		return true;
	}
}
