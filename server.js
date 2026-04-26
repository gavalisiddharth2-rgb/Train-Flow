const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// ================= TRAINS =================
app.get('/api/trains', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Train');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/trains', async (req, res) => {
    const { Train_Name, Source, Destination, Departure_Time, Arrival_Time } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Train (Train_Name, Source, Destination, Departure_Time, Arrival_Time) VALUES (?, ?, ?, ?, ?)',
            [Train_Name, Source, Destination, Departure_Time, Arrival_Time]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/trains/:id', async (req, res) => {
    const { id } = req.params;
    const { Train_Name, Source, Destination, Departure_Time, Arrival_Time } = req.body;
    try {
        await db.query(
            'UPDATE Train SET Train_Name=?, Source=?, Destination=?, Departure_Time=?, Arrival_Time=? WHERE Train_ID=?',
            [Train_Name, Source, Destination, Departure_Time, Arrival_Time, id]
        );
        res.json({ message: 'Train updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/trains/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Train WHERE Train_ID=?', [req.params.id]);
        res.json({ message: 'Train deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= PASSENGERS =================
app.get('/api/passengers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Passenger');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/passengers', async (req, res) => {
    const { Name, Age, Gender, Contact_Number } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Passenger (Name, Age, Gender, Contact_Number) VALUES (?, ?, ?, ?)',
            [Name, Age, Gender, Contact_Number]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/passengers/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Age, Gender, Contact_Number } = req.body;
    try {
        await db.query(
            'UPDATE Passenger SET Name=?, Age=?, Gender=?, Contact_Number=? WHERE Passenger_ID=?',
            [Name, Age, Gender, Contact_Number, id]
        );
        res.json({ message: 'Passenger updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/passengers/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Passenger WHERE Passenger_ID=?', [req.params.id]);
        res.json({ message: 'Passenger deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= TICKETS =================
app.get('/api/tickets', async (req, res) => {
    try {
        const query = `
            SELECT t.Ticket_ID, t.Booking_Date, t.Seat_Number, t.Status,
                   p.Name AS Passenger_Name, p.Passenger_ID, 
                   tr.Train_Name AS Train_Name, tr.Train_ID
            FROM Ticket t
            JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
            JOIN Train tr ON t.Train_ID = tr.Train_ID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tickets', async (req, res) => {
    const { Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Ticket (Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status) VALUES (?, ?, ?, ?, ?)',
            [Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status || 'Booked']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
    try {
        await db.query(
            'UPDATE Ticket SET Status=? WHERE Ticket_ID=?',
            [Status, id]
        );
        res.json({ message: 'Ticket status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Ticket WHERE Ticket_ID=?', [req.params.id]);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= SUPERVISORS =================
app.get('/api/supervisors', async (req, res) => {
    try {
        const query = `
            SELECT s.Supervisor_ID, s.Name, s.Contact_Number, s.Assigned_Train_ID,
                   t.Train_Name
            FROM Technical_Supervisor s
            LEFT JOIN Train t ON s.Assigned_Train_ID = t.Train_ID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/supervisors', async (req, res) => {
    const { Name, Contact_Number, Assigned_Train_ID } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Technical_Supervisor (Name, Contact_Number, Assigned_Train_ID) VALUES (?, ?, ?)',
            [Name, Contact_Number, Assigned_Train_ID || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/supervisors/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Contact_Number, Assigned_Train_ID } = req.body;
    try {
        await db.query(
            'UPDATE Technical_Supervisor SET Name=?, Contact_Number=?, Assigned_Train_ID=? WHERE Supervisor_ID=?',
            [Name, Contact_Number, Assigned_Train_ID || null, id]
        );
        res.json({ message: 'Supervisor updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/supervisors/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Technical_Supervisor WHERE Supervisor_ID=?', [req.params.id]);
        res.json({ message: 'Supervisor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= AUTHENTICATION =================
app.post('/api/login', async (req, res) => {
    const { role, identifier, password } = req.body;
    try {
        let user = null;
        if (role === 'Admin') {
            const [rows] = await db.query('SELECT * FROM Admin WHERE Username=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Admin_ID, name: rows[0].Username, role: 'Admin' };
        } else if (role === 'Passenger') {
            const [rows] = await db.query('SELECT * FROM Passenger WHERE Contact_Number=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Passenger_ID, name: rows[0].Name, role: 'Passenger' };
        } else if (role === 'Supervisor') {
            const [rows] = await db.query('SELECT * FROM Technical_Supervisor WHERE Contact_Number=? AND Password=?', [identifier, password]);
            if (rows.length > 0) user = { id: rows[0].Supervisor_ID, name: rows[0].Name, role: 'Supervisor' };
        }

        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { role, identifier, password, name, age, gender } = req.body;
    try {
        if (role === 'Admin') {
            await db.query('INSERT INTO Admin (Username, Password) VALUES (?, ?)', [identifier, password]);
        } else if (role === 'Passenger') {
            await db.query('INSERT INTO Passenger (Name, Age, Gender, Contact_Number, Password) VALUES (?, ?, ?, ?, ?)', 
                [name, age, gender, identifier, password]);
        } else if (role === 'Supervisor') {
            await db.query('INSERT INTO Technical_Supervisor (Name, Contact_Number, Password) VALUES (?, ?, ?)', 
                [name, identifier, password]);
        }
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Identifier already exists. Please choose another.' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// ================= PASSENGER SPECIFIC =================
app.get('/api/passenger-tickets/:passengerId', async (req, res) => {
    try {
        const query = `
            SELECT t.Ticket_ID, t.Booking_Date, t.Seat_Number, t.Status,
                   p.Name AS Passenger_Name, p.Passenger_ID, 
                   tr.Train_Name AS Train_Name, tr.Train_ID, tr.Source, tr.Destination, tr.Departure_Time, tr.Arrival_Time
            FROM Ticket t
            JOIN Passenger p ON t.Passenger_ID = p.Passenger_ID
            JOIN Train tr ON t.Train_ID = tr.Train_ID
            WHERE t.Passenger_ID = ?
        `;
        const [rows] = await db.query(query, [req.params.passengerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= SUPERVISOR SPECIFIC =================
app.get('/api/supervisor-train/:supervisorId', async (req, res) => {
    try {
        const query = `
            SELECT t.*
            FROM Train t
            JOIN Technical_Supervisor s ON s.Assigned_Train_ID = t.Train_ID
            WHERE s.Supervisor_ID = ?
        `;
        const [rows] = await db.query(query, [req.params.supervisorId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback to index.html for undefined routes (Single Page App approach)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
