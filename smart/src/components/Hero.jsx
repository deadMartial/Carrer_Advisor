import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            One-Stop Personalized Career & Education Advisor
          </h1>
          <p className="mt-4 text-lg text-indigo-100/90">
            Short aptitude quizzes, nearby government college listings, course→career mapping and timetable reminders — all in one place.
          </p>

          <div className="mt-6 flex gap-3">
            <Link to="/quiz" className="bg-white text-indigo-600 px-5 py-2 rounded-md font-medium shadow">
              Start Qu fsdfsfiz
            </Link>
            <Link to="/colleges" className="border border-white/60 px-5 py-2 rounded-md font-medium">
              Find Colleges
            </Link>
          </div>
        </div>

        <div className="md:w-1/2">
          <img src="/illus-students.svg" alt="Students" class="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
