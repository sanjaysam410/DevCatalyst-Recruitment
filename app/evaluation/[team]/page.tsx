import TrackPasswordGate from "@/app/components/TrackPasswordGate";
import EvaluationClient from "./EvaluationClient";

export default async function TeamEvaluationPage({ params }: { params: Promise<{ team: string }> }) {
    const { team } = await params;

    // Capitalize team name
    const teamName = team.charAt(0).toUpperCase() + team.slice(1);

    // Mock dynamic parameters based on team
    const getTeamParameters = (t: string) => {
        const commonParams = [
            "Communication",
            "Passion & Genuine Interest",
            "Commitment & Time Availability",
            "Teamwork & Collaboration",
            "Initiative & Proactiveness",
            "Adaptability & Willingness to Learn"
        ];

        const teamParams: Record<string, string[]> = {
            "technical": ["Code Cleanliness", "Logical Thinking", "Completion", "Problem-Solving Approach"],
            "social": ["Platform Awareness", "Hook Strength", "Hashtag & SEO Strategy", "Tone Matching"],
            "content": ["Creativity & Originality", "Visual Storytelling", "Technical Execution", "Brand Consistency"],
            "outreach": ["Email Quality", "Outreach Plan Logic", "Personalization", "Follow-through Thinking"],
            "core": ["Event Management", "Time Management", "Leadership", "Crisis Management"]
        };

        const interviewParams: Record<string, string[]> = {
            "technical": ["Explain Task", "Debugging Mindset", "Curiosity Beyond Task"],
            "social": ["Consumer vs Student", "Trend Awareness", "Strategy Thinking"],
            "content": ["Design Intentionality", "Taste & References", "Handling Feedback"],
            "outreach": ["On the Spot Pitch", "Handling Rejection", "Real-world Awareness"],
            "core": []
        };

        return {
            common: commonParams,
            specific: teamParams[t.toLowerCase()] || [],
            interview: interviewParams[t.toLowerCase()] || []
        };
    };

    const parameters = getTeamParameters(team);

    return (
        <TrackPasswordGate team={teamName}>
            <EvaluationClient team={team} teamName={teamName} parameters={parameters} />
        </TrackPasswordGate>
    );
}
