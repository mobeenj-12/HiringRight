import initialCandidates from "./initial_candidates.json" assert { type: "json" };

export interface Candidate {
  candidate_id: string;
  profile: {
    anonymized_name: string;
    headline: string;
    summary: string;
    location: string;
    country: string;
    years_of_experience: number;
    current_title: string;
    current_company: string;
    current_company_size: string;
    current_industry: string;
  };
  career_history: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string | null;
    duration_months: number;
    is_current: boolean;
    industry: string;
    company_size: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_year: number;
    end_year: number;
    grade: string | null;
    tier: "tier_1" | "tier_2" | "tier_3" | "tier_4" | "unknown";
  }>;
  skills: Array<{
    name: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
    endorsements: number;
    duration_months: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  languages: Array<{
    language: string;
    proficiency: "basic" | "conversational" | "professional" | "native";
  }>;
  redrob_signals: {
    profile_completeness_score: number;
    signup_date: string;
    last_active_date: string;
    open_to_work_flag: boolean;
    profile_views_received_30d: number;
    applications_submitted_30d: number;
    recruiter_response_rate: number;
    avg_response_time_hours: number;
    skill_assessment_scores: Record<string, number>;
    connection_count: number;
    endorsements_received: number;
    notice_period_days: number;
    expected_salary_range_inr_lpa: {
      min: number;
      max: number;
    };
    preferred_work_mode: "remote" | "hybrid" | "onsite" | "flexible";
    willing_to_relocate: boolean;
    github_activity_score: number;
    search_appearance_30d: number;
    saved_by_recruiters_30d: number;
    interview_completion_rate: number;
    offer_acceptance_rate: number;
    verified_email: boolean;
    verified_phone: boolean;
    linkedin_connected: boolean;
  };
}

// Generate high quality synthetic candidates to reach a substantial candidate database (125+ candidates)
export function generateTalentPool(): Candidate[] {
  const pool: Candidate[] = [...(initialCandidates as Candidate[])];

  const firstNames = ["Aarav", "Kabir", "Vihaan", "Shaurya", "Rohan", "Ananya", "Diya", "Saanvi", "Aditi", "Kavya", "Pranav", "Sai", "Vikram", "Ira", "Naina", "Myra", "Amit", "Rajesh", "Priya", "Rahul", "Neha", "Deepak", "Aisha", "Anika", "Rahul", "Dev", "Ela", "Avni", "Karan", "Yash", "Ritu", "Siddharth", "Ishaan", "Arjun", "Tanya", "Vivek", "Meera", "Riya", "Kunal", "Sneha"];
  const lastNames = ["Kapoor", "Sharma", "Nair", "Sethi", "Desai", "Agarwal", "Chatterjee", "Bose", "Vora", "Joshi", "Kumar", "Pandey", "Naidu", "Bansal", "Saxena", "Chowdary", "Sen", "Trivedi", "Mittal", "Rao", "Mukherjee", "Verma", "Malhotra", "Mehta", "Patel", "Gupta", "Reddy", "Iyengar", "Singh", "Pillai", "Krishnan", "Khanna"];

  const techRoles = [
    { title: "Senior ML Engineer", industry: "AI/ML", coreSkills: ["Python", "PyTorch", "NLP", "Fine-tuning LLMs", "Transformers", "scikit-learn", "MLOps", "TensorFlow"] },
    { title: "Backend Engineer", industry: "Software", coreSkills: ["Node.js", "Java", "Go", "PostgreSQL", "Kafka", "gRPC", "Redis", "Microservices", "REST APIs", "AWS"] },
    { title: "Frontend Engineer", industry: "Software", coreSkills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "Next.js", "Redux", "Figma", "Webpack"] },
    { title: "DevOps Engineer", industry: "Cloud", coreSkills: ["Docker", "Kubernetes", "Terraform", "AWS", "Azure", "GCP", "CI/CD", "Airflow", "Databricks"] },
    { title: "Data Engineer", industry: "Transportation", coreSkills: ["Spark", "Apache Beam", "SQL", "Snowflake", "BigQuery", "dbt", "Airflow", "Hadoop", "Scala"] },
    { title: "Product Manager", industry: "Product", coreSkills: ["Project Management", "Agile", "Scrum", "Excel", "PowerPoint", "Figma", "Marketing", "SEO", "Salesforce CRM"] }
  ];

  const locations = [
    { city: "Bangalore, Karnataka", country: "India" },
    { city: "Hyderabad, Telangana", country: "India" },
    { city: "Gurgaon, Haryana", country: "India" },
    { city: "Noida, Uttar Pradesh", country: "India" },
    { city: "Mumbai, Maharashtra", country: "India" },
    { city: "Pune, Maharashtra", country: "India" },
    { city: "Chennai, Tamil Nadu", country: "India" },
    { city: "Trivandrum, Kerala", country: "India" },
    { city: "San Francisco", country: "USA" },
    { city: "London", country: "UK" },
    { city: "Toronto", country: "Canada" },
    { city: "Dubai", country: "UAE" }
  ];

  const companies = ["Stark Industries", "Wayne Enterprises", "Globex Inc", "Acme Corp", "Dunder Mifflin", "Initech", "Pied Piper", "Hooli", "Wipro", "Infosys", "TCS", "Swiggy", "Zomato", "CRED", "Razorpay", "Flipkart", "Tech Mahindra", "Mindtree", "Cognizant"];
  const universities = ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kharagpur", "IISc Bangalore", "BITS Pilani", "Delhi College of Engineering", "SRM University", "VIT Chennai", "Christ University", "Lovely Professional University", "Chandigarh University", "Amity University"];

  // Generate up to 130 candidates to have a rich database of 130+ candidates
  for (let i = pool.length + 1; i <= 135; i++) {
    const candidate_id = `CAND_${String(i).padStart(7, "0")}`;
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const name = `${fn} ${ln}`;
    const roleConfig = techRoles[i % techRoles.length];
    const loc = locations[i % locations.length];

    const expYrs = parseFloat(((3 + (i % 12) * 0.9) + (i % 2 === 0 ? 0.3 : 0.0)).toFixed(1));
    const currentTitle = roleConfig.title;
    const currentCompany = companies[i % companies.length];
    const currentCompanySize = ["11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"][i % 8];

    // Generate skills with proficiency
    const candidateSkills = roleConfig.coreSkills.map((sk, idx) => {
      const isExpert = idx < 2 && idx % 2 === 0;
      const profs: ("beginner" | "intermediate" | "advanced" | "expert")[] = ["beginner", "intermediate", "advanced", "expert"];
      const prof = isExpert ? "expert" : profs[(idx + i) % 4];
      return {
        name: sk,
        proficiency: prof,
        endorsements: (idx * 5 + i * 3) % 45,
        duration_months: Math.floor(expYrs * 12 * (0.4 + (idx % 5) * 0.12))
      };
    });

    // Generate career history
    const careerHistory = [
      {
        company: currentCompany,
        title: currentTitle,
        start_date: "2024-03-08",
        end_date: null,
        duration_months: Math.floor(expYrs * 6),
        is_current: true,
        industry: roleConfig.industry + " Services",
        company_size: currentCompanySize,
        description: `Working as a ${currentTitle} driving key business outcomes. Responsibilities include designing and maintaining modular architectures, optimizing system flows, and collaborating with cross-functional teams using ${candidateSkills.slice(0, 3).map(s => s.name).join(", ")}.`
      }
    ];

    if (expYrs > 5) {
      careerHistory.push({
        company: companies[(i + 1) % companies.length],
        title: currentTitle.replace("Senior ", ""),
        start_date: "2020-07-03",
        end_date: "2024-01-08",
        duration_months: Math.floor(expYrs * 6),
        is_current: false,
        industry: "Technology",
        company_size: ["201-500", "501-1000", "10001+"][i % 3],
        description: `Developed, tested, and deployed client-facing applications and analytics tools. Owned system lifecycle and refactored critical components with heavy reliance on ${candidateSkills.slice(2, 5).map(s => s.name).join(", ")}.`
      });
    }

    // Generate education
    const uni = universities[i % universities.length];
    const degrees = ["B.Tech", "B.E.", "B.Sc", "M.Tech", "M.S.", "M.Sc", "Ph.D"];
    const fields = ["Computer Science", "Information Technology", "Data Science", "Artificial Intelligence", "Machine Learning", "Mathematics"];
    const tier = uni.includes("IIT") || uni.includes("IISc") ? "tier_1" : (uni.includes("BITS") || uni.includes("Delhi") ? "tier_2" : "tier_3");

    const education = [
      {
        institution: uni,
        degree: degrees[i % degrees.length],
        field_of_study: fields[i % fields.length],
        start_year: 2026 - Math.floor(expYrs) - 4,
        end_year: 2026 - Math.floor(expYrs),
        grade: `${(7.0 + (i % 25) * 0.08).toFixed(2)} CGPA`,
        tier: tier as "tier_1" | "tier_2" | "tier_3" | "tier_4" | "unknown"
      }
    ];

    // Generate redrob signals
    const completeness = parseFloat((65 + (i % 31) * 1.1).toFixed(1));
    const responseRate = parseFloat((0.2 + (i % 15) * 0.05).toFixed(2));
    const expectedSalaryMin = parseFloat((5.0 + (expYrs * 2.1) + (i % 5) * 1.2).toFixed(1));
    const expectedSalaryMax = parseFloat((expectedSalaryMin * (1.2 + (i % 3) * 0.1)).toFixed(1));

    const redrob_signals = {
      profile_completeness_score: completeness,
      signup_date: `2024-0${1 + (i % 9)}-15`,
      last_active_date: `2026-06-${10 + (i % 18)}`,
      open_to_work_flag: i % 3 === 0,
      profile_views_received_30d: (i * 4) % 150,
      applications_submitted_30d: i % 10,
      recruiter_response_rate: responseRate > 1 ? 0.95 : responseRate,
      avg_response_time_hours: parseFloat((10 + (i % 45) * 4.5).toFixed(1)),
      skill_assessment_scores: candidateSkills.reduce((acc, curr, idx) => {
        if (idx % 2 === 0) {
          acc[curr.name] = Math.floor(45 + (idx * 5 + i * 2) % 50);
        }
        return acc;
      }, {} as Record<string, number>),
      connection_count: (i * 12) % 900,
      endorsements_received: (i * 2) % 100,
      notice_period_days: [15, 30, 60, 90, 120][i % 5],
      expected_salary_range_inr_lpa: {
        min: expectedSalaryMin,
        max: expectedSalaryMax
      },
      preferred_work_mode: (["remote", "hybrid", "onsite", "flexible"] as const)[i % 4],
      willing_to_relocate: i % 2 === 0,
      github_activity_score: i % 4 === 0 ? -1 : (i * 5) % 100,
      search_appearance_30d: (i * 8) % 350,
      saved_by_recruiters_30d: i % 7,
      interview_completion_rate: parseFloat((0.4 + (i % 6) * 0.1).toFixed(2)),
      offer_acceptance_rate: i % 5 === 0 ? -1 : parseFloat((0.2 + (i % 4) * 0.15).toFixed(2)),
      verified_email: i % 5 !== 0,
      verified_phone: i % 7 !== 0,
      linkedin_connected: i % 3 !== 0
    };

    pool.push({
      candidate_id,
      profile: {
        anonymized_name: name,
        headline: `${roleConfig.title} | ${candidateSkills.slice(0, 3).map(s => s.name).join(", ")}`,
        summary: `Professional with ${expYrs}+ years of experience in ${roleConfig.industry}. Passionate about building robust architectures and working alongside modern tech stacks. Focused on scalability, clean code, and fast delivery. Curious about expanding competencies into generative AI features.`,
        location: loc.city,
        country: loc.country,
        years_of_experience: expYrs,
        current_title: currentTitle,
        current_company: currentCompany,
        current_company_size: currentCompanySize,
        current_industry: roleConfig.industry + " Services"
      },
      career_history: careerHistory,
      education,
      skills: candidateSkills,
      certifications: i % 5 === 0 ? [{ name: "AWS Certified Architect", issuer: "AWS", year: 2025 }] : [],
      languages: [
        { language: "English", proficiency: "professional" },
        { language: "Hindi", proficiency: i % 2 === 0 ? "conversational" : "professional" }
      ],
      redrob_signals
    });
  }

  return pool;
}

export interface RankWeights {
  semantic: number;      // weight of LLM semantic trajectory analysis
  skills: number;        // weight of core skill proficiency/experience match
  experience: number;    // weight of years of experience alignment
  responsiveness: number; // weight of active signals and recruiter response rate
  feasibility: number;   // weight of notice period, salary, and relocation readiness
}

export interface ScoredCandidate {
  candidate: Candidate;
  score: number;
  breakdown: {
    semantic: number;
    skills: number;
    experience: number;
    responsiveness: number;
    feasibility: number;
  };
  reasoning: string;
}

// Client-side quick rank heuristic, which is re-evaluated dynamically on the fly
export function rankCandidatesHeuristic(
  candidates: Candidate[],
  jobDescription: string,
  weights: RankWeights
): ScoredCandidate[] {
  // Normalized clean job description keywords
  const jdLower = jobDescription.toLowerCase();

  const scored: ScoredCandidate[] = candidates.map(cand => {
    // 1. Semantic Approximation Score (NLP similarity + current title match)
    let semanticScore = 0;
    const titleMatch = jdLower.includes(cand.profile.current_title.toLowerCase()) || 
                       cand.profile.current_title.toLowerCase().split(" ").some(w => w.length > 3 && jdLower.includes(w));
    
    if (titleMatch) semanticScore += 50;
    
    // Check keyword presence in summary/headline
    const bioText = (cand.profile.headline + " " + cand.profile.summary).toLowerCase();
    let bioMatchCount = 0;
    const keyRoles = ["ml", "machine learning", "backend", "frontend", "product", "devops", "data", "engineer", "python", "react", "node", "java", "sql", "spark", "kubernetes"];
    
    keyRoles.forEach(role => {
      if (jdLower.includes(role) && bioText.includes(role)) {
        bioMatchCount++;
      }
    });
    
    semanticScore += Math.min(bioMatchCount * 8, 50);

    // 2. Skill Proficiency & Duration Score
    let skillScore = 0;
    let matchCount = 0;
    cand.skills.forEach(skill => {
      const sName = skill.name.toLowerCase();
      if (jdLower.includes(sName)) {
        matchCount++;
        let profMultiplier = 0.5;
        if (skill.proficiency === "expert") profMultiplier = 1.0;
        else if (skill.proficiency === "advanced") profMultiplier = 0.8;
        else if (skill.proficiency === "intermediate") profMultiplier = 0.6;
        
        // Duration and endorsement bonus
        const durationBonus = Math.min(skill.duration_months / 48, 1.2);
        skillScore += profMultiplier * 20 * durationBonus;
      }
    });
    const skillsMatchedScore = matchCount > 0 ? Math.min(skillScore, 100) : 10;

    // 3. Experience Match Score
    // Parse years of experience from JD if any (e.g. "5 years", "3+ years")
    let targetExp = 5; // default target
    const expMatch = jdLower.match(/(\d+)\+?\s*years?/);
    if (expMatch) {
      targetExp = parseInt(expMatch[1]);
    }
    
    const expDiff = Math.abs(cand.profile.years_of_experience - targetExp);
    const experienceScore = Math.max(0, 100 - (expDiff * 12)); // Lose 12% per year of mismatch

    // 4. Responsiveness & Active Signals Score
    let respScore = 0;
    const activeDaysBonus = cand.redrob_signals.open_to_work_flag ? 30 : 0;
    const completenessBonus = cand.redrob_signals.profile_completeness_score * 0.3; // max 30
    const responseRateBonus = cand.redrob_signals.recruiter_response_rate * 40; // max 40
    respScore = activeDaysBonus + completenessBonus + responseRateBonus;

    // 5. Feasibility Score (Notice period, Expected Salary, Relocation)
    let feasibilityScore = 70; // baseline
    if (cand.redrob_signals.notice_period_days <= 30) feasibilityScore += 15;
    else if (cand.redrob_signals.notice_period_days >= 90) feasibilityScore -= 15;

    if (cand.redrob_signals.willing_to_relocate || cand.redrob_signals.preferred_work_mode === "remote") {
      feasibilityScore += 15;
    }

    // Salary alignment (low expected salary is a feasibility bonus, very high might exceed budget)
    if (cand.redrob_signals.expected_salary_range_inr_lpa.max < 15) feasibilityScore += 10;
    else if (cand.redrob_signals.expected_salary_range_inr_lpa.min > 30) feasibilityScore -= 15;

    feasibilityScore = Math.min(100, Math.max(0, feasibilityScore));

    // Combine using the weight multipliers
    const totalWeight = weights.semantic + weights.skills + weights.experience + weights.responsiveness + weights.feasibility;
    const overallScore = (
      (semanticScore * weights.semantic) +
      (skillsMatchedScore * weights.skills) +
      (experienceScore * weights.experience) +
      (respScore * weights.responsiveness) +
      (feasibilityScore * weights.feasibility)
    ) / (totalWeight || 1);

    // Create a realistic Reasoning string for display
    let reasoning = "";
    if (titleMatch) {
      reasoning += `${cand.profile.current_title} with ${cand.profile.years_of_experience} yrs; `;
    } else {
      reasoning += `${cand.profile.current_title} transitioning; `;
    }
    reasoning += `${matchCount} matched skills; `;
    reasoning += cand.redrob_signals.open_to_work_flag ? "actively seeking." : `response rate ${(cand.redrob_signals.recruiter_response_rate * 100).toFixed(0)}%.`;

    return {
      candidate: cand,
      score: parseFloat(overallScore.toFixed(4)),
      breakdown: {
        semantic: parseFloat(semanticScore.toFixed(1)),
        skills: parseFloat(skillsMatchedScore.toFixed(1)),
        experience: parseFloat(experienceScore.toFixed(1)),
        responsiveness: parseFloat(respScore.toFixed(1)),
        feasibility: parseFloat(feasibilityScore.toFixed(1))
      },
      reasoning
    };
  });

  // Sort and apply tie-breaker rules:
  // 1. Sort by Score descending
  // 2. Tie-break: candidate_id ascending
  return scored.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 0.00001) {
      return b.score - a.score;
    }
    // Tie breaker: candidate_id ascending (alphabetical)
    return a.candidate.candidate_id.localeCompare(b.candidate.candidate_id);
  });
}
