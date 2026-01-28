<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>LaraGet - API Client</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=jetbrains-mono:400,500" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-body text-text-primary min-h-screen transition-colors duration-200">
        <div id="app" class="flex flex-col h-screen">
            <!-- Header -->
            <header class="bg-panel border-b border-border px-6 py-4 flex items-center justify-between">
                <h1 class="text-xl font-semibold text-orange-500">LaraGet</h1>
                <button
                    id="theme-toggle"
                    class="p-2 rounded-lg bg-input border border-border hover:border-orange-500 transition-colors"
                    title="Toggle theme"
                >
                    <!-- Sun icon (shown in dark mode) -->
                    <svg id="theme-icon-sun" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <!-- Moon icon (shown in light mode) -->
                    <svg id="theme-icon-moon" class="w-5 h-5 text-gray-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                </button>
            </header>

            <!-- Main Layout with Sidebar -->
            <div class="flex-1 flex overflow-hidden">
                <!-- Sidebar -->
                <aside id="sidebar" class="w-64 bg-panel border-r border-border flex flex-col shrink-0 transition-all duration-200">
                    <!-- Sidebar Header -->
                    <div class="px-4 py-3 border-b border-border flex items-center justify-between">
                        <span class="text-sm font-medium text-text-secondary">Requests</span>
                        <button id="new-tab-btn" class="p-1.5 text-text-secondary hover:text-orange-500 hover:bg-input rounded transition-colors" title="New Request (Ctrl+T)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                    <!-- Requests List -->
                    <div id="sidebar-requests" class="flex-1 overflow-y-auto py-2">
                        <!-- Requests rendered dynamically -->
                    </div>
                    <!-- Sidebar Footer -->
                    <div class="px-4 py-2 border-t border-border text-xs text-text-muted">
                        <span id="request-count">0</span> / 10 requests
                    </div>
                </aside>

                <!-- Toggle Sidebar Button -->
                <button id="toggle-sidebar-btn" class="absolute left-64 top-1/2 -translate-y-1/2 z-10 bg-panel border border-border rounded-r-lg p-1 text-text-secondary hover:text-orange-500 transition-all duration-200" title="Toggle sidebar">
                    <svg id="sidebar-toggle-icon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>

                <!-- Main Content -->
                <main class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
                <!-- Request Builder -->
                <div class="bg-panel rounded-lg border border-border p-4 transition-colors duration-200">
                    <div class="flex gap-3">
                        <!-- Method Selector -->
                        <div class="relative">
                            <select
                                id="method-select"
                                class="appearance-none bg-input border border-border-hover rounded-lg px-4 py-3 pr-10 text-sm font-semibold cursor-pointer focus:outline-none focus:border-orange-500 transition-colors"
                            >
                                <option value="GET" class="text-green-400">GET</option>
                                <option value="POST" class="text-yellow-400">POST</option>
                                <option value="PUT" class="text-blue-400">PUT</option>
                                <option value="PATCH" class="text-purple-400">PATCH</option>
                                <option value="DELETE" class="text-red-400">DELETE</option>
                                <option value="HEAD" class="text-gray-400">HEAD</option>
                                <option value="OPTIONS" class="text-pink-400">OPTIONS</option>
                            </select>
                            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>

                        <!-- URL Input -->
                        <input
                            type="text"
                            id="url-input"
                            placeholder="Enter request URL"
                            class="flex-1 bg-input border border-border-hover rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-text-muted"
                        >

                        <!-- Send Button -->
                        <button
                            id="send-btn"
                            class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                            Send
                        </button>
                    </div>
                </div>

                <!-- Request Options (Params, Headers, Body) -->
                <div id="options-panel" class="bg-panel rounded-lg border border-border flex flex-col transition-colors duration-200">
                    <!-- Tabs Header -->
                    <div class="flex items-center justify-between border-b border-border">
                        <div class="flex">
                        <button data-tab="params" class="tab-btn active px-6 py-3 text-sm font-medium text-orange-500 border-b-2 border-orange-500 transition-colors">
                            Params
                            <span id="params-count" class="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 hidden">0</span>
                        </button>
                        <button data-tab="headers" class="tab-btn px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                            Headers
                            <span id="headers-count" class="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 hidden">0</span>
                        </button>
                        <button data-tab="body" class="tab-btn px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                            Body
                        </button>
                        </div>
                        <!-- Collapse Button -->
                        <button id="collapse-btn" class="px-4 py-3 text-text-secondary hover:text-text-primary transition-colors" title="Collapse panel">
                            <svg id="collapse-icon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="tab-content" class="p-4 max-h-64 overflow-auto transition-all duration-200">
                        <!-- Params Tab -->
                        <div id="params-tab" class="tab-content">
                            <div id="params-container" class="space-y-2">
                                <!-- Key-Value pairs will be added here -->
                            </div>
                            <button id="add-param-btn" class="mt-3 text-sm text-text-secondary hover:text-orange-400 flex items-center gap-1 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Parameter
                            </button>
                        </div>

                        <!-- Headers Tab -->
                        <div id="headers-tab" class="tab-content hidden">
                            <div id="headers-container" class="space-y-2">
                                <!-- Key-Value pairs will be added here -->
                            </div>
                            <button id="add-header-btn" class="mt-3 text-sm text-text-secondary hover:text-orange-400 flex items-center gap-1 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Header
                            </button>
                        </div>

                        <!-- Body Tab -->
                        <div id="body-tab" class="tab-content hidden">
                            <div class="flex items-center gap-4 mb-3">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="body-type" value="none" checked class="accent-orange-500">
                                    <span class="text-sm text-text-secondary">None</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="body-type" value="json" class="accent-orange-500">
                                    <span class="text-sm text-text-secondary">JSON</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="body-type" value="form" class="accent-orange-500">
                                    <span class="text-sm text-text-secondary">Form Data</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="body-type" value="raw" class="accent-orange-500">
                                    <span class="text-sm text-text-secondary">Raw</span>
                                </label>
                            </div>

                            <!-- JSON/Raw Body -->
                            <div id="body-editor-container" class="hidden">
                                <textarea
                                    id="body-editor"
                                    placeholder='{"key": "value"}'
                                    class="w-full h-32 bg-input border border-border-hover rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors placeholder-text-muted resize-none"
                                ></textarea>
                            </div>

                            <!-- Form Data -->
                            <div id="form-data-container" class="hidden">
                                <div id="form-data-fields" class="space-y-2">
                                    <!-- Key-Value pairs will be added here -->
                                </div>
                                <button id="add-form-field-btn" class="mt-3 text-sm text-text-secondary hover:text-orange-400 flex items-center gap-1 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Add Field
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Response Section -->
                <div class="flex-1 bg-panel rounded-lg border border-border flex flex-col overflow-hidden min-h-0 transition-colors duration-200">
                    <!-- Response Header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                        <div class="flex items-center gap-4">
                            <div id="response-status" class="hidden items-center gap-3 text-sm">
                                <span id="status-badge" class="px-2 py-1 rounded text-xs font-semibold"></span>
                                <span id="response-time" class="text-gray-500"></span>
                                <span id="response-size" class="text-gray-500"></span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                id="save-btn"
                                class="hidden text-text-secondary hover:text-text-primary p-2 rounded transition-colors"
                                title="Save response"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                            </button>
                            <button
                                id="copy-btn"
                                class="hidden text-text-secondary hover:text-text-primary p-2 rounded transition-colors"
                                title="Copy response"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Response Tabs -->
                    <div id="response-tabs-container" class="hidden border-b border-border shrink-0">
                        <div class="flex">
                            <button data-response-tab="pretty" class="response-tab-btn active px-6 py-2 text-sm font-medium text-orange-500 border-b-2 border-orange-500 transition-colors">
                                Pretty
                            </button>
                            <button data-response-tab="raw" class="response-tab-btn px-6 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                                Raw
                            </button>
                            <button data-response-tab="preview" class="response-tab-btn px-6 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                                Preview
                            </button>
                            <button data-response-tab="headers" class="response-tab-btn px-6 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                                Headers
                            </button>
                            <button data-response-tab="cookies" class="response-tab-btn px-6 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors">
                                Cookies
                            </button>
                        </div>
                    </div>

                    <!-- Response Body -->
                    <div id="response-container" class="flex-1 overflow-auto p-4">
                        <!-- Empty State -->
                        <div id="empty-state" class="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-sm">Enter a URL and click Send to make a request</p>
                        </div>

                        <!-- Loading State -->
                        <div id="loading-state" class="hidden flex-col items-center justify-center h-full text-gray-500">
                            <svg class="w-8 h-8 animate-spin mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p class="text-sm">Sending request...</p>
                        </div>

                        <!-- Pretty View (syntax highlighted) -->
                        <pre id="response-pretty" class="hidden font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"></pre>

                        <!-- Raw View -->
                        <pre id="response-raw" class="hidden font-mono text-sm leading-relaxed whitespace-pre-wrap break-all text-text-primary"></pre>

                        <!-- Preview View (iframe for HTML) -->
                        <div id="response-preview" class="hidden h-full">
                            <iframe id="preview-iframe" class="w-full h-full bg-white rounded" sandbox="allow-same-origin"></iframe>
                        </div>

                        <!-- Headers View -->
                        <div id="response-headers" class="hidden">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-text-muted border-b border-border">
                                        <th class="py-2 pr-4 font-medium">Header</th>
                                        <th class="py-2 font-medium">Value</th>
                                    </tr>
                                </thead>
                                <tbody id="response-headers-body" class="font-mono">
                                </tbody>
                            </table>
                        </div>

                        <!-- Cookies View -->
                        <div id="response-cookies" class="hidden">
                            <div id="cookies-empty" class="text-center text-text-muted py-8">
                                No cookies in response
                            </div>
                            <table id="cookies-table" class="hidden w-full text-sm">
                                <thead>
                                    <tr class="text-left text-text-muted border-b border-border">
                                        <th class="py-2 pr-4 font-medium">Name</th>
                                        <th class="py-2 pr-4 font-medium">Value</th>
                                        <th class="py-2 pr-4 font-medium">Domain</th>
                                        <th class="py-2 pr-4 font-medium">Path</th>
                                        <th class="py-2 font-medium">Flags</th>
                                    </tr>
                                </thead>
                                <tbody id="response-cookies-body" class="font-mono">
                                </tbody>
                            </table>
                        </div>

                        <!-- Error State -->
                        <div id="error-state" class="hidden flex-col items-center justify-center h-full text-red-400">
                            <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p id="error-message" class="text-sm text-center"></p>
                        </div>
                    </div>
                </div>
            </main>
            </div>
        </div>
    </body>
</html>
