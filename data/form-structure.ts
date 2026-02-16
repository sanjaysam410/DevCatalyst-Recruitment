
export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'file' | 'ranking' | 'scale' | 'select';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  description?: string; // Helper text
  required?: boolean;
  options?: string[]; // For radio, checkbox, select
  min?: number; // For scale
  max?: number; // For scale
  minLabel?: string; // For scale
  maxLabel?: string; // For scale
  placeholder?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  // If this section depends on a previous answer
  condition?: {
    fieldId: string; // The ID of the question to check
    value: string;   // The value that must be selected to show this section
  };
}

export const formStructure: Section[] = [
  // SECTION 1: Universal Questions
  {
    id: "basic_info",
    title: "Basic Information",
    description: "Tell us a bit about yourself.",
    questions: [
      { id: "full_name", type: "text", text: "Full Name", required: true },
      {
        id: "roll_number",
        type: "text",
        text: "Roll Number",
        description: "Format: 1608-25-733-019 (College Code - Year - Branch Code - Roll No)",
        placeholder: "1608-25-733-001",
        required: true
      },
      {
        id: "branch",
        type: "select",
        text: "Branch",
        options: [
          "CSE", "IT", "EEE", "ECE", "Civil", "Mechanical", "CSE(AIML)", "CSE(AIDS)", "Data Science"
        ],
        required: true
      },
      { id: "email", type: "text", text: "Email Address", required: true },
      { id: "phone", type: "text", text: "Phone Number", required: true },
      {
        id: "why_join",
        type: "textarea",
        text: "Why do you want to join Dev Catalyst?",
        description: "Open-ended, 150-200 words.",
        required: true
      },
      {
        id: "goals",
        type: "textarea",
        text: "What do you hope to achieve by the end of this academic year through this club?",
        required: true
      }
    ]
  },
  {
    id: "behavioral",
    title: "Behavioral & Commitment Assessment",
    questions: [
      {
        id: "prioritization_scenario",
        type: "textarea",
        text: "Scenario: You have a mid-semester exam tomorrow, but the club has an urgent deadline for an event happening in 2 days. How do you handle this?",
        required: true
      },
      {
        id: "time_commitment",
        type: "radio",
        text: "Realistically, how many hours per week can you dedicate to club activities?",
        options: ["2-4 hours", "5-7 hours", "8-10 hours", "10+ hours"],
        required: true
      },
      {
        id: "team_failure_experience",
        type: "textarea",
        text: "Tell us about a time you worked in a team and something went wrong. What was your role in fixing it?",
        required: true
      },
      // ENHANCED QUESTION
      {
        id: "unlimited_resources",
        type: "textarea",
        text: "If you had unlimited resources for a day, what project would you start and why?",
        description: "This helps us understand your vision and passion.",
        required: false
      }
    ]
  },
  {
    id: "event_planning",
    title: "Event Planning & Management",
    description: "Mandatory Common Section",
    questions: [
      {
        id: "event_experience",
        type: "radio",
        text: "Have you organized or been part of organizing any event before?",
        options: ["Yes", "No"],
        required: true
      },
      {
        id: "event_experience_details",
        type: "textarea",
        text: "If Yes: Describe your role, team size, and one challenge. If No: How would you approach organizing a 100-person technical workshop with a budget of ₹5,000?",
        required: true
      },
      {
        id: "crisis_management",
        type: "ranking", // We might implement this as a drag-drop or just text for MVP
        text: "Rapid Decision Exercise: You're managing an event. 30 minutes before start time: 1) Keynote speaker cancels, 2) 50 more people show up, 3) Projector fails. Rank these by priority (1-3) and explain your first action for the top priority.",
        description: "Please list your ranking and explanation.",
        required: true
      },
      {
        id: "event_success_factors",
        type: "radio",
        text: "What's more important for a successful event?",
        options: ["Detailed planning", "Flexibility to adapt", "Strong team coordination", "Post-event feedback"],
        required: true
      }
    ]
  },

  // TRACK SELECTION
  {
    id: "track_selection_section",
    title: "Team Selection",
    questions: [
      {
        id: "selected_track",
        type: "select", // or radio
        text: "Which team track are you applying for?",
        options: ["Technical Team", "Social Media Team", "Content Creation Team", "Outreach Team"],
        required: true
      }
    ]
  },

  // TRACK A: Technical
  {
    id: "track_technical",
    title: "Track A: Technical Team",
    condition: { fieldId: "selected_track", value: "Technical Team" },
    questions: [
      {
        id: "tech_skills",
        type: "checkbox",
        text: "What technical skills do you currently have?",
        options: ["Programming languages", "Web development", "App development", "AI/ML", "Data Science", "UI/UX Design", "Other"]
      },
      // SPLIT LINKS
      {
        id: "github_link",
        type: "text",
        text: "GitHub Profile Link",
        required: false,
        placeholder: "https://github.com/..."
      },
      {
        id: "linkedin_link",
        type: "text",
        text: "LinkedIn Profile Link",
        required: false,
        placeholder: "https://linkedin.com/in/..."
      },
      {
        id: "portfolio_link_tech",
        type: "text",
        text: "Portfolio / Website Link (Optional)",
        description: "If sharing a Drive link, ensure 'Anyone with the link' can view.",
        required: false,
        placeholder: "https://..."
      },
      // END SPLIT LINKS
      {
        id: "learning_approach",
        type: "textarea",
        text: "Scenario: You're assigned to build a feature you've never worked with before, and it's due in one week. Walk us through your approach from Day 1 to Day 7.",
        required: true
      },
      {
        id: "tech_struggle",
        type: "textarea",
        text: "Describe a technical problem you struggled with. How long did you struggle, and what finally helped you solve it?",
        required: true
      },
      {
        id: "tech_blocker",
        type: "text",
        text: "What's a technology you've been wanting to learn but haven't started yet? What's stopping you?",
        required: true
      },
      {
        id: "collaboration_style",
        type: "radio",
        text: "In a team project, are you more likely to:",
        options: [
          "Take the lead and delegate tasks",
          "Contribute independently and deliver your part",
          "Support others and fill gaps wherever needed",
          "Drive discussions and ensure alignment"
        ],
        required: true
      },
      // ENHANCED QUESTION
      {
        id: "tech_explain_simple",
        type: "textarea",
        text: "Explain a complex technical concept (like recursion, APIs, or how the internet works) as if you were talking to a 5-year-old.",
        required: false
      }
    ]
  },

  // TRACK B: Social Media
  {
    id: "track_social",
    title: "Track B: Social Media Team",
    condition: { fieldId: "selected_track", value: "Social Media Team" },
    questions: [
      {
        id: "social_platforms",
        type: "checkbox",
        text: "Which social media platforms are you most active on? (Pick top 3)",
        options: ["Instagram", "LinkedIn", "Twitter/X", "YouTube", "Facebook", "Discord", "Reddit", "Other"]
      },
      // SPLIT HANDLES
      {
        id: "instagram_handle_social",
        type: "text",
        text: "Instagram Handle (Optional)",
        required: false
      },
      {
        id: "linkedin_handle_social",
        type: "text",
        text: "LinkedIn Profile Link (Optional)",
        required: false
      },
      {
        id: "twitter_handle_social",
        type: "text",
        text: "Twitter/X Handle (Optional)",
        required: false
      },
      {
        id: "other_socials",
        type: "text",
        text: "Any other platforms? (Optional)",
        required: false
      },
      // END SPLIT HANDLES
      {
        id: "social_analysis",
        type: "textarea",
        text: "Analysis Task: Scroll through any tech club's Instagram page. What's one post that performed well? What's one that didn't? Why?",
        required: true
      },
      {
        id: "social_writing_task",
        type: "textarea",
        text: "Write a LinkedIn post (150 words max) announcing that Dev Catalyst just completed a successful hackathon with 200 participants.",
        required: true
      },
      {
        id: "social_influencers",
        type: "textarea",
        text: "Name 3 tech influencers you follow and what you like about their content.",
        required: true
      },
      {
        id: "social_viral_idea",
        type: "textarea",
        text: "Quick Challenge: If you had to make Dev Catalyst go viral with one reel/short video idea, what would it be?",
        required: true
      },
      // ENHANCED QUESTION
      {
        id: "social_trend_critique",
        type: "textarea",
        text: "What is a current social media trend that you dislike? Why?",
        required: false
      }
    ]
  },

  // TRACK C: Content Creation
  {
    id: "track_content",
    title: "Track C: Content Creation Team",
    condition: { fieldId: "selected_track", value: "Content Creation Team" },
    questions: [
      {
        id: "content_type",
        type: "checkbox",
        text: "What type of content have you created before?",
        options: ["Graphic design", "Video editing", "Copywriting", "Photography", "Animation", "None"]
      },
      {
        id: "portfolio_link",
        type: "text",
        text: "Share a Google Drive link (or Portfolio URL) with 2-3 samples of your work.",
        description: "IMPORTANT: If using Google Drive, ensuring 'Anyone with the link' has viewing access.",
        required: true
      },
      {
        id: "content_socials",
        type: "textarea",
        text: "Social Media Accounts showcasing your work (Instagram, YouTube, etc.) - Optional",
        description: "Paste links to your creative pages if you have them.",
        required: false
      },
      {
        id: "creative_process",
        type: "textarea",
        text: "Describe your creative process from getting a brief to delivering final content.",
        required: true
      },
      {
        id: "design_philosophy",
        type: "textarea",
        text: "What makes a good poster? List 3 essential elements.",
        required: true
      },
      {
        id: "feedback_handling",
        type: "textarea",
        text: "You receive feedback that your design 'doesn't feel right' but no specific issues are mentioned. How do you respond?",
        required: true
      },
      {
        id: "tools_familiarity",
        type: "checkbox",
        text: "What tools do you use?",
        options: ["Canva", "Figma", "Photoshop", "Illustrator", "Premiere Pro", "DaVinci Resolve", "CapCut"]
      },
      // ENHANCED QUESTION
      {
        id: "perfect_content",
        type: "textarea",
        text: "Share a link to a piece of content (video/image) you didn't create but think is 'perfect'. Explain why in one sentence.",
        required: false
      }
    ]
  },

  // TRACK D: Outreach
  {
    id: "track_outreach",
    title: "Track D: Outreach Team",
    condition: { fieldId: "selected_track", value: "Outreach Team" },
    questions: [
      {
        id: "cold_outreach_exp",
        type: "textarea",
        text: "Have you ever cold-emailed or reached out to someone you didn't know? If yes, what was the outcome? If no, what would make you hesitate?",
        required: true
      },
      {
        id: "email_writing_exercise",
        type: "textarea",
        text: "Write a cold outreach email (100-150 words) to a tech startup founder requesting them to sponsor Dev Catalyst's upcoming event.",
        required: true
      },
      {
        id: "outreach_comfort",
        type: "scale",
        text: "Rate your comfort level with approaching strangers at events.",
        min: 1,
        max: 5,
        minLabel: "Terrified",
        maxLabel: "Confident"
      },
      {
        id: "sponsorship_strategy",
        type: "textarea",
        text: "Dev Catalyst needs partnerships with 5 local companies. Describe your strategy to identify and approach them.",
        required: true
      },
      // ENHANCED QUESTION
      {
        id: "persuasion_task",
        type: "textarea",
        text: "Convince us to watch a movie or read a book you love in 3 sentences.",
        required: false
      }
    ]
  },

  // SECTION 3: Closing
  {
    id: "closing",
    title: "Closing Questions",
    questions: [
      {
        id: "culture_fit",
        type: "radio",
        text: "Which of these describes you best?",
        options: ["Thrive under pressure", "Prefer planned work", "Flexible/Adaptable", "Still figuring it out"],
        required: true
      },
      {
        id: "conflict_resolution",
        type: "textarea",
        text: "If you disagree with a decision made by club leadership, what would you do?",
        required: true
      },
      {
        id: "honesty_check",
        type: "scale",
        text: "On a scale of 1-10, how much did you overthink your answers in this form?",
        min: 1,
        max: 10,
        required: true
      },
      {
        id: "any_questions",
        type: "textarea",
        text: "Any questions for us? Or anything else you want to share?",
        required: false
      }
    ]
  }
];
