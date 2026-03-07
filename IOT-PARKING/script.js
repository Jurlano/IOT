async function fetchParkingData() {
    try {
        const res = await fetch(MOCKAPI_URL);
        if(!res.ok) throw new Error(res.status);
        const data = await res.json();

        // Initialize counters
        let totalInside = 0;
        let totalEntrance = 0;
        let totalExit = 0;

        // Sum up all the entries
        data.forEach(record => {
            totalInside += parseInt(record.occupied || 0);
            totalEntrance += parseInt(record.entrance || 0);
            totalExit += parseInt(record.exit || 0);
        });

        // Calculate vacant slots
        const vacant = MAX_CAPACITY - totalInside;

        // Update dashboard numbers
        document.getElementById('currentInside').textContent = totalInside;
        document.getElementById('vacantSlots').textContent = vacant >= 0 ? vacant : 0;
        document.getElementById('todayEntrance').textContent = totalEntrance;
        document.getElementById('todayExit').textContent = totalExit;

        // Capacity bar
        const capPercent = Math.min((totalInside / MAX_CAPACITY) * 100, 100);
        const capBar = document.getElementById('capacityBar');
        capBar.style.width = capPercent + '%';
        capBar.classList.remove('warning','danger');
        if(capPercent >= 80 && capPercent < 100) capBar.classList.add('warning');
        else if(capPercent >= 100) capBar.classList.add('danger');

        document.getElementById('capacityText').textContent = `${totalInside}/${MAX_CAPACITY}`;

        // Show alert if full
        const alertBox = document.getElementById('alertBox');
        alertBox.style.display = (totalInside >= MAX_CAPACITY) ? 'flex' : 'none';

        // Update history
        addTodayToHistory(getTodayDateStr(), totalInside);

    } catch(e) {
        console.error('Fetch error:', e);
    }
}
