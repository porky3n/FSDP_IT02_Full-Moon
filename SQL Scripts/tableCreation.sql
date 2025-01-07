-- Drop tables if they exist
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Promotion;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Slot;
DROP TABLE IF EXISTS ProgrammeImages;
DROP TABLE IF EXISTS ProgrammeSchedule;
DROP TABLE IF EXISTS ProgrammeClassBatch;
DROP TABLE IF EXISTS ProgrammeClass;
DROP TABLE IF EXISTS Programme;
DROP TABLE IF EXISTS Child;
DROP TABLE IF EXISTS Parent;
DROP TABLE IF EXISTS Account;

-- Create Account table
CREATE TABLE Account (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    AccountType VARCHAR(100) NOT NULL, -- Parent, Admin
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
    ProfilePicture MEDIUMBLOB NULL,
    CONSTRAINT FK_Parent_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- Create Child table
CREATE TABLE Child (
    ChildID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    SpecialNeeds VARCHAR(255) NULL,
    Relationship VARCHAR(100) NOT NULL, -- Son, Daughter, Niece,etc
    EmergencyContactNumber VARCHAR(15) NOT NULL,
    School VARCHAR(100) NULL,
    DateOfBirth DATE NOT NULL,
    Gender ENUM('M', 'F') NOT NULL,
    Dietary TEXT NULL,
    ParentID INT NOT NULL,
    ProfilePicture MEDIUMBLOB NULL, -- Binary data for the profile picture
    CONSTRAINT FK_Child_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID)
);

-- Create Programme table
CREATE TABLE Programme (
    ProgrammeID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeName VARCHAR(255) NOT NULL,
    Category TEXT NOT NULL, -- "Workshop", "Camp", etc
    ProgrammePicture MEDIUMBLOB NULL, -- Binary data for the programme picture
    Description TEXT NOT NULL
);

-- Create ProgrammeClass table
CREATE TABLE ProgrammeClass (
    ProgrammeClassID INT AUTO_INCREMENT PRIMARY KEY, -- Class 1, Class 2, etc.
    ProgrammeID INT, 
    ShortDescription TEXT NOT NULL, -- Short description of the class
    Location VARCHAR(200) NOT NULL, -- if it's online, can be the link to the online class
    Fee DECIMAL(10,2) CHECK (Fee >= 0) NOT NULL, -- allows for free classes given that the company wants to give back to the community / promotions
    MaxSlots INT CHECK (MaxSlots > 0) NOT NULL,
    ProgrammeLevel VARCHAR(100) NOT NULL, -- Beginner, Intermediate, Advanced, Lite, etc
    Remarks TEXT NULL, -- any additional information, seperated by '~', e.g "Materials are provided ~ Lunch is provided"
    CONSTRAINT FK_ProgrammeClass_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

-- Create ProgrammeClassBatch table
-- This table is used to store the different instances of the same class
CREATE TABLE ProgrammeClassBatch (
    ProgrammeClassID INT NOT NULL,
    InstanceID INT AUTO_INCREMENT PRIMARY KEY,
    CONSTRAINT FK_ProgrammeClassBatch_ProgrammeClass FOREIGN KEY (ProgrammeClassID) REFERENCES ProgrammeClass(ProgrammeClassID)
);

-- Create ProgrammeSchedule table
-- This table is used to store the schedule of the class, for each day and in lieu of non-conseuctive programme dates
CREATE TABLE ProgrammeSchedule (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    InstanceID INT NOT NULL, -- Identifies a unique instance/batch of the same class
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    CONSTRAINT FK_ProgrammeSchedule_ProgrammeClassBatch FOREIGN KEY (InstanceID) REFERENCES ProgrammeClassBatch(InstanceID),
    CHECK (EndDateTime > StartDateTime)
);

-- Create ProgrammeImages table for the content of the programme
-- CREATE TABLE ProgrammeImages (
--     ImageID INT AUTO_INCREMENT PRIMARY KEY,
--     ProgrammeID INT NOT NULL,
--     Image MEDIUMBLOB NOT NULL, -- Binary data for the image
--     CONSTRAINT FK_ProgrammeImages_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
-- );

-- Create Slot table
-- Created when user books a slot for a class of a programme
CREATE TABLE Slot (
    SlotID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeClassID INT NOT NULL,
    ProgrammeID INT NOT NULL,
    InstanceID INT NOT NULL,
    ParentID INT NULL,
    ChildID INT NULL,
    CONSTRAINT FK_Slot_Programme FOREIGN KEY (ProgrammeClassID) REFERENCES ProgrammeClass(ProgrammeClassID),
    CONSTRAINT FK_Slot_ProgrammeID FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
    CONSTRAINT FK_Slot_Parent FOREIGN KEY (ParentID) REFERENCES Parent(ParentID),
    CONSTRAINT FK_Slot_Child FOREIGN KEY (ChildID) REFERENCES Child(ChildID),
    CONSTRAINT FK_Slot_ProgrammeClassBatch FOREIGN KEY (InstanceID) REFERENCES ProgrammeClassBatch(InstanceID),
    CHECK ((ParentID IS NOT NULL AND ChildID IS NULL) OR (ParentID IS NULL AND ChildID IS NOT NULL)) -- ensures that user is either a parent or a child
);

-- Create Reviews table
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL, -- allows for future implementation of reviews by new account types
    ProgrammeID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    ReviewText TEXT NULL,
    ReviewDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT FK_Reviews_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID), -- to allow future account types to review
    CONSTRAINT FK_Reviews_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

-- Create Promotion table
-- Promotion is linked to a specific programme
CREATE TABLE Promotion (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL, -- Links the promotion to a specific programme
    PromotionName VARCHAR(255) NOT NULL, -- Name of the promotion
    DiscountType ENUM('Percentage', 'Fixed Amount') NOT NULL, -- Type of discount
    DiscountValue DECIMAL(10,2) CHECK (DiscountValue > 0) NOT NULL, -- The value of the discount
    StartDateTime DATETIME NOT NULL, -- When the promotion starts
    EndDateTime DATETIME NOT NULL, -- When the promotion ends
    Remarks TEXT NULL, -- Any additional information related to the promotion
    CONSTRAINT FK_Promotion_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID),
    CHECK (EndDateTime > StartDateTime) -- Ensure that the end date is after the start date
);

-- Create Payment table
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    SlotID INT NOT NULL,
    PromotionID INT NULL, -- Promotion code used for the payment
    PaymentAmount DECIMAL(10,2) CHECK (PaymentAmount > 0) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PaymentMethod VARCHAR(255) NOT NULL, -- PayNow for now,
    PaymentImage MEDIUMBLOB NOT NULL, -- Binary data for the payment image
    Verified VARCHAR(255) DEFAULT 'Pending' NOT NULL, -- Pending, Verified, Rejected
    CONSTRAINT FK_Payment_Slot FOREIGN KEY (SlotID) REFERENCES Slot(SlotID),
    CONSTRAINT FK_Payment_Promotion FOREIGN KEY (PromotionID) REFERENCES Promotion(PromotionID)
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
