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
    zingchart.render({
      id: "pieChart",
      data: {
        type: "pie",
        series: [
          {
            values: [returning, newcomers],
            text: ["Returning Users", "New Users"]
          }
        ]
      }
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
  