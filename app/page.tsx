
"use client";

import FormHeader from '@/components/FormHeader';
import QuestionCard from '@/components/QuestionCard';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Scale } from '@/components/ui/Scale';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { formStructure, Question, Section } from '@/data/form-structure';
import React, { useState } from 'react';
import { z } from 'zod'; // Import Zod

// ---------------------------------------------------------
// ZOD SCHEMA DEFINITION
// ---------------------------------------------------------

const formSchema = z.object({
  // Basic Info
  full_name: z.string().min(1, "Full Name is required"),
  roll_number: z.string().regex(/^1608-\d{2}-\d{3}-\d{3}$/, "Format must be 1608-YY-XXX-XXX (e.g., 1608-25-733-019)"),
  branch: z.string().min(1, "Branch is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  why_join: z.string().min(50, "Please provide a more detailed answer (min 50 chars)"),
  goals: z.string().min(1, "Required"),

  // Behavioral
  prioritization_scenario: z.string().min(1, "Required"),
  time_commitment: z.string().min(1, "Required"),
  team_failure_experience: z.string().min(1, "Required"),
  unlimited_resources: z.string().optional(),

  // Event Planning (Mandatory)
  event_experience: z.string().min(1, "Required"),
  event_experience_details: z.string().min(1, "Required"),
  crisis_management: z.string().min(1, "Required"),
  event_success_factors: z.string().min(1, "Required"),

  // Track Selection
  selected_track: z.string().min(1, "Required"),

  // Track A: Technical
  tech_skills: z.array(z.string()).optional(),
  github_link: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_link: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio_link_tech: z.string().url("Invalid URL").optional().or(z.literal("")),
  learning_approach: z.string().optional(),
  tech_struggle: z.string().optional(),
  tech_blocker: z.string().optional(),
  collaboration_style: z.string().optional(),
  tech_explain_simple: z.string().optional(),

  // Track B: Social
  social_platforms: z.array(z.string()).optional(),
  instagram_handle_social: z.string().optional(),
  linkedin_handle_social: z.string().optional(), // Text or URL, lenient
  twitter_handle_social: z.string().optional(),
  other_socials: z.string().optional(),
  social_analysis: z.string().optional(),
  social_writing_task: z.string().optional(),
  social_influencers: z.string().optional(),
  social_viral_idea: z.string().optional(),
  social_trend_critique: z.string().optional(),

  // Track C: Content
  content_type: z.array(z.string()).optional(),
  portfolio_link: z.string().optional(),
  content_socials: z.string().optional(), // New field
  creative_process: z.string().optional(),
  design_philosophy: z.string().optional(),
  feedback_handling: z.string().optional(),
  tools_familiarity: z.array(z.string()).optional(),
  perfect_content: z.string().optional(),

  // Track D: Outreach
  cold_outreach_exp: z.string().optional(),
  email_writing_exercise: z.string().optional(),
  outreach_comfort: z.number().optional(),
  sponsorship_strategy: z.string().optional(),
  persuasion_task: z.string().optional(),

  // Closing
  culture_fit: z.string().min(1, "Required"),
  conflict_resolution: z.string().min(1, "Required"),
  honesty_check: z.number().min(1).max(10),
  any_questions: z.string().optional(),
}).passthrough();

export default function Home() {
  type FormValue = string | string[] | number;

  const [formData, setFormData] = useState<Record<string, FormValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle Input Changes
  const handleChange = (id: string, value: FormValue) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Check if a section should be visible
  const isSectionVisible = (section: Section) => {
    if (!section.condition) return true;
    return formData[section.condition.fieldId] === section.condition.value;
  };

  // Validate Form using Zod + Custom Conditional Logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // 1. Zod Basic Validation
    // We don't rely solely on this because of conditional fields
    // But we use it for format checks on present data

    // 2. Iterative Validation (Visibility Aware) checking against Zod rules
    formStructure.forEach(section => {
      if (!isSectionVisible(section)) return; // Skip hidden sections

      section.questions.forEach(question => {
        const value = formData[question.id];

        // A. Required Check
        if (question.required) {
          const isEmpty =
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            newErrors[question.id] = "This is a required question";
            isValid = false;
            return; // Skip further format checks if empty
          }
        }

        // B. Format Check (using Zod Schema) if value exists
        if (value && value !== "") {
          // Extract the specific schema for this field from the Shape
          const fieldSchema = formSchema.shape[question.id as keyof typeof formSchema.shape];
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

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Store in localStorage for the dashboard (Redundancy/Admin View)
    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('recruitment_submissions') || '[]');
      const newSubmission = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
        status: 'Applied'
      };
      localStorage.setItem('recruitment_submissions', JSON.stringify([...existingSubmissions, newSubmission]));
    } catch (e) {
      console.error("Local storage error", e);
    }

    // Send to Google Sheets API
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
    } catch (error) {
      console.error("Submission Error:", error);
      alert("There was an error submitting your form. Please try again. (Check console for details)");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-8 px-4 bg-[#f0ebf8]">
        <div className="max-w-[770px] mx-auto bg-white rounded-lg border border-gray-200 border-t-8 border-t-[#673ab7] shadow-sm p-8">
          <h1 className="text-3xl font-normal text-[#202124] mb-4">
            Dev Catalyst Recruitment Drive
          </h1>
          <p className="text-sm text-[#202124] mb-4">
            Your response has been recorded.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#673ab7] text-sm hover:underline font-medium"
          >
            Submit another response
          </button>
        </div>
        <div className="max-w-[770px] mx-auto mt-4 text-center">
          <p className="text-xs text-[#5f6368]">
            This content is neither created nor endorsed by Google. - Terms of Service - Privacy Policy
          </p>
          <p className="text-xl text-[#5f6368] font-semibold mt-2 opacity-50"> Google Forms </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 sm:py-8 px-2 sm:px-4">
      <FormHeader />

      <form onSubmit={handleSubmit} className="max-w-[770px] mx-auto">
        {formStructure.map((section) => (
          isSectionVisible(section) && (
            <div key={section.id} className="mb-4">
              {/* Section Header Logic */}
              {section.title !== "Basic Information" && (
                <div className="mb-4 pt-4 px-1">
                  <div className="bg-[#673ab7] text-white p-3 rounded-md shadow-sm inline-block min-w-[200px]">
                    <h2 className="text-lg font-medium">{section.title}</h2>
                  </div>
                  {section.description && (
                    <p className="text-sm text-[#5f6368] mt-2 ml-1 whitespace-pre-line">{section.description}</p>
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
            disabled={isSubmitting}
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
        <p className="text-xs text-[#5f6368]">
          This content is neither created nor endorsed by Google. - Terms of Service - Privacy Policy
        </p>
        <p className="text-xl text-[#5f6368] font-semibold mt-2 opacity-50"> Google Forms </p>
      </div>
    </div>
  );
}

// Helper to render specific input types
function renderInput(
  q: Question,
  formData: Record<string, string | string[] | number>,
  handleChange: (id: string, val: string | string[] | number) => void,
  errors: Record<string, string>
) {
  const value = formData[q.id] !== undefined ? formData[q.id] : (q.type === 'checkbox' ? [] : "");

  switch (q.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value as string}
          onChange={(e) => handleChange(q.id, e.target.value)}
          placeholder={q.placeholder || "Your answer"}
          error={!!errors[q.id]}
        />
      );
    case 'textarea':
    case 'ranking':
      return (
        <Textarea
          value={value as string}
          onChange={(e) => handleChange(q.id, e.target.value)}
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
          onChange={(e) => handleChange(q.id, e.target.value)}
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
