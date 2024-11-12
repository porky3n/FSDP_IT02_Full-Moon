const programmeModel = require('../models/programmeModel');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Jimp = require('jimp');

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
        console.log('abc');

        let imageBuffer;
        if (typeof programme.ProgrammePicture === 'string') {
          console.log('ProgrammePicture is a string');
          // Remove any base64 header if present
          const base64Data = programme.ProgrammePicture.replace(/^data:image\/\w+;base64,/, '');
          // Decode base64 to a Buffer
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (Buffer.isBuffer(programme.ProgrammePicture)) {
          console.log('ProgrammePicture is a Buffer');
          // Assume it's already a buffer
          imageBuffer = programme.ProgrammePicture;
        } else {
          console.log('ProgrammePicture is of unknown type:', typeof programme.ProgrammePicture);
          throw new Error('Unsupported ProgrammePicture type');
        }
        console.log('def');

        try {
          // Load the image using Jimp
          const image = await Jimp.read(imageBuffer);
          console.log('Image loaded with Jimp');

          // Convert the image to JPEG format if necessary
          if (image.getMIME() !== Jimp.MIME_JPEG) {
            imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
          } else {
            imageBuffer = await image.getBufferAsync(image.getMIME());
          }

          // Ensure the image size is within the MEDIUMBLOB limit (16 MB)
          if (imageBuffer.length > 16 * 1024 * 1024) {
            throw new Error('Image size exceeds the MEDIUMBLOB limit of 16 MB');
          }

          // Save the image to a file (optional)
          const imagePath = `./images/${programme.ProgrammeName}.jpg`;
          await image.writeAsync(imagePath);

          // Create form data
          const formData = new FormData();
          formData.append('photo', fs.createReadStream(imagePath));
          formData.append('caption', message);

          // Include the image in the message (optional)
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto?chat_id=${process.env.CHANNEL_ID}`, formData, {
            headers: formData.getHeaders()
          });

          console.log('Image sent successfully with caption!');
        } catch (error) {
          console.error('Error processing image:', error);
        }
      } else {
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
    res.status(500).send('An error occurred while announcing programmes.');
  }
};