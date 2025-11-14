'use client';

import { Building2 } from 'lucide-react';

interface HospitalHeaderProps {
  hospitalName?: string;
  trustName?: string;
  logoUrl?: string;
  department?: string;
  showNHSLogo?: boolean;
}

export default function HospitalHeader({
  hospitalName = process.env.NEXT_PUBLIC_HOSPITAL_NAME,
  trustName = process.env.NEXT_PUBLIC_TRUST_NAME,
  logoUrl = process.env.NEXT_PUBLIC_HOSPITAL_LOGO_URL,
  department = process.env.NEXT_PUBLIC_DEPARTMENT_NAME || 'Theatre Operations',
  showNHSLogo = true,
}: HospitalHeaderProps) {
  // If no hospital info provided, return minimal header
  if (!hospitalName && !trustName) {
    return (
      <div className="bg-[#005EB8] text-white p-4 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-semibold">TOM</h1>
              <p className="text-xs text-blue-100">Theatre Operations Manager</p>
            </div>
          </div>
          {showNHSLogo && (
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight">NHS</div>
              <div className="text-xs text-blue-100">National Health Service</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#005EB8] text-white border-b-4 border-[#FFB81C]">
      {/* Top bar with NHS logo */}
      {showNHSLogo && (
        <div className="bg-[#003087] py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-xl font-bold tracking-tight">NHS</div>
            <div className="text-xs text-blue-200">{trustName || 'NHS Trust'}</div>
          </div>
        </div>
      )}

      {/* Main header with hospital info */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Hospital Logo */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${hospitalName} logo`}
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
            ) : (
              <div className="bg-white rounded-lg p-2">
                <Building2 className="w-8 h-8 text-[#005EB8]" />
              </div>
            )}

            {/* Hospital Name */}
            <div>
              <h1 className="text-xl font-semibold">{hospitalName}</h1>
              <p className="text-sm text-blue-100">{department}</p>
            </div>
          </div>

          {/* TOM Badge */}
          <div className="text-right">
            <div className="bg-[#FFB81C] text-[#005EB8] px-4 py-2 rounded-lg font-bold text-lg">
              TOM
            </div>
            <div className="text-xs text-blue-100 mt-1">AI Assistant</div>
          </div>
        </div>
      </div>
    </div>
  );
}
