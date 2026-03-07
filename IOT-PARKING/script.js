// MockAPI Configuration
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const ENDPOINT = 'parking';

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
    fetchData();
    // Auto refresh every 3 seconds
    setInterval(fetchData, 3000);
    setInterval(updateDate, 60000);
});

// Update Date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateDisplay.innerHTML = `<i class="far fa-calendar-alt"></i> ${now.toLocaleDateString('en-US', options)}`;
}

// Fetch Data from MockAPI
async function fetchData() {
    try {
        setLoading(true);
        
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}`);
        if (!response.ok) throw new Error('Error');
        
        const data = await response.json();
        console.log('Data:', data);
        
        // Parse data - adjust base sa imong MockAPI structure
        let currentInside = 0;
        let todayEntrance = 0;
        let todayExit = 0;
        let logs = [];
        
        if (Array.isArray(data)) {
            // Kung array, kuhaon ang latest
            const latest = data[data.length - 1];
            currentInside = parseInt(latest.currentInside || latest.count || 0);
            todayEntrance = parseInt(latest.todayEntrance || latest.entrance || 0);
            todayExit = parseInt(latest.todayExit || latest.exit || 0);
            logs = data.slice(-10).reverse(); // Last 10 logs
        } else {
            // Kung object
            currentInside = parseInt(data.currentInside || data.count || 0);
            todayEntrance = parseInt(data.todayEntrance || data.entrance || 0);
            todayExit = parseInt(data.todayExit || data.exit || 0);
            logs = data.logs || [];
        }
        
        updateDisplay(currentInside, todayEntrance, todayExit);
        renderHistory(logs);
        
    } catch (error) {
        console.error('Error:', error);
        // Demo data kung fail
        updateDisplay(4, 8, 4);
        renderDemoHistory();
    } finally {
        setLoading(false);
    }
}

// Update Display
function updateDisplay(inside, entrance, exit) {
    const vacant = MAX_CAPACITY - inside;
    
    // Main counter
    currentInsideEl.textContent = inside;
    vacantSlotsEl.textContent = vacant;
    
    // Color coding
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
    const percentage = (inside / MAX_CAPACITY) * 100;
    capacityBar.style.width = `${percentage}%`;
    capacityText.textContent = `${inside}/${MAX_CAPACITY}`;
    
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
        historyListEl.innerHTML = '<li class="history-item"><span>No records</span></li>';
        return;
    }
    
    logs.forEach(log => {
        const item = document.createElement('li');
        const isEntrance = log.action === 'entrance' || log.type === 'entrance';
        const actionClass = isEntrance ? 'entrance' : 'exit';
        const badgeText = isEntrance ? 'SULOD' : 'GAWAS';
        
        item.className = `history-item ${actionClass}`;
        
        const time = new Date(log.timestamp || log.createdAt || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-badge ${actionClass}">${badgeText}</span>
        `;
        
        historyListEl.appendChild(item);
    });
}

// Demo History (kung wala pa MockAPI)
function renderDemoHistory() {
    const demoLogs = [
        { action: 'entrance', timestamp: new Date(Date.now() - 20000) },
        { action: 'entrance', timestamp: new Date(Date.now() - 45000) },
        { action: 'exit', timestamp: new Date(Date.now() - 120000) },
        { action: 'entrance', timestamp: new Date(Date.now() - 180000) },
        { action: 'exit', timestamp: new Date(Date.now() - 300000) },
    ];
    renderHistory(demoLogs);
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
refreshBtn.addEventListener('click', fetchData);
