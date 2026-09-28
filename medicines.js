/* ==========================================================
   MediDent Clinic — Medicine Reference Database
   A curated list of common medicines (brand + generic/composition)
   across major therapeutic categories, used to power the
   autocomplete on the "Medicine" field in the Rx table.

   NOTE: This is a practical reference list for faster prescription
   entry — it is NOT an exhaustive worldwide medicine registry
   (no single list like that exists; there are hundreds of thousands
   of brand names across countries). Coverage here spans common
   Indian brands/generics across categories from cold & fever to
   oncology, diabetes, cardiac, GI, respiratory, dermatology,
   psychiatry, and more. Add / edit entries freely below.
   ========================================================== */

const MEDICINE_DB = [
  /* ---------------- Pain / Fever / Analgesics ---------------- */
  { name: "Crocin", comp: "Paracetamol 500mg", category: "Pain & Fever" },
  { name: "Dolo 650", comp: "Paracetamol 650mg", category: "Pain & Fever" },
  { name: "Calpol", comp: "Paracetamol 500mg", category: "Pain & Fever" },
  { name: "Combiflam", comp: "Ibuprofen 400mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Brufen", comp: "Ibuprofen 400mg", category: "Pain & Fever" },
  { name: "Voveran", comp: "Diclofenac Sodium 50mg", category: "Pain & Fever" },
  { name: "Zerodol-P", comp: "Aceclofenac 100mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Aceclo Plus", comp: "Aceclofenac 100mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Sumo", comp: "Nimesulide 100mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Flexon", comp: "Ibuprofen 400mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Tramadol", comp: "Tramadol Hydrochloride 50mg", category: "Pain & Fever" },
  { name: "Ultracet", comp: "Tramadol 37.5mg + Paracetamol 325mg", category: "Pain & Fever" },
  { name: "Nise", comp: "Nimesulide 100mg", category: "Pain & Fever" },
  { name: "Saridon", comp: "Paracetamol 250mg + Propyphenazone 150mg + Caffeine 50mg", category: "Pain & Fever" },
  { name: "Disprin", comp: "Aspirin 350mg", category: "Pain & Fever" },
  { name: "Meftal Spas", comp: "Mefenamic Acid 250mg + Dicyclomine 10mg", category: "Pain & Fever" },
  { name: "Aceclofenac + Thiocolchicoside", comp: "Aceclofenac 100mg + Thiocolchicoside 4mg", category: "Pain & Fever" },
  { name: "Etodolac", comp: "Etodolac 400mg", category: "Pain & Fever" },
  { name: "Naproxen", comp: "Naproxen 250mg", category: "Pain & Fever" },
  { name: "Tapentadol", comp: "Tapentadol 50mg", category: "Pain & Fever" },

  /* ---------------- Cold / Cough / Allergy ---------------- */
  { name: "Cheston Cold", comp: "Cetirizine 5mg + Paracetamol 325mg + Phenylephrine 5mg", category: "Cold, Cough & Allergy" },
  { name: "Sinarest", comp: "Paracetamol 500mg + Phenylephrine 5mg + Chlorpheniramine 2mg", category: "Cold, Cough & Allergy" },
  { name: "D-Cold Total", comp: "Paracetamol 500mg + Phenylephrine 10mg + Chlorpheniramine 2mg", category: "Cold, Cough & Allergy" },
  { name: "Coldact", comp: "Paracetamol 325mg + Phenylephrine 5mg + Chlorpheniramine 2mg", category: "Cold, Cough & Allergy" },
  { name: "Ascoril LS", comp: "Ambroxol 30mg + Guaifenesin 50mg + Levosalbutamol 1mg (Syrup)", category: "Cold, Cough & Allergy" },
  { name: "Benadryl", comp: "Diphenhydramine 12.5mg + Ammonium Chloride (Syrup)", category: "Cold, Cough & Allergy" },
  { name: "Corex", comp: "Codeine Phosphate + Chlorpheniramine (Syrup)", category: "Cold, Cough & Allergy" },
  { name: "Grilinctus", comp: "Dextromethorphan + Chlorpheniramine + Guaifenesin (Syrup)", category: "Cold, Cough & Allergy" },
  { name: "Cetirizine", comp: "Cetirizine Hydrochloride 10mg", category: "Cold, Cough & Allergy" },
  { name: "Levocet", comp: "Levocetirizine 5mg", category: "Cold, Cough & Allergy" },
  { name: "Allegra", comp: "Fexofenadine 120mg", category: "Cold, Cough & Allergy" },
  { name: "Montair LC", comp: "Montelukast 10mg + Levocetirizine 5mg", category: "Cold, Cough & Allergy" },
  { name: "Avil", comp: "Pheniramine Maleate 25mg", category: "Cold, Cough & Allergy" },
  { name: "Otrivin", comp: "Xylometazoline 0.1% Nasal Drops", category: "Cold, Cough & Allergy" },
  { name: "Nasivion", comp: "Oxymetazoline 0.05% Nasal Drops", category: "Cold, Cough & Allergy" },
  { name: "Vicks Action 500", comp: "Paracetamol 500mg + Phenylephrine 10mg + Caffeine 30mg", category: "Cold, Cough & Allergy" },

  /* ---------------- Antibiotics / Anti-infectives ---------------- */
  { name: "Augmentin 625", comp: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Antibiotics" },
  { name: "Amoxicillin", comp: "Amoxicillin 500mg", category: "Antibiotics" },
  { name: "Azithral 500", comp: "Azithromycin 500mg", category: "Antibiotics" },
  { name: "Azee", comp: "Azithromycin 500mg", category: "Antibiotics" },
  { name: "Ciplox", comp: "Ciprofloxacin 500mg", category: "Antibiotics" },
  { name: "Cifran", comp: "Ciprofloxacin 500mg", category: "Antibiotics" },
  { name: "Taxim-O", comp: "Cefixime 200mg", category: "Antibiotics" },
  { name: "Cefixime", comp: "Cefixime 200mg", category: "Antibiotics" },
  { name: "Zifi", comp: "Cefixime 200mg", category: "Antibiotics" },
  { name: "Levoflox", comp: "Levofloxacin 500mg", category: "Antibiotics" },
  { name: "Doxy 100", comp: "Doxycycline 100mg", category: "Antibiotics" },
  { name: "Metrogyl", comp: "Metronidazole 400mg", category: "Antibiotics" },
  { name: "Flagyl", comp: "Metronidazole 400mg", category: "Antibiotics" },
  { name: "Norflox-TZ", comp: "Norfloxacin 400mg + Tinidazole 600mg", category: "Antibiotics" },
  { name: "O2", comp: "Ofloxacin 200mg + Ornidazole 500mg", category: "Antibiotics" },
  { name: "Clavam", comp: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Antibiotics" },
  { name: "Monocef", comp: "Ceftriaxone 1g Injection", category: "Antibiotics" },
  { name: "Clindamycin", comp: "Clindamycin 300mg", category: "Antibiotics" },
  { name: "Linezolid", comp: "Linezolid 600mg", category: "Antibiotics" },
  { name: "Fluconazole", comp: "Fluconazole 150mg", category: "Antibiotics" },
  { name: "Nystatin", comp: "Nystatin 100000 IU (Oral Suspension)", category: "Antibiotics" },

  /* ---------------- Diabetes ---------------- */
  { name: "Glycomet", comp: "Metformin 500mg", category: "Diabetes" },
  { name: "Glucophage", comp: "Metformin 500mg", category: "Diabetes" },
  { name: "Gibtulio Met", comp: "Empagliflozin 12.5mg + Metformin 500mg", category: "Diabetes" },
  { name: "Jardiance", comp: "Empagliflozin 10mg", category: "Diabetes" },
  { name: "Januvia", comp: "Sitagliptin 100mg", category: "Diabetes" },
  { name: "Janumet", comp: "Sitagliptin 50mg + Metformin 500mg", category: "Diabetes" },
  { name: "Glimepiride", comp: "Glimepiride 2mg", category: "Diabetes" },
  { name: "Amaryl", comp: "Glimepiride 2mg", category: "Diabetes" },
  { name: "Glimestar-M", comp: "Glimepiride 1mg + Metformin 500mg", category: "Diabetes" },
  { name: "Forxiga", comp: "Dapagliflozin 10mg", category: "Diabetes" },
  { name: "Voglibose", comp: "Voglibose 0.3mg", category: "Diabetes" },
  { name: "Human Mixtard Insulin", comp: "Insulin (Human, Biphasic 30/70) Injection", category: "Diabetes" },
  { name: "Lantus", comp: "Insulin Glargine Injection", category: "Diabetes" },
  { name: "Novorapid", comp: "Insulin Aspart Injection", category: "Diabetes" },
  { name: "Pioglitazone", comp: "Pioglitazone 15mg", category: "Diabetes" },

  /* ---------------- Cardiovascular / Blood Pressure ---------------- */
  { name: "Telma 40", comp: "Telmisartan 40mg", category: "Cardiovascular" },
  { name: "Telmisartan", comp: "Telmisartan 40mg", category: "Cardiovascular" },
  { name: "Amlong", comp: "Amlodipine 5mg", category: "Cardiovascular" },
  { name: "Amlodipine", comp: "Amlodipine 5mg", category: "Cardiovascular" },
  { name: "Telma-AM", comp: "Telmisartan 40mg + Amlodipine 5mg", category: "Cardiovascular" },
  { name: "Losar", comp: "Losartan Potassium 50mg", category: "Cardiovascular" },
  { name: "Losartan", comp: "Losartan Potassium 50mg", category: "Cardiovascular" },
  { name: "Metoprolol", comp: "Metoprolol Succinate 25mg", category: "Cardiovascular" },
  { name: "Metolar XR", comp: "Metoprolol Succinate 25mg (Extended Release)", category: "Cardiovascular" },
  { name: "Concor", comp: "Bisoprolol Fumarate 5mg", category: "Cardiovascular" },
  { name: "Ecosprin", comp: "Aspirin 75mg", category: "Cardiovascular" },
  { name: "Clopitab", comp: "Clopidogrel 75mg", category: "Cardiovascular" },
  { name: "Ecosprin AV", comp: "Aspirin 75mg + Atorvastatin 10mg", category: "Cardiovascular" },
  { name: "Atorva", comp: "Atorvastatin 10mg", category: "Cardiovascular" },
  { name: "Rosuvas", comp: "Rosuvastatin 10mg", category: "Cardiovascular" },
  { name: "Lasix", comp: "Furosemide 40mg", category: "Cardiovascular" },
  { name: "Cardace", comp: "Ramipril 5mg", category: "Cardiovascular" },
  { name: "Nicardia", comp: "Nifedipine 10mg", category: "Cardiovascular" },
  { name: "Sorbitrate", comp: "Isosorbide Dinitrate 5mg", category: "Cardiovascular" },
  { name: "Digoxin", comp: "Digoxin 0.25mg", category: "Cardiovascular" },
  { name: "Warfarin", comp: "Warfarin Sodium 5mg", category: "Cardiovascular" },
  { name: "Xarelto", comp: "Rivaroxaban 10mg", category: "Cardiovascular" },

  /* ---------------- Gastrointestinal ---------------- */
  { name: "Pantop", comp: "Pantoprazole 40mg", category: "Gastrointestinal" },
  { name: "Pantocid", comp: "Pantoprazole 40mg", category: "Gastrointestinal" },
  { name: "Omez", comp: "Omeprazole 20mg", category: "Gastrointestinal" },
  { name: "Rabeprazole", comp: "Rabeprazole 20mg", category: "Gastrointestinal" },
  { name: "Pan-D", comp: "Pantoprazole 40mg + Domperidone 30mg", category: "Gastrointestinal" },
  { name: "Aciloc", comp: "Ranitidine 150mg", category: "Gastrointestinal" },
  { name: "Digene", comp: "Aluminium Hydroxide + Magnesium Hydroxide + Simethicone (Suspension)", category: "Gastrointestinal" },
  { name: "Gelusil", comp: "Aluminium Hydroxide + Magnesium Trisilicate (Suspension)", category: "Gastrointestinal" },
  { name: "Cyclopam", comp: "Dicyclomine 20mg + Paracetamol 500mg", category: "Gastrointestinal" },
  { name: "Ondansetron", comp: "Ondansetron 4mg", category: "Gastrointestinal" },
  { name: "Emeset", comp: "Ondansetron 4mg", category: "Gastrointestinal" },
  { name: "Domstal", comp: "Domperidone 10mg", category: "Gastrointestinal" },
  { name: "Sporlac", comp: "Lactobacillus Sporogenes 120mg (Probiotic)", category: "Gastrointestinal" },
  { name: "Enterogermina", comp: "Bacillus Clausii Spores (Probiotic)", category: "Gastrointestinal" },
  { name: "Lactulose", comp: "Lactulose Solution 10g/15ml", category: "Gastrointestinal" },
  { name: "Isabgol", comp: "Psyllium Husk", category: "Gastrointestinal" },
  { name: "Duphalac", comp: "Lactulose Solution", category: "Gastrointestinal" },
  { name: "Loperamide", comp: "Loperamide 2mg", category: "Gastrointestinal" },
  { name: "Electral", comp: "Oral Rehydration Salts", category: "Gastrointestinal" },

  /* ---------------- Respiratory / Asthma ---------------- */
  { name: "Asthalin", comp: "Salbutamol 100mcg Inhaler", category: "Respiratory" },
  { name: "Foracort", comp: "Formoterol 6mcg + Budesonide 200mcg Inhaler", category: "Respiratory" },
  { name: "Seroflo", comp: "Salmeterol 25mcg + Fluticasone 250mcg Inhaler", category: "Respiratory" },
  { name: "Duolin", comp: "Levosalbutamol 1.25mg + Ipratropium 0.5mg Respules", category: "Respiratory" },
  { name: "Budecort", comp: "Budesonide 200mcg Inhaler/Respules", category: "Respiratory" },
  { name: "Montek LC", comp: "Montelukast 10mg + Levocetirizine 5mg", category: "Respiratory" },
  { name: "Deriphyllin", comp: "Etofylline 77mg + Theophylline 23mg", category: "Respiratory" },
  { name: "Theo-Asthalin", comp: "Theophylline 150mg + Salbutamol 2mg", category: "Respiratory" },

  /* ---------------- Vitamins / Supplements ---------------- */
  { name: "Becosules", comp: "Vitamin B-Complex + Vitamin C", category: "Vitamins & Supplements" },
  { name: "Shelcal 500", comp: "Calcium Carbonate 500mg + Vitamin D3 250 IU", category: "Vitamins & Supplements" },
  { name: "Calcirol Sachet", comp: "Cholecalciferol (Vitamin D3) 60000 IU", category: "Vitamins & Supplements" },
  { name: "Neurobion Forte", comp: "Vitamin B1 + B6 + B12", category: "Vitamins & Supplements" },
  { name: "Zincovit", comp: "Multivitamin + Multimineral + Zinc", category: "Vitamins & Supplements" },
  { name: "Livogen", comp: "Ferrous Fumarate 300mg + Folic Acid 1.5mg", category: "Vitamins & Supplements" },
  { name: "Autrin", comp: "Iron + Folic Acid + Vitamin B12", category: "Vitamins & Supplements" },
  { name: "Folvite", comp: "Folic Acid 5mg", category: "Vitamins & Supplements" },
  { name: "Evion 400", comp: "Vitamin E 400mg", category: "Vitamins & Supplements" },
  { name: "Limcee", comp: "Vitamin C (Ascorbic Acid) 500mg", category: "Vitamins & Supplements" },
  { name: "Methylcobalamin", comp: "Methylcobalamin 1500mcg", category: "Vitamins & Supplements" },
  { name: "Omega-3", comp: "Fish Oil (EPA/DHA) 1000mg", category: "Vitamins & Supplements" },

  /* ---------------- Dermatology ---------------- */
  { name: "Betnovate-N", comp: "Betamethasone 0.1% + Neomycin (Cream)", category: "Dermatology" },
  { name: "Candid-B", comp: "Clotrimazole 1% + Beclomethasone (Cream)", category: "Dermatology" },
  { name: "Fucidin", comp: "Fusidic Acid 2% (Cream)", category: "Dermatology" },
  { name: "Soframycin", comp: "Framycetin Sulphate 1% (Ointment)", category: "Dermatology" },
  { name: "Panderm Plus", comp: "Clobetasol + Neomycin + Miconazole (Cream)", category: "Dermatology" },
  { name: "Ketoconazole", comp: "Ketoconazole 2% Cream / 200mg Tablet", category: "Dermatology" },
  { name: "Permethrin", comp: "Permethrin 5% Cream (Scabies)", category: "Dermatology" },
  { name: "Calamine Lotion", comp: "Calamine + Zinc Oxide Lotion", category: "Dermatology" },
  { name: "Isotretinoin", comp: "Isotretinoin 20mg", category: "Dermatology" },

  /* ---------------- Neurology / Psychiatry ---------------- */
  { name: "Escitalopram", comp: "Escitalopram Oxalate 10mg", category: "Neuro & Psychiatry" },
  { name: "Nexito", comp: "Escitalopram 10mg", category: "Neuro & Psychiatry" },
  { name: "Sertraline", comp: "Sertraline 50mg", category: "Neuro & Psychiatry" },
  { name: "Alprax", comp: "Alprazolam 0.25mg", category: "Neuro & Psychiatry" },
  { name: "Clonazepam", comp: "Clonazepam 0.5mg", category: "Neuro & Psychiatry" },
  { name: "Gabapentin", comp: "Gabapentin 300mg", category: "Neuro & Psychiatry" },
  { name: "Pregabalin", comp: "Pregabalin 75mg", category: "Neuro & Psychiatry" },
  { name: "Sizodon", comp: "Risperidone 2mg", category: "Neuro & Psychiatry" },
  { name: "Depakote", comp: "Divalproex Sodium 500mg", category: "Neuro & Psychiatry" },
  { name: "Levipil", comp: "Levetiracetam 500mg", category: "Neuro & Psychiatry" },
  { name: "Vertin", comp: "Betahistine 16mg", category: "Neuro & Psychiatry" },
  { name: "Stugeron", comp: "Cinnarizine 25mg", category: "Neuro & Psychiatry" },
  { name: "Amitriptyline", comp: "Amitriptyline 10mg", category: "Neuro & Psychiatry" },
  { name: "Donepezil", comp: "Donepezil 5mg", category: "Neuro & Psychiatry" },

  /* ---------------- Thyroid / Hormonal ---------------- */
  { name: "Thyronorm", comp: "Levothyroxine Sodium 50mcg", category: "Thyroid & Hormonal" },
  { name: "Eltroxin", comp: "Levothyroxine Sodium 50mcg", category: "Thyroid & Hormonal" },
  { name: "Neomercazole", comp: "Carbimazole 5mg", category: "Thyroid & Hormonal" },
  { name: "Metformin-Glimepiride", comp: "Metformin 500mg + Glimepiride 1mg", category: "Thyroid & Hormonal" },

  /* ---------------- Dental (matches clinic's own dental services) ---------------- */
  { name: "Metrogyl Denta", comp: "Metronidazole 1% + Chlorhexidine 0.25% Gel", category: "Dental" },
  { name: "Hexigel", comp: "Chlorhexidine Gluconate 1% Gel", category: "Dental" },
  { name: "Sensodent-K", comp: "Potassium Nitrate 5% Toothpaste", category: "Dental" },
  { name: "Clohex Mouthwash", comp: "Chlorhexidine Gluconate 0.2% Mouthwash", category: "Dental" },
  { name: "Amoxyclav 625 (Dental)", comp: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Dental" },
  { name: "Ketorol-DT", comp: "Ketorolac 10mg (Dispersible, dental pain)", category: "Dental" },

  /* ---------------- Oncology (reference names only) ---------------- */
  { name: "Tamoxifen", comp: "Tamoxifen Citrate 20mg", category: "Oncology" },
  { name: "Letrozole", comp: "Letrozole 2.5mg", category: "Oncology" },
  { name: "Anastrozole", comp: "Anastrozole 1mg", category: "Oncology" },
  { name: "Methotrexate", comp: "Methotrexate 2.5mg", category: "Oncology" },
  { name: "Cyclophosphamide", comp: "Cyclophosphamide 50mg", category: "Oncology" },
  { name: "Paclitaxel", comp: "Paclitaxel Injection", category: "Oncology" },
  { name: "Docetaxel", comp: "Docetaxel Injection", category: "Oncology" },
  { name: "Cisplatin", comp: "Cisplatin Injection", category: "Oncology" },
  { name: "Carboplatin", comp: "Carboplatin Injection", category: "Oncology" },
  { name: "5-Fluorouracil", comp: "Fluorouracil Injection", category: "Oncology" },
  { name: "Imatinib", comp: "Imatinib Mesylate 400mg", category: "Oncology" },
  { name: "Erlotinib", comp: "Erlotinib 150mg", category: "Oncology" },
  { name: "Trastuzumab", comp: "Trastuzumab Injection (Herceptin)", category: "Oncology" },
  { name: "Rituximab", comp: "Rituximab Injection", category: "Oncology" },
  { name: "Bevacizumab", comp: "Bevacizumab Injection (Avastin)", category: "Oncology" },
  { name: "Ondansetron (Onco supportive)", comp: "Ondansetron 8mg (Antiemetic, chemo support)", category: "Oncology" },
  { name: "Filgrastim", comp: "Filgrastim Injection (G-CSF, supportive care)", category: "Oncology" },
  { name: "Dexamethasone (Onco supportive)", comp: "Dexamethasone 4mg (Supportive care)", category: "Oncology" },

  /* ---------------- Steroids / Anti-inflammatory (general) ---------------- */
  { name: "Wysolone", comp: "Prednisolone 10mg", category: "Steroids" },
  { name: "Omnacortil", comp: "Prednisolone 10mg", category: "Steroids" },
  { name: "Dexona", comp: "Dexamethasone 0.5mg", category: "Steroids" },
  { name: "Deflazacort", comp: "Deflazacort 6mg", category: "Steroids" },
];

/* ---------------- Custom medicines (added by Admin) ---------------- */

const CUSTOM_MEDS_KEY = "medident_custom_meds_v1";

function getCustomMeds() {
  try {
    const raw = localStorage.getItem(CUSTOM_MEDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read custom medicines", e);
    return [];
  }
}

function saveCustomMeds(list) {
  try {
    localStorage.setItem(CUSTOM_MEDS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Failed to save custom medicines", e);
    return false;
  }
}

function addCustomMedicine(name, comp, category) {
  name = (name || "").trim();
  comp = (comp || "").trim();
  category = (category || "Custom").trim();
  if (!name) return false;
  const list = getCustomMeds();
  const idx = list.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
  if (idx >= 0) {
    list[idx] = { name, comp, category };
  } else {
    list.push({ name, comp, category });
  }
  saveCustomMeds(list);
  rebuildMedicineIndex();
  return true;
}

function deleteCustomMedicine(name) {
  const list = getCustomMeds().filter(m => m.name.toLowerCase() !== (name || "").toLowerCase());
  saveCustomMeds(list);
  rebuildMedicineIndex();
}

/* ---------------- Autocomplete wiring ---------------- */

let MEDICINE_LOOKUP = {};

function rebuildMedicineIndex() {
  const all = MEDICINE_DB.concat(getCustomMeds());

  // Rebuild the lookup used for auto-filling composition.
  MEDICINE_LOOKUP = all.reduce((map, m) => {
    map[m.name.toLowerCase()] = m;
    return map;
  }, {});

  // Rebuild the <datalist> options.
  let dl = document.getElementById("medDatalist");
  if (!dl) {
    dl = document.createElement("datalist");
    dl.id = "medDatalist";
    document.body.appendChild(dl);
  }
  dl.innerHTML = "";
  all.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.label = m.category ? `${m.comp} · ${m.category}` : m.comp;
    dl.appendChild(opt);
  });
}

function initMedicineAutocomplete() {
  rebuildMedicineIndex();
}

function wireMedNameAutofill(row) {
  const nameInput = row.querySelector(".med-name");
  const compInput = row.querySelector(".med-comp");
  if (!nameInput || !compInput) return;
  nameInput.setAttribute("list", "medDatalist");
  nameInput.setAttribute("autocomplete", "off");
  const tryFill = () => {
    const match = MEDICINE_LOOKUP[nameInput.value.trim().toLowerCase()];
    // Only auto-fill if the composition box is empty, so we never
    // overwrite something the doctor already typed/edited.
    if (match && !compInput.value.trim()) {
      compInput.value = match.comp;
    }
  };
  nameInput.addEventListener("change", tryFill);
  nameInput.addEventListener("blur", tryFill);
}
