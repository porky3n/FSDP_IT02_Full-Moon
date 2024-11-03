-- Drop tables if they exist
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Slot;
DROP TABLE IF EXISTS ProgrammeMeals;
DROP TABLE IF EXISTS ProgrammeSchedule;
DROP TABLE IF EXISTS ProgrammeClass;
DROP TABLE IF EXISTS ProgrammeDetails;
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
    PasswordHashed VARCHAR(1000) NOT NULL
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
    Category TEXT NOT NULL, -- seper
    ProgrammePictureURL TEXT NULL,
    Description TEXT NOT NULL
);

-- Create ProgrammeClass table
CREATE TABLE ProgrammeClass (
    ProgrammeClassID INT, -- Class 1, Class 2, etc.
    ProgrammeID INT, 
    Location VARCHAR(200) NOT NULL, -- if it's online, can be the link to the online class
    Fee DECIMAL(10,2) CHECK (Fee >= 0) NOT NULL, -- allows for free classes given that the company wants to give back to the community / promotions
    MaxSlots INT CHECK (MaxSlots > 0) NOT NULL,
    ProgrammeLevel ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    Remarks TEXT NULL, -- any additional information, seperated by '~' 
    CONSTRAINT PK_ProgrammeClass PRIMARY KEY (ProgrammeClassID, ProgrammeID),
    CONSTRAINT FK_ProgrammeClass_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

-- Create ProgrammeSchedule table
CREATE TABLE ProgrammeSchedule (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeClassID INT NOT NULL,
    ProgrammeID INT NOT NULL,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    CONSTRAINT FK_ProgrammeSchedule_ProgrammeClass FOREIGN KEY (ProgrammeClassID, ProgrammeID) REFERENCES ProgrammeClass(ProgrammeClassID, ProgrammeID),
    CHECK (EndDateTime > StartDateTime)
);

-- Create ProgrammeMeals table
CREATE TABLE ProgrammeMeals (
    ProgrammeClassID INT NOT NULL,
    ProgrammeID INT NOT NULL,
    Breakfast BOOLEAN DEFAULT FALSE,
    Lunch BOOLEAN DEFAULT FALSE,
    Dinner BOOLEAN DEFAULT FALSE,
    Remarks TEXT NULL, -- any additional information, seperated by '~' 
    CONSTRAINT FK_ProgrammeMeals_ProgrammeClass FOREIGN KEY (ProgrammeClassID, ProgrammeID) REFERENCES ProgrammeClass(ProgrammeClassID, ProgrammeID)
);

-- Create Slot table
-- Created when user books a slot for a class of a programme
CREATE TABLE Slot (
    SlotID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeClassID INT NOT NULL,
    ProgrammeID INT NOT NULL,
    ParentID INT NULL,
    ChildID INT NULL,
    CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeClassID, ProgrammeID) REFERENCES ProgrammeClass(ProgrammeClassID, ProgrammeID),
    CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
    CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
    CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL)) -- ensures that user is either a parent or a child
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
    PaymentMethod VARCHAR(255) NOT NULL,
    CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID)
);

-- Create Token table
-- delete token after it expires or if a newer token is generated
CREATE TABLE Token (
    TokenID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Token TEXT NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CONSTRAINT FK_Tokens_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);