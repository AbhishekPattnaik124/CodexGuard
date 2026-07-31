import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Wrench, Eye, CheckCircle } from 'lucide-react';

export function PipelineStepper({ activeStep }) {
  const steps = [
    { id: 1, name: "Scan", icon: <Shield size={16} /> },
    { id: 2, name: "Plan", icon: <LayoutDashboard size={16} /> },
    { id: 3, name: "Fix", icon: <Wrench size={16} /> },
    { id: 4, name: "Review", icon: <Eye size={16} /> },
    { id: 5, name: "Score", icon: <CheckCircle size={16} /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pipeline-stepper"
    >
      {steps.map((step, index) => {
        const isDone = activeStep > index + 1;
        const isActive = activeStep === index + 1;
        return (
          <div key={step.id} className={`step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
            <motion.div 
              className="step-icon"
              animate={{ 
                scale: isActive ? 1.1 : 1,
                backgroundColor: isDone ? 'var(--success-color)' : isActive ? 'var(--primary-color)' : 'var(--border-color)',
                color: (isActive || isDone) ? '#fff' : 'var(--text-muted)'
              }}
            >
              {isDone ? <CheckCircle size={16} /> : step.icon}
            </motion.div>
            <span className="step-label">{step.name}</span>
          </div>
        )
      })}
    </motion.div>
  )
}
