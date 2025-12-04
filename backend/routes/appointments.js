// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// CRIAR AGENDAMENTO
// Rota original era '/appointments', mudei para '/' pois o server.js já define o prefixo
// URL Final: POST /api/appointments
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

// MEUS AGENDAMENTOS (CLIENTE)
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// AGENDA DO BARBEIRO
router.get('/barber-schedule', auth, async (req, res) => {
  try {
    const barberUser = await User.findById(req.user.id);
    
    // Verifica se a role é 'barber' ou 'admin' (assumindo que admin também pode ver)
    if (barberUser.role !== 'barber' && barberUser.role !== 'admin') {
      return res.status(403).json({ msg: 'Acesso apenas para barbeiros.' });
    }

    const query = barberUser.role === 'admin' ? {} : { barber: barberUser.name };

    const appointments = await Appointment.find(query)
      .populate('user', 'name contact') 
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// 4. VER TUDO (ADMIN)
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

//DELETAR
router.delete('/:id', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Agendamento não encontrado' });

    const requestUser = await User.findById(req.user.id);

    const isOwner = appointment.user.toString() === req.user.id;
    const isAdmin = requestUser.role === 'admin';
    const isTheBarber = requestUser.role === 'barber' && appointment.barber === requestUser.name;

    if (!isOwner && !isAdmin && !isTheBarber) {
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