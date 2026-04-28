# 🌊 DeepSea Sentinel

> **A next-generation vulnerability scanner dashboard** — built for security professionals who demand depth.

![DeepSea Sentinel Banner](srs_assets/)

## 🔍 Overview

**DeepSea Sentinel** is a sleek, dark-themed web-based vulnerability scanner interface designed to help security teams detect, analyze, and report on network and application vulnerabilities with precision.

## ✨ Features

- 🛡️ **Real-time Scanning Interface** — initiate and monitor scans live
- 📊 **Interactive Dashboard** — visualize vulnerability metrics at a glance
- 📁 **Scan History** — track all past scans and results
- 📝 **Detailed Reports** — generate comprehensive vulnerability reports
- 👤 **Authentication System** — secure login/logout flow
- ⚙️ **Admin Panel** — manage scanner settings and users

## 📂 Project Structure

```
deepsea-sentinel/
├── index.html        # Landing page
├── auth.html         # Login / Authentication
├── dashboard.html    # Main scanner dashboard
├── scanning.html     # Live scan interface
├── report.html       # Vulnerability reports
├── history.html      # Scan history
├── admin.html        # Admin control panel
└── js/
    └── app.js        # Core application logic
```

## 🚀 Running Locally

Simply serve the directory with any static file server:

```bash
# Using Python
python -m http.server 8080

# Then open:
# http://localhost:8080
```

## 🌐 Live Demo

Hosted via **GitHub Pages**: [View Live →](https://YOUR_USERNAME.github.io/deepsea-sentinel)

## 📄 Documentation

The full **Software Requirements Specification (SRS)** is available in the `srs_report.html` file, written to IEEE 830 standards.

## 🛠️ Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom dark theme with glassmorphism effects
- **Vanilla JavaScript** — No framework dependencies

## 📜 License

MIT License — feel free to use, modify, and distribute.

---

> Built with 💙 by Satyam Chauhan
