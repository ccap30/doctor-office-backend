const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const k8sApi = kubeconfig.makeApiClient(CoreV1Api);

app.get('/get-secret', async (req, res) => {
  try {
    const secretName = 'secret-phrase';
    const namespace = 'default';

    const response = await k8sApi.readNamespacedSecret(secretName, namespace);
    const secretData = response.body.data['secret-phrase'];

    const decodedSecret = Buffer.from(secretData, 'base64').toString('utf8');

    res.json({ secret: decodedSecret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to access secret!' });
  }
});


mongoose.connect('mongodb://mongo-service:27017/appointments', { useNewUrlParser: true, useUnifiedTopology: true });


const AppointmentSchema = new mongoose.Schema({
  patientName: String,
  doctorName: String,
  date: Date,
});


const Appointment = mongoose.model('Appointment', AppointmentSchema);


app.get('/appointments', async (req, res) => {
  const appointments = await Appointment.find();
  res.json(appointments);
});


app.post('/appointments', async (req, res) => {
  const appointment = new Appointment(req.body);
  await appointment.save();
  res.json(appointment);
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});

