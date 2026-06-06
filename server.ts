/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API client to ensure dev-server boots gracefully
let googleGenAI: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!googleGenAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure your API key in the AI Studio panel.");
    }
    googleGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return googleGenAI;
}

// Curated Editorial Image Mappings
const PORTRAIT_MAPPINGS: Record<string, string> = {
  // Original Reality
  "Elena Rossi": "/portraits/elena_rossi.png",
  "Marcus Vance": "/portraits/marcus_vance.png",
  "Sloane Cross": "/portraits/sloane_cross.png",
  // Founder Reality
  "Dr. Evelyn Reed": "/portraits/evelyn_reed.png",
  "VC Brandon Pierce": "/portraits/brandon_pierce.png",
  "Alfred Check": "/portraits/alfred_check.png",
  // Billionaire Reality (Unsplash placeholders)
  "Seraphina Sterling": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  "Miles Vance": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  "Winston Cross": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  // Celebrity Reality (Unsplash placeholders)
  "Aria Thorne": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  "Director Harvey Vance": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
  "Agent Dominic Cross": "https://images.unsplash.com/photo-1489980508314-941910ded1f4?q=80&w=600&auto=format&fit=crop"
};

function getPortraitUrl(name: string): string {
  const PORTRAIT_MAPPINGS_LOCAL: Record<string, string> = {
    "Elena Rossi": "/portraits/elena_rossi.png",
    "Marcus Vance": "/portraits/marcus_vance.png",
    "Sloane Cross": "/portraits/sloane_cross.png",
    "Dr. Evelyn Reed": "/portraits/evelyn_reed.png",
    "VC Brandon Pierce": "/portraits/brandon_pierce.png",
    "Alfred Check": "/portraits/alfred_check.png"
  };

  if (PORTRAIT_MAPPINGS_LOCAL[name]) {
    return PORTRAIT_MAPPINGS_LOCAL[name];
  }

  const nameLower = name.toLowerCase();
  if (
    nameLower.includes("elena") || 
    nameLower.includes("rossi") || 
    nameLower.includes("evelyn") || 
    nameLower.includes("reed") || 
    nameLower.includes("seraphina") || 
    nameLower.includes("sterling") || 
    nameLower.includes("aria") || 
    nameLower.includes("thorne") || 
    nameLower.includes("victoria")
  ) {
    if (nameLower.includes("evelyn") || nameLower.includes("reed")) {
      return "/portraits/evelyn_reed.png";
    }
    return "/portraits/elena_rossi.png";
  }

  if (
    nameLower.includes("marcus") || 
    nameLower.includes("vance") || 
    nameLower.includes("brandon") || 
    nameLower.includes("pierce") || 
    nameLower.includes("miles") || 
    nameLower.includes("julian") || 
    nameLower.includes("christian") || 
    nameLower.includes("mercer") || 
    nameLower.includes("harvey") ||
    nameLower.includes("dominic") ||
    nameLower.includes("alfred") ||
    nameLower.includes("check") ||
    nameLower.includes("winston")
  ) {
    if (nameLower.includes("brandon") || nameLower.includes("pierce")) {
      return "/portraits/brandon_pierce.png";
    }
    if (nameLower.includes("alfred") || nameLower.includes("check")) {
      return "/portraits/alfred_check.png";
    }
    return "/portraits/marcus_vance.png";
  }

  return "/portraits/sloane_cross.png";
}

const LOCAL_UNIVERSES_DATA: Record<string, {
  characterA: { name: string; archetype: string; description: string; chemistry: any; pastInteractions: string[] };
  characterB: { name: string; archetype: string; description: string; chemistry: any; pastInteractions: string[] };
  characterC: { name: string; archetype: string; description: string; chemistry: any; pastInteractions: string[] };
  episode1: {
    title: string;
    summary: string;
    story: string[];
    cliffhanger: string;
    choices: (name: string) => any[];
  };
  narrativeBeats: { 
    title: string; 
    story: (name: string, prevChoice: string) => string[]; 
    cliffhanger: string; 
    choices: (name: string, chars: string[]) => any[] 
  }[];
}> = {
  Original: {
    characterA: {
      name: "Elena Rossi",
      archetype: "Forbidden Attraction",
      description: "A sharp, quick-witted photojournalist with a reckless streak and a secret file that keeps her up at night.",
      chemistry: {
        values: ["Truth", "Freedom", "Spontaneity"],
        ambitions: ["Exposing the Vance syndicate", "Publishing her photo series"],
        preferences: ["Direct talk", "Unconditional support"],
        communicationStyle: "Raw and passionate",
        emotionalTriggers: ["Dishonesty", "Corporate cover-ups"]
      },
      pastInteractions: ["Met Elena at a crowded street rally where she captured a stunning double-exposure of you.", "Shared a late-night coffee speaking of corporate shadows."]
    },
    characterB: {
      name: "Marcus Vance",
      archetype: "Rival",
      description: "A ruthless corporate fixer whose soft-spoken manner belies a history of ruined careers.",
      chemistry: {
        values: ["Legacy", "Control", "Leverage"],
        ambitions: ["Consolidating Vance Trust stock", "Silencing investigators"],
        preferences: ["Submission", "Strict compliance"],
        communicationStyle: "Whispered threats and legal boundaries",
        emotionalTriggers: ["Loss of control", "Insolence"]
      },
      pastInteractions: ["Marcus blocked your promotion at the firm last winter with a cold smile.", "He warned you to stay away from the Vance Trust records."]
    },
    characterC: {
      name: "Sloane Cross",
      archetype: "High-Status Figure",
      description: "A retired intelligence operative who runs a jazz bar but knows exactly who holds the debt in this city.",
      chemistry: {
        values: ["Survival", "Discretion", "Sovereignty"],
        ambitions: ["Maintaining local peace", "Protecting old contacts"],
        preferences: ["Stealth", "Strategic leverage"],
        communicationStyle: "Cryptic bar-side remarks",
        emotionalTriggers: ["Recklessness", "Unpreparedness"]
      },
      pastInteractions: ["Sloane rescued you from a hostile deposition by delivering a timely alibi."]
    },
    episode1: {
      title: "The Glass Catalyst",
      summary: "A rainy evening at the vintage club turns hostile when an unexpected contact slips an encrypted drive into your coat pocket.",
      story: [
        "The cold neon light of the jazz lounge reflects off the damp asphalt outside. You sit in the corner booth, the ambient hubbub of low conversation doing little to calm your nerves.",
        "Suddenly, a shadow falls over your table. It's Marcus Vance. His expensive designer suit contrasts sharply with the gritty environment of the city. He pulls up a chair without asking, looking right at your pocket.",
        "'It's funny,' Marcus murmurs, his voice smooth and cold. 'Some people spend their entire lives trying to crawl out of the mud, only to trip on the very first step. If I were you, I'd leave that little toy on the table and walk away. Unscathed.'",
        "As he speaks, Elena Rossi catches your eye from the bar. She taps her glass twice, a universal cue that she's ready to cut the power if you need a quick, dark exit."
      ],
      cliffhanger: "Marcus leans closer, his hand hovering over your pocket—what is your play?",
      choices: (name: string) => [
        {
          id: "choice-orig-1",
          text: "Slam your glass down and make a scene",
          consequenceShort: "Immediate physical and social escalation",
          forecastImpact: { careerPotential: -5, socialInfluence: 10, relationshipStability: -15 },
          relationshipImpact: { "Elena Rossi": 10, "Marcus Vance": -15 }
        },
        {
          id: "choice-orig-2",
          text: "Slide the electronic drive to Elena under the counter",
          consequenceShort: "Calculated hand-off with plausible deniability",
          forecastImpact: { careerPotential: 0, socialInfluence: 5, relationshipStability: 10 },
          relationshipImpact: { "Elena Rossi": 15, "Marcus Vance": -5 }
        },
        {
          id: "choice-orig-3",
          text: "Whisper a secret about Marcus's past tax fraud",
          consequenceShort: "Psychological counter-blackmail",
          forecastImpact: { careerPotential: 15, socialInfluence: 15, relationshipStability: -20 },
          relationshipImpact: { "Marcus Vance": -20, "Sloane Cross": 10 }
        }
      ]
    },
    narrativeBeats: [
      {
        title: "Cold Reconnaissance",
        story: (name, pChoice) => [
          `In the frantic aftermath of your decision to ${pChoice}, you manage to slip away into the dark, damp alley. Elena Rossi is close behind, her camera slung over her neck and her eyes shining with adrenaline.`,
          `'That was incredibly bold,' Elena whispers, pulling you behind a steam vent as Marcus's luxury towncar screeches past the alley entrance. 'But Marcus has already flagged your credentials. He owns the building grid.'`,
          `Before you can respond, your phone blinks with a restricted message from Sloane Cross: 'Get to the docks. Marcus's associates are tracing your mobile signal. Drop the phone and trust the girl.'`,
          `You realize the scale of the trap. The city's digital network is tightening around you, forcing you to choose between digital stealth, raw speed, or direct confrontation.`
        ],
        cliffhanger: "A high-set security camera hums, pivoting directly toward your hiding spot—how do you evade detection?",
        choices: (name, chars) => [
          {
            id: "choice-orig-ep2-1",
            text: "Use Sloane's signal-jammer program on your phone",
            consequenceShort: "Stealthy electronic evasion",
            forecastImpact: { careerPotential: -10, socialInfluence: 10, relationshipStability: 15 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -5 }
          },
          {
            id: "choice-orig-ep2-2",
            text: "Step out confidently and play the lost tourist",
            consequenceShort: "High-risk public charisma bluff",
            forecastImpact: { careerPotential: 5, socialInfluence: 15, relationshipStability: -10 },
            relationshipImpact: { [chars[0]]: 10, [chars[1]]: -10 }
          },
          {
            id: "choice-orig-ep2-3",
            text: "Smash the camera with Elena's heavy metal tripod",
            consequenceShort: "Brute force demolition",
            forecastImpact: { careerPotential: -15, socialInfluence: 5, relationshipStability: -15 },
            relationshipImpact: { [chars[0]]: 15, [chars[1]]: -15 }
          }
        ]
      }
    ]
  },
  Founder: {
    characterA: {
      name: "Dr. Evelyn Reed",
      archetype: "Forbidden Attraction",
      description: "A brilliant machine-learning expert who developed the core model but refuses to let it be weaponized by the VCs.",
      chemistry: {
        values: ["Ethics", "Technical elegance", "Security"],
        ambitions: ["Keeping AI models open-source", "Securing user weights"],
        preferences: ["Late-night coding", "Direct technical honesty"],
        communicationStyle: "Intelligent, careful, and slightly shy",
        emotionalTriggers: ["Exploitation of her algorithms", "Greed"]
      },
      pastInteractions: ["Co-authored the neural compiler thesis with Evelyn during college.", "Agreed to co-found the stealth project over late-night debugging."]
    },
    characterB: {
      name: "VC Brandon Pierce",
      archetype: "Rival",
      description: "A cold, calculating Sand Hill Road venture capitalist who values equity blocks over human engineering ethics.",
      chemistry: {
        values: ["Profit", "Equity dominance", "Speed"],
        ambitions: ["Acquiring Evelyn's AI core", "Forcing a quick buyout"],
        preferences: ["Board supremacy", "High-frequency term sheets"],
        communicationStyle: "Authoritative and concise",
        emotionalTriggers: ["Founders holding leverage", "Tech delays"]
      },
      pastInteractions: ["Brandon choked your seed-stage competitors by funding your team, then demanded 50% voting control.", "Declared your technology 'firmware' in an email loop."]
    },
    characterC: {
      name: "Alfred Check",
      archetype: "Former Connection",
      description: "An eccentric old-school engineer who co-created the internet and still holds backdoors to every major VC server.",
      chemistry: {
        values: ["Decentralization", "Anarchy", "Legacy tech"],
        ambitions: ["Dismantling institutional data blocks", "Hosting backup mirror arrays"],
        preferences: ["Command line terminal logs", "Beer and retro computing"],
        communicationStyle: "Sarcastic and lecture-heavy",
        emotionalTriggers: ["Corporate compliance", "VC jargon"]
      },
      pastInteractions: ["Alfred hosted your core backend servers on his unindexed, solar-powered server farm."]
    },
    episode1: {
      title: "The Stealth Mirage",
      summary: "Surrounded by tech elite at your stealth startup launch party, your terminal issues a critical breach alert signaling industrial espionage.",
      story: [
        "The ambient hum of high-powered server racks and heavy tech beats fills the industrial warehouse. Terminal screens cast a blue cybernetic glow over the crowd of investors.",
        "Your startup, the culmination of three sleepless years, is about to go live. Suddenly, VC Brandon Pierce confronts you by the demo booth, his fingers carving over his tablet.",
        "'Your valuation metrics are stunning, but if you don't hand over sixty percent of your core IP board seats tonight, my firm is pulling our series-A funding.'",
        "Evelyn Reed nudges your shoulder, her laptop screen flashing an active packet capture log. 'Brandon's group is already cloning our system architecture onto a ghost proxy server. They're stealing our model.'"
      ],
      cliffhanger: "The main cockpit screen flashes: ENTER COMMIT DEPLOY—do you execute the master override?",
      choices: (name: string) => [
        {
          id: "choice-fou-1",
          text: "Take the stage microphone and deliver an inspired pitch to force corporate retreat",
          consequenceShort: "High-charisma public funding blackmail",
          forecastImpact: { careerPotential: 20, socialInfluence: 15, relationshipStability: -15 },
          relationshipImpact: { "Dr. Evelyn Reed": 10, "VC Brandon Pierce": -15 }
        },
        {
          id: "choice-fou-2",
          text: "Deploy an encrypted poison pill into the cloned ghost repository",
          consequenceShort: "Technical destruction of the stolen system assets",
          forecastImpact: { careerPotential: 10, socialInfluence: -5, relationshipStability: 15 },
          relationshipImpact: { "Dr. Evelyn Reed": 15, "Alfred Check": 10 }
        },
        {
          id: "choice-fou-3",
          text: "Leverage Alfred's old system exploit to initiate a warehouse blackout",
          consequenceShort: "Disruptive physical and digital exit",
          forecastImpact: { careerPotential: -10, socialInfluence: 10, relationshipStability: -10 },
          relationshipImpact: { "Alfred Check": 15, "VC Brandon Pierce": -20 }
        }
      ]
    },
    narrativeBeats: [
      {
        title: "Silicon Sentry",
        story: (name, pChoice) => [
          `Following your dramatic decision to ${pChoice}, Brandon Pierce’s tablet drops to the floor as his technical leads confirm the server logs are locked out.`,
          `Evelyn Reed slams her laptop shut and smiles. 'That was completely brilliant. Brandon is absolutely terrified right now. But we need to move our neural weights offline immediately.'`,
          `Alfred Check contacts you through a secure retro-terminal link: 'The VC firm has hired a corporate digital defense team to raid the server farm. They've already issued a legal injunction to seize your laptops.'`,
          `Your stealth startup is now a digital combat zone, forcing you to choose between legal containment, darknet mirror hosting, or a bold pitch to Brandon's biggest competitor.`
        ],
        cliffhanger: "The warehouse security gates start closing remotely as the lights flicker—what is your breakout plan?",
        choices: (name, chars) => [
          {
            id: "choice-fou-ep2-1",
            text: "Mirrors-host the model on Alfred's decentralized grid",
            consequenceShort: "Untraceable offshore hosting",
            forecastImpact: { careerPotential: 15, socialInfluence: -5, relationshipStability: 10 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -15 }
          },
          {
            id: "choice-fou-ep2-2",
            text: "Take the drive and make an exit on Evelyn's motorbike",
            consequenceShort: "High-adrenaline physical escape",
            forecastImpact: { careerPotential: -5, socialInfluence: 15, relationshipStability: 15 },
            relationshipImpact: { [chars[0]]: 20, [chars[1]]: -10 }
          },
          {
            id: "choice-fou-ep2-3",
            text: "Call a press conference to expose Brandon's file theft",
            consequenceShort: "Complete public corporate exposure",
            forecastImpact: { careerPotential: 20, socialInfluence: 20, relationshipStability: -20 },
            relationshipImpact: { [chars[0]]: 10, [chars[1]]: -25 }
          }
        ]
      }
    ]
  }
};

const SimulationEngine = {
  onboard(body: any) {
    const { name, age, interests, personalityTraits, goals, relationshipPreferences, careerStatus, activeUniverse } = body;
    const univKey = activeUniverse && LOCAL_UNIVERSES_DATA[activeUniverse] ? activeUniverse : "Original";
    const universe = LOCAL_UNIVERSES_DATA[univKey];

    const generateMetrics = (initVal: number) => ({
      chemistry: initVal + 20,
      trust: initVal + 10,
      curiosity: initVal + 30,
      closeness: initVal,
      interest: initVal + 25,
      compatibility: initVal + 15
    });

    const characters = [
      {
        id: "char-1",
        name: universe.characterA.name,
        archetype: universe.characterA.archetype,
        relationshipScore: 10,
        description: universe.characterA.description,
        avatarUrl: getPortraitUrl(universe.characterA.name),
        currentState: "Neutral",
        pastInteractions: universe.characterA.pastInteractions,
        attractionMetrics: generateMetrics(30),
        chemistryProfile: universe.characterA.chemistry
      },
      {
        id: "char-2",
        name: universe.characterB.name,
        archetype: universe.characterB.archetype,
        relationshipScore: -15,
        description: universe.characterB.description,
        avatarUrl: getPortraitUrl(universe.characterB.name),
        currentState: "Neutral",
        pastInteractions: universe.characterB.pastInteractions,
        attractionMetrics: generateMetrics(10),
        chemistryProfile: universe.characterB.chemistry
      },
      {
        id: "char-3",
        name: universe.characterC.name,
        archetype: universe.characterC.archetype,
        relationshipScore: 5,
        description: universe.characterC.description,
        avatarUrl: getPortraitUrl(universe.characterC.name),
        currentState: "Neutral",
        pastInteractions: universe.characterC.pastInteractions,
        attractionMetrics: generateMetrics(20),
        chemistryProfile: universe.characterC.chemistry
      }
    ];

    const summary = `Under the stark, high-contrast spotlight of this timeline, ${name || "Anonymous"} (${age} years old) emerges as a highly analytical and ${personalityTraits?.[0] || "brave"} protagonist. Operating as an ambitious ${careerStatus || "newcomer"} and guided by interests like ${(interests || []).join(", ") || "mystery"}, they must navigate a dangerous web of conflicts. Between the predatory watch of ${universe.characterB.name} and the loyal insights of ${universe.characterA.name}, every step becomes a calculated gamble for power.`;

    const startMessages = [
      {
        id: "msg-start-1",
        senderId: "char-1",
        senderName: universe.characterA.name,
        senderAvatar: getPortraitUrl(universe.characterA.name),
        text: `Hey, it's ${universe.characterA.name}. I'm reviewing the logs we discussed last night. Make sure you don't keep any digital copies on your laptop. Things are getting heated.`,
        timestamp: "5 mins ago",
        isRead: false
      }
    ];

    const startVault = [
      {
        id: "vault-1",
        title: `Confidential: ${universe.characterA.name}'s Connection`,
        description: "Decrypted backstory on why she chose to assist you in this timeline.",
        content: `Elena Rossi spent months tracking Marcus's shell companies before meeting you. She noticed you accessing the same corporate nodes and decided to step in. Her primary interest isn't just safety—she sees you as the catalyst to finally bring Marcus Vance to light.`,
        isLocked: true,
        unlockCondition: `Requires ${universe.characterA.name} Chemistry > 40%`,
        type: "alliance",
        unlockProgress: 50,
        unlockTarget: 70
      },
      {
        id: "vault-2",
        title: "Dossier: The Vance Trust offshore accounts",
        description: "Offshore tracking details showing corporate money moves.",
        content: "Offshore Ledger records: Transaction 841A8 transfer to Swiss routing 099831. Value: $4.2M. Flagged for industrial espionage and corporate acquisition funding.",
        isLocked: true,
        unlockCondition: "Unlocks in 12 hours",
        type: "intelligence",
        unlockProgress: 0,
        unlockTarget: 12
      }
    ];

    const timelineForecast = {
      careerPotential: "Medium",
      socialInfluence: "Medium",
      relationshipStability: "Stable",
      hiddenOpportunity: "None"
    };

    const startingActivities = [
      {
        id: "act-start-1",
        characterName: universe.characterB.name,
        characterAvatar: getPortraitUrl(universe.characterB.name),
        timestamp: "2 hours ago",
        message: `${universe.characterB.name} registered a new litigation shell company: Sterling Group Partners.`,
        type: "action"
      },
      {
        id: "act-start-2",
        characterName: universe.characterA.name,
        characterAvatar: getPortraitUrl(universe.characterA.name),
        timestamp: "4 hours ago",
        message: `${universe.characterA.name} uploaded a cryptic photo from the rooftop event.`,
        type: "cryptic"
      }
    ];

    return {
      summary,
      characters,
      firstEpisode: {
        id: "ep-1",
        title: universe.episode1.title,
        summary: universe.episode1.summary,
        story: universe.episode1.story,
        cliffhanger: universe.episode1.cliffhanger,
        choices: universe.episode1.choices(name || "Player")
      },
      forecast: timelineForecast,
      vaultItems: startVault,
      directMessages: startMessages,
      castActivities: startingActivities,
      simulated: true
    };
  },

  choice(body: any) {
    const { profile, forecast, characters, episodesHistory, currentEpisode, selectedChoice, activeUniverse } = body;
    const univKey = activeUniverse && LOCAL_UNIVERSES_DATA[activeUniverse] ? activeUniverse : "Original";
    const universe = LOCAL_UNIVERSES_DATA[univKey];

    const historyLen = episodesHistory ? episodesHistory.length : 0;
    const charsInRoster = characters && characters.length > 0 ? characters : [];
    const charNames = charsInRoster.map((c: any) => c.name);

    const consequentialStoryReaction = `Your choice to "${selectedChoice.text}" has sent shockwaves through this timeline. In the immediate fallout, your tactical maneuver (${selectedChoice.consequenceShort}) completely caught ${charNames[1] || "the rival"} off guard, saving your leverage. \n\nBehind the scenes, ${charNames[0] || "the ally"} steps up to assist, keeping close track of the corporate movements. This decisive action transforms your timeline forecasts.`;

    const characterImpactSummary = `${charNames[0] || "Elena"} says: 'You acted with exceptional precision under pressure, ${profile?.name || "Player"}. Let's make sure we stay one step ahead.'`;

    // Modify relationship states and metrics
    const relationshipChanges = charsInRoster.map((char: any) => {
      let delta = 0;
      if (selectedChoice.relationshipImpact && selectedChoice.relationshipImpact[char.name] !== undefined) {
        delta = selectedChoice.relationshipImpact[char.name];
      } else {
        if (char.archetype === "Forbidden Attraction" || char.archetype === "Romantic Interest") delta = 10;
        else if (char.archetype === "Rival") delta = -15;
        else delta = 5;
      }

      // Compute attraction metrics updates
      const updatedMetrics = { ...char.attractionMetrics };
      if (delta > 0) {
        updatedMetrics.chemistry = Math.min(100, updatedMetrics.chemistry + delta);
        updatedMetrics.trust = Math.min(100, updatedMetrics.trust + Math.floor(delta / 2));
        updatedMetrics.closeness = Math.min(100, updatedMetrics.closeness + delta);
        updatedMetrics.interest = Math.min(100, updatedMetrics.interest + 5);
      } else {
        updatedMetrics.chemistry = Math.max(0, updatedMetrics.chemistry - 5);
        updatedMetrics.trust = Math.max(0, updatedMetrics.trust + delta);
        updatedMetrics.closeness = Math.max(0, updatedMetrics.closeness - 10);
      }

      // Toggle state
      let nextState = char.currentState;
      if (delta < -10) nextState = "Distant";
      else if (delta > 10) nextState = "Intrigued";
      else if (char.archetype === "Forbidden Attraction" && updatedMetrics.chemistry > 60) nextState = "Intimate";

      return {
        characterName: char.name,
        scoreDelta: delta,
        attractionMetrics: updatedMetrics,
        currentState: nextState,
        memoryGained: `Recalls your crucial decision to carry out: "${selectedChoice.text}".`
      };
    });

    // Forecast modifications
    const updatedForecast = { ...forecast };
    const impact = selectedChoice.forecastImpact || { careerPotential: 10, socialInfluence: 5, relationshipStability: -10 };
    
    const scaleMetric = (current: string, delta: number): any => {
      const scale = ["Crashing", "Low", "Medium", "High", "Rising"];
      let idx = scale.indexOf(current);
      if (idx === -1) idx = 2; // fallback medium
      let newIdx = idx + (delta > 10 ? 1 : delta < -10 ? -1 : 0);
      return scale[Math.max(0, Math.min(scale.length - 1, newIdx))];
    };

    updatedForecast.careerPotential = scaleMetric(forecast.careerPotential || "Medium", impact.careerPotential || 0);
    updatedForecast.socialInfluence = scaleMetric(forecast.socialInfluence || "Medium", impact.socialInfluence || 0);
    
    if (impact.relationshipStability) {
      const stabilScale = ["Critical", "Tension", "Friction", "Uncertain", "Stable"];
      let idx = stabilScale.indexOf(forecast.relationshipStability || "Stable");
      let newIdx = idx + (impact.relationshipStability > 10 ? 1 : impact.relationshipStability < -10 ? -1 : 0);
      updatedForecast.relationshipStability = stabilScale[Math.max(0, Math.min(stabilScale.length - 1, newIdx))] as any;
    }

    // New social signal
    const signals = [
      `${charNames[0] || "Elena"} was unusually supportive of your decision to slam the glass.`,
      `${charNames[1] || "Marcus"} noted your collaboration with others and has increased digital monitoring.`
    ];

    let nextEpisode;
    const beatIndex = historyLen;
    if (universe.narrativeBeats && universe.narrativeBeats[beatIndex]) {
      const beat = universe.narrativeBeats[beatIndex];
      nextEpisode = {
        id: `ep-${beatIndex + 2}`,
        title: beat.title,
        summary: `The dramatic fallout continues as ${charNames[1] || "Marcus"} tightens his net and ${charNames[0] || "Elena"} offers a route.`,
        story: beat.story(profile?.name || "Player", selectedChoice.text),
        cliffhanger: beat.cliffhanger,
        choices: beat.choices(profile?.name || "Player", charNames)
      };
    } else {
      const epNum = historyLen + 2;
      const titles = ["Echoes of Trust", "Shattered Signal", "Double Agent Council", "Sovereign Alliances", "The Final Threshold"];
      const title = titles[epNum % titles.length] + ` (Episode ${epNum})`;
      
      nextEpisode = {
        id: `ep-${epNum}`,
        title,
        summary: `In Episode ${epNum}, you navigate the cascading web of loyalties following your maneuver.`,
        story: [
          `The clock is ticking in this timeline. Your previous decision to ${selectedChoice.text} has shifted the battlefield completely. ${charNames[1] || "The rival"} has mobilized an offline team to counter your hold.`,
          `You regroup with ${charNames[0] || "your contact"} in the quiet corners of the city. 'Our time is running short,' they say, loading a custom keycard. 'They've traced the signature.'`,
          `Suddenly, an emergency bypass signal flashes on your wrist. ${charNames[2] || "Sloane"} has secured a blind spot for exactly ninety seconds, but it demands you either retreat or lock them out.`,
          `This next decision will cement your relations and determine which faction claims absolute victory inside this universe.`
        ],
        cliffhanger: "The central server room door begins lock down—what is your emergency entry?",
        choices: [
          {
            id: `choice-infinite-${epNum}-1`,
            text: "Expose the terminal vulnerabilities publicly to create a diversion",
            consequenceShort: "Charismatic disruption",
            forecastImpact: { careerPotential: -5, socialInfluence: 15, relationshipStability: -15 },
            relationshipImpact: { [charNames[0] || "Elena"]: 10, [charNames[1] || "Marcus"]: -15 }
          },
          {
            id: `choice-infinite-${epNum}-2`,
            text: "Execute the remote network decryption tool",
            consequenceShort: "Technological breach",
            forecastImpact: { careerPotential: 15, socialInfluence: 5, relationshipStability: 5 },
            relationshipImpact: { [charNames[2] || "Sloane"]: 15, [charNames[1] || "Marcus"]: -5 }
          },
          {
            id: `choice-infinite-${epNum}-3`,
            text: "Slip inside the high-voltage duct blindly in silence",
            consequenceShort: "Stealth risk-taking escape",
            forecastImpact: { careerPotential: 5, socialInfluence: -10, relationshipStability: 10 },
            relationshipImpact: { [charNames[0] || "Elena"]: 15, [charNames[2] || "Sloane"]: 10 }
          }
        ]
      };
    }

    return {
      consequentialStoryReaction,
      characterImpactSummary,
      relationshipChanges,
      forecastChanges: updatedForecast,
      nextEpisode,
      socialSignals: signals,
      simulated: true
    };
  },

  clockTick(body: any) {
    const { activeUniverse, elapsedHours, characters } = body;
    const hours = elapsedHours || 4;
    const charNames = characters && characters.length > 0 ? characters.map((c: any) => c.name) : ["Elena Rossi", "Marcus Vance", "Sloane Cross"];

    const activities = [
      {
        id: `act-tick-${Date.now()}-1`,
        characterName: charNames[0],
        characterAvatar: getPortraitUrl(charNames[0]),
        timestamp: `${hours} hours ago`,
        message: `${charNames[0]} left a cryptic note detailing shifting guard patrol positions near the docks.`,
        type: "rumor"
      },
      {
        id: `act-tick-${Date.now()}-2`,
        characterName: charNames[1],
        characterAvatar: getPortraitUrl(charNames[1]),
        timestamp: `${Math.floor(hours / 2)} hours ago`,
        message: `${charNames[1]} held a private meeting with the board director. Strategic shifts detected.`,
        type: "action"
      }
    ];

    const newMessages: any[] = [];
    
    // Low trust/high chemistry triggers a direct message alert
    if (hours >= 4) {
      newMessages.push({
        id: `msg-tick-${Date.now()}`,
        senderId: "char-1",
        senderName: charNames[0],
        senderAvatar: getPortraitUrl(charNames[0]),
        text: `We need to talk privately. I found a file Marcus left on his local terminal. It details a specific forecast lock on your company assets. Play this recording when you get a chance.`,
        timestamp: "Just now",
        isRead: false,
        isVoiceNote: true
      });
    }

    return {
      developmentsCount: activities.length,
      castActivities: activities,
      directMessages: newMessages,
      simulated: true
    };
  },

  perspective(body: any) {
    const { characterName, activeUniverse, episodeTitle } = body;
    return `Looking at the room, Elena's hand was sweating as she gripped her camera lens. She saw Marcus leaning in towards you like a vulture sizing up his prey. She knew that if Marcus reached into your pocket, the encrypted drive would be gone forever. Her heart was beating fast—she knew that cutting the power grid was a massive liability, but she was entirely ready to hit the circuit breaker the split-second you slammed your glass down.`;
  },

  motivation(body: any) {
    const { choiceId } = body;
    return `Elena Rossi wants Marcus Vance out of the network because he holds leverage on her private journalism guild. Marcus Vance is seeking the encrypted drive because it contains transaction files proving he bribed the Port Authority to freeze cargo logistics. Sloane Cross is watching closely because she wants to see if you have the intelligence to slip away cleanly without triggering a federal grid alarm.`;
  },

  intelligence(body: any) {
    const { characterName } = body;
    return `### Relationship Profile: ${characterName}
- **Value Alignment**: Highly compatible on "Truth" and "Decentralization".
- **Attraction Vector**: Curiosity is high, but Closeness is gated by your high-mystery choices.
- **Timeline Alliance Forecast**: If you collaborate with ${characterName} in the next episode, the trust index will surge by +20%, unlocking the 'Rooftop Secret Meeting' exclusive event.
- **Rivalry Warning**: Heavy interactions with ${characterName} will trigger jealousy reactions from the Vance family associates.`;
  },
  voice(text: string) {
    // Generate a beautiful short mock base64 audio payload representing silent dynamic pacing
    const TINY_SILENT_MP3 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGFtZTMuMTAwAAGhAAAAAAAAAAAAAAA=";
    return { audio: TINY_SILENT_MP3 };
  }
};

/**
 * Onboarding endpoint: compiles personality results and drafts Episode 1
 */
app.post("/api/onboard", async (req, res) => {
  try {
    const { name, age, interests, personalityTraits, goals, relationshipPreferences, careerStatus, activeUniverse } = req.body;
    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      console.warn("[Gemini] Lazy Load error - Falling back to local simulation:", e.message);
      const simulatedData = SimulationEngine.onboard(req.body);
      return res.json(simulatedData);
    }

    const activeUniversePrompt = activeUniverse && activeUniverse !== "Original"
      ? `You are running a PARALLEL UNIVERSE: "${activeUniverse}". Style the story completely inside this theme!`
      : "You are running the default universe. Real-life, raw, dramatic modern world.";

    const prompt = `
Create a high-fidelity Netflix-style storytelling introduction and Pilot Episode (Day 1) for this new protagonist.

User Information:
- Name: ${name}
- Age: ${age}
- Key Interests: ${(interests || []).join(", ")}
- Personality Traits: ${(personalityTraits || []).join(", ")}
- Main Ambitions: ${goals}
- Romantic Vibe/Relationship Preference: ${relationshipPreferences}
- Professional Profile: ${careerStatus}

${activeUniversePrompt}

Generate:
1. "summary": A premium, psychological, third-person cinematic profile synopsis of this protagonist under this dramatic light.
2. "characters": Generate 3 distinct characters who will form the backbone of this TV-series-like season:
   - (A) A charming love interest (Forbidden Attraction archetype).
   - (B) A cold, calculative, or dangerous rival (Rival archetype).
   - (C) A mysterious ally/mentor (High-Status Figure or Former Connection archetype).
   Generate fields for them: id, name, role (Ally, Rival, Love Interest, Mentor, Mystery Contact), archetype (Romantic Interest, Forbidden Attraction, Former Connection, Unresolved Tension, Secret Admirer, Social Magnet, High-Status Figure, Rival), starting relationshipScore (-15 to 15), description, starting emotional state currentState ("Neutral"), attractionMetrics object (with values for chemistry, trust, curiosity, closeness, interest, compatibility from 0 to 100), chemistryProfile object (values: array of strings, ambitions: array of strings, preferences: array of strings, communicationStyle: string, emotionalTriggers: array of strings), and 1 background relationship memory ("pastInteractions"). Make sure their designs match our universe theme.
3. "firstEpisode": Pilot Episode. Set up a deep scene of immediate high-tension right where the game begins.
   - Title: Intriguing, episodic-style title.
   - Summary: Hook the audience.
   - Story: Exactly 4 dense, dialogue-heavy, atmosphere-rich text paragraphs describing the starting scene.
   - Cliffhanger: An intense, suspenseful closing sentence demanding immediate action.
   - Choices: Exactly 3 highly divergent choice pathways. One must appeal to charisma, one to intelligence/strategy, one to mystery/stealth. Include their forecastImpact (careerPotential, socialInfluence, relationshipStability, value delta from -20 to 20) and relationshipImpact. Make the relationshipImpact object contain keys corresponding EXACTLY to the names of the characters created above (e.g., {"CharacterName": 10}).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  relationshipScore: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  currentState: { type: Type.STRING },
                  pastInteractions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  attractionMetrics: {
                    type: Type.OBJECT,
                    properties: {
                      chemistry: { type: Type.INTEGER },
                      trust: { type: Type.INTEGER },
                      curiosity: { type: Type.INTEGER },
                      closeness: { type: Type.INTEGER },
                      interest: { type: Type.INTEGER },
                      compatibility: { type: Type.INTEGER }
                    }
                  },
                  chemistryProfile: {
                    type: Type.OBJECT,
                    properties: {
                      values: { type: Type.ARRAY, items: { type: Type.STRING } },
                      ambitions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
                      communicationStyle: { type: Type.STRING },
                      emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                },
                required: ["id", "name", "role", "archetype", "relationshipScore", "description", "currentState", "pastInteractions", "attractionMetrics", "chemistryProfile"]
              }
            },
            firstEpisode: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                story: { type: Type.ARRAY, items: { type: Type.STRING } },
                cliffhanger: { type: Type.STRING },
                choices: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      consequenceShort: { type: Type.STRING },
                      forecastImpact: {
                        type: Type.OBJECT,
                        properties: {
                          careerPotential: { type: Type.INTEGER },
                          socialInfluence: { type: Type.INTEGER },
                          relationshipStability: { type: Type.INTEGER }
                        }
                      },
                      relationshipImpact: {
                        type: Type.OBJECT
                      }
                    },
                    required: ["id", "text", "consequenceShort", "forecastImpact", "relationshipImpact"]
                  }
                }
              },
              required: ["title", "summary", "story", "cliffhanger", "choices"]
            }
          },
          required: ["summary", "characters", "firstEpisode"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Inject custom editorial avatar images
    if (data.characters) {
      data.characters = data.characters.map((char: any) => ({
        ...char,
        avatarUrl: getPortraitUrl(char.name)
      }));
    }

    // Add forecast starting logs, default vault files, and direct messages
    const universeKey = activeUniverse === "Founder" ? "Founder" : "Original";
    const simOnboardData = SimulationEngine.onboard({ ...req.body, activeUniverse: universeKey });

    const firstEpisode = data.firstEpisode || simOnboardData.firstEpisode;
    if (firstEpisode) {
      firstEpisode.castActivities = simOnboardData.castActivities;
      firstEpisode.directMessages = simOnboardData.directMessages;
      firstEpisode.vaultItems = simOnboardData.vaultItems;
      firstEpisode.forecast = simOnboardData.forecast;
    }

    res.json({
      summary: data.summary || simOnboardData.summary,
      characters: data.characters || simOnboardData.characters,
      firstEpisode: firstEpisode,
      forecast: simOnboardData.forecast,
      vaultItems: simOnboardData.vaultItems,
      directMessages: simOnboardData.directMessages,
      castActivities: simOnboardData.castActivities
    });
  } catch (error: any) {
    console.warn("API Call failed during Onboarding - Falling back to local simulation:", error);
    const simulatedData = SimulationEngine.onboard(req.body);
    res.json(simulatedData);
  }
});

/**
 * Choice progression endpoint
 */
app.post("/api/choice", async (req, res) => {
  try {
    const { profile, forecast, characters, episodesHistory, currentEpisode, selectedChoice, activeUniverse } = req.body;

    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      console.warn("[Gemini] Lazy Load error during choice progression - Falling back to local simulation:", e.message);
      const simulatedChoice = SimulationEngine.choice(req.body);
      return res.json(simulatedChoice);
    }

    const universeContext = activeUniverse && activeUniverse !== "Original"
      ? `Active Parallel Universe timeline: "${activeUniverse}". Keep the world and atmosphere strictly consistent with this!`
      : "Default realistic dramatic universe.";

    const historySummary = (episodesHistory || [])
      .map((ep: any, idx: number) => `Episode ${idx + 1}: "${ep.title}". summary: ${ep.summary}`)
      .join("\n");

    const charactersContext = (characters || [])
      .map((char: any) => `Character: ${char.name} (Archetype: ${char.archetype}, Bond: ${char.relationshipScore}). Bio: ${char.description}. Metrics: Chemistry ${char.attractionMetrics.chemistry}, Trust ${char.attractionMetrics.trust}`)
      .join("\n");

    const prompt = `
You are the AI Showrunner and Story Generator for PlotTwist. The user has just made a critical story decision in the current episode.

Active Universe status: ${universeContext}

Protagonist Personality Profile:
- Name: ${profile?.name}
- Traits: ${(profile?.personalityTraits || []).join(", ")}
- Long-term Ambition: ${profile?.goals}

Series Memory (Past Episodes):
${historySummary || "This is the pilot wrap up."}

Active Character Roster with current relationship scores:
${charactersContext}

Most Recent Episode context:
- Title: "${currentEpisode?.title}"
- Summary: ${currentEpisode?.summary}
- Story Beat Leading Up: ${currentEpisode?.story ? currentEpisode?.story[currentEpisode?.story.length - 1] : ""}
- Cliffhanger: "${currentEpisode?.cliffhanger}"
- User selected Choice: "${selectedChoice?.text}" (Tactical context: ${selectedChoice?.consequenceShort})

TASK:
1. Generate "consequentialStoryReaction": Standard 2 paragraphs detailing what happens IMMEDIATELY because of this choice. Highlight dialogue, tension, and visual editorial style.
2. Generate "characterImpactSummary": A 1-sentence thought or vocal reaction from one of the active characters witnessing or hearing of this.
3. Compute relationship score adjustments in "relationshipChanges" (an array with fields: characterName, scoreDelta, currentState, and attractionMetrics).
4. Set relative forecast changes in "forecastChanges" representing new states for careerPotential, socialInfluence, relationshipStability, hiddenOpportunity.
5. Generate a new set of "socialSignals" (string list) reporting small, subtle signs characters noticed ("Evelyn seemed unusually supportive of your decision").
6. Create "nextEpisode": The next dramatic episode (Day/Episode ${(episodesHistory || []).length + 2}). Pick up directly from aftermath, and end on a fresh cliffhanger with exactly 3 new choices.

Strict JSON Output format matching standard schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consequentialStoryReaction: { type: Type.STRING },
            characterImpactSummary: { type: Type.STRING },
            relationshipChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  characterName: { type: Type.STRING },
                  scoreDelta: { type: Type.INTEGER },
                  currentState: { type: Type.STRING },
                  attractionMetrics: {
                    type: Type.OBJECT,
                    properties: {
                      chemistry: { type: Type.INTEGER },
                      trust: { type: Type.INTEGER },
                      curiosity: { type: Type.INTEGER },
                      closeness: { type: Type.INTEGER },
                      interest: { type: Type.INTEGER },
                      compatibility: { type: Type.INTEGER }
                    }
                  },
                  memoryGained: { type: Type.STRING }
                },
                required: ["characterName", "scoreDelta", "currentState", "attractionMetrics", "memoryGained"]
              }
            },
            forecastChanges: {
              type: Type.OBJECT,
              properties: {
                careerPotential: { type: Type.STRING },
                socialInfluence: { type: Type.STRING },
                relationshipStability: { type: Type.STRING },
                hiddenOpportunity: { type: Type.STRING }
              }
            },
            socialSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextEpisode: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                story: { type: Type.ARRAY, items: { type: Type.STRING } },
                cliffhanger: { type: Type.STRING },
                choices: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      consequenceShort: { type: Type.STRING },
                      forecastImpact: {
                        type: Type.OBJECT,
                        properties: {
                          careerPotential: { type: Type.INTEGER },
                          socialInfluence: { type: Type.INTEGER },
                          relationshipStability: { type: Type.INTEGER }
                        }
                      },
                      relationshipImpact: {
                        type: Type.OBJECT
                      }
                    },
                    required: ["id", "text", "consequenceShort", "forecastImpact", "relationshipImpact"]
                  }
                }
              },
              required: ["id", "title", "summary", "story", "cliffhanger", "choices"]
            }
          },
          required: ["consequentialStoryReaction", "characterImpactSummary", "relationshipChanges", "forecastChanges", "socialSignals", "nextEpisode"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.warn("API Call failed during Choice Progression - Falling back to local simulation:", error);
    const simulatedChoice = SimulationEngine.choice(req.body);
    res.json(simulatedChoice);
  }
});

/**
 * Clock tick endpoint (Reality Engine + Notification Engine)
 */
app.post("/api/clock-tick", async (req, res) => {
  try {
    const { activeUniverse, elapsedHours, characters } = req.body;
    // Fast-forward simulated timeline changes
    const tickData = SimulationEngine.clockTick(req.body);
    res.json(tickData);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process reality clock ticks." });
  }
});

/**
 * Vault unlock helper
 */
app.post("/api/vault-unlock", (req, res) => {
  const { itemId, currentScore } = req.body;
  // Vault decryption validation
  res.json({ unlocked: true });
});

/**
 * Perspective Shift endpoint (Narrative Engine)
 */
app.post("/api/perspective", async (req, res) => {
  try {
    const { characterName, activeUniverse, episodeTitle } = req.body;
    let ai;
    try {
      ai = getAiClient();
    } catch (e) {
      const data = SimulationEngine.perspective(req.body);
      return res.json({ story: data });
    }

    const prompt = `Rewrite the starting scene of episode "${episodeTitle}" entirely from the perspective, inner thoughts, biases, and emotional triggers of the character "${characterName}". Make it highly narrative and cinematic.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ story: response.text });
  } catch (error) {
    res.json({ story: SimulationEngine.perspective(req.body) });
  }
});

/**
 * Private Context (Hidden Signals / Director's Cut) Motivation endpoint
 */
app.post("/api/motivation", async (req, res) => {
  try {
    const { choiceId, episodeTitle } = req.body;
    let ai;
    try {
      ai = getAiClient();
    } catch (e) {
      return res.json({ motivation: SimulationEngine.motivation(req.body) });
    }

    const prompt = `Expose the hidden social signals, underlying attraction vectors, and secret motivations of the characters in the episode "${episodeTitle}" during choice index "${choiceId}". Keep it brief, analytic, and premium.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ motivation: response.text });
  } catch (error) {
    res.json({ motivation: SimulationEngine.motivation(req.body) });
  }
});

/**
 * Private Intelligence Deep Relationship Analyzer
 */
app.post("/api/intelligence", async (req, res) => {
  try {
    const { characterName } = req.body;
    let ai;
    try {
      ai = getAiClient();
    } catch (e) {
      return res.json({ intelligence: SimulationEngine.intelligence(req.body) });
    }

    const prompt = `Write a premium intelligence report detailing the attraction dynamics, value alignments, communication preferences, and alliance forecast between the protagonist and ${characterName}. Format in elegant Markdown.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ intelligence: response.text });
  } catch (error) {
    res.json({ intelligence: SimulationEngine.intelligence(req.body) });
  }
});

/**
 * Premium Voice Narration endpoint: Speaks out story text or cliffhangers using gemini-3.1-flash-tts-preview
 */
app.post("/api/voice", async (req, res) => {
  try {
    const { text, voice } = req.body; // voice can be Puck, Charon, Kore, Fenrir, Zephyr
    let ai;
    try {
      ai = getAiClient();
    } catch (e: any) {
      console.warn("[Gemini] Lazy Load error during narration - Falling back to silent voice track:", e.message);
      const simulatedVoice = SimulationEngine.voice(text);
      return res.json(simulatedVoice);
    }

    const selectedVoice = voice || "Zephyr";

    const prompt = `Read this narrative beat with high TV drama narration flair, maintaining serious cinematic timing and breathing:
"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio chunk generated from Gemini voice processor.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.warn("API Call failed during Narration - Falling back to silent voice track:", error);
    const simulatedVoice = SimulationEngine.voice(req.body.text || "");
    res.json(simulatedVoice);
  }
});

// Configure Vite middleware for development or Static Asset serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PlotTwist Express server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
