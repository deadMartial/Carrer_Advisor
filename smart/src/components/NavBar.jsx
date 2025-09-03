import { Link } from "react-router-dom";
import { HiOutlineMenu } from "react-icons/hi";

export default function NavBar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-indigo-600">
          CareerAdvisor
        </Link>

        <nav className="hidden md:flex gap-6 text-sm items-center">
          <Link to="/quiz" className="hover:underline">Aptitude Quiz</Link>
          <Link to="/courses" className="hover:underline">Courses & Careers</Link>
          <Link to="/colleges" className="hover:underline">Nearby Colleges</Link>
          <Link to="/timeline" className="hover:underline">Timeline</Link>
        </nav>

        <div className="md:hidden">
          <button className="p-2 rounded border">
            <HiOutlineMenu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
