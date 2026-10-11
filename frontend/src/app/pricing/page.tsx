'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Click the "Upgrade Now" button and complete the payment process. Your account will be upgraded immediately.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel anytime. Your premium access will continue until the end of your billing period.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with the premium features.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-slate-400 text-lg">
            Unlock your full potential with premium access
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* FREE Plan */}
          <Card className="bg-slate-800/50 border-slate-700 relative">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">₹0</span>
                <span className="text-slate-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Access to free papers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">5 tests per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Basic analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-500">Premium papers</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-500">Unlimited tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-500">Detailed explanations</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-500">Advanced analytics</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* PREMIUM Plan */}
          <Card className="bg-indigo-600/10 border-indigo-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">₹199</span>
                <span className="text-slate-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Access to all papers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Unlimited tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Advanced analytics & insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Premium papers & latest exams</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Detailed answer explanations</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Topic-wise performance tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Priority support</span>
                </div>
              </div>
              <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-slate-400">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Have more questions?{' '}
            <Link href="/contact" className="text-indigo-400 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
