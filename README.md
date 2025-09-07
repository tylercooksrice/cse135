## Members

Tyler Khuc
Akhil Subbaro

# Grader Information

acc: grader@178.128.179.204
pwd: grader1234

# Deployment Setup

- Hosting: DigitalOcean Droplet
- Source Control: GitHub
- Deployment: GitHub Actions
- Process:
  1. Edit files locally.
  2. Commit and push to `main` branch.
  3. GitHub Actions connects via SSH to droplet and runs `git pull`.
  4. Site updates automatically.
- See `Github-Deploy.mp4` for demo.

# Link for Homework 2
[akhils.site](https://akhils.site/src/)


# Homework 3 Checkpoint 3

## Dashboard

For the **User Activity Trend**, we chose a line chart because it best represents changes over time. The activity data is collected as discrete events (such as clicks, scrolls, errors, or navigation actions), and aggregating these events by minute allows for a clear visualization of user engagement patterns. A line chart makes it easy to identify peaks of interaction, quiet periods, and potential correlations with other events such as errors or performance slowdowns. We considered using a bar chart but found that the continuous nature of activity data made a line representation more intuitive for identifying trends.

For the **Browser Distribution**, we implemented a bar chart since the data consists of categorical counts of different browser types (Chrome, Safari, Firefox, Edge, etc.). Bar charts excel at showing comparisons across categories, which is precisely the goal here: quickly identifying which browsers are most commonly used. This choice also aids in debugging and optimization efforts, since seeing a large concentration of users on one browser may justify focusing development and testing resources there. We opted against pie charts because bar charts are easier to interpret when categories are not evenly distributed or when some smaller categories may otherwise be overlooked.


For the **Performance Metrics**, we selected a line chart to visualize page load times across sessions. Performance data is inherently time-based and benefits from being shown in sequence, as it allows trends like gradually increasing load times or sudden spikes to be spotted easily. A line chart also allows side-by-side comparison of multiple metrics if needed in the future (such as separating load, DOM ready, and resource fetch times). This decision was made to keep performance analysis actionable: developers can quickly identify when and where slowdowns occur, which is critical for maintaining a smooth user experience. A simple numeric average or static display would not have provided the same insight into temporal patterns.


## Report

### User Activity Trend
This report asks when does engagement spike, and which pages or actions are responsible for those spikes. We used a line chart that aggregates events by minute so the timeline is easy to read and trends are obvious. A line chart is a good fit because the activity stream is time based and the goal is to see how interaction rises and falls across a session window, rather than only looking at totals. Grouping events into one minute bins gives a clear signal without making the chart too noisy, and it keeps the scale consistent across different traffic levels. If needed, the chart can also include faint sub series for specific event types such as clicks or errors so that the viewer can spot whether a spike was driven by interaction or by failures.

The line chart is paired with a grid that lists the underlying events. The grid includes the timestamp, the session id, the page, the event type, and a short detail field. For clicks, the detail can be a target selector; for errors, the detail is the message. The grid is important because the chart tells us when something happened, but the grid explains what it was. Sorting and filtering in the grid makes it easy to verify which pages or actions lined up with each peak. Together, the chart and grid answer the guiding question by pointing to the exact windows of high engagement and the events that drove them, which helps decide where to focus UX or performance work. The file is linked from the dashboard as `activity-report.html`.

### Browser Distribution
This report asks which browsers account for most sessions, and whether those browsers line up with errors or lower engagement. weuse a bar chart with browsers on the x axis and session counts on the y axis. A bar chart works well here because we are comparing categories and want to make relative differences clear. Bars make it easy to see that one browser dominates or that usage is spread across several families. A pie chart would be harder to read in cases where there are many categories or when the differences are modest. The bar chart forms a quick overview that guides testing and optimization priorities.

To make the report actionable, weinclude a grid of sessions with environment details. The grid shows the session id, the browser family and version, the language, the connection type, the number of page views, and the error count. These fields allow a quick pass to see if a specific browser or version correlates with more failures or lower interaction. Sorting and filtering support targeted checks, such as showing only Safari sessions, or only sessions with one or more errors. The chart identifies the dominant platforms; the grid explains where reliability or usability issues may be concentrated. This combination helps decide where to invest engineering time. The file is linked from the dashboard as `browsers-report.html`.

