import React, { useState } from 'react';
import { Lock, User, Key, ShieldCheck, ChevronDown, CheckSquare, Eye } from 'lucide-react';
import { useRole, UserRole } from '@/src/context/RoleContext';
import DS from '@/src/design-system';

interface LoginScreenProps {
  onLoginSuccess: (userProfile: { name: string; desk: string; role: string; email: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { role, setRole } = useRole();
  const [username, setUsername] = useState<string>(role === 'Viewer' ? 'auditor.surveillance' : 'er.aksharma');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [department, setDepartment] = useState<string>('Jodhpur Basin - Reservoir & Production');
  const [rememberDcs, setRememberDcs] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Viewer') {
      setUsername('auditor.surveillance');
    } else {
      setUsername('er.aksharma');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setAuthError('ERROR: Engineering staff ID or username required');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    // Simulate instant SCADA token handshake
    setTimeout(() => {
      setIsAuthenticating(false);
      if (role === 'Viewer') {
        onLoginSuccess({
          name: 'Operations Auditor',
          desk: 'AUDIT-DESK',
          role: 'Viewer',
          email: 'viewer.audit@oilindia.in',
        });
      } else {
        onLoginSuccess({
          name: 'Er. A. K. Sharma',
          desk: 'DESK-04',
          role: 'Field Engineer',
          email: 'aksharma@oilindia.in',
        });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#14171A] text-[#E8E6E1] flex flex-col lg:flex-row select-none">
      {/* LEFT HALF: Full-bleed Stylized Topographic Contour Map of Thar Desert / Baghewala Lease */}
      <div className="w-full lg:w-1/2 min-h-[380px] lg:min-h-screen bg-[#14171A] border-b lg:border-b-0 lg:border-r border-[#2E343A] relative overflow-hidden flex flex-col justify-between p-6">
        {/* Topographic Background Graphic rendered strictly in #14171A and #C9B896 */}
        <div className="absolute inset-0 pointer-events-none opacity-90">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9B896" strokeWidth="0.5" strokeOpacity="0.12" />
              </pattern>
            </defs>

            {/* Base Coordinate Grid */}
            <rect width="800" height="800" fill="url(#grid-pattern)" />

            {/* Primary & Secondary Contour Elevation Curves (Thar Desert Basin Elevation) */}
            <g fill="none" stroke="#C9B896">
              {/* Outer Sand Dune Ridge Contours (Elevation +120m to +280m) */}
              <path
                d="M -100 120 C 120 180, 240 60, 420 110 C 600 160, 720 280, 900 240"
                strokeWidth="0.75"
                strokeOpacity="0.25"
              />
              <path
                d="M -100 180 C 140 230, 260 120, 440 170 C 620 220, 740 340, 900 300"
                strokeWidth="0.75"
                strokeOpacity="0.3"
              />
              <path
                d="M -100 240 C 160 280, 280 180, 460 230 C 640 280, 760 400, 900 360"
                strokeWidth="0.75"
                strokeOpacity="0.35"
              />
              
              {/* Intermediate Elevation Lines */}
              <path
                d="M -100 300 C 180 340, 300 240, 480 290 C 660 340, 780 460, 900 420"
                strokeWidth="1"
                strokeOpacity="0.45"
              />
              <path
                d="M -50 380 C 120 420, 260 320, 420 370 C 580 420, 720 540, 850 500"
                strokeWidth="0.75"
                strokeOpacity="0.4"
              />
              
              {/* Closed Subsurface Structural Topographic Loops (Baghewala Heavy Oil Reservoir Depocenter - Strictly Angular Polygons) */}
              <polygon points="180,460 430,290 680,460 430,630" strokeWidth="0.75" strokeOpacity="0.3" />
              <polygon points="230,465 440,335 650,465 440,595" strokeWidth="1" strokeOpacity="0.5" />
              <polygon points="290,470 448,375 605,470 448,565" strokeWidth="0.75" strokeOpacity="0.6" />
              <polygon points="350,472 455,410 560,472 455,535" strokeWidth="1.25" strokeOpacity="0.75" />
              <polygon points="410,475 460,445 510,475 460,505" strokeWidth="1.5" strokeOpacity="0.9" />

              {/* Lower Basin Contour Lines */}
              <path
                d="M -50 560 L 160 520 L 290 620 L 490 580 L 680 540 L 850 640"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              <path
                d="M -50 640 L 180 600 L 310 700 L 510 660 L 700 620 L 850 720"
                strokeWidth="0.75"
                strokeOpacity="0.3"
              />
              <path
                d="M -50 720 L 200 680 L 330 780 L 530 740 L 720 700 L 850 800"
                strokeWidth="0.75"
                strokeOpacity="0.25"
              />

              {/* Baghewala Petroleum Mining Lease (PML) Boundary Polygon */}
              <polygon
                points="240,280 680,310 650,680 200,640"
                strokeWidth="1.25"
                strokeOpacity="0.8"
                strokeDasharray="6,4"
              />

              {/* Grid Tick Markers & Geodetic Crosshairs */}
              <g strokeWidth="1" strokeOpacity="0.6">
                <line x1="200" y1="200" x2="200" y2="215" />
                <line x1="192" y1="208" x2="208" y2="208" />
                
                <line x1="600" y1="200" x2="600" y2="215" />
                <line x1="592" y1="208" x2="608" y2="208" />

                <line x1="200" y1="600" x2="200" y2="615" />
                <line x1="192" y1="608" x2="208" y2="608" />

                <line x1="600" y1="600" x2="600" y2="615" />
                <line x1="592" y1="608" x2="608" y2="608" />
              </g>

              {/* Well Spot Markers on Topographic Sheet (Strictly squared rects) */}
              <g stroke="#C9B896" fill="#C9B896">
                <rect x="458" y="473" width="4" height="4" fillOpacity="1" />
                <rect x="378" y="438" width="4" height="4" fillOpacity="0.9" />
                <rect x="508" y="458" width="4" height="4" fillOpacity="0.9" />
                <rect x="428" y="518" width="4" height="4" fillOpacity="0.9" />
                <rect x="478" y="408" width="4" height="4" fillOpacity="0.9" />
                <rect x="338" y="478" width="4" height="4" fillOpacity="0.75" />
                <rect x="548" y="508" width="4" height="4" fillOpacity="0.75" />
              </g>
            </g>

            {/* Topographic Elevation Index Labels (Rendered purely in sand #C9B896) */}
            <text x="50" y="248" fill="#C9B896" fillOpacity="0.6" fontSize="9" fontFamily="monospace">
              +160 m
            </text>
            <text x="50" y="308" fill="#C9B896" fillOpacity="0.7" fontSize="9" fontFamily="monospace">
              +180 m
            </text>
            <text x="50" y="388" fill="#C9B896" fillOpacity="0.7" fontSize="9" fontFamily="monospace">
              +200 m (CREST)
            </text>
            <text x="470" y="468" fill="#C9B896" fillOpacity="0.95" fontSize="10" fontFamily="monospace" fontWeight="bold">
              BGW-01 [CREST DEPOCENTER]
            </text>
            <text x="250" y="295" fill="#C9B896" fillOpacity="0.85" fontSize="9" fontFamily="monospace">
              PML BOUNDARY · BLOCK RJ-ON-90/1
            </text>
            <text x="610" y="670" fill="#C9B896" fillOpacity="0.65" fontSize="9" fontFamily="monospace">
              27°48&apos;14&quot; N / 71°45&apos;32&quot; E
            </text>
          </svg>
        </div>

        {/* Top Header of Left Half: Industrial OIL Insignia & Field Metadata */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14171A] border border-[#C9B896] flex flex-col items-center justify-center relative">
              <span className="font-bold text-xs tracking-tight text-[#C9B896] leading-none">OIL</span>
              <span className="text-[7px] font-mono text-[#C9B896] tracking-widest leading-none mt-0.5">PSU</span>
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#C9B896]" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#E8E6E1]">
                OIL INDIA LIMITED
              </div>
              <div className="text-[10px] font-mono text-[#C9B896]">
                Jodhpur Basin Directorate · Rajasthan Field Headquarters
              </div>
            </div>
          </div>
        </div>

        {/* Center / Mid Left Section: Geographic Context & Coordinate Readout */}
        <div className="relative z-10 space-y-2 max-w-sm">
          <div className="border border-[#2E343A] bg-[#14171A] p-3 space-y-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#8A8F94]">BASIN:</span>
              <span className="text-[#C9B896] font-bold">THAR DESERT (RAJASTHAN SHELF)</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#8A8F94]">PETROLEUM LEASE:</span>
              <span className="text-[#C9B896] font-bold">BAGHEWALA PML (RJ-ON-90/1)</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#8A8F94]">PAY ZONE:</span>
              <span className="text-[#E8E6E1]">JODHPUR SANDSTONE (17° API)</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#8A8F94]">SURFACE ELEVATION:</span>
              <span className="text-[#C9B896]">162 m - 214 m MSL</span>
            </div>
          </div>
        </div>

        {/* Bottom of Left Half: Cartographic Notice */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono text-[#8A8F94] border-t border-[#2E343A] pt-3">
          <span>SURVEY OF INDIA / OIL GEOLOGY REF: RAJ-BGW-TOP-04</span>
          <span className="text-[#C9B896]">SCALE 1:25,000 CONTOUR INT 10m</span>
        </div>
      </div>

      {/* RIGHT HALF: Squared-off Technical SCADA Login Panel */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#1F2428] flex flex-col justify-between p-6 lg:p-12">
        {/* Top Bar on Right: Station Node & Auth Security Status */}
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-3 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#3A5F45]" />
            <span className="text-[#8A8F94]">SCADA TERMINAL:</span>
            <span className="text-[#E8E6E1] font-semibold">BGW-ENG-WS04</span>
          </div>

          <div className="text-[#8A8F94]">
            PROTOCOL: <span className="text-[#C9B896]">DCS-TLS-1.3</span>
          </div>
        </div>

        {/* Center: The Core Technical Login Form */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          {/* Requested Single Heading: in the monospace font, no tagline, no marketing copy */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#C8551D]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F94]">
                OIL CONTROL GATEWAY
              </span>
            </div>
            <h1 className="font-mono text-base sm:text-lg font-bold text-[#E8E6E1] tracking-tight">
              Digital Twin — Well to Surface Optimization Platform
            </h1>
          </div>

          {/* Error Banner if any */}
          {authError && (
            <div className="border border-[#8C2F2F] bg-[#14171A] p-2.5 flex items-center gap-2 text-xs font-mono text-[#E8E6E1]">
              <div className="w-2 h-2 bg-[#8C2F2F] shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Locked Field Selector (Field: Baghewala PML) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8A8F94]">
                ASSET FIELD SELECTION (LOCKED)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="Field: Baghewala PML"
                  className="w-full bg-[#14171A] border border-[#2E343A] text-xs font-mono text-[#C9B896] font-bold px-3 py-2 outline-none cursor-not-allowed select-none"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-[9px] font-mono uppercase text-[#3A5F45] font-bold">LOCKED</span>
                  <Lock strokeWidth={1.25} className="w-3.5 h-3.5 text-[#3A5F45]" />
                </div>
              </div>
              <p className="text-[9px] font-mono text-[#8A8F94]">
                Asset fixed to Rajasthan heavy oil sector. Jodhpur formation wells 01–35.
              </p>
            </div>

            {/* Field: Role-Based Access Selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8A8F94]">
                AUTHENTICATED ACCESS ROLE
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('Field Engineer')}
                  className={`p-2 border text-left font-mono transition-none cursor-pointer flex flex-col justify-between ${
                    role === 'Field Engineer'
                      ? 'border-[#3A5F45] bg-[#14171A] ring-1 ring-[#3A5F45]'
                      : 'border-[#2E343A] bg-[#191D21] opacity-60 hover:opacity-100'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4E9B68] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      FIELD ENGINEER
                    </span>
                    {role === 'Field Engineer' && (
                      <span className="w-1.5 h-1.5 bg-[#4E9B68]" />
                    )}
                  </div>
                  <span className="text-[9px] text-[#8A8F94] mt-1 leading-tight">
                    Full Telemetry &amp; Apply Recommendations Enabled
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('Viewer')}
                  className={`p-2 border text-left font-mono transition-none cursor-pointer flex flex-col justify-between ${
                    role === 'Viewer'
                      ? 'border-[#D96B27] bg-[#14171A] ring-1 ring-[#D96B27]'
                      : 'border-[#2E343A] bg-[#191D21] opacity-60 hover:opacity-100'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D96B27] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      VIEWER (AUDITOR)
                    </span>
                    {role === 'Viewer' && (
                      <span className="w-1.5 h-1.5 bg-[#D96B27]" />
                    )}
                  </div>
                  <span className="text-[9px] text-[#8A8F94] mt-1 leading-tight">
                    Read-Only SCADA &amp; Inspection (Apply Disabled)
                  </span>
                </button>
              </div>
            </div>

            {/* Field 2: Username / Engineering ID */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8A8F94]">
                ENGINEERING STAFF ID / USERNAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. er.aksharma"
                  className="w-full bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] text-xs font-mono text-[#E8E6E1] px-3 py-2 outline-none transition-none"
                  autoComplete="username"
                  required
                />
                <div className="absolute right-3 top-2.5 text-[#8A8F94] pointer-events-none">
                  <User strokeWidth={1.25} className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Field 3: Password / Security Key */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8A8F94]">
                SECURITY TOKEN / PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] text-xs font-mono text-[#E8E6E1] px-3 py-2 outline-none tracking-widest transition-none"
                  autoComplete="current-password"
                  required
                />
                <div className="absolute right-3 top-2.5 text-[#8A8F94] pointer-events-none">
                  <Key strokeWidth={1.25} className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Checkbox: Retain DCS Station Context */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[10px] font-mono text-[#8A8F94]">
                <input
                  type="checkbox"
                  checked={rememberDcs}
                  onChange={(e) => setRememberDcs(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-3.5 h-3.5 border ${rememberDcs ? 'bg-[#C8551D] border-[#C8551D]' : 'bg-[#14171A] border-[#2E343A]'} flex items-center justify-center`}>
                  {rememberDcs && <span className="text-[10px] font-bold text-[#E8E6E1] leading-none">✓</span>}
                </div>
                <span>MAINTAIN SCADA OPERATOR LEASE</span>
              </label>

              <span className="text-[10px] font-mono text-[#C9B896]">
                AUTH: LDAP / SMART-CARD
              </span>
            </div>

            {/* Submit Action Button: Sole Accent Color #C8551D, Strictly Squared */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-[#C8551D] hover:bg-[#B24816] active:bg-[#9A3D11] text-[#E8E6E1] border border-[#C8551D] text-xs font-mono font-bold tracking-widest uppercase transition-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-2 h-2 bg-[#E8E6E1]" />
                  <span>INITIALIZING SCADA TWIN LINK...</span>
                </>
              ) : (
                <>
                  <ShieldCheck strokeWidth={1.25} className="w-4 h-4" />
                  <span>AUTHENTICATE &amp; ENTER CONTROL ROOM</span>
                </>
              )}
            </button>
          </form>

          {/* Engineering Station Quick Login Helper / Credentials Info */}
          <div className="border border-[#2E343A] bg-[#14171A] p-3 space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-[#8A8F94]">
              <span className="text-[#C9B896] font-bold uppercase">AUTHORIZED ROLES:</span>
              <span>OIL JODHPUR BASIN</span>
            </div>
            <div className="text-[#8A8F94] leading-relaxed">
              Default technical access pre-configured for:
              <br />
              <span className="text-[#E8E6E1] font-bold">Operator:</span> Er. A. K. Sharma (Sr. Reservoir &amp; Production)
              <br />
              <span className="text-[#E8E6E1] font-bold">Field Asset:</span> Baghewala Heavy Oil Field (PML)
            </div>
          </div>
        </div>

        {/* Bottom Status Footer of Right Half */}
        <div className="border-t border-[#2E343A] pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[9px] font-mono text-[#8A8F94]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
            <span>DGMS &amp; OIL SAFETY STANDARD COMPLIANT</span>
          </div>
          <div className="text-[#8A8F94] mt-1 sm:mt-0">
            SYSTEM NODE: <span className="text-[#C9B896]">IN-RAJ-BGW-DCS01</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
