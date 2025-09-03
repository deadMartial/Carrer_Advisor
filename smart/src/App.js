import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// --- START: Firebase Configuration ---
// IMPORTANT: Replace this with your actual Firebase config from your project's settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// --- END: Firebase Configuration ---


// --- START: Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const profileDocRef = doc(db, "profiles", user.uid);
      const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No profile data found! Creating one.");
          // Create a default profile if none exists
          const defaultProfile = { name: user.email || "New User", grade: '12', interests: '', quizRecommendation: [], quizAnswers: {} };
          setDoc(profileDocRef, defaultProfile);
          setProfile(defaultProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  const value = { user, loading, profile, setProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};
// --- END: Authentication Context ---


// --- START: MOCK DATA & HELPERS ---
const COURSES = [
    { id: "ba", title: "B.A. (Bachelor of Arts)", icon: "🎨", description: "Focuses on humanities, social sciences, and liberal arts. Ideal for those interested in writing, history, and communication.", keywords: ["writing", "history", "languages", "social sciences"], outcomes: ["Teaching", "Civil Services (IAS/PCS)", "Journalism & Media", "Content Creation", "Social Work", "Law (after LLB)"] },
    { id: "bsc", title: "B.Sc. (Bachelor of Science)", icon: "🔬", description: "Centered on scientific principles and research. Perfect for analytical minds who enjoy labs and problem-solving.", keywords: ["math", "physics", "chemistry", "biology", "research"], outcomes: ["Scientific Research (ISRO/DRDO)", "IT & Data Analytics", "Higher Education (M.Sc./Ph.D.)", "Biotechnology", "Environmental Science"] },
    { id: "bcom", title: "B.Com. (Bachelor of Commerce)", icon: "💼", description: "The foundation of business and finance. Suited for students good with numbers and interested in economics.", keywords: ["accounting", "business", "finance", "economics"], outcomes: ["Chartered Accountant (CA)", "Banking & Finance", "Company Secretary (CS)", "Investment Banking", "MBA Entrance"] },
    { id: "bba", title: "BBA (Bachelor of Business Administration)", icon: "📈", description: "A management-focused degree that prepares students for leadership roles and entrepreneurial ventures.", keywords: ["management", "leadership", "marketing", "entrepreneurship"], outcomes: ["Management Trainee", "Human Resources", "Startup Founder", "Sales & Marketing", "Business Development"] },
    { id: "btech", title: "B.Tech (Bachelor of Technology)", icon: "💻", description: "An engineering degree focused on practical application of technology. Requires strong math and science skills.", keywords: ["engineering", "technology", "coding", "machines"], outcomes: ["Software Engineer", "Core Engineering (Civil/Mech)", "Product Management", "Data Science", "PSU Jobs"] },
    { id: "voc", title: "Vocational / Skill Courses", icon: "🛠️", description: "Short-term, hands-on courses designed to provide specific job skills for immediate employment.", keywords: ["skill", "practical", "hands-on", "short-term"], outcomes: ["Electrician/Technician", "Plumbing", "Computer Operator", "Skilled Trades", "Self-employment"] },
];

const MOCK_COLLEGES = [
    { id: 1, name: "Govt. Degree College, Northville", lat: 28.7041, lng: 77.1025, programs: ["B.A.", "B.Sc.", "B.Com."], facilities: ["Library", "Labs", "Hostel", "NSS"], cutoffs: { ba: "45%", bsc: "50%", bcom: "48%" }, image: "https://placehold.co/600x400/a7c5fd/FFF?text=Northville+College" },
    { id: 2, name: "Govt. College of Science, Eastside", lat: 28.5355, lng: 77.3910, programs: ["B.Sc.", "BCA"], facilities: ["Computer Lab", "Wi-Fi Campus", "Sports Complex"], cutoffs: { bsc: "55%", bca: "60%" }, image: "https://placehold.co/600x400/b0e0e6/FFF?text=Eastside+Science" },
    { id: 3, name: "Govt. Arts & Commerce College, Riverside", lat: 28.4595, lng: 77.0266, programs: ["B.A.", "B.Com."], facilities: ["Counseling Cell", "Library", "Auditorium"], cutoffs: { ba: "40%", bcom: "46%" }, image: "https://placehold.co/600x400/f0e68c/FFF?text=Riverside+A&C" },
    { id: 4, name: "National Institute of Technology, Metro City", lat: 28.6139, lng: 77.2090, programs: ["B.Tech"], facilities: ["Advanced Labs", "Research Center", "Hostel"], cutoffs: { btech: "JEE Mains Rank" }, image: "https://placehold.co/600x400/d3d3d3/FFF?text=NIT+Metro+City" },
];


// --- START: Reusable UI Components ---
const Icon = ({ name, className }) => <span className={`inline-block ${className}`}>{name}</span>;

const Card = ({ title, description, icon, children, className }) => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ${className}`}>
        <div className="p-6">
            <div className="flex items-center gap-4">
                {icon && <div className="text-3xl">{icon}</div>}
                <div>
                    <div className="tracking-wide text-sm text-indigo-600 font-semibold">{title}</div>
                    {description && <p className="mt-1 text-gray-500 text-sm">{description}</p>}
                </div>
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        outline: "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50",
    };
    return <button onClick={onClick} type={type} className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = ({ type = 'text', value, onChange, placeholder, className = '', ...props }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
        {...props}
    />
);

const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{children}</label>;

const Alert = ({ message, type = 'info' }) => {
    const colors = {
        info: 'bg-blue-100 border-blue-400 text-blue-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        error: 'bg-red-100 border-red-400 text-red-700',
    };
    return <div className={`border-l-4 p-4 ${colors[type]}`} role="alert"><p>{message}</p></div>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};


// --- START: Page Components ---

function NavBar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                           <Icon name="🎓" />
                           <span className="font-bold text-xl text-gray-800">CareerAdvisor</span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/quiz" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Aptitude Quiz</Link>
                                <Link to="/courses" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Courses</Link>
                                <Link to="/colleges" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Colleges</Link>
                                <Link to="/timeline" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Timeline</Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 space-x-2">
                             {user ? (
                                <>
                                    <Link to="/profile">
                                        <Button variant="secondary">Profile</Button>
                                    </Link>
                                    <Button onClick={handleSignOut} variant="primary">Sign Out</Button>
                                </>
                             ) : (
                                <>
                                    <Link to="/login"><Button variant="secondary">Login</Button></Link>
                                    <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
                                </>
                             )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

function Home() {
    const { user, profile } = useAuth();

    return (
        <div className="space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-2">
                    Your Future, Personalized.
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    { user ? `Welcome back, ${profile?.name || user.email}!` : "Discover the perfect career path and college based on your unique interests and skills." }
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Aptitude Quiz" description="Take our short quiz to find the best-fit streams for you." icon="📝">
                    <Link to="/quiz"><Button className="w-full mt-2">Start Quiz</Button></Link>
                </Card>
                <Card title="Explore Courses" description="Dive deep into courses and the career opportunities they unlock." icon="📚">
                    <Link to="/courses"><Button className="w-full mt-2">Explore Courses</Button></Link>
                </Card>
                <Card title="Find Colleges" description="Locate government colleges near you with an interactive map." icon="🏫">
                    <Link to="/colleges"><Button className="w-full mt-2">Find Colleges</Button></Link>
                </Card>
            </div>
            
            {profile?.quizRecommendation?.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-bold mb-3">Your Top Recommended Streams</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {profile.quizRecommendation.slice(0,3).map(recId => {
                             const course = COURSES.find(c => c.id === recId);
                             if(!course) return null;
                             return (
                                <Card key={course.id} title={course.title} description={course.description.substring(0, 60) + '...'} icon={course.icon}>
                                    <Link to={`/courses/${course.id}`}><Button variant="outline" className="w-full mt-2">Learn More</Button></Link>
                                </Card>
                             )
                         })}
                     </div>
                 </div>
            )}
        </div>
    );
}

function Quiz() {
    const { user, profile, setProfile } = useAuth();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState(profile?.quizAnswers || {});
    const [submitted, setSubmitted] = useState(!!profile?.quizRecommendation?.length > 0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if(profile) {
            setAnswers(profile.quizAnswers || {});
            setSubmitted(!!profile.quizRecommendation?.length > 0);
        }
    }, [profile]);

    const questions = [
        { id: "q1", text: "Which activity do you enjoy the most in your free time?", options: [ { id: "o1", label: "Reading books, writing stories, or debating ideas.", streams: ["ba"] }, { id: "o2", label: "Solving puzzles, building models, or watching science documentaries.", streams: ["bsc", "btech"] }, { id: "o3", label: "Following business news, managing a budget, or organizing events.", streams: ["bcom", "bba"] }, { id: "o4", label: "Fixing gadgets, gardening, or doing craftwork.", streams: ["voc"] } ] },
        { id: "q2", text: "Which subject combination sounds most interesting to you?", options: [ { id: "o1", label: "History, Political Science, and Literature.", streams: ["ba"] }, { id: "o2", label: "Physics, Chemistry, and Mathematics.", streams: ["bsc", "btech"] }, { id: "o3", label: "Accountancy, Business Studies, and Economics.", streams: ["bcom", "bba"] }, { id: "o4", label: "Computer Applications and practical workshop classes.", streams: ["voc", "bsc"] } ] },
        { id: "q3", text: "What kind of work environment excites you the most?", options: [ { id: "o1", label: "A library, a classroom, or a newsroom.", streams: ["ba"] }, { id: "o2", label: "A research lab, a tech company, or an engineering site.", streams: ["bsc", "btech"] }, { id: "o3", label: "A corporate office, a bank, or your own startup.", streams: ["bcom", "bba"] }, { id: "o4", label: "A workshop, a studio, or working outdoors.", streams: ["voc"] } ] },
    ];
    
    function handleSelect(qid, oid) {
        setAnswers((prev) => ({ ...prev, [qid]: oid }));
    }

    async function submit() {
        if (!user) {
            setShowModal(true);
            return;
        }

        const counts = {};
        questions.forEach(q => {
            const answerId = answers[q.id];
            if (answerId) {
                const option = q.options.find(o => o.id === answerId);
                if (option) {
                    option.streams.forEach(stream => {
                        counts[stream] = (counts[stream] || 0) + 1;
                    });
                }
            }
        });
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const recommendation = sorted.map((s) => s[0]);
        
        const updatedProfile = { ...profile, quizAnswers: answers, quizRecommendation: recommendation };
        const profileDocRef = doc(db, "profiles", user.uid);
        await setDoc(profileDocRef, updatedProfile, { merge: true });
        setProfile(updatedProfile); 
        setSubmitted(true);
    }
    
    const recommendations = profile?.quizRecommendation;

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Login Required">
              <p>Please log in or sign up to save your quiz results and get personalized recommendations.</p>
              <div className="flex gap-2 mt-4">
                  <Link to="/login" className="w-full"><Button className="w-full" onClick={() => setShowModal(false)}>Login</Button></Link>
                  <Link to="/signup" className="w-full"><Button variant="secondary" className="w-full" onClick={() => setShowModal(false)}>Sign Up</Button></Link>
              </div>
          </Modal>

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Aptitude & Interest Quiz</h2>
          <div className="space-y-6">
              {questions.map((q) => (
                  <Card key={q.id} title={q.text} className="shadow-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {q.options.map((o) => (
                              <label key={o.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${answers[q.id] === o.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                                  <input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => handleSelect(q.id, o.id)} className="sr-only"/>
                                  <span className="text-sm">{o.label}</span>
                              </label>
                          ))}
                      </div>
                  </Card>
              ))}
          </div>

          <div className="mt-8 text-center">
              <Button onClick={submit} className="px-8 py-3 text-lg">
                  {submitted ? "Update Results" : "Get My Recommendations"}
              </Button>
          </div>
          {submitted && recommendations && (
              <div className="mt-10">
                   <h3 className="text-2xl font-bold text-center mb-4">Your Personalized Recommendations</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((r) => {
                            const course = COURSES.find((c) => c.id === r);
                            if (!course) return null;
                            return (
                                <Card key={r} title={course.title} description={course.description} icon={course.icon}>
                                    <Link to={`/courses/${course.id}`}><Button variant="outline" className="w-full mt-2">View Details</Button></Link>
                                </Card>
                            );
                        })}
                   </div>
              </div>
          )}
      </div>
    );
}

function Courses() {
  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Explore Courses & Career Paths</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((c) => (
          <Link to={`/courses/${c.id}`} key={c.id}>
             <Card title={c.title} description={c.description} icon={c.icon} className="h-full" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function CourseDetail() {
    const { courseId } = useParams();
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return <Navigate to="/courses" />;
    
    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{course.icon}</span>
                <h1 className="text-3xl font-bold">{course.title}</h1>
            </div>
            <p className="text-gray-600 mb-6">{course.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-indigo-700">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {course.keywords.map(k => <span key={k} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{k}</span>)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-700">Possible Career Outcomes</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {course.outcomes.map(o => <li key={o}>{o}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function Colleges() {
  // This is a placeholder for the interactive map. In a real scenario, you'd use a library like React Leaflet.
  const InteractiveMapPlaceholder = () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 shadow-inner">
      <p>[ Interactive Map Would Be Here ]</p>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Find Nearby Colleges</h2>
      <InteractiveMapPlaceholder />
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">List of Government Colleges</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COLLEGES.map((c) => (
            <Link to={`/colleges/${c.id}`} key={c.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <img src={c.image} alt={c.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-lg">{c.name}</h4>
                  <p className="text-sm text-gray-600">{c.programs.join(' • ')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollegeDetail() {
    const { collegeId } = useParams();
    const college = MOCK_COLLEGES.find(c => c.id === parseInt(collegeId));

    if (!college) return <Navigate to="/colleges" />;
    
    // NOTE: For the static map image to work, you need to enable the "Maps Static API" 
    // in your Google Cloud Platform project and add your API key.
    const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";
    const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${college.lat},${college.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${college.lat},${college.lng}&key=${GOOGLE_MAPS_API_KEY}`;

    return (
        <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden">
            <img src={college.image} alt={college.name} className="w-full h-56 object-cover" />
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900">{college.name}</h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Programs Offered</h3>
                        <div className="flex flex-wrap gap-2">
                             {college.programs.map(p => <span key={p} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{p}</span>)}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Facilities</h3>
                         <div className="flex flex-wrap gap-2">
                             {college.facilities.map(f => <span key={f} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{f}</span>)}
                        </div>
                    </div>
                    <div>
                         <h3 className="font-semibold text-lg mb-2">Admission Cutoffs (Previous Year)</h3>
                         <ul className="list-disc list-inside">
                             {Object.entries(college.cutoffs).map(([k,v]) => <li key={k}><span className="font-semibold uppercase">{k}:</span> {v}</li>)}
                         </ul>
                    </div>
                </div>
                 <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Location</h3>
                     <a href={`https://maps.google.com/?q=${college.lat},${college.lng}`} target="_blank" rel="noreferrer">
                        {GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY_HERE" ?
                          <img src={mapImageUrl} alt="Map location" className="rounded-lg border"/> :
                          <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 shadow-inner">
                            <p>Please add a Google Maps API key to see the map.</p>
                          </div>
                        }
                     </a>
                </div>
            </div>
        </div>
    )
}

function Timeline() {
  const [events] = useState([
    { id: 1, title: "All India Engineering Entrance Exam (JEE Mains)", date: "2025-04-15", type: 'exam' },
    { id: 2, "title": "University of Delhi UG Admissions Start", date: "2025-05-20", type: 'admission' },
    { id: 3, "title": "National Scholarship Portal Opens", date: "2025-07-01", type: 'scholarship' },
    { id: 4, "title": "State Medical College Counselling Begins", date: "2025-08-10", type: 'admission' }
  ]);
  
  const typeStyles = {
    exam: { icon: '📝', color: 'bg-red-100 text-red-800' },
    admission: { icon: '🏫', color: 'bg-blue-100 text-blue-800' },
    scholarship: { icon: '💰', color: 'bg-green-100 text-green-800' },
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Admissions & Scholarship Timeline</h2>
       <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className={`p-4 rounded-lg flex items-center gap-4 shadow-sm ${typeStyles[e.type].color}`}>
            <div className="text-2xl">{typeStyles[e.type].icon}</div>
            <div className="flex-grow">
              <div className="font-bold">{e.title}</div>
              <div className="text-sm font-medium">{new Date(e.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <Button variant="outline" onClick={() => alert('Calendar event download would be triggered here.')}>Add to Calendar</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile() {
    const { user, profile, setProfile } = useAuth();
    const [localProfile, setLocalProfile] = useState(profile);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    if (!user) return <Navigate to="/login" />;
    if (!localProfile) return <p className="text-center">Loading profile...</p>;
    
    const updateField = (key, value) => {
        setLocalProfile(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const profileDocRef = doc(db, "profiles", user.uid);
        try {
            await setDoc(profileDocRef, localProfile, { merge: true });
            setProfile(localProfile);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error updating profile: ", error);
            setMessage('Failed to update profile.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h2 className="text-3xl font-bold">Your Profile</h2>
            <Card title="Personal Information" icon="👤">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={localProfile.name} onChange={(e) => updateField('name', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} disabled className="bg-gray-100"/>
                    </div>
                    <div>
                         <Label htmlFor="grade">Current Grade/Class</Label>
                         <Input id="grade" value={localProfile.grade} onChange={(e) => updateField('grade', e.target.value)} />
                    </div>
                </div>
                 <div className="mt-4">
                    <Label htmlFor="interests">Your Interests (comma-separated)</Label>
                    <Input id="interests" value={localProfile.interests} onChange={(e) => updateField('interests', e.target.value)} placeholder="e.g., coding, reading, sports" />
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                </div>
            </Card>
        </div>
    )
}

function AuthForm({ isLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err) {
            let friendlyError = "An unknown error occurred.";
            if (err.code) {
                switch (err.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        friendlyError = "Invalid email or password.";
                        break;
                    case 'auth/email-already-in-use':
                        friendlyError = "An account with this email already exists.";
                        break;
                    case 'auth/weak-password':
                        friendlyError = "Password should be at least 6 characters.";
                        break;
                    default:
                        friendlyError = "Authentication failed. Please try again.";
                }
            }
            setError(friendlyError);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{isLogin ? 'Sign in to your account' : 'Create a new account'}</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <Label htmlFor="email-address">Email address</Label>
                            <Input id="email-address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" />
                        </div>
                    </div>
                    {error && <Alert message={error} type="error" />}
                    <div>
                        <Button type="submit" className="w-full justify-center py-3">{isLogin ? 'Sign in' : 'Sign up'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- START: Main App Component ---
function App() {
  return (
    <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <NavBar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/colleges/:collegeId" element={<CollegeDetail />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<AuthForm isLogin={true} />} />
                <Route path="/signup" element={<AuthForm isLogin={false} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <footer className="bg-white border-t mt-8">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    © 2025 CareerAdvisor India — For educational and hackathon purposes only.
                </div>
            </footer>
          </div>
        </Router>
    </AuthProvider>
  );
}

export default App;

