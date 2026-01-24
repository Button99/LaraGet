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

    let currentResponse = '';
    let currentResponseHeaders = {};
    let currentResponseTab = 'pretty';

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

    // Update method color
    const updateMethodColor = () => {
        const method = methodSelect.value;
        methodSelect.className = methodSelect.className.replace(/text-\w+-\d+/g, '');
        methodSelect.classList.add(methodColors[method] || 'text-gray-100');
    };

    methodSelect.addEventListener('change', updateMethodColor);
    updateMethodColor();

    // Tab switching
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
        });
    });

    // Create key-value row
    const createKeyValueRow = (container, keyPlaceholder = 'Key', valuePlaceholder = 'Value') => {
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
        });

        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateCounts);
            input.addEventListener('change', updateCounts);
        });

        container.appendChild(row);
        updateCounts();
        return row;
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
        });
    });

    // Hide all response views
    const hideAllResponseViews = () => {
        responsePretty.classList.add('hidden');
        responseRaw.classList.add('hidden');
        responsePreview.classList.add('hidden');
        responseHeaders.classList.add('hidden');
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
                return;
            }

            const responseData = result.body;
            currentResponse = responseData;
            currentResponseHeaders = result.headers || {};

            // Populate Pretty view (syntax highlighted for JSON)
            let prettyContent = responseData;
            try {
                const parsed = JSON.parse(responseData);
                prettyContent = syntaxHighlight(parsed);
                currentResponse = JSON.stringify(parsed, null, 2);
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

});
