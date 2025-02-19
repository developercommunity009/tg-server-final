const Patient = require('../models/PaientModel'); // Import the Patient model
const AppError = require('../utils/appError'); // Custom error handling
const ApiResponse = require('../utils/apiResponse'); // Standard API response format



// 📌 Create a new patient (Admin only)
exports.createPatient = async (req, res, next) => {
  try {
    const { profilePicture, name, dob, gender, email,password, phoneNumber, maritalStatus, pregnancyStatus } = req.body;

    // Check for required fields
    if (!name || !dob || !gender || !email || !phoneNumber || !password || !maritalStatus) {
      return next(new AppError('Missing required fields', 400));
    }

    // Generate a unique patient ID (8-digit, starts with 7)
    const patientId = `7${Math.floor(1000000 + Math.random() * 9000000)}`; // Ensures 8-digit ID starting with 7

    // Create a new patient
    const newPatient = await Patient.create({ profilePicture, patientId, name, dob, gender, email, password, phoneNumber, maritalStatus, pregnancyStatus });

    // Success response
    res.status(201).json(new ApiResponse(201, newPatient, 'Patient created successfully'));
  } catch (err) {
    return next(new AppError('Failed to create patient', 500));
  }
};

// 📌 Get all patients
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(new ApiResponse(200, patients, 'Patients retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch patients', 500));
  }
};

// 📌 Get a single patient by ID
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }
    res.status(200).json(new ApiResponse(200, patient, 'Patient retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch patient', 500));
  }
};

exports.getPatientByPatientId = async (req, res, next) => {
  
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    res.status(200).json(new ApiResponse(200, patient, 'Patient retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch patient', 500));
  }
};

// 📌 Update a patient by ID
exports.updatePatient = async (req, res, next) => {

  const { email, phoneNumber } = req.body;
  const { patientId } = req.params; // Assume patientId is a custom string ID

  // ✅ First, find the patient by `patientId` (not `_id`)
  const patient = await Patient.findOne({ patientId });
  if (!patient) {
      return next(new AppError("Patient not found", 404));
  }

  // ✅ Validate input fields
  if (!email && !phoneNumber) {
      return next(new AppError("At least one field (email or phoneNumber) must be provided", 400));
  }

  // ✅ Update only the provided fields
  if (email) patient.email = email;
  if (phoneNumber) patient.phoneNumber = phoneNumber;

  await patient.save(); // Save changes

  res.status(200).json(new ApiResponse(200, patient, "Patient updated successfully"));
};

// 📌 Delete a patient by ID (Admin only)
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }
    res.status(200).json(new ApiResponse(200, null, 'Patient deleted successfully'));
  } catch (err) {
    return next(new AppError('Failed to delete patient', 500));
  }
};
