// MockAPI Configuration
const MOCKAPI_BASE = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const ENDPOINT = 'parking'; // Change this to your specific endpoint name

// State
let currentCount = 0;
const MAX_CAPACITY = 50;
let isProcessing = false;

// DOM Elements
const occupiedCountEl = document.getElementById('occupiedCount');
const statusMessageEl = document.getElementById('statusMessage');
const historyListEl = document.getElementById('historyList');
const entranceBtn = document.getElementById('entranceBtn');
const exitBtn = document.getElementById('exitBtn');
const refreshBtn = document.getElementById('refreshBtn');
const capacityBar = document.getElementById('capacityBar');
const capacityText = document.getElementById('capacityText');
const dateDisplay = document.getElementById('dateDisplay');
const fullDateDisplay = document.getElementById('fullDateDisplay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchParkingData();
    setInterval(updateDate, 60000); // Update date every minute
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
        
        // Assuming the API returns an array or object with count
        // Adjust this based on your actual MockAPI structure
        if (Array.isArray(data) && data.length > 0) {
            currentCount = parseInt(data[0].count) || 0;
        } else if (data.count !== undefined) {
            currentCount = parseInt(data.count) || 0;
        }
        
        updateDisplay();
        await fetchHistory();
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showStatus('Error connecting to CYBER•PARK', 'error');
    } finally {
        setLoading(false);
    }
}

// Fetch History
async function fetchHistory() {
    try {
        // Fetch logs/history - adjust endpoint as needed
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}/logs?sortBy=createdAt&order=desc&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const logs = await response.json();
        renderHistory(logs);
        
    } catch (error) {
        console.error('Error fetching history:', error);
        // Fallback to local history if API fails
        renderHistory(getLocalHistory());
    }
}

// Update Display
function updateDisplay() {
    occupiedCountEl.textContent = currentCount;
    
    // Update capacity bar
    const percentage = (currentCount / MAX_CAPACITY) * 100;
    capacityBar.style.width = `${Math.min(percentage, 100)}%`;
    capacityText.textContent = `${currentCount}/${MAX_CAPACITY}`;
    
    // Update capacity bar color
    capacityBar.classList.remove('warning', 'danger');
    if (percentage >= 90) {
        capacityBar.classList.add('danger');
    } else if (percentage >= 70) {
        capacityBar.classList.add('warning');
    }
    
    // Update status
    if (currentCount >= MAX_CAPACITY) {
        showStatus('PARKING FULL • NO VACANCY', 'full');
        entranceBtn.disabled = true;
        entranceBtn.style.opacity = '0.5';
    } else {
        showStatus('SYSTEM ACTIVE • SCANNING', 'active');
        entranceBtn.disabled = false;
        entranceBtn.style.opacity = '1';
    }
    
    if (currentCount <= 0) {
        exitBtn.disabled = true;
        exitBtn.style.opacity = '0.5';
    } else {
        exitBtn.disabled = false;
        exitBtn.style.opacity = '1';
    }
}

// Show Status Message
function showStatus(message, type) {
    statusMessageEl.innerHTML = `<i class="fas fa-parking"></i> ${message}`;
    statusMessageEl.className = 'status-text';
    
    if (type === 'active') statusMessageEl.classList.add('active');
    if (type === 'full') statusMessageEl.classList.add('full');
}

// Handle Entrance
async function handleEntrance() {
    if (isProcessing || currentCount >= MAX_CAPACITY) return;
    
    isProcessing = true;
    entranceBtn.style.transform = 'scale(0.95)';
    
    try {
        // POST to MockAPI
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'entrance',
                timestamp: new Date().toISOString(),
                count: currentCount + 1
            })
        });
        
        if (!response.ok) throw new Error('Failed to record entrance');
        
        currentCount++;
        addToLocalHistory('entrance');
        updateDisplay();
        await fetchHistory();
        
        // Visual feedback
        flashEffect('green');
        
    } catch (error) {
        console.error('Error:', error);
        // Local fallback
        currentCount++;
        addToLocalHistory('entrance');
        updateDisplay();
    } finally {
        isProcessing = false;
        setTimeout(() => {
            entranceBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

// Handle Exit
async function handleExit() {
    if (isProcessing || currentCount <= 0) return;
    
    isProcessing = true;
    exitBtn.style.transform = 'scale(0.95)';
    
    try {
        // POST to MockAPI
        const response = await fetch(`${MOCKAPI_BASE}/${ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'exit',
                timestamp: new Date().toISOString(),
                count: currentCount - 1
            })
        });
        
        if (!response.ok) throw new Error('Failed to record exit');
        
        currentCount--;
        addToLocalHistory('exit');
        updateDisplay();
        await fetchHistory();
        
        // Visual feedback
        flashEffect('red');
        
    } catch (error) {
        console.error('Error:', error);
        // Local fallback
        currentCount--;
        addToLocalHistory('exit');
        updateDisplay();
    } finally {
        isProcessing = false;
        setTimeout(() => {
            exitBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

// Visual Flash Effect
function flashEffect(color) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.right = '0';
    flash.style.bottom = '0';
    flash.style.background = color === 'green' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 0, 64, 0.2)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(flash);
    
    requestAnimationFrame(() => {
        flash.style.opacity = '1';
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 300);
        }, 100);
    });
}

// Render History
function renderHistory(logs) {
    historyListEl.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        historyListEl.innerHTML = '<li class="history-item"><span class="history-time">No records found</span></li>';
        return;
    }
    
    logs.slice(0, 5).forEach(log => {
        const item = document.createElement('li');
        item.className = `history-item ${log.action || 'entrance'}`;
        
        const time = new Date(log.timestamp || log.createdAt || Date.now());
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const actionIcon = log.action === 'entrance' ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket';
        const actionText = log.action === 'entrance' ? 'SULOD' : 'GAWAS';
        
        item.innerHTML = `
            <span class="history-time">${timeStr}</span>
            <span class="history-action ${log.action || 'entrance'}">
                <i class="fas ${actionIcon}"></i> ${actionText}
            </span>
        `;
        
        historyListEl.appendChild(item);
    });
}

// Local History Fallback
function getLocalHistory() {
    const stored = localStorage.getItem('parkingHistory');
    return stored ? JSON.parse(stored) : [];
}

function addToLocalHistory(action) {
    const history = getLocalHistory();
    history.unshift({
        action: action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('parkingHistory', JSON.stringify(history.slice(0, 10)));
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

// Event Listeners
entranceBtn.addEventListener('click', handleEntrance);
exitBtn.addEventListener('click', handleExit);
refreshBtn.addEventListener('click', fetchParkingData);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyE') handleEntrance();
    if (e.code === 'ArrowLeft' || e.code === 'KeyX') handleExit();
    if (e.code === 'KeyR') fetchParkingData();
});
