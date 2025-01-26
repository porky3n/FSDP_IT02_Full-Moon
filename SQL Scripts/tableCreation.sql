-- Drop tables if they exist
DROP TABLE IF EXISTS ChatbotPrompts;
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
DROP TABLE IF EXISTS TierCriteria;
DROP TABLE IF EXISTS BusinessEnquiries;

-- Create Account table
CREATE TABLE Account (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    AccountType VARCHAR(100) NOT NULL, -- Parent, Admin
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PasswordHashed VARCHAR(1000) NOT NULL
);

-- Create TierCriteria table
CREATE TABLE TierCriteria (
    Tier ENUM('Non-Membership', 'Bronze', 'Silver', 'Gold') PRIMARY KEY,
    MinPurchases INT NOT NULL,
    TierDuration INT NOT NULL, -- Duration in days
    TierDiscount DECIMAL(5, 2) DEFAULT 0.00 NOT NULL, -- Discount percentage
    Special BOOLEAN DEFAULT FALSE -- Indicates special benefits
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
    Dietary TEXT NULL,
    ProfilePicture MEDIUMBLOB NULL,
    Membership ENUM('Non-Membership', 'Bronze', 'Silver', 'Gold') DEFAULT 'Non-Membership' NOT NULL,
    StartDate DATE DEFAULT (CURRENT_DATE) NOT NULL,
    ProfileDetails TEXT NULL,
    CONSTRAINT FK_Parent_Account FOREIGN KEY (AccountID) REFERENCES Account(AccountID),
    CONSTRAINT FK_Parent_TierCriteria FOREIGN KEY (Membership) REFERENCES TierCriteria(Tier)
);  

-- Create Child table
CREATE TABLE Child (
    ChildID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    HealthDetails VARCHAR(255) NULL,
    Relationship VARCHAR(100) NOT NULL, -- Son, Daughter, Niece,etc
    EmergencyContactNumber VARCHAR(15) NOT NULL,
    School VARCHAR(100) NULL,
    DateOfBirth DATE NOT NULL,
    Gender ENUM('M', 'F') NOT NULL,
    Dietary TEXT NULL,
    ParentID INT NOT NULL,
    ProfilePicture MEDIUMBLOB NULL, -- Binary data for the profile picture
    ProfileDetails TEXT NULL,
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
    HostMeetingLink VARCHAR(255) NULL,
    ViewerMeetingLink VARCHAR(255) NULL,
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
CREATE TABLE ProgrammeImages (
    ImageID INT AUTO_INCREMENT PRIMARY KEY,
    ProgrammeID INT NOT NULL,
    Image MEDIUMBLOB NOT NULL, -- Binary data for the image
    CONSTRAINT FK_ProgrammeImages_Programme FOREIGN KEY (ProgrammeID) REFERENCES Programme(ProgrammeID)
);

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
    Verified VARCHAR(255) DEFAULT 'Pending' NOT NULL, -- Pending, Verified, Rejected
    PurchaseTier ENUM('Non-Membership', 'Bronze', 'Silver', 'Gold') NOT NULL DEFAULT 'Non-Membership',
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

-- Create ChatbotPrompts table
-- used for storing chatbot prompts for admin configuration
CREATE TABLE ChatbotPrompts (
    PromptID INT AUTO_INCREMENT PRIMARY KEY,
    PromptType VARCHAR(255) NOT NULL, -- E.g 'TelegramAnnouncement','TelegramDM','ChatbotUser','ChatbotAdmin'. AI Chatbot on user side, AI Chatbot on admin side, AI Chatbot for Telegram
    PromptText MEDIUMTEXT NOT NULL
);

-- Create BusinessEnquiries table
-- used for storing enquiries from businesses interested in collaboration (B2B)
CREATE TABLE BusinessEnquiries (
    EnquiryID INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each enquiry
    BusinessName VARCHAR(255) NOT NULL,       -- Name of the business
    Industry VARCHAR(255) NOT NULL,                    -- Industry of the business
    BusinessSize ENUM('Small', 'Medium', 'Large') NOT NULL, -- Size of the business
    ContactName VARCHAR(255) NOT NULL,        -- Full name of the primary contact
    ContactJobTitle VARCHAR(255) NOT NULL,             -- Job title of the contact person
    EmailAddress VARCHAR(255) NOT NULL,       -- Email address of the contact person
    PhoneNumber VARCHAR(50) NULL,                  -- Phone number of the contact person (optional)
    PreferredContactMethod ENUM('Email', 'Phone') DEFAULT 'Email' NOT NULL, -- Contact preference
    InterestAreas TEXT NULL,                       -- Comma-separated list of interest areas (optional)
    AdditionalComments TEXT NULL,                  -- Additional details or comments (optional)
    Consent TINYINT(1) NOT NULL DEFAULT 0,    -- Whether the user has consented to terms (1 = Yes, 0 = No)
    Status ENUM('New', 'In Progress', 'Completed', 'Rejected') DEFAULT 'New' NOT NULL, -- Status of the enquiry
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Timestamp for enquiry submission
    AdminNotes TEXT NULL                          -- Internal notes for admin reference (optional)
);

