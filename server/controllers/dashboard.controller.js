const { Op, fn, col, literal } = require('sequelize');
const Resident  = require('../models/Resident');
const Document  = require('../models/Document');
const Blotter   = require('../models/Blotter');
const Official  = require('../models/Official');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const [totalResidents, activeResidents, seniorCitizens, indigents,
           pendingDocuments, releasedDocuments, openBlotters, totalOfficials] = await Promise.all([
      Resident.count(),
      Resident.count({ where: { status: 'Active' } }),
      Resident.count({ where: { isSeniorCitizen: true } }),
      Resident.count({ where: { isIndigent: true } }),
      Document.count({ where: { status: 'Pending' } }),
      Document.count({ where: { status: 'Released' } }),
      Blotter.count({ where: { status: 'Open' } }),
      Official.count({ where: { status: 'Active' } }),
    ]);
    res.json({ success: true, data: { totalResidents, activeResidents, seniorCitizens, indigents, pendingDocuments, releasedDocuments, openBlotters, totalOfficials } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/monthly
const getMonthlyData = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const docResults = await Document.findAll({
      attributes: [
        [fn('EXTRACT', literal(`MONTH FROM "createdAt"`)), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: new Date(`${year}-01-01`), [Op.lte]: new Date(`${year}-12-31`) } },
      group: [fn('EXTRACT', literal(`MONTH FROM "createdAt"`))],
      raw: true,
    });

    const blotterResults = await Blotter.findAll({
      attributes: [
        [fn('EXTRACT', literal(`MONTH FROM "createdAt"`)), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: new Date(`${year}-01-01`), [Op.lte]: new Date(`${year}-12-31`) } },
      group: [fn('EXTRACT', literal(`MONTH FROM "createdAt"`))],
      raw: true,
    });

    const docMap     = {};
    const blotterMap = {};
    docResults.forEach(r     => { docMap[parseInt(r.month)]     = parseInt(r.count); });
    blotterResults.forEach(r => { blotterMap[parseInt(r.month)] = parseInt(r.count); });

    const data = months.map((month, i) => ({
      month,
      documents: docMap[i + 1]     || 0,
      blotters:  blotterMap[i + 1] || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getMonthlyData };
