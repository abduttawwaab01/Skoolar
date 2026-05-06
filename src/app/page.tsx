'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';
import { 
  School, GraduationCap, Users, BookOpen, CreditCard, 
  Calendar, BarChart3, MessageSquare, Shield, ArrowRight,
  CheckCircle2, Zap, Lock, Sparkles, X, Menu, ArrowUpRight, 
  ChevronRight, Play, Star, Quote, Clock, Award, Truck, 
  Building2, Calculator, FileText, Mail, Phone, MapPin,
  Twitter, Instagram, Linkedin, Facebook, Youtube,
  Sparkle, Layers, Database, Wallet, ClipboardList, Bell,
  Baby, Laptop, Smartphone, Gift, Heart,
  Target, TrendingUp, Eye, HeadphonesIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnnouncementTicker } from '@/components/platform/announcement-ticker';
import { Toaster } from 'sonner';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Users,
    title: 'Multi-Role Management',
    description: 'Comprehensive dashboards for School Admins, Teachers, Students, Parents, Accountants, Librarians, and Directors with role-based access control.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BookOpen,
    title: 'Academics & Results',
    description: 'Complete student records, attendance tracking, exam management, automated report cards, and performance analytics.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Seamless fee collection with multiple payment channels, installment plans, and financial reporting.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Real-time analytics, performance insights, exportable reports, and AI-powered predictions for data-driven decisions.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Announcements, messaging, homework tracking, parent-teacher chat, and automated notifications all in one place.',
    color: 'from-violet-500 to-indigo-500'
  },
  {
    icon: Calendar,
    title: 'School Calendar',
    description: 'Event management, academic scheduling, term-based organization, and automated reminders made simple.',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Calculator,
    title: 'Smart Grading',
    description: 'Flexible score types, weighted calculations, GPA tracking, and automated grade book management.',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    icon: FileText,
    title: 'Document Center',
    description: 'Generate report cards, ID cards, certificates, and custom documents with school branding.',
    color: 'from-slate-500 to-zinc-500'
  },
  {
    icon: Database,
    title: 'Data Import/Export',
    description: 'Bulk import students, teachers, and data. Export to Excel, PDF, and more formats.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: ClipboardList,
    title: 'Task Management',
    description: 'Assign and track teacher tasks, Performance evaluations, and weekly reports.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Truck,
    title: 'Transport Tracking',
    description: 'Manage transport routes, student pickup/drop, GPS tracking, and parent notifications.',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    icon: GraduationCap,
    title: 'Learning Hub',
    description: 'Video lessons, quizzes, interactive content, and self-paced learning resources.',
    color: 'from-pink-500 to-rose-500'
  }
];

const stats = [
  { value: '10+', label: 'User Roles', suffix: '' },
  { value: '50', label: 'Core Features', suffix: '+' },
  { value: '100%', label: 'Web-Based', suffix: '' },
  { value: 'AI', label: 'Smart Assistant', suffix: '' }
];

const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Principal, Greenwood International School',
    image: '👩‍🎓',
    content: 'Skoolar transformed how we manage our 2000+ students. The automated report cards alone saved us hundreds of hours.',
    rating: 5
  },
  {
    name: 'Mr. Chidi Okonkwo',
    role: 'Administrator, Lagos British Academy',
    image: '👨‍💼',
    content: 'The fee collection system increased our collection rate by 40% in the first month. Parents love the convenience.',
    rating: 5
  },
  {
    name: 'Mrs. Funke Adeyemi',
    role: 'Director, Sunshine Model School',
    image: '👩‍🏫',
    content: 'Finally, a system that understands African school needs. The multi-term academic structure and local support are excellent.',
    rating: 5
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for small schools just getting started',
    features: ['Up to 30 students', 'Up to 3 teachers', 'Basic analytics', 'Email support', '1 academic year'],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Professional',
    price: '₦50,000',
    period: '/month',
    description: 'For growing schools ready to scale',
    features: ['Up to 500 students', 'Up to 50 teachers', 'Advanced analytics', 'Priority support', 'Custom branding', 'All integrations', 'Transport tracking'],
    cta: 'Get Started',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions with custom needs',
    features: ['Unlimited students', 'Unlimited teachers', 'AI-powered insights', 'Dedicated support', 'Custom development', 'On-premise option', 'SLA guarantee'],
    cta: 'Contact Sales',
    popular: false
  }
];

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50/30" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNlMGEwZDQiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
    </div>
  );
}

function FloatingElement({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn(className)}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function CounterAnimation({ value, label, suffix }: { value: string; label: string; suffix: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
        {value}{suffix}
      </div>
      <div className="text-teal-600/70 text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/stories', label: 'Stories' },
  ];

  const mobileNavLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/stories', label: 'Stories' },
    { href: '/entrance', label: 'Entrance Exam' },
    { href: '/login', label: 'Log in' },
    { href: '/register', label: 'Get Started' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-teal-900/5" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
            whileHover={{ scale: 1.1, rotate: 6 }}
          >
            <School className="h-7 w-7 text-white" />
          </motion.div>
          <span className="text-2xl font-bold text-gray-900 tracking-tighter uppercase italic">Skoolar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                pathname === link.href
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700 font-semibold">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white shadow-xl shadow-teal-500/20 font-semibold px-6">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button 
          className="md:hidden size-11 flex items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-t"
          >
            <nav className="flex flex-col p-4 gap-2">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-4 rounded-2xl text-sm font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
        <motion.div 
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-teal-700 text-sm font-semibold shadow-lg shadow-teal-500/10 mb-8"
          >
            <Sparkle className="h-4 w-4 text-amber-500" />
            <span>AI-Powered School Management</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          </motion.div>
          
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6"
          >
            Modern School{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Management
            </span>
            <br />Made Simple
          </motion.h1>
          
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Streamline admissions, academics, attendance, payments, and communications.
            Everything your school needs in one powerful, beautiful platform.
          </motion.p>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="xl" className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white shadow-2xl shadow-teal-500/20">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="xl" variant="outline" className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50 px-8">
                Watch Demo <Play className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          className="mt-16 md:mt-24 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/10 border border-teal-100/50 bg-white/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50" />
            <div className="p-2">
              <div className="aspect-video rounded-2xl bg-gray-900/5 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <School className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-gray-500 font-medium">Interactive Dashboard Preview</p>
                  <p className="text-gray-400 text-sm mt-1">Sign up to see the full demo</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <FloatingElement className="absolute -left-16 top-1/4 hidden lg:block" delay={0}>
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </FloatingElement>
          <FloatingElement className="absolute -right-12 top-1/3 hidden lg:block" delay={0.5}>
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-emerald-600" />
            </div>
          </FloatingElement>
          <FloatingElement className="absolute left-1/4 bottom-1/4 hidden lg:block" delay={1}>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
          </FloatingElement>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <CounterAnimation key={index} value={stat.value} label={stat.label} suffix={stat.suffix} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform designed to simplify school administration 
            and enhance the learning experience.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-[1.5rem] border-2 border-gray-100 bg-white hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 cursor-pointer"
                onClick={() => setActiveFeature(index)}
              >
                <div className={cn(
                  "absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                  feature.color,
                  "from-10 to-90"
                )} style={{ mixBlendMode: 'overlay' }} />
                <div className="relative">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                    "bg-gradient-to-br",
                    feature.color,
                    "shadow-lg"
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Schools
          </h2>
          <p className="text-lg text-gray-600">
            See what educational institutions say about Skoolar
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-900/5"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="absolute top-6 right-6 h-8 w-8 text-teal-100" />
              <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xl">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Start free, scale as you grow. No hidden fees.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "relative p-8 rounded-3xl border-2 transition-all duration-500",
                plan.popular 
                  ? "border-teal-500 shadow-2xl shadow-teal-500/20 scale-105" 
                  : "border-gray-100 shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500">{plan.period}</span>}
              </div>
              <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className={cn(
                "w-full",
                plan.popular 
                  ? "bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600" 
                  : "bg-gray-900 hover:bg-gray-800"
              )}>
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of schools already using Skoolar to streamline their operations.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="xl" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="xl" variant="outline" className="border-2 border-gray-600 text-white hover:bg-gray-800">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Updates', 'Security'],
    Company: ['About', 'Blog', 'Stories', 'Careers', 'Contact'],
    Resources: ['Documentation', 'Help Center', 'API Reference', 'Status', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-gray-50 border-t py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-6 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Skoolar</span>
            </Link>
            <p className="text-gray-500 text-sm mb-4">
              The modern school management platform for African schools.
              Streamline your operations with powerful, easy-to-use tools.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:border-teal-300 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-gray-900 mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SKOOLAR | Odebunmi Tawwāb. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function HomeContent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back!</h2>
          <p className="text-gray-600 mb-6">Redirecting to your dashboard...</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <AnnouncementTicker />
      <PublicNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
      <Toaster position="top-right" richColors closeButton />
    </SessionProvider>
  );
}