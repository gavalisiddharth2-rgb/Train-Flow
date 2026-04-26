const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Open SQLite database connection
let dbInstance = null;

async function initDb() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON;');

    // Create Tables using the exact schema requested by the user, plus authentication fields
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS Admin (
            Admin_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username VARCHAR(100) UNIQUE NOT NULL,
            Password VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Train (
            Train_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Train_Name VARCHAR(100) NOT NULL,
            Source VARCHAR(100),
            Destination VARCHAR(100),
            Departure_Time TIME,
            Arrival_Time TIME
        );

        CREATE TABLE IF NOT EXISTS Passenger (
            Passenger_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name VARCHAR(100) NOT NULL,
            Age INT,
            Gender VARCHAR(10),
            Contact_Number VARCHAR(15) UNIQUE,
            Password VARCHAR(100) NOT NULL DEFAULT 'pass123'
        );

        CREATE TABLE IF NOT EXISTS Ticket (
            Ticket_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Passenger_ID INT,
            Train_ID INT,
            Booking_Date DATE,
            Seat_Number VARCHAR(10),
            Status VARCHAR(20) DEFAULT 'Booked',
            FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID) ON DELETE CASCADE,
            FOREIGN KEY (Train_ID) REFERENCES Train(Train_ID) ON DELETE CASCADE,
            UNIQUE (Train_ID, Seat_Number)
        );

        CREATE TABLE IF NOT EXISTS Technical_Supervisor (
            Supervisor_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name VARCHAR(100) NOT NULL,
            Contact_Number VARCHAR(15) UNIQUE,
            Assigned_Train_ID INT,
            Password VARCHAR(100) NOT NULL DEFAULT 'pass123',
            FOREIGN KEY (Assigned_Train_ID) REFERENCES Train(Train_ID) ON DELETE SET NULL
        );
    `);
    // Insert sample trains if the table is empty
    const { count } = await dbInstance.get('SELECT COUNT(*) as count FROM Train');
    if (count === 0) {
        await dbInstance.exec(`
            INSERT INTO Train (Train_Name, Source, Destination, Departure_Time, Arrival_Time) VALUES 
            ('Pune – Mumbai Deccan Express', 'Pune', 'Mumbai', '07:15:00', '11:05:00'),
            ('Pune – Mumbai Intercity Express', 'Pune', 'Mumbai', '17:55:00', '21:05:00'),
            ('Pune – Howrah Express', 'Pune', 'Howrah', '06:15:00', '18:20:00'),
            ('Pune – Nagpur Garib Rath Express', 'Pune', 'Nagpur', '17:40:00', '09:25:00'),
            ('Pune – Delhi Jhelum Express', 'Pune', 'Delhi', '17:20:00', '20:45:00'),
            ('Pune – Indore Express', 'Pune', 'Indore', '15:30:00', '08:30:00'),
            ('Pune – Jaipur Superfast Express', 'Pune', 'Jaipur', '15:30:00', '13:40:00'),
            ('Pune – Ahmedabad Duronto Express', 'Pune', 'Ahmedabad', '21:35:00', '06:20:00'),
            ('Pune – Secunderabad Shatabdi Express', 'Pune', 'Secunderabad', '06:00:00', '14:20:00'),
            ('Pune – Hyderabad Express', 'Pune', 'Hyderabad', '14:15:00', '04:00:00'),
            ('Pune – Chennai Express', 'Pune', 'Chennai', '23:50:00', '20:10:00'),
            ('Pune – Kanyakumari Express', 'Pune', 'Kanyakumari', '23:50:00', '11:50:00'),
            ('Pune – Kochuveli Express', 'Pune', 'Kochuveli', '23:50:00', '06:45:00'),
            ('Pune – Bhubaneswar Express', 'Pune', 'Bhubaneswar', '11:15:00', '16:40:00'),
            ('Pune – Patna Express', 'Pune', 'Patna', '20:50:00', '03:45:00'),
            ('Pune – Gorakhpur Express', 'Pune', 'Gorakhpur', '16:15:00', '00:05:00'),
            ('Pune – Lucknow Express', 'Pune', 'Lucknow', '22:00:00', '02:00:00'),
            ('Pune – Varanasi Express', 'Pune', 'Varanasi', '22:00:00', '04:00:00'),
            ('Pune – Bhopal Express', 'Pune', 'Bhopal', '15:15:00', '05:00:00'),
            ('Pune – Surat Express', 'Pune', 'Surat', '20:10:00', '04:15:00'),
            ('Pune – Kolhapur Mahalaxmi Express', 'Pune', 'Kolhapur', '00:10:00', '07:25:00'),
            ('Pune – Solapur Intercity Express', 'Pune', 'Solapur', '08:30:00', '13:00:00'),
            ('Pune – Nanded Express', 'Pune', 'Nanded', '21:35:00', '10:00:00'),
            ('Pune – Amritsar Express', 'Pune', 'Amritsar', '15:15:00', '22:15:00'),
            ('Pune – Chandigarh Express', 'Pune', 'Chandigarh', '15:15:00', '20:20:00'),
            ('Pune – Udaipur Express', 'Pune', 'Udaipur', '17:30:00', '12:20:00'),
            ('Pune – Jodhpur Express', 'Pune', 'Jodhpur', '20:10:00', '15:00:00'),
            ('Pune – Ranchi Express', 'Pune', 'Ranchi', '10:45:00', '16:00:00'),
            ('Pune – Guwahati Express', 'Pune', 'Guwahati', '06:10:00', '08:15:00'),
            ('Pune – Ernakulam Express', 'Pune', 'Ernakulam', '18:45:00', '18:50:00');
        `);
    }


    console.log('Successfully connected to SQLite Database and initialized tables.');
    return dbInstance;
}

// Create a wrapper object that exposes a query method similar to mysql2 promise interface
const db = {
    query: async (sql, params = []) => {
        const database = await initDb();
        // Determine if it's a SELECT query or modifying query (INSERT/UPDATE/DELETE)
        const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA');
        if (isSelect) {
            const rows = await database.all(sql, params);
            return [rows]; // Return rows in an array to match mysql2 destructuring [rows]
        } else {
            const result = await database.run(sql, params);
            // Result has lastID, changes. mysql2 uses insertId.
            return [{ insertId: result.lastID, affectedRows: result.changes }];
        }
    }
};

module.exports = db;
