"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    authorRole: string;
    imageGradient: string;
}

const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "Understanding Alzheimer's: A Guide for Families",
        excerpt: "Navigating the complexities of Alzheimer's care can be challenging. Learn how to recognize early signs and create a supportive home environment for your loved ones.",
        category: "Caregiving Guide",
        date: "Oct 12, 2023",
        readTime: "6 min read",
        author: "Sarah Jenkins",
        authorRole: "Senior Care Specialist",
        imageGradient: "from-blue-500 to-cyan-400",
    },
    {
        id: 2,
        title: "5 Tips for Preventing Caregiver Burnout",
        excerpt: "Caring for a family member is rewarding but exhausting. Discover practical strategies to take care of your own mental and physical well-being while caregiving.",
        category: "Wellness",
        date: "Sep 28, 2023",
        readTime: "5 min read",
        author: "Dr. Emily Chen",
        authorRole: "Psychologist",
        imageGradient: "from-indigo-500 to-purple-400",
    },
    {
        id: 3,
        title: "The Importance of Social Interaction for Seniors",
        excerpt: "Isolation can severely impact a senior's health. We explore the benefits of companionship and how home care can foster meaningful social connections.",
        category: "Senior Health",
        date: "Sep 15, 2023",
        readTime: "4 min read",
        author: "Michael Roberts",
        authorRole: "Community Director",
        imageGradient: "from-emerald-500 to-teal-400",
    },
    {
        id: 4,
        title: "Home Safety Checklist for Fall Prevention",
        excerpt: "Falls are a leading cause of injury among older adults. Use our comprehensive checklist to identify and remove hazards in the home to keep your loved ones safe.",
        category: "Safety",
        date: "Aug 30, 2023",
        readTime: "7 min read",
        author: "Laura Thompson",
        authorRole: "Occupational Therapist",
        imageGradient: "from-orange-500 to-yellow-400",
    },
    {
        id: 5,
        title: "Navigating Nutrition: Healthy Meals for the Elderly",
        excerpt: "Proper nutrition is vital as we age. Get tips on planning balanced, nutrient-dense meals that are easy to prepare and cater to specific dietary needs.",
        category: "Nutrition",
        date: "Aug 18, 2023",
        readTime: "5 min read",
        author: "David Lee",
        authorRole: "Registered Dietitian",
        imageGradient: "from-rose-500 to-pink-400",
    },
    {
        id: 6,
        title: "Transitioning to In-Home Care: What to Expect",
        excerpt: "Bringing a caregiver into the home is a big step. Read about what to expect during the first few weeks and how to ensure a smooth transition for everyone.",
        category: "Advice",
        date: "Aug 02, 2023",
        readTime: "6 min read",
        author: "Sarah Jenkins",
        authorRole: "Senior Care Specialist",
        imageGradient: "from-blue-600 to-indigo-600",
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white py-24 sm:py-32 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]" />
                        <div className="absolute top-[50%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500 blur-[140px]" />
                    </div>

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-800/40 rounded-2xl mb-6 backdrop-blur-sm border border-blue-400/20 shadow-2xl">
                            <BookOpen className="w-8 h-8 text-cyan-300" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                            Insights & Advice
                        </h1>
                        <p className="text-lg sm:text-xl lg:text-2xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-light">
                            Expert articles, tips, and resources to help you provide the best possible care for your loved ones.
                        </p>
                    </div>
                </div>

                {/* Featured Post (Latest) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row transition-transform hover:-translate-y-1 duration-300">
                        <div className={`lg:w-1/2 h-64 lg:h-auto bg-gradient-to-br ${blogPosts[0].imageGradient} relative p-8 flex flex-col justify-end`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full mb-4">
                                    {blogPosts[0].category}
                                </span>
                            </div>
                        </div>
                        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                            <div className="flex items-center text-sm text-slate-500 mb-4 space-x-4">
                                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />{blogPosts[0].date}</span>
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" />{blogPosts[0].readTime}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 hover:text-blue-600 transition-colors">
                                <Link href="#">{blogPosts[0].title}</Link>
                            </h2>
                            <p className="text-slate-600 text-lg mb-6 line-clamp-3">
                                {blogPosts[0].excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                                        {blogPosts[0].author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{blogPosts[0].author}</p>
                                        <p className="text-xs text-slate-500">{blogPosts[0].authorRole}</p>
                                    </div>
                                </div>
                                <Link href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                                    Read More <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blog Posts Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-3xl font-bold text-slate-900">Latest Articles</h3>
                        <div className="hidden sm:flex space-x-2">
                            {['All', 'Caregiving', 'Wellness', 'Safety'].map((filter) => (
                                <button key={filter} className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-colors`}>
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.slice(1).map((post) => (
                            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group">
                                {/* Simulated Image */}
                                <div className={`h-48 w-full bg-gradient-to-br ${post.imageGradient} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold rounded-full shadow-sm">
                                        {post.category}
                                    </span>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-xs text-slate-500 mb-3 space-x-3">
                                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{post.date}</span>
                                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{post.readTime}</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        <Link href="#">{post.title}</Link>
                                    </h4>
                                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold mr-2">
                                                {post.author.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-slate-700">{post.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="mt-16 text-center">
                        <button className="inline-flex items-center px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">
                            Load More Articles
                        </button>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="bg-blue-900 text-white py-16 sm:py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-50 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-600 rounded-full blur-[100px] opacity-50 pointer-events-none" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h3 className="text-3xl sm:text-4xl font-bold mb-4">Subscribe to our Newsletter</h3>
                        <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
                            Get the latest insights, caregiving tips, and news delivered directly to your inbox every month.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="px-5 py-3 rounded-xl flex-grow text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-400"
                                required
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors duration-200 whitespace-nowrap shadow-lg shadow-cyan-500/30"
                            >
                                Subscribe Now
                            </button>
                        </form>
                        <p className="text-xs text-blue-300 mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
