-- Dummy data for Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, MembershipExpirationDate, Dietary, ProfilePictureURL)
VALUES 
    (1, 'John', 'Doe', '1980-05-15', 'M', '1234567890', 'Member', '2024-12-31', 'Vegetarian', 'https://example.com/john_doe.jpg'),
    (2, 'Jane', 'Smith', '1985-03-20', 'F', '0987654321', 'Non-Member', NULL, 'None', 'https://example.com/jane_smith.jpg');


-- Dummy data for Child table
INSERT INTO Child (FirstName, LastName, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePictureURL)
VALUES 
('Alice', 'Smith', '12345678', 'Greenwood Primary', '2012-05-10', 'F', 'Vegetarian', 1, 'images/alice.png'),
('Bob', 'Johnson', '87654321', 'Highland Secondary', '2010-08-22', 'M', 'None', 1, 'images/bob.png');



