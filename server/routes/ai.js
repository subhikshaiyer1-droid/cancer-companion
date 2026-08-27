import express from 'express';

const router = express.Router();

// Pre-packaged medical terminology database for offline/quick explainer
const MEDICAL_TERMS = {
  neutropenia: "Neutropenia means having a lower-than-normal level of neutrophils, a type of white blood cell that fights infections. During chemotherapy, this can happen, making it extra important to avoid germs and rest.",
  biopsy: "A biopsy is a brief medical procedure where a tiny sample of tissue is collected to examine under a microscope, helping doctors diagnose exact cell types.",
  metastasis: "Metastasis refers to cancer cells spreading from their original primary location to another area of the body.",
  infusion: "An infusion is the slow administration of liquid medication (like chemotherapy or hydration) directly into a vein through an IV drip or port.",
  portacath: "A port-a-cath (or port) is a small medical device placed under the skin of the chest to allow easy access for blood draws and chemotherapy infusions with less pain.",
  remission: "Remission means that the signs and symptoms of cancer have decreased or disappeared. Complete remission means all evidence of cancer is absent.",
  palliative: "Palliative care focuses on providing relief from symptoms, pain, and stress of a serious illness to maximize quality of life for the patient and family."
};

const DOCTOR_QUESTIONS_BY_PHASE = {
  general: [
    "What specific type and stage of cancer do I have?",
    "What are the goals of my recommended treatment plan?",
    "What are the potential side effects, and how can we manage them at home?",
    "Who should I call if I experience urgent symptoms outside clinic hours?"
  ],
  chemotherapy: [
    "How many cycles of chemotherapy will I be receiving?",
    "What medications will be prescribed to prevent nausea and fatigue?",
    "Are there dietary or activity restrictions I should follow on infusion days?",
    "What temperature reading qualifies as a fever emergency during treatment?"
  ],
  radiation: [
    "How often will I need radiation treatment sessions?",
    "What skin care precautions should I take around the targeted area?",
    "Will radiation cause localized fatigue, and when will it peak?"
  ],
  surgery: [
    "What is the expected recovery timeline after surgery?",
    "What wound care steps should I or my caregiver follow?",
    "When will the pathology report from the surgery be ready for discussion?"
  ]
};

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, topic } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const query = message.toLowerCase();

  // Smart compassionate fallback response engine
  let aiResponse = "";
  let suggestedQuestions = [];

  if (query.includes('nausea') || query.includes('vomit') || query.includes('sick')) {
    aiResponse = "I understand nausea can be very tough during treatment. Staying hydrated with small sips of ginger tea or clear broth, eating mild foods (like crackers or toast), and taking prescribed anti-nausea medications before meals often help. If you cannot keep fluids down for over 24 hours, please alert your care team right away.";
    suggestedQuestions = [
      "Should we adjust the timing of my anti-nausea medicine?",
      "Is there a different anti-emetic medication better suited for my regimen?"
    ];
  } else if (query.includes('fatigue') || query.includes('tired') || query.includes('exhausted')) {
    aiResponse = "Cancer-related fatigue is common and distinct from normal tiredness. Gentle light walking, short 20-minute naps (rather than long sleeps during the day), and prioritizing your energy for vital activities can support your body's healing.";
    suggestedQuestions = [
      "Is my fatigue related to my red blood cell counts (anemia)?",
      "Are there light physical therapy routines recommended for my current stage?"
    ];
  } else if (query.includes('scared') || query.includes('anxious') || query.includes('sad') || query.includes('afraid') || query.includes('crying') || query.includes('worry')) {
    aiResponse = "It is completely normal and valid to feel overwhelmed or anxious. You are going through a profound journey. Be kind to yourself today. Deep breathing exercises, speaking with a oncology counselor or trusted loved one, and remembering to take one day at a time can bring steady comfort.";
    suggestedQuestions = [
      "Can your clinic refer me to an oncology social worker or counselor?",
      "Are there local or virtual support groups for patients with my diagnosis?"
    ];
  } else if (query.includes('explain') || query.includes('mean') || query.includes('what is')) {
    // Check medical terms
    const foundTerm = Object.keys(MEDICAL_TERMS).find(t => query.includes(t));
    if (foundTerm) {
      aiResponse = MEDICAL_TERMS[foundTerm];
    } else {
      aiResponse = `Medical terms can sound daunting! "${message}" generally refers to clinical measurements or treatment protocols tailored by your oncology care team. Always feel free to ask your nurse or doctor to write down explanations during appointments.`;
    }
  } else {
    aiResponse = `Thank you for sharing your thoughts with me. While I am here to offer support and simple explanations, your specific diagnosis and body's responses are unique. Remember to keep a log of your daily symptoms in the Symptom Tracker so you can review them together with your doctor.`;
    suggestedQuestions = DOCTOR_QUESTIONS_BY_PHASE.general;
  }

  res.json({
    disclaimer: "IMPORTANT DISCLAIMER: I am an AI assistant created for educational and emotional support. I cannot replace your oncologist or healthcare provider. For urgent medical concerns or emergencies, contact your doctor immediately.",
    response: aiResponse,
    suggestedQuestions
  });
});

// GET /api/ai/explain-term/:term
router.get('/explain-term/:term', (req, res) => {
  const termKey = (req.params.term || '').toLowerCase();
  const definition = MEDICAL_TERMS[termKey];
  if (definition) {
    res.json({ term: req.params.term, definition });
  } else {
    res.json({ 
      term: req.params.term, 
      definition: `${req.params.term} is a clinical term used in healthcare. Always consult your oncology team for the exact context relative to your treatment plan.` 
    });
  }
});

// GET /api/ai/doctor-questions
router.get('/doctor-questions', (req, res) => {
  res.json({ questionsByPhase: DOCTOR_QUESTIONS_BY_PHASE });
});

export default router;
