import { Router, Request, Response, NextFunction } from 'express';
import { Clinic, ClinicStatus } from '../models/Clinic';
import { Doctor } from '../models/Doctor';

const router = Router();

// @route   GET /api/clinics
// @desc    Get all approved clinics (with optional city/search query)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, search, status } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = ClinicStatus.APPROVED;
    }

    if (city) {
      filter.city = { $regex: new RegExp(city as string, 'i') };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search as string, 'i') } },
        { speciality: { $regex: new RegExp(search as string, 'i') } },
        { city: { $regex: new RegExp(search as string, 'i') } },
        { clinicId: { $regex: new RegExp(search as string, 'i') } },
      ];
    }

    const clinics = await Clinic.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, clinics });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/clinics/:clinicId
// @desc    Get clinic details with doctors
router.get('/:clinicId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clinic = await Clinic.findOne({ clinicId: req.params.clinicId });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const doctors = await Doctor.find({ clinicId: clinic.clinicId });
    res.json({ success: true, clinic, doctors });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/clinics
// @desc    Create or update clinic (Admin action)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clinicData = req.body;
    if (!clinicData.clinicId) {
      clinicData.clinicId = `CS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    const clinic = await Clinic.findOneAndUpdate(
      { clinicId: clinicData.clinicId },
      clinicData,
      { new: true, upsert: true }
    );

    res.json({ success: true, clinic });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/clinics/:clinicId/status
// @desc    Update clinic status (Admin action)
router.patch('/:clinicId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const clinic = await Clinic.findOneAndUpdate(
      { clinicId: req.params.clinicId },
      { status },
      { new: true }
    );

    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    res.json({ success: true, clinic });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/clinics/:clinicId/doctors
// @desc    Get doctors for a clinic
router.get('/:clinicId/doctors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await Doctor.find({ clinicId: req.params.clinicId });
    res.json({ success: true, doctors });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/clinics/:clinicId/doctors
// @desc    Add or update doctor for a clinic
router.post('/:clinicId/doctors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorData = req.body;
    doctorData.clinicId = req.params.clinicId;

    if (!doctorData.doctorId) {
      doctorData.doctorId = `DOC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { doctorId: doctorData.doctorId },
      doctorData,
      { new: true, upsert: true }
    );

    res.json({ success: true, doctor });
  } catch (err) {
    next(err);
  }
});

export default router;
