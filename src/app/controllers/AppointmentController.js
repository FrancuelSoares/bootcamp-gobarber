import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Notification from '../schemas/Notification';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number().positive()
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      attributes: ['id', 'date'],
      where: {
        user_id: req.userId,
        canceled_at: null
      },
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20
    });

    return res.json(appointments);
  }

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

    if (provider.id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You cannot schedule an appointment for yourself.' });
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

    /**
     * Notify Provider
     */
    const user = await User.findByPk(req.userId);
    const formatteDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt
    });

    await Notification.create({
      content: `Novo agendendamento de ${user.name} para o ${formatteDate}`,
      user: provider_id
    });

    return res.json(appoitment);
  }
}

export default new AppointmentController();
