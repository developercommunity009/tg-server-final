const BloodTest = require("../models/BloodTest");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

// 📌 Create Blood Test Record
exports.createBloodTest = async (req, res, next) => {
  try {
    const { patientId, doctorId, hcgLevel, hcgUnit, result, remarks } = req.body;

    if (!patientId || !doctorId || !hcgLevel || !hcgUnit || !result) {
      return next(new AppError("Missing required fields", 400));
    }

    const newTest = await BloodTest.create({ patientId, doctorId, hcgLevel, hcgUnit, result, remarks });

    res.status(201).json(new ApiResponse(201, newTest, "Blood test record created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create blood test record", 500));
  }
};

// 📌 Get All Blood Tests
exports.getAllBloodTests = async (req, res, next) => {
  try {
    const tests = await BloodTest.find().populate("patientId doctorId");
    res.status(200).json(new ApiResponse(200, tests, "Blood test records retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch blood test records", 500));
  }
};

// 📌 Get Blood Test by ID
exports.getBloodTestById = async (req, res, next) => {
  try {
    const test = await BloodTest.findById(req.params.id).populate("patientId doctorId");
    if (!test) return next(new AppError("Blood test record not found", 404));

    res.status(200).json(new ApiResponse(200, test, "Blood test record retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch blood test record", 500));
  }
};

// 📌 Update Blood Test
exports.updateBloodTest = async (req, res, next) => {
  try {
    const updatedTest = await BloodTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTest) return next(new AppError("Blood test record not found", 404));

    res.status(200).json(new ApiResponse(200, updatedTest, "Blood test record updated successfully"));
  } catch (err) {
    return next(new AppError("Failed to update blood test record", 500));
  }
};

// 📌 Delete Blood Test
exports.deleteBloodTest = async (req, res, next) => {
  try {
    const deletedTest = await BloodTest.findByIdAndDelete(req.params.id);
    if (!deletedTest) return next(new AppError("Blood test record not found", 404));

    res.status(200).json(new ApiResponse(200, null, "Blood test record deleted successfully"));
  } catch (err) {
    return next(new AppError("Failed to delete blood test record", 500));
  }
};
