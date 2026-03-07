// MockAPI Configuration
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const PARKING_ENDPOINT = 'parking';      // Endpoint para sa current status
const LOGS_ENDPOINT = 'logs';            // Endpoint para sa history logs

// Settings
const MAX_CAPACITY = 6;

// DOM Elements
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchAllData();
    // Auto refresh every 3 seconds
    setInterval(fetchAllData, 3000);
    setInterval(updateDate, 60000);
});

// Update Date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateDisplay.innerHTML = `<i class="far fa-calendar-alt"></i> ${now.toLocaleDateString('en-US', options)}`;
}

// Fetch All Data (Status + Logs)
async function fetchAllData() {
    setLoading(true);
    
    try {
        // Fetch parking status
        const statusRes = await fetch(`${MOCKAPI_BASE}/${PARKING_ENDPOINT}`);
        const statusData = await statusRes.json();
        
        // Fetch logs/history
        const logsRes = await fetch(`${MOCKAPI_BASE}/${LOGS_ENDPOINT}?sortBy=createdAt&order=desc&limit=10`);
        const logsData = await logsRes.json();
        
        console.log('Status Data:', statusData);
        console.log('Logs Data:', logsData);
        
        // Parse and display
        parseAndDisplay(statusData, logsData);
        
    } catch (error) {
        console.error('Error fetching:', error);
        showError();
    } finally {
        setLoading(false);
    }
}

// Parse Data and Display
function parseAndDisplay(statusData, logsData) {
    let currentInside = 0;
    let todayEntrance = 0;
    let todayExit = 0;
    
    // IMPORTANT: MockAPI always returns ARRAY
    if (Array.isArray(statusData) && statusData.length > 0) {
        // Kuhaon ang PINAKA-LATEST (last item sa array)
        const latest = statusData[statusData.length - 1];
        
        console.log('Latest record:', latest);
        
        // Extract values - adjust field names base sa imong MockAPI
        currentInside = parseInt(latest.occupied ?? latest.currentInside ?? latest.count ?? latest.inside ?? 0);
        todayEntrance = parseInt(latest.entrance ?? latest.todayEntrance ?? latest.entranceCount ?? 0);
        todayExit = parseInt(latest.exit ?? latest.todayExit ?? latest.exitCount ?? 0);
        
        // Kung gusto nimo specific ID, uncomment ni:
        // const specificRecord = statusData.find(item => item.id === '1');
        // if (specificRecord) {
        //     currentInside = parseInt(specificRecord.occupied ?? 0);
        //     todayEntrance = parseInt(specificRecord.entrance ?? 0);
        //     todayExit = parseInt(specificRecord.exit ?? 0);
        // }
    }
    
    console.log('Parsed values:', { currentInside, todayEntrance, todayExit });
    
    // Update display
    updateDisplay(currentInside, todayEntrance, todayExit);
    
    // Render history
    renderHistory(logsData);
}

// Update Display
function updateDisplay(inside, entrance, exit) {
    const vacant = MAX_CAPACITY - inside;
    
    // Main counter
    currentInsideEl.textContent = inside;
    vacantSlotsEl.textContent = vacant >= 0 ? vacant : 0;
    
    // Check if full
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

// Render History
function renderHistory(logs) {
    historyListEl.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li class="history-item"><span class="history-time">No records found</span></li>';
        return;
    }
    
    // Ensure array
    const logsArray = Array.isArray(logs) ? logs : [logs];
    
    logsArray.forEach(log => {
        const item = document.createElement('li');
        
        // Determine action type
        const action = (log.action || log.type || 'entrance').toLowerCase();
        const isEntrance = action === 'entrance' || action === 'in' || action === 'sulod';
        const actionClass = isEntrance ? 'entrance' : 'exit';
        const badgeText = isEntrance ? 'SULOD' : 'GAWAS';
        
        item.className = `history-item ${actionClass}`;
        
        // Parse time
        const time = new Date(log.createdAt || log.timestamp || log.date || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        
        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-badge ${actionClass}">${badgeText}</span>
        `;
        
        historyListEl.appendChild(item);
    });
}

// Show Error
function showError() {
    currentInsideEl.textContent = 'ERR';
    vacantSlotsEl.textContent = '--';
    todayEntranceEl.textContent = '--';
    todayExitEl.textContent = '--';
    historyListEl.innerHTML = '<li class="history-item"><span class="history-time" style="color: var(--neon-red)">Connection Error</span></li>';
}

// Loading State
function setLoading(loading) {
    if (loading) {
        refreshBtn.classList.add('spinning');
    } else {
        refreshBtn.classList.remove('spinning');
    }
}

// Event Listeners
refreshBtn.addEventListener('click', fetchAllData);
