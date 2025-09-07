async function loadData() {
    try {
      const [activityRes, staticRes] = await Promise.all([
        fetch("https://akhils.site/api/activity"),
        fetch("https://akhils.site/api/static")
      ]);
  
      const activity = await activityRes.json();
      const staticData = await staticRes.json();
  
      renderLineChart(activity);
      renderBarChart(staticData);
      renderErrorGrid(activity);
    } catch (err) {
      console.error("Failed to load reporting data:", err);
    }
  }
  
  // Line chart: activity events over time
  function renderLineChart(activity) {
    const timeBuckets = {};
    activity.forEach(a => {
      const minute = new Date(a.ts).toISOString().slice(0,16); // minute precision
      timeBuckets[minute] = (timeBuckets[minute] || 0) + 1;
    });
  
    const labels = Object.keys(timeBuckets);
    const values = Object.values(timeBuckets);
  
    zingchart.render({
      id: "lineChart",
      data: {
        type: "line",
        scaleX: { labels },
        series: [{ values }]
      }
    });
  }
  
  // Bar chart: page views grouped by browser
  function renderBarChart(staticData) {
    const browserCounts = {};
    staticData.forEach(s => {
      const ua = s.userAgent || "Unknown";
      let browser = "Other";
      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
  
    const labels = Object.keys(browserCounts);
    const values = Object.values(browserCounts);
  
    zingchart.render({
      id: "barChart",
      data: {
        type: "bar",
        scaleX: {
          labels // <-- browser names displayed along the x-axis
        },
        series: [
          {
            values // <-- counts for each browser
          }
        ]
      }
    });
  }
  
  // Grid: recent error logs
  function renderErrorGrid(activity) {
    const errors = activity.filter(a => a.event === "error").slice(-20).map(e => ({
      timestamp: new Date(e.ts).toLocaleString(),
      details: e.details
    }));
  
    document.getElementById("errorGrid").setAttribute("data", JSON.stringify(errors));
  }
  
  loadData();
  