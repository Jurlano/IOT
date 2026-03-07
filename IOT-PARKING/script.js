(function() {
    "use strict";

    const MOCKAPI_URL = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io/parking';
    const MAX_CAPACITY = 6;
    let visitHistory = [];

    // ---------- Get today's date string ----------
    function getTodayDateStr() {
        const now = new Date();
        const monthNames = ['Enero','Pebrero','Marso','Abril','Mayo','Hunyo',
                            'Hulyo','Agosto','Setyembre','Oktubre','Nobyembre','Disyembre'];
        return `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    // ---------- History ----------
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

    // ---------- Update date display ----------
    function updateDateDisplay() {
        const now = new Date();
        const optionsHeader = { weekday:'short', month:'short', day:'numeric', year:'numeric'};
        document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-PH', optionsHeader);
    }

    // ---------- Fetch from MockAPI ----------
    async function fetchParkingData() {
        try {
            const res = await fetch(MOCKAPI_URL);
            if(!res.ok) throw new Error(res.status);
            const data = await res.json();

            // Calculate totals
            let occupied = 0;
            let entrance = 0;
            let exitCount = 0;

            data.forEach(slot => {
                // Occupied: count if slot is full
                if(parseInt(slot.occupied) > 0) occupied += parseInt(slot.occupied);

                // Entrance today (view-only)
                entrance += parseInt(slot.entrance || 0);

                // Exit today (view-only)
                exitCount += parseInt(slot.exit || 0);
            });

            const vacant = MAX_CAPACITY - occupied;

            // Update dashboard numbers
            document.getElementById('currentInside').textContent = occupied;
            document.getElementById('vacantSlots').textContent = vacant >= 0 ? vacant : 0;
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

            // Show alert if full
            const alertBox = document.getElementById('alertBox');
            alertBox.style.display = (occupied >= MAX_CAPACITY) ? 'flex' : 'none';

            // Update history
            addTodayToHistory(getTodayDateStr(), occupied);

        } catch(e) {
            console.error('Fetch error:', e);
        }
    }

    // ---------- Initial calls ----------
    loadHistory();
    updateDateDisplay();
    fetchParkingData();

    // ---------- Refresh button ----------
    document.getElementById('refreshBtn').addEventListener('click', fetchParkingData);

    // ---------- Auto refresh ----------
    setInterval(fetchParkingData, 20000);
    setInterval(updateDateDisplay, 60000);
})();
