-- Drop tables if they exist
IF OBJECT_ID('dbo.Account', 'U') IS NOT NULL
    DROP TABLE dbo.Account;

-- NOTE: for membership checking, i plan to use an autonomous function that waits until the 1 year is up
-- store password here or no?

-- ISSUE : email shld be in account or no? sign up using email & passowrd? 
-- i want to tie child's login details to be exact same as parent
-- child shldnt have login details i mean

-- QUESTION : do we need to know when the child's account was created?

-- Create Account table
-- Mainly used for login purposes
CREATE TABLE Account (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-increment primary key
	Email VARCHAR(100) NOT NULL, 
    AccountType VARCHAR(1) CHECK (AccountType IN ('P','A')) NOT NULL, -- Parent, Admin
	CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
	Password VARCHAR(255) NOT NULL -- Hashed password
);

CREATE TABLE Parent (
    ParentID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-increment primary key\
	AccountID INT NOT NULL UNIQUE, 
	FirstName VARCHAR(100) NOT NULL,
	LastName VARCHAR(100) NOT NULL,
	DateOfBirth DATE NOT NULL, -- Parent's date of birth
	Gender VARCHAR(1) CHECK (Gender IN ('M','F')) NOT NULL, -- Male, Female
	ContactNumber NVARCHAR(15) NOT NULL, 
	Membership VARCHAR(1) CHECK (Membership IN('Y','N')) DEFAULT('N') NOT NULL,
	CONSTRAINT FK_Parent_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- NOTE : havent add in Interest yet, not sure how it should work

CREATE TABLE Child (
    ChildID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-increment primary key
	FirstName VARCHAR(100) NOT NULL,
	LastName VARCHAR(100) NOT NULL,
	EmergencyContactNumber NVARCHAR(15) NOT NULL, -- For emergency purposes, can be parent's contact number, up to the parent to set
	School VARCHAR(100) NULL, -- Child could be home-schooled
    DateOfBirth DATE NOT NULL,  -- Child's date of birth
	Gender VARCHAR(1) CHECK (Gender IN ('M','F')) NOT NULL, -- Male, Female
    ParentID INT NOT NULL,  -- Foreign key reference to Parent table
	CONSTRAINT FK_Child_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID) -- Ensure each child belongs to a parent
);

/* i think dont need, do we need to track what admin does?
CREATE TABLE Admin (
	AdminID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-increment primary key
	AccountID INT NOT NULL UNIQUE,
	CONSTRAINT FK_Admin_User FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);
*/

-- what are the programme types?
-- W for Workshop btw

-- what this means is that each programme's beginner, intermediate and advanced have diff IDs
-- i would say its bcuz diff levels have diff durations and stuff so yeah
-- wonder if it can be better?
-- can a programme be $0, free?

CREATE TABLE Programme (
    ProgrammeID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-increment primary key
    ProgrammeName VARCHAR(255) NOT NULL,  -- Programme name (e.g., 'PSLE Power Up Camp')
	Category VARCHAR(1) CHECK(Category IN ('W')) NOT NULL, -- Workshop
	Location VARCHAR(200) NOT NULL, -- If Online, just put "Online", else the physical location
    Description VARCHAR(MAX) NOT NULL,  -- Programme description
    StartDate DATE CHECK(StartDate > GETDATE()) NOT NULL ,  -- Start date of the programme
    EndDate DATE CHECK(EndDate > GETDATE()) NOT NULL,  -- End date of the programme
    Fee DECIMAL(10,2) CHECK(Fee >= 0) NOT NULL, -- Fee for the programme
	MaxSlots INT CHECK(MaxSlots > 0) NOT NULL , -- Maximum intake for the programme
	ProgrammeLevel VARCHAR(1) CHECK(ProgrammeLevel IN ('B','I','A')) NOT NULL, -- Beginner, Intermediate, Advanced
	CHECK(StartDate <=  EndDate),
);

-- NOTE: Created this to allow the 1-1 executive coach talking, if its a workshop, let it be just 1 slot
-- NOTE : maybe can add a check that uponc reation of slot, must be within start and end date of programme.
-- is ON DELETE CASCADE useful?

CREATE TABLE Slot (
	SlotID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-increment primary key
	ProgrammeID INT NOT NULL,
	ParentID INT NULL, -- Either Parent or Child 
	ChildID INT NULL, -- Either Parent or Child 
	StartDateTime DATETIME CHECK(StartDateTime > GETDATE()) NOT NULL, 
	EndDateTime DATETIME CHECK(StartDateTime > GETDATE()) NOT NULL,
	CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
	CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
	CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
	CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL)), -- ensures the slot is for either a child or a parent
);

CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-increment primary key
    ParentID INT NOT NULL,  -- Foreign key reference to Parent table
    ProgrammeID INT NOT NULL,  -- Foreign key reference to Programme table
    Rating INT CHECK(Rating BETWEEN 1 AND 5) NOT NULL,  -- Rating between 1 and 5
    ReviewText VARCHAR(MAX) NULL,  -- Optional review text
    ReviewDate DATE DEFAULT(GETDATE()) NOT NULL,  -- Default to current date
	CONSTRAINT FK_Reviews_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID), -- Ensure valid parent
    CONSTRAINT FK_Reviews_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),  -- Ensure valid programme
);

-- NOTE : im doing a no refund policy system
-- do i need to check that payment amount matches the fee? but what about discounts?
-- this system also only allows payment for 1 slot at a time i think?

CREATE TABLE Payment (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    SlotID INT NOT NULL,  -- Reference to the slot of a programme they are paying for
    PaymentAmount DECIMAL(10,2) CHECK(PaymentAmount > 0) NOT NULL,  -- Positive payment amount
    PaymentDate DATETIME DEFAULT(GETDATE()) NOT NULL,
    PaymentMethod VARCHAR(20) CHECK (PaymentMethod IN ('PayNow')), -- currently only PayNow accepted
    CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID),
);