const Train = require("../Models/SimpleTrainModel");
const SystemConfig = require("../Models/SystemConfigModel");
const RankingReport = require("../Models/RankingReportModel");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRankings = async (req, res) => {
  try {
    const [allTrains, config] = await Promise.all([
      Train.find({}),
      SystemConfig.findOne({}),
    ]);

    if (!config) {
      return res.status(404).json({ message: "System configuration not found." });
    }

    const eligibleTrains = [];
    const ineligibleTrains = [];

    
    for (const train of allTrains) {
      
      if (train.fitnessCertificates && train.jobCardStatus) {
        eligibleTrains.push(train);
      } else {
       
        ineligibleTrains.push({
          train: train._id,
          
          reason: !train.fitnessCertificates
            ? "Fitness Certificate is false"
            : "Job Card Status is false",
        });
      }
    }

    const formattedTrains = eligibleTrains.map((train) => {
      let brandingScore = 0;
      if (train.brandingHours > 0) {
        brandingScore = (train.completedHours / train.brandingHours) * 10;
      }
      return {
        id: train.trainId,
        requiresCleaning: train.requiresCleaning,
        distanceTravelled: train.mileage,
        brandingScore: Math.min(10, Math.round(brandingScore)),
        stablingScore: Math.min(10, train.stablingScore),
      };
    });

    const payloadForRankingService = {
      trains: formattedTrains,
      config: {
        numCleaningSlots: config.availableCleaningSlots,
        avgFleetDistance: config.avgFleetMileage,
      },
    };

    let assignedForCleaning, goingToService;
    const explanationsMap = new Map();

    try {
      const rankingServiceUrl = process.env.RANKING_SERVICE_URL;
      const rankingResponse = await axios.post(rankingServiceUrl, payloadForRankingService);
      
      assignedForCleaning = rankingResponse.data.assignedForCleaning;
      goingToService = rankingResponse.data.goingToService;
      
      const allRankedTrainsForReport = [...assignedForCleaning, ...goingToService];

      const explanationPromises = allRankedTrainsForReport.map(async (train) => {
        const assignment = assignedForCleaning.some(t => t.id === train.id) ? "Assigned for Cleaning" : "Sent to Service";
        const prompt = `Based on the following data for a train, provide a brief, one-sentence explanation for the final decision. Data: - Train ID: ${train.id} - Mileage: ${train.distanceTravelled} km (Fleet Average: ${config.avgFleetMileage} km) - Branding Score: ${train.brandingScore}/10 - Stabling Score: ${train.stablingScore}/10 - Needs Cleaning: ${train.requiresCleaning} Decision: ${assignment} Explanation:`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        explanationsMap.set(train.id, text.trim());
      });

      await Promise.all(explanationPromises);

      const rankedTrainsForReport = allRankedTrainsForReport.map((train, index) => {
        const originalTrain = eligibleTrains.find(t => t.trainId === train.id);
        return {
          train: originalTrain._id,
          rank: index + 1,
          explanation: explanationsMap.get(train.id) || "Explanation could not be generated.",
        };
      });
      
      await RankingReport.findOneAndUpdate(
          {},
          { reportId: `RANK-${Date.now()}`, rankedTrains: rankedTrainsForReport },
          { upsert: true, new: true, sort: { createdAt: -1 } }
      );

    } catch (apiError) {
      console.warn("Ranking service failed. Using fallback logic.", apiError.message);
      assignedForCleaning = [];
      goingToService = formattedTrains;
    }

    const goingToServiceWithExplanation = goingToService.map(train => ({
      ...train,
      explanation: explanationsMap.get(train.id) || "Explanation not generated due to ranking service failure.",
    }));

    const populatedIneligibleTrains = await Train.populate(ineligibleTrains, { path: 'train', select: 'trainId' });

    res.status(200).json({
      assignedForCleaning,
      goingToService: goingToServiceWithExplanation,
      ineligibleTrains: populatedIneligibleTrains,
    });

  } catch (error) {
    console.error("Critical error in generateRankings controller:", error);
    res.status(500).json({ message: "An internal server error occurred.", error: error.message });
  }
};

module.exports = { generateRankings };