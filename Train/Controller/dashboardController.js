const Train = require("../Models/SimpleTrainModel");
const SystemConfig = require("../Models/SystemConfigModel");

const getDashboardStats = async (req, res) => {
  try {
    const trains = await Train.find();
    const systemConfig = await SystemConfig.findOne();
    
    const totalTrains = trains.length;
    const activeTrains = trains.filter(t => !t.requiresCleaning && t.fitnessCertificates).length;
    const inMaintenance = trains.filter(t => t.requiresCleaning || !t.fitnessCertificates).length;
    
    const avgMileage = trains.reduce((sum, train) => sum + train.mileage, 0) / totalTrains;
    const prevAvgMileage = systemConfig?.avgFleetMileage || avgMileage;
    const efficiencyChange = ((avgMileage - prevAvgMileage) / prevAvgMileage * 100).toFixed(1);

    // Update the system config with new average mileage
    await SystemConfig.findOneAndUpdate(
      {},
      { avgFleetMileage: avgMileage },
      { upsert: true }
    );

    const stats = {
      punctuality: {
        value: 99.5,
        change: 1.7
      },
      fleetStatus: {
        total: totalTrains,
        active: activeTrains
      },
      maintenance: {
        inProgress: inMaintenance
      },
      efficiency: {
        value: (avgMileage / 100).toFixed(1),
        change: efficiencyChange
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLiveSchedule = async (req, res) => {
  try {
    const trains = await Train.find({ requiresCleaning: false, fitnessCertificates: true })
      .limit(5)
      .sort({ createdAt: -1 });

    const schedules = trains.map((train, index) => ({
      trainId: train.trainId,
      route: 'Aluva-Pettah',
      status: train.fitnessCertificates ? 'On Time' : 'Delayed',
      passengers: Math.floor(Math.random() * 300) + 200,
      time: new Date(Date.now() + index * 900000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }));

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getLiveSchedule
};