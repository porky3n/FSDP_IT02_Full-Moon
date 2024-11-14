const fs = require('fs').promises;

/**
 * Converts an image file to a base64 string and generates an SQL update statement.
 * @param {string} imagePath - The path to the image file.
 * @param {number} programmeID - The ID of the programme to update.
 * @returns {Promise<string>} - A promise that resolves to an SQL update statement.
 */
const generateSQLUpdateStatement = async (imagePath, programmeID) => {
    try {
        
        const imageBuffer = await fs.readFile(imagePath);
        const pictureBuffer = imageBuffer ? Buffer.from(new Uint8Array(imageBuffer)) : null;
        // const base64Image = imageBuffer.toString('base64');
        return `
            -- Update image for ProgrammeID = ${programmeID}
            UPDATE Programme SET ProgrammePicture = '${pictureBuffer}' WHERE ProgrammeID = ${programmeID};
        `;
    } catch (error) {
        console.error(`Error generating SQL update statement for ${imagePath}:`, error);
        throw error;
    }
};

// Example usage to generate SQL update statements
(async () => {
    try {
        const sqlUpdate1 = await generateSQLUpdateStatement('private-images/programme-pictures/programme-40.png', 40);
        // const sqlUpdate2 = await generateSQLUpdateStatement('private-images/programme-pictures/programme-41.png', 41);

        console.log(sqlUpdate1);
        // console.log(sqlUpdate2);

        // Optionally, write the SQL to a file
        // const sqlUpdateStatements = sqlUpdate1 + '\n' + sqlUpdate2;
        const sqlUpdateStatements = sqlUpdate1;
        await fs.writeFile('SQL Scripts/updateImages.sql', sqlUpdateStatements);
        console.log('SQL update statements written to file.');
    } catch (error) {
        console.error('Error during SQL generation:', error);
    }
})();
