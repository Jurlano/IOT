// ==========================
// SIMPLE PARKING MONITOR
// ==========================

// Config
const API_URL = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io';
const MAX = 6;

// Get elements
const elements = {
    inside: document.getElementById('currentInside'),
    exit: document.getElementById('todayExit'),
    slots: document.getElementById('slotsLeft'),
    bar: document.getElementById('capacityBar'),
    barText: document.getElementById('capacityText'),
    alert: document.getElementById('alertBox'),
    history: document.getElementById('historyList'),
    refresh: document.getElementById('refreshBtn'),
    date: document.getElementById('dateDisplay')
};

// Start
window.onload = function() {
    showDate();
    getData();
    setInterval(getData, 5000); // every 5 seconds
};

// Show current date
function showDate() {
    let d = new Date();
    elements.date.innerHTML = `<i class="far fa-calendar-alt"></i> ${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;
}

// Main function
async function getData() {
    try {
        // Get parking data
        let parkRes = await fetch(`${API_URL}/parking`);
        let parkData = await parkRes.json();
        
        // Get logs
        let logsRes = await fetch(`${API_URL}/logs`);
        let logsData = await logsRes.json();
        
        // Calculate
        let inside = 0;
        parkData.forEach(item => {
            inside += Number(item.occupied) || 0;
        });
        
        // Count today's exits
        let today = new Date().toDateString();
        let exits = 0;
        logsData.forEach(log => {
            let logDate = new Date(log.createdAt).toDateString();
            let action = String(log.action || '').toLowerCase();
            if (logDate === today && (action === 'exit' || action === 'gawas')) {
                exits++;
            }
        });
        
        // Update display
        updateUI(inside, exits);
        
        // Show history (last 10)
        showHistory(logsData.slice(-10));
        
    } catch(err) {
        console.log('Error:', err);
        elements.inside.textContent = '?';
        elements.exit.textContent = '?';
        elements.history.innerHTML = '<li style="color:red">⚠ Network Error</li>';
    }
}

// Update numbers and bars
function updateUI(inside, exits) {
    // Basic numbers
    elements.inside.textContent = inside;
    elements.exit.textContent = exits;
    
    // Slots left
    let left = MAX - inside;
    if (left < 0) left = 0;
    elements.slots.textContent = left + ' slots available';
    
    // Alert if full
    if (inside >= MAX) {
        elements.alert.style.display = 'block';
        elements.alert.innerHTML = '⚠ PARKING FULL ⚠';
    } else {
        elements.alert.style.display = 'none';
    }
    
    // Progress bar
    let percent = (inside / MAX) * 100;
    if (percent > 100) percent = 100;
    elements.bar.style.width = percent + '%';
    elements.barText.textContent = inside + '/' + MAX;
    
    // Bar color
    elements.bar.className = 'progress-bar';
    if (inside >= MAX) {
        elements.bar.classList.add('danger');
    } else if (inside >= 4) {
        elements.bar.classList.add('warning');
    }
}

// Show history list
function showHistory(logs) {
    let html = '';
    
    logs.reverse().forEach(log => {
        let time = new Date(log.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        let action = String(log.action || '').toLowerCase();
        
        let badge = 'SULOD';
        let color = '#27ae60';
        
        if (action === 'exit' || action === 'gawas') {
            badge = 'GAWAS';
            color = '#e74c3c';
        }
        
        html += `<li>
            <span style="color:#7f8c8d;">${time}</span>
            <span style="background:${color}; color:white; padding:3px 8px; border-radius:12px; font-size:12px;">${badge}</span>
        </li>`;
    });
    
    if (html === '') {
        html = '<li style="color:#95a5a6; text-align:center;">No records</li>';
    }
    
    elements.history.innerHTML = html;
}

// Refresh button
elements.refresh.onclick = function() {
    this.style.transform = 'rotate(180deg)';
    setTimeout(() => this.style.transform = 'none', 300);
    getData();
};
