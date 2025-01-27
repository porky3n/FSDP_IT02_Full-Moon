const Tier = require("../../../models/tier");

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
    checkAndResetMembershipForAccount
};
