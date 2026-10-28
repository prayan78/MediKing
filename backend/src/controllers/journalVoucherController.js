const JournalVoucher = require('../models/JournalVoucher');

const branchFilter = (req) => (req.user?.branch?._id || req.user?.branch
  ? { branch: req.user.branch._id || req.user.branch }
  : {});

const nextVoucherNumber = async () => {
  const latest = await JournalVoucher.findOne({ voucherNo: /^JV-\d+$/ })
    .sort({ createdAt: -1 })
    .select('voucherNo');
  const lastNumber = Number(latest?.voucherNo?.match(/\d+$/)?.[0] || 0);
  return `JV-${String(lastNumber + 1).padStart(6, '0')}`;
};

exports.getNextVoucherNumber = async (req, res, next) => {
  try {
    res.json({ success: true, nextVoucherNo: await nextVoucherNumber() });
  } catch (error) {
    next(error);
  }
};

exports.createJournalVoucher = async (req, res, next) => {
  try {
    const { fiscalYear, voucherDate, voucherDateBs, lines } = req.body;
    if (!fiscalYear || !voucherDate || Number.isNaN(Date.parse(voucherDate))
      || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Fiscal year, voucher date, and at least two journal lines are required.',
      });
    }

    const normalizedLines = lines.map((line) => ({
      accountCode: String(line.accountCode || '').trim(),
      accountName: String(line.accountName || '').trim(),
      narration: String(line.narration || '').trim(),
      billDate: line.billDate || undefined,
      debit: Number(line.debit) || 0,
      credit: Number(line.credit) || 0,
    }));
    if (normalizedLines.some((line) => !line.accountCode || !line.accountName
      || line.debit < 0 || line.credit < 0
      || (line.debit > 0 && line.credit > 0)
      || (!line.debit && !line.credit))) {
      return res.status(400).json({
        success: false,
        message: 'Each line needs an account and exactly one positive debit or credit amount.',
      });
    }

    const totalDebit = normalizedLines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = normalizedLines.reduce((sum, line) => sum + line.credit, 0);
    if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
      return res.status(400).json({ success: false, message: 'Total debit and credit must be equal.' });
    }

    const data = await JournalVoucher.create({
      voucherNo: await nextVoucherNumber(),
      fiscalYear,
      voucherDate: new Date(voucherDate),
      voucherDateBs,
      lines: normalizedLines,
      totalDebit,
      totalCredit,
      username: req.user?.name || req.user?.username || 'ADMINISTRATOR',
      branch: req.user?.branch?._id || req.user?.branch,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getAccountHeads = async (req, res, next) => {
  try {
    const accounts = await JournalVoucher.aggregate([
      { $match: branchFilter(req) },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.accountCode',
          accountCode: { $first: '$lines.accountCode' },
          accountName: { $first: '$lines.accountName' },
        },
      },
      { $sort: { accountCode: 1 } },
    ]);
    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.getStatement = async (req, res, next) => {
  try {
    const { from, to, accountCode } = req.query;
    if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))
      || new Date(from) > new Date(to)) {
      return res.status(400).json({ success: false, message: 'A valid date range is required.' });
    }

    const scope = branchFilter(req);
    const vouchers = await JournalVoucher.find({
      ...scope,
      voucherDate: { $lte: new Date(`${to}T23:59:59.999`) },
      ...(accountCode ? { 'lines.accountCode': accountCode } : {}),
    }).sort({ voucherDate: 1, voucherNo: 1 });

    let openingDebit = 0;
    let openingCredit = 0;
    const openingBalances = {};
    const entries = [];
    for (const voucher of vouchers) {
      const dateKey = new Date(voucher.voucherDate).toISOString().slice(0, 10);
      for (const line of voucher.lines) {
        if (accountCode && line.accountCode !== accountCode) continue;
        if (dateKey < from) {
          openingDebit += line.debit;
          openingCredit += line.credit;
          if (!openingBalances[line.accountCode]) {
            openingBalances[line.accountCode] = {
              accountCode: line.accountCode,
              accountName: line.accountName,
              debit: 0,
              credit: 0,
            };
          }
          openingBalances[line.accountCode].debit += line.debit;
          openingBalances[line.accountCode].credit += line.credit;
        } else if (dateKey <= to) {
          entries.push({
            voucherNo: voucher.voucherNo,
            voucherDate: voucher.voucherDate,
            voucherDateBs: voucher.voucherDateBs,
            accountCode: line.accountCode,
            accountName: line.accountName,
            narration: line.narration,
            debit: line.debit,
            credit: line.credit,
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        openingDebit,
        openingCredit,
        openingBalances: Object.values(openingBalances),
        entries,
        totalDebit: entries.reduce((sum, entry) => sum + entry.debit, 0),
        totalCredit: entries.reduce((sum, entry) => sum + entry.credit, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};
