export function HeaderView() {
	return `
        <header class="header">
            
            <div class="brand">
                <img class ="logo" src="./assets/icons/checklistIcon.svg" alt="Logo" />
                <h1>Todo List</h1>

            </div>
            <nav style = "display: flex; padding-left:20px;">
                <button class="menu-toggle" onclick="dropdownMenu()">
                    <img class="menu-icon   " src="./assets/icons/menu.svg" alt="Menu" />
                </button>
                <ul class="nav-links">
                    <li>
                    <button onclick="showEmailSettings()" class="email-settings-btn" style="background-color: transparent; border: none; cursor: pointer;">
                        <img class = "config-icon" src="./assets/icons/mailConfig.svg" alt="Email Settings" />
                    </button>
                    </li>
                </ul>

            </nav>
        </header>
    `;
}
