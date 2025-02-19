const EggInformation = require("../models/EggInformation"); // Import EggInformation model
const AppError = require("../utils/appError"); // Custom error handling
const ApiResponse = require("../utils/apiResponse"); // Standard API response format

// 📌 Create Egg Information
exports.createEggInformation = async (req, res, next) => {
  try {
    const { patientId, doctorId, eggId, collectionDate, status, details, patientRequest, doctorConfirmation, attachReason, retrievedEggs } = req.body;

    // Check for required fields
    if (!patientId || !doctorId || !eggId || !collectionDate || !status || !details || !retrievedEggs) {
      return next(new AppError("Missing required fields", 400));
    }

    // Create new Egg Information entry
    const newEggInfo = await EggInformation.create({
      patientId,
      doctorId,
      eggId,
      collectionDate,
      status,
      details,
      patientRequest,
      doctorConfirmation,
      attachReason,
      retrievedEggs,
    });

    // Success response
    res.status(201).json(new ApiResponse(201, newEggInfo, "Egg information created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create egg information", 500));
  }
};

// 📌 Get All Egg Information
exports.getAllEggInformation = async (req, res, next) => {
  try {
    const eggInfo = await EggInformation.find().populate("patientId doctorId");

    // Success response
    res.status(200).json(new ApiResponse(200, eggInfo, "Egg information retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch egg information", 500));
  }
};

// 📌 Get Single Egg Information by ID
exports.getEggInformationById = async (req, res, next) => {
  try {
    const eggInfo = await EggInformation.findById(req.params.id).populate("patientId doctorId");

    if (!eggInfo) return next(new AppError("Egg information not found", 404));

    // Success response
    res.status(200).json(new ApiResponse(200, eggInfo, "Egg information retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch egg information", 500));
  }
};

// 📌 Update Egg Information
exports.updateEggInformation = async (req, res, next) => {
  try {
    const updatedEggInfo = await EggInformation.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedEggInfo) return next(new AppError("Egg information not found", 404));

    // Success response
    res.status(200).json(new ApiResponse(200, updatedEggInfo, "Egg information updated successfully"));
  } catch (err) {
    return next(new AppError("Failed to update egg information", 500));
  }
};

// 📌 Delete Egg Information
exports.deleteEggInformation = async (req, res, next) => {
  try {
    const deletedEggInfo = await EggInformation.findByIdAndDelete(req.params.id);

    if (!deletedEggInfo) return next(new AppError("Egg information not found", 404));

    // Success response
    res.status(200).json(new ApiResponse(200, null, "Egg information deleted successfully"));
  } catch (err) {
    return next(new AppError("Failed to delete egg information", 500));
  }
};
