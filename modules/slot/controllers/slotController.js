const Slot = require("../../../models/slot");

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
        paymentImage, // Expecting an array of binary data here
        promotionID 
    } = req.body;

    try {
        // Convert the paymentImage array back to binary for database storage
        const paymentImageBuffer = Buffer.from(paymentImage);

        // Create the slot with the additional payment details, passing arguments individually
        const { slotID, paymentID } = await Slot.createSlotAndPayment(
            programmeClassID,
            programmeID,
            instanceID,
            parentID,
            childID,
            paymentAmount,
            paymentMethod,
            paymentImageBuffer,
            promotionID
        );

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
    getSlotsByProgramme,
    getSlotsByProgrammeClass,
    getParentSlots,
    getChildSlots,
    createSlotAndPayment,
    updateSlot,
    deleteSlot,
};
