(async function() {
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
            const zeroStyle = item.count===0 ? 'style="background:#555;color:white;text-shadow:none;"' : '';
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-calendar-day"></i> ${item.dateStr} <span ${zeroStyle}>${item.count} sakyanan</span>`;
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

            let occupied = 0, available = 0;
            data.forEach(slot => {
                if(slot.status=="1"||slot.status===1) occupied++;
                else available++;
            });

            document.getElementById('occupiedCount').textContent = occupied;
            document.getElementById('availableCount').textContent = available;
            document.getElementById('entryCount').textContent = occupied; // assuming entrance = currently parked
            document.getElementById('exitCount').textContent = available; // assuming exit = available slots

            const capPercent = Math.min((occupied/MAX_CAPACITY)*100,100);
            document.getElementById('capacityBar').style.width = capPercent+'%';
            document.getElementById('capacityText').textContent = `${occupied}/${MAX_CAPACITY}`;

            addTodayToHistory(getTodayDateStr(), occupied);

        } catch(e) {
            console.error(e);
        }
    }

    document.getElementById('refreshBtn').addEventListener('click', fetchParkingData);

    // initial calls
    loadHistory();
    updateDateDisplay();
    fetchParkingData();
    setInterval(fetchParkingData, 20000);
    setInterval(updateDateDisplay, 60000);
})();
