import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  User,
  Shield,
  Bell,
  Search,
  Lock,
  Pencil,
  Info
} from 'lucide-react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedUni, setSelectedUni] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    // Custom Center Text Plugin for Chart.js
    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw(chart) {
        const { width, height, ctx } = chart
        ctx.restore()
        const fontSize = (height / 114).toFixed(2)
        ctx.font = `bold ${fontSize}em sans-serif`
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#0f172a'

        const text = chart.config.options.plugins.centerText?.text || ''
        const textX = Math.round((width - ctx.measureText(text).width) / 2)
        const textY = height / 2

        ctx.fillText(text, textX, textY)
        ctx.save()
      }
    }

    Chart.register(centerTextPlugin)

    const commonOptions = {
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }

    // Chart 1: Major
    const majorCtx = document.getElementById('majorChart')
    const majorChart = new Chart(majorCtx, {
      type: 'doughnut',
      data: {
        labels: ['Computer Science', 'Chemical Engineering', 'Bioscience'],
        datasets: [{
          data: [50, 17, 33],
          backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        ...commonOptions,
        plugins: { ...commonOptions.plugins, centerText: { text: '50%' } }
      }
    })

    // Chart 2: University
    const uniCtx = document.getElementById('uniChart')
    const uniChart = new Chart(uniCtx, {
      type: 'doughnut',
      data: {
        labels: ['Nanjing University', 'Glasgow', 'NYU'],
        datasets: [{
          data: [50, 17, 33],
          backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981'],
          borderWidth: 0
        }]
      },
      options: commonOptions
    })

    // Chart 3: Gender
    const genderCtx = document.getElementById('genderChart')
    const genderChart = new Chart(genderCtx, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: [100, 0],
          backgroundColor: ['#8b5cf6', '#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: {
        ...commonOptions,
        plugins: { ...commonOptions.plugins, centerText: { text: '100%' } }
      }
    })

    // Chart 4: Decision
    const decisionCtx = document.getElementById('decisionChart')
    const decisionChart = new Chart(decisionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Accepted', 'Waitlisted', 'Pending'],
        datasets: [{
          data: [67, 17, 17],
          backgroundColor: ['#06b6d4', '#8b5cf6', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        ...commonOptions,
        plugins: { ...commonOptions.plugins, centerText: { text: '67%' } }
      }
    })

    return () => {
      majorChart.destroy()
      uniChart.destroy()
      genderChart.destroy()
      decisionChart.destroy()
    }
  }, [])

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedMajor('')
    setSelectedUni('')
    setSelectedGender('')
    setSelectedStatus('')
  }

  const students = [
    { id: 1, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', isPrivate: true },
    { id: 2, name: 'Narana Mansoh', major: 'Bioscience', isPrivate: true },
    { id: 3, name: 'Suhasen Derau', major: 'Bioscience', isPrivate: false },
    { id: 4, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', isPrivate: true },
    { id: 5, name: 'Ronaldd Mansoh', major: 'Bioscience', isPrivate: true },
    { id: 6, name: 'Suhasen Derau', major: 'Bioscience', isPrivate: false }
  ]

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedMajor === '' || student.major === selectedMajor) &&
    (selectedStatus === '' || (selectedStatus === 'Private' ? student.isPrivate : !student.isPrivate))
  )

  return (
    <div style={{ backgroundColor: '#f3f4f8', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Header Navigation */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/home-page" style={navBtnStyle(false)}><Home size={16} /> Home</Link>
            <Link to="/student" style={navBtnStyle(false)}><User size={16} /> Profile</Link>
            <Link to="/admin" style={navBtnStyle(true)}><Shield size={16} /> Admin Panel</Link>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={navBtnStyle(false)}>
              <Bell size={16} /> Notifications
              <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>3</span>
            </button>
            <button style={{ ...navBtnStyle(false), fontWeight: 600, color: '#0f172a' }}>Sign out</button>
          </div>
        </header>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#000' }}>Student Manager</h1>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Major Distribution</h3>
            <div style={{ width: '140px', height: '140px', position: 'relative', marginBottom: '1rem' }}>
              <canvas id="majorChart"></canvas>
            </div>
            <ul style={legendListStyle}>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#8b5cf6' }}></span> Computer Science <strong>50%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#06b6d4' }}></span> Chemical Engineering <strong>17%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#10b981' }}></span> Bioscience <strong>33%</strong></li>
            </ul>
          </div>

          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>University Distribution</h3>
            <div style={{ width: '140px', height: '140px', position: 'relative', marginBottom: '1rem' }}>
              <canvas id="uniChart"></canvas>
            </div>
            <ul style={legendListStyle}>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#8b5cf6' }}></span> Nanjing University <strong>50%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#06b6d4' }}></span> Glasgow <strong>17%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#10b981' }}></span> NYU <strong>33%</strong></li>
            </ul>
          </div>

          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Gender Distribution</h3>
            <div style={{ width: '140px', height: '140px', position: 'relative', marginBottom: '1rem' }}>
              <canvas id="genderChart"></canvas>
            </div>
            <ul style={legendListStyle}>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#8b5cf6' }}></span> Male <strong>100%</strong></li>
              <li style={{ ...legendItemStyle, border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', width: 'fit-content' }}>
                <span style={{ ...dotStyle, border: '1px solid #94a3b8' }}></span> Female <strong>0%</strong>
              </li>
            </ul>
          </div>

          <div style={{ ...chartCardStyle, position: 'relative' }}>
            <h3 style={chartTitleStyle}>Decision Rate</h3>
            <div style={{ width: '140px', height: '140px', position: 'relative', marginBottom: '1rem' }}>
              <canvas id="decisionChart"></canvas>
            </div>
            <ul style={legendListStyle}>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#06b6d4' }}></span> Accepted <strong>67%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#8b5cf6' }}></span> Waitlisted <strong>17%</strong> <Info size={14} color="#64748b" /></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#10b981' }}></span> Pending <strong>17%</strong></li>
            </ul>
          </div>
        </div>

        {/* Filter Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1.5, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.4rem', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: '#fafafa' }}
              />
            </div>

            <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} style={selectStyle}>
              <option value="">All Majors</option>
              <option value="Bioscience">Bioscience</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
            </select>

            <select value={selectedUni} onChange={(e) => setSelectedUni(e.target.value)} style={selectStyle}>
              <option value="">All Universities</option>
              <option value="Nanjing University">Nanjing University</option>
              <option value="Glasgow">Glasgow</option>
              <option value="NYU">NYU</option>
            </select>

            <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} style={selectStyle}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={selectStyle}>
              <option value="">All Statuses</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>

            <button onClick={resetFilters} style={{ padding: '0.6rem 1.2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {filteredStudents.map((student) => (
            <div key={student.id} style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)', borderRadius: '16px', padding: '1.25rem', position: 'relative', minHeight: '110px' }}>
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
                  <Lock size={10} color={student.isPrivate ? '#475569' : '#eab308'} /> {student.isPrivate ? 'Private' : 'Public'}
                </span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.65rem' }}>
                  <Pencil size={14} /> Edit
                </button>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{student.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{student.major}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Previous</button>
          <div style={{ width: '32px', height: '32px', background: '#8b5cf6', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Next</button>
        </div>

      </div>
    </div>
  )
}

// ── Helper Styles ─────────────────────────────────────────────────────────────

const navBtnStyle = (isActive) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.6rem 1.2rem',
  background: isActive ? '#e2e8f0' : '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: '#334155',
  textDecoration: 'none',
  cursor: 'pointer'
})

const chartCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '1.25rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}

const chartTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: 700,
  marginBottom: '1rem',
  textAlign: 'center',
  color: '#0f172a'
}

const legendListStyle = {
  width: '100%',
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  fontSize: '0.85rem',
  padding: 0
}

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyLink: 'space-between',
  gap: '0.5rem',
  fontWeight: 500
}

const dotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0
}

const selectStyle = {
  flex: 1,
  minWidth: '130px',
  padding: '0.6rem 1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  background: '#fafafa',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer'
}
