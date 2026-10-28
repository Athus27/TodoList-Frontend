export class EmailSettingsModel {
    constructor(data = {}) {
        this.recipients = data.recipients ?? [];
        this.lastRecipientId = data.lastRecipientId ?? null;
    }

	addRecipient({ name, email }) {
		const normalizedName = name.trim();
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedName || !normalizedEmail) return null;

		const emailAlreadyExists = this.recipients.some(
			(recipient) => recipient.email.toLowerCase() === normalizedEmail
		);

		if (emailAlreadyExists) return null;

		const nextId = this.recipients.reduce(
			(highestId, recipient) => Math.max(highestId, recipient.id),
			0
		) + 1;

		const recipient = {
			id: nextId,
			name: normalizedName,
			email: normalizedEmail
		};

		this.recipients.push(recipient);
		this.lastRecipientId = recipient.id;

		return recipient;
	}

	getRecipient(recipientId) {
		return this.recipients.find(
			(recipient) => recipient.id === recipientId
		) ?? null;
	}
}
