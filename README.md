## Members

Tyler Khuc
Akhil Subbaro

# Grader Information

acc: grader@178.128.179.204
pwd: grader1234

## Deployment Setup

- Hosting: DigitalOcean Droplet
- Source Control: GitHub
- Deployment: GitHub Actions
- Process:
  1. Edit files locally.
  2. Commit and push to `main` branch.
  3. GitHub Actions connects via SSH to droplet and runs `git pull`.
  4. Site updates automatically.
- See `Github-Deploy.mp4` for demo.

## Link for Homework 2
[akhils.site](https://akhils.site/src/)


## Homework 3 Checkpoint 3

### Dashboard

For the **User Activity Trend**, I chose a line chart because it best represents changes over time. The activity data is collected as discrete events (such as clicks, scrolls, errors, or navigation actions), and aggregating these events by minute allows for a clear visualization of user engagement patterns. A line chart makes it easy to identify peaks of interaction, quiet periods, and potential correlations with other events such as errors or performance slowdowns. I considered using a bar chart but found that the continuous nature of activity data made a line representation more intuitive for identifying trends.

For the **Browser Distribution**, I implemented a bar chart since the data consists of categorical counts of different browser types (Chrome, Safari, Firefox, Edge, etc.). Bar charts excel at showing comparisons across categories, which is precisely the goal here: quickly identifying which browsers are most commonly used. This choice also aids in debugging and optimization efforts, since seeing a large concentration of users on one browser may justify focusing development and testing resources there. I opted against pie charts because bar charts are easier to interpret when categories are not evenly distributed or when some smaller categories may otherwise be overlooked.

For the **Performance Metrics**, I selected a line chart to visualize page load times across sessions. Performance data is inherently time-based and benefits from being shown in sequence, as it allows trends like gradually increasing load times or sudden spikes to be spotted easily. A line chart also allows side-by-side comparison of multiple metrics if needed in the future (such as separating load, DOM ready, and resource fetch times). This decision was made to keep performance analysis actionable: developers can quickly identify when and where slowdowns occur, which is critical for maintaining a smooth user experience. A simple numeric average or static display would not have provided the same insight into temporal patterns.