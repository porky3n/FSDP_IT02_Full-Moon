const Slot = require("../../../models/slot");
const { sendPaymentConfirmationEmail } = require("../../../models/email");

// Get Slots
const getSlots = async (req, res) => {
    try {
        const { programmeId, instanceId, programmeClassId } = req.body; // Use req.body instead of req.query

        if (!programmeId || !instanceId || !programmeClassId) {
            return res.status(400).json({ success: false, message: "Missing required parameters" });
        }

        const slots = await Slot.getSlots(programmeId, instanceId, programmeClassId);

        if (slots.length === 0) {
            return res.status(404).json({ success: false, message: "No slots found" });
        }

        res.status(200).json({ success: true, slots });
    } catch (error) {
        console.error("Error retrieving slots:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



// Get slots for a specific programme
const getSlotsByProgramme = async (req, res) => {
    const programmeID = req.params.id;

    try {
        const slots = await Slot.getSlots(programmeID);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error fetching slots", error });
    }
};

// Get slots for a specific programme class
const getSlotsByProgrammeClass = async (req, res) => {
    const programmeClassID = req.params.classId;

    try {
        const slots = await Slot.getSlotsByProgrammeClass(programmeClassID);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error fetching slots for the programme class", error });
    }
};

// Get slots for a specific parent slot
const getParentSlots = async (req, res) => {
    const parentID = req.params.parentId;

    try {
        const slots = await Slot.getParentSlots(parentID);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error fetching parent slots", error });
    }
};

// Get slots for a specific child slot
const getChildSlots = async (req, res) => {
    const childID = req.params.childId;

    try {
        const slots = await Slot.getChildSlots(childID);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error fetching child slots", error });
    }
};

// Create a new slot
// Create a new slot
const createSlotAndPayment = async (req, res) => {
    console.log("Received data:", req.body); // Debugging line to inspect req.body

    const { 
        programmeClassID, 
        programmeID, 
        instanceID, 
        parentID, 
        childID, 
        paymentAmount, 
        paymentMethod, 
        verified,
        purchaseTier,
        //paymentImage, // Expecting an array of binary data here
        promotionID,
        userEmail,
        programmeName,
        startDate,
        endDate 
    } = req.body;

    try {
        // Convert the paymentImage array back to binary for database storage
        //const paymentImageBuffer = Buffer.from(paymentImage);

        // Create the slot with the additional payment details, passing arguments individually
        const { slotID, paymentID } = await Slot.createSlotAndPayment(
            programmeClassID,
            programmeID,
            instanceID,
            parentID,
            childID,
            paymentAmount,
            paymentMethod,
            verified,
            purchaseTier,
            //paymentImageBuffer,
            promotionID,
             // Include user email
        );

        // Send a payment confirmation email
        await sendPaymentConfirmationEmail({
            userEmail: userEmail, // Ensure this is correctly passed
            paymentID: paymentID,
            programmeName: programmeName,
            startDate: startDate,
            endDate: endDate,
            paymentAmount: paymentAmount,
            paymentMethod: paymentMethod
          });

        res.status(201).json({ message: "Slot created successfully", slotID, paymentID });
    } catch (error) {
        console.error("Error creating slot:", error);
        res.status(400).json({ message: error.message }); // Send the specific error message
    }
};




// Update an existing slot
const updateSlot = async (req, res) => {
    const slotID = req.params.id;
    const { programmeClassID, programmeID, parentID, childID } = req.body;

    try {
        await Slot.updateSlot(slotID, programmeClassID, programmeID, parentID, childID);
        res.json({ message: "Slot updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating slot", error });
    }
};

// Delete a slot
const deleteSlot = async (req, res) => {
    const slotID = req.params.id;

    try {
        await Slot.deleteSlot(slotID);
        res.json({ message: "Slot deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting slot", error });
    }
};

module.exports = {
    getSlots,
    getSlotsByProgramme,
    getSlotsByProgrammeClass,
    getParentSlots,
    getChildSlots,
    createSlotAndPayment,
    updateSlot,
    deleteSlot,
};
