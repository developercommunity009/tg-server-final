const UltraSoundTest = require("../models/UltraSoundTest");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

// 📌 Create Ultrasound Test Record
exports.createUltraSoundTest = async (req, res, next) => {
  try {
    const { patientId, doctorId, testType, findings, result, remarks } = req.body;

    if (!patientId || !doctorId || !testType || !findings || !result) {
      return next(new AppError("Missing required fields", 400));
    }

    const newTest = await UltraSoundTest.create({ patientId, doctorId, testType, findings, result, remarks });

    res.status(201).json(new ApiResponse(201, newTest, "Ultrasound test record created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create ultrasound test record", 500));
  }
};

// 📌 Get All Ultrasound Tests
exports.getAllUltraSoundTests = async (req, res, next) => {
  try {
    const tests = await UltraSoundTest.find().populate("patientId doctorId");
    res.status(200).json(new ApiResponse(200, tests, "Ultrasound test records retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch ultrasound test records", 500));
  }
};

// 📌 Get Ultrasound Test by ID
exports.getUltraSoundTestById = async (req, res, next) => {
  try {
    const test = await UltraSoundTest.findById(req.params.id).populate("patientId doctorId");
    if (!test) return next(new AppError("Ultrasound test record not found", 404));

    res.status(200).json(new ApiResponse(200, test, "Ultrasound test record retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch ultrasound test record", 500));
  }
};

// 📌 Update Ultrasound Test
exports.updateUltraSoundTest = async (req, res, next) => {
  try {
    const updatedTest = await UltraSoundTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTest) return next(new AppError("Ultrasound test record not found", 404));

    res.status(200).json(new ApiResponse(200, updatedTest, "Ultrasound test record updated successfully"));
  } catch (err) {
    return next(new AppError("Failed to update ultrasound test record", 500));
  }
};

// 📌 Delete Ultrasound Test
exports.deleteUltraSoundTest = async (req, res, next) => {
  try {
    const deletedTest = await UltraSoundTest.findByIdAndDelete(req.params.id);
    if (!deletedTest) return next(new AppError("Ultrasound test record not found", 404));

    res.status(200).json(new ApiResponse(200, null, "Ultrasound test record deleted successfully"));
  } catch (err) {
    return next(new AppError("Failed to delete ultrasound test record", 500));
  }
};
