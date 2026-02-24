// Navbar component
import { getUser, subscribe, isLoggedIn } from '../state.js';
import { login, logout } from '../api/auth.js';
import { escapeHtml } from '../utils/dom.js';
import { showModal } from './modal.js';
import { isDarkMode, toggleTheme } from '../utils/theme.js';

function showLoginPrompt() {
    const modal = showModal({
        title: 'Login Required',
        content: `
            <p class="text-content-secondary mb-6">You need to be logged in to access this feature.</p>
            <div class="flex flex-col gap-3">
                <button id="modal-login" class="w-full py-2.5 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2" style="background-color: #5865F2;">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Login with Discord
                </button>
                <button id="modal-dismiss" class="w-full btn-secondary py-2 px-4 rounded-lg text-sm">
                    Cancel
                </button>
            </div>
        `,
        size: 'sm'
    });

    document.getElementById('modal-login').addEventListener('click', () => {
        modal.close();
        login();
    });

    document.getElementById('modal-dismiss').addEventListener('click', () => {
        modal.close();
    });
}

export function renderNavbar() {
    const navbar = document.getElementById('navbar');

    function update() {
        const user = getUser();
        const dark = isDarkMode();

        navbar.innerHTML = `
            <nav class="bg-white border-b border-surface-200 fixed top-0 left-0 right-0 z-50">
                <div class="container mx-auto px-4">
                    <div class="flex items-center justify-between h-14">

                        <!-- Left: logo + nav links -->
                        <div class="flex items-center gap-8">
                            <a href="#/" class="flex items-center group flex-shrink-0">
                                <span class="transition-opacity group-hover:opacity-75"
                                      style="font-family:'Barlow Condensed',system-ui; font-size:1.4rem; font-weight:800; letter-spacing:0.04em; text-transform:uppercase; line-height:1;">
                                    <span style="color:#2056b8;">iR</span><span class="text-content-primary">Teammate</span>
                                </span>
                            </a>

                            <div class="hidden md:flex items-center gap-1">
                                <a href="#/browse" class="text-content-secondary hover:text-content-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100">
                                    Find Teammates
                                </a>
                                <a href="#/posts/create" data-auth-required class="text-content-secondary hover:text-content-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100">
                                    Create Post
                                </a>
                                ${user ? `
                                <a href="#/my-posts" class="text-content-secondary hover:text-content-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100">
                                    My Posts
                                </a>
                                <a href="#/my-applications" class="text-content-secondary hover:text-content-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100">
                                    My Applications
                                </a>
                                <a href="#/my-teams" class="text-content-secondary hover:text-content-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100">
                                    My Teams
                                </a>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Right: user menu / login -->
                        <div class="flex items-center">
                            ${user ? `
                                <div class="relative" id="profile-dropdown-container">
                                    <button id="profile-toggle" class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-100 transition-colors">
                                        ${user.avatar
                                            ? `<img src="${escapeHtml(user.avatar)}" alt="" class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-200">`
                                            : `<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-surface-200"
                                                    style="background: #dce8fd; color: #1845a0;">${escapeHtml(user.username.charAt(0).toUpperCase())}</div>`
                                        }
                                        <span class="text-sm font-medium text-content-primary hidden sm:block">${escapeHtml(user.username)}</span>
                                        <svg class="w-4 h-4 text-content-muted transition-transform" id="profile-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>

                                    <div id="profile-menu" class="hidden absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-surface-200 shadow-medium py-1.5 z-50">
                                        <div class="px-3.5 py-2.5 border-b border-surface-200">
                                            <p class="text-sm font-semibold text-content-primary">${escapeHtml(user.username)}</p>
                                            <p class="text-xs text-content-muted mt-0.5">Discord Account</p>
                                        </div>
                                        <div class="py-1">
                                            <a href="#/profile" class="profile-menu-item flex items-center gap-2.5 px-3.5 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-surface-100 transition-colors">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                </svg>
                                                My Profile
                                            </a>
                                        </div>
                                        <div class="border-t border-surface-200 px-3.5 py-2.5">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-2 text-sm text-content-secondary">
                                                    <span id="theme-icon" style="display:inline-flex; width:1rem; height:1rem; color:${dark ? '#fbbf24' : '#9c9189'};">
                                                        ${dark
                                                            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:1rem;height:1rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`
                                                            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:1rem;height:1rem;"><circle cx="12" cy="12" r="4" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`
                                                        }
                                                    </span>
                                                    <span>Dark mode</span>
                                                </div>
                                                <button id="theme-toggle"
                                                    title="${dark ? 'Switch to light mode' : 'Switch to dark mode'}"
                                                    style="position:relative; display:inline-flex; align-items:center;
                                                           width:2.25rem; height:1.25rem; border-radius:9999px;
                                                           background:${dark ? '#2056b8' : '#c8c2b9'};
                                                           border:none; cursor:pointer; padding:0;
                                                           transition:background 0.2s ease; flex-shrink:0;">
                                                    <span id="theme-knob"
                                                          style="display:inline-block; width:1rem; height:1rem; border-radius:50%;
                                                                 background:white; box-shadow:0 1px 3px rgba(0,0,0,0.25);
                                                                 transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
                                                                 transform:translateX(${dark ? '1.125rem' : '0.125rem'});">
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="border-t border-surface-200 pt-1">
                                            <button id="logout-btn" class="profile-menu-item w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                                </svg>
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <button id="login-btn" class="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                    Login with Discord
                                </button>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Mobile menu -->
                <div class="md:hidden border-t border-surface-200">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        <a href="#/browse" class="text-content-secondary hover:text-content-primary hover:bg-surface-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                            Find Teammates
                        </a>
                        <a href="#/posts/create" data-auth-required class="text-content-secondary hover:text-content-primary hover:bg-surface-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                            Create Post
                        </a>
                        <a href="#/my-posts" data-auth-required class="text-content-secondary hover:text-content-primary hover:bg-surface-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                            My Posts
                        </a>
                        <a href="#/my-applications" data-auth-required class="text-content-secondary hover:text-content-primary hover:bg-surface-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                            My Applications
                        </a>
                        ${user ? `
                        <a href="#/my-teams" class="text-content-secondary hover:text-content-primary hover:bg-surface-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                            My Teams
                        </a>
                        ` : ''}
                    </div>
                </div>
            </nav>
        `;

        // Event listeners
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.addEventListener('click', login);

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);

        // Profile dropdown
        const profileToggle = document.getElementById('profile-toggle');
        const profileMenu   = document.getElementById('profile-menu');
        const profileChevron = document.getElementById('profile-chevron');

        if (profileToggle && profileMenu) {
            profileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = !profileMenu.classList.contains('hidden');
                profileMenu.classList.toggle('hidden');
                if (profileChevron) {
                    profileChevron.style.transform = isOpen ? '' : 'rotate(180deg)';
                }
            });

            document.addEventListener('click', (e) => {
                if (!profileMenu.classList.contains('hidden') && !profileMenu.contains(e.target)) {
                    profileMenu.classList.add('hidden');
                    if (profileChevron) profileChevron.style.transform = '';
                }
            });

            profileMenu.querySelectorAll('.profile-menu-item').forEach(item => {
                if (item.tagName === 'A') {
                    item.addEventListener('click', () => {
                        profileMenu.classList.add('hidden');
                        if (profileChevron) profileChevron.style.transform = '';
                    });
                }
            });
        }

        // Dark mode toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const next = toggleTheme();
                const nowDark = next === 'dark';

                themeToggle.style.background = nowDark ? '#2056b8' : '#c8c2b9';
                themeToggle.title = nowDark ? 'Switch to light mode' : 'Switch to dark mode';

                const knob = document.getElementById('theme-knob');
                if (knob) knob.style.transform = `translateX(${nowDark ? '1.125rem' : '0.125rem'})`;

                const icon = document.getElementById('theme-icon');
                if (icon) {
                    icon.style.color = nowDark ? '#fbbf24' : '#9c9189';
                    icon.innerHTML = nowDark
                        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:1rem;height:1rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:1rem;height:1rem;"><circle cx="12" cy="12" r="4" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
                }
            });
        }

        // Auth-gate
        navbar.querySelectorAll('[data-auth-required]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!isLoggedIn()) {
                    e.preventDefault();
                    showLoginPrompt();
                }
            });
        });
    }

    update();
    subscribe('user', update);
}
