// MockAPI Configuration
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const ENDPOINT = 'parking'; // Ilisi ni sa imong endpoint name

// State
let currentCount = 0;
const MAX_CAPACITY = 50;
let alertShown = false;

// DOM Elements
const occupiedCountEl = document.getElementById('occupiedCount');
const statusMessageEl = document.getElementById('statusMessage');
const historyListEl = document.getElementById('historyList');
const refreshBtn = document.getElementById('refreshBtn');
const capacityBar = document.getElementById('capacityBar');
const capacityText = document.getElementById('capacityText');
const dateDisplay = document.getElementById('dateDisplay');
const fullDateDisplay = document.getElementById('fullDateDisplay');
const alertBox = document.getElementById('alertBox');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchParkingData();
    // Auto-refresh every 5 seconds para real-time feel
    setInterval(fetchParkingData, 5000);
    setInterval(updateDate, 60000);
});

// Date Updates
function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    dateDisplay.innerHTML = `<i class="far fa-calendar-alt"></i> ${now.toLocaleDateString('en-US', options)}`;
    fullDateDisplay.innerHTML = `<i class="far fa-calendar-check"></i> ${now.toLocaleDateString('en-US', { ...options, ...timeOptions })}`;
}

// Fetch Data from MockAPI
async function fetchParkingData() {
    try {
        setLoading(true);
        
        // Fetch current count
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        console.log('MockAPI Data:', data); // Debug
        
        // Parse data - adjust base sa imong MockAPI structure
        if (Array.isArray(data) && data.length > 0) {
            // Kung array ang response, kuhaa ang latest or ang first item
            const latest = data[data.length - 1];
            currentCount = parseInt(latest.count || latest.occupied || latest.current || 0);
        } else if (typeof data === 'object') {
            // Kung object ang response
            currentCount = parseInt(data.count || data.occupied || data.current || 0);
        }
        
        updateDisplay();
        await fetchHistory();
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showStatus('Error connecting to CYBER•PARK', 'error');
        // Fallback data kung error
        currentCount = Math.floor(Math.random() * 55); // Random for demo
        updateDisplay();
    } finally {
        setLoading(false);
    }
}

// Fetch History/Logs
async function fetchHistory() {
    try {
        // Adjust endpoint base sa imong MockAPI setup
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}?sortBy=createdAt&order=desc&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const logs = await response.json();
        renderHistory(logs);
        
    } catch (error) {
        console.error('Error fetching history:', error);
        // Generate fake history for demo
        generateDemoHistory();
    }
}

// Update Display
function updateDisplay() {
    occupiedCountEl.textContent = currentCount;
    
    const percentage = (currentCount / MAX_CAPACITY) * 100;
    capacityBar.style.width = `${Math.min(percentage, 100)}%`;
    capacityText.textContent = `${currentCount}/${MAX_CAPACITY}`;
    
    // Reset classes
    occupiedCountEl.classList.remove('full');
    capacityBar.classList.remove('warning', 'danger');
    alertBox.style.display = 'none';
    alertShown = false;
    
    // Check status
    if (currentCount >= MAX_CAPACITY) {
        // FULL - Alert!
        occupiedCountEl.classList.add('full');
        capacityBar.classList.add('danger');
        alertBox.style.display = 'block';
        showStatus('PARKING FULL • NO VACANCY', 'full');
        alertShown = true;
        
        // Browser notification kung full (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('CYBER•PARK ALERT', {
                body: 'Parking is now FULL!',
                icon: 'https://cdn-icons-png.flaticon.com/512/1162/1162914.png'
            });
        }
        
    } else if (percentage >= 80) {
        // ALMOST FULL
        capacityBar.classList.add('warning');
        showStatus('ALMOST FULL • LIMITED SLOTS', 'almost');
        
    } else {
        // AVAILABLE
        showStatus('SLOTS AVAILABLE • PARK NOW', 'available');
    }
}

// Show Status Message
function showStatus(message, type) {
    statusMessageEl.innerHTML = `<i class="fas fa-parking"></i> ${message}`;
    statusMessageEl.className = 'status-text';
    
    if (type === 'available') statusMessageEl.classList.add('available');
    if (type === 'almost') statusMessageEl.classList.add('almost');
    if (type === 'full') statusMessageEl.classList.add('full');
}

// Render History
function renderHistory(logs) {
    historyListEl.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li class="history-item"><span class="history-time">No records found</span></li>';
        return;
    }
    
    // Kung array, limit to 5
    const recentLogs = Array.isArray(logs) ? logs.slice(0, 5) : [logs];
    
    recentLogs.forEach(log => {
        const item = document.createElement('li');
        
        // Determine action base sa data
        let action = 'entrance';
        let actionIcon = 'fa-arrow-right-to-bracket';
        let actionText = 'SULOD';
        
        if (log.action === 'exit' || log.type === 'exit') {
            action = 'exit';
            actionIcon = 'fa-arrow-right-from-bracket';
            actionText = 'GAWAS';
        }
        
        item.className = `history-item ${action}`;
        
        const time = new Date(log.timestamp || log.createdAt || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-action ${action}">
                <i class="fas ${actionIcon}"></i> ${actionText}
            </span>
        `;
        
        historyListEl.appendChild(item);
    });
}

// Demo History Generator (kung wala pa ka setup sa MockAPI)
function generateDemoHistory() {
    const actions = ['entrance', 'exit', 'entrance', 'entrance', 'exit'];
    const now = new Date();
    
    historyListEl.innerHTML = '';
    
    actions.forEach((action, index) => {
        const item = document.createElement('li');
        item.className = `history-item ${action}`;
        
        const time = new Date(now - (index * 60000)); // 1 min interval
        const timeStr = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const actionIcon = action === 'entrance' ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket';
        const actionText = action === 'entrance' ? 'SULOD' : 'GAWAS';
        
        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-action ${action}">
                <i class="fas ${actionIcon}"></i> ${actionText}
            </span>
        `;
        
        historyListEl.appendChild(item);
    });
}

// Loading State
function setLoading(loading) {
    if (loading) {
        refreshBtn.classList.add('spinning');
        occupiedCountEl.style.opacity = '0.5';
    } else {
        refreshBtn.classList.remove('spinning');
        occupiedCountEl.style.opacity = '1';
    }
}

// Request notification permission (optional)
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Event Listeners
refreshBtn.addEventListener('click', fetchParkingData);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') fetchParkingData();
});
