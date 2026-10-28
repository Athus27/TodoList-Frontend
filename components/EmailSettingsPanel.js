export function EmailSettingsPanel() {
    return `
        <section class="email-settings-panel">
            <div class="email-settings-header">
                <h3>Email Settings</h3>
            </div>

            <div class="email-settings-form">
                <form id="emailSettingsForm">
                    <label for="recipientName">Nome:</label>
                    <input
                        type="text"
                        id="recipientName"
                        name="recipientName"
                        required
                    >

                    <label for="recipientEmail">E-mail:</label>
                    <input
                        type="email"
                        id="recipientEmail"
                        name="recipientEmail"
                        required
                    >

                    <button type="submit">
                        Cadastrar e-mail
                    </button>
                </form>
            </div>
        </section>
    `;
}