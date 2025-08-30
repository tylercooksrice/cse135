// collector.js - User Analytics Data Collector
// Sends data to: https://akhils.site/json

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        ENDPOINT: 'https://akhils.site/json/analytics',
        SEND_INTERVAL: 10000, // Send data every 10 seconds
        IDLE_THRESHOLD: 2000, // 2 seconds of inactivity
        MAX_ITEMS_PER_BATCH: 50 // Max activity items to send at once
    };

    // Generate a unique session ID
    const SESSION_ID = generateSessionId();
    let lastActivityTime = Date.now();
    let idleStartTime = null;
    let sendIntervalId = null;

    // Data storage
    const analyticsData = {
        sessionId: SESSION_ID,
        static: {},
        performance: {},
        activity: []
    };

    // Generate a unique session ID
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Check if images are enabled
    function areImagesEnabled() {
        try {
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            return img.width > 0 && img.height > 0;
        } catch (e) {
            return false;
        }
    }

    // Check if CSS is enabled
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
        } catch (e) {
            return false;
        }
    }

    // Collect static data
    function collectStaticData() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        analyticsData.static = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            javaScriptEnabled: true, // We're running JS so this is true
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
            onlineStatus: navigator.onLine
        };
        
        return analyticsData.static;
    }

    // Collect performance data
    function collectPerformanceData() {
        if (!window.performance || !window.performance.timing) {
            return null;
        }
        
        const perfTiming = window.performance.timing;
        const now = Date.now();
        
        analyticsData.performance = {
            timing: perfTiming,
            pageStart: perfTiming.navigationStart,
            pageEnd: perfTiming.loadEventEnd,
            totalLoadTime: perfTiming.loadEventEnd - perfTiming.navigationStart,
            dnsTime: perfTiming.domainLookupEnd - perfTiming.domainLookupStart,
            tcpTime: perfTiming.connectEnd - perfTiming.connectStart,
            requestTime: perfTiming.responseEnd - perfTiming.requestStart,
            domLoadingTime: perfTiming.domContentLoadedEventStart - perfTiming.navigationStart,
            domCompleteTime: perfTiming.domComplete - perfTiming.navigationStart,
            collectedAt: now
        };
        
        return analyticsData.performance;
    }

    // Activity tracking functions
    function trackMouseMove(event) {
        const activity = {
            type: 'mousemove',
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function trackClick(event) {
        const activity = {
            type: 'click',
            button: event.button, // 0: left, 1: middle, 2: right
            x: event.clientX,
            y: event.clientY,
            target: event.target.tagName,
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function trackScroll() {
        const activity = {
            type: 'scroll',
            x: window.scrollX,
            y: window.scrollY,
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function trackKeyEvent(event) {
        const activity = {
            type: event.type,
            key: event.key,
            code: event.code,
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function trackErrors(message, source, lineno, colno, error) {
        const activity = {
            type: 'error',
            message,
            source,
            lineno,
            colno,
            error: error ? error.toString() : 'unknown',
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function trackVisibilityChange() {
        const activity = {
            type: document.visibilityState === 'visible' ? 'visible' : 'hidden',
            timestamp: Date.now()
        };
        addActivity(activity);
    }

    function checkIdleTime() {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityTime;
        
        if (timeSinceLastActivity >= CONFIG.IDLE_THRESHOLD && !idleStartTime) {
            // User became idle
            idleStartTime = lastActivityTime;
        } else if (timeSinceLastActivity < CONFIG.IDLE_THRESHOLD && idleStartTime) {
            // User is active again after being idle
            const activity = {
                type: 'idle_end',
                idleDuration: now - idleStartTime,
                timestamp: now
            };
            addActivity(activity);
            idleStartTime = null;
        }
    }

    function addActivity(activity) {
        analyticsData.activity.push(activity);
        lastActivityTime = Date.now();
        
        // If we have too many activities, send them immediately
        if (analyticsData.activity.length >= CONFIG.MAX_ITEMS_PER_BATCH) {
            sendData();
        }
    }

    // Data sending functions
    function sendData() {
        if (analyticsData.activity.length === 0) {
            return; // No data to send
        }
        
        // Prepare data to send (copy and clear activity buffer)
        const dataToSend = {
            sessionId: analyticsData.sessionId,
            static: analyticsData.static,
            performance: analyticsData.performance,
            activity: analyticsData.activity.splice(0, CONFIG.MAX_ITEMS_PER_BATCH),
            sentAt: Date.now()
        };
        
        // Try to send using sendBeacon first (better for page unload)
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(dataToSend)], { type: 'application/json' });
            if (navigator.sendBeacon(CONFIG.ENDPOINT, blob)) {
                return true;
            }
        }
        
        // Fallback to fetch API
        fetch(CONFIG.ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response not OK');
            }
        })
        .catch(error => {
            // Save data to localStorage for later retry
            saveDataForRetry(dataToSend);
        });
        
        return false;
    }

    function saveDataForRetry(data) {
        // Get existing pending data
        let pendingData = JSON.parse(localStorage.getItem('analyticsPendingData') || '[]');
        
        // Add new data
        pendingData.push(data);
        
        // Save back to localStorage
        localStorage.setItem('analyticsPendingData', JSON.stringify(pendingData));
    }

    function retryPendingData() {
        const pendingData = JSON.parse(localStorage.getItem('analyticsPendingData') || '[]');
        
        if (pendingData.length === 0) return;
        
        // Try to send all pending data
        const failedData = [];
        
        pendingData.forEach(data => {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            
            if (navigator.sendBeacon(CONFIG.ENDPOINT, blob)) {
                // Successfully sent
            } else {
                // Failed to send, keep for next retry
                failedData.push(data);
            }
        });
        
        // Update localStorage with remaining pending data
        localStorage.setItem('analyticsPendingData', JSON.stringify(failedData));
    }

    // Initialize analytics collection
    function initAnalytics() {
        // Collect static and performance data
        collectStaticData();
        
        // Wait for page to fully load before collecting performance data
        if (document.readyState === 'complete') {
            collectPerformanceData();
        } else {
            window.addEventListener('load', collectPerformanceData);
        }
        
        // Set up activity listeners
        document.addEventListener('mousemove', trackMouseMove);
        document.addEventListener('click', trackClick);
        document.addEventListener('scroll', trackScroll, { passive: true });
        document.addEventListener('keydown', trackKeyEvent);
        document.addEventListener('keyup', trackKeyEvent);
        document.addEventListener('visibilitychange', trackVisibilityChange);
        
        window.addEventListener('error', (event) => {
            trackErrors(event.message, event.filename, event.lineno, event.colno, event.error);
        });
        
        // Set up periodic checking for idle time
        setInterval(checkIdleTime, 1000);
        
        // Set up periodic data sending
        sendIntervalId = setInterval(sendData, CONFIG.SEND_INTERVAL);
        
        // Try to send any pending data from previous sessions
        retryPendingData();
        
        // Set up beforeunload to send final data
        window.addEventListener('beforeunload', () => {
            // Clear the interval
            clearInterval(sendIntervalId);
            
            // Send any remaining data
            if (analyticsData.activity.length > 0) {
                sendData();
            }
        });
        
        // Record page entry
        addActivity({
            type: 'page_entry',
            url: window.location.href,
            timestamp: Date.now()
        });
    }

    // Start analytics when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }
})();