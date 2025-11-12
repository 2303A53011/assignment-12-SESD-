NewsNow — Real-Time News Portal

A responsive, real-time news dashboard built using HTML, Bootstrap 5, and vanilla JavaScript. It fetches breaking news headlines from NewsAPI.org with filters for country, category, and keyword search.

🎯 Objective

Develop a web portal that displays real-time news updates and allows users to filter, search, and auto-refresh headlines using a public API.

🚀 Features

✅ Fetches live news using NewsAPI.

🌎 Country and category filters (Tech, Sports, Business, etc.)

🔁 Auto-refresh every 60 seconds toggle.

🔍 Keyword search support.

📄 Pagination support for browsing more headlines.

⚙️ Responsive layout using Bootstrap 5.

⚠️ Error and loading states handled gracefully.

🧠 Learning Focus

API Authentication (using NewsAPI key)

Fetch & Promise handling in JavaScript

DOM Manipulation (Dynamic rendering)

Pagination & query parameters

Auto-refresh mechanism with intervals

🧩 Tech Stack
Component	Technology
Frontend	HTML5, Bootstrap 5, JavaScript (ES6)
API Source	NewsAPI.org
Hosting	GitHub Pages
⚙️ Setup Instructions
1️⃣ Get a free API key

Sign up at https://newsapi.org/register and copy your free apiKey.

2️⃣ Clone this repository
git clone https://github.com/<your-username>/newsnow.git
cd newsnow
3️⃣ Add your API key

Open the file script.js and replace:

const API_KEY = 'YOUR_NEWSAPI_KEY_HERE';

with your actual API key.

4️⃣ Run the project locally

Just open index.html in your browser. No server required.

5️⃣ Deploy to GitHub Pages

Push all files to your GitHub repo.

Go to Settings → Pages.

Under Source, select main branch and click Save.
