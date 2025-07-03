import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import TypewriterText from '../components/TypewriterText';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';
import CallFlowAnimation from '../components/CallFlowAnimation';
import FloatingElements from '../components/FloatingElements';
import FloatingChatBubble from '../components/FloatingChatBubble';
import LogoSlider from '../components/LogoSlider';
import DashboardPreview from '../components/DashboardPreview';
import AnimatedWaveform from '../components/AnimatedWaveform';
import VideoAgentShowcase from '../components/VideoAgentShowcase';
import VideoAgentPreview from '../components/VideoAgentPreview';
import { 
  Bot, 
  Phone, 
  Video, 
  Zap, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  Clock,
  Globe,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  Headphones,
  Camera,
  Monitor,
  MessageSquare
} from 'lucide-react';
import { billingService } from '../lib/api';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showVideoSupport, setShowVideoSupport] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const typewriterTexts = [
    "Meet your AI HR Agent",
    "Meet your AI Hotel Receptionist", 
    "Meet your AI Sales Assistant",
    "Meet your AI Support Agent"
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Agents',
      description: 'Create intelligent voice and video agents that handle conversations naturally and efficiently.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Voice Calls',
      description: 'Automated phone agents for HR screening, bookings, lead generation, and customer support.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Video,
      title: 'Video Agents',
      description: 'Lifelike video agents powered by Tavus for websites, presentations, and interactive experiences.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'No-Code Builder',
      description: 'Build and customize agents without coding. Drag, drop, and configure in minutes.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'GDPR compliant with secure data handling and consent management built-in.',
      gradient: 'from-red-500 to-rose-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track performance, analyze conversations, and optimize your agents with detailed insights.',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const useCases = [
    {
      title: 'HR Recruitment',
      description: 'Automate initial candidate screening with intelligent interview agents that ask the right questions.',
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
      stats: { calls: '2.5K+', success: '96%', time: '5min avg' }
    },
    {
      title: 'Hotel & Hospitality',
      description: 'Handle room bookings, guest inquiries, and reservation management 24/7 with multilingual support.',
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400',
      stats: { calls: '1.8K+', success: '94%', time: '3min avg' }
    },
    {
      title: 'Sales & Lead Gen',
      description: 'Qualify leads, schedule appointments, and nurture prospects automatically with intelligent conversations.',
      image: 'https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=400',
      stats: { calls: '3.2K+', success: '89%', time: '7min avg' }
    }
  ];

  const videoAgentPreviews = [
    {
      name: 'Sarah Chen',
      role: 'HR Interview Specialist',
      description: 'Professional AI recruiter conducting candidate screenings with natural conversation flow and skill assessment.',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1',
      thumbnailUrl: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Skill Assessment', 'Background Check', 'Interview Scheduling']
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Hotel Concierge',
      description: 'Multilingual hospitality expert providing 24/7 guest services, room bookings, and local recommendations.',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1',
      thumbnailUrl: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Room Booking', 'Multilingual', 'Local Guide']
    },
    {
      name: 'Alex Thompson',
      role: 'Sales Representative',
      description: 'Persuasive sales professional qualifying leads, scheduling demos, and closing deals with high conversion rates.',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1',
      thumbnailUrl: 'https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Lead Qualification', 'Demo Booking', 'CRM Integration']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director at TechCorp',
      content: 'Agentlybot.com has revolutionized our recruitment process. We screen 10x more candidates while maintaining quality. The AI agents are incredibly natural and professional.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Hotel Manager',
      content: 'Our booking efficiency increased by 300%. Guests love the instant response and professional service. The multilingual support is a game-changer for our international clientele.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Sales Manager',
      content: 'The lead qualification agents have transformed our sales pipeline. More qualified leads, less manual work, and our team can focus on closing deals instead of screening calls.',
      rating: 5,
      avatar: 'ER'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$20',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        '1 AI Agent',
        '100 calls/month',
        'Voice calls only',
        'Basic analytics',
        'Email support'
      ],
      highlighted: false,
      badge: null
    },
    {
      name: 'Professional',
      price: '$100',
      period: '/month',
      description: 'For growing businesses with advanced needs',
      features: [
        '5 AI Agents',
        'Unlimited calls',
        'Voice + Video agents',
        'Advanced analytics',
        'CRM integration',
        'Priority support'
      ],
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Custom',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom requirements',
      features: [
        'Unlimited agents',
        'Unlimited calls',
        'All features included',
        'White-label support',
        'Custom integrations',
        'Dedicated support'
      ],
      highlighted: false,
      badge: 'Best Value'
    }
  ];

  const handleGetStarted = async (plan: string) => {
    try {
      // Use your real Stripe price ID for all plans (or map as needed)
      const priceId = 'price_1Redc3SIdRlp7sMxv5SEWvjy';
      const session = await billingService.createCheckoutSession(priceId);
      if (session?.url) {
        window.location.href = session.url;
      } else {
        alert('Unable to start checkout. Please contact support.');
      }
    } catch (err) {
      alert('Unable to start checkout. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      <Header transparent />
      <FloatingChatBubble />
      
      {/* Video Support Widget */}
      {/* <VideoSupportWidget
        isOpen={showVideoSupport}
        onClose={() => setShowVideoSupport(false)}
        agentName="Emma"
        agentRole="Customer Support Specialist"
      /> */}

      {/* Support Button */}
      {/* <button
        onClick={() => setShowVideoSupport(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110"
        title="Get Video Support"
      >
        <MessageSquare className="w-6 h-6" />
      </button> */}
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        {/* Animated background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 w-full h-full" />
          
          {/* Mouse-following gradient */}
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: Math.max(0, mousePosition.x - 192),
              top: Math.max(0, mousePosition.y - 192),
              maxWidth: '100vw',
              maxHeight: '100vw'
            }}
          />
          
          {/* Floating elements */}
          <FloatingElements />
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up" delay={200}>
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Now with Advanced AI Voice & Video Technology</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                <TypewriterText 
                  texts={typewriterTexts}
                  className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                />
                <span className="block mt-4">That Actually Works</span>
              </h1>
              
              <div className="flex items-center justify-center mb-8">
                <AnimatedWaveform className="mr-4" isActive={true} />
                <p className="text-xl md:text-2xl text-blue-100 max-w-4xl leading-relaxed">
                  Create intelligent voice and video agents for HR screening, hotel bookings, sales calls, and more. 
                  No coding required. Deploy in minutes.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Logo Slider */}
      <LogoSlider />

      {/* Video Agents Preview Section */}
      {/* <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full text-purple-600 dark:text-purple-400 mb-6">
                <Video className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI Video Agents Powered by Tavus</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Your AI Video Team
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Work 24/7
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the future of customer interaction with lifelike AI video agents. 
                Each agent provides natural, face-to-face conversations that feel completely human.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {videoAgentPreviews.map((agent, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 200}>
                <VideoAgentPreview agent={agent} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-Time Video</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Powered by Tavus AI technology for natural video conversations
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Any Platform</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Embed on websites, apps, or use standalone for customer interactions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Human-Like</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Natural expressions, gestures, and personality traits
                    </p>
                  </div>
                </div>
                <Link to="/video-agents">
                  <AnimatedButton size="lg" showArrow>
                    Explore Video Agents
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section> */}

      {/* Full Video Agents Showcase */}
      <VideoAgentShowcase onTryNow={() => window.location.href = '/video-agents'} />

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50 w-full">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-6">
                <Award className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Industry Leading Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need to Build
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligent AI Agents
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our platform provides all the tools and integrations you need to create, deploy, and manage AI agents that deliver real business results.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 100}>
                <div className="group relative p-8 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
                  {/* Gradient border on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
                  
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call Flow Animation Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                How It Works
                <span className="block text-blue-600 dark:text-blue-400">In Real Time</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Watch how our AI agents handle calls from start to finish, creating valuable insights and leads automatically.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <CallFlowAnimation />
          </ScrollReveal>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Proven Use Cases
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Across Industries
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                See how businesses are using agentlybot.com to automate conversations and improve customer experiences.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 200}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={useCase.image} 
                      alt={useCase.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Stats overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between text-white text-sm">
                        <div className="text-center">
                          <div className="font-bold">{useCase.stats.calls}</div>
                          <div className="text-xs opacity-80">Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-400">{useCase.stats.success}</div>
                          <div className="text-xs opacity-80">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{useCase.stats.time}</div>
                          <div className="text-xs opacity-80">Duration</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Powerful Analytics
                <span className="block text-blue-600 dark:text-blue-400">At Your Fingertips</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Get real-time insights into your AI agents' performance with our comprehensive analytics dashboard.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <DashboardPreview />
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-6">
                <Headphones className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Customer Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Loved by Businesses
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Worldwide
                </span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 200}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden" id="pricing-section">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Choose the plan that fits your business needs. All plans include our core features with no hidden fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 200}>
                <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  plan.highlighted 
                    ? 'bg-white shadow-2xl scale-105 border-4 border-yellow-400' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                }`}>
                  {plan.badge && (
                    <div className={`absolute top-0 left-0 right-0 text-center py-2 ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}>
                      <span className="text-sm font-semibold text-black">{plan.badge}</span>
                    </div>
                  )}
                  
                  <div className={`p-8 ${plan.badge ? 'pt-12' : ''}`}>
                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-gray-900' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mb-6 ${plan.highlighted ? 'text-gray-600' : 'text-blue-100'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span className={`text-5xl font-bold ${plan.highlighted ? 'text-gray-900' : 'text-white'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-lg ${plan.highlighted ? 'text-gray-600' : 'text-blue-100'}`}>
                        {plan.period}
                      </span>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className={`h-5 w-5 mr-3 ${plan.highlighted ? 'text-green-600' : 'text-yellow-400'}`} />
                          <span className={plan.highlighted ? 'text-gray-700' : 'text-blue-100'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full ${plan.highlighted ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'border border-white text-white'} px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors`}
                      onClick={() => handleGetStarted(plan.name)}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Join 10,000+ Businesses</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Build Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Agent Army?
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of businesses already using agentlybot.com to automate conversations and grow their business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup">
                  <AnimatedButton size="lg" showArrow>
                    Start Your Free Trial
                  </AnimatedButton>
                </Link>
                <AnimatedButton
                  variant="secondary"
                  size="lg"
                  icon={<Phone className="w-5 h-5" />}
                  onClick={() => window.open('https://calendly.com/nithindidigam/platform-demo', '_blank')}
                >
                  Schedule Demo
                </AnimatedButton>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • 14-day free trial • Setup in 5 minutes
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16 w-full">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">agentlybot.com</span>
              </div>
              <p className="text-gray-400 mb-4">
                The future of AI-powered customer interactions. Build intelligent agents that work 24/7.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Phone className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Video className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 agentlybot.com. All rights reserved. Built with ❤️ for the future of AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;