/* ============================================================
   CANONICAL ROSTER DATA — single source of truth.
   Feeds the call sheet, Learn the Roster, quizzes and Broadcast Mode.
   Sources: alabamawomenshockey.com roster + bios, team
   spreadsheet "UAWH Roster Info For Bandits.xlsx"
   (numbers/class/hometown/years/major/phonetics).
   Phonetics: sayLast = surname, sayFirst = first name. Both come
   straight from the spreadsheet's Last/First Phonetic columns;
   names that read as spelled stay null.
   Nothing here is invented. Missing = null.
   ============================================================ */
const ROSTER = [
{ number:2, firstName:"Ella Rae", lastName:"Escoffier", position:"D", role:"Defense", classYear:"Fr",
  height:null, hometown:"Herculaneum, MO", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:10, sayLast:"es-co-fee-ay", sayFirst:null, photo:null,
  academics:{major:"News Media", careerGoal:null},
  notes:[
    {text:"10 years playing hockey", category:"hockey-history", priority:1},
    {text:"News Media major", category:"academic", priority:1}
  ]},

{ number:3, firstName:"Naomi", lastName:"Derksen", position:"D", role:"Defense", classYear:"Gr",
  height:"5'10\"", hometown:"Conquest, SK", shoots:"R", previousTeam:"Nashville Flyers / Lipscomb University",
  dob:"3/12/1997", yearsPlaying:"20-ish", sayLast:"DERK-suhn", sayFirst:"nay-OH-mee", photo:null,
  academics:{major:"PhD, Condensed Matter Physics", careerGoal:"College professor"},
  leadership:["Team VP of Operations"],
  achievements:["B.S. Physics + Applied Math, summa cum laude (Lipscomb)","Capstone Graduate Fellow","M.S. requirements completed en route, Summer 2025"],
  funFacts:["Loves Lego — favorite set is the Winnie the Pooh Treehouse","Believes socks should have designated left and right feet"],
  bio:["Moved from Saskatchewan to Tennessee at 13","Taught high school math and physics in Tennessee for two years"],
  dataQuality:{note:"Years playing: team sheet says '20 ish', site bio says 16."},
  notes:[
    {text:"Grad D · 4th Alabama season · TEAM VP OPERATIONS", category:"leadership", priority:1},
    {text:"PhD candidate, condensed matter physics", category:"academic", priority:1},
    {text:"Physics + Applied Math, summa cum laude · ex-HS physics teacher", category:"academic", priority:2},
    {text:"Lego devotee — Winnie the Pooh Treehouse", category:"fun-fact", priority:3}
  ]},

{ number:4, firstName:"Samantha", lastName:"Lantz", position:"D", role:"Defense", classYear:"Jr",
  height:null, hometown:null, shoots:null, previousTeam:null, dob:null, yearsPlaying:null,
  sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]},

{ number:5, firstName:"Anna", lastName:"Bobruff", position:"D", role:"Defense", classYear:"Sr",
  height:"5'4\"", hometown:"West Hartford, CT", shoots:null, previousTeam:null, dob:"8/21/2001",
  yearsPlaying:null, sayLast:"BAHB-ruhf", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]},

{ number:6, firstName:"Grace", lastName:"Cabeceiras", position:"F", role:"Winger", classYear:"So",
  height:"5'4\"", hometown:"North Attleboro, MA", shoots:"R", previousTeam:"Bridgewater Bandits",
  dob:"6/28/2007", yearsPlaying:11, sayLast:"cab-eh-sere-s", sayFirst:null, photo:null,
  academics:{major:"Public Relations & Advertising", careerGoal:null},
  achievements:["National Honor Society (high school)"],
  funFacts:["Ballet background — can still dance en pointe","Hot take: Dunkin' beats Starbucks"],
  dataQuality:{positionConflict:true, note:"Team sheet and bio say forward/winger; the website roster page lists her as Defense. Using forward."},
  notes:[
    {text:"Bridgewater Bandits · 11 years hockey", category:"nickname", priority:1},
    {text:"Ballet trained — still dances en pointe", category:"fun-fact", priority:1},
    {text:"PR + Advertising major", category:"academic", priority:2},
    {text:"Hot take: Dunkin' over Starbucks", category:"hot-take", priority:3}
  ]},

{ number:7, firstName:"Lila Kate", lastName:"Bowler", position:"F", role:"Winger", classYear:"Fr",
  height:null, hometown:"Downingtown, PA", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:1, age:18, sayLast:"BOH-ler", sayFirst:"LIE-luh KAYT", photo:null,
  academics:{major:"Psychology & General Business", careerGoal:null},
  notes:[
    {text:"FIRST YEAR PLAYING HOCKEY — newest to the game", category:"hockey-history", priority:1},
    {text:"Psychology & General Business major", category:"academic", priority:1}
  ]},

{ number:9, firstName:"Freya", lastName:"Seneski", position:"D", role:"Defense", classYear:"Jr",
  height:"5'5\"", hometown:"Naples, FL", shoots:null, previousTeam:null, dob:"7/8/2006",
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Finance & Economics", careerGoal:null},
  notes:[
    {text:"Finance & Economics major", category:"academic", priority:1}
  ]},

{ number:10, firstName:"Lylah", lastName:"Masiello", position:"F", role:"Center", classYear:"Fr",
  height:null, hometown:"Littleton, CO", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:null, sayLast:"mah-see-EL-oh", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]},

{ number:11, firstName:"Emily", lastName:"Scott", position:"F", role:"Center", classYear:"Sr",
  height:"5'3\"", hometown:"Tampa, FL", shoots:"R", previousTeam:"Florida Alliance",
  dob:"9/14/2004", yearsPlaying:12, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Marketing", careerGoal:"Marketing"},
  achievements:["Scored the shootout winner in the 2026 CHS Playoffs vs USC"],
  funFacts:["Scored a between-the-legs breakaway goal in one of the program's first games","Bucket list: score a Michigan in a game"],
  bio:["Foundational member of the program since its first season","Entering her fourth full playing season"],
  notes:[
    {text:"FOUNDATIONAL PLAYER · 4th full season", category:"hockey-history", priority:1},
    {text:"Scored 2026 CHS playoff shootout winner vs USC", category:"achievement", priority:1},
    {text:"Once scored a between-the-legs breakaway goal", category:"fun-fact", priority:1},
    {text:"Bucket list: score a Michigan", category:"personality", priority:3}
  ]},

{ number:14, firstName:"Claire", lastName:"Carson", position:"F", role:"Center", classYear:"Jr",
  height:"5'6\"", hometown:"Burlington, ON", shoots:"L", previousTeam:"Ridley College",
  dob:"2/26/2006", yearsPlaying:18, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Kinesiology", careerGoal:"Pediatric physical therapist"},
  leadership:["Team President","Kinesiology Club","UA Miracle Morale Team"],
  achievements:["2024–25 College Hockey South Women's Division MVP","Freshman-year CHS MVP","CHS All-Star Team"],
  funFacts:["Hot take: loud chewing should be a punishable offense"],
  notes:[
    {text:"TEAM PRESIDENT · 3rd Alabama season", category:"leadership", priority:1},
    {text:"2024–25 CHS Women's Division MVP · CHS All-Star", category:"achievement", priority:1},
    {text:"Burlington, Ontario · Ridley College · 18 yrs hockey", category:"hockey-history", priority:1},
    {text:"Kinesiology → pediatric physical therapy", category:"career-goal", priority:2}
  ]},

{ number:15, firstName:"Avery", lastName:"LaRose", position:"F", role:"Winger", classYear:"Jr",
  height:"5'6\"", hometown:"Ellicott City, MD", shoots:"R", previousTeam:"Howard Huskies",
  dob:"4/3/2006", yearsPlaying:5, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Sport Management", careerGoal:"NFL marketing"},
  funFacts:["Uncle was a member of the Carolina Hurricanes during their 2006 Stanley Cup championship season"],
  notes:[
    {text:"FAMILY TIE: uncle with Carolina during 2006 Stanley Cup season", category:"family", priority:1},
    {text:"Howard Huskies · 3rd Alabama season", category:"hockey-history", priority:1},
    {text:"Sport Management → NFL marketing", category:"career-goal", priority:2}
  ]},

{ number:18, firstName:"Caroline", lastName:"Craco", position:"F", role:"Forward", classYear:"So",
  height:"5'7\"", hometown:null, shoots:null, previousTeam:null, dob:"3/29/2007",
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]},

{ number:26, firstName:"Sofia", lastName:"Dy", position:"F", role:"Forward", classYear:"Fr",
  height:null, hometown:"Canton, GA", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:8, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[
    {text:"8 years playing hockey", category:"hockey-history", priority:1}
  ]},

{ number:27, firstName:"Katie", lastName:"VanDyne", position:"F", role:"Winger", classYear:"So",
  height:"5'4\"", hometown:"Columbus, OH", shoots:"R", previousTeam:"Columbus Academy",
  dob:"10/25/2006", yearsPlaying:null, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Public Health", careerGoal:"Physician Assistant"},
  achievements:["Alpha Lambda Delta","Phi Sigma Theta","Dean's List","CHES Freshman Academic Achievement Award"],
  funFacts:["Favorite artist: John Summit"],
  bio:["Playing hockey since age seven"],
  notes:[
    {text:"Columbus Academy · playing since age 7", category:"hockey-history", priority:1},
    {text:"Public Health → Physician Assistant", category:"career-goal", priority:1},
    {text:"CHES Freshman Academic Achievement Award", category:"achievement", priority:2},
    {text:"Big John Summit fan", category:"fun-fact", priority:3}
  ]},

{ number:28, firstName:"Kerrigan", lastName:"Henry", position:"F", role:"Center", classYear:"So",
  height:"5'3\"", hometown:"Bowie, MD", shoots:"R", previousTeam:"Montgomery Ice Devils",
  dob:"6/28/2007", yearsPlaying:6, sayLast:null, sayFirst:"KERR-uh-gan", photo:null,
  academics:{major:"Nursing", careerGoal:null},
  achievements:["Phi Eta Sigma Honor Society","Alpha Lambda Delta Honor Society","Fall Dean's List","Spring President's List — all A+ grades"],
  funFacts:["Hidden talent: back handsprings","Favorite artist: Ella Langley"],
  notes:[
    {text:"Montgomery Ice Devils · Nursing major", category:"hockey-history", priority:1},
    {text:"PRESIDENT'S LIST — straight A+ semester", category:"achievement", priority:1},
    {text:"Hidden talent: back handsprings", category:"fun-fact", priority:1},
    {text:"Ella Langley fan", category:"fun-fact", priority:3}
  ]},

{ number:30, firstName:"Alex", lastName:"Hajjar", position:"G", role:"Goalie", classYear:"Fr",
  height:null, hometown:"Weymouth, MA", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:12, sayLast:"HA-jar", sayFirst:null, photo:null,
  academics:{major:"Kinesiology", careerGoal:null},
  notes:[
    {text:"Freshman goaltender · 12 years playing hockey", category:"hockey-history", priority:1},
    {text:"Kinesiology major", category:"academic", priority:1}
  ]},

{ number:31, firstName:"Layla", lastName:"Salvato", position:"D", role:"Defense", classYear:"So",
  height:"5'2\"", hometown:"Baltimore, MD", shoots:null, previousTeam:null, dob:"4/19/2007",
  yearsPlaying:null, sayLast:"sahl-VAH-toh", sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]},

{ number:41, firstName:"Anna", lastName:"Zahorchak", position:"F", role:"Center", classYear:"Jr",
  height:"5'8\"", hometown:"Pittsburgh, PA", shoots:"R", previousTeam:"Steel City Selects",
  dob:"4/11/2006", yearsPlaying:15, sayLast:"za-HOR-chak", sayFirst:null, photo:null,
  academics:{major:"Kinesiology / Pre-Med + STEM to MBA", careerGoal:"Physician"},
  leadership:["VP of Finance & Fundraising","Morgan's Message Student-Athlete Ambassador"],
  achievements:["2025 CHS All-Star Challenge — Hardest Shot","National Merit Finalist","Certified EMT"],
  bio:["Involved with DCH Volunteer Services, UA EMS, the MATCHED Lab, Gamma Phi Beta, Grow the Game UA and UA Miracle"],
  funFacts:["Hot take: Skyline Chili and shredded cheddar over noodles is the greatest meal ever"],
  notes:[
    {text:"2025 CHS All-Star Challenge HARDEST SHOT", category:"achievement", priority:1},
    {text:"EMT · National Merit Finalist · VP Finance & Fundraising", category:"leadership", priority:1},
    {text:"Pre-Med Kinesiology + STEM-to-MBA → physician", category:"career-goal", priority:1},
    {text:"Hot take: Skyline Chili over noodles", category:"hot-take", priority:3}
  ]},

{ number:46, firstName:"Hayden", lastName:"Bradley", position:"D", role:"Defense", classYear:"Fr",
  height:"5'8\"", hometown:"Pelham, AL", shoots:"R", previousTeam:"Birmingham Jr. Bulls",
  dob:"3/8/2008", yearsPlaying:7, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Nursing", careerGoal:"Nurse practitioner"},
  funFacts:["Hot take: breakfast is the best meal of the day"],
  dataQuality:{hometownConflict:true, note:"Team sheet says Pelham, AL; site bio says Hoover, AL. Using Pelham."},
  notes:[
    {text:"IN-STATE FRESHMAN · Pelham, AL · Birmingham Jr. Bulls", category:"local-connection", priority:1},
    {text:"Nursing → nurse practitioner", category:"career-goal", priority:1},
    {text:"7 years hockey · shoots right", category:"hockey-history", priority:2},
    {text:"Hot take: breakfast is the best meal", category:"hot-take", priority:3}
  ]},

{ number:84, firstName:"Natalie", lastName:"Kutz", position:"G", role:"Goalie", classYear:"Sr",
  height:null, hometown:"Imperial, MO", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:8, sayLast:null, sayFirst:null, photo:null,
  academics:{major:"Nursing", careerGoal:null},
  notes:[
    {text:"Senior goaltender · 8 years playing hockey", category:"hockey-history", priority:1},
    {text:"Nursing major", category:"academic", priority:1}
  ]},

{ number:93, firstName:"Allie", lastName:"Roth", position:"D", role:"Defense", classYear:"Jr",
  height:null, hometown:"Nolensville, TN", shoots:null, previousTeam:null, dob:null,
  yearsPlaying:null, sayLast:null, sayFirst:null, photo:null, academics:{major:null, careerGoal:null},
  notes:[]}
];

const TEAM = {
  name:"Alabama Women's Hockey",
  league:"ACHA · moving from ACDC to W2 for 2026–27",
  conference:"College Hockey South (CHS)",
  homeRink:"Pelham Civic Complex",
  practice:"Wednesday nights in Birmingham, about an hour from campus",
  history:["Conference championship appearance in each of the first two seasons","Won the CHS championship and reached the AAU National Championship in 2024–25"],
  staff:[
    {role:"Head Coach", name:"Jeffery Edmiston", from:"Huntsville, AL"},
    {role:"Assistant Coach", name:"Anya Laxton", from:"Long Island, NY"},
    {role:"Head of Staff", name:"Quinn Brinkworth", from:"Buffalo, NY"}
  ],
  /* Line chart for the team sheet (page 2). No lines have been provided
     yet, so this stays null and the grid prints blank to fill in at the
     rink. When the coaches send lines, use sweater numbers:
       lines:{ forwards:[[lw,c,rw],[..],[..],[..]],
               defense:[[ld,rd],[..],[..]],
               goalies:[starter, backup] }                                */
  lines:null
};

