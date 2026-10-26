import { TaskCard } from "./TaskCard.js";

export function Board(tasks) {
	return `
		<section class="board">
			<div class="board-header">
				<div class="manage-tasks">
					<h1>My Board</h1>		
				</div>
				<div class="control-buttons">
					<button class="add-task-btn" onClick="addTaskShow()">+</button>
				</div>
			</div>
			<div class="add-task-form">
				<form id="taskForm">
					<label for="title">Title:</label>
					<input type="text" id="title" name="title" required />

					<label for="description">Description:</label>
					<textarea id="description" name="description" required></textarea>

					<label for="dueDate">Due Date:</label>
					<input
						type="datetime-local"
						id="dueDate"
						name="dueDate"
						required
					>
					<button type="submit">Add Task</button>
				</form>
			</div>

			${renderBoardSection(tasks, "ToDo", "ToDo", "todo")}
			${renderBoardSection(tasks, "Doing", "Doing", "doing")}
			${renderBoardSection(tasks, "Done", "Done", "done")}
		</section>
	`;
}

function renderBoardSection(tasks, status, title, className) {
	return `
		<div class="board-section ${className}" data-status="${status}">
			<div class="board-section-header">
				<h2>${title}</h2>
				<button
					type="button"
					class="apply-status-btn"
					onclick="applySelectedTasksStatus(this)"
					title="Mover tarefas selecionadas para ${title}"
					aria-label="Mover tarefas selecionadas para ${title}"
				>
					<img src="../assets/icons/setStatus.svg" alt="">
				</button>
			</div>
			<ul class="task-list">
				${renderTasksByStatus(tasks, status)}
			</ul>
		</div>
	`;
}

function renderTasksByStatus(tasks, status) {
	return tasks
		.filter((task) => task.status === status)
		.map((task) => `<li>${TaskCard(task)}</li>`)
		.join("");
}
