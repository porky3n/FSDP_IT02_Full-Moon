const pool = require("../dbConfig");

class ChatDataModel {
    static async getStructuredChatData() {
        try {
            const query = `
                SELECT 
                    p.ProgrammeID,
                    p.ProgrammeName,
                    p.Description,
                    p.Category,
                    c.ProgrammeClassID,
                    c.ShortDescription AS ClassDescription,
                    c.Location,
                    c.Fee,
                    c.MaxSlots,
                    c.ProgrammeLevel,
                    b.InstanceID,
                    s.ScheduleID,
                    s.StartDateTime,
                    s.EndDateTime,
                    pi.ImageID,
                    pr.PromotionID,
                    pr.PromotionName,
                    pr.DiscountType,
                    pr.DiscountValue,
                    pr.StartDateTime AS PromoStart,
                    pr.EndDateTime AS PromoEnd,
                    r.ReviewID,
                    r.Rating,
                    r.ReviewText
                FROM Programme p
                LEFT JOIN ProgrammeClass c ON p.ProgrammeID = c.ProgrammeID
                LEFT JOIN ProgrammeClassBatch b ON c.ProgrammeClassID = b.ProgrammeClassID
                LEFT JOIN ProgrammeSchedule s ON b.InstanceID = s.InstanceID
                LEFT JOIN ProgrammeImages pi ON p.ProgrammeID = pi.ProgrammeID
                LEFT JOIN Promotion pr ON p.ProgrammeID = pr.ProgrammeID
                LEFT JOIN Reviews r ON p.ProgrammeID = r.ProgrammeID;
            `;

            const [rows] = await pool.query(query);
            const programmes = {};

            rows.forEach(row => {
                if (!programmes[row.ProgrammeID]) {
                    programmes[row.ProgrammeID] = {
                        ProgrammeName: row.ProgrammeName,
                        Description: row.Description,
                        Category: row.Category,
                        Classes: []
                    };
                }

                if (row.ProgrammeClassID) {
                    const existingClass = programmes[row.ProgrammeID].Classes.find(c => c.ProgrammeClassID === row.ProgrammeClassID);
                    if (!existingClass) {
                        programmes[row.ProgrammeID].Classes.push({
                            ProgrammeClassID: row.ProgrammeClassID,
                            ClassDescription: row.ClassDescription,
                            Location: row.Location,
                            Fee: row.Fee,
                            MaxSlots: row.MaxSlots,
                            ProgrammeLevel: row.ProgrammeLevel,
                            Batches: []
                        });
                    }

                    if (row.InstanceID) {
                        const classObj = programmes[row.ProgrammeID].Classes.find(c => c.ProgrammeClassID === row.ProgrammeClassID);
                        const existingBatch = classObj.Batches.find(b => b.InstanceID === row.InstanceID);
                        if (!existingBatch) {
                            classObj.Batches.push({
                                InstanceID: row.InstanceID,
                                Schedules: []
                            });
                        }

                        if (row.ScheduleID) {
                            const batchObj = classObj.Batches.find(b => b.InstanceID === row.InstanceID);
                            batchObj.Schedules.push({
                                ScheduleID: row.ScheduleID,
                                StartDateTime: row.StartDateTime,
                                EndDateTime: row.EndDateTime
                            });
                        }
                    }
                }
            });

            return programmes;
        } catch (error) {
            console.error("Error fetching structured chatbot data:", error);
            throw error;
        }
    }

    // New function to get all user and programme details
    static async getAllDetails(accountID) {
        try {
            const query = `
                SELECT 
                    acc.AccountID,
                    acc.Email,
                    acc.AccountType,
                    pnt.ParentID,
                    pnt.FirstName AS ParentFirstName,
                    pnt.LastName AS ParentLastName,
                    pnt.Membership,
                    ch.ChildID,
                    ch.FirstName AS ChildFirstName,
                    ch.LastName AS ChildLastName,
                    ch.SpecialNeeds,
                    s.SlotID,
                    s.ProgrammeID,
                    s.ProgrammeClassID,
                    pr.PromotionName,
                    r.ReviewID,
                    r.Rating,
                    r.ReviewText
                FROM Account acc
                LEFT JOIN Parent pnt ON acc.AccountID = pnt.AccountID
                LEFT JOIN Child ch ON pnt.ParentID = ch.ParentID
                LEFT JOIN Slot s ON pnt.ParentID = s.ParentID
                LEFT JOIN Programme p ON s.ProgrammeID = p.ProgrammeID
                LEFT JOIN Promotion pr ON p.ProgrammeID = pr.ProgrammeID
                LEFT JOIN Reviews r ON p.ProgrammeID = r.ProgrammeID
                WHERE acc.AccountID = ?;
            `;

            const [rows] = await pool.query(query, [accountID]);
            return rows;
        } catch (error) {
            console.error("Error fetching all details for chatbot data:", error);
            throw error;
        }
    }

    static async getChatPrompt(promptType) {
        try {
            const query = `
                SELECT PromptText
                FROM ChatPrompts
                WHERE PromptType = ?;
            `;

            const [rows] = await pool.query(query, [promptType]);
            return rows[0].PromptText;
        } catch (error) {
            console.error("Error fetching chat prompt:", error);
            throw error;
        }
    }
}

module.exports = ChatDataModel;
