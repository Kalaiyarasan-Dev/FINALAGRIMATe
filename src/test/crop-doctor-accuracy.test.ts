import { describe, it, expect } from 'vitest';
import {
  classifyLocallyFromImageMetrics,
  fallbackDiseaseDatabase,
  DiagnosisResult,
} from '@/lib/geminiApi';

describe('Crop Doctor Image Analysis & Disease Identification Accuracy', () => {
  it('correctly classifies a healthy plant and does NOT prescribe chemical pesticides', async () => {
    // Healthy plant specimen
    const result: DiagnosisResult = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'healthy plant'
    );

    expect(result.status).toBe('healthy');
    expect(result.severity).toBe('healthy');
    expect(result.diseaseEn).toContain('Healthy');
    expect(result.diseaseTa).toContain('ஆரோக்கியமான');
    expect(result.confidence).toBeGreaterThanOrEqual(90);

    // Must not recommend chemical pesticides
    expect(result.chemicalRemedyEn.toLowerCase()).toContain('no chemical');
    expect(result.chemicalRemedyTa).toContain('தேவை இல்லை');

    // Must have prevention & organic vigor guidance
    expect(result.preventionEn.length).toBeGreaterThan(0);
    expect(result.organicRemedyEn.length).toBeGreaterThan(0);
  });

  it('rejects unclear/blurry images honestly with "Unable to identify accurately"', async () => {
    const result: DiagnosisResult = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'unclear blurry leaf'
    );

    expect(result.status).toBe('unclear');
    expect(result.diseaseEn).toBe('Unable to identify accurately');
    expect(result.diseaseTa).toBe('துல்லியமாக அடையாளம் காண முடியவில்லை');
    expect(result.uncertain).toBe(true);
    expect(result.confidence).toBeLessThan(50);
    expect(result.confidenceExplanationEn).toContain('blurry');
    expect(result.chemicalRemedyEn).toContain('NOT apply');
  });

  it('rejects non-agricultural/non-plant photos honestly', async () => {
    const result: DiagnosisResult = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'unrelated car vehicle'
    );

    expect(result.status).toBe('not_plant');
    expect(result.diseaseEn).toContain('Not a Plant');
    expect(result.diseaseTa).toContain('தாவரம் அல்ல');
    expect(result.uncertain).toBe(true);
    expect(result.confidence).toBeLessThanOrEqual(20);
  });

  it('distinguishes between different diseases on different crops', async () => {
    // 1. Paddy Blast
    const paddyBlast = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'rice blast lesions'
    );
    expect(paddyBlast.cropDetectedEn).toContain('Paddy');
    expect(paddyBlast.diseaseEn).toContain('Blast');
    expect(paddyBlast.status).toBe('confirmed');

    // 2. Tomato Leaf Curl
    const tomatoCurl = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'tomato curl virus'
    );
    expect(tomatoCurl.cropDetectedEn).toContain('Tomato');
    expect(tomatoCurl.diseaseEn).toContain('Curl');
    expect(tomatoCurl.status).toBe('confirmed');

    // 3. Cotton Bollworm
    const cottonBollworm = await classifyLocallyFromImageMetrics(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'cotton bollworm caterpillar'
    );
    expect(cottonBollworm.cropDetectedEn).toContain('Cotton');
    expect(cottonBollworm.diseaseEn).toContain('Bollworm');
    expect(cottonBollworm.status).toBe('confirmed');

    // Verify all results are distinct
    expect(paddyBlast.diseaseEn).not.toBe(tomatoCurl.diseaseEn);
    expect(tomatoCurl.diseaseEn).not.toBe(cottonBollworm.diseaseEn);
  });

  it('contains all 8 required display points in both English and Tamil', async () => {
    const sample = fallbackDiseaseDatabase.tomato.early_blight;

    // 1. Crop Name
    expect(sample.cropDetectedEn).toBe('Tomato (Solanum lycopersicum)');
    expect(sample.cropDetectedTa).toBe('தக்காளி (Solanum lycopersicum)');

    // 2. Disease Name
    expect(sample.diseaseEn).toBe('Tomato Early Blight (Alternaria solani)');
    expect(sample.diseaseTa).toBe('தக்காளி ஆரம்ப இலை கருகல் நோய்');

    // 3. Identification Confidence & Explanation
    expect(sample.confidence).toBeGreaterThanOrEqual(70);
    expect(sample.confidenceExplanationEn.length).toBeGreaterThan(15);
    expect(sample.confidenceExplanationTa.length).toBeGreaterThan(15);

    // 4. Visible Symptoms Found
    expect(sample.symptomsEn.length).toBeGreaterThanOrEqual(2);
    expect(sample.symptomsTa.length).toBeGreaterThanOrEqual(2);

    // 5. Possible Causes & Predisposing Triggers
    expect(sample.possibleCausesEn.length).toBeGreaterThanOrEqual(2);
    expect(sample.possibleCausesTa.length).toBeGreaterThanOrEqual(2);

    // 6. Recommended Treatment (Chemical with dosage + Organic prioritized)
    expect(sample.chemicalRemedyEn).toContain('Mancozeb');
    expect(sample.chemicalRemedyTa).toContain('மன்கோசெப்');
    expect(sample.organicRemedyEn).toContain('Trichoderma');
    expect(sample.organicRemedyTa).toContain('டிரைக்கோடெர்மா');

    // 7. Prevention Methods
    expect(sample.preventionEn.length).toBeGreaterThanOrEqual(2);
    expect(sample.preventionTa.length).toBeGreaterThanOrEqual(2);

    // 8. When to consult an agricultural expert
    expect(sample.expertConsultationEn).toContain('agronomist');
    expect(sample.expertConsultationTa).toContain('மையத்தை');

    // Farmer safety disclaimer
    expect(sample.safetyWarningEn).toContain('Precaution');
    expect(sample.safetyWarningTa).toContain('பாதுகாப்பு');
  });
});

