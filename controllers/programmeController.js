const programmeModel = require('../models/programmeModel');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const FormData = require('form-data');

// Function to convert base64 to file
const base64ToFile = async (base64, filePath) => {
  const buffer = Buffer.from(base64, 'base64');
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
};

exports.uploadImage = async (programme) => {
  try {
    if (!programme.ProgrammePicture) {
      console.log('No image available for upload.');
      return;
    }

    let imageBuffer;
    let imagePath = `./temp/temp_${Date.now()}.jpg`;

    if (typeof programme.ProgrammePicture === 'string') {
      console.log('ProgrammePicture is a string');
      // Remove any base64 header if present
      const base64Data = programme.ProgrammePicture.replace(/^data:image\/\w+;base64,/, '');
      // Convert base64 to file
      await base64ToFile(base64Data, imagePath);
    } else if (Buffer.isBuffer(programme.ProgrammePicture)) {
      console.log('ProgrammePicture is a Buffer');
      // Assume it's already a buffer
      imageBuffer = programme.ProgrammePicture;
      // Convert and resize the image using sharp
      await sharp(imageBuffer)
        .resize({ width: 1280 }) // Resize to a reasonable width if needed
        .jpeg({ quality: 80 }) // Convert to JPEG format and compress
        .toFile(imagePath);
    } else {
      console.log('ProgrammePicture is of unknown type:', typeof programme.ProgrammePicture);
      throw new Error('Unsupported ProgrammePicture type');
    }

    console.log('Image processed and saved to:', imagePath);

    // Send the image to the Telegram channel
    const formData = new FormData();
    formData.append('chat_id', process.env.CHANNEL_ID);
    formData.append('photo', fs.createReadStream(imagePath));
    formData.append('caption', 'text'); // Add your caption here

    const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200) {
      console.log('Image sent successfully with caption!');
    } else {
      console.error('Failed to send image:', response.status, response.statusText);
    }

    // Delete the temporary file after sending
    fs.unlinkSync(imagePath);
    console.log('Temporary image file deleted:', imagePath);

    console.log('Image uploaded successfully.');
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

exports.sendAnnouncement = async (programme) => {
  try {
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

    // Send the announcement message to Telegram
    const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.CHANNEL_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    if (response.status === 200) {
      console.log('Announcement message sent successfully.');
    } else {
      console.error('Failed to send announcement message:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending announcement message:', error);
  }
};

exports.announceProgrammes = async (req, res) => {
  try {
    const programmes = await programmeModel.getUpcomingProgrammes();

    if (programmes.length === 0) {
      return res.send('No new programmes found.');
    }

    for (const programme of programmes) {
      // Upload the image first, if available
      await exports.uploadImage(programme);

      // Send the announcement message separately
      await exports.sendAnnouncement(programme);
    }

    res.send('Programmes announced successfully!');
  } catch (error) {
    console.error('Error announcing programmes:', error);
    res.status(500).send('Error announcing programmes.');
  }
};