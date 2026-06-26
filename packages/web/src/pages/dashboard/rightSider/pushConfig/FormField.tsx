import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
}

const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-slate-400">{label}</div>
      {children}
    </div>
  )
}

export default FormField
