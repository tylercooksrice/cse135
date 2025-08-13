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
