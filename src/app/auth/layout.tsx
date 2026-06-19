import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-background via-background to-primary/5 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative floating cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-12 w-64 h-40 bg-primary/10 rounded-2xl blur-3xl"></div>
          <div className="absolute bottom-32 right-12 w-72 h-48 bg-secondary/10 rounded-2xl blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-64 bg-primary/5 rounded-2xl blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-bold mb-4 shimmer-text">CareerAI</h1>
          <p className="text-2xl text-text-primary font-heading mb-16 font-semibold">
            Your career, matched by intelligence.
          </p>

          {/* Floating job cards - ambient decoration */}
          <div className="grid grid-cols-1 gap-6 mt-16 max-w-md mx-auto">
            {[
              {
                company: 'TechCorp',
                role: 'Senior Engineer',
                match: 95,
              },
              {
                company: 'InnovateLabs',
                role: 'Product Manager',
                match: 87,
              },
              {
                company: 'DataStream',
                role: 'Data Scientist',
                match: 92,
              },
            ].map((job, idx) => (
              <div
                key={idx}
                className="bg-surface/50 border border-surface-border rounded-card p-4 backdrop-blur-sm"
                style={{
                  animation: `slideInUp 0.6s ease ${idx * 0.1}s both`,
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-text-muted text-sm">{job.company}</p>
                    <p className="text-text-primary font-semibold">{job.role}</p>
                  </div>
                  <div className="text-secondary font-bold text-lg">{job.match}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-background">
        {children}
      </div>
    </div>
  );
}
