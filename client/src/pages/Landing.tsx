import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Check, 
  FileText, 
  FolderSearch, 
  Shield, 
  Sparkles, 
  Zap,
  Search,
  Tags,
  Copy,
  BarChart3,
  Download
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Tagging",
      description: "Automatically categorize and tag your documents using advanced AI. No manual work required."
    },
    {
      icon: Search,
      title: "Lightning-Fast Search",
      description: "Find any document in seconds with powerful full-text search and smart filters."
    },
    {
      icon: Copy,
      title: "Duplicate Detection",
      description: "Automatically identify exact duplicates and similar versions of your files."
    },
    {
      icon: FolderSearch,
      title: "Smart Organization",
      description: "Get AI-suggested folder structures to reorganize your documents logically."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your documents stay on your computer. No cloud uploads, complete privacy."
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Process hundreds of documents in minutes. Lightweight and optimized."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Scan Your Folders",
      description: "Point Sorto to any folder on your computer containing Word, Excel, PowerPoint, or PDF files."
    },
    {
      number: "2",
      title: "AI Does the Work",
      description: "Our AI analyzes each document, extracting key information and automatically tagging them."
    },
    {
      number: "3",
      title: "Find Anything Instantly",
      description: "Search, filter, and organize your documents effortlessly. Export or reorganize as needed."
    }
  ];

  const pricing = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited documents",
        "AI-powered tagging",
        "Duplicate detection",
        "Smart search",
        "Up to 2 computers",
        "Priority support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Yearly",
      price: "$99",
      period: "per year",
      savings: "Save 17%",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Priority updates",
        "Extended support",
        "Up to 2 computers",
        "Lifetime updates"
      ],
      cta: "Start Free Trial",
      popular: true
    }
  ];

  const faqs = [
    {
      question: "Do my documents get uploaded to the cloud?",
      answer: "No! Sorto runs entirely on your computer. Your documents never leave your machine. Only AI tagging requires a brief internet connection to analyze content."
    },
    {
      question: "What file types are supported?",
      answer: "Sorto supports Word documents (.docx, .doc), PowerPoint presentations (.pptx, .ppt), Excel spreadsheets (.xlsx, .xls), PDFs, and text files."
    },
    {
      question: "How many documents can I organize?",
      answer: "Unlimited! Sorto can handle thousands of documents. The only limit is your computer's storage space."
    },
    {
      question: "Can I use it on multiple computers?",
      answer: "Yes! Each license allows installation on up to 2 computers."
    },
    {
      question: "What happens after the free trial?",
      answer: "After 7 days, you'll need to subscribe to continue using Sorto. You can export all your data before the trial ends."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your purchase, no questions asked."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold">Sorto</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </div>
          
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Start Free Trial
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Document Organization
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Documents,<br />
              <span className="text-indigo-600">Sorted.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Stop wasting time searching for files. Let AI organize your documents automatically. 
              Find anything in seconds. Privacy-first, desktop-based solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Start Free 7-Day Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
              >
                <Download className="w-5 h-5 mr-2" />
                Download for Windows
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Full features • Cancel anytime
            </p>
          </div>
          
          {/* Hero Image/Screenshot Placeholder */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-lg border-8 border-gray-200 shadow-2xl overflow-hidden bg-white">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FileText className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">App Screenshot Here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make document management effortless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-indigo-200 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Sorto Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get organized in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works for you. Start with a free 7-day trial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-indigo-600 border-2 shadow-xl' : 'border-2'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-medium mt-2">{plan.savings}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Organized?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of professionals who've taken control of their documents with Sorto.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Start Your Free Trial Today
          </Button>
          <p className="text-sm mt-4 opacity-75">
            7 days free • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                S
              </div>
              <span className="text-white font-semibold">Sorto</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm">
            © 2025 Sorto. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
