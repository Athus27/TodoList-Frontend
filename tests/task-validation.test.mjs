import test from "node:test";
import assert from "node:assert/strict";

import {
	validateDueDate,
	validatePriority
} from "../services/TaskValidation.js";

test("aceita prioridades inteiras de 1 a 5", () => {
	assert.deepEqual(validatePriority("1"), { valid: true, value: 1 });
	assert.deepEqual(validatePriority("5"), { valid: true, value: 5 });
});

test("rejeita prioridade vazia ou fora do intervalo", () => {
	assert.equal(validatePriority("").error, "required");
	assert.equal(validatePriority("0").error, "range");
	assert.equal(validatePriority("6").error, "range");
});

test("rejeita prioridades que não correspondem à Regex inteira de 1 a 5", () => {
	for (const value of ["01", "10", "1.0", "1,5", "+1", "-1", "texto"]) {
		assert.equal(validatePriority(value).error, "range", value);
	}
});

test("aceita data existente posterior ao instante atual", () => {
	const now = new Date(2026, 9, 25, 17, 0);

	const result = validateDueDate("2026-10-25T18:00", now);

	assert.equal(result.valid, true);
	assert.equal(result.value.getTime(), new Date(2026, 9, 25, 18, 0).getTime());
});

test("rejeita data vazia ou com formato inválido", () => {
	assert.equal(validateDueDate("").error, "required");
	assert.equal(validateDueDate("2026/10/25 18:00").error, "format");
	assert.equal(validateDueDate("2026-1-25T18:00").error, "format");
	assert.equal(validateDueDate("2026-10-25 18:00").error, "format");
});

test("rejeita datas inexistentes mesmo quando o parser poderia normalizá-las", () => {
	const now = new Date(2026, 0, 1);

	assert.equal(validateDueDate("2026-02-30T10:00", now).error, "invalid-date");
	assert.equal(validateDueDate("2026-04-31T10:00", now).error, "invalid-date");
	assert.equal(validateDueDate("2026-10-25T25:00", now).error, "invalid-date");
	assert.equal(validateDueDate("2026-10-25T10:60", now).error, "invalid-date");
});

test("rejeita data anterior ou igual ao instante atual", () => {
	const now = new Date(2026, 9, 25, 18, 0);

	assert.equal(validateDueDate("2026-10-25T17:59", now).error, "past");
	assert.equal(validateDueDate("2026-10-25T18:00", now).error, "past");
});
