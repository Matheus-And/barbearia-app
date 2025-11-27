const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// CRIAR AGENDAMENTO
router.post('/', auth, async (req, res) => {
  const { barber, date } = req.body;
  try {
    const newAppointment = new Appointment({
      user: req.user.id,
      barber,
      date,
    });
    const appointment = await newAppointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// LISTAR AGENDAMENTOS DO CLIENTE
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado.' });
    }

    const appointments = await Appointment.find()
      .populate('user', 'name contact') 
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// EXCLUIR AGENDAMENTO
router.delete('/:id', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Agendamento não encontrado' });

    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Agendamento removido' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;