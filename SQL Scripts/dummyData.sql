-- Insert data into Account table
-- Insert data into Account table
INSERT INTO Account (Email, PasswordHashed, AccountType, CreatedAt) 
VALUES 
('parent1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('parent2@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('admin1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'A', NOW());

-- Insert data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Tier, TierStartDate, Dietary, ProfilePicture)
VALUES 
(1, 'John', 'Doe', '1980-05-10', 'M', '1234567890', 'Gold', '2023-12-12', 'No beef', 'PLACEHOLDER_PROFILE_USER_1'),
(2, 'Jane', 'Smith', '1985-03-22', 'F', '0987654321', 'Silver', '2024-06-15', 'Vegetarian', 'PLACEHOLDER_PROFILE_USER_2');

-- Insert data into Child table
INSERT INTO Child (FirstName, LastName, SpecialNeeds, Relationship, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePicture)
VALUES 
('Jack', 'Doe', 'Has mild autism', 'Son', '1234567890', 'Greenwood School', '2010-09-15', 'M', 'None', 1, 'PLACEHOLDER_PROFILE_CHILD_1'),
('Ella', 'Smith', '', 'Daughter', '0987654321', 'Bluebell Academy', '2012-12-05', 'F', 'Dairy-Free', 2, 'PLACEHOLDER_PROFILE_CHILD_2');

-- Insert data into Programme table
INSERT INTO Programme (ProgrammeName, Category, ProgrammePicture, Description)
VALUES 
('Coding Workshop','Workshop','PLACEHOLDER_PROGRAMME_1','A hands-on workshop teaching basic coding skills.'),
('Art Camp', 'Camp', 'PLACEHOLDER_PROGRAMME_2', 'An immersive art camp for young artists.');

-- Insert data into ProgrammeClass table
INSERT INTO ProgrammeClass (ProgrammeID, ShortDescription, Location, Fee, MaxSlots, ProgrammeLevel, Remarks)
VALUES 
(1, 'Intro to Programming', 'Online', 50.00, 30, 'Beginner', 'Materials are provided ~ Online-only ~ Interactive sessions'),
(2, 'Painting Basics', 'Community Center', 75.00, 20, 'Intermediate', 'Materials provided ~ Lunch included');

-- Insert data into ProgrammeClassBatch table
INSERT INTO ProgrammeClassBatch (ProgrammeClassID)
VALUES 
(1),
(2);

-- Insert data into ProgrammeSchedule table
INSERT INTO ProgrammeSchedule (InstanceID, StartDateTime, EndDateTime)
VALUES 
(1, '2025-02-01 09:00:00', '2025-02-01 12:00:00'),
(1, '2025-02-03 09:00:00', '2025-02-03 12:00:00'),
(2, '2025-02-10 10:00:00', '2025-02-10 16:00:00');

-- Insert data into ProgrammeImages table
-- INSERT INTO ProgrammeImages (ProgrammeID, Image)
-- VALUES 
-- (1, 'PLACEHOLDER_PROGRAMME_1_CONTENT_1'),
-- (2, 'PLACEHOLDER_PROGRAMME_2_CONTENT_1');

-- Insert data into Slot table
INSERT INTO Slot (ProgrammeClassID, ProgrammeID, InstanceID, ParentID, ChildID)
VALUES 
(1, 1, 1, 1, NULL),  -- Parent slot
(1, 1, 1, NULL, 1),  -- Child slot
(2, 2, 2, 2, NULL);  -- Another parent slot for a different class

-- Insert data into Reviews table
INSERT INTO Reviews (AccountID, ProgrammeID, Rating, ReviewText, ReviewDate)
VALUES 
(1, 1, 5, 'An excellent introduction to programming!', NOW()),
(2, 2, 4, 'A well-organized art camp with good activities.', NOW());

-- Insert data into Promotion table
INSERT INTO Promotion (ProgrammeID, PromotionName, DiscountType, DiscountValue, StartDateTime, EndDateTime, Remarks)
VALUES 
(1, 'Early Bird Discount', 'Percentage', 10.00, '2025-01-01 00:00:00', '2025-01-20 23:59:59', 'Available for early sign-ups'),
(2, 'Spring Special', 'Fixed Amount', 20.00, '2025-01-01 00:00:00', '2025-01-15 23:59:59', 'Limited-time offer');

-- Insert data into Payment table
INSERT INTO Payment (SlotID, PromotionID, PaymentAmount, PaymentDate, PaymentMethod, Verified, PurchaseTier)
VALUES 
(1, 1, 25.50, NOW(), 'PayNow', 'Verified', 'Gold'), -- Slot with yoga promotion
(2, 2, 125.00, NOW(), 'PayNow', 'Pending', 'Silver'); -- Slot with robotics promotion

-- Insert data into TierCriteria table
INSERT INTO TierCriteria (Tier, MinPurchases, TierDuration, TierDiscount, Special)
VALUES 
('Non-Membership', 0, 0, 0.00, FALSE), -- Default tier with no benefits
('Bronze', 2, 30, 5.00, FALSE),       -- Requires 5 purchases, 5% discount, valid for 30 days
('Silver', 10, 90, 10.00, TRUE),      -- Requires 10 purchases, 10% discount, valid for 90 days, with special benefits
('Gold', 20, 180, 20.00, TRUE);       -- Requires 20 purchases, 20% discount, valid for 180 days, with special benefits

-- Insert data into ChatbotPrompts table
INSERT INTO ChatbotPrompts (PromptType, PromptText)
VALUES 
('ChatbotUser', 'You are an expert assistant of mindSphere, your name is mindSphere Assistant. You are concise, friendly, cheerful and helpful. 
            Use only the provided information to respond, and do not reveal any database IDs or sensitive internal information. 
            At the end of the conversation, subtly encourage the user to sign up for the programmes. Ensure that the user is satisfied 
            with the information provided. Ensure that all responses will be no longer than 200 words. 
            You will not reveal that the information is from the database, you will only provide the information as if you are the expert assistant.
            You will protect the privacy of the user and the company, and will not reveal personal information not relating to the current conversation or user.
            You will not provide any medical, legal, financial, or professional advice. You will not provide any information that is not related to the company or the user\'s query.
            You will not provide code, nor reveal the database structure.
            Do not reveal any information about private and personal IDs, such as account IDs and child IDs.
            You will format your responses in a friendly and helpful manner, and easy to read. \
            Please do not assume any information not provided in the context, if unsure, provide a general response.
            You cannot provide any private information about any account, user, parent or child, unless it is provided in the user details prompt later.
            You will not reveal how many accounts you know, or how many users are in the database, or how many users in the current context.'); 
