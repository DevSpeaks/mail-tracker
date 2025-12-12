# Mail Tracker

A simple Node.js + Express + EJS + SQLite application that generates and serves 1×1 tracking pixels for email opens. This project lets you:

- Create unique tracking pixel URLs.
- Embed them in emails (or web pages) to record open events.
- View open logs with timestamps, IPs, and user agents.

## Features

1. **Pixel Generation**  
   - Generates a unique ID (UUID) for each pixel.  
   - Stores pixel data (name, creation time) in a local SQLite database.

2. **Open Tracking**  
   - Serves a 1×1 transparent PNG at `/tracker/:id.png`.  
   - Logs each open event (time, IP, user-agent) to SQLite.

3. **Web Dashboard**  
   - Displays all created pixels.  
   - Provides a “View Logs” page to see open events for each pixel.  
   - Includes instructions on how to embed pixels in Gmail emails.

## Installation

1. **Clone the repository** (or download the ZIP):
   ```bash
   git clone https://github.com/DevSpeaks/mail-tracker.git
   cd mail-tracker
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the app**:
   ```bash
   npm start
   ```
   By default, it listens on port `3300`. You can visit <http://localhost:3300> in your browser.


## Usage

1. **Open the dashboard**  
   Go to <http://localhost:3300> in your browser.  

2. **Create a pixel**  
   - Enter a pixel name (optional) and click **Create Pixel**.  
   - A new pixel entry appears with a unique Tracker URL (e.g., `http://localhost:3300/tracker/<UUID>.png`).

3. **Embed the pixel**  
   - Copy the Tracker URL.  
   - Insert it into an email as an `<img>` tag or using Gmail’s “Insert photo from web” option.  
   - Once the recipient opens the email (and images load), your server records an open event.

4. **View logs**  
   - Click the **View Logs** link next to a pixel on the dashboard.  
   - You’ll see each open event with date/time, IP address, and user-agent.

## Important Notes

1. **Localhost vs. Public Domain**  
   - If you’re running this on your local machine (`http://localhost:3000`), external email clients won’t be able to load the pixel.  
   - You need a **publicly accessible** domain or IP address (e.g., on a VPS, Heroku, Render, etc.) for real-world tracking.

2. **Image Blocking**  
   - Many email clients (including Gmail) block or proxy images by default.  
   - Not all opens will be recorded if the recipient doesn’t enable images.

3. **Privacy & Legal**  
   - Depending on your region, you may be required to disclose to recipients that you’re tracking email opens.  
   - Use responsibly and comply with privacy regulations (e.g., GDPR).

## Embedding in Gmail (Quick Guide)

1. **Copy** the Tracker URL from your dashboard (e.g., `http://yourdomain.com/tracker/<UUID>.png`).  
2. **Compose a new email** in Gmail.  
3. **Click** the “Insert photo” icon in the formatting toolbar.  
4. **Select** “Web Address (URL)” and paste your pixel URL.  
5. **Insert** the image. It might look like a tiny/broken icon—this is normal for a 1×1 transparent pixel.  
6. **Send** the email. Once opened (with images enabled), the pixel is requested, and your open log updates.

## Project Structure


```
mail-tracker/
├── app.js              # Main server code
├── package.json        
├── package-lock.json   
├── mail-tracker.db     # SQLite database (created at runtime)
└── views/
    ├── index.ejs       # Dashboard for creating and listing pixels
    └── logs.ejs        # Displays open logs for a specific pixel
public/
└── images/
    └── pixel.png       # 1×1 transparent PNG used as the tracking pixel
```

## Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/my-new-feature`)  
3. Commit your changes (`git commit -am 'Add new feature'`)  
4. Push to the branch (`git push origin feature/my-new-feature`)  
5. Create a new Pull Request

## Open Rate Accuracy and Limitations

Email open tracking is based on image load events. Modern email clients such as Gmail, Apple Mail, and Outlook often proxy, cache, or prefetch images for privacy and security reasons. Because of this behavior, open tracking should be treated as an estimated metric rather than a guaranteed indication that a human viewed the email.

**Improves the quality of open tracking data by:**
   1. Comparing email sent timestamps with first image request timestamps
   2. Deduplicating multiple image requests for the same tracking pixel
   3. Using historical traffic patterns to classify proxy and automated image loads

These techniques help reduce noise and improve the directional accuracy of open rate metrics. However, they cannot reliably distinguish between automated image loads and real human opens in all cases, especially when image proxying is involved.

For more reliable engagement measurement, click tracking and other user initiated actions should be used alongside open tracking.

## License

[MIT](LICENSE) © 2024 

Feel free to modify this project.

---

Happy tracking! If you have questions or issues, open an issue on GitHub.
