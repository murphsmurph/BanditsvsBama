/* ============================================================
   CANONICAL ROSTER DATA — single source of truth.
   Feeds the call sheet, team sheet, Learn the Roster, quizzes and
   Broadcast Mode. Renderers derive everything from here.

   Sources, in order of precedence when they disagree:
     1. Team spreadsheet "UAWH Roster Info For Bandits.xlsx" / official
        call sheet: number, position, class, hometown, height, phonetics,
        current role, current team.
     2. alabamawomenshockey.com bios.
     3. Elite Prospects snapshot supplied by the broadcaster: Alabama
        season stats, DOB / shoots / catches / height where the official
        sources have none, prior-team names, program record book.
     4. Missing stays null.

   Phonetics: sayLast = surname, sayFirst = first name, both straight
   from the spreadsheet's Last/First Phonetic columns; names that read
   as spelled stay null.

   alabamaStats.seasons holds ONLY Alabama seasons (2024-25 AAU (W),
   2025-26 ACDC (W)). Career totals are never typed in; helpers in
   app.js sum the season rows. Prior clubs are identification only —
   their numbers never enter Alabama totals.

   dataQuality is an array: {field, keep, alternate, alternateSource,
   note, print}. print:true = shows on page 2 GAME-DAY VERIFY.
   Learn the Roster shows every entry.

   Nothing here is invented. Missing = null.
   ============================================================ */
const EP = "Elite Prospects snapshot supplied by broadcaster";

const ROSTER = [
{ number:2, firstName:"Ella Rae", lastName:"Escoffier", position:"D", role:"Defense", classYear:"Fr",
  height:null, weight:null, hometown:"Herculaneum, MO", shoots:null, previousTeam:"St. Louis Lady Cyclones 19U", dob:null,
  yearsPlaying:10, sayLast:"es-co-fee-ay", sayFirst:null, photo:null,
  academics:{major:"News Media", careerGoal:null},
  alabamaStats:null,
  notes:[
    {text:"10 years of hockey · St. Louis Lady Cyclones 19U AA last season", category:"hockey-history", priority:1},
    {text:"News Media major", category:"academic", priority:1},
    {text:"One of two Missouri natives on the roster (with Kutz, Imperial)", category:"connection", priority:2}
  ]},

{ number:3, firstName:"Naomi", lastName:"Derksen", position:"D", role:"Defense", classYear:"Gr",
  height:"5'10\"", weight:"220 lbs", hometown:"Conquest, SK", shoots:"R", previousTeam:"Nashville Flyers / Lipscomb University",
  dob:"3/12/1997", yearsPlaying:"20-ish", sayLast:"DERK-suhn", sayFirst:"nay-OH-mee", photo:null,
  academics:{major:"PhD, Condensed Matter Physics", careerGoal:"College professor"},
  leadership:["Team VP of Operations"],
  achievements:["B.S. Physics + Applied Math, summa cum laude (Lipscomb)","Capstone Graduate Fellow","M.S. requirements completed en route, Summer 2025"],
  funFacts:["Loves Lego — favorite set is the Winnie the Pooh Treehouse","Believes socks should have designated left and right feet"],
  bio:["Moved from Saskatchewan to Tennessee at 13","Taught high school math and physics in Tennessee for two years"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:12, g:10, a:1, p:11, pim:2},
    {season:"2025-26", league:"ACDC (W)", gp:11, g:3,  a:3, p:6,  pim:4}
  ]},
  dataQuality:[
    {field:"yearsPlaying", keep:"20-ish", alternate:"16", alternateSource:"site bio", note:"Years playing: team sheet says '20 ish', site bio says 16.", print:true},
    {field:"height", keep:"5'10\"", alternate:"5'11\"", alternateSource:"Elite Prospects", note:"Official height 5'10\"; Elite Prospects lists 5'11\". Using official.", print:false}
  ],
  notes:[
    {text:"TEAM VP OPERATIONS · PhD candidate in condensed matter physics · wants to be a college professor", category:"leadership", priority:1},
    {text:"29-year-old grad student · moved from Saskatchewan to Tennessee at 13 · Nashville Flyers → Lipscomb (Physics + Applied Math, summa cum laude)", category:"hockey-history", priority:2},
    {text:"Taught high-school math and physics in Tennessee for two years before Alabama", category:"bio", priority:2},
    {text:"Lego devotee — Winnie the Pooh Treehouse · insists socks need a left and a right", category:"fun-fact", priority:3}
  ]},

{ number:4, firstName:"Samantha", lastName:"Lantz", position:"D", role:"Defense", classYear:"Jr",
  height:"5'9\"", weight:"165 lbs", hometown:null, shoots:"R", previousTeam:null, dob:"9/14/2005", yearsPlaying:null,
  sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)", gp:15, g:21, a:8, p:29, pim:2}
  ]},
  dataQuality:[
    {field:"position", keep:"D", alternate:"F", alternateSource:"Elite Prospects", note:"Official roster lists D; Elite Prospects lists F. Using official D.", print:true},
    {field:"height", keep:"5'9\"", alternate:null, alternateSource:"Elite Prospects", note:"Height 5'9\" comes from Elite Prospects; no official value on the team sheet.", print:false}
  ],
  notes:[
    {text:"Defender who scores like a forward — 21 goals in a 15-game season · official roster says D, Elite Prospects lists F", category:"achievement", priority:1},
    {text:"Turns 21 on Sep 14 — three days after this game", category:"fun-fact", priority:2},
    {text:"No 2025–26 Alabama stat line in the EP snapshot", category:"data", priority:3}
  ]},

{ number:5, firstName:"Anna", lastName:"Bobruff", position:"D", role:"Defense", classYear:"Sr",
  height:"5'4\"", weight:"141 lbs", hometown:"West Hartford, CT", shoots:"L", previousTeam:null, dob:"8/21/2001",
  yearsPlaying:null, sayLast:"BAHB-ruhf", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:15, g:0, a:4, p:4, pim:2},
    {season:"2025-26", league:"ACDC (W)", gp:11, g:0, a:1, p:1, pim:0}
  ]},
  notes:[
    {text:"Born in Tuscaloosa (per Elite Prospects) · raised in West Hartford, CT", category:"connection", priority:1},
    {text:"Senior D · one of three seniors with Scott and Kutz · 25 years old", category:"hockey-history", priority:2},
    {text:"Two seasons, 26 games, only 2 PIM — a clean stay-at-home defender", category:"hockey-history", priority:2}
  ]},

{ number:6, firstName:"Grace", lastName:"Cabeceiras", position:"F", role:"Winger", classYear:"So",
  height:"5'4\"", weight:null, hometown:"North Attleboro, MA", shoots:"R", previousTeam:"Bridgewater Bandits",
  dob:"6/28/2007", yearsPlaying:11, sayLast:"cab-eh-sere-s", sayFirst:null, photo:null,
  academics:{major:"Public Relations & Advertising", careerGoal:null},
  achievements:["National Honor Society (high school)"],
  funFacts:["Ballet background — can still dance en pointe","Hot take: Dunkin' beats Starbucks"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:8, g:0, a:1, p:1, pim:4}
  ]},
  dataQuality:[
    {field:"position", keep:"F", alternate:"D", alternateSource:"website roster page", note:"Team sheet and bio say forward/winger; the website roster page lists her as Defense. Using forward.", print:true}
  ],
  notes:[
    {text:"Bridgewater Bandits product · 11 years of hockey · faces a Bandits team tonight", category:"hockey-history", priority:1},
    {text:"Ballet-trained — can still dance en pointe", category:"fun-fact", priority:2},
    {text:"PR & Advertising major · high-school National Honor Society", category:"academic", priority:2},
    {text:"Hot take: Dunkin' over Starbucks", category:"hot-take", priority:3}
  ]},

{ number:7, firstName:"Lila Kate", lastName:"Bowler", position:"F", role:"Winger", classYear:"Fr",
  height:null, weight:null, hometown:"Downingtown, PA", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:1, age:18, sayLast:"BOH-ler", sayFirst:"LIE-luh KAYT", photo:null,
  academics:{major:"Psychology & General Business", careerGoal:null},
  alabamaStats:null,
  notes:[
    {text:"FIRST YEAR OF HOCKEY — picked up the game a year ago and is already on a college roster", category:"hockey-history", priority:1},
    {text:"18 years old · Psychology & General Business major", category:"academic", priority:1}
  ]},

{ number:9, firstName:"Freya", lastName:"Seneski", position:"D", role:"Defense", classYear:"Jr",
  height:"5'5\"", weight:"130 lbs", hometown:"Naples, FL", shoots:"L", previousTeam:null, dob:"7/8/2006",
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Finance & Economics", careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:14, g:0, a:5, p:5, pim:6},
    {season:"2025-26", league:"ACDC (W)", gp:11, g:1, a:0, p:1, pim:6}
  ]},
  notes:[
    {text:"Finance & Economics major", category:"academic", priority:1},
    {text:"Two-year regular on the blue line · first career goal came in 2025–26", category:"hockey-history", priority:2},
    {text:"One of two Floridians (with Scott, Tampa) · 20 years old", category:"connection", priority:2}
  ]},

{ number:10, firstName:"Lylah", lastName:"Masiello", position:"F", role:"Center", classYear:"Fr",
  height:null, weight:null, hometown:"Littleton, CO", shoots:null, previousTeam:"Team Colorado 19U AAA", dob:"03/2008",
  yearsPlaying:null, sayLast:"mah-see-EL-oh", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:null,
  notes:[
    {text:"Team Colorado 19U AAA — played at the US 19U Nationals last season", category:"hockey-history", priority:1},
    {text:"Only Colorado native on the roster · born March 2008", category:"connection", priority:2}
  ]},

{ number:11, firstName:"Emily", lastName:"Scott", position:"F", role:"Center", classYear:"Sr",
  height:"5'3\"", weight:"126 lbs", hometown:"Tampa, FL", shoots:"R", previousTeam:"Florida Alliance",
  dob:"9/14/2004", yearsPlaying:12, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Marketing", careerGoal:"Marketing"},
  leadership:["Team Vice President"],
  achievements:["Scored the shootout winner in the 2026 CHS Playoffs vs USC"],
  funFacts:["Scored a between-the-legs breakaway goal in one of the program's first games","Bucket list: score a Michigan in a game"],
  bio:["Foundational member of the program since its first season","Entering her fourth full playing season"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:14, g:9, a:5, p:14, pim:6},
    {season:"2025-26", league:"ACDC (W)", gp:12, g:5, a:4, p:9,  pim:6}
  ]},
  notes:[
    {text:"Scored the 2026 CHS playoff shootout winner vs USC", category:"achievement", priority:1},
    {text:"TEAM VICE PRESIDENT · foundational player — here since the program's first season, now in her 4th", category:"leadership", priority:1},
    {text:"Tampa native — the school Alabama beat 3–2 for the 2025 CHS title and lost to in the 2026 final", category:"connection", priority:2},
    {text:"Once scored a between-the-legs breakaway goal in one of the program's first games", category:"fun-fact", priority:2},
    {text:"Marketing major · 12 years of hockey · Florida Alliance 19U AA · bucket list: score a Michigan", category:"personality", priority:3}
  ]},

{ number:14, firstName:"Claire", lastName:"Carson", position:"F", role:"Center", classYear:"Jr",
  height:"5'6\"", weight:"134 lbs", hometown:"Burlington, ON", shoots:"L", previousTeam:"Ridley College",
  dob:"2/26/2006", yearsPlaying:18, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Kinesiology", careerGoal:"Pediatric physical therapist"},
  leadership:["Team President","Kinesiology Club","UA Miracle Morale Team"],
  achievements:["2024–25 College Hockey South Women's Division MVP","Freshman-year CHS MVP","CHS All-Star Team"],
  funFacts:["Hot take: loud chewing should be a punishable offense"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:15, g:30, a:17, p:47, pim:12},
    {season:"2025-26", league:"ACDC (W)", gp:12, g:12, a:9,  p:21, pim:6}
  ]},
  notes:[
    {text:"2024–25 CHS Women's Division MVP as a freshman · CHS All-Star", category:"achievement", priority:1},
    {text:"TEAM PRESIDENT · 3rd Alabama season", category:"leadership", priority:1},
    {text:"Toronto Aeros U18 AA → two seasons at Ridley College (OWHL U22 AA) before Alabama · 18 years of hockey", category:"hockey-history", priority:2},
    {text:"Kinesiology → pediatric physical therapist · Kinesiology Club · UA Miracle Morale Team", category:"career-goal", priority:2},
    {text:"Hot take: loud chewing should be a punishable offense", category:"hot-take", priority:3}
  ]},

{ number:15, firstName:"Avery", lastName:"LaRose", position:"F", role:"Winger", classYear:"Jr",
  height:"5'6\"", weight:"123 lbs", hometown:"Ellicott City, MD", shoots:"R", previousTeam:"Howard Huskies",
  dob:"4/3/2006", yearsPlaying:5, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Sport Management", careerGoal:"NFL marketing"},
  funFacts:["Uncle was a member of the Carolina Hurricanes during their 2006 Stanley Cup championship season"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:14, g:0, a:3, p:3, pim:2},
    {season:"2025-26", league:"ACDC (W)", gp:11, g:2, a:1, p:3, pim:0}
  ]},
  notes:[
    {text:"FAMILY TIE: uncle was with the Carolina Hurricanes during their 2006 Stanley Cup season", category:"family", priority:1},
    {text:"Late starter — only 5 years of hockey, now in her 3rd Alabama season · first two career goals came in 2025–26", category:"hockey-history", priority:2},
    {text:"Sport Management major → NFL marketing", category:"career-goal", priority:2},
    {text:"One of three Marylanders (Henry, Salvato)", category:"connection", priority:3}
  ]},

{ number:18, firstName:"Caroline", lastName:"Craco", position:"F", role:"Forward", classYear:"So",
  height:"5'7\"", weight:null, hometown:"Fairfield, CT", shoots:"R", previousTeam:null, dob:"3/29/2007",
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:12, g:4, a:5, p:9, pim:20}
  ]},
  dataQuality:[
    {field:"hometown", keep:"Fairfield, CT", alternate:null, alternateSource:"Elite Prospects", note:"Hometown taken from Elite Prospects place of birth (Fairfield, CT); the team sheet has no hometown for her.", print:false}
  ],
  notes:[
    {text:"Freshman year: nearly a point a game, with an edge — watch the penalty column", category:"achievement", priority:1},
    {text:"Turned 19 in March", category:"fun-fact", priority:3}
  ]},

{ number:26, firstName:"Sofia", lastName:"Dy", position:"F", role:"Forward", classYear:"Fr",
  height:null, weight:null, hometown:"Canton, GA", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:8, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:null,
  notes:[
    {text:"8 years of hockey", category:"hockey-history", priority:1},
    {text:"Only Georgia native on the roster — Alabama is 5–0 vs UGA in supplied results", category:"connection", priority:2}
  ]},

{ number:27, firstName:"Katie", lastName:"VanDyne", position:"F", role:"Winger", classYear:"So",
  height:"5'4\"", weight:null, hometown:"Columbus, OH", shoots:"R", previousTeam:"Columbus Academy",
  dob:"10/25/2006", yearsPlaying:null, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Public Health", careerGoal:"Physician Assistant"},
  achievements:["Alpha Lambda Delta","Phi Sigma Theta","Dean's List","CHES Freshman Academic Achievement Award"],
  funFacts:["Favorite artist: John Summit"],
  bio:["Playing hockey since age seven"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:10, g:1, a:2, p:3, pim:4}
  ]},
  dataQuality:[
    {field:"height", keep:"5'4\"", alternate:"5'3\"", alternateSource:"Elite Prospects", note:"Official height 5'4\"; Elite Prospects lists 5'3\". Using official.", print:false}
  ],
  notes:[
    {text:"Playing since age 7", category:"hockey-history", priority:1},
    {text:"Public Health → Physician Assistant · CHES Freshman Academic Achievement Award", category:"career-goal", priority:1},
    {text:"Dean's List · Alpha Lambda Delta · Phi Sigma Theta", category:"achievement", priority:2},
    {text:"Favorite artist: John Summit", category:"fun-fact", priority:3}
  ]},

{ number:28, firstName:"Kerrigan", lastName:"Henry", position:"F", role:"Center", classYear:"So",
  height:"5'3\"", weight:null, hometown:"Bowie, MD", shoots:"R", previousTeam:"Montgomery Ice Devils",
  dob:"6/28/2007", yearsPlaying:6, sayLast:null, sayFirst:"KERR-uh-gan", photo:null,
  academics:{major:"Nursing", careerGoal:null},
  achievements:["Phi Eta Sigma Honor Society","Alpha Lambda Delta Honor Society","Fall Dean's List","Spring President's List — all A+ grades"],
  funFacts:["Hidden talent: back handsprings","Favorite artist: Ella Langley"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:12, g:1, a:1, p:2, pim:2}
  ]},
  notes:[
    {text:"PRESIDENT'S LIST — straight A+ semester · Nursing major", category:"achievement", priority:1},
    {text:"6 years of hockey · AGHF 19U with the Montgomery Ice Devils before Alabama", category:"hockey-history", priority:2},
    {text:"Phi Eta Sigma + Alpha Lambda Delta honor societies · Dean's List", category:"achievement", priority:2},
    {text:"Hidden talent: back handsprings · Ella Langley fan", category:"fun-fact", priority:3}
  ]},

{ number:30, firstName:"Alex", lastName:"Hajjar", position:"G", role:"Goalie", classYear:"Fr",
  height:null, weight:null, hometown:"Weymouth, MA", shoots:null, catches:null, previousTeam:null, dob:null,
  yearsPlaying:12, sayLast:"HA-jar", sayFirst:null, photo:null,
  academics:{major:"Kinesiology", careerGoal:null},
  alabamaStats:null,
  notes:[
    {text:"Freshman goaltender · 12 years in the game", category:"hockey-history", priority:1},
    {text:"Kinesiology major", category:"academic", priority:1},
    {text:"Shares the crease with senior Natalie Kutz — verify tonight's starter", category:"hockey-history", priority:2}
  ]},

{ number:31, firstName:"Layla", lastName:"Salvato", position:"D", role:"Defense", classYear:"So",
  height:"5'2\"", weight:null, hometown:"Baltimore, MD", shoots:null, previousTeam:"Tri-City Eagles 19U Blue", dob:"4/19/2007",
  yearsPlaying:null, sayLast:"sahl-VAH-toh", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:5, g:0, a:1, p:1, pim:0}
  ]},
  notes:[
    {text:"5 games as a freshman · first collegiate point (an assist) in 2025–26", category:"hockey-history", priority:1},
    {text:"Tri-City Eagles 19U Blue (AGHF) before Alabama · 19 years old", category:"hockey-history", priority:2}
  ]},

{ number:41, firstName:"Anna", lastName:"Zahorchak", position:"F", role:"Center", classYear:"Jr",
  height:"5'8\"", weight:"172 lbs", hometown:"Pittsburgh, PA", shoots:"R", previousTeam:"Steel City Selects",
  dob:"4/11/2006", yearsPlaying:15, sayLast:"za-HOR-chak", sayFirst:null, photo:null,
  academics:{major:"Kinesiology / Pre-Med + STEM to MBA", careerGoal:"Physician"},
  leadership:["VP of Finance & Fundraising","Morgan's Message Student-Athlete Ambassador"],
  achievements:["2025 CHS All-Star Challenge — Hardest Shot","National Merit Finalist","Certified EMT"],
  bio:["Involved with DCH Volunteer Services, UA EMS, the MATCHED Lab, Gamma Phi Beta, Grow the Game UA and UA Miracle"],
  funFacts:["Hot take: Skyline Chili and shredded cheddar over noodles is the greatest meal ever"],
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:15, g:10, a:11, p:21, pim:4},
    {season:"2025-26", league:"ACDC (W)", gp:7,  g:4,  a:4,  p:8,  pim:4}
  ]},
  dataQuality:[
    {field:"height", keep:"5'8\"", alternate:"5'7\"", alternateSource:"Elite Prospects", note:"Official height 5'8\"; Elite Prospects lists 5'7\". Using official.", print:false}
  ],
  notes:[
    {text:"2025 CHS All-Star Challenge HARDEST SHOT winner", category:"achievement", priority:1},
    {text:"Certified EMT · UA EMS · National Merit Finalist · VP of Finance & Fundraising", category:"leadership", priority:2},
    {text:"Pre-Med Kinesiology + STEM-to-MBA → physician · Morgan's Message student-athlete ambassador", category:"career-goal", priority:2},
    {text:"Steel City Selects 16U AA · 15 years of hockey · hot take: Skyline Chili over noodles", category:"hot-take", priority:3}
  ]},

{ number:46, firstName:"Hayden", lastName:"Bradley", position:"D", role:"Defense", classYear:"Fr",
  height:"5'8\"", weight:null, hometown:"Pelham, AL", shoots:"R", previousTeam:"Birmingham Jr. Bulls",
  dob:"3/8/2008", yearsPlaying:7, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Nursing", careerGoal:"Nurse practitioner"},
  funFacts:["Hot take: breakfast is the best meal of the day"],
  alabamaStats:null,
  dataQuality:[
    {field:"hometown", keep:"Pelham, AL", alternate:"Hoover, AL", alternateSource:"site bio", note:"Team sheet says Pelham, AL; site bio says Hoover, AL. Using Pelham.", print:true}
  ],
  notes:[
    {text:"IN-STATE FRESHMAN — from Pelham, home of the team's rink, via the Birmingham Jr. Bulls", category:"local-connection", priority:1},
    {text:"Nursing → nurse practitioner", category:"career-goal", priority:1},
    {text:"18 years old · 7 years of hockey", category:"hockey-history", priority:2},
    {text:"Hot take: breakfast is the best meal of the day", category:"hot-take", priority:3}
  ]},

{ number:84, firstName:"Natalie", lastName:"Kutz", position:"G", role:"Goalie", classYear:"Sr",
  height:"5'2\"", weight:"146 lbs", hometown:"Imperial, MO", shoots:null, catches:"L", previousTeam:"Maryville Univ.", dob:"1/23/2003",
  yearsPlaying:8, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Nursing", careerGoal:null},
  alabamaStats:{source:EP, type:"goalie", seasons:[
    {season:"2024-25", league:"AAU (W)",  gp:9,  gaa:2.67, svPct:0.672, ga:22, saves:45,   so:1, w:7, l:2, t:0, minutes:495},
    {season:"2025-26", league:"ACDC (W)", gp:12, gaa:3.90, svPct:0.699, ga:47, saves:null, so:2, w:7, l:5, t:0, minutes:723}
  ]},
  dataQuality:[
    {field:"height", keep:"5'2\"", alternate:null, alternateSource:"Elite Prospects", note:"Height 5'2\" comes from Elite Prospects; no official value on the team sheet.", print:false}
  ],
  notes:[
    {text:"Goalie of record for 9 of the 15 games in the 2025 CHS championship season", category:"achievement", priority:1},
    {text:"Transferred in from Maryville Univ. (ACHA D2) · Nursing major · 8 years of hockey", category:"hockey-history", priority:2},
    {text:"23 years old · one of three seniors with Scott and Bobruff", category:"connection", priority:3}
  ]},

{ number:93, firstName:"Allie", lastName:"Roth", position:"D", role:"Defense", classYear:"Jr",
  height:null, weight:null, hometown:"Nolensville, TN", shoots:"L", previousTeam:"Miami Univ. (Ohio)", dob:null,
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  alabamaStats:{source:EP, type:"skater", seasons:[
    {season:"2025-26", league:"ACDC (W)", gp:10, g:7, a:5, p:12, pim:2}
  ]},
  notes:[
    {text:"Transfer from Miami (Ohio) ACHA D2 · 7 goals in her first 10 Alabama games — from the blue line", category:"achievement", priority:1},
    {text:"Nolensville, TN — Nashville-area native", category:"connection", priority:3}
  ]}
];

const TEAM = {
  name:"Alabama Women's Hockey",
  league:"ACHA W2 · moved up from ACDC for 2026–27",
  conference:"College Hockey South (CHS)",
  homeRink:"Pelham Civic Complex",
  practice:"Wednesday nights in Birmingham, about an hour from campus",
  history:[
    "Reached the CHS championship game in each of the program's first two seasons",
    "2024–25 CHS CHAMPION · advanced to the AAU National Championship",
    "2025–26 CHS RUNNER-UP / FINALIST",
    "Moved from ACDC to ACHA W2 for 2026–27"
  ],
  staff:[
    {role:"Head Coach", name:"Jeffery Edmiston", from:"Huntsville, AL", note:"first year as head coach", bio:null},
    {role:"Assistant Coach", name:"Anya Laxton", from:"Long Island, NY", note:null, bio:"Played prep hockey at Kents Hill School (ME), then NCAA DIII at Becker College (1 yr) and Worcester State (3 yrs)"},
    {role:"Head of Staff", name:"Quinn Brinkworth", from:"Buffalo, NY", note:null, bio:null}
  ],

  /* TONIGHT'S GAME — a fundraiser exhibition, not a counting game.
     Stored separately from seasons so a final score can never leak
     into season records, CHS history or head-to-head numbers.
     Source: alabamawomenshockey.com schedule + broadcaster.            */
  game:{
    label:"SPECIAL FUNDRAISER EXHIBITION",
    opponent:"HSV Bandits",
    opponentNote:"men's beer-league team",
    date:"FRI SEP 11, 2026",
    isoDate:"2026-09-11",
    time:"8:45 PM CT",
    home:true,
    counts:false,
    purpose:"Played for fun and to help raise money for the Alabama women's hockey program.",
    countsNote:"Does not count toward Alabama's ACHA W2 / CHS competitive record."
  },
  /* The site has a "Support Alabama Women's Hockey" page. No donation
     link, method or proceeds structure was supplied — none is shown.  */
  support:{
    heading:"Support Alabama Women's Hockey",
    gamePurpose:"The Bandits exhibition is being played to help raise money for and support the Alabama women's hockey program."
  },
  /* Lineup for tonight, from Coach Edmiston's handwritten lineup sheet
     (9/11/26, opponent Bandits). Sweater numbers throughout. The sheet
     lists forward trios and D pairs WITHOUT LW/C/RW or LD/RD labels, so
     the order is kept exactly as written and columns are unlabeled.
     null = empty box on the sheet. Sheet spellings (Massy, Excoffier,
     Larose, Vandyne) are mapped to the roster's official spellings.   */
  lines:{
    source:"Coach Jeffery Edmiston's lineup sheet, 9/11/26 vs Bandits",
    columnsLabeled:false,
    forwards:[[14,41,11],[26,10,18],[27,28,15],[null,null,7]],
    defense:[[9,46],[3,2],[4,31]],
    extraDefense:[93],
    goalies:[30,null],
    pp:[[14,41,93,11,3],[26,10,4,9,31]],
    pk:[[27,15,2,46],[28,18,9,93]],
    scratched:[],
    notListed:[5,6,84],
    notListedNote:"appear nowhere on the coach's sheet, not in Scratched either — verify at the rink"
  },

  /* Alabama-only career legend, printed on page 2 */
  careerLegend:"PLAYER CAREER LINE = Alabama AAU (2024–25) + ACDC (2025–26) only.",

  /* Program record book — Elite Prospects snapshot. Never inferred from
     the active roster. gamesPlayed: EP enumerated 1/2/3 despite equal
     27 GP; stored as ties (rank 1,1,1) — say "tied at 27 GP" on air.    */
  recordBook:{
    source:EP,
    points:[
      {rank:1,name:"Claire Carson",gp:27,g:42,a:26,p:68},
      {rank:2,name:"Morgan Grzybowski",gp:27,g:16,a:15,p:31},
      {rank:3,name:"Samantha Lantz",gp:15,g:21,a:8,p:29},
      {rank:4,name:"Anna Zahorchak",gp:22,g:14,a:15,p:29},
      {rank:5,name:"Emily Scott",gp:26,g:14,a:9,p:23}
    ],
    goals:[
      {rank:1,name:"Claire Carson",gp:27,g:42,a:26,p:68},
      {rank:2,name:"Samantha Lantz",gp:15,g:21,a:8,p:29},
      {rank:3,name:"Morgan Grzybowski",gp:27,g:16,a:15,p:31},
      {rank:4,name:"Anna Zahorchak",gp:22,g:14,a:15,p:29},
      {rank:5,name:"Emily Scott",gp:26,g:14,a:9,p:23}
    ],
    ppg:[
      {rank:1,name:"Claire Carson",gp:27,g:42,p:68,ppg:2.52},
      {rank:2,name:"Samantha Lantz",gp:15,g:21,p:29,ppg:1.93},
      {rank:3,name:"Sienna Moe",gp:12,g:10,p:19,ppg:1.58},
      {rank:4,name:"Anna Zahorchak",gp:22,g:14,p:29,ppg:1.32},
      {rank:5,name:"Katherine Sabre",gp:14,g:7,p:17,ppg:1.21}
    ],
    pim:[
      {rank:1,name:"Melina Bandouveres",gp:12,g:3,p:9,pim:22},
      {rank:2,name:"Caroline Craco",gp:12,g:4,p:9,pim:20},
      {rank:3,name:"Claire Carson",gp:27,g:42,p:68,pim:18},
      {rank:4,name:"Rory Clark",gp:15,g:2,p:8,pim:16},
      {rank:5,name:"Teegan Mathey",gp:26,g:3,p:9,pim:14}
    ],
    gamesPlayed:[
      {rank:1,name:"Claire Carson",gp:27},
      {rank:1,name:"Morgan Grzybowski",gp:27},
      {rank:1,name:"Colleen Sheely",gp:27},
      {rank:4,name:"Emily Scott",gp:26},
      {rank:4,name:"Teegan Mathey",gp:26}
    ]
  },

  /* Results as supplied by the broadcaster. Team summaries (W-L, GF, GA)
     are derived from the game rows by seasonSummary() in app.js — never
     typed in. counts:false rows (practice games) are excluded.
     complete:false seasons are never presented as a season record.
     Opponent names are spelled out — the broadcaster's shorthand "UT"
     meant Tampa in 2024-25 and the 2025-26 final, and Tennessee for the
     two 2025-26 7-0 / 14-3 wins, so "UT" is never stored.
     chs: how the CHS postseason ended, per site history + results.     */
  seasons:[
    { season:"2023-24", complete:false, chs:null, note:"Supplied result set is partial.",
      games:[
        {when:"Jan 2024", opp:"Auburn", result:"W", gf:18, ga:1,  type:"reg", counts:true},
        {when:"Jan 2024", opp:"Auburn", result:"W", gf:20, ga:0,  type:"reg", counts:true, note:"Site lists Auburn; the game page URL says Georgia. Kept as Auburn per broadcaster."},
        {when:"Mar 2024", opp:"Auburn", result:"W", gf:8,  ga:0,  type:"reg", counts:true},
        {when:"Mar 2024", opp:"UGA",    result:"W", gf:9,  ga:2,  type:"reg", counts:true}
      ]},
    { season:"2024-25", complete:true, chs:"champion", note:null,
      games:[
        {when:"Sep 2024", opp:"UGA",            result:"W", gf:15, ga:2, type:"reg", counts:true},
        {when:"Sep 2024", opp:"UGA",            result:"W", gf:12, ga:4, type:"reg", counts:true},
        {when:"Sep 2024", opp:"High Point",     result:"W", gf:6,  ga:5, type:"reg", counts:true},
        {when:"Sep 2024", opp:"High Point",     result:"W", gf:2,  ga:1, type:"reg", counts:true},
        {when:"Oct 2024", opp:"South Carolina", result:"L", gf:4,  ga:6, type:"reg", counts:true},
        {when:"Oct 2024", opp:"South Carolina", result:"W", gf:9,  ga:4, type:"reg", counts:true},
        {when:"Oct 2024", opp:"Auburn",         result:"W", gf:7,  ga:1, type:"reg", counts:true},
        {when:"Oct 2024", opp:"Auburn",         result:"W", gf:8,  ga:0, type:"reg", counts:true},
        {when:"Nov 2024", opp:"Miami",          result:"W", gf:17, ga:4, type:"reg", counts:true},
        {when:"Nov 2024", opp:"Tampa",          result:"L", gf:2,  ga:4, type:"reg", counts:true},
        {when:"Nov 2024", opp:"USF",            result:"W", gf:5,  ga:1, type:"reg", counts:true},
        {when:"Jan 2025", opp:"South Carolina", result:"W", gf:6,  ga:2, type:"reg", counts:true},
        {when:"Jan 2025", opp:"South Carolina", result:"W", gf:2,  ga:1, type:"reg", counts:true},
        {when:"Jan 2025", opp:"Yellowhammer Hockey Club", result:"L", gf:8, ga:10, type:"practice", counts:false, note:"Practice game — excluded from competitive summary."},
        {when:"Jan 2025", opp:"USF",            result:"W", gf:11, ga:6, type:"reg", counts:true},
        {when:"Jan 2025", opp:"Tampa",          result:"W", gf:3,  ga:2, type:"playoff", counts:true, note:"CHS championship game"}
      ]},
    { season:"2025-26", complete:false, chs:"finalist", note:"Team-wise result set explicitly marked incomplete by broadcaster; Kennesaw State games cancelled.",
      games:[
        {when:"Oct 2025", opp:"UGA",      result:"W", gf:6,  ga:3, type:"reg", counts:true},
        {when:"Oct 2025", opp:"UGA",      result:"W", gf:6,  ga:1, type:"reg", counts:true},
        {when:null, opp:"Tennessee",      result:"W", gf:7,  ga:0, type:"reg", counts:true},
        {when:null, opp:"Tennessee",      result:"W", gf:14, ga:3, type:"reg", counts:true},
        {when:null, opp:"Kennesaw State", result:null, gf:null, ga:null, type:"cancelled", counts:false, note:"Cancelled."},
        {when:null, opp:"Auburn",         result:"W", gf:6,  ga:2, type:"reg", counts:true},
        {when:null, opp:"Auburn",         result:"W", gf:5,  ga:2, type:"reg", counts:true},
        {when:null, opp:"Clemson",        result:"L", gf:4,  ga:9, type:"reg", counts:true},
        {when:null, opp:"South Carolina", result:"W", gf:8,  ga:7, type:"reg", counts:true},
        {when:null, opp:"High Point",     result:"L", gf:3,  ga:4, type:"reg", counts:true},
        {when:null, opp:"High Point",     result:"L", gf:4,  ga:9, type:"reg", counts:true},
        {when:null, opp:"Auburn",         result:"W", gf:7,  ga:2, type:"playoff", counts:true, note:"CHS playoff"},
        {when:null, opp:"South Carolina", result:"W", gf:2,  ga:1, type:"playoff", counts:true, note:"CHS playoff"},
        {when:null, opp:"Tampa",          result:"L", gf:0,  ga:4, type:"playoff", counts:true, note:"CHS final"}
      ]}
  ],

  standings2526:{
    source:EP,
    label:"2025-26 ACDC (W)",
    position:1,
    gp:13,
    points:16,
    note:"Pasted standings column headers were incomplete; do not invent labels for the ambiguous middle columns."
  }
};

/* ============================================================
   OPPONENT — HSV Bandits (men's beer-league team), tonight only.
   Source: Bandits lines-app screenshots supplied by the broadcaster.
   No sweater numbers and no stats were supplied, so none are shown.
   Names per the app and the broadcaster: "El Presidente" is Marc
   Hodges, Bandits team president; "Greg" is Greg Mayer; "Joey" is
   listed as Awesome Joey at the broadcaster's request. Player notes
   show in Broadcast Mode only. Kept separate from ROSTER so nothing
   about the Bandits can leak into Alabama views.
   ============================================================ */
const OPPONENT = {
  name:"HSV Bandits", shortName:"Bandits", note:"men's beer-league team",
  source:"Bandits lines app screenshots supplied by broadcaster",
  roster:[
    {id:"harber",   firstName:"Nate",     lastName:"Harber",   position:"F", number:null, note:null},
    {id:"joey",     firstName:"Awesome Joey", lastName:null,   position:"F", number:null, note:null},
    {id:"pelle",    firstName:"Ren",      lastName:"Pelle",    position:"F", number:null, note:null},
    {id:"ratzlaff", firstName:"Carson",   lastName:"Ratzlaff", position:"F", number:null, note:null},
    {id:"presley",  firstName:"Taylor",   lastName:"Presley",  position:"F", number:null, note:null},
    {id:"carini",   firstName:"Steven",   lastName:"Carini",   position:"F", number:null, note:null},
    {id:"orear",    firstName:"Kyle",     lastName:"O'Rear",   position:"F", number:null, note:"marked ? (unconfirmed) in the lines app"},
    {id:"newman",   firstName:"Garrett",  lastName:"Newman",   position:"F", number:null, note:null},
    {id:"freeman",  firstName:"Tucker",   lastName:"Freeman",  position:"F", number:null, note:null},
    {id:"bowden",   firstName:"Pete",     lastName:"Bowden",   position:"F", number:null, note:null},
    {id:"hunziker", firstName:"Dennis",   lastName:"Hunziker", position:"D", number:null, note:null},
    {id:"barrueta", firstName:"Edgar",    lastName:"Barrueta", position:"D", number:null, note:null},
    {id:"hodges",   firstName:"Marc",     lastName:"Hodges",   position:"D", number:null, note:"Bandits team president"},
    {id:"kissel",   firstName:"Brian",    lastName:"Kissel",   position:"D", number:null, note:null},
    {id:"greg",     firstName:"Greg",     lastName:"Mayer",    position:"D", number:null, note:null},
    {id:"roy",      firstName:"Bradley",  lastName:"Roy",      position:"D", number:null, note:null},
    {id:"ashley",   firstName:"Jonathan", lastName:"Ashley",   position:"G", number:null, note:null}
  ],
  /* ids above; null = slot empty in the app */
  lines:{
    forwards:[["harber","joey","pelle"],["ratzlaff","presley","carini"],["orear","newman","freeman"],[null,"bowden",null]],
    defense:[["hunziker","barrueta"],["hodges","kissel"],["greg","roy"]],
    goalies:["ashley", null]
  }
};
