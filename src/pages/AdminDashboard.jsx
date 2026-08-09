import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Home,
  User,
  Shield,
  Bell,
  LogOut,
  Search,
  Lock,
  Globe,
  Edit2,
  Info
} from 'lucide-react'

// --- Mock Data Matching Design ---
const majorData = [
  { name: 'Computer Science', value: 50, color: '#8b5cf6' },
  { name: 'Chemical Engineering', value: 17, color: '#06b6d4' },
  { name: 'Bioscience', value: 33, color: '#22c55e' }
]

const universityData = [
  { name: 'Nanjing University', value: 50, color: '#8b5cf6' },
  { name: 'Glasgow', value: 17, color: '#06b6d4' },
  { name: 'NYU', value: 33, color: '#22c55e' }
]

const genderData = [
  { name: 'Male', value: 100, color: '#8b5cf6' },
  { name: 'Female', value: 0, color: '#e2e8f0' }
]

const decisionData = [
  { name: 'Accepted', value: 67, color: '#06b6d4' },
  { name: 'Waitlisted', value: 17, color: '#eab308' },
  { name: 'Pending', value: 17, color: '#8b5cf6' }
]

const studentsList = [
  { id: 1, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', isPrivate: true },
  { id: 2, name: 'Narana Mansoh', major: 'Bioscience', isPrivate: true },
  { id: 3, name: 'Suhasen Derau', major: 'Bioscience', isPrivate: false },
  { id: 4, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', isPrivate: true },
  { id: 5, name: 'Ronaldd Mansoh', major: 'Bioscience', isPrivate: true },
  { id: 6, name: 'Suhasen Derau', major: 'Bioscience', isPrivate: false }
]

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedMajor('')
    setSelectedUniversity('')
    setSelectedGender('')
    setSelectedStatus('')
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem 3rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── Top Header Navigation Bar ──────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/home-page" style={navTabStyle(false)}>
            <Home size={16} />
            Home
          </Link>
          <Link to="/student" style={navTabStyle(false)}>
            <User size={16} />
            Profile
          </Link>
          <Link to="/admin" style={navTabStyle(true)}>
            <Shield size={16} />
            Admin Panel
          </Link>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button style={actionBtnStyle}>
            <Bell size={16} />
            Notifications
            <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 'bold' }}>3</span>
          </button>
          <button style={{ ...actionBtnStyle, backgroundColor: '#fff' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main Title */}
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>
        Student Manager
      </h1>

      {/* ── Donut Charts Section ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Major Distribution */}
        <ChartCard title="Major Distribution">
          <DonutChart data={majorData} innerRadius={35} outerRadius={55} />
          <ChartLegend items={majorData} />
        </ChartCard>

        {/* University Distribution */}
        <ChartCard title="University Distribution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
            {universityData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
          <ChartLegend items={universityData} />
        </ChartCard>

        {/* Gender Distribution */}
        <ChartCard title="Gender Distribution">
          <DonutChart data={genderData} innerRadius={35} outerRadius={55} centerLabel="100%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              Male 100%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #94a3b8' }} />
              Female 0%
            </div>
          </div>
        </ChartCard>

        {/* Decision Rate */}
        <ChartCard title="Decision Rate">
          <DonutChart data={decisionData} innerRadius={35} outerRadius={55} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
            <LegendRow color="#06b6d4" label="Accepted" value="67%" />
            <LegendRow color="#eab308" label="Waitlisted" value="17%" hasTooltip />
            <LegendRow color="#8b5cf6" label="Pending" value="17%" />
          </div>
        </ChartCard>

      </div>

      {/* ── Search & Filter Controls Section ──────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={filterInputStyle}
          />
        </div>

        <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} style={selectStyle}>
          <option value="">All Majors</option>
          <option value="Bioscience">Bioscience</option>
          <option value="Computer Science">Computer Science</option>
        </select>

        <select value={selectedUniversity} onChange={(e) => setSelectedUniversity(e.target.value)} style={selectStyle}>
          <option value="">All Universities</option>
          <option value="NYU">NYU</option>
          <option value="Glasgow">Glasgow</option>
        </select>

        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} style={selectStyle}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="Accepted">Accepted</option>
          <option value="Waitlisted">Waitlisted</option>
        </select>

        <button onClick={handleResetFilters} style={resetBtnStyle}>
          Reset Filters
        </button>
      </div>

      {/* ── Student Cards Grid ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {studentsList.map((student) => (
          <div key={student.id} style={studentCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{student.name}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{student.major}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={badgeStyle(student.isPrivate)}>
                  {student.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                  {student.isPrivate ? 'Private' : 'Public'}
                </span>
                <button style={editButtonStyle}>
                  <Edit2 size={12} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>Previous</button>
        <span style={{ backgroundColor: '#8b5cf6', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          1
        </span>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>Next</button>
      </div>

    </div>
  )
}

// ── Supporting Helper Components & Styles ────────────────────────────

function ChartCard({ title, children }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, textAlign: 'center', color: '#1e293b' }}>{title}</h3>
      {children}
    </div>
  )
}

function DonutChart({ data, innerRadius, outerRadius, centerLabel }) {
  return (
    <div style={{ width: '100%', height: 130, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 700, fontSize: '0.85rem' }}>
          {centerLabel}
        </div>
      )}
    </div>
  )
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
            {item.name}
          </span>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  )
}

function LegendRow({ color, label, value, hasTooltip }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
        {value}
        {hasTooltip && <Info size={13} style={{ color: '#64748b', cursor: 'pointer' }} />}
      </span>
    </div>
  )
}

const navTabStyle = (isActive) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1.25rem',
  borderRadius: '0.75rem',
  backgroundColor: isActive ? '#e2e8f0' : '#ffffff',
  color: isActive ? '#0f172a' : '#475569',
  fontWeight: isActive ? 700 : 500,
  textDecoration: 'none',
  fontSize: '0.9rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
})

const actionBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1.25rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer'
}

const filterInputStyle = {
  width: '100%',
  padding: '0.6rem 1rem 0.6rem 2.25rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none'
}

const selectStyle = {
  padding: '0.6rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none',
  color: '#334155'
}

const resetBtnStyle = {
  padding: '0.6rem 1.25rem',
  borderRadius: '0.75rem',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  color: '#0f172a'
}

const studentCardStyle = {
  backgroundColor: '#f5f3ff',
  borderRadius: '1.25rem',
  padding: '1.25rem',
  border: '1px solid #ede9fe'
}

const badgeStyle = (isPrivate) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.2rem 0.6rem',
  borderRadius: '999px',
  backgroundColor: isPrivate ? '#fef3c7' : '#dcfce7',
  color: isPrivate ? '#92400e' : '#166534',
  fontSize: '0.75rem',
  fontWeight: 600
})

const editButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: '#475569'
}
