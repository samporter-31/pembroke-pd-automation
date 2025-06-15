import React from 'react'
import { Loader2, AlertCircle, CheckCircle, X, Info } from 'lucide-react'

// Card Component
export const Card = ({ 
  children, 
  className = '', 
  colorClass = 'bg-white',
  onClick,
  ...props 
}: {
  children: React.ReactNode
  className?: string
  colorClass?: string
  onClick?: () => void
}) => (
  <div 
    className={`rounded-2xl shadow-sm border border-gray-200 p-6 transition-all ${colorClass} ${className} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
)

// Primary Button (Pembroke Blue)
export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  size = 'medium',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
}) => {
  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
    large: 'px-8 py-4 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-[#00338d] text-white font-semibold rounded-2xl hover:bg-[#002266] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Secondary Button
export const SecondaryButton = ({
  children,
  onClick,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-2xl hover:bg-gray-200 transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
)

// Icon Circle
export const IconCircle = ({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-800 ${className}`}>
    {children}
  </div>
)

// Loading Screen
export const LoadingScreen = ({
  title = 'Loading',
  message = 'Please wait...'
}: {
  title?: string
  message?: string
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#00338d]" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

// Error Screen
export const ErrorScreen = ({
  title = 'Error',
  message = 'Something went wrong',
  onAction,
  actionLabel = 'Go Back'
}: {
  title?: string
  message?: string
  onAction?: () => void
  actionLabel?: string
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      {onAction && (
        <PrimaryButton onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      )}
    </Card>
  </div>
)

// Notification Toast
export const NotificationToast = ({
  type,
  message,
  onClose
}: {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose: () => void
}) => {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  }

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className={`p-4 rounded-xl shadow-lg border flex items-start ${styles[type]}`}>
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="ml-2 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Focus Question Card
export const FocusQuestionCard = ({
  question,
  number
}: {
  question: string
  number: number
}) => (
  <div className="bg-white rounded-xl p-4">
    <div className="flex items-start">
      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
        {number}
      </span>
      <p className="text-gray-700">{question}</p>
    </div>
  </div>
)

// Stats Card
export const StatsCard = ({
  value,
  label,
  bgColor = 'bg-blue-100',
  textColor = 'text-blue-900',
  className = ''
}: {
  value: string | number
  label: string
  bgColor?: string
  textColor?: string
  className?: string
}) => (
  <div className={`${bgColor} rounded-2xl p-4 text-center ${className}`}>
    <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
    <div className={`text-sm ${textColor} opacity-80`}>{label}</div>
  </div>
)

// Framework Card
export const FrameworkCard = ({
  icon,
  name,
  description,
  selected,
  onClick,
  bgColor = 'bg-gray-50',
  borderColor = 'border-gray-200'
}: {
  icon: React.ReactNode
  name: string
  description: string
  selected: boolean
  onClick: () => void
  bgColor?: string
  borderColor?: string
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
      selected ? `${bgColor} ${borderColor}` : 'bg-white border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="flex items-start">
      <div className="flex items-center justify-center w-6 h-6 mr-3 mt-0.5">
        {selected ? (
          <CheckCircle className="w-6 h-6 text-current" />
        ) : (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          {icon}
          <span className="font-semibold text-sm ml-2">{name}</span>
        </div>
        <p className="text-xs mt-1 text-gray-600">{description}</p>
      </div>
    </div>
  </button>
)

// Progress Bar
export const ProgressBar = ({
  value,
  max = 100,
  label,
  className = ''
}: {
  value: number
  max?: number
  label?: string
  className?: string
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#00338d] h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Header Component
export const Header = ({
  title,
  subtitle,
  leftAction,
  rightAction
}: {
  title: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}) => (
  <div className="bg-white border-b border-gray-200">
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {leftAction && <div>{leftAction}</div>}
        <div className="text-center flex-1">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  </div>
)

// Color Block Card
export const ColorBlockCard = ({
  children,
  colorClass,
  className = ''
}: {
  children: React.ReactNode
  colorClass: string
  className?: string
}) => (
  <div className={`rounded-2xl p-6 ${colorClass} ${className}`}>
    {children}
  </div>
)

// Usage Example Component
export default function ComponentShowcase() {
  const [showNotification, setShowNotification] = useState(true)
  const [selectedFramework, setSelectedFramework] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Pembroke UI Components</h1>
        
        {/* Buttons */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <PrimaryButton>Primary Button</PrimaryButton>
            <PrimaryButton size="small">Small Button</PrimaryButton>
            <PrimaryButton size="large">Large Button</PrimaryButton>
            <SecondaryButton>Secondary Button</SecondaryButton>
            <PrimaryButton loading>Loading...</PrimaryButton>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Color Cards</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ColorBlockCard colorClass="bg-[#aac4e7]">
              <h3 className="font-bold mb-2">Light Blue Card</h3>
              <p>Pembroke light blue background</p>
            </ColorBlockCard>
            <ColorBlockCard colorClass="bg-[#b2d2c7]">
              <h3 className="font-bold mb-2">Teal Card</h3>
              <p>Pembroke teal background</p>
            </ColorBlockCard>
            <ColorBlockCard colorClass="bg-[#fee7bb]">
              <h3 className="font-bold mb-2">Peach Card</h3>
              <p>Pembroke peach background</p>
            </ColorBlockCard>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stats Cards</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatsCard value={5} label="Insights" bgColor="bg-blue-100" textColor="text-blue-900" />
            <StatsCard value={3} label="Actions" bgColor="bg-green-100" textColor="text-green-900" />
            <StatsCard value={4} label="Frameworks" bgColor="bg-purple-100" textColor="text-purple-900" />
          </div>
        </section>

        {/* Progress Bar */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Bar</h2>
          <ProgressBar value={65} label="Session Progress" />
        </section>

        {/* Notification */}
        {showNotification && (
          <NotificationToast 
            type="success" 
            message="Pembroke UI components loaded successfully!"
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    </div>
  )
}