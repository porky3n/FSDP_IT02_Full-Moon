const Tier = require("../../../models/tier");

const getTierDiscount = async (req, res) => {
  try {
      const { tier } = req.params; // Extract tier from request URL
      if (!tier) return res.status(400).json({ error: "Tier is required." });

      const discount = await Tier.getTierDiscount(tier);
      res.json({ tier, discount });
  } catch (error) {
      console.error("Error fetching tier discount:", error);
      res.status(500).json({ error: "Internal server error." });
  }
};


const checkAndResetMembershipForAccount = async (req, res) => {
    const { accountId } = req.params;
  
    try {
      console.log("Checking and resetting tier for account:", accountId);
      const tierInfo = await Tier.checkAndResetMembershipForAccount(accountId);
      res.status(200).json(tierInfo);
    } catch (error) {
      console.error("Error resetting tier for account:", error);
      res.status(500).json({ message: "Error resetting tier for account" });
    }
};

module.exports = {
    getTierDiscount,
    checkAndResetMembershipForAccount
};
