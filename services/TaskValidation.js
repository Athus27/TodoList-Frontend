const PRIORITY_PATTERN = /^[1-5]$/;
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function validatePriority(value) {
	if (value === "") {
		return { valid: false, error: "required" };
	}

	if (!PRIORITY_PATTERN.test(String(value))) {
		return { valid: false, error: "range" };
	}

	return { valid: true, value: Number(value) };
}

export function validateDueDate(value, now = new Date()) {
	if (value === "") {
		return { valid: false, error: "required" };
	}

	const normalizedValue = String(value);
	if (!DUE_DATE_PATTERN.test(normalizedValue)) {
		return { valid: false, error: "format" };
	}

	const [datePart, timePart] = normalizedValue.split("T");
	const [year, month, day] = datePart.split("-").map(Number);
	const [hour, minute] = timePart.split(":").map(Number);
	const dueDate = new Date(year, month - 1, day, hour, minute);

	if (
		!Number.isFinite(dueDate.getTime()) ||
		dueDate.getFullYear() !== year ||
		dueDate.getMonth() !== month - 1 ||
		dueDate.getDate() !== day ||
		dueDate.getHours() !== hour ||
		dueDate.getMinutes() !== minute
	) {
		return { valid: false, error: "invalid-date" };
	}

	if (dueDate <= now) {
		return { valid: false, error: "past" };
	}

	return { valid: true, value: dueDate };
}
