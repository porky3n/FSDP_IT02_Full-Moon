-- Drop tables if they exist
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Slot;
DROP TABLE IF EXISTS Programme;
DROP TABLE IF EXISTS Child;
DROP TABLE IF EXISTS Parent;
DROP TABLE IF EXISTS Account;

-- Create Account table
CREATE TABLE Account (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    AccountType ENUM('P', 'A') NOT NULL, -- Parent, Admin
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PasswordHashed VARCHAR(255) NOT NULL
);

-- Create Parent table  
CREATE TABLE Parent (
    ParentID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL UNIQUE,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender ENUM('M', 'F') NOT NULL,
    ContactNumber VARCHAR(15) NOT NULL,
    Membership ENUM('Member', 'Non-Member') DEFAULT 'Non-Member' NOT NULL,
    MembershipExpirationDate DATE NULL,
    Dietary TEXT NULL,
    ProfilePictureURL VARCHAR(255) NULL,
    CONSTRAINT FK_Parent_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- Create Child table
CREATE TABLE Child (
    ChildID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    EmergencyContactNumber VARCHAR(15) NOT NULL,
    School VARCHAR(100) NULL,
    DateOfBirth DATE NOT NULL,
    Gender ENUM('M', 'F') NOT NULL,
    Dietary TEXT NULL,
    ParentID INT NOT NULL,
    ProfilePictureURL VARCHAR(255) NULL,
    CONSTRAINT FK_Child_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID)
);

-- Create Programme table
CREATE TABLE Programme (
    ProgrammeID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeName VARCHAR(255) NOT NULL,
    Category ENUM('Workshop') NOT NULL,
    Location VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Fee DECIMAL(10,2) CHECK (Fee >= 0) NOT NULL,
    MaxSlots INT CHECK (MaxSlots > 0) NOT NULL,
    ProgrammeLevel ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    CHECK (EndDate >= StartDate)
);

-- Create Slot table
CREATE TABLE Slot (
    SlotID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL,
    ParentID INT NULL,
    ChildID INT NULL,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
    CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
    CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
    CHECK (EndDateTime > StartDateTime),
    CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL))
);

-- Create Reviews table
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    ParentID INT NOT NULL,
    ProgrammeID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    ReviewText TEXT NULL,
    ReviewDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT FK_Reviews_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
    CONSTRAINT FK_Reviews_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

-- Create Payment table
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    SlotID INT NOT NULL,
    PaymentAmount DECIMAL(10,2) CHECK (PaymentAmount > 0) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PaymentMethod ENUM('PayNow') NOT NULL,
    CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID)
);

-- Create Token table
CREATE TABLE Token (
    TokenID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Token TEXT NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CONSTRAINT FK_Tokens_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);


--Refined
-- Programme Table
CREATE TABLE Programme (
    ProgrammeID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeName VARCHAR(255) NOT NULL,
    Category ENUM('Workshop') NOT NULL,
    Location VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CHECK (EndDate >= StartDate)
);


-- ProgrammeFee Table
CREATE TABLE ProgrammeFee (
    FeeID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL,
    FeeType ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    Price DECIMAL(10,2) CHECK (Price > 0) NOT NULL,
    OriginalPrice DECIMAL(10,2), -- Optional: for discounted prices
    Benefits TEXT, -- List of benefits, stored as text
    MaxSlots INT CHECK (MaxSlots > 0), -- Class size
    CONSTRAINT FK_ProgrammeFee_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

-- ProgrammeSchedule Table
CREATE TABLE ProgrammeSchedule (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL,
    Level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    CONSTRAINT FK_ProgrammeSchedule_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
    CHECK (EndDate >= StartDate)
);


-- Create Slot table (to be refined)
CREATE TABLE Slot (
    SlotID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL,
    ParentID INT NULL,
    ChildID INT NULL,
    ProgrammeSchedule INT NOT NULL,
    CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
    CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
    CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
    CONSTRAINT FK_Slot_ProgrammeSchedule FOREIGN KEY (ProgrammeSchedule) REFERENCES ProgrammeSchedule(ScheduleID),
    CHECK (EndDateTime > StartDateTime),
    CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL))
);

-- Create Payment table
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    SlotID INT NOT NULL,
    PaymentAmount DECIMAL(10,2) CHECK (PaymentAmount > 0) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PaymentMethod ENUM('PayNow') NOT NULL,
    CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID)
);



--mssql
-- Programme Table
-- CREATE TABLE Programme (
--     ProgrammeID INT IDENTITY(1,1) PRIMARY KEY,
--     ProgrammeName VARCHAR(255) NOT NULL,
--     Category VARCHAR(50) NOT NULL CHECK (Category IN ('Workshop')), -- ENUM replacement
--     Location VARCHAR(200) NOT NULL,
--     Description TEXT NOT NULL,
--     StartDate DATE NOT NULL,
--     EndDate DATE NOT NULL,
--     MaxSlots INT CHECK (MaxSlots > 0), -- Class size
--     CHECK (EndDate >= StartDate)
-- );

-- -- ProgrammeFee Table
-- CREATE TABLE ProgrammeFee (
--     FeeID INT IDENTITY(1,1) PRIMARY KEY,
--     ProgrammeID INT NOT NULL,
--     FeeType VARCHAR(50) NOT NULL CHECK (FeeType IN ('Beginner', 'Intermediate', 'Advanced')), -- ENUM replacement
--     Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
--     OriginalPrice DECIMAL(10,2), -- Optional: for discounted prices
--     Benefits TEXT, -- List of benefits, stored as text
--     CONSTRAINT FK_ProgrammeFee_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
-- );

-- -- ProgrammeSchedule Table
-- CREATE TABLE ProgrammeSchedule (
--     ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
--     ProgrammeID INT NOT NULL,
--     Level VARCHAR(50) NOT NULL CHECK (Level IN ('Beginner', 'Intermediate', 'Advanced')), -- ENUM replacement
--     StartDate DATE NOT NULL,
--     EndDate DATE NOT NULL,
--     StartTime TIME NOT NULL,
--     EndTime TIME NOT NULL,
--     MaxSlots INT CHECK (MaxSlots > 0), -- Class size
--     CONSTRAINT FK_ProgrammeSchedule_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
--     CHECK (EndDate >= StartDate)
-- );

-- CREATE TABLE Account (
--     AccountID INT IDENTITY(1,1) PRIMARY KEY,
--     Email VARCHAR(100) NOT NULL UNIQUE,
--     AccountType CHAR(1) NOT NULL CHECK (AccountType IN ('P', 'A')), -- 'P' for Parent, 'A' for Admin
--     CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
--     PasswordHashed VARCHAR(255) NOT NULL
-- );

-- -- Create Parent table  
-- CREATE TABLE Parent (
--     ParentID INT IDENTITY(1,1) PRIMARY KEY,
--     AccountID INT NOT NULL UNIQUE,
--     FirstName VARCHAR(100) NOT NULL,
--     LastName VARCHAR(100) NOT NULL,
--     DateOfBirth DATE NOT NULL,
--     Gender CHAR(1) NOT NULL CHECK (Gender IN ('M', 'F')),
--     ContactNumber VARCHAR(15) NOT NULL,
--     Membership VARCHAR(10) DEFAULT 'Non-Member' NOT NULL CHECK (Membership IN ('Member', 'Non-Member')),
--     MembershipExpirationDate DATE NULL,
--     Dietary TEXT NULL,
--     ProfilePictureURL VARCHAR(255) NULL,
--     CONSTRAINT FK_Parent_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
-- );

-- -- Create Child table
-- CREATE TABLE Child (
--     ChildID INT IDENTITY(1,1) PRIMARY KEY,
--     FirstName VARCHAR(100) NOT NULL,
--     LastName VARCHAR(100) NOT NULL,
--     EmergencyContactNumber VARCHAR(15) NOT NULL,
--     School VARCHAR(100) NULL,
--     DateOfBirth DATE NOT NULL,
--     Gender CHAR(1) NOT NULL CHECK (Gender IN ('M', 'F')),
--     Dietary TEXT NULL,
--     ParentID INT NOT NULL,
--     ProfilePictureURL VARCHAR(255) NULL,
--     CONSTRAINT FK_Child_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID)
-- );


-- -- Slot Table
-- CREATE TABLE Slot (
--     SlotID INT IDENTITY(1,1) PRIMARY KEY,
--     ProgrammeID INT NOT NULL,
--     ParentID INT NULL,
--     ChildID INT NULL,
--     ProgrammeSchedule INT NOT NULL,
--     StartDateTime DATETIME NOT NULL,
--     EndDateTime DATETIME NOT NULL,
--     CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
--     CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
--     CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
--     CONSTRAINT FK_Slot_ProgrammeSchedule FOREIGN KEY (ProgrammeSchedule) REFERENCES ProgrammeSchedule(ScheduleID),
--     CHECK (EndDateTime > StartDateTime),
--     CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL))
-- );

-- -- Payment Table
-- CREATE TABLE Payment (
--     PaymentID INT IDENTITY(1,1) PRIMARY KEY,
--     SlotID INT NOT NULL,
--     PaymentAmount DECIMAL(10,2) NOT NULL CHECK (PaymentAmount > 0),
--     PaymentDate DATETIME DEFAULT GETDATE() NOT NULL,
--     PaymentMethod VARCHAR(50) NOT NULL CHECK (PaymentMethod IN ('PayNow')), -- ENUM replacement
--     CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID)
-- );


-- dummy data
-- Insert dummy data into Account table
INSERT INTO Account (Email, AccountType, CreatedAt, PasswordHashed)
VALUES 
    ('parent1@example.com', 'P', GETDATE(), 'hashedpassword1'),
    ('parent2@example.com', 'P', GETDATE(), 'hashedpassword2'),
    ('admin@example.com', 'A', GETDATE(), 'hashedpassword3');

-- Insert dummy data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, MembershipExpirationDate, Dietary, ProfilePictureURL)
VALUES 
    (1, 'John', 'Doe', '1980-01-01', 'M', '1234567890', 'Member', '2025-01-01', 'Vegan', 'profile1.jpg'),
    (2, 'Jane', 'Smith', '1985-05-15', 'F', '0987654321', 'Non-Member', NULL, 'None', 'profile2.jpg'),
    (3, 'Admin', 'User', '1975-12-25', 'M', '1122334455', 'Member', '2026-12-25', NULL, 'admin.jpg');

-- Insert dummy data into Child table
INSERT INTO Child (FirstName, LastName, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePictureURL)
VALUES 
    ('Emily', 'Doe', '1234567890', 'School A', '2010-06-01', 'F', 'Gluten-Free', 1, 'child1.jpg'),
    ('Michael', 'Smith', '0987654321', 'School B', '2012-09-15', 'M', 'Dairy-Free', 2, 'child2.jpg'),
    ('Alex', 'Doe', '1234567890', 'School A', '2011-11-21', 'M', NULL, 1, 'child3.jpg');

-- Insert dummy data into Programme table
INSERT INTO Programme (ProgrammeName, Category, Location, Description, StartDate, EndDate, MaxSlots)
VALUES 
    ('Coding Workshop', 'Workshop', 'Location A', 'Introductory coding workshop for kids', '2025-01-01', '2025-01-05', 20),
    ('Art Workshop', 'Workshop', 'Location B', 'Creative art workshop for kids', '2025-02-10', '2025-02-12', 15),
    ('Math Workshop', 'Workshop', 'Location C', 'Fun math games and challenges', '2025-03-15', '2025-03-18', 10);

-- Insert dummy data into ProgrammeFee table
INSERT INTO ProgrammeFee (ProgrammeID, FeeType, Price, OriginalPrice, Benefits)
VALUES 
    (1, 'Beginner', 50.00, 60.00, 'Free snacks, Certificate'),
    (2, 'Intermediate', 80.00, 90.00, 'Art supplies included'),
    (3, 'Advanced', 100.00, 120.00, 'Advanced materials, T-shirt');

-- Insert dummy data into ProgrammeSchedule table
INSERT INTO ProgrammeSchedule (ProgrammeID, Level, StartDate, EndDate, StartTime, EndTime, MaxSlots)
VALUES 
    (1, 'Beginner', '2025-01-01', '2025-01-05', '09:00:00', '12:00:00', 20),
    (2, 'Intermediate', '2025-02-10', '2025-02-12', '10:00:00', '13:00:00', 15),
    (3, 'Advanced', '2025-03-15', '2025-03-18', '14:00:00', '17:00:00', 10);

-- Insert dummy data into Slot table
INSERT INTO Slot (ProgrammeID, ParentID, ChildID, ProgrammeSchedule, StartDateTime, EndDateTime)
VALUES 
    (1, 1, 1, 1, '2024-01-01 09:00:00', '2024-01-01 12:00:00'),
    (2, 2, 2, 2, '2024-02-10 10:00:00', '2024-02-10 13:00:00'),
    (3, 1, 3, 3, '2024-03-15 14:00:00', '2024-03-15 17:00:00');

-- Insert dummy data into Payment table
INSERT INTO Payment (SlotID, PaymentAmount, PaymentDate, PaymentMethod)
VALUES 
    (1, 50.00, GETDATE(), 'PayNow'),
    (2, 80.00, GETDATE(), 'PayNow'),
    -- (3, 100.00, GETDATE(), 'PayNow');


/*
INSERT INTO Slot (ProgrammeID, ParentID, ChildID, ProgrammeSchedule, StartDateTime, EndDateTime)
VALUES (1, NULL, 1, 1, '2025-11-01 10:00:00', '2025-11-01 12:00:00'); -- Child booking

INSERT INTO Slot (ProgrammeID, ParentID, ChildID, ProgrammeSchedule, StartDateTime, EndDateTime)
VALUES (2, 1, NULL, 2, '2025-11-02 10:00:00', '2025-11-02 12:00:00'); -- Parent booking
*/


