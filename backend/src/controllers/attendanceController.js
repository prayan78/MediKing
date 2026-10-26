const User = require('../models/User');
const WeeklyRoster = require('../models/WeeklyRoster');

const SHIFT_CODES = new Set(['2', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'R']);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};

const getBranchId = (user) => user.branch?._id || user.branch;

exports.getWeeklyRoster = async (req, res, next) => {
  try {
    const weekStart = parseDate(req.query.weekStart);
    if (!weekStart) {
      return res.status(400).json({ success: false, message: 'A valid weekStart date (YYYY-MM-DD) is required.' });
    }

    const branch = getBranchId(req.user);
    if (!branch) {
      return res.json({ success: true, data: [] });
    }

    const [employees, rosters] = await Promise.all([
      User.find({ isActive: true, $or: [{ branch }, { assignedBranches: branch }] })
        .select('name username role department')
        .populate('department', 'name')
        .sort({ name: 1 })
        .lean(),
      WeeklyRoster.find({ branch, weekStart })
        .populate('employee', 'name username role')
        .lean(),
    ]);
    const rosterByEmployee = new Map(
      rosters.filter((roster) => roster.employee)
        .map((roster) => [roster.employee._id.toString(), roster])
    );

    res.json({
      success: true,
      data: employees.map((employee) => {
        const roster = rosterByEmployee.get(employee._id.toString());
        return {
          employee: {
            id: employee._id,
            code: employee.username,
            name: employee.name,
            role: employee.role,
            department: employee.department?.name || '',
          },
          department: roster?.department || employee.department?.name || '',
          shifts: roster?.shifts || [],
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

exports.saveWeeklyRoster = async (req, res, next) => {
  try {
    const { employeeId, weekStart: weekStartValue, department = '', shifts } = req.body;
    const weekStart = parseDate(weekStartValue);
    if (!weekStart) {
      return res.status(400).json({ success: false, message: 'A valid weekStart date (YYYY-MM-DD) is required.' });
    }
    if (!employeeId || !Array.isArray(shifts) || shifts.length !== 7) {
      return res.status(400).json({ success: false, message: 'Select an employee and provide seven daily shifts.' });
    }
    if (typeof department !== 'string' || department.length > 120) {
      return res.status(400).json({ success: false, message: 'Department must be 120 characters or fewer.' });
    }

    const branch = getBranchId(req.user);
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Select a branch before saving the roster.' });
    }
    const employeeQuery = {
      _id: employeeId,
      isActive: true,
      $or: [{ branch }, { assignedBranches: branch }],
    };
    const employee = await User.findOne(employeeQuery).select('_id');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Active employee not found in this branch.' });
    }

    const normalizedShifts = shifts.map((day) => {
      if (!day || !TIME_PATTERN.test(day.inTime) || !TIME_PATTERN.test(day.outTime)
        || !SHIFT_CODES.has(day.shift)) {
        return null;
      }
      return {
        inTime: day.inTime,
        outTime: day.outTime,
        shift: day.shift,
        offDay: Boolean(day.offDay),
        holiday: Boolean(day.holiday),
        leave: Boolean(day.leave),
      };
    });
    if (normalizedShifts.some((day) => day === null)) {
      return res.status(400).json({ success: false, message: 'Each roster day needs valid times and a supported shift code.' });
    }

    const roster = await WeeklyRoster.findOneAndUpdate(
      { branch, employee: employee._id, weekStart },
      { $set: { department: department.trim(), shifts: normalizedShifts } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: 'Weekly roster saved successfully.', data: roster });
  } catch (error) {
    next(error);
  }
};
