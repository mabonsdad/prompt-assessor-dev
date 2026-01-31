import { Lightbulb, MessageSquare, Target, Zap } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Welcome to Prompt Coach
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-10">
        Ask anything and get AI responses. Plus, receive instant feedback on how to improve your prompts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
        <FeatureCard
          icon={<Target className="w-5 h-5" />}
          title="Clarity Check"
          description="Identify ambiguous language"
        />
        <FeatureCard
          icon={<Lightbulb className="w-5 h-5" />}
          title="Suggestions"
          description="Get rewrite recommendations"
        />
        <FeatureCard
          icon={<Zap className="w-5 h-5" />}
          title="Guardrails"
          description="Spot missing constraints"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-left">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium text-foreground text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
