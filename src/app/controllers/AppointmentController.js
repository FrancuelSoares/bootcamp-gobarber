import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

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

    // Check is Provider
    if (!provider) {
      return res
        .status(401)
        .json({ error: 'You can only create appoitments with providers.' });
    }

    // Check for past Dates
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    // Check date availability
    const checkAvailability = await Appointment.findOne({
      attributes: ['id'],
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available.' });
    }

    const appoitment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    return res.json(appoitment);
  }
}

export default new AppointmentController();
