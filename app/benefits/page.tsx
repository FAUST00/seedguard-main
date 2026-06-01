import { CheckCircle, Heart, Brain, Zap, Eye, Trophy } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  timeline: string;
}

const benefits: Benefit[] = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'Mental Clarity',
    description: 'Your mind becomes sharper as dopamine receptors reset and normalize.',
    timeline: '2-4 weeks',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Emotional Stability',
    description: 'Mood swings decrease and emotional resilience increases.',
    timeline: '1-3 months',
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Increased Energy',
    description: 'Physical energy and motivation return as your brain chemistry rebalances.',
    timeline: '3-6 weeks',
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: 'Better Focus',
    description: 'Concentration improves dramatically as your attention span recovers.',
    timeline: '2-8 weeks',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Relationship Healing',
    description: 'Trust rebuilds and connections deepen with those close to you.',
    timeline: '2-6 months',
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: 'Self-Respect',
    description: 'Genuine confidence returns as you honor your commitments.',
    timeline: '1-3 months',
  },
];

export default function Benefits() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-12 page-entry">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">
          The Retention Journey
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the transformative benefits of recovery. Every day matters. Every milestone counts.
        </p>
      </div>

      {/* Timeline Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-primary neon-text-pink">
          Your Path to Freedom
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <span className="text-xs font-semibold text-primary neon-text-pink bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {benefit.timeline}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 uppercase tracking-wider">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                <div className="mt-4 pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Verified improvement
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phases Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-secondary neon-text-cyan">
          Recovery Phases
        </h2>

        <div className="space-y-6">
          {/* Phase 1 */}
          <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-all animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-primary/20 p-3 text-primary font-bold text-lg w-12 h-12 flex items-center justify-center neon-text-pink">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 uppercase tracking-wider">Days 1-7: Detox Phase</h3>
                <p className="text-muted-foreground mb-4">
                  The hardest part. Intense urges and withdrawal-like symptoms are common. Your brain is starting to heal.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Sleep disruption</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Intense urges</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Irritability</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Anxiety</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-8 hover:border-secondary/50 transition-all animate-scale-in [animation-delay:100ms]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-secondary/20 p-3 text-secondary font-bold text-lg w-12 h-12 flex items-center justify-center neon-text-cyan">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 uppercase tracking-wider">Weeks 2-4: Adjustment Phase</h3>
                <p className="text-muted-foreground mb-4">
                  Urges decrease but flatness/anhedonia may hit. You&apos;re on the right path. Exercise and social connection help enormously.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-secondary/10 px-3 py-2 text-secondary font-medium">Lower urges</div>
                  <div className="rounded-lg bg-secondary/10 px-3 py-2 text-secondary font-medium">Flatness</div>
                  <div className="rounded-lg bg-secondary/10 px-3 py-2 text-secondary font-medium">Better sleep</div>
                  <div className="rounded-lg bg-secondary/10 px-3 py-2 text-secondary font-medium">Energy returns</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="rounded-xl border border-accent/20 bg-background/50 backdrop-blur-sm p-8 hover:border-accent/50 transition-all animate-scale-in [animation-delay:200ms]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-accent/20 p-3 text-accent font-bold text-lg w-12 h-12 flex items-center justify-center">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 uppercase tracking-wider">Months 2-3: Rewiring Phase</h3>
                <p className="text-muted-foreground mb-4">
                  Confidence builds. Urges become easier to resist. Dopamine reward system begins to normalize. Life feels more enjoyable again.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-accent/10 px-3 py-2 text-accent font-medium">Improved mood</div>
                  <div className="rounded-lg bg-accent/10 px-3 py-2 text-accent font-medium">Confidence</div>
                  <div className="rounded-lg bg-accent/10 px-3 py-2 text-accent font-medium">Motivation</div>
                  <div className="rounded-lg bg-accent/10 px-3 py-2 text-accent font-medium">Focus returns</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-all animate-scale-in [animation-delay:300ms]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-primary/20 p-3 text-primary font-bold text-lg w-12 h-12 flex items-center justify-center neon-text-pink">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 uppercase tracking-wider">Months 3+: Reboot Phase</h3>
                <p className="text-muted-foreground mb-4">
                  Full recovery. Brain has healed significantly. You&apos;ve rediscovered yourself. Relationships have rebuilt. Life is better.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Full clarity</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Genuine joy</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">Strong urge control</div>
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">New life</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-12 text-center space-y-6 animate-scale-in [animation-delay:400ms]">
        <h2 className="text-2xl font-bold uppercase tracking-wider">
          <span className="text-primary neon-text-pink">Your journey matters.</span> <br />
          <span className="text-secondary neon-text-cyan">Every day is a victory.</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The path to freedom is not easy, but it is absolutely worth it. You have the strength within you. Use SeedGuard to track your progress, celebrate your wins, and learn from your setbacks.
        </p>
        <div className="pt-6">
          <p className="text-sm text-muted-foreground">
            ðª You are stronger than your urges. ð± You deserve better. ð¥ Never give up.
          </p>
        </div>
      </div>
    </div>
  );
}
