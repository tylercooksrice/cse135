// public/collector.js - User analytics data collector
// Sends data to a single endpoint that the server unpacks: /json/analytics

(function () {
    'use strict';

    // Config
    const CONFIG = {
        ENDPOINT: '/api/json/analytics',
        SEND_INTERVAL: 10000,       // Send data every 10 seconds
        IDLE_THRESHOLD: 2000,       // Consider 2 seconds as idle
        MAX_ITEMS_PER_BATCH: 50     // Cap each batch at 50 items
    };

    // Session and buffers
    const SESSION_ID = generateSessionId();
    let lastActivityTime = Date.now();
    let idleStartTime = null;
    let sendIntervalId = null;

    const analyticsData = {
        sessionId: SESSION_ID,
        static: {},
        performance: {},
        activity: []
    };

    // Helpers
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    }

    function areImagesEnabled() {
        try {
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            return true;
        } catch {
            return false;
        }
    }

    function areCssEnabled() {
        try {
            const style = document.createElement('style');
            style.textContent = '#css-test { position: absolute; }';
            document.head.appendChild(style);

            const testEl = document.createElement('div');
            testEl.id = 'css-test';
            document.body.appendChild(testEl);

            const position = window.getComputedStyle(testEl).position;

            document.head.removeChild(style);
            document.body.removeChild(testEl);

            return position === 'absolute';
        } catch {
            return false;
        }
    }

    // Data collection
    function collectStaticData() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        analyticsData.static = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            javaScriptEnabled: true,
            imagesEnabled: areImagesEnabled(),
            cssEnabled: areCssEnabled(),
            screenDimensions: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            windowDimensions: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connectionType: connection ? connection.effectiveType : 'unknown',
            onlineStatus: navigator.onLine,
            page: {
                url: location.href,
                path: location.pathname,
                referrer: document.referrer || null
            }
        };

        return analyticsData.static;
    }

    function collectPerformanceData() {
        const now = Date.now();
        let nav = null;

        if (performance && performance.getEntriesByType) {
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries && navEntries.length) nav = navEntries[0];
        }

        const pt = performance && performance.timing;

        analyticsData.performance = nav ? {
            page: { url: location.href, path: location.pathname },
            navigation: {
                type: nav.type,
                domInteractive: Math.round(nav.domInteractive),
                domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
                loadTime: Math.round(nav.loadEventEnd)
            },
            resources: performance.getEntriesByType('resource').slice(0, 100).map(r => ({
                name: r.name,
                initiatorType: r.initiatorType,
                duration: Math.round(r.duration)
            })),
            collectedAt: now
        } : (pt ? {
            page: { url: location.href, path: location.pathname },
            timing: pt,
            pageStart: pt.navigationStart,
            pageEnd: pt.loadEventEnd,
            totalLoadTime: pt.loadEventEnd - pt.navigationStart,
            dnsTime: pt.domainLookupEnd - pt.domainLookupStart,
            tcpTime: pt.connectEnd - pt.connectStart,
            requestTime: pt.responseEnd - pt.requestStart,
            domLoadingTime: pt.domContentLoadedEventStart - pt.navigationStart,
            domCompleteTime: pt.domComplete - pt.navigationStart,
            collectedAt: now
        } : null);

        return analyticsData.performance;
    }

    // Activity tracking
    function addActivity(activity) {
        analyticsData.activity.push(activity);
        lastActivityTime = Date.now();

        if (analyticsData.activity.length >= CONFIG.MAX_ITEMS_PER_BATCH) {
            sendData();
        }
    }

    function trackMouseMove(event) {
        addActivity({
            type: 'mousemove',
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        });
    }

    function trackClick(event) {
        const t = event.target;
        const selector = t.id
            ? `#${t.id}`
            : (t.className ? `.${String(t.className).split(" ").join(".")}` : t.tagName.toLowerCase());

        addActivity({
            type: 'click',
            button: event.button,
            x: event.clientX,
            y: event.clientY,
            target: selector,
            timestamp: Date.now()
        });
    }

    function trackScroll() {
        addActivity({
            type: 'scroll',
            x: window.scrollX,  
            y: window.scrollY,
            timestamp: Date.now()
        });
    }

    function trackKeyEvent(event) {
        addActivity({
            type: event.type,
            key: event.key,
            code: event.code,
            timestamp: Date.now()
        });
    }

    function trackErrors(message, source, lineno, colno, error) {
        addActivity({
            type: 'error',
            message,
            source,
            lineno,
            colno,
            error: error ? String(error) : 'unknown',
            timestamp: Date.now()
        });
    }

    function trackVisibilityChange() {
        addActivity({
            type: document.visibilityState === 'visible' ? 'visible' : 'hidden',
            timestamp: Date.now()
        });
    }

    function checkIdleTime() {
        const now = Date.now();
        const dt = now - lastActivityTime;

        if (dt >= CONFIG.IDLE_THRESHOLD && !idleStartTime) {
            idleStartTime = lastActivityTime;
        } else if (dt < CONFIG.IDLE_THRESHOLD && idleStartTime) {
            addActivity({
                type: 'idle_end',
                idleDuration: now - idleStartTime,
                timestamp: now
            });
            idleStartTime = null;
        }
    }

    // Sending
    function sendData() {
        if (analyticsData.activity.length === 0) return;

        const batch = {
            sessionId: analyticsData.sessionId,
            static: analyticsData.static,
            performance: analyticsData.performance,
            activity: analyticsData.activity.splice(0, CONFIG.MAX_ITEMS_PER_BATCH),
            sentAt: Date.now()
        };

        const asBlob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
        if (navigator.sendBeacon && navigator.sendBeacon(CONFIG.ENDPOINT, asBlob)) {
            return;
        }

        fetch(CONFIG.ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch),
            keepalive: true
        })
        .then(resp => { if (!resp.ok) throw new Error('Server not OK'); })
        .catch(err => {
            console.error('Analytics send failed', err);
            saveDataForRetry(batch);
        });
    }

    function saveDataForRetry(data) {
        const key = 'analyticsPendingData';
        let pending = [];
        try { pending = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
        pending.push(data);
        localStorage.setItem(key, JSON.stringify(pending));
    }

    function retryPendingData() {
        const key = 'analyticsPendingData';
        let pending = [];
        try { pending = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}

        if (!pending.length) return;

        const failed = [];
        for (const data of pending) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            if (!(navigator.sendBeacon && navigator.sendBeacon(CONFIG.ENDPOINT, blob))) {
                failed.push(data);
            }
        }

        localStorage.setItem(key, JSON.stringify(failed));
    }

    // Initialization
    function init() {
        collectStaticData();
        collectPerformanceData();

        document.addEventListener('mousemove', trackMouseMove);
        document.addEventListener('click', trackClick);
        document.addEventListener('scroll', trackScroll);
        document.addEventListener('keydown', trackKeyEvent);
        document.addEventListener('keyup', trackKeyEvent);
        document.addEventListener('error', (e) => trackErrors(e.message, e.filename, e.lineno, e.colno, e.error));
        document.addEventListener('visibilitychange', trackVisibilityChange);

        sendIntervalId = setInterval(() => {
            checkIdleTime();
            sendData();
            retryPendingData();
        }, CONFIG.SEND_INTERVAL);
    }

    init();

})();
