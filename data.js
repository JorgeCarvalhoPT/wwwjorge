const CV = {
  name: "0xB@ne",
  handle: "0xB@ne",
  title: "Application Security Engineer",
  company: "Nedap",
  location: "Portugal",
  pronouns: "",

  tagline: "Breaking software and AI before the attackers do.",

  about: [
    "Hi, I'm 0xB@ne.",
    "",
    "I'm self-taught — everything I know I learned on my own: reading,",
    "building projects, breaking things, and a lot of hands-on practice.",
    "",
    "I pick things up fast, and I'm driven by curiosity and a constant",
    "will to learn more — there's always a next thing to take apart,",
    "understand, and master.",
  ],

  experience: [
    {
      role: "Application Security Engineer",
      company: "Nedap",
      period: "20XX — Present",
      location: "",
      bullets: [
        "Embed security across the SDLC: threat modelling, secure code review, and developer enablement.",
        "Drive AI security efforts — assessing LLM-powered features for prompt injection and data leakage.",
        "Add metrics where you can (vulns reduced, coverage, time-to-remediate).",
      ],
      stack: ["AppSec", "Threat Modeling", "SAST/DAST", "SCA", "AI Security"],
    },
  ],

  education: [],

  skills: {
    AppSec: ["Threat Modeling", "Secure Code Review", "SAST / DAST", "SCA", "SDLC Security", "Vulnerability Management"],
    "AI Security": ["LLM Security", "Prompt Injection", "OWASP LLM Top 10", "Model / Pipeline Security"],
    Offensive: ["Web Application Pentesting", "API Security Testing", "AI Red Team", "Burp Suite", "OWASP Top 10"],
  },

  projects: [
    {
      name: "NullPointer",
      desc: "Open-source holistic application security ecosystem — offensive & defensive tooling: Agent-Smith (AI pentesting agent), Seraph (semantic guardrail proxy for LLM apps), and a Skills methodology library (OWASP ASVS / LLM Top 10 / MITRE ATT&CK).",
      link: "https://nullpointer.studio/",
      stack: ["AI Security", "LLM Guardrails", "Python", "FastAPI", "Docker", "MCP", "LangGraph"],
    },
    {
      name: "Agent-Smith",
      desc: "Open-source AI-driven penetration testing framework — chains 50+ tools and uses LLMs to invent contextual attacks, generate Burp-ready PoCs, threat models and patches. Runs augmented (human-steered) or fully autonomous, sandboxed in ephemeral Docker containers via an MCP server.",
      link: "https://github.com/0x0pointer/agent-smith",
      stack: ["AI Security", "Pentesting", "LLM Agents", "Python", "FastAPI", "Docker", "MCP", "AGPL-3.0"],
    },
    {
      name: "Seraph",
      desc: "Transparent security proxy for LLM APIs — a drop-in endpoint (OpenAI / Anthropic / Ollama) that scans requests and responses through a dual-layer guardrail: a semantic allow-list plus local Mistral-7B threat evaluation. Single-YAML config, streaming support, hot-reload.",
      link: "https://github.com/0x0pointer/seraph",
      stack: ["AI Security", "LLM Guardrails", "Python", "NeMo Guardrails", "LangGraph", "Mistral 7B", "Docker"],
    },
  ],

  certifications: [
    { name: "eJPT", issuer: "INE Security", year: "" },
    { name: "PNPT", issuer: "TCM Security", year: "" },
    { name: "OSWA", issuer: "OffSec", year: "" },
    { name: "AIRTP+", issuer: "Learn Prompting", year: "" },
  ],

  courses: [
    "Hands-on cohort — Attacking & Defending AI Apps & Agents",
    "Attacking AI — Jason Haddix",
  ],

  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "English", level: "Fluent" },
  ],

  contact: {
    discord: "843792287556829184",
    discordServer: "https://discord.gg/Pg6gBbr2Vj",
    linkedin: "https://www.linkedin.com/in/jorgecarvalhopt/",
    github: "https://github.com/0x0pointer",
    website: "https://nullpointer.studio/",
  },
};
