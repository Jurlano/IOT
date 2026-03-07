// ===== script.js =====
(function() {
    "use strict";

    const MOCKAPI_URL = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io/parking';
    const MAX_CAPACITY = 6;
    let visitHistory = [];

    // ---------- Utility: Get today's date string ----------
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

    function addTodayToHistory(todayStr, count) {
        const idx = visitHistory.findIndex(e => e.dateStr === todayStr);
        if(idx >= 0) visitHistory[idx].count = count;
        else visitHistory.unshift({ dateStr: todayStr, count });
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
            const zeroStyle = item.count===0 ? 'style="background:#555;color:white;text-shadow:none;padding:2px 6px;border-radius:4px;"' : '';
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-calendar-day"></i> ${item.dateStr} <span ${zeroStyle}>${item.count} sakyanan</span>`;
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

            let occupied = 0;
            let vacant = 0;

            data.forEach(slot => {
                if(slot.status=="1"||slot.status===1) occupied++;
                else vacant++;
            });

            // Update dashboard numbers
            document.getElementById('currentInside').textContent = occupied;
            document.getElementById('vacantSlots').textContent = vacant;
            document.getElementById('todayEntrance').textContent = occupied;
            document.getElementById('todayExit').textContent = vacant;

            // Capacity bar
            const capPercent = Math.min((occupied/MAX_CAPACITY)*100,100);
            document.getElementById('capacityBar').style.width = capPercent+'%';
            document.getElementById('capacityText').textContent = `${occupied}/${MAX_CAPACITY}`;

            // Show alert if full
            const alertBox = document.getElementById('alertBox');
            if(occupied >= MAX_CAPACITY) alertBox.style.display = 'flex';
            else alertBox.style.display = 'none';

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
