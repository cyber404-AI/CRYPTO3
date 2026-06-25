# Web CTF: Forgotten Notes

A beginner-friendly Web CTF challenge designed to teach players basic observation skills, HTML source code inspection, and tracking development crumbs.

## Challenge Metadata
* **Name:** Forgotten Notes
* **Difficulty:** Easy (100 Points)
* **Category:** Web
* **Author:** SYPHERR
* **Flag:** `BSCTF{always_follow_the_clues}` (encoded as `QlNDVEZ7YWx3YXlzX2ZvbGxvd190aGVfY2x1ZXN9` in the console)

---

## Challenge Description (For Players)
> **Aether Security Systems** claims to have the most secure corporate infrastructure. They recently migrated their public portal to containerized systems and had an external company review their external perimeter. However, we suspect one of their developers left behind some configuration files and temporary internal developer logs. 
> 
> Can you investigate the site, trace the clues left by the engineering team, and retrieve the flag?
> 
> **URL:** `http://<challenge-ip>:<port>`

---

## Solve Path (Walkthrough)

1. **Step 1: Homepage Source Code Audit**
   * The player loads the website home page (`/index.html`) in a browser.
   * They right-click the page and select **View Page Source** (or press `Ctrl+U` / `Cmd+Opt+U`).
   * Scrolling to the bottom of the HTML, they discover a hidden developer HTML comment:
     ```html
     <!-- TODO(deploy-team): Clean up staging assets. The migration guidelines and development notes are still accessible at /dev-notes-9a2f.html. Please archive this before the next audit. -->
     ```

2. **Step 2: Inspect Staging Dev Notes**
   * The player navigates directly to `http://<challenge-ip>:<port>/dev-notes-9a2f.html`.
   * This page displays a restricted Aether Security Internal Wiki page.
   * Under the **Temporary Staging Environment Console** note card, they find a critical note revealing the diagnostics endpoint path:
     > *"The temporary staging diagnostics console is active at /staging-console-8c3b.html. Use this console to verify environment variables, active services, and debug logs. Ensure this panel is deleted or restricted prior to public release."*

3. **Step 3: Retrieve Flag from Staging Console**
   * The player navigates to `http://<challenge-ip>:<port>/staging-console-8c3b.html`.
   * They observe a diagnostics dashboard simulating container logs and process environment variables.
   * In the **Active Process Environment Variables** table, under the key `SYS_FLAG`, they locate the Base64-encoded value:
     `QlNDVEZ7YWx3YXlzX2ZvbGxvd190aGVfY2x1ZXN9`
   * Decoding the Base64 value yields the plaintext flag:
     `BSCTF{always_follow_the_clues}`

---

## Hint System
If players get stuck, organizers can provide these progressive hints:
* **Hint 1 (10 pts):** *"Developers often leave TODO lists and remarks in the HTML comments. Have you inspected the raw source code of the Home page?"*
* **Hint 2 (25 pts):** *"The developer notes page has a section dedicated to temporary staging consoles. Check the colored boxes for paths or links."*

---

## Docker Deployment Instructions

### Prerequisites
* Docker installed on the host system.

### Build and Run locally
1. Navigate to the directory containing the `Dockerfile`.
2. Build the Docker image:
   ```bash
   docker build -t forgotten-notes .
   ```
3. Run the container mapping port `8080` (or another port of choice) on the host:
   ```bash
   docker run -d -p 8080:80 --name forgotten-notes-instance forgotten-notes
   ```
4. Verify accessibility by opening a browser and navigating to:
   ```
   http://localhost:8080
   ```

### Stopping and Cleaning Up
To stop and remove the challenge container:
```bash
docker stop forgotten-notes-instance
docker rm forgotten-notes-instance
```
