const mongoose = require('mongoose');

const JobsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    departmentCode: { type: String, required: true },
    date: { type: Date, required: true },
    totalCount: { type: String, required: true },
  },
  { collection: 'jobs' }
);

const DepartmentSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    hasRead: { type: Boolean, required: true },
    departmentCode: { type: String, required: true },
    jobId: { type: String, ref: 'Job' },
  },
  { collection: 'departments' }
);

const Jobs = mongoose.model('Job', JobsSchema);
const Departments = mongoose.model('Department', DepartmentSchema);

module.exports = {Jobs, Departments};
