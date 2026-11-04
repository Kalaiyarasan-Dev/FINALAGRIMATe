import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Printer, 
  Download, 
  Loader2, 
  ShieldAlert, 
  Calendar,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  DamageReportPayload, 
  DamageReportRecord, 
  submitCropDamageReport, 
  getSavedDamageReports, 
  getClaimGuidance, 
  DAMAGE_CATEGORIES, 
  INSURANCE_SCHEME_OPTIONS 
} from '@/services/damageReportingService';
import { POPULAR_DISTRICTS, MONITORED_CROPS } from '@/services/weatherService';
import { validateCropImage, fileToBase64 } from '@/services/cropProtectionService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const DamageReportingSection: React.FC = () => {
  const { isTamil, language } = useLanguage();

  // Mode: 'new_report' or 'submitted_reports'
  const [activeView, setActiveView] = useState<'new_report' | 'submitted_reports'>('new_report');

  // Form Fields
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [district, setDistrict] = useState<string>('Thanjavur');
  const [village, setVillage] = useState<string>('');
  const [surveyNumber, setSurveyNumber] = useState<string>('');
  
  const [cropName, setCropName] = useState<string>('Paddy / Rice');
  const [cropVariety, setCropVariety] = useState<string>('');
  const [affectedAreaAcres, setAffectedAreaAcres] = useState<string>('2.0');
  const [totalAreaAcres, setTotalAreaAcres] = useState<string>('3.5');
  
  const [insuranceScheme, setInsuranceScheme] = useState<string>('PMFBY');
  const [policyOrApplicationNumber, setPolicyOrApplicationNumber] = useState<string>('');
  const [damageCategory, setDamageCategory] = useState<string>('flood');
  const [damageDate, setDamageDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  // Photos
  const [damageImages, setDamageImages] = useState<string[]>([]);
  const [fieldImages, setFieldImages] = useState<string[]>([]);
  const damageFileInputRef = useRef<HTMLInputElement>(null);
  const fieldFileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSlip, setSubmittedSlip] = useState<DamageReportRecord | null>(null);
  const [savedReports, setSavedReports] = useState<DamageReportRecord[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  // Dynamic Nuanced Guidance
  const claimGuidance = getClaimGuidance(damageCategory, insuranceScheme);

  useEffect(() => {
    if (activeView === 'submitted_reports') {
      loadPastReports();
    }
  }, [activeView]);

  const loadPastReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await getSavedDamageReports();
      setSavedReports(reports);
    } catch (err) {
      console.warn('Error loading reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'field') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateCropImage(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid image');
        return;
      }

      try {
        const b64 = await fileToBase64(file);
        if (type === 'damage') {
          setDamageImages(prev => [...prev.slice(-3), b64]); // Keep max 4 images
        } else {
          setFieldImages(prev => [...prev.slice(-3), b64]);
        }
      } catch (err) {
        toast.error('Failed to read image');
      }
    }

    toast.success(isTamil ? 'புகைப்படம் வெற்றிகரமாக சேர்க்கப்பட்டது' : 'Photograph attached successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerName.trim() || !farmerPhone.trim() || !village.trim() || !affectedAreaAcres) {
      toast.error(isTamil ? 'அனைத்து கட்டாய விவரங்களையும் நிரப்பவும்' : 'Please fill all mandatory fields (Name, Phone, Village, Affected Area)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: DamageReportPayload = {
        farmerName,
        farmerPhone,
        state,
        district,
        village,
        surveyNumber,
        cropName,
        cropVariety,
        affectedAreaAcres,
        totalAreaAcres,
        insuranceScheme,
        policyOrApplicationNumber,
        damageCategory,
        damageDate,
        description,
        damageImages,
        fieldImages,
        intimationChannel: 'Vivasayi Genz Portal'
      };

      const result = await submitCropDamageReport(payload);
      if (result.success && result.record) {
        setSubmittedSlip(result.record);
        toast.success(isTamil ? `சேத அறிவிப்பு பதிவு செய்யப்பட்டது! குறிப்பு எண்: ${result.reportNumber}` : `Claim intimation registered! Ref: ${result.reportNumber}`);
        setTimeout(() => {
          document.getElementById('intimation-slip-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        toast.error(result.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit crop damage report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex rounded-xl bg-muted p-1 border border-border">
        <button
          onClick={() => setActiveView('new_report')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
            activeView === 'new_report' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isTamil ? 'புதிய பயிர் சேத அறிக்கை பதிவு' : 'New Damage Intimation'}
        </button>
        <button
          onClick={() => setActiveView('submitted_reports')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
            activeView === 'submitted_reports' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isTamil ? 'பதிவு செய்யப்பட்ட அறிக்கைகள்' : 'My Submitted Reports'}
        </button>
      </div>

      {activeView === 'new_report' ? (
        <div className="space-y-6">
          {/* Dynamic Claim Guidance Box (Shows exact deadline rules based on selection) */}
          <div className={cn(
            "p-5 rounded-2xl border transition-all space-y-3 shadow-soft",
            claimGuidance.deadlineType === 'strict_72h' && "bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800",
            claimGuidance.deadlineType === 'policy_specific' && "bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800",
            claimGuidance.deadlineType === 'automatic_cce' && "bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-xl text-white flex-shrink-0 mt-0.5",
                claimGuidance.deadlineType === 'strict_72h' && "bg-rose-600",
                claimGuidance.deadlineType === 'policy_specific' && "bg-amber-600",
                claimGuidance.deadlineType === 'automatic_cce' && "bg-blue-600"
              )}>
                {claimGuidance.deadlineType === 'strict_72h' ? <Clock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    claimGuidance.deadlineType === 'strict_72h' && "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
                    claimGuidance.deadlineType === 'policy_specific' && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                    claimGuidance.deadlineType === 'automatic_cce' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}>
                    {claimGuidance.deadlineType === 'strict_72h' ? (isTamil ? '72 மணி நேர காலக்கெடு' : '72-Hour Rule Applies') :
                     claimGuidance.deadlineType === 'policy_specific' ? (isTamil ? 'பாலிசி குறிப்பிட்ட காலக்கெடு' : 'Policy-Specific Deadline') :
                     (isTamil ? 'பருவ முடிவில் தானியங்கி CCE இழப்பீடு' : 'Automatic CCE Settlement')}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    PMFBY & IRDAI Verified Rules
                  </span>
                </div>

                <h4 className={cn("text-sm font-bold text-foreground mt-1.5", isTamil && "font-tamil")}>
                  {isTamil ? 'பயிர்க்காப்பீட்டு அறிவிப்பு காலக்கெடு மற்றும் வழிகாட்டுதல்:' : 'Mandatory Claim Intimation Deadline:'}
                </h4>
                <p className={cn("text-xs font-bold text-foreground mt-0.5", isTamil && "font-tamil")}>
                  {isTamil ? claimGuidance.intimationDeadlineTa : claimGuidance.intimationDeadlineEn}
                </p>

                <p className={cn("text-xs text-muted-foreground mt-1 leading-relaxed", isTamil && "font-tamil")}>
                  {isTamil ? claimGuidance.importantNotesTa : claimGuidance.importantNotesEn}
                </p>
              </div>
            </div>

            {/* Quick Authority & Submission Channels */}
            <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className={cn("font-bold text-foreground block mb-1", isTamil && "font-tamil")}>
                  {isTamil ? 'அறிவிக்க வேண்டிய பொறுப்பு ஆணையம்:' : 'Designated Authority:'}
                </span>
                <p className="text-muted-foreground">
                  {isTamil ? claimGuidance.reportingAuthorityTa : claimGuidance.reportingAuthorityEn}
                </p>
              </div>
              <div>
                <span className={cn("font-bold text-foreground block mb-1", isTamil && "font-tamil")}>
                  {isTamil ? 'அறிவிக்கக்கூடிய வழிகள்:' : 'Official Intimation Channels:'}
                </span>
                <p className="text-muted-foreground line-clamp-2">
                  {(isTamil ? claimGuidance.submissionChannelsTa : claimGuidance.submissionChannelsEn).join(' • ')}
                </p>
              </div>
            </div>
          </div>

          {/* Damage Reporting Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-6">
            <h3 className={cn("text-base font-bold text-foreground pb-3 border-b border-border flex items-center gap-2", isTamil && "font-tamil")}>
              <FileText className="w-5 h-5 text-primary" />
              {isTamil ? 'பயிர் சேத விவரங்களை பதிவு செய்தல்' : 'Crop Damage Intimation Form'}
            </h3>

            {/* Section 1: Farmer & Land Details */}
            <div className="space-y-4">
              <span className={cn("text-xs font-bold text-primary uppercase tracking-wider block", isTamil && "font-tamil")}>
                {isTamil ? '1. விவசாயி மற்றும் நில விவரங்கள்' : '1. Farmer & Land Details'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'விவசாயி பெயர் *' : 'Farmer Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isTamil ? 'எ.கா. காளியப்பன்' : 'e.g. Ramesh Kumar'}
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'செல்போன் எண் (ஆதார் இணைக்கப்பட்டது) *' : 'Mobile Number (Aadhaar Linked) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'மாவட்டம் *' : 'District *'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {POPULAR_DISTRICTS.map(d => (
                      <option key={d.district} value={d.district}>
                        {isTamil ? d.districtTa : d.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'வருவாய் கிராமம் / வட்டம் *' : 'Revenue Village & Taluk *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isTamil ? 'எ.கா. திருவையாரூர், மேலையூர்' : 'e.g. Melaiyur, Thiruvaiyaru'}
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'சர்வே எண் / உட்பிரிவு' : 'Survey No. / Sub-division'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 142/3B"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Crop & Damage Details */}
            <div className="space-y-4 pt-3 border-t border-border">
              <span className={cn("text-xs font-bold text-primary uppercase tracking-wider block", isTamil && "font-tamil")}>
                {isTamil ? '2. பயிர் மற்றும் சேத விவரங்கள்' : '2. Crop & Incident Information'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'பயிர் பெயர் *' : 'Crop Name *'}
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {MONITORED_CROPS.map(c => (
                      <option key={c.id} value={c.nameEn}>
                        {isTamil ? c.nameTa : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'சேத வகை *' : 'Type of Damage *'}
                  </label>
                  <select
                    value={damageCategory}
                    onChange={(e) => setDamageCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {DAMAGE_CATEGORIES.map(dc => (
                      <option key={dc.id} value={dc.id}>
                        {isTamil ? dc.ta : dc.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'பேரிடர் / சேதம் நிகழ்ந்த தேதி *' : 'Date of Calamity / Damage *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={damageDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDamageDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'பாதிக்கப்பட்ட நிலப்பரப்பு (ஏக்கர்) *' : 'Affected Area (Acres) *'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={affectedAreaAcres}
                    onChange={(e) => setAffectedAreaAcres(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'காப்பீட்டுத் திட்டம் / நிறுவனம் *' : 'Insurance Scheme / Insurer *'}
                  </label>
                  <select
                    value={insuranceScheme}
                    onChange={(e) => setInsuranceScheme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {INSURANCE_SCHEME_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                    {isTamil ? 'பாலிசி / விண்ணப்ப எண் (தெரிந்தால்)' : 'Policy / Application Receipt No.'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0402262400123456"
                    value={policyOrApplicationNumber}
                    onChange={(e) => setPolicyOrApplicationNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className={cn("block text-xs font-semibold text-foreground mb-1", isTamil && "font-tamil")}>
                  {isTamil ? 'சேதத்தின் விவரம் மற்றும் தற்போதைய கள நிலைமை *' : 'Description of Incident & Field Damage *'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={isTamil 
                    ? 'தொடர் கனமழை காரணமாக வயலில் 3 அடிக்கு மேல் நீர் தேங்கி பயிர்கள் முழுமையாக மூழ்கியுள்ளன...' 
                    : 'Describe the depth of inundation, crop submergence, lodging, or hailstorm physical damage in detail...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Evidence Photograph Upload */}
            <div className="space-y-4 pt-3 border-t border-border">
              <span className={cn("text-xs font-bold text-primary uppercase tracking-wider block", isTamil && "font-tamil")}>
                {isTamil ? '3. கள ஆய்வு புகைப்படங்கள் (சான்றாதாரங்கள்)' : '3. Evidence Photographs (Crop & Field)'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop Damage Photos */}
                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                    {isTamil ? 'சேதமடைந்த பயிர் நெருக்கப் படங்கள் (Close-up)' : 'Close-up Crop Damage Photos'}
                  </label>
                  <input
                    type="file"
                    ref={damageFileInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, 'damage')}
                    className="hidden"
                  />
                  <div
                    onClick={() => damageFileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/20"
                  >
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{isTamil ? 'பயிர் படம் சேர்க்க' : 'Add Crop Photos (JPEG/PNG)'}</span>
                  </div>

                  {damageImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto py-1">
                      {damageImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img src={img} alt="Damage" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setDamageImages(damageImages.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wide Field Photos */}
                <div>
                  <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
                    {isTamil ? 'வயல் முழுமைப் படங்கள் (Landscape/Field view)' : 'Wide Field Overview Photos'}
                  </label>
                  <input
                    type="file"
                    ref={fieldFileInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, 'field')}
                    className="hidden"
                  />
                  <div
                    onClick={() => fieldFileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/20"
                  >
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{isTamil ? 'வயல் படம் சேர்க்க' : 'Add Field Photos (JPEG/PNG)'}</span>
                  </div>

                  {fieldImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto py-1">
                      {fieldImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img src={img} alt="Field" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFieldImages(fieldImages.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-feedback disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className={cn(isTamil && "font-tamil")}>
                    {isTamil ? 'சேத அறிவிப்பு பதிவு செய்யப்படுகிறது...' : 'Registering Claim Intimation...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  <span className={cn(isTamil && "font-tamil")}>
                    {isTamil ? 'சேத அறிவிப்பை சமர்ப்பித்து ரசீது பெறுக' : 'Submit Damage Intimation & Generate Formal Slip'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Result Anchor */}
          <div id="intimation-slip-anchor" />

          {/* Generated Claim Intimation Slip */}
          {submittedSlip && (
            <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-soft space-y-6 print:border-none print:shadow-none animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      {isTamil ? 'அறிவிப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது' : 'Intimation Formally Registered'}
                    </span>
                    <h3 className={cn("text-lg font-bold text-foreground mt-0.5", isTamil && "font-tamil")}>
                      {isTamil ? 'பயிர் சேத அறிவிப்பு ஒப்புகை ரசீது' : 'Official Crop Damage Intimation Slip'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintSlip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold touch-feedback border border-border"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {isTamil ? 'அச்சிடுக / பதிவிறக்கு' : 'Print / Save PDF'}
                  </button>
                </div>
              </div>

              {/* Reference ID banner */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {isTamil ? 'அதிகாரப்பூர்வ சேத அறிவிப்பு எண் (Reference Number):' : 'Authoritative Intimation Reference Number:'}
                  </span>
                  <span className="text-base font-extrabold text-primary font-mono tracking-wider">
                    {submittedSlip.reportNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Status:</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                    {submittedSlip.status}
                  </span>
                </div>
              </div>

              {/* Slip Data Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Farmer Name:</span>
                  <span className="font-bold text-foreground">{submittedSlip.farmerName}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Contact Phone:</span>
                  <span className="font-bold text-foreground">{submittedSlip.farmerPhone}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Revenue Village:</span>
                  <span className="font-bold text-foreground">{submittedSlip.village}, {submittedSlip.district}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Crop Damaged:</span>
                  <span className="font-bold text-foreground">{submittedSlip.cropName}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Affected Area:</span>
                  <span className="font-bold text-foreground">{submittedSlip.affectedAreaAcres} Acres</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Date of Calamity:</span>
                  <span className="font-bold text-foreground">{submittedSlip.damageDate}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Calamity Type:</span>
                  <span className="font-bold text-foreground capitalize">{submittedSlip.damageCategory.replace('_', ' ')}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Insurance Scheme:</span>
                  <span className="font-bold text-foreground">{submittedSlip.insuranceScheme}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Survey Number:</span>
                  <span className="font-bold text-foreground">{submittedSlip.surveyNumber || 'Not provided'}</span>
                </div>
              </div>

              {/* Next Steps for Farmer */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <span className={cn("text-xs font-bold text-foreground block", isTamil && "font-tamil")}>
                  {isTamil ? 'விவசாயி அடுத்து செய்ய வேண்டிய நடவடிக்கைகள்:' : 'Next Steps for the Farmer:'}
                </span>
                <ol className="space-y-1.5 pl-4 text-xs text-muted-foreground list-decimal">
                  <li>
                    {isTamil 
                      ? 'இந்த ரசீது எண்ணை உங்கள் வட்டார வேளாண் அலுவலகத்தில் (ADA Office) அல்லது உங்கள் வங்கியில் காட்டவும்.' 
                      : 'Quote this Intimation Reference Number to your Block Agriculture Extension Officer (ADA) or Bank.'}
                  </li>
                  <li>
                    {isTamil 
                      ? 'கூட்டுக்குழு கள ஆய்வின் போது (Joint Committee Field Survey) உங்கள் வயலில் எடுக்கப்பட்ட புகைப்படங்களை காண்பிக்கவும்.' 
                      : 'Keep your geo-tagged photographs and Patta/Chitta ready for the Joint Committee Field Verification team.'}
                  </li>
                  <li>
                    {isTamil 
                      ? 'ஏதேனும் உதவிக்கு PMFBY உதவி எண் 14447 ஐ தொடர்பு கொள்ளவும்.' 
                      : 'For real-time claim status tracking, call PMFBY Central Helpline: 14447.'}
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Submitted Reports History View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={cn("text-sm font-bold text-foreground", isTamil && "font-tamil")}>
              {isTamil ? 'பதிவு செய்யப்பட்ட பயிர் சேத அறிக்கைகள்' : 'Your Registered Damage Intimations'}
            </h3>
            <button
              onClick={loadPastReports}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isTamil ? 'புதுப்பிக்க' : 'Refresh'}
            </button>
          </div>

          {loadingReports ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Loading reports...</span>
            </div>
          ) : savedReports.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className={cn("text-sm font-bold text-foreground", isTamil && "font-tamil")}>
                {isTamil ? 'இதுவரை எந்த சேத அறிக்கையும் பதிவு செய்யப்படவில்லை' : 'No Damage Reports Recorded Yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isTamil ? 'புதிய சேத அறிவிப்பை பதிவு செய்ய முதல் தாவலைத் தேர்ந்தெடுக்கவும்.' : 'Switch to the first tab to register a new crop damage intimation.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedReports.map(rep => (
                <div key={rep.id} className="p-4 rounded-xl bg-card border border-border shadow-soft space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-primary">
                      {rep.reportNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {rep.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground">
                    <span className="font-semibold">{rep.farmerName}</span>
                    <span>•</span>
                    <span>{rep.cropName} ({rep.affectedAreaAcres} Acres)</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{rep.village}, {rep.district}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span>Date of Damage: {rep.damageDate}</span>
                    <span className="capitalize">{rep.damageCategory.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
