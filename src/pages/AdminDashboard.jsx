import React, { useState } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('All Majors');
  const [univFilter, setUnivFilter] = useState('All Universities');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Sample student list matching the layout structure
  const students = [
    { id: 1, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', status: 'Private' },
    { id: 2, name: 'Narana Mansoh', major: 'Bioscience', status: 'Private' },
    { id: 3, name: 'Suhasen Derau', major: 'Bioscience', status: 'Public' },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setMajorFilter('All Majors');
    setUnivFilter('All Universities');
    setGenderFilter('All Genders');
    setStatusFilter('All Statuses');
  };

  return (
    <div className="admin-page">
      {/* Top Navbar */}
      <header className="admin-nav">
        <div className="nav-group-left">
          <button className="nav-link-btn">🏠 Home</button>
          <button className="nav-link-btn">👤 Profile</button>
          <button className="nav-link-btn active">🛡️ Admin Panel</button>
        </div>
        <div className="nav-group-right">
          <button className="notif-btn">
            🔔 Notifications
            <span className="notif-badge">3</span>
          </button>
          <button className="signout-btn">Sign out</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        <h1 className="dash-title">Student Manager</h1>

        {/* Analytics Section (4 Donut Cards) */}
        <div className="charts-row">
          {/* Major Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">Major Distribution</h3>
            <div className="donut-wrap">
              <div className="donut-chart major-donut">
                <div className="donut-hole">50%</div>
              </div>
            </div>
            <ul className="chart-legend">
              <li><span className="dot purple"></span> Computer Science <strong>50%</strong></li>
              <li><span className="dot cyan"></span> Chemical Engineering <strong>17%</strong></li>
              <li><span className="dot green"></span> Bioscience <strong>33%</strong></li>
            </ul>
          </div>

          {/* University Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">University Distribution</h3>
            <div className="donut-wrap">
              <div className="donut-chart univ-donut">
                <div className="donut-hole"></div>
              </div>
            </div>
            <ul className="chart-legend">
              <li><span className="dot purple"></span> Nanjing University <strong>50%</strong></li>
              <li><span className="dot cyan"></span> Glasgow <strong>17%</strong></li>
              <li><span className="dot green"></span> NYU <strong>33%</strong></li>
            </ul>
          </div>

          {/* Gender Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">Gender Distribution</h3>
            <div className="donut-wrap">
              <div className="donut-chart gender-donut">
                <div className="donut-hole">100%</div>
              </div>
            </div>
            <ul className="chart-legend">
              <li><span className="dot purple"></span> Male <strong>100%</strong></li>
              <li><span className="dot gray"></span> Female <strong>0%</strong></li>
            </ul>
          </div>

          {/* Decision Rate */}
          <div className="chart-card">
            <h3 className="chart-title">Decision Rate</h3>
            <div className="donut-wrap">
              <div className="donut-chart decision-donut">
                <div className="donut-hole">67%</div>
              </div>
            </div>
            <ul className="chart-legend">
              <li><span className="dot cyan"></span> Accepted <strong>67%</strong></li>
              <li><span className="dot orange"></span> Waitlisted <strong>17%</strong></li>
              <li><span className="dot green"></span> Pending <strong>17%</strong></li>
            </ul>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-card">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="filter-select" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)}>
            <option>All Majors</option>
            <option>Computer Science</option>
            <option>Chemical Engineering</option>
            <option>Bioscience</option>
          </select>

          <select className="filter-select" value={univFilter} onChange={(e) => setUnivFilter(e.target.value)}>
            <option>All Universities</option>
            <option>Nanjing University</option>
            <option>Glasgow</option>
            <option>NYU</option>
          </select>

          <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option>All Genders</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Private</option>
            <option>Public</option>
          </select>

          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>

        {/* Student Cards List */}
        <div className="students-grid">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-details">
                <h4 className="student-name">{student.name}</h4>
                <span className="student-major">{student.major}</span>
              </div>
              <div className="student-actions">
                <span className={`status-pill ${student.status.toLowerCase()}`}>
                  🔒 {student.status}
                </span>
                <button className="edit-btn">✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="pagination-wrapper">
          <button className="p-btn">Previous</button>
          <button className="p-btn active">1</button>
          <button className="p-btn">Next</button>
        </div>
      </main>
    </div>
  );
}
