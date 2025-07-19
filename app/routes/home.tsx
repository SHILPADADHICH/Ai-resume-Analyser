import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareerVault" },
    {
      name: "description",
      content:
        "Manage your career moves efficiently with AI-powered resume analysis!",
    },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="glow-effect slide-in-left">
            Manage Your Career Moves Efficiently
          </h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2 className="text-gray-600 slide-in-right">
              Transform your professional journey with AI-powered resume
              analysis and career insights.
            </h2>
          ) : (
            <h2 className="text-gray-600 slide-in-right">
              Track your applications and discover intelligent feedback to
              accelerate your career growth.
            </h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-400 rounded-full flex items-center justify-center float-effect">
              <div className="w-24 h-24 bg-white rounded-full animate-spin border-4 border-transparent border-t-primary-400"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">
              Analyzing your documents...
            </p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume, index) => (
              <div
                key={resume.id}
                className="slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ResumeCard resume={resume} />
              </div>
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-400 rounded-full flex items-center justify-center mx-auto mb-6 float-effect">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                Start your journey to career excellence
              </p>
            </div>
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold glow-effect hover-lift"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
