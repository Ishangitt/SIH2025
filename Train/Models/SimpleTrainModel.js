const mongoose = require("mongoose");

const simpleTrainSchema = new mongoose.Schema(
  {
    trainId: {
      type: String,
      required: true,
      unique: true,
    },
    fitnessCertificates: {
      type: Boolean,
      default: true,
    },
    jobCardStatus: {
      type: Boolean,
      default: false,
    },
    brandingHours: {
      type: Number,
      default: 0,
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    mileage: {
      type: Number,
      required: true,
    },
    requiresCleaning: {
      type: Boolean,
      default: false,
    },
    stablingScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Train || mongoose.model("Train", simpleTrainSchema);