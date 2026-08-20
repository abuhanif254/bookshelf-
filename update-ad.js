const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/bookshelf-db.json'));
db.settings.adCode = `<script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script> <ins class="eas6a97888e37" data-zoneid="6006918"></ins> <script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>`;
fs.writeFileSync('data/bookshelf-db.json', JSON.stringify(db, null, 2));
console.log('Done!');
