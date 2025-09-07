async function loadDetailedReport() {
    try {
      const staticRes = await fetch("https://akhils.site/api/static");
      const staticData = await staticRes.json();
  
      const returning = staticData.filter(s => s.referrer && s.referrer.includes(location.hostname)).length;
      const newcomers = staticData.length - returning;
  
      renderPieChart(returning, newcomers);
      renderUserGrid(staticData);
      renderDiscussion(returning, newcomers);
    } catch (err) {
      console.error("Failed to load detailed report:", err);
    }
  }
  
  function renderPieChart(returning, newcomers) {
    // Ensure there is at least one non-zero value
    let series = [];
    
    if (returning > 0 || newcomers > 0) {
      // Add only slices that are non-zero
      if (returning > 0) series.push({ values: [returning], text: "Returning Users" });
      if (newcomers > 0) series.push({ values: [newcomers], text: "New Users" });
    } else {
      // No data available, show a placeholder slice
      series.push({ values: [1], text: "No Data" });
    }
  
    // Destroy old chart if it exists
    try { zingchart.exec('pieChart', 'destroy'); } catch(e) {}
  
    zingchart.render({
      id: "pieChart",
      data: {
        type: "pie",
        title: { text: "User Distribution", fontSize: 20 },
        series: series,
        tooltip: { text: "%t: %v (%npv%)" }
      },
      height: "400px",
      width: "100%"
    });
  }
  
  
  

  function renderUserGrid(staticData) {
    const rows = staticData.map(s => ({
      sessionId: s.session_id,
      language: s.language,
      browser: s.userAgent,
      referrer: s.referrer || "Direct"
    }));
  
    document.getElementById("userGrid").setAttribute("data", JSON.stringify(rows));
  }
  
  function renderDiscussion(returning, newcomers) {
    const total = returning + newcomers;
    const pctReturning = ((returning / total) * 100).toFixed(1);
    const pctNew = ((newcomers / total) * 100).toFixed(1);
  
    document.getElementById("discussion").textContent =
      `Out of ${total} users, ${pctReturning}% are returning and ${pctNew}% are new. 
       This suggests a balance between user retention and acquisition.`;
  }
  
  loadDetailedReport();
  