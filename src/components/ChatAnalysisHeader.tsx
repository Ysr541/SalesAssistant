import { ChevronLeft } from 'lucide-react'
import { useNavigate, type ReactNode } from 'react-router-dom'
import './ChatAnalysisHeader.scss'

export type ChatAnalysisMode = 'private'

interface ChatAnalysisHeaderProps {
  currentMode: ChatAnalysisMode
  actions?: ReactNode
}

const MODE_CONFIG: Record<ChatAnalysisMode, { label: string }> = {
  private: {
    label: '私聊分析'
  }
}

function ChatAnalysisHeader({ currentMode, actions }: ChatAnalysisHeaderProps) {
  const navigate = useNavigate()
  const currentLabel = MODE_CONFIG[currentMode].label

  return (
    <div className="chat-analysis-header">
      <div className="chat-analysis-breadcrumb">
        <button
          type="button"
          className="chat-analysis-back"
          onClick={() => navigate('/analytics')}
        >
          <ChevronLeft size={16} />
          <span>聊天分析</span>
        </button>
        <span className="chat-analysis-breadcrumb-separator">/</span>
        <span className="chat-analysis-current-label">{currentLabel}</span>
      </div>

      {actions ? <div className="chat-analysis-actions">{actions}</div> : null}
    </div>
  )
}

export default ChatAnalysisHeader
