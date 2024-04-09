const Referral = require("../models/referralModel")

const getReferralHistory = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // find referrals where the referrer is the user with the given userId
      const referrals = await Referral.find({ referrer: userId }).populate('referrer', 'firstName lastName');
  
      // calculate the total rewards earned by the user
      const totalRewards = referrals.reduce((total, referral) => {
        return total + (referral.isRewarded ? referral.rewardAmount : 0); // check if the referral is rewarded
      }, 0);
  
      // return the referral data along with the total rewards earned
      res.status(200).json({ referrals, totalRewards });
    } catch (error) {
      res.status(500).json({ error: 'Error getting referral history' });
    }
  };

module.exports = {getReferralHistory}