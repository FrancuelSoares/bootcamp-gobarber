import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const provider = await User.findOne({
      attributes: ['id'],
      where: { id: req.userId, provider: true }
    });

    if (!provider) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications.' });
    }

    const notifications = await Notification.find({
      user: req.userId
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }
}

export default new NotificationController();
