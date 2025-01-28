-- Insert data into ChatbotPrompts table
INSERT INTO ChatbotPrompts (PromptType, PromptText)
VALUES 
('ChatbotUser', 
 'You are an expert assistant of mindSphere, your name is mindSphere Assistant. You are concise, friendly, cheerful and helpful. You will help answer users of mindSphere website queries. \
 Use only the provided information to respond, and **do not reveal any database IDs or sensitive internal information.** \
 At the end of the conversation, subtly encourage the user to sign up for the programmes. Ensure that the user is satisfied \
 with the information provided. Ensure that all responses will be no longer than 200 words. \
 You will not reveal that the information is from the database, you will only provide the information as if you are the expert assistant. \
 You will protect the privacy of the user and the company, and will not reveal personal information not relating to the current conversation or user. \
 You will not provide any medical, legal, financial, or professional advice. You will not provide any information that is not related to the company or the user\'s query. \
 You will not provide code, nor reveal the database structure. \
 **Do not reveal any information about private and personal IDs, such as account IDs and child IDs.** \
 You will format your responses in a friendly and helpful manner, and easy to read. \
 Please do not assume any information not provided in the context, if unsure, provide a general response. \
 You cannot provide any private information about any account, user, parent or child, unless it is provided in the user details prompt later. \
 You will not reveal how many accounts you know, or how many users are in the database, or how many users in the current context.'),
('ChatbotAdmin','Role: \
 You are a **highly intelligent and professional assistant** for the admin team at mindSphere. Your role is to assist admins in making **data-driven decisions**, \
 providing **actionable insights**, and optimizing the company''s business and educational programs. \
 Key Responsibilities: \
 1. Identify **trends**, such as which programs are most popular or profitable. \
 2. Suggest **improvements**, including program ideas, scheduling adjustments, or ways to enhance user engagement. \
 3. Highlight **underperforming areas** and recommend strategies to address them. \
 4. Provide **analytics insights**, such as user demographics or booking patterns. \
 5. Offer **marketing suggestions**, like optimizing promotions or targeting specific user segments. \
 Rules: \
 - **Protect Privacy**: Do not reveal personal or sensitive information unless explicitly allowed by the admin. \
 - **Be Professional**: Use clear, concise, and structured responses with headings and bullet points. \
 - **Focus on Insights**: Always provide **actionable recommendations** based on the available data. \
 Example Insights: \
 - **Trend**: The Coding Workshop has a 90% booking rate but low repeat participation. Suggest offering advanced workshops. \
 - **Recommendation**: Offer early bird discounts for Art Camp to boost registrations, only 50% of slots are booked. \
 Always strive to **empower admins** with insights that help grow the business effectively.');

-- Insert data into Account table
INSERT INTO Account (Email, PasswordHashed, AccountType, CreatedAt) 
VALUES 
('parent1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('parent2@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('admin1@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'A', NOW());

-- Insert data into TierCriteria table
INSERT INTO TierCriteria (Tier, MinPurchases, TierDuration, TierDiscount, Special)
VALUES 
('Non-Membership', 0, 0, 0.00, FALSE), -- Default tier with no benefits
('Bronze', 2, 30, 5.00, FALSE),       -- Requires 5 purchases, 5% discount, valid for 30 days
('Silver', 10, 90, 10.00, TRUE),      -- Requires 10 purchases, 10% discount, valid for 90 days, with special benefits
('Gold', 20, 180, 20.00, TRUE);       -- Requires 20 purchases, 20% discount, valid for 180 days, with special benefits

-- Insert data into Parent table
INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, Membership, StartDate, Dietary, ProfilePicture, ProfileDetails)
VALUES 
(1, 'John', 'Doe', '1980-05-10', 'M', '1234567890', 'Gold', '2023-12-12', 'No beef', 'private-images/profile-pictures/user-1.jpg', "i am a passionate in learning art and music as my side hobbies."),
(2, 'Jane', 'Smith', '1985-03-22', 'F', '0987654321', 'Silver', '2024-06-15', 'Vegetarian', 'private-images/profile-pictures/user-2.jpg', 'i work as a Software Engineer and I love coding.');

-- Insert data into Child table
INSERT INTO Child (FirstName, LastName, HealthDetails, Relationship, EmergencyContactNumber, School, DateOfBirth, Gender, Dietary, ParentID, ProfilePicture, ProfileDetails)
VALUES 
('Jack', 'Doe', 'Has mild autism', 'Son', '1234567890', 'Greenwood School', '2010-09-15', 'M', 'None', 1, 'private-images/profile-pictures/child-1.jpg', 'im very interested in computers, technology and the world. i love to learn new things and make new friends.'),
('Ella', 'Smith', '', 'Daughter', '0987654321', 'Bluebell Academy', '2012-12-05', 'F', 'Dairy-Free', 2, 'private-images/profile-pictures/child-2.jpg', 'i love to draw and paint, and i enjoy playing with my friends.');

-- Insert data into Programme table
INSERT INTO Programme (ProgrammeName, Category, ProgrammePicture, Description)
VALUES 
('Coding Workshop','Workshop','private-images/programme-pictures/programme-1.png','A hands-on workshop teaching basic coding skills.'),
('Art Camp', 'Camp', 'private-images/programme-pictures/programme-2.png', 'An immersive art camp for young artists.');

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
INSERT INTO ProgrammeImages (ProgrammeID, Image)
VALUES 
(1, 'private-images/programme-pictures/programme-1-content-1.png'),
(2, 'private-images/programme-pictures/programme-2-content-1.png');

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

-- Insert data into BusinessEnquiries table
INSERT INTO BusinessEnquiries (BusinessName, Industry, BusinessSize, ContactName, ContactJobTitle, EmailAddress, PhoneNumber, PreferredContactMethod, InterestAreas, AdditionalComments, Consent, Status, AdminNotes)
VALUES 
('TechCo Innovations', 'Technology', 'Medium', 'David Green', 'HR Manager', 'david.green@techco.com', '456789012', 'Email', 'Group Booking, Custom Workshops', 'Looking for workshops on leadership skills.', 1, 'New', 'Follow up by end of next week'),
('EduFuture', 'Education', 'Small', 'Laura White', 'CEO', 'laura.white@edufuture.com', '0987654321', 'Phone', 'Sponsorship Opportunities', 'Interested in sponsoring STEM camps.', 1, 'In Progress', 'Sent sponsorship proposal. Awaiting feedback.'),
('HealthFirst Ltd.', 'Healthcare', 'Large', 'Sophia Black', 'Training Coordinator', 'sophia.black@healthfirst.com', '1122334455', 'Email', 'Bulk Discounts', 'Seeking discounts for employee wellness programs.', 1, 'Completed', 'Confirmed discount details. Program starts in March.');
