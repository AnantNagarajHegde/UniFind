<h1>UniFind: University Lost and Found Network</h1>

UniFind is a web-based platform designed to assist university students, faculty, and staff in reporting and recovering lost and found items on campus. It provides an intuitive interface for reporting lost or found items, searching for items, and accessing information about the platform.

<h2>Table of Contents</h2>
<ul>
<li>Features</li>
<li>Technologies Used</li>
<li>Project Structure</li>
<li>Installation</li>
<li>Usage</li>
<li>API Endpoints</li>
<li>Database Schema</li>
<li>Contributing</li>
<li>Contact</li>
</ul>
<hr>
<h2>Features</h2>

<ul>
<li><b>Report Lost/Found Items:</b> Submit details and photos for lost or found items.</li>
<li><b>Search Items:</b> Filter items by category, location, date, or status.</li>
<li><b>Admin Dashboard:</b> Manage reported items and claims (accessible via admin.html).</li>
<li><b>How It Works:</b> Guide on using the platform (working.html).</li>
<li><b>About Us:</b> Information about the project and team (about.html).</li>
<li><b>Responsive Design:</b> Accessible on desktop and mobile devices.</ul></li>
<hr>

<h2>Technologies Used</h2>
<h3>1. Frontend:</h3>
<ul>
  <li>HTML: Page structure (home.html, report.html, search.html, etc.)</li>
  <li>CSS: Styling (styles.css)</li>
  <li>JavaScript: Interactivity (script.js)</li>
</ul>

<h3>2. Backend:</h3>
<ul>
  <li>Node.js: Server-side runtime (server.js)</li>
  <li>Express.js: Web framework for API development</li>
</ul>


<h3>3. Database:</h3>
<ul><li>MySQL: Relational database (Lost_and_Found.sql)</li></ul>

<h3>4. Other:</h3>
<ul><li>Multer: For handling photo uploads (stored in uploads/)</li></ul>
<hr>

### Project Structure:
```  
UniFind/
├── Backend/
│   ├── .vscode/                    # VSCode settings
│   ├── node_modules/               # Node.js dependencies
│   ├── uploads/                    # Directory for uploaded item photos
│   ├── Lost_and_Found.sql          # Database schema
│   ├── package-lock.json           # Dependency lock file
│   ├── package.json                # Project dependencies and scripts
│   └── server.js                   # Main server file
├── Frontend/
│   ├── .vscode/                    # VSCode settings
│   ├── about.html                  # About Us page
│   ├── admin.html                  # Admin dashboard
│   ├── home.html                   # Home page
│   ├── report.html                 # Report lost/found items
│   ├── script.js                   # JavaScript for interactivity
│   ├── search.html                 # Search items page
│   ├── styles.css                  # CSS styles
│   ├── working.html                # How It Works page
└── README.md                       # Project documentation
```
<hr>
<h2>Installation</h2>

Follow these steps to set up the project locally:

#### 1. Clone the Repository:
```
git clone https://github.com/yourusername/UniFind.git
cd UniFind
```
#### 2. Install Backend Dependencies:
```
cd UniFind_Backend
npm install
```
#### 3. Set Up MySQL Database:
• Install MySQL if not already installed.<br>
• Create a database named unifind.<br>
• Import the Lost_and_Found.sql file from either Back-End/ or Front-End/:<br>
```
mysql -u yourusername -p unifind < UniFind_Backend/Lost_and_Found.sql
```

#### 4. Configure Environment:
• In Back-End/, create a .env file with:
```
DB_HOST=localhost
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=unifind
PORT=3000
```

#### 5. Start the Server:
```
cd UniFind_Backend
node server.js
```
> The application will be available at http://localhost:5000.


#### 6. Serve Frontend:
• Place the Front-End/ files in a directory served by the backend (e.g., move to Back-End/public/ if configured) or use a static server:
```
cd UniFind_Frontend
npx http-server
```
> Access the frontend at the port specified.
<hr>

### Usage
<ul>
  <li>Home Page: Access <code>home.html</code> to view the welcome page with navigation to report or search.</li>
  <li>Report Page: Use <code>report.html</code> to submit lost or found item details, including photos.</li>
  <li>Search Page: Navigate to <code>search.html</code> to find items using filters.</li>
  <li>Admin Dashboard: Access <code>admin.html</code> for managing items and claims (requires authentication, if implemented).</li>
  <li>How It Works: Visit <code>working.html</code> for usage instructions.</li>
  <li>About Us: Check <code>about.html</code> for project and team details.</li>
</ul>

<hr>

### API Endpoints
The backend (server.js) provides RESTful APIs. Key endpoints include:
<h4>• POST /api/lost-items: Report a lost item.</h4><pre>
  • Body: { name, description, category_id, location_id, date_lost, time_lost, color, features, photo }</pre>
<h4>• POST /api/found-items: Report a found item.</h4><pre>
  • Body: { name, description, category_id, found_location_id, current_location, date_found, time_found, color, features, photo }<br></pre>
<h4>• GET /api/lost-items: Search lost items.</h4><pre>
  • Query: ?category_id=1&location_id=2&status=Open<br></pre>
<h4>• GET /api/found-items: Search found items.</h4><pre>
  • Query: Similar to lost items<br></pre>
<h4>• POST /api/claims: Submit a claim.</h4><pre>
  • Body: { lost_item_id, found_item_id, user_id, claim_date }<br></pre>
<i>Note: Verify endpoints against your server.js implementation.</i>
<hr>

### Database Schema
The ```Lost_and_Found.sql``` file defines the MySQL schema with tables:<br>
<ul>
  <li><b>User:</b> User details (ID, name, email, etc.).</li>
  <li><b>Location:</b> Campus locations (ID, building name, etc.).</li>
  <li><b>Category:</b> Item categories (ID, name, etc.).</li>
  <li><b>Lost_Item:</b> Lost item details (ID, reported_by, name, description, etc.).</li>
  <li><b>Found_Item:</b> Found item details (ID, reported_by, name, description, etc.).</li>
  <li><b>Claim:</b> Links lost and found items (ID, lost_item_id, found_item_id, etc.).</li>
</ul>


Foreign keys ensure data integrity. The ER diagram ```(UniFind_Backend/Final_ER.mwb)``` visualizes relationships.
<hr>

### Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a branch: ```git checkout -b feature/your-feature.```
3. Commit changes: ```git commit -m 'Add your feature'.```
4. Push: ```git push origin feature/your-feature.```
5. Open a pull request.

Please follow coding standards and include tests where applicable.
<hr>

### Contact
For questions or feedback, contact:
Anant Nagaraj Hegde: ```anhunchalli@gmail.com```<br>
GitHub: ```AnantNagarajHegde```<br>
<hr>

<h4>Thank you for exploring UniFind! We aim to simplify the recovery of lost items on university campuses!</h4>
