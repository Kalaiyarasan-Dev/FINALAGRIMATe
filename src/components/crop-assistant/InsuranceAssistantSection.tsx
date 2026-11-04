import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Calculator, 
  ExternalLink, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Coins, 
  Landmark, 
  HelpCircle, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CROP_INSURANCE_SCHEMES, 
  InsuranceSchemeDetail, 
  calculateStatutoryCropPremium,
  PremiumCalculationResult 
} from '@/services/insuranceService';
import { POPULAR_DISTRICTS, MONITORED_CROPS } from '@/services/weatherService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const InsuranceAssistantSection: React.FC = () => {
  const { isTamil, language } = useLanguage();

  // Selection Matrix
  const [selectedState, setSelectedState] = useState<string>('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Thanjavur');
  const [selectedCrop, setSelectedCrop] = useState<string>('Paddy / Rice');
  const [selectedSeason, setSelectedSeason] = useState<'Kharif' | 'Rabi' | 'Summer / Zaid'>('Kharif');
  const [landAcres, setLandAcres] = useState<number>(2.5);

  // Active Tab: 'schemes' or 'calculator' or 'status_guide'
  const [activeTab, setActiveTab] = useState<'schemes' | 'calculator' | 'status_guide'>('schemes');
  const [selectedScheme, setSelectedScheme] = useState<InsuranceSchemeDetail>(CROP_INSURANCE_SCHEMES[0]);

  // Premium calculation
  const premiumCalc = calculateStatutoryCropPremium(selectedCrop, selectedSeason, landAcres);

  return (
    <div className="space-y-6">
      {/* Verification & Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-primary/10 to-blue-600/10 rounded-2xl p-4 border border-primary/20 flex items-start gap-3 shadow-soft">
        <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0 mt-0.5">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h3 className={cn("text-sm font-bold text-foreground", isTamil && "font-tamil")}>
            {isTamil ? 'அரசு மற்றும் தனியார் பயிர் காப்பீட்டு வழிகாட்டி' : 'Government & Private Crop Insurance Assistant'}
          </h3>
          <p className={cn("text-xs text-muted-foreground mt-0.5 leading-relaxed", isTamil && "font-tamil")}>
            {isTamil
              ? 'மத்திய வேளாண் அமைச்சகத்தின் PMFBY வழிகாட்டுதல்கள் மற்றும் அதிகாரப்பூர்வ தரவுகள் அடிப்படையில் சரிபார்க்கப்பட்ட தகவல்கள்.'
              : 'Verified statutory scheme provisions, premium rate structures, and official helplines from the Ministry of Agriculture & Farmers Welfare.'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {isTamil ? 'சரிபார்க்கப்பட்ட அரசு விதிகள்' : 'Govt Operational Guidelines 2026'}
            </span>
            <span>•</span>
            <span>{isTamil ? 'கட்டணமில்லா உதவி எண்: 14447' : 'Toll-Free Helpline: 14447'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex rounded-xl bg-muted p-1 border border-border">
        <button
          onClick={() => setActiveTab('schemes')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
            activeTab === 'schemes' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isTamil ? 'காப்பீட்டுத் திட்டங்கள் (டாஷ்போர்டு)' : 'Insurance Schemes Dashboard'}
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
            activeTab === 'calculator' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isTamil ? 'பிரீமியம் கணக்கீடு (மானிய விகிதம்)' : 'Statutory Premium Calculator'}
        </button>
        <button
          onClick={() => setActiveTab('status_guide')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
            activeTab === 'status_guide' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isTamil ? 'பாலிசி & க்ளைம் சரிபார்ப்பு' : 'Policy & Claim Tracking Guide'}
        </button>
      </div>

      {/* 1. SCHEMES DASHBOARD */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Scheme Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CROP_INSURANCE_SCHEMES.map(scheme => {
              const isSelected = selectedScheme.id === scheme.id;
              return (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer touch-feedback relative flex flex-col justify-between",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-soft ring-1 ring-primary/40" 
                      : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        scheme.type === 'central_govt' ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                        scheme.type === 'state_govt' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      )}>
                        {scheme.shortName}
                      </span>
                      <span className="text-[11px] font-bold text-primary">
                        {scheme.helplinePhone}
                      </span>
                    </div>

                    <h4 className={cn("text-sm font-bold text-foreground", isTamil && "font-tamil")}>
                      {isTamil ? scheme.nameTa : scheme.nameEn}
                    </h4>

                    <p className={cn("text-xs text-muted-foreground mt-1 line-clamp-2", isTamil && "font-tamil")}>
                      {isTamil ? scheme.descriptionTa : scheme.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>{isTamil ? 'முழு விவரங்கள் காண்க' : 'View Scheme Provisions'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Selected Scheme Detail Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-6">
            <div className="pb-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {isTamil ? selectedScheme.authorityTa : selectedScheme.authorityEn}
                </span>
                <h3 className={cn("text-lg font-bold text-foreground mt-0.5", isTamil && "font-tamil")}>
                  {isTamil ? selectedScheme.nameTa : selectedScheme.nameEn}
                </h3>
              </div>

              <a
                href={selectedScheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-95 touch-feedback"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isTamil ? 'அதிகாரப்பூர்வ போர்டல்' : 'Official Portal'}
              </a>
            </div>

            {/* Premium Rate Card */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
              <span className={cn("text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <Coins className="w-4 h-4" />
                {isTamil ? 'விவசாயிகளுக்கான சட்டப்பூர்வ பிரீமியம் மற்றும் மானியம்:' : 'Statutory Farmer Premium Rates & Subsidies:'}
              </span>
              <p className={cn("text-xs text-foreground/90 leading-relaxed font-medium", isTamil && "font-tamil")}>
                {isTamil ? selectedScheme.farmerPremiumRateTa : selectedScheme.farmerPremiumRateEn}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground">
                <div className="p-2 rounded bg-background/60">
                  <span className="font-semibold block text-foreground">Kharif Food/Oilseed:</span>
                  {selectedScheme.premiumRules.kharifFoodOilseeds}
                </div>
                <div className="p-2 rounded bg-background/60">
                  <span className="font-semibold block text-foreground">Rabi Food/Oilseed:</span>
                  {selectedScheme.premiumRules.rabiFoodOilseeds}
                </div>
                <div className="p-2 rounded bg-background/60">
                  <span className="font-semibold block text-foreground">Commercial/Horti:</span>
                  {selectedScheme.premiumRules.annualCommercialHorticultural}
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-2">
              <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isTamil ? 'யாரெல்லாம் விண்ணப்பிக்க தகுதியானவர்கள்?' : 'Eligibility Criteria:'}
              </h4>
              <ul className="space-y-1.5 pl-2">
                {(isTamil ? selectedScheme.eligibilityTa : selectedScheme.eligibilityEn).map((el, idx) => (
                  <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coverage Scopes */}
            <div className="space-y-2">
              <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <ShieldCheck className="w-4 h-4 text-primary" />
                {isTamil ? 'காப்பீட்டு பாதுகாப்பு நிலைகள் (Coverage):' : 'Risk & Calamity Coverage Stages:'}
              </h4>
              <ul className="space-y-1.5 pl-2">
                {(isTamil ? selectedScheme.coverageScopesTa : selectedScheme.coverageScopesEn).map((cov, idx) => (
                  <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{cov}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Application Steps */}
            <div className="space-y-3">
              <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <FileText className="w-4 h-4 text-sky-600" />
                {isTamil ? 'விண்ணப்பிக்கும் வழிமுறைகள் (படி வாரியாக):' : 'Step-by-Step Application Process:'}
              </h4>
              <div className="space-y-2.5">
                {(isTamil ? selectedScheme.applicationStepsTa : selectedScheme.applicationStepsEn).map(st => (
                  <div key={st.step} className="p-3 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {st.step}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold text-foreground", isTamil && "font-tamil")}>{st.title}</p>
                      <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>{st.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                {isTamil ? 'தேவையான ஆவணங்கள் பட்டியல்:' : 'Mandatory Documents Checklist:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isTamil ? selectedScheme.requiredDocumentsTa : selectedScheme.requiredDocumentsEn).map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-background border border-border flex items-center gap-2 text-xs text-foreground">
                    <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    <span className={cn(isTamil && "font-tamil")}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Dates */}
            <div className="space-y-2">
              <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
                <Calendar className="w-4 h-4 text-orange-600" />
                {isTamil ? 'முக்கிய காலக்கெடு தேதிகள்:' : 'Important Scheme Deadlines:'}
              </h4>
              <ul className="space-y-1.5 pl-2">
                {(isTamil ? selectedScheme.importantDatesTa : selectedScheme.importantDatesEn).map((d, idx) => (
                  <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Helpline Contacts */}
            <div className="p-4 rounded-xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className={cn("text-xs font-bold text-foreground block", isTamil && "font-tamil")}>
                  {isTamil ? 'உதவி மற்றும் ஆலோசனை மையம்:' : 'Official Helpline Support:'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedScheme.helplineName}
                </span>
              </div>
              <a
                href={`tel:${selectedScheme.helplinePhone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-feedback shadow-sm self-start sm:self-auto"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {selectedScheme.helplinePhone}
              </a>
            </div>

            {/* Source Citation */}
            <div className="text-[11px] text-muted-foreground pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <span>Source: {selectedScheme.sourceAttributionEn}</span>
              <span>Status: {selectedScheme.lastVerifiedDate}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATUTORY PREMIUM CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className={cn("text-base font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
              <Calculator className="w-5 h-5 text-primary" />
              {isTamil ? 'PMFBY சட்டப்பூர்வ பிரீமியம் மற்றும் அரசு மானிய கணக்கீடு' : 'Statutory PMFBY Premium & Subsidy Calculator'}
            </h3>
            <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>
              {isTamil 
                ? 'உங்கள் பயிர், பருவம் மற்றும் நில அளவை உள்ளிட்டு விவசாயி பங்கு மற்றும் அரசு மானியத்தை துல்லியமாக கணக்கிடுங்கள்.' 
                : 'Calculate your exact subsidized farmer share versus central/state government subsidy as per operational guidelines.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Crop */}
            <div>
              <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                {isTamil ? 'பயிர்' : 'Crop'}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {MONITORED_CROPS.map(c => (
                  <option key={c.id} value={c.nameEn}>
                    {isTamil ? c.nameTa : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                {isTamil ? 'பருவம்' : 'Season'}
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Kharif">{isTamil ? 'காரிப் (Kharif - ஆடிப் பட்டம்)' : 'Kharif'}</option>
                <option value="Rabi">{isTamil ? 'ரபி (Rabi - சம்பா / கார்த்திகைப் பட்டம்)' : 'Rabi'}</option>
                <option value="Summer / Zaid">{isTamil ? 'கோடை / சம்மர்' : 'Summer / Zaid'}</option>
              </select>
            </div>

            {/* Acreage */}
            <div>
              <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                {isTamil ? 'நில அளவு (ஏக்கர்)' : 'Cultivated Area (Acres)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={landAcres}
                onChange={(e) => setLandAcres(Math.max(0.1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                {isTamil ? 'மாநிலம்' : 'State'}
              </label>
              <input
                type="text"
                disabled
                value={selectedState}
                className="w-full px-3 py-2 rounded-xl border border-input bg-muted text-xs text-foreground font-medium"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div>
                <span className="text-xs font-bold text-muted-foreground">
                  {premiumCalc.statutoryCategory}
                </span>
                <p className="text-sm font-bold text-foreground">
                  {landAcres} Acres of {selectedCrop} ({selectedSeason})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">
                  {isTamil ? 'மொத்த காப்பீட்டுத் தொகை (Sum Insured)' : 'Total Sum Insured'}
                </span>
                <span className="text-base font-extrabold text-foreground">
                  ₹{premiumCalc.totalSumInsured.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farmer Share */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className={cn("text-xs font-bold text-emerald-800 dark:text-emerald-300 block", isTamil && "font-tamil")}>
                  {isTamil ? 'விவசாயி செலுத்த வேண்டிய பிரீமியம்:' : 'Farmer Subsidized Premium to Pay:'}
                </span>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  ₹{premiumCalc.farmerShareAmount.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                  {premiumCalc.farmerRatePercent}% of Sum Insured (Statutory Cap)
                </p>
              </div>

              {/* Govt Subsidy Share */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className={cn("text-xs font-bold text-blue-800 dark:text-blue-300 block", isTamil && "font-tamil")}>
                  {isTamil ? 'அரசு செலுத்தும் மானியத் தொகை (50:50):' : 'Central + State Government Subsidy:'}
                </span>
                <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">
                  ₹{premiumCalc.govtSubsidyAmount.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {premiumCalc.govtSubsidyPercent}% subsidized by Government
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/80 border border-border text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Official Verification Notice: </span>
              {premiumCalc.officialSourceCitation}. The farmer share is statutorily capped at 2.0% for Kharif food/oilseeds, 1.5% for Rabi food/oilseeds, and 5.0% for commercial/horticultural crops.
            </div>
          </div>
        </div>
      )}

      {/* 3. POLICY & CLAIM TRACKING GUIDE */}
      {activeTab === 'status_guide' && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
          <div className="pb-3 border-b border-border">
            <h3 className={cn("text-base font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
              <CheckCircle2 className="w-5 h-5 text-primary" />
              {isTamil ? 'பயிர்க்காப்பீட்டு விண்ணப்பம் & பாலிசி நிலவரம் அறிவது எப்படி?' : 'How to Check PMFBY Application & Policy Status'}
            </h3>
            <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>
              {isTamil 
                ? 'உங்கள் விண்ணப்ப ரசீது எண் கொண்டு அதிகாரப்பூர்வ போர்டலில் நிலவரத்தை சரிபார்க்கும் வழிகாட்டி' 
                : 'Follow verified steps to track enrollment approval, premium deduction, and claim settlement status.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <p className={cn("text-xs font-bold text-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'அதிகாரப்பூர்வ போர்டலுக்கு செல்லவும்' : 'Visit the National PMFBY Portal'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Navigate to <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://pmfby.gov.in</a> or download the "Crop Insurance" (Krishi Rakshak) mobile app.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <p className={cn("text-xs font-bold text-foreground", isTamil && "font-tamil")}>
                  {isTamil ? '"Application Status" என்பதை கிளிக் செய்யவும்' : 'Click "Application Status"'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  On the home page, select the "Application Status" button (or "Check Status" in the mobile app).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <p className={cn("text-xs font-bold text-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'விண்ணப்ப ரசீது எண் மற்றும் கேப்ட்சா உள்ளிடவும்' : 'Enter 16-Digit Receipt / Application Number & Captcha'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter the receipt reference provided by your CSC, bank branch, or online portal submission.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <p className={cn("text-xs font-bold text-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'காப்பீட்டு ஒப்புதல் மற்றும் இழப்பீட்டு வரவு சரிபார்க்கவும்' : 'View Approval, Policy PDF, and Claim Status'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The screen displays whether the policy certificate is generated, bank account validated, and details of any claim DBT transfer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className={cn("text-xs font-bold text-foreground block", isTamil && "font-tamil")}>
                {isTamil ? 'விண்ணப்பம் நிலுவையில் உள்ளதா அல்லது நிராகரிக்கப்பட்டதா?' : 'Need Help with a Delayed or Rejected Policy?'}
              </span>
              <span className="text-xs text-muted-foreground">
                Call the PMFBY Central Grievance Helpline at 14447 or your District Lead Bank Officer.
              </span>
            </div>
            <a
              href="tel:14447"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm self-start sm:self-auto touch-feedback"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              14447 (Toll-Free)
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
