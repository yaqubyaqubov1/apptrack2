import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import Avatar from '../components/Avatar'
import '../components/Avatar.css'
import { useAuth } from '../context/AuthContext'
import PublicStudentDrawer from '../components/PublicStudentDrawer'
import {
  useStudents,
  setProfile,
  setPhoto,
  removePhoto,
  setVisibility,
  updateNotes,
  saveApplication,
  deleteApplication,
  setApplicationVisibility,
  uploadApplicationFile,
  removeApplicationFile,
  saveLicense,
  deleteLicense,
  setLicenseVisibility,
  uploadLicenseMediaFile,
  deleteLicenseMediaFile,
  fileToDataUrl,
  deleteStudent,
  notifyDataChanged,
} from '../store/studentsStore'

function loadPersisted(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    // storage unavailable — use fallback
  }
  return fallback
}

function savePersisted(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full / blocked — ignore
  }
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#eab308', '#ef4444', '#3b82f6', '#ec4899']

function toPercentMap(countsObj) {
  const entries = Object.entries(countsObj)
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  return entries.map(([label, value], index) => ({
    label,
    value,
    percent: total ? Math.round((value / total) * 100) : 0,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }))
}

function buildCounts(list, key) {
  return list.reduce((acc, item) => {
    const value = item[key] || 'Unspecified'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function DonutChartCard({ title, data, hasTooltip }) {
  const gradient = data.length
    ? `conic-gradient(${data
        .map((item, index) => {
          const previous = data
            .slice(0, index)
            .reduce((sum, current) => sum + current.percent, 0)
          const currentEnd = previous + item.percent
          return `${item.color} ${previous}% ${currentEnd}%`
        })
        .join(', ')})`
    : '#e2e8f0'

  const primaryStat = data[0] ? `${data[0].percent}%` : ''

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-box">
        <div className="custom-donut-chart" style={{ background: gradient }}>
          <div className="custom-donut-hole">{primaryStat}</div>
        </div>
      </div>
      <ul className="legend-list">
        {data.map((item) => (
          <li key={item.label} className="legend-item">
            <span className="dot" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}</span>
            <span className="bold-percent">{item.percent}%</span>
          </li>
        ))}
      </ul>
      {hasTooltip && (
        <div className="tooltip-popup">
          Applications with no current decision
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const students = useStudents()

  const [activeTab, setActiveTab] = useState('students')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [majorFilter, setMajorFilter] = useState('')
  const [universityFilter, setUniversityFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9

  // Notifications state
  const [notifications, setNotifications] = useState(() =>
    loadPersisted('apptrack_admin_notifications', [])
  )

  useEffect(() => {
    savePersisted('apptrack_admin_notifications', notifications)
  }, [notifications])

  const unreadCount = notifications.filter((n) => n.status === 'unread' || n.status === 'pending').length

  // Filter options derived from actual student data
  const majorsList = useMemo(
    () => Array.from(new Set(students.map((s) => s.major).filter(Boolean))),
    [students]
  )
  const univsList = useMemo(
    () => Array.from(new Set(students.map((s) => s.university).filter(Boolean))),
    [students]
  )

  // Chart distributions computed dynamically from store
  const majorDistribution = useMemo(
    () => toPercentMap(buildCounts(students, 'major')),
    [students]
  )
  const universityDistribution = useMemo(
    () => toPercentMap(buildCounts(students, 'university')),
    [students]
  )
  const genderDistribution = useMemo(
    () => toPercentMap(buildCounts(students, 'gender')),
    [students]
  )

  const decisionDistribution = useMemo(() => {
    const allApps = students.flatMap((s) => s.applications || [])
    return toPercentMap(buildCounts(allApps, 'decision'))
  }, [students])

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.major?.toLowerCase().includes(q)

      const matchMajor = !majorFilter || s.major === majorFilter
      const matchUniv = !universityFilter || s.university === universityFilter
      const matchGender = !genderFilter || s.gender === genderFilter
      const matchStatus =
        !statusFilter || s.visibility?.profile === statusFilter.toLowerCase()

      return matchSearch && matchMajor && matchUniv && matchGender && matchStatus
    })
  }, [students, searchQuery, majorFilter, universityFilter, genderFilter, statusFilter])

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchQuery('')
    setMajorFilter('')
    setUniversityFilter('')
    setGenderFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const openDrawer = (student) => {
    setSelectedStudent(student)
    setDrawerOpen(true)
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <header>
        <div className="nav-left">
          <button className="nav-btn" onClick={() => navigate('/')}>
            <span>🏠</span> Home
          </button>
          <button className="nav-btn" onClick={() => navigate('/profile')}>
            <span>👤</span> Profile
          </button>
          <button
            className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <span>🛡️</span> Admin Panel
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => setActiveTab('notifications')}>
            <span>🔔</span> Notifications{' '}
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>
          <button className="nav-btn btn-signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main Title */}
      <h1 className="page-title">Student Manager</h1>

      {/* Analytics Section / Charts */}
      <div className="charts-grid">
        <DonutChartCard title="Major Distribution" data={majorDistribution} />
        <DonutChartCard title="University Distribution" data={universityDistribution} />
        <DonutChartCard title="Gender Distribution" data={genderDistribution} />
        <DonutChartCard title="Decision Rate" data={decisionDistribution} hasTooltip={true} />
      </div>

      {/* Filters Section */}
      <div className="filter-card">
        <div className="filter-controls">
          <div className="search-wrapper">
            <span className="search-icon-symbol">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <select
            className="filter-select"
            value={majorFilter}
            onChange={(e) => {
              setMajorFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Majors</option>
            {majorsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={universityFilter}
            onChange={(e) => {
              setUniversityFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Universities</option>
            {univsList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Statuses</option>
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>

          <button className="btn-reset" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Student Grid */}
      <div className="students-grid">
        {paginatedStudents.map((student) => {
          const isPublic = student.visibility?.profile === 'public'
          return (
            <div key={student.id} className="student-card">
              <div className="card-top-actions">
                <span className="badge-status">
                  <span style={{ fontSize: '10px', color: isPublic ? '#eab308' : '#475569' }}>
                    {isPublic ? '🌐' : '🔒'}
                  </span>{' '}
                  {isPublic ? 'Public' : 'Private'}
                </span>
                <button className="edit-btn" onClick={() => openDrawer(student)}>
                  ✏️ Edit
                </button>
              </div>
              <div>
                <div className="student-name">{student.fullName}</div>
                <div className="student-major">{student.major || 'No Major'}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <div className="page-num">{currentPage}</div>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Drawer for detailed viewing & editing */}
      <PublicStudentDrawer
        open={drawerOpen}
        student={selectedStudent}
        onClose={() => setDrawerOpen(false)}
        isAdmin={true}
        onSaveProfile={setProfile}
        onSetPhoto={setPhoto}
        onRemovePhoto={removePhoto}
        onSetVisibility={setVisibility}
        onUpdateNotes={updateNotes}
        onSaveApplication={saveApplication}
        onDeleteApplication={deleteApplication}
        onSetApplicationVisibility={setApplicationVisibility}
        onUploadApplicationFile={uploadApplicationFile}
        onRemoveApplicationFile={removeApplicationFile}
        onSaveLicense={saveLicense}
        onDeleteLicense={deleteLicense}
        onSetLicenseVisibility={setLicenseVisibility}
        onUploadLicenseMediaFile={uploadLicenseMediaFile}
        onDeleteLicenseMediaFile={deleteLicenseMediaFile}
        onDeleteStudent={deleteStudent}
        onNotifyChange={notifyDataChanged}
      />
    </div>
  )
}
