/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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

// Local Procedural Story Engine (Simulation Fallback when Gemini keys fail or are unavailable)
const LOCAL_UNIVERSES_DATA: Record<string, {
  characterA: { name: string; role: string; description: string; pastInteractions: string[] };
  characterB: { name: string; role: string; description: string; pastInteractions: string[] };
  characterC: { name: string; role: string; description: string; pastInteractions: string[] };
  episode1: {
    title: string;
    summary: string;
    story: string[];
    cliffhanger: string;
    choices: (name: string) => any[];
  };
  narrativeBeats: { title: string; story: (name: string, prevChoice: string) => string[]; cliffhanger: string; choices: (name: string, chars: string[]) => any[] }[];
}> = {
  Original: {
    characterA: {
      name: "Elena Rossi",
      role: "Love Interest",
      description: "A sharp, quick-witted photojournalist with a reckless streak and a secret file that keeps her up at night.",
      pastInteractions: ["Met Elena at a crowded street rally where she captured a stunning double-exposure of you.", "Shared a late-night coffee speaking of corporate shadows."]
    },
    characterB: {
      name: "Marcus Vance",
      role: "Rival",
      description: "A ruthless corporate fixer whose soft-spoken manner belies a history of ruined careers.",
      pastInteractions: ["Marcus blocked your promotion at the firm last winter with a cold smile.", "He warned you to stay away from the Vance Trust records."]
    },
    characterC: {
      name: "Sloane Cross",
      role: "Ally/Mentor",
      description: "A retired intelligence operative who runs a jazz bar but knows exactly who holds the debt in this city.",
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
          statImpact: { charisma: 15, intelligence: 0, mystery: 5, popularity: 10, influence: 0 },
          relationshipImpact: { "Elena Rossi": 10, "Marcus Vance": -15 }
        },
        {
          id: "choice-orig-2",
          text: "Slide the electronic drive to Elena under the counter",
          consequenceShort: "Calculated hand-off with plausible deniability",
          statImpact: { charisma: 0, intelligence: 15, mystery: 10, popularity: 0, influence: 5 },
          relationshipImpact: { "Elena Rossi": 15, "Marcus Vance": -5 }
        },
        {
          id: "choice-orig-3",
          text: "Whisper a secret about Marcus's past tax fraud",
          consequenceShort: "Psychological counter-blackmail",
          statImpact: { charisma: 5, intelligence: 10, mystery: 15, popularity: 0, influence: 10 },
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
          `Before you can respond, your phone blinks with an restricted message from Sloane Cross: 'Get to the docks. Marcus's associates are tracing your mobile signal. Drop the phone and trust the girl.'`,
          `You realize the scale of the trap. The city's digital network is tightening around you, forcing you to choose between digital stealth, raw speed, or direct confrontation.`
        ],
        cliffhanger: "A high-set security camera hums, pivoting directly toward your hiding spot—how do you evade detection?",
        choices: (name, chars) => [
          {
            id: "choice-orig-ep2-1",
            text: "Use Sloane's signal-jammer program on your phone",
            consequenceShort: "Stealthy electronic evasion",
            statImpact: { charisma: 0, intelligence: 15, mystery: 10, popularity: 0, influence: 5 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -5 }
          },
          {
            id: "choice-orig-ep2-2",
            text: "Step out confidently and play the lost tourist",
            consequenceShort: "High-risk public charisma bluff",
            statImpact: { charisma: 15, intelligence: 0, mystery: 0, popularity: 15, influence: 5 },
            relationshipImpact: { [chars[0]]: 10, [chars[1]]: -10 }
          },
          {
            id: "choice-orig-ep2-3",
            text: "Smash the camera with Elena's heavy metal tripod",
            consequenceShort: "Brute force demolition",
            statImpact: { charisma: 5, intelligence: 5, mystery: 15, popularity: 0, influence: 10 },
            relationshipImpact: { [chars[0]]: 15, [chars[1]]: -15 }
          }
        ]
      },
      {
        title: "The Midnight Trade",
        story: (name, pChoice) => [
          `Your choice to ${pChoice} buys you just enough time to reach Sloane’s dockside warehouse. The smell of salt air and rusted metal fills your lungs. Sloane is waiting, carving an apple with a tactical blade.`,
          `'So you're the one stirring up the hornet's nest,' Sloane says, looking you up and down with deep curiosity. 'Marcus Vance isn’t just a fixer; he’s a collector. If you hold that drive, you hold his throat.'`,
          `Elena steps forward, showing Sloane the secret logs. 'It’s worse than we thought, Sloane. They have targeted ${name} as the prime suspect for the recent security archive leak.'`,
          `Suddenly, the overhead warehouse lights flicker, then shut off entirely. The hum of a high-power backup generator signals that the security gates have just been remotely deactivated.`
        ],
        cliffhanger: "Heavy footsteps echo from the shipping container maze—it's Marcus's tactical retrieval squad.",
        choices: (name, chars) => [
          {
            id: "choice-orig-ep3-1",
            text: "Stand your ground and negotiate using the files as dynamic leverage",
            consequenceShort: "Extreme high-risk negotiation",
            statImpact: { charisma: 15, intelligence: 10, mystery: 0, popularity: 5, influence: 10 },
            relationshipImpact: { [chars[1]]: -20, [chars[2]]: 10 }
          },
          {
            id: "choice-orig-ep3-2",
            text: "Retreat through Sloane's secret sewer drainage hatch",
            consequenceShort: "Guaranteed escape but drops pride",
            statImpact: { charisma: 0, intelligence: 15, mystery: 15, popularity: 0, influence: 5 },
            relationshipImpact: { [chars[2]]: 15, [chars[0]]: 5 }
          },
          {
            id: "choice-orig-ep3-3",
            text: "Rig Sloane's backup generator to emit an EMP pulse",
            consequenceShort: "Surgical blackout of all tactical gear",
            statImpact: { charisma: 5, intelligence: 20, mystery: 5, popularity: 0, influence: 10 },
            relationshipImpact: { [chars[0]]: 15, [chars[2]]: 15 }
          }
        ]
      }
    ]
  },
  Billionaire: {
    characterA: {
      name: "Seraphina Sterling",
      role: "Love Interest",
      description: "A brilliant hedge-fund manager who controls a billion-dollar family trust but refuses to play by their rules.",
      pastInteractions: ["Met Seraphina at a luxury asset auction where you both bid on the same vineyard.", "She sent a handwritten message warning of hostile family mergers."]
    },
    characterB: {
      name: "Miles Vance",
      role: "Rival",
      description: "The arrogant heir to a global shipping empire who views the entire city as his personal board game.",
      pastInteractions: ["Miles outbid your VC firm on a key AI patent last summer out of pure spite.", "He laughed during a high-society golf match, labeling your goals 'quaint'."]
    },
    characterC: {
      name: "Winston Cross",
      role: "Ally/Mentor",
      description: "A legendary private Swiss banker who holds the hidden offshore ledgers of the global elite.",
      pastInteractions: ["Winston quietly structured your seed round to keep your voting stock completely secure."]
    },
    episode1: {
      title: "The Hostile Ascent",
      summary: "A high-society benefit gala on a private superyacht becomes a digital battlefield when the Sterling family launches a stealth takeover.",
      story: [
        "The crystal chandeliers on the superyacht sway gently as the ship cuts through the dark ocean waters. You find yourself surrounded by old money, champagne glasses, and whispered alliances.",
        "Miles Vance approaches you, holding two flutes of vintage champagne. His smile is a calculation of leverage. 'I hear you're trying to outbid us on the port development project,' he says.",
        "'Quite ambitious for someone who doesn't even own a private hangar.' Before you can answer, Seraphina Sterling glides past, her silk emerald dress drawing every eye. She pauses next to you, whispering under her breath.",
        "'Don't let Miles bluff you. His bank assets are leveraged to the hilt. Open my private briefcase on the main deck and look for his liquidity coefficients.'"
      ],
      cliffhanger: "A silent bid alert flashes on your Rolex watch—do you initiate the hostile countdown?",
      choices: (name: string) => [
        {
          id: "choice-bill-1",
          text: "Make a high-volume public toast exposing Miles's record debt profile",
          consequenceShort: "Social destruction with immediate stock reactions",
          statImpact: { charisma: 15, intelligence: 0, mystery: 5, popularity: 15, influence: 5 },
          relationshipImpact: { "Seraphina Sterling": 10, "Miles Vance": -20 }
        },
        {
          id: "choice-bill-2",
          text: "Launch the encrypted counter-bid silently using your terminal",
          consequenceShort: "Stealth financial takeover",
          statImpact: { charisma: 5, intelligence: 15, mystery: 10, popularity: 0, influence: 15 },
          relationshipImpact: { "Seraphina Sterling": 15, "Winston Cross": 10 }
        },
        {
          id: "choice-bill-3",
          text: "Slip away to the private deck for secret negotiations with Winston",
          consequenceShort: "Behind-the-scenes Swiss leverage consolidation",
          statImpact: { charisma: 5, intelligence: 10, mystery: 15, popularity: 0, influence: 15 },
          relationshipImpact: { "Winston Cross": 15, "Miles Vance": -10 }
        }
      ]
    },
    narrativeBeats: [
      {
        title: "Trading Floors & Shattered Glass",
        story: (name, pChoice) => [
          `Following your dramatic decision to ${pChoice}, the financial markets open with an explosive gap. Sterling Securities' stock is fluctuating wildly in pre-market trade, and your desk is flooded with frantic calls.`,
          `Seraphina Sterling meets you on the private penthouse deck, her elegant hair windswept as she views the skyscraper skyline. 'You've completely disrupted the board’s timeline,' she says, half-smiling. 'They are launching an emergency audit on our joint assets.'`,
          `Your terminal flashes a message from Winston Cross: 'A hostile consortium has initiated a stealth purchase of your core voting block. You have less than an hour to deposit offshore collateral.'`,
          `The financial shadow wars are now out in the open, forcing you to choose between asset consolidation, extreme corporate bluffing, or seeking a dark-market loan.`
        ],
        cliffhanger: "Your phone rings with an encrypted call from Alistair Sterling himself—do you answer with an ultimatum?",
        choices: (name, chars) => [
          {
            id: "choice-bill-ep2-1",
            text: "Double down and merge assets with Seraphina's trust",
            consequenceShort: "High-stakes corporate marriage alliance",
            statImpact: { charisma: 10, intelligence: 15, mystery: 0, popularity: 10, influence: 15 },
            relationshipImpact: { [chars[0]]: 20, [chars[1]]: -15 }
          },
          {
            id: "choice-bill-ep2-2",
            text: "Request Winston to initiate an offshore Swiss shielding block",
            consequenceShort: "Extreme asset fortification",
            statImpact: { charisma: 5, intelligence: 20, mystery: 10, popularity: 0, influence: 10 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -5 }
          },
          {
            id: "choice-bill-ep2-3",
            text: "Leak an anonymous offshore dossier to the Financial Times",
            consequenceShort: "Complete market sabotage",
            statImpact: { charisma: 5, intelligence: 5, mystery: 20, popularity: 15, influence: 5 },
            relationshipImpact: { [chars[1]]: -25, [chars[0]]: 10 }
          }
        ]
      }
    ]
  },
  Celebrity: {
    characterA: {
      name: "Aria Thorne",
      role: "Love Interest",
      description: "A fiercely independent Academy Award nominee who despises the studio spin machines and craves raw authenticity.",
      pastInteractions: ["Shared a private cabin chat at the Sundance Film Festival.", "She sent you a copy of a blacklisted thriller screenplay."]
    },
    characterB: {
      name: "Director Harvey Vance",
      role: "Rival",
      description: "A legendary, hot-tempered Hollywood mogul who controls the industry blacklist with absolute authority.",
      pastInteractions: ["Harvey threw you out of his master casting suite for refusing to manipulate a script.", "He vowed to make sure you never produce a single project in this city."]
    },
    characterC: {
      name: "Agent Dominic Cross",
      role: "Ally/Mentor",
      description: "A seasoned, cynical talent agent who knows exactly where all the industry's digital bodies are buried.",
      pastInteractions: ["Dominic leaked a secret script bid to you last winter, jumpstarting your studio prospects."]
    },
    episode1: {
      title: "Shattered Luxuries",
      summary: "The glamorous afterparty of the Golden Globes takes a dangerous turn when a leaked screenplay exposes a major studio cover-up.",
      story: [
        "Flashbulbs explode in rapid succession, painting the red carpet in blinding sheets of white. You step past the paparazzi lines and into the exclusive VIP lounge, where expensive perfume and high status are everywhere.",
        "Director Harvey Vance corners you near the main champagne fountain. His face is flushed with fury, his hands gesturing aggressively.",
        "'I saw that demo reel you leaked to the press,' he snarls. 'You think you can rewrite my master script and get away with it? I own the licensing committees.'",
        "Aria Thorne pulls you aside, breathing quickly. 'An anonymous photographer has the raw security footage from the soundstage. If Harvey gets his hands on it, your career is finished before the premiere. We have five minutes.'"
      ],
      cliffhanger: "Harvey grabs his phone to enlist the licensing board—how do you silence the story?",
      choices: (name: string) => [
        {
          id: "choice-cel-1",
          text: "Ad-lib an impromptu dramatic pitch to the studio board right there",
          consequenceShort: "High-theater verbal persuasion",
          statImpact: { charisma: 20, intelligence: 5, mystery: 0, popularity: 15, influence: 5 },
          relationshipImpact: { "Aria Thorne": 10, "Director Harvey Vance": -15 }
        },
        {
          id: "choice-cel-2",
          text: "Hack into the lounge VIP server to corrupt the video file transfer",
          consequenceShort: "Technical sabotage of digital assets",
          statImpact: { charisma: 0, intelligence: 15, mystery: 15, popularity: 0, influence: 5 },
          relationshipImpact: { "Aria Thorne": 15, "Agent Dominic Cross": 10 }
        },
        {
          id: "choice-cel-3",
          text: "Coerce Dominic Cross to threaten Harvey with financial auditing",
          consequenceShort: "Cynical backroom agency blackmail",
          statImpact: { charisma: 10, intelligence: 10, mystery: 5, popularity: 0, influence: 15 },
          relationshipImpact: { "Agent Dominic Cross": 15, "Director Harvey Vance": -20 }
        }
      ]
    },
    narrativeBeats: [
      {
        title: "Paparazzi Chase",
        story: (name, pChoice) => [
          `Following your dramatic decision to ${pChoice}, Harvey Vance storms off, cursing. The VIP room is buzzing with dynamic whispers as your stock in the industry climbs.`,
          `Aria Thorne pulls you through a kitchen egress just as a swarm of paparazzi breaches the main lobby. 'That was completely legendary,' she laughs, breathless. 'But Harvey's PR firm has already launched a hit piece.'`,
          `Your phone rings. It's Dominic Cross. 'Kid, Harvey just called an emergency meeting with the board. They're discussing putting your show on ice. I can stall them, but you need to feed me some major counter-intel.'`,
          `You realize that in Hollywood, truth is completely subjective—it's down to who controls the narrative, the press, or the raw digital dirt.`
        ],
        cliffhanger: "A top TMZ reporter blocks your towncar door, microphone flashing—how do you respond?",
        choices: (name, chars) => [
          {
            id: "choice-cel-ep2-1",
            text: "Deliver an enigmatic, poetic soundbite that trends instantly",
            consequenceShort: "Viral social hype",
            statImpact: { charisma: 15, intelligence: 0, mystery: 10, popularity: 20, influence: 5 },
            relationshipImpact: { [chars[0]]: 15, [chars[1]]: -10 }
          },
          {
            id: "choice-cel-ep2-2",
            text: "Give Dominic the leaked soundstage audio files immediately",
            consequenceShort: "Nuclear executive counter-strike",
            statImpact: { charisma: 5, intelligence: 15, mystery: 10, popularity: 0, influence: 15 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -20 }
          },
          {
            id: "choice-cel-ep2-3",
            text: "Slip out the side and ignore the cameras completely",
            consequenceShort: "Complete mysterious detachment",
            statImpact: { charisma: 0, intelligence: 10, mystery: 20, popularity: -5, influence: 10 },
            relationshipImpact: { [chars[0]]: 10, [chars[2]]: 5 }
          }
        ]
      }
    ]
  },
  Founder: {
    characterA: {
      name: "Dr. Evelyn Reed",
      role: "Love Interest",
      description: "A brilliant machine-learning expert who developed the core model but refuses to let it be weaponized by the VCs.",
      pastInteractions: ["Co-authored the neural compiler thesis with Evelyn during college.", "Agreed to co-found the stealth project over late-night debugging."]
    },
    characterB: {
      name: "VC Brandon Pierce",
      role: "Rival",
      description: "A cold, calculating Sand Hill Road venture capitalist who values equity blocks over human engineering ethics.",
      pastInteractions: ["Brandon choked your seed-stage competitors by funding your team, then demanded 50% voting control.", "Declared your technology 'firmware' in an email loop."]
    },
    characterC: {
      name: "Alfred Check",
      role: "Ally/Mentor",
      description: "An eccentric old-school engineer who co-created the internet and still holds backdoors to every major VC server.",
      pastInteractions: ["Alfred hosted your core backend servers on his unindexed, solar-powered server farm."]
    },
    episode1: {
      title: "The Stealth Mirage",
      summary: "Surrounded by tech elite at your stealth startup launch party, your terminal issues a critical breach alert signaling industrial espionage.",
      story: [
        "The ambient hum of high-powered server racks and heavy tech beats fills the industrial warehouse. Terminal screens cast a blue cybernetic glow over the crowd of engineers and seed investors.",
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
          statImpact: { charisma: 20, intelligence: 5, mystery: 0, popularity: 15, influence: 5 },
          relationshipImpact: { "Dr. Evelyn Reed": 10, "VC Brandon Pierce": -15 }
        },
        {
          id: "choice-fou-2",
          text: "Deploy an encrypted poison pill into the cloned ghost repository",
          consequenceShort: "Technical destruction of the stolen system assets",
          statImpact: { charisma: 0, intelligence: 20, mystery: 10, popularity: 0, influence: 10 },
          relationshipImpact: { "Dr. Evelyn Reed": 15, "Alfred Check": 10 }
        },
        {
          id: "choice-fou-3",
          text: "Leverage Alfred's old system exploit to initiate a local warehouse black-out",
          consequenceShort: "Disruptive physical and digital exit",
          statImpact: { charisma: 5, intelligence: 10, mystery: 15, popularity: 0, influence: 15 },
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
            text: "Mirrors-host the core neural model on Alfred's decentralized grid",
            consequenceShort: "Untraceable offshore hosting",
            statImpact: { charisma: 5, intelligence: 20, mystery: 15, popularity: 0, influence: 10 },
            relationshipImpact: { [chars[2]]: 15, [chars[1]]: -15 }
          },
          {
            id: "choice-fou-ep2-2",
            text: "Take the drive and make a high-speed exit on Evelyn's motorbike",
            consequenceShort: "High-adrenaline physical escape",
            statImpact: { charisma: 15, intelligence: 0, mystery: 10, popularity: 15, influence: 5 },
            relationshipImpact: { [chars[0]]: 20, [chars[1]]: -10 }
          },
          {
            id: "choice-fou-ep2-3",
            text: "Call a press conference with TechCrunch to expose Brandon's file theft",
            consequenceShort: "Complete public corporate exposure",
            statImpact: { charisma: 10, intelligence: 10, mystery: 5, popularity: 20, influence: 15 },
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

    const characters = [
      {
        id: "char-1",
        name: universe.characterA.name,
        role: universe.characterA.role,
        relationshipScore: 10,
        description: universe.characterA.description,
        pastInteractions: universe.characterA.pastInteractions
      },
      {
        id: "char-2",
        name: universe.characterB.name,
        role: universe.characterB.role,
        relationshipScore: -10,
        description: universe.characterB.description,
        pastInteractions: universe.characterB.pastInteractions
      },
      {
        id: "char-3",
        name: universe.characterC.name,
        role: universe.characterC.role,
        relationshipScore: 5,
        description: universe.characterC.description,
        pastInteractions: universe.characterC.pastInteractions
      }
    ];

    const summary = `Under the stark, high-contrast spotlight of this timeline, ${name || "Anonymous"} (${age} years old) emerges as a highly analytical and ${personalityTraits?.[0] || "brave"} protagonist. Operating as an ambitious ${careerStatus || "newcomer"} and guided by interests like ${(interests || []).join(", ") || "mystery"}, they must navigate a dangerous web of conflicts. Between the predatory watch of ${universe.characterB.name} and the loyal insights of ${universe.characterA.name}, every step becomes a calculated gamble for power.`;

    return {
      summary,
      characters,
      firstEpisode: {
        title: universe.episode1.title,
        summary: universe.episode1.summary,
        story: universe.episode1.story,
        cliffhanger: universe.episode1.cliffhanger,
        choices: universe.episode1.choices(name || "Player")
      },
      simulated: true
    };
  },

  choice(body: any) {
    const { profile, reputation, characters, episodesHistory, currentEpisode, selectedChoice, activeUniverse } = body;
    const univKey = activeUniverse && LOCAL_UNIVERSES_DATA[activeUniverse] ? activeUniverse : "Original";
    const universe = LOCAL_UNIVERSES_DATA[univKey];
    
    const historyLen = episodesHistory ? episodesHistory.length : 0;
    
    const charsInRoster = characters && characters.length > 0 ? characters : [
      { id: "char-1", name: universe.characterA.name, role: universe.characterA.role },
      { id: "char-2", name: universe.characterB.name, role: universe.characterB.role },
      { id: "char-3", name: universe.characterC.name, role: universe.characterC.role }
    ];
    const charNames = charsInRoster.map((c: any) => c.name);

    const consequentialStoryReaction = `Your choice to "${selectedChoice.text}" has sent shockwaves through this timeline. In the immediate fallout, your tactical maneuver (${selectedChoice.consequenceShort}) completely caught ${charNames[1]} off guard, saving your leverage. \n\nBehind the scenes, ${charNames[0]} steps up to assist, keeping close track of the corporate movements. This decisive action transforms your reputational standings.`;

    const characterImpactSummary = `${charNames[0]} says: 'You acted with exceptional precision under pressure, ${profile?.name || "Player"}. Let's make sure we stay one step ahead.'`;

    const relationshipChanges = charsInRoster.map((char: any) => {
      let delta = 0;
      if (selectedChoice.relationshipImpact && selectedChoice.relationshipImpact[char.name] !== undefined) {
        delta = selectedChoice.relationshipImpact[char.name];
      } else {
        if (char.role.toLowerCase().includes("love")) delta = 10;
        else if (char.role.toLowerCase().includes("rival")) delta = -15;
        else delta = 5;
      }
      return {
        characterName: char.name,
        scoreDelta: delta,
        memoryGained: `Recalls your crucial decision to carry out: "${selectedChoice.text}".`
      };
    });

    const repChanges = selectedChoice.statImpact || {
      charisma: 12,
      intelligence: 5,
      mystery: 10,
      popularity: 8,
      influence: 4
    };

    let nextEpisode;
    const beatIndex = historyLen;
    if (universe.narrativeBeats && universe.narrativeBeats[beatIndex]) {
      const beat = universe.narrativeBeats[beatIndex];
      nextEpisode = {
        title: beat.title,
        summary: `The dramatic fallout continues as ${charNames[1]} tightens their net and ${charNames[0]} offers a dangerous route.`,
        story: beat.story(profile?.name || "Player", selectedChoice.text),
        cliffhanger: beat.cliffhanger,
        choices: beat.choices(profile?.name || "Player", charNames)
      };
    } else {
      const epNum = historyLen + 2;
      const titles = ["Echoes of Trust", "Shattered Signal", "Double Agent Council", "Sovereign Alliances", "The Final Threshold"];
      const title = titles[epNum % titles.length] + ` (Episode ${epNum})`;
      
      nextEpisode = {
        title,
        summary: `In Episode ${epNum}, you navigate the cascading web of loyalties following your maneuver.`,
        story: [
          `The clock is ticking in this timelines. Your previous decision to ${selectedChoice.text} has shifted the battlefield completely. ${charNames[1]} has mobilized an offline extraction team to counter your hold.`,
          `You regroup with ${charNames[0]} in the quiet corners of the city. 'Our time is running short,' they say, loading a custom keycard. 'They've traced the signature.'`,
          `Suddenly, an emergency bypass signal flashes on your wrist. ${charNames[2]} has secured a blind spot for exactly ninety seconds, but it demands you either retreat or lock them out.`,
          `This next decision will cement your relations and determine which faction claims absolute victory inside this universe.`
        ],
        cliffhanger: "The central server room door begins lock down—what is your emergency entry?",
        choices: [
          {
            id: `choice-infinite-${epNum}-1`,
            text: "Expose the terminal vulnerabilities publicly to create a diversion",
            consequenceShort: "Charismatic disruption",
            statImpact: { charisma: 15, intelligence: 0, mystery: 5, popularity: 15, influence: 5 },
            relationshipImpact: { [charNames[0]]: 10, [charNames[1]]: -15 }
          },
          {
            id: `choice-infinite-${epNum}-2`,
            text: "Execute Alfred's remote network decryption tool",
            consequenceShort: "Technological breach",
            statImpact: { charisma: 0, intelligence: 20, mystery: 10, popularity: 0, influence: 10 },
            relationshipImpact: { [charNames[2]]: 15, [charNames[1]]: -5 }
          },
          {
            id: `choice-infinite-${epNum}-3`,
            text: "Slip inside the high-voltage duct blindly in silence",
            consequenceShort: "Stealth risk-taking escape",
            statImpact: { charisma: 5, intelligence: 5, mystery: 20, popularity: 0, influence: 10 },
            relationshipImpact: { [charNames[0]]: 15, [charNames[2]]: 10 }
          }
        ]
      };
    }

    return {
      consequentialStoryReaction,
      characterImpactSummary,
      relationshipChanges,
      reputationChanges: repChanges,
      nextEpisode,
      simulated: true
    };
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
   - (A) A charming love interest (highly appealing, customized to relationship preference).
   - (B) A cold, calculative, or dangerous rival (blocks user ambitions, seeks leverage).
   - (C) A mysterious ally/mentor (holds secrets, offers cryptic help).
   Generate fields for them: id, name, role (Ally, Rival, Love Interest, Mentor, Mystery Contact), starting relationshipScore (-15 to 15), description, and 1 background relationship memory ("pastInteractions"). Make sure their designs match our universe theme.
3. "firstEpisode": Pilot Episode. Set up a deep scene of immediate high-tension right where the game begins.
   - Title: Intriguing, episodic-style title.
   - Summary: Hook the audience.
   - Story: Exactly 4 dense, dialogue-heavy, atmosphere-rich text paragraphs describing the starting scene.
   - Cliffhanger: An intense, suspenseful closing sentence demanding immediate action.
   - Choices: Exactly 3 highly divergent choice pathways. One must appeal to charisma, one to intelligence/strategy, one to mystery/stealth. Include their target reputation and relationship impacts. Make the relationshipImpact object contain keys corresponding EXACTLY to the names of the characters created above (e.g., {"CharacterName": 10}).
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
                  relationshipScore: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  pastInteractions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "name", "role", "relationshipScore", "description", "pastInteractions"]
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
                      statImpact: {
                        type: Type.OBJECT,
                        properties: {
                          charisma: { type: Type.INTEGER },
                          intelligence: { type: Type.INTEGER },
                          mystery: { type: Type.INTEGER },
                          popularity: { type: Type.INTEGER },
                          influence: { type: Type.INTEGER }
                        }
                      },
                      relationshipImpact: {
                        type: Type.OBJECT
                      }
                    },
                    required: ["id", "text", "consequenceShort", "statImpact", "relationshipImpact"]
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
    res.json(data);
  } catch (error: any) {
    console.warn("API Call failed during Onboarding - Falling back to local simulation:", error);
    const simulatedData = SimulationEngine.onboard(req.body);
    res.json(simulatedData);
  }
});

/**
 * Story Choice progression endpoint: Reacts to past decision & builds next episodic chapter using long-term memory
 */
app.post("/api/choice", async (req, res) => {
  try {
    const {
      profile,
      reputation,
      characters,
      episodesHistory, // Array of pre-played episodes
      currentEpisode,
      selectedChoice,
      activeUniverse
    } = req.body;

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
      .map((char: any) => `Character: ${char.name} (Role: ${char.role}, Bond: ${char.relationshipScore}). Bio: ${char.description}. Key Memory: ${(char.pastInteractions || []).join("; ")}`)
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
1. Generate "consequentialStoryReaction": Standard 2 paragraphs detailing what happens IMMEDIATELY because of this choice. Make it visceral, highlighting dialogue, and the immediate tense aftermath.
2. Generate "characterImpactSummary": A 1-sentence thought or vocal reaction from one of the active characters witnessing or hearing of this.
3. Compute relationship score adjustments in "relationshipChanges" (an array with fields: characterName, scoreDelta, and memoryGained). For any character involved in the episode or affected by this choice, adjust their relationship score by a delta (between -15 and +15). Store a clean "memoryGained" sentence summarizing this interaction for long-term recall.
4. Set relative reputation adjustments in "reputationChanges" for charisma, intelligence, mystery, popularity, or influence based on what the user's selected choice stats were.
5. Create "nextEpisode": The next dramatic episode (Day/Episode ${(episodesHistory || []).length + 2}). It must pick up directly from the aftermath, weave in long-term characters, introduce more dramatic tension (threats, discovery, trust games), and end on a fresh cliffhanger with exactly 3 new choices.

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
                  memoryGained: { type: Type.STRING }
                },
                required: ["characterName", "scoreDelta", "memoryGained"]
              }
            },
            reputationChanges: {
              type: Type.OBJECT,
              properties: {
                charisma: { type: Type.INTEGER },
                intelligence: { type: Type.INTEGER },
                mystery: { type: Type.INTEGER },
                popularity: { type: Type.INTEGER },
                influence: { type: Type.INTEGER }
              }
            },
            nextEpisode: {
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
                      statImpact: {
                        type: Type.OBJECT,
                        properties: {
                          charisma: { type: Type.INTEGER },
                          intelligence: { type: Type.INTEGER },
                          mystery: { type: Type.INTEGER },
                          popularity: { type: Type.INTEGER },
                          influence: { type: Type.INTEGER }
                        }
                      },
                      relationshipImpact: {
                        type: Type.OBJECT
                      }
                    },
                    required: ["id", "text", "consequenceShort", "statImpact"]
                  }
                }
              },
              required: ["title", "summary", "story", "cliffhanger", "choices"]
            }
          },
          required: ["consequentialStoryReaction", "characterImpactSummary", "relationshipChanges", "reputationChanges", "nextEpisode"]
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
 * Premium Voice Narration endpoint: Speakes out story text or cliffhangers using gemini-3.1-flash-tts-preview
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
