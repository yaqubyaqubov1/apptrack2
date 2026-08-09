import React, { useState } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('All Majors');
  const [univFilter, setUnivFilter] = useState('All Universities');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Sample student data matching your UI layout
  const students = [
    { id: 1, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', status: 'Private' },
    { id: 2, name: 'Narana Mansoh', major: 'Bioscience', status: 'Private' },
    { id: 3, name: 'Suhasen Derau', major: 'Bioscience', status: 'Public' },
  ];

  return (
    <div className="admin-container">
      {/* Header Navigation */}
      <header className="navbar">
        <div className="nav-left">
          <button className="nav-btn"><span className="icon">🏠</span> Home</button>
          <button className="nav-btn"><span className="icon">👤</span> Profile</button>
          <button className="nav-btn active"><span className="icon">🛡️</span> Admin Panel</button>
        </div>
        <div className="nav-right">
          <button className="nav-btn notification-btn">
            <span className="icon">🔔</span> Notifications
            <span className="badge">3</span>
          </button>
          <button className="nav-btn outline-btn">Sign out</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1 className="page-title">Student Manager</h1>

        {/* Analytics Charts Cards */}
        <div className="charts-grid">
          {/* Major Distribution */}
          <div className="chart-card">
            <h3>Major Distribution</h3>
            <div className="donut-chart-placeholder">
              <span className="chart-center-val">50%</span>
            </div>
            <ul className="chart-legend">
              <li><span className="legend-dot purple"></span> Computer Science <strong>50%</strong></li>
              <li><span className="legend-dot cyan"></span> Chemical Engineering <strong>17%</strong></li>
              <li><span className="legend-dot green"></span> Bioscience <strong>33%</strong></li>
            </ul>
          </div>

          {/* University Distribution */}
          <div className="chart-card">
            <h3>University Distribution</h3>
            <div className="donut-chart-placeholder">
              <span className="chart-center-val"></span>
            </div>
            <ul className="chart-legend">
              <li><span className="legend-dot purple"></span> Nanjing University <strong>50%</strong></li>
              <li><span className="legend-dot cyan"></span> Glasgow <strong>17%</strong></li>
              <li><span className="legend-dot green"></span> NYU <strong>33%</strong></li>
            </ul>
          </div>

          {/* Gender Distribution */}
          <div className="chart-card">
            <h3>Gender Distribution</h3>
            <div className="donut-chart-placeholder">
              <span className="chart-center-val">100%</span>
            </div>
            <ul className="chart-legend">
              <li><span className="legend-dot purple"></span> Male <strong>100%</strong></li>
              <li><span className="legend-dot light-gray"></span> Female <strong>0%</strong></li>
            </ul>
          </div>

          {/* Decision Rate */}
          <div className="chart-card">
            <h3>Decision Rate</h3>
            <div className="donut-chart-placeholder">
              <span className="chart-center-val">67%</span>
            </div>
            <ul className="chart-legend">
              <li><span className="legend-dot cyan"></span> Accepted <strong>67%</strong></li>
              <li><span className="legend-dot orange"></span> Waitlisted <strong>17%</strong></li>
              <li><span className="legend-dot green"></span> Pending <strong>17%</strong></li>
            </ul>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="filters-card">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <select value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)}>
            <option>All Majors</option>
            <option>Computer Science</option>
            <option>Chemical Engineering</option>
            <option>Bioscience</option>
          </select>

          <select value={univFilter} onChange={(e) => setUnivFilter(e.target.value)}>
            <option>All Universities</option>
            <option>Nanjing University</option>
            <option>Glasgow</option>
            <option>NYU</option>
          </select>

          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option>All Genders</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Private</option>
            <option>Public</option>
          </select>

          <button className="reset-btn">Reset Filters</button>
        </div>

        {/* Student Cards List */}
        <div className="students-grid">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <h4>{student.name}</h4>
                <p className="student-major">{student.major}</p>
              </div>
              <div className="student-actions">
                <span className={`status-badge ${student.status.toLowerCase()}`}>
                  🔒 {student.status}
                </span>
                <button className="edit-btn">
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn">Previous</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">Next</button>
        </div>
      </main>
    </div>
  );
}
