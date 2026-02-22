"use client";

import FormHeader from '@/components/FormHeader';
import QuestionCard from '@/components/QuestionCard';
import Image from "next/image";
import devCatalystLogo from "../../public/assets/DevCatalyst_logo2.png";
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Scale } from '@/components/ui/Scale';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { formStructure, Question, Section } from '@/data/form-structure';
import React, { useState } from 'react';
import { z, ZodTypeAny } from 'zod';

const formSchema = z.object({
  full_name: z.string().min(1, "Full Name is required"),
  roll_number: z.string().regex(/^1608-\d{2}-\d{3}-\d{3}$/, "Format must be 1608-YY-XXX-XXX (e.g., 1608-25-733-019)"),
  branch: z.string().min(1, "Branch is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  why_join: z.string().min(50, "Please provide a more detailed answer (min 50 chars)"),
  goals: z.string().min(1, "Required"),
  prioritization_scenario: z.string().min(1, "Required"),
  time_commitment: z.string().min(1, "Required"),
  team_failure_experience: z.string().min(1, "Required"),
  unlimited_resources: z.string().optional(),
  event_experience: z.string().min(1, "Required"),
  event_experience_details: z.string().min(1, "Required"),
  crisis_management: z.string().min(1, "Required"),
  event_success_factors: z.string().min(1, "Required"),
  selected_track: z.string().min(1, "Required"),
  tech_skills: z.array(z.string()).optional(),
  github_link: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_link: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio_link_tech: z.string().url("Invalid URL").optional().or(z.literal("")),
  learning_approach: z.string().optional(),
  tech_struggle: z.string().optional(),
  tech_blocker: z.string().optional(),
  collaboration_style: z.string().optional(),
  tech_explain_simple: z.string().optional(),
  social_platforms: z.array(z.string()).optional(),
  instagram_handle_social: z.string().optional(),
  linkedin_handle_social: z.string().optional(),
  twitter_handle_social: z.string().optional(),
  other_socials: z.string().optional(),
  social_analysis: z.string().optional(),
  social_writing_task: z.string().optional(),
  social_influencers: z.string().optional(),
  social_viral_idea: z.string().optional(),
  social_trend_critique: z.string().optional(),
  content_type: z.array(z.string()).optional(),
  portfolio_link: z.string().optional(),
  content_socials_ig: z.string().optional(),
  content_socials_yt: z.string().optional(),
  content_socials_behance: z.string().optional(),
  creative_process: z.string().optional(),
  design_philosophy: z.string().optional(),
  feedback_handling: z.string().optional(),
  tools_familiarity: z.array(z.string()).optional(),
  perfect_content: z.string().optional(),
  cold_outreach_exp: z.string().optional(),
  email_writing_exercise: z.string().optional(),
  outreach_comfort: z.number().optional(),
  sponsorship_strategy: z.string().optional(),
  persuasion_task: z.string().optional(),
  culture_fit: z.string().min(1, "Required"),
  conflict_resolution: z.string().min(1, "Required"),
  honesty_check: z.number().min(1).max(10),
  any_questions: z.string().optional(),
}).passthrough();

export default function FormPage() {
  type FormValue = string | string[] | number;

  const [formData, setFormData] = useState<Record<string, FormValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Create a fixed deadline (25th February 2026, 01:00 PM IST)
  // Timezone adjustment for IST is +05:30. UTC: 2026-02-25T07:30:00Z
  const DEADLINE = new Date("2026-02-25T13:00:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = DEADLINE - now;

      if (difference <= 0) {
        setIsDeadlinePassed(true);
        setTimeLeft(null);
      } else {
        setIsDeadlinePassed(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown(); // Initial update
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [DEADLINE]);

  const handleChange = (id: string, value: FormValue) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const isSectionVisible = (section: Section) => {
    if (!section.condition) return true;
    return formData[section.condition.fieldId] === section.condition.value;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    formStructure.forEach(section => {
      if (!isSectionVisible(section)) return;

      section.questions.forEach(question => {
        const value = formData[question.id];

        if (question.required) {
          const isEmpty =
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            newErrors[question.id] = "This is a required question";
            isValid = false;
            return;
          }
        }

        if (value && value !== "") {
          const fieldSchema = formSchema.shape[question.id as keyof typeof formSchema.shape] as ZodTypeAny | undefined;
          if (fieldSchema) {
            const fieldResult = fieldSchema.safeParse(value);
            if (!fieldResult.success) {
              newErrors[question.id] = fieldResult.error.issues[0].message;
              isValid = false;
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('recruitment_submissions') || '[]');
      const newSubmission = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
        status: 'Applied'
      };
      localStorage.setItem('recruitment_submissions', JSON.stringify([...existingSubmissions, newSubmission]));
    } catch (e: unknown) {
      console.error("Local storage error", e);
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit to server');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      console.error("Submission Error:", error);
      alert("There was an error submitting your form. Please try again. (Check console for details)");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        {/* Tiled Collage Background */}
        <div className="fixed inset-0 z-0" style={{ backgroundImage: "url('/assets/Collage.png')", backgroundSize: '600px', backgroundRepeat: 'repeat' }} />
        <div className="fixed inset-0 z-0 bg-black/60" />
        <div className="relative z-10 max-w-[770px] mx-auto bg-white rounded-lg border border-gray-200 border-t-8 border-t-[#673ab7] shadow-sm p-8">
          <div className="flex items-center gap-4 mb-3">
            <Image
              src={devCatalystLogo}
              alt="DevCatalyst Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold text-[#202124]">
              DevCatalyst Recruitment Drive
            </h1>
          </div>
          <p className="text-sm text-[#202124] mb-4">
            Your response has been recorded.
          </p>

          {/* Social Communities Link Card */}
          <div className="mt-4 p-5 bg-purple-50 rounded-md border border-purple-100 mb-6 flex flex-col items-start shadow-sm">
            <h2 className="text-lg font-semibold text-[#673ab7] mb-2">Join our Community!</h2>
            <p className="text-sm text-gray-700 mb-5">Stay updated with the latest announcements, events, and resources.</p>
            <p className="text-md font-bold text-black mb-5">The shortlisted candidates will be announced on our socials on <br />25th Feb, 2026 at 9:00 PM.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="https://chat.whatsapp.com/FOvrV1kCx2y1t534qrNEEP" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-md hover:bg-[#20bd5a] transition-colors font-medium text-sm shadow-sm hover:shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                WhatsApp Community
              </a>
              <a href="https://www.instagram.com/devcatalystt" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity font-medium text-sm shadow-sm hover:shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                Instagram
              </a>
            </div>
          </div>

          <a
            href="/"
            className="text-[#673ab7] text-sm hover:underline font-medium"
          >
            Back to home
          </a>
        </div>
        <div className="relative z-10 max-w-[770px] mx-auto mt-4 text-center">
          <p className="text-xs text-[white]">
            This content is neither created nor endorsed by Google. - Terms of Service - Privacy Policy
          </p>
          <p className="text-xl text-[white] font-semibold mt-2 opacity-50"> Google Forms </p>
        </div>
      </div>
    );
  }

  if (isDeadlinePassed) {
    return (
      <div className="relative min-h-screen py-8 px-4 flex items-center justify-center">
        {/* Tiled Collage Background */}
        <div className="fixed inset-0 z-0" style={{ backgroundImage: "url('/assets/Collage.png')", backgroundSize: '600px', backgroundRepeat: 'repeat' }} />
        <div className="fixed inset-0 z-0 bg-black/60" />

        <div className="relative z-10 w-full max-w-[770px] mx-auto bg-white rounded-lg border border-gray-200 border-t-8 border-t-red-500 shadow-xl p-8 transform scale-100 transition-all">
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-16 h-16 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Registration Closed
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              We're no longer accepting new applications for the DevCatalyst Recruitment Drive as the deadline has passed.
            </p>
            <div className="bg-red-50 p-6 rounded-lg border border-red-100 mb-8 w-full max-w-md">
              <p className="text-red-800 font-medium">
                Deadline was: 25th February 2026, 01:00 PM
              </p>
            </div>
            <a
              href="/"
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors inline-block"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-3 sm:py-8 px-2 sm:px-4">
      {/* Tiled Collage Background */}
      <div className="fixed inset-0 z-0" style={{ backgroundImage: "url('/assets/Collage.png')", backgroundSize: '600px', backgroundRepeat: 'repeat' }} />
      <div className="fixed inset-0 z-0 bg-black/60" />
      <div className="relative z-10">

        {/* Countdown Timer Display */}
        {timeLeft && (
          <div className="max-w-[770px] mx-auto mb-4 bg-[#673ab7] text-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-center justify-between border border-[#5e35b1] font-medium">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Application closes in:</span>
            </div>
            <div className="flex gap-3 text-lg font-bold tracking-wider">
              <div className="flex flex-col items-center">
                <span className="bg-black/20 px-2 py-1 rounded min-w-[40px] text-center">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase mt-1 opacity-80 font-normal tracking-wide">Days</span>
              </div>
              <span className="text-xl self-start mt-1 opacity-60">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/20 px-2 py-1 rounded min-w-[40px] text-center">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase mt-1 opacity-80 font-normal tracking-wide">Hrs</span>
              </div>
              <span className="text-xl self-start mt-1 opacity-60">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/20 px-2 py-1 rounded min-w-[40px] text-center">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase mt-1 opacity-80 font-normal tracking-wide">Min</span>
              </div>
              <span className="text-xl self-start mt-1 opacity-60">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/20 px-2 py-1 rounded min-w-[40px] text-center text-purple-200">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase mt-1 opacity-80 font-normal tracking-wide">Sec</span>
              </div>
            </div>
          </div>
        )}

        <FormHeader />

        <form onSubmit={handleSubmit} className="max-w-[770px] mx-auto">
          {formStructure.map((section) => (
            isSectionVisible(section) && (
              <div key={section.id} className="mb-4">
                {section.title !== "Basic Information" && (
                  <div className="mb-4 pt-4 px-1">
                    <div className="bg-[#673ab7] text-white p-3 rounded-md shadow-sm inline-block min-w-[200px]">
                      <h2 className="text-lg font-medium">{section.title}</h2>
                    </div>
                    {section.description && (
                      <p className="text-sm text-white mt-2 ml-1 whitespace-pre-line">{section.description}</p>
                    )}
                  </div>
                )}

                {section.questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    title={q.text}
                    required={q.required}
                    description={q.description}
                    error={errors[q.id]}
                  >
                    {renderInput(q, formData, handleChange, errors)}
                  </QuestionCard>
                ))}
              </div>
            )
          ))}

          <div className="flex justify-between items-center px-4 mt-8 pb-12">
            <button
              type="submit"
              disabled={isSubmitting || isDeadlinePassed}
              className="bg-[#673ab7] text-white px-6 py-2 rounded-[4px] font-medium text-sm hover:bg-[#5e35b1] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({})}
              className="text-[#673ab7] text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded">
              Clear form
            </button>
          </div>
        </form>
        <div className="max-w-[770px] mx-auto mt-4 text-center pb-8">
          <p className="text-xs text-[white]">
            This content is neither created nor endorsed by Google. - Terms of Service - Privacy Policy
          </p>
          <p className="text-xl text-[white] font-semibold mt-2 opacity-50"> Google Forms </p>
        </div>
      </div>
    </div>
  );
}

function renderInput(
  q: Question,
  formData: Record<string, string | string[] | number>,
  handleChange: (id: string, val: string | string[] | number) => void,
  errors: Record<string, string>
): React.ReactNode {
  const value = formData[q.id] !== undefined ? formData[q.id] : (q.type === 'checkbox' ? [] : "");

  switch (q.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value as string}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(q.id, e.target.value)}
          placeholder={q.placeholder || "Your answer"}
          error={!!errors[q.id]}
        />
      );
    case 'textarea':
    case 'ranking':
      return (
        <Textarea
          value={value as string}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(q.id, e.target.value)}
          placeholder="Your answer"
          error={!!errors[q.id]}
        />
      );
    case 'radio':
      return (
        <RadioGroup
          name={q.id}
          options={q.options || []}
          value={value as string}
          onChange={(val) => handleChange(q.id, val)}
          error={!!errors[q.id]}
        />
      );
    case 'checkbox':
      return (
        <CheckboxGroup
          name={q.id}
          options={q.options || []}
          value={value as string[]}
          onChange={(val) => handleChange(q.id, val)}
          error={!!errors[q.id]}
        />
      );
    case 'select':
      return (
        <Select
          options={q.options || []}
          value={value as string}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(q.id, e.target.value)}
          placeholder={q.placeholder || "Choose"}
          error={!!errors[q.id]}
        />
      );
    case 'scale':
      return (
        <Scale
          name={q.id}
          min={q.min || 1}
          max={q.max || 5}
          minLabel={q.minLabel}
          maxLabel={q.maxLabel}
          value={value as number}
          onChange={(val) => handleChange(q.id, val)}
          error={!!errors[q.id]}
        />
      );
    default:
      return null;
  }
}
