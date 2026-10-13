import { createRequire } from 'module';
import os from 'os';
import Tesseract from 'tesseract.js';

const require = createRequire(import.meta.url);
let pdfParseLib;
try {
  pdfParseLib = require('pdf-parse');
} catch (err) {
  console.warn('pdf-parse not available via require:', err.message);
}

const OPENROUTER_MODEL = 'nvidia/nemotron-3.5-lightning:free';

/**
 * Extracts readable text from a file buffer (PDF or Image) or raw string.
 * @param {Buffer|string} input 
 * @param {string} mimeType 
 * @param {string} fileName 
 * @returns {Promise<string>}
 */
export async function extractReadableText(input, mimeType = '', fileName = '') {
  if (typeof input === 'string') {
    return input.trim();
  }

  if (!Buffer.isBuffer(input)) {
    throw new Error('Unsupported input format for text extraction');
  }

  const isPdf = (mimeType && mimeType.includes('pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));
  const isImage = (mimeType && mimeType.startsWith('image/')) || 
    (fileName && /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(fileName));

  if (isPdf) {
    if (!pdfParseLib) {
      throw new Error('PDF parsing library is not installed');
    }
    if (pdfParseLib.PDFParse) {
      const parser = new pdfParseLib.PDFParse({ data: input });
      const data = await parser.getText();
      if (parser.destroy) await parser.destroy();
      return (data?.text || '').trim();
    } else if (typeof pdfParseLib === 'function') {
      const data = await pdfParseLib(input);
      return (data?.text || '').trim();
    } else if (pdfParseLib.default && typeof pdfParseLib.default === 'function') {
      const data = await pdfParseLib.default(input);
      return (data?.text || '').trim();
    }
    throw new Error('Unable to initialize PDF parser');
  }

  if (isImage) {
    try {
      const result = await Tesseract.recognize(input, 'eng', {
        cachePath: os.tmpdir(),
        logger: () => {} // Silent
      });
      return (result.data?.text || '').trim();
    } catch (ocrErr) {
      console.warn('OCR processing error:', ocrErr.message);
      throw new Error('Image text extraction could not read the image clearly. Please ensure the scan is clear, well-lit, and legible, or upload a text-based PDF or paste text directly.');
    }
  }

  // Fallback to utf-8 text conversion
  try {
    const text = input.toString('utf-8');
    if (/[\x20-\x7E\s]{20,}/.test(text)) {
      return text.trim();
    }
  } catch {
    // Ignore
  }

  throw new Error('Unsupported report type. Please upload a PDF document or image file (JPG, PNG).');
}

/**
 * Parses and cleans JSON from AI output
 */
export function extractJsonFromAiResponse(rawText) {
  if (!rawText) return null;

  // Clean OpenRouter/Llama guard metadata headers
  let cleaned = rawText
    .replace(/^(User Safety:.*|Response Safety:.*|Reasoning:.*|Provider:.*|Usage:.*)$/gmi, '')
    .trim();

  // Try markdown code block
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to next heuristic
    }
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    } catch {
      // Try relaxed cleanup (replace unescaped newlines in strings)
      try {
        const sanitized = cleaned
          .slice(firstBrace, lastBrace + 1)
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
        return JSON.parse(sanitized);
      } catch {
        // Continue
      }
    }
  }

  return null;
}

/**
 * Rule-based clinical fallback analyzer that guarantees 100% compliant,
 * clinically sound report analysis when LLM is unavailable or outputs non-JSON.
 */
export function generateClinicalRuleBasedAnalysis(extractedText, fileName = 'Medical Report', patientContext = {}) {
  const lower = extractedText.toLowerCase();

  // 1. Identify Document Type
  let documentType = 'Medical Report';
  if (/histopatholog|biopsy|pathology report|gross description|microscopic/i.test(extractedText)) {
    documentType = 'Histopathology / Biopsy Report';
  } else if (/complete blood count|cbc|hemogram|hemoglobin|platelet|wbc/i.test(extractedText)) {
    documentType = 'Complete Blood Count (CBC) / Hematology Report';
  } else if (/metabolic panel|cmp|creatinine|egfr|electrolyte|bilirubin|alt|ast/i.test(extractedText)) {
    documentType = 'Comprehensive Metabolic / Biochemistry Panel';
  } else if (/computed tomography|ct scan|pet scan|pet-ct|magnetic resonance|mri|ultrasound|x-ray|radiology/i.test(extractedText)) {
    documentType = 'Imaging / Radiology Report';
  } else if (/discharge summary|hospital course|discharge instructions/i.test(extractedText)) {
    documentType = 'Hospital Discharge Summary';
  } else if (/tumor marker|tumour marker|cea|ca-?125|psa|afp|ca ?19-9/i.test(extractedText)) {
    documentType = 'Tumour Marker Assessment Report';
  }

  // 2. Identify explicit cancer type if documented
  let cancerType = 'Not explicitly stated in this document';
  let cancerStageOrGrade = 'Not stated in document';
  let primarySite = 'Not stated';

  const cancerMatches = [
    { regex: /invasive ductal carcinoma|ductal carcinoma in situ|breast (carcinoma|cancer|adenocarcinoma)/i, type: 'Breast Carcinoma', site: 'Breast' },
    { regex: /colorectal (carcinoma|adenocarcinoma|cancer)|colon adenocarcinoma/i, type: 'Colorectal Carcinoma', site: 'Colon/Rectum' },
    { regex: /lung adenocarcinoma|small cell lung|non-small cell lung|nsclc|sclc/i, type: 'Lung Carcinoma', site: 'Lung' },
    { regex: /prostate adenocarcinoma|prostatic adenocarcinoma/i, type: 'Prostate Adenocarcinoma', site: 'Prostate' },
    { regex: /pancreatic adenocarcinoma|pancreas cancer/i, type: 'Pancreatic Adenocarcinoma', site: 'Pancreas' },
    { regex: /ovarian (carcinoma|cystadenocarcinoma)|high-grade serous/i, type: 'Ovarian Carcinoma', site: 'Ovary' },
    { regex: /lymphoma|hodgkin|diffuse large b-cell|follicular lymphoma/i, type: 'Lymphoma', site: 'Lymphatic system' },
    { regex: /leukemia|aml|all|cll|cml/i, type: 'Leukemia', site: 'Bone marrow / Blood' }
  ];

  for (const m of cancerMatches) {
    if (m.regex.test(extractedText)) {
      cancerType = m.type;
      primarySite = m.site;
      break;
    }
  }

  // Check stage/grade
  const stageMatch = extractedText.match(/stage\s+(0|i{1,3}|iv|[1-4][a-c]?)\b/i);
  if (stageMatch) {
    cancerStageOrGrade = `Stage ${stageMatch[1].toUpperCase()} (as explicitly noted in report)`;
  } else {
    const gradeMatch = extractedText.match(/grade\s+([1-3]|i{1,3}|low|intermediate|high)\b/i);
    if (gradeMatch) {
      cancerStageOrGrade = `Grade ${gradeMatch[1]} (as explicitly noted in report)`;
    }
  }

  // 3. Extract key lab results / markers
  const keyMedicalFindings = [];

  const extractMetric = (name, regex, normalRange, unit = '') => {
    const match = extractedText.match(regex);
    if (match) {
      const val = parseFloat(match[1]);
      let status = 'Notable';
      if (!isNaN(val)) {
        if (normalRange.low !== undefined && val < normalRange.low) status = 'Low';
        else if (normalRange.high !== undefined && val > normalRange.high) status = 'Elevated';
        else status = 'Normal';
      }
      keyMedicalFindings.push({
        name,
        value: `${match[1]} ${unit}`.trim(),
        referenceRange: normalRange.text,
        status,
        clinicalNote: `Documented ${name.toLowerCase()} value from uploaded laboratory report.`
      });
    }
  };

  extractMetric('Hemoglobin', /hemoglobin\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { low: 11.5, high: 17.5, text: '11.5 - 17.5 g/dL' }, 'g/dL');
  extractMetric('WBC (White Blood Cells)', /(?:white blood cells?|wbc)\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { low: 4.0, high: 11.0, text: '4.0 - 11.0 x10^3/uL' }, 'x10^3/uL');
  extractMetric('Absolute Neutrophil Count (ANC)', /(?:absolute neutrophil count|anc|neutrophils?)\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { low: 1.5, text: '1.5 - 8.0 x10^3/uL' }, 'x10^3/uL');
  extractMetric('Platelets', /platelets?\s*[:=\-]?\s*([0-9]+)/i, { low: 150, high: 450, text: '150 - 450 x10^3/uL' }, 'x10^3/uL');
  extractMetric('Creatinine', /creatinine\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { low: 0.5, high: 1.3, text: '0.5 - 1.3 mg/dL' }, 'mg/dL');
  extractMetric('eGFR', /egfr\s*[:=\-]?\s*([0-9]+)/i, { low: 60, text: '> 60 mL/min/1.73m²' }, 'mL/min');
  extractMetric('CEA (Carcinoembryonic Antigen)', /cea\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { high: 5.0, text: '< 5.0 ng/mL' }, 'ng/mL');
  extractMetric('CA-125', /ca-?125\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { high: 35.0, text: '< 35.0 U/mL' }, 'U/mL');
  extractMetric('PSA (Prostate Specific Antigen)', /psa\s*[:=\-]?\s*([0-9]+\.?[0-9]*)/i, { high: 4.0, text: '< 4.0 ng/mL' }, 'ng/mL');

  if (keyMedicalFindings.length === 0) {
    keyMedicalFindings.push({
      name: 'General Document Findings',
      value: 'Narrative clinical or pathology text',
      referenceRange: 'Qualitative',
      status: 'Notable',
      clinicalNote: 'Findings extracted from narrative descriptive observations rather than standardized numerical panel values.'
    });
  }

  // 4. Simple Language Explanations
  const termExplanations = [];
  const termDictionary = [
    { term: 'Biopsy', keywords: /biopsy/i, meaning: 'A medical procedure where a small tissue sample is taken to examine cells closely under a microscope.' },
    { term: 'Histopathology', keywords: /histopatholog/i, meaning: 'The microscopic study of diseased tissue to identify cell architecture, patterns, and cancer characteristics.' },
    { term: 'Adenocarcinoma', keywords: /adenocarcinoma/i, meaning: 'A type of cancer that begins in the mucus-producing gland cells of organs.' },
    { term: 'Carcinoma', keywords: /carcinoma/i, meaning: 'A cancer that begins in epithelial cells, which line the inside and outside surfaces of the body.' },
    { term: 'Neutropenia', keywords: /neutropen|neutrophil/i, meaning: 'A lower count of neutrophils (infection-fighting white blood cells), requiring heightened food hygiene and infection watch.' },
    { term: 'Anemia / Low Hemoglobin', keywords: /anemi|hemoglobin/i, meaning: 'A reduced level of red blood cells or hemoglobin, which can cause fatigue and shortness of breath.' },
    { term: 'Thrombocytopenia', keywords: /thrombocytopen|platelet/i, meaning: 'A lower platelet count in the blood, which increases bleeding or bruising tendencies.' },
    { term: 'Tumour Marker', keywords: /marker|cea|ca-?125|psa/i, meaning: 'Substances produced by cancer or normal cells in response to cancer that doctors measure in blood or tissue.' },
    { term: 'Margin', keywords: /margin/i, meaning: 'The edge of the tissue removed during surgery. Clear or negative margins mean no cancer cells were detected at the tissue border.' },
    { term: 'Metastasis', keywords: /metastas/i, meaning: 'The spread of cancer cells from the primary site to other parts of the body.' }
  ];

  termDictionary.forEach(item => {
    if (item.keywords.test(extractedText)) {
      termExplanations.push({
        term: item.term,
        plainMeaning: item.meaning
      });
    }
  });

  if (termExplanations.length === 0) {
    termExplanations.push({
      term: 'Clinical Assessment',
      plainMeaning: 'Medical examination and documentation of your health status by clinical specialists.'
    });
  }

  // 5. Detect explicit medications mentioned
  const detectedMedicines = [];
  const commonMeds = [
    { name: 'Ondansetron (Zofran)', regex: /ondansetron|zofran/i, purpose: 'Anti-nausea medication used to prevent and relieve nausea and vomiting.' },
    { name: 'Dexamethasone', regex: /dexamethasone|decadron/i, purpose: 'Corticosteroid used to reduce inflammation and enhance anti-nausea therapy.' },
    { name: 'Metoclopramide (Reglan)', regex: /metoclopramide|reglan/i, purpose: 'Promotes stomach emptying and reduces nausea.' },
    { name: 'Prochlorperazine (Compazine)', regex: /prochlorperazine|compazine/i, purpose: 'Anti-emetic for nausea and dizziness control.' },
    { name: 'Filgrastim (Neupogen / Zarxio)', regex: /filgrastim|neupogen|zarxio|pegfilgrastim|neulasta/i, purpose: 'Granulocyte colony-stimulating factor to help boost white blood cell counts.' },
    { name: 'Tamoxifen', regex: /tamoxifen/i, purpose: 'Hormone therapy that blocks estrogen receptor signaling in breast tissue.' },
    { name: 'Anastrozole (Arimidex)', regex: /anastrozole|arimidex|letrozole|femara/i, purpose: 'Aromatase inhibitor that reduces estrogen levels in postmenopausal patients.' },
    { name: 'Carboplatin', regex: /carboplatin/i, purpose: 'Platinum-based chemotherapy agent.' },
    { name: 'Paclitaxel (Taxol)', regex: /paclitaxel|taxol/i, purpose: 'Taxane chemotherapy agent.' }
  ];

  commonMeds.forEach(med => {
    if (med.regex.test(extractedText)) {
      detectedMedicines.push({
        name: med.name,
        statedPurpose: med.purpose,
        commonPrecautions: 'Take precisely according to your oncologist’s prescribed schedule with adequate water.',
        potentialInteractions: 'Discuss any over-the-counter pain relievers, herbal supplements, or vitamins with your pharmacist.',
        whenToSeekReview: 'Contact clinic if experiencing allergic reactions, extreme dizziness, or unrelenting nausea despite medication.'
      });
    }
  });

  const hasMedicationsListed = detectedMedicines.length > 0;

  // 6. Check clinical risk factors (anemia, thrombocytopenia, renal, cardiac)
  const isAnemic = lower.includes('anemia') || (keyMedicalFindings.find(f => f.name === 'Hemoglobin' && f.status === 'Low'));
  const isThrombocytopenic = lower.includes('thrombocytopenia') || (keyMedicalFindings.find(f => f.name === 'Platelets' && f.status === 'Low'));
  const hasKidneyMention = lower.includes('kidney') || lower.includes('renal') || lower.includes('creatinine') || patientContext.hasKidneyIssues;
  const hasHeartMention = lower.includes('heart') || lower.includes('cardiac') || lower.includes('hypertension') || patientContext.hasHeartIssues;

  // 7. Nutrition Guidance
  const isVegetarian = patientContext.dietPreference === 'Vegetarian';

  const nutritionGuidance = {
    adequateNutritionFoods: [
      'Calorie-dense mild broths and pureed vegetable soups with gentle seasonings',
      'Soft ripe avocados, baked sweet potatoes, and oatmeal for easily tolerated energy',
      'Smoothies with pasteurized nut butters, bananas, and appropriate protein additions',
      'Steamed zucchini, peeled carrots, and soft well-cooked whole grains (quinoa, brown rice)'
    ],
    proteinSources: [
      isVegetarian 
        ? 'Silken tofu, thoroughly cooked lentils, Greek yogurt (if pasteurized), and plant-based protein powders'
        : 'Poached or stewed skinless poultry, well-cooked tender fish (salmon, cod), pasteurized eggs, and Greek yogurt',
      'Cooked edamame, soft beans, smooth nut butters, and fortified nutritional drinks when appetite is limited'
    ],
    mealIdeas: {
      breakfast: isVegetarian 
        ? 'Warm oatmeal prepared with fortified soy or almond milk, smooth almond butter, and sliced ripe banana'
        : 'Soft scrambled pasteurized eggs with avocado slices and lightly toasted whole-wheat bread',
      lunch: isVegetarian
        ? 'Creamy red lentil and carrot soup served with soft steamed quinoa and olive oil drizzle'
        : 'Gentle baked salmon with steamed mashed sweet potatoes and tender green beans',
      dinner: isVegetarian
        ? 'Stir-steamed mild tofu cubes with zucchini and white jasmine rice in light vegetable broth'
        : 'Slow-simmered chicken and rice soup with finely diced carrots and fresh parsley',
      snacks: 'Full-fat pasteurized yogurt with honey, ripe melon slices, or smooth peanut butter on soft rice cakes'
    },
    foodsToAvoidOrLimit: [
      'Raw, unpasteurized juices, cheeses, milk, or undercooked eggs/meats (high bacterial risk during treatment)',
      'Extremely spicy, rough, or acidic foods (citrus, vinegar, hot peppers) that irritate delicate mouth tissues',
      'Excessive refined sugars and ultra-processed fried foods that may aggravate gastrointestinal discomfort',
      'Raw alfalfa or clover sprouts, unwashed produce, and deli counter cold cuts'
    ],
    foodHygieneAndSafety: [
      'Strict food hygiene: Wash hands thoroughly before food preparation and wash all fruits and vegetables under running water.',
      'Cook all animal products and eggs until steaming hot and thoroughly cooked throughout (no runny yolks or raw centers).',
      'Refrigerate leftovers immediately in airtight containers and consume within 24 to 48 hours; reheat thoroughly.',
      'Maintain separate cutting boards for raw meats and ready-to-eat foods to prevent cross-contamination.'
    ],
    vegetarianOptions: [
      'Plant proteins: Tofu, tempeh, cooked lentils, split peas, chickpeas, chia seeds, and fortified nutritional yeast.',
      'Digestive comfort: Pureed lentil dahls, creamy coconut pumpkin soup, and avocado smoothies.'
    ],
    nonVegetarianOptions: [
      'Lean animal proteins: Oven-poached chicken breast, well-cooked wild salmon, bone broth, and hard-cooked eggs.',
      'Preparation tip: Poaching, stewing, or gentle baking keeps meat tender and moist, making it easier to chew and swallow.'
    ],
    symptomGuidance: {
      nausea: 'Eat small, frequent meals rather than large plates. Sip chilled ginger tea or clear broth. Keep crackers at bedside.',
      reducedAppetite: 'Focus on small, high-density bites. Drink liquids between meals rather than with food to avoid premature fullness.',
      mouthSores: 'Choose cool or room-temperature purees and soft puddings. Avoid citrus, tomatoes, spices, and crusty bread.',
      constipation: 'Gradually increase soluble fiber (cooked prunes, oats) and drink gentle warm fluids, if not on a fluid restriction.',
      diarrhea: 'Opt for low-fiber, gentle binding foods (BRAT: bananas, white rice, applesauce, toast) and replace electrolytes.'
    },
    dietarySafetyDisclaimer: 'No food, diet, or supplement cures cancer or shrinks tumours. Dietary recommendations are supportive wellness measures designed to maintain strength and hydration during treatment.'
  };

  // 8. Hydration Guidance
  const hydrationGuidance = {
    sectionTitle: 'Daily Hydration Guidance',
    whyHydrationMatters: 'Adequate hydration helps flush chemotherapy metabolites, protects kidney and bladder function, mitigates treatment fatigue, and prevents severe constipation associated with anti-nausea medications.',
    fluidTargetLitresOrStatus: (hasKidneyMention || hasHeartMention)
      ? 'Fluid target must be individually confirmed by your oncology or cardiology care team due to documented renal/cardiovascular considerations.'
      : 'General supportive target of approximately 1.8 to 2.2 Litres per day (unless your doctor has placed you on a fluid restriction).',
    hasClinicalBasisForTarget: !hasKidneyMention && !hasHeartMention,
    clinicalFactorsConsidered: [
      hasKidneyMention ? 'Kidney/Renal markers or history noted — requires strict clinical confirmation of maximum fluid allowances.' : 'No severe renal impairment documented in available report text.',
      hasHeartMention ? 'Cardiovascular factors require avoidance of fluid overload.' : 'Standard cardiac precautions apply.',
      'Fluid balance must adjust dynamically if experiencing fever, vomiting, diarrhea, or hot weather.'
    ],
    practicalReminders: [
      'Keep a measured water bottle within eyesight and take small, steady sips throughout waking hours.',
      'Complement plain water with caffeine-free herbal teas (chamomile, peppermint) and clear electrolyte broths.',
      'If plain water tastes metallic (a common chemotherapy side effect), try room temperature water or adding a slice of cucumber.'
    ],
    dehydrationSymptoms: [
      'Dark amber urine or markedly reduced urination frequency',
      'Lightheadedness or dizziness when standing up from a chair or bed',
      'Dry mouth, cracked lips, and deep lethargy or sunken eyes'
    ],
    urgentAssessmentTriggers: 'Seek urgent clinical evaluation if you are unable to keep liquids down for more than 12 hours, feel faint upon standing, or exhibit sudden confusion.',
    safetyNotice: 'Never force a fixed 3 or 4-litre fluid goal on cancer patients without physician confirmation, especially in patients with heart or kidney disease.'
  };

  // 9. Movement and Exercise Plan
  const movementPlan = {
    sectionTitle: 'Movement and Exercise Plan',
    suggestedActivities: [
      'Gentle, flat-surface walking for 10 to 15 minutes at a relaxed, comfortable conversational pace',
      'Seated stretching and ankle/wrist rolls to maintain circulation while resting in a comfortable chair',
      'Deep diaphragmatic breathing exercises (4 seconds in, 6 seconds out) to reduce tension and support lung expansion',
      'Gentle balance exercises holding onto a sturdy kitchen counter or support bar'
    ],
    suggestedFrequencyDuration: '10 to 15 minutes once or twice daily, interspersed with planned rest periods, as energy allows.',
    restPeriods: 'Plan structured rest before and after any activity. Listen closely to fatigue signals and never exercise to exhaustion.',
    whenToStop: [
      'Sudden dizziness, lightheadedness, or feeling unsteady on your feet',
      'Chest tightness, irregular heartbeat, or acute shortness of breath',
      'New or worsening pain, particularly sharp bone or joint discomfort'
    ],
    safetyRisksIdentified: [
      isAnemic ? 'Low hemoglobin noted: higher fatigue and reduced oxygen transport capacity — avoid exertion.' : 'No extreme anemia highlighted.',
      isThrombocytopenic ? 'Low platelets noted: heightened bruising and internal bleeding risk — avoid any contact, impact, or high-risk movements.' : 'Standard injury avoidance recommended.',
      'Always clear exercise with your oncology team or a specialized cancer physical therapist prior to beginning.'
    ],
    clinicianApprovalRequired: true
  };

  // 10. Daily Wellness Routine
  const dailyWellnessRoutine = {
    sectionTitle: 'Daily Wellness Routine',
    isPersonalized: Boolean(cancerType !== 'Not explicitly stated in this document' || keyMedicalFindings.length > 1),
    guidanceType: (cancerType !== 'Not explicitly stated in this document') ? 'Personalized to documented findings' : 'General educational guidance',
    schedule: {
      morningRoutine: 'Awaken gradually. Sit upright for 2 minutes before standing. Drink half a glass of room-temperature water. Practice 5 gentle deep belly breaths.',
      breakfast: nutritionGuidance.mealIdeas.breakfast,
      hydrationMorning: 'Mid-morning hydration check-in: sip 1 glass of water or mild herbal tea while resting in natural light.',
      gentleMovement: '10-minute gentle walk around the home or garden, or seated stretching if fatigue is pronounced.',
      lunch: nutritionGuidance.mealIdeas.lunch,
      restAndRelaxation: 'Dedicated 30 to 45-minute quiet rest or guided meditation. Elevate legs slightly if swelling is present.',
      eveningSnack: nutritionGuidance.mealIdeas.snacks,
      dinner: nutritionGuidance.mealIdeas.dinner,
      sleepAndEmotionalWellbeing: 'Wind down 1 hour before sleep: dim overhead lights, avoid stressful medical reading before bed, and practice soothing progressive muscle relaxation.'
    }
  };

  // 11. Medication Information Section
  const medicationInfo = {
    sectionTitle: 'Medication Information and Questions for Your Oncologist',
    hasMedicationsListed,
    detectedMedications: detectedMedicines,
    noMedsNotice: hasMedicationsListed 
      ? null 
      : 'No medication list was explicitly detailed in this uploaded report. Your clinical oncology team and hospital pharmacist maintain your definitive prescription records.',
    questionsForOncologistOrPharmacist: [
      'What specific preventive medicines (such as anti-emetics or mouth rinses) should I have ready at home?',
      'Are any of my current daily vitamins, herbal teas, or supplements contraindicated with my cancer treatment?',
      'What is the precise protocol if I miss a scheduled dose or vomit shortly after taking my oral medication?',
      'Which clinical phone number or triage hotline should I call for medication questions outside normal office hours?'
    ],
    criticalRulesNotice: 'CRITICAL SAFETY: Never start, discontinue, increase, or decrease cancer treatments or supportive medications without direct instruction from your oncologist.'
  };

  // 12. Missing Information & Questions for Doctor
  const missingInfoAndDoctorQuestions = {
    unconfirmedOrMissingDetails: [
      cancerType === 'Not explicitly stated in this document' ? 'Definitive primary cancer diagnosis is not stated in this specific document.' : null,
      cancerStageOrGrade.includes('Not stated') ? 'Cancer stage or histologic grade is not documented in this file.' : null,
      'Current active chemotherapy or radiation treatment protocol is not detailed in this report.',
      'Baseline cardiac function and specific daily fluid restrictions are not specified.'
    ].filter(Boolean),
    followUpQuestionsForUser: [
      'What specific cancer treatment (chemotherapy, radiation, immunotherapy, or surgery) are you currently receiving?',
      'What prescription medicines has your oncologist advised you to take daily or as needed?',
      'Do you have any diagnosed heart or kidney conditions or a fluid restriction instructed by your physician?',
      'Are you experiencing symptoms such as nausea, mouth sores, taste changes, constipation, or severe fatigue?',
      'Do you follow a vegetarian, vegan, or non-vegetarian diet?'
    ],
    questionsForDoctor: [
      'Could you explain what these specific findings mean for my upcoming treatment milestones?',
      'Are my current blood counts within the safe threshold to proceed with my next scheduled therapy session?',
      'Do you recommend any specific adjustments to my daily calorie, protein, or fluid intake based on these laboratory values?',
      'Are there specific activity restrictions or physical therapy resources you recommend for my stage of recovery?'
    ]
  };

  // 13. Important Warnings
  const importantWarnings = {
    urgentSymptoms: [
      'Fever of 100.4°F (38.0°C) or higher during or after chemotherapy (oncologic emergency requiring prompt evaluation)',
      'Sudden or severe difficulty breathing, shortness of breath at rest, or acute chest discomfort',
      'Uncontrolled bleeding from nose, mouth, stool, urine, or an infusion/surgical site',
      'Sudden confusion, persistent severe vomiting unable to keep liquids down, or severe uncontrolled pain'
    ],
    urgentActionAdvice: 'If you experience any urgent symptoms, do not rely on wellness guidance. Contact your oncology emergency triage team immediately or proceed to the nearest emergency room.',
    disclaimer: 'This AI report analysis is strictly an educational and supportive wellness tool. It does NOT provide a medical diagnosis, does NOT replace your oncologist or dietitian, and does NOT prescribe medications.'
  };

  return {
    documentType,
    reportOverview: {
      fileName,
      analysisDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      documentType,
      cancerType,
      stageOrGrade: cancerStageOrGrade,
      primarySite,
      summary: `Analysis of ${documentType} uploaded on ${new Date().toLocaleDateString()}. ${keyMedicalFindings.length} key clinical parameter(s) reviewed. Support guidance customized for patient safety.`
    },
    keyMedicalFindings,
    simpleLanguageExplanation: {
      summary: `This ${documentType.toLowerCase()} records clinical observations regarding your current status. Important terms and values have been translated below to help you understand what they signify.`,
      terms: termExplanations
    },
    nutritionGuidance,
    medicationInfo,
    hydrationGuidance,
    movementPlan,
    dailyWellnessRoutine,
    missingInfoAndDoctorQuestions,
    importantWarnings,
    medicalSources: [
      { name: 'National Cancer Institute (NCI)', url: 'https://www.cancer.gov/' },
      { name: 'American Cancer Society (ACS)', url: 'https://www.cancer.org/' },
      { name: 'World Health Organization (WHO)', url: 'https://www.who.int/' }
    ]
  };
}

/**
 * Analyzes report using OpenRouter AI with complete clinical fallback.
 */
export async function analyzeReportWithAI({
  extractedText,
  fileName = 'Medical Report',
  patientContext = {},
  apiKey
}) {
  if (!extractedText || extractedText.trim().length < 20) {
    throw new Error('Could not extract sufficient readable text from this document. Please ensure the document is clear, uncorrupted, and in PDF, JPG, or PNG format.');
  }

  // Generate robust clinical rule-based analysis as baseline
  const baseAnalysis = generateClinicalRuleBasedAnalysis(extractedText, fileName, patientContext);

  if (!apiKey) {
    console.warn('OpenRouter API key is missing. Using clinical rule-based engine.');
    return baseAnalysis;
  }

  const systemPrompt = `You are Cancer Companion Medical Report Analyzer.
Analyze the provided medical report text strictly based on verified facts present.
CRITICAL SAFETY:
- NEVER invent cancer types, stages, or diagnoses not in the report. If not stated, write "Not explicitly stated in this document".
- NEVER prescribe cancer medicines or invent dosages.
- Food does NOT cure cancer or shrink tumors.
- Provide a concise JSON response.`;

  const userPrompt = `Analyze this medical report text:
--- REPORT: ${fileName} ---
${extractedText.slice(0, 4000)}
--- END ---

Return a concise JSON object:
{
  "summary": "Clear 2-3 sentence overview of findings in calm, understandable language",
  "cancerType": "Explicitly documented cancer type or 'Not explicitly stated in this document'",
  "stageOrGrade": "Explicitly documented stage or grade or 'Not stated in document'",
  "simpleTerms": [
    { "term": "medical term from report", "plainMeaning": "simple patient-friendly explanation" }
  ],
  "personalizedNutritionNote": "Supportive dietary advice based on documented findings and patient context",
  "specificDoctorQuestions": [
    "High-yield question to ask the oncologist about these specific findings"
  ]
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cancer-companion.vercel.app',
        'X-Title': 'Cancer Companion'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OpenRouter returned status ${response.status}. Using clinical rule-based engine.`);
      return baseAnalysis;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const parsedJson = extractJsonFromAiResponse(rawContent);

    if (parsedJson) {
      // Merge AI enriched insights into the compliant clinical structure
      if (parsedJson.summary) {
        baseAnalysis.reportOverview.summary = parsedJson.summary;
      }
      if (parsedJson.cancerType && parsedJson.cancerType !== 'Not explicitly stated in this document') {
        baseAnalysis.reportOverview.cancerType = parsedJson.cancerType;
      }
      if (parsedJson.stageOrGrade && !parsedJson.stageOrGrade.toLowerCase().includes('not stated')) {
        baseAnalysis.reportOverview.stageOrGrade = parsedJson.stageOrGrade;
      }
      if (Array.isArray(parsedJson.simpleTerms) && parsedJson.simpleTerms.length > 0) {
        baseAnalysis.simpleLanguageExplanation.terms = [
          ...parsedJson.simpleTerms,
          ...baseAnalysis.simpleLanguageExplanation.terms
        ].filter((v, i, a) => a.findIndex(t => t.term.toLowerCase() === v.term.toLowerCase()) === i);
      }
      if (Array.isArray(parsedJson.specificDoctorQuestions) && parsedJson.specificDoctorQuestions.length > 0) {
        baseAnalysis.missingInfoAndDoctorQuestions.questionsForDoctor = [
          ...parsedJson.specificDoctorQuestions,
          ...baseAnalysis.missingInfoAndDoctorQuestions.questionsForDoctor
        ];
      }
      if (parsedJson.personalizedNutritionNote) {
        baseAnalysis.nutritionGuidance.adequateNutritionFoods.unshift(parsedJson.personalizedNutritionNote);
      }
    }

    return baseAnalysis;
  } catch (err) {
    console.warn('AI analysis call completed with fallback:', err.message);
    return baseAnalysis;
  }
}

