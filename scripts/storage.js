export function saveBoard(board) {
	localStorage.setItem("board", JSON.stringify(board.tasks));
	console.log("salvando tasks...");
}

export function loadTasks() {
	const tasks = localStorage.getItem("board");

	return tasks ? JSON.parse(tasks) : null;
}

export function saveEmailSettings(emailSettings) {
	localStorage.setItem("emailSettings", JSON.stringify(emailSettings));
	console.log("salvando email settings...");
}

export function loadEmailSettings() {
	const emailSettings = localStorage.getItem("emailSettings");

	return emailSettings ? JSON.parse(emailSettings) : null;
}
