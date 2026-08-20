const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/bookshelf-db.json'));
db.settings.adCode = `<script async="async" data-cfasync="false" src="https://pl30933342.effectivecpmnetwork.com/e0d4316b2ca77b0196a17bef73465abb/invoke.js"></script><div id="container-e0d4316b2ca77b0196a17bef73465abb"></div>`;
fs.writeFileSync('data/bookshelf-db.json', JSON.stringify(db, null, 2));
console.log('Done!');
