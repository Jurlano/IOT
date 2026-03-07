// ==========================
// MockAPI Configuration
// ==========================
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const PARKING_ENDPOINT = 'parking'; // Current parking status
const LOGS_ENDPOINT = 'logs';       // History logs

// ==========================
// Settings
// ==========================
const MAX_CAPACITY = 6;

// ==========================
// DOM Elements
// ==========================
const currentInsideEl = document.getElementById('currentInside');
const vacantSlotsEl = document.getElementById('vacantSlots');
const slotsLeftEl = document.getElementById('slotsLeft');
const todayEntranceEl = document.getElementById('todayEntrance');
const todayExitEl = document.getElementById('todayExit');
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
    setInterval(fetchAllData, 3000); // Auto refresh every 3 seconds
    setInterval(updateDate, 60000);   // Update date every 1 min
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
// Fetch All Data
// ==========================
async function fetchAllData() {
    setLoading(true);

    try {
        // Fetch parking status
        const statusRes = await fetch(`${MOCKAPI_BASE}/${PARKING_ENDPOINT}`);
        const statusData = await statusRes.json();

        // Fetch logs/history (latest 50 to calculate accurate currentInside)
        const logsRes = await fetch(`${MOCKAPI_BASE}/${LOGS_ENDPOINT}?sortBy=createdAt&order=desc&limit=50`);
        const logsData = await logsRes.json();

        console.log('Status Data:', statusData);
        console.log('Logs Data:', logsData);

        // Parse and display
        parseAndDisplay(statusData, logsData);

    } catch (error) {
        console.error('Fetch error:', error.message);
        showError();
    } finally {
        setLoading(false);
    }
}

// ==========================
// Parse Data and Update UI
// ==========================
function parseAndDisplay(statusData, logsData) {
    let currentInside = 0;
    let todayEntrance = 0;
    let todayExit = 0;

    // Calculate from logs
    if (Array.isArray(logsData) && logsData.length > 0) {
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0]; // yyyy-mm-dd

        logsData.forEach(log => {
            const logDate = new Date(log.createdAt || log.timestamp || log.date || Date.now());
            const logDay = logDate.toISOString().split('T')[0];

            if (logDay === todayDate) {
                const action = (log.action || log.type || 'entrance').toLowerCase();
                if (['entrance', 'in', 'sulod'].includes(action)) {
                    todayEntrance++;
                    currentInside++;
                } else {
                    todayExit++;
                    currentInside = Math.max(0, currentInside - 1);
                }
            }
        });
    }

    console.log('Calculated values:', { currentInside, todayEntrance, todayExit });

    updateDisplay(currentInside, todayEntrance, todayExit);
    renderHistory(logsData);
}

// ==========================
// Update Display
// ==========================
function updateDisplay(inside, entrance, exit) {
    const vacant = MAX_CAPACITY - inside;

    currentInsideEl.textContent = inside;
    vacantSlotsEl.textContent = vacant >= 0 ? vacant : 0;

    // Full capacity alert
    if (inside >= MAX_CAPACITY) {
        currentInsideEl.classList.add('full');
        slotsLeftEl.classList.add('full');
        slotsLeftEl.innerHTML = `<i class="fas fa-ban"></i> WALAY BAKANTE`;
        alertBox.style.display = 'block';
    } else {
        currentInsideEl.classList.remove('full');
        slotsLeftEl.classList.remove('full');
        slotsLeftEl.innerHTML = `<i class="fas fa-parking"></i> ${vacant} ka slots ang bakante`;
        alertBox.style.display = 'none';
    }

    // Stats boxes
    todayEntranceEl.textContent = entrance;
    todayExitEl.textContent = exit;

    // Capacity bar
    const percentage = Math.min((inside / MAX_CAPACITY) * 100, 100);
    capacityBar.style.width = `${percentage}%`;
    capacityText.textContent = `${inside}/${MAX_CAPACITY}`;

    // Color coding
    capacityBar.classList.remove('warning', 'danger');
    if (inside >= MAX_CAPACITY) {
        capacityBar.classList.add('danger');
    } else if (inside >= 4) {
        capacityBar.classList.add('warning');
    }
}

// ==========================
// Render History
// ==========================
function renderHistory(logs) {
    historyListEl.innerHTML = '';

    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li class="history-item"><span class="history-time">No records found</span></li>';
        return;
    }

    const logsArray = Array.isArray(logs) ? logs : [logs];

    logsArray.forEach(log => {
        const item = document.createElement('li');
        const action = (log.action || log.type || 'entrance').toLowerCase();
        const isEntrance = ['entrance', 'in', 'sulod'].includes(action);
        const actionClass = isEntrance ? 'entrance' : 'exit';
        const badgeText = isEntrance ? 'SULOD' : 'GAWAS';

        item.className = `history-item ${actionClass}`;

        const time = new Date(log.createdAt || log.timestamp || log.date || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-badge ${actionClass}">${badgeText}</span>
        `;
        historyListEl.appendChild(item);
    });
}

// ==========================
// Error Display
// ==========================
function showError() {
    currentInsideEl.textContent = 'ERR';
    vacantSlotsEl.textContent = '--';
    todayEntranceEl.textContent = '--';
    todayExitEl.textContent = '--';
    historyListEl.innerHTML = '<li class="history-item"><span class="history-time" style="color: var(--neon-red)">Connection Error</span></li>';
}

// ==========================
// Loading State
// ==========================
function setLoading(loading) {
    if (loading) refreshBtn.classList.add('spinning');
    else refreshBtn.classList.remove('spinning');
}

// ==========================
// Event Listeners
// ==========================
refreshBtn.addEventListener('click', fetchAllData);
