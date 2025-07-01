const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool ({
    host: 'taskdb.cl88msmsqwid.us-east-2.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'Sky3ocean421',
    database: 'taskdb',
    ssl: {
        rejectUnauthorized: false // needed for AWS SSL
    }
});

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://d3sgai7g6vflkn.cloudfront.net');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    }
    if (req.method === 'POST') {
        if (req.url === '/api/sendtasktodatabase') {
            sendTaskToDatabase(req, res);
            return;
        } else if (req.url === '/api/register') {
            register(req, res);
            return;
        } else if (req.url === '/api/login') {
            login(req, res);
            return;
        }
    }
    if (req.method === 'GET') {
        if (req.url.startsWith('/api/loadtasks')) {
            loadTasks(req.url.split('/')[3], res, req);
            return;
        }
        if (req.url === '/api/verifyaccess') {
            verifyAccess(req, res);
            return;
        }
        if (req.url === '/api/logout') {
            logOut(res);
            return;
        }
    }
    if (req.method === 'DELETE') {
        if (req.url.startsWith('/api/deletetask')) {
            deleteTaskFromDatabase(req.url.split('/')[3], res);
            return;
        }
        if (req.url.startsWith('/api/clearcompleted')) {
            clearCompletedTasksFromDatabase(req, res);
            return;
        }
    }
    if (req.method === 'PUT') {
        if (req.url.startsWith('/api/toggleTaskStatus')) {
            toggleTaskStatusInDatabase(req.url.split('/')[3], res);
            return;
        }
    }

});

function logOut(res) {
    console.log('deleted cookie yet?');
    res.writeHead(200, { 'Set-Cookie': 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure' });
    res.end();
}

function verifyAccess(req, res) {
    if (req.headers.cookie === undefined || req.headers.cookie.split('=')[1] === '') {
        console.log('undefined the cookie is :', req.headers.cookie);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('invalid');
        return;
    }
        console.log(req.headers.cookie);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('valid');
}

function createJWT(id, res) {
    console.log('Creating JWT, headers sent?', res.headersSent);
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(
        { id: id },
        secretKey,
        { expiresIn: '1h' }
    );
    console.log(`token created, token is : ${token}`);
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; SameSite=None; Secure; Max-Age=3600; Path=/`);
}

function verifyJWTandFindID(req) {
    const token = req.headers.cookie.split('=')[1];
    const secretKey = process.env.JWT_SECRET;
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded.id;
    } catch (error) {
        console.error('user not logged in. error: ', error);
    }
}

function login(req, res) {
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        body = JSON.parse(body);
        const result = await pool.query('SELECT password, id FROM users WHERE username = $1', [body.username]);
        if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('no');
            return;
        }
        const isMatch = await bcrypt.compare(body.password, result.rows[0].password);
        if (isMatch) {
            createJWT(result.rows[0].id, res);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('yes');
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('no');
    });
}

function register(req, res) {
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
            console.log('Starting registration');
            body = JSON.parse(body)
            hashedPassword = await bcrypt.hash(body.password, 10);
            const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [body.username, hashedPassword]);
            console.log('About to create JWT, headers sent?', res.headersSent);
            createJWT(result.rows[0].id, res);
            console.log('JWT created, about to write head, headers sent?', res.headersSent);
            res.writeHead(201);
            res.end();
        } catch (error) {
            console.error('Registration error:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error');
            }
        }
    });
}

function serveFile(req, res) {
    let filePath = path.join(__dirname, '..', 'frontend', 'dist', req.url === '/' ? 'index.html' : req.url);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');    
    }

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf'
    };

    const contentType = mimeTypes[path.extname(filePath)];

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('500 - Error reading file');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function clearCompletedTasksFromDatabase(req, res) {
    const user_id = verifyJWTandFindID(req, res);
    pool.query('DELETE FROM tasks WHERE is_complete = true AND user_id = $1', [user_id]);
    res.writeHead(204);
    res.end();
}

function toggleTaskStatusInDatabase(id, res) {
    pool.query('UPDATE tasks SET is_complete = NOT is_complete WHERE id = $1', [id]);
    res.writeHead(200);
    res.end();
}

async function loadTasks(filter, res ,req) {
    const user_id = verifyJWTandFindID(req);
    let result;
    switch (filter) {
        case 'all':
            result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [user_id]);
            break;
        case 'active':
            result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND NOT is_complete ORDER BY id ASC', [user_id]);
            break;
        case 'completed':
            result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND is_complete ORDER BY id ASC', [user_id]);
            break;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
}

async function deleteTaskFromDatabase(id, res) {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.writeHead(204);
    res.end();
}

function sendTaskToDatabase(req, res) {
    const user_id = verifyJWTandFindID(req);

    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        body = JSON.parse(body);
        const result = await pool.query('INSERT INTO tasks (name, user_id) VALUES ($1, $2) RETURNING id, name, is_complete', [body.name, user_id]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    });
}

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
