const {
  Patient,
  Appointment,
  PharmacySale,
  LabOrder,
  MedicineBatch,
  MedicineMaster,
  Doctor,
  Department,
  User,
} = require('../models');

// @desc    Get dashboard metrics and analytics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const branchFilter = req.query.branchId ? { branch: req.query.branchId } : {};

    // Today's date range (00:00:00 to 23:59:59)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Patient Stats
    const totalPatients = await Patient.countDocuments(branchFilter);
    const todayPatients = await Patient.countDocuments({
      ...branchFilter,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    // Outstanding patient balances
    const patientBalances = await Patient.aggregate([
      { $match: { ...branchFilter, outstandingBalance: { $gt: 0 } } },
      { $group: { _id: null, totalDue: { $sum: '$outstandingBalance' } } },
    ]);
    const totalOutstandingBalance = patientBalances[0]?.totalDue || 0;

    // 2. OPD & Appointments
    const todayAppointments = await Appointment.find({
      ...branchFilter,
      appointmentDate: { $gte: startOfToday, $lte: endOfToday },
    }).populate('patient doctor department');

    const opdSummary = {
      total: todayAppointments.length,
      waiting: todayAppointments.filter((a) => a.status === 'waiting').length,
      inConsultation: todayAppointments.filter((a) => a.status === 'in_consultation').length,
      completed: todayAppointments.filter((a) => a.status === 'completed').length,
    };

    // 3. Pharmacy Sales (Today)
    const todaySales = await PharmacySale.find({
      ...branchFilter,
      saleDate: { $gte: startOfToday, $lte: endOfToday },
    });

    const pharmacyTodayRevenue = todaySales.reduce((acc, sale) => acc + (sale.netAmount || 0), 0);
    const pharmacyTodayPaid = todaySales.reduce((acc, sale) => acc + (sale.paidAmount || 0), 0);
    const pharmacyTodayDue = todaySales.reduce((acc, sale) => acc + (sale.dueAmount || 0), 0);

    // 4. Lab Orders
    const labOrders = await LabOrder.find(branchFilter);
    const labSummary = {
      total: labOrders.length,
      pending: labOrders.filter((l) => l.overallStatus === 'pending').length,
      inProgress: labOrders.filter((l) => l.overallStatus === 'in_progress' || l.overallStatus === 'sample_collected').length,
      completed: labOrders.filter((l) => l.overallStatus === 'completed').length,
    };

    // 5. Inventory Valuation and Low Stock / Near Expiry Alerts
    const batches = await MedicineBatch.find(branchFilter).populate('medicine');
    
    let totalInventoryValue = 0;
    let totalPurchaseValue = 0;
    let lowStockCount = 0;
    let nearExpiryCount = 0;
    let expiredCount = 0;

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const now = new Date();

    const lowStockAlerts = [];
    const expiryAlerts = [];

    // Group stock by medicine for low stock checking
    const medicineStockMap = {};

    batches.forEach((b) => {
      const stock = b.currentStock || 0;
      totalInventoryValue += stock * (b.mrp || 0);
      totalPurchaseValue += stock * (b.purchasePrice || 0);

      const exp = new Date(b.expiryDate);
      if (exp < now && stock > 0) {
        expiredCount++;
        expiryAlerts.push({
          batchId: b._id,
          medicineName: b.medicine?.brandName || 'Unknown Medicine',
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          stock,
          status: 'EXPIRED',
        });
      } else if (exp <= ninetyDaysFromNow && stock > 0) {
        nearExpiryCount++;
        expiryAlerts.push({
          batchId: b._id,
          medicineName: b.medicine?.brandName || 'Unknown Medicine',
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          stock,
          status: 'NEAR_EXPIRY',
        });
      }

      if (b.medicine) {
        const medId = b.medicine._id.toString();
        if (!medicineStockMap[medId]) {
          medicineStockMap[medId] = {
            medicine: b.medicine,
            totalStock: 0,
          };
        }
        medicineStockMap[medId].totalStock += stock;
      }
    });

    Object.values(medicineStockMap).forEach((item) => {
      const minAlert = item.medicine.minStockAlert || 20;
      if (item.totalStock <= minAlert) {
        lowStockCount++;
        lowStockAlerts.push({
          medicineId: item.medicine._id,
          brandName: item.medicine.brandName,
          genericName: item.medicine.genericName,
          dosageForm: item.medicine.dosageForm,
          currentStock: item.totalStock,
          minStockAlert: minAlert,
        });
      }
    });

    // 6. Last 7 Days Revenue Trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysSales = await PharmacySale.aggregate([
      {
        $match: {
          ...branchFilter,
          saleDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          totalSales: { $sum: '$netAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 7. Recent OPD Queue (Waiting & In Consultation)
    const activeOpdQueue = await Appointment.find({
      ...branchFilter,
      appointmentDate: { $gte: startOfToday, $lte: endOfToday },
    })
      .populate('patient', 'mrn fullName phone age gender')
      .populate('doctor')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('department', 'name')
      .sort({ tokenNumber: 1 })
      .limit(10);

    // 8. Recent Pharmacy Invoices
    const recentPharmacySales = await PharmacySale.find(branchFilter)
      .populate('patient', 'fullName mrn')
      .populate('dispensedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          todayPatients,
          totalPatients,
          opdSummary,
          pharmacy: {
            todayRevenue: pharmacyTodayRevenue,
            todayPaid: pharmacyTodayPaid,
            todayDue: pharmacyTodayDue,
            salesCount: todaySales.length,
          },
          outstandingBalance: totalOutstandingBalance,
          labSummary,
          inventory: {
            totalInventoryValue,
            totalPurchaseValue,
            lowStockCount,
            nearExpiryCount,
            expiredCount,
          },
        },
        lowStockAlerts: lowStockAlerts.slice(0, 5),
        expiryAlerts: expiryAlerts.slice(0, 5),
        sevenDaysTrend: last7DaysSales,
        activeOpdQueue,
        recentPharmacySales,
      },
    });
  } catch (error) {
    next(error);
  }
};
