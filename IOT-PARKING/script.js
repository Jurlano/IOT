(function() {
    "use strict";

    const MOCKAPI_URL = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io/parking';
    const MAX_CAPACITY = 6;
    let visitHistory = [];

    function getTodayDateStr() {
        const now = new Date();
        const monthNames = ['Enero','Pebrero','Marso','Abril','Mayo','Hunyo',
                            'Hulyo','Agosto','Setyembre','Oktubre','Nobyembre','Disyembre'];
        return `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    function loadHistory() {
        try {
            const stored = localStorage.getItem('parking_cyber_history');
            visitHistory = stored ? JSON.parse(stored) : [];
        } catch(e) {
            visitHistory = [];
        }
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('parking_cyber_history', JSON.stringify(visitHistory.slice(0,5)));
    }

    function addTodayToHistory(todayStr, occupied) {
        const idx = visitHistory.findIndex(e => e.dateStr === todayStr);
        if(idx >= 0) visitHistory[idx].occupied = occupied;
        else visitHistory.unshift({ dateStr: todayStr, occupied });
        if(visitHistory.length>5) visitHistory = visitHistory.slice(0,5);
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        const listEl = document.getElementById('historyList');
        if(!listEl) return;
        listEl.innerHTML = '';
        if(visitHistory.length===0) {
            listEl.innerHTML = '<li><i class="fas fa-ban"></i> walay history</li>';
            return;
        }
        visitHistory.forEach(item => {
            const zeroStyle = item.occupied===0 ? 
                'style="background:#555;color:white;text-shadow:none;padding:2px 6px;border-radius:4px;"' : '';
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-calendar-day"></i> ${item.dateStr} <span ${zeroStyle}>${item.occupied} sakyanan</span>`;
            listEl.appendChild(li);
        });
    }

    function updateDateDisplay() {
        const now = new Date();
        const optionsHeader = { weekday:'short', month:'short', day:'numeric', year:'numeric'};
        document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-PH', optionsHeader);
    }

    async function fetchParkingData() {
        try {
            const res = await fetch(MOCKAPI_URL);
            if(!res.ok) throw new Error(res.status);
            const data = await res.json();

            // Count occupied slots
            let occupied = data.filter(slot => parseInt(slot.occupied) === 1).length;

            // Latest slot's available for vacant display
            let latestAvailable = parseInt(data[data.length-1]?.available) || (MAX_CAPACITY - occupied);

            // Entrance/Exit (view-only) sum all records if present
            let entrance = data.reduce((sum, slot) => sum + (parseInt(slot.entrance) || 0), 0);
            let exitCount = data.reduce((sum, slot) => sum + (parseInt(slot.exit) || 0), 0);

            // Update dashboard
            document.getElementById('currentInside').textContent = occupied;
            document.getElementById('vacantSlots').textContent = latestAvailable;
            document.getElementById('todayEntrance').textContent = entrance;
            document.getElementById('todayExit').textContent = exitCount;

            // Capacity bar
            const capPercent = Math.min((occupied/MAX_CAPACITY)*100,100);
            const capBar = document.getElementById('capacityBar');
            capBar.style.width = capPercent+'%';
            capBar.classList.remove('warning','danger');
            if(capPercent>=80 && capPercent<100) capBar.classList.add('warning');
            else if(capPercent>=100) capBar.classList.add('danger');
            document.getElementById('capacityText').textContent = `${occupied}/${MAX_CAPACITY}`;

            // Alert if full
            const alertBox = document.getElementById('alertBox');
            alertBox.style.display = (occupied >= MAX_CAPACITY) ? 'flex' : 'none';

            // Update history
            addTodayToHistory(getTodayDateStr(), occupied);

        } catch(e) {
            console.error('Fetch error:', e);
        }
    }

    loadHistory();
    updateDateDisplay();
    fetchParkingData();

    document.getElementById('refreshBtn').addEventListener('click', fetchParkingData);

    setInterval(fetchParkingData, 20000);
    setInterval(updateDateDisplay, 60000);
})();
