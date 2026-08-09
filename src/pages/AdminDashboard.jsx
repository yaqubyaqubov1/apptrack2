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

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedUni, setSelectedUni] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // University Autocomplete State
  const [uniQuery, setUniQuery] = useState('')
  const [uniSuggestions, setUniSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // University Autocomplete Fetching (Hipolabs API)
  useEffect(() => {
    if (uniQuery.trim().length < 2) {
      setUniSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://universities.hipolabs.com/search?name=${encodeURIComponent(uniQuery)}`)
        const data = await res.json()
        setUniSuggestions(data.slice(0, 8))
        setShowSuggestions(true)
      } catch (err) {
        console.error('Failed to fetch universities:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [uniQuery])

  // Load Chart.js CDN and render charts
  useEffect(() => {
    const loadChartJs = () => {
      return new Promise((resolve) => {
        if (window.Chart) {
          resolve(window.Chart)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
        script.onload = () => resolve(window.Chart)
        document.head.appendChild(script)
      })
    }

    loadChartJs().then((Chart) => {
      // Register custom center text plugin if not registered
      const pluginId = 'centerText'
      if (!Chart.registry.plugins.get(pluginId)) {
        Chart.register({
          id: pluginId,
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
        })
      }

      const commonOptions = {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
      }

      // 1. Major Distribution
      const majorCtx = document.getElementById('majorChart')
      let majorChartInstance
      if (majorCtx) {
        majorChartInstance = new Chart(majorCtx, {
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
      }

      // 2. University Distribution
      const uniCtx = document.getElementById('uniChart')
      let uniChartInstance
      if (uniCtx) {
        uniChartInstance = new Chart(uniCtx, {
          type: 'doughnut',
          data: {
            labels: ['Nanjing University', 'Glasgow', 'NYU'],
            datasets: [{
              data: [50, 17, 33],
              backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981'],
              borderWidth: 0
            }]
          },
          options: {
            ...commonOptions,
            plugins: { ...commonOptions.plugins, centerText: { text: '' } }
          }
        })
      }

      // 3. Gender Distribution
      const genderCtx = document.getElementById('genderChart')
      let genderChartInstance
      if (genderCtx) {
        genderChartInstance = new Chart(genderCtx, {
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
      }

      // 4. Decision Rate
      const decisionCtx = document.getElementById('decisionChart')
      let decisionChartInstance
      if (decisionCtx) {
        decisionChartInstance = new Chart(decisionCtx, {
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
      }

      return () => {
        if (majorChartInstance) majorChartInstance.destroy()
        if (uniChartInstance) uniChartInstance.destroy()
        if (genderChartInstance) genderChartInstance.destroy()
        if (decisionChartInstance) decisionChartInstance.destroy()
      }
    })
  }, [])

  const handleSignOut = () => {
    alert('Signed out successfully')
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedMajor('')
    setSelectedUni('')
    setSelectedGender('')
    setSelectedStatus('')
    setUniQuery('')
    setShowSuggestions(false)
  }

  const students = [
    { id: 1, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', status: 'Private' },
    { id: 2, name: 'Narana Mansoh', major: 'Bioscience', status: 'Private' },
    { id: 3, name: 'Suhasen Derau', major: 'Bioscience', status: 'Public' },
    { id: 4, name: 'Aykhan Khudaverdiyev', major: 'Bioscience', status: 'Private' },
    { id: 5, name: 'Ronaldd Mansoh', major: 'Bioscience', status: 'Private' },
    { id: 6, name: 'Suhasen Derau', major: 'Bioscience', status: 'Public' }
  ]

  const filteredStudents = students.filter(student => {
    const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMajor = selectedMajor ? student.major === selectedMajor : true
    const matchesStatus = selectedStatus ? student.status === selectedStatus : true
    return matchesName && matchesMajor && matchesStatus
  })

  return (
    <div style={{ backgroundColor: '#f3f4f8', minHeight: '100vh', padding: '2rem', color: '#0f172a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/" style={btnStyle}><Home size={18} /> Home</Link>
            <Link to="/profile" style={btnStyle}><User size={18} /> Profile</Link>
            <Link to="/admin" style={{ ...btnStyle, backgroundColor: '#e2e8f0' }}><Shield size={18} /> Admin Panel</Link>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={btnStyle}>
              <Bell size={18} /> Notifications 
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, marginLeft: '0.25rem' }}>3</span>
            </button>
            <button onClick={handleSignOut} style={{ ...btnStyle, fontWeight: 600 }}>
              Sign out
            </button>
          </div>
        </header>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Student Manager</h1>

        {/* Donut Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Major Distribution */}
          <div style={cardStyle}>
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

          {/* University Distribution */}
          <div style={cardStyle}>
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

          {/* Gender Distribution */}
          <div style={cardStyle}>
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

          {/* Decision Rate */}
          <div style={{ ...cardStyle, position: 'relative' }}>
            <h3 style={chartTitleStyle}>Decision Rate</h3>
            <div style={{ width: '140px', height: '140px', position: 'relative', marginBottom: '1rem' }}>
              <canvas id="decisionChart"></canvas>
            </div>
            <ul style={legendListStyle}>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#06b6d4' }}></span> Accepted <strong>67%</strong></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#eab308' }}></span> Waitlisted <strong>17%</strong> <Info size={14} color="#64748b" /></li>
              <li style={legendItemStyle}><span style={{ ...dotStyle, backgroundColor: '#10b981' }}></span> Pending <strong>17%</strong></li>
            </ul>
            <div style={tooltipStyle}>
              Applications with no current decision
            </div>
          </div>

        </div>

        {/* Filters Bar with Autocomplete */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem', overflow: 'visible' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1.5', minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Major Dropdown */}
            <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} style={selectStyle}>
              <option value="">All Majors</option>
              <option value="Bioscience">Bioscience</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
            </select>

            {/* University Autocomplete Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
              <input 
                type="text" 
                placeholder="Search University..."
                value={uniQuery}
                onChange={(e) => setUniQuery(e.target.value)}
                onFocus={() => uniSuggestions.length > 0 && setShowSuggestions(true)}
                style={{ ...inputStyle, paddingLeft: '0.75rem' }}
              />
              {showSuggestions && (
                <ul style={suggestionsListStyle}>
                  {uniSuggestions.map((item, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => {
                        setUniQuery(item.name)
                        setSelectedUni(item.name)
                        setShowSuggestions(false)
                      }}
                      style={suggestionItemStyle}
                    >
                      {item.name} ({item.country})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Gender Select */}
            <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} style={selectStyle}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Status Select */}
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={selectStyle}>
              <option value="">All Statuses</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>

            <button onClick={resetFilters} style={btnStyle}>Reset Filters</button>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {filteredStudents.map((student) => (
            <div key={student.id} style={studentCardStyle}>
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
                  <Lock size={10} color={student.status === 'Public' ? '#eab308' : '#475569'} /> {student.status}
                </span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Pencil size={12} /> Edit
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
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Previous</button>
          <div style={{ width: '32px', height: '32px', background: '#8b5cf6', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Next</button>
        </div>

      </div>
    </div>
  )
}

// Inline Style Objects
const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.6rem 1.2rem',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: '#334155',
  cursor: 'pointer',
  textDecoration: 'none'
}

const cardStyle = {
  backgroundColor: '#ffffff',
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
  color: '#0f172a'
}

const legendListStyle = {
  width: '100%',
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  fontSize: '0.85rem'
}

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
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

const tooltipStyle = {
  position: 'absolute',
  bottom: '-15px',
  right: '-20px',
  backgroundColor: '#1e293b',
  color: '#ffffff',
  padding: '0.6rem 0.8rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 10,
  width: '150px'
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.6rem 0.6rem 2.4rem',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  outline: 'none',
  fontSize: '0.9rem',
  backgroundColor: '#fafafa'
}

const selectStyle = {
  flex: '1',
  minWidth: '130px',
  padding: '0.6rem 1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  backgroundColor: '#fafafa',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer'
}

const suggestionsListStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  marginTop: '4px',
  maxHeight: '200px',
  overflowY: 'auto',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  listStyle: 'none',
  zIndex: 50,
  padding: 0
}

const suggestionItemStyle = {
  padding: '0.6rem 0.8rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
  borderBottom: '1px solid #f1f5f9'
}

const studentCardStyle = {
  background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)',
  borderRadius: '16px',
  padding: '1.25rem',
  position: 'relative',
  minHeight: '110px',
  display: 'flex',
  flexDirection: 'column',
  justify-content: 'space-between'
}
