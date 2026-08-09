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

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

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

function DonutChartCard({ title, data }) {
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
    : '#e5e7eb'

  const primaryStat = data[0] ? `${data[0].percent}%` : ''

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="donut-wrap">
        <div className="donut-chart" style={{ background: gradient }}>
          <div className="donut-hole">{primaryStat}</div>
        </div>
      </div>
      <ul className="chart-legend">
        {data.map((item) => (
          <li key={item.label}>
            <span className="dot" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}</span>
            <strong>{item.percent}%</strong>
          </li>
        ))}
      </ul>
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
    <div className="admin-page">
      {/* Top Navbar */}
      <header className="admin-nav">
        <div className="nav-group-left">
          <button className="nav-link-btn" onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button className="nav-link-btn" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <button
            className={`nav-link-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            🛡️ Admin Panel
          </button>
        </div>
        <div className="nav-group-right">
          <button className="notif-btn" onClick={() => setActiveTab('notifications')}>
            🔔 Notifications
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          <button className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        <h1 className="dash-title">Student Manager</h1>

        {/* Analytics Section (4 Donut Cards) */}
        <div className="charts-row">
          <DonutChartCard title="Major Distribution" data={majorDistribution} />
          <DonutChartCard title="University Distribution" data={universityDistribution} />
          <DonutChartCard title="Gender Distribution" data={genderDistribution} />
          <DonutChartCard title="Decision Rate" data={decisionDistribution} />
        </div>

        {/* Filters Bar */}
        <div className="filters-card">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
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

          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>

        {/* Student Cards List */}
        <div className="students-grid">
          {paginatedStudents.map((student) => {
            const isPublic = student.visibility?.profile === 'public'
            return (
              <div key={student.id} className="student-card">
                <div className="student-details">
                  <h4 className="student-name">{student.fullName}</h4>
                  <span className="student-major">{student.major || 'No Major'}</span>
                </div>
                <div className="student-actions">
                  <span className={`status-pill ${isPublic ? 'public' : 'private'}`}>
                    {isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                  <button className="edit-btn" onClick={() => openDrawer(student)}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className="p-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`p-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="p-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </main>

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
