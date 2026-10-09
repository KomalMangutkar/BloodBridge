import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware } from '../middleware/auth.js';

export const aiRouter = Router();

aiRouter.post('/chat', authMiddleware, (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();
  const donor = db.donors.find(d => d.userId === req.user!.id);

  const query = message.toLowerCase();
  let reply = '';

  if (query.includes('eligibility') || query.includes('eligible')) {
    if (donor) {
      reply = `According to your profile, your platform status is: **${donor.platformEligibilityStatus.replace(/_/g, ' ')}**.\n\nYour next estimated eligible donation date is **${donor.nextEligibleDate || 'Available Now'}**. Please remember that platform status is for scheduling guidance; the attending doctor or blood bank conducts final clinical clearance!`;
    } else {
      reply = `To donate whole blood, donors generally must be 18–65 years old, weigh at least 50 kg, be in good general health, and wait at least 90 days between donations.`;
    }
  } else if (query.includes('history') || query.includes('donation')) {
    if (donor) {
      reply = `You have recorded **${donor.totalDonations} completed donations** with a donor reliability rating of **${donor.reliabilityScore}%**.\nLast donation on record: **${donor.lastDonationDate || 'None recorded yet'}**.`;
    } else {
      reply = `Blood donations save lives! Check your donor dashboard to view verified donation timestamps and certificates.`;
    }
  } else if (query.includes('certificate') || query.includes('badge')) {
    reply = `BloodBridge issues cryptographically verifiable digital certificates upon confirmation of every donation by an authorized hospital. You can view, download, or share them from your Certificates tab!`;
  } else if (query.includes('prep') || query.includes('prepare') || query.includes('food') || query.includes('water')) {
    reply = `Before donating:\n- Drink plenty of water (16–20 oz before donation)\n- Eat a healthy, low-fat meal 2–3 hours prior\n- Avoid strenuous exercise immediately before\n- Bring a government photo ID\n\nAfter donating, rest for 10–15 minutes, enjoy a snack, and stay hydrated!`;
  } else {
    reply = `Hello! I am your **BloodBridge AI Assistant**. I can help you check your platform eligibility interval, understand blood group compatibility, view your donation impact, and learn preparation tips.\n\n*(Note: I provide educational and platform guidance only; please consult certified healthcare professionals for personal medical decisions.)*`;
  }

  res.json({
    reply,
    isDisclaimerVisible: true,
    disclaimer: 'BloodBridge AI Assistant provides platform guidance and general education only. Always consult licensed medical professionals for transfusion advice or medical clearance.'
  });
});
