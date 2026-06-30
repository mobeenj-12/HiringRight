export interface JobTemplate {
  title: string;
  category: string;
  description: string;
  suggestedWeights: {
    semantic: number;
    skills: number;
    experience: number;
    responsiveness: number;
    feasibility: number;
  };
}

export const jobTemplates: JobTemplate[] = [
  {
    title: "Senior AI / Machine Learning Engineer",
    category: "Technical (AI/ML)",
    suggestedWeights: {
      semantic: 45,
      skills: 25,
      experience: 15,
      responsiveness: 10,
      feasibility: 5
    },
    description: `We are seeking a Senior AI/ML Engineer to lead the design, development, and scaling of our next-generation generative AI products.

Key Responsibilities:
- Lead fine-tuning and optimization of Large Language Models (LLMs) using modern PEFT and LoRA techniques.
- Design high-performance semantic search, vector embeddings retrieval, and recommendation systems.
- Build and implement robust data pipelines, training workflows, and MLOps structures.
- Collaborate with product and engineering leads to prototype, validate, and deploy models to production.

Required Experience & Skills:
- 5+ years of active experience shipping production ML features.
- Deep expertise in PyTorch, NLP, Transformers, sentence-transformers, and vector databases (e.g., Pinecone, FAISS, Milvus).
- Solid coding practices in Python, and familiarity with MLOps (MLflow, Weights & Biases).
- Proven track record of evaluating and optimizing retrieval and ranking architectures.`
  },
  {
    title: "Lead Full-Stack Systems Engineer",
    category: "Technical (Full-Stack)",
    suggestedWeights: {
      semantic: 35,
      skills: 30,
      experience: 15,
      responsiveness: 10,
      feasibility: 10
    },
    description: `We are looking for a Senior Full-Stack Engineer who can build elegant, performant, and secure client-server architectures from the ground up.

Key Responsibilities:
- Design and implement robust backend services, REST APIs, and microservices in Node.js, Go, or Java.
- Create beautiful, fast, and accessible user interfaces using React, TypeScript, and modern styling solutions.
- Optimize database schemas (PostgreSQL, Redis) and handle event streaming on high-throughput queues.
- Configure and manage cloud deployments with CI/CD automation pipelines.

Required Experience & Skills:
- 6+ years of full-stack engineering experience inside SaaS or consumer product environments.
- Strong proficiency in modern React (hooks, memoization, state management) and TypeScript.
- Hands-on experience with backend queues (Kafka, gRPC) and containerized workflows (Docker, Kubernetes).`
  },
  {
    title: "Recruitment & Talent Operations Specialist",
    category: "Operational",
    suggestedWeights: {
      semantic: 30,
      skills: 15,
      experience: 20,
      responsiveness: 20,
      feasibility: 15
    },
    description: `We are hiring a Recruitment Operations Specialist to streamline screening processes, build active candidate relationships, and coordinate interview loops.

Key Responsibilities:
- Screen candidate profiles, conduct initial cultural fit interviews, and build premium talent shortlists.
- Handle active recruiter communication, maintain an ultra-fast average response time, and optimize the SDR handoff loop.
- Track candidate pipelines, manage on-site and remote coordination, and continuously improve interview completion metrics.
- Utilize ATS and data modeling tools to analyze sourcing performance and operational efficiency.

Required Experience & Skills:
- 3+ years of experience in recruitment agency, talent operations, or HR services.
- Superb written and verbal executive communication skills.
- High responsiveness, structured problem solving, and familiarity with agile process management.`
  }
];
