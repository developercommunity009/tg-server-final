const MedicationSchedule = require("../models/MedicationSchedule");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

// 📌 Create a Medication Schedule
exports.createMedicationSchedule = async (req, res, next) => {
  try {
    const { patientId, doctorId, medicineName, dose, frequency, refills } = req.body;

    // Check for required fields
    if (!patientId || !doctorId || !medicineName || !dose || !frequency) {
      return next(new AppError("Missing required fields", 400));
    }

    // Create new medication schedule entry
    const newMedication = await MedicationSchedule.create({
      patientId,
      doctorId,
      medicineName,
      dose,
      frequency,
      refills,
    });

    res.status(201).json(new ApiResponse(201, newMedication, "Medication schedule created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create medication schedule", 500));
  }
};

// 📌 Get All Medication Schedules
exports.getAllMedicationSchedules = async (req, res, next) => {
  try {
    const medications = await MedicationSchedule.find().populate("patientId doctorId");

    res.status(200).json(new ApiResponse(200, medications, "Medication schedules retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch medication schedules", 500));
  }
};

// 📌 Get Medication Schedule by ID
exports.getMedicationScheduleById = async (req, res, next) => {
  try {
    const medication = await MedicationSchedule.findById(req.params.id).populate("patientId doctorId");

    if (!medication) return next(new AppError("Medication schedule not found", 404));

    res.status(200).json(new ApiResponse(200, medication, "Medication schedule retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch medication schedule", 500));
  }
};

// 📌 Update Medication Schedule
exports.updateMedicationSchedule = async (req, res, next) => {
  try {
    const updatedMedication = await MedicationSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedMedication) return next(new AppError("Medication schedule not found", 404));

    res.status(200).json(new ApiResponse(200, updatedMedication, "Medication schedule updated successfully"));
  } catch (err) {
    return next(new AppError("Failed to update medication schedule", 500));
  }
};

// 📌 Delete Medication Schedule
exports.deleteMedicationSchedule = async (req, res, next) => {
  try {
    const deletedMedication = await MedicationSchedule.findByIdAndDelete(req.params.id);

    if (!deletedMedication) return next(new AppError("Medication schedule not found", 404));

    res.status(200).json(new ApiResponse(200, null, "Medication schedule deleted successfully"));
  } catch (err) {
    return next(new AppError("Failed to delete medication schedule", 500));
  }
};
