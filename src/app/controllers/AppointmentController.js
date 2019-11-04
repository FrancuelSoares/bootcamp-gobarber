import * as Yup from 'yup';

import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { provider_id, date } = req.body;

    const provider = await User.findOne({
      attributes: ['id'],
      where: { id: provider_id, provider: true }
    });

    if (!provider) {
      return res
        .status(401)
        .json({ error: 'You can only create appoitments with providers.' });
    }

    const appoitment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    });

    return res.json(appoitment);
  }
}

export default new AppointmentController();