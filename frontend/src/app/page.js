'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Aurora from '@/components/background/Aurora';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SplitText from '@/components/ui/SplitText';
import CardSwap, { Card } from '@/components/ui/cardSwap';
import { ArrowRight, Monitor, Shield, BarChart3, Eye, AlertTriangle, Zap, Clock, Users, Database, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden relative">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div className="h-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 transition-all duration-300 ease-out" 
             style={{width: `${scrollProgress}%`}}></div>
      </div>

      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={['#7B7481', '#9B8A9C', '#B8A5B8']}
          amplitude={1.8}
          blend={1.2}
          speed={0.4}
        />
      </div>

      {/* Lighter overlay for better Aurora visibility */}
      <div className="fixed inset-0 bg-[#0f0f10]/5 z-5"></div>

      {/* Navigation */}
      <nav className="relative z-20 backdrop-blur-md bg-[#0f0f10]/60 border-b border-[#232329]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#232329]/40 to-[#18181b]/40 backdrop-blur-sm rounded-xl border border-[#232329]/60">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-[#9ca3af]" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[#f9fafb]">
              AP-EYE
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-[#9ca3af] hover:text-[#f9fafb] transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base bg-[#232329]/30 backdrop-blur-sm border border-[#232329] rounded-full hover:bg-[#232329]/50 transition-all text-[#f9fafb]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section - Centered "Eye for API" */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="relative">
            <SplitText
              text="Eye for API"
              className="text-4xl sm:text-6xl md:text-8xl lg:text-[8rem] font-black text-[#f9fafb] leading-tight"
              splitType="chars"
              delay={50}
              duration={0.8}
              from={{ opacity: 0, y: 60, rotationX: -90 }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
              ease="back.out(1.7)"
              threshold={0.3}
            />
            <div className="mt-6 sm:mt-8 opacity-70">
              <p className="text-base sm:text-lg md:text-xl text-slate-400 font-light px-4 sm:px-0">
                Real-time API monitoring that actually works
              </p>
            </div>
          </div>
        </div>

        {/* Minimal scroll indicator - centered */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-3 text-[#9ca3af]">
            <span className="text-sm font-medium">scroll</span>
            <div className="w-6 h-10 border border-[#232329] rounded-full flex justify-center">
              <div className="w-1 h-3 bg-[#9ca3af] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What is AP-EYE Section - Simplified */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={6} blurStrength={15}>
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-[#f9fafb]">
              Monitor. Alert. Protect.
            </h2>
            <p className="text-xl text-[#9ca3af] mb-16 leading-relaxed">
              We watch your APIs 24/7 and send instant email alerts when something breaks.
            </p>
          </ScrollReveal>

          {/* Core Features - Just 3 */}
          <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={4} blurStrength={10}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-2xl">
                <div className="p-4 bg-[#232329]/40 rounded-full w-fit mx-auto mb-6">
                  <Eye className="w-8 h-8 text-[#9ca3af]" />
                </div>
                <h4 className="text-xl font-bold text-[#f9fafb] mb-3">24/7 Monitoring</h4>
                <p className="text-[#9ca3af] text-sm">Never sleeps, always watching</p>
              </div>
              
              <div className="text-center p-8 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-2xl">
                <div className="p-4 bg-[#232329]/40 rounded-full w-fit mx-auto mb-6">
                  <Mail className="w-8 h-8 text-[#9ca3af]" />
                </div>
                <h4 className="text-xl font-bold text-[#f9fafb] mb-3">Email Alerts</h4>
                <p className="text-[#9ca3af] text-sm">Instant notifications when issues occur</p>
              </div>
              
              <div className="text-center p-8 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-2xl">
                <div className="p-4 bg-[#232329]/40 rounded-full w-fit mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-[#9ca3af]" />
                </div>
                <h4 className="text-xl font-bold text-[#f9fafb] mb-3">Analytics</h4>
                <p className="text-[#9ca3af] text-sm">Clear insights, no noise</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose AP-EYE Section - Condensed */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={4} blurStrength={10}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <span className="text-[#9ca3af]">Why choose</span>
                <span className="text-[#f9fafb] whitespace-nowrap"> AP-EYE?</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Clock className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Sub-Second Detection</h3>
                <p className="text-[#9ca3af] text-sm">Detect issues faster than you can blink</p>
              </div>
            </ScrollReveal>

            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Shield className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Enterprise Security</h3>
                <p className="text-[#9ca3af] text-sm">SOC 2 compliant with end-to-end encryption</p>
              </div>
            </ScrollReveal>

            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Users className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Team Collaboration</h3>
                <p className="text-[#9ca3af] text-sm">Share insights across your entire team</p>
              </div>
            </ScrollReveal>

            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Database className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Historical Insights</h3>
                <p className="text-[#9ca3af] text-sm">Track patterns and trends over time</p>
              </div>
            </ScrollReveal>

            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Zap className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Lightning Setup</h3>
                <p className="text-[#9ca3af] text-sm">Start monitoring in under 2 minutes</p>
              </div>
            </ScrollReveal>

            <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={3} blurStrength={8}>
              <div className="p-6 bg-[#18181b]/30 backdrop-blur-xl border border-[#232329] rounded-xl">
                <div className="p-3 bg-[#232329]/40 rounded-full w-fit mb-4">
                  <Eye className="w-6 h-6 text-[#9ca3af]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#f9fafb]">Global Visibility</h3>
                <p className="text-[#9ca3af] text-sm">Monitor from multiple worldwide locations</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CardSwap Demo Section - Big Cards */}
      <section className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Container for both text and CardSwap */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16 lg:justify-between">
            {/* Text Content */}
            <div className="text-center lg:text-left max-w-4xl lg:max-w-xl xl:max-w-2xl lg:flex-shrink-0">
              <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={5} blurStrength={12}>
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6">
                    <span className="text-[#9ca3af]">See it in</span>
                    <span className="text-[#f9fafb]"> Action</span>
                  </h2>
                  <p className="text-lg sm:text-xl text-[#9ca3af] max-w-2xl mx-auto lg:mx-0">
                    Watch AP-EYE monitor your APIs in real-time
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* CardSwap Container - Centered on mobile, far right on desktop */}
            <div className="flex justify-center lg:justify-end w-full lg:w-auto relative lg:flex-shrink-0">
              <div className="w-full max-w-[350px] sm:max-w-[450px] md:max-w-[650px] lg:max-w-[800px] xl:max-w-[950px] h-[250px] sm:h-[300px] md:h-[450px] lg:h-[550px] xl:h-[600px] relative">
                <CardSwap
                  cardDistance={35}
                  verticalDistance={60}
                  delay={4000}
                  pauseOnHover={true}
                  width={800}
                  height={500}
                >
                  <Card className="bg-gradient-to-br from-[#18181b]/80 to-[#27272a]/80 backdrop-blur-xl border border-[#232329] p-6 sm:p-8 md:p-10 lg:p-12">
                    <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 mb-6 sm:mb-8 md:mb-10">
                      <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-emerald-900/30 rounded-xl border border-emerald-800/50">
                        <Monitor className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#f9fafb]">Real-time Monitoring</h3>
                        <p className="text-[#9ca3af] text-base sm:text-lg md:text-xl lg:text-2xl">Never miss a beat</p>
                      </div>
                    </div>
                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[#9ca3af] text-base sm:text-lg md:text-xl lg:text-2xl">Response Time</span>
                        <span className="text-emerald-400 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">142ms</span>
                      </div>
                      <div className="w-full bg-[#232329] rounded-full h-3 sm:h-4 md:h-5 lg:h-6 border border-[#232329]">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 sm:h-4 md:h-5 lg:h-6 rounded-full w-4/5 shadow-lg shadow-emerald-400/20"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-6 sm:mt-8 md:mt-10">
                        <div className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-[#232329]/50 rounded-lg border border-[#232329]">
                          <div className="text-emerald-400 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">99.9%</div>
                          <div className="text-sm sm:text-base md:text-lg text-[#9ca3af]">Uptime</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-[#232329]/50 rounded-lg border border-[#232329]">
                          <div className="text-[#9ca3af] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">2.4M</div>
                          <div className="text-sm sm:text-base md:text-lg text-[#9ca3af]">Requests</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-[#232329]/50 rounded-lg border border-[#232329]">
                          <div className="text-slate-400 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">24/7</div>
                          <div className="text-sm sm:text-base md:text-lg text-slate-500">Active</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#18181b]/80 to-[#27272a]/80 backdrop-blur-xl border border-[#232329] p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 lg:p-4 bg-violet-900/30 rounded-xl border border-violet-800/50">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-200">Smart Analytics</h3>
                        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">Deep insights at a glance</p>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6">
                        <div className="p-3 sm:p-4 lg:p-6 bg-[#232329]/50 rounded-lg border border-[#232329]">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-400 mb-1 sm:mb-2">847K</div>
                          <div className="text-slate-500 text-xs sm:text-sm lg:text-base">Today&apos;s Requests</div>
                        </div>
                        <div className="p-3 sm:p-4 lg:p-6 bg-[#232329]/50 rounded-lg border border-[#232329]">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-400 mb-1 sm:mb-2">99.2%</div>
                          <div className="text-slate-500 text-xs sm:text-sm lg:text-base">Success Rate</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-[#232329]/30 rounded-lg">
                        <span className="text-slate-400 text-sm sm:text-base lg:text-lg">Peak Traffic Window</span>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full animate-pulse"></div>
                          <span className="text-amber-400 font-semibold text-sm sm:text-base lg:text-lg">3:42 PM</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#18181b]/80 to-[#27272a]/80 backdrop-blur-xl border border-[#232329] p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 lg:p-4 bg-red-900/30 rounded-xl border border-red-800/50">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#f9fafb]">Instant Alerts</h3>
                        <p className="text-[#9ca3af] text-sm sm:text-base lg:text-lg">Never miss an issue</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 bg-emerald-900/20 border border-emerald-800/30 rounded-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-300 text-xs sm:text-sm lg:text-base">All systems operational</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full"></div>
                        <span className="text-amber-300 text-xs sm:text-sm lg:text-base">2 warnings resolved today</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 bg-[#232329]/20 border border-[#232329]/30 rounded-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#9ca3af] rounded-full"></div>
                        <span className="text-[#9ca3af] text-xs sm:text-sm lg:text-base">Monitoring 47 endpoints</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 bg-[#232329]/20 border border-[#232329]/30 rounded-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#9ca3af] rounded-full"></div>
                        <span className="text-[#9ca3af] text-xs sm:text-sm lg:text-base">Average response: 98ms</span>
                      </div>
                    </div>
                  </Card>
                </CardSwap>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 lg:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={5} blurStrength={15}>
            <div className="relative bg-gradient-to-br from-[#18181b]/60 to-[#27272a]/60 backdrop-blur-xl border border-[#232329] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 lg:mb-8 text-[#f9fafb]">
                Ready to
                <span className="text-[#9ca3af]"> Open Your Eyes?</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#9ca3af] mb-6 sm:mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers who chose AP-EYE to watch over their APIs. 
                Don&apos;t blink - start monitoring now.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link 
                  href="/register"
                  className="group px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full font-bold text-base sm:text-lg lg:text-xl hover:from-[#2563eb] hover:to-[#3b82f6] hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-4 border border-[#232329] text-white"
                >
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  <span>Start Watching Free</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/login"
                  className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 bg-[#232329]/50 backdrop-blur-xl border border-[#232329] rounded-full font-bold text-base sm:text-lg lg:text-xl hover:bg-[#232329]/70 hover:border-[#232329] transition-all duration-300 text-[#f9fafb]"
                >
                  View Demo
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-xl bg-[#18181b]/40 border-t border-[#232329] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-2 bg-[#232329]/50 backdrop-blur-sm rounded-xl border border-[#232329]">
              <Eye className="w-6 h-6 text-[#9ca3af]" />
            </div>
            <span className="font-bold text-[#9ca3af]">© 2025 AP-EYE. All rights reserved.</span>
          </div>
          <div className="flex space-x-8 text-[#9ca3af]">
            <Link href="#" className="hover:text-[#f9fafb] hover:underline transition-all">Privacy</Link>
            <Link href="#" className="hover:text-[#f9fafb] hover:underline transition-all">Terms</Link>
            <Link href="#" className="hover:text-[#f9fafb] hover:underline transition-all">Support</Link>
            <Link href="#" className="hover:text-[#f9fafb] hover:underline transition-all">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
