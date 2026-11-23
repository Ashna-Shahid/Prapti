
import { useState, useEffect } from "react";
import {
  Leaf, Menu, X, Search, Mic, MicOff, ArrowRight, ArrowLeft,
  Bookmark, BookmarkCheck, Check, CheckCircle2, Clock, FileText,
  Home, GraduationCap, HeartPulse, Sprout, ChevronDown, ExternalLink,
  Bell, ClipboardList, CircleHelp, Sparkles, ShieldCheck, House,
  UserRound, AlertCircle, CalendarDays, Trash2
} from "lucide-react";
import "./index.css";

const schemes = [
  {
    id: 1,
    name: "Post-Matric Scholarship",
    category: "Student",
    icon: GraduationCap,
    benefit: "Financial assistance for eligible students pursuing higher education.",
    amount: "Amount varies by eligibility",
    score: 92,
    status: "Likely eligible",
    description: "Support for students from eligible communities and income groups continuing their education after matriculation.",
    why: ["You are pursuing college education", "Your family reports limited income"],
    missing: ["Community category", "Exact annual family income", "College eligibility"],
    documents: [
      ["Income certificate", "Proof of family income issued by the competent authority"],
      ["Previous marksheet", "Academic record for your previous qualifying examination"],
      ["Admission proof", "Proof of enrollment in your current college"],
      ["Bank passbook", "Bank account details for eligible scholarship payments"],
      ["Community certificate", "Required only if applicable to this scheme"]
    ],
    steps: ["Confirm your category and income eligibility", "Collect the required documents", "Visit the official scholarship portal", "Complete the application form", "Submit and save your application reference"],
    deadline: null,
    source: null,
    verified: null
  },
  {
    id: 2,
    name: "National Scholarship Portal Opportunities",
    category: "Student",
    icon: GraduationCap,
    benefit: "Explore central scholarship opportunities based on your education and profile.",
    amount: "Depends on the specific scheme",
    score: 84,
    status: "Possible match",
    description: "A collection of scholarship opportunities for eligible students through the national scholarship ecosystem.",
    why: ["You are a college student", "You are seeking financial educational support"],
    missing: ["Course details", "Family income", "Scheme-specific eligibility"],
    documents: [
      ["Income certificate", "Proof of family income"],
      ["Academic marksheet", "Marks from your qualifying exam"],
      ["College ID", "Student identity issued by your institution"],
      ["Bank details", "Account details required by the chosen scheme"]
    ],
    steps: ["Explore scholarships matching your profile", "Read the eligibility rules of the selected scholarship", "Prepare the required documents", "Apply through the official portal", "Track your application"],
    deadline: null,
    source: "https://scholarships.gov.in/",
    verified: null
  },
  {
    id: 3,
    name: "Ayushman Bharat PM-JAY",
    category: "Health",
    icon: HeartPulse,
    benefit: "Eligible families may receive health cover for qualifying hospital treatment.",
    amount: "Up to ₹5 lakh family cover per year for eligible families",
    score: 65,
    status: "More information needed",
    description: "Government health coverage for eligible beneficiaries. Eligibility depends on the applicable beneficiary database and scheme rules.",
    why: ["You are seeking information about government support"],
    missing: ["Beneficiary eligibility must be checked", "Family eligibility details"],
    documents: [
      ["Beneficiary identification", "Identification accepted by the official beneficiary verification process"],
      ["Supporting documents", "Documents requested during official verification"]
    ],
    steps: ["Check whether your family is eligible", "Use the official beneficiary portal or visit an authorized center", "Complete verification", "Follow the process for eligible treatment"],
    deadline: null,
    source: "https://beneficiary.nha.gov.in/",
    verified: null
  },
  {
    id: 4,
    name: "PM Kisan Samman Nidhi",
    category: "Farmer",
    icon: Sprout,
    benefit: "Income support for eligible landholding farmer families.",
    amount: "₹6,000 annually in installments for eligible beneficiaries",
    score: 30,
    status: "More information needed",
    description: "Income support program for eligible farmer families subject to scheme rules, exclusions, and verification.",
    why: ["You can explore farmer support schemes"],
    missing: ["Whether your household is a farmer family", "Land records", "Exclusion criteria"],
    documents: [
      ["Land records", "Records relevant to landholding eligibility"],
      ["Bank account", "Account details for benefit transfer"],
      ["Identity documents", "As required by the official application process"]
    ],
    steps: ["Check eligibility and exclusions", "Prepare land and supporting records", "Contact the official registration channel", "Complete verification"],
    deadline: null,
    source: "https://pmkisan.gov.in/",
    verified: null
  },
  {
    id: 5,
    name: "PMAY Housing Support",
    category: "Housing",
    icon: House,
    benefit: "Housing assistance for households meeting the applicable housing scheme criteria.",
    amount: "Assistance depends on scheme and location",
    score: 48,
    status: "More information needed",
    description: "Housing assistance programs for eligible households. The applicable program depends on location and household circumstances.",
    why: ["You are exploring household welfare support"],
    missing: ["Current housing condition", "Household eligibility", "Location and program type"],
    documents: [
      ["Residence proof", "Proof of current residence"],
      ["Income documents", "Documents establishing household income"],
      ["Housing details", "Details required to determine eligibility"]
    ],
    steps: ["Identify the applicable urban or rural housing program", "Check current eligibility conditions", "Collect required records", "Contact the official local authority", "Apply through the official process"],
    deadline: null,
    source: null,
    verified: null
  }
];

const categories = [
  { name: "Student", icon: GraduationCap, color: "student" },
  { name: "Farmer", icon: Sprout, color: "farmer" },
  { name: "Health", icon: HeartPulse, color: "health" },
  { name: "Housing", icon: Home, color: "housing" }
];

const languages = [
  ["English", "en-IN"], ["हिन्दी", "hi-IN"], ["मराठी", "mr-IN"],
  ["বাংলা", "bn-IN"], ["தமிழ்", "ta-IN"], ["తెలుగు", "te-IN"],
  ["ગુજરાતી", "gu-IN"], ["ಕನ್ನಡ", "kn-IN"], ["മലയാളം", "ml-IN"],
  ["ਪੰਜਾਬੀ", "pa-IN"], ["اردو", "ur-IN"]
];

const stages = [
  "Not Started", "Preparing Documents", "Ready to Apply",
  "Submitted", "Under Review", "Completed"
];

function App() {
  const [page, setPage] = useState("Home");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [results, setResults] = useState(schemes);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("prapti_saved") || "[]"));
  const [checklists, setChecklists] = useState(() => JSON.parse(localStorage.getItem("prapti_checklists") || "{}"));
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem("prapti_apps") || "[]"));
  const [lang, setLang] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  const [sort, setSort] = useState("match");

  useEffect(() => { localStorage.setItem("prapti_saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("prapti_checklists", JSON.stringify(checklists)); }, [checklists]);
  useEffect(() => { localStorage.setItem("prapti_apps", JSON.stringify(applications)); }, [applications]);

  function searchSchemes(text = query, category = activeCategory) {
    setQuery(text);
    const q = text.toLowerCase();
    let found = schemes.filter(s => {
      const categoryMatch = category === "All" || s.category === category;
      const textMatch = !q || `${s.name} ${s.category} ${s.description} ${s.benefit}`.toLowerCase().includes(q) ||
        (q.includes("student") && s.category === "Student") ||
        (q.includes("farmer") && s.category === "Farmer") ||
        (q.includes("health") && s.category === "Health") ||
        (q.includes("house") && s.category === "Housing") ||
        (q.includes("college") && s.category === "Student") ||
        (q.includes("income") && s.category === "Student");
      return categoryMatch && textMatch;
    });
    if (q && found.length === 0) found = schemes.filter(s => category === "All" || s.category === category);
    setResults(found);
    setPage("Results");
    setSelected(null);
  }

  function categorySearch(category) {
    setActiveCategory(category);
    searchSchemes("", category);
  }

  function toggleSave(id) {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function addApplication(scheme) {
    if (!applications.some(a => a.id === scheme.id)) {
      setApplications(prev => [...prev, {
        id: scheme.id, name: scheme.name, status: stages[0],
        date: "", deadline: "", notes: ""
      }]);
    }
    setPage("Applications");
    setSelected(null);
  }

  function updateApp(id, key, value) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, [key]: value } : a));
  }

  function toggleDocument(schemeId, docIndex) {
    const key = String(schemeId);
    setChecklists(prev => {
      const current = prev[key] || [];
      const updated = current.includes(docIndex) ? current.filter(x => x !== docIndex) : [...current, docIndex];
      return { ...prev, [key]: updated };
    });
  }

  function startVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      setNotice("Voice input isn't supported in this browser. You can type your situation instead.");
      return;
    }
    if (listening) return;
    const recognition = new Speech();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { setListening(true); setNotice("Listening… Speak now."); };
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setQuery(prev => prev ? `${prev} ${spoken}` : spoken);
      setNotice("Voice captured. You can edit your text before searching.");
    };
    recognition.onerror = (event) => setNotice(event.error === "not-allowed" ? "Microphone permission denied. Please type instead." : "Voice input failed. Please try typing.");
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function stopVoice() {
    setListening(false);
    setNotice("Voice input stopped.");
  }

  function sortedResults() {
    const list = [...results];
    if (sort === "match") list.sort((a, b) => b.score - a.score);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function openScheme(scheme) {
    setSelected(scheme);
    setPage("Details");
  }

  const savedSchemes = schemes.filter(s => saved.includes(s.id));
  const navItems = ["Home", "Find Schemes", "My Applications", "Saved Schemes", "Help"];

  function navigate(item) {
    setSelected(null);
    if (item === "Find Schemes") setPage("Results");
    else if (item === "My Applications") setPage("Applications");
    else if (item === "Saved Schemes") setPage("Saved");
    else setPage(item);
  }

  function SchemeCard({ scheme }) {
    const Icon = scheme.icon;
    return (
      <article className="scheme-card">
        <div className="scheme-card-top">
          <div className={`scheme-icon ${scheme.category.toLowerCase()}`}><Icon size={21}/></div>
          <button className="save-icon" onClick={() => toggleSave(scheme.id)} aria-label="Save scheme">
            {saved.includes(scheme.id) ? <BookmarkCheck size={19}/> : <Bookmark size={19}/>}
          </button>
        </div>
        <span className="category-label">{scheme.category}</span>
        <h3>{scheme.name}</h3>
        <p className="scheme-benefit">{scheme.benefit}</p>
        <div className="match-row">
          <div>
            <strong className="match-score">{scheme.score}%</strong>
            <span className="match-caption"> preliminary match</span>
          </div>
          <span className={`status-pill ${scheme.score >= 80 ? "likely" : scheme.score >= 50 ? "possible" : "check"}`}>{scheme.status}</span>
        </div>
        <div className="match-bar"><span style={{width: `${scheme.score}%`}}/></div>
        <button className="card-link" onClick={() => openScheme(scheme)}>View scheme details <ArrowRight size={16}/></button>
      </article>
    );
  }

  function DetailPage() {
    if (!selected) return null;
    const checked = checklists[selected.id] || [];
    return (
      <div className="detail-page">
        <button className="back-link" onClick={() => setPage("Results")}><ArrowLeft size={17}/> Back to schemes</button>
        <div className="detail-hero">
          <span className="category-label">{selected.category} support</span>
          <h1>{selected.name}</h1>
          <p>{selected.description}</p>
          <div className="detail-tags"><span className="status-pill likely">{selected.status}</span><span className="status-pill neutral">{selected.score}% preliminary match</span></div>
        </div>
        <div className="detail-grid">
          <div className="detail-main">
            <section className="info-panel">
              <h2><Sparkles size={19}/> Why this may match</h2>
              {selected.why.map((x,i)=><p className="reason" key={i}><CheckCircle2 size={17}/>{x}</p>)}
              <h3>Information still needed</h3>
              {selected.missing.map((x,i)=><p className="reason missing" key={i}><AlertCircle size={17}/>{x}</p>)}
            </section>
            <section className="info-panel">
              <h2><FileText size={19}/> Documents checklist</h2>
              <p className="muted-text">Prepare these documents. Requirements may vary—confirm on the official website.</p>
              <div className="check-progress">
                <span>{checked.length} of {selected.documents.length} ready</span>
                <span>{Math.round(checked.length/selected.documents.length*100)}%</span>
              </div>
              <div className="progress-bar"><span style={{width:`${checked.length/selected.documents.length*100}%`}}/></div>
              {selected.documents.map((doc,i)=>(
                <label className={`document-row ${checked.includes(i)?"completed":""}`} key={i}>
                  <input type="checkbox" checked={checked.includes(i)} onChange={()=>toggleDocument(selected.id,i)}/>
                  <span className="fake-check"><Check size={14}/></span>
                  <span><strong>{doc[0]}</strong><small>{doc[1]}</small></span>
                </label>
              ))}
            </section>
            <section className="info-panel">
              <h2><ClipboardList size={19}/> How to apply</h2>
              {selected.steps.map((step,i)=>(
                <div className="step-row" key={i}><span className="step-number">{i+1}</span><p>{step}</p></div>
              ))}
            </section>
          </div>
          <aside className="detail-aside">
            <div className="info-panel benefit-panel">
              <span className="category-label">Potential support</span>
              <h2>{selected.amount}</h2>
              <p>{selected.benefit}</p>
            </div>
            <div className="info-panel">
              <h3><CalendarDays size={18}/> Deadline</h3>
              <p className="muted-text">{selected.deadline || "No verified deadline available in this demo."}</p>
              <button className="outline-btn full" onClick={()=>setNotice("No verified deadline is available to set a reminder for yet.")}><Bell size={16}/> Set a reminder</button>
            </div>
            <div className="info-panel">
              <h3><ShieldCheck size={18}/> Official information</h3>
              <p className="muted-text">Demo content. Verify eligibility and requirements through the official source.</p>
              {selected.source ? <a className="official-link" href={selected.source} target="_blank" rel="noreferrer">Open official website <ExternalLink size={15}/></a> : <span className="muted-text">Official link not configured for this demo.</span>}
            </div>
            <button className="primary-btn full" onClick={()=>addApplication(selected)}><ClipboardList size={18}/> Track this application</button>
            <button className="outline-btn full" onClick={()=>toggleSave(selected.id)}>{saved.includes(selected.id)?<BookmarkCheck size={18}/>:<Bookmark size={18}/>} {saved.includes(selected.id)?"Saved scheme":"Save scheme"}</button>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={()=>navigate("Home")}><span className="brand-icon"><Leaf size={21}/></span><span>PRAPTI<small>Har haq, har zaroorat tak.</small></span></button>
        <nav className="desktop-nav">
          {navItems.map(item=><button key={item} className={page===item?"nav-active":""} onClick={()=>navigate(item)}>{item}</button>)}
        </nav>
        <div className="header-actions">
          <div className="language-wrap"><select aria-label="Select language" value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(l=><option key={l[1]} value={l[1]}>{l[0]}</option>)}</select><ChevronDown size={14}/></div>
          <button className="mobile-menu-btn" onClick={()=>setNotice("Use the navigation shortcuts below to explore PRAPTI.")}><Menu/></button>
        </div>
      </header>

      {notice && <div className="notice-toast"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={16}/></button></div>}

      {page === "Home" && (
        <main>
          <section className="hero">
            <div className="hero-landscape">
              <div className="sun-glow"/><div className="sun"/>
              <div className="hill hill-back"/><div className="hill hill-mid"/><div className="hill hill-front"/>
              <div className="house house-one"><i/><b/></div><div className="house house-two"><i/><b/></div>
              <div className="tree tree-one"/><div className="tree tree-two"/><div className="tree tree-three"/>
            </div>
            <div className="hero-content">
              <div className="hero-badge"><Sparkles size={14}/> A little help. A lot of hope.</div>
              <h1>Simple. Smart.<br/><em>Supportive.</em></h1>
              <p>Discover government schemes tailored for you.</p>
              <div className="search-card">
                <label htmlFor="situation">Tell us about your situation...</label>
                <textarea id="situation" value={query} onChange={e=>setQuery(e.target.value)} placeholder="I'm a student from a low-income family. My father works as a daily wage labourer..." rows={3}/>
                <div className="search-controls">
                  <div className="voice-controls">
                    <button className={`mic-btn ${listening?"listening":""}`} onClick={listening?stopVoice:startVoice} title="Voice input">{listening?<MicOff size={19}/>:<Mic size={19}/>}</button>
                    <span>{listening?"Listening…":"Speak your story"}</span>
                    <button className="clear-btn" onClick={()=>{setQuery("");setNotice("Text cleared.");}}>Clear</button>
                  </div>
                  <button className="primary-btn search-btn" onClick={()=>searchSchemes()}><Search size={17}/> Find schemes <ArrowRight size={17}/></button>
                </div>
                {notice && <div className="search-notice">{notice}</div>}
              </div>
              <div className="example-prompts"><span>Try:</span><button onClick={()=>setQuery("I am a college student needing financial help")}>College student</button><button onClick={()=>setQuery("I am a farmer looking for government support")}>Farmer support</button><button onClick={()=>setQuery("My family needs health support")}>Health support</button></div>
            </div>
          </section>

          <section className="category-section content-width">
            <div className="section-heading"><div><span className="eyebrow">Explore by need</span><h2>Where can we help?</h2></div><p>Start with what matters to you.</p></div>
            <div className="category-grid">{categories.map(cat=>{const Icon=cat.icon;return <button className={`category-card ${cat.color}`} key={cat.name} onClick={()=>categorySearch(cat.name)}><span className="category-icon"><Icon size={23}/></span><span>{cat.name}</span><ArrowRight size={16} className="category-arrow"/></button>})}</div>
          </section>

          <section className="trust-strip content-width"><ShieldCheck size={20}/><p>Your information stays in this demo on your device. <strong>We never ask for Aadhaar or bank numbers.</strong></p></section>
          <Footer/>
        </main>
      )}

      {page === "Results" && (
        <main className="content-width page-content">
          <button className="back-link" onClick={()=>setPage("Home")}><ArrowLeft size={16}/> Back home</button>
          <div className="results-heading"><div><span className="eyebrow">Scheme discovery</span><h1>Possibilities for you.</h1><p>These are preliminary matches, not confirmed eligibility.</p></div><div className="results-count">{results.length} schemes</div></div>
          <div className="results-tools"><div className="filter-chips">{["All","Student","Farmer","Health","Housing"].map(c=><button key={c} className={activeCategory===c?"chip-active":""} onClick={()=>searchSchemes(query,c)}>{c}</button>)}</div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="match">Best match</option><option value="name">Name A–Z</option></select></div>
          {query && <div className="search-summary"><Search size={15}/> Results for: <strong>{query}</strong></div>}
          <div className="scheme-grid">{sortedResults().map(s=><SchemeCard key={s.id} scheme={s}/>)}</div>
          <div className="disclaimer"><AlertCircle size={17}/> Demo match scores are illustrative only. Eligibility and approval depend on official scheme rules and verification.</div>
          <Footer/>
        </main>
      )}

      {page === "Details" && <main className="content-width page-content"><DetailPage/><Footer/></main>}

      {page === "Saved" && (
        <main className="content-width page-content"><button className="back-link" onClick={()=>setPage("Home")}><ArrowLeft size={16}/> Home</button><div className="results-heading"><div><span className="eyebrow">Your collection</span><h1>Saved schemes.</h1><p>Keep the schemes you want to explore close.</p></div></div>{savedSchemes.length?<div className="scheme-grid">{savedSchemes.map(s=><SchemeCard key={s.id} scheme={s}/>)}</div>:<EmptyState icon={Bookmark} title="No saved schemes yet" text="Save schemes that you want to revisit, and they will appear here." action={()=>setPage("Results")} actionText="Explore schemes"/>}<Footer/></main>
      )}

      {page === "Applications" && (
        <main className="content-width page-content"><button className="back-link" onClick={()=>setPage("Home")}><ArrowLeft size={16}/> Home</button><div className="results-heading"><div><span className="eyebrow">Your journey</span><h1>My applications.</h1><p>Keep track of each step, at your own pace.</p></div></div>
          {applications.length? <div className="application-list">{applications.map(a=>{const s=schemes.find(x=>x.id===a.id);const count=(checklists[a.id]||[]).length;const total=s?.documents.length||0;return <article className="application-card" key={a.id}><div className="application-top"><div><span className="category-label">Application tracker</span><h3>{a.name}</h3></div><button className="delete-btn" onClick={()=>setApplications(prev=>prev.filter(x=>x.id!==a.id))}><Trash2 size={16}/></button></div><div className="stage-line">{stages.map((st,i)=><span key={st} className={stages.indexOf(a.status)>=i?"stage-done":""}/>)}</div><label className="field-label">Application status</label><select value={a.status} onChange={e=>updateApp(a.id,"status",e.target.value)}>{stages.map(st=><option key={st}>{st}</option>)}</select><div className="application-fields"><label>Application date<input type="date" value={a.date} onChange={e=>updateApp(a.id,"date",e.target.value)}/></label><label>Deadline (if known)<input type="date" value={a.deadline} onChange={e=>updateApp(a.id,"deadline",e.target.value)}/></label></div><div className="tracker-docs"><FileText size={16}/> Documents ready: {count}/{total} {total>0&&<button onClick={()=>openScheme(s)}>Open checklist <ArrowRight size={14}/></button>}</div><label className="field-label">Your notes<textarea placeholder="Add a note or update..." value={a.notes} onChange={e=>updateApp(a.id,"notes",e.target.value)}/></label></article>})}</div>:<EmptyState icon={ClipboardList} title="Nothing to track yet" text="When you find a scheme, add it to your application tracker here." action={()=>setPage("Results")} actionText="Find schemes"/>}
          <Footer/></main>
      )}

      {page === "Help" && (
        <main className="content-width page-content"><button className="back-link" onClick={()=>setPage("Home")}><ArrowLeft size={16}/> Home</button><div className="results-heading"><div><span className="eyebrow">We're here for you</span><h1>How PRAPTI works.</h1><p>Finding support shouldn't feel complicated.</p></div></div><div className="help-grid">{[[Search,"Tell us about yourself","Share your needs in simple words or use voice input."],[Sparkles,"Explore possible matches","See schemes that may suit your situation and why."],[FileText,"Prepare your documents","Use a checklist to get ready."],[ClipboardList,"Track your progress","Save schemes and update application status."]].map(([I,title,desc])=><article className="help-card" key={title}><I size={24}/><h3>{title}</h3><p>{desc}</p></article>)}</div><div className="disclaimer"><ShieldCheck size={18}/> PRAPTI is a demo assistance tool. Always verify eligibility, deadlines and application instructions with official government sources.</div><Footer/></main>
      )}
    </div>
  );
}

function EmptyState({icon:Icon,title,text,action,actionText}) {
  return <div className="empty-state"><Icon size={30}/><h3>{title}</h3><p>{text}</p><button className="primary-btn" onClick={action}>{actionText} <ArrowRight size={16}/></button></div>;
}

function Footer(){
  return <footer className="footer"><div className="footer-brand"><Leaf size={17}/> PRAPTI</div><p>Har haq, har zaroorat tak.</p><span>Demo interface · Always verify scheme details officially.</span></footer>;
}

export default App;