const https = require('https');

const options = {
    hostname: 'v3.football.api-sports.io',
    path: '/status',
    method: 'GET',
    headers: {
        'x-rapidapi-key': '93bbcf6ff27de96b9cab5adaa415a702',
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'User-Agent': 'NodeApp'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
