-- Insert data into Account table
INSERT INTO Account (Email, PasswordHashed, AccountType, CreatedAt) 
VALUES 
('parent1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('parent2@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('admin1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'A', NOW());

-- Insert data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, MembershipExpirationDate, Dietary, ProfilePictureURL)
VALUES 
(1, 'John', 'Doe', '1980-05-10', 'M', '1234567890', 'Member', '2024-05-10', 'No beef', 'profile-pictures/user-1.jpg'),
(2, 'Jane', 'Smith', '1985-03-22', 'F', '0987654321', 'Non-Member', NULL, 'Vegetarian', 'profile-pictures/user-2.jpg');

-- Insert data into Child table
INSERT INTO Child (FirstName, LastName, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePictureURL)
VALUES 
('Jack', 'Doe', '1234567890', 'Greenwood School', '2010-09-15', 'M', 'None', 1, 'profile-pictures/child-1.jpg'), -- naming based childID
('Ella', 'Smith', '0987654321', 'Bluebell Academy', '2012-12-05', 'F', 'Dairy-Free', 2, 'profile-pictures/child-2.jpg');

-- Insert data into Programme table
INSERT INTO Programme (ProgrammeName, Category, ProgrammePictureURL, Description)
VALUES 
('Coding Workshop', 'Workshop', 'programme-pictures/programme-1.jpg', 'A hands-on workshop teaching basic coding skills.'),
('Art Camp', 'Camp', 'programme-pictures/programme-2.png', 'An immersive art camp for young artists.');

-- Insert data into ProgrammeClass table
INSERT INTO ProgrammeClass (ProgrammeClassID, ProgrammeID, ShortDescription, Location, Fee, MaxSlots, ProgrammeLevel, Remarks)
VALUES 
(1, 1, 'Intro to Programming', 'Online', 50.00, 30, 'Beginner', 'Materials are provided ~ Online-only ~ Interactive sessions'),
(2, 2, 'Painting Basics', 'Community Center', 75.00, 20, 'Intermediate', 'Materials provided ~ Lunch included');

-- Insert data into ProgrammeClassBatch table
INSERT INTO ProgrammeClassBatch (ProgrammeClassID, ProgrammeID)
VALUES 
(1, 1),
(2, 2);

-- Insert data into ProgrammeSchedule table
INSERT INTO ProgrammeSchedule (InstanceID, StartDateTime, EndDateTime)
VALUES 
(1, '2024-02-01 09:00:00', '2024-02-01 12:00:00'),
(1, '2024-02-03 09:00:00', '2024-02-03 12:00:00'),
(2, '2024-02-10 10:00:00', '2024-02-10 16:00:00');

-- Insert data into ProgrammeImages table
INSERT INTO ProgrammeImages (ProgrammeID, ImageURL)
VALUES 
(1, 'programme-images/programme-1-content-1.png'),
(2, 'programme-images/programme-2-content-1.jpg');

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

-- Insert data into Payment table
INSERT INTO Payment (SlotID, PaymentAmount, PaymentDate, PaymentMethod, PaymentImage)
VALUES 
(1, 50.00, NOW(), 'PayNow', 'payment-upload/payment-1.jpg'),
(2, 75.00, NOW(), 'PayNow', 'payment-upload/payment-2.jpg');