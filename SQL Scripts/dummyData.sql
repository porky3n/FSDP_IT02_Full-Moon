-- Insert data into Account table
-- Insert data into Account table
INSERT INTO Account (Email, PasswordHashed, AccountType, CreatedAt) 
VALUES 
('parent1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('parent2@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('admin1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'A', NOW());

-- Insert data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, MembershipExpirationDate, Dietary, ProfilePicture)
VALUES 
(1, 'John', 'Doe', '1980-05-10', 'M', '1234567890', 'Member', '2024-12-12', 'No beef', 'PLACEHOLDER_PROFILE_USER_1'),
(2, 'Jane', 'Smith', '1985-03-22', 'F', '0987654321', 'Non-Member', NULL, 'Vegetarian', 'PLACEHOLDER_PROFILE_USER_2');

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
(1, '2024-02-01 09:00:00', '2024-02-01 12:00:00'),
(1, '2024-02-03 09:00:00', '2024-02-03 12:00:00'),
(2, '2024-02-10 10:00:00', '2024-02-10 16:00:00');

-- Insert data into ProgrammeImages table
INSERT INTO ProgrammeImages (ProgrammeID, Image)
VALUES 
(1, 'PLACEHOLDER_PROGRAMME_1_CONTENT_1');
(2, 'PLACEHOLDER_PROGRAMME_2_CONTENT_1');

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
(1, 'Early Bird Discount', 'Percentage', 10.00, '2024-01-01 00:00:00', '2024-01-20 23:59:59', 'Available for early sign-ups'),
(2, 'Spring Special', 'Fixed Amount', 20.00, '2024-03-01 00:00:00', '2024-03-15 23:59:59', 'Limited-time offer');

-- Insert data into Payment table
INSERT INTO Payment (SlotID, PromotionID, PaymentAmount, PaymentDate, PaymentMethod, PaymentImage)
VALUES 
(1, 1, 45.00, NOW(), 'PayNow', 'PLACEHOLDER_PAYMENT_1'), -- Slot with promotion
(2, NULL, 75.00, NOW(), 'PayNow', "PLACEHOLDER_PAYMENT_2"); -- Slot without promotion
