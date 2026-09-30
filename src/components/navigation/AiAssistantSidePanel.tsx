import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  ChevronRight,
  Database
} from 'lucide-react';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { INITIAL_MAINTENANCE_RECORDS } from '@/src/data/maintenanceData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedWellId?: string;
  suggestedAction?: {
    label: string;
    wellId: string;
  };
}

interface AiAssistantSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateWell?: (wellId: string) => void;
  onNavigate?: (routeId: string) => void;
}

export const AiAssistantSidePanel: React.FC<AiAssistantSidePanelProps> = ({
  isOpen,
  onClose,
  onNavigateWell,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg-1',
      sender: 'assistant',
      text: "BAGHEWALA DCS EXPERT SYSTEM ONLINE.\nActive telemetry link synchronized across 35 production wells in the Bikaner-Nagaur PML.\n\nQuery operating parameters, thermal CSS cycle decay, API 11L minimum rod load (MPRL) compression thresholds, or wellhead diagnostic logs (e.g. `Diagnose BGW-12 operational flags`).",
      timestamp: '19:45:00',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Quick suggestion prompts
  const suggestions = [
    'Why is well BGW-12 flagged today?',
    'Which wells have rod-floating risk?',
    'Telemetry summary for BGW-09',
    'Which well has highest crude viscosity?',
  ];

  // Helper function to query real well dataset and synthesize engineering responses
  const generateResponse = (query: string): { responseText: string; relatedWellId?: string } => {
    const q = query.toLowerCase().trim();

    // Check if query is targeting a specific well (e.g. BGW-12, bgw 12, bgw-09)
    const wellMatch = query.match(/bgw[- ]?([0-9]{1,2})/i);
    let targetWell: WellData | undefined;

    if (wellMatch) {
      const wellNum = wellMatch[1].padStart(2, '0');
      const wellId = `BGW-${wellNum}`;
      targetWell = BAGHEWALA_WELLS.find(w => w.id.toUpperCase() === wellId.toUpperCase());
    }

    // Specific well inquiries: "why is well BGW-12 flagged today", etc.
    if (targetWell) {
      const w = targetWell;
      const wellId = w.id;

      if (q.includes('flagged') || q.includes('alert') || q.includes('fault') || q.includes('why')) {
        if (w.status === 'normal') {
          return {
            responseText: `Well \`${wellId}\` on \`${w.pad}\` is currently operating with \`[NOMINAL]\` status. Live metrics:\n- Net Heavy Oil Rate: \`${w.oilRateBOPD} BOPD\`\n- Bottomhole Temperature: \`${w.bottomholeTempC}°C\`\n- Polished Rod Load: \`${w.polishedRodLoadLbs.toLocaleString()} lbs\` (Min: \`${w.minRodLoadLbs.toLocaleString()} lbs\`)\n- Pump Fillage: \`${w.pumpFillagePct}%\`\nNo active SCADA faults or thermal restimulation triggers detected.`,
            relatedWellId: wellId,
          };
        }

        // Well is flagged (Alert or Fault)
        const flagType = w.status === 'fault' ? 'CRITICAL FAULT' : 'WARNING ALERT';
        const reason = w.alertReason || (w.rodFloatingRisk 
          ? `Downstroke viscous fluid drag causing compressive rod buckling risk (MPRL: ${w.minRodLoadLbs} lbs)`
          : `Thermal decay below design limits in CSS Cycle #${w.cycleNumber}`);

        return {
          responseText: `Well \`${wellId}\` (Pad \`${w.pad}\`) is flagged with \`[${flagType}]\`:\n\n` +
            `• Primary Root Cause: ${reason}\n` +
            `• Minimum Rod Load (MPRL): \`${w.minRodLoadLbs.toLocaleString()} lbs\` (API 11L safe tension threshold is \`2,000 lbs\`)\n` +
            `• Crude Viscosity at BHT: \`${w.crudeViscosityCP} cP\` (Reservoir Temp: \`${w.bottomholeTempC}°C\`)\n` +
            `• CSS Thermal Phase: \`${w.cyclePhase}\` (\`${w.daysSinceInjection} days\` since Cycle #${w.cycleNumber} injection)\n` +
            `• Mechanical Stress Status: \`${w.rodLoadStatus}\` · Rod Floating Risk: \`${w.rodFloatingRisk ? 'YES [ACTIVE HAZARD]' : 'NO'}\`\n\n` +
            `Recommended Action: Lower VFD pumping speed from \`${w.strokeRateSPM} SPM\` to \`${Math.max(2.2, w.strokeRateSPM - 0.8).toFixed(1)} SPM\` to relieve downstroke compression, or inspect for steam breakthrough.`,
          relatedWellId: wellId,
        };
      }

      // General telemetry summary for the well
      return {
        responseText: `Live Telemetry Dossier for \`${wellId}\` (\`${w.pad}\`):\n` +
          `- Operating Status: \`[${w.status.toUpperCase()}]\`\n` +
          `- Net Oil Production: \`${w.oilRateBOPD} BOPD\`\n` +
          `- Bottomhole Temperature: \`${w.bottomholeTempC}°C\`\n` +
          `- Crude Viscosity: \`${w.crudeViscosityCP} cP\`\n` +
          `- Peak Load (PPRL): \`${w.polishedRodLoadLbs.toLocaleString()} lbs\`\n` +
          `- Minimum Load (MPRL): \`${w.minRodLoadLbs.toLocaleString()} lbs\`\n` +
          `- Pump Fillage: \`${w.pumpFillagePct}%\` at \`${w.strokeRateSPM} SPM\`\n` +
          `- Cumulative SOR: \`${w.steamOilRatio} m³/m³\` (CSS Cycle #${w.cycleNumber}, Day \`${w.daysSinceInjection}\`)`,
        relatedWellId: wellId,
      };
    }

    // Queries about rod floating risk across the fleet
    if (q.includes('rod float') || q.includes('floating') || q.includes('compression')) {
      const atRisk = BAGHEWALA_WELLS.filter(w => w.rodFloatingRisk || w.minRodLoadLbs < 2000);
      const list = atRisk.map(w => `• \`${w.id}\` (Pad \`${w.pad}\`): MPRL \`${w.minRodLoadLbs} lbs\`, Viscosity \`${w.crudeViscosityCP} cP\`, SPM \`${w.strokeRateSPM}\``).join('\n');
      return {
        responseText: `Currently \`${atRisk.length} wells\` exhibit downstroke rod-floating or compressive buckling risk:\n\n${list}\n\nKey Mechanism: Heavy bitumen (${atRisk[0]?.crudeViscosityCP || 890}+ cP) exerts buoyant viscous drag against descending sucker rods, reducing MPRL below \`2,000 lbs\`.`,
        relatedWellId: atRisk[0]?.id,
      };
    }

    // Queries about highest viscosity
    if (q.includes('viscosity') || q.includes('thickest') || q.includes('heavy')) {
      const sorted = [...BAGHEWALA_WELLS].sort((a, b) => b.crudeViscosityCP - a.crudeViscosityCP);
      const top3 = sorted.slice(0, 3).map(w => `• \`${w.id}\` (Pad \`${w.pad}\`): \`${w.crudeViscosityCP} cP\` at \`${w.bottomholeTempC}°C\``).join('\n');
      return {
        responseText: `Highest crude viscosity wells in the fleet (thermal cooling boundary):\n\n${top3}\n\nWells with viscosity > \`1,200 cP\` are prime candidates for CSS restimulation cycles.`,
        relatedWellId: sorted[0]?.id,
      };
    }

    // Queries about steam / CSS cycles
    if (q.includes('steam') || q.includes('css') || q.includes('thermal') || q.includes('soak')) {
      const injecting = BAGHEWALA_WELLS.filter(w => w.cyclePhase === 'Injection');
      const soaking = BAGHEWALA_WELLS.filter(w => w.cyclePhase === 'Soaking');
      return {
        responseText: `Fleet Thermal CSS Operations:\n` +
          `- Currently Injecting (\`${injecting.length} wells\`): ${injecting.map(w => `\`${w.id}\``).join(', ') || 'None'}\n` +
          `- Currently Soaking (\`${soaking.length} wells\`): ${soaking.map(w => `\`${w.id}\``).join(', ') || 'None'}\n` +
          `- Average Fleet SOR: \`3.42 m³/m³\`\n` +
          `Steam Generator SG-01 & SG-02 are operating at \`14.2 MPa\` and \`78.5% dryness\`.`,
      };
    }

    // Fleet-wide summary fallback
    const alertCount = BAGHEWALA_WELLS.filter(w => w.status === 'alert').length;
    const faultCount = BAGHEWALA_WELLS.filter(w => w.status === 'fault').length;
    const totalOil = BAGHEWALA_WELLS.reduce((acc, w) => acc + w.oilRateBOPD, 0);

    return {
      responseText: `Baghewala Heavy Oil Fleet Status Overview:\n` +
        `- Active Wells: \`35 wells\` across 5 drill pads\n` +
        `- Field Production: \`${totalOil} BOPD\` gross heavy crude\n` +
        `- Active Alarms: \`${faultCount} Critical Faults\` · \`${alertCount} Warnings\`\n` +
        `- Most Flagged Well: \`BGW-12\` (Downstroke compression, MPRL \`1,420 lbs\`)\n` +
        `Ask for any specific well identifier like \`BGW-09\` or \`BGW-04\` for detailed coupled physics diagnostics.`,
    };
  };

  // Submit query
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate SCADA telemetry query latency (350ms)
    setTimeout(() => {
      const { responseText, relatedWellId } = generateResponse(query);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        relatedWellId,
        suggestedAction: relatedWellId ? {
          label: `OPEN ${relatedWellId} DIGITAL TWIN`,
          wellId: relatedWellId,
        } : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 400);
  };

  // Render text and format backtick codes as monospace data tags
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const val = part.slice(1, -1);
        const isWellCode = /^BGW-[0-9]{2}$/i.test(val);

        if (isWellCode && onNavigateWell) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onNavigateWell(val.toUpperCase());
                onClose();
              }}
              className="font-mono font-bold text-[#C8551D] hover:text-[#FFFFFF] bg-[#1E2328] hover:bg-[#C8551D] border border-[#2E343A] hover:border-[#C8551D] px-1 py-0.2 mx-0.5 cursor-pointer underline transition-none"
              style={{ borderRadius: 0 }}
              title={`Inspect Digital Twin for ${val}`}
            >
              {val}
            </button>
          );
        }

        return (
          <span 
            key={i} 
            className="font-mono font-bold text-[#C9B896] bg-[#1E2328] border border-[#2E343A] px-1 py-0.2 mx-0.5 select-all"
          >
            {val}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-14 right-0 bottom-0 w-full sm:w-[460px] bg-[#191D21] border-l-2 border-[#2E343A] z-40 flex flex-col font-mono select-text animate-scada-slide-left"
      style={{ borderRadius: 0 }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER CONSOLE (STRICTLY SQUARED, INDUSTRIAL SCADA BAR)            */}
      {/* ========================================================================= */}
      <div 
        className="p-3 bg-[#14171A] border-b border-[#2E343A] flex items-center justify-between"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#191D21] border border-[#C8551D] flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#C8551D]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                OIL BAGHEWALA CO-PILOT
              </span>
              <span className="w-2 h-2 bg-[#3A5F45]" />
            </div>
            <span className="text-[8.5px] text-[#8A8F94] block">
              LIVE SCADA DCS &amp; THERMAL COUPLED REASONING
            </span>
          </div>
        </div>

        {/* Action Buttons: Reset & Close */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMessages([
              {
                id: 'init-reset',
                sender: 'assistant',
                text: "Session reset. DCS telemetry link re-synchronized across 35 production wells in PML Baghewala-01.",
                timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              }
            ])}
            title="Reset Telemetry Session"
            className="p-1 bg-[#191D21] hover:bg-[#252B30] border border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] transition-none"
            style={{ borderRadius: 0 }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Assistant Panel"
            className="p-1 bg-[#191D21] hover:bg-[#8C2F2F] border border-[#2E343A] hover:border-[#8C2F2F] text-[#8A8F94] hover:text-[#FFFFFF] transition-none"
            style={{ borderRadius: 0 }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE ASSET SCOPE STRIP & QUICK SUGGESTIONS                             */}
      {/* ========================================================================= */}
      <div className="bg-[#171B1E] border-b border-[#2E343A] p-2 space-y-1.5 text-[9px]">
        <div className="flex items-center justify-between text-[#5F656B]">
          <span className="uppercase font-bold tracking-wider flex items-center gap-1">
            <Database className="w-3 h-3 text-[#C8551D]" />
            KNOWLEDGE BASE: 35 WELLS · CSS &amp; SRP COUPLED
          </span>
          <span className="text-[#3A5F45] font-bold">READY</span>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center flex-wrap gap-1">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(s)}
              className="px-2 py-0.5 bg-[#14171A] hover:bg-[#20262B] border border-[#2E343A] hover:border-[#C8551D] text-[#8A8F94] hover:text-[#E8E6E1] text-[8.5px] transition-none text-left"
              style={{ borderRadius: 0 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHAT MESSAGES STREAM (SQUARED, MONOSPACE DATA VALUES)                   */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#191D21]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 mb-1 text-[8px] text-[#5F656B] uppercase">
              {msg.sender === 'assistant' ? (
                <>
                  <span className="text-[#C8551D] font-bold">ASSET CO-PILOT</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <span>{msg.timestamp}</span>
                  <span>·</span>
                  <span className="text-[#C9B896] font-bold">ENGINEER</span>
                </>
              )}
            </div>

            {/* Message Bubble: Strictly squared corners, left-aligned for assistant, right for user */}
            <div
              className={`p-2.5 text-[10px] leading-relaxed shadow-sm font-sans ${
                msg.sender === 'user'
                  ? 'bg-[#1F2428] border border-[#C8551D] text-[#E8E6E1] max-w-[85%] text-right font-mono'
                  : 'bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] max-w-[92%] text-left whitespace-pre-line'
              }`}
              style={{ borderRadius: 0 }}
            >
              {renderFormattedText(msg.text)}
            </div>

            {/* 1-Click Action for referenced well */}
            {msg.suggestedAction && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (msg.suggestedAction) {
                      onNavigateWell?.(msg.suggestedAction.wellId);
                      onNavigate?.('digital-twin');
                    }
                  }}
                  className="px-2.5 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#C9B896] hover:border-[#C8551D] text-[#C9B896] hover:text-[#E8E6E1] text-[9px] font-mono font-bold uppercase flex items-center gap-1.5 transition-none shadow-sm"
                  style={{ borderRadius: 0 }}
                >
                  <span>{msg.suggestedAction.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#C8551D]" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[8px] text-[#5F656B] uppercase font-bold">
              ASSET CO-PILOT EVALUATING SCADA TELEMETRY...
            </span>
            <div 
              className="bg-[#14171A] border border-[#2E343A] p-2 flex items-center gap-1.5"
              style={{ borderRadius: 0 }}
            >
              <div className="w-1.5 h-1.5 bg-[#C8551D]" />
              <div className="w-1.5 h-1.5 bg-[#C9B896]" />
              <div className="w-1.5 h-1.5 bg-[#3A5F45]" />
              <span className="text-[9px] font-mono text-[#8A8F94] ml-1">
                Solving coupled nodal equations
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 4. CHAT INPUT CONSOLE (STRICTLY SQUARED, INDUSTRIAL TEXTAREA/INPUT)       */}
      {/* ========================================================================= */}
      <div 
        className="p-2.5 bg-[#14171A] border-t border-[#2E343A] space-y-1.5"
        style={{ borderRadius: 0 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Query SCADA telemetry (e.g. 'Diagnose BGW-12 flags', 'Wells exhibiting downstroke drag')..."
            className="flex-1 bg-[#191D21] border border-[#2E343A] focus:border-[#C8551D] text-[#E8E6E1] placeholder-[#5F656B] px-2.5 py-2 text-[10px] font-mono outline-none"
            style={{ borderRadius: 0 }}
          />

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`px-3 py-2 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-none ${
              inputValue.trim()
                ? 'bg-[#C8551D] hover:bg-[#A84313] text-[#FFFFFF] cursor-pointer'
                : 'bg-[#252B30] text-[#5F656B] cursor-not-allowed'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span>DISPATCH</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[7.5px] text-[#5F656B]">
          <span>PETROLEUM INFERENCE ENGINE V2.4 · OIL INDIA LIMITED (PML-BAGHEWALA-01)</span>
          <span>ENTER TO TRANSMIT</span>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantSidePanel;
