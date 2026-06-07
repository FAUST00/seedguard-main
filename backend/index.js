const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'seedguard-dev-secret-change-me';

// Supabase client initialization
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('Supabase client initialized successfully.');
} else {
  console.warn('Warning: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set. Database operations will fail.');
}

const allowedOrigins = ['https://faust00.github.io', 'http://localhost:3000', 'http://localhost:3001'];

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.endsWith('.onrender.com')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (!supabase) return res.status(500).json({ error: 'Supabase database is not configured' });

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u_' + Date.now() + Math.random().toString(36).substring(2, 6);

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        email: email || null,
        password: hashedPassword,
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: userId, username, createdAt: new Date().toISOString() } });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (!supabase) return res.status(500).json({ error: 'Supabase database is not configured' });

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        createdAt: user.created_at,
        streakStart: user.streak_start,
        stats: user.stats,
        history: user.history,
        settings: user.settings,
        friends: user.friends
      } 
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

// Endpoint to fetch latest user profile data
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase database is not configured' });
    const userId = req.user.sub;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, username, created_at, streak_start, stats, history, settings, friends')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (e) {
    console.error('Profile fetch error:', e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

// Endpoint to synchronize user progress with the cloud
app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase database is not configured' });
    const userId = req.user.sub;
    const { streakStart, stats, history, settings, friends } = req.body;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak_start: streakStart,
        stats,
        history,
        settings,
        friends
      })
      .eq('id', userId);

    if (updateError) throw updateError;
    res.json({ status: 'success' });
  } catch (e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

app.listen(PORT, () => console.log(`SeedGuard backend listening on ${PORT}`));
