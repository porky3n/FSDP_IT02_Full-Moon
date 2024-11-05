-- CREATE DATABASE FSDP;
-- USE FSDP;

-- -- Create the test table
-- CREATE TABLE test (
--     id INT PRIMARY KEY IDENTITY(1,1),
--     name NVARCHAR(50) NOT NULL,
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- Insert dummy data into the test table
-- INSERT INTO test (name) VALUES ('John Doe');
-- INSERT INTO test (name) VALUES ('Jane Smith');
-- INSERT INTO test (name) VALUES ('Alice Johnson');
-- INSERT INTO test (name) VALUES ('Bob Brown');
-- INSERT INTO test (name) VALUES ('Charlie Davis');

-- Insert dummy data into Account table
-- INSERT INTO Account (Email, AccountType, PasswordHashed) VALUES
-- ('parent1@example.com', 'P', 'hashedpassword1'),
-- ('parent2@example.com', 'P', 'hashedpassword2'),
-- ('admin1@example.com', 'A', 'hashedpassword3'),
-- ('parent3@example.com', 'P', 'hashedpassword4'),
-- ('parent4@example.com', 'P', 'hashedpassword5');

-- Insert dummy data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, MembershipExpirationDate, Dietary, ProfilePictureURL) VALUES
(1, 'John', 'Doe', '1980-01-01', 'M', '1234567890', 'Member', '2025-01-01', 'None', 'http://example.com/pictures/johndoe.jpg'),
(2, 'Jane', 'Smith', '1985-05-05', 'F', '0987654321', 'Non-Member', NULL, 'Vegetarian', 'http://example.com/pictures/janesmith.jpg');
-- (3, 'Mike', 'Johnson', '1990-07-15', 'M', '1122334455', 'Member', '2024-12-31', 'None', 'http://example.com/pictures/mikejohnson.jpg'),
-- (4, 'Emily', 'Davis', '1992-03-10', 'F', '2233445566', 'Non-Member', NULL, 'Vegan', 'http://example.com/pictures/emilydavis.jpg'),
-- (5, 'Alice', 'Wilson', '1988-09-20', 'F', '3344556677', 'Member', '2025-09-20', 'None', 'http://example.com/pictures/alicewilson.jpg');

-- Insert dummy data into Child table
INSERT INTO Child (FirstName, LastName, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePictureURL) VALUES
('Chris', 'Doe', '1234567890', 'School A', '2010-01-01', 'M', 'None', 1, 'http://example.com/pictures/chrisdoe.jpg'),
('Laura', 'Smith', '0987654321', 'School B', '2012-02-02', 'F', 'Vegetarian', 2, 'http://example.com/pictures/laurasmith.jpg'),
('Tom', 'Johnson', '1122334455', 'School C', '2011-03-03', 'M', 'None', 1, 'http://example.com/pictures/tomjohnson.jpg'),
('Sophia', 'Davis', '2233445566', 'School D', '2013-04-04', 'F', 'Vegan', 2, 'http://example.com/pictures/sophiadavis.jpg'),
('James', 'Wilson', '3344556677', 'School E', '2014-05-05', 'M', 'None', 1, 'http://example.com/pictures/jameswilson.jpg');

-- Insert dummy data into Programme table
INSERT INTO Programme (ProgrammeName, Category, ProgrammePictureURL, Description) VALUES
('Art Class', 'Art', 'http://example.com/programmes/artclass.jpg', 'A creative space for young artists to explore their talents.'),
('Math Club', 'Education', 'http://example.com/programmes/mathclub.jpg', 'Enhance your math skills in a fun environment.'),
('Science Fair', 'Science', 'http://example.com/programmes/sciencefair.jpg', 'Participate in exciting science experiments and projects.'),
('Coding Bootcamp', 'Technology', 'http://example.com/programmes/codingbootcamp.jpg', 'Learn the basics of coding and programming.'),
('Sports Camp', 'Sports', 'http://example.com/programmes/sportscamp.jpg', 'Engage in various sports activities and improve your skills.');

-- Insert dummy data into ProgrammeClass table
INSERT INTO ProgrammeClass (ProgrammeClassID, ProgrammeID, Location, Fee, MaxSlots, ProgrammeLevel, Remarks) VALUES
(1, 1, 'Room A', 50.00, 20, 'Beginner', 'Art supplies provided.'),
(2, 2, 'Room B', 30.00, 25, 'Intermediate', 'Math games and puzzles.'),
(3, 3, 'Room C', 20.00, 30, 'Beginner', 'Science kits available.'),
(4, 4, 'Online', 100.00, 15, 'Advanced', 'Access to coding resources.'),
(5, 5, 'Field', 40.00, 40, 'Beginner', 'Bring your own sports equipment.');

-- Insert dummy data into ProgrammeSchedule table
INSERT INTO ProgrammeSchedule (ProgrammeClassID, ProgrammeID, InstanceID, StartDateTime, EndDateTime) VALUES
(1, 1, 1, '2024-11-10 10:00:00', '2024-11-10 12:00:00'),
(1, 1, 1, '2024-11-11 13:00:00', '2024-11-11 15:00:00'),
(1, 1, 1, '2024-11-12 09:00:00', '2024-11-12 11:00:00'),
(2, 2, 2, '2024-11-13 14:00:00', '2024-11-13 16:00:00'),
(2, 2, 2, '2024-11-14 09:00:00', '2024-11-14 11:00:00');

-- Insert dummy data into ProgrammeMeals table
INSERT INTO ProgrammeMeals (ProgrammeClassID, ProgrammeID, Breakfast, Lunch, Dinner, Remarks) VALUES
(1, 1, TRUE, TRUE, FALSE, 'All meals included.'),
(2, 2, FALSE, TRUE, FALSE, 'Lunch provided.');
-- (3, 3, TRUE, FALSE, FALSE, 'Breakfast only.'),
-- (4, 4, FALSE, FALSE, TRUE, 'Dinner only.'),
-- (5, 5, TRUE, TRUE, TRUE, 'All meals included.');

-- Insert dummy data into Slot table
INSERT INTO Slot (ProgrammeClassID, ProgrammeID, ParentID, ChildID) VALUES
(1, 1, 1, NULL),  -- Parent booking for art class
(2, 2, NULL, 1);  -- Child booking for math club
-- (3, 3, 2, NULL),  -- Parent booking for science fair
-- (4, 4, NULL, 2),  -- Child booking for coding bootcamp
-- (5, 5, 3, NULL);  -- Parent booking for sports camp

-- Insert dummy data into Reviews table
INSERT INTO Reviews (ParentID, ProgrammeID, Rating, ReviewText, ReviewDate) VALUES
(1, 1, 5, 'Fantastic art class! My child loved it.', NOW()),
(2, 2, 4, 'Good math club, but could use more interactive sessions.', NOW());
-- (3, 3, 5, 'Great science fair, my child had a lot of fun!', NOW()),
-- (4, 4, 3, 'Coding bootcamp was okay, but it was too advanced.', NOW()),
-- (5, 5, 4, 'Sports camp was great! Very engaging.', NOW());

-- Insert dummy data into Payment table
INSERT INTO Payment (SlotID, PaymentAmount, PaymentMethod) VALUES
(1, 50.00, 'Credit Card'),
(2, 30.00, 'PayPal');
-- (3, 20.00, 'Bank Transfer'),
-- (4, 100.00, 'Credit Card'),
-- (5, 40.00, 'Cash');

-- Insert dummy data into Token table
INSERT INTO Token (AccountID, Token, ExpiresAt) VALUES
(1, 'token1', '2025-01-01 12:00:00'),
(2, 'token2', '2025-01-02 12:00:00');
-- (3, 'token3', '2025-01-03 12:00:00'),
-- (4, 'token4', '2025-01-04 12:00:00'),
-- (5, 'token5', '2025-01-05 12:00:00');