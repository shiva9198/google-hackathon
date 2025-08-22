'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // --- DOM Element Selectors ---
  const ui = {
    themeSwitcher: document.getElementById('theme-switcher'),
    sidebar: document.querySelector('.sidebar'),
    menuBtn: document.getElementById('menu-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    pages: document.querySelectorAll('.page'),
    pageTitle: document.getElementById('page-title'),
    chat: {
      form: document.getElementById('chat-form'),
      input: document.getElementById('chat-input'),
      history: document.getElementById('chat-history'),
      fileInput: document.getElementById('fileInput'),
      attachBtn: document.getElementById('attachBtn'),
      dropZone: document.getElementById('dropZone'),
    }
  };

  // --- THEME MANAGEMENT ---
  const THEME_KEY = 'gemini-chat-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(mode) {
    if (mode === 'system') {
      document.body.classList.toggle('dark', prefersDark.matches);
    } else {
      document.body.classList.toggle('dark', mode === 'dark');
    }
    localStorage.setItem(THEME_KEY, mode);
  }

  // --- NAVIGATION / PAGE SWITCHING ---
  function switchPage(pageId) {
    ui.pages.forEach(page => page.classList.toggle('active', page.id === `page-${pageId}`));
    ui.pages.forEach(page => page.classList.toggle('hidden', page.id !== `page-${pageId}`));

    ui.navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === pageId));

    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
        ui.pageTitle.textContent = activeLink.querySelector('span').textContent;
    } else if (pageId === 'settings') {
        ui.pageTitle.textContent = 'Settings';
    }

    if (window.innerWidth <= 768) {
      ui.sidebar.classList.remove('open');
    }
  }

  // --- CHAT FUNCTIONALITY ---
  function addMessage(sender, text) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
    ui.chat.history.appendChild(messageEl);
    ui.chat.history.scrollTop = ui.chat.history.scrollHeight;
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    const userInput = ui.chat.input.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    ui.chat.input.value = '';

    setTimeout(() => {
      addMessage('ai', 'Thinking...');
    }, 500);

    setTimeout(() => {
        ui.chat.history.lastChild.remove();
        addMessage('ai', `This is a mocked response for: "${userInput}". You would connect your Gemini API here to provide a real answer.`);
    }, 2000);
  }

  // --- FILE HANDLING ---
  function handleFiles(files) {
    [...files].forEach(file => {
      addMessage('user', `📎 Attached: ${file.name} (${Math.round(file.size/1024)} KB)`);
    });
  }

  // --- EVENT LISTENERS ---
  // Theme switcher
  ui.themeSwitcher.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button && button.dataset.theme) {
      applyTheme(button.dataset.theme);
    }
  });
  prefersDark.addEventListener('change', () => {
    if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') {
      applyTheme('system');
    }
  });

  // Page navigation
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (link) {
      e.preventDefault();
      switchPage(link.dataset.page);
    }
  });

  // Chat
  ui.chat.form.addEventListener('submit', handleChatSubmit);

  // Mobile sidebar toggle
  ui.menuBtn.addEventListener('click', () => ui.sidebar.classList.toggle('open'));

  // Attach button → open file picker
  ui.chat.attachBtn.addEventListener('click', () => ui.chat.fileInput.click());

  // File input → handle files
  ui.chat.fileInput.addEventListener('change', () => handleFiles(ui.chat.fileInput.files));

  // Drag & Drop support
  ui.chat.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    ui.chat.dropZone.classList.add('dragover');
  });
  ui.chat.dropZone.addEventListener('dragleave', () => {
    ui.chat.dropZone.classList.remove('dragover');
  });
  ui.chat.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    ui.chat.dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  // --- INITIALIZATION ---
  applyTheme(localStorage.getItem(THEME_KEY) || 'system');
  switchPage('chat');
});
