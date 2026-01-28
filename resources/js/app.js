import './bootstrap';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    // Initialize theme from localStorage or default to dark
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light');
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        } else {
            document.body.classList.remove('light');
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        const isLight = document.body.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeIconSun.classList.toggle('hidden', isLight);
        themeIconMoon.classList.toggle('hidden', !isLight);
    };

    themeToggle.addEventListener('click', toggleTheme);
    initializeTheme();

    // Main elements
    const methodSelect = document.getElementById('method-select');
    const urlInput = document.getElementById('url-input');
    const sendBtn = document.getElementById('send-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');

    // Sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarRequests = document.getElementById('sidebar-requests');
    const newTabBtn = document.getElementById('new-tab-btn');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const sidebarToggleIcon = document.getElementById('sidebar-toggle-icon');
    const requestCountEl = document.getElementById('request-count');
    let isSidebarCollapsed = false;

    // Response elements
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const responseStatus = document.getElementById('response-status');
    const statusBadge = document.getElementById('status-badge');
    const responseTime = document.getElementById('response-time');
    const responseSize = document.getElementById('response-size');

    // Response tabs elements
    const responseTabsContainer = document.getElementById('response-tabs-container');
    const responseTabBtns = document.querySelectorAll('.response-tab-btn');
    const responsePretty = document.getElementById('response-pretty');
    const responseRaw = document.getElementById('response-raw');
    const responsePreview = document.getElementById('response-preview');
    const previewIframe = document.getElementById('preview-iframe');
    const responseHeaders = document.getElementById('response-headers');
    const responseHeadersBody = document.getElementById('response-headers-body');
    const responseCookies = document.getElementById('response-cookies');
    const responseCookiesBody = document.getElementById('response-cookies-body');
    const cookiesEmpty = document.getElementById('cookies-empty');
    const cookiesTable = document.getElementById('cookies-table');

    // Tab elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const paramsTab = document.getElementById('params-tab');
    const headersTab = document.getElementById('headers-tab');
    const bodyTab = document.getElementById('body-tab');

    // Params elements
    const paramsContainer = document.getElementById('params-container');
    const addParamBtn = document.getElementById('add-param-btn');
    const paramsCount = document.getElementById('params-count');

    // Headers elements
    const headersContainer = document.getElementById('headers-container');
    const addHeaderBtn = document.getElementById('add-header-btn');
    const headersCount = document.getElementById('headers-count');

    // Body elements
    const bodyTypeRadios = document.querySelectorAll('input[name="body-type"]');
    const bodyEditorContainer = document.getElementById('body-editor-container');
    const bodyEditor = document.getElementById('body-editor');
    const formDataContainer = document.getElementById('form-data-container');
    const formDataFields = document.getElementById('form-data-fields');
    const addFormFieldBtn = document.getElementById('add-form-field-btn');

    // Collapse elements
    const collapseBtn = document.getElementById('collapse-btn');
    const collapseIcon = document.getElementById('collapse-icon');
    const tabContent = document.getElementById('tab-content');
    let isCollapsed = false;

    let currentResponseTab = 'pretty';

    // =====================
    // TAB MANAGEMENT SYSTEM
    // =====================
    const MAX_TABS = 10;
    let tabs = [];
    let activeTabId = null;

    // Method colors
    const methodColors = {
        'GET': 'text-green-400',
        'POST': 'text-yellow-400',
        'PUT': 'text-blue-400',
        'PATCH': 'text-purple-400',
        'DELETE': 'text-red-400',
        'HEAD': 'text-gray-400',
        'OPTIONS': 'text-pink-400'
    };

    const methodBgColors = {
        'GET': 'bg-green-500/20',
        'POST': 'bg-yellow-500/20',
        'PUT': 'bg-blue-500/20',
        'PATCH': 'bg-purple-500/20',
        'DELETE': 'bg-red-500/20',
        'HEAD': 'bg-gray-500/20',
        'OPTIONS': 'bg-pink-500/20'
    };

    // Generate unique tab ID
    const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create a new tab object with default state
    const createTabObject = () => ({
        id: generateTabId(),
        name: 'New Request',
        method: 'GET',
        url: '',
        params: [],
        headers: [],
        bodyType: 'none',
        bodyContent: '',
        formData: [],
        response: null,
        activeRequestTab: 'params'
    });

    // Get key-value pairs from container as array
    const getKeyValuePairsArray = (container) => {
        const pairs = [];
        container.querySelectorAll('.key-value-row').forEach(row => {
            const enabled = row.querySelector('.kv-enabled').checked;
            const key = row.querySelector('.kv-key').value;
            const value = row.querySelector('.kv-value').value;
            pairs.push({ enabled, key, value });
        });
        return pairs;
    };

    // Save current form state to active tab
    const saveCurrentTabState = () => {
        if (!activeTabId) return;

        const tab = tabs.find(t => t.id === activeTabId);
        if (!tab) return;

        tab.method = methodSelect.value;
        tab.url = urlInput.value;
        tab.params = getKeyValuePairsArray(paramsContainer);
        tab.headers = getKeyValuePairsArray(headersContainer);
        tab.bodyType = document.querySelector('input[name="body-type"]:checked')?.value || 'none';
        tab.bodyContent = bodyEditor.value;
        tab.formData = getKeyValuePairsArray(formDataFields);

        // Save active request options tab
        const activeTabBtn = document.querySelector('.tab-btn.active');
        if (activeTabBtn) {
            tab.activeRequestTab = activeTabBtn.dataset.tab;
        }

        // Update tab name based on URL
        tab.name = generateTabName(tab.url, tab.method);

        saveTabsToLocalStorage();
    };

    // Generate tab name from URL
    const generateTabName = (url, method) => {
        if (!url) return 'New Request';
        try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            const hostname = urlObj.hostname.replace('www.', '');
            const pathname = urlObj.pathname !== '/' ? urlObj.pathname : '';
            const shortPath = pathname.length > 15 ? pathname.substring(0, 15) + '...' : pathname;
            return hostname + shortPath || 'New Request';
        } catch {
            return url.substring(0, 20) || 'New Request';
        }
    };

    // Load tab state into form
    const loadTabState = (tab) => {
        // Set method
        methodSelect.value = tab.method;
        updateMethodColor();

        // Set URL
        urlInput.value = tab.url;

        // Clear and set params
        paramsContainer.innerHTML = '';
        tab.params.forEach(p => {
            const row = createKeyValueRow(paramsContainer, 'Parameter name', 'Value', false);
            row.querySelector('.kv-enabled').checked = p.enabled;
            row.querySelector('.kv-key').value = p.key;
            row.querySelector('.kv-value').value = p.value;
        });

        // Clear and set headers
        headersContainer.innerHTML = '';
        tab.headers.forEach(h => {
            const row = createKeyValueRow(headersContainer, 'Header name', 'Value', false);
            row.querySelector('.kv-enabled').checked = h.enabled;
            row.querySelector('.kv-key').value = h.key;
            row.querySelector('.kv-value').value = h.value;
        });

        // Set body type
        const bodyRadio = document.querySelector(`input[name="body-type"][value="${tab.bodyType}"]`);
        if (bodyRadio) {
            bodyRadio.checked = true;
            bodyRadio.dispatchEvent(new Event('change'));
        }

        // Set body content
        bodyEditor.value = tab.bodyContent;

        // Clear and set form data
        formDataFields.innerHTML = '';
        tab.formData.forEach(f => {
            const row = createKeyValueRow(formDataFields, 'Field name', 'Value', false);
            row.querySelector('.kv-enabled').checked = f.enabled;
            row.querySelector('.kv-key').value = f.key;
            row.querySelector('.kv-value').value = f.value;
        });

        // Restore active request tab
        if (tab.activeRequestTab) {
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab.activeRequestTab}"]`);
            if (tabBtn) {
                tabBtn.click();
            }
        }

        // Load response if exists
        if (tab.response) {
            displayResponse(tab.response);
        } else {
            showState('empty');
        }

        updateCounts();
    };

    // Display response from tab data
    const displayResponse = (responseData) => {
        if (!responseData) {
            showState('empty');
            return;
        }

        const { status, statusText, duration, size, body, headers, cookies } = responseData;

        // Populate Pretty view
        let prettyContent = body;
        try {
            const parsed = JSON.parse(body);
            prettyContent = syntaxHighlight(parsed);
        } catch {
            prettyContent = body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        responsePretty.innerHTML = prettyContent;

        // Populate Raw view
        responseRaw.textContent = body;

        // Populate Preview view
        const contentType = Object.keys(headers || {}).find(k => k.toLowerCase() === 'content-type');
        const contentTypeValue = contentType ? headers[contentType] : '';
        const isHtml = Array.isArray(contentTypeValue)
            ? contentTypeValue.some(v => v.includes('text/html'))
            : contentTypeValue.includes('text/html');

        if (isHtml) {
            previewIframe.srcdoc = body;
        } else {
            previewIframe.srcdoc = `<html><body style="font-family: monospace; white-space: pre-wrap; padding: 16px;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`;
        }

        // Populate Headers view
        responseHeadersBody.innerHTML = '';
        Object.entries(headers || {}).forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-border';
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            row.innerHTML = `
                <td class="py-2 pr-4 text-purple-400">${key}</td>
                <td class="py-2 text-green-400 break-all">${displayValue}</td>
            `;
            responseHeadersBody.appendChild(row);
        });

        // Populate Cookies view
        responseCookiesBody.innerHTML = '';
        if (cookies && cookies.length > 0) {
            cookiesEmpty.classList.add('hidden');
            cookiesTable.classList.remove('hidden');
            cookies.forEach(cookie => {
                const row = document.createElement('tr');
                row.className = 'border-b border-border';
                const flags = [];
                if (cookie.secure) flags.push('Secure');
                if (cookie.httpOnly) flags.push('HttpOnly');
                row.innerHTML = `
                    <td class="py-2 pr-4 text-purple-400">${cookie.name}</td>
                    <td class="py-2 pr-4 text-green-400 break-all max-w-48 truncate" title="${cookie.value}">${cookie.value}</td>
                    <td class="py-2 pr-4 text-text-secondary">${cookie.domain || '-'}</td>
                    <td class="py-2 pr-4 text-text-secondary">${cookie.path || '-'}</td>
                    <td class="py-2 text-text-muted text-xs">${flags.join(', ') || '-'}</td>
                `;
                responseCookiesBody.appendChild(row);
            });
        } else {
            cookiesEmpty.classList.remove('hidden');
            cookiesTable.classList.add('hidden');
        }

        // Update status bar
        statusBadge.textContent = `${status} ${statusText || ''}`;
        statusBadge.className = `px-2 py-1 rounded text-xs font-semibold ${getStatusColor(status)}`;
        responseTime.textContent = `${duration} ms`;
        responseSize.textContent = formatSize(size);

        currentResponseTab = 'pretty';
        responseTabBtns.forEach(btn => {
            btn.classList.remove('active', 'text-orange-500', 'border-orange-500');
            btn.classList.add('text-text-secondary', 'border-transparent');
            if (btn.dataset.responseTab === 'pretty') {
                btn.classList.add('active', 'text-orange-500', 'border-orange-500');
                btn.classList.remove('text-text-secondary', 'border-transparent');
            }
        });
        showState('response');
    };

    // Render sidebar requests
    const renderTabs = () => {
        sidebarRequests.innerHTML = '';

        tabs.forEach(tab => {
            const requestEl = document.createElement('div');
            requestEl.className = `sidebar-request group flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
                tab.id === activeTabId
                    ? 'bg-input border-l-2 border-orange-500'
                    : 'hover:bg-input/50 border-l-2 border-transparent'
            }`;
            requestEl.dataset.tabId = tab.id;

            const methodBadge = document.createElement('span');
            methodBadge.className = `text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${methodColors[tab.method]} ${methodBgColors[tab.method]}`;
            methodBadge.textContent = tab.method.substring(0, 3);

            const nameContainer = document.createElement('div');
            nameContainer.className = 'flex-1 min-w-0';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'request-name text-sm block truncate';
            nameSpan.textContent = tab.customName || tab.name;
            nameSpan.title = 'Double-click to rename';

            // Rename input (hidden by default)
            const renameInput = document.createElement('input');
            renameInput.type = 'text';
            renameInput.className = 'rename-input hidden w-full bg-input border border-orange-500 rounded px-2 py-0.5 text-sm focus:outline-none';
            renameInput.value = tab.customName || tab.name;

            nameContainer.appendChild(nameSpan);
            nameContainer.appendChild(renameInput);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'request-close opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-border text-text-muted hover:text-red-400 transition-all shrink-0';
            closeBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
            closeBtn.title = 'Close (Ctrl+W)';

            // Double-click to rename
            nameSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                nameSpan.classList.add('hidden');
                renameInput.classList.remove('hidden');
                renameInput.value = tab.customName || tab.name;
                renameInput.focus();
                renameInput.select();
            });

            // Save rename on blur or Enter
            const saveRename = () => {
                const newName = renameInput.value.trim();
                if (newName) {
                    tab.customName = newName;
                    nameSpan.textContent = newName;
                    saveTabsToLocalStorage();
                }
                renameInput.classList.add('hidden');
                nameSpan.classList.remove('hidden');
            };

            renameInput.addEventListener('blur', saveRename);
            renameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveRename();
                } else if (e.key === 'Escape') {
                    renameInput.classList.add('hidden');
                    nameSpan.classList.remove('hidden');
                }
            });

            // Prevent rename input click from switching tabs
            renameInput.addEventListener('click', (e) => e.stopPropagation());

            // Prevent close button click from switching tabs
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(tab.id);
            });

            requestEl.appendChild(methodBadge);
            requestEl.appendChild(nameContainer);
            requestEl.appendChild(closeBtn);

            // Click to switch tabs
            requestEl.addEventListener('click', () => {
                switchTab(tab.id);
            });

            sidebarRequests.appendChild(requestEl);
        });

        // Update request count
        requestCountEl.textContent = tabs.length;
    };

    // Create a new tab
    const createTab = () => {
        if (tabs.length >= MAX_TABS) {
            alert(`Maximum of ${MAX_TABS} tabs allowed. Please close a tab first.`);
            return null;
        }

        // Save current tab state before creating new
        saveCurrentTabState();

        const newTab = createTabObject();
        tabs.push(newTab);
        activeTabId = newTab.id;

        renderTabs();
        loadTabState(newTab);
        saveTabsToLocalStorage();

        return newTab;
    };

    // Switch to a different tab
    const switchTab = (tabId) => {
        if (tabId === activeTabId) return;

        // Save current tab state
        saveCurrentTabState();

        // Switch to new tab
        activeTabId = tabId;
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            loadTabState(tab);
            renderTabs();
        }
    };

    // Close a tab
    const closeTab = (tabId) => {
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        // If only one tab, create a new one before closing
        if (tabs.length === 1) {
            const newTab = createTabObject();
            tabs.push(newTab);
            activeTabId = newTab.id;
            tabs.splice(tabIndex, 1);
            renderTabs();
            loadTabState(newTab);
            saveTabsToLocalStorage();
            return;
        }

        // Remove the tab
        tabs.splice(tabIndex, 1);

        // If closing the active tab, switch to an adjacent tab
        if (tabId === activeTabId) {
            const newIndex = Math.min(tabIndex, tabs.length - 1);
            activeTabId = tabs[newIndex].id;
            loadTabState(tabs[newIndex]);
        }

        renderTabs();
        saveTabsToLocalStorage();
    };

    // Save tabs to localStorage
    const saveTabsToLocalStorage = () => {
        try {
            const data = {
                tabs: tabs,
                activeTabId: activeTabId
            };
            localStorage.setItem('laraget-tabs', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save tabs to localStorage:', e);
        }
    };

    // Load tabs from localStorage
    const loadTabsFromLocalStorage = () => {
        try {
            const saved = localStorage.getItem('laraget-tabs');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.tabs && Array.isArray(data.tabs) && data.tabs.length > 0) {
                    tabs = data.tabs;
                    activeTabId = data.activeTabId || tabs[0].id;
                    return true;
                }
            }
        } catch (e) {
            console.error('Failed to load tabs from localStorage:', e);
        }
        return false;
    };

    // Initialize tabs
    const initializeTabs = () => {
        if (!loadTabsFromLocalStorage()) {
            // Create initial tab
            const initialTab = createTabObject();
            tabs.push(initialTab);
            activeTabId = initialTab.id;
        }

        renderTabs();
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab) {
            loadTabState(activeTab);
        }
    };

    // Update method color
    const updateMethodColor = () => {
        const method = methodSelect.value;
        methodSelect.className = methodSelect.className.replace(/text-\w+-\d+/g, '');
        methodSelect.classList.add(methodColors[method] || 'text-gray-100');
    };

    methodSelect.addEventListener('change', () => {
        updateMethodColor();
        saveCurrentTabState();
        renderTabs();
    });
    updateMethodColor();

    // Tab switching (request options)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-orange-500', 'border-orange-500');
                b.classList.add('text-text-secondary', 'border-transparent');
            });
            btn.classList.add('active', 'text-orange-500', 'border-orange-500');
            btn.classList.remove('text-text-secondary', 'border-transparent');

            paramsTab.classList.add('hidden');
            headersTab.classList.add('hidden');
            bodyTab.classList.add('hidden');

            const tab = btn.dataset.tab;
            if (tab === 'params') paramsTab.classList.remove('hidden');
            if (tab === 'headers') headersTab.classList.remove('hidden');
            if (tab === 'body') bodyTab.classList.remove('hidden');

            saveCurrentTabState();
        });
    });

    // Create key-value row
    const createKeyValueRow = (container, keyPlaceholder = 'Key', valuePlaceholder = 'Value', triggerSave = true) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 key-value-row';
        row.innerHTML = `
            <input type="checkbox" checked class="kv-enabled accent-orange-500 shrink-0">
            <input type="text" placeholder="${keyPlaceholder}" class="kv-key flex-1 bg-input border border-border-hover rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-text-muted">
            <input type="text" placeholder="${valuePlaceholder}" class="kv-value flex-1 bg-input border border-border-hover rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-text-muted">
            <button class="kv-delete text-text-muted hover:text-red-400 p-1 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        row.querySelector('.kv-delete').addEventListener('click', () => {
            row.remove();
            updateCounts();
            saveCurrentTabState();
        });

        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                updateCounts();
                debouncedSaveTabState();
            });
            input.addEventListener('change', () => {
                updateCounts();
                saveCurrentTabState();
            });
        });

        container.appendChild(row);
        if (triggerSave) {
            updateCounts();
            saveCurrentTabState();
        }
        return row;
    };

    // Debounced save for input changes
    let saveTimeout = null;
    const debouncedSaveTabState = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCurrentTabState();
            renderTabs();
        }, 300);
    };

    // Get key-value pairs from container
    const getKeyValuePairs = (container) => {
        const pairs = {};
        container.querySelectorAll('.key-value-row').forEach(row => {
            const enabled = row.querySelector('.kv-enabled').checked;
            const key = row.querySelector('.kv-key').value.trim();
            const value = row.querySelector('.kv-value').value;
            if (enabled && key) {
                pairs[key] = value;
            }
        });
        return pairs;
    };

    // Count active pairs
    const countActivePairs = (container) => {
        let count = 0;
        container.querySelectorAll('.key-value-row').forEach(row => {
            const enabled = row.querySelector('.kv-enabled').checked;
            const key = row.querySelector('.kv-key').value.trim();
            if (enabled && key) count++;
        });
        return count;
    };

    // Update counts
    const updateCounts = () => {
        const pCount = countActivePairs(paramsContainer);
        const hCount = countActivePairs(headersContainer);

        if (pCount > 0) {
            paramsCount.textContent = pCount;
            paramsCount.classList.remove('hidden');
        } else {
            paramsCount.classList.add('hidden');
        }

        if (hCount > 0) {
            headersCount.textContent = hCount;
            headersCount.classList.remove('hidden');
        } else {
            headersCount.classList.add('hidden');
        }
    };

    // Add param/header/form field buttons
    addParamBtn.addEventListener('click', () => createKeyValueRow(paramsContainer, 'Parameter name', 'Value'));
    addHeaderBtn.addEventListener('click', () => createKeyValueRow(headersContainer, 'Header name', 'Value'));
    addFormFieldBtn.addEventListener('click', () => createKeyValueRow(formDataFields, 'Field name', 'Value'));

    // Body type switching
    bodyTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const type = radio.value;
            bodyEditorContainer.classList.add('hidden');
            formDataContainer.classList.add('hidden');

            if (type === 'json' || type === 'raw') {
                bodyEditorContainer.classList.remove('hidden');
                bodyEditor.placeholder = type === 'json' ? '{"key": "value"}' : 'Raw body content';
            } else if (type === 'form') {
                formDataContainer.classList.remove('hidden');
            }

            saveCurrentTabState();
        });
    });

    // Save on body editor change
    bodyEditor.addEventListener('input', debouncedSaveTabState);

    // Save on URL input change
    urlInput.addEventListener('input', () => {
        debouncedSaveTabState();
    });

    // Hide all response views
    const hideAllResponseViews = () => {
        responsePretty.classList.add('hidden');
        responseRaw.classList.add('hidden');
        responsePreview.classList.add('hidden');
        responseHeaders.classList.add('hidden');
        responseCookies.classList.add('hidden');
    };

    // Show specific response view
    const showResponseView = (view) => {
        hideAllResponseViews();
        currentResponseTab = view;

        switch (view) {
            case 'pretty':
                responsePretty.classList.remove('hidden');
                break;
            case 'raw':
                responseRaw.classList.remove('hidden');
                break;
            case 'preview':
                responsePreview.classList.remove('hidden');
                break;
            case 'headers':
                responseHeaders.classList.remove('hidden');
                break;
            case 'cookies':
                responseCookies.classList.remove('hidden');
                break;
        }
    };

    // Response tab switching
    responseTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            responseTabBtns.forEach(b => {
                b.classList.remove('active', 'text-orange-500', 'border-orange-500');
                b.classList.add('text-text-secondary', 'border-transparent');
            });
            btn.classList.add('active', 'text-orange-500', 'border-orange-500');
            btn.classList.remove('text-text-secondary', 'border-transparent');

            const tab = btn.dataset.responseTab;
            showResponseView(tab);
        });
    });

    // Show state helper
    const showState = (state) => {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        hideAllResponseViews();
        errorState.classList.add('hidden');
        errorState.classList.remove('flex');
        copyBtn.classList.add('hidden');
        saveBtn.classList.add('hidden');
        responseStatus.classList.add('hidden');
        responseStatus.classList.remove('flex');
        responseTabsContainer.classList.add('hidden');

        switch (state) {
            case 'empty':
                emptyState.classList.remove('hidden');
                emptyState.classList.add('flex');
                break;
            case 'loading':
                loadingState.classList.remove('hidden');
                loadingState.classList.add('flex');
                break;
            case 'response':
                responseTabsContainer.classList.remove('hidden');
                showResponseView(currentResponseTab);
                copyBtn.classList.remove('hidden');
                saveBtn.classList.remove('hidden');
                responseStatus.classList.remove('hidden');
                responseStatus.classList.add('flex');
                break;
            case 'error':
                errorState.classList.remove('hidden');
                errorState.classList.add('flex');
                break;
        }
    };

    // Status color helper
    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400';
        if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-400';
        if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    // Format size helper
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Syntax highlight JSON
    const syntaxHighlight = (json) => {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        return json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                let cls = 'text-orange-300';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'text-purple-400';
                    } else {
                        cls = 'text-green-400';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'text-blue-400';
                } else if (/null/.test(match)) {
                    cls = 'text-gray-500';
                }
                return `<span class="${cls}">${match}</span>`;
            });
    };

    // Build URL with params
    const buildUrlWithParams = (baseUrl, params) => {
        const url = new URL(baseUrl);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    };

    // Send request
    const sendRequest = async () => {
        const method = methodSelect.value;
        let url = urlInput.value.trim();

        if (!url) {
            showState('error');
            errorMessage.textContent = 'Please enter a URL';
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Get params and add to URL
        const params = getKeyValuePairs(paramsContainer);
        if (Object.keys(params).length > 0) {
            try {
                url = buildUrlWithParams(url, params);
            } catch (e) {
                showState('error');
                errorMessage.textContent = 'Invalid URL format';
                return;
            }
        }

        // Get headers for the target request
        const targetHeaders = getKeyValuePairs(headersContainer);

        // Get body
        let body = null;
        const bodyType = document.querySelector('input[name="body-type"]:checked').value;

        if (bodyType === 'json') {
            const jsonText = bodyEditor.value.trim();
            if (jsonText) {
                try {
                    JSON.parse(jsonText); // Validate JSON
                    body = jsonText;
                    targetHeaders['Content-Type'] = 'application/json';
                } catch (e) {
                    showState('error');
                    errorMessage.textContent = 'Invalid JSON in request body';
                    return;
                }
            }
        } else if (bodyType === 'raw') {
            body = bodyEditor.value;
            if (!targetHeaders['Content-Type']) {
                targetHeaders['Content-Type'] = 'text/plain';
            }
        } else if (bodyType === 'form') {
            const formData = getKeyValuePairs(formDataFields);
            if (Object.keys(formData).length > 0) {
                body = new URLSearchParams(formData).toString();
                targetHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        showState('loading');

        try {
            const response = await axios.post('/proxy', {
                method: method,
                url: url,
                headers: targetHeaders,
                body: body,
            });

            const result = response.data;

            if (!result.success) {
                showState('error');
                errorMessage.textContent = result.message || 'Request failed';
                // Clear response from tab
                const tab = tabs.find(t => t.id === activeTabId);
                if (tab) {
                    tab.response = null;
                    saveTabsToLocalStorage();
                }
                return;
            }

            const responseData = result.body;
            let currentResponse = responseData;
            const currentResponseHeaders = result.headers || {};
            const currentResponseCookies = result.cookies || [];

            // Store response in current tab
            const tab = tabs.find(t => t.id === activeTabId);
            if (tab) {
                try {
                    const parsed = JSON.parse(responseData);
                    currentResponse = JSON.stringify(parsed, null, 2);
                } catch {
                    // Not JSON, keep as-is
                }

                tab.response = {
                    status: result.status,
                    statusText: result.statusText || '',
                    duration: result.duration,
                    size: result.size,
                    body: currentResponse,
                    headers: currentResponseHeaders,
                    cookies: currentResponseCookies
                };
                saveTabsToLocalStorage();
            }

            // Populate Pretty view (syntax highlighted for JSON)
            let prettyContent = responseData;
            try {
                const parsed = JSON.parse(responseData);
                prettyContent = syntaxHighlight(parsed);
            } catch {
                // Not JSON, escape HTML and show as-is
                prettyContent = responseData.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            responsePretty.innerHTML = prettyContent;

            // Populate Raw view
            responseRaw.textContent = responseData;

            // Populate Preview view (for HTML content)
            const contentType = Object.keys(currentResponseHeaders).find(k => k.toLowerCase() === 'content-type');
            const contentTypeValue = contentType ? currentResponseHeaders[contentType] : '';
            const isHtml = Array.isArray(contentTypeValue)
                ? contentTypeValue.some(v => v.includes('text/html'))
                : contentTypeValue.includes('text/html');

            if (isHtml) {
                previewIframe.srcdoc = responseData;
            } else {
                previewIframe.srcdoc = `<html><body style="font-family: monospace; white-space: pre-wrap; padding: 16px;">${responseData.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`;
            }

            // Populate Headers view
            responseHeadersBody.innerHTML = '';
            Object.entries(currentResponseHeaders).forEach(([key, value]) => {
                const row = document.createElement('tr');
                row.className = 'border-b border-border';
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                row.innerHTML = `
                    <td class="py-2 pr-4 text-purple-400">${key}</td>
                    <td class="py-2 text-green-400 break-all">${displayValue}</td>
                `;
                responseHeadersBody.appendChild(row);
            });

            // Populate Cookies view
            responseCookiesBody.innerHTML = '';
            if (currentResponseCookies && currentResponseCookies.length > 0) {
                cookiesEmpty.classList.add('hidden');
                cookiesTable.classList.remove('hidden');
                currentResponseCookies.forEach(cookie => {
                    const row = document.createElement('tr');
                    row.className = 'border-b border-border';
                    const flags = [];
                    if (cookie.secure) flags.push('Secure');
                    if (cookie.httpOnly) flags.push('HttpOnly');
                    row.innerHTML = `
                        <td class="py-2 pr-4 text-purple-400">${cookie.name}</td>
                        <td class="py-2 pr-4 text-green-400 break-all max-w-48 truncate" title="${cookie.value}">${cookie.value}</td>
                        <td class="py-2 pr-4 text-text-secondary">${cookie.domain || '-'}</td>
                        <td class="py-2 pr-4 text-text-secondary">${cookie.path || '-'}</td>
                        <td class="py-2 text-text-muted text-xs">${flags.join(', ') || '-'}</td>
                    `;
                    responseCookiesBody.appendChild(row);
                });
            } else {
                cookiesEmpty.classList.remove('hidden');
                cookiesTable.classList.add('hidden');
            }

            // Update status bar
            statusBadge.textContent = `${result.status} ${result.statusText || ''}`;
            statusBadge.className = `px-2 py-1 rounded text-xs font-semibold ${getStatusColor(result.status)}`;
            responseTime.textContent = `${result.duration} ms`;
            responseSize.textContent = formatSize(result.size);

            // Reset to Pretty tab and show response
            currentResponseTab = 'pretty';
            responseTabBtns.forEach(btn => {
                btn.classList.remove('active', 'text-orange-500', 'border-orange-500');
                btn.classList.add('text-text-secondary', 'border-transparent');
                if (btn.dataset.responseTab === 'pretty') {
                    btn.classList.add('active', 'text-orange-500', 'border-orange-500');
                    btn.classList.remove('text-text-secondary', 'border-transparent');
                }
            });
            showState('response');
        } catch (error) {
            showState('error');
            // Clear response from tab on error
            const tab = tabs.find(t => t.id === activeTabId);
            if (tab) {
                tab.response = null;
                saveTabsToLocalStorage();
            }

            if (error.response?.data?.message) {
                errorMessage.textContent = error.response.data.message;
            } else if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0];
                errorMessage.textContent = Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
                errorMessage.textContent = error.message || 'An error occurred while making the request';
            }
        }
    };

    // Event listeners
    sendBtn.addEventListener('click', sendRequest);

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendRequest();
        }
    });

    copyBtn.addEventListener('click', async () => {
        const tab = tabs.find(t => t.id === activeTabId);
        const currentResponse = tab?.response?.body || '';

        try {
            await navigator.clipboard.writeText(currentResponse);
            copyBtn.innerHTML = `
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `;
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                `;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    // Save response to file
    saveBtn.addEventListener('click', () => {
        const tab = tabs.find(t => t.id === activeTabId);
        if (!tab?.response) return;

        const response = tab.response;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tabName = (tab.customName || tab.name).replace(/[^a-zA-Z0-9]/g, '_');

        // Determine file extension based on content type
        let extension = 'txt';
        const contentType = Object.keys(response.headers || {}).find(k => k.toLowerCase() === 'content-type');
        const contentTypeValue = contentType ? response.headers[contentType] : '';
        const ctValue = Array.isArray(contentTypeValue) ? contentTypeValue[0] : contentTypeValue;

        if (ctValue.includes('application/json')) {
            extension = 'json';
        } else if (ctValue.includes('text/html')) {
            extension = 'html';
        } else if (ctValue.includes('text/xml') || ctValue.includes('application/xml')) {
            extension = 'xml';
        }

        const filename = `${tabName}_${timestamp}.${extension}`;
        const blob = new Blob([response.body], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success feedback
        saveBtn.innerHTML = `
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        `;
        setTimeout(() => {
            saveBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
            `;
        }, 2000);
    });

    // Collapse functionality
    collapseBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            tabContent.classList.add('hidden');
            collapseIcon.style.transform = 'rotate(180deg)';
            collapseBtn.title = 'Expand panel';
        } else {
            tabContent.classList.remove('hidden');
            collapseIcon.style.transform = 'rotate(0deg)';
            collapseBtn.title = 'Collapse panel';
        }
    });

    // New tab button
    newTabBtn.addEventListener('click', createTab);

    // Sidebar toggle
    toggleSidebarBtn.addEventListener('click', () => {
        isSidebarCollapsed = !isSidebarCollapsed;
        if (isSidebarCollapsed) {
            sidebar.classList.add('w-0', 'overflow-hidden');
            sidebar.classList.remove('w-64');
            toggleSidebarBtn.style.left = '0';
            sidebarToggleIcon.style.transform = 'rotate(180deg)';
            toggleSidebarBtn.title = 'Show sidebar';
        } else {
            sidebar.classList.remove('w-0', 'overflow-hidden');
            sidebar.classList.add('w-64');
            toggleSidebarBtn.style.left = '';
            sidebarToggleIcon.style.transform = 'rotate(0deg)';
            toggleSidebarBtn.title = 'Hide sidebar';
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+T: New tab
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            createTab();
        }
        // Ctrl+W: Close current tab
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            if (activeTabId) {
                closeTab(activeTabId);
            }
        }
        // Ctrl+Tab: Next tab
        if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            const currentIndex = tabs.findIndex(t => t.id === activeTabId);
            if (currentIndex !== -1 && tabs.length > 1) {
                const nextIndex = (currentIndex + 1) % tabs.length;
                switchTab(tabs[nextIndex].id);
            }
        }
        // Ctrl+Shift+Tab: Previous tab
        if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
            e.preventDefault();
            const currentIndex = tabs.findIndex(t => t.id === activeTabId);
            if (currentIndex !== -1 && tabs.length > 1) {
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                switchTab(tabs[prevIndex].id);
            }
        }
    });

    // Initialize tabs on page load
    initializeTabs();

});
