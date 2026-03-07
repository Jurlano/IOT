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
    setInterval(fetchAllData, 3000); // Auto refresh every 3 seconds
    setInterval(updateDate, 60000);   // Update date every minute
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
        // Fetch parking status (current occupied counts)
        const statusRes = await fetch(`${MOCKAPI_BASE}/${PARKING_ENDPOINT}`);
        if (!statusRes.ok) throw new Error('Failed to fetch parking data');
        const statusData = await statusRes.json();

        // Fetch logs/history (latest 50 entries)
        const logsRes = await fetch(`${MOCKAPI_BASE}/${LOGS_ENDPOINT}?sortBy=createdAt&order=desc&limit=50`);
        if (!logsRes.ok) throw new Error('Failed to fetch logs data');
        const logsData = await logsRes.json();

        // Process and display data
        parseAndDisplay(statusData, logsData);

    } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
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

    // Calculate total occupied from parking objects
    if (Array.isArray(statusData)) {
        currentInside = statusData.reduce((sum, record) => {
            // Handle different possible field names for occupied status
            const occupied = parseInt(record.occupied ?? record.count ?? record.value ?? 0);
            return sum + (isNaN(occupied) ? 0 : occupied);
        }, 0);
    }

    // Count exits for today from logs
    if (Array.isArray(logsData)) {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        logsData.forEach(log => {
            // Try different possible date field names
            const dateStr = log.createdAt || log.timestamp || log.date || log.time;
            const logDate = dateStr ? new Date(dateStr) : new Date();
            
            if (isNaN(logDate.getTime())) return; // Skip invalid dates
            
            const logDay = logDate.toISOString().split('T')[0];
            
            // Check if it's an exit/out action (case insensitive)
            const action = (log.action || log.type || log.event || '').toLowerCase();
            const isExit = ['exit', 'out', 'gawas', 'left', 'depart'].includes(action);
            
            if (logDay === today && isExit) {
                todayExit++;
            }
        });
    }

    // Update UI with processed data
    updateDisplay(currentInside, todayExit);
    renderHistory(logsData);
}

// ==========================
// Update Display Boxes
// ==========================
function updateDisplay(inside, exit) {
    const vacant = Math.max(MAX_CAPACITY - inside, 0);

    // Update numeric displays
    currentInsideEl.textContent = inside;
    todayExitEl.textContent = exit;
    
    // Update slots left text (Bisaya/English mix)
    slotsLeftEl.textContent = vacant > 0 ? 
        `${vacant} ka slots ang bakante` : 
        'Puno na ang parking';

    // Show/hide full capacity alert
    if (inside >= MAX_CAPACITY) {
        alertBox.style.display = 'block';
        alertBox.textContent = '⚠ PUNO NA ANG PARKING ⚠';
    } else {
        alertBox.style.display = 'none';
    }

    // Update capacity bar
    const percent = Math.min((inside / MAX_CAPACITY) * 100, 100);
    capacityBar.style.width = `${percent}%`;
    capacityText.textContent = `${inside}/${MAX_CAPACITY}`;

    // Color code the capacity bar
    capacityBar.classList.remove('warning', 'danger');
    if (inside >= MAX_CAPACITY) {
        capacityBar.classList.add('danger'); // Red - full
    } else if (inside >= 4) {
        capacityBar.classList.add('warning'); // Yellow - almost full
    }
}

// ==========================
// Render History List
// ==========================
function renderHistory(logs) {
    historyListEl.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li class="empty-state">Walay records nga nakit-an</li>';
        return;
    }

    // Sort logs by date (newest first) just to be sure
    const sortedLogs = [...logs].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || a.date || 0);
        const dateB = new Date(b.createdAt || b.timestamp || b.date || 0);
        return dateB - dateA;
    });

    // Display only the 20 most recent entries
    sortedLogs.slice(0, 20).forEach(log => {
        const li = document.createElement('li');
        
        // Determine action type
        const action = (log.action || log.type || log.event || '').toLowerCase();
        const isEntry = ['entrance', 'in', 'sulod', 'enter', 'arrive'].includes(action);
        const isExit = ['exit', 'out', 'gawas', 'left', 'depart'].includes(action);
        
        let badgeText = 'SULOD';
        let badgeClass = 'sulod';
        
        if (isExit) {
            badgeText = 'GAWAS';
            badgeClass = 'gawas';
        } else if (!isEntry && !isExit) {
            // Handle unknown action types
            badgeText = action.toUpperCase() || 'UNKNOWN';
            badgeClass = 'unknown';
        }

        // Format time
        const dateStr = log.createdAt || log.timestamp || log.date || log.time;
        const logDate = dateStr ? new Date(dateStr) : new Date();
        const timeStr = logDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        // Get vehicle info if available
        const vehicleInfo = log.vehicle || log.plate || log.car || '';

        li.innerHTML = `
            <span class="time">${timeStr}</span>
            ${vehicleInfo ? `<span class="vehicle">${vehicleInfo}</span>` : ''}
            <span class="badge ${badgeClass}">${badgeText}</span>
        `;
        
        historyListEl.appendChild(li);
    });

    // If no items after filtering
    if (historyListEl.children.length === 0) {
        historyListEl.innerHTML = '<li class="empty-state">Walay records nga nakit-an</li>';
    }
}

// ==========================
// Error Display
// ==========================
function showError(errorMsg = '') {
    currentInsideEl.textContent = 'ERR';
    todayExitEl.textContent = 'ERR';
    slotsLeftEl.textContent = '--';
    
    historyListEl.innerHTML = `
        <li class="error-state">
            <span>❌ Connection Error</span>
            <small>${errorMsg || 'Please check your connection'}</small>
        </li>
    `;
    
    // Hide alert box on error
    alertBox.style.display = 'none';
}

// ==========================
// Loading Spinner Control
// ==========================
function setLoading(loading) {
    if (loading) {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
    } else {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

// ==========================
// Manual Refresh
// ==========================
refreshBtn.addEventListener('click', () => {
    fetchAllData();
});

// ==========================
// Optional: Add CSS for spinner
// ==========================
const style = document.createElement('style');
style.textContent = `
    .spinning {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .badge.unknown {
        background-color: #95a5a6;
    }
    
    .empty-state, .error-state {
        text-align: center;
        color: #7f8c8d;
        padding: 20px !important;
        font-style: italic;
    }
    
    .error-state {
        color: #e74c3c;
    }
    
    .error-state small {
        display: block;
        font-size: 12px;
        color: #95a5a6;
        margin-top: 5px;
    }
    
    .vehicle {
        color: #2c3e50;
        font-size: 12px;
        margin: 0 5px;
    }
`;
document.head.appendChild(style);
