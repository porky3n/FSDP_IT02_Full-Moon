
const fs = require("fs");
const pool = require("./dbConfig");

// Function to convert an image to Base64
const imageToBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString("base64"));
      }
    });
  });
};

// Define the placeholders and their image paths
const placeholders = {
//   PLACEHOLDER_PAYMENT_1: "./private-images/payment-1.jpg",
//   PLACEHOLDER_PAYMENT_2: "./private-images/payment-2.jpg",
//   PLACEHOLDER_PROFILE_USER_1: "./private-images/user-1.jpg",
//   PLACEHOLDER_PROFILE_USER_2: "./private-images/user-2.jpg",
//   PLACEHOLDER_PROFILE_CHILD_1: "./private-images/child-1.jpg",
//   PLACEHOLDER_PROFILE_CHILD_2: "./private-images/child-2.jpg",
  PLACEHOLDER_PROGRAMME_1: "./private-images/programme-pictures/programme-1.jpeg",
  PLACEHOLDER_PROGRAMME_2: "./private-images/programme-pictures/programme-2.png",
//   PLACEHOLDER_PROGRAMME_1_CONTENT_1: "./private-images/programme-pictures/programme_1_content_1.png",
//   PLACEHOLDER_PROGRAMME_2_CONTENT_1: "./private-images/programme-pictures/programme_2_content_1.jpg",
};

const updatePlaceholdersInDatabase = async () => {
  try {
    for (const [placeholder, imagePath] of Object.entries(placeholders)) {
      const base64Image = await imageToBase64(imagePath);

      // Update all relevant tables with this placeholder
    //   const queries = [
    //     `UPDATE Parent SET ProfilePicture = ? WHERE ProfilePicture = ?`,
    //     `UPDATE Child SET ProfilePicture = ? WHERE ProfilePicture = ?`,
    //     `UPDATE Programme SET ProgrammePicture = ? WHERE ProgrammePicture = ?`,
    //     `UPDATE ProgrammeImages SET Image = ? WHERE Image = ?`,
    //     `UPDATE Payment SET SlotID = ? WHERE SlotID = ?`,
    //   ];
        const queries = [
            `UPDATE Programme SET ProgrammePicture = ? WHERE ProgrammePicture = ?`,
        ]

      for (const query of queries) {
        await pool.execute(query, [base64Image, placeholder]);
      }

      console.log(`Updated placeholder: ${placeholder}`);
    }

    console.log("All placeholders updated successfully!");
  } catch (error) {
    console.error("Error updating placeholders:", error);
  }
};

updatePlaceholdersInDatabase();

// const fs = require('fs').promises;

// /**
//  * Converts an image file to a base64 string and generates an SQL update statement.
//  * @param {string} imagePath - The path to the image file.
//  * @param {number} programmeID - The ID of the programme to update.
//  * @returns {Promise<string>} - A promise that resolves to an SQL update statement.
//  */
// const generateSQLUpdateStatement = async (imagePath, programmeID) => {
//     try {
        
//         const imageBuffer = await fs.readFile(imagePath);
//         const pictureBuffer = imageBuffer ? Buffer.from(new Uint8Array(imageBuffer)) : null;
//         // const base64Image = imageBuffer.toString('base64');
//         return `
//             -- Update image for ProgrammeID = ${programmeID}
//             UPDATE Programme SET ProgrammePicture = '${pictureBuffer}' WHERE ProgrammeID = ${programmeID};
//         `;
//     } catch (error) {
//         console.error(`Error generating SQL update statement for ${imagePath}:`, error);
//         throw error;
//     }
// };

// // Utility function to convert binary images to Base64
// const convertToBase64 = (programme) => {
//     if (programme.programmePicture instanceof Buffer) {
//         programme.programmePicture = `data:image/jpeg;base64,${programme.programmePicture.toString('base64')}`;
//     }
//     if (programme.images) {
//         programme.images = programme.images.map(image =>
//             image instanceof Buffer ? `data:image/jpeg;base64,${image.toString('base64')}` : image
//         );
//     }
//     return programme;
// };

// // Example usage to generate SQL update statements
// (async () => {
//     try {
//         const sqlUpdate1 = await generateSQLUpdateStatement('private-images/programme-pictures/programme-40.png', 40);
//         // const sqlUpdate2 = await generateSQLUpdateStatement('private-images/programme-pictures/programme-41.png', 41);

//         console.log(sqlUpdate1);
//         // console.log(sqlUpdate2);

//         // Optionally, write the SQL to a file
//         // const sqlUpdateStatements = sqlUpdate1 + '\n' + sqlUpdate2;
//         const sqlUpdateStatements = sqlUpdate1;
//         await fs.writeFile('SQL Scripts/updateImages.sql', sqlUpdateStatements);
//         console.log('SQL update statements written to file.');
//     } catch (error) {
//         console.error('Error during SQL generation:', error);
//     }
// })();

