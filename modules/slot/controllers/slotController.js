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
const createSlot = async (req, res) => {
    const { programmeClassID, programmeID, parentID, childID } = req.body;

    try {
        const slotID = await Slot.createSlot(programmeClassID, programmeID, parentID, childID);
        res.status(201).json({ message: "Slot created successfully", slotID });
    } catch (error) {
        res.status(500).json({ message: "Error creating slot", error });
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
    createSlot,
    updateSlot,
    deleteSlot,
};
