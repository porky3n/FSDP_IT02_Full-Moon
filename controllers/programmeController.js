const programmeModel = require('../models/programmeModel');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');

exports.announceProgrammes = async (req, res) => {
  try {
    const programmes = await programmeModel.getUpcomingProgrammes();

    if (programmes.length === 0) {
      return res.send('No new programmes found.');
    }

    for (const programme of programmes) {
      const fee = parseFloat(programme.Fee); // Ensure fee is a number
      const message = `
📢 *New Programme Alert!*

*Name*: ${programme.ProgrammeName}
*Description*: ${programme.Description}
*Location*: ${programme.Location}
*Fee*: $${fee.toFixed(2)}
*Level*: ${programme.ProgrammeLevel}
*Schedule*: ${new Date(programme.StartDateTime).toLocaleString()} to ${new Date(programme.EndDateTime).toLocaleString()}
*Remarks*: ${programme.Remarks.replace(/~/g, ', ')}
      `;

      if (programme.ProgrammePicture) {

        // Detect the image format using sharp
        const imageBuffer = programme.ProgrammePicture;
        const imageMetadata = await sharp(imageBuffer).metadata();

        // Check if the format is supported
        if (!['jpeg', 'png', 'webp'].includes(imageMetadata.format)) {
          // Convert the image to JPEG format
          const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
          programme.ProgrammePicture = jpegBuffer;
        }

        // Create a temporary file to store the image
        const imagePath = `./temp_${Date.now()}.jpg`;
        fs.writeFileSync(imagePath, programme.ProgrammePicture);

        await sharp(programme.ProgrammePicture)
        .resize({ width: 1280 }) // Resize to a reasonable width if needed
        .jpeg({ quality: 80 }) // Convert to JPEG format and compress
        .toFile(imagePath);

        // Send the image with the message
        const formData = {
          chat_id: process.env.CHANNEL_ID,
          caption: message,
          parse_mode: 'Markdown',
          photo: fs.createReadStream(imagePath)
        };

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Delete the temporary file after sending
        fs.unlinkSync(imagePath);
      } else {
        // Send only the text if no image is available
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.CHANNEL_ID,
          text: message,
          parse_mode: 'Markdown'
        });
      }
    }
    res.send('Programmes announced successfully!');
  } catch (error) {
    console.error('Error announcing programmes:', error);
    res.status(500).send('Error announcing programmes.');
  }
};
