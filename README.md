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

&nbsp; <li>HTML: Page structure (home.html, report.html, search.html, etc.)</li>

&nbsp; <li>CSS: Styling (styles.css)</li>

&nbsp; <li>JavaScript: Interactivity (script.js)</li>

</ul>



<h3>2. Backend:</h3>

<ul>

&nbsp; <li>Node.js: Server-side runtime (server.js)</li>

&nbsp; <li>Express.js: Web framework for API development</li>

</ul>





<h3>3. Database:</h3>

<ul><li>MySQL: Relational database (Lost\_and\_Found.sql)</li></ul>



<h3>4. Other:</h3>

<ul><li>Multer: For handling photo uploads (stored in uploads/)</li></ul>

<hr>



\### Project Structure:

```  

UniFind/

├── Back-End/

│   ├── .vscode/                    # VSCode settings

│   ├── node\_modules/               # Node.js dependencies

│   ├── uploads/                    # Directory for uploaded item photos

│   ├── Lost\_and\_Found.sql          # Database schema

│   ├── package-lock.json           # Dependency lock file

│   ├── package.json                # Project dependencies and scripts

│   └── server.js                   # Main server file

├── Front-End/

│   ├── .vscode/                    # VSCode settings

│   ├── Anant LinkedIn profile pic\_square.JPG  # Image asset

│   ├── Profile pic\_square.JPG      # Image asset

│   ├── about.html                  # About Us page

│   ├── admin.html                  # Admin dashboard

│   ├── home.html                   # Home page

│   ├── logo.png                    # Project logo

│   ├── report.html                 # Report lost/found items

│   ├── script.js                   # JavaScript for interactivity

│   ├── search.html                 # Search items page

│   ├── styles.css                  # CSS styles

│   ├── working.html                # How It Works page

│   ├── UniFind\_Phase\_02\_Report.pdf # Project report

│   ├── University Lost and Found System\_Phase\_01\_ER.mwb  # ER diagram

│   └── University Lost and Found System\_  # Additional documentation

└── README.md                       # Project documentation

```

<hr>

<h2>Installation</h2>



Follow these steps to set up the project locally:



\#### 1. Clone the Repository:

```

git clone https://github.com/yourusername/UniFind.git

cd UniFind

```

\#### 2. Install Backend Dependencies:

```

cd UniFind\_Backend

npm install

```

\#### 3. Set Up MySQL Database:

• Install MySQL if not already installed.<br>

• Create a database named unifind.<br>

• Import the Lost\_and\_Found.sql file from either Back-End/ or Front-End/:<br>

```

mysql -u yourusername -p unifind < UniFind\_Backend/Lost\_and\_Found.sql

```



\#### 4. Configure Environment:

• In Back-End/, create a .env file with:

```

DB\_HOST=localhost

DB\_USER=yourusername

DB\_PASSWORD=yourpassword

DB\_NAME=unifind

PORT=3000

```



\#### 5. Start the Server:

```

cd UniFind\_Backend

node server.js

```

> The application will be available at http://localhost:5000.





\#### 6. Serve Frontend:

• Place the Front-End/ files in a directory served by the backend (e.g., move to Back-End/public/ if configured) or use a static server:

```

cd UniFind\_Frontend

npx http-server

```

> Access the frontend at the port specified.

<hr>



\### Usage

<ul>

&nbsp; <li>Home Page: Access <code>home.html</code> to view the welcome page with navigation to report or search.</li>

&nbsp; <li>Report Page: Use <code>report.html</code> to submit lost or found item details, including photos.</li>

&nbsp; <li>Search Page: Navigate to <code>search.html</code> to find items using filters.</li>

&nbsp; <li>Admin Dashboard: Access <code>admin.html</code> for managing items and claims (requires authentication, if implemented).</li>

&nbsp; <li>How It Works: Visit <code>working.html</code> for usage instructions.</li>

&nbsp; <li>About Us: Check <code>about.html</code> for project and team details.</li>

</ul>



<hr>



\### API Endpoints

The backend (server.js) provides RESTful APIs. Key endpoints include:

<h4>• POST /api/lost-items: Report a lost item.</h4><pre>

&nbsp; • Body: { name, description, category\_id, location\_id, date\_lost, time\_lost, color, features, photo }</pre>

<h4>• POST /api/found-items: Report a found item.</h4><pre>

&nbsp; • Body: { name, description, category\_id, found\_location\_id, current\_location, date\_found, time\_found, color, features, photo }<br></pre>

<h4>• GET /api/lost-items: Search lost items.</h4><pre>

&nbsp; • Query: ?category\_id=1\&location\_id=2\&status=Open<br></pre>

<h4>• GET /api/found-items: Search found items.</h4><pre>

&nbsp; • Query: Similar to lost items<br></pre>

<h4>• POST /api/claims: Submit a claim.</h4><pre>

&nbsp; • Body: { lost\_item\_id, found\_item\_id, user\_id, claim\_date }<br></pre>

<i>Note: Verify endpoints against your server.js implementation.</i>

<hr>



\### Database Schema

The ```Lost\_and\_Found.sql``` file defines the MySQL schema with tables:<br>

<ul>

&nbsp; <li><b>User:</b> User details (ID, name, email, etc.).</li>

&nbsp; <li><b>Location:</b> Campus locations (ID, building name, etc.).</li>

&nbsp; <li><b>Category:</b> Item categories (ID, name, etc.).</li>

&nbsp; <li><b>Lost\_Item:</b> Lost item details (ID, reported\_by, name, description, etc.).</li>

&nbsp; <li><b>Found\_Item:</b> Found item details (ID, reported\_by, name, description, etc.).</li>

&nbsp; <li><b>Claim:</b> Links lost and found items (ID, lost\_item\_id, found\_item\_id, etc.).</li>

</ul>





Foreign keys ensure data integrity. The ER diagram ```(UniFind\_Backend/Final\_ER.mwb)``` visualizes relationships.

<hr>



\### Contributing

Contributions are welcome! To contribute:

1\. Fork the repository.

2\. Create a branch: ```git checkout -b feature/your-feature.```

3\. Commit changes: ```git commit -m 'Add your feature'.```

4\. Push: ```git push origin feature/your-feature.```

5\. Open a pull request.



Please follow coding standards and include tests where applicable.

<hr>



\### Contact

For questions or feedback, contact:

Anant Nagaraj Hegde: ```anhunchalli@gmail.com```<br>

GitHub: ```AnantNagarajHegde```<br>

<hr>



<h4>Thank you for exploring UniFind! We aim to simplify the recovery of lost items on university campuses!</h4>



