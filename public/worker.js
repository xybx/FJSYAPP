function startTimer(data = {}) {
    setInterval(() => {
        postMessage(data.message || 'interval');
    }, data.time || 15000);
}

onmessage = function (event) {
    startTimer(event.data);
}