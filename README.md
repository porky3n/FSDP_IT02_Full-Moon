# Full Stack Development Project P02 Team FullMoon

---

## Overview
This Fullstack Development Project (FSDP) is a collaboration between Mindsphere Singapore and Year 2 IT students from IT02, aimed at creating innovative IT solutions for Mindsphere. With a rapidly evolving technological landscape, the demand for competency and adaptability grows. Mindsphere Singapore, founded by Simon and Christine, focuses on tailored training and coaching for diverse generations.

---

## Our Team

Our Full Stack Team is called **FullMoon**. We are a group of dedicated students with a shared passion for building effective and user-centered applications.

- **Wang Po Yen Jason** (Product Owner and Developer): Leads the team, manages Jira, oversees the product backlog, and ensures alignment with project goals.
- **Diontae Low Han Sen** (Scrum Master and Developer): Organizes agile workflows and manages the database to maintain efficient data operations.
- **Vincent Hernando**, **Ahmed Uzair**, and **Aung Phoom Myat**: Contribute their technical skills for both Front-end and Back-end, tackling development challenges and ensuring our projects are innovative, functional, and scalable.

Together, we aim to deliver impactful solutions through teamwork and technical expertise.

---

## About Mindsphere

Mindsphere’s mission, driven by a strong commitment to integrity, growth, and community, seeks to empower learners through their signature programmes, backed by the Learning Sphere and Curriculum Pyramid. This project supports their efforts to deliver effective, workforce-relevant training by developing a robust web application that streamlines their operations and connects them with their audience.

---

## Challenge Statement

Enhance the efficiency of our client onboarding process and customer interactions by streamlining key touchpoints. This includes the issuance of invoices, payment collection, receipt generation, and updating customer records in our database. Additionally, as programme dates approach, we need to proactively reach out to customers with reminders and provide options for them to select lunch preferences.

---

## Project Goals

The primary goal of this project is to build a web application that allows Mindsphere to increase the efficiency of client onboarding and customer interactions by streamlining key touchpoints.

---

## Original Features

### **User Flow**
1. **Login/Sign Up:** Users can securely register for a new account or log in to an existing account.
2. **User Profile Management:** Users can view and update their personal or child profiles.
3. **View Programmes & Book Programmes:** Users can explore and book available programmes with ease.
4. **Chatbot Assistance:** Integrated chatbot to provide instant answers about the company and its programmes.
5. **Telegram Channel Integration:** Dedicated channel for members, broadcasting programme details and reminders.
6. **Payment System:** Users can make payments through the system and upload proof of payment (PayNow style).
7. **Email Confirmation + Receipt Generation:** Users receive booking and payment confirmation emails, along with downloadable receipts.

### **Admin Flow**
1. **User Account Management:** Admins can view, edit, or delete user accounts, including parent and child details such as name, date of birth, membership status, and date joined.
2. **Programme Management:** Admins can view, edit, delete, and create programmes, which are instantly displayed on the user front end.
3. **Transaction Management** Admins can view transaction evidence like Paynow screenshots to verify payments via the Admin portal

---

## Assignment 2 Enhancements

Building upon **Assignment 1**, the project has undergone significant improvements and added new features in **Assignment 2**.

### **New Features in User Flow**
1. **Google Login:** Enabled users to sign up and log in using Google accounts for added convenience.
2. **Enhanced Telegram Channel Broadcast:** Introduced direct messages to remind users of bookings or membership expirations, with support for location/maps, videos, and images.
3. **Workable Payment API:** Integrated the Stripe API to enable a functional PayNow payment option for Singapore users during checkout.
4. **Online 1-1 Coaching:** Implemented an in-built video API for users to join personalized coaching sessions directly on the website.
5. **Multi-Language Support:** Added Google Translate tool that allows user to translate each webpage to any of Singapore’s four main languages (English, Chinese, Malay, and Tamil) for greater accessibility.
6. **Programme Reviews:** Users can view reviews, ratings, and submission dates from others. They can also add reviews for each programme.
7. **B2B Contact Form:** Created a form for potential business partners to express interest, these information is stored into the Database.
8. **Membership Tier** Created a membership tiering system that auto tracks their spendings and upgrade users to different tiers (Gold, Silver & Bronze).
9. **Profile Details** During Sign-Up, users can fill in information about themselves such as hobbies or skills. These information helps Mindsphere personalize programmes for users.

### **New Features in Admin Flow**
1. **Programme Reviews Management:** Admins can manage reviews, including deleting inappropriate ones, via the admin portal.
2. **Admin Dashboard:** Developed comprehensive admin dashboards with visual graphs displaying key performance metrics.
3. **AI Chatbot Prompts Configuration:** Added functionality for admins to configure chatbot prompts, ensuring that both user-facing and admin-facing chatbots provide the most accurate and up-to-date responses.
4. **AI Chatbot for Admins:** Introduced an AI-powered chatbot for admins, specialized in providing actionable business insights to help steer the organization toward growth and progress.

---

## **Login Credentials**
For general users you may use the sample account or create a new account.

**Email**: parent1@example.com
**PW**: jason1234

For admin users, please use the login credentials below.

**Admin Email**: admin1@example.com
**Admin PW**: jason1234

## Technologies Used

### **Frontend:**
- HTML, CSS, JavaScript
- Bootstrap for responsive and streamlined UI

### **Backend:**
- MVC Model Code Structure
- Node.js & Express.js for server-side logic and APIs
- MySQL and Railway SQL for database management

### **APIs and Integrations:**
- OpenAI API for chatbot functionality
- Telegram Chatbot API for programme announcements
- Stripe API for payment integration
- Google OAuth 2.0 for Google Login Authentication
- Google Translate Embedded Widget for Website Multi-Language Support

### **Others:**
- User account authentication using JWT
- Session-based authentication 
- Multi-language support for broader accessibility

---

This enhanced project reflects our team's commitment to innovation and user-centric design, ensuring a seamless experience for both users and administrators.