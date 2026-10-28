export function dropdownMenu() {
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');
    //setando cor
    if (nav.style.backgroundColor === 'var(--dark-gray)') {
        nav.style.backgroundColor = 'var(--half-gray)';
    } else {
        nav.style.backgroundColor = 'var(--dark-gray)';
    }

    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
    }
}

export function showEmailSettings() {
    const emailSettingsPanel = document.querySelector('.email-settings-panel');
    if (emailSettingsPanel.style.display === 'block') {
        emailSettingsPanel.style.display = 'none';
    } else {
        emailSettingsPanel.style.display = 'block';
    }
}