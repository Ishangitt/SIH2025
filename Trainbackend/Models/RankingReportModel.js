// models/RankingReportModel.js

const mongoose = require("mongoose");

const rankingReportSchema = new mongoose.Schema(
  {
    // A unique, human-readable ID for this specific ranking event, e.g., "RANK-2025-09-19-01"
    

    // An array containing the trains that were eligible and ranked.
    rankedTrains: [
      {
        // A direct link to the original train document.
        train: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Train", // This must match the model name for your train schema
          required: true,
        },
        // The final position in the list (1, 2, 3...).
        rank: {
          type: Number,
          required: true,
        },
       
       
        // A single, human-readable string that explains the ranking.
        explanation: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    // The `createdAt` field tells you exactly when this ranking was generated.
    timestamps: true,
  }
);

module.exports = mongoose.models.RankingReport || mongoose.model("RankingReport", rankingReportSchema);
