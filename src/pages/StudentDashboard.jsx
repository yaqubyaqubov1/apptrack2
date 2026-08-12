import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import LicenseMediaItem from '../components/LicenseMediaItem'
import {
  getPublicStudents,
  setVisibility,
  setPhoto,
  removePhoto,
  setProfile,
  saveApplication,
  deleteApplication,
  setApplicationVisibility,
  uploadApplicationFile,
  removeApplicationFile,
  setApplicationDocumentVisibility,
  saveLicense,
  deleteLicense,
  setLicenseVisibility,
  uploadLicenseMediaFile,
  deleteLicenseMediaFile,
  onDataChanged,
  offDataChanged,
} from '../store/studentsStore'
import { uploadAvatar, removeAvatar } from '../Services/StorageService'
import Avatar from '../components/Avatar'
import VisibilityToggle from '../components/VisibilityToggle'
import VisibilityChip from '../components/VisibilityChip'
import StatusBadge from '../components/StatusBadge'
import DocumentGroup from '../components/DocumentGroup'
import ApplicationModal from '../components/ApplicationModal'
import LicenseModal from '../components/LicenseModal'
import PublicStudentDrawer from '../components/PublicStudentDrawer'
import StudentCard from '../components/StudentCard'
import './StudentDashboard.css'

const DOC_CATEGORIES = [
  { key: 'transcript', label: 'Transcript' },
  { key: 'recommendation', label: 'Recommendation' },
  { key: 'resume', label: 'Resume / CV' },
  { key: 'statement', label: 'Statement of Purpose' },
  { key: 'test_score', label: 'Test Score' },
  { key: 'other', label: 'Other' },
]

function EmptyContent({ icon = '📘', title, text, action, onAction }) {
  return <div className="empty-state empty-state--cert"><div className="empty-state__icon">{icon}</div><h4>{title}</h4><p>{text}</p>{action && <button type="button" className="solid-btn solid-btn--sm" onClick={onAction}>{action}</button>}</div>
}

function ContentManager({ title, subtitle, addLabel, onAdd, children }) {
  return <section className="students-section"><div className="section-head section-head--stack"><div><h3>{title}</h3><p className="section-head__sub">{subtitle}</p></div><button type="button" className="solid-btn solid-btn--sm" onClick={onAdd}><span className="btn-plus">＋</span> {addLabel}</button></div><div className="content-list">{children}</div></section>
}


function ProfileContentModal({ open, type, item, onClose, onSave }) {
  const [form, setForm] = useState(item || {})
  useEffect(() => setForm(item || {}), [item, open, type])
  if (!open) return null
  const config = {
    education: { title: item ? 'Edit education' : 'Add education', fields: [['institution_name','Institution name','text'],['school_type','Type (school/university)','text'],['degree','Degree','text'],['major','Major','text'],['gpa','GPA','number'],['start_date','Start date','date'],['end_date','End date','date'],['status','Status','text'],['transcript_url','Transcript URL','url']] },
    projects: { title: item ? 'Edit project' : 'Add project', fields: [['title','Project name','text'],['project_type','Project type','text'],['technologies','Technologies','text'],['description','Description','textarea'],['github_url','GitHub URL','url'],['demo_url','Demo URL','url']] },
    portfolio_links: { title: item ? 'Edit portfolio link' : 'Add portfolio link', fields: [['platform','Platform','text'],['label','Label','text'],['url','URL','url']] },
    skills: { title: item ? 'Edit skill' : 'Add skill', fields: [['name','Skill name','text'],['category','Category: Technical / Language / Soft','text'],['level','Level','text']] },
    competitions: { title: item ? 'Edit achievement' : 'Add achievement', fields: [['name','Name','text'],['type','Type','text'],['organizer','Organizer','text'],['rank','Rank / award','text'],['date','Date','date'],['description','Description','textarea']] },
    experience: { title: item ? 'Edit experience' : 'Add experience', fields: [['title','Title / role','text'],['type','Type: Internship / Research / Volunteer / Work','text'],['organization','Organization','text'],['start_date','Start date','date'],['end_date','End date','date'],['description','Description','textarea']] },
    goals: { title: item ? 'Edit goal' : 'Add goal', fields: [['title','Goal title','text'],['type','Type: Academic / Career / Personal','text'],['progress','Progress %','number'],['description','Description','textarea']] },
  }[type]
  const submit = (e) => { e.preventDefault(); onSave({ ...form, visibility: form.visibility || 'private' }) }
  return <div className="modal-backdrop" onClick={onClose}><div className="modal profile-content-modal" onClick={(e)=>e.stopPropagation()}><div className="modal__head"><div><p className="modal__eyebrow">Student profile</p><h3>{config?.title || 'Edit'}</h3></div><button type="button" className="drawer-close" onClick={onClose}>✕</button></div><form className="modal__form" onSubmit={submit}>{(config?.fields || []).map(([key,label,kind])=><label className="field" key={key}><span>{label}</span>{kind === 'textarea' ? <textarea value={form[key] || ''} onChange={(e)=>setForm(f=>({...f,[key]:e.target.value}))} /> : <input type={kind} value={form[key] || ''} onChange={(e)=>setForm(f=>({...f,[key]:e.target.value}))} />}</label>)}{type !== 'goals' && <div className="field field--inline"><span>Visibility</span><VisibilityToggle value={form.visibility || 'private'} onChange={(v)=>setForm(f=>({...f,visibility:v}))}/></div>}<div className="modal__foot"><button type="button" className="ghost-btn" onClick={onClose}>Cancel</button><button type="submit" className="solid-btn">Save</button></div></form></div></div>
}

function ContentCard({ title, subtitle, meta, details = [], visibility, onVisibility, onEdit, onDelete, link }) {
  return <article className="content-card"><div className="content-card__main"><div className="content-card__title-row"><div><h4>{title || 'Untitled'}</h4><p>{subtitle || ''}</p></div><div className="content-card__actions">{onEdit && <button type="button" className="icon-btn" title="Edit" onClick={onEdit}>✎</button>}{onDelete && <button type="button" className="icon-btn icon-btn--danger" title="Delete" onClick={onDelete}>🗑</button>}</div></div>{meta && <small className="content-card__meta">{meta}</small>}{details.filter(Boolean).slice(0,2).map((d,i)=><p className="content-card__detail" key={i}>{d}</p>)}<div className="content-card__foot">{onVisibility && <VisibilityToggle value={visibility || 'private'} onChange={onVisibility} />}{link && <a className="pill-link" href={link} target="_blank" rel="noreferrer">Open ↗</a>}</div></div></article>
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [me, setMe] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    major: '',
    university: '',
    gender: '',
    photoUrl: '',
    photoPath: '',
    notes: '',
    assignedCounselor: '',
    decision: '',
    visibility: {},
    applications: [],
    licenses: [],
    assignedMentor: '',
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [contentLoading, setContentLoading] = useState(false)
  const [education, setEducation] = useState([])
  const [projects, setProjects] = useState([])
  const [portfolioLinks, setPortfolioLinks] = useState([])
  const [skills, setSkills] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [experience, setExperience] = useState([])
  const [goals, setGoals] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [profileModal, setProfileModal] = useState({ open: false, type: null, item: null })
  const [publicStudents, setPublicStudents] = useState([])
  const [selectedPublicStudent, setSelectedPublicStudent] = useState(null)
  const [publicStudentActiveTab, setPublicStudentActiveTab] = useState('profile')
  const [expandedPublicApplications, setExpandedPublicApplications] = useState([])

  // Profile editing
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [editingContact, setEditingContact] = useState(false)
  const [contactDraft, setContactDraft] = useState({ email: '', phone: '' })
  
  // Pre-populate contactDraft with current values when editing starts
  const startEditingContact = useCallback(() => {
    setContactDraft({ email: me.email, phone: me.phone })
    setEditingContact(true)
  }, [me.email, me.phone])

  // Application modal
  const [appModal, setAppModal] = useState({ open: false, application: null })

  // License modal
  const [licenseModal, setLicenseModal] = useState({ open: false, license: null })

  // Expanded applications
  const [expandedApplications, setExpandedApplications] = useState([])

  const publicApplicationsCount = useMemo(
    () => (me.applications || []).filter((a) => a.visibility === 'public').length,
    [me.applications],
  )

  const publicLicensesCount = useMemo(
    () => (me.licenses || []).filter((l) => l.visibility === 'public').length,
    [me.licenses],
  )

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(me.fullName), Boolean(me.email), Boolean(me.phone), Boolean(me.major),
      Boolean(me.university), education.length > 0, projects.length > 0,
      portfolioLinks.length > 0, (me.licenses || []).length > 0, skills.length > 0,
      competitions.length > 0, experience.length > 0, goals.length > 0,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [me, education.length, projects.length, portfolioLinks.length, skills.length, competitions.length, experience.length, goals.length])

  const applicationProgress = useMemo(() => {
    const apps = me.applications || []
    if (!apps.length) return 0
    const weights = { 'Not Started': 0, 'In Progress': 0.35, 'Submitted': 0.65, 'In Review': 0.82, Closed: 1 }
    return Math.round((apps.reduce((sum, app) => sum + (weights[app.status] ?? 0), 0) / apps.length) * 100)
  }, [me.applications])

  // ── Load my profile ──────────────────────────────────────────────
  const loadMyProfile = useCallback(async () => {
    if (!user?.id) return

    try {
      // Use explicit relationship names to avoid ambiguous foreign key errors
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch applications separately with explicit relationship
      const [educationRes, projectsRes, linksRes, skillsRes, competitionsRes, experienceRes, goalsRes, recommendationsRes] = await Promise.all([
        supabase.from('education').select('*').eq('student_id', user.id).order('start_date', { ascending: false }),
        supabase.from('projects').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('portfolio_links').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('skills').select('*').eq('student_id', user.id).order('category', { ascending: true }),
        supabase.from('competitions').select('*').eq('student_id', user.id).order('date', { ascending: false }),
        supabase.from('experience').select('*').eq('student_id', user.id).order('start_date', { ascending: false }),
        supabase.from('goals').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
      ])

      if (!educationRes.error) setEducation(educationRes.data || [])
      if (!projectsRes.error) setProjects(projectsRes.data || [])
      if (!linksRes.error) setPortfolioLinks(linksRes.data || [])
      if (!skillsRes.error) setSkills(skillsRes.data || [])
      if (!competitionsRes.error) setCompetitions(competitionsRes.data || [])
      if (!experienceRes.error) setExperience(experienceRes.data || [])
      if (!goalsRes.error) setGoals(goalsRes.data || [])
      if (!recommendationsRes.error) setRecommendations(recommendationsRes.data || [])

      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          id,
          student_id,
          university,
          program,
          major,
          term,
          deadline,
          status,
          decision,
          recommendation,
          notes,
          visibility,
          created_at,
          application_documents (
            id,
            application_id,
            user_id,
            category,
            name,
            file_path,
            file_url,
            size,
            visibility,
            created_at
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      // Fetch licenses separately
      const { data: licData, error: licError } = await supabase
        .from('licenses')
        .select(`
          id,
          user_id,
          name,
          issuer,
          issue_month,
          issue_year,
          expire_month,
          expire_year,
          credential_id,
          credential_url,
          score,
          visibility,
          created_at,
          license_media (
            id,
            license_id,
            name,
            file_path,
            file_url,
            size,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (licError) throw licError

      const data = { ...profileData, applications: appsData || [], licenses: licData || [] }

      const visibility = {
        profile: data.profile_visibility || 'private',
        photo: data.photo_visibility || 'private',
        email: data.email_visibility || 'private',
        phone: data.phone_visibility || 'private',
        notes: data.notes_visibility || 'private',
      }

      // Normalize applications with documents
      const applications = (data.applications || []).map((app) => {
        const docsByCategory = (app.application_documents || []).reduce((acc, doc) => {
          const cat = doc.category || 'other'
          if (!acc[cat]) acc[cat] = []
          acc[cat].push({
            id: doc.id,
            name: doc.name || 'Document.pdf',
            path: doc.file_path || '',
            url: doc.file_url || '',
            size: doc.size || 0,
            visibility: doc.visibility || 'private',
            created_at: doc.created_at || '',
            application_id: doc.application_id || '',
            category: cat,
          })
          return acc
        }, {})

        return {
          id: app.id,
          student_id: app.student_id,
          university: app.university || '',
          program: app.program || '',
          major: app.major || '',
          term: app.term || '',
          deadline: app.deadline || '',
          status: app.status || 'Not Started',
          decision: app.decision || 'Pending',
          recommendation: app.recommendation || 'Pending',
          notes: app.notes || '',
          visibility: app.visibility || 'private',
          created_at: app.created_at || '',
          documents: docsByCategory,
        }
      })

      // Normalize licenses with media
      const licenses = (data.licenses || []).map((lic) => {
        const media = (lic.license_media || []).map((m) => ({
          id: m.id,
          license_id: m.license_id,
          name: m.name || 'Document',
          filePath: m.file_path || '',
          url: m.file_url || '',
          size: m.size || 0,
          created_at: m.created_at,
        }))

        return {
          id: lic.id,
          user_id: lic.user_id,
          name: lic.name || '',
          issuer: lic.issuer || '',
          issueMonth: lic.issue_month || '',
          issueYear: lic.issue_year || '',
          expireMonth: lic.expire_month || '',
          expireYear: lic.expire_year || '',
          credentialId: lic.credential_id || '',
          credentialUrl: lic.credential_url || '',
          score: lic.score || '',
          visibility: lic.visibility || 'private',
          media,
          created_at: lic.created_at || '',
        }
      })

      setMe({
        id: data.id,
        fullName: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        major: data.major || '',
        university: data.university || '',
        gender: data.gender || '',
        photoUrl: data.photo_url || '',
        photoPath: data.photo_path || '',
        notes: data.admin_notes || '',
        assignedCounselor: data.assigned_counselor || '',
        decision: data.decision || '',
        assignedMentor: data.assigned_mentor || data.assigned_counselor || '',
        visibility,
        applications,
        licenses,
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // ── Load public students for Explore tab ─────────────────────────
  const loadPublicStudents = useCallback(async () => {
    try {
      const publicData = await getPublicStudents()
      // Filter out the current user from public students
      setPublicStudents(publicData.filter((s) => s.id !== user?.id))
    } catch (error) {
      console.error('Failed to load public students:', error)
    }
  }, [user?.id])

  
  const togglePublicApplicationExpanded = useCallback((applicationId) => {
    setExpandedPublicApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    )
  }, [])

  // ── Initial load and subscriptions ───────────────────────────────
  useEffect(() => {
    loadMyProfile()
    loadPublicStudents()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('student-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
        () => { loadMyProfile() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `student_id=eq.${user?.id}` },
        () => { loadMyProfile() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'application_documents', filter: `user_id=eq.${user?.id}` },
        () => { loadMyProfile() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'licenses', filter: `user_id=eq.${user?.id}` },
        () => { loadMyProfile() }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_links', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experience', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recommendations', filter: `student_id=eq.${user?.id}` }, () => { loadMyProfile() })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'license_media', filter: `user_id=eq.${user?.id}` },
        () => { loadMyProfile() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `profile_visibility=eq.public` },
        () => { loadPublicStudents() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `visibility=eq.public` },
        () => { loadPublicStudents() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'licenses', filter: `visibility=eq.public` },
        () => { loadPublicStudents() }
      )
      .subscribe()

    // Subscribe to cross-dashboard event bus for immediate sync
    const handleDataChange = () => {
      loadMyProfile()
      loadPublicStudents()
    }
    onDataChanged(handleDataChange)

    return () => {
      supabase.removeChannel(channel)
      offDataChanged(handleDataChange)
    }
  }, [user?.id, loadMyProfile, loadPublicStudents])

  // ── Visibility handlers ──────────────────────────────────────────
  const handleProfileVisibility = useCallback(async (key, value) => {
    if (!user?.id) return

    // Optimistic update
    setMe((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [key]: value },
    }))

    try {
      await setVisibility(user.id, key, value)
    } catch (error) {
      console.error('Failed to update visibility:', error)
      // Revert on failure
      loadMyProfile()
    }
  }, [user?.id, loadMyProfile])

  const handleApplicationVisibility = useCallback(async (appId, value) => {
    if (!user?.id) return

    // Optimistic update
    setMe((prev) => ({
      ...prev,
      applications: (prev.applications || []).map((app) =>
        app.id === appId ? { ...app, visibility: value } : app
      ),
    }))

    try {
      await setApplicationVisibility(user.id, appId, value)
    } catch (error) {
      console.error('Failed to update application visibility:', error)
      loadMyProfile()
    }
  }, [user?.id, loadMyProfile])

  const handleLicenseVisibility = useCallback(async (licenseId, value) => {
    if (!user?.id) return

    // Optimistic update
    setMe((prev) => ({
      ...prev,
      licenses: (prev.licenses || []).map((lic) =>
        lic.id === licenseId ? { ...lic, visibility: value } : lic
      ),
    }))

    try {
      await setLicenseVisibility(user.id, licenseId, value)
    } catch (error) {
      console.error('Failed to update license visibility:', error)
      loadMyProfile()
    }
  }, [user?.id, loadMyProfile])

  const handleDocumentVisibility = useCallback(async (docId, value) => {
    if (!user?.id) return

    // Optimistic update
    setMe((prev) => ({
      ...prev,
      applications: (prev.applications || []).map((app) => ({
        ...app,
        documents: Object.fromEntries(
          Object.entries(app.documents || {}).map(([cat, docs]) => [
            cat,
            (docs || []).map((doc) =>
              doc.id === docId ? { ...doc, visibility: value } : doc
            ),
          ])
        ),
      })),
    }))

    try {
      await setApplicationDocumentVisibility(user.id, docId, value)
    } catch (error) {
      console.error('Failed to update document visibility:', error)
      loadMyProfile()
    }
  }, [user?.id, loadMyProfile])

  // ── Photo handlers ───────────────────────────────────────────────
  const handlePhotoUpload = useCallback(async (file) => {
    if (!user?.id || !file) return

    try {
      const result = await uploadAvatar(user.id, file)
      await setPhoto(user.id, result.url, result.path)

      setMe((prev) => ({
        ...prev,
        photoUrl: result.url,
        photoPath: result.path,
      }))
    } catch (error) {
      console.error('Failed to upload photo:', error)
    }
  }, [user?.id])

  const handleRemovePhoto = useCallback(async () => {
    if (!user?.id) return

    try {
      if (me.photoPath) {
        await removeAvatar(me.photoPath)
      }
      await removePhoto(user.id)

      setMe((prev) => ({
        ...prev,
        photoUrl: '',
        photoPath: '',
      }))
    } catch (error) {
      console.error('Failed to remove photo:', error)
    }
  }, [user?.id, me.photoPath])

  // ── Profile editing ──────────────────────────────────────────────
  const saveName = useCallback(async () => {
    if (!user?.id || !nameDraft.trim()) return

    try {
      await setProfile(user.id, { fullName: nameDraft.trim() })
      setMe((prev) => ({ ...prev, fullName: nameDraft.trim() }))
      setEditingName(false)
    } catch (error) {
      console.error('Failed to save name:', error)
    }
  }, [user?.id, nameDraft])

  const saveContact = useCallback(async () => {
    if (!user?.id) return

    try {
      await setProfile(user.id, {
        email: contactDraft.email,
        phone: contactDraft.phone,
      })
      setMe((prev) => ({
        ...prev,
        email: contactDraft.email,
        phone: contactDraft.phone,
      }))
      setEditingContact(false)
    } catch (error) {
      console.error('Failed to save contact:', error)
    }
  }, [user?.id, contactDraft])

  // ── Application handlers ─────────────────────────────────────────
  const handleSaveApplication = useCallback(async (payload) => {
    if (!user?.id) return

    try {
      const saved = await saveApplication(user.id, payload)
      await loadMyProfile()
      setAppModal({ open: false, application: null })
    } catch (error) {
      console.error('Failed to save application:', error)
      throw error
    }
  }, [user?.id, loadMyProfile])

  const handleDeleteApplication = useCallback(async (appId) => {
    if (!user?.id) return

    try {
      await deleteApplication(user.id, appId)
      await loadMyProfile()
    } catch (error) {
      console.error('Failed to delete application:', error)
    }
  }, [user?.id, loadMyProfile])

  const handleApplicationDocumentUpload = useCallback(async (studentId, applicationId, category, file) => {
    if (!user?.id) return
    // studentId is passed by DocumentGroup but we use the authenticated user.id
    try {
      await uploadApplicationFile(user.id, applicationId, category, file)
      await loadMyProfile()
    } catch (error) {
      console.error('Failed to upload document:', error)
      throw error
    }
  }, [user?.id, loadMyProfile])

  const handleApplicationDocumentRemove = useCallback(async (studentId, applicationId, category, docId) => {
  if (!user?.id) return
  // studentId is passed by DocumentGroup but we use the authenticated user.id
  try {
    await removeApplicationFile(user.id, applicationId, category, docId)

    setMe((prev) => ({
      ...prev,
      applications: (prev.applications || []).map((app) => {
        if (app.id !== applicationId) return app

        const existingDocuments = app.documents || {}
        const existingCategoryDocs = existingDocuments[category] || []

        return {
          ...app,
          documents: {
            ...existingDocuments,
            [category]: existingCategoryDocs.filter(
              (doc) => doc.id !== docId
            ),
          },
        }
      }),
    }))

    await loadMyProfile()
  } catch (error) {
    console.error('Failed to remove document:', error)
  }
}, [user?.id, loadMyProfile])

  // ── License handlers ─────────────────────────────────────────────
  const handleSaveLicense = useCallback(async (payload) => {
    if (!user?.id) return

    try {
      const saved = await saveLicense(user.id, payload)
      await loadMyProfile()
      setLicenseModal({ open: false, license: null })
    } catch (error) {
      console.error('Failed to save license:', error)
      throw error
    }
  }, [user?.id, loadMyProfile])

  const handleDeleteLicense = useCallback(async (licenseId) => {
    if (!user?.id) return

    try {
      await deleteLicense(user.id, licenseId)
      await loadMyProfile()
    } catch (error) {
      console.error('Failed to delete license:', error)
    }
  }, [user?.id, loadMyProfile])

  const handleLicenseMediaUpload = useCallback(async (licenseId, file) => {
    if (!user?.id) return

    try {
      await uploadLicenseMediaFile(user.id, licenseId, file)
      await loadMyProfile()
    } catch (error) {
      console.error('Failed to upload license media:', error)
      throw error
    }
  }, [user?.id, loadMyProfile])

  const handleLicenseMediaRemove = useCallback(async (mediaId) => {
    if (!user?.id) return

    try {
      await deleteLicenseMediaFile(user.id, mediaId)
      await loadMyProfile()
    } catch (error) {
      console.error('Failed to remove license media:', error)
    }
  }, [user?.id, loadMyProfile])

  // ── Extended profile content CRUD ─────────────────────────────────
  const saveProfileItem = useCallback(async (table, item, setter, fallback = {}) => {
    if (!user?.id) return
    const payload = { ...item, student_id: user.id }
    try {
      const query = item.id
        ? supabase.from(table).update(payload).eq('id', item.id).eq('student_id', user.id).select().single()
        : supabase.from(table).insert(payload).select().single()
      const { data, error } = await query
      if (error) throw error
      setter((prev) => item.id ? prev.map((x) => x.id === item.id ? data : x) : [data, ...prev])
      setProfileModal({ open: false, type: null, item: null })
    } catch (error) {
      console.error(`Failed to save ${table}:`, error)
      alert(error?.message || `Unable to save ${table}.`)
    }
  }, [user?.id])

  const deleteProfileItem = useCallback(async (table, id, setter) => {
    if (!user?.id || !id) return
    if (!window.confirm('Delete this item?')) return
    try {
      const { error } = await supabase.from(table).delete().eq('id', id).eq('student_id', user.id)
      if (error) throw error
      setter((prev) => prev.filter((x) => x.id !== id))
    } catch (error) {
      console.error(`Failed to delete ${table}:`, error)
      alert(error?.message || `Unable to delete this item.`)
    }
  }, [user?.id])

  const setItemVisibility = useCallback(async (table, id, value, setter) => {
    try {
      const { data, error } = await supabase.from(table).update({ visibility: value }).eq('id', id).eq('student_id', user.id).select().single()
      if (error) throw error
      setter((prev) => prev.map((x) => x.id === id ? data : x))
    } catch (error) {
      console.error(`Failed to update ${table} visibility:`, error)
    }
  }, [user?.id])

  const saveEducation = useCallback((item) => saveProfileItem('education', item, setEducation), [saveProfileItem])
  const saveProject = useCallback((item) => saveProfileItem('projects', item, setProjects), [saveProfileItem])
  const savePortfolioLink = useCallback((item) => saveProfileItem('portfolio_links', item, setPortfolioLinks), [saveProfileItem])
  const saveSkill = useCallback((item) => saveProfileItem('skills', item, setSkills), [saveProfileItem])
  const saveCompetition = useCallback((item) => saveProfileItem('competitions', item, setCompetitions), [saveProfileItem])
  const saveExperience = useCallback((item) => saveProfileItem('experience', item, setExperience), [saveProfileItem])
  const saveGoal = useCallback((item) => saveProfileItem('goals', item, setGoals), [saveProfileItem])

  // ── Application expand toggle ────────────────────────────────────
  const toggleApplicationExpanded = useCallback((appId) => {
    setExpandedApplications((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    )
  }, [])

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return null
  }

  return (
    <div className="app-shell student-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="topbar">
        <div>
          <h1 className="topbar__title">Student Dashboard</h1>
          <p className="topbar__subtitle">Manage your own profile, applications and certifications.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="selfcard" onClick={() => setActiveTab('profile')} title="View your profile">
            <Avatar name={me.fullName} photoUrl={me.photoUrl} size="sm" className="selfcard__avatar-el" />
            <span className="selfcard__meta">
              <strong>{me.fullName}</strong>
              <small>{me.major}</small>
            </span>
            <VisibilityChip value={me.visibility?.profile} />
          </button>
          <button
            type="button"
            className="notification-btn"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', padding: '10px 16px' }}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="student-hero">
          <div className="student-hero__card">
            <div className="student-photo-preview student-photo-preview--interactive student-hero__photo">
              <Avatar name={me.fullName} photoUrl={me.photoUrl} size="xl" className="student-photo-avatar" />
              <div className="student-photo-overlay">
                <button
                  type="button"
                  className="student-photo-overlay__btn"
                  onClick={() => document.getElementById('me-photo-input')?.click()}
                >
                  {me.photoUrl ? 'Replace' : 'Upload'}
                </button>
                {me.photoUrl && (
                  <button
                    type="button"
                    className="student-photo-overlay__btn student-photo-overlay__btn--danger"
                    onClick={handleRemovePhoto}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                id="me-photo-input"
                type="file"
                accept="image/*"
                className="file-input-hidden"
                onChange={(e) => {
                  handlePhotoUpload(e.target.files?.[0] || null)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="student-hero__content">
              <div className="student-hero__top">
                <div className="student-hero__identity">
                  {editingName ? (
                    <div className="student-hero__nameedit">
                      <input
                        className="inline-input inline-input--lg"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        aria-label="Full name"
                        autoFocus
                      />
                      <button type="button" className="solid-btn solid-btn--sm" onClick={saveName}>Save</button>
                      <button type="button" className="ghost-btn solid-btn--sm" onClick={() => setEditingName(false)}>Cancel</button>
                    </div>
                  ) : (
                    <h2 className="student-hero__name">
                      {me.fullName}
                      <button type="button" className="icon-btn student-hero__nameedit-btn" title="Edit name" onClick={() => setEditingName(true)}>✎</button>
                    </h2>
                  )}
                  <p>{me.major} • {me.university}</p>
                </div>
                <div className="student-hero__vis-group">
                  <div className="student-hero__profilevis">
                    <span className="student-hero__vis-label">Profile</span>
                    <VisibilityToggle
                      value={me.visibility?.profile || 'private'}
                      onChange={(v) => handleProfileVisibility('profile', v)}
                    />
                  </div>
                  <div className="student-hero__profilevis">
                    <span className="student-hero__vis-label">Photo</span>
                    <VisibilityToggle
                      value={me.visibility?.photo || 'private'}
                      onChange={(v) => handleProfileVisibility('photo', v)}
                    />
                  </div>
                </div>
              </div>

              <p className="student-hero__hint">
                {me.visibility?.profile === 'public'
                  ? 'Your profile & photo are visible to admins and other students.'
                  : 'Your profile is private — only you and admins can see it.'}
              </p>

              <div className="student-hero__stats">
                <div className="hero-stat"><span>Profile</span><strong>{profileCompletion}%</strong></div>
                <div className="hero-stat"><span>Applications</span><strong>{(me.applications || []).length}</strong></div>
                <div className="hero-stat"><span>Public apps</span><strong>{publicApplicationsCount}</strong></div>
                <div className="hero-stat"><span>Certifications</span><strong>{(me.licenses || []).length}</strong></div>
                <div className="hero-stat"><span>Public certs</span><strong>{publicLicensesCount}</strong></div>
                <div className="hero-stat"><span>App progress</span><strong>{applicationProgress}%</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="drawer-tabs student-tabs">
          {[
            ['overview', 'Overview'], ['profile', 'My Profile'], ['education', 'Education'],
            ['applications', 'Applications'], ['documents', 'Documents'], ['projects', 'Projects'],
            ['portfolio', 'Portfolio'], ['licenses', 'Certificates'], ['skills', 'Skills'],
            ['competitions', 'Competitions'], ['experience', 'Experience'], ['goals', 'Goals'],
            ['recommendations', 'Recommendations'], ['activity', 'Activity'], ['explore', 'Explore Students'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={`drawer-tab ${activeTab === key ? 'drawer-tab--active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </section>

        {activeTab === 'overview' && (
          <div className="student-overview">
            <section className="students-section">
              <div className="section-head section-head--stack">
                <div><h3>Overview</h3><p className="section-head__sub">Your academic profile, application progress and next steps.</p></div>
              </div>
              <div className="overview-grid">
                <div className="overview-progress-card">
                  <div className="overview-progress-card__head"><span>Profile completion</span><strong>{profileCompletion}%</strong></div>
                  <div className="progress-track"><span style={{ width: `${profileCompletion}%` }} /></div>
                  <p>{profileCompletion < 100 ? 'Complete more sections to build a stronger profile.' : 'Your profile is complete.'}</p>
                </div>
                <div className="overview-progress-card">
                  <div className="overview-progress-card__head"><span>Application progress</span><strong>{applicationProgress}%</strong></div>
                  <div className="progress-track progress-track--cyan"><span style={{ width: `${applicationProgress}%` }} /></div>
                  <p>{(me.applications || []).length ? 'Based on the current status of your applications.' : 'Add an application to start tracking progress.'}</p>
                </div>
              </div>
            </section>
            <section className="student-dashboard-grid">
              <section className="students-section"><div className="section-head"><div><h3>Quick profile</h3><p className="section-head__sub">Key academic information.</p></div></div><div className="info-grid">
                <div className="info-card"><span>University</span><strong>{me.university || '—'}</strong></div>
                <div className="info-card"><span>Major</span><strong>{me.major || '—'}</strong></div>
                <div className="info-card"><span>Assigned Mentor</span><strong>{me.assignedMentor || 'Not assigned'}</strong></div>
                <div className="info-card"><span>Overall Decision</span><strong>{me.decision || 'Pending'}</strong></div>
              </div></section>
              <section className="students-section"><div className="section-head"><div><h3>Next steps</h3><p className="section-head__sub">Complete the items that matter most.</p></div></div><div className="next-steps-list">
                {[
                  !education.length && 'Add your education history',
                  !projects.length && 'Add your first project',
                  !portfolioLinks.length && 'Add a portfolio link',
                  !skills.length && 'Add your skills',
                  !experience.length && 'Add your experience',
                  !goals.length && 'Set a goal',
                ].filter(Boolean).slice(0, 4).map((label) => <button key={label} className="next-step-item" type="button" onClick={() => setActiveTab(label.includes('education') ? 'education' : label.includes('project') ? 'projects' : label.includes('portfolio') ? 'portfolio' : label.includes('skills') ? 'skills' : label.includes('experience') ? 'experience' : 'goals')}>＋ {label}</button>)}
                {!(!education.length || !projects.length || !portfolioLinks.length || !skills.length || !experience.length || !goals.length) && <div className="empty-inline">Everything looks complete 🎉</div>}
              </div></section>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="student-dashboard-grid">
            <section className="students-section">
              <div className="section-head section-head--stack">
                <div>
                  <h3>Contact Details</h3>
                  <p className="section-head__sub">Freely edit your email & phone and set each public or private — no approval needed.</p>
                </div>
                {editingContact ? (
                  <div className="section-head__btns">
                    <button type="button" className="ghost-btn solid-btn--sm" onClick={() => setEditingContact(false)}>Cancel</button>
                    <button type="button" className="solid-btn solid-btn--sm" onClick={saveContact}>Save</button>
                  </div>
                ) : (
                  <button type="button" className="solid-btn solid-btn--sm" onClick={startEditingContact}>
                    <span className="btn-plus">✎</span> Edit
                  </button>
                )}
              </div>

              <div className="info-grid">
                <div className="info-card info-card--with-toggle">
                  <div className="info-card__main">
                    <span>Email</span>
                    {editingContact ? (
                      <input className="inline-input" type="email" value={contactDraft.email} onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))} />
                    ) : (
                      <strong>{me.email}</strong>
                    )}
                  </div>
                  <VisibilityToggle value={me.visibility?.email || 'private'} onChange={(v) => handleProfileVisibility('email', v)} />
                </div>

                <div className="info-card info-card--with-toggle">
                  <div className="info-card__main">
                    <span>Phone</span>
                    {editingContact ? (
                      <input className="inline-input" value={contactDraft.phone} onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))} />
                    ) : (
                      <strong>{me.phone}</strong>
                    )}
                  </div>
                  <VisibilityToggle value={me.visibility?.phone || 'private'} onChange={(v) => handleProfileVisibility('phone', v)} />
                </div>
              </div>
            </section>

            <section className="students-section">
              <div className="section-head">
                <div>
                  <h3>Profile Information</h3>
                  <p className="section-head__sub">Academic details are managed by your admin/counselor.</p>
                </div>
              </div>
              <div className="info-grid">
                <div className="info-card"><span>Full Name</span><strong>{me.fullName}</strong></div>
                <div className="info-card"><span>Major</span><strong>{me.major}</strong></div>
                <div className="info-card"><span>University</span><strong>{me.university}</strong></div>
                <div className="info-card"><span>Gender</span><strong>{me.gender}</strong></div>
                <div className="info-card info-card--readonly">
                  <span>Assigned Counselor <em className="readonly-tag">read-only</em></span>
                  <strong>{me.assignedCounselor || '—'}</strong>
                </div>
                <div className="info-card info-card--readonly"><span>Assigned Mentor <em className="readonly-tag">read-only</em></span><strong>{me.assignedMentor || '—'}</strong></div>
                <div className="info-card info-card--readonly">
                  <span>Overall Decision <em className="readonly-tag">read-only</em></span>
                  <strong>{me.decision || '—'}</strong>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'education' && (
          <ContentManager title="Education" subtitle="Build your academic history and keep transcripts with the right institution." addLabel="Add education" onAdd={() => setProfileModal({ open: true, type: 'education', item: null })}>
            {education.map((item) => <ContentCard key={item.id} title={item.institution_name} subtitle={[item.degree, item.major].filter(Boolean).join(' • ')} meta={[item.start_date, item.end_date || (item.status === 'current' ? 'Present' : '')].filter(Boolean).join(' – ')} details={[item.gpa ? `GPA ${item.gpa}` : '', item.transcript_url ? 'Transcript attached' : ''].filter(Boolean)} visibility={item.visibility} onVisibility={(v) => setItemVisibility('education', item.id, v, setEducation)} onEdit={() => setProfileModal({ open: true, type: 'education', item })} onDelete={() => deleteProfileItem('education', item.id, setEducation)} />)}
            {!education.length && <EmptyContent icon="🎓" title="No education added" text="Add your school or university history." action="Add education" onAction={() => setProfileModal({ open: true, type: 'education', item: null })} />}
          </ContentManager>
        )}

        {activeTab === 'documents' && (
          <section className="students-section"><div className="section-head"><div><h3>Documents</h3><p className="section-head__sub">A central view of documents attached to your applications.</p></div></div><div className="document-summary-grid">
            {(me.applications || []).flatMap((a) => Object.entries(a.documents || {}).flatMap(([category, docs]) => (docs || []).map((doc) => ({ ...doc, category, university: a.university })))).map((doc) => <div key={doc.id} className="doc-summary-card"><span className="doc-summary-card__icon">📄</span><div><strong>{doc.name}</strong><small>{doc.university} • {doc.category}</small></div><VisibilityToggle value={doc.visibility || 'private'} onChange={(v) => handleDocumentVisibility(doc.id, v)} /></div>)}
            {!(me.applications || []).some((a) => Object.values(a.documents || {}).some((docs) => (docs || []).length)) && <EmptyContent icon="📁" title="No documents yet" text="Upload documents inside an application." />}
          </div></section>
        )}

        {activeTab === 'projects' && <ContentManager title="Projects" subtitle="Showcase academic, technical, research and personal projects." addLabel="Add project" onAdd={() => setProfileModal({ open: true, type: 'projects', item: null })}>{projects.map((item) => <ContentCard key={item.id} title={item.title} subtitle={item.project_type || 'Project'} meta={item.technologies || ''} details={[item.description, item.github_url].filter(Boolean)} visibility={item.visibility} link={item.demo_url || item.github_url} onVisibility={(v) => setItemVisibility('projects', item.id, v, setProjects)} onEdit={() => setProfileModal({ open: true, type: 'projects', item })} onDelete={() => deleteProfileItem('projects', item.id, setProjects)} />)}{!projects.length && <EmptyContent icon="🛠️" title="No projects yet" text="Add projects to strengthen your profile." action="Add project" onAction={() => setProfileModal({ open: true, type: 'projects', item: null })} />}</ContentManager>}

        {activeTab === 'portfolio' && <ContentManager title="Portfolio" subtitle="Connect your public work and professional profiles." addLabel="Add link" onAdd={() => setProfileModal({ open: true, type: 'portfolio_links', item: null })}><div className="portfolio-grid">{portfolioLinks.map((item) => <ContentCard key={item.id} title={item.label || item.platform} subtitle={item.platform} meta={item.url} visibility={item.visibility} link={item.url} onVisibility={(v) => setItemVisibility('portfolio_links', item.id, v, setPortfolioLinks)} onEdit={() => setProfileModal({ open: true, type: 'portfolio_links', item })} onDelete={() => deleteProfileItem('portfolio_links', item.id, setPortfolioLinks)} />)}</div>{!portfolioLinks.length && <EmptyContent icon="🔗" title="No portfolio links" text="Add GitHub, LinkedIn, website, Kaggle, Behance or other links." action="Add link" onAction={() => setProfileModal({ open: true, type: 'portfolio_links', item: null })} />}</ContentManager>}

        {activeTab === 'skills' && <ContentManager title="Skills" subtitle="Organize technical, language and soft skills." addLabel="Add skill" onAdd={() => setProfileModal({ open: true, type: 'skills', item: null })}><div className="tag-cloud">{skills.map((item) => <div className="skill-pill" key={item.id}><span>{item.name}</span><small>{item.category || 'Technical'}</small><button type="button" onClick={() => deleteProfileItem('skills', item.id, setSkills)}>×</button></div>)}</div>{!skills.length && <EmptyContent icon="💡" title="No skills added" text="Add technical, language or soft skills." action="Add skill" onAction={() => setProfileModal({ open: true, type: 'skills', item: null })} />}</ContentManager>}

        {activeTab === 'competitions' && <ContentManager title="Competitions & Awards" subtitle="Track olympiads, hackathons, awards and achievements." addLabel="Add achievement" onAdd={() => setProfileModal({ open: true, type: 'competitions', item: null })}>{competitions.map((item) => <ContentCard key={item.id} title={item.name} subtitle={item.type || 'Competition'} meta={[item.rank, item.date].filter(Boolean).join(' • ')} details={[item.organizer, item.description].filter(Boolean)} visibility={item.visibility} onVisibility={(v) => setItemVisibility('competitions', item.id, v, setCompetitions)} onEdit={() => setProfileModal({ open: true, type: 'competitions', item })} onDelete={() => deleteProfileItem('competitions', item.id, setCompetitions)} />)}{!competitions.length && <EmptyContent icon="🏆" title="No achievements yet" text="Add competitions, olympiads and awards." action="Add achievement" onAction={() => setProfileModal({ open: true, type: 'competitions', item: null })} />}</ContentManager>}

        {activeTab === 'experience' && <ContentManager title="Experience" subtitle="Record internships, research, volunteering and work." addLabel="Add experience" onAdd={() => setProfileModal({ open: true, type: 'experience', item: null })}>{experience.map((item) => <ContentCard key={item.id} title={item.title} subtitle={`${item.type || 'Experience'}${item.organization ? ` • ${item.organization}` : ''}`} meta={[item.start_date, item.end_date || (item.current ? 'Present' : '')].filter(Boolean).join(' – ')} details={[item.description].filter(Boolean)} visibility={item.visibility} onVisibility={(v) => setItemVisibility('experience', item.id, v, setExperience)} onEdit={() => setProfileModal({ open: true, type: 'experience', item })} onDelete={() => deleteProfileItem('experience', item.id, setExperience)} />)}{!experience.length && <EmptyContent icon="💼" title="No experience yet" text="Add internships, research, volunteer work or jobs." action="Add experience" onAction={() => setProfileModal({ open: true, type: 'experience', item: null })} />}</ContentManager>}

        {activeTab === 'goals' && <ContentManager title="Goals" subtitle="Set short-term and long-term academic or career goals." addLabel="Add goal" onAdd={() => setProfileModal({ open: true, type: 'goals', item: null })}>{goals.map((item) => <ContentCard key={item.id} title={item.title} subtitle={item.type || 'Personal'} meta={`${item.progress ?? 0}% complete`} details={[item.description].filter(Boolean)} onEdit={() => setProfileModal({ open: true, type: 'goals', item })} onDelete={() => deleteProfileItem('goals', item.id, setGoals)} />)}{!goals.length && <EmptyContent icon="🎯" title="No goals yet" text="Set goals to keep your progress focused." action="Add goal" onAction={() => setProfileModal({ open: true, type: 'goals', item: null })} />}</ContentManager>}

        {activeTab === 'recommendations' && <section className="students-section"><div className="section-head"><div><h3>Mentor & Recommendations</h3><p className="section-head__sub">Feedback and recommendations from your mentor/admin.</p></div><span className="count-pill">{recommendations.length}</span></div><div className="recommendation-list">{recommendations.map((item) => <article className="recommendation-card" key={item.id}><div><strong>{item.title || 'Recommendation'}</strong><p>{item.message || item.content || ''}</p><small>{item.author_name || 'AppTrack mentor'}{item.created_at ? ` • ${new Date(item.created_at).toLocaleDateString()}` : ''}</small></div><span className="status-badge status-badge--purple">{item.status || 'Open'}</span></article>)}{!recommendations.length && <EmptyContent icon="💬" title="No recommendations yet" text="Mentor and admin feedback will appear here." />}</div></section>}

        {activeTab === 'activity' && <section className="students-section"><div className="section-head"><div><h3>Activity</h3><p className="section-head__sub">A snapshot of your recent AppTrack progress.</p></div></div><div className="activity-timeline">{[
          ...(me.applications || []).map((x) => ({ label: `Application: ${x.university || 'University'}`, date: x.created_at, icon: '🎓' })),
          ...(me.licenses || []).map((x) => ({ label: `Certificate: ${x.name || 'Credential'}`, date: x.created_at, icon: '🏅' })),
          ...projects.map((x) => ({ label: `Project: ${x.title}`, date: x.created_at, icon: '🛠️' })),
          ...experience.map((x) => ({ label: `Experience: ${x.title}`, date: x.created_at, icon: '💼' })),
        ].filter(x => x.date).sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0, 12).map((item, idx) => <div key={`${item.label}-${idx}`} className="activity-item"><span className="activity-item__icon">{item.icon}</span><div><strong>{item.label}</strong><small>{new Date(item.date).toLocaleDateString()}</small></div></div>)}{!me.applications.length && !me.licenses.length && !projects.length && !experience.length && <EmptyContent icon="🕒" title="No activity yet" text="Your AppTrack activity will appear here." />}</div></section>}

        {activeTab === 'applications' && (
          <section className="students-section">
            <div className="section-head section-head--stack">
              <div>
                <h3>My Applications</h3>
                <p className="section-head__sub">Add, edit, upload PDFs, and choose what is public.</p>
              </div>
              <button type="button" className="solid-btn solid-btn--sm" onClick={() => setAppModal({ open: true, application: null })}>
                <span className="btn-plus">＋</span> New application
              </button>
            </div>

            <div className="application-list">
              {(me.applications || []).map((application) => {
                const expanded = expandedApplications.includes(application.id)
                return (
                  <div key={application.id} className={`application-card ${expanded ? 'application-card--open' : ''}`}>
                    <button type="button" className="application-card__top" onClick={() => toggleApplicationExpanded(application.id)}>
                      <div className="application-card__id">
                        <div className="application-card__logo">{application.university?.[0] || 'U'}</div>
                        <div className="application-card__id-text">
                          <h4>{application.university}</h4>
                          <p>{application.program || application.major}</p>
                        </div>
                      </div>
                      <div className="application-card__top-meta">
                        <VisibilityChip value={application.visibility} />
                        <StatusBadge value={application.status} />
                        <span className="chevron">{expanded ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="application-card__expand">
                        <div className="application-toolbar">
                          <VisibilityToggle
                            value={application.visibility}
                            onChange={(v) => handleApplicationVisibility(application.id, v)}
                          />
                          <div className="application-toolbar__actions">
                            <button type="button" className="mini-btn" onClick={() => setAppModal({ open: true, application })}>✎ Edit</button>
                            <button type="button" className="mini-btn mini-btn--danger" onClick={() => handleDeleteApplication(application.id)}>🗑 Delete</button>
                          </div>
                        </div>

                        <div className="application-card__meta">
                          <div className="meta-cell"><span>Term</span><strong>{application.term || '—'}</strong></div>
                          <div className="meta-cell"><span>Major</span><strong>{application.major || '—'}</strong></div>
                          <div className="meta-cell"><span>Decision</span><strong>{application.decision}</strong></div>
                          <div className="meta-cell"><span>Recommendation</span><strong>{application.recommendation}</strong></div>
                          <div className="meta-cell"><span>Deadline</span><strong>{application.deadline || '—'}</strong></div>
                          <div className="meta-cell"><span>Status</span><strong>{application.status}</strong></div>
                        </div>

                        {application.notes && (
                          <div className="application-notes"><span>Notes</span><p>{application.notes}</p></div>
                        )}

                        <div className="doc-groups">
                          {DOC_CATEGORIES.map((category) => (
                            <DocumentGroup
                              key={category.key}
                              studentId={me.id}
                              application={application}
                              category={category}
                              onUpload={handleApplicationDocumentUpload}
                              onRemove={handleApplicationDocumentRemove}
                              onSetDocVisibility={handleDocumentVisibility}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {!(me.applications || []).length && (
                <div className="empty-state empty-state--cert">
                  <div className="empty-state__icon">🎓</div>
                  <h4>No applications yet</h4>
                  <p>Create your first university application.</p>
                  <button type="button" className="solid-btn solid-btn--sm" onClick={() => setAppModal({ open: true, application: null })}>New application</button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'licenses' && (
          <section className="students-section">
            <div className="section-head section-head--stack">
              <div>
                <h3>My Certifications</h3>
                <p className="section-head__sub">Add credentials with score and visibility.</p>
              </div>
              <button type="button" className="solid-btn solid-btn--sm" onClick={() => setLicenseModal({ open: true, license: null })}>
                <span className="btn-plus">＋</span> Add
              </button>
            </div>

            <div className="cert-list">
              {(me.licenses || []).map((license) => (
                <div key={license.id} className="cert-item">
                  <div className="cert-item__logo">{(license.name || 'C').trim()[0]?.toUpperCase()}</div>
                  <div className="cert-item__body">
                    <div className="cert-item__row">
                      <h4 className="cert-item__name">{license.name}</h4>
                      <div className="cert-item__actions">
                        <button type="button" className="icon-btn" title="Edit" onClick={() => setLicenseModal({ open: true, license })}>✎</button>
                        <button type="button" className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDeleteLicense(license.id)}>🗑</button>
                      </div>
                    </div>
                    {license.issuer && <p className="cert-item__issuer">{license.issuer}</p>}
                    {(license.issueMonth || license.issueYear || license.score) && (
                      <p className="cert-item__meta">
                        {(license.issueMonth || license.issueYear) && <span>Issued {[license.issueMonth, license.issueYear].filter(Boolean).join(' ')}</span>}
                        {license.score && <span> · Score {license.score}</span>}
                      </p>
                    )}
                    {license.credentialId && <p className="cert-item__cred">Credential ID {license.credentialId}</p>}
                    <div className="cert-item__foot">
                      <VisibilityToggle value={license.visibility} onChange={(v) => handleLicenseVisibility(license.id, v)} />
                      {license.credentialUrl && (
                        <a className="pill-link" href={license.credentialUrl} target="_blank" rel="noreferrer">Show credential ↗</a>
                      )}
                      {(license.media || []).map((m) => (
                        <LicenseMediaItem
                          key={m.id}
                          media={m}
                          onRemove={handleLicenseMediaRemove}
                          readOnly={false}
                        />
                      ))}
                      <label className="pill-link pill-link--upload" style={{ cursor: 'pointer' }}>
                        📎 Add Evidence
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="file-input-hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleLicenseMediaUpload(license.id, file)
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {!(me.licenses || []).length && (
                <div className="empty-state empty-state--cert">
                  <div className="empty-state__icon">🎓</div>
                  <h4>No certifications yet</h4>
                  <p>Add IELTS, SAT, GRE, or other credentials.</p>
                  <button type="button" className="solid-btn solid-btn--sm" onClick={() => setLicenseModal({ open: true, license: null })}>Add certification</button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'explore' && (
          <section className="students-section">
            <div className="section-head">
              <div>
                <h3>Public Student Directory</h3>
                <p className="section-head__sub">Browse profiles other students shared publicly. You can view — never edit — their data.</p>
              </div>
              <span className="count-pill">{publicStudents.length}</span>
            </div>

            <div className="students-grid">
              {publicStudents.length > 0 ? (
                publicStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onClick={() => {
                      setSelectedPublicStudent(student)
                      setPublicStudentActiveTab('profile')
                      setExpandedPublicApplications([])
                    }}
                  />
                ))
              ) : (
                <div className="empty-state empty-state--cert">
                  <div className="empty-state__icon">🎓</div>
                  <h4>No public profiles yet</h4>
                  <p>When other students make their profiles public, they will appear here.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <ProfileContentModal open={profileModal.open} type={profileModal.type} item={profileModal.item} onClose={() => setProfileModal({ open: false, type: null, item: null })} onSave={(payload) => { const map = { education: saveEducation, projects: saveProject, portfolio_links: savePortfolioLink, skills: saveSkill, competitions: saveCompetition, experience: saveExperience, goals: saveGoal }; map[profileModal.type]?.(payload) }} />

      <PublicStudentDrawer
      student={selectedPublicStudent}
      activeTab={publicStudentActiveTab}
      setActiveTab={setPublicStudentActiveTab}
      expandedApplications={expandedPublicApplications}
      onToggleApplicationExpanded={togglePublicApplicationExpanded}
      licenses={selectedPublicStudent?.licenses}
      readOnly={true}
      onClose={() => {
        setSelectedPublicStudent(null)
        setPublicStudentActiveTab('profile')
        setExpandedPublicApplications([])
      }}
    />

      <ApplicationModal
        open={appModal.open}
        application={appModal.application}
        onClose={() => setAppModal({ open: false, application: null })}
        onSave={handleSaveApplication}
      />

      <LicenseModal
        open={licenseModal.open}
        license={licenseModal.license}
        onClose={() => setLicenseModal({ open: false, license: null })}
        onSave={handleSaveLicense}
      />
    </div>
  )
} 