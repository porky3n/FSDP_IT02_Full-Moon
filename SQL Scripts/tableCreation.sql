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
