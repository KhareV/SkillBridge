"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  LineChart,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  TrendingUp,
  User,
  Building,
  Clock,
  CheckCircle2,
  BadgeCheck,
  Target,
} from "lucide-react";
import SparkleButton from "@/components/ui/SparkleButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  generateCareerPathRecommendations,
  generateJobRecommendations,
} from "@/lib/gemini-api";
import { formatCurrency } from "@/lib/utils";
import LoadingScreen from "../components/ui/LoadingScreen";
import Layout from "../components/layout/Layout";
import JobRecommendationCard from "@/components/ui/JobRecommendationCard";
const fetchUserSkills = async () => {
  try {
    const response = await fetch("/data/students.json");
    const students = await response.json();
    return students[0].skills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
};

const fetchUserProfile = async () => {
  try {
    const response = await fetch("/data/students.json");
    const students = await response.json();
    return students[0];
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export default function CareerSimulator() {
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedCareerPath, setSelectedCareerPath] = useState<any>(null);
  const [careerRecommendations, setCareerRecommendations] = useState<any>(null);
  const [jobRecommendations, setJobRecommendations] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([
    "Machine Learning",
    "Data Analysis",
    "Software Development",
  ]);
  const [newInterest, setNewInterest] = useState("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const currentTime = "2025-03-28 05:46:33";
  const currentUser = "vkhare2909";

  useEffect(() => {
    const loadData = async () => {
      const skills = await fetchUserSkills();
      const profile = await fetchUserProfile();

      setUserSkills(skills);
      setUserProfile(profile);
      setLoading(false);
      generateRecommendations(skills, profile);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading && headlineRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        headlineRef.current.querySelectorAll("span"),
        {
          opacity: 0,
          y: 30,
          rotationX: -40,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
        }
      );
    }
  }, [loading]);

  const generateRecommendations = async (skills: any[], profile: any) => {
    setLoadingRecommendations(true);
    setJobRecommendations([]);

    try {
      const background = profile?.bio || "Student with programming experience";
      const [jobs, careerPathsData] = await Promise.all([
        generateJobRecommendations(skills, userInterests, background),
        getMockCareerRecommendations(skills, userInterests),
      ]);

      setJobRecommendations(jobs);
      if (careerPathsData) {
        setCareerRecommendations(careerPathsData);
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  function getMockCareerRecommendations(
    skills: any[],
    interests: string[]
  ): any {
    const recommendations = {
      careerPaths: [
        {
          title: "Machine Learning Engineer",
          suitabilityScore: 87,
          requiredSkills: [
            "Python",
            "Machine Learning",
            "Statistics",
            "TensorFlow",
          ],
          currentMatchPercentage: 75,
          salaryCap: "$130,000",
          recommendations: [
            "Take a specialized deep learning course",
            "Build a portfolio of ML projects",
            "Learn cloud-based ML deployment",
          ],
        },
        {
          title: "Data Scientist",
          suitabilityScore: 82,
          requiredSkills: ["Python", "Statistics", "Data Visualization", "SQL"],
          currentMatchPercentage: 80,
          salaryCap: "$125,000",
          recommendations: [
            "Enhance SQL query optimization skills",
            "Learn Tableau or Power BI",
            "Take a course on experimental design",
          ],
        },
        {
          title: "Full Stack Developer",
          suitabilityScore: 78,
          requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
          currentMatchPercentage: 65,
          salaryCap: "$115,000",
          recommendations: [
            "Build experience with backend frameworks",
            "Learn about API design and development",
            "Complete projects with database integration",
          ],
        },
      ],
    };
    if (interests.some((i) => i.toLowerCase().includes("blockchain"))) {
      recommendations.careerPaths.push({
        title: "Blockchain Developer",
        suitabilityScore: 75,
        requiredSkills: [
          "Solidity",
          "Smart Contracts",
          "JavaScript",
          "Cryptography",
        ],
        currentMatchPercentage: 50,
        salaryCap: "$140,000",
        recommendations: [
          "Complete a Solidity certification",
          "Contribute to an open-source blockchain project",
          "Build a dApp portfolio project",
        ],
      });
    }
    return recommendations;
  }

  const addInterest = () => {
    if (newInterest.trim() && !userInterests.includes(newInterest.trim())) {
      setUserInterests([...userInterests, newInterest.trim()]);
      setNewInterest("");
      if (userSkills.length > 0 && userProfile) {
        generateRecommendations(userSkills, userProfile);
      }
    }
  };

  const removeInterest = (interest: string) => {
    setUserInterests(userInterests.filter((i) => i !== interest));
    if (userSkills.length > 0 && userProfile) {
      generateRecommendations(userSkills, userProfile);
    }
  };
  useEffect(() => {
    if (selectedCareerPath && timelineRef.current) {
      const timelineItems =
        timelineRef.current.querySelectorAll(".timeline-item");

      gsap.fromTo(
        timelineItems,
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.2,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, [selectedCareerPath]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen py-24 overflow-hidden">
        {/* Background Elements */}
        <div
          className="absolute inset-0 -z-10 parallax-bg"
          style={{ height: "150%" }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.1) 25%, rgba(45, 212, 191, 0.05) 50%, transparent 80%)",
              height: "150%",
              width: "100%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(14,165,233,0.15) 0, rgba(0,0,0,0) 80%)",
              height: "150%",
              width: "100%",
            }}
          />
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="mb-2">
                <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/20 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {currentTime} • {currentUser}
                </span>
              </div>

              <h1
                ref={headlineRef}
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                <span className="gradient-text">Career</span>{" "}
                <span>Simulator</span>{" "}
                <span className="relative inline-block">
                  AI
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,5 Q40,0 80,5 T160,5 T240,5"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg">
                Explore potential career paths based on your skills and
                interests with AI-powered guidance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6 sticky top-20"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-400" />
                  Your Profile
                </h2>

                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">Top Skills</h3>
                  <div className="space-y-3">
                    {userSkills
                      .sort((a, b) => b.level - a.level)
                      .slice(0, 5)
                      .map((skill) => (
                        <div
                          key={skill.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-indigo-400" />
                            <span className="text-gray-300">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                style={{ width: `${skill.level}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300">
                              {skill.level}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-3">
                    <Link href="/skill-assessment">
                      <span className="inline-block w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all text-center">
                        Add More Skills
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">
                    Career Interests
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userInterests.map((interest) => (
                      <Badge
                        key={interest}
                        className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-none cursor-pointer"
                      >
                        {interest}
                        <button
                          className="ml-1 text-gray-400 hover:text-white transition-colors"
                          onClick={() => removeInterest(interest)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      placeholder="Add interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addInterest();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={addInterest}
                      className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">
                    Experience Level
                  </h3>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-indigo-400" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Entry Level</span>
                        <span className="text-gray-400">Expert</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">
                    Preferred Locations
                  </h3>
                  <div className="space-y-2">
                    {userProfile.career.preferredLocations.map(
                      (location: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-300">{location}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    generateRecommendations(userSkills, userProfile)
                  }
                  disabled={loadingRecommendations}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingRecommendations
                    ? "Generating..."
                    : "Regenerate Recommendations"}
                </button>
              </motion.div>

              {/* Display Job Recommendations Below the Button in the Left Column */}
              {!loadingRecommendations && jobRecommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8 bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-400" />
                    Recommended Jobs
                  </h2>
                  <div className="space-y-4">
                    {jobRecommendations.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Building className="h-4 w-4 text-indigo-300" />
                          </div>
                          <h3 className="font-semibold text-white truncate">
                            {job.companyName}
                          </h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Briefcase className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                            <span className="truncate">{job.jobRole}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <DollarSign className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-8">
              {loadingRecommendations ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-8 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-white">
                    Generating career recommendations...
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Using AI to analyze your skills and interests for the best
                    career matches
                  </p>
                </motion.div>
              ) : careerRecommendations ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6"
                  >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-purple-400" />
                      Recommended Career Paths
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {careerRecommendations.careerPaths.map(
                        (path: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <button
                              className={`w-full p-4 rounded-lg text-left transition-all ${
                                selectedCareerPath?.title === path.title
                                  ? "bg-indigo-500/20 border border-indigo-500/50"
                                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30"
                              }`}
                              onClick={() => setSelectedCareerPath(path)}
                            >
                              <div className="font-semibold text-white mb-2">
                                {path.title}
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm text-gray-400">
                                  Match Score
                                </div>
                                <div className="text-sm font-medium text-gray-300">
                                  {path.suitabilityScore}%
                                </div>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                  style={{ width: `${path.suitabilityScore}%` }}
                                ></div>
                              </div>
                            </button>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>

                  {selectedCareerPath && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6"
                    >
                      {/* ... Rest of the selectedCareerPath details UI ... */}
                      {/* This part remains the same as the original file */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {selectedCareerPath.title}
                          </h2>
                          <p className="text-gray-400">
                            Career path analysis based on your profile
                          </p>
                        </div>
                        <Badge
                          className={
                            selectedCareerPath.suitabilityScore > 80
                              ? "bg-indigo-500/30 text-indigo-300 border-none"
                              : "bg-white/10 text-gray-300 border-white/20"
                          }
                        >
                          {selectedCareerPath.suitabilityScore}% Match
                        </Badge>
                      </div>

                      {/* ... other sections like Salary, Open Positions, Growth, Skills, Action Plan, Companies ... */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-5 w-5 text-indigo-400" />
                            <h3 className="font-semibold text-white">
                              Potential Salary
                            </h3>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">
                            {selectedCareerPath.salaryCap}
                          </div>
                          <p className="text-sm text-gray-400">
                            Average max compensation
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="h-5 w-5 text-purple-400" />
                            <h3 className="font-semibold text-white">
                              Open Positions
                            </h3>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">
                            1,240+ {/* Placeholder */}
                          </div>
                          <p className="text-sm text-gray-400">
                            Current job openings
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-5 w-5 text-teal-400" />
                            <h3 className="font-semibold text-white">
                              Growth Rate
                            </h3>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">
                            +18% {/* Placeholder */}
                          </div>
                          <p className="text-sm text-gray-400">
                            Expected job growth (5yr)
                          </p>
                        </div>
                      </div>

                      {/* Skill Analysis & Action Plan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <BadgeCheck className="h-5 w-5 mr-2 text-indigo-400" />
                            Skill Analysis
                          </h3>
                          {/* ... Skill match percentage bar ... */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">
                                Current Skill Match
                              </span>
                              <span className="font-medium text-gray-300">
                                {selectedCareerPath.currentMatchPercentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                style={{
                                  width: `${selectedCareerPath.currentMatchPercentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          {/* ... Required skills list ... */}
                          <div className="space-y-3">
                            {selectedCareerPath.requiredSkills.map(
                              (skill: string, index: number) => {
                                const userSkill = userSkills.find(
                                  (s) => s.name === skill
                                );
                                const hasSkill = !!userSkill;
                                return (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                  >
                                    <div className="flex items-center gap-2">
                                      {hasSkill ? (
                                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                      ) : (
                                        <Target className="h-4 w-4 text-amber-400" />
                                      )}
                                      <span className="text-gray-300">
                                        {skill}
                                      </span>
                                    </div>
                                    {hasSkill ? (
                                      <div className="flex items-center gap-2">
                                        {/* Skill level display */}
                                      </div>
                                    ) : (
                                      <Badge className="bg-amber-500/20 text-amber-300 border-none text-xs">
                                        Needed
                                      </Badge>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
                            Action Plan
                          </h3>
                          {/* ... Action plan timeline ... */}
                          <div className="space-y-4" ref={timelineRef}>
                            {selectedCareerPath.recommendations.map(
                              (recommendation: string, index: number) => (
                                <div
                                  key={index}
                                  className="timeline-item flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {recommendation}
                                    </div>
                                    {/* ... Timeline text ... */}
                                  </div>
                                </div>
                              )
                            )}
                            {/* ... Ready for job applications item ... */}
                          </div>
                        </div>
                      </div>

                      {/* Removed "Top Companies Hiring" section */}

                      {/* Enhanced Button Section */}
                      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-6">
                        {" "}
                        {/* Increased gap and added top border */}
                        <Link href="/marketplace" className="flex-1">
                          <SparkleButton
                            href="/marketplace"
                            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all flex items-center justify-center"
                          >
                            Find Relevant Courses
                            <GraduationCap className="ml-2 h-5 w-5" />
                          </SparkleButton>
                        </Link>
                        <Link href="/careers" className="flex-1">
                          {/* Enhanced secondary button style */}
                          <span className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-500/20 border border-purple-400/50 text-purple-300 font-medium hover:bg-purple-600/30 hover:border-purple-400/80 hover:text-white transition-all group shadow-md hover:shadow-lg">
                            Explore Job Opportunities
                            <Briefcase className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-8 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      No Recommendations Generated
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Add more skills and interests to generate career
                      recommendations that match your profile.
                    </p>
                    <button
                      onClick={() =>
                        generateRecommendations(userSkills, userProfile)
                      }
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all"
                    >
                      Generate Recommendations
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Link href="#resources">
              <span className="flex flex-col items-center text-gray-400 hover:text-white transition-colors duration-300">
                <span className="text-sm mb-2">Explore more resources</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 12L12 19L5 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Global styles to match Hero.tsx */}
        <style jsx global>{`
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
            100% {
              transform: translateY(0px);
            }
          }

          /* Gradient text styles */
          .gradient-text {
            background: linear-gradient(to right, #38bdf8, #d946ef, #2dd4bf);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
          }
        `}</style>
      </div>
    </Layout>
  );
}
