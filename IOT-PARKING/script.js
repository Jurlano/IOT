// ==========================
// MockAPI Configuration
// ==========================
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const PARKING_ENDPOINT = 'parking'; // Current parking status
const LOGS_ENDPOINT = 'logs';       // Entrance/exit logs

// ==========================
// Settings
// ==========================
const MAX_CAPACITY = 6;

// ==========================
// DOM Elements
// ==========================
const currentInsideEl = document.getElementById('currentInside'); // green box
const todayExitEl = document.getElementById('todayExit');         // red box
const slotsLeftEl = document.getElementById('slotsLeft');
const capacityBar = document.getElementById('capacityBar');
const capacityText = document.getElementById('capacityText');
const alertBox = document.getElementById('alertBox');
const historyListEl = document.getElementById('historyList');
const refreshBtn = document.getElementById('refreshBtn');
const dateDisplay = document.getElementById('dateDisplay');

// ==========================
// Initialize
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchAllData();
    setInterval(fetchAllData, 3000); // Auto refresh
    setInterval(updateDate, 60000);   // Update date
});

// ==========================
// Update Date Display
// ==========================
function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateDisplay.innerHTML = `<i class="far fa-calendar-alt"></i> ${now.toLocaleDateString('en-US', options)}`;
}

// ==========================
// Fetch Data from MockAPI
// ==========================
async function fetchAllData() {
    setLoading(true);

    try {
        // Fetch parking status
        const statusRes = await fetch(`${MOCKAPI_BASE}/${PARKING_ENDPOINT}`);
        const statusData = await statusRes.json();

        // Fetch logs/history (latest 50 entries for today)
        const logsRes = await fetch(`${MOCKAPI_BASE}/${LOGS_ENDPOINT}?sortBy=createdAt&order=desc&limit=50`);
        const logsData = await logsRes.json();

        // Process data
        parseAndDisplay(statusData, logsData);

    } catch (error) {
        console.error('Fetch error:', error);
        showError();
    } finally {
        setLoading(false);
    }
}

// ==========================
// Process Data and Update UI
// ==========================
function parseAndDisplay(statusData, logsData) {
    let currentInside = 0;
    let todayExit = 0;

    // Sum all occupied from parking objects
    if (Array.isArray(statusData)) {
        currentInside = statusData.reduce((sum, rec) => sum + parseInt(rec.occupied ?? 0), 0);
    }

    // Count exits for today
    if (Array.isArray(logsData)) {
        const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        logsData.forEach(log => {
            const logDate = new Date(log.createdAt || log.timestamp || log.date || Date.now());
            const logDay = logDate.toISOString().split('T')[0];
            const action = (log.action || log.type || '').toLowerCase();

            if (logDay === today && ['exit', 'out', 'gawas'].includes(action)) {
                todayExit++;
            }
        });
    }

    // Update UI
    updateDisplay(currentInside, todayExit);
    renderHistory(logsData);
}

// ==========================
// Update Display Boxes
// ==========================
function updateDisplay(inside, exit) {
    const vacant = MAX_CAPACITY - inside;

    // Green box - current inside
    currentInsideEl.textContent = inside;

    // Red box - exited today
    todayExitEl.textContent = exit;

    // Slots left and alerts
    slotsLeftEl.textContent = vacant >= 0 ? `${vacant} ka slots ang bakante` : '0 ka slots';
    if (inside >= MAX_CAPACITY) alertBox.style.display = 'block';
    else alertBox.style.display = 'none';

    // Capacity bar
    const percent = Math.min((inside / MAX_CAPACITY) * 100, 100);
    capacityBar.style.width = `${percent}%`;
    capacityText.textContent = `${inside}/${MAX_CAPACITY}`;

    // Color coding
    capacityBar.classList.remove('warning', 'danger');
    if (inside >= MAX_CAPACITY) capacityBar.classList.add('danger');
    else if (inside >= 4) capacityBar.classList.add('warning');
}

// ==========================
// Render History
// ==========================
function renderHistory(logs) {
    historyListEl.innerHTML = '';
    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li>No records found</li>';
        return;
    }

    logs.forEach(log => {
        const li = document.createElement('li');
        const action = (log.action || log.type || '').toLowerCase();
        const badge = ['entrance', 'in', 'sulod'].includes(action) ? 'SULOD' : 'GAWAS';
        const cls = badge.toLowerCase();

        const time = new Date(log.createdAt || log.timestamp || log.date || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        li.innerHTML = `<span>${timeStr}</span> <span class="${cls}">${badge}</span>`;
        historyListEl.appendChild(li);
    });
}

// ==========================
// Error Display
// ==========================
function showError() {
    currentInsideEl.textContent = 'ERR';
    todayExitEl.textContent = 'ERR';
    slotsLeftEl.textContent = '--';
    historyListEl.innerHTML = '<li style="color:red">Connection Error</li>';
}

// ==========================
// Loading Spinner
// ==========================
function setLoading(loading) {
    if (loading) refreshBtn.classList.add('spinning');
    else refreshBtn.classList.remove('spinning');
}

// ==========================
// Event Listener
// ==========================
refreshBtn.addEventListener('click', fetchAllData);
