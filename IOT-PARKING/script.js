// ===== script.js =====
(function() {
    "use strict";

    // ========== MOCKAPI + CYBER HISTORY ==========
    const MOCKAPI_URL = 'https://698d3f03b79d1c928ed4ccbd.mockapi.io/parking';
    
    // local history store (maximum 5 entries)
    let visitHistory = [];

    // ---------- load from localStorage ----------
    function loadHistory() {
        try {
            const stored = localStorage.getItem('parking_cyber_history');
            if (stored) {
                visitHistory = JSON.parse(stored);
            } else {
                // initial default (cyber vibe)
                visitHistory = [
                    { dateStr: 'Peb 14, 2026', count: 7 },
                    { dateStr: 'Peb 13, 2026', count: 3 },
                    { dateStr: 'Peb 12, 2026', count: 0 },
                    { dateStr: 'Peb 11, 2026', count: 5 },
                    { dateStr: 'Peb 10, 2026', count: 2 }
                ];
            }
        } catch (e) {
            console.warn("localStorage fail");
            visitHistory = [];
        }
        renderHistory();
    }

    // ---------- save history ----------
    function saveHistory() {
        try {
            localStorage.setItem('parking_cyber_history', JSON.stringify(visitHistory.slice(0, 5)));
        } catch (e) {}
    }

    // ---------- add a record (today's visit) ----------
    function addTodayToHistory(todayStr, count) {
        const existingIndex = visitHistory.findIndex(entry => entry.dateStr === todayStr);
        if (existingIndex !== -1) {
            visitHistory[existingIndex].count = count;
        } else {
            visitHistory.unshift({ dateStr: todayStr, count: count });
        }
        if (visitHistory.length > 5) {
            visitHistory = visitHistory.slice(0, 5);
        }
        saveHistory();
        renderHistory();
    }

    // ---------- render history list ----------
    function renderHistory() {
        const listEl = document.getElementById('historyList');
        if (!listEl) return;
        listEl.innerHTML = '';
        if (visitHistory.length === 0) {
            listEl.innerHTML = '<li style="justify-content:center;"><i class="fas fa-ban"></i> walay history</li>';
            return;
        }
        visitHistory.forEach(item => {
            const li = document.createElement('li');
            const countDisplay = item.count + ' sakyanan';
            // optional zero style
            const zeroStyle = item.count === 0 ? 'background: #555; color:white; text-shadow:none;' : '';
            li.innerHTML = `<i class="fas fa-calendar-day"></i> <span>${item.dateStr}</span> <span class="history-badge" style="${zeroStyle}">${countDisplay}</span>`;
            listEl.appendChild(li);
        });
    }

    // ---------- get today's date in Filipino format ----------
    function getTodayDateStr() {
        const now = new Date();
        const monthNames = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 
                           'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
        const month = monthNames[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        return `${month} ${day}, ${year}`;
    }

    // ---------- update header and full date displays ----------
    function updateDateDisplay() {
        const now = new Date();
        const optionsHeader = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const headerDate = now.toLocaleDateString('en-PH', optionsHeader);
        document.getElementById('dateDisplay').innerHTML = `<i class="far fa-calendar-alt"></i> ${headerDate}`;

        const monthNames = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 
                           'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
        const month = monthNames[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        const fullDateString = `${month} ${day}, ${year}`;
        document.getElementById('fullDateDisplay').innerHTML = `<i class="far fa-calendar-check"></i> ${fullDateString}`;
    }

    // ---------- fetch from mockapi & update UI ----------
    async function fetchParkingData() {
        document.getElementById('occupiedCount').textContent = '⋯';
        document.getElementById('statusMessage').innerHTML = `<i class="fas fa-spinner fa-pulse"></i> nag scan...`;
        try {
            const response = await fetch(MOCKAPI_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            // count occupied (status "1" or 1)
            let occupied = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].status == "1" || data[i].status === 1) {
                    occupied++;
                }
            }

            // update big number
            document.getElementById('occupiedCount').textContent = occupied;

            // status message with zero handling
            let message = "";
            if (occupied === 0) {
                message = "⛔ ZERO sakyanan · walay bisita";
            } else if (occupied === 1) {
                message = "🚗 1 ka sakyanan ang naka-parking";
            } else {
                message = `🚘 ${occupied} ka sakyanan ang naka-parking`;
            }
            document.getElementById('statusMessage').innerHTML = `<i class="fas fa-parking" style="color: #ffcc00;"></i> ${message}`;

            // add today's record to history
            const todayStr = getTodayDateStr();
            addTodayToHistory(todayStr, occupied);

        } catch (error) {
            console.error('fetch error:', error);
            document.getElementById('occupiedCount').textContent = '?';
            document.getElementById('statusMessage').innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ff44ee;"></i> network error`;
        }
    }

    // ---------- initial calls ----------
    loadHistory();          // show stored or default history
    updateDateDisplay();    // set dates immediately
    fetchParkingData();     // first fetch

    // refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        fetchParkingData();
    });

    // auto refresh every 20 seconds
    setInterval(fetchParkingData, 20000);
    setInterval(updateDateDisplay, 60000);
})();