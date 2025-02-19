const bcrypt = require('bcryptjs'); // For password hashing
const AppError = require('../utils/appError'); // Custom error handling
const ApiResponse = require('../utils/apiResponse'); // Standard API response format
const Doctor = require('../models/DoctorModel');


// 📌 Create a new doctor (Admin only)

exports.createDoctor = async (req, res, next) => {
  try {
    const {  name, dob, gender, email, phoneNumber, speciality, password } = req.body;

    // Check for required fields
    if (!name || !dob || !gender || !email || !phoneNumber || !speciality || !password) {
      return next(new AppError("Missing required fields", 400));
    }

    // Determine doctorId prefix based on speciality
    let prefix = "9"; // Default if no matching speciality
    if (speciality.toLowerCase() === "embryologist") {
      prefix = "4";
    } else if (speciality.toLowerCase() === "fertilitydoctor") {
      prefix = "8";
    }

    // Generate a random 7-digit number
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000); // Ensures a 7-digit number
    const doctorId = `${prefix}${randomDigits}`;

    // Hash password before saving

    // Create a new doctor
    const newDoctor = await Doctor.create({
    
      doctorId,
      name,
      dob,
      gender,
      email,
      phoneNumber,
      speciality,
      password
    });

    console.log(newDoctor)

    // Success response
    res.status(201).json(new ApiResponse(201, newDoctor, "Doctor created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create doctor", 500));
  }
};

// 📌 Get all doctors
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select('-password'); // Exclude password field
    res.status(200).json(new ApiResponse(200, doctors, 'Doctors retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch doctors', 500));
  }
};

exports.getDoctorByDoctorId = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) {
      return next(new AppError('Patient not found', 404));
    }

    res.status(200).json(new ApiResponse(200, doctor, 'Patient retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch patient', 500));
  }
};

// 📌 Get a single doctor by ID
exports.getDoctorBy = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password'); // Exclude password field
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    res.status(200).json(new ApiResponse(200, doctor, 'Doctor retrieved successfully'));
  } catch (err) {
    return next(new AppError('Failed to fetch doctor', 500));
  }
};

// 📌 Update a doctor by ID (Admin only)
exports.updateDoctor = async (req, res, next) => {
  const { doctorId } = req.params; // Assume patientId is a custom string ID
  const { email, phoneNumber } = req.body;
  
  // ✅ First, find the patient by `patientId` (not `_id`)
  const doctor = await Doctor.findOne({ doctorId });
  if (!doctor) {
      return next(new AppError("Patient not found", 404));
  }
  

  // ✅ Validate input fields
  if (!email && !phoneNumber) {
      return next(new AppError("At least one field (email or phoneNumber) must be provided", 400));
  }

  // ✅ Update only the provided fields
  if (email) doctor.email = email;
  if (phoneNumber) doctor.phoneNumber = phoneNumber;

  await doctor.save(); // Save changes
  

  res.status(200).json(new ApiResponse(200, doctor, "Patient updated successfully"));
};

// 📌 Delete a doctor by ID (Admin only)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    res.status(200).json(new ApiResponse(200, null, 'Doctor deleted successfully'));
  } catch (err) {
    return next(new AppError('Failed to delete doctor', 500));
  }
};
