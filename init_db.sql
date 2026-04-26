-- CREATE DATABASE
-- SQLite does not use CREATE DATABASE. The file is created automatically.
-- CREATE DATABASE TrainManagementSystem;
-- USE TrainManagementSystem;

---------------------------------------------------
-- TRAIN TABLE
CREATE TABLE Train (
    Train_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Train_Name VARCHAR(100) NOT NULL,
    Source VARCHAR(100),
    Destination VARCHAR(100),
    Departure_Time TIME,
    Arrival_Time TIME
);

---------------------------------------------------
-- PASSENGER TABLE
CREATE TABLE Passenger (
    Passenger_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(100) NOT NULL,
    Age INT,
    Gender VARCHAR(10),
    Contact_Number VARCHAR(15)
);

---------------------------------------------------
-- TICKET TABLE
CREATE TABLE Ticket (
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

---------------------------------------------------
-- TECHNICAL SUPERVISOR TABLE
CREATE TABLE Technical_Supervisor (
    Supervisor_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(100) NOT NULL,
    Contact_Number VARCHAR(15),
    Assigned_Train_ID INT,
    
    FOREIGN KEY (Assigned_Train_ID) REFERENCES Train(Train_ID) ON DELETE SET NULL
);

---------------------------------------------------
-- SAMPLE DATA INSERT

-- Train Data
INSERT INTO Train (Train_Name, Source, Destination, Departure_Time, Arrival_Time)
VALUES 
('Express 101', 'Pune', 'Mumbai', '08:00:00', '12:00:00'),
('Superfast 202', 'Delhi', 'Agra', '09:30:00', '11:30:00');

-- Passenger Data
INSERT INTO Passenger (Name, Age, Gender, Contact_Number)
VALUES 
('Rahul Sharma', 25, 'Male', '9876543210'),
('Priya Patil', 22, 'Female', '9123456780');

-- Ticket Data
INSERT INTO Ticket (Passenger_ID, Train_ID, Booking_Date, Seat_Number, Status)
VALUES 
(1, 1, '2026-04-26', 'A1', 'Booked'),
(2, 2, '2026-04-26', 'B2', 'Booked');

-- Technical Supervisor Data
INSERT INTO Technical_Supervisor (Name, Contact_Number, Assigned_Train_ID)
VALUES 
('Suresh Kumar', '9000000001', 1),
('Anita Desai', '9000000002', 2);
